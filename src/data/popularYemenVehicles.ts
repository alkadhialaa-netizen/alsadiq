// Popular vehicle models in Yemen for Traffic Department & Customs Registration
// يشمل الأنواع الأكثر انتشاراً في اليمن: توسان، برادو، تريوس، شاص، هيلوكس، إلخ.

export interface PopularVehicle {
  name: string;              // نوع المركبة بالعربي (توسان، برادو، تريوس، شاص، هيلوكس...)
  nameEn: string;            // English name
  make: string;              // الشركة الصانعة (الماركة)
  model: string;             // الموديل / الاسم التجاري
  vehicleType: string;       // صنف المركبة (suv, pickup, sedan, van, etc.)
  vehicleBodyShape: string;  // شكل الهيكل المعتمد في المرور اليمني
  defaultTrim?: string;      // الطراز الفرعي
  category: 'private' | 'commercial';
  fuelType: 'petrol' | 'diesel';
  engineCapacity?: string;
  cylindersCount?: number;
  icon: string;              // Emoji for UI
  description: string;
}

export const POPULAR_YEMEN_VEHICLES: PopularVehicle[] = [
  {
    name: 'توسان',
    nameEn: 'Tucson',
    make: 'هيونداي (Hyundai)',
    model: 'توسان',
    vehicleType: 'suv',
    vehicleBodyShape: 'جيب صالون مقفل (دفع رباعي)',
    defaultTrim: 'GLS أوتوماتيك',
    category: 'private',
    fuelType: 'petrol',
    engineCapacity: '2000 cc',
    cylindersCount: 4,
    icon: '🚙',
    description: 'هيونداي توسان - جيب مقفل دفع رباعي / كروس أوفر'
  },
  {
    name: 'برادو',
    nameEn: 'Prado',
    make: 'تويوتا (Toyota)',
    model: 'برادو',
    vehicleType: 'suv',
    vehicleBodyShape: 'جيب صالون مقفل (دفع رباعي)',
    defaultTrim: 'TXL دبل 4x4',
    category: 'private',
    fuelType: 'petrol',
    engineCapacity: '2700 cc',
    cylindersCount: 4,
    icon: '🚙',
    description: 'تويوتا برادو - جيب صالون مقفل دفع رباعي'
  },
  {
    name: 'تريوس',
    nameEn: 'Terios',
    make: 'دايهاتسو (Daihatsu)',
    model: 'تريوس',
    vehicleType: 'suv',
    vehicleBodyShape: 'جيب مدمج دفع رباعي',
    defaultTrim: '4WD مدمج',
    category: 'private',
    fuelType: 'petrol',
    engineCapacity: '1500 cc',
    cylindersCount: 4,
    icon: '🚙',
    description: 'دايهاتسو تريوس - جيب صغير مدمج دفع رباعي'
  },
  {
    name: 'شاص',
    nameEn: 'Land Cruiser 70 (Shas)',
    make: 'تويوتا (Toyota)',
    model: 'شاص',
    vehicleType: 'pickup',
    vehicleBodyShape: 'شاص غمارتين (حوض)',
    defaultTrim: 'دبل 4x4 ونش',
    category: 'commercial',
    fuelType: 'petrol',
    engineCapacity: '4000 cc',
    cylindersCount: 6,
    icon: '🛻',
    description: 'تويوتا شاص - بيك أب حوض دفع رباعي'
  },
  {
    name: 'هيلوكس',
    nameEn: 'Hilux',
    make: 'تويوتا (Toyota)',
    model: 'هيلوكس',
    vehicleType: 'pickup',
    vehicleBodyShape: 'بيك أب غمارتين (حوض مزدوج)',
    defaultTrim: 'GLX دبل',
    category: 'private',
    fuelType: 'petrol',
    engineCapacity: '2700 cc',
    cylindersCount: 4,
    icon: '🛻',
    description: 'تويوتا هيلوكس - بيك أب غمارتين حوض'
  },
  {
    name: 'سنتافي',
    nameEn: 'Santa Fe',
    make: 'هيونداي (Hyundai)',
    model: 'سنتافي',
    vehicleType: 'suv',
    vehicleBodyShape: 'جيب صالون مقفل (دفع رباعي)',
    defaultTrim: 'V6 دبل',
    category: 'private',
    fuelType: 'petrol',
    engineCapacity: '3300 cc',
    cylindersCount: 6,
    icon: '🚙',
    description: 'هيونداي سنتافي - جيب عائلي 7 ركاب دفع رباعي'
  },
  {
    name: 'لاند كروزر',
    nameEn: 'Land Cruiser',
    make: 'تويوتا (Toyota)',
    model: 'لاند كروزر',
    vehicleType: 'suv',
    vehicleBodyShape: 'جيب صالون مقفل (دفع رباعي)',
    defaultTrim: 'VXR V8',
    category: 'private',
    fuelType: 'petrol',
    engineCapacity: '4600 cc',
    cylindersCount: 8,
    icon: '🚙',
    description: 'تويوتا لاند كروزر - صالون جيب كبير دفع رباعي'
  },
  {
    name: 'باص H1',
    nameEn: 'H1 Van',
    make: 'هيونداي (Hyundai)',
    model: 'باص H1',
    vehicleType: 'van',
    vehicleBodyShape: 'باص مقفل (ركاب / فان)',
    defaultTrim: '12 راكب ركاب',
    category: 'private',
    fuelType: 'petrol',
    engineCapacity: '2400 cc',
    cylindersCount: 4,
    icon: '🚐',
    description: 'هيونداي باص H1 - باص مقفل ركاب'
  },
  {
    name: 'كورولا',
    nameEn: 'Corolla',
    make: 'تويوتا (Toyota)',
    model: 'كورولا',
    vehicleType: 'sedan',
    vehicleBodyShape: 'صالون (سيدان 4 أبواب)',
    defaultTrim: 'GLI أوتوماتيك',
    category: 'private',
    fuelType: 'petrol',
    engineCapacity: '1800 cc',
    cylindersCount: 4,
    icon: '🚗',
    description: 'تويوتا كورولا - صالون 4 أبواب'
  },
  {
    name: 'كامري',
    nameEn: 'Camry',
    make: 'تويوتا (Toyota)',
    model: 'كامري',
    vehicleType: 'sedan',
    vehicleBodyShape: 'صالون (سيدان 4 أبواب)',
    defaultTrim: 'XLE أوتوماتيك',
    category: 'private',
    fuelType: 'petrol',
    engineCapacity: '2500 cc',
    cylindersCount: 4,
    icon: '🚗',
    description: 'تويوتا كامري - صالون سيدان متوسط'
  },
  {
    name: 'دباب',
    nameEn: 'Dabab / Hijet',
    make: 'دايهاتسو (Daihatsu)',
    model: 'دباب',
    vehicleType: 'van',
    vehicleBodyShape: 'باص صغير 7 ركاب (دباب)',
    defaultTrim: 'عادي ميني',
    category: 'commercial',
    fuelType: 'petrol',
    engineCapacity: '1000 cc',
    cylindersCount: 3,
    icon: '🚐',
    description: 'دايهاتسو دباب - باص نقل صغير أو بضائع'
  },
];

// Helper to deduce vehicle name/model
export function resolveVehicleTypeName(model?: string, vehicleType?: string): string {
  const m = model?.trim();
  if (m && m !== '---') {
    return m;
  }
  const v = vehicleType?.trim();
  if (v && v !== '---') {
    const map: Record<string, string> = {
      van: 'باص',
      sedan: 'صالون',
      suv: 'جيب',
      pickup: 'بيك أب',
      bus: 'حافلة',
      truck: 'شاحنة',
      motorcycle: 'دراجة نارية',
      trailer: 'مقطورة',
    };
    return map[v] || v;
  }
  return 'توسان';
}
