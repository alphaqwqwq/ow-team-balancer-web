import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { ROLE_CONFIGS } from './types';
import { loadPlayers } from './lib/dataManager';
import { balanceWeightedWithRoles, balanceRandom } from './lib/balancer';
import PlayerManager from './components/PlayerManager';
import TeamConfig from './components/TeamConfig';
import ResultDisplay from './components/ResultDisplay';
import './App.css';
export default function App() {
    const [players, setPlayers] = useState(() => loadPlayers());
    const [view, setView] = useState('players');
    const [teamConfig, setTeamConfig] = useState({ teamSize: 5, mode: 'weighted' });
    const [result, setResult] = useState(null);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const handlePlayersChange = useCallback(() => {
        setPlayers(loadPlayers());
    }, []);
    const handleStart = (selected, config) => {
        let teamA, teamB, diffMsg;
        if (config.mode === 'weighted') {
            const [a, b, msg] = balanceWeightedWithRoles(selected, config.teamSize);
            if (msg && !a.length) {
                alert(msg);
                return;
            }
            [teamA, teamB, diffMsg] = [a, b, msg];
        }
        else {
            const [a, b] = balanceRandom(selected, config.teamSize);
            [teamA, teamB] = [a, b];
            diffMsg = '随机分配';
        }
        setResult({
            teamA: teamA,
            teamB: teamB,
            teamSize: config.teamSize,
            mode: config.mode,
            diffMsg: diffMsg || '',
        });
        setSelectedPlayers(selected);
        setView('result');
    };
    const handleRedo = () => {
        if (selectedPlayers.length) {
            handleStart(selectedPlayers, teamConfig);
        }
    };
    const totalNeeded = ROLE_CONFIGS[teamConfig.teamSize].T * 2 +
        ROLE_CONFIGS[teamConfig.teamSize].DPS * 2 +
        ROLE_CONFIGS[teamConfig.teamSize].S * 2;
    return (_jsxs("div", { className: "app", children: [_jsxs("header", { className: "app-header", children: [_jsx("h1", { className: "app-title", children: "\u2694\uFE0F \u968F\u673A\u5206\u961F\u5668" }), _jsx("span", { className: "app-version", children: "v1.0.0" }), _jsx("span", { className: "app-badge", children: "\u4F4D\u7F6E\u611F\u77E5 \u00B7 T\u4F4D\u00D71.5" }), _jsxs("nav", { className: "app-nav", children: [_jsx("button", { className: `nav-btn ${view === 'players' ? 'active' : ''}`, onClick: () => setView('players'), children: "\uD83D\uDC65 \u73A9\u5BB6\u7BA1\u7406" }), _jsxs("button", { className: `nav-btn ${view === 'config' ? 'active' : ''}`, onClick: () => setView('config'), children: ["\uD83C\uDFAF \u5F00\u59CB\u5206\u961F (", players.length, "\u4EBA)"] }), _jsx("button", { className: `nav-btn ${view === 'result' ? 'active' : ''}`, onClick: () => setView('result'), disabled: !result, children: "\uD83C\uDFC6 \u7ED3\u679C\u5C55\u793A" })] })] }), _jsxs("main", { className: "app-main", children: [view === 'players' && (_jsx(PlayerManager, { onPlayersChange: handlePlayersChange })), view === 'config' && (_jsx(TeamConfig, { players: players, onStart: handleStart, config: teamConfig, onConfigChange: setTeamConfig })), view === 'result' && result && (_jsx(ResultDisplay, { result: result, onRedo: handleRedo, onBack: () => setView('config') }))] })] }));
}
