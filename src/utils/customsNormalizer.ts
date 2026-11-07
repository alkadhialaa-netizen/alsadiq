// Utility to normalize customs declaration data and prevent/correct
// swaps between Engine Number (رقم المحرك) and Vehicle Model/Trim (الطراز / نوع المركبة).

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
  // If it's purely Arabic car names without any numbers, it's definitely NOT an engine number
  if (isLikelyCarModelOrTrim(str) && !/\d{3,}/.test(str)) {
    return false;
  }
  const hasEngineFamilyCode = /^(?:2TR|1GR|2AZ|1NZ|1HZ|3RZ|2AR|1VD|5L|3SZ|HC|K3|G4|D4|G6|QR|VQ|HR|4G|4D|EJ|FB)[\-_]?[A-Z0-9]*/i.test(str);
  const hasSerialDigits = /\d{3,}/.test(str);
  return hasEngineFamilyCode || hasSerialDigits;
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
 * between engineNumber and model/vehicleModelTrim.
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

  // Condition 1: engineNumber contains car model keywords (e.g. "توسان" or "برادو" or "GLS")
  // and trim or model contains an engine code or digits
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
  } else if (!engineLooksLikeEngine && trimLooksLikeEngine) {
    // Condition 2: engineNumber doesn't look like an engine, but trim does
    const oldEngine = data.engineNumber;
    data.engineNumber = cleanEngineNumber(trimVal);
    data.vehicleModelTrim = oldEngine || 'قياسي';
    wasSwapped = true;
    reason = `تم استرجاع رقم المحرك (${data.engineNumber}) من حقل الطراز`;
  } else if (!engineLooksLikeEngine && modelLooksLikeEngine) {
    // Condition 3: engineNumber doesn't look like an engine, but model does
    const oldEngine = data.engineNumber;
    data.engineNumber = cleanEngineNumber(modelVal);
    data.model = oldEngine || '';
    wasSwapped = true;
    reason = `تم استرجاع رقم المحرك (${data.engineNumber}) من حقل الموديل`;
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
