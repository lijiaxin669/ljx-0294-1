import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Guest, Table, Seat, Rule, TableCapacity, ConflictResult, SeatingState } from '../types';
import { generateId } from '../utils/idGenerator';
import { getRandomAvatarColor } from '../utils/colors';
import { ConflictDetectionEngine } from '../engine/ConflictDetectionEngine';
import { mockGuests, mockTables, createInitialRules } from '../data/mockData';

const MAX_HISTORY = 50;

interface HistoryEntry {
  guests: Guest[];
  tables: Table[];
  seats: Seat[];
  rules: Rule[];
}

interface SeatingStore extends SeatingState {
  history: HistoryEntry[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  isMultiSelectMode: boolean;

  initMockData: () => void;
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;

  addGuest: (guest: Omit<Guest, 'id' | 'createdAt' | 'avatarColor'>) => void;
  addGuestWithAutoRule: (guest: Omit<Guest, 'id' | 'createdAt' | 'avatarColor'>) => void;
  removeGuest: (id: string) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;

  addTable: (table: Omit<Table, 'id' | 'createdAt'>) => void;
  removeTable: (id: string) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;

  seatGuest: (guestId: string, tableId: string, positionIndex: number) => ConflictResult;
  seatSelectedGuests: (tableId: string, startPosition?: number) => ConflictResult;
  unseatGuest: (guestId: string) => void;
  unseatSelectedGuests: () => void;
  moveGuest: (guestId: string, newTableId: string, newPositionIndex: number) => ConflictResult;

  addRule: (rule: Omit<Rule, 'id'>) => void;
  removeRule: (id: string) => void;

  selectGuest: (id: string, multi?: boolean) => void;
  toggleMultiSelectMode: () => void;
  clearSelection: () => void;
  setDraggingGuest: (id: string | null) => void;
  setHoveredSeat: (id: string | null) => void;
  setConflictMessage: (message: string | null) => void;

  checkConflicts: (guestId: string, tableId: string, positionIndex?: number) => ConflictResult;
  isGuestSeated: (guestId: string) => boolean;
  getSeatedGuests: (tableId: string) => Guest[];
  getUnseatedGuests: () => Guest[];
  getGuestByName: (name: string) => Guest | undefined;
  clearAll: () => void;
}

const initializeSeatsForTable = (tableId: string, capacity: number): Seat[] => {
  return Array.from({ length: capacity }, (_, i) => ({
    id: `${tableId}-seat-${i}`,
    tableId,
    guestId: null,
    positionIndex: i,
  }));
};

export const useSeatingStore = create<SeatingStore>()(
  persist(
    (set, get) => ({
      guests: [],
      tables: [],
      seats: [],
      rules: [],
      selectedGuestIds: [],
      selectedTableId: null,
      draggingGuestId: null,
      hoveredSeatId: null,
      conflictMessage: null,
      history: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false,
      isMultiSelectMode: false,

      initMockData: () => {
        const guests = mockGuests.map(g => ({ ...g, id: generateId() }));
        const tables = mockTables.map(t => ({ ...t, id: generateId() }));
        const seats = tables.flatMap(t => initializeSeatsForTable(t.id, t.capacity));
        const rules = createInitialRules(guests);

        const historyEntry: HistoryEntry = { guests, tables, seats, rules };

        set({
          guests,
          tables,
          seats,
          rules,
          history: [historyEntry],
          historyIndex: 0,
          canUndo: false,
          canRedo: false,
        });
      },

      saveToHistory: () => {
        const { guests, tables, seats, rules, history, historyIndex } = get();
        const newEntry: HistoryEntry = {
          guests: JSON.parse(JSON.stringify(guests)),
          tables: JSON.parse(JSON.stringify(tables)),
          seats: JSON.parse(JSON.stringify(seats)),
          rules: JSON.parse(JSON.stringify(rules)),
        };

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newEntry);

        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
        }

        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
          canUndo: newHistory.length > 1,
          canRedo: false,
        });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex <= 0) return;

        const newIndex = historyIndex - 1;
        const entry = history[newIndex];

        set({
          guests: entry.guests,
          tables: entry.tables,
          seats: entry.seats,
          rules: entry.rules,
          historyIndex: newIndex,
          canUndo: newIndex > 0,
          canRedo: true,
        });
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;

        const newIndex = historyIndex + 1;
        const entry = history[newIndex];

        set({
          guests: entry.guests,
          tables: entry.tables,
          seats: entry.seats,
          rules: entry.rules,
          historyIndex: newIndex,
          canUndo: true,
          canRedo: newIndex < history.length - 1,
        });
      },

      addGuest: (guest) => {
        const newGuest: Guest = {
          ...guest,
          id: generateId(),
          avatarColor: getRandomAvatarColor(),
          createdAt: Date.now(),
        };
        set(state => ({ guests: [...state.guests, newGuest] }));
        get().saveToHistory();
      },

      addGuestWithAutoRule: (guest) => {
        const newGuest: Guest = {
          ...guest,
          id: generateId(),
          avatarColor: getRandomAvatarColor(),
          createdAt: Date.now(),
        };

        const { guests } = get();
        const allGuests = [...guests, newGuest];
        const rulesToAdd: Omit<Rule, 'id'>[] = [];

        if (guest.dietaryNote) {
          const note = guest.dietaryNote;
          
          const adjacentMatch = note.match(/(挨着|和.*一起|必须挨着|要和.*坐|跟.*一起|挨着.*坐)/);
          if (adjacentMatch) {
            const nameMatch = note.match(/(挨着|和|跟|要和)\s*([^\s，,。.、]+)/);
            if (nameMatch && nameMatch[2]) {
              const targetName = nameMatch[2];
              const targetGuest = allGuests.find(g => g.name === targetName);
              if (targetGuest && targetGuest.id !== newGuest.id) {
                rulesToAdd.push({
                  type: 'MUST_ADJACENT',
                  guestAId: newGuest.id,
                  guestBId: targetGuest.id,
                  description: `${newGuest.name} 需要挨着 ${targetGuest.name} 就坐`,
                });
              }
            }
          }

          const notSameMatch = note.match(/(不能和.*同桌|不要和.*坐|不和.*同桌|避开.*坐)/);
          if (notSameMatch) {
            const nameMatch = note.match(/(不能和|不要和|不和|避开)\s*([^\s，,。.、]+)/);
            if (nameMatch && nameMatch[2]) {
              const targetName = nameMatch[2];
              const targetGuest = allGuests.find(g => g.name === targetName);
              if (targetGuest && targetGuest.id !== newGuest.id) {
                rulesToAdd.push({
                  type: 'NOT_SAME_TABLE',
                  guestAId: newGuest.id,
                  guestBId: targetGuest.id,
                  description: `${newGuest.name} 不能与 ${targetGuest.name} 同桌`,
                });
              }
            }
          }

          const distanceMatch = note.match(/(间隔.*桌|离.*桌远一点|和.*隔.*桌)/);
          if (distanceMatch) {
            const nameMatch = note.match(/(间隔|离|和)\s*([^\s，,。.、]+)/);
            const numMatch = note.match(/(\d+)\s*桌/);
            if (nameMatch && nameMatch[2]) {
              const targetName = nameMatch[2];
              const minDistance = numMatch ? parseInt(numMatch[1]) : 1;
              const targetGuest = allGuests.find(g => g.name === targetName);
              if (targetGuest && targetGuest.id !== newGuest.id) {
                rulesToAdd.push({
                  type: 'MIN_TABLES_DISTANCE',
                  guestAId: newGuest.id,
                  guestBId: targetGuest.id,
                  value: minDistance,
                  description: `${newGuest.name} 需要与 ${targetGuest.name} 间隔至少 ${minDistance} 桌`,
                });
              }
            }
          }
        }

        if (rulesToAdd.length > 0) {
          const newRules = rulesToAdd.map(r => ({ ...r, id: generateId() }));
          set(state => ({
            guests: [...state.guests, newGuest],
            rules: [...state.rules, ...newRules],
          }));
        } else {
          set(state => ({ guests: [...state.guests, newGuest] }));
        }
        get().saveToHistory();
      },

      removeGuest: (id) => {
        set(state => ({
          guests: state.guests.filter(g => g.id !== id),
          seats: state.seats.map(s =>
            s.guestId === id ? { ...s, guestId: null } : s
          ),
          rules: state.rules.filter(r => r.guestAId !== id && r.guestBId !== id),
          selectedGuestIds: state.selectedGuestIds.filter(gid => gid !== id),
        }));
        get().saveToHistory();
      },

      updateGuest: (id, updates) => {
        set(state => ({
          guests: state.guests.map(g =>
            g.id === id ? { ...g, ...updates } : g
          ),
        }));
      },

      addTable: (table) => {
        const newTable: Table = {
          ...table,
          id: generateId(),
          createdAt: Date.now(),
        };
        const newSeats = initializeSeatsForTable(newTable.id, newTable.capacity);

        set(state => ({
          tables: [...state.tables, newTable],
          seats: [...state.seats, ...newSeats],
        }));
        get().saveToHistory();
      },

      removeTable: (id) => {
        set(state => ({
          tables: state.tables.filter(t => t.id !== id),
          seats: state.seats.filter(s => s.tableId !== id),
          selectedTableId: state.selectedTableId === id ? null : state.selectedTableId,
        }));
        get().saveToHistory();
      },

      updateTable: (id, updates) => {
        set(state => ({
          tables: state.tables.map(t =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      seatGuest: (guestId, tableId, positionIndex) => {
        const { guests, tables, seats, rules } = get();
        const engine = new ConflictDetectionEngine(rules, tables, seats, guests);
        const conflict = engine.check(guestId, tableId, positionIndex);

        if (conflict.hasConflict) {
          set({ conflictMessage: conflict.message });
          return conflict;
        }

        set(state => ({
          seats: state.seats.map(s => {
            if (s.tableId === tableId && s.positionIndex === positionIndex) {
              return { ...s, guestId };
            }
            if (s.guestId === guestId) {
              return { ...s, guestId: null };
            }
            return s;
          }),
          conflictMessage: null,
        }));
        get().saveToHistory();

        return { hasConflict: false, rule: null, message: '' };
      },

      unseatGuest: (guestId) => {
        set(state => ({
          seats: state.seats.map(s =>
            s.guestId === guestId ? { ...s, guestId: null } : s
          ),
        }));
        get().saveToHistory();
      },

      moveGuest: (guestId, newTableId, newPositionIndex) => {
        return get().seatGuest(guestId, newTableId, newPositionIndex);
      },

      addRule: (rule) => {
        const newRule: Rule = {
          ...rule,
          id: generateId(),
        };
        set(state => ({ rules: [...state.rules, newRule] }));
        get().saveToHistory();
      },

      removeRule: (id) => {
        set(state => ({
          rules: state.rules.filter(r => r.id !== id),
        }));
        get().saveToHistory();
      },

      selectGuest: (id, multi = false) => {
        const { isMultiSelectMode } = get();
        const useMulti = multi || isMultiSelectMode;
        set(state => {
          if (useMulti) {
            const isSelected = state.selectedGuestIds.includes(id);
            return {
              selectedGuestIds: isSelected
                ? state.selectedGuestIds.filter(gid => gid !== id)
                : [...state.selectedGuestIds, id],
            };
          }
          return { selectedGuestIds: [id] };
        });
      },

      toggleMultiSelectMode: () => {
        set(state => ({
          isMultiSelectMode: !state.isMultiSelectMode,
          selectedGuestIds: state.isMultiSelectMode ? [] : state.selectedGuestIds,
        }));
      },

      clearSelection: () => {
        set({ selectedGuestIds: [] });
      },

      seatSelectedGuests: (tableId, startPosition = 0) => {
        const { selectedGuestIds, guests, tables, seats, rules } = get();
        const table = tables.find(t => t.id === tableId);
        if (!table || selectedGuestIds.length === 0) {
          return { hasConflict: false, rule: null, message: '' };
        }

        const tableSeats = seats
          .filter(s => s.tableId === tableId && s.guestId === null)
          .sort((a, b) => a.positionIndex - b.positionIndex);

        const unseatedSelectedGuests = selectedGuestIds.filter(
          gid => !seats.some(s => s.guestId === gid)
        );

        if (tableSeats.length < unseatedSelectedGuests.length) {
          const message = `❌ 座位不足，需要 ${unseatedSelectedGuests.length} 个座位，仅剩 ${tableSeats.length} 个`;
          set({ conflictMessage: message });
          setTimeout(() => set({ conflictMessage: null }), 2000);
          return { hasConflict: true, rule: null, message };
        }

        const engine = new ConflictDetectionEngine(rules, tables, seats, guests);
        const conflicts: ConflictResult[] = [];

        for (let i = 0; i < unseatedSelectedGuests.length; i++) {
          const guestId = unseatedSelectedGuests[i];
          const seatIndex = (startPosition + i) % table.capacity;
          const seat = tableSeats.find(s => s.positionIndex === seatIndex) || tableSeats[i];
          
          if (seat) {
            const conflict = engine.check(guestId, tableId, seat.positionIndex);
            if (conflict.hasConflict) {
              conflicts.push(conflict);
            }
          }
        }

        if (conflicts.length > 0) {
          const message = conflicts[0].message + ` (还有 ${conflicts.length - 1} 个冲突)`;
          set({ conflictMessage: message });
          setTimeout(() => set({ conflictMessage: null }), 2000);
          return conflicts[0];
        }

        const newSeats = [...seats];
        for (let i = 0; i < unseatedSelectedGuests.length; i++) {
          const guestId = unseatedSelectedGuests[i];
          const seatIndex = (startPosition + i) % table.capacity;
          const seat = tableSeats.find(s => s.positionIndex === seatIndex) || tableSeats[i];
          
          if (seat) {
            const seatIdx = newSeats.findIndex(s => s.id === seat.id);
            if (seatIdx !== -1) {
              newSeats[seatIdx] = { ...newSeats[seatIdx], guestId };
            }
          }
        }

        set({ seats: newSeats, conflictMessage: null, selectedGuestIds: [] });
        get().saveToHistory();

        return { hasConflict: false, rule: null, message: '' };
      },

      unseatSelectedGuests: () => {
        const { selectedGuestIds } = get();
        if (selectedGuestIds.length === 0) return;

        set(state => ({
          seats: state.seats.map(s =>
            selectedGuestIds.includes(s.guestId!) ? { ...s, guestId: null } : s
          ),
          selectedGuestIds: [],
        }));
        get().saveToHistory();
      },

      getGuestByName: (name) => {
        return get().guests.find(g => g.name === name);
      },

      setDraggingGuest: (id) => {
        set({ draggingGuestId: id });
      },

      setHoveredSeat: (id) => {
        set({ hoveredSeatId: id });
      },

      setConflictMessage: (message) => {
        set({ conflictMessage: message });
      },

      checkConflicts: (guestId, tableId, positionIndex) => {
        const { guests, tables, seats, rules } = get();
        const engine = new ConflictDetectionEngine(rules, tables, seats, guests);
        return engine.check(guestId, tableId, positionIndex);
      },

      isGuestSeated: (guestId) => {
        return get().seats.some(s => s.guestId === guestId);
      },

      getSeatedGuests: (tableId) => {
        const { seats, guests } = get();
        const tableSeats = seats.filter(s => s.tableId === tableId && s.guestId);
        return tableSeats
          .sort((a, b) => a.positionIndex - b.positionIndex)
          .map(s => guests.find(g => g.id === s.guestId)!)
          .filter(Boolean);
      },

      getUnseatedGuests: () => {
        const { seats, guests } = get();
        const seatedGuestIds = new Set(seats.filter(s => s.guestId).map(s => s.guestId));
        return guests.filter(g => !seatedGuestIds.has(g.id));
      },

      clearAll: () => {
        set({
          guests: [],
          tables: [],
          seats: [],
          rules: [],
          selectedGuestIds: [],
          selectedTableId: null,
          draggingGuestId: null,
          hoveredSeatId: null,
          conflictMessage: null,
          history: [],
          historyIndex: -1,
          canUndo: false,
          canRedo: false,
        });
      },
    }),
    {
      name: 'seating-planner-storage',
      partialize: (state) => ({
        guests: state.guests,
        tables: state.tables,
        seats: state.seats,
        rules: state.rules,
        history: state.history,
        historyIndex: state.historyIndex,
      }),
    }
  )
);
