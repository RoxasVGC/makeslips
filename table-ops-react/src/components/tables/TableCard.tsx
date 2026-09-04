import { useEffect, useState } from 'react';
import type { Table, TableStatus } from '../../types';

interface TableCardProps {
  table: Table;
  status: TableStatus;
  timestamp: number;
  isActive: boolean;
  divisionId: string;
  round: number;
  onStateCycle: (tableNum: number) => void;
  onLongPress: (tableNum: number) => void;
  onRequestTranslation: (tableNum: number) => void;
  translationRequired?: string;
  p1Check: { partial: boolean; full: boolean };
  p2Check: { partial: boolean; full: boolean };
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  status,
  timestamp,
  divisionId,
  round,
  onStateCycle,
  onLongPress,
  onRequestTranslation,
  translationRequired,
  p1Check,
  p2Check
}) => {
  const [timerDisplay, setTimerDisplay] = useState('');
  const [isGhost, setIsGhost] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timestamp > 0 && (status === 'judge' || status === 'empty' || status === 'ghost')) {
      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - timestamp) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        setTimerDisplay(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);

        if (status === 'empty' && elapsed >= 120 && !table.isOfficialDone) {
          setIsGhost(true);
        } else {
          setIsGhost(false);
        }
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setTimerDisplay('');
      setIsGhost(false);
    }
    return () => clearInterval(interval);
  }, [timestamp, status, table.isOfficialDone]);

  let effectiveState = status;
  if (table.isOfficialDone) effectiveState = 'complete';
  else if (isGhost) effectiveState = 'ghost';

  const styles = {
    default: 'border-bord-light bg-surf',
    playing: 'border-st-playing bg-red-500/10',
    judge: 'border-st-judge bg-amber-500/10',
    empty: 'border-st-empty bg-emerald-500/10',
    ghost: 'border-st-ghost bg-purple-500/20 animate-pulse-ghost',
    complete: 'border-emerald-700 bg-emerald-700/10 opacity-65',
  };

  const numColors = {
    default: 'text-st-default',
    playing: 'text-red-300',
    judge: 'text-amber-200',
    empty: 'text-emerald-200',
    ghost: 'text-purple-200',
    complete: 'text-emerald-300',
  };

  const badgeStyles = {
    default: 'bg-surf2 text-muted border border-bord',
    playing: 'bg-st-playing text-white',
    judge: 'bg-st-judge text-black',
    empty: 'bg-st-empty text-black',
    ghost: 'bg-st-ghost text-white animate-blink',
    complete: 'bg-emerald-800 text-emerald-200',
  };

  const badgeTexts = {
    default: 'IN PROGRESS',
    playing: 'PLAYING',
    judge: 'JUDGE',
    empty: 'EMPTY',
    ghost: '⚠️ GHOST',
    complete: 'COMPLETED',
  };

  let longPressTimer: ReturnType<typeof setTimeout>;

  const handleTouchStart = () => {
    longPressTimer = setTimeout(() => {
      onLongPress(table.num);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) clearTimeout(longPressTimer);
  };

  return (
    <div
      className={`border-2 rounded-xl p-3.5 flex flex-col justify-between min-h-[130px] cursor-pointer select-none transition-all duration-150 hover:-translate-y-1 hover:shadow-2xl active:scale-95 relative overflow-hidden ${styles[effectiveState]}`}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => onStateCycle(table.num)}
    >
      <div className="flex justify-between items-center mb-2">
        <span className={`font-bebas text-3xl leading-none tracking-wide ${numColors[effectiveState]}`}>
          Table {table.num}
        </span>
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wide ${badgeStyles[effectiveState]}`}>
          {badgeTexts[effectiveState]}
        </span>
      </div>

      <div className="text-xs font-bold text-white flex flex-col gap-0.5 mb-2 leading-tight">
        <div className="truncate">{table.p1}{p1Check.full ? ' 🃏' : p1Check.partial ? ' 🔍' : ''}</div>
        <div className="text-[10px] font-semibold text-muted">vs</div>
        <div className="truncate">{table.p2}{p2Check.full ? ' 🃏' : p2Check.partial ? ' 🔍' : ''}</div>
      </div>

      <div className="flex justify-between items-center text-[11px] text-muted font-bold pt-1.5 border-t border-white/5 mb-1.5">
        <span>Tap to cycle</span>
        <span className="font-mono text-xs font-bold">
          {effectiveState === 'judge' ? `⏱️ ${timerDisplay}` : ''}
          {effectiveState === 'empty' ? `⏱️ ${timerDisplay}` : ''}
          {effectiveState === 'ghost' ? `⚠️ GHOST (${timerDisplay})` : ''}
        </span>
      </div>

      {translationRequired ? (
        <button
          type="button"
          className="w-full text-[11px] p-1.5 bg-blue-600/80 border border-blue-400 rounded text-white font-bold cursor-pointer hover:bg-blue-500 transition-colors shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          onClick={(e) => {
            e.stopPropagation();
            const event = new CustomEvent('p2p_translation_accept', { detail: { tableNum: table.num, key: `${divisionId}_R${round}_${table.num}` } });
            window.dispatchEvent(event);
          }}
        >
          🔵 Accept Translation ({translationRequired})
        </button>
      ) : (
        <button
          type="button"
          className="w-full text-[11px] p-1.5 bg-white/5 border border-white/20 rounded text-white cursor-pointer hover:bg-white/10 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onRequestTranslation(table.num);
          }}
        >
          🌐 Req. Translation
        </button>
      )}
    </div>
  );
};
