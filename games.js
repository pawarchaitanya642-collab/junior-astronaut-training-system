import { STAR_NAMES, STAR_ROUTE, STAR_POSITIONS, SYSTEMS } from './data.js';

export const WORLD = { w: 960, h: 600 };
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rand = (min, max) => min + Math.random() * (max - min);
const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const CONFIG = {
  lunar: {
    rookie: { gravity: 23, thrust: 58, lateral: 38, fuel: 100, padX: 610, padW: 200, maxV: 34, maxH: 24, time: 120, startX: 245, startVX: 24 },
    commander: { gravity: 30, thrust: 66, lateral: 44, fuel: 85, padX: 650, padW: 140, maxV: 26, maxH: 18, time: 100, startX: 215, startVX: 32 }
  },
  docking: {
    rookie: { accel: 78, damping: .986, amp: 42, drift: .55, maxSpeed: 48, align: 25, time: 110, bumps: 3, fuel: 100 },
    commander: { accel: 88, damping: .99, amp: 70, drift: .8, maxSpeed: 38, align: 19, time: 95, bumps: 3, fuel: 85 }
  },
  stars: {
    rookie: { time: 120, mistakes: 3, hint: true },
    commander: { time: 80, mistakes: 2, hint: false }
  },
  systems: {
    rookie: { time: 150, mistakes: 3, options: 2 },
    commander: { time: 110, mistakes: 2, options: 3 }
  }
};

const backgroundStars = Array.from({ length: 105 }, (_, i) => ({
  x: (Math.sin(i * 127.1) * 43758.5453 % 1 + 1) % 1 * WORLD.w,
  y: (Math.sin(i * 311.7) * 19642.349 % 1 + 1) % 1 * WORLD.h,
  r: .6 + ((i * 17) % 10) / 9,
  phase: i * .73
}));

function baseState(id, difficulty) {
  const config = CONFIG[id][difficulty];
  return { id, difficulty, config, elapsed: 0, timeLimit: config.time, finished: false, particles: [], shake: 0, notice: '', noticeWarn: false, noticeUntil: 0, hudTimer: 0 };
}

function notify(g, text, warn = false, duration = 3.5) {
  g.notice = text;
  g.noticeWarn = warn;
  g.noticeUntil = g.elapsed + duration;
}

function terrainFor(config) {
  return [[0, 468], [90, 448], [175, 482], [265, 442], [350, 474], [440, 452], [530, 486], [config.padX - 35, 452], [config.padX, 470], [config.padX + config.padW, 470], [config.padX + config.padW + 45, 446], [865, 474], [960, 432]];
}

export function surfaceY(g, x) {
  const points = g.terrain;
  if (x >= g.config.padX && x <= g.config.padX + g.config.padW) return 470;
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    if (x >= x1 && x <= x2) return y1 + (y2 - y1) * ((x - x1) / (x2 - x1 || 1));
  }
  return 470;
}

export function createGameState(id, difficulty = 'rookie') {
  const g = baseState(id, difficulty);
  if (id === 'lunar') {
    Object.assign(g, { x: g.config.startX, y: 95, vx: g.config.startVX, vy: 0, fuel: g.config.fuel, terrain: terrainFor(g.config), thrusting: false, steering: 0 });
    notify(g, 'Steer toward the green pad, then hold the thruster to slow your fall.', false, 8);
  } else if (id === 'docking') {
    Object.assign(g, { x: 150, y: 340, vx: 0, vy: 0, fuel: g.config.fuel, bumps: 0, target: { x: 730, y: 280 }, jets: { x: 0, y: 0 } });
    notify(g, 'Match the ring’s height first. A slow approach is a safe approach.', false, 8);
  } else if (id === 'stars') {
    Object.assign(g, { progress: 0, mistakes: 0, selected: [], buttonOrder: shuffle([0, 1, 2, 3, 4, 5, 6]), flashIndex: -1, flashUntil: 0 });
    notify(g, `Begin at ${STAR_NAMES[STAR_ROUTE[0]]}. Follow the route in your briefing.`, false, 8);
  } else if (id === 'systems') {
    const systems = SYSTEMS.map(s => ({ ...s, options: shuffle([s.correct, ...s.options.slice(0, g.config.options - 1)]), status: 'pending', checkEnds: 0 }));
    Object.assign(g, { systems, selected: systems[0].id, mistakes: 0, readyCount: 0, launching: false, launchTime: 0 });
    notify(g, 'Select a system and choose the fix that makes it safe.', false, 8);
  }
  return g;
}

function addParticle(g, x, y, vx, vy, life, color, size) {
  if (g.particles.length > 220) g.particles.shift();
  g.particles.push({ x, y, vx, vy, life, maxLife: life, color, size });
}

function updateParticles(g, dt) {
  for (const p of g.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    p.size += dt * 5;
  }
  g.particles = g.particles.filter(p => p.life > 0);
}

function updateLunar(g, dt, input) {
  const c = g.config;
  g.thrusting = !!input.up && g.fuel > 0;
  g.steering = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  g.vy += c.gravity * dt;
  if (g.thrusting) {
    g.vy -= c.thrust * dt;
    g.fuel -= 6 * dt;
    addParticle(g, g.x + rand(-6, 6), g.y + 31, rand(-14, 14) - g.vx * .15, rand(65, 115), rand(.25, .55), '#8ee7f7', rand(2, 4));
  }
  if (g.steering && g.fuel > 0) {
    g.vx += g.steering * c.lateral * dt;
    g.fuel -= 1.4 * dt;
    addParticle(g, g.x - g.steering * 25, g.y + 8, -g.steering * rand(45, 75), rand(-8, 8), .25, '#c9e7ff', 2);
  }
  g.fuel = Math.max(0, g.fuel);
  g.vx *= Math.pow(.999, dt * 60);
  g.vx = clamp(g.vx, -95, 95);
  g.vy = clamp(g.vy, -115, 140);
  g.x += g.vx * dt;
  g.y += g.vy * dt;
  if (g.x < 30 || g.x > 930) { g.x = clamp(g.x, 30, 930); g.vx *= -.35; }
  if (g.y < 38) { g.y = 38; g.vy = Math.max(0, g.vy); }
  if (g.fuel <= 0 && !g.fuelWarned) { g.fuelWarned = true; notify(g, 'Fuel exhausted. Gravity has the controls now.', true, 6); }
  const ground = surfaceY(g, g.x);
  if (g.y + 30 >= ground) {
    g.y = ground - 30;
    const onPad = g.x >= c.padX + 8 && g.x <= c.padX + c.padW - 8;
    const soft = g.vy <= c.maxV && g.vy >= 0;
    const level = Math.abs(g.vx) <= c.maxH;
    if (onPad && soft && level && g.fuel > 0) {
      g.metrics = { vertical: g.vy, horizontal: g.vx, fuel: g.fuel };
      return { type: 'success', reason: 'soft-landing' };
    }
    g.shake = 10;
    let reason = 'off-pad';
    if (!onPad) reason = 'off-pad';
    else if (g.fuel <= 0) reason = 'fuel';
    else if (!soft) reason = 'descent';
    else if (!level) reason = 'drift';
    return { type: 'fail', reason };
  }
  return null;
}

function updateDocking(g, dt, input) {
  const c = g.config;
  g.target.y = 280 + Math.sin(g.elapsed * c.drift) * c.amp;
  const ax = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const ay = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  g.jets = { x: ax, y: ay };
  if (g.fuel > 0) {
    g.vx += ax * c.accel * dt;
    g.vy += ay * c.accel * dt;
    if (ax || ay) {
      g.fuel -= 2 * dt;
      if (ax) addParticle(g, g.x - ax * 35, g.y + rand(-5, 5), -ax * rand(50, 85), rand(-8, 8), .3, '#8ee7f7', 2.5);
      if (ay) addParticle(g, g.x + rand(-8, 8), g.y - ay * 22, rand(-8, 8), -ay * rand(45, 75), .3, '#8ee7f7', 2.5);
    }
    if (input.brake) {
      const brake = Math.pow(.88, dt * 60);
      g.vx *= brake;
      g.vy *= brake;
      g.fuel -= 1.5 * dt;
    }
  }
  g.fuel = Math.max(0, g.fuel - .18 * dt);
  const damping = Math.pow(c.damping, dt * 60);
  g.vx *= damping;
  g.vy *= damping;
  const speed = Math.hypot(g.vx, g.vy);
  if (speed > 130) { g.vx *= 130 / speed; g.vy *= 130 / speed; }
  g.x += g.vx * dt;
  g.y += g.vy * dt;
  if (g.y < 65 || g.y > 535) { g.y = clamp(g.y, 65, 535); g.vy *= -.3; }
  if (g.x < 65) { g.x = 65; g.vx = Math.max(0, g.vx); }
  if (g.fuel <= 0) return { type: 'fail', reason: 'fuel' };
  if (g.x + 43 >= g.target.x - 12) {
    const alignment = Math.abs(g.y - g.target.y);
    const closing = Math.hypot(g.vx, g.vy);
    if (alignment <= c.align && closing <= c.maxSpeed && g.vx >= -5) {
      g.metrics = { alignment, closing, fuel: g.fuel, bumps: g.bumps };
      return { type: 'success', reason: 'docked' };
    }
    g.bumps++;
    g.shake = 9;
    g.x = 565;
    g.vx = -28;
    g.vy *= .35;
    g.fuel = Math.max(0, g.fuel - 7);
    if (g.bumps >= c.bumps) return { type: 'fail', reason: 'bumps' };
    notify(g, alignment > c.align ? 'Hard bump. Line up with the center of the ring before touching it.' : 'Hard bump. Brake earlier and close the last few meters slowly.', true, 5);
    return { type: 'bump', message: g.notice };
  }
  return null;
}

function updateSystems(g, dt) {
  for (const system of g.systems) {
    if (system.status === 'checking' && g.elapsed >= system.checkEnds) {
      system.status = 'ready';
      g.readyCount++;
      const next = g.systems.find(s => s.status === 'pending');
      if (next) g.selected = next.id;
      notify(g, g.readyCount === 6 ? 'All systems green. You are go for launch.' : `${system.name} is nominal. ${6 - g.readyCount} checks to go.`);
      return { type: 'system-ready', system: system.id, message: g.notice };
    }
  }
  if (g.launching) {
    g.launchTime += dt;
    if (g.launchTime > 3) {
      const lift = Math.pow(g.launchTime - 3, 2) * 55;
      addParticle(g, 480 + rand(-22, 22), 492 - lift + rand(0, 12), rand(-45, 45), rand(35, 95), rand(.5, 1.1), g.launchTime < 3.8 ? '#ffd17c' : '#aab4cf', rand(4, 9));
    }
    if (g.launchTime >= 6.2) {
      g.metrics = { mistakes: g.mistakes, ready: g.readyCount };
      return { type: 'success', reason: 'liftoff' };
    }
  }
  return null;
}

export function updateGame(g, dt, input = {}) {
  if (g.finished) return null;
  g.elapsed += dt;
  g.shake *= Math.pow(.025, dt);
  updateParticles(g, dt);
  let event = null;
  if (g.id === 'lunar') event = updateLunar(g, dt, input);
  else if (g.id === 'docking') event = updateDocking(g, dt, input);
  else if (g.id === 'systems') event = updateSystems(g, dt);
  if (!event && g.elapsed >= g.timeLimit && !g.launching) event = { type: 'fail', reason: 'timeout' };
  if (event && (event.type === 'success' || event.type === 'fail')) g.finished = true;
  return event;
}

export function selectStar(g, index) {
  if (g.finished || g.id !== 'stars' || index < 0 || index > 6 || g.selected.includes(index)) return null;
  const expected = STAR_ROUTE[g.progress];
  if (index === expected) {
    g.selected.push(index);
    g.progress++;
    const star = STAR_POSITIONS[index];
    for (let i = 0; i < 12; i++) addParticle(g, star.x, star.y, rand(-55, 55), rand(-55, 55), rand(.35, .7), '#b6a0ff', rand(1.5, 3));
    if (g.progress === STAR_ROUTE.length) {
      g.finished = true;
      g.metrics = { mistakes: g.mistakes, stars: g.progress };
      return { type: 'success', reason: 'route-complete' };
    }
    notify(g, `${STAR_NAMES[index]} linked. Next: ${STAR_NAMES[STAR_ROUTE[g.progress]]}.`);
    return { type: 'correct', message: g.notice };
  }
  g.mistakes++;
  g.shake = 5;
  g.flashIndex = index;
  g.flashUntil = g.elapsed + .7;
  if (g.mistakes >= g.config.mistakes) {
    g.finished = true;
    return { type: 'fail', reason: 'course-errors' };
  }
  notify(g, `Not quite. Find ${STAR_NAMES[expected]} next. ${g.config.mistakes - g.mistakes} course errors left.`, true, 4);
  return { type: 'wrong', message: g.notice };
}

export function selectSystem(g, id) {
  if (g.id !== 'systems' || g.launching || g.finished) return false;
  const system = g.systems.find(s => s.id === id);
  if (!system) return false;
  g.selected = id;
  return true;
}

export function answerSystem(g, optionIndex) {
  if (g.id !== 'systems' || g.finished || g.launching) return null;
  const system = g.systems.find(s => s.id === g.selected);
  if (!system || system.status !== 'pending' || optionIndex < 0 || optionIndex >= system.options.length) return null;
  if (system.options[optionIndex] === system.correct) {
    system.status = 'checking';
    system.checkEnds = g.elapsed + .8;
    notify(g, `Running ${system.name.toLowerCase()} check…`);
    return { type: 'correct', message: g.notice };
  }
  g.mistakes++;
  g.shake = 6;
  if (g.mistakes >= g.config.mistakes) {
    g.finished = true;
    return { type: 'fail', reason: 'safety-checks' };
  }
  notify(g, `That fix is not safe for ${system.name.toLowerCase()}. Read the warning and try again.`, true, 4.5);
  return { type: 'wrong', message: g.notice };
}

export function startLaunch(g) {
  if (g.id !== 'systems' || g.finished || g.launching || g.readyCount !== 6) return false;
  g.launching = true;
  g.launchTime = 0;
  notify(g, 'T-minus 3. Stand by for liftoff.', false, 4);
  return true;
}

export function pointerGame(g, x, y) {
  if (g.finished) return null;
  if (g.id === 'stars') {
    let best = -1;
    let distance = 46;
    STAR_POSITIONS.forEach((star, i) => {
      const d = Math.hypot(star.x - x, star.y - y);
      if (d < distance) { distance = d; best = i; }
    });
    return best >= 0 ? selectStar(g, best) : null;
  }
  if (g.id === 'systems' && !g.launching) {
    const nodes = systemNodes();
    let best = null;
    let distance = 50;
    nodes.forEach(node => {
      const d = Math.hypot(node.x - x, node.y - y);
      if (d < distance) { distance = d; best = node.id; }
    });
    if (best) { selectSystem(g, best); return { type: 'select' }; }
  }
  return null;
}

export function gameHUD(g) {
  const left = Math.max(0, Math.ceil(g.timeLimit - g.elapsed));
  const time = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  if (g.id === 'lunar') {
    const altitude = Math.max(0, Math.round(surfaceY(g, g.x) - g.y - 30));
    const descent = Math.round(g.vy);
    return [
      { label: 'Altitude', value: `${altitude} m`, tone: altitude < 70 ? 'warn' : '' },
      { label: 'Descent speed', value: `${descent} m/s`, tone: descent > g.config.maxV ? (descent > g.config.maxV * 1.6 ? 'danger' : 'warn') : 'good' },
      { label: 'Fuel remaining', value: `${Math.ceil(g.fuel)}%`, tone: g.fuel < 20 ? 'danger' : g.fuel < 40 ? 'warn' : '' }
    ];
  }
  if (g.id === 'docking') {
    const distance = Math.max(0, Math.round(g.target.x - 12 - g.x - 43));
    const alignment = Math.round(Math.abs(g.y - g.target.y));
    const speed = Math.round(Math.hypot(g.vx, g.vy));
    return [
      { label: 'Distance to port', value: `${distance} m`, tone: distance < 120 ? 'good' : '' },
      { label: 'Ring alignment', value: `${alignment} m`, tone: alignment <= g.config.align ? 'good' : 'warn' },
      { label: 'Closing speed', value: `${speed} m/s`, tone: speed <= g.config.maxSpeed ? 'good' : 'warn' }
    ];
  }
  if (g.id === 'stars') return [
    { label: 'Stars linked', value: `${g.progress} / 7`, tone: g.progress ? 'good' : '' },
    { label: 'Course errors', value: `${g.mistakes} / ${g.config.mistakes}`, tone: g.mistakes ? 'warn' : '' },
    { label: 'Time remaining', value: time, tone: left < 20 ? 'warn' : '' }
  ];
  return [
    { label: 'Systems ready', value: `${g.readyCount} / 6`, tone: g.readyCount === 6 ? 'good' : '' },
    { label: 'Safety checks left', value: `${g.config.mistakes - g.mistakes}`, tone: g.mistakes ? 'warn' : '' },
    { label: g.launching ? 'Launch count' : 'Time remaining', value: g.launching ? (g.launchTime < 3 ? `T−${Math.ceil(3 - g.launchTime)}` : 'LIFTOFF') : time, tone: g.launching ? 'good' : left < 20 ? 'warn' : '' }
  ];
}

export function gameObjectives(g) {
  if (g.id === 'lunar') {
    const onPad = g.x >= g.config.padX && g.x <= g.config.padX + g.config.padW;
    return [
      { text: 'Move over the illuminated landing pad', done: onPad },
      { text: `Slow your descent to ${g.config.maxV} m/s or less`, done: g.vy >= 0 && g.vy <= g.config.maxV },
      { text: `Keep sideways speed under ${g.config.maxH} m/s`, done: Math.abs(g.vx) <= g.config.maxH }
    ];
  }
  if (g.id === 'docking') {
    const distance = g.target.x - 12 - g.x - 43;
    return [
      { text: 'Close to within 120 m of the port', done: distance < 120 },
      { text: `Align within ${g.config.align} m of the ring center`, done: Math.abs(g.y - g.target.y) <= g.config.align },
      { text: `Keep closing speed under ${g.config.maxSpeed} m/s`, done: Math.hypot(g.vx, g.vy) <= g.config.maxSpeed }
    ];
  }
  if (g.id === 'stars') return [
    { text: 'Link the two shoulder stars', done: g.progress >= 2 },
    { text: 'Cross the three stars of Orion’s belt', done: g.progress >= 5 },
    { text: 'Finish at the two foot stars', done: g.progress >= 7 }
  ];
  return [
    { text: 'Repair all six launch systems', done: g.readyCount === 6 },
    { text: 'Keep at least one safety check', done: g.mistakes < g.config.mistakes },
    { text: 'Complete the launch countdown', done: g.launchTime >= 6.2 }
  ];
}

export function gameNotice(g) {
  if (g.notice && g.elapsed <= g.noticeUntil) return { text: g.notice, warn: g.noticeWarn };
  if (g.id === 'lunar') return { text: 'Tip: short thruster bursts give you finer control than one long burn.', warn: false };
  if (g.id === 'docking') return { text: 'Tip: use Space or the brake button to settle your craft before the final approach.', warn: false };
  if (g.id === 'stars') return { text: `Route: ${STAR_ROUTE.map(i => STAR_NAMES[i]).join(' → ')}`, warn: false };
  return { text: g.launching ? 'Hold tight. The countdown is running.' : 'Read each warning carefully. The safest fix is the one that removes the problem.', warn: false };
}

export function gameScore(g) {
  let score = 500;
  if (g.id === 'lunar') score = 1000 - g.vy * 9 - Math.abs(g.vx) * 4 + g.fuel * 2 - g.elapsed * 3;
  else if (g.id === 'docking') score = 1000 - g.bumps * 150 - Math.hypot(g.vx, g.vy) * 5 - Math.abs(g.y - g.target.y) * 3 + g.fuel * 2 - g.elapsed * 2;
  else if (g.id === 'stars') score = 1000 - g.mistakes * 140 - g.elapsed * 3;
  else score = 900 - g.mistakes * 120 - g.elapsed * 2 + g.readyCount * 20;
  return Math.round(clamp(score, 100, 1000));
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}

function drawSpace(ctx, t, earth = true) {
  const sky = ctx.createLinearGradient(0, 0, WORLD.w, WORLD.h);
  sky.addColorStop(0, '#0c1226');
  sky.addColorStop(.6, '#151d38');
  sky.addColorStop(1, '#242849');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);
  for (const s of backgroundStars) {
    ctx.globalAlpha = .3 + .4 * (Math.sin(t * .001 + s.phase) * .5 + .5);
    ctx.fillStyle = '#dce7ff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (earth) {
    const glow = ctx.createRadialGradient(810, 92, 30, 810, 92, 90);
    glow.addColorStop(0, 'rgba(101,217,232,.2)');
    glow.addColorStop(1, 'rgba(101,217,232,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(810, 92, 90, 0, Math.PI * 2); ctx.fill();
    const planet = ctx.createRadialGradient(795, 76, 5, 810, 92, 45);
    planet.addColorStop(0, '#9ceaf1'); planet.addColorStop(.45, '#4ca9df'); planet.addColorStop(1, '#24477e');
    ctx.fillStyle = planet;
    ctx.beginPath(); ctx.arc(810, 92, 43, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.arc(810, 92, 43, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = 'rgba(157,219,197,.8)';
    ctx.beginPath(); ctx.moveTo(780, 65); ctx.lineTo(800, 58); ctx.lineTo(812, 72); ctx.lineTo(801, 88); ctx.lineTo(806, 104); ctx.lineTo(790, 110); ctx.lineTo(781, 91); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(827, 61); ctx.lineTo(848, 74); ctx.lineTo(843, 95); ctx.lineTo(827, 91); ctx.lineTo(820, 76); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(235,251,255,.4)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(772, 83); ctx.quadraticCurveTo(805, 70, 838, 80); ctx.moveTo(784, 116); ctx.quadraticCurveTo(815, 125, 846, 111); ctx.stroke();
    ctx.restore();
  }
}

function drawParticles(ctx, g) {
  for (const p of g.particles) {
    ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1) * .75;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawLander(ctx, x, y, angle, thrust, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  if (thrust) {
    const flame = ctx.createLinearGradient(0, 24, 0, 72);
    flame.addColorStop(0, '#e5fcff'); flame.addColorStop(.3, '#74dcf5'); flame.addColorStop(1, 'rgba(116,220,245,0)');
    ctx.fillStyle = flame;
    const length = 43 + Math.sin(t * .04) * 7;
    ctx.beginPath(); ctx.moveTo(-10, 24); ctx.lineTo(0, 24 + length); ctx.lineTo(10, 24); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = '#d9a45c'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-17, 10); ctx.lineTo(-30, 30); ctx.moveTo(17, 10); ctx.lineTo(30, 30); ctx.moveTo(-8, 14); ctx.lineTo(-12, 30); ctx.moveTo(8, 14); ctx.lineTo(12, 30); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-36, 31); ctx.lineTo(-24, 31); ctx.moveTo(24, 31); ctx.lineTo(36, 31); ctx.moveTo(-17, 31); ctx.lineTo(-7, 31); ctx.moveTo(7, 31); ctx.lineTo(17, 31); ctx.stroke();
  const gold = ctx.createLinearGradient(-20, 0, 20, 25);
  gold.addColorStop(0, '#ffe0a0'); gold.addColorStop(.5, '#d9a45c'); gold.addColorStop(1, '#916442');
  ctx.fillStyle = gold;
  ctx.beginPath(); ctx.moveTo(-23, -2); ctx.lineTo(-13, -13); ctx.lineTo(13, -13); ctx.lineTo(23, -2); ctx.lineTo(17, 23); ctx.lineTo(-17, 23); ctx.closePath(); ctx.fill();
  const body = ctx.createLinearGradient(-15, -35, 15, 5);
  body.addColorStop(0, '#fff9ed'); body.addColorStop(1, '#a6b2cf');
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.moveTo(-16, -8); ctx.lineTo(-9, -34); ctx.lineTo(9, -34); ctx.lineTo(16, -8); ctx.lineTo(10, 3); ctx.lineTo(-10, 3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#203650';
  ctx.beginPath(); ctx.moveTo(-9, -27); ctx.lineTo(-4, -32); ctx.lineTo(4, -32); ctx.lineTo(9, -27); ctx.lineTo(6, -15); ctx.lineTo(-6, -15); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(142,215,232,.7)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-6, -26); ctx.lineTo(-3, -29); ctx.lineTo(2, -29); ctx.stroke();
  roundRect(ctx, -10, 8, 20, 8, 2, '#e7e8ed');
  ctx.fillStyle = '#f58254'; ctx.fillRect(-6, 10, 6, 4);
  ctx.fillStyle = '#65d9e8'; ctx.beginPath(); ctx.arc(5, 12, 2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c6cee0'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(0, -45); ctx.lineTo(7, -49); ctx.stroke();
  ctx.fillStyle = '#ff8b5e'; ctx.beginPath(); ctx.arc(8, -50, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawLunarScene(ctx, g, t) {
  drawSpace(ctx, t);
  ctx.fillStyle = '#59617f';
  ctx.beginPath(); ctx.moveTo(0, 430); ctx.quadraticCurveTo(150, 370, 310, 425); ctx.quadraticCurveTo(480, 470, 640, 410); ctx.quadraticCurveTo(800, 365, 960, 420); ctx.lineTo(960, 600); ctx.lineTo(0, 600); ctx.closePath(); ctx.fill();
  const ground = ctx.createLinearGradient(0, 420, 0, 600);
  ground.addColorStop(0, '#969ab9'); ground.addColorStop(.35, '#6d7495'); ground.addColorStop(1, '#3c4563');
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.moveTo(g.terrain[0][0], g.terrain[0][1]);
  for (const [x, y] of g.terrain.slice(1)) ctx.lineTo(x, y);
  ctx.lineTo(960, 600); ctx.lineTo(0, 600); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(40,48,73,.35)';
  [[120, 510, 38, 9], [350, 540, 50, 12], [520, 512, 25, 6], [880, 535, 44, 10]].forEach(([x, y, rx, ry]) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); });
  const pad = g.config;
  ctx.fillStyle = '#283e43'; ctx.fillRect(pad.padX, 466, pad.padW, 9);
  ctx.fillStyle = '#83dfb4'; ctx.fillRect(pad.padX, 466, pad.padW, 3);
  for (let x = pad.padX + 10; x < pad.padX + pad.padW; x += 28) {
    ctx.fillStyle = `rgba(213,255,233,${.55 + .4 * Math.sin(t * .004 + x)})`;
    ctx.beginPath(); ctx.arc(x, 463, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#c9f5df'; ctx.font = '600 12px "Segoe UI", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('LANDING ZONE', pad.padX + pad.padW / 2, 493);
  ctx.strokeStyle = 'rgba(131,223,180,.28)'; ctx.setLineDash([5, 7]); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(pad.padX + pad.padW / 2, 455); ctx.lineTo(pad.padX + pad.padW / 2, 110); ctx.stroke(); ctx.setLineDash([]);
  drawParticles(ctx, g);
  drawLander(ctx, g.x, g.y, clamp(g.vx * .006, -.22, .22), g.thrusting, t);
  const altitude = Math.max(0, surfaceY(g, g.x) - g.y - 30);
  if (altitude < 100) {
    ctx.globalAlpha = (100 - altitude) / 100 * .3;
    ctx.fillStyle = '#c7c9de';
    ctx.beginPath(); ctx.ellipse(g.x, surfaceY(g, g.x) + 2, 35 + (100 - altitude) * .3, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawCapsule(ctx, x, y, jets, t) {
  ctx.save(); ctx.translate(x, y);
  if (jets.x || jets.y) {
    ctx.fillStyle = 'rgba(142,231,247,.65)';
    if (jets.x) { ctx.beginPath(); ctx.moveTo(-32, -8); ctx.lineTo(-52 - Math.sin(t * .05) * 6, 0); ctx.lineTo(-32, 8); ctx.closePath(); ctx.fill(); }
    if (jets.y) { ctx.beginPath(); ctx.moveTo(-8, -jets.y * 20); ctx.lineTo(0, -jets.y * 39); ctx.lineTo(8, -jets.y * 20); ctx.closePath(); ctx.fill(); }
  }
  ctx.fillStyle = '#8fa4c4';
  ctx.beginPath(); ctx.moveTo(-18, -16); ctx.lineTo(-29, -30); ctx.lineTo(-12, -30); ctx.lineTo(-2, -16); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-18, 16); ctx.lineTo(-29, 30); ctx.lineTo(-12, 30); ctx.lineTo(-2, 16); ctx.closePath(); ctx.fill();
  const body = ctx.createLinearGradient(0, -20, 0, 20);
  body.addColorStop(0, '#f4f1e9'); body.addColorStop(1, '#9eafcb');
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.moveTo(-30, -18); ctx.lineTo(7, -18); ctx.lineTo(30, 0); ctx.lineTo(7, 18); ctx.lineTo(-30, 18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff8b5e'; ctx.fillRect(-30, -18, 11, 36);
  ctx.fillStyle = '#244461';
  ctx.beginPath(); ctx.moveTo(5, -13); ctx.lineTo(22, 0); ctx.lineTo(5, 13); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#65d9e8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(43, 0); ctx.stroke();
  ctx.fillStyle = '#65d9e8'; ctx.beginPath(); ctx.arc(-8, 0, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawDockingScene(ctx, g, t) {
  drawSpace(ctx, t, false);
  const earth = ctx.createRadialGradient(120, 650, 100, 120, 650, 330);
  earth.addColorStop(0, '#3f8fc4'); earth.addColorStop(.7, '#285d96'); earth.addColorStop(1, '#17345c');
  ctx.fillStyle = earth; ctx.beginPath(); ctx.arc(120, 690, 300, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(156,234,241,.25)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(120, 690, 304, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
  const tx = g.target.x; const ty = g.target.y;
  ctx.save(); ctx.translate(800, ty);
  ctx.fillStyle = '#315b91'; ctx.strokeStyle = '#6d9dd1'; ctx.lineWidth = 1.5;
  ctx.fillRect(-42, -145, 84, 66); ctx.strokeRect(-42, -145, 84, 66);
  ctx.fillRect(-42, 79, 84, 66); ctx.strokeRect(-42, 79, 84, 66);
  ctx.strokeStyle = 'rgba(120,165,255,.5)';
  for (let x = -28; x <= 28; x += 14) { ctx.beginPath(); ctx.moveTo(x, -145); ctx.lineTo(x, -79); ctx.moveTo(x, 79); ctx.lineTo(x, 145); ctx.stroke(); }
  ctx.fillStyle = '#536c99'; ctx.fillRect(-9, -100, 18, 200);
  const module = ctx.createLinearGradient(-40, -40, 40, 40);
  module.addColorStop(0, '#e2e6ed'); module.addColorStop(1, '#8fa4c4');
  roundRect(ctx, -42, -43, 91, 86, 15, module);
  roundRect(ctx, 48, -29, 52, 58, 9, '#a8b8d0');
  ctx.fillStyle = '#536c99'; ctx.fillRect(-16, -27, 38, 9); ctx.fillRect(-16, -10, 38, 9);
  ctx.fillStyle = '#ff8b5e'; ctx.beginPath(); ctx.arc(8, 22, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  const aligned = Math.abs(g.y - ty) <= g.config.align;
  const slow = Math.hypot(g.vx, g.vy) <= g.config.maxSpeed;
  const ringColor = aligned && slow ? '#83dfb4' : '#65d9e8';
  ctx.strokeStyle = ringColor; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(tx - 12, ty, 28, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#101b30'; ctx.beginPath(); ctx.arc(tx - 12, ty, 18, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `${ringColor}55`; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(tx - 12, ty, 38 + Math.sin(t * .004) * 3, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = aligned ? 'rgba(131,223,180,.45)' : 'rgba(101,217,232,.28)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 8]);
  ctx.beginPath(); ctx.moveTo(g.x + 48, g.y); ctx.lineTo(tx - 48, ty); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#aab4cf'; ctx.font = '600 12px "Segoe UI", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('DOCKING PORT', tx - 12, ty + 62);
  ctx.fillStyle = '#ffd17c';
  for (let i = 0; i < g.config.bumps; i++) { ctx.globalAlpha = i < g.config.bumps - g.bumps ? 1 : .2; ctx.beginPath(); ctx.arc(36 + i * 22, 34, 6, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 1;
  drawParticles(ctx, g);
  drawCapsule(ctx, g.x, g.y, g.jets, t);
}

function drawStarsScene(ctx, g, t) {
  drawSpace(ctx, t, false);
  const nebula = ctx.createRadialGradient(470, 300, 30, 470, 300, 330);
  nebula.addColorStop(0, 'rgba(138,105,211,.2)'); nebula.addColorStop(.6, 'rgba(83,88,174,.09)'); nebula.addColorStop(1, 'rgba(83,88,174,0)');
  ctx.fillStyle = nebula; ctx.fillRect(0, 0, WORLD.w, WORLD.h);
  ctx.strokeStyle = 'rgba(124,137,184,.1)'; ctx.lineWidth = 1;
  for (let x = 0; x <= WORLD.w; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.h); ctx.stroke(); }
  for (let y = 0; y <= WORLD.h; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD.w, y); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(182,160,255,.16)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(330, 145); ctx.lineTo(345, 470); ctx.moveTo(600, 165); ctx.lineTo(635, 455); ctx.stroke();
  if (g.selected.length > 1) {
    ctx.strokeStyle = '#b6a0ff'; ctx.lineWidth = 2.5; ctx.shadowColor = '#b6a0ff'; ctx.shadowBlur = 8;
    ctx.beginPath();
    g.selected.forEach((index, i) => { const s = STAR_POSITIONS[index]; if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y); });
    ctx.stroke(); ctx.shadowBlur = 0;
  }
  const next = STAR_ROUTE[g.progress];
  STAR_POSITIONS.forEach((star, i) => {
    const linked = g.selected.includes(i);
    const isNext = g.config.hint && i === next && !g.finished;
    const wrong = g.flashIndex === i && g.elapsed < g.flashUntil;
    const pulse = Math.sin(t * .004 + i) * .5 + .5;
    const glow = ctx.createRadialGradient(star.x, star.y, 1, star.x, star.y, isNext ? 38 : 25);
    glow.addColorStop(0, wrong ? 'rgba(255,120,140,.5)' : linked ? 'rgba(131,223,180,.4)' : `${star.color}66`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(star.x, star.y, isNext ? 38 : 25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = wrong ? '#ff788c' : linked ? '#83dfb4' : star.color;
    ctx.beginPath(); ctx.arc(star.x, star.y, linked ? 7 : 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = wrong ? '#ff788c' : linked ? 'rgba(131,223,180,.6)' : isNext ? `rgba(255,209,124,${.45 + pulse * .45})` : 'rgba(220,231,255,.22)';
    ctx.lineWidth = isNext ? 2 : 1;
    ctx.beginPath(); ctx.arc(star.x, star.y, isNext ? 19 + pulse * 5 : 14, 0, Math.PI * 2); ctx.stroke();
    if (isNext) {
      ctx.strokeStyle = 'rgba(255,209,124,.7)';
      ctx.beginPath(); ctx.moveTo(star.x - 28, star.y); ctx.lineTo(star.x - 21, star.y); ctx.moveTo(star.x + 21, star.y); ctx.lineTo(star.x + 28, star.y); ctx.moveTo(star.x, star.y - 28); ctx.lineTo(star.x, star.y - 21); ctx.moveTo(star.x, star.y + 21); ctx.lineTo(star.x, star.y + 28); ctx.stroke();
    }
    ctx.fillStyle = linked ? '#b9efd4' : '#c9d2e7';
    ctx.font = `${isNext ? '700' : '500'} 15px "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(STAR_NAMES[i], star.x, star.y + 36);
  });
  ctx.fillStyle = '#737f9c'; ctx.font = '600 12px "Segoe UI", sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('ORION · ACADEMY FLIGHT PATH', 28, 36);
  ctx.textAlign = 'right'; ctx.fillText(`${g.progress} / 7 LINKED`, 932, 36);
  drawParticles(ctx, g);
}

function systemNodes() {
  return [
    { id: 'oxygen', x: 240, y: 170 }, { id: 'power', x: 240, y: 300 }, { id: 'comms', x: 240, y: 430 },
    { id: 'guidance', x: 720, y: 170 }, { id: 'fuel', x: 720, y: 300 }, { id: 'cabin', x: 720, y: 430 }
  ];
}

function drawRocket(ctx, x, y, flame, t) {
  ctx.save(); ctx.translate(x, y);
  if (flame > 0) {
    const fire = ctx.createLinearGradient(0, 45, 0, 45 + flame);
    fire.addColorStop(0, '#fff3cf'); fire.addColorStop(.3, '#ffd17c'); fire.addColorStop(1, 'rgba(255,139,94,0)');
    ctx.fillStyle = fire;
    ctx.beginPath(); ctx.moveTo(-14, 43); ctx.lineTo(0, 45 + flame + Math.sin(t * .06) * 8); ctx.lineTo(14, 43); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#ff8b5e';
  ctx.beginPath(); ctx.moveTo(-21, 10); ctx.lineTo(-42, 48); ctx.lineTo(-21, 39); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(21, 10); ctx.lineTo(42, 48); ctx.lineTo(21, 39); ctx.closePath(); ctx.fill();
  const body = ctx.createLinearGradient(-24, 0, 24, 0);
  body.addColorStop(0, '#f4f1e9'); body.addColorStop(.55, '#dfe4ec'); body.addColorStop(1, '#9eafcb');
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.moveTo(0, -95); ctx.quadraticCurveTo(24, -67, 24, -12); ctx.lineTo(24, 43); ctx.lineTo(-24, 43); ctx.lineTo(-24, -12); ctx.quadraticCurveTo(-24, -67, 0, -95); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff8b5e';
  ctx.beginPath(); ctx.moveTo(0, -95); ctx.quadraticCurveTo(15, -78, 20, -57); ctx.lineTo(-20, -57); ctx.quadraticCurveTo(-15, -78, 0, -95); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#244461'; ctx.beginPath(); ctx.arc(0, -27, 13, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#9eafcb'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = 'rgba(101,217,232,.7)'; ctx.beginPath(); ctx.arc(0, -27, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#536c99'; ctx.fillRect(-9, 3, 18, 13);
  ctx.strokeStyle = '#8b9bb7'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-24, 27); ctx.lineTo(24, 27); ctx.stroke();
  ctx.restore();
}

function drawSystemsScene(ctx, g, t) {
  drawSpace(ctx, t, false);
  ctx.fillStyle = '#2c3652'; ctx.fillRect(0, 505, 960, 95);
  ctx.fillStyle = '#3c4966'; ctx.fillRect(390, 492, 180, 15);
  ctx.strokeStyle = '#53617f'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(560, 505); ctx.lineTo(560, 330); ctx.lineTo(530, 330); ctx.moveTo(560, 380); ctx.lineTo(525, 380); ctx.moveTo(560, 435); ctx.lineTo(525, 435); ctx.stroke();
  const lift = g.launching && g.launchTime > 3 ? Math.pow(g.launchTime - 3, 2) * 55 : 0;
  const flame = g.launching && g.launchTime > 2.6 ? 45 + (g.launchTime - 2.6) * 22 : 0;
  drawParticles(ctx, g);
  drawRocket(ctx, 480, 447 - lift, flame, t);
  const nodes = systemNodes();
  nodes.forEach(node => {
    const system = g.systems.find(s => s.id === node.id);
    const color = system.status === 'ready' ? '#83dfb4' : system.status === 'checking' ? '#ffd17c' : g.selected === node.id ? '#65d9e8' : '#737f9c';
    ctx.strokeStyle = `${color}55`; ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(node.x + (node.x < 480 ? 28 : -28), node.y); ctx.lineTo(node.x < 480 ? 430 : 530, node.y); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#19223a'; ctx.beginPath(); ctx.arc(node.x, node.y, 25, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = g.selected === node.id ? 3 : 1.5; ctx.stroke();
    ctx.fillStyle = color;
    if (system.status === 'ready') {
      ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(node.x - 9, node.y); ctx.lineTo(node.x - 2, node.y + 7); ctx.lineTo(node.x + 10, node.y - 8); ctx.stroke();
    } else if (system.status === 'checking') {
      ctx.beginPath(); ctx.arc(node.x, node.y, 12, t * .006, t * .006 + Math.PI * 1.4); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
    } else {
      ctx.font = '700 18px "Segoe UI", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', node.x, node.y + 6);
    }
    ctx.fillStyle = '#c9d2e7'; ctx.font = '600 14px "Segoe UI", sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(system.name.toUpperCase(), node.x, node.y + 48);
    ctx.fillStyle = color; ctx.font = '500 11px "Segoe UI", sans-serif';
    ctx.fillText(system.status === 'ready' ? 'NOMINAL' : system.status === 'checking' ? 'CHECKING' : 'NEEDS CHECK', node.x, node.y + 65);
  });
  if (g.launching && g.launchTime < 3.2) {
    ctx.fillStyle = 'rgba(12,18,38,.55)'; ctx.fillRect(0, 0, 960, 600);
    ctx.fillStyle = '#ffd17c'; ctx.font = '800 110px "Segoe UI", sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(g.launchTime < 3 ? String(Math.ceil(3 - g.launchTime)) : 'GO', 480, 285);
    ctx.fillStyle = '#c9d2e7'; ctx.font = '600 16px "Segoe UI", sans-serif';
    ctx.fillText('LAUNCH SEQUENCE', 480, 330);
  }
}

export function drawGame(ctx, g, t = 0) {
  ctx.save();
  if (g.shake > .3) ctx.translate(rand(-g.shake, g.shake), rand(-g.shake, g.shake));
  if (g.id === 'lunar') drawLunarScene(ctx, g, t);
  else if (g.id === 'docking') drawDockingScene(ctx, g, t);
  else if (g.id === 'stars') drawStarsScene(ctx, g, t);
  else drawSystemsScene(ctx, g, t);
  ctx.restore();
}