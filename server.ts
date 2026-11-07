import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with generous limit for base64 images
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy initialization of GoogleGenAI
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Clean Base64 helper
function parseBase64Image(dataUriOrBase64: string): { mimeType: string; base64Data: string } {
  if (dataUriOrBase64.includes(";base64,")) {
    const parts = dataUriOrBase64.split(";base64,");
    const mimeType = parts[0].replace("data:", "") || "image/jpeg";
    return { mimeType, base64Data: parts[1] };
  }
  return { mimeType: "image/jpeg", base64Data: dataUriOrBase64 };
}

/**
 * Robust Gemini model invoker with multiple candidate models and exponential backoff
 * to handle temporary 503 (high demand) or service spikes seamlessly.
 */
async function generateContentWithFallback(ai: GoogleGenAI, requestConfig: any): Promise<any> {
  // Try ultra-fast gemini-3.1-flash-lite, gemini-3.7-flash, and gemini-flash-latest
  const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.7-flash", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...requestConfig,
          model,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || err || '');
        const isSpikeOrUnavailable = 
          errStr.includes('503') || 
          errStr.includes('UNAVAILABLE') || 
          errStr.includes('high demand') || 
          errStr.includes('overloaded') ||
          errStr.includes('429');
        
        console.warn(`[Gemini API] Request failed with model ${model} (attempt ${attempt}):`, err?.message || err);

        if (isSpikeOrUnavailable && attempt < 2) {
          // Wait briefly before retrying
          await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
          continue;
        }
        // Move to the next model in the candidate list
        break;
      }
    }
  }

  throw lastError;
}

/**
 * Format errors into human-readable Arabic messages for the UI
 */
function formatArabicErrorMessage(error: any, fallbackMessage: string): string {
  const msg = String(error?.message || error || "");
  if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("overloaded")) {
    return "خدمة الذكاء الاصطناعي تشهد ضغطاً مؤقتاً في الطلبات، يرجى المحاولة مرة أخرى بعد لحظات أو تعبئة الحقول يدوياً.";
  }
  if (msg.includes("API_KEY") || msg.includes("apiKey") || msg.includes("403") || msg.includes("unauthorized")) {
    return "مفتاح الربط بالذكاء الاصطناعي غير متوفر أو غير صالح، يمكنك إدخال البيانات يدوياً.";
  }
  if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
    return "تم الوصول للحد المؤقت لطلبات الذكاء الاصطناعي، يرجى الانتظار قليلاً ثم المحاولة ثانية.";
  }
  return fallbackMessage;
}

// ============================================================================
// 1. Extract Owner Data from ID Card / Passport
// ============================================================================
app.post("/api/extract/owner-id", async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "الصورة مطلوبة لإجراء الاستخراج بالذكاء الاصطناعي." });
    }

    const ai = getGenAI();
    const { mimeType, base64Data } = parseBase64Image(image);

    const prompt = `أنت خبير فحص وثائق حكومية وبطاقات هوية وجوازات سفر رسمية.
قم باستخراج البيانات التالية بدقة بالغة من صورة البطاقة الوطنية أو بطاقة الهوية أو الجواز المعروض:
1. الاسم الرباعي واللقب (ownerFullName)
2. الرقم الوطني أو رقم الهوية / رقم السجل (ownerNationalId)
3. محل الإقامة أو العنوان أو المحافظة إن وجد (ownerAddress)
4. رقم الهاتف إن وجد (ownerPhone)
5. صفة المالك: 'individual' (فرد) أو 'company' (شركة) أو 'government' (حكومي)

إذا لم يتوفر حقل معين في الوثيقة اتركه نصاً فارغاً "".`;

    const response = await generateContentWithFallback(ai, {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ownerFullName: { type: Type.STRING, description: "الاسم الرباعي واللقب" },
            ownerNationalId: { type: Type.STRING, description: "الرقم الوطني أو رقم الهوية" },
            ownerAddress: { type: Type.STRING, description: "محل السكن والإقامة أو المحافظة" },
            ownerPhone: { type: Type.STRING, description: "رقم الهاتف إن وجد" },
            ownerType: { 
              type: Type.STRING, 
              enum: ["individual", "company", "government"],
              description: "صفة المالك" 
            },
            notes: { type: Type.STRING, description: "ملاحظات إضافية مستخرجة" },
          },
          required: ["ownerFullName", "ownerNationalId"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error in /api/extract/owner-id:", error);
    return res.status(500).json({
      error: formatArabicErrorMessage(error, "فشل استخراج بيانات بطاقة الهوية. يرجى المحاولة مرة أخرى أو الإدخال اليدوي."),
    });
  }
});

// ============================================================================
// 2. Extract Vehicle Data from Customs Declaration / Seneweya / Certificate
// ============================================================================
app.post("/api/extract/customs-declaration", async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "صورة البيان الجمركي أو وثيقة المركبة مطلوبة." });
    }

    const ai = getGenAI();
    const { mimeType, base64Data } = parseBase64Image(image);

    const prompt = `أنت خبير تدقيق أوراق تسجيل المركبات والبيانات الجمركية الرسمية في الجمهورية اليمنية (البيان الجمركي / شهادة الإفراج الجمركي / جمارك تعز وعدن وصنعاء وشحن والوديعة / شهادة المنشأ / سنوية المركبة).
استخرج البيانات التالية بدقة بالغة من صورة البيان الجمركي:

1. رقم البيان الجمركي (customsDeclarationNumber): مثل C2006 أو 948271-TZ أو 07-2024-88421 أو أي رقم بيان جمركي مدون بالوثيقة.
2. تاريخ البيان الجمركي (customsDeclarationDate): تاريخ صدور البيان الجمركي بصيغة YYYY/MM/DD أو كما هو مدون في الوثيقة (مثلاً 2024/05/12 أو 1445/11/04).
3. جهة أو منفذ إصدار البيان الجمركي (customsIssuingOffice): 
   اقرأ بدقة اسم الجمرك أو المنفذ المطبوع في أعلى وثيقة البيان (الترويسة) أو في الأختام الرسمية أو خانة (الدائرة / المنفذ الجمركي).
   ⚠️ تنبيه شديد الصرامة والأهمية:
   - إذا كان المكتوب في الورقة أو الختم هو "الوديعة" أو "منفذ الوديعة" أو "جمرك الوديعة" اكتب بالضبط: "جمرك منفذ الوديعة". لا تكتب تعز أبداً!
   - إذا كان مكتوباً "شحن" اكتب: "جمرك منفذ شحن".
   - إذا كان مكتوباً "صرفيت" اكتب: "جمرك منفذ صرفيت".
   - إذا كان مكتوباً "ميناء عدن" أو "المنطقة الحرة" اكتب: "جمرك ميناء عدن (المنطقة الحرة)".
   - إذا كان مكتوباً "ميناء المكلا" اكتب: "جمرك ميناء المكلا".
   - إذا كان مكتوباً "تعز" اكتب: "جمرك تعز".
   - ⚠️ لا تفترض أو تخمن أبداً "جمرك تعز" إذا كانت الوثيقة تخص منفذ الوديعة أو أي منفذ آخر! اكتب المنفذ الفعلي المطبوع فقط.
4. الشركة الصانعة / الماركة (make): مثل تويوتا (Toyota)، هيونداي (Hyundai)، دايهاتسو (Daihatsu)، كيا (Kia)، فورد، نيسان، سوزوكي، مرسيدس...
5. نوع المركبة / الموديل التجاري (model): حدد اسم وموديل المركبة بدقة بالغة واكتبه بالعربية مباشرة، وخاصة الطرازات والأنواع الشائعة في اليمن:
   - توسان (Tucson)
   - برادو (Prado / Land Cruiser Prado)
   - تريوس (Terios)
   - شاص (Land Cruiser 70 / Shas / بيك اب لاند كروزر)
   - هيلوكس (Hilux)
   - سنتافي (Santa Fe)
   - باص H1 (Hyundai H1 / Starex)
   - لاند كروزر (Land Cruiser صالون)
   - كورولا (Corolla)
   - كامري (Camry)
   - يارس (Yaris)
   - سبورتاج (Sportage)
   - راف فور (RAV4)
   إذا كان المذكور في البيان أو وصف البضاعة يشير إلى أي من هذه الموديلات أو أسماءها بالإنجليزية، اكتب الاسم بالعربي في حقل model (مثلاً: "توسان" أو "برادو" أو "تريوس" أو "شاص" أو "هيلوكس"). لا تتركه عاماً كـ "سيارة" أو فارغاً.
6. فئة الطراز / المواصفة الفرعية (vehicleModelTrim): مثل GLX, TXL, Limited, Standard, GLS, V6, غمارتين, غمّارة, دبل 4x4, ونش...
7. سنة الصنع / الموديل (year): كرقم (مثلاً 2015 أو 2020 أو 2023)
8. رقم الهيكل / الشاصي / القاعدة (vinNumber): 17 حرفاً ورقم (أو كما هو مكتوب بدقة في الوثيقة)
9. رقم المحرك (engineNumber): رقم محرك المركبة (Engine No / رقم المكينة).

⚠️⚠️ تنبيه حاسم وصارم لمنع التبديل والخلط الشائع بين رقم المحرك والطراز:
- رقم المحرك (engineNumber) هو كود ورقم المكينة الميكانيكي المكون من أرقام أو حروف إنجليزية مع أرقام (مثل: G4NA123456 أو 2TR-5489211 أو 1GR948210 أو 641664). لا تضع فيه أبداً اسم السيارة أو الطراز (توسان، برادو، GLS، TXL...)!
- نوع وطراز المركبة (model / vehicleModelTrim) هو الاسم التجاري وفئة التجهيز للسيارة (مثل: توسان، برادو، تريوس، شاص، هيلوكس، سنتافي، باص H1، GLS، TXL، GLX). لا تضع فيه أبداً رقم المحرك أو كود المكينة!
- في جداول البيانات الجمركية اليمنية: خانة "الطراز" تخص فئة ونوع السيارة، وخانة "رقم المحرك" تخص أرقام المكينة؛ احرص بشدة على عدم عكسهما أو تبديلهما.

10. لون المركبة الأساسي (color) والثانوي إن وجد (secondaryColor)
11. نوع المركبة (vehicleType): أحد القيم: 'sedan', 'suv', 'pickup', 'van', 'bus', 'truck', 'motorcycle', 'trailer'
12. شكل الهيكل التفصيلي (vehicleBodyShape): مثل: جيب صالون مقفل، شاص غمارتين حوض، باص مقفل (ركاب / فان)، صالون 4 أبواب، بيك أب غمّارة، حافلة ركاب، شاحنة نقل...
13. نوع الوقود (fuelType): أحد القيم: 'petrol', 'diesel', 'hybrid', 'electric', 'gas'
14. سعة المحرك (engineCapacity): مثل 2000 cc أو 2.7L أو 4.0L
15. عدد الأسطوانات (cylindersCount): كرقم (مثلاً 4 أو 6 أو 8)
16. عدد الركاب / المقاعد (seatingCapacity): كرقم
17. الحمولة المصرح بها بالكيلوغرام (loadCapacityKg): كرقم
18. بلد المنشأ والتصنيع (originCountry): مثل اليابان، كوريا الجنوبية، تايلاند، ألمانيا، أمريكا، الصين...
19. اسم المالك المذكور بالبيان إن وجد (ownerFullName)
20. الرقم الوطني أو رقم هوية المالك إن وجد (ownerNationalId)

إذا لم يتوفر حقل معين بالوثيقة، ضعه فارغاً "" أو رقماً افتراضياً معقولاً.`;

    const response = await generateContentWithFallback(ai, {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            customsDeclarationNumber: { type: Type.STRING, description: "رقم البيان الجمركي" },
            customsDeclarationDate: { type: Type.STRING, description: "تاريخ البيان الجمركي (YYYY/MM/DD)" },
            customsIssuingOffice: { type: Type.STRING, description: "جهة أو منفذ إصدار البيان الجمركي بدقة (مثال: جمرك منفذ الوديعة، جمرك ميناء عدن، جمرك شحن)" },
            make: { type: Type.STRING, description: "الشركة الصانعة / الماركة" },
            model: { type: Type.STRING, description: "نوع المركبة / الموديل التجاري (مثل: توسان، برادو، تريوس، شاص، هيلوكس، سنتافي)" },
            vehicleModelTrim: { type: Type.STRING, description: "فئة الطراز الفرعي (مثل: GLX, TXL, Limited, غمارتين)" },
            year: { type: Type.INTEGER, description: "سنة الصنع (الموديل)" },
            vinNumber: { type: Type.STRING, description: "رقم الهيكل أو الشاصي VIN" },
            engineNumber: { type: Type.STRING, description: "رقم المحرك أو رقم المكينة بدقة بدون فراغات أو رموز" },
            color: { type: Type.STRING, description: "اللون الأساسي" },
            secondaryColor: { type: Type.STRING, description: "اللون الثانوي" },
            vehicleType: {
              type: Type.STRING,
              enum: ["sedan", "suv", "pickup", "van", "bus", "truck", "motorcycle", "trailer"],
              description: "نوع المركبة الأساسي",
            },
            vehicleBodyShape: {
              type: Type.STRING,
              description: "شكل الهيكل التفصيلي بالعربية",
            },
            fuelType: {
              type: Type.STRING,
              enum: ["petrol", "diesel", "hybrid", "electric", "gas"],
              description: "نوع الوقود",
            },
            engineCapacity: { type: Type.STRING, description: "سعة المحرك" },
            cylindersCount: { type: Type.INTEGER, description: "عدد السلندرات" },
            seatingCapacity: { type: Type.INTEGER, description: "عدد المقاعد" },
            loadCapacityKg: { type: Type.NUMBER, description: "الحمولة بالكيلوغرام" },
            originCountry: { type: Type.STRING, description: "بلد الصنع والمنشأ" },
            plateNumber: { type: Type.STRING, description: "رقم اللوحة إن وجد" },
            plateLetter: { type: Type.STRING, description: "حرف اللوحة إن وجد" },
            ownerFullName: { type: Type.STRING, description: "اسم المالك إن وجد في البيان" },
            ownerNationalId: { type: Type.STRING, description: "الرقم الوطني للمالك إن وجد" },
            notes: { type: Type.STRING, description: "ملاحظات جمركية أو قيود أو بيانات إضافية مستخرجة" },
          },
          required: ["make", "model", "year", "vinNumber"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");

    // Post-processing & Normalization for Engine Number, Model, and Customs data
    const rawText = response.text || "";

    // 0. Automatic Detection & Correction of Inverted/Swapped Engine Number and Model/Trim
    const looksLikeCarModelOrTrim = (val: any): boolean => {
      if (!val) return false;
      const str = String(val).trim().toLowerCase();
      const keywords = [
        'توسان', 'برادو', 'تريوس', 'شاص', 'هيلوكس', 'سنتافي', 'باص', 'لاند كروزر', 'لاندكروزر',
        'كورولا', 'كامري', 'يارس', 'سبورتاج', 'راف فور', 'راف4', 'صالون', 'جيب', 'غمارتين', 'غمّارة',
        'دبل', 'حوض', 'بيك اب', 'بيك أب', 'أوتوماتيك', 'عادي', 'قياسي', 'فل كامل', 'حافلة',
        'tucson', 'prado', 'terios', 'hilux', 'shas', 'santa fe', 'corolla', 'camry', 'sportage', 'rav4',
        'gls', 'txl', 'glx', 'vxr', 'gxr', 'limited', 'standard', 'se', 'le', 'xle', 'v6', 'v8', '4wd', '4x4'
      ];
      return keywords.some(k => str.includes(k));
    };

    const looksLikeEngineNumber = (val: any): boolean => {
      if (!val) return false;
      const str = String(val).trim();
      if (looksLikeCarModelOrTrim(str) && !/\d{3,}/.test(str)) {
        return false;
      }
      const hasEngineCode = /^(?:2TR|1GR|2AZ|1NZ|1HZ|3RZ|2AR|1VD|5L|3SZ|HC|K3|G4|D4|G6|QR|VQ|HR)[\-_]?[A-Z0-9]*/i.test(str);
      const hasSerialDigits = /\d{3,}/.test(str);
      return hasEngineCode || hasSerialDigits;
    };

    let rawEng = parsed.engineNumber ? String(parsed.engineNumber).trim() : '';
    let rawMdl = parsed.model ? String(parsed.model).trim() : '';
    let rawTrm = parsed.vehicleModelTrim ? String(parsed.vehicleModelTrim).trim() : '';

    // Check if engineNumber and model/trim were swapped
    if (looksLikeCarModelOrTrim(rawEng) || (!/\d/.test(rawEng) && (looksLikeEngineNumber(rawTrm) || looksLikeEngineNumber(rawMdl)))) {
      if (looksLikeEngineNumber(rawTrm)) {
        // Swap engineNumber with vehicleModelTrim
        const temp = rawEng;
        parsed.engineNumber = rawTrm;
        parsed.vehicleModelTrim = temp;
        rawEng = rawTrm;
        rawTrm = temp;
      } else if (looksLikeEngineNumber(rawMdl)) {
        // Swap engineNumber with model
        const temp = rawEng;
        parsed.engineNumber = rawMdl;
        parsed.model = temp;
        rawEng = rawMdl;
        rawMdl = temp;
      }
    } else if (looksLikeEngineNumber(rawTrm) && !looksLikeEngineNumber(rawEng)) {
      parsed.engineNumber = rawTrm;
      parsed.vehicleModelTrim = looksLikeCarModelOrTrim(rawEng) ? rawEng : 'قياسي';
      rawEng = rawTrm;
    } else if (looksLikeEngineNumber(rawMdl) && !looksLikeEngineNumber(rawEng)) {
      parsed.engineNumber = rawMdl;
      parsed.model = looksLikeCarModelOrTrim(rawEng) ? rawEng : '';
      rawEng = rawMdl;
    }

    // 1. Clean and normalize engine number
    if (parsed.engineNumber) {
      let eng = String(parsed.engineNumber).trim();
      eng = eng.replace(/^(?:رقم\s*المحرك|المحرك|رقم\s*المكينة|المكينة|محرك\s*رقم|Engine\s*(?:No|#|\.)?|ENG\s*(?:NO|#|\.)?|M\/N)[\s:]*/i, '');
      eng = eng.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
      eng = eng.replace(/[\*#]/g, '').trim().toUpperCase();
      parsed.engineNumber = eng;
    } else {
      // Search raw text or notes for engine number if AI missed it
      const engMatch = rawText.match(/(?:رقم\s*المحرك|المحرك|رقم\s*المكينة|المكينة|محرك\s*رقم|Engine\s*(?:No|#|\.)?|ENG\s*(?:NO|#|\.)?|M\/N)[\s:"]*([A-Z0-9\-\/]{4,20})/i);
      if (engMatch && engMatch[1]) {
        let eng = engMatch[1].trim();
        eng = eng.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
        parsed.engineNumber = eng.replace(/[\*#]/g, '').trim().toUpperCase();
      }
    }

    // 2. Normalize Popular Yemen Models if model is missing or generic
    const popularNames = [
      { ar: 'توسان', en: 'tucson', make: 'هيونداي (Hyundai)' },
      { ar: 'برادو', en: 'prado', make: 'تويوتا (Toyota)' },
      { ar: 'تريوس', en: 'terios', make: 'دايهاتسو (Daihatsu)' },
      { ar: 'شاص', en: 'shas', make: 'تويوتا (Toyota)' },
      { ar: 'هيلوكس', en: 'hilux', make: 'تويوتا (Toyota)' },
      { ar: 'سنتافي', en: 'santa fe', make: 'هيونداي (Hyundai)' },
      { ar: 'باص H1', en: 'h1', make: 'هيونداي (Hyundai)' },
      { ar: 'لاند كروزر', en: 'land cruiser', make: 'تويوتا (Toyota)' },
      { ar: 'كورولا', en: 'corolla', make: 'تويوتا (Toyota)' },
      { ar: 'كامري', en: 'camry', make: 'تويوتا (Toyota)' },
      { ar: 'يارس', en: 'yaris', make: 'تويوتا (Toyota)' },
      { ar: 'سبورتاج', en: 'sportage', make: 'كيا (Kia)' },
      { ar: 'راف فور', en: 'rav4', make: 'تويوتا (Toyota)' },
    ];

    const currentModelStr = `${parsed.model || ''} ${parsed.make || ''} ${parsed.vehicleModelTrim || ''} ${parsed.notes || ''}`.toLowerCase();
    for (const pop of popularNames) {
      if (currentModelStr.includes(pop.ar) || currentModelStr.includes(pop.en)) {
        if (!parsed.model || parsed.model === 'سيارة' || parsed.model === 'صالون' || parsed.model.toLowerCase() === pop.en) {
          parsed.model = pop.ar;
        }
        if (!parsed.make) {
          parsed.make = pop.make;
        }
        break;
      }
    }

    // 3. Normalize digits in customs declaration number
    if (parsed.customsDeclarationNumber) {
      parsed.customsDeclarationNumber = String(parsed.customsDeclarationNumber)
        .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
        .trim();
    }

    // 4. Normalize Customs Issuing Office (منفذ / جمرك الإصدار)
    const combinedCustomsText = `${parsed.customsIssuingOffice || ''} ${parsed.notes || ''} ${rawText}`.toLowerCase();
    if (combinedCustomsText.includes('الوديع') || combinedCustomsText.includes('الوديعه') || combinedCustomsText.includes('وديعة') || combinedCustomsText.includes('وديعه')) {
      parsed.customsIssuingOffice = 'جمرك منفذ الوديعة';
    } else if (combinedCustomsText.includes('شحن') || combinedCustomsText.includes('منفذ شحن')) {
      parsed.customsIssuingOffice = 'جمرك منفذ شحن';
    } else if (combinedCustomsText.includes('صرفيت') || combinedCustomsText.includes('سرفيت')) {
      parsed.customsIssuingOffice = 'جمرك منفذ صرفيت';
    } else if (combinedCustomsText.includes('المنطقة الحرة') || combinedCustomsText.includes('ميناء عدن') || combinedCustomsText.includes('عدن')) {
      parsed.customsIssuingOffice = 'جمرك ميناء عدن (المنطقة الحرة)';
    } else if (combinedCustomsText.includes('ميناء المكلا') || combinedCustomsText.includes('المكلا')) {
      parsed.customsIssuingOffice = 'جمرك ميناء المكلا';
    } else if (combinedCustomsText.includes('ميناء الحديدة') || combinedCustomsText.includes('الحديدة')) {
      parsed.customsIssuingOffice = 'جمرك ميناء الحديدة';
    } else if (combinedCustomsText.includes('صنعاء')) {
      parsed.customsIssuingOffice = 'جمرك صنعاء';
    } else if (combinedCustomsText.includes('الراهدة')) {
      parsed.customsIssuingOffice = 'جمرك الراهدة';
    }

    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error in /api/extract/customs-declaration:", error);
    return res.status(500).json({
      error: formatArabicErrorMessage(error, "فشل استخراج بيانات البيان الجمركي. يرجى التحقق من وضوح الصورة والمحاولة مرة أخرى."),
    });
  }
});

// ============================================================================
// 3. Extract Guarantor / Identifier Data from ID Card
// ============================================================================
app.post("/api/extract/guarantor-id", async (req: Request, res: Response) => {
  try {
    const { image, guarantorNumber } = req.body;
    if (!image) {
      return res.status(400).json({ error: "صورة بطاقة المعرف مطلوبة." });
    }

    const ai = getGenAI();
    const { mimeType, base64Data } = parseBase64Image(image);

    const prompt = `أنت مدقق ترقيم مركبات ومعاملات رسمية.
قم باستخراج بيانات المعرّف / الضامن (المعرف ${guarantorNumber || 1}) من صورة بطاقة الهوية أو الجواز المعروض:
1. الاسم الرباعي واللقب (fullName)
2. الرقم الوطني أو رقم الهوية (nationalId)
3. محل السكن / العنوان (address)
4. رقم الهاتف إن وجد (phone)
5. صلة القرابة أو صفة التعريف (relationship)

يرجى ملاحظة أن رقم الهاتف قد لا يكون مدوناً على البطاقة، وفي هذه الحالة اتركه فارغاً ليقوم المستخدم بإدخاله يدوياً.`;

    const response = await generateContentWithFallback(ai, {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING, description: "الاسم الرباعي واللقب للمعرف" },
            nationalId: { type: Type.STRING, description: "الرقم الوطني أو رقم الهوية" },
            address: { type: Type.STRING, description: "محل السكن أو المحافظة" },
            phone: { type: Type.STRING, description: "رقم الهاتف إن وجد بالوثيقة" },
            relationship: { type: Type.STRING, description: "صلة القرابة أو المعرفة إن ذكرت" },
          },
          required: ["fullName", "nationalId"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error in /api/extract/guarantor-id:", error);
    return res.status(500).json({
      error: formatArabicErrorMessage(error, "فشل استخراج بيانات بطاقة المعرف. يرجى المحاولة ثانية."),
    });
  }
});

// ============================================================================
// 4. Extract Plate Recognition from Photo
// ============================================================================
app.post("/api/extract/plate-image", async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "صورة اللوحة مطلوبة." });
    }

    const ai = getGenAI();
    const { mimeType, base64Data } = parseBase64Image(image);

    const prompt = `تعرف على لوحة المركبة في الصورة واستخرج:
1. رقم اللوحة (plateNumber) بالأرقام الإنجليزية أو العربية
2. حرف أو رمز الفئة (plateLetter)
3. المحافظة أو المدينة المكتوبة (governorate)
4. الدولة المكتوبة على اللوحة (plateCountry)
5. صنف اللوحة: 'private' (خصوصي) أو 'taxi' (أجرة) أو 'commercial' (نقل/تجاري) أو 'government' (حكومي) أو 'temporary' (فحص مؤقت) أو 'diplomatic' (دبلوماسي)`;

    const response = await generateContentWithFallback(ai, {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plateNumber: { type: Type.STRING, description: "رقم اللوحة" },
            plateLetter: { type: Type.STRING, description: "حرف اللوحة" },
            governorate: { type: Type.STRING, description: "المحافظة" },
            plateCountry: { type: Type.STRING, description: "الدولة" },
            plateCategory: {
              type: Type.STRING,
              enum: ["private", "taxi", "commercial", "government", "temporary", "diplomatic", "motorcycle"],
              description: "نوع الترقيم",
            },
          },
          required: ["plateNumber"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error in /api/extract/plate-image:", error);
    return res.status(500).json({
      error: formatArabicErrorMessage(error, "فشل قراءة لوحة المركبة. يرجى إعادة التقاط الصورة بوضوح أو إدخال الرقم يدوياً."),
    });
  }
});

// ============================================================================
// 5. Health Check
// ============================================================================
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================================================
// Server & Vite Integration
// ============================================================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
