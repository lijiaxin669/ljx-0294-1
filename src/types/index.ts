export type Seniority = 'elder' | 'peer' | 'junior';
export type TableCapacity = 8 | 10 | 12;
export type RuleType = 'NOT_SAME_TABLE' | 'MIN_TABLES_DISTANCE' | 'MUST_ADJACENT';

export interface Guest {
  id: string;
  name: string;
  seniority: Seniority;
  dietaryNote: string;
  avatarColor: string;
  createdAt: number;
}

export interface Table {
  id: string;
  name: string;
  capacity: TableCapacity;
  x: number;
  y: number;
  createdAt: number;
}

export interface Seat {
  id: string;
  tableId: string;
  guestId: string | null;
  positionIndex: number;
}

export interface Rule {
  id: string;
  type: RuleType;
  guestAId: string;
  guestBId: string;
  value?: number;
  description: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  rule: Rule | null;
  message: string;
}

export interface SeatingStateData {
  guests: Guest[];
  tables: Table[];
  seats: Seat[];
  rules: Rule[];
}

export interface SeatingState extends SeatingStateData {
  selectedGuestIds: string[];
  selectedTableId: string | null;
  draggingGuestId: string | null;
  hoveredSeatId: string | null;
  conflictMessage: string | null;
}

export const SENIORITY_LABELS: Record<Seniority, string> = {
  elder: '长辈',
  peer: '平辈',
  junior: '晚辈',
};

export const SENIORITY_COLORS: Record<Seniority, string> = {
  elder: 'bg-amber-700 text-amber-50',
  peer: 'bg-blue-600 text-white',
  junior: 'bg-emerald-600 text-white',
};

export const TABLE_CAPACITY_OPTIONS: { value: TableCapacity; label: string }[] = [
  { value: 8, label: '8人桌' },
  { value: 10, label: '10人桌' },
  { value: 12, label: '12人桌' },
];

export const RULE_TYPE_OPTIONS: { value: RuleType; label: string; description: string }[] = [
  { value: 'NOT_SAME_TABLE', label: '不可同桌', description: '两位宾客不能坐在同一桌' },
  { value: 'MIN_TABLES_DISTANCE', label: '必须隔桌', description: '两位宾客必须间隔至少N桌' },
  { value: 'MUST_ADJACENT', label: '必须相邻', description: '两位宾客必须相邻而坐' },
];
