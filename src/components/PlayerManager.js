import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { ROLE_LABELS, ROLE_ICONS } from '../types';
import { loadPlayers, addPlayer, updatePlayer, deletePlayer, deleteAllPlayers, generateId } from '../lib/dataManager';
import { exportCSV, parseCSV } from '../lib/csv';
const WEIGHT_GRADES = ['青铜', '白银', '黄金', '铂金', '钻石', '大师', '宗师', '英杰'];
export default function PlayerManager({ onPlayersChange }) {
    const [players, setPlayers] = useState([]);
    const [name, setName] = useState('');
    const [tWeight, setTWeight] = useState(5);
    const [dWeight, setDWeight] = useState(5);
    const [sWeight, setSWeight] = useState(5);
    const [lockedRole, setLockedRole] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [toast, setToast] = useState('');
    const fileInputRef = useRef(null);
    useEffect(() => {
        setPlayers(loadPlayers());
    }, []);
    useEffect(() => {
        onPlayersChange?.(players.length);
    }, [players.length, onPlayersChange]);
    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 2000);
    };
    const handleSubmit = () => {
        if (!name.trim())
            return showToast('请输入玩家名称');
        const player = {
            id: editingId || generateId(),
            name: name.trim().slice(0, 20),
            t: tWeight,
            d: dWeight,
            s: sWeight,
            locked_role: lockedRole || null,
        };
        if (editingId) {
            setPlayers(updatePlayer(player.id, player));
            showToast('已更新');
        }
        else {
            setPlayers(addPlayer(player));
            showToast('已添加');
        }
        resetForm();
    };
    const resetForm = () => {
        setName('');
        setTWeight(5);
        setDWeight(5);
        setSWeight(5);
        setLockedRole('');
        setEditingId(null);
    };
    const handleEdit = (p) => {
        setName(p.name);
        setTWeight(p.t);
        setDWeight(p.d);
        setSWeight(p.s);
        setLockedRole(p.locked_role || '');
        setEditingId(p.id);
    };
    const handleDelete = (id) => {
        setPlayers(deletePlayer(id));
        if (editingId === id)
            resetForm();
        showToast('已删除');
    };
    const handleExport = () => {
        const csv = exportCSV(players);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'players.csv';
        a.click();
        URL.revokeObjectURL(url);
        showToast('已导出');
    };
    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const imported = parseCSV(evt.target?.result || '');
                const existing = loadPlayers();
                const merged = [...existing, ...imported];
                localStorage.setItem('tb_players', JSON.stringify(merged));
                setPlayers(merged);
                showToast(`导入 ${imported.length} 人`);
            }
            catch (err) {
                showToast(err.message || '导入失败');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };
    const handleClearAll = () => {
        if (players.length === 0)
            return;
        if (!confirm('确定删除所有玩家数据？不可撤销。'))
            return;
        deleteAllPlayers();
        setPlayers([]);
        resetForm();
        showToast('已清空');
    };
    const weightOptions = WEIGHT_GRADES.map((g, i) => (_jsxs("option", { value: i + 1, children: [i + 1, " (", g, ")"] }, i + 1)));
    return (_jsxs("div", { className: "pm-container", children: [toast && _jsx("div", { className: "toast", children: toast }), _jsxs("div", { className: "pm-form", children: [_jsx("div", { className: "pm-form-row", children: _jsx("input", { className: "input", placeholder: "\u73A9\u5BB6\u540D\u79F0", value: name, onChange: e => setName(e.target.value), maxLength: 20 }) }), _jsxs("div", { className: "pm-form-sliders", children: [_jsxs("label", { children: ["\uD83D\uDEE1\uFE0F T ", _jsx("select", { value: tWeight, onChange: e => setTWeight(+e.target.value), children: weightOptions })] }), _jsxs("label", { children: ["\u2694\uFE0F DPS ", _jsx("select", { value: dWeight, onChange: e => setDWeight(+e.target.value), children: weightOptions })] }), _jsxs("label", { children: ["\uD83D\uDC89 S ", _jsx("select", { value: sWeight, onChange: e => setSWeight(+e.target.value), children: weightOptions })] }), _jsxs("label", { className: "lock-label", children: ["\u9501\u5B9A\u4F4D\u7F6E", _jsxs("select", { value: lockedRole, onChange: e => setLockedRole(e.target.value), children: [_jsx("option", { value: "", children: "\u4E0D\u9501" }), _jsx("option", { value: "T", children: "T" }), _jsx("option", { value: "DPS", children: "DPS" }), _jsx("option", { value: "S", children: "S" })] })] })] }), _jsxs("div", { className: "pm-form-actions", children: [_jsx("button", { className: "btn btn-primary", onClick: handleSubmit, children: editingId ? '更新' : '添加' }), editingId && _jsx("button", { className: "btn", onClick: resetForm, children: "\u53D6\u6D88" }), _jsxs("span", { className: "pm-count", children: [players.length, " \u4EBA"] })] })] }), _jsxs("div", { className: "pm-actions", children: [_jsx("button", { className: "btn btn-sm", onClick: handleExport, children: "\uD83D\uDCE5 \u5BFC\u51FA CSV" }), _jsx("button", { className: "btn btn-sm", onClick: () => fileInputRef.current?.click(), children: "\uD83D\uDCE4 \u5BFC\u5165 CSV" }), _jsx("input", { ref: fileInputRef, type: "file", accept: ".csv,.tsv", style: { display: 'none' }, onChange: handleImport }), _jsx("button", { className: "btn btn-sm btn-danger", onClick: handleClearAll, children: "\uD83D\uDDD1\uFE0F \u6E05\u7A7A" })] }), _jsxs("div", { className: "pm-list", children: [players.length === 0 && _jsx("p", { className: "pm-empty", children: "\u8FD8\u6CA1\u6709\u73A9\u5BB6\uFF0C\u5728\u4E0A\u65B9\u6DFB\u52A0" }), players.map(p => (_jsxs("div", { className: `pm-card ${editingId === p.id ? 'pm-card--editing' : ''}`, children: [_jsxs("div", { className: "pm-card-name", children: [_jsx("span", { children: p.name }), p.locked_role && _jsxs("span", { className: "lock-badge", children: [ROLE_ICONS[p.locked_role], " ", ROLE_LABELS[p.locked_role]] })] }), _jsxs("div", { className: "pm-card-weights", children: [_jsxs("span", { className: "weight-t", children: ["\uD83D\uDEE1\uFE0F ", p.t] }), _jsxs("span", { className: "weight-d", children: ["\u2694\uFE0F ", p.d] }), _jsxs("span", { className: "weight-s", children: ["\uD83D\uDC89 ", p.s] })] }), _jsxs("div", { className: "pm-card-actions", children: [_jsx("button", { className: "btn-icon", onClick: () => handleEdit(p), title: "\u7F16\u8F91", children: "\u270F\uFE0F" }), _jsx("button", { className: "btn-icon", onClick: () => handleDelete(p.id), title: "\u5220\u9664", children: "\uD83D\uDDD1\uFE0F" })] })] }, p.id)))] })] }));
}
