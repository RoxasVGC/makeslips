import { create } from 'zustand';

export interface LogEntry {
  timestamp: Date;
  message: string;
}

interface DebugStore {
  logs: LogEntry[];
  addLog: (msg: string) => void;
  clearLogs: () => void;
}

export const useDebugStore = create<DebugStore>((set) => ({
  logs: [],
  addLog: (msg) => set((state) => ({ 
    logs: [{ timestamp: new Date(), message: msg }, ...state.logs].slice(0, 50) 
  })),
  clearLogs: () => set({ logs: [] })
}));
