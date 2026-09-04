import type { TournamentData } from './tournament';
import type { TableState } from './table';
import type { PlayerState } from './player';

export type PeerAction = 
  | { type: 'SYNC_BOARD', tournament: TournamentData, tableStates: Record<string, TableState>, playerStates: Record<string, PlayerState>, hostTime?: number }
  | { type: 'UPDATE_TABLE_STATE', key: string, state: TableState }
  | { type: 'UPDATE_PLAYER_STATE', key: string, state: PlayerState }
  | { type: 'TRANSLATION_REQUEST', key: string, tableNum: number, language: string, sender: string }
  | { type: 'TRANSLATION_ACCEPTED', key: string, acceptor: string };
