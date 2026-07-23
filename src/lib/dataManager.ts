import type { Player } from '../types';

const STORAGE_KEY = 'tb_players';

export function loadPlayers(): Player[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Player[];
  } catch { return []; }
}

export function savePlayers(players: Player[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}

export function addPlayer(player: Player): Player[] {
  const list = loadPlayers();
  list.push(player);
  savePlayers(list);
  return list;
}

export function updatePlayer(id: string, data: Partial<Player>): Player[] {
  const list = loadPlayers();
  const idx = list.findIndex(p => p.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...data };
    savePlayers(list);
  }
  return list;
}

export function deletePlayer(id: string): Player[] {
  const list = loadPlayers().filter(p => p.id !== id);
  savePlayers(list);
  return list;
}

export function deleteAllPlayers() {
  localStorage.removeItem(STORAGE_KEY);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
