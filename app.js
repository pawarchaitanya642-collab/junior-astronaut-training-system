import { icon, brandMark, heroArt, missionArt, planetArt } from './art.js';
import { MISSIONS, ACHIEVEMENTS, FACTS, STAR_NAMES, STAR_ROUTE, rankFor, earnedAchievements } from './data.js';
import { WORLD, createGameState, updateGame, drawGame, gameHUD, gameObjectives, gameNotice, gameScore, selectStar, selectSystem, answerSystem, startLaunch, pointerGame } from './games.js';

const STORAGE_KEY = 'orbit-academy-v1';
const missionById = Object.fromEntries(MISSIONS.map(m => [m.id, m]));
const app = document.getElementById('app');
const missionDialog = document.getElementById('mission-dialog');
const gameShell = document.getElementById('game-shell');
const infoDialog = document.getElementById('info-dialog');
const infoContent = document.getElementById('info-content');
const toastRegion = document.getElementById('toast-region');
const navItems = [
  { page: 'mission-control', label: 'Mission control', icon: 'grid' },
  { page: 'training', label: 'Training deck', icon: 'rocket', count: 4 },
  { page: 'log', label: 'Flight log', icon: 'book' },
  { page: 'achievements', label: 'Achievements', icon: 'award' }
];
const pageNames = { 'mission-control': 'Mission control', training: 'Training deck', log: 'Flight log', achievements: 'Achievements' };
const failureReasons = {
  'off-pad': 'You touched down outside the landing zone. Aim for the green pad and save a little fuel for the final brake.',
  descent: 'That touchdown was too fast. Start your braking burn earlier and watch the descent speed.',
  drift: 'Your lander was sliding sideways. Use short left and right bursts to settle before touchdown.',
  fuel: 'The tanks ran dry. Use shorter thruster bursts and let gravity do some of the work.',
  timeout: 'Training time ran out. Take a breath, plan your approach, and try again.',
  bumps: 'Three hard bumps ended the approach. Align with the ring and brake before contact.',
  'course-errors': 'Too many course errors. Follow the route from Betelgeuse to Rigel and watch the highlighted star.',
  'safety-checks': 'The safety checks were used up. Read each warning and choose the fix that removes the danger.'
};

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function freshProgress() {
  const now = new Date().toISOString();
  return { version: 1, callsign: 'Nova', patch: 'orange', sound: true, difficulty: 'rookie', xp: 120, completed: {}, best: {}, flightSeconds: 0, joined: now, attempts: [{ id: 'orientation', mission: 'orientation', title: 'Welcome aboard', result: 'complete', score: null, xp: 120, duration: 0, difficulty: 'Academy', date: now, reason: 'joined' }] };
}
function loadProgress() {
  const base = freshProgress();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || saved.version !== 1) return base;
    const merged = { ...base, ...saved, completed: { ...(saved.completed || {}) }, best: { ...(saved.best || {}) }, attempts: Array.isArray(saved.attempts) ? saved.attempts : base.attempts };
    merged.callsign = String(merged.callsign || 'Nova').slice(0, 18);
    merged.xp = Math.max(0, Number(merged.xp) || 0);
    merged.flightSeconds = Math.max(0, Number(merged.flightSeconds) || 0);
    return merged;
  } catch { return base; }
}
let progress = loadProgress();
let currentPage = pageFromHash();
let trainingFilter = 'all';
let factIndex = 0;
let profilePatch = progress.patch;
let logFilters = { query: '', result: 'all', sort: 'newest' };
let active = null;
let resizeObserver = null;
const held = new Set();

function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
}
function pageFromHash() {
  const page = location.hash.replace('#/', '');
  return pageNames[page] ? page : 'mission-control';
}
function completedCount() { return MISSIONS.filter(m => progress.completed[m.id]).length; }
function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
function formatDate(iso) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
}
function trainingDay() { return Math.max(1, Math.floor((Date.now() - new Date(progress.joined).getTime()) / 86400000) + 1); }
function nextMission() { return MISSIONS.find(m => !progress.completed[m.id]) || MISSIONS[0]; }

let audioCtx = null;
let masterGain = null;
let thrustGain = null;
function ensureAudio() {
  if (!progress.sound) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!audioCtx) {
    audioCtx = new AC();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = .17;
    masterGain.connect(audioCtx.destination);
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    thrustGain = audioCtx.createGain();
    thrustGain.gain.value = 0;
    source.connect(filter).connect(thrustGain).connect(masterGain);
    source.start();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
}
function setThrust(on) {
  if (!audioCtx || !thrustGain) return;
  thrustGain.gain.setTargetAtTime(on && progress.sound ? .08 : 0, audioCtx.currentTime, .06);
}
function tone(freq, duration = .1, type = 'sine', delay = 0, volume = .4) {
  if (!progress.sound) return;
  ensureAudio();
  if (!audioCtx) return;
  const start = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + .012);
  gain.gain.exponentialRampToValueAtTime(.001, start + duration);
  osc.connect(gain).connect(masterGain);
  osc.start(start);
  osc.stop(start + duration + .03);
}
function sound(name) {
  if (!progress.sound) return;
  if (name === 'click') tone(660, .055, 'triangle', 0, .22);
  else if (name === 'select') tone(440, .07, 'sine', 0, .25);
  else if (name === 'correct') { tone(523, .09, 'sine', 0, .35); tone(784, .13, 'sine', .07, .3); }
  else if (name === 'wrong') { tone(185, .16, 'sawtooth', 0, .18); tone(147, .18, 'sawtooth', .09, .14); }
  else if (name === 'bump') tone(110, .22, 'triangle', 0, .4);
  else if (name === 'launch') { tone(220, .16, 'triangle', 0, .3); tone(330, .2, 'triangle', .1, .3); tone(70, .7, 'sawtooth', .18, .16); }
  else if (name === 'success') [523, 659, 784, 1047].forEach((f, i) => tone(f, .3, 'sine', i * .11, .35));
  else if (name === 'fail') { tone(220, .25, 'triangle', 0, .3); tone(165, .35, 'triangle', .16, .28); }
}
function toggleSound() {
  progress.sound = !progress.sound;
  saveProgress();
  if (progress.sound) { ensureAudio(); sound('click'); }
  else setThrust(false);
  if (masterGain) masterGain.gain.setTargetAtTime(progress.sound ? .17 : 0, audioCtx.currentTime, .03);
  updateSoundButtons();
}
function updateSoundButtons() {
  const top = document.getElementById('top-sound');
  if (top) {
    top.innerHTML = `${icon(progress.sound ? 'volume' : 'volumeOff')}<span>Sound ${progress.sound ? 'on' : 'off'}</span>`;
    top.setAttribute('aria-pressed', String(progress.sound));
    top.setAttribute('aria-label', progress.sound ? 'Mute sound' : 'Turn sound on');
  }
  const game = document.getElementById('game-sound');
  if (game) {
    game.innerHTML = icon(progress.sound ? 'volume' : 'volumeOff');
    game.setAttribute('aria-pressed', String(progress.sound));
    game.setAttribute('aria-label', progress.sound ? 'Mute sound' : 'Turn sound on');
    game.title = progress.sound ? 'Sound on' : 'Sound off';
  }
}
let toastTimer = null;
function toast(message, iconName = 'check') {
  clearTimeout(toastTimer);
  toastRegion.innerHTML = `<div class="toast">${icon(iconName)}<span>${escapeHTML(message)}</span></div>`;
  toastTimer = setTimeout(() => { toastRegion.innerHTML = ''; }, 3200);
}

function navMarkup(mobile = false) {
  return navItems.map(item => `<button class="nav-item ${currentPage === item.page ? 'active' : ''}" data-page="${item.page}" ${currentPage === item.page ? 'aria-current="page"' : ''}>${icon(item.icon)}<span>${item.label}</span>${item.count ? `<span class="nav-count">${item.count}</span>` : ''}</button>`).join('');
}
function rankMarkup() {
  const rank = rankFor(progress.xp);
  const percent = rank.next ? Math.min(100, (progress.xp - rank.min) / (rank.next.min - rank.min) * 100) : 100;
  return `<div class="eyebrow">Cadet rank</div><div class="rank-top"><div class="rank-emblem">${icon('helmet')}</div><div><div class="rank-name">${rank.name}</div><div class="rank-level">Level ${rank.index + 1} · ${progress.xp} XP</div></div></div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div><div class="progress-caption"><span>${rank.next ? `${rank.next.min - progress.xp} XP to ${rank.next.name}` : 'Highest academy rank'}</span><span>${Math.round(percent)}%</span></div>`;
}
function renderShell() {
  app.innerHTML = `<aside class="sidebar"><button class="brand" data-page="mission-control" aria-label="Orbit Academy home">${brandMark()}<span><span class="brand-name">orbit</span><span class="brand-sub">Junior astronaut academy</span></span></button><div class="nav-label">YOUR SPACE JOURNEY</div><nav class="nav-list" aria-label="Main navigation">${navMarkup()}</nav><div class="sidebar-bottom"><div class="rank-card" id="sidebar-rank">${rankMarkup()}</div><button class="help-button" data-action="manual">${icon('book')}<span>Need a hand, cadet?</span></button><div class="sidebar-foot">ORBIT ACADEMY · FLIGHT BUILD 1.0</div></div></aside><header class="topbar"><button class="mobile-brand" data-page="mission-control" aria-label="Orbit Academy home">${brandMark()}<span class="brand-name">orbit</span></button><div class="breadcrumb"><span>Academy</span>${icon('chevron')}<strong id="breadcrumb-current">Mission control</strong></div><div class="topbar-actions"><div class="system-status"><span class="status-dot"></span>All systems go</div><button id="top-sound" class="sound-button" data-action="sound" aria-pressed="true"></button><div class="topbar-divider"></div><button class="profile-button" data-action="profile" aria-label="Edit cadet profile"><span class="avatar" id="top-avatar" data-patch="${progress.patch}">${icon('helmet')}</span><span class="profile-copy"><span class="profile-name" id="top-callsign"></span><span class="profile-rank" id="top-rank"></span></span>${icon('chevronDown')}</button></div></header><div class="workspace"><main class="main" id="main-content"></main></div><nav class="mobile-nav" aria-label="Mobile navigation">${navMarkup(true)}</nav>`;
}
function updateChrome() {
  document.querySelectorAll('.nav-item').forEach(button => {
    const isActive = button.dataset.page === currentPage;
    button.classList.toggle('active', isActive);
    if (isActive) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  const crumb = document.getElementById('breadcrumb-current');
  if (crumb) crumb.textContent = pageNames[currentPage];
  const rank = rankFor(progress.xp);
  const name = document.getElementById('top-callsign');
  const rankEl = document.getElementById('top-rank');
  const avatar = document.getElementById('top-avatar');
  const sidebarRank = document.getElementById('sidebar-rank');
  if (name) name.textContent = `Cadet ${progress.callsign}`;
  if (rankEl) rankEl.textContent = rank.name;
  if (avatar) avatar.dataset.patch = progress.patch;
  if (sidebarRank) sidebarRank.innerHTML = rankMarkup();
  updateSoundButtons();
}
function navigate(page) {
  if (!pageNames[page]) return;
  if (location.hash === `#/${page}`) { currentPage = page; renderPage(); }
  else location.hash = `#/${page}`;
}
function renderPage(scrollTop = true) {
  const main = document.getElementById('main-content');
  if (!main) return;
  const templates = { 'mission-control': missionControlPage, training: trainingPage, log: logPage, achievements: achievementsPage };
  main.innerHTML = `<div class="page-enter">${templates[currentPage]()}</div>`;
  updateChrome();
  if (currentPage === 'log') renderLogTable();
  if (scrollTop) window.scrollTo({ top: 0, behavior: 'auto' });
}

function missionCard(mission, index, large = false) {
  const done = !!progress.completed[mission.id];
  return `<button class="mission-card" data-mission="${mission.id}" style="--i:${index}" aria-label="${done ? 'Replay' : 'Start'} ${mission.title} mission"><div class="mission-card-art">${missionArt(mission.id)}<span class="card-number">MISSION ${mission.number}</span>${done ? `<span class="card-status">${icon('check')}Complete</span>` : ''}</div><div class="card-body"><div class="card-category">${mission.category}</div><h3>${mission.title}</h3><p>${mission.description}</p>${large ? `<div class="skill-tags">${mission.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}${progress.best[mission.id] ? `<span class="skill-tag">Best ${progress.best[mission.id]} pts</span>` : ''}</div>` : ''}<div class="card-footer"><span class="difficulty"><span class="difficulty-bars">${[1, 2, 3].map(n => `<i class="${n <= mission.level ? 'on' : ''}"></i>`).join('')}</span>${mission.level === 1 ? 'Rookie' : 'Cadet II'}</span><span class="card-time">${icon('clock')}${mission.time}</span><span class="card-arrow">${icon('arrowUpRight')}</span></div></div></button>`;
}
function flightPlanMarkup() {
  const count = completedCount();
  return `<section class="panel flight-plan"><div class="panel-title"><h3>Your flight plan</h3>${icon('flag')}</div><div class="plan-summary"><div class="progress-ring" style="--progress:${count / 4 * 100}"><div class="progress-ring-inner">${count}<small>/4</small></div></div><div><strong>${count === 4 ? 'Plan complete!' : 'One step at a time'}</strong><p>${count === 4 ? 'Every mission mastered. The academy is proud.' : 'Four missions. One giant leap for you.'}</p></div></div><div class="plan-list">${MISSIONS.map((m, i) => `<button class="plan-step" data-mission="${m.id}"><span class="step-check ${progress.completed[m.id] ? 'done' : ''}">${progress.completed[m.id] ? icon('check') : i + 1}</span><span><span class="plan-step-name">${m.title}</span><span class="plan-step-sub">${m.category} · +${m.xp} XP</span></span>${icon('chevron')}</button>`).join('')}</div><div class="plan-foot">${count === 4 ? '<span>Academy Explorer patch earned.</span>' : `<span>${4 - count}</span> ${4 - count === 1 ? 'mission' : 'missions'} to your Explorer patch.`}</div></section>`;
}
function intelMarkup() {
  const fact = FACTS[factIndex];
  return `<section class="intel-card"><div class="intel-planet">${planetArt()}</div><div class="eyebrow">Cadet intel</div><h3 id="intel-title">${fact.title}</h3><p id="intel-text">${fact.text}</p><button class="text-link" data-action="fact">Next space fact ${icon('arrowRight')}</button></section>`;
}
function patchMarkup(a, locked = false, label = false) {
  return `<span class="patch-icon ${a.color} ${locked ? 'locked' : ''}">${icon(locked ? 'lock' : a.icon)}</span>${label ? `<span class="patch-label">${a.title}</span>` : ''}`;
}
function missionControlPage() {
  const count = completedCount();
  const earned = earnedAchievements(progress);
  const lunarDone = !!progress.completed.lunar;
  const preview = [ACHIEVEMENTS[0], ACHIEVEMENTS[1], ACHIEVEMENTS[2], ACHIEVEMENTS[3]];
  return `<div class="welcome-row"><div><div class="eyebrow">Your space journey</div><h1>Welcome aboard, ${escapeHTML(progress.callsign)}.</h1><p>Big dreams start with small steps. Your next mission is waiting.</p></div><div class="day-chip">${icon('sun')}<div><strong>TRAINING DAY ${String(trainingDay()).padStart(2, '0')}</strong><span>${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div></div></div><section class="hero" aria-label="Featured lunar landing mission"><div class="hero-art">${heroArt()}</div><div class="hero-content"><span class="mission-tag">${icon('rocket')}MISSION 01 · ${lunarDone ? 'MISSION COMPLETE' : 'READY FOR LAUNCH'}</span><h2>The Moon is<br>your <span>classroom.</span></h2><p class="hero-copy">Strap in, cadet. Learn to fly, navigate by the stars, and bring your crew safely home — one mission at a time.</p><div class="hero-actions"><button class="btn btn-primary" data-mission="lunar">${lunarDone ? 'Fly the Moon again' : 'Start lunar landing'} ${icon('arrowRight')}</button><button class="btn btn-ghost" data-action="manual">${icon('book')}Flight manual</button></div><div class="hero-meta"><span>${icon('clock')}2–3 min</span><span>${icon('shield')}Rookie friendly</span><span class="xp">${icon('star')}+150 XP</span></div></div><div class="hero-telemetry">${icon('radio')}<div><strong>TRANQUILITY BASE</strong><span>LUNAR MODULE · SYSTEMS NOMINAL</span></div></div></section><div class="stat-strip"><div class="stat-card"><div class="stat-icon">${icon('flag')}</div><div><div class="stat-value">${count} <small>/ 4</small></div><div class="stat-label">Missions completed</div></div><span class="stat-note">${count === 4 ? 'All mastered' : 'All unlocked'}</span></div><div class="stat-card"><div class="stat-icon">${icon('sparkle')}</div><div><div class="stat-value">${progress.xp.toLocaleString()}</div><div class="stat-label">Training XP earned</div></div><span class="stat-note">${rankFor(progress.xp).name}</span></div><div class="stat-card"><div class="stat-icon">${icon('clock')}</div><div><div class="stat-value">${formatDuration(progress.flightSeconds)}</div><div class="stat-label">Time in the simulator</div></div><span class="stat-note">Logged live</span></div></div><div class="content-grid"><section><div class="section-heading"><div><h2>The training deck</h2><p>Real skills. Out-of-this-world adventures.</p></div><button class="text-link" data-page="training">View all missions ${icon('arrowRight')}</button></div><div class="mission-grid">${MISSIONS.map((m, i) => missionCard(m, i)).join('')}</div></section><aside class="aside-stack">${flightPlanMarkup()}${intelMarkup()}</aside></div><section class="achievement-preview"><div class="achievement-preview-copy"><h2>Little wins. Big discoveries.</h2><p>${earned.length} of ${ACHIEVEMENTS.length} patches earned. Every mission brings a new one within reach.</p></div><div class="patch-row">${preview.map(a => `<button class="patch-button" data-achievement="${a.id}" aria-label="${a.title} patch, ${earned.includes(a.id) ? 'earned' : 'locked'}">${patchMarkup(a, !earned.includes(a.id), true)}</button>`).join('')}</div><button class="text-link" data-page="achievements">All patches ${icon('arrowRight')}</button></section>`;
}
function trainingPage() {
  const filtered = MISSIONS.filter(m => trainingFilter === 'all' || m.filter === trainingFilter);
  const next = nextMission();
  return `<div class="page-header"><div><div class="eyebrow">Training deck</div><h1>Build your space skills.</h1><p>Every mission is unlocked. Choose a challenge and learn by doing.</p></div><button class="btn btn-secondary" data-action="manual">${icon('book')}Flight manual</button></div><div class="training-banner">${icon('shield')}<div><strong>Training is a safe place to try again.</strong><p>Pause any time, restart as often as you like, and keep the XP you earn.</p></div><button class="btn btn-primary btn-small" data-mission="${next.id}">Continue training ${icon('arrowRight')}</button></div><div class="filter-bar" role="group" aria-label="Filter missions"><button class="filter-button ${trainingFilter === 'all' ? 'active' : ''}" data-filter="all" aria-pressed="${trainingFilter === 'all'}">All missions <span>4</span></button><button class="filter-button ${trainingFilter === 'flight' ? 'active' : ''}" data-filter="flight" aria-pressed="${trainingFilter === 'flight'}">Flight skills <span>2</span></button><button class="filter-button ${trainingFilter === 'science' ? 'active' : ''}" data-filter="science" aria-pressed="${trainingFilter === 'science'}">Space science <span>2</span></button></div><div class="mission-grid training-page-grid">${filtered.map((m, i) => missionCard(m, i, true)).join('')}</div>`;
}
function logPage() {
  return `<div class="page-header"><div><div class="eyebrow">Flight log</div><h1>Every attempt is progress.</h1><p>Your missions, scores, and small steps toward the stars.</p></div><button class="btn btn-secondary" data-action="export">${icon('download')}Export log</button></div><div class="log-toolbar"><div class="search-field">${icon('search')}<input class="input" id="log-search" type="search" placeholder="Search missions or results…" value="${escapeHTML(logFilters.query)}" aria-label="Search flight log"></div><select class="select" id="log-result" aria-label="Filter by result"><option value="all" ${logFilters.result === 'all' ? 'selected' : ''}>All results</option><option value="complete" ${logFilters.result === 'complete' ? 'selected' : ''}>Completed</option><option value="attempt" ${logFilters.result === 'attempt' ? 'selected' : ''}>Practice runs</option></select><select class="select" id="log-sort" aria-label="Sort flight log"><option value="newest" ${logFilters.sort === 'newest' ? 'selected' : ''}>Newest first</option><option value="oldest" ${logFilters.sort === 'oldest' ? 'selected' : ''}>Oldest first</option><option value="score" ${logFilters.sort === 'score' ? 'selected' : ''}>Highest score</option></select><span class="log-count" id="log-count"></span></div><div id="log-table-wrap"></div>`;
}
function filteredAttempts() {
  const query = logFilters.query.trim().toLowerCase();
  const rows = progress.attempts.filter(a => (logFilters.result === 'all' || a.result === logFilters.result) && (!query || `${a.title} ${a.result} ${a.difficulty}`.toLowerCase().includes(query)));
  rows.sort((a, b) => logFilters.sort === 'oldest' ? new Date(a.date) - new Date(b.date) : logFilters.sort === 'score' ? (b.score || 0) - (a.score || 0) : new Date(b.date) - new Date(a.date));
  return rows;
}
function renderLogTable() {
  const wrap = document.getElementById('log-table-wrap');
  const count = document.getElementById('log-count');
  if (!wrap) return;
  const rows = filteredAttempts();
  if (count) count.textContent = `${rows.length} ${rows.length === 1 ? 'entry' : 'entries'}`;
  if (!rows.length) {
    wrap.innerHTML = `<div class="panel empty-state">${icon('search')}<h3>No flights match that search.</h3><p>Try a different mission name or clear your filters.</p><button class="btn btn-secondary btn-small" data-action="clear-log">Clear filters</button></div>`;
    return;
  }
  wrap.innerHTML = `<div class="table-wrap"><table class="log-table"><thead><tr><th>Mission</th><th>Date</th><th>Result</th><th>Score</th><th>XP</th><th>Flight time</th></tr></thead><tbody>${rows.map(a => { const m = missionById[a.mission]; return `<tr tabindex="0" role="button" data-log="${a.id}" aria-label="View ${escapeHTML(a.title)} flight details"><td><div class="log-mission"><span class="log-mission-icon">${icon(m ? m.icon : 'helmet')}</span><span><strong>${escapeHTML(a.title)}</strong><small>${escapeHTML(a.difficulty)}</small></span></div></td><td class="muted">${formatDate(a.date)}</td><td><span class="result-badge ${a.result === 'complete' ? '' : 'attempt'}">${icon(a.result === 'complete' ? 'check' : 'restart')}${a.result === 'complete' ? 'Complete' : 'Practice run'}</span></td><td>${a.score == null ? '—' : a.score.toLocaleString()}</td><td class="yellow">+${a.xp}</td><td class="muted">${formatDuration(a.duration)}</td></tr>`; }).join('')}</tbody></table></div>`;
}
function achievementsPage() {
  const earned = earnedAchievements(progress);
  const rank = rankFor(progress.xp);
  const percent = rank.next ? Math.min(100, (progress.xp - rank.min) / (rank.next.min - rank.min) * 100) : 100;
  return `<div class="page-header"><div><div class="eyebrow">Achievements</div><h1>Your patch collection.</h1><p>${earned.length} of ${ACHIEVEMENTS.length} earned. Wear every small victory with pride.</p></div></div><div class="rank-overview"><div class="rank-emblem">${icon('helmet')}</div><div class="rank-overview-info"><h2>${rank.name}</h2><p>${rank.next ? `${rank.next.min - progress.xp} XP until ${rank.next.name}. Keep flying, cadet.` : 'You have reached the academy’s highest rank. Outstanding work.'}</p><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div></div><div class="rank-overview-xp">${progress.xp.toLocaleString()}<small>total XP</small></div></div><div class="achievement-grid">${ACHIEVEMENTS.map(a => { const has = earned.includes(a.id); return `<button class="achievement-card" data-achievement="${a.id}">${patchMarkup(a, !has)}<h3>${a.title}</h3><p>${a.description}</p><span class="achievement-state ${has ? '' : 'locked'}">${icon(has ? 'check' : 'lock')}${has ? 'Patch earned' : 'Still to discover'}</span></button>`; }).join('')}</div>`;
}

function infoHeader(eyebrow, title) {
  return `<div class="info-header"><div><div class="eyebrow">${eyebrow}</div><h2 id="info-title">${title}</h2></div><button class="icon-button" data-action="close-info" aria-label="Close dialog">${icon('x')}</button></div>`;
}
function openInfo(html) {
  infoContent.innerHTML = html;
  if (!infoDialog.open) infoDialog.showModal();
}
function closeInfo() { if (infoDialog.open) infoDialog.close(); }
function openManual() {
  sound('click');
  openInfo(`${infoHeader('Academy handbook', 'Your flight manual')}<div class="info-body"><section class="manual-section"><h3>${icon('rocket')}Learn by flying</h3><p>All four missions are open from day one. Complete a mission to earn its patch and XP. Replay any mission to improve your score — repeat completions still earn 25 XP.</p></section><section class="manual-section"><h3>${icon('compass')}Mission tips</h3>${MISSIONS.map(m => `<div class="manual-mission">${icon(m.icon)}<div><strong>${m.title}</strong><p>${m.id === 'lunar' ? 'Steer with the side jets and use short upward bursts to brake. Touch the green pad slowly.' : m.id === 'docking' ? 'Match the moving ring’s height, then approach slowly. Space or the brake button settles your craft.' : m.id === 'stars' ? 'Select Orion’s stars in the briefing order. Rookie mode highlights the next star.' : 'Read each system warning and choose the safe fix. Launch only when all six lights are green.'}</p></div></div>`).join('')}</section><section class="manual-section"><h3>${icon('gauge')}Controls & comfort</h3><ul><li>Keyboard: arrows or WASD to fly, Space to brake in docking, P or Esc to pause, R to restart.</li><li>Touch: use the large buttons below the simulator. Star and system missions also work by tapping.</li><li>Choose Rookie or Commander before a run. Commander adds tighter limits and less time.</li><li>Sound is on by default. The speaker button at the top mutes everything instantly.</li></ul></section><div class="form-actions"><button class="btn btn-primary" data-action="close-info">Got it, Mission Control ${icon('check')}</button></div></div>`);
}
function openProfile() {
  sound('click');
  profilePatch = progress.patch;
  openInfo(`${infoHeader('Cadet record', 'Make it yours.')}<form class="info-body" id="profile-form"><div class="form-field"><label for="callsign-input">Your callsign</label><input class="input" id="callsign-input" name="callsign" maxlength="18" minlength="2" required value="${escapeHTML(progress.callsign)}" autocomplete="off"><div class="form-error" id="profile-error" role="alert"></div></div><div class="form-field"><span class="form-label">Patch color</span><div class="patch-picker" role="group" aria-label="Patch color">${['orange', 'cyan', 'lilac', 'green'].map(color => `<button type="button" class="patch-swatch ${profilePatch === color ? 'selected' : ''}" data-patch-color="${color}" aria-label="${color} patch" aria-pressed="${profilePatch === color}">${icon('helmet')}</button>`).join('')}</div></div><p class="muted">Your progress is saved on this device. Cadet since ${new Date(progress.joined).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p><div class="form-actions"><button type="button" class="btn btn-secondary" data-action="close-info">Cancel</button><button type="submit" class="btn btn-primary">Save callsign ${icon('check')}</button></div></form>`);
  document.getElementById('callsign-input').focus();
}
function openAchievement(id) {
  const a = ACHIEVEMENTS.find(item => item.id === id);
  if (!a) return;
  sound('click');
  const earned = earnedAchievements(progress).includes(id);
  openInfo(`${infoHeader('Patch record', a.title)}<div class="info-body"><div class="detail-patch">${patchMarkup(a, !earned)}<h3>${earned ? 'Earned. Well flown.' : 'A new challenge awaits.'}</h3><p>${a.description}</p></div><div class="detail-grid"><div class="detail-item"><span>Status</span><strong class="${earned ? 'green' : 'muted'}">${earned ? 'In your collection' : 'Locked'}</strong></div><div class="detail-item"><span>Reward</span><strong>Academy patch</strong></div></div><div class="form-actions"><button class="btn btn-secondary" data-action="close-info">Close</button>${a.mission ? `<button class="btn btn-primary" data-mission="${a.mission}">${earned ? 'Fly again' : 'Train for this patch'} ${icon('arrowRight')}</button>` : ''}</div></div>`);
}
function openLogDetail(id) {
  const a = progress.attempts.find(item => item.id === id);
  if (!a) return;
  sound('click');
  const m = missionById[a.mission];
  const reason = a.reason === 'joined' ? 'You joined Orbit Academy and received your welcome patch and 120 starter XP.' : a.result === 'complete' ? (m?.successText || 'Mission complete.') : (failureReasons[a.reason] || 'A practice run is a step forward. Try again when you are ready.');
  openInfo(`${infoHeader('Flight record', escapeHTML(a.title))}<div class="info-body"><p>${reason}</p><div class="detail-grid"><div class="detail-item"><span>Date</span><strong>${formatDate(a.date)}</strong></div><div class="detail-item"><span>Difficulty</span><strong>${escapeHTML(a.difficulty)}</strong></div><div class="detail-item"><span>Result</span><strong class="${a.result === 'complete' ? 'green' : 'yellow'}">${a.result === 'complete' ? 'Mission complete' : 'Practice run'}</strong></div><div class="detail-item"><span>Score</span><strong>${a.score == null ? '—' : a.score.toLocaleString()}</strong></div><div class="detail-item"><span>XP earned</span><strong class="yellow">+${a.xp}</strong></div><div class="detail-item"><span>Flight time</span><strong>${formatDuration(a.duration)}</strong></div></div><div class="form-actions"><button class="btn btn-secondary" data-action="close-info">Close</button>${m ? `<button class="btn btn-primary" data-mission="${m.id}">Train again ${icon('arrowRight')}</button>` : ''}</div></div>`);
}
function exportLog() {
  const rows = filteredAttempts();
  const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = [['Date', 'Mission', 'Result', 'Score', 'XP', 'Flight time (s)', 'Difficulty'].map(csvCell).join(',')];
  rows.forEach(a => lines.push([a.date, a.title, a.result === 'complete' ? 'Complete' : 'Practice run', a.score ?? '', a.xp, a.duration, a.difficulty].map(csvCell).join(',')));
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'orbit-academy-flight-log.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  sound('click');
  toast(`Exported ${rows.length} flight ${rows.length === 1 ? 'entry' : 'entries'}.`, 'download');
}

function isLive() { return active && (active.mode === 'running' || active.mode === 'launching'); }
function inputState() { return { left: held.has('left'), right: held.has('right'), up: held.has('up'), down: held.has('down'), brake: held.has('brake') }; }
function openMission(id) {
  const mission = missionById[id];
  if (!mission) return;
  closeInfo();
  if (active) cancelAnimationFrame(active.raf);
  held.clear();
  setThrust(false);
  active = { id, mission, difficulty: progress.difficulty || 'rookie', mode: 'ready', previousMode: 'running', g: createGameState(id, progress.difficulty || 'rookie'), raf: 0, last: performance.now(), hudAccum: 0, result: null };
  renderGameShell();
  if (!missionDialog.open) missionDialog.showModal();
  resizeCanvas();
  renderOverlay();
  updateGameUI();
  drawGame(active.ctx, active.g, performance.now());
  startLoop();
  sound('select');
  const primary = gameShell.querySelector('.overlay-card .btn-primary');
  if (primary) primary.focus({ preventScroll: true });
}
function renderGameShell() {
  const m = active.mission;
  gameShell.innerHTML = `<header class="game-header"><div class="game-title-group"><span class="game-mission-icon">${icon(m.icon)}</span><div><div class="eyebrow">Mission ${m.number} · Training simulator</div><h2 id="game-title">${m.title}</h2></div></div><div class="game-header-actions"><button id="game-sound" class="icon-button" data-action="sound" aria-pressed="${progress.sound}"></button><button id="game-pause" class="btn btn-secondary btn-small" data-game-action="pause">${icon('pause')}<span>Pause</span></button><button class="btn btn-secondary btn-small" data-game-action="restart">${icon('restart')}<span>Restart</span></button><button class="icon-button" data-game-action="close" aria-label="Close simulator">${icon('x')}</button></div></header><div class="game-body"><div class="game-stage"><div class="hud" id="game-hud"></div><canvas id="game-canvas" class="game-canvas" tabindex="0" aria-label="${m.title} simulator. ${m.readyText}">Your browser needs canvas support to run this simulator.</canvas><div class="game-controls" id="game-controls"></div><div class="game-overlay" id="game-overlay"></div></div><aside class="game-briefing"><div class="eyebrow">Your objective</div><h3>${m.id === 'lunar' ? 'A soft touchdown.' : m.id === 'docking' ? 'A steady connection.' : m.id === 'stars' ? 'A course through Orion.' : 'A safe launch.'}</h3><p>${m.brief}</p><div class="briefing-section"><span class="eyebrow">Mission checklist</span><ul class="objective-list" id="objective-list"></ul></div>${m.id === 'stars' ? `<div class="briefing-section"><span class="eyebrow">Flight path order</span><p class="muted" style="font-size:11px;line-height:1.8">${STAR_ROUTE.map(i => STAR_NAMES[i]).join(' → ')}</p></div>` : ''}<div class="briefing-section"><span class="eyebrow">Flight controls</span><div class="briefing-controls">${m.controls.map(([label, key]) => `<div><span>${label}</span><kbd>${key}</kbd></div>`).join('')}</div></div><div class="briefing-section"><label class="eyebrow" for="difficulty-select">Difficulty</label><select class="select" id="difficulty-select" style="width:100%;margin-top:8px"><option value="rookie" ${active.difficulty === 'rookie' ? 'selected' : ''}>Rookie · guided limits</option><option value="commander" ${active.difficulty === 'commander' ? 'selected' : ''}>Commander · tighter limits</option></select></div><div class="game-notice" id="game-notice" role="status"></div></aside></div><footer class="game-footer"><span>${icon('shield')}Training is a safe place to try again.</span><span>ORBIT ACADEMY · SIMULATOR ONLINE</span></footer>`;
  active.canvas = document.getElementById('game-canvas');
  active.ctx = active.canvas.getContext('2d');
  renderControls();
  updateSoundButtons();
  if (resizeObserver) resizeObserver.disconnect();
  resizeObserver = new ResizeObserver(() => resizeCanvas());
  resizeObserver.observe(active.canvas);
}
function resizeCanvas() {
  if (!active || !active.canvas) return;
  const rect = active.canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  active.canvas.width = Math.round(rect.width * dpr);
  active.canvas.height = Math.round(rect.height * dpr);
  active.ctx.setTransform(active.canvas.width / WORLD.w, 0, 0, active.canvas.height / WORLD.h, 0, 0);
  if (active.g) drawGame(active.ctx, active.g, performance.now());
}
function renderControls() {
  const controls = document.getElementById('game-controls');
  if (!controls || !active) return;
  const g = active.g;
  if (active.id === 'lunar' || active.id === 'docking') {
    const docking = active.id === 'docking';
    controls.innerHTML = `<div class="flight-controls"><button class="control-button" data-control="left" aria-label="Steer left">${icon('left')}<span>Left</span></button>${docking ? `<button class="control-button" data-control="up" aria-label="Jet up">${icon('up')}</button><button class="control-button" data-control="down" aria-label="Jet down">${icon('down')}</button>` : ''}<button class="control-button thrust" data-control="up" aria-label="${docking ? 'Jet up' : 'Main thruster'}">${icon('up')}<span>${docking ? 'Up' : 'Thruster'}</span></button>${docking ? `<button class="control-button" data-control="brake" aria-label="Stabilize and brake">${icon('target')}<span>Brake</span></button>` : ''}<button class="control-button" data-control="right" aria-label="Steer right"><span>Right</span>${icon('arrowRight')}</button></div><div class="control-hint">${docking ? 'Arrows / WASD to move · Space to brake' : '← → to steer · Hold ↑ to slow your fall'} · P to pause</div>`;
  } else if (active.id === 'stars') {
    controls.innerHTML = `<div class="star-controls">${g.buttonOrder.map((starIndex, i) => `<button class="star-button ${g.selected.includes(starIndex) ? 'linked' : ''}" data-star="${starIndex}">${i + 1}. ${STAR_NAMES[starIndex]}</button>`).join('')}</div><div class="control-hint">Tap the map or a named star · Keys 1–7 follow the buttons above</div>`;
  } else {
    const selected = g.systems.find(s => s.id === g.selected);
    const chips = g.systems.map(s => `<button class="system-chip ${s.id === g.selected ? 'selected' : ''} ${s.status === 'ready' ? 'ready' : ''}" data-system-select="${s.id}">${icon(s.status === 'ready' ? 'check' : s.icon)}${s.name}</button>`).join('');
    const diagnostic = g.readyCount === 6 ? `<div class="diagnostic launch-ready"><p>${icon('check')} All systems green.</p><button class="btn btn-primary btn-small" data-game-action="launch" ${g.launching ? 'disabled' : ''}>${icon('rocket')}${g.launching ? 'Launching…' : 'Launch'}</button></div>` : selected ? `<div class="diagnostic"><div class="diagnostic-head"><strong>${selected.name} system</strong><span>${selected.status === 'ready' ? 'Nominal' : selected.status === 'checking' ? 'Checking…' : selected.problem}</span></div>${selected.status === 'pending' ? `<div class="diagnostic-options">${selected.options.map((option, i) => `<button class="btn btn-secondary btn-small" data-system-answer="${i}">${option}</button>`).join('')}</div>` : `<p class="muted" style="font-size:11px">${selected.status === 'ready' ? `${selected.correct} — check passed.` : 'Running diagnostics. Hold position.'}</p>`}</div>` : '';
    controls.innerHTML = `<div class="system-chips">${chips}</div>${diagnostic}<div class="control-hint">Select a system, read its warning, and choose the safe fix.</div>`;
  }
  updateControlDisabled();
}
function updateControlDisabled() {
  if (!active) return;
  const live = isLive();
  gameShell.querySelectorAll('[data-control], [data-star], [data-system-select], [data-system-answer]').forEach(button => { button.disabled = !live || active.g.launching; });
  const launch = gameShell.querySelector('[data-game-action="launch"]');
  if (launch) launch.disabled = !live || active.g.launching;
  const difficulty = document.getElementById('difficulty-select');
  if (difficulty) difficulty.disabled = live;
  const pause = document.getElementById('game-pause');
  if (pause) {
    pause.disabled = active.mode === 'ready' || active.mode === 'success' || active.mode === 'failed';
    pause.innerHTML = `${icon(active.mode === 'paused' ? 'play' : 'pause')}<span>${active.mode === 'paused' ? 'Resume' : 'Pause'}</span>`;
  }
}
function updateGameUI() {
  if (!active) return;
  const hud = document.getElementById('game-hud');
  if (hud) hud.innerHTML = gameHUD(active.g).map(item => `<div class="hud-item"><span class="hud-label">${item.label}</span><span class="hud-value ${item.tone || ''}">${item.value}</span></div>`).join('');
  const objectives = document.getElementById('objective-list');
  if (objectives) objectives.innerHTML = gameObjectives(active.g).map(o => `<li class="${o.done ? 'done' : ''}"><span class="objective-check">${icon(o.done ? 'check' : 'target')}</span><span>${o.text}</span></li>`).join('');
  const notice = document.getElementById('game-notice');
  if (notice) { const n = gameNotice(active.g); notice.textContent = n.text; notice.classList.toggle('warn', n.warn); }
  updateControlDisabled();
}
function renderOverlay() {
  const overlay = document.getElementById('game-overlay');
  if (!overlay || !active) return;
  if (isLive()) { overlay.hidden = true; overlay.innerHTML = ''; return; }
  overlay.hidden = false;
  const m = active.mission;
  if (active.mode === 'ready') {
    overlay.innerHTML = `<div class="overlay-card"><div class="overlay-emblem">${icon(m.icon)}</div><div class="eyebrow">Mission ${m.number} · Ready when you are</div><h3>${m.readyTitle}</h3><p>${m.readyText}</p><div class="overlay-actions"><button class="btn btn-primary" data-game-action="start">${icon('play')}Launch training</button><button class="btn btn-ghost" data-game-action="close">Back to base</button></div><div class="overlay-tip">Rookie mode is selected. You can change it in the briefing.</div></div>`;
  } else if (active.mode === 'paused') {
    overlay.innerHTML = `<div class="overlay-card"><div class="overlay-emblem">${icon('pause')}</div><div class="eyebrow">Simulation paused</div><h3>Holding position.</h3><p>Take a breath, cadet. Your mission will be right here when you are ready.</p><div class="overlay-actions"><button class="btn btn-primary" data-game-action="resume">${icon('play')}Resume mission</button><button class="btn btn-secondary" data-game-action="restart">${icon('restart')}Restart</button><button class="btn btn-ghost" data-game-action="close">Back to base</button></div></div>`;
  } else if (active.mode === 'success') {
    const r = active.result;
    const next = MISSIONS.find(item => !progress.completed[item.id] && item.id !== active.id);
    overlay.innerHTML = `<div class="overlay-card"><div class="overlay-emblem success">${icon('trophy')}</div><div class="eyebrow" style="color:var(--green)">Mission complete</div><h3>${m.successTitle}</h3><p>${m.successText}</p><div class="result-stats"><div class="result-stat"><strong>${r.score}</strong><span>Score</span></div><div class="result-stat"><strong>+${r.reward}</strong><span>XP earned</span></div><div class="result-stat"><strong>${formatDuration(r.duration)}</strong><span>Flight time</span></div></div>${r.newPatch ? `<div class="new-patch">${icon('award')}New patch: ${r.newPatch}</div>` : ''}<div class="overlay-actions">${next ? `<button class="btn btn-primary" data-game-action="next">Next mission ${icon('arrowRight')}</button>` : `<button class="btn btn-primary" data-game-action="close">Back to base ${icon('arrowRight')}</button>`}<button class="btn btn-secondary" data-game-action="restart">${icon('restart')}Fly again</button><button class="btn btn-ghost" data-game-action="close">Close</button></div></div>`;
  } else if (active.mode === 'failed') {
    overlay.innerHTML = `<div class="overlay-card"><div class="overlay-emblem">${icon('restart')}</div><div class="eyebrow">Keep exploring</div><h3>Every astronaut tries again.</h3><p>${failureReasons[active.result?.reason] || 'That run is over, but your next attempt is a fresh start.'}</p><div class="overlay-actions"><button class="btn btn-primary" data-game-action="restart">${icon('restart')}Try again</button><button class="btn btn-ghost" data-game-action="close">Back to base</button></div><div class="overlay-tip">Your attempt is saved in the flight log. Practice still counts.</div></div>`;
  }
  const primary = overlay.querySelector('.btn-primary');
  if (primary) primary.focus({ preventScroll: true });
}
function startLoop() {
  if (!active) return;
  cancelAnimationFrame(active.raf);
  active.last = performance.now();
  const frame = ts => {
    if (!active) return;
    const dt = Math.min((ts - active.last) / 1000, .04);
    active.last = ts;
    if (isLive()) {
      const event = updateGame(active.g, dt, inputState());
      if (event) handleGameEvent(event);
      setThrust(active.id === 'lunar' && active.mode === 'running' && held.has('up') && active.g.fuel > 0);
    }
    drawGame(active.ctx, active.g, ts);
    active.hudAccum += dt;
    if (active.hudAccum >= .08) { active.hudAccum = 0; updateGameUI(); }
    active.raf = requestAnimationFrame(frame);
  };
  active.raf = requestAnimationFrame(frame);
}
function startRun() {
  if (!active || active.mode !== 'ready') return;
  active.mode = 'running';
  active.previousMode = 'running';
  held.clear();
  renderOverlay();
  updateGameUI();
  active.canvas.focus({ preventScroll: true });
  active.last = performance.now();
  sound('launch');
}
function pauseGame() {
  if (!isLive()) return;
  active.previousMode = active.mode;
  active.mode = 'paused';
  held.clear();
  setThrust(false);
  gameShell.querySelectorAll('.held').forEach(b => b.classList.remove('held'));
  renderOverlay();
  updateGameUI();
  sound('click');
}
function resumeGame() {
  if (!active || active.mode !== 'paused') return;
  active.mode = active.previousMode || 'running';
  renderOverlay();
  updateGameUI();
  active.canvas.focus({ preventScroll: true });
  active.last = performance.now();
  sound('click');
}
function restartMission() {
  if (!active) return;
  held.clear();
  setThrust(false);
  active.g = createGameState(active.id, active.difficulty);
  active.mode = 'running';
  active.previousMode = 'running';
  active.result = null;
  renderControls();
  renderOverlay();
  updateGameUI();
  active.canvas.focus({ preventScroll: true });
  active.last = performance.now();
  sound('launch');
}
function closeGame() {
  if (!active) { if (missionDialog.open) missionDialog.close(); return; }
  cancelAnimationFrame(active.raf);
  if (resizeObserver) resizeObserver.disconnect();
  held.clear();
  setThrust(false);
  active = null;
  if (missionDialog.open) missionDialog.close();
  renderPage(false);
}
function finishGame(event) {
  if (!active || active.mode === 'success' || active.mode === 'failed') return;
  const g = active.g;
  const success = event.type === 'success';
  const duration = Math.round(g.elapsed);
  const score = success ? gameScore(g) : 0;
  const first = !progress.completed[active.id];
  const reward = success ? (first ? active.mission.xp : 25) : 0;
  const before = earnedAchievements(progress);
  active.mode = success ? 'success' : 'failed';
  active.result = { score, reward, duration, reason: event.reason, newPatch: null };
  held.clear();
  setThrust(false);
  if (success) {
    const previousBest = progress.best[active.id] || 0;
    progress.completed[active.id] = { date: new Date().toISOString(), score: Math.max(previousBest, score) };
    progress.best[active.id] = Math.max(previousBest, score);
    progress.xp += reward;
  }
  progress.flightSeconds += duration;
  progress.attempts.unshift({ id: `${active.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, mission: active.id, title: active.mission.title, result: success ? 'complete' : 'attempt', score: success ? score : null, xp: reward, duration, difficulty: active.difficulty === 'rookie' ? 'Rookie' : 'Commander', date: new Date().toISOString(), reason: event.reason });
  if (progress.attempts.length > 250) progress.attempts.length = 250;
  const after = earnedAchievements(progress);
  const newIds = after.filter(id => !before.includes(id));
  if (newIds.length) active.result.newPatch = ACHIEVEMENTS.find(a => a.id === newIds[0]).title;
  saveProgress();
  updateChrome();
  renderOverlay();
  updateGameUI();
  sound(success ? 'success' : 'fail');
}
function handleGameEvent(event) {
  if (!active || !event) return;
  if (event.type === 'success' || event.type === 'fail') { finishGame(event); return; }
  if (event.type === 'correct' || event.type === 'system-ready') { sound('correct'); renderControls(); }
  else if (event.type === 'wrong') { sound('wrong'); renderControls(); }
  else if (event.type === 'bump') sound('bump');
  else if (event.type === 'select') { sound('select'); renderControls(); }
  updateGameUI();
}
function changeDifficulty(value) {
  if (!active || isLive() || !['rookie', 'commander'].includes(value)) return;
  active.difficulty = value;
  progress.difficulty = value;
  saveProgress();
  active.g = createGameState(active.id, value);
  active.mode = 'ready';
  active.result = null;
  held.clear();
  renderControls();
  renderOverlay();
  updateGameUI();
  toast(`${value === 'rookie' ? 'Rookie' : 'Commander'} limits loaded.`, 'gauge');
}
function launchRocket() {
  if (!active || active.id !== 'systems') return;
  if (startLaunch(active.g)) {
    active.mode = 'launching';
    active.previousMode = 'launching';
    renderControls();
    renderOverlay();
    updateGameUI();
    sound('launch');
  }
}

function handleClick(event) {
  const target = event.target.closest('button, [data-log], [data-page], [data-mission], [data-action], [data-filter], [data-achievement], [data-game-action], [data-patch-color], [data-system-select], [data-system-answer], [data-star]');
  if (!target || target.disabled) return;
  if (target.dataset.gameAction) {
    const action = target.dataset.gameAction;
    if (action === 'start') startRun();
    else if (action === 'resume') resumeGame();
    else if (action === 'pause') active?.mode === 'paused' ? resumeGame() : pauseGame();
    else if (action === 'restart') restartMission();
    else if (action === 'close') closeGame();
    else if (action === 'launch') launchRocket();
    else if (action === 'next' && active) {
      const next = MISSIONS.find(m => !progress.completed[m.id] && m.id !== active.id);
      if (next) openMission(next.id); else closeGame();
    }
    return;
  }
  if (target.dataset.star !== undefined && active && isLive()) { handleGameEvent(selectStar(active.g, Number(target.dataset.star))); return; }
  if (target.dataset.systemSelect && active && isLive()) { if (selectSystem(active.g, target.dataset.systemSelect)) handleGameEvent({ type: 'select' }); return; }
  if (target.dataset.systemAnswer !== undefined && active && isLive()) { handleGameEvent(answerSystem(active.g, Number(target.dataset.systemAnswer))); return; }
  if (target.dataset.patchColor) {
    profilePatch = target.dataset.patchColor;
    infoContent.querySelectorAll('[data-patch-color]').forEach(b => { const selected = b.dataset.patchColor === profilePatch; b.classList.toggle('selected', selected); b.setAttribute('aria-pressed', String(selected)); });
    sound('select');
    return;
  }
  if (target.dataset.mission) { openMission(target.dataset.mission); return; }
  if (target.dataset.page) { sound('click'); navigate(target.dataset.page); return; }
  if (target.dataset.filter) { trainingFilter = target.dataset.filter; sound('click'); renderPage(false); return; }
  if (target.dataset.achievement) { openAchievement(target.dataset.achievement); return; }
  if (target.dataset.log) { openLogDetail(target.dataset.log); return; }
  const action = target.dataset.action;
  if (!action) return;
  if (action === 'sound') toggleSound();
  else if (action === 'manual') openManual();
  else if (action === 'profile') openProfile();
  else if (action === 'close-info') { sound('click'); closeInfo(); }
  else if (action === 'fact') { factIndex = (factIndex + 1) % FACTS.length; const fact = FACTS[factIndex]; document.getElementById('intel-title').textContent = fact.title; document.getElementById('intel-text').textContent = fact.text; sound('click'); }
  else if (action === 'export') exportLog();
  else if (action === 'clear-log') { logFilters = { query: '', result: 'all', sort: 'newest' }; const search = document.getElementById('log-search'); const result = document.getElementById('log-result'); const sort = document.getElementById('log-sort'); if (search) search.value = ''; if (result) result.value = 'all'; if (sort) sort.value = 'newest'; renderLogTable(); sound('click'); }
}
const keyMap = { arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right', arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', ' ': 'brake' };
function handleKeyDown(event) {
  if (event.target.matches?.('[data-log]') && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openLogDetail(event.target.dataset.log); return; }
  if (!missionDialog.open || !active || infoDialog.open) return;
  const key = event.key.toLowerCase();
  if (key === 'p') { event.preventDefault(); active.mode === 'paused' ? resumeGame() : pauseGame(); return; }
  if (key === 'r' && active.mode !== 'ready') { event.preventDefault(); restartMission(); return; }
  if (!isLive()) return;
  if (active.id === 'stars' && /^[1-7]$/.test(key)) { event.preventDefault(); handleGameEvent(selectStar(active.g, active.g.buttonOrder[Number(key) - 1])); return; }
  if (active.id === 'lunar' || active.id === 'docking') {
    const control = keyMap[key];
    if (control) {
      event.preventDefault();
      if (active.id === 'lunar' && control === 'brake') return;
      held.add(control);
      gameShell.querySelectorAll(`[data-control="${control}"]`).forEach(b => b.classList.add('held'));
    }
  }
}
function handleKeyUp(event) {
  const control = keyMap[event.key.toLowerCase()];
  if (!control) return;
  held.delete(control);
  gameShell.querySelectorAll(`[data-control="${control}"]`).forEach(b => b.classList.remove('held'));
}
function handlePointerDown(event) {
  const button = event.target.closest('[data-control]');
  if (button && active && isLive() && !button.disabled) {
    event.preventDefault();
    ensureAudio();
    button.setPointerCapture(event.pointerId);
    held.add(button.dataset.control);
    button.classList.add('held');
    return;
  }
  const canvas = event.target.closest('#game-canvas');
  if (canvas && active && isLive() && (active.id === 'stars' || active.id === 'systems')) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * WORLD.w;
    const y = (event.clientY - rect.top) / rect.height * WORLD.h;
    handleGameEvent(pointerGame(active.g, x, y));
  }
}
function releaseControl(event) {
  const button = event.target.closest?.('[data-control]');
  if (!button) return;
  held.delete(button.dataset.control);
  button.classList.remove('held');
}
function handleSubmit(event) {
  if (event.target.id !== 'profile-form') return;
  event.preventDefault();
  const input = document.getElementById('callsign-input');
  const error = document.getElementById('profile-error');
  const callsign = input.value.trim().replace(/\s+/g, ' ');
  if (callsign.length < 2) { error.textContent = 'Choose a callsign with at least two characters.'; input.focus(); return; }
  progress.callsign = callsign.slice(0, 18);
  progress.patch = profilePatch;
  saveProgress();
  closeInfo();
  renderPage(false);
  sound('correct');
  toast(`Callsign updated. Welcome, ${progress.callsign}.`, 'helmet');
}
function handleInput(event) {
  const id = event.target.id;
  if (id === 'log-search' && event.type === 'input') { logFilters.query = event.target.value; renderLogTable(); }
  else if (event.type === 'change' && id === 'log-result') { logFilters.result = event.target.value; renderLogTable(); }
  else if (event.type === 'change' && id === 'log-sort') { logFilters.sort = event.target.value; renderLogTable(); }
  else if (event.type === 'change' && id === 'difficulty-select') changeDifficulty(event.target.value);
}

renderShell();
renderPage();
document.addEventListener('click', handleClick);
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
document.addEventListener('pointerdown', handlePointerDown);
document.addEventListener('pointerup', releaseControl);
document.addEventListener('pointercancel', releaseControl);
document.addEventListener('lostpointercapture', releaseControl);
document.addEventListener('submit', handleSubmit);
document.addEventListener('input', handleInput);
document.addEventListener('change', handleInput);
document.addEventListener('pointerdown', () => ensureAudio(), { passive: true });
document.addEventListener('keydown', () => ensureAudio(), { passive: true });
document.addEventListener('contextmenu', event => { if (event.target.closest('#game-canvas, [data-control]')) event.preventDefault(); });
missionDialog.addEventListener('cancel', event => { event.preventDefault(); if (isLive()) pauseGame(); else closeGame(); });
infoDialog.addEventListener('click', event => { if (event.target === infoDialog) closeInfo(); });
window.addEventListener('hashchange', () => { currentPage = pageFromHash(); renderPage(); });
window.addEventListener('resize', () => resizeCanvas());
window.addEventListener('blur', () => { if (isLive()) pauseGame(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && isLive()) pauseGame(); });
document.getElementById('main-content').addEventListener('pointermove', event => {
  const hero = event.target.closest('.hero');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const rect = hero.getBoundingClientRect();
  hero.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width - .5).toFixed(2));
  hero.style.setProperty('--my', ((event.clientY - rect.top) / rect.height - .5).toFixed(2));
});
document.getElementById('main-content').addEventListener('pointerleave', event => {
  const hero = event.target.closest?.('.hero');
  if (hero) { hero.style.setProperty('--mx', 0); hero.style.setProperty('--my', 0); }
});