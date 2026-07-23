import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ROLE_ICONS, ROLE_LABELS } from '../types';
const T_MULTIPLIER = 1.5;
function calcScores(team) {
    const t = team.filter(p => p.assigned_role === 'T');
    const d = team.filter(p => p.assigned_role === 'DPS');
    const s = team.filter(p => p.assigned_role === 'S');
    const tScore = t.reduce((sum, p) => sum + p.t * T_MULTIPLIER, 0);
    const dScore = d.reduce((sum, p) => sum + p.d, 0);
    const sScore = s.reduce((sum, p) => sum + p.s, 0);
    return { tScore, dScore, sScore, total: tScore + dScore + sScore, t, d, s };
}
export default function ResultDisplay({ result, onRedo, onBack }) {
    const [showWeights, setShowWeights] = useState(false);
    const scoreA = calcScores(result.teamA);
    const scoreB = calcScores(result.teamB);
    const diff = Math.abs(scoreA.total - scoreB.total);
    const renderPlayer = (p) => (_jsxs("div", { className: "rd-player", children: [_jsx("span", { className: "rd-role-icon", children: ROLE_ICON_MAP[p.assigned_role] }), _jsx("span", { className: "rd-name", children: p.name }), showWeights && (_jsx("span", { className: "rd-weight", children: p[p.assigned_role === 'T' ? 't' : p.assigned_role === 'DPS' ? 'd' : 's'] }))] }, p.id));
    return (_jsxs("div", { className: "rd-container", children: [_jsxs("div", { className: "rd-header", children: [_jsx("span", { className: "rd-mode", children: result.mode === 'weighted' ? '⚖️ 权重模式' : '🎲 随机模式' }), _jsxs("span", { className: "rd-size", children: [result.teamSize, "v", result.teamSize] }), _jsxs("span", { className: "rd-diff", children: ["\u5DEE\u8DDD ", diff.toFixed(1)] }), _jsxs("label", { className: "rd-toggle", children: [_jsx("input", { type: "checkbox", checked: showWeights, onChange: e => setShowWeights(e.target.checked) }), "\u663E\u793A\u6743\u91CD"] })] }), _jsxs("div", { className: "rd-teams", children: [_jsxs("div", { className: "rd-team rd-team-a", children: [_jsxs("h3", { className: "rd-team-title", children: ["Team A", _jsxs("span", { className: "rd-score", children: ["\u603B\u5206 ", scoreA.total.toFixed(0)] })] }), ['T', 'DPS', 'S'].map(role => {
                                const players = role === 'T' ? scoreA.t : role === 'DPS' ? scoreA.d : scoreA.s;
                                return (_jsxs("div", { className: "rd-role-group", children: [_jsxs("div", { className: "rd-role-header", children: [ROLE_ICONS[role], " ", ROLE_LABELS[role], _jsx("span", { className: "rd-role-score", children: role === 'T' ? scoreA.tScore.toFixed(0) : role === 'DPS' ? scoreA.dScore.toFixed(0) : scoreA.sScore.toFixed(0) })] }), players.map(renderPlayer)] }, role));
                            })] }), _jsx("div", { className: "rd-vs", children: "VS" }), _jsxs("div", { className: "rd-team rd-team-b", children: [_jsxs("h3", { className: "rd-team-title", children: ["Team B", _jsxs("span", { className: "rd-score", children: ["\u603B\u5206 ", scoreB.total.toFixed(0)] })] }), ['T', 'DPS', 'S'].map(role => {
                                const players = role === 'T' ? scoreB.t : role === 'DPS' ? scoreB.d : role === 'S' ? scoreB.s : [];
                                return (_jsxs("div", { className: "rd-role-group", children: [_jsxs("div", { className: "rd-role-header", children: [ROLE_ICONS[role], " ", ROLE_LABELS[role], _jsx("span", { className: "rd-role-score", children: role === 'T' ? scoreB.tScore.toFixed(0) : role === 'DPS' ? scoreB.dScore.toFixed(0) : scoreB.sScore.toFixed(0) })] }), players.map(renderPlayer)] }, role));
                            })] })] }), _jsxs("div", { className: "rd-actions", children: [_jsx("button", { className: "btn btn-large btn-primary", onClick: onRedo, children: "\uD83D\uDD01 \u91CD\u65B0\u5206\u961F" }), _jsx("button", { className: "btn btn-large", onClick: onBack, children: "\u2190 \u8FD4\u56DE\u914D\u7F6E" })] })] }));
}
const ROLE_ICON_MAP = {
    T: '🛡️',
    DPS: '⚔️',
    S: '💉',
};
