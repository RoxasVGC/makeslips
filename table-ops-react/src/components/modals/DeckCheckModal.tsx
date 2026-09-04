import { useTableStore } from '../../store/useTableStore';
import type { PeerAction } from '../../types';

interface DeckCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    tableInfo: { num: number; p1: string; p2: string } | null;
    isHost: boolean;
    broadcastAction: (action: PeerAction) => void;
}

export function DeckCheckModal({ isOpen, onClose, tableInfo, isHost, broadcastAction }: DeckCheckModalProps) {
    const { playerStates, updatePlayerState } = useTableStore();
    
    if (!isOpen || !tableInfo) return null;

    const p1Key = tableInfo.p1.toLowerCase();
    const p2Key = tableInfo.p2.toLowerCase();

    const handleCheckChange = (playerKey: string, field: 'partial' | 'full', value: boolean) => {
        const currentState = playerStates[playerKey] || { partial: false, full: false };
        const newState = { ...currentState, [field]: value };
        updatePlayerState(playerKey, newState);
        if (isHost) {
            broadcastAction({ type: 'UPDATE_PLAYER_STATE', key: playerKey, state: newState });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-5" onClick={onClose}>
          <div className="bg-surf border border-bord-light rounded-2xl p-7 w-full max-w-[400px] shadow-[0_10px_40px_rgba(0,0,0,0.6)]" onClick={e => e.stopPropagation()}>
            <h2 className="font-bebas text-3xl text-acc2 mb-4">Table {tableInfo.num} - Deck Checks</h2>
            
            <div className="bg-white/5 p-4 rounded-xl mb-3 border border-bord">
                <div className="font-bold mb-2 text-sm">{tableInfo.p1}</div>
                <div className="flex gap-6 items-center">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                        <input type="checkbox" className="w-4 h-4 rounded" checked={playerStates[p1Key]?.partial || false} onChange={e => handleCheckChange(p1Key, 'partial', e.target.checked)} /> Partial (🔍)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                        <input type="checkbox" className="w-4 h-4 rounded" checked={playerStates[p1Key]?.full || false} onChange={e => handleCheckChange(p1Key, 'full', e.target.checked)} /> Full (🃏)
                    </label>
                </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl mb-6 border border-bord">
                <div className="font-bold mb-2 text-sm">{tableInfo.p2}</div>
                <div className="flex gap-6 items-center">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                        <input type="checkbox" className="w-4 h-4 rounded" checked={playerStates[p2Key]?.partial || false} onChange={e => handleCheckChange(p2Key, 'partial', e.target.checked)} /> Partial (🔍)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                        <input type="checkbox" className="w-4 h-4 rounded" checked={playerStates[p2Key]?.full || false} onChange={e => handleCheckChange(p2Key, 'full', e.target.checked)} /> Full (🃏)
                    </label>
                </div>
            </div>

            <button type="button" className="w-full bg-purple-600 border border-purple-500 hover:bg-purple-700 transition-colors text-white py-3 rounded-lg font-bold" onClick={onClose}>Done</button>
          </div>
        </div>
    );
}
