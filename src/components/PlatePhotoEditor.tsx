import React, { useRef, useState } from 'react';
import {
  Camera,
  Upload,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Trash2,
  Move,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { VehicleRegistration } from '../types';

/**
 * Physically rotates a base64 image by 90, -90, or 180 degrees on a canvas
 * so portrait photos of horizontal license plates become true landscape images.
 */
export function rotateBase64Image(
  dataUrl: string,
  degrees: 90 | -90 | 180
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      if (degrees === 90 || degrees === -90) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Compress uploaded image to reasonable size for localStorage while keeping high clarity
 */
export function preparePlateImageFile(file: File, maxDim = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = e.target?.result as string;
      if (!raw) {
        reject(new Error('Empty file'));
        return;
      }
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } else {
          resolve(raw);
        }
      };
      img.onerror = () => resolve(raw);
      img.src = raw;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

interface PlatePhotoEditorProps {
  data: VehicleRegistration;
  onChange: (updated: VehicleRegistration) => void;
  onOpenCameraModal?: () => void;
  onNotify?: (msg: string) => void;
  compact?: boolean;
}

export const PlatePhotoEditor: React.FC<PlatePhotoEditorProps> = ({
  data,
  onChange,
  onOpenCameraModal,
  onNotify,
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startX: number; startY: number }>({
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
  });

  const rotation = data.platePhotoRotation ?? 0;
  const scale = data.platePhotoScale ?? 1;
  const fitMode = data.platePhotoFit ?? 'fill';
  const offsetX = data.platePhotoOffsetX ?? 0;
  const offsetY = data.platePhotoOffsetY ?? 0;

  const updatePlatePhotoData = (patch: Partial<VehicleRegistration>) => {
    onChange({
      ...data,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const prepared = await preparePlateImageFile(file);
      updatePlatePhotoData({
        vehiclePlatePhoto: prepared,
        platePhotoRotation: 0,
        platePhotoScale: 1,
        platePhotoFit: 'fill',
        platePhotoOffsetX: 0,
        platePhotoOffsetY: 0,
      });
      onNotify?.('تم اختيار وإظهار صورة لوحة السيارة من المعرض بنجاح — يمكنك الآن تدويرها وتوسيعها');
    } catch (err) {
      console.error('Failed to load plate photo', err);
    }
    e.target.value = '';
  };

  const handleRotate90 = async (dir: 90 | -90 | 180) => {
    if (!data.vehiclePlatePhoto) return;
    const rotated = await rotateBase64Image(data.vehiclePlatePhoto, dir);
    updatePlatePhotoData({
      vehiclePlatePhoto: rotated,
    });
    onNotify?.(dir === 90 ? 'تم تدوير صورة اللوحة 90° لليمين' : dir === -90 ? 'تم تدوير صورة اللوحة 90° لليسار' : 'تم قلب صورة اللوحة 180°');
  };

  const handleZoomDelta = (delta: number) => {
    const next = Math.min(3, Math.max(0.5, Number((scale + delta).toFixed(2))));
    updatePlatePhotoData({ platePhotoScale: next });
  };

  const handleResetAdjustments = () => {
    updatePlatePhotoData({
      platePhotoRotation: 0,
      platePhotoScale: 1,
      platePhotoFit: 'fill',
      platePhotoOffsetX: 0,
      platePhotoOffsetY: 0,
    });
    onNotify?.('تمت إعادة ضبط أبعاد وتدوير صورة اللوحة');
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!data.vehiclePlatePhoto) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: offsetX,
      startY: offsetY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const nextX = Math.max(-100, Math.min(100, Math.round(dragStartRef.current.startX + dx * 0.5)));
    const nextY = Math.max(-100, Math.min(100, Math.round(dragStartRef.current.startY + dy * 0.5)));
    updatePlatePhotoData({
      platePhotoOffsetX: nextX,
      platePhotoOffsetY: nextY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="border-2 border-blue-200/90 rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-blue-50/50 via-white to-slate-50/60 shadow-xs space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Header & Gallery Upload Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 flex flex-wrap items-center gap-2">
              <span>صورة لوحة السيارة (مع التدوير والتوسيع)</span>
              {data.vehiclePlatePhoto && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  مرفقة وجاهزة
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500">
              اختر صورة اللوحة من المعرض لتظهر فوراً مع إمكانية تدويرها وتوسيعها لتناسب خانة الاستمارة
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>{data.vehiclePlatePhoto ? 'تغيير الصورة من المعرض' : 'اختيار صورة اللوحة من المعرض'}</span>
          </button>

          {onOpenCameraModal && (
            <button
              type="button"
              onClick={onOpenCameraModal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer transition shadow-xs"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>تصوير بالكاميرا</span>
            </button>
          )}

          {data.vehiclePlatePhoto && (
            <button
              type="button"
              onClick={() =>
                updatePlatePhotoData({
                  vehiclePlatePhoto: undefined,
                  platePhotoRotation: 0,
                  platePhotoScale: 1,
                  platePhotoOffsetX: 0,
                  platePhotoOffsetY: 0,
                })
              }
              className="px-3 py-2.5 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer flex items-center gap-1"
              title="حذف صورة اللوحة"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Plate Display + Rotation & Expansion Controls */}
      {data.vehiclePlatePhoto ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Left/Center: Interactive Preview Stage */}
            <div className="md:col-span-5 flex flex-col items-center space-y-2">
              <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-600 px-1">
                <span className="flex items-center gap-1 text-blue-900">
                  <Move className="w-3.5 h-3.5 text-blue-600" />
                  معاينة اللوحة (اسحب لتحريك الموضع):
                </span>
                <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  التوسيع: {Math.round(scale * 100)}% | الزاوية: {rotation}°
                </span>
              </div>

              {/* Main Interactive Plate Box (Proportional to A4 Plate Box 140x52 -> 280x104) */}
              <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`w-full max-w-[310px] h-[116px] border-2 border-dashed border-blue-500 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center relative select-none shadow-inner ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                title="اسحب الصورة بالماوس لضبط تمركز اللوحة داخل الإطار"
              >
                <img
                  src={data.vehiclePlatePhoto}
                  alt="معاينة لوحة السيارة"
                  draggable={false}
                  className={`w-full h-full transition-transform duration-75 ${
                    fitMode === 'fill'
                      ? 'object-fill'
                      : fitMode === 'cover'
                      ? 'object-cover'
                      : 'object-contain'
                  }`}
                  style={{
                    transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${scale})`,
                    transformOrigin: 'center center',
                  }}
                />
              </div>

              <p className="text-[10.5px] text-slate-500 text-center">
                هذه المعاينة تطابق شكل وظهور اللوحة داخل خانة «صورة لوحة الرقم» في استمارة A4
              </p>
            </div>

            {/* Right: Rotation & Expansion Controls */}
            <div className="md:col-span-7 bg-slate-50 rounded-xl p-3.5 border border-slate-200/90 space-y-3.5">
              {/* 1. Quick 90° Rotation & Fine Rotation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-blue-600" />
                    <span>تدوير صورة اللوحة:</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleRotate90(-90)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-800 border border-slate-300 text-[11px] font-bold transition cursor-pointer shadow-2xs"
                      title="تدوير 90 درجة لليسار"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                      <span>تدوير يسار 90°</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRotate90(90)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-800 border border-slate-300 text-[11px] font-bold transition cursor-pointer shadow-2xs"
                      title="تدوير 90 درجة لليمين"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-blue-600" />
                      <span>تدوير يمين 90°</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRotate90(180)}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-700 border border-slate-300 text-[11px] font-bold transition cursor-pointer shadow-2xs"
                      title="قلب الصورة 180 درجة"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-600" />
                      <span>180°</span>
                    </button>
                  </div>
                </div>

                {/* Fine Angle Slider */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="text-[10.5px] font-bold text-slate-600 whitespace-nowrap">ميلان دقيق:</span>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    step={1}
                    value={rotation}
                    onChange={(e) => updatePlatePhotoData({ platePhotoRotation: Number(e.target.value) })}
                    className="flex-1 accent-blue-600 cursor-pointer h-1.5"
                  />
                  <span className="font-mono text-[11px] font-bold text-slate-800 w-10 text-left" dir="ltr">
                    {rotation}°
                  </span>
                  {rotation !== 0 && (
                    <button
                      type="button"
                      onClick={() => updatePlatePhotoData({ platePhotoRotation: 0 })}
                      className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                    >
                      تصفير
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Zoom / Scale / Expansion Controls */}
              <div className="space-y-2 pt-2 border-t border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>توسيع وتكبير اللوحة:</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleZoomDelta(-0.15)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-bold transition cursor-pointer"
                      title="تصغير الصورة"
                    >
                      <ZoomOut className="w-3.5 h-3.5 text-slate-600" />
                      <span>تصغير -</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleZoomDelta(0.15)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition cursor-pointer shadow-2xs"
                      title="توسيع وتكبير الصورة"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>توسيع +</span>
                    </button>
                  </div>
                </div>

                {/* Scale Slider */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="text-[10.5px] font-bold text-slate-600 whitespace-nowrap">حجم التوسيع:</span>
                  <input
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.05}
                    value={scale}
                    onChange={(e) => updatePlatePhotoData({ platePhotoScale: Number(e.target.value) })}
                    className="flex-1 accent-emerald-600 cursor-pointer h-1.5"
                  />
                  <span className="font-mono text-[11px] font-bold text-emerald-800 w-12 text-left" dir="ltr">
                    {Math.round(scale * 100)}%
                  </span>
                </div>
              </div>

              {/* 3. Fit / Stretch Mode Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                  طريقة فرد الصورة بالخانة:
                </span>

                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => updatePlatePhotoData({ platePhotoFit: 'fill' })}
                    className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold transition cursor-pointer ${
                      fitMode === 'fill'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    توسيع لملء الإطار
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePlatePhotoData({ platePhotoFit: 'cover' })}
                    className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold transition cursor-pointer ${
                      fitMode === 'cover'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    تغطية كاملة
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePlatePhotoData({ platePhotoFit: 'contain' })}
                    className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold transition cursor-pointer ${
                      fitMode === 'contain'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    احتواء متناسق
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleResetAdjustments}
                  className="text-[10.5px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  إعادة الضبط
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-xl p-5 text-center bg-white/80 hover:bg-blue-50/40 transition cursor-pointer flex flex-col items-center justify-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-700">
            اضغط هنا لاختيار صورة لوحة السيارة من المعرض (الأستوديو)
          </p>
          <p className="text-[11px] text-slate-500">
            بعد اختيار الصورة ستظهر اللوحة أمامك مباشرة ويمكنك تدويرها بجميع الاتجاهات وتوسيعها وتكبيرها بحرية
          </p>
        </div>
      )}
    </div>
  );
};
