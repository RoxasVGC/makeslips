import type { TournamentData } from '../../types';

interface FilterBarProps {
    tournament: TournamentData | null;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onDivisionChange: (divisionId: string) => void;
}

export function FilterBar({ tournament, searchQuery, onSearchChange, onDivisionChange }: FilterBarProps) {
    return (
        <div className="flex justify-between items-center flex-wrap gap-3 mt-2">
          <div className="flex gap-2 flex-wrap">
            {tournament?.divisions && Object.keys(tournament.divisions).map(dId => (
              <button 
                key={dId}
                className={`px-4 py-2 rounded-full border text-[13px] font-bold transition-all duration-150 ${tournament.activeDivisionId === dId ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]' : 'bg-surf2 border-bord text-muted hover:border-bord-light'}`}
                onClick={() => onDivisionChange(dId)}
              >
                {tournament.divisions[dId].name}
              </button>
            ))}
          </div>
          <div className="w-full max-w-[320px]">
            <input 
              type="text" 
              placeholder="Search table # or player..."
              className="w-full px-4 py-2.5 bg-surf2 border border-bord rounded-lg text-white font-nunito text-sm outline-none focus:border-acc2 transition-colors shadow-inner"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
        </div>
    );
}
