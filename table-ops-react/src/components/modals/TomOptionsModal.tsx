interface TomOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    intervalMs: number;
    setIntervalMs: (ms: number) => void;
}

export function TomOptionsModal({ isOpen, onClose, intervalMs, setIntervalMs }: TomOptionsModalProps) {
    if (!isOpen) return null;

    const handleSave = () => {
        const val = parseInt((document.getElementById('tom-interval-input') as HTMLInputElement).value, 10);
        if (val >= 5) {
            setIntervalMs(val * 1000);
            onClose();
        } else {
            alert("Interval must be at least 5 seconds.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-5" onClick={onClose}>
          <div className="bg-surf border border-bord-light rounded-2xl p-7 w-full max-w-[350px] shadow-[0_10px_40px_rgba(0,0,0,0.6)]" onClick={e => e.stopPropagation()}>
            <h2 className="font-bebas text-3xl text-acc2 mb-4">TOM Sync Options</h2>
            <p className="text-muted text-sm mb-4">Set the interval for automatically polling the selected .tdf file.</p>
            <div className="mb-6">
              <label className="block text-xs font-bold mb-2">Polling Interval (seconds)</label>
              <input 
                id="tom-interval-input"
                type="number" 
                defaultValue={intervalMs / 1000}
                min="5"
                className="w-full px-4 py-3 bg-surf2 border border-bord rounded-lg text-white outline-none focus:border-acc2"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-amber-600 border border-amber-500 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-amber-700 transition-colors" onClick={handleSave}>Save</button>
              <button className="flex-1 bg-surf3 border border-bord-light text-white py-2.5 rounded-lg font-bold text-sm hover:bg-bord-light transition-colors" onClick={onClose}>Cancel</button>
            </div>
          </div>
        </div>
    );
}
