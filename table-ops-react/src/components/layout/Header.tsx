interface HeaderProps {
    onShowQrModal: () => void;
}

export function Header({ onShowQrModal }: HeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 border-b border-white/10 pb-5">
          <div>
            <h1 className="font-bebas text-5xl md:text-6xl m-0 tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-acc1 via-acc2 to-purple-400 drop-shadow-[0_0_15px_rgba(167,139,250,0.5)]">
              TABLE OPERATIONS GRID
            </h1>
            <p className="text-muted text-sm mt-1">Live floor judge & staff operations monitor with auto Ghost-Table detection</p>
          </div>
          <button 
            className="flex items-center gap-2 bg-surf2 border border-bord text-white px-5 py-2.5 rounded-full font-bold hover:bg-surf3 hover:border-white transition-all shadow-md group"
            onClick={onShowQrModal}
          >
            <span className="text-lg group-hover:scale-110 transition-transform">📱</span>
            Session PIN & QR Code
          </button>
        </div>
    );
}
