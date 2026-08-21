export type PlateCategory = 
  | 'private'      // خصوصي
  | 'taxi'         // أجرة
  | 'commercial'   // نقل عام / تجاري
  | 'government'   // حكومي
  | 'temporary'    // فحص مؤقت / مؤقت
  | 'diplomatic'   // دبلوماسي
  | 'motorcycle';  // دراجة نارية

export type VehicleType = 
  | 'sedan'       // صالون / سيدان
  | 'suv'         // جيب / دفع رباعي
  | 'pickup'      // بيك أب / ونيت
  | 'van'         // باص صغير / فان
  | 'bus'         // حافلة / باص كبير
  | 'truck'       // شاحنة / قاطرة
  | 'motorcycle'  // دراجة نارية
  | 'trailer';    // مقطورة

export type FuelType = 
  | 'petrol'      // بنزين
  | 'diesel'      // ديزل
  | 'hybrid'      // هجين (هايبرد)
  | 'electric'    // كهربائي
  | 'gas';        // غاز طبيعي (CNG/LPG)

export interface GuarantorInfo {
  fullName: string;          // اسم المعرّف / الضامن الرباعي
  nationalId: string;        // الرقم الوطني / رقم الهوية
  phone: string;             // رقم الهاتف
  address?: string;          // عنوان السكن
  relationship?: string;     // صلة القرابة أو المعرفة
  idCardPhoto?: string;      // صورة بطاقة المعرف
}

export interface VehicleRegistration {
  id: string;
  registrationNumber: string; // رقم المعاملة / رقم القيد
  serialNumber?: string;      // رقم تسلسلي (مثلاً REG-4843)
  formNumber?: string;        // رقم الاستمارة (مثلاً C2006)
  issueDate: string;          // تاريخ الإصدار
  expiryDate: string;         // تاريخ الانتهاء
  trafficDepartment: string;  // دائرة المرور / الإدارة العامة للمرور
  governorate: string;        // المحافظة / المدينة

  // Plate Details
  plateNumber: string;        // رقم اللوحة (مثلاً 68742)
  platePrefix?: string;       // رمز أو رقم المحافظة/الصنف (مثلاً 4)
  plateLetter: string;        // حرف اللوحة أو نوعها
  plateCategory: PlateCategory; // نوع الترقيم
  plateCountry: string;       // اسم الدولة (مثلاً الجمهورية اليمنية)

  // Vehicle Technical Data
  make: string;               // الماركة (هونداي، تويوتا...)
  model: string;              // الطراز / النوع
  vehicleModelTrim?: string;  // الطراز الفرعي
  vehicleBodyShape?: string;  // الشكل
  year: number;               // سنة الصنع
  color: string;              // اللون
  secondaryColor?: string;    // لون ثانوي
  vinNumber: string;          // رقم القاعدة / الشاصي VIN (17 خانة)
  engineNumber: string;       // رقم المحرك
  vehicleType: VehicleType;   // نوع المركبة
  fuelType: FuelType;         // نوع الوقود (بترول، ديزل...)
  engineCapacity: string;     // سعة المحرك
  cylindersCount: number;     // عدد الأسطوانات
  seatingCapacity: number;    // عدد المقاعد
  loadCapacityKg: number;     // الحمولة المصرح بها (كغ)
  originCountry: string;      // بلد المنشأ
  customsDeclarationNumber?: string; // رقم البيان الجمركي
  customsIssuingOffice?: string;     // جهة إصدار البيان (مثلاً تعز)

  // Owner Details
  ownerFullName: string;      // الاسم الرباعي
  ownerNationalId: string;    // رقم الهوية
  ownerPhone: string;         // رقم الهاتف
  ownerAddress: string;       // العنوان الحالي
  ownerBirthDate?: string;    // تاريخ الميلاد
  ownerBloodType?: string;    // فصيلة الدم (A+, B+, O+...)
  ownerIdType?: string;       // نوع الهوية (بطاقة شخصية، جواز...)
  ownerIdIssuePlace?: string; // مكان الإصدار
  ownerType: 'individual' | 'company' | 'government'; // صفة المالك
  ownerPhoto?: string;        // صورة المالك الشخصية 4x6
  ownerIdCardPhoto?: string;  // صورة بطاقة هوية المالك

  // Vehicle Documents & Photos
  vehicleCustomsPhoto?: string; // صورة البيان الجمركي
  vehiclePlatePhoto?: string;   // صورة اللوحة

  // Guarantors / Identifiers (المعرّفون)
  guarantor1?: GuarantorInfo;   // بيانات المعرّف الأول
  guarantor2?: GuarantorInfo;   // بيانات المعرّف الثاني

  // Inspection & Financial
  inspectionStatus: 'passed' | 'conditional' | 'exempt'; // الفحص الفني
  inspectionDate: string;     // تاريخ الفحص الفني
  inspectionCenter: string;   // مركز الفحص الدوري
  feeReceiptNumber: string;   // رقم إيصال الرسوم
  totalFeesPaid: number;      // الرسوم المدفوعة
  currency: string;           // العملة (ريال يمني، د.ع، ر.س...)
  officerName: string;        // اسم الضابط / الموظف المختص
  notes?: string;             // ملاحظات إضافية

  createdAt: string;
  updatedAt: string;
}

export interface SystemSettings {
  defaultCountry: string;
  defaultTrafficDepartment: string;
  defaultGovernorate: string;
  currency: string;
  officialSealText: string;
}
