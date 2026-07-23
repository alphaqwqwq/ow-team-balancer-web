import React, { useState, useEffect, useRef } from 'react';
import type { Player, RoleKey } from '../types';
import { ROLE_LABELS, ROLE_ICONS } from '../types';
import { loadPlayers, addPlayer, updatePlayer, deletePlayer, deleteAllPlayers, generateId } from '../lib/dataManager';
import { exportCSV, parseCSV } from '../lib/csv';

interface Props {
  onPlayersChange?: (count: number) => void;
}

const WEIGHT_GRADES = ['青铜','白银','黄金','铂金','钻石','大师','宗师','英杰'];

export default function PlayerManager({ onPlayersChange }: Props) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState('');
  const [tWeight, setTWeight] = useState(5);
  const [dWeight, setDWeight] = useState(5);
  const [sWeight, setSWeight] = useState(5);
  const [lockedRole, setLockedRole] = useState<RoleKey | ''>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPlayers(loadPlayers());
  }, []);

  useEffect(() => {
    onPlayersChange?.(players.length);
  }, [players.length, onPlayersChange]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleSubmit = () => {
    if (!name.trim()) return showToast('请输入玩家名称');

    const player: Player = {
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
    } else {
      setPlayers(addPlayer(player));
      showToast('已添加');
    }

    resetForm();
  };

  const resetForm = () => {
    setName(''); setTWeight(5); setDWeight(5); setSWeight(5);
    setLockedRole(''); setEditingId(null);
  };

  const handleEdit = (p: Player) => {
    setName(p.name); setTWeight(p.t); setDWeight(p.d); setSWeight(p.s);
    setLockedRole(p.locked_role || ''); setEditingId(p.id);
  };

  const handleDelete = (id: string) => {
    setPlayers(deletePlayer(id));
    if (editingId === id) resetForm();
    showToast('已删除');
  };

  const handleExport = () => {
    const csv = exportCSV(players);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'players.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('已导出');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = parseCSV(evt.target?.result as string || '');
        const existing = loadPlayers();
        const merged = [...existing, ...imported];
        localStorage.setItem('tb_players', JSON.stringify(merged));
        setPlayers(merged);
        showToast(`导入 ${imported.length} 人`);
      } catch (err: any) {
        showToast(err.message || '导入失败');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    if (players.length === 0) return;
    if (!confirm('确定删除所有玩家数据？不可撤销。')) return;
    deleteAllPlayers();
    setPlayers([]);
    resetForm();
    showToast('已清空');
  };

  const weightOptions = WEIGHT_GRADES.map((g, i) => (
    <option key={i + 1} value={i + 1}>{i + 1} ({g})</option>
  ));

  return (
    <div className="pm-container">
      {toast && <div className="toast">{toast}</div>}

      {/* Form */}
      <div className="pm-form">
        <div className="pm-form-row">
          <input
            className="input" placeholder="玩家名称"
            value={name} onChange={e => setName(e.target.value)}
            maxLength={20}
          />
        </div>
        <div className="pm-form-sliders">
          <label>🛡️ T <select value={tWeight} onChange={e => setTWeight(+e.target.value)}>{weightOptions}</select></label>
          <label>⚔️ DPS <select value={dWeight} onChange={e => setDWeight(+e.target.value)}>{weightOptions}</select></label>
          <label>💉 S <select value={sWeight} onChange={e => setSWeight(+e.target.value)}>{weightOptions}</select></label>
          <label className="lock-label">
            锁定位置
            <select value={lockedRole} onChange={e => setLockedRole(e.target.value as any)}>
              <option value="">不锁</option><option value="T">T</option><option value="DPS">DPS</option><option value="S">S</option>
            </select>
          </label>
        </div>
        <div className="pm-form-actions">
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editingId ? '更新' : '添加'}
          </button>
          {editingId && <button className="btn" onClick={resetForm}>取消</button>}
          <span className="pm-count">{players.length} 人</span>
        </div>
      </div>

      {/* Actions */}
      <div className="pm-actions">
        <button className="btn btn-sm" onClick={handleExport}>📥 导出 CSV</button>
        <button className="btn btn-sm" onClick={() => fileInputRef.current?.click()}>📤 导入 CSV</button>
        <input ref={fileInputRef} type="file" accept=".csv,.tsv" style={{ display: 'none' }} onChange={handleImport} />
        <button className="btn btn-sm btn-danger" onClick={handleClearAll}>🗑️ 清空</button>
      </div>

      {/* Player list */}
      <div className="pm-list">
        {players.length === 0 && <p className="pm-empty">还没有玩家，在上方添加</p>}
        {players.map(p => (
          <div key={p.id} className={`pm-card ${editingId === p.id ? 'pm-card--editing' : ''}`}>
            <div className="pm-card-name">
              <span>{p.name}</span>
              {p.locked_role && <span className="lock-badge">{ROLE_ICONS[p.locked_role]} {ROLE_LABELS[p.locked_role]}</span>}
            </div>
            <div className="pm-card-weights">
              <span className="weight-t">🛡️ {p.t}</span>
              <span className="weight-d">⚔️ {p.d}</span>
              <span className="weight-s">💉 {p.s}</span>
            </div>
            <div className="pm-card-actions">
              <button className="btn-icon" onClick={() => handleEdit(p)} title="编辑">✏️</button>
              <button className="btn-icon" onClick={() => handleDelete(p.id)} title="删除">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
