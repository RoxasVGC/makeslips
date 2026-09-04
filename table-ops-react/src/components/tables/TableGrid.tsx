import { useTableStore } from '../../store/useTableStore';
import { TableCard } from './TableCard';
import type { PeerAction, TableStatus } from '../../types';

interface TableGridProps {
  activeFilter: string;
  searchQuery: string;
  onDeckCheck: (tableNum: number, p1: string, p2: string) => void;
  onRequestTranslation: (tableNum: number) => void;
  broadcastAction: (action: PeerAction) => void;
  timeOffset: number;
}

export const TableGrid: React.FC<TableGridProps> = ({ 
  activeFilter, 
  searchQuery, 
  onDeckCheck, 
  onRequestTranslation,
  broadcastAction,
  timeOffset
}) => {
  const { tournament, tableStates, playerStates, updateTableState } = useTableStore();

  if (!tournament || !tournament.divisions || !tournament.activeDivisionId) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5">
        <div className="col-span-full text-center py-16 px-5 text-muted">
          <h3 className="font-bebas text-3xl text-white mb-2">No Tournament Loaded</h3>
          <p>Paste a pairings HTML to initialize the live table grid.</p>
        </div>
      </div>
    );
  }

  const div = tournament.divisions[tournament.activeDivisionId];
  if (!div || !div.tables || div.tables.length === 0) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5">
        <div className="col-span-full text-center py-16 px-5 text-muted">
          <h3 className="font-bebas text-3xl text-white mb-2">No Tables Found</h3>
          <p>Load an active tournament URL with live pairings to start monitoring tables.</p>
        </div>
      </div>
    );
  }

  const now = Date.now() - timeOffset;
  const lowerSearch = searchQuery.toLowerCase().trim();
  let renderedCount = 0;

  const handleStateCycle = (tableNum: number) => {
    const key = `${tournament.activeDivisionId}_R${div.round}_${tableNum}`;
    const current = tableStates[key] || { status: 'default', timestamp: Date.now() };

    let nextStatus: TableStatus = 'playing';
    if (current.status === 'default') nextStatus = 'playing';
    else if (current.status === 'playing') nextStatus = 'judge';
    else if (current.status === 'judge') nextStatus = 'empty';
    else if (current.status === 'empty') nextStatus = 'default';

    const newState = { status: nextStatus, timestamp: Date.now() - timeOffset };
    
    // update locally
    updateTableState(key, newState);

    // broadcast
    broadcastAction({
      type: 'UPDATE_TABLE_STATE',
      key,
      state: newState
    });
  };

  const cards = div.tables.map(table => {
    const key = `${tournament.activeDivisionId}_R${div.round}_${table.num}`;
    const customState = tableStates[key] || { status: 'default', timestamp: 0 };
    
    let effectiveState = customState.status;
    let isGhost = false;

    if (table.isOfficialDone) {
        effectiveState = 'complete';
    } else if (customState.status === 'empty') {
        const elapsed = Math.floor((now - customState.timestamp) / 1000);
        if (elapsed >= 120) {
            effectiveState = 'ghost';
            isGhost = true;
        }
    }

    if (activeFilter === 'playing' && effectiveState !== 'playing') return null;
    if (activeFilter === 'judge' && effectiveState !== 'judge') return null;
    if (activeFilter === 'ghost' && !isGhost) return null;
    if (activeFilter === 'empty' && effectiveState !== 'empty' && !isGhost) return null;
    if (activeFilter === 'complete' && !table.isOfficialDone) return null;
    if (activeFilter === 'translation' && !customState.translationRequired) return null;

    if (lowerSearch) {
        const matchNum = String(table.num).includes(lowerSearch);
        const matchP1 = table.p1.toLowerCase().includes(lowerSearch);
        const matchP2 = table.p2.toLowerCase().includes(lowerSearch);
        if (!matchNum && !matchP1 && !matchP2) return null;
    }

    renderedCount++;

    const p1Key = (table.p1 || '').trim().toLowerCase();
    const p2Key = (table.p2 || '').trim().toLowerCase();
    const p1Check = playerStates[p1Key] || { partial: false, full: false };
    const p2Check = playerStates[p2Key] || { partial: false, full: false };

    return (
      <TableCard 
        key={table.num}
        table={table}
        status={customState.status}
        timestamp={customState.timestamp}
        isActive={false}
        divisionId={tournament.activeDivisionId}
        round={div.round}
        onStateCycle={handleStateCycle}
        onLongPress={() => onDeckCheck(table.num, table.p1, table.p2)}
        onRequestTranslation={onRequestTranslation}
        translationRequired={customState.translationRequired}
        p1Check={p1Check}
        p2Check={p2Check}
      />
    );
  });

  if (renderedCount === 0) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5">
        <div className="col-span-full text-center py-16 px-5 text-muted">
          <h3 className="font-bebas text-3xl text-white mb-2">No Tables Match Filter</h3>
          <p>Change your filter or search query to view active tables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5">
      {cards}
    </div>
  );
};
