import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDateTime, formatDuration, CATEGORY_LABELS } from '../../utils/formatters.js';

export function ReceiptModal({ isOpen, onClose, data, type = 'entry' }) {
  if (!isOpen || !data) return null;

  const isEntry = type === 'entry';
  const isPass = type === 'pass';

  const handlePrint = () => {
    window.print();
  };

  const tokenOrPassNumber = data.tokenNumber || data.passNumber || '-';
  const vehicleReg = data.vehicleNumber || '-';
  const categoryName = CATEGORY_LABELS[data.vehicleType] || data.vehicleType || '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print-bg">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#142B4A] text-white no-print">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm tracking-wide">
              {isEntry ? 'Entry Token Generated' : isPass ? 'Monthly Pass Receipt' : 'Exit & Payment Receipt'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Body (Targeted for Thermal & A4 Printing) */}
        <div id="printable-receipt" className="p-6 text-slate-900 bg-white">
          {/* Receipt Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="font-black text-lg text-[#142B4A] tracking-tight">
              SR FABRICATION
            </div>
            <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Railway Station Vehicle Parking Plaza
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Authorized Railway Parking Contractor
            </div>
            <div className="text-[10px] text-slate-500">
              Station Code: {data.locationCode || 'SRF-MAIN'}
            </div>
          </div>

          {/* Token / Pass Title Banner */}
          <div className="my-3 text-center bg-slate-100 py-1.5 rounded-lg border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              {isEntry ? 'PARKING ENTRY TOKEN' : isPass ? 'MONTHLY PARKING PASS' : 'PARKING EXIT RECEIPT'}
            </div>
            <div className="text-lg font-mono font-extrabold text-[#142B4A] tracking-wider">
              {tokenOrPassNumber}
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2 text-xs py-2 border-b border-dashed border-slate-300">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Vehicle Number:</span>
              <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {vehicleReg}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Category / Type:</span>
              <span className="font-medium text-slate-800">{categoryName}</span>
            </div>

            {data.customerName && (
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-medium text-slate-800">{data.customerName}</span>
              </div>
            )}

            {data.customerPhone && (
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile:</span>
                <span className="font-medium text-slate-800">{data.customerPhone}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-slate-500">Entry Time:</span>
              <span className="font-medium text-slate-800">{formatDateTime(data.entryTime || data.startDate)}</span>
            </div>

            {!isEntry && !isPass && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Exit Time:</span>
                  <span className="font-medium text-slate-800">{formatDateTime(data.exitTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Duration:</span>
                  <span className="font-medium text-slate-800">{formatDuration(data.durationMinutes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Billable Units:</span>
                  <span className="font-medium text-slate-800">{data.billableUnits} Day(s)</span>
                </div>
              </>
            )}

            {isPass && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pass Validity:</span>
                  <span className="font-medium text-slate-800">{data.durationMonths} Month(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Valid Until:</span>
                  <span className="font-bold text-emerald-700">{formatDateTime(data.expiryDate)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-500">Operator:</span>
              <span className="font-medium text-slate-700">{data.operator || data.entryOperator?.name || 'Operator'}</span>
            </div>
          </div>

          {/* Financial Summary */}
          {!isEntry && (
            <div className="my-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex justify-between items-center text-xs text-slate-600 mb-1">
                <span>Amount Paid:</span>
                <span className="font-bold text-base text-emerald-800">
                  {formatCurrency(data.amountPaid ?? data.amount ?? 0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>Payment Method:</span>
                <span className="font-semibold text-slate-700 uppercase">
                  {data.paymentMethod || 'CASH'}
                  {data.paymentReference ? ` (${data.paymentReference})` : ''}
                </span>
              </div>
            </div>
          )}

          {isEntry && data.coveredByPass && (
            <div className="my-3 p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-center">
              <span className="text-xs font-bold text-purple-800 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Covered by Monthly Pass ({data.coveredByPass.passNumber})
              </span>
            </div>
          )}

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center my-4">
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
              <QRCodeSVG
                value={tokenOrPassNumber}
                size={110}
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Scan for Fast Exit Verification
            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-center text-[9px] text-slate-500 pt-2 border-t border-dashed border-slate-300">
            <p>Please keep token safe. Non-transferable.</p>
            <p>Parking at owner's risk under Railway Station guidelines.</p>
          </div>
        </div>

        {/* Modal Actions (No Print) */}
        <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 no-print">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition text-sm"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#142B4A] hover:bg-[#2457A7] text-white font-medium rounded-xl shadow-md transition text-sm"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
