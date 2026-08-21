import React, { useState } from 'react';
import { 
  Search, 
  FileText, 
  Download, 
  Image as ImageIcon, 
  Printer, 
  Trash2, 
  Edit3, 
  Car, 
  ExternalLink,
  Filter,
  Plus
} from 'lucide-react';
import { VehicleRegistration, PlateCategory } from '../types';
import { PlateVisualizer } from './PlateVisualizer';

interface VehicleRegistryTableProps {
  records: VehicleRegistration[];
  onSelectRecord: (record: VehicleRegistration) => void;
  onEditRecord: (record: VehicleRegistration) => void;
  onDeleteRecord: (id: string) => void;
  onAddNew: () => void;
  onQuickExportPDF: (record: VehicleRegistration) => void;
  onQuickExportImage: (record: VehicleRegistration) => void;
  onLoadSamples: () => void;
}

export const VehicleRegistryTable: React.FC<VehicleRegistryTableProps> = ({
  records,
  onSelectRecord,
  onEditRecord,
  onDeleteRecord,
  onAddNew,
  onQuickExportPDF,
  onQuickExportImage,
  onLoadSamples,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredRecords = records.filter((rec) => {
    const matchesCategory = selectedCategory === 'all' || rec.plateCategory === selectedCategory;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesCategory;

    const matchesSearch = 
      rec.plateNumber?.toLowerCase().includes(term) ||
      rec.plateLetter?.toLowerCase().includes(term) ||
      rec.ownerFullName?.toLowerCase().includes(term) ||
      rec.make?.toLowerCase().includes(term) ||
      rec.model?.toLowerCase().includes(term) ||
      rec.vinNumber?.toLowerCase().includes(term) ||
      rec.governorate?.toLowerCase().includes(term) ||
      rec.registrationNumber?.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Search & Filter Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">سجل المركبات المرقمة والمحفوظة</h3>
            <p className="text-xs text-slate-500">
              إجمالي السجلات: <span className="font-bold text-slate-800">{records.length}</span> مركبة
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باللوحة، الشاصي، المالك..."
              className="w-full text-xs font-semibold pr-9 pl-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الأصناف</option>
            <option value="private">خصوصي</option>
            <option value="taxi">أجرة</option>
            <option value="commercial">نقل عام</option>
            <option value="government">حكومي</option>
            <option value="temporary">فحص مؤقت</option>
            <option value="motorcycle">دراجات</option>
          </select>

          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            ترقيم جديد
          </button>
        </div>
      </div>

      {/* Table Content */}
      {filteredRecords.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <Car className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-slate-700">لا توجد سجلات مطابقة للبحث</p>
          <p className="text-xs text-slate-500">
            يمكنك إضافة ترقيم مركبة جديدة أو استعادة القوالب التجريبية
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              type="button"
              onClick={onLoadSamples}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              استرجاع بيانات تجريبية جاهزة
            </button>
            <button
              type="button"
              onClick={onAddNew}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
            >
              إضافة مركبة الآن
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">لوحة المركبة</th>
                <th className="py-3 px-4">بيانات المركبة (الماركة / الموديل)</th>
                <th className="py-3 px-4">رقم الشاصي (VIN)</th>
                <th className="py-3 px-4">المالك والحائز</th>
                <th className="py-3 px-4">المحافظة والتاريخ</th>
                <th className="py-3 px-4 text-center">إجراءات واستخراج الاستمارة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-blue-50/40 transition">
                  {/* Plate Preview */}
                  <td className="py-3 px-4">
                    <div className="scale-90 origin-right">
                      <PlateVisualizer
                        plateNumber={rec.plateNumber}
                        plateLetter={rec.plateLetter}
                        plateCategory={rec.plateCategory}
                        country={rec.plateCountry}
                        governorate={rec.governorate}
                        size="sm"
                      />
                    </div>
                  </td>

                  {/* Vehicle Info */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-sm">
                      {rec.make} {rec.model}
                    </div>
                    <div className="text-slate-500 font-semibold text-[11px] mt-0.5">
                      موديل {rec.year} • لون {rec.color} • {rec.fuelType}
                    </div>
                  </td>

                  {/* VIN */}
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {rec.vinNumber}
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      قيد: {rec.registrationNumber}
                    </div>
                  </td>

                  {/* Owner */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{rec.ownerFullName}</div>
                    <div className="text-slate-500 text-[11px] font-mono">{rec.ownerPhone}</div>
                  </td>

                  {/* Governorate & Date */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-blue-900">{rec.governorate}</div>
                    <div className="text-slate-500 text-[10px]">{rec.issueDate}</div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Open Full A4 View */}
                      <button
                        type="button"
                        onClick={() => onSelectRecord(rec)}
                        title="عرض ومعاينة استمارة A4"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        استمارة A4
                      </button>

                      {/* PDF Quick Export */}
                      <button
                        type="button"
                        onClick={() => onQuickExportPDF(rec)}
                        title="تصدير وتحميل PDF A4"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Image Quick Export */}
                      <button
                        type="button"
                        onClick={() => onQuickExportImage(rec)}
                        title="تصدير كصورة A4"
                        className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEditRecord(rec)}
                        title="تعديل البيانات"
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف سجل ترقيم المركبة (${rec.plateNumber} ${rec.plateLetter})؟`)) {
                            onDeleteRecord(rec.id);
                          }
                        }}
                        title="حذف من السجل"
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
