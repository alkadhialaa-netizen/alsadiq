import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Key, 
  Trash2, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  X, 
  Check, 
  AlertCircle,
  Building,
  BadgeCheck,
  Phone,
  MapPin,
  FileCode2,
  FileDown
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { 
  getAllUsers, 
  addUser, 
  updateUser, 
  deleteUser, 
  exportUsersJSON, 
  resetUsersToDefault 
} from '../utils/authService';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [users, setUsers] = useState<UserAccount[]>(() => getAllUsers());
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('123');
  const [newFullName, setNewFullName] = useState('');
  const [newRank, setNewRank] = useState('ملازم أول / ضابط ترقيم');
  const [newRole, setNewRole] = useState<UserRole>('officer');
  const [newDepartment, setNewDepartment] = useState('إدارة ترقيم وفحص المركبات');
  const [newGovernorate, setNewGovernorate] = useState('صنعاء');
  const [newBadge, setNewBadge] = useState('');
  const [newPhone, setNewPhone] = useState('');

  if (!isOpen) return null;

  const refreshList = () => {
    setUsers(getAllUsers());
  };

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim() || !newFullName.trim()) {
      showFeedback('يرجى تعبئة جميع الحقول المطلوبة (اسم المستخدم، كلمة المرور، الاسم الكامل)', 'error');
      return;
    }

    const res = addUser({
      username: newUsername,
      password: newPassword,
      fullName: newFullName,
      rank: newRank,
      role: newRole,
      department: newDepartment,
      governorate: newGovernorate,
      badgeNumber: newBadge,
      phone: newPhone,
      isActive: true,
    });

    if (res.success) {
      showFeedback(`تم إضافة الموظف (${newFullName}) بنجاح إلى ملف JSON`, 'success');
      refreshList();
      setIsAdding(false);
      setNewUsername('');
      setNewFullName('');
      setNewBadge('');
      setNewPhone('');
    } else {
      showFeedback(res.message || 'فشل إضافة المستخدم', 'error');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف حساب الموظف (${name})؟`)) {
      const res = deleteUser(id);
      if (res.success) {
        showFeedback(`تم حذف حساب الموظف (${name}) من ملف JSON`, 'success');
        refreshList();
      } else {
        showFeedback(res.message || 'فشل حذف الحساب', 'error');
      }
    }
  };

  const handleToggleActive = (user: UserAccount) => {
    updateUser(user.id, { isActive: !user.isActive });
    refreshList();
    showFeedback(`تم تحديث حالة حساب (${user.fullName})`, 'success');
  };

  const handleResetDefaults = () => {
    if (confirm('هل تريد استعادة قائمة المستخدمين الافتراضية الأصلية؟')) {
      resetUsersToDefault();
      refreshList();
      showFeedback('تمت استعادة المستخدمين الافتراضيين بنجاح', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black">إدارة المستخدمين وضباط الترقيم</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  users.json
                </span>
              </div>
              <p className="text-xs text-slate-400">
                إدارة حسابات الموظفين والضباط المخولين بإصدار وتوثيق استمارات اللوحات
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div className={`p-3 text-xs font-bold flex items-center justify-between px-6 ${
            message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Top Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isAdding ? 'إلغاء الإضافة' : 'إضافة موظف / ضابط جديد'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportUsersJSON}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition cursor-pointer"
                title="تصدير ملف users.json"
              >
                <FileDown className="w-4 h-4 text-sky-600" />
                <span>تصدير ملف users.json</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer"
                title="استعادة الحسابات الافتراضية"
              >
                <RotateCcw className="w-4 h-4" />
                <span>استعادة الافتراضي</span>
              </button>
            </div>
          </div>

          {/* Add User Form Section (Collapsible) */}
          {isAdding && (
            <form onSubmit={handleCreateUser} className="p-4 bg-blue-50/70 border-2 border-blue-200 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                <span className="font-black text-sm text-blue-950 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-blue-700" />
                  تسجيل حساب موظف جديد
                </span>
                <span className="text-[11px] text-blue-700">سيتم حفظ الحساب فورياً في قاعدة JSON</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم المستخدم (Username) *</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="مثال: officer2"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">كلمة المرور *</label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الاسم الرباعي واللقب *</label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="الاسم الكامل للضابط أو الموظف"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرتبة / المسمى الوظيفي</label>
                  <input
                    type="text"
                    value={newRank}
                    onChange={(e) => setNewRank(e.target.value)}
                    placeholder="نقيب / ملازم / مهندس فاحص"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الصلاحية (Role)</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="officer">ضابط ترقيم (إصدار استمارات)</option>
                    <option value="inspector">فاحص فني (فحص ومطابقة)</option>
                    <option value="admin">مدير النظام (كامل الصلاحيات)</option>
                    <option value="clerk">موظف إدخال قيد</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المحافظة</label>
                  <input
                    type="text"
                    value={newGovernorate}
                    onChange={(e) => setNewGovernorate(e.target.value)}
                    placeholder="صنعاء / الحديدة / تعز..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرقم العسكري / الوظيفي</label>
                  <input
                    type="text"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    placeholder="TRQ-8821"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="77xxxxxxx"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الإدارة / القسم</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="لجنة ترقيم المركبات"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  حفظ الموظف في JSON
                </button>
              </div>
            </form>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                <tr>
                  <th className="p-3">الموظف / الضابط</th>
                  <th className="p-3">اسم الدخول</th>
                  <th className="p-3">كلمة المرور</th>
                  <th className="p-3">الصلاحية والموقع</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <div className="font-black text-slate-900 flex items-center gap-1.5">
                          <span>{u.fullName}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">
                              أنت (الحالي)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{u.rank}</span>
                          {u.badgeNumber && <span>• الرقم: {u.badgeNumber}</span>}
                        </div>
                      </td>

                      <td className="p-3 font-mono font-bold text-blue-900">
                        {u.username}
                      </td>

                      <td className="p-3 font-mono text-slate-600">
                        {u.password}
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'officer'
                            ? 'bg-blue-100 text-blue-800'
                            : u.role === 'inspector'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {u.role === 'admin' ? 'مدير عام' : u.role === 'officer' ? 'ضابط ترقيم' : u.role === 'inspector' ? 'فاحص فني' : 'مدخل بيانات'}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {u.governorate} • {u.department}
                        </div>
                      </td>

                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                            u.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {u.isActive ? 'مفعل نشط' : 'موقوف'}
                        </button>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          disabled={isCurrent}
                          onClick={() => handleDelete(u.id, u.fullName)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isCurrent ? 'لا يمكنك حذف حسابك الحالي' : 'حذف الموظف'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>يتم التحقق من بيانات الدخول من ملف users.json عند كل عملية دخول</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
