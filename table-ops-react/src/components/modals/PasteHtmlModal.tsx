interface PasteHtmlModalProps {
    isOpen: boolean;
    onClose: () => void;
    pasteHtml: string;
    setPasteHtml: (html: string) => void;
    handlePasteSubmit: () => void;
}

export function PasteHtmlModal({ isOpen, onClose, pasteHtml, setPasteHtml, handlePasteSubmit }: PasteHtmlModalProps) {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-5" onClick={onClose}>
          <div className="bg-surf border border-bord-light rounded-2xl p-7 w-full max-w-[600px] shadow-[0_10px_40px_rgba(0,0,0,0.6)]" onClick={e => e.stopPropagation()}>
            <h2 className="font-bebas text-3xl text-acc2 mb-2">Paste Pairings HTML</h2>
            <p className="text-muted text-sm mb-4">Paste the full raw HTML from the RK9 pairings page here.</p>
            <textarea 
              className="w-full h-[250px] bg-surf2 text-white border border-bord rounded-lg p-3 font-mono text-xs mb-4 outline-none focus:border-acc2"
              value={pasteHtml}
              onChange={e => setPasteHtml(e.target.value)}
            />
            <div className="flex gap-2">
              <button className="flex-1 bg-purple-600 border border-purple-500 text-white py-3 rounded-lg font-bold text-sm hover:bg-purple-700 transition-colors" onClick={handlePasteSubmit}>Load Pairings</button>
              <button className="flex-1 bg-surf3 border border-bord-light text-white py-3 rounded-lg font-bold text-sm hover:bg-bord-light transition-colors" onClick={onClose}>Cancel</button>
            </div>
          </div>
        </div>
    );
}
