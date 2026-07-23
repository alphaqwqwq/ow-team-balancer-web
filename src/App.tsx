import React, { useState, useCallback } from 'react';
import type { Player, TeamSize, BalanceMode, TeamConfig as TC, TeamResult, RoleKey } from './types';
import { ROLE_CONFIGS } from './types';
import { loadPlayers } from './lib/dataManager';
import { balanceWeightedWithRoles, balanceRandom } from './lib/balancer';
import PlayerManager from './components/PlayerManager';
import TeamConfig from './components/TeamConfig';
import ResultDisplay from './components/ResultDisplay';
import './App.css';

type View = 'players' | 'config' | 'result';

export default function App() {
  const [players, setPlayers] = useState<Player[]>(() => loadPlayers());
  const [view, setView] = useState<View>('players');
  const [teamConfig, setTeamConfig] = useState<TC>({ teamSize: 5, mode: 'weighted' });
  const [result, setResult] = useState<TeamResult | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

  const handlePlayersChange = useCallback(() => {
    setPlayers(loadPlayers());
  }, []);

  const handleStart = (selected: Player[], config: TC) => {
    let teamA: Player[], teamB: Player[], diffMsg: string | null;

    if (config.mode === 'weighted') {
      const [a, b, msg] = balanceWeightedWithRoles(selected, config.teamSize);
      if (msg && !a.length) { alert(msg); return; }
      [teamA, teamB, diffMsg] = [a, b, msg];
    } else {
      const [a, b] = balanceRandom(selected, config.teamSize);
      [teamA, teamB] = [a, b];
      diffMsg = '随机分配';
    }

    setResult({
      teamA: teamA as any,
      teamB: teamB as any,
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

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">⚔️ 随机分队器</h1>
        <span className="app-version">v1.0.0</span>
        <span className="app-badge">位置感知 · T位×1.5</span>
        <nav className="app-nav">
          <button className={`nav-btn ${view === 'players' ? 'active' : ''}`} onClick={() => setView('players')}>
            👥 玩家管理
          </button>
          <button className={`nav-btn ${view === 'config' ? 'active' : ''}`} onClick={() => setView('config')}>
            🎯 开始分队 ({players.length}人)
          </button>
          <button className={`nav-btn ${view === 'result' ? 'active' : ''}`} onClick={() => setView('result')} disabled={!result}>
            🏆 结果展示
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'players' && (
          <PlayerManager onPlayersChange={handlePlayersChange} />
        )}
        {view === 'config' && (
          <TeamConfig
            players={players}
            onStart={handleStart}
            config={teamConfig}
            onConfigChange={setTeamConfig}
          />
        )}
        {view === 'result' && result && (
          <ResultDisplay
            result={result}
            onRedo={handleRedo}
            onBack={() => setView('config')}
          />
        )}
      </main>
    </div>
  );
}
