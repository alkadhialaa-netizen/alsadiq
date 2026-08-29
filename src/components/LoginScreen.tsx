import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  Car, 
  Eye, 
  EyeOff,
  UserCheck,
  Building2,
  FileCheck,
  FileCode2
} from 'lucide-react';
import { UserAccount } from '../types';
import { authenticateUser, getAllUsers } from '../utils/authService';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('صادق');
  const [password, setPassword] = useState<string>('صادق');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const availableUsers = getAllUsers();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateUser(username, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.message || 'فشل تسجيل الدخول، تأكد من صحة البيانات المسجلة في ملف المستخدمين.');
      }
    }, 250);
  };

  const handleQuickSelectUser = (u: UserAccount) => {
    setUsername(u.username);
    setPassword(u.password);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white" dir="rtl">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-700/30">
        
        {/* Right Info Panel (Official Department Card) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Coat of Arms background watermark */}
          <div className="space-y-6 relative z-10">
            {/* Eagle Emblem & Title */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black text-2xl">
                🦅
              </div>
              <div>
                <span className="text-[11px] text-amber-300 font-bold tracking-wider block">
                  الجمهورية اليمنية • وزارة الداخلية
                </span>
                <h1 className="text-base font-black tracking-tight text-white">
                  الإدارة العامة للمرور - تعز
                </h1>
                <span className="text-[11px] text-sky-300 font-bold block">
                  لجنة ترقيم الجمارك
                </span>
                <span className="text-[10px] text-amber-200/90 font-medium block">
                  رئيس اللجنة: المقدم / صادق القاضي
                </span>
              </div>
            </div>

            {/* System Info Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>بوابة الدخول الرسمية والمصادقة الأمنية</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                نظام إصدار وتوثيق استمارات فحص وترقيم المركبات - إدارة مرور محافظة تعز.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <FileCode2 className="w-3.5 h-3.5 text-sky-400" />
                  قاعدة البيانات: users.json
                </span>
                <span className="text-emerald-400 font-mono font-bold">● نظام آمن</span>
              </div>
            </div>

            {/* Quick Feature Highlights */}
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>إصدار استمارة ترقيم قياس A4 (خصوصي أزرق / نقل أحمر)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>التقاط وإرفاق صور اللوحات والبيان الجمركي</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>طباعة وتصدير عالي الدقة بصيغة PDF و PNG</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-[10.5px] text-slate-300 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-amber-300 font-bold">مصمم ومطور النظام:</span>
              <span className="font-bold text-white">المهندس / علان القاضي</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>الإصدار 2.5 - تعز</span>
              <span className="font-mono">Taiz Traffic Authority</span>
            </div>
          </div>
        </div>

        {/* Left Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div className="space-y-6">
            
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-black mb-2 border border-blue-200">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                تسجيل دخول الموظف المختص
              </div>
              <h2 className="text-xl font-black text-slate-900">
                تسجيل الدخول للنظام
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                أدخل اسم المستخدم وكلمة المرور المسجلة في ملف المستخدمين (JSON) للمتابعة
              </p>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs animate-shake">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="font-bold">
                  <span>خطأ في المصادقة: </span>
                  <span className="font-normal">{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  اسم المستخدم (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثال: صادق أو admin"
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-semibold text-slate-900 transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black text-slate-700">
                    كلمة المرور (Password)
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-mono text-slate-900 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'جاري التحقق من بيانات الدخول...' : 'تسجيل الدخول للنظام'}</span>
              </button>
            </form>

            {/* Quick Demo Accounts Selector (for seamless testing) */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 block">
                حسابات مسجلة في ملف JSON (انقر للدخول السريع):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickSelectUser(u)}
                    className={`p-2 rounded-xl border text-right transition cursor-pointer text-xs ${
                      username === u.username
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="font-black text-slate-900 truncate">
                      {u.fullName.split(' ')[0]} {u.fullName.split(' ')[1] || ''}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                      <span>{u.rank || u.role}</span>
                      <span className="font-mono text-blue-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                        {u.username}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="text-center pt-4 text-[11px] text-slate-500 font-medium">
            الإدارة العامة للمرور تعز • لجنة ترقيم الجمارك • مصمم النظام: المهندس / علاء القاضي
          </div>
        </div>

      </div>
    </div>
  );
};
