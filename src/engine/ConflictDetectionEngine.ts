import type { Rule, Table, Seat, Guest, ConflictResult } from '../types';

export class ConflictDetectionEngine {
  private rules: Rule[];
  private tables: Table[];
  private seats: Seat[];
  private guests: Guest[];

  constructor(rules: Rule[], tables: Table[], seats: Seat[], guests: Guest[]) {
    this.rules = rules;
    this.tables = tables;
    this.seats = seats;
    this.guests = guests;
  }

  public check(guestId: string, targetTableId: string, targetPosition?: number): ConflictResult {
    for (const rule of this.rules) {
      const result = this.checkRule(rule, guestId, targetTableId, targetPosition);
      if (result.hasConflict) {
        return result;
      }
    }
    return { hasConflict: false, rule: null, message: '' };
  }

  public checkAllConflicts(): ConflictResult[] {
    const conflicts: ConflictResult[] = [];
    
    for (const rule of this.rules) {
      const tableA = this.getGuestTableId(rule.guestAId);
      const tableB = this.getGuestTableId(rule.guestBId);
      
      if (!tableA || !tableB) continue;
      
      const posA = this.getGuestPosition(rule.guestAId);
      const result = this.checkRule(rule, rule.guestAId, tableB, posA);
      
      if (result.hasConflict) {
        conflicts.push(result);
      }
    }
    
    return conflicts;
  }

  private checkRule(
    rule: Rule,
    guestId: string,
    targetTableId: string,
    targetPosition?: number
  ): ConflictResult {
    const { type, guestAId, guestBId, value, description } = rule;

    if (guestId !== guestAId && guestId !== guestBId) {
      return { hasConflict: false, rule: null, message: '' };
    }

    const otherGuestId = guestId === guestAId ? guestBId : guestAId;
    const otherGuestTableId = this.getGuestTableId(otherGuestId);

    if (!otherGuestTableId) {
      return { hasConflict: false, rule: null, message: '' };
    }

    const guestAName = this.getGuestName(guestAId);
    const guestBName = this.getGuestName(guestBId);

    switch (type) {
      case 'NOT_SAME_TABLE':
        if (otherGuestTableId === targetTableId) {
          return {
            hasConflict: true,
            rule,
            message: description || `❌ ${guestAName} 与 ${guestBName} 不可同桌`,
          };
        }
        break;

      case 'MIN_TABLES_DISTANCE': {
        const distance = this.calculateTableDistance(targetTableId, otherGuestTableId);
        const minDistance = value || 1;
        if (distance < minDistance) {
          return {
            hasConflict: true,
            rule,
            message: description || `❌ ${guestAName} 与 ${guestBName} 必须至少间隔 ${minDistance} 桌（当前间隔 ${distance} 桌）`,
          };
        }
        break;
      }

      case 'MUST_ADJACENT': {
        if (otherGuestTableId === targetTableId && targetPosition !== undefined) {
          const otherPosition = this.getGuestPosition(otherGuestId);
          if (otherPosition !== null) {
            const table = this.tables.find(t => t.id === targetTableId);
            if (table) {
              const isAdjacent = this.arePositionsAdjacent(
                targetPosition,
                otherPosition,
                table.capacity
              );
              if (!isAdjacent) {
                return {
                  hasConflict: true,
                  rule,
                  message: description || `❌ ${guestAName} 与 ${guestBName} 必须相邻而坐`,
                };
              }
            }
          }
        } else if (otherGuestTableId !== targetTableId) {
          return {
            hasConflict: true,
            rule,
            message: description || `❌ ${guestAName} 与 ${guestBName} 必须相邻而坐（需在同一桌）`,
          };
        }
        break;
      }
    }

    return { hasConflict: false, rule: null, message: '' };
  }

  private getGuestTableId(guestId: string): string | null {
    const seat = this.seats.find(s => s.guestId === guestId);
    return seat?.tableId || null;
  }

  private getGuestPosition(guestId: string): number | null {
    const seat = this.seats.find(s => s.guestId === guestId);
    return seat?.positionIndex ?? null;
  }

  private getGuestName(guestId: string): string {
    const guest = this.guests.find(g => g.id === guestId);
    return guest?.name || '未知宾客';
  }

  private calculateTableDistance(tableIdA: string, tableIdB: string): number {
    const tableA = this.tables.find(t => t.id === tableIdA);
    const tableB = this.tables.find(t => t.id === tableIdB);

    if (!tableA || !tableB) return 0;
    if (tableIdA === tableIdB) return 0;

    const pixelDistance = Math.sqrt(
      Math.pow(tableA.x - tableB.x, 2) + Math.pow(tableA.y - tableB.y, 2)
    );

    return Math.floor(pixelDistance / 350);
  }

  private arePositionsAdjacent(pos1: number, pos2: number, total: number): boolean {
    const diff = Math.abs(pos1 - pos2);
    return diff === 1 || diff === total - 1;
  }
}
