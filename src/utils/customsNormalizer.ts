// Utility to normalize customs declaration data and prevent/correct
// swaps between Engine Number (رقم المحرك) and Vehicle Model/Trim (الطراز / نوع المركبة).
import { POPULAR_YEMEN_VEHICLES, PopularVehicle } from '../data/popularYemenVehicles';
import { deduceVehicleAndBodyShape } from '../data/vehicleBodyOptions';
import { VehicleRegistration } from '../types';

/**
 * Returns current date formatted as YYYY/MM/DD based on the user's mobile device or computer
 */
export const getCurrentDeviceDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export const CAR_MODEL_KEYWORDS = [
  'توسان', 'برادو', 'تريوس', 'شاص', 'هيلوكس', 'سنتافي', 'باص', 'لاند كروزر', 'لاندكروزر',
  'كورولا', 'كامري', 'يارس', 'سبورتاج', 'راف فور', 'راف4', 'صالون', 'جيب', 'غمارتين', 'غمّارة',
  'دبل', 'حوض', 'بيك اب', 'بيك أب', 'أوتوماتيك', 'عادي', 'قياسي', 'فل كامل', 'حافلة', 'شاحنة',
  'tucson', 'prado', 'terios', 'hilux', 'shas', 'santa fe', 'corolla', 'camry', 'sportage', 'rav4',
  'gls', 'txl', 'glx', 'vxr', 'gxr', 'limited', 'standard', 'se', 'le', 'xle', 'v6', 'v8', '4wd', '4x4', 'h1'
];

export const isLikelyCarModelOrTrim = (val: any): boolean => {
  if (!val) return false;
  const str = String(val).trim().toLowerCase();
  return CAR_MODEL_KEYWORDS.some(k => str.includes(k));
};

export const isLikelyEngineNumber = (val: any): boolean => {
  if (!val) return false;
  const str = String(val).trim();
  // 1. If it's a 4-digit manufacturing year (e.g. 2010 to 2029), it's a MODEL/YEAR number, NOT an engine number
  if (/^(?:19\d{2}|20[0-3]\d)$/.test(str)) {
    return false;
  }
  // 2. If it's standard trim/model numbers/codes (e.g. 150, 200, 2.7, 4.0, H1, TXL, GLX, 4WD), it is TRIM, NOT engine number
  if (/^(?:150|200|250|300|2\.7|4\.0|3\.5|V6|V8|4WD|4X4|H1|H-1|GLX|TXL|GLS|VX|GX|VXR|GXR|SR5|LIMITED|STANDARD)$/i.test(str)) {
    return false;
  }
  // 3. If it's purely Arabic car names without digits, it's definitely NOT an engine number
  if (isLikelyCarModelOrTrim(str) && !/\d{5,}/.test(str)) {
    return false;
  }
  // 4. Engine numbers have recognized mechanical engine series codes or long serials (6+ digits)
  const hasEngineFamilyCode = /^(?:2TR|1GR|2AZ|1NZ|1HZ|3RZ|2AR|1VD|5L|3SZ|HC|K3|G4|D4|G6|QR|VQ|HR|4G|4D|EJ|FB)[\-_]?[A-Z0-9]*/i.test(str);
  const hasLongSerialDigits = /\d{6,}/.test(str);
  return hasEngineFamilyCode || hasLongSerialDigits;
};

export const cleanEngineNumber = (val: any): string => {
  if (!val) return '';
  let eng = String(val).trim();
  eng = eng.replace(/^(?:رقم\s*المحرك|المحرك|رقم\s*المكينة|المكينة|محرك\s*رقم|Engine\s*(?:No|#|\.)?|ENG\s*(?:NO|#|\.)?|M\/N)[\s:]*/i, '');
  eng = eng.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  eng = eng.replace(/[\*#]/g, '').trim().toUpperCase();
  return eng;
};

export interface CustomsSwapResult {
  data: Record<string, any>;
  wasSwapped: boolean;
  reason?: string;
}

/**
 * Automatically inspects extracted customs data and reverses any inadvertent swap
 * between engineNumber and model/vehicleModelTrim while safeguarding declaration trim numbers.
 */
export const detectAndCorrectCustomsSwap = (rawExtracted: Record<string, any>): CustomsSwapResult => {
  if (!rawExtracted) return { data: rawExtracted, wasSwapped: false };

  const data = { ...rawExtracted };
  let engineVal = data.engineNumber ? String(data.engineNumber).trim() : '';
  let modelVal = data.model ? String(data.model).trim() : '';
  let trimVal = data.vehicleModelTrim ? String(data.vehicleModelTrim).trim() : '';

  // Clean numbers
  engineVal = cleanEngineNumber(engineVal);

  const engineLooksLikeModel = isLikelyCarModelOrTrim(engineVal);
  const engineLooksLikeEngine = isLikelyEngineNumber(engineVal);
  const trimLooksLikeEngine = isLikelyEngineNumber(trimVal);
  const modelLooksLikeEngine = isLikelyEngineNumber(modelVal);

  let wasSwapped = false;
  let reason = '';

  // Condition 1: engineNumber contains car model keywords (e.g. "توسان" or "برادو")
  // and trim or model contains an actual mechanical engine code or long serial
  if (engineLooksLikeModel && (trimLooksLikeEngine || modelLooksLikeEngine || !engineLooksLikeEngine)) {
    if (trimLooksLikeEngine) {
      data.engineNumber = cleanEngineNumber(trimVal);
      data.vehicleModelTrim = engineVal;
      wasSwapped = true;
      reason = `تم تصحيح التبديل: رقم المحرك (${data.engineNumber}) والطراز (${engineVal})`;
    } else if (modelLooksLikeEngine) {
      data.engineNumber = cleanEngineNumber(modelVal);
      data.model = engineVal;
      wasSwapped = true;
      reason = `تم تصحيح التبديل: رقم المحرك (${data.engineNumber}) ونوع المركبة (${engineVal})`;
    } else {
      // engineVal is a car model name, let's move it to model if model is empty or generic
      if (!modelVal || modelVal === 'سيارة' || modelVal === 'صالون') {
        data.model = engineVal;
        data.engineNumber = '';
        wasSwapped = true;
        reason = `تم نقل اسم السيارة (${engineVal}) إلى حقل نوع المركبة`;
      }
    }
  } else if (engineLooksLikeModel && trimLooksLikeEngine) {
    const oldEngine = data.engineNumber;
    data.engineNumber = cleanEngineNumber(trimVal);
    data.vehicleModelTrim = oldEngine;
    wasSwapped = true;
    reason = `تم تصحيح رقم المحرك (${data.engineNumber}) ورقم الطراز (${oldEngine})`;
  }

  // Normalize Customs Issuing Office (المنفذ / الجمرك)
  if (data.customsIssuingOffice || data.notes) {
    const normalizedOffice = normalizeCustomsOffice(data.customsIssuingOffice, data.notes);
    if (normalizedOffice && normalizedOffice !== data.customsIssuingOffice) {
      data.customsIssuingOffice = normalizedOffice;
    }
  }

  return { data, wasSwapped, reason };
};

export const YEMEN_CUSTOMS_OFFICES = [
  'جمرك منفذ الوديعة',
  'جمرك ميناء عدن (المنطقة الحرة)',
  'جمرك منفذ شحن',
  'جمرك منفذ صرفيت',
  'جمرك ميناء المكلا',
  'جمرك تعز',
  'جمرك صنعاء',
  'جمرك ميناء الحديدة',
  'جمرك الراهدة',
];

export const normalizeCustomsOffice = (officeVal: any, notesOrOtherText?: string): string => {
  const combined = `${officeVal || ''} ${notesOrOtherText || ''}`.trim().toLowerCase();
  if (combined.includes('الوديع') || combined.includes('الوديعه') || combined.includes('وديعة') || combined.includes('وديعه')) {
    return 'جمرك منفذ الوديعة';
  }
  if (combined.includes('شحن') || combined.includes('منفذ شحن')) {
    return 'جمرك منفذ شحن';
  }
  if (combined.includes('صرفيت') || combined.includes('سرفيت')) {
    return 'جمرك منفذ صرفيت';
  }
  if (combined.includes('المنطقة الحرة') || combined.includes('ميناء عدن') || combined.includes('عدن')) {
    return 'جمرك ميناء عدن (المنطقة الحرة)';
  }
  if (combined.includes('ميناء المكلا') || combined.includes('المكلا')) {
    return 'جمرك ميناء المكلا';
  }
  if (combined.includes('ميناء الحديدة') || combined.includes('الحديدة')) {
    return 'جمرك ميناء الحديدة';
  }
  if (combined.includes('صنعاء')) {
    return 'جمرك صنعاء';
  }
  if (combined.includes('الراهدة')) {
    return 'جمرك الراهدة';
  }
  if (combined.includes('تعز') && !combined.includes('الوديع')) {
    return 'جمرك تعز';
  }
  return officeVal ? String(officeVal).trim() : '';
};

/**
 * Manual 1-click swap function for the user to invert Engine Number and Model/Trim
 */
export const swapEngineAndModelFields = (current: Record<string, any>): Record<string, any> => {
  if (!current) return current;
  const updated = { ...current };

  const currentEngine = updated.engineNumber ? String(updated.engineNumber).trim() : '';
  const currentModel = updated.model ? String(updated.model).trim() : '';
  const currentTrim = updated.vehicleModelTrim ? String(updated.vehicleModelTrim).trim() : '';

  // If vehicleModelTrim has value, swap engine with trim; else swap with model
  if (currentTrim && currentTrim !== currentEngine) {
    updated.engineNumber = cleanEngineNumber(currentTrim);
    updated.vehicleModelTrim = currentEngine;
  } else if (currentModel) {
    updated.engineNumber = cleanEngineNumber(currentModel);
    updated.model = currentEngine;
  } else {
    updated.engineNumber = cleanEngineNumber(currentTrim);
    updated.vehicleModelTrim = currentEngine;
  }

  return updated;
};

export const toWesternDigits = (val: any): string => {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
};

export const normalizeVinNumber = (val: any): string => {
  if (!val) return '';
  let vin = toWesternDigits(val)
    .replace(/[\s\-_.*#]/g, '')
    .toUpperCase()
    .trim();
  // Strip any leading Arabic label text if accidentally included
  vin = vin.replace(/^[^A-Z0-9]+/, '');
  // Standard 17-char ISO VINs never use I, O, Q
  if (vin.length === 17) {
    vin = vin.replace(/O/g, '0').replace(/Q/g, '0').replace(/I/g, '1');
  }
  return vin;
};

export const normalizeVehicleMake = (val: any): string => {
  if (!val) return '';
  const raw = String(val).trim();
  const lower = raw.toLowerCase();
  const makeMap: Array<[string[], string]> = [
    [['toyota', 'تويوتا'], 'تويوتا (Toyota)'],
    [['hyundai', 'هيونداي', 'هونداي'], 'هيونداي (Hyundai)'],
    [['daihatsu', 'دايهاتسو', 'ديهاتسو'], 'دايهاتسو (Daihatsu)'],
    [['kia', 'كيا'], 'كيا (Kia)'],
    [['nissan', 'نيسان'], 'نيسان (Nissan)'],
    [['mitsubishi', 'ميتسوبيشي', 'متسوبيشي'], 'ميتسوبيشي (Mitsubishi)'],
    [['suzuki', 'سوزوكي'], 'سوزوكي (Suzuki)'],
    [['isuzu', 'ايسوزو', 'إيسوزو'], 'إيسوزو (Isuzu)'],
    [['ford', 'فورد'], 'فورد (Ford)'],
    [['chevrolet', 'شيفروليه', 'شفروليه'], 'شيفروليه (Chevrolet)'],
    [['mazda', 'مازدا'], 'مازدا (Mazda)'],
    [['honda', 'هوندا'], 'هوندا (Honda)'],
    [['mercedes', 'مرسيدس'], 'مرسيدس (Mercedes)'],
    [['changan', 'تشانجان', 'شانجان'], 'شانجان (Changan)'],
    [['haval', 'هافال'], 'هافال (Haval)'],
    [['jetour', 'جيتور'], 'جيتور (Jetour)'],
  ];
  for (const [keys, formatted] of makeMap) {
    if (keys.some(k => lower.includes(k))) {
      return formatted;
    }
  }
  return raw;
};

export const normalizeVehicleColor = (val: any): string => {
  if (!val) return '';
  let raw = String(val).replace(/^(?:اللون|لون)\s*[:：]?\s*/i, '').trim();
  const lower = raw.toLowerCase();
  const colorMap: Array<[RegExp, string]> = [
    [/pearl\s*white|لؤلؤي/, 'أبيض لؤلؤي'],
    [/^(?:white|wht)$/, 'أبيض'],
    [/^(?:silver|slv)$/, 'فضي'],
    [/^(?:black|blk)$/, 'أسود'],
    [/dark\s*gr[ae]y|charcoal/, 'رمادي داكن'],
    [/^(?:gr[ae]y|gry)$/, 'رمادي'],
    [/dark\s*blue|navy/, 'كحلي'],
    [/^(?:blue|blu)$/, 'أزرق'],
    [/maroon|burgundy/, 'عنابي'],
    [/^(?:red)$/, 'أحمر'],
    [/^(?:gold|golden)$/, 'ذهبي'],
    [/^(?:beige|tan|champagne)$/, 'بيج'],
    [/^(?:green|grn)$/, 'أخضر'],
    [/^(?:brown|brn)$/, 'بني'],
    [/^(?:yellow|ylw)$/, 'أصفر'],
    [/^(?:orange|org)$/, 'برتقالي'],
  ];
  for (const [pattern, ar] of colorMap) {
    if (pattern.test(lower)) return ar;
  }
  return raw;
};

export const normalizeFuelType = (val: any): 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'gas' | '' => {
  if (!val) return '';
  const lower = String(val).trim().toLowerCase();
  if (lower === 'diesel' || lower.includes('ديزل') || lower.includes('سولار') || lower.includes('مازوت')) return 'diesel';
  if (lower === 'hybrid' || lower.includes('هايبرد') || lower.includes('هجين')) return 'hybrid';
  if (lower === 'electric' || lower.includes('كهرب')) return 'electric';
  if (lower === 'gas' || lower.includes('غاز') || lower.includes('cng') || lower.includes('lpg')) return 'gas';
  if (lower === 'petrol' || lower.includes('بترول') || lower.includes('بنزين') || lower.includes('gasoline')) return 'petrol';
  return '';
};

export const normalizeOriginCountry = (val: any, vin?: string): string => {
  const raw = val ? String(val).trim() : '';
  const lower = raw.toLowerCase();
  const countryMap: Array<[RegExp, string]> = [
    [/japan|jpn|اليابان|ياباني/, 'اليابان'],
    [/korea|kor|كوريا/, 'كوريا الجنوبية'],
    [/thailand|tha|تايلاند|تايلند/, 'تايلاند'],
    [/usa|united\s*states|america|أمريكا|امريكا|الولايات المتحدة/, 'الولايات المتحدة الأمريكية'],
    [/germany|ger|deu|ألمانيا|المانيا/, 'ألمانيا'],
    [/china|chn|الصين/, 'الصين'],
    [/india|ind|الهند/, 'الهند'],
    [/indonesia|idn|إندونيسيا|اندونيسيا/, 'إندونيسيا'],
    [/uk|britain|england|بريطانيا/, 'بريطانيا'],
    [/uae|emirates|الإمارات/, 'الإمارات'],
  ];
  for (const [pattern, ar] of countryMap) {
    if (pattern.test(lower)) return ar;
  }
  if (raw) return raw;

  // Fallback safely using WMI first character of 17-char VIN if completely missing
  if (vin && vin.length === 17) {
    const first = vin[0];
    if (first === 'J') return 'اليابان';
    if (first === 'K') return 'كوريا الجنوبية';
    if (first === 'W') return 'ألمانيا';
    if (first === 'L') return 'الصين';
    if (first === '1' || first === '4' || first === '5') return 'الولايات المتحدة الأمريكية';
    if (vin.startsWith('MR') || vin.startsWith('MM') || vin.startsWith('MP')) return 'تايلاند';
    if (vin.startsWith('MH')) return 'إندونيسيا';
  }
  return '';
};

export const normalizeEngineCapacity = (val: any): string => {
  if (!val) return '';
  let str = toWesternDigits(val).trim();
  if (/^\d{3,4}$/.test(str)) {
    return `${str} cc`;
  }
  str = str.replace(/سي\s*سي|سيسي/gi, 'cc').replace(/\s+/g, ' ');
  return str;
};

/**
 * Matches popular Yemen vehicle ONLY against safe vehicle model/make fields (never notes with "الشاصي")
 * and prevents substring false-positives (like "باص" matching "باص H1").
 */
export const matchPopularYemenVehicleSafely = (
  rawModel?: string,
  rawMake?: string,
  rawTrim?: string
): PopularVehicle | undefined => {
  const cleanModel = (rawModel || '').replace(/الشاصي|شاصي/g, ' ').trim();
  const cleanMake = (rawMake || '').trim();
  const cleanTrim = (rawTrim || '').replace(/الشاصي|شاصي/g, ' ').trim();
  const modelLower = cleanModel.toLowerCase();
  const combinedSafe = `${cleanModel} ${cleanMake} ${cleanTrim}`.toLowerCase();

  if (!cleanModel && !cleanTrim) return undefined;

  // 1. Exact or strong inclusion on model name
  for (const p of POPULAR_YEMEN_VEHICLES) {
    const arLower = p.name.toLowerCase();
    const enLower = p.nameEn.toLowerCase();

    if (modelLower === arLower || modelLower === enLower) {
      return p;
    }
    if (p.name === 'شاص') {
      if (/(?:^|[\s\-_/])شاص(?:$|[\s\-_/])/.test(modelLower) || modelLower.includes('land cruiser 70') || modelLower.includes('shas')) {
        return p;
      }
      continue;
    }
    if (p.name === 'باص H1') {
      if (modelLower.includes('باص h1') || /\bh[\- ]?1\b/.test(modelLower) || modelLower.includes('starex') || modelLower.includes('ستاركس')) {
        return p;
      }
      continue;
    }
    if (p.name === 'لاند كروزر') {
      if ((modelLower.includes('لاند كروزر') || modelLower.includes('لاندكروزر') || modelLower.includes('land cruiser')) && !modelLower.includes('برادو') && !modelLower.includes('prado') && !modelLower.includes('70')) {
        return p;
      }
      continue;
    }
    if (modelLower.includes(arLower) || (enLower.length >= 3 && modelLower.includes(enLower))) {
      return p;
    }
  }

  // 2. Check English / Arabic names across safe combined fields (excluding شاص unless boundary-matched)
  for (const p of POPULAR_YEMEN_VEHICLES) {
    const arLower = p.name.toLowerCase();
    const enLower = p.nameEn.toLowerCase();
    if (p.name === 'شاص') {
      if (/(?:^|[\s\-_/])شاص(?:$|[\s\-_/])/.test(combinedSafe) || combinedSafe.includes('shas')) {
        return p;
      }
      continue;
    }
    if (p.name === 'باص H1') {
      if (combinedSafe.includes('باص h1') || /\bh[\- ]?1\b/.test(combinedSafe)) {
        return p;
      }
      continue;
    }
    if (combinedSafe.includes(arLower) || (enLower.length >= 4 && combinedSafe.includes(enLower))) {
      return p;
    }
  }

  return undefined;
};

/**
 * Unified, high-accuracy resolver for customs declaration AI extraction.
 * Used identically in NewRegistrationPage and RegistrationInputForm.
 */
export const resolveAccurateCustomsVehicleData = (
  extracted: Record<string, any>,
  currentData: VehicleRegistration
): { updated: VehicleRegistration; wasSwapped: boolean } => {
  // 1. Auto-check and correct any swap between engineNumber and model/vehicleModelTrim
  const { data: normExtracted, wasSwapped } = detectAndCorrectCustomsSwap(extracted);

  const cleanVin = normalizeVinNumber(normExtracted.vinNumber);
  const cleanEngine = cleanEngineNumber(normExtracted.engineNumber);
  const safeNotes = normExtracted.notes ? String(normExtracted.notes).trim() : '';

  const parsedYearRaw = parseInt(toWesternDigits(normExtracted.year), 10);
  const resolvedYear = (!isNaN(parsedYearRaw) && parsedYearRaw >= 1960 && parsedYearRaw <= 2030)
    ? parsedYearRaw
    : currentData.year;

  const parsedCylinders = parseInt(toWesternDigits(normExtracted.cylindersCount), 10);
  const parsedSeats = parseInt(toWesternDigits(normExtracted.seatingCapacity), 10);
  const parsedLoad = parseFloat(toWesternDigits(normExtracted.loadCapacityKg));

  const matchedPopular = matchPopularYemenVehicleSafely(
    normExtracted.model,
    normExtracted.make,
    normExtracted.vehicleModelTrim
  );

  const resolvedModel = matchedPopular
    ? matchedPopular.name
    : (normExtracted.model && String(normExtracted.model).trim() !== '' && String(normExtracted.model).trim() !== 'سيارة'
        ? String(normExtracted.model).trim()
        : currentData.model);

  const resolvedMake = normalizeVehicleMake(normExtracted.make) || (matchedPopular ? matchedPopular.make : currentData.make);

  const resolvedTrim = normExtracted.vehicleModelTrim && String(normExtracted.vehicleModelTrim).trim() !== ''
    ? toWesternDigits(String(normExtracted.vehicleModelTrim).trim())
    : (currentData.vehicleModelTrim || (matchedPopular ? matchedPopular.defaultTrim || '' : ''));

  const resolvedSeats = (!isNaN(parsedSeats) && parsedSeats > 0) ? parsedSeats : currentData.seatingCapacity;

  // 2. Deduce harmonious vehicleType and vehicleBodyShape
  // Prioritize actual extracted shape & safe model text (NOT stale currentData.vehicleBodyShape!)
  const safeDeductionText = `${resolvedMake} ${resolvedModel} ${normExtracted.vehicleBodyShape || ''} ${resolvedTrim}`.replace(/الشاصي|شاصي/g, ' ');
  const deduced = deduceVehicleAndBodyShape(
    safeDeductionText,
    normExtracted.vehicleType || (matchedPopular ? matchedPopular.vehicleType : undefined),
    normExtracted.vehicleBodyShape || (matchedPopular ? matchedPopular.vehicleBodyShape : undefined),
    !isNaN(parsedSeats) && parsedSeats > 0 ? parsedSeats : undefined
  );

  const resolvedFuel =
    normalizeFuelType(normExtracted.fuelType) ||
    (matchedPopular ? matchedPopular.fuelType : '') ||
    currentData.fuelType;

  const resolvedColor = normalizeVehicleColor(normExtracted.color) || currentData.color;
  const resolvedSecondaryColor = normalizeVehicleColor(normExtracted.secondaryColor) || currentData.secondaryColor;
  const resolvedEngineCap = normalizeEngineCapacity(normExtracted.engineCapacity) || (matchedPopular?.engineCapacity || '') || currentData.engineCapacity;
  const resolvedCylinders = (!isNaN(parsedCylinders) && parsedCylinders > 0 && parsedCylinders <= 16)
    ? parsedCylinders
    : (matchedPopular?.cylindersCount ?? currentData.cylindersCount);
  const resolvedOrigin = normalizeOriginCountry(normExtracted.originCountry, cleanVin) || currentData.originCountry;

  const declNum = normExtracted.customsDeclarationNumber
    ? toWesternDigits(normExtracted.customsDeclarationNumber).trim()
    : currentData.customsDeclarationNumber;
  const declDate = normExtracted.customsDeclarationDate
    ? toWesternDigits(normExtracted.customsDeclarationDate).trim()
    : currentData.customsDeclarationDate;

  const updated: VehicleRegistration = {
    ...currentData,
    customsDeclarationNumber: declNum,
    customsDeclarationDate: declDate,
    customsIssuingOffice: normExtracted.customsIssuingOffice || currentData.customsIssuingOffice,
    make: resolvedMake,
    model: resolvedModel,
    vehicleModelTrim: resolvedTrim,
    year: resolvedYear,
    vinNumber: cleanVin || currentData.vinNumber,
    engineNumber: cleanEngine || currentData.engineNumber,
    color: resolvedColor,
    secondaryColor: resolvedSecondaryColor,
    vehicleType: deduced.vehicleType as any,
    vehicleBodyShape: deduced.bodyShape,
    fuelType: resolvedFuel as any,
    engineCapacity: resolvedEngineCap,
    cylindersCount: resolvedCylinders,
    seatingCapacity: resolvedSeats,
    loadCapacityKg: (!isNaN(parsedLoad) && parsedLoad >= 0) ? parsedLoad : currentData.loadCapacityKg,
    originCountry: resolvedOrigin,
    plateNumber: normExtracted.plateNumber ? toWesternDigits(normExtracted.plateNumber).trim() : currentData.plateNumber,
    notes: safeNotes && !currentData.notes?.includes(safeNotes)
      ? `${currentData.notes ? currentData.notes + ' | ' : ''}${safeNotes}`
      : currentData.notes,
    updatedAt: new Date().toISOString(),
  };

  return { updated, wasSwapped };
};

