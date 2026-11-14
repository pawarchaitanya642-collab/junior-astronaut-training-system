const paths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  rocket: '<path d="M12 3c4 2 6 6 6 10l-3 3H9l-3-3c0-4 2-8 6-10Z"/><circle cx="12" cy="10" r="2"/><path d="m6 12-3 4v3l4-2m11-5 3 4v3l-4-2M9 19l3 3 3-3"/>',
  book: '<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="m8 14-2 8 6-3 6 3-2-8"/><path d="m10 9 1.5 1.5L15 7"/>',
  volume: '<path d="m11 4-6 5H2v6h3l6 5V4Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  volumeOff: '<path d="m11 4-6 5H2v6h3l6 5V4Z"/><path d="m16 9 6 6m0-6-6 6"/>',
  arrowRight: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  arrowUpRight: '<path d="M6 18 18 6M7 6h11v11"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  chevronDown: '<path d="m5 9 7 7 7-7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  flame: '<path d="M12 2c1 5 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 3 2 4 3 4 1-3 0-6 0-9Z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="m8 4 12 8-12 8V4Z"/>',
  restart: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
  left: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  up: '<path d="M12 20V4m-6 6 6-6 6 6"/>',
  down: '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  shield: '<path d="m12 3 8 3v6c0 5-4 8-8 10-4-2-8-5-8-10V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  helmet: '<path d="M5 14a8 8 0 1 1 14 0v4H5v-4Z"/><rect x="7" y="8" width="10" height="6" rx="3"/><path d="M8 18v3h8v-3M4 12H2v5h3m15-5h2v5h-3"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  edit: '<path d="m14 5 5 5M4 20l5-1L21 7l-5-5L4 14v6Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>',
  sparkle: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Zm7-1v4m-2-2h4"/>',
  moon: '<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/>',
  radio: '<circle cx="12" cy="12" r="2"/><path d="M7 7a7 7 0 0 0 0 10m10-10a7 7 0 0 1 0 10M4 4a11 11 0 0 0 0 16m16-16a11 11 0 0 1 0 16"/>',
  battery: '<rect x="3" y="7" width="16" height="10" rx="2"/><path d="M21 10v4M7 10v4m4-4v4m4-4v4"/>',
  wind: '<path d="M3 8h11a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 16h5a3 3 0 1 1-3 3"/>',
  fuel: '<path d="M4 21V4h9v17M2 21h13M4 10h9m2 3h2a2 2 0 0 1 2 2v3a2 2 0 0 0 4 0V9l-3-3m1 1-2 2 2 2"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  trophy: '<path d="M8 3h8v7a4 4 0 0 1-8 0V3Zm0 2H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 2v5m-4 2h8m-6-2h4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6 6-2Z"/>',
  dock: '<circle cx="12" cy="12" r="4"/><path d="M12 2v6m0 8v6M2 12h6m8 0h6M5 5l3 3m8 8 3 3M5 19l3-3m8-8 3-3"/>',
  gauge: '<path d="M4 18a9 9 0 1 1 16 0H4Z"/><path d="m12 14 4-5M7 14h.01M12 7h.01M17 14h.01"/>',
  heart: '<path d="M12 21 4 13a5 5 0 0 1 8-6 5 5 0 0 1 8 6l-8 8Z"/>',
  flag: '<path d="M5 22V3m0 1c5-4 9 4 15 0v10c-6 4-10-4-15 0"/>',
  orbit: '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-30 12 12)"/><circle cx="19" cy="6" r="1.5"/>'
};

export function icon(name, cls = '') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.star}</svg>`;
}

export function brandMark() {
  return '<svg class="brand-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="10" fill="#ff8b5e"/><ellipse cx="24" cy="24" rx="22" ry="8.5" transform="rotate(-32 24 24)" stroke="#f5f3ef" stroke-width="2.2"/><circle cx="39" cy="12" r="3" fill="#65d9e8"/></svg>';
}

let artSequence = 0;
const uid = () => `art${++artSequence}`;

export function heroArt() {
  const p = uid();
  return `<svg viewBox="0 0 820 540" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A young astronaut on the Moon beside a hovering lunar lander, with Earth rising overhead">
    <defs>
      <linearGradient id="${p}-sky" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#242847"/><stop offset="1" stop-color="#3a3d64"/></linearGradient>
      <radialGradient id="${p}-earth" cx=".32" cy=".28" r=".8"><stop stop-color="#9ceaf1"/><stop offset=".35" stop-color="#4ca9df"/><stop offset=".75" stop-color="#3270b8"/><stop offset="1" stop-color="#1d356a"/></radialGradient>
      <linearGradient id="${p}-moon" x1="0" y1="0" x2=".3" y2="1"><stop stop-color="#a3a5c4"/><stop offset=".35" stop-color="#777c9f"/><stop offset="1" stop-color="#3b425f"/></linearGradient>
      <linearGradient id="${p}-suit" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="#fff9ed"/><stop offset=".5" stop-color="#e7e8ed"/><stop offset="1" stop-color="#a6b2cf"/></linearGradient>
      <linearGradient id="${p}-visor" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#426583"/><stop offset=".4" stop-color="#182b47"/><stop offset="1" stop-color="#0e172c"/></linearGradient>
      <linearGradient id="${p}-orange" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffb078"/><stop offset=".5" stop-color="#f58254"/><stop offset="1" stop-color="#c6533e"/></linearGradient>
      <linearGradient id="${p}-gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffe0a0"/><stop offset=".4" stop-color="#d9a45c"/><stop offset="1" stop-color="#916442"/></linearGradient>
      <linearGradient id="${p}-flame" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d5fbff"/><stop offset=".35" stop-color="#74dcf5" stop-opacity=".8"/><stop offset="1" stop-color="#74dcf5" stop-opacity="0"/></linearGradient>
      <radialGradient id="${p}-glow"><stop stop-color="#7eddf5" stop-opacity=".28"/><stop offset="1" stop-color="#7eddf5" stop-opacity="0"/></radialGradient>
      <filter id="${p}-soft"><feGaussianBlur stdDeviation="5"/></filter>
      <filter id="${p}-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="9" stdDeviation="8" flood-color="#171c35" flood-opacity=".38"/></filter>
      <clipPath id="${p}-earthclip"><circle cx="555" cy="104" r="55"/></clipPath>
    </defs>
    <rect width="820" height="540" fill="url(#${p}-sky)"/>
    <g fill="#dce7ff">
      <circle cx="92" cy="75" r="1.2" opacity=".5"/><circle cx="180" cy="142" r="1" opacity=".6"/><circle cx="266" cy="55" r="1.4" opacity=".7"/><circle cx="337" cy="112" r="1" opacity=".5"/><circle cx="405" cy="42" r="1.5" opacity=".8"/><circle cx="466" cy="177" r="1.2" opacity=".5"/><circle cx="632" cy="48" r="1.1" opacity=".7"/><circle cx="730" cy="91" r="1.5" opacity=".8"/><circle cx="781" cy="181" r="1" opacity=".5"/><circle cx="693" cy="207" r="1.2" opacity=".6"/><circle cx="371" cy="231" r="1" opacity=".5"/><circle cx="610" cy="226" r="1.3" opacity=".7"/><circle cx="762" cy="285" r="1" opacity=".5"/>
      <path class="twinkle" d="M319 178v8m-4-4h8" stroke="#c9e7ff" stroke-width="1.2"/><path class="twinkle" d="M707 145v7m-3.5-3.5h7" stroke="#c9e7ff" stroke-width="1.1"/>
    </g>
    <ellipse cx="555" cy="106" rx="91" ry="88" fill="url(#${p}-glow)"/>
    <circle cx="555" cy="104" r="58" fill="none" stroke="#8adff2" stroke-opacity=".24" stroke-width="3"/>
    <circle cx="555" cy="104" r="55" fill="url(#${p}-earth)"/>
    <g clip-path="url(#${p}-earthclip)" fill="#9dd9c5" opacity=".85">
      <path d="m510 64 24-9 18 8 4 13-12 9 3 12-13 8-4 17-13-4-5-17-14-8Z"/>
      <path d="m548 111 17 4 9 15-5 19-12 17-8-9 2-19-9-13Z"/>
      <path d="m583 58 25 8 14 23-13 12-15-4-8 12-12-7 5-17-9-9Z"/>
      <path d="m596 126 16 3 5 13-12 8-13-8Z"/>
    </g>
    <g clip-path="url(#${p}-earthclip)" fill="none" stroke="#e7fbff" stroke-linecap="round" opacity=".48">
      <path d="M501 87q38-18 78-8m-62 42q42 13 85-4m-68-49q28-8 54 0" stroke-width="5"/>
      <path d="M514 139q27 9 47 5m20-80 20 8" stroke-width="3"/>
    </g>
    <ellipse cx="555" cy="106" rx="103" ry="29" transform="rotate(-24 555 106)" fill="none" stroke="#a6bce7" stroke-opacity=".2" stroke-dasharray="3 7"/>
    <path d="M0 405q115-64 235-20t231-9q145-57 354-12v176H0Z" fill="#626987"/>
    <path d="M0 438q139-70 286-19t260-12q137-42 274-9v142H0Z" fill="url(#${p}-moon)"/>
    <path d="M0 489q184-47 350-8t470-15v74H0Z" fill="#4b5372" opacity=".65"/>
    <g fill="#414965" opacity=".45">
      <ellipse cx="244" cy="446" rx="42" ry="10"/><ellipse cx="612" cy="470" rx="62" ry="15"/><ellipse cx="747" cy="413" rx="27" ry="7"/><ellipse cx="398" cy="493" rx="24" ry="7"/><ellipse cx="94" cy="479" rx="31" ry="8"/>
    </g>
    <g fill="none" stroke="#bec0d6" stroke-opacity=".3" stroke-width="2">
      <path d="M205 445q37-13 77 0m270 24q55-19 116 0m58-57q23-8 45 0"/>
    </g>
    <g fill="#8d92af"><path d="m322 425 9-9 12 3 4 8Z"/><path d="m701 453 8-10 13 4 3 8Z"/><path d="m552 493 6-7 9 3 2 6Z"/></g>
    <ellipse cx="482" cy="442" rx="74" ry="15" fill="#252c48" opacity=".38" filter="url(#${p}-soft)"/>
    <g filter="url(#${p}-shadow)">
      <path d="M352 351v91" stroke="#c9cbd8" stroke-width="3"/>
      <path d="M353 352c20-9 34 9 56 0v32c-22 9-36-9-56 0Z" fill="url(#${p}-orange)"/>
      <circle cx="375" cy="368" r="6" fill="none" stroke="#ffe4cf" stroke-width="1.5"/><ellipse cx="375" cy="368" rx="11" ry="3.5" transform="rotate(-25 375 368)" fill="none" stroke="#ffe4cf" stroke-width="1.2"/>
    </g>
    <g class="float-fast" filter="url(#${p}-shadow)">
      <ellipse cx="674" cy="337" rx="53" ry="35" fill="url(#${p}-glow)"/>
      <path d="m657 293 17 57 17-57Z" fill="url(#${p}-flame)"/>
      <path d="m642 273-24 49m88-49 25 49m-65-43-8 45m32-45 9 45" stroke="url(#${p}-gold)" stroke-width="4" stroke-linecap="round"/>
      <path d="M607 324h23m90 0h23m-94 2h18m22 0h18" stroke="#d7c2a1" stroke-width="5" stroke-linecap="round"/>
      <path d="m638 250 12-17h47l13 17-7 35h-58Z" fill="url(#${p}-gold)"/>
      <path d="m646 244 13-30h31l14 30-8 15h-43Z" fill="url(#${p}-suit)"/>
      <path d="m658 222 8-10h17l9 10-4 14h-27Z" fill="#203650"/>
      <path d="m662 223 5-6h12" stroke="#8ed7e8" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      <rect x="655" y="263" width="37" height="13" rx="3" fill="#e7e8ed"/>
      <rect x="663" y="266" width="10" height="7" rx="1.5" fill="#f58254"/>
      <circle cx="683" cy="269.5" r="2.5" fill="#65d9e8"/>
      <path d="m642 253 12 8-9 13m58-21-12 8 9 13" fill="none" stroke="#ffe0a0" stroke-opacity=".45" stroke-width="1.5"/>
      <path d="M674 211v-16m0 0 9-5" stroke="#c6cee0" stroke-width="2"/><circle cx="684" cy="189" r="3" fill="#ff8b5e"/>
    </g>
    <g filter="url(#${p}-shadow)">
      <rect x="421" y="277" width="47" height="91" rx="16" fill="url(#${p}-orange)"/>
      <rect x="416" y="293" width="12" height="54" rx="5" fill="#c86345"/>
      <path d="M453 365q-7 29-10 57" stroke="url(#${p}-suit)" stroke-width="31" stroke-linecap="round"/>
      <path d="M491 365q10 29 17 54" stroke="url(#${p}-suit)" stroke-width="31" stroke-linecap="round"/>
      <path d="m437 408-3 15m64-15 5 14" stroke="#a6b2cf" stroke-width="3"/>
      <path d="M427 424q14-7 28 0l2 13q-18 8-35 0Z" fill="url(#${p}-orange)"/>
      <path d="M496 421q14-7 26 1l8 12q-15 10-34 3Z" fill="url(#${p}-orange)"/>
      <path d="M423 437q17 5 34 0m40 1q18 4 32-3" stroke="#713f3b" stroke-width="4" stroke-linecap="round"/>
      <path d="M445 292q-25 9-34 38l-9 24" stroke="url(#${p}-suit)" stroke-width="27" stroke-linecap="round"/>
      <path d="m416 321-8 17" stroke="#f58254" stroke-width="28"/>
      <path d="m404 348-4 13" stroke="#c4cddd" stroke-width="27" stroke-linecap="round"/>
      <path d="M396 359q-8 8-3 16 7 7 15-1l4-10Z" fill="url(#${p}-orange)"/>
      <path d="M503 294q26-3 35-30l8-20" stroke="url(#${p}-suit)" stroke-width="26" stroke-linecap="round"/>
      <path d="m526 282 9-13" stroke="#f58254" stroke-width="27"/>
      <path d="m542 251 5-13" stroke="#c4cddd" stroke-width="25" stroke-linecap="round"/>
      <path d="M539 237q-3-13 5-18 5-2 8 4l4-12q4-6 8-1 3 4-1 13 8-5 10 1 2 7-10 17l-12 6Z" fill="url(#${p}-orange)"/>
      <path d="M447 282q26-12 53 0l10 77q-31 22-68 0Z" fill="url(#${p}-suit)"/>
      <path d="M445 287q-8 16-7 34m63-34q8 16 7 34" stroke="#f58254" stroke-width="9" stroke-linecap="round"/>
      <path d="M444 349q31 12 64 0l-1 13q-31 12-64 0Z" fill="url(#${p}-orange)"/>
      <rect x="458" y="303" width="37" height="32" rx="7" fill="#b9c5d8"/>
      <rect x="463" y="308" width="27" height="12" rx="3" fill="#344b65"/>
      <path d="M467 314h8l3-3 4 5h4" stroke="#83dfb4" stroke-width="1.5" fill="none"/>
      <circle cx="467" cy="326" r="2.5" fill="#f58254"/><circle cx="477" cy="326" r="2.5" fill="#65d9e8"/><circle cx="487" cy="326" r="2.5" fill="#f5f3ef"/>
      <circle cx="503" cy="294" r="7" fill="#f58254"/><path d="m503 289 1.5 3.2 3.5.5-2.5 2.5.6 3.5-3.1-1.7-3.1 1.7.6-3.5-2.5-2.5 3.5-.5Z" fill="#ffe4cf"/>
      <path d="M451 365q5 8 10 0m29 0q5 8 10 0" stroke="#9aa8c2" stroke-width="2" fill="none"/>
      <ellipse cx="475" cy="280" rx="34" ry="10" fill="#c0c9da"/>
      <ellipse cx="475" cy="275" rx="35" ry="9" fill="#f58254"/>
      <circle cx="474" cy="235" r="57" fill="url(#${p}-suit)"/>
      <circle cx="480" cy="236" r="46" fill="#d4dce8"/>
      <ellipse cx="484" cy="237" rx="41" ry="37" fill="url(#${p}-visor)"/>
      <path d="M453 224q12-22 38-17" stroke="#b7e7ef" stroke-width="5" stroke-linecap="round" opacity=".65" fill="none"/>
      <path d="M451 233q5-8 9-9" stroke="#e5fbff" stroke-width="3" stroke-linecap="round" opacity=".7" fill="none"/>
      <path d="M488 259q18-2 27-17" stroke="#568caf" stroke-width="3" stroke-linecap="round" opacity=".5" fill="none"/>
      <ellipse cx="501" cy="244" rx="9" ry="7" fill="#6cb6d5" opacity=".25"/>
      <rect x="414" y="225" width="10" height="24" rx="5" fill="#c4cddd"/><rect x="525" y="225" width="10" height="24" rx="5" fill="#f58254"/>
      <path d="M449 190q22-15 45-3" stroke="#fffdf5" stroke-width="4" stroke-linecap="round" opacity=".7" fill="none"/>
    </g>
    <g fill="#c7c9de" opacity=".5"><circle cx="590" cy="405" r="2"/><circle cx="611" cy="418" r="1.5"/><circle cx="727" cy="386" r="2"/><circle cx="375" cy="460" r="1.5"/><circle cx="568" cy="452" r="2"/></g>
  </svg>`;
}

export function missionArt(id) {
  const p = uid();
  const defs = `<defs><linearGradient id="${p}-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${id === 'stars' ? '#30284e' : id === 'systems' ? '#26334a' : '#233451'}"/><stop offset="1" stop-color="#172039"/></linearGradient><linearGradient id="${p}-body" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f4f1e9"/><stop offset="1" stop-color="#9eafcb"/></linearGradient><linearGradient id="${p}-fire" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffd17c"/><stop offset="1" stop-color="#ff8b5e" stop-opacity="0"/></linearGradient><radialGradient id="${p}-glow"><stop stop-color="#65d9e8" stop-opacity=".24"/><stop offset="1" stop-color="#65d9e8" stop-opacity="0"/></radialGradient></defs>`;
  const stars = '<g fill="#d7e5ff" opacity=".65"><circle cx="42" cy="38" r="1"/><circle cx="94" cy="72" r="1.2"/><circle cx="145" cy="28" r="1"/><circle cx="204" cy="54" r="1.3"/><circle cx="263" cy="24" r="1"/><circle cx="319" cy="67" r="1.2"/><circle cx="370" cy="34" r="1"/><circle cx="348" cy="112" r="1"/><circle cx="63" cy="121" r="1"/></g>';
  let scene = '';
  if (id === 'lunar') {
    scene = `<circle cx="326" cy="43" r="19" fill="#4b91bf"/><path d="m315 31 12-5 7 9-8 8 2 9-10-3Z" fill="#91cbbd" opacity=".8"/><path d="M0 145q72-35 143-9t130-7q70-22 127 4v47H0Z" fill="#737b9d"/><path d="M0 163q100-26 204-5t196-8v30H0Z" fill="#4b5575"/><ellipse cx="204" cy="151" rx="47" ry="8" fill="#303953" opacity=".6"/><rect x="165" y="146" width="78" height="5" rx="2" fill="#83dfb4"/><circle cx="169" cy="145" r="2" fill="#d5ffe9"/><circle cx="239" cy="145" r="2" fill="#d5ffe9"/><g transform="translate(202 91)"><path d="m-12 20-16 31m40-31 16 31m-43 0h13m22 0h13" stroke="#d9a45c" stroke-width="3" stroke-linecap="round"/><path d="m-10 31 10 35 10-35Z" fill="url(#${p}-fire)"/><path d="m-22 8 8-12h28l8 12-5 22h-34Z" fill="#d9a45c"/><path d="m-15 3 7-23h16l7 23-5 10h-20Z" fill="url(#${p}-body)"/><path d="m-8-14 5-7h6l5 7-3 9H-5Z" fill="#243b57"/><rect x="-9" y="15" width="18" height="7" rx="2" fill="#e7e8ed"/><rect x="-5" y="17" width="6" height="3" fill="#ff8b5e"/></g><path d="M83 151v-35m0 0 20 4-20 7" stroke="#ff8b5e" stroke-width="2" fill="#ff8b5e"/><ellipse cx="292" cy="165" rx="19" ry="4" fill="#303953" opacity=".5"/>`;
  } else if (id === 'docking') {
    scene = `<ellipse cx="275" cy="92" rx="90" ry="70" fill="url(#${p}-glow)"/><path d="M107 94h142" stroke="#65d9e8" stroke-opacity=".45" stroke-dasharray="4 6"/><g transform="translate(293 91)"><rect x="-13" y="-66" width="27" height="132" rx="5" fill="#536c99"/><path d="M-53-54h80v25h-80Zm0 83h80v25h-80Z" fill="#315b91" stroke="#6d9dd1" stroke-width="1"/><path d="M-40-54v25m13-25v25m13-25v25m13-25v25m-39 58v25m13-25v25m13-25v25m13-25v25" stroke="#78a5ff" stroke-opacity=".55"/><rect x="-27" y="-26" width="57" height="52" rx="10" fill="url(#${p}-body)"/><rect x="27" y="-17" width="29" height="34" rx="6" fill="#a8b8d0"/><circle cx="-28" cy="0" r="19" fill="#344c69" stroke="#83dfb4" stroke-width="3"/><circle cx="-28" cy="0" r="10" fill="#17273e"/><path d="M-5-16h18m-18 8h18" stroke="#8b9bb7" stroke-width="2"/><circle cx="8" cy="12" r="3" fill="#ff8b5e"/></g><g transform="translate(121 94)"><path d="m-25-12-20 12 20 12Z" fill="url(#${p}-fire)"/><path d="M-24-17h28l17 17-17 17h-28Z" fill="url(#${p}-body)"/><path d="M-24-17h10v34h-10Z" fill="#ff8b5e"/><path d="m4-12 12 12L4 12Z" fill="#244461"/><path d="m-17-17-9-12h15l8 12m-14 34-9 12h15l8-12" fill="#8fa4c4"/><circle cx="-7" cy="0" r="4" fill="#65d9e8"/></g>`;
  } else if (id === 'stars') {
    scene = `<ellipse cx="205" cy="95" rx="110" ry="75" fill="url(#${p}-glow)"/><g stroke="#7c89b8" stroke-opacity=".12"><path d="M0 45h400M0 90h400M0 135h400M80 0v180m80-180v180m80-180v180m80-180v180"/></g><path d="m139 48 111 8-70 43 20 5 20 5-58 40 111-5-53-35" fill="none" stroke="#b6a0ff" stroke-width="1.5" stroke-opacity=".75"/><path d="m139 48 23 101m88-93 23 88" stroke="#b6a0ff" stroke-opacity=".25"/><g fill="#e9e3ff"><circle cx="139" cy="48" r="4"/><circle cx="250" cy="56" r="3.5"/><circle cx="180" cy="99" r="3"/><circle cx="200" cy="104" r="3"/><circle cx="220" cy="109" r="3"/><circle cx="162" cy="149" r="3"/><circle cx="273" cy="144" r="4"/></g><g fill="none" stroke="#b6a0ff" stroke-opacity=".35"><circle cx="139" cy="48" r="9"/><circle cx="273" cy="144" r="10"/><circle cx="200" cy="104" r="14"/></g><path d="M139 34v-7m0 42v-7m-14-14h-7m42 0h-7" stroke="#ffd17c" stroke-opacity=".7"/><text x="286" y="148" fill="#aab4cf" font-size="8" font-family="sans-serif">ORION</text>`;
  } else {
    scene = `<ellipse cx="202" cy="103" rx="80" ry="70" fill="url(#${p}-glow)"/><path d="M0 161h400" stroke="#53617f"/><path d="M144 161v-14h116v14" fill="#3c4966"/><g transform="translate(202 88)"><path d="m-12 43 12 42 12-42Z" fill="url(#${p}-fire)"/><path d="M0-62q20 18 20 57v43h-40V-5q0-39 20-57Z" fill="url(#${p}-body)"/><path d="M0-62q12 11 17 30h-34q5-19 17-30Z" fill="#ff8b5e"/><circle cx="0" cy="-12" r="10" fill="#244461" stroke="#9eafcb" stroke-width="3"/><circle cx="0" cy="-12" r="5" fill="#65d9e8" opacity=".7"/><path d="m-20 12-17 30 17-5m40-25 17 30-17-5" fill="#ff8b5e"/><path d="M-20 25h40" stroke="#8b9bb7" stroke-width="2"/><rect x="-7" y="5" width="14" height="10" rx="2" fill="#536c99"/></g><g stroke="#65d9e8" stroke-opacity=".4" fill="none"><circle cx="202" cy="91" r="66" stroke-dasharray="3 7"/><path d="M132 91h-28l-12-12H62m144 34h39l14 14h39"/></g><g fill="#83dfb4"><circle cx="62" cy="79" r="3"/><circle cx="298" cy="127" r="3"/></g><rect x="48" y="69" width="27" height="4" rx="2" fill="#536c99"/><rect x="285" y="136" width="27" height="4" rx="2" fill="#536c99"/>`;
  }
  return `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${defs}<rect width="400" height="180" fill="url(#${p}-bg)"/>${stars}${scene}</svg>`;
}

export function planetArt() {
  const p = uid();
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="${p}"><stop stop-color="#9be5e8"/><stop offset=".6" stop-color="#4e9ebc"/><stop offset="1" stop-color="#2c527e"/></radialGradient></defs><circle cx="32" cy="32" r="19" fill="url(#${p})"/><path d="m21 19 10-4 7 7-6 7 4 8-8 5-6-9-7-3Z" fill="#a4d8bd" opacity=".8"/><ellipse cx="32" cy="32" rx="29" ry="9" transform="rotate(-28 32 32)" fill="none" stroke="#ffd17c" stroke-width="2.5" opacity=".8"/><circle cx="53" cy="15" r="2" fill="#ffd17c"/></svg>`;
}