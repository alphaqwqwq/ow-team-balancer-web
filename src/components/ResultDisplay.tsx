import React, { useState } from 'react';
import type { TeamResult, AssignedPlayer, RoleKey } from '../types';
import { ROLE_ICONS, ROLE_LABELS } from '../types';

interface Props {
  result: TeamResult;
  onRedo: () => void;
  onBack: () => void;
}

const T_MULTIPLIER = 1.5;

function calcScores(team: AssignedPlayer[]) {
  const t = team.filter(p => p.assigned_role === 'T');
  const d = team.filter(p => p.assigned_role === 'DPS');
  const s = team.filter(p => p.assigned_role === 'S');

  const tScore = t.reduce((sum, p) => sum + p.t * T_MULTIPLIER, 0);
  const dScore = d.reduce((sum, p) => sum + p.d, 0);
  const sScore = s.reduce((sum, p) => sum + p.s, 0);

  return { tScore, dScore, sScore, total: tScore + dScore + sScore, t, d, s };
}

export default function ResultDisplay({ result, onRedo, onBack }: Props) {
  const [showWeights, setShowWeights] = useState(false);
  const scoreA = calcScores(result.teamA);
  const scoreB = calcScores(result.teamB);
  const diff = Math.abs(scoreA.total - scoreB.total);

  const renderPlayer = (p: AssignedPlayer) => (
    <div key={p.id} className="rd-player">
      <span className="rd-role-icon">{ROLE_ICON_MAP[p.assigned_role]}</span>
      <span className="rd-name">{p.name}</span>
      {showWeights && (
        <span className="rd-weight">{p[p.assigned_role === 'T' ? 't' : p.assigned_role === 'DPS' ? 'd' : 's']}</span>
      )}
    </div>
  );

  return (
    <div className="rd-container">
      <div className="rd-header">
        <span className="rd-mode">{result.mode === 'weighted' ? '⚖️ 权重模式' : '🎲 随机模式'}</span>
        <span className="rd-size">{result.teamSize}v{result.teamSize}</span>
        <span className="rd-diff">差距 {diff.toFixed(1)}</span>
        <label className="rd-toggle">
          <input type="checkbox" checked={showWeights} onChange={e => setShowWeights(e.target.checked)} />
          显示权重
        </label>
      </div>

      <div className="rd-teams">
        {/* Team A */}
        <div className="rd-team rd-team-a">
          <h3 className="rd-team-title">
            Team A
            <span className="rd-score">总分 {scoreA.total.toFixed(0)}</span>
          </h3>
          {(['T', 'DPS', 'S'] as RoleKey[]).map(role => {
            const players = role === 'T' ? scoreA.t : role === 'DPS' ? scoreA.d : scoreA.s;
            return (
              <div key={role} className="rd-role-group">
                <div className="rd-role-header">
                  {ROLE_ICONS[role]} {ROLE_LABELS[role]}
                  <span className="rd-role-score">{role === 'T' ? scoreA.tScore.toFixed(0) : role === 'DPS' ? scoreA.dScore.toFixed(0) : scoreA.sScore.toFixed(0)}</span>
                </div>
                {players.map(renderPlayer)}
              </div>
            );
          })}
        </div>

        {/* VS */}
        <div className="rd-vs">VS</div>

        {/* Team B */}
        <div className="rd-team rd-team-b">
          <h3 className="rd-team-title">
            Team B
            <span className="rd-score">总分 {scoreB.total.toFixed(0)}</span>
          </h3>
          {(['T', 'DPS', 'S'] as RoleKey[]).map(role => {
            const players = role === 'T' ? scoreB.t : role === 'DPS' ? scoreB.d : role === 'S' ? scoreB.s : [];
            return (
              <div key={role} className="rd-role-group">
                <div className="rd-role-header">
                  {ROLE_ICONS[role]} {ROLE_LABELS[role]}
                  <span className="rd-role-score">{role === 'T' ? scoreB.tScore.toFixed(0) : role === 'DPS' ? scoreB.dScore.toFixed(0) : scoreB.sScore.toFixed(0)}</span>
                </div>
                {players.map(renderPlayer)}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rd-actions">
        <button className="btn btn-large btn-primary" onClick={onRedo}>🔁 重新分队</button>
        <button className="btn btn-large" onClick={onBack}>← 返回配置</button>
      </div>
    </div>
  );
}

const ROLE_ICON_MAP: Record<string, string> = {
  T: '🛡️',
  DPS: '⚔️',
  S: '💉',
};
