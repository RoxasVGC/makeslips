interface StatsPanelProps {
    totalCount: number;
    playingCount: number;
    judgeCount: number;
    ghostCount: number;
    emptyCount: number;
    completeCount: number;
    translationCount: number;
    activeFilter: string;
    onFilterChange: (filterId: string) => void;
}

export function StatsPanel({ 
    totalCount, playingCount, judgeCount, ghostCount, 
    emptyCount, completeCount, translationCount, activeFilter, onFilterChange 
}: StatsPanelProps) {
    const filters = [
        { id: 'all', label: 'TOTAL TABLES', count: totalCount, dot: '' },
        { id: 'playing', label: 'PLAYING', count: playingCount, dot: '🔴 ' },
        { id: 'judge', label: 'JUDGE CALL', count: judgeCount, dot: '🟡 ' },
        { id: 'translation', label: 'TRANSLATION', count: translationCount, dot: '🔵 ' },
        { id: 'ghost', label: 'GHOST TABLE', count: ghostCount, dot: '🟣 ' },
        { id: 'empty', label: 'EMPTY (MANUAL)', count: emptyCount, dot: '🟢 ' },
        { id: 'complete', label: 'COMPLETED', count: completeCount, dot: '✔️ ' }
    ];

    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          {filters.map(filter => (
            <div 
              key={filter.id}
              className={`bg-surf border rounded-xl p-3 flex flex-col cursor-pointer transition-all duration-150 ${activeFilter === filter.id ? 'border-white bg-surf3 shadow-[0_0_12px_rgba(255,255,255,0.1)] -translate-y-0.5' : 'border-bord hover:border-white hover:-translate-y-0.5'}`}
              onClick={() => onFilterChange(filter.id)}
            >
              <span className="text-[11px] font-black uppercase tracking-wider text-muted mb-1">{filter.dot}{filter.label}</span>
              <span className="font-bebas text-4xl leading-none">{filter.count}</span>
            </div>
          ))}
        </div>
    );
}
