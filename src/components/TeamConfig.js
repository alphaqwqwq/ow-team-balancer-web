import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { ROLE_CONFIGS, ROLE_ICONS } from '../types';
const WEIGHT_KEYS = { T: 't', DPS: 'd', S: 's' };
export default function TeamConfig({ players, onStart, config, onConfigChange }) {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [sortBy, setSortBy] = useState('avg');
    const sortDesc = true;
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [overrideRoles, setOverrideRoles] = useState({});
    const totalNeeded = ROLE_CONFIGS[config.teamSize].T * 2 +
        ROLE_CONFIGS[config.teamSize].DPS * 2 +
        ROLE_CONFIGS[config.teamSize].S * 2;
    // Filter & sort
    const filtered = useMemo(() => {
        let list = [...players];
        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p => p.name.toLowerCase().includes(q));
        }
        // Role filter
        if (roleFilter === 'flex') {
            list = list.filter(p => !p.locked_role);
        }
        else if (roleFilter !== 'all') {
            list = list.filter(p => p.locked_role === roleFilter || !p.locked_role);
        }
        // Sort
        list.sort((a, b) => {
            const key = sortBy === 'avg' ? 't' : sortBy;
            const va = sortBy === 'avg' ? (a.t + a.d + a.s) / 3 : a[key];
            const vb = sortBy === 'avg' ? (b.t + b.d + b.s) / 3 : b[key];
            return sortDesc ? vb - va : va - vb;
        });
        return list;
    }, [players, search, roleFilter, sortBy, sortDesc]);
    const toggleSelect = (id) => {
        const next = new Set(selectedIds);
        if (next.has(id))
            next.delete(id);
        else if (next.size < totalNeeded)
            next.add(id);
        setSelectedIds(next);
    };
    const selectAll = () => {
        const ids = new Set(filtered.map(p => p.id));
        setSelectedIds(prev => {
            const next = new Set(prev);
            for (const id of ids)
                next.add(id);
            // Trim to exact needed count
            const arr = [...next].slice(0, totalNeeded);
            return new Set(arr);
        });
    };
    const clearSelection = () => setSelectedIds(new Set());
    const selectedPlayers = players.filter(p => selectedIds.has(p.id));
    const handleStart = () => {
        if (selectedPlayers.length !== totalNeeded) {
            alert(`请恰好选择 ${totalNeeded} 名玩家（当前 ${selectedPlayers.length} 人）`);
            return;
        }
        // Apply role overrides
        const withOverrides = selectedPlayers.map(p => ({
            ...p,
            locked_role: p.id in overrideRoles ? overrideRoles[p.id] : p.locked_role,
        }));
        onStart(withOverrides, config);
    };
    const roleOptions = [
        { label: '全部', value: 'all' },
        { label: '🛡️ T', value: 'T' },
        { label: '⚔️ DPS', value: 'DPS' },
        { label: '💉 S', value: 'S' },
        { label: '灵活(未锁定)', value: 'flex' },
    ];
    const teamSizeInfo = `${config.teamSize}v${config.teamSize}`;
    const cfg = ROLE_CONFIGS[config.teamSize];
    const compStr = `T${cfg.T} DPS${cfg.DPS} S${cfg.S}`;
    return (_jsxs("div", { className: "tc-container", children: [_jsxs("div", { className: "tc-config-bar", children: [_jsxs("div", { className: "tc-config-item", children: [_jsx("label", { children: "\u961F\u4F0D\u89C4\u6A21" }), _jsxs("select", { value: config.teamSize, onChange: e => onConfigChange({ ...config, teamSize: +e.target.value }), className: "select", children: [_jsxs("option", { value: 4, children: ["4v4 ", compStr] }), _jsxs("option", { value: 5, children: ["5v5 ", compStr] }), _jsxs("option", { value: 6, children: ["6v6 ", compStr] })] })] }), _jsxs("div", { className: "tc-config-item", children: [_jsx("label", { children: "\u5206\u961F\u6A21\u5F0F" }), _jsxs("select", { value: config.mode, onChange: e => onConfigChange({ ...config, mode: e.target.value }), className: "select", children: [_jsx("option", { value: "weighted", children: "\u2696\uFE0F \u6743\u91CD\u6A21\u5F0F\uFF08\u63A8\u8350\uFF09" }), _jsx("option", { value: "random", children: "\uD83C\uDFB2 \u968F\u673A\u6A21\u5F0F" })] })] }), _jsxs("div", { className: "tc-info", children: [_jsxs("span", { className: "tc-needed", children: [selectedIds.size, "/", totalNeeded, " \u4EBA"] }), _jsxs("span", { className: "tc-spec", children: [teamSizeInfo, " | ", cfg.T, "T+", cfg.DPS, "DPS+", cfg.S, "S"] })] })] }), _jsxs("div", { className: "tc-filters", children: [_jsx("input", { className: "input", placeholder: "\u641C\u7D22\u73A9\u5BB6\u2026", value: search, onChange: e => setSearch(e.target.value) }), _jsx("select", { value: roleFilter, onChange: e => setRoleFilter(e.target.value), className: "select", children: roleOptions.map(o => _jsx("option", { value: o.value, children: o.label }, o.value)) }), _jsxs("select", { value: sortBy, onChange: e => setSortBy(e.target.value), className: "select", children: [_jsx("option", { value: "avg", children: "\u7EFC\u5408" }), _jsx("option", { value: "t", children: "T\u4F4D" }), _jsx("option", { value: "d", children: "\u8F93\u51FA" }), _jsx("option", { value: "s", children: "\u8F85\u52A9" })] }), _jsx("button", { className: "btn btn-sm", onClick: selectAll, children: "\u5168\u9009\u53EF\u89C1" }), _jsx("button", { className: "btn btn-sm", onClick: clearSelection, children: "\u6E05\u9664" })] }), _jsxs("div", { className: "tc-player-list", children: [filtered.map(p => {
                        const selected = selectedIds.has(p.id);
                        const hasOverride = p.id in overrideRoles;
                        return (_jsxs("div", { className: `tc-player-card ${selected ? 'selected' : ''}`, onClick: () => toggleSelect(p.id), children: [_jsx("div", { className: "tc-pc-check", children: selected ? '✓' : '' }), _jsxs("div", { className: "tc-pc-info", children: [_jsx("span", { className: "tc-pc-name", children: p.name }), _jsxs("div", { className: "tc-pc-weights", children: [_jsxs("span", { className: "weight-t", children: ["\uD83D\uDEE1\uFE0F ", p.t] }), _jsxs("span", { className: "weight-d", children: ["\u2694\uFE0F ", p.d] }), _jsxs("span", { className: "weight-s", children: ["\uD83D\uDC89 ", p.s] }), p.locked_role && !hasOverride && _jsxs("span", { className: "lock-badge-sm", children: [ROLE_ICONS[p.locked_role], "\u9501"] })] })] }), _jsxs("select", { className: "select-sm", value: hasOverride ? (overrideRoles[p.id] || '') : p.locked_role || '', onClick: e => e.stopPropagation(), onChange: e => {
                                        const v = e.target.value;
                                        setOverrideRoles(prev => ({
                                            ...prev,
                                            [p.id]: v === '' ? null : v,
                                        }));
                                    }, children: [_jsx("option", { value: "", children: "\u81EA\u52A8" }), _jsx("option", { value: "T", children: "\uD83D\uDEE1\uFE0F T" }), _jsx("option", { value: "DPS", children: "\u2694\uFE0F DPS" }), _jsx("option", { value: "S", children: "\uD83D\uDC89 S" })] })] }, p.id));
                    }), filtered.length === 0 && _jsx("p", { className: "tc-empty", children: "\u6CA1\u6709\u5339\u914D\u7684\u73A9\u5BB6" })] }), _jsx("div", { className: "tc-bottom", children: _jsx("button", { className: "btn btn-large btn-primary", onClick: handleStart, disabled: selectedIds.size !== totalNeeded, children: "\u26A1 \u5F00\u59CB\u5206\u961F" }) })] }));
}
