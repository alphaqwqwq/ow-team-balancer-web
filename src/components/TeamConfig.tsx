import React, { useState, useMemo } from 'react';
import type { Player, TeamSize, BalanceMode, RoleKey, TeamConfig as TC } from '../types';
import { ROLE_CONFIGS, ROLE_LABELS, ROLE_ICONS } from '../types';
import { loadPlayers } from '../lib/dataManager';

interface Props {
  players: Player[];
  onStart: (selected: Player[], config: TC) => void;
  config: TC;
  onConfigChange: (config: TC) => void;
}

const WEIGHT_KEYS: Record<string, 't' | 'd' | 's'> = { T: 't', DPS: 'd', S: 's' };

export default function TeamConfig({ players, onStart, config, onConfigChange }: Props) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | RoleKey | 'flex'>('all');
  const [sortBy, setSortBy] = useState<'avg' | 't' | 'd' | 's'>('avg');
  const sortDesc = true;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [overrideRoles, setOverrideRoles] = useState<Record<string, RoleKey | null>>({});

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
    } else if (roleFilter !== 'all') {
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

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else if (next.size < totalNeeded) next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    const ids = new Set(filtered.map(p => p.id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
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

  const roleOptions: { label: string; value: string }[] = [
    { label: '全部', value: 'all' },
    { label: '🛡️ T', value: 'T' },
    { label: '⚔️ DPS', value: 'DPS' },
    { label: '💉 S', value: 'S' },
    { label: '灵活(未锁定)', value: 'flex' },
  ];

  const teamSizeInfo = `${config.teamSize}v${config.teamSize}`;
  const cfg = ROLE_CONFIGS[config.teamSize];
  const compStr = `T${cfg.T} DPS${cfg.DPS} S${cfg.S}`;

  return (
    <div className="tc-container">
      <div className="tc-config-bar">
        <div className="tc-config-item">
          <label>队伍规模</label>
          <select
            value={config.teamSize}
            onChange={e => onConfigChange({ ...config, teamSize: +e.target.value as TeamSize })}
            className="select"
          >
            <option value={4}>4v4 {compStr}</option>
            <option value={5}>5v5 {compStr}</option>
            <option value={6}>6v6 {compStr}</option>
          </select>
        </div>
        <div className="tc-config-item">
          <label>分队模式</label>
          <select
            value={config.mode}
            onChange={e => onConfigChange({ ...config, mode: e.target.value as BalanceMode })}
            className="select"
          >
            <option value="weighted">⚖️ 权重模式（推荐）</option>
            <option value="random">🎲 随机模式</option>
          </select>
        </div>
        <div className="tc-info">
          <span className="tc-needed">{selectedIds.size}/{totalNeeded} 人</span>
          <span className="tc-spec">{teamSizeInfo} | {cfg.T}T+{cfg.DPS}DPS+{cfg.S}S</span>
        </div>
      </div>

      {/* Filters */}
      <div className="tc-filters">
        <input className="input" placeholder="搜索玩家…" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} className="select">
          {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="select">
          <option value="avg">综合</option>
          <option value="t">T位</option>
          <option value="d">输出</option>
          <option value="s">辅助</option>
        </select>
        <button className="btn btn-sm" onClick={selectAll}>全选可见</button>
        <button className="btn btn-sm" onClick={clearSelection}>清除</button>
      </div>

      {/* Player list with checkboxes */}
      <div className="tc-player-list">
        {filtered.map(p => {
          const selected = selectedIds.has(p.id);
          const hasOverride = p.id in overrideRoles;
          return (
            <div
              key={p.id}
              className={`tc-player-card ${selected ? 'selected' : ''}`}
              onClick={() => toggleSelect(p.id)}
            >
              <div className="tc-pc-check">{selected ? '✓' : ''}</div>
              <div className="tc-pc-info">
                <span className="tc-pc-name">{p.name}</span>
                <div className="tc-pc-weights">
                  <span className="weight-t">🛡️ {p.t}</span>
                  <span className="weight-d">⚔️ {p.d}</span>
                  <span className="weight-s">💉 {p.s}</span>
                  {p.locked_role && !hasOverride && <span className="lock-badge-sm">{ROLE_ICONS[p.locked_role]}锁</span>}
                </div>
              </div>
              <select
                className="select-sm"
                value={hasOverride ? (overrideRoles[p.id] || '') : p.locked_role || ''}
                onClick={e => e.stopPropagation()}
                onChange={e => {
                  const v = e.target.value;
                  setOverrideRoles(prev => ({
                    ...prev,
                    [p.id]: v === '' ? null : v as RoleKey,
                  }));
                }}
              >
                <option value="">自动</option>
                <option value="T">🛡️ T</option>
                <option value="DPS">⚔️ DPS</option>
                <option value="S">💉 S</option>
              </select>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="tc-empty">没有匹配的玩家</p>}
      </div>

      <div className="tc-bottom">
        <button className="btn btn-large btn-primary" onClick={handleStart} disabled={selectedIds.size !== totalNeeded}>
          ⚡ 开始分队
        </button>
      </div>
    </div>
  );
}
