import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, AlertCircle } from 'lucide-react';
import './QRScannerModal.css';

export function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    let html5QrCode = null;

    if (isOpen) {
      setError(null);
      setIsScanning(true);

      const qrRegionId = 'qr-reader-container';

      // Slight timeout to let DOM render the container
      const timer = setTimeout(() => {
        try {
          html5QrCode = new Html5Qrcode(qrRegionId);
          scannerRef.current = html5QrCode;

          const config = { fps: 10, qrbox: { width: 250, height: 250 } };

          html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              // On successful scan
              html5QrCode.stop().then(() => {
                setIsScanning(false);
                onScanSuccess(decodedText);
                onClose();
              }).catch(() => {
                onScanSuccess(decodedText);
                onClose();
              });
            },
            (errorMessage) => {
              // Frame scan error (expected while camera is searching)
            }
          ).catch((err) => {
            setError('Could not access camera. Please allow camera permissions or enter token number manually.');
            setIsScanning(false);
          });
        } catch (err) {
          setError('Camera initialization failed.');
          setIsScanning(false);
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 bg-[#142B4A] text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-300" />
            <h3 className="font-semibold text-xs sm:text-sm">Scan Token / Pass QR</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 flex flex-col items-center">
          <div
            id="qr-reader-container"
            className="w-full aspect-square bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 relative"
          />

          {error && (
            <div className="mt-3 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-start gap-2 border border-rose-100">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-slate-500 text-center mt-3">
            Align the QR code on the printed token inside the viewfinder.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full py-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition"
          >
            Cancel & Enter Manually
          </button>
        </div>
      </div>
    </div>
  );
}
