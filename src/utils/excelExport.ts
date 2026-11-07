import * as XLSX from 'xlsx';
import { VehicleRegistration, PlateCategory } from '../types';

const categoryArabicNames: Record<PlateCategory | string, string> = {
  private: 'خصوصي',
  taxi: 'أجرة',
  commercial: 'نقل عام / تجاري',
  government: 'حكومي',
  temporary: 'فحص مؤقت',
  diplomatic: 'دبلوماسي',
  motorcycle: 'دراجة نارية',
};

const fuelArabicNames: Record<string, string> = {
  petrol: 'بترول (بنزين)',
  diesel: 'ديزل',
  hybrid: 'هجين (هايبرد)',
  electric: 'كهربائي',
  gas: 'غاز',
};

/**
 * Clean plate digits
 */
function cleanDigits(val?: string): string {
  if (!val) return '';
  return val.replace(/[^\d]/g, '');
}

/**
 * Export a single vehicle registration form to an organized Excel spreadsheet
 */
export function exportSingleRegistrationToExcel(record: VehicleRegistration) {
  const wb = XLSX.utils.book_new();

  const categoryName = categoryArabicNames[record.plateCategory] || record.plateCategory;
  const fuelName = fuelArabicNames[record.fuelType] || record.fuelType;

  // Detailed sheet data formatted in two columns (الحقل / القيمة) with official header
  const rows: Array<[string, string | number]> = [
    ['الجمهورية اليمنية - وزارة الداخلية - الإدارة العامة للمرور تعز', 'لجنة ترقيم الجمارك'],
    ['بيان استمارة ترقيم وتسجيل مركبة جمركية رسمية', ''],
    ['', ''],
    ['=== بيانات الاستمارة والقيد ===', ''],
    ['رقم القيد / المعاملة', record.registrationNumber || ''],
    ['رقم الاستمارة', record.formNumber || record.customsDeclarationNumber || 'C2006'],
    ['تاريخ الإصدار', record.issueDate || ''],
    ['تاريخ الانتهاء', record.expiryDate || ''],
    ['دائرة المرور', record.trafficDepartment || 'إدارة مرور محافظة تعز'],
    ['المحافظة', record.governorate || 'تعز'],
    ['', ''],
    ['=== بيانات اللوحة المعدنية ===', ''],
    ['رقم اللوحة', cleanDigits(record.plateNumber)],
    ['حرف اللوحة / البادئة', record.plateLetter || ''],
    ['رمز أو رقم المحافظة', record.platePrefix || '4'],
    ['نوع وفئة الترقيم', categoryName],
    ['الدولة', record.plateCountry || 'الجمهورية اليمنية'],
    ['', ''],
    ['=== بيانات مالك المركبة ===', ''],
    ['الاسم الرباعي واللقب', record.ownerFullName || ''],
    ['الرقم الوطني / رقم الهوية', record.ownerNationalId || ''],
    ['رقم الهاتف والتواصل', record.ownerPhone || ''],
    ['العنوان ومحل الإقامة', record.ownerAddress || ''],
    ['صفة المالك', record.ownerType === 'company' ? 'شركة / منشأة' : record.ownerType === 'government' ? 'جهة حكومية' : 'فرد / مواطن'],
    ['مكان وتاريخ إصدار الهوية', record.ownerIdIssuePlace || 'تعز'],
    ['فصيلة الدم', record.ownerBloodType || ''],
    ['', ''],
    ['=== المواصفات الفنية للمركبة ===', ''],
    ['الشركة الصانعة (الماركة)', record.make || ''],
    ['نوع المركبة (الموديل التجاري)', record.model || ''],
    ['الطراز الفرعي (Trim)', record.vehicleModelTrim || ''],
    ['شكل الهيكل المعتمد', record.vehicleBodyShape || ''],
    ['سنة الصنع (الموديل)', record.year || ''],
    ['رقم الهيكل / القاعدة (VIN)', record.vinNumber || ''],
    ['رقم المحرك (Engine No)', record.engineNumber || ''],
    ['اللون الأساسي', record.color || ''],
    ['اللون الثانوي', record.secondaryColor || ''],
    ['نوع الوقود', fuelName],
    ['سعة المحرك (CC)', record.engineCapacity || ''],
    ['عدد الأسطوانات', record.cylindersCount || ''],
    ['عدد المقاعد / الركاب', record.seatingCapacity || ''],
    ['الحمولة المصرح بها (كغ)', record.loadCapacityKg || ''],
    ['بلد المنشأ والتصنيع', record.originCountry || ''],
    ['', ''],
    ['=== بيانات البيان الجمركي ===', ''],
    ['رقم البيان الجمركي', record.customsDeclarationNumber || record.formNumber || ''],
    ['تاريخ البيان الجمركي', record.customsDeclarationDate || record.issueDate || ''],
    ['جهة / منفذ إصدار البيان', record.customsIssuingOffice || record.governorate || 'جمرك تعز'],
    ['', ''],
    ['=== بيانات المعرّفين والشهود (الضمانة) ===', ''],
    ['اسم المعرّف الأول (الضامن)', record.guarantor1?.fullName || ''],
    ['الرقم الوطني للمعرّف الأول', record.guarantor1?.nationalId || ''],
    ['هاتف المعرّف الأول', record.guarantor1?.phone || ''],
    ['عنوان المعرّف الأول', record.guarantor1?.address || ''],
    ['اسم المعرّف الثاني (الشاهد)', record.guarantor2?.fullName || ''],
    ['الرقم الوطني للمعرّف الثاني', record.guarantor2?.nationalId || ''],
    ['هاتف المعرّف الثاني', record.guarantor2?.phone || ''],
    ['عنوان المعرّف الثاني', record.guarantor2?.address || ''],
    ['', ''],
    ['=== الفحص الفني والرسوم والاعتماد ===', ''],
    ['حالة الفحص الفني', record.inspectionStatus === 'passed' ? 'مطابق ولائق فنياً (ناجح)' : 'معفي'],
    ['تاريخ الفحص الفني', record.inspectionDate || record.issueDate || ''],
    ['مركز الفحص الدوري', record.inspectionCenter || 'مركز الفحص الفني تعز'],
    ['رقم إيصال الرسوم', record.feeReceiptNumber || ''],
    ['إجمالي الرسوم المدفوعة', `${record.totalFeesPaid || 0} ${record.currency || 'ريال يمني'}`],
    ['اسم الضابط / رئيس اللجنة', record.officerName || 'المقدم / صادق القاضي'],
    ['ملاحظات إضافية', record.notes || ''],
    ['تاريخ التوثيق في النظام', record.createdAt || new Date().toISOString()],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 35 }, // Column A
    { wch: 45 }, // Column B
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'بيانات الاستمارة');

  // File name
  const safePlate = cleanDigits(record.plateNumber) || 'استمارة';
  const safeModel = (record.model || 'مركبة').replace(/[\/\\?%*:|"<>]/g, '_');
  const fileName = `استمارة_ترقيم_${safePlate}_${safeModel}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * Export multiple records from the registry table to a single structured Excel file
 */
export function exportAllRegistrationsToExcel(records: VehicleRegistration[], customFileName?: string) {
  const wb = XLSX.utils.book_new();

  const excelRows = records.map((rec, index) => {
    return {
      'ت': index + 1,
      'رقم الاستمارة': rec.formNumber || rec.customsDeclarationNumber || 'C2006',
      'رقم القيد': rec.registrationNumber || '',
      'رقم اللوحة': cleanDigits(rec.plateNumber),
      'حرف اللوحة': rec.plateLetter || '',
      'رمز المحافظة': rec.platePrefix || '4',
      'الصنف': categoryArabicNames[rec.plateCategory] || rec.plateCategory,
      'الماركة': rec.make || '',
      'نوع المركبة (الموديل)': rec.model || '',
      'الطراز الفرعي': rec.vehicleModelTrim || '',
      'سنة الصنع': rec.year || '',
      'رقم الشاصي (VIN)': rec.vinNumber || '',
      'رقم المحرك (Engine No)': rec.engineNumber || '',
      'اللون': rec.color || '',
      'نوع الوقود': fuelArabicNames[rec.fuelType] || rec.fuelType,
      'سعة المحرك': rec.engineCapacity || '',
      'السلندرات': rec.cylindersCount || '',
      'شكل الهيكل': rec.vehicleBodyShape || '',
      'رقم البيان الجمركي': rec.customsDeclarationNumber || '',
      'تاريخ البيان الجمركي': rec.customsDeclarationDate || '',
      'جهة إصدار البيان': rec.customsIssuingOffice || '',
      'اسم المالك': rec.ownerFullName || '',
      'الرقم الوطني': rec.ownerNationalId || '',
      'هاتف المالك': rec.ownerPhone || '',
      'عنوان المالك': rec.ownerAddress || '',
      'اسم المعرّف الأول': rec.guarantor1?.fullName || '',
      'هاتف المعرّف الأول': rec.guarantor1?.phone || '',
      'اسم المعرّف الثاني': rec.guarantor2?.fullName || '',
      'هاتف المعرّف الثاني': rec.guarantor2?.phone || '',
      'تاريخ الإصدار': rec.issueDate || '',
      'الرسوم المدفوعة': rec.totalFeesPaid || 0,
      'العملة': rec.currency || 'ريال يمني',
      'رئيس اللجنة': rec.officerName || 'المقدم / صادق القاضي',
      'تاريخ التسجيل': rec.createdAt ? rec.createdAt.slice(0, 10) : '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(excelRows);

  // Set generous column widths
  ws['!cols'] = [
    { wch: 6 },  // ت
    { wch: 14 }, // رقم الاستمارة
    { wch: 18 }, // رقم القيد
    { wch: 12 }, // رقم اللوحة
    { wch: 10 }, // حرف اللوحة
    { wch: 12 }, // رمز المحافظة
    { wch: 14 }, // الصنف
    { wch: 16 }, // الماركة
    { wch: 16 }, // نوع المركبة
    { wch: 16 }, // الطراز الفرعي
    { wch: 10 }, // سنة الصنع
    { wch: 22 }, // رقم الشاصي
    { wch: 16 }, // رقم المحرك
    { wch: 12 }, // اللون
    { wch: 14 }, // نوع الوقود
    { wch: 12 }, // سعة المحرك
    { wch: 10 }, // السلندرات
    { wch: 22 }, // شكل الهيكل
    { wch: 18 }, // رقم البيان
    { wch: 14 }, // تاريخ البيان
    { wch: 14 }, // جهة البيان
    { wch: 24 }, // اسم المالك
    { wch: 16 }, // الرقم الوطني
    { wch: 14 }, // هاتف المالك
    { wch: 22 }, // عنوان المالك
    { wch: 20 }, // اسم المعرف 1
    { wch: 14 }, // هاتف المعرف 1
    { wch: 20 }, // اسم المعرف 2
    { wch: 14 }, // هاتف المعرف 2
    { wch: 12 }, // تاريخ الإصدار
    { wch: 14 }, // الرسوم
    { wch: 12 }, // العملة
    { wch: 20 }, // رئيس اللجنة
    { wch: 14 }, // تاريخ التسجيل
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'سجل ترقيم المركبات');

  const todayStr = new Date().toISOString().slice(0, 10);
  const fileName = customFileName || `سجل_ترقيم_المركبات_جمارك_تعز_${todayStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
