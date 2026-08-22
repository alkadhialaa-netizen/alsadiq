import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Sparkles, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  FileText, 
  User, 
  Car, 
  CreditCard,
  Layers,
  ArrowRight,
  Maximize2
} from 'lucide-react';

export type ScanType = 'owner-id' | 'customs' | 'guarantor-1' | 'guarantor-2' | 'owner-photo' | 'plate-photo';

interface AiCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanType: ScanType;
  title: string;
  subtitle?: string;
  onExtractionSuccess: (extractedData: any, imageBase64: string) => void;
}

export const AiCaptureModal: React.FC<AiCaptureModalProps> = ({
  isOpen,
  onClose,
  scanType,
  title,
  subtitle,
  onExtractionSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processStatus, setProcessStatus] = useState<string>('');
  const [extractedPreview, setExtractedPreview] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasCamera, setHasCamera] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isPurePhoto = scanType === 'owner-photo' || scanType === 'plate-photo';

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: scanType === 'owner-photo' ? 'user' : facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasCamera(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setHasCamera(false);
      // Automatically fallback to upload tab if camera not accessible in iframe
      setActiveTab('upload');
    }
  }, [facingMode, scanType, stopCamera]);

  useEffect(() => {
    if (isOpen) {
      setSelectedImage(null);
      setExtractedPreview(null);
      setErrorMessage(null);
      setIsProcessing(false);
      if (activeTab === 'camera') {
        startCamera();
      }
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, startCamera, stopCamera]);

  // Compress and resize image to prevent localStorage QuotaExceededError
  const compressImage = (dataUrl: string, maxWidth = 1000, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Capture frame from video
  const handleCaptureSnapshot = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1000;
    canvas.height = video.videoHeight || 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const compressed = await compressImage(rawDataUrl, 1000, 0.8);
    setSelectedImage(compressed);
    stopCamera();

    if (!isPurePhoto) {
      triggerAiExtraction(compressed);
    }
  };

  // Handle File Upload from Gallery
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      const compressed = await compressImage(rawDataUrl, 1000, 0.8);
      setSelectedImage(compressed);
      setErrorMessage(null);
      if (!isPurePhoto) {
        triggerAiExtraction(compressed);
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger Gemini API extraction on server
  const triggerAiExtraction = async (imageData: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessStatus('جاري تحليل الوثيقة وقراءة النصوص بالذكاء الاصطناعي...');

    let endpoint = '/api/extract/owner-id';
    let payload: any = { image: imageData };

    if (scanType === 'customs') {
      endpoint = '/api/extract/customs-declaration';
    } else if (scanType === 'guarantor-1') {
      endpoint = '/api/extract/guarantor-id';
      payload.guarantorNumber = 1;
    } else if (scanType === 'guarantor-2') {
      endpoint = '/api/extract/guarantor-id';
      payload.guarantorNumber = 2;
    } else if (scanType === 'plate-photo') {
      endpoint = '/api/extract/plate-image';
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseBodyText = await response.text();
      let result: any = {};
      try {
        result = JSON.parse(responseBodyText);
      } catch {
        result = { error: responseBodyText };
      }

      if (!response.ok) {
        let msg = result.error || 'حدث خطأ أثناء معالجة الصورة بالذكاء الاصطناعي';
        if (typeof msg === 'object') {
          msg = JSON.stringify(msg);
        }
        if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand') || msg.includes('overloaded')) {
          msg = 'خدمة الذكاء الاصطناعي تشهد ضغطاً مؤقتاً في الطلبات، يرجى النقر على إعادة المحاولة أو تعبئة الحقول يدوياً.';
        }
        throw new Error(msg);
      }

      if (result.success && result.data) {
        setExtractedPreview(result.data);
        setProcessStatus('تم استخراج البيانات بنجاح!');
      } else {
        throw new Error('لم يتم العثور على نصوص واضحة بالوثيقة، يمكنك ملء الحقول يدوياً.');
      }
    } catch (err: any) {
      console.error('AI Extraction error:', err);
      let cleanMsg = err?.message || 'تعذر استخراج البيانات. يمكنك إعادة التصوير أو ملء الحقول يدوياً.';
      if (cleanMsg.includes('{"error"') || cleanMsg.includes('503') || cleanMsg.includes('UNAVAILABLE')) {
        cleanMsg = 'خدمة الذكاء الاصطناعي تشهد ضغطاً مؤقتاً في الطلبات، يرجى المحاولة ثانية بعد قليل أو إدخال البيانات يدوياً.';
      }
      setErrorMessage(cleanMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm and Apply Data
  const handleApplyData = () => {
    if (!selectedImage) return;
    onExtractionSuccess(extractedPreview || {}, selectedImage);
    onClose();
  };

  // Reset and retake photo
  const handleRetake = () => {
    setSelectedImage(null);
    setExtractedPreview(null);
    setErrorMessage(null);
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              {isPurePhoto ? (
                <Camera className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">{title}</h3>
              <p className="text-xs text-slate-300">
                {subtitle || (isPurePhoto ? 'التقاط صورة واضحة ومباشرة' : 'تصوير فوري أو اختيار من المعرض والاستخراج بالذكاء الاصطناعي')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Camera vs Gallery */}
        {!selectedImage && (
          <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                startCamera();
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'camera'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>التصوير بالكاميرا المباشرة</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>اختيار صورة من المعرض / الملفات</span>
            </button>
          </div>
        )}

        {/* Modal Body Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* 1. Live Camera View */}
          {activeTab === 'camera' && !selectedImage && (
            <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-slate-800 aspect-4/3 flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Framing Overlay */}
              <div className="absolute inset-6 sm:inset-10 border-2 border-amber-400/80 border-dashed rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                  <div className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                    {isPurePhoto ? 'ضع الهدف داخل الإطار' : 'ضع الوثيقة / البطاقة بوضوح'}
                  </div>
                  <div className="w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                </div>
                <div className="flex justify-between items-end">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-amber-400" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-amber-400" />
                </div>
              </div>

              {/* Switch Camera Button */}
              {scanType !== 'owner-photo' && (
                <button
                  type="button"
                  onClick={() => {
                    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
                  }}
                  className="absolute top-3 left-3 bg-black/60 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/80 transition cursor-pointer"
                  title="تبديل الكاميرا (الأمامية / الخلفية)"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}

              {/* Snap Button */}
              <div className="absolute bottom-4 inset-x-0 flex justify-center">
                <button
                  type="button"
                  onClick={handleCaptureSnapshot}
                  className="group flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-6 py-3 rounded-full shadow-lg transform active:scale-95 transition cursor-pointer"
                >
                  <div className="w-4 h-4 rounded-full bg-slate-950 group-hover:scale-110 transition" />
                  <span>التقاط الصورة والمسح</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Gallery / File Upload View */}
          {activeTab === 'upload' && !selectedImage && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/70 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 min-h-[260px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">اضغط لاختيار صورة من الأستوديو أو جهازك</h4>
                <p className="text-xs text-slate-500 mt-1">يدعم صور JPG, PNG, WEBP بدقة عالية</p>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                تصفح المعرض
              </span>
            </div>
          )}

          {/* 3. Preview Captured/Uploaded Image + AI Extraction Status */}
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-900 max-h-[280px] flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Scanned Target"
                  className="max-h-[280px] w-auto object-contain"
                />

                {/* Laser scan animation when processing AI */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-blue-500/10 pointer-events-none flex flex-col justify-center items-center">
                    <div className="w-full h-1 bg-amber-400 shadow-[0_0_15px_#f59e0b] animate-bounce" />
                    <div className="bg-slate-950/80 text-amber-300 px-4 py-2 rounded-xl text-xs font-bold mt-4 flex items-center gap-2 border border-amber-500/30">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>{processStatus}</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleRetake}
                  className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  إعادة التصوير
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                  {selectedImage && !isProcessing && (
                    <button
                      type="button"
                      onClick={() => triggerAiExtraction(selectedImage)}
                      className="self-end sm:self-auto bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition"
                    >
                      <RefreshCw className="w-3 h-3" />
                      إعادة المحاولة
                    </button>
                  )}
                </div>
              )}

              {/* Extracted Fields Preview */}
              {extractedPreview && !isProcessing && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs sm:text-sm">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>البيانات المستخرجة بالذكاء الاصطناعي بنجاح</span>
                    </div>
                    <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                      جاهزة للتطبيق
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(extractedPreview).map(([key, val]) => {
                      if (!val || typeof val === 'object') return null;
                      return (
                        <div key={key} className="bg-white/90 p-2 rounded-lg border border-emerald-100">
                          <span className="text-[10px] text-slate-400 font-bold block">{key}</span>
                          <span className="font-bold text-slate-900">{String(val)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            إلغاء
          </button>

          {selectedImage && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition cursor-pointer"
              >
                تغيير الصورة
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleApplyData}
                className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-950 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>اعتماد وتعبئة البيانات في الاستمارة</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
