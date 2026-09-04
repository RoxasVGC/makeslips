import { useTableStore } from '../../store/useTableStore';
import type { PeerAction } from '../../types';

interface TranslationModalProps {
    isOpen: boolean;
    onClose: () => void;
    tableInfo: { num: number; key: string } | null;
    broadcastAction: (action: PeerAction) => void;
    myRoomId: string;
}

export function TranslationModal({ isOpen, onClose, tableInfo, broadcastAction, myRoomId }: TranslationModalProps) {
    const { updateTableState } = useTableStore();
    
    if (!isOpen || !tableInfo) return null;

    const requestTranslation = (lang: string) => {
        const currentState = useTableStore.getState().tableStates[tableInfo.key] || { status: 'default', timestamp: Date.now() };
        updateTableState(tableInfo.key, { ...currentState, status: 'judge', timestamp: Date.now(), translationRequired: lang });
        
        broadcastAction({
            type: 'TRANSLATION_REQUEST',
            key: tableInfo.key,
            tableNum: tableInfo.num,
            language: lang,
            sender: myRoomId || 'Unknown'
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-5" onClick={onClose}>
          <div className="bg-surf border border-bord-light rounded-2xl p-7 w-full max-w-[320px] shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex flex-col gap-3" onClick={e => e.stopPropagation()}>
            <h2 className="font-bebas text-3xl text-acc2 mb-1">Translate Table {tableInfo.num}</h2>
            <p className="text-muted text-xs mb-3">Which language is needed?</p>
            <div className="grid grid-cols-3 gap-2">
              {['IT', 'ES', 'FR', 'DE', 'PT', 'JP', 'KO', 'ZH', 'EN'].map(lang => (
                <button 
                  key={lang}
                  className="w-full bg-surf2 border border-bord-light text-white py-2.5 rounded-lg font-bold hover:bg-bord-light transition-colors"
                  onClick={() => requestTranslation(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>
            <button className="w-full bg-red-900 border border-red-800 text-white py-2.5 rounded-lg font-bold mt-2" onClick={onClose}>Cancel</button>
          </div>
        </div>
    );
}
