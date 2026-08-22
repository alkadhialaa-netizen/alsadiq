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
 * Robust Gemini model invoker with exponential backoff retry and automatic fallback
 * to handle temporary 503 (high demand) or service spikes seamlessly.
 */
async function generateContentWithFallback(ai: GoogleGenAI, requestConfig: any): Promise<any> {
  const candidateModels = ["gemini-3.7-flash", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...requestConfig,
          model,
        });
        return response;
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
          // Wait 1.2 seconds before retrying same model
          await new Promise((resolve) => setTimeout(resolve, 1200));
          continue;
        }
        // Move to the next fallback model
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

    const prompt = `أنت خبير تدقيق أوراق تسجيل المركبات والبيانات الجمركية (البيان الجمركي / شهادة المنشأ / سنوية المركبة).
استخرج البيانات الفنية والميكانيكية للمركبة بدقة شديدة:
1. الشركة الصانعة (make) مثل: تويوتا، هيونداي، مرسيدس، كيا، فورد، نيسان، بي إم دبليو...
2. الطراز / الموديل (model) مثل: كامري، لاند كروزر، النترا، كورولا، سبورتاج...
3. سنة الصنع (year) كرقم (مثلاً 2024 أو 2023)
4. رقم الهيكل / الشاصي (vinNumber) - 17 حرفاً ورقم
5. رقم المحرك (engineNumber)
6. لون المركبة الأساسي (color) والثانوي إن وجد (secondaryColor)
7. نوع المركبة (vehicleType) أحد القيم: 'sedan', 'suv', 'pickup', 'van', 'bus', 'truck', 'motorcycle', 'trailer'
8. نوع الوقود (fuelType) أحد القيم: 'petrol', 'diesel', 'hybrid', 'electric', 'gas'
9. سعة المحرك (engineCapacity) مثل 2000 cc أو 2.5L
10. عدد الأسطوانات (cylindersCount) كرقم (مثلاً 4 أو 6 أو 8)
11. عدد الركاب / المقاعد (seatingCapacity) كرقم
12. الحمولة بالكيلوغرام (loadCapacityKg) كرقم
13. بلد المنشأ (originCountry) مثل: اليابان، كوريا الجنوبية، ألمانيا، أمريكا، الصين...
14. رقم اللوحة إن وجد (plateNumber)
15. حرف أو تصنيف اللوحة (plateLetter, plateCategory)
16. اسم المالك المذكور بالبيان إن وجد (ownerFullName)
17. الرقم الوطني للمالك إن وجد (ownerNationalId)

إذا لم يتوفر حقل، ضعه كقيمة افتراضية مناسبة أو اتركه فارغاً.`;

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
            make: { type: Type.STRING, description: "الشركة الصانعة" },
            model: { type: Type.STRING, description: "الموديل أو الطراز" },
            year: { type: Type.INTEGER, description: "سنة الصنع" },
            vinNumber: { type: Type.STRING, description: "رقم الهيكل أو الشاصي VIN" },
            engineNumber: { type: Type.STRING, description: "رقم المحرك" },
            color: { type: Type.STRING, description: "اللون الأساسي" },
            secondaryColor: { type: Type.STRING, description: "اللون الثانوي" },
            vehicleType: {
              type: Type.STRING,
              enum: ["sedan", "suv", "pickup", "van", "bus", "truck", "motorcycle", "trailer"],
              description: "نوع وشكل الهيكل",
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
            notes: { type: Type.STRING, description: "ملاحظات جمركية أو قيود" },
          },
          required: ["make", "model", "year", "vinNumber"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
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
