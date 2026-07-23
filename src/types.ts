export interface Player {
  id: string;
  name: string;
  t: number;   // Tank weight 1-8
  d: number;   // DPS weight 1-8
  s: number;   // Support weight 1-8
  locked_role: RoleKey | null;
}

export type RoleKey = 'T' | 'DPS' | 'S';
export type TeamSize = 4 | 5 | 6;
export type BalanceMode = 'weighted' | 'random';

export interface TeamConfig {
  teamSize: TeamSize;
  mode: BalanceMode;
}

export interface TeamResult {
  teamA: AssignedPlayer[];
  teamB: AssignedPlayer[];
  teamSize: TeamSize;
  mode: BalanceMode;
  diffMsg: string;
}

export interface AssignedPlayer extends Player {
  assigned_role: RoleKey;
}

export const ROLE_CONFIGS: Record<TeamSize, Record<RoleKey, number>> = {
  4: { T: 1, DPS: 2, S: 1 },
  5: { T: 1, DPS: 2, S: 2 },
  6: { T: 2, DPS: 2, S: 2 },
};

export const ROLE_LABELS: Record<RoleKey, string> = {
  T: '重装',
  DPS: '输出',
  S: '辅助',
};

export const ROLE_ICONS: Record<RoleKey, string> = {
  T: '🛡️',
  DPS: '⚔️',
  S: '💉',
};
