import { QRCodeSVG } from 'qrcode.react';

interface QrCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    myRoomId: string;
    getShareUrl: () => string;
}

export function QrCodeModal({ isOpen, onClose, myRoomId, getShareUrl }: QrCodeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-5" onClick={onClose}>
          <div className="bg-surf border border-bord-light rounded-2xl p-7 w-full max-w-[350px] shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <h2 className="font-bebas text-3xl text-acc2 mb-4">Staff QR Code</h2>
            <p className="text-muted text-sm text-center mb-6">Scan this QR code to join this session as a staff member or judge.</p>
            <div className="bg-white p-5 rounded-2xl mb-6">
              <QRCodeSVG value={getShareUrl()} size={220} />
            </div>
            <p className="text-white font-mono text-xl font-bold mb-6 tracking-widest">{myRoomId}</p>
            <button className="w-full bg-surf3 border border-bord-light text-white py-3 rounded-lg font-bold mb-3 hover:bg-bord-light transition-colors" onClick={() => navigator.clipboard.writeText(getShareUrl())}>
              Copy Direct Link
            </button>
            <button className="w-full bg-red-900 border border-red-800 text-white py-3 rounded-lg font-bold hover:bg-red-950 transition-colors" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
    );
}
