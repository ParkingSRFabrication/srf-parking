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

      const timer = setTimeout(() => {
        try {
          html5QrCode = new Html5Qrcode(qrRegionId);
          scannerRef.current = html5QrCode;

          const config = { fps: 10, qrbox: { width: 250, height: 250 } };

          html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              html5QrCode.stop().then(() => {
                setIsScanning(false);
                onScanSuccess(decodedText);
                onClose();
              }).catch(() => {
                onScanSuccess(decodedText);
                onClose();
              });
            },
            () => {}
          ).catch(() => {
            setError('Could not access device camera. Please allow camera permissions or enter token code manually.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-white/10 text-white">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 bg-[#142B4A] text-white border-b border-white/10">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-300" />
            <h3 className="font-bold text-xs sm:text-sm font-outfit">Optical Camera QR Scanner</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 flex flex-col items-center">
          <div
            id="qr-reader-container"
            className="w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden border-2 border-dashed border-cyan-500/40 relative shadow-inner"
          />

          {error && (
            <div className="mt-3 p-3 bg-rose-500/15 text-rose-300 text-xs rounded-xl flex items-start gap-2 border border-rose-500/20">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-slate-400 text-center mt-3">
            Align the QR code on the printed slip inside the viewfinder.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-slate-200 text-xs sm:text-sm font-bold rounded-xl transition border border-white/5"
          >
            Cancel & Enter Manually
          </button>
        </div>
      </div>
    </div>
  );
}
