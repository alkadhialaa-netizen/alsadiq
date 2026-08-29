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

// Helper to deduce best vehicleType and bodyShape based on make, model, or keywords
export function deduceVehicleAndBodyShape(
  text: string, 
  currentType?: string, 
  currentShape?: string
): { vehicleType: string; bodyShape: string } {
  const normalized = (text || '').toLowerCase().trim();

  // 1. Check for Bus / Van
  if (
    normalized.includes('باص') || 
    normalized.includes('h1') || 
    normalized.includes('هايس') || 
    normalized.includes('hiace') || 
    normalized.includes('فان') || 
    normalized.includes('van') || 
    normalized.includes('starex') || 
    normalized.includes('ميكروباص')
  ) {
    return {
      vehicleType: 'van',
      bodyShape: currentShape && currentShape !== '---' ? currentShape : 'باص مقفل (ركاب / فان)'
    };
  }

  // 2. Check for Large Bus
  if (
    normalized.includes('حافلة') || 
    normalized.includes('كوستر') || 
    normalized.includes('coaster') || 
    normalized.includes('bus') || 
    normalized.includes('نقل جماعي') || 
    normalized.includes('بولمان')
  ) {
    return {
      vehicleType: 'bus',
      bodyShape: currentShape && currentShape !== '---' ? currentShape : 'حافلة ركاب كبيرة (نقل جماعي)'
    };
  }

  // 3. Check for Pickup / Shas
  if (
    normalized.includes('بيك اب') || 
    normalized.includes('بيك أب') || 
    normalized.includes('pickup') || 
    normalized.includes('شاص') || 
    normalized.includes('هيلوكس') || 
    normalized.includes('hilux') || 
    normalized.includes('ددسن') || 
    normalized.includes('dmax') || 
    normalized.includes('ديماكس') || 
    normalized.includes('غمارتين') || 
    normalized.includes('غمارة') || 
    normalized.includes('ونيت') || 
    normalized.includes('حوض')
  ) {
    return {
      vehicleType: 'pickup',
      bodyShape: currentShape && currentShape !== '---' ? currentShape : 'شاص غمارتين (حوض)'
    };
  }

  // 4. Check for SUV / Jeep
  if (
    normalized.includes('جيب') || 
    normalized.includes('suv') || 
    normalized.includes('لاندكروزر') || 
    normalized.includes('land cruiser') || 
    normalized.includes('برادو') || 
    normalized.includes('prado') || 
    normalized.includes('باترول') || 
    normalized.includes('patrol') || 
    normalized.includes('توسان') || 
    normalized.includes('tucson') || 
    normalized.includes('سنتافي') || 
    normalized.includes('santa fe') || 
    normalized.includes('راف فور') || 
    normalized.includes('rav4') || 
    normalized.includes('دفع رباعي') || 
    normalized.includes('فورشنر') || 
    normalized.includes('fortuner') || 
    normalized.includes('سبورتاج') || 
    normalized.includes('sportage') || 
    normalized.includes('باجيرو') || 
    normalized.includes('pajero')
  ) {
    return {
      vehicleType: 'suv',
      bodyShape: currentShape && currentShape !== '---' ? currentShape : 'جيب صالون مقفل (دفع رباعي)'
    };
  }

  // 5. Check for Truck / Heavy
  if (
    normalized.includes('شاحنة') || 
    normalized.includes('truck') || 
    normalized.includes('دينا') || 
    normalized.includes('dina') || 
    normalized.includes('ايسوزو') || 
    normalized.includes('isuzu') || 
    normalized.includes('قلاب') || 
    normalized.includes('تريلا') || 
    normalized.includes('قاطرة') || 
    normalized.includes('مرسيدس اكتروس') || 
    normalized.includes('actros') || 
    normalized.includes('مان') || 
    normalized.includes('man') || 
    normalized.includes('فولفو نقل') || 
    normalized.includes('صهريج') || 
    normalized.includes('وايت')
  ) {
    return {
      vehicleType: 'truck',
      bodyShape: currentShape && currentShape !== '---' ? currentShape : 'شاحنة نقل بضائع (صندوق مفتوح)'
    };
  }

  // 6. Check for Motorcycle
  if (
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
    return {
      vehicleType: 'motorcycle',
      bodyShape: currentShape && currentShape !== '---' ? currentShape : 'دراجة نارية عادية (عجلتين)'
    };
  }

  // 7. Check for Sedan / Car
  if (
    normalized.includes('كامري') || 
    normalized.includes('camry') || 
    normalized.includes('كورولا') || 
    normalized.includes('corolla') || 
    normalized.includes('سوناتا') || 
    normalized.includes('sonata') || 
    normalized.includes('النترا') || 
    normalized.includes('elantra') || 
    normalized.includes('اكسنت') || 
    normalized.includes('accent') || 
    normalized.includes('صالون') || 
    normalized.includes('سيدان') || 
    normalized.includes('sedan') || 
    normalized.includes('يارس') || 
    normalized.includes('yaris') || 
    normalized.includes('سيفيك') || 
    normalized.includes('civic') || 
    normalized.includes('اكورد') || 
    normalized.includes('accord') || 
    normalized.includes('مازدا') || 
    normalized.includes('mazda')
  ) {
    return {
      vehicleType: 'sedan',
      bodyShape: currentShape && currentShape !== '---' ? currentShape : 'صالون (سيدان 4 أبواب)'
    };
  }

  // Default fallback if already has valid type
  const fallbackType = currentType || 'sedan';
  const found = VEHICLE_BODY_OPTIONS.find(o => o.typeKey === fallbackType);
  return {
    vehicleType: fallbackType,
    bodyShape: currentShape && currentShape !== '---' ? currentShape : (found ? found.defaultShape : 'صالون (سيدان 4 أبواب)')
  };
}
