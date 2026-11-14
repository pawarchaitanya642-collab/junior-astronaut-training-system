export const MISSIONS = [
  {
    id: 'lunar', number: '01', title: 'Lunar landing', category: 'Flight skills', filter: 'flight', icon: 'moon', color: 'orange', level: 1, xp: 150, time: '2–3 min',
    description: 'Guide your lander to a soft touchdown on the Moon.',
    brief: 'The Sea of Tranquility is waiting. Steer over the illuminated landing pad, then use your thruster to slow down and touch down gently.',
    skills: ['Thrust control', 'Precision landing'],
    readyTitle: 'One small step starts here.',
    readyText: 'Use the left and right jets to steer. Hold the main thruster to slow your fall. Land on the green pad before your fuel runs out.',
    controls: [['Steer left / right', '← → or A D'], ['Main thruster', '↑ or W'], ['Pause', 'P or Esc']],
    successTitle: 'The Moon is yours, cadet.',
    successText: 'A gentle touchdown on the Sea of Tranquility. Mission Control is cheering for you.'
  },
  {
    id: 'docking', number: '02', title: 'Orbital docking', category: 'Flight skills', filter: 'flight', icon: 'dock', color: 'cyan', level: 2, xp: 125, time: '2–3 min',
    description: 'Line up, slow down, and connect with the space station.',
    brief: 'The station is drifting in low Earth orbit. Match its height, close the distance slowly, and guide your nose probe into the glowing docking ring.',
    skills: ['Relative motion', 'Gentle approach'],
    readyTitle: 'A gentle hello in orbit.',
    readyText: 'Use the directional jets to line up with the moving ring. Approach from the left and keep your closing speed low. Three hard bumps end the run.',
    controls: [['Directional jets', 'Arrows or WASD'], ['Stabilize / brake', 'Space'], ['Pause', 'P or Esc']],
    successTitle: 'Welcome aboard the station.',
    successText: 'Capture confirmed. Your steady approach made a perfect connection in low Earth orbit.'
  },
  {
    id: 'stars', number: '03', title: 'Star navigator', category: 'Space science', filter: 'science', icon: 'compass', color: 'lilac', level: 1, xp: 100, time: '1–2 min',
    description: 'Trace a flight path through the stars of Orion.',
    brief: 'Long before GPS, explorers navigated by the stars. Follow the academy flight path across Orion by selecting its seven bright stars in the correct order.',
    skills: ['Constellations', 'Celestial navigation'],
    readyTitle: 'Let the stars be your map.',
    readyText: 'Select the stars in the route shown in your briefing. You can tap the star map or use the named buttons. Watch your course errors.',
    controls: [['Select a star', 'Tap map or buttons'], ['Quick select', 'Keys 1–7'], ['Pause', 'P or Esc']],
    successTitle: 'You found your way home.',
    successText: 'Seven stars, one steady course. You have traced the academy flight path through Orion.'
  },
  {
    id: 'systems', number: '04', title: 'Launch director', category: 'Space science', filter: 'science', icon: 'gauge', color: 'yellow', level: 2, xp: 100, time: '2–3 min',
    description: 'Solve six pre-flight checks and clear your rocket for launch.',
    brief: 'A safe launch begins long before liftoff. Inspect each system, choose the correct fix, and wait for every light to turn green before starting the countdown.',
    skills: ['Systems thinking', 'Launch safety'],
    readyTitle: 'Great launches start on the ground.',
    readyText: 'Select a system, read its warning, and choose the safe fix. Repair all six systems, then press Launch. Wrong fixes use up your safety checks.',
    controls: [['Inspect a system', 'Tap a system chip'], ['Choose a fix', 'Tap an answer'], ['Pause', 'P or Esc']],
    successTitle: 'Liftoff! You made it happen.',
    successText: 'All six systems nominal. Your careful checks cleared the way for a safe launch.'
  }
];

export const ACHIEVEMENTS = [
  { id: 'welcome', title: 'Welcome aboard', description: 'Join the academy and take your first step toward the stars.', icon: 'helmet', color: 'orange' },
  { id: 'first', title: 'First giant leap', description: 'Complete your first training mission.', icon: 'flag', color: 'green' },
  { id: 'lunar', title: 'Moonwalker', description: 'Land safely on the Sea of Tranquility.', icon: 'moon', color: 'yellow', mission: 'lunar' },
  { id: 'docking', title: 'Steady hands', description: 'Dock gently with the orbiting space station.', icon: 'dock', color: 'cyan', mission: 'docking' },
  { id: 'stars', title: 'Stargazer', description: 'Navigate the seven-star Orion flight path.', icon: 'star', color: 'lilac', mission: 'stars' },
  { id: 'systems', title: 'Go for launch', description: 'Clear every pre-flight check and launch your rocket.', icon: 'rocket', color: 'orange', mission: 'systems' },
  { id: 'all', title: 'Academy explorer', description: 'Complete all four training missions.', icon: 'trophy', color: 'green' }
];

export const FACTS = [
  { title: 'Same you. Lighter landing.', text: 'On the Moon, you would weigh just one-sixth of what you do on Earth. Your mass stays the same, but the Moon pulls on you less.' },
  { title: 'Space is surprisingly quiet.', text: 'Sound needs something to travel through, like air or water. Space is nearly empty, so astronauts talk to each other by radio.' },
  { title: 'A day longer than a year.', text: 'Venus spins so slowly that one full turn takes longer than one trip around the Sun. A Venus day is longer than its year.' },
  { title: 'Sunsets can be blue.', text: 'Fine dust in the Martian atmosphere scatters red light across the sky. Near the setting Sun, the glow can look blue instead.' },
  { title: 'The station never stops falling.', text: 'The International Space Station is falling around Earth. It moves sideways so fast that the ground curves away beneath it.' },
  { title: 'Your footprints can last.', text: 'The Moon has almost no atmosphere, so there is no wind or rain to erase an astronaut’s footprints. They can remain for a very long time.' }
];

export const STAR_NAMES = ['Betelgeuse', 'Bellatrix', 'Mintaka', 'Alnilam', 'Alnitak', 'Saiph', 'Rigel'];
export const STAR_ROUTE = [0, 1, 2, 3, 4, 5, 6];
export const STAR_POSITIONS = [
  { x: 330, y: 145, color: '#ffc18a' },
  { x: 600, y: 165, color: '#b8d8ff' },
  { x: 405, y: 285, color: '#d6e7ff' },
  { x: 465, y: 305, color: '#d6e7ff' },
  { x: 525, y: 325, color: '#d6e7ff' },
  { x: 345, y: 470, color: '#b8d8ff' },
  { x: 635, y: 455, color: '#b8d8ff' }
];

export const SYSTEMS = [
  { id: 'oxygen', name: 'Oxygen', icon: 'wind', problem: 'Supply valve is closed', correct: 'Open the supply valve', options: ['Close the cabin vent', 'Turn off the pump'] },
  { id: 'power', name: 'Power', icon: 'battery', problem: 'Battery is at 18%', correct: 'Charge the battery', options: ['Drain the reserve', 'Dim the warning light'] },
  { id: 'comms', name: 'Comms', icon: 'radio', problem: 'Antenna is misaligned', correct: 'Align the antenna', options: ['Disconnect the radio', 'Lower the signal gain'] },
  { id: 'guidance', name: 'Guidance', icon: 'compass', problem: 'Flight course is unlocked', correct: 'Lock the flight course', options: ['Reset the cabin clock', 'Ignore the heading'] },
  { id: 'fuel', name: 'Fuel', icon: 'fuel', problem: 'Tank is only 40% full', correct: 'Fill the tank to 100%', options: ['Open the fuel drain', 'Launch with less fuel'] },
  { id: 'cabin', name: 'Cabin', icon: 'shield', problem: 'Hatch seal is open', correct: 'Seal the hatch', options: ['Open the window', 'Remove the seal'] }
];

export const RANKS = [
  { name: 'Space Cadet', min: 0 },
  { name: 'Space Explorer', min: 300 },
  { name: 'Orbit Pilot', min: 700 },
  { name: 'Mission Commander', min: 1200 }
];

export function rankFor(xp) {
  let index = 0;
  RANKS.forEach((rank, i) => { if (xp >= rank.min) index = i; });
  return { ...RANKS[index], index, next: RANKS[index + 1] || null };
}

export function earnedAchievements(progress) {
  const done = Object.keys(progress.completed || {});
  return ACHIEVEMENTS.filter(a => {
    if (a.id === 'welcome') return true;
    if (a.id === 'first') return done.length > 0;
    if (a.id === 'all') return MISSIONS.every(m => done.includes(m.id));
    return done.includes(a.mission);
  }).map(a => a.id);
}