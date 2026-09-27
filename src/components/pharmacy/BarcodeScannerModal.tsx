import React, { useEffect, useRef, useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Camera, X, RefreshCw, CheckCircle2, ScanLine, AlertTriangle } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
  title?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onDetected,
  title = 'مسح باركود الدواء بالكاميرا',
}) => {
  const { state, showToast } = usePharmacy();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    setCameraError('');
    setIsScanning(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('المتصفح لا يدعم الوصول المباشر لكاميرا الجهاز أو يتطلب HTTPS');
      setIsScanning(false);
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      // Check if window.BarcodeDetector exists
      const BarcodeDetectorClass = (window as unknown as { BarcodeDetector?: any }).BarcodeDetector;
      if (BarcodeDetectorClass) {
        try {
          const detector = new BarcodeDetectorClass({
            formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code'],
          });

          const scanLoop = async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) {
              animationFrameRef.current = requestAnimationFrame(scanLoop);
              return;
            }
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                const detectedCode = barcodes[0].rawValue;
                sounds.playScan();
                onDetected(detectedCode);
                stopCamera();
                onClose();
                return;
              }
            } catch {
              // keep scanning
            }
            animationFrameRef.current = requestAnimationFrame(scanLoop);
          };

          animationFrameRef.current = requestAnimationFrame(scanLoop);
        } catch {
          // fallback
        }
      }
    } catch (err: unknown) {
      console.warn('Camera stream error:', err);
      setCameraError('تعذر فتح الكاميرا (يرجى السماح بإذن الكاميرا أو استخدام المحاكاة أدناه)');
      setIsScanning(false);
    }
  };

  const handleSimulateScan = (code: string) => {
    sounds.playScan();
    onDetected(code);
    stopCamera();
    onClose();
    showToast(`تم مسح الباركود بنجاح: ${code}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {title}
            </h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="relative bg-slate-950 aspect-video flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="text-center p-6 text-slate-400 max-w-sm">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <p className="text-xs text-amber-400 font-semibold mb-1">تنبيه إذن الكاميرا</p>
              <p className="text-xs text-slate-400">{cameraError}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Scanning visual crosshair and moving beam */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-36 border-2 border-teal-400/80 rounded-xl relative shadow-lg">
                  {/* Scanner line animation */}
                  <div className="absolute left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_8px_#2dd4bf] animate-[bounce_2s_infinite]"></div>
                  {/* Corners */}
                  <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-teal-300"></span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-teal-300"></span>
                  <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-teal-300"></span>
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-teal-300"></span>
                </div>
              </div>

              <div className="absolute bottom-2 inset-x-0 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[11px] text-teal-300 font-medium">
                  <ScanLine className="w-3.5 h-3.5 animate-pulse" />
                  وجه الكاميرا نحو باركود عبوة الدواء
                </span>
              </div>
            </>
          )}
        </div>

        {/* Quick Simulation / Test Barcodes */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
            <span>أو اختر صنفاً للمسح الفوري للتجربة:</span>
            <span className="text-[10px] font-normal text-slate-500">نقرة واحدة للمسح</span>
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
            {state.products.slice(0, 8).map(prod => (
              <button
                key={prod.id}
                type="button"
                onClick={() => handleSimulateScan(prod.barcode)}
                className="text-right p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
              >
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {prod.name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>{prod.barcode}</span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold">{prod.price} {state.settings.currency}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
