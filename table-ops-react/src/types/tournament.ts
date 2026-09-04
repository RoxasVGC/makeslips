import type { Table } from './table';

export interface Division {
    name: string;
    round: number;
    rawLabel: string;
    tables: Table[];
}

export interface TournamentData {
    url: string;
    id: string;
    title: string;
    dateStr: string;
    activeDivisionId: string;
    divisions: Record<string, Division>;
}
