const STORAGE_KEY = 'tb_players';
export function loadPlayers() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        return JSON.parse(raw);
    }
    catch {
        return [];
    }
}
export function savePlayers(players) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}
export function addPlayer(player) {
    const list = loadPlayers();
    list.push(player);
    savePlayers(list);
    return list;
}
export function updatePlayer(id, data) {
    const list = loadPlayers();
    const idx = list.findIndex(p => p.id === id);
    if (idx >= 0) {
        list[idx] = { ...list[idx], ...data };
        savePlayers(list);
    }
    return list;
}
export function deletePlayer(id) {
    const list = loadPlayers().filter(p => p.id !== id);
    savePlayers(list);
    return list;
}
export function deleteAllPlayers() {
    localStorage.removeItem(STORAGE_KEY);
}
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
