interface ToolbarProps {
    onCopySyncScript: () => void;
    onShowPasteModal: () => void;
    onTomSync: () => void;
    onShowTomOptions: () => void;
    onShowJoinModal: () => void;
    onToggleDebug: () => void;
    onEndSession: () => void;
}

export function Toolbar({ onCopySyncScript, onShowPasteModal, onTomSync, onShowTomOptions, onShowJoinModal, onToggleDebug, onEndSession }: ToolbarProps) {
    return (
        <div className="bg-surf border border-bord rounded-xl p-4 mb-5 shadow-lg">
          <div className="flex flex-wrap gap-2.5 items-center">
            <button className="px-4 py-2 bg-surf3 border border-bord-light rounded-lg text-white font-bold text-[13px] hover:bg-bord-light transition-colors shadow-md" onClick={onCopySyncScript}>
              📋 Copy Sync Script
            </button>
            <button className="px-4 py-2 bg-purple-600 border border-purple-500 text-white rounded-lg font-bold text-[13px] shadow-md hover:bg-purple-700 transition-colors" onClick={onShowPasteModal}>
              📋 Paste HTML
            </button>
            <button className="px-4 py-2 bg-amber-500 border border-amber-400 text-black rounded-lg font-bold text-[13px] shadow-md hover:bg-amber-600 transition-colors" onClick={onTomSync}>
              📁 TOM Sync (.tdf)
            </button>
            <button className="px-4 py-2 bg-surf3 border border-bord-light rounded-lg text-white font-bold text-[13px] hover:bg-bord-light transition-colors shadow-md" onClick={onShowTomOptions}>
              ⚙️ TOM Options
            </button>
            <button className="px-4 py-2 bg-surf3 border border-bord-light rounded-lg text-white font-bold text-[13px] hover:bg-bord-light transition-colors shadow-md" onClick={onShowJoinModal}>
              🔑 Join as Judge
            </button>
            <button className="px-4 py-2 bg-surf3 border border-bord-light rounded-lg text-white font-bold text-[13px] hover:bg-bord-light transition-colors shadow-md" onClick={onToggleDebug}>
              🐞 Debug
            </button>
            <button className="px-4 py-2 bg-red-900 border border-red-800 rounded-lg text-white font-bold text-[13px] hover:bg-red-950 transition-colors shadow-md ml-auto" onClick={onEndSession}>
              🧹 End Session
            </button>
          </div>
          <p className="mt-3 text-[13px] text-muted">
            <strong>How to load data:</strong> Copy the sync script and run it as a bookmarklet on the RK9 pairings page.
          </p>
        </div>
    );
}
