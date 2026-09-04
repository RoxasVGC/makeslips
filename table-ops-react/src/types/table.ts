export interface Table {
    num: number;
    p1: string;
    p2: string;
    isOfficialDone: boolean;
}

export type TableStatus = 'default' | 'playing' | 'judge' | 'empty' | 'ghost' | 'complete';

export interface TableState {
    status: TableStatus;
    timestamp: number;
    peerId?: string;
    translationRequired?: string;
}
