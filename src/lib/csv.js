export function exportCSV(players) {
    const header = 'name,t,d,s,locked_role';
    const rows = players.map(p => `${escapeCsv(p.name)},${p.t},${p.d},${p.s},${p.locked_role || ''}`);
    // UTF-8 BOM for Excel compatibility
    return '\uFEFF' + [header, ...rows].join('\n');
}
function escapeCsv(val) {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
}
export function parseCSV(text) {
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
    if (lines.length < 2)
        throw new Error('CSV 为空或只有表头');
    const header = lines[0].split(',');
    const nameIdx = header.indexOf('name');
    const tIdx = header.indexOf('t');
    const dIdx = header.indexOf('d');
    const sIdx = header.indexOf('s');
    const lockIdx = header.indexOf('locked_role');
    if (nameIdx < 0 || tIdx < 0)
        throw new Error('CSV 格式错误：需要 name,t,d,s,locked_role');
    const players = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        const locked = lockIdx >= 0 ? cols[lockIdx]?.trim() || '' : '';
        const lockedRole = locked === 'T' ? 'T' : locked === 'DPS' ? 'DPS' : locked === 'S' ? 'S' : null;
        players.push({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + i,
            name: cols[nameIdx]?.trim() || `玩家${i}`,
            t: clamp(parseInt(cols[tIdx]), 1, 8),
            d: clamp(parseInt(cols[dIdx]), 1, 8),
            s: clamp(parseInt(cols[sIdx]), 1, 8),
            locked_role: lockedRole,
        });
    }
    return players;
}
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuote && line[i + 1] === '"') {
                current += '"';
                i++;
            }
            else {
                inQuote = !inQuote;
            }
        }
        else if (ch === ',' && !inQuote) {
            result.push(current);
            current = '';
        }
        else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}
function clamp(v, min, max) {
    return Math.max(min, Math.min(max, isNaN(v) ? 5 : v));
}
