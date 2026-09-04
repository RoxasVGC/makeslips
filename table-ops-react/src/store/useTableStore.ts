import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TournamentData, TableState, PlayerState, MyProfile } from '../types';

interface TableStore {
    tournament: TournamentData | null;
    tableStates: Record<string, TableState>;
    playerStates: Record<string, PlayerState>;
    myProfile: MyProfile;
    
    setMyProfile: (profile: MyProfile) => void;
    setTournament: (data: TournamentData) => void;
    updateTableState: (key: string, state: TableState) => void;
    updatePlayerState: (key: string, state: PlayerState) => void;
    setTableStates: (states: Record<string, TableState>) => void;
    setPlayerStates: (states: Record<string, PlayerState>) => void;
    resetRound: () => void;
    clearSession: () => void;
}

export const useTableStore = create<TableStore>()(
    persist(
        (set) => ({
            tournament: null,
            tableStates: {},
            playerStates: {},
            myProfile: { name: 'Judge', languages: ['EN'] },
            
            setMyProfile: (profile) => set({ myProfile: profile }),
            setTournament: (data) => set({ tournament: data }),
            updateTableState: (key, state) => set((prev) => ({
                tableStates: { ...prev.tableStates, [key]: state }
            })),
            updatePlayerState: (key, state) => set((prev) => ({
                playerStates: { ...prev.playerStates, [key]: state }
            })),
            setTableStates: (states) => set({ tableStates: states }),
            setPlayerStates: (states) => set({ playerStates: states }),
            resetRound: () => set({ tableStates: {}, playerStates: {} }),
            clearSession: () => set({ tournament: null, tableStates: {}, playerStates: {} })
        }),
        {
            name: 'table-ops-storage', // unique name for localStorage key
        }
    )
);
