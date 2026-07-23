import type { Player, AssignedPlayer, RoleKey, TeamSize } from '../types';
import { ROLE_CONFIGS } from '../types';

const T_MULTIPLIER = 1.5;

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function greedyPartition(
  players: Player[],
  weightKey: 't' | 'd' | 's',
  multiplier: number = 1.0
): [AssignedPlayer[], AssignedPlayer[]] {
  const sorted = fisherYates(players).sort(
    (a, b) => (b[weightKey] * multiplier) - (a[weightKey] * multiplier)
  );

  const teamA: AssignedPlayer[] = [];
  const teamB: AssignedPlayer[] = [];
  let sumA = 0, sumB = 0;

  for (const p of sorted) {
    const w = p[weightKey] * multiplier;
    if (sumA <= sumB) {
      teamA.push({ ...p, assigned_role: 'T' });
      sumA += w;
    } else {
      teamB.push({ ...p, assigned_role: 'T' });
      sumB += w;
    }
  }

  return [teamA, teamB];
}

export function balanceRandom(
  players: Player[],
  teamSize: number
): [AssignedPlayer[], AssignedPlayer[]] {
  const shuffled = fisherYates(players);
  const mid = Math.floor(shuffled.length / 2);
  const a = shuffled.slice(0, mid);
  const b = shuffled.slice(mid);

  // Assign roles based on position in ROLE_CONFIG
  const cfg = ROLE_CONFIGS[teamSize as TeamSize];
  const roles: RoleKey[] = [];
  for (const [role, count] of Object.entries(cfg)) {
    for (let i = 0; i < count * 2; i++) roles.push(role as RoleKey);
  }

  const assign = (team: Player[], offset: number): AssignedPlayer[] =>
    team.map((p, i) => ({ ...p, assigned_role: roles[i + offset] }));

  return [assign(a, 0), assign(b, a.length)];
}

export function balanceWeightedWithRoles(
  players: Player[],
  teamSize: TeamSize
): [AssignedPlayer[], AssignedPlayer[], string | null] {
  const cfg = ROLE_CONFIGS[teamSize];
  const needT = cfg.T * 2;
  const needD = cfg.DPS * 2;
  const needS = cfg.S * 2;
  const totalNeeded = needT + needD + needS;

  if (players.length !== totalNeeded) {
    return [[], [], `需要恰好 ${totalNeeded} 人参加分队（当前 ${players.length} 人）`];
  }

  const ps: Player[] = players.map(p => ({ ...p }));

  // Step 1: Classify
  const tLocked = ps.filter(p => p.locked_role === 'T');
  const dLocked = ps.filter(p => p.locked_role === 'DPS');
  const sLocked = ps.filter(p => p.locked_role === 'S');
  let flexPool = ps.filter(p => p.locked_role == null);

  // Step 2: Handle overflow
  let overflow: Player[] = [];
  if (tLocked.length > needT) {
    tLocked.sort((a, b) => b.t - a.t);
    overflow = tLocked.splice(needT);
  }
  if (dLocked.length > needD) {
    dLocked.sort((a, b) => b.d - a.d);
    overflow = overflow.concat(dLocked.splice(needD));
  }
  if (sLocked.length > needS) {
    sLocked.sort((a, b) => b.s - a.s);
    overflow = overflow.concat(sLocked.splice(needS));
  }
  flexPool = flexPool.concat(overflow);

  // Step 3: Fill T
  let tCandidates = [...tLocked];
  if (tCandidates.length < needT) {
    flexPool.sort((a, b) => (b.t * T_MULTIPLIER) - (a.t * T_MULTIPLIER));
    tCandidates = tCandidates.concat(flexPool.splice(0, needT - tCandidates.length));
  }
  if (tCandidates.length < needT) {
    return [[], [], `可担任 T 位的玩家不足（需要 ${needT} 人，仅有 ${tCandidates.length} 人）`];
  }

  // Step 4: Fill DPS
  let dCandidates = [...dLocked];
  if (dCandidates.length < needD) {
    flexPool.sort((a, b) => b.d - a.d);
    dCandidates = dCandidates.concat(flexPool.splice(0, needD - dCandidates.length));
  }
  if (dCandidates.length < needD) {
    return [[], [], `可担任输出位的玩家不足（需要 ${needD} 人，仅有 ${dCandidates.length} 人）`];
  }

  // Step 5: Fill Support
  let sCandidates = [...sLocked, ...flexPool];
  if (sCandidates.length < needS) {
    return [[], [], `可担任辅助位的玩家不足（需要 ${needS} 人，仅有 ${sCandidates.length} 人）`];
  }
  sCandidates.sort((a, b) => b.s - a.s);
  sCandidates = sCandidates.slice(0, needS);

  // Step 6: Partition each role group
  let teamA: AssignedPlayer[] = [];
  let teamB: AssignedPlayer[] = [];

  const [taT, tbT] = greedyPartition(tCandidates, 't', T_MULTIPLIER);
  taT.forEach(p => p.assigned_role = 'T');
  tbT.forEach(p => p.assigned_role = 'T');
  teamA = teamA.concat(taT);
  teamB = teamB.concat(tbT);

  const [taD, tbD] = greedyPartition(dCandidates, 'd', 1.0);
  taD.forEach(p => p.assigned_role = 'DPS');
  tbD.forEach(p => p.assigned_role = 'DPS');
  teamA = teamA.concat(taD);
  teamB = teamB.concat(tbD);

  const [taS, tbS] = greedyPartition(sCandidates, 's', 1.0);
  taS.forEach(p => p.assigned_role = 'S');
  tbS.forEach(p => p.assigned_role = 'S');
  teamA = teamA.concat(taS);
  teamB = teamB.concat(tbS);

  // Safety swap if sizes differ
  if (teamA.length !== teamB.length) {
    const all = teamA.concat(teamB);
    const shuffled = fisherYates(all);
    const mid = Math.floor(shuffled.length / 2);
    teamA = shuffled.slice(0, mid);
    teamB = shuffled.slice(mid);
  }

  // Calculate score
  const calcScore = (team: AssignedPlayer[]): { t: number; d: number; s: number; total: number } => {
    const t = team.reduce((s, p) => s + (p.assigned_role === 'T' ? p.t * T_MULTIPLIER : 0), 0);
    const d = team.reduce((s, p) => s + (p.assigned_role === 'DPS' ? p.d : 0), 0);
    const s_score = team.reduce((s, p) => s + (p.assigned_role === 'S' ? p.s : 0), 0);
    return { t, d, s: s_score, total: t + d + s_score };
  };

  const aScore = calcScore(teamA);
  const bScore = calcScore(teamB);
  const diff = Math.abs(aScore.total - bScore.total);

  return [teamA, teamB, `差距 ${diff.toFixed(1)}`];
}
