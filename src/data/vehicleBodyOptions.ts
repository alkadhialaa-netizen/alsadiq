// Vehicle type and body shapes catalog for Yemen Traffic Department
export interface VehicleBodyShapeOption {
  typeKey: string;
  typeName: string;
  defaultShape: string;
  shapes: string[];
}

export const VEHICLE_BODY_OPTIONS: VehicleBodyShapeOption[] = [
  {
    typeKey: 'sedan',
    typeName: 'صالون (سيدان)',
    defaultShape: 'صالون (سيدان 4 أبواب)',
    shapes: [
      'صالون (سيدان 4 أبواب)',
      'صالون هاتشباك (5 أبواب)',
      'صالون كوبيه (بابين)',
      'صالون عائلي ستيشن',
      'صالون فاره ليموزين',
      'صالون مكشوف (كابريوليه)'
    ]
  },
  {
    typeKey: 'suv',
    typeName: 'دفع رباعي (SUV / جيب)',
    defaultShape: 'جيب صالون مقفل (دفع رباعي)',
    shapes: [
      'جيب صالون مقفل (دفع رباعي)',
      'جيب ستيشن واجن عائلي',
      'جيب كروزر / شاص دفع رباعي',
      'كروس أوفر مدمج (Crossover)',
      'جيب كشف / طربال',
      'جيب صحراوي مدرع'
    ]
  },
  {
    typeKey: 'pickup',
    typeName: 'بيك أب (ونيت / نقل خفيف)',
    defaultShape: 'شاص غمارتين (حوض)',
    shapes: [
      'شاص غمارتين (حوض مزدوج)',
      'شاص غمارة واحدة (حوض مفرد)',
      'بيك أب كابينة مغلقة / صندوق',
      'بيك أب تبريد وتجميد معزول',
      'بيك أب سطحة ونش سحب',
      'بيك أب شبك نقل مواشي'
    ]
  },
  {
    typeKey: 'van',
    typeName: 'فان / باص صغير',
    defaultShape: 'باص مقفل (ركاب / فان)',
    shapes: [
      'باص مقفل (ركاب / فان)',
      'باص صغير 12-14 راكب',
      'باص ميني فان عائلي (7-8 ركاب)',
      'فان نقل بضائع مغلق (صندوق مقفل)',
      'فان إسعاف وطوارئ مجهز',
      'فان مبرد لنقل الأغذية'
    ]
  },
  {
    typeKey: 'bus',
    typeName: 'حافلة ركاب (باص كبير)',
    defaultShape: 'حافلة ركاب كبيرة (نقل جماعي)',
    shapes: [
      'حافلة ركاب كبيرة (نقل جماعي)',
      'حافلة ركاب سياحية VIP (طابق أو طابقين)',
      'حافلة متوسطة (كوستر 26-30 راكب)',
      'حافلة مدرسية مجهزة',
      'حافلة نقل موظفين وعمال'
    ]
  },
  {
    typeKey: 'truck',
    typeName: 'شاحنة / قاطرة / قلاب',
    defaultShape: 'شاحنة نقل بضائع (صندوق مفتوح)',
    shapes: [
      'شاحنة نقل بضائع (صندوق مفتوح)',
      'شاحنة صندوق مغلق / شبك',
      'شاحنة قلاب (مخلفات ومواد بناء)',
      'شاحنة صهريج ماء / محروقات',
      'شاحنة ثلاجة / نقل مجمدات',
      'رأس قاطرة وتريلا (شاحنة تريلا)',
      'شاحنة خلاطة أسمنت / ونش رافعة',
      'شاحنة سطحة نقل سيارات'
    ]
  },
  {
    typeKey: 'motorcycle',
    typeName: 'دراجة نارية / توك توك',
    defaultShape: 'دراجة نارية عادية (عجلتين)',
    shapes: [
      'دراجة نارية عادية (عجلتين)',
      'دراجة نارية بثلاث عجلات (توك توك / ركاب)',
      'دراجة نارية ثلاث عجلات حوض نقل (بضائع)',
      'دراجة نارية دفع رباعي (بيتش باجي 4 عجلات)',
      'دراجة نارية طرد وتوصيل مع صندوق خلفي'
    ]
  },
  {
    typeKey: 'trailer',
    typeName: 'مقطورة / كرفان',
    defaultShape: 'مقطورة شحن مسطحة',
    shapes: [
      'مقطورة شحن مسطحة',
      'مقطورة صهريج محروقات / غاز',
      'مقطورة صندوق مقفل / حاويات',
      'مقطورة لوبد نقل معدات ثقيلة',
      'كرفان سياحي / سكني مجهز',
      'مقطورة زراعية خفيفة'
    ]
  }
];

const GENERIC_OR_RAW_SHAPES = new Set([
  '', '---', 'سيارة', 'مركبة', 'عربة', 'آلية', 'نقل', 'خصوصي', 'أجرة',
  'car', 'vehicle', 'auto', 'suv', 'sedan', 'pickup', 'van', 'bus', 'truck', 'wagon', 'crossover',
  'صالون', 'جيب', 'سيدان', 'بوكس', 'حوض', 'غمارة', 'غمارتين', 'فان', 'باص', 'شاحنة', 'بيك اب', 'بيك أب', 'ستيشن', 'هاتشباك'
]);

export function normalizeBodyShapeText(
  rawShape?: string,
  vehicleType?: string,
  modelAndHintText?: string,
  seatingCapacity?: number
): string {
  const raw = (rawShape || '').trim();
  const rawLower = raw.toLowerCase();
  const hint = `${modelAndHintText || ''} ${raw}`.replace(/الشاصي|شاصي/g, ' ').toLowerCase();

  // Specific explicit shapes that are already valid and detailed
  const isDetailedArabicShape =
    raw.length >= 8 &&
    !GENERIC_OR_RAW_SHAPES.has(rawLower) &&
    !/^(car|suv|sedan|pickup|van|bus|truck|wagon|hatchback|coupe)$/i.test(raw);

  // Check if the detailed shape conflicts with the deduced vehicleType (e.g. a Prado marked as Sedan)
  if (isDetailedArabicShape) {
    if (vehicleType === 'suv' && (rawLower.includes('سيدان') || rawLower.includes('4 أبواب')) && !rawLower.includes('جيب')) {
      return 'جيب صالون مقفل (دفع رباعي)';
    }
    if (vehicleType === 'sedan' && rawLower.includes('جيب')) {
      return 'صالون (سيدان 4 أبواب)';
    }
    if (vehicleType === 'pickup') {
      if ((hint.includes('غمارة واحدة') || hint.includes('مفرد') || (seatingCapacity && seatingCapacity <= 3)) && rawLower.includes('غمارتين')) {
        return hint.includes('شاص') ? 'شاص غمارة واحدة (حوض مفرد)' : 'بيك أب غمارة واحدة (حوض مفرد)';
      }
      if ((hint.includes('غمارتين') || hint.includes('مزدوج') || (seatingCapacity && seatingCapacity >= 4)) && rawLower.includes('غمارة واحدة')) {
        return hint.includes('شاص') ? 'شاص غمارتين (حوض مزدوج)' : 'بيك أب غمارتين (حوض مزدوج)';
      }
    }
    return raw;
  }

  // Normalize raw/short customs body terms using context
  if (vehicleType === 'pickup' || rawLower.includes('حوض') || rawLower.includes('غمار') || rawLower.includes('بيك')) {
    const isSingleCab =
      rawLower.includes('غمارة واحدة') ||
      rawLower.includes('مفرد') ||
      (rawLower.includes('غمارة') && !rawLower.includes('غمارتين')) ||
      rawLower.includes('single') ||
      (typeof seatingCapacity === 'number' && seatingCapacity > 0 && seatingCapacity <= 3);

    const isShas = /(?:^|[\s\-_/])شاص(?:$|[\s\-_/])/.test(hint) || hint.includes('land cruiser 70') || hint.includes('shas');
    if (isSingleCab) {
      return isShas ? 'شاص غمارة واحدة (حوض مفرد)' : 'بيك أب غمارة واحدة (حوض مفرد)';
    }
    return isShas ? 'شاص غمارتين (حوض مزدوج)' : 'بيك أب غمارتين (حوض مزدوج)';
  }

  if (vehicleType === 'suv') {
    if (rawLower.includes('كشف') || rawLower.includes('طربال')) return 'جيب كشف / طربال';
    if (rawLower.includes('كروس') || rawLower.includes('crossover') || hint.includes('توسان') || hint.includes('راف فور') || hint.includes('تريوس')) {
      return hint.includes('تريوس') ? 'جيب مدمج دفع رباعي' : 'جيب صالون مقفل (دفع رباعي)';
    }
    return 'جيب صالون مقفل (دفع رباعي)';
  }

  if (vehicleType === 'van') {
    if (hint.includes('دباب') || hint.includes('hijet') || hint.includes('هايجت')) return 'باص صغير 7 ركاب (دباب)';
    if (rawLower.includes('بضائع') || rawLower.includes('صندوق') || rawLower.includes('cargo')) return 'فان نقل بضائع مقفل (صندوق مقفل)';
    if (hint.includes('هايس') || hint.includes('hiace') || (seatingCapacity && seatingCapacity >= 12)) return 'باص صغير 12-14 راكب';
    if (rawLower.includes('ميني') || (seatingCapacity && seatingCapacity >= 6 && seatingCapacity <= 8)) return 'باص ميني فان عائلي (7-8 ركاب)';
    return 'باص مقفل (ركاب / فان)';
  }

  if (vehicleType === 'bus') {
    if (hint.includes('كوستر') || hint.includes('coaster')) return 'حافلة متوسطة (كوستر 26-30 راكب)';
    if (rawLower.includes('مدرس')) return 'حافلة مدرسية مجهزة';
    return 'حافلة ركاب كبيرة (نقل جماعي)';
  }

  if (vehicleType === 'truck') {
    if (rawLower.includes('قلاب')) return 'شاحنة قلاب (مخلفات ومواد بناء)';
    if (rawLower.includes('صهريج') || rawLower.includes('وايت')) return 'شاحنة صهريج ماء / محروقات';
    if (rawLower.includes('تريلا') || rawLower.includes('قاطرة')) return 'رأس قاطرة وتريلا (شاحنة تريلا)';
    if (rawLower.includes('ثلاجة') || rawLower.includes('مبرد')) return 'شاحنة ثلاجة / نقل مجمدات';
    if (rawLower.includes('سطحة')) return 'شاحنة سطحة نقل سيارات';
    if (rawLower.includes('مغلق') || rawLower.includes('مقفل')) return 'شاحنة صندوق مغلق / شبك';
    return 'شاحنة نقل بضائع (صندوق مفتوح)';
  }

  if (vehicleType === 'motorcycle') {
    if (hint.includes('توك توك') || hint.includes('توكتوك') || hint.includes('باجاج')) {
      return rawLower.includes('حوض') || rawLower.includes('بضائع')
        ? 'دراجة نارية ثلاث عجلات حوض نقل (بضائع)'
        : 'دراجة نارية بثلاث عجلات (توك توك / ركاب)';
    }
    return 'دراجة نارية عادية (عجلتين)';
  }

  if (vehicleType === 'trailer') {
    if (rawLower.includes('صهريج')) return 'مقطورة صهريج محروقات / غاز';
    if (rawLower.includes('كرفان')) return 'كرفان سياحي / سكني مجهز';
    return 'مقطورة شحن مسطحة';
  }

  // Sedan default variations
  if (rawLower.includes('هاتشباك') || rawLower.includes('hatchback')) return 'صالون هاتشباك (5 أبواب)';
  if (rawLower.includes('ستيشن') || rawLower.includes('بوكس') || rawLower.includes('wagon')) return 'صالون عائلي ستيشن';
  if (rawLower.includes('كوبيه') || rawLower.includes('بابين') || rawLower.includes('coupe')) return 'صالون كوبيه (بابين)';
  return 'صالون (سيدان 4 أبواب)';
}

// Helper to deduce best vehicleType and bodyShape based on make, model, or keywords
export function deduceVehicleAndBodyShape(
  text: string, 
  currentType?: string, 
  currentShape?: string,
  seatingCapacity?: number
): { vehicleType: string; bodyShape: string } {
  // Strip words like "الشاصي" / "شاصي" so they never false-match "شاص"
  const normalized = (text || '')
    .replace(/الشاصي|شاصي/g, ' ')
    .toLowerCase()
    .trim();

  let detectedType = '';

  // 1. Check for Bus (Large)
  if (
    normalized.includes('حافلة') || 
    normalized.includes('كوستر') || 
    normalized.includes('coaster') || 
    normalized.includes('بولمان') ||
    normalized.includes('نقل جماعي') ||
    /\bbus\b/.test(normalized)
  ) {
    detectedType = 'bus';
  }
  // 2. Check for Van / Mini-Bus / Dabab
  else if (
    normalized.includes('باص') || 
    /\bh[\- ]?1\b/.test(normalized) || 
    normalized.includes('هايس') || 
    normalized.includes('hiace') || 
    normalized.includes('فان') || 
    /\bvan\b/.test(normalized) || 
    normalized.includes('starex') || 
    normalized.includes('ستاركس') ||
    normalized.includes('ميكروباص') ||
    normalized.includes('دباب') ||
    normalized.includes('هايجت') ||
    normalized.includes('hijet')
  ) {
    detectedType = 'van';
  }
  // 3. Check for Truck / Heavy
  else if (
    normalized.includes('شاحنة') || 
    /\btruck\b/.test(normalized) || 
    normalized.includes('دينا') || 
    normalized.includes('dyna') || 
    normalized.includes('قلاب') || 
    normalized.includes('تريلا') || 
    normalized.includes('قاطرة') || 
    normalized.includes('اكتروس') || 
    normalized.includes('actros') || 
    normalized.includes('صهريج') || 
    normalized.includes('وايت')
  ) {
    detectedType = 'truck';
  }
  // 4. Check for Motorcycle
  else if (
    normalized.includes('دراجة') || 
    normalized.includes('موتور') || 
    normalized.includes('سيكل') || 
    normalized.includes('motorcycle') || 
    normalized.includes('توك توك') || 
    normalized.includes('توكتوك') || 
    normalized.includes('tuktuk') || 
    normalized.includes('باجاج') || 
    normalized.includes('bajaj')
  ) {
    detectedType = 'motorcycle';
  }
  // 5. Check for Pickup / Shas (using boundary for شاص)
  else if (
    normalized.includes('بيك اب') || 
    normalized.includes('بيك أب') || 
    normalized.includes('pickup') || 
    /(?:^|[\s\-_/])شاص(?:$|[\s\-_/])/.test(normalized) || 
    normalized.includes('هيلوكس') || 
    normalized.includes('هايلوكس') || 
    normalized.includes('hilux') || 
    normalized.includes('تاكوما') ||
    normalized.includes('tacoma') ||
    normalized.includes('تندرا') ||
    normalized.includes('tundra') ||
    normalized.includes('ددسن') || 
    normalized.includes('نافارا') ||
    normalized.includes('navara') ||
    normalized.includes('dmax') || 
    normalized.includes('ديماكس') || 
    normalized.includes('غمارتين') || 
    normalized.includes('غمارة') || 
    normalized.includes('ونيت') || 
    normalized.includes('حوض')
  ) {
    detectedType = 'pickup';
  }
  // 6. Check for SUV / Jeep (MUST come BEFORE Sedan 'صالون' because Prado/Land Cruiser are often called صالون in Yemen)
  else if (
    normalized.includes('جيب') || 
    /\bsuv\b/.test(normalized) || 
    normalized.includes('لاندكروزر') || 
    normalized.includes('لاند كروزر') || 
    normalized.includes('land cruiser') || 
    normalized.includes('برادو') || 
    normalized.includes('prado') || 
    normalized.includes('باترول') || 
    normalized.includes('patrol') || 
    normalized.includes('توسان') || 
    normalized.includes('tucson') || 
    normalized.includes('تريوس') || 
    normalized.includes('terios') || 
    normalized.includes('سنتافي') || 
    normalized.includes('سانتافي') || 
    normalized.includes('santa fe') || 
    normalized.includes('راف فور') || 
    normalized.includes('راف4') || 
    normalized.includes('rav4') || 
    normalized.includes('دفع رباعي') || 
    normalized.includes('فورشنر') || 
    normalized.includes('فورتشنر') || 
    normalized.includes('fortuner') || 
    normalized.includes('سبورتاج') || 
    normalized.includes('sportage') || 
    normalized.includes('باجيرو') || 
    normalized.includes('pajero') ||
    normalized.includes('سيكويا') ||
    normalized.includes('sequoia') ||
    normalized.includes('فيتارا') ||
    normalized.includes('vitara') ||
    normalized.includes('جيمني') ||
    normalized.includes('jimny') ||
    normalized.includes('رش') ||
    normalized.includes('rush') ||
    normalized.includes('كروس أوفر') ||
    normalized.includes('crossover')
  ) {
    detectedType = 'suv';
  }
  // 7. Check for Sedan / Car
  else if (
    normalized.includes('كامري') || 
    normalized.includes('camry') || 
    normalized.includes('كورولا') || 
    normalized.includes('corolla') || 
    normalized.includes('سوناتا') || 
    normalized.includes('sonata') || 
    normalized.includes('النترا') || 
    normalized.includes('إلنترا') || 
    normalized.includes('elantra') || 
    normalized.includes('اكسنت') || 
    normalized.includes('أكسنت') || 
    normalized.includes('accent') || 
    normalized.includes('أفالون') || 
    normalized.includes('avalon') || 
    normalized.includes('صني') || 
    normalized.includes('sunny') || 
    normalized.includes('أوبتيما') || 
    normalized.includes('optima') || 
    normalized.includes('سيراتو') || 
    normalized.includes('cerato') || 
    normalized.includes('صالون') || 
    normalized.includes('سيدان') || 
    normalized.includes('sedan') || 
    normalized.includes('يارس') || 
    normalized.includes('yaris') || 
    normalized.includes('سيفيك') || 
    normalized.includes('civic') || 
    normalized.includes('اكورد') || 
    normalized.includes('أكورد') || 
    normalized.includes('accord') || 
    normalized.includes('مازدا') || 
    normalized.includes('mazda')
  ) {
    detectedType = 'sedan';
  }

  const validTypes = new Set(['sedan', 'suv', 'pickup', 'van', 'bus', 'truck', 'motorcycle', 'trailer']);
  const finalType = detectedType || (currentType && validTypes.has(currentType) ? currentType : 'sedan');
  const finalShape = normalizeBodyShapeText(currentShape, finalType, text, seatingCapacity);

  return {
    vehicleType: finalType,
    bodyShape: finalShape,
  };
}
