/**
 * CROWN & BLIGHT: THE ROYAL GAMBIT (Ultra-Visual Edition)
 * High-Definition 256x256 Multi-Layered Dark-Fantasy Sprite & Texture Atlas
 * Includes:
 *  - 7 Sanctified Ivory & Gold Royal Chess Pieces
 *  - Winged Golden Rook Sentinel (The Chess Back-Rank Sweep replacement for Lawnmowers)
 *  - 7 Hyper-Detailed Corrupted Obsidian Chess Undead Monsters
 *  - Veined Marble & Obsidian Board Tile Textures
 */

class RoyalSpriteAtlas {
  constructor() {
    this.pieceSprites = {};
    this.pieceDataUrls = {};
    this.enemySprites = {};
    this.enemyDataUrls = {};
    this.sentinelSprite = null;
    this.sentinelDataUrl = '';
    this.tileTextures = {};
    this.bgImage = null;
    this.crestImage = null;
    this.ready = false;

    this.generateAllSprites();
    this.loadExternalAssets();
  }

  loadExternalAssets() {
    const bg = new Image();
    bg.onload = () => {
      this.bgImage = bg;
    };
    bg.onerror = () => {};
    bg.src = 'assets/battlefield-bg.png';

    const crest = new Image();
    crest.onload = () => {
      this.crestImage = crest;
      const logoEls = document.querySelectorAll('.royal-crest-img');
      logoEls.forEach(el => {
        el.src = 'assets/royal-crest.png';
        el.style.display = 'block';
      });
    };
    crest.onerror = () => {};
    crest.src = 'assets/royal-crest.png';
  }

  generateAllSprites() {
    this.generateBoardTileTextures();

    // 1. Royal Chess Pieces
    const pieceSpecs = this.getPieceSVGDefinitions();
    Object.keys(pieceSpecs).forEach(key => {
      const svgStr = pieceSpecs[key];
      const dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgStr.trim());
      this.pieceDataUrls[key] = dataUrl;
      const img = new Image();
      img.src = dataUrl;
      this.pieceSprites[key] = img;
    });

    // 2. Winged Golden Rook Sentinel (Back-Rank Guardian Statue)
    const sentinelSvg = this.getWingedRookSentinelSVG();
    this.sentinelDataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(sentinelSvg.trim());
    this.sentinelSprite = new Image();
    this.sentinelSprite.src = this.sentinelDataUrl;

    // 3. Hyper-Detailed Corrupted Ebony Chess Undead Monsters
    const enemySpecs = this.getEnemySVGDefinitions();
    Object.keys(enemySpecs).forEach(key => {
      const svgStr = enemySpecs[key];
      const dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgStr.trim());
      this.enemyDataUrls[key] = dataUrl;
      const img = new Image();
      img.src = dataUrl;
      this.enemySprites[key] = img;
    });

    this.ready = true;
  }

  generateBoardTileTextures() {
    const createMarbleTile = isLight => {
      const c = document.createElement('canvas');
      c.width = 160;
      c.height = 160;
      const ctx = c.getContext('2d');

      const grad = ctx.createRadialGradient(80, 65, 10, 80, 80, 120);
      if (isLight) {
        grad.addColorStop(0, '#434d6e');
        grad.addColorStop(0.55, '#2d354f');
        grad.addColorStop(1, '#1e2438');
      } else {
        grad.addColorStop(0, '#1e243a');
        grad.addColorStop(0.6, '#121626');
        grad.addColorStop(1, '#090c15');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 160, 160);

      // Subtle marble veins
      ctx.strokeStyle = isLight ? 'rgba(255, 255, 255, 0.065)' : 'rgba(148, 163, 184, 0.04)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo((i * 37) % 160, 0);
        ctx.bezierCurveTo(
          40 + ((i * 29) % 80),
          50,
          20 + ((i * 53) % 110),
          110,
          (i * 43 + 60) % 160,
          160
        );
        ctx.stroke();
      }

      // Ornate corner gold filigree brackets
      ctx.strokeStyle = isLight ? 'rgba(250, 204, 21, 0.26)' : 'rgba(56, 189, 248, 0.16)';
      ctx.lineWidth = 1.5;
      const m = 8;
      const len = 15;
      ctx.beginPath();
      ctx.moveTo(m, m + len);
      ctx.lineTo(m, m);
      ctx.lineTo(m + len, m);
      ctx.moveTo(160 - m - len, m);
      ctx.lineTo(160 - m, m);
      ctx.lineTo(160 - m, m + len);
      ctx.moveTo(m, 160 - m - len);
      ctx.lineTo(m, 160 - m);
      ctx.lineTo(m + len, 160 - m);
      ctx.moveTo(160 - m - len, 160 - m);
      ctx.lineTo(160 - m, 160 - m);
      ctx.lineTo(160 - m, 160 - m - len);
      ctx.stroke();

      ctx.strokeStyle = isLight ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.strokeRect(1.5, 1.5, 157, 157);

      return c;
    };

    this.tileTextures.light = createMarbleTile(true);
    this.tileTextures.dark = createMarbleTile(false);
  }

  // ULTRA-DETAILED Imperial Golden Winged Rook Sentinel (Celestial Chess Automaton)
  getWingedRookSentinelSVG() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260">
        <defs>
          <linearGradient id="impGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="18%" stop-color="#fef08a"/>
            <stop offset="45%" stop-color="#facc15"/>
            <stop offset="78%" stop-color="#b45309"/>
            <stop offset="100%" stop-color="#451a03"/>
          </linearGradient>
          <linearGradient id="impGoldDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fde047"/>
            <stop offset="50%" stop-color="#ca8a04"/>
            <stop offset="100%" stop-color="#713f12"/>
          </linearGradient>
          <linearGradient id="sapphirePlate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="35%" stop-color="#0284c7"/>
            <stop offset="75%" stop-color="#1e3a8a"/>
            <stop offset="100%" stop-color="#090d16"/>
          </linearGradient>
          <linearGradient id="seraphFeather" x1="0%" y1="0%" x2="100%" y2="30%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="30%" stop-color="#fef08a"/>
            <stop offset="70%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#92400e"/>
          </linearGradient>
          <radialGradient id="celestialCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="35%" stop-color="#7dd3fc"/>
            <stop offset="70%" stop-color="#0284c7"/>
            <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
          </radialGradient>
          <filter id="sentinelShadow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#000000" flood-opacity="0.82"/>
          </filter>
        </defs>

        <g filter="url(#sentinelShadow)">
          <!-- Radiant Halo Behind the Rook Crown -->
          <circle cx="130" cy="88" r="64" fill="url(#celestialCore)" opacity="0.55"/>
          <circle cx="130" cy="88" r="46" fill="none" stroke="url(#impGold)" stroke-width="2.5" stroke-dasharray="6 4"/>

          <!-- TIER 1: Upper Archangel Golden Pinion Feathers (Left & Right) -->
          <path d="M92,112 C52,82 22,52 10,18 C38,26 68,44 96,72 Z" fill="url(#seraphFeather)" stroke="#fef9c3" stroke-width="2"/>
          <path d="M168,112 C208,82 238,52 250,18 C222,26 192,44 164,72 Z" fill="url(#seraphFeather)" stroke="#fef9c3" stroke-width="2"/>

          <!-- TIER 2: Mid Swept Golden Bladed Feathers -->
          <path d="M90,126 C44,108 16,86 6,56 C38,64 68,78 94,98 Z" fill="url(#impGold)" stroke="#ffffff" stroke-width="2"/>
          <path d="M170,126 C216,108 244,86 254,56 C222,64 192,78 166,98 Z" fill="url(#impGold)" stroke="#ffffff" stroke-width="2"/>

          <!-- TIER 3: Lower Valkyrie Shield-Feathers -->
          <path d="M92,142 C52,136 26,124 14,98 C44,102 70,112 94,124 Z" fill="url(#impGoldDark)" stroke="#fef08a" stroke-width="1.8"/>
          <path d="M168,142 C208,136 234,124 246,98 C216,102 190,112 166,124 Z" fill="url(#impGoldDark)" stroke="#fef08a" stroke-width="1.8"/>

          <!-- Cyan Energy Feather Ribs -->
          <path d="M84,96 L28,42 M84,114 L24,76 M176,96 L232,42 M176,114 L236,76" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>

          <!-- 3D Octagonal Royal Marble & Gold Pedestal -->
          <ellipse cx="130" cy="216" rx="64" ry="20" fill="#090d16" stroke="url(#impGold)" stroke-width="4"/>
          <path d="M74,208 C74,190 186,190 186,208 L174,192 C174,180 86,180 86,192 Z" fill="url(#impGold)" stroke="#451a03" stroke-width="2"/>
          <ellipse cx="130" cy="192" rx="46" ry="13" fill="url(#sapphirePlate)" stroke="url(#impGold)" stroke-width="3"/>

          <!-- Sculpted Imperial Chess Rook Tower Body -->
          <path d="M86,192 L96,92 L164,92 L174,192 Z" fill="url(#impGold)" stroke="#ffffff" stroke-width="3"/>
          <!-- Inner Lapis-Sapphire Armor Core -->
          <path d="M98,98 L162,98 L166,184 L94,184 Z" fill="url(#sapphirePlate)" stroke="url(#impGold)" stroke-width="2.5"/>

          <!-- Golden Cathedral Ribs & Buttresses on the Rook Body -->
          <rect x="88" y="162" width="84" height="12" rx="4" fill="url(#impGold)" stroke="#713f12" stroke-width="1.5"/>
          <rect x="92" y="122" width="76" height="10" rx="4" fill="url(#impGold)" stroke="#713f12" stroke-width="1.5"/>

          <!-- Grand 5-Merlon Chess Rook Battlement Crown -->
          <path d="M78,94 L72,50 L92,50 L94,68 L108,68 L108,46 L124,46 L124,66 L136,66 L136,46 L152,46 L152,68 L166,68 L168,50 L188,50 L182,94 Z" fill="url(#impGold)" stroke="#ffffff" stroke-width="3"/>

          <!-- Levitating Sovereign Crown Finial Above Rook -->
          <polygon points="130,12 142,32 130,28 118,32" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
          <circle cx="130" cy="34" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>

          <!-- Blazing Orthogonal Starburst Lance Core in Chest -->
          <polygon points="130,104 148,142 130,180 112,142" fill="url(#impGold)" stroke="#ffffff" stroke-width="2"/>
          <polygon points="96,142 130,128 178,142 130,156" fill="url(#impGold)" stroke="#ffffff" stroke-width="2"/>
          <circle cx="130" cy="142" r="14" fill="url(#celestialCore)"/>
          <circle cx="130" cy="142" r="7" fill="#ffffff"/>
        </g>
      </svg>
    `;
  }

  getPieceSVGDefinitions() {
    const commonDefs = `
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="35%" stop-color="#facc15"/>
          <stop offset="70%" stop-color="#ca8a04"/>
          <stop offset="100%" stop-color="#713f12"/>
        </linearGradient>
        <linearGradient id="ivoryArmor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="#e2e8f0"/>
          <stop offset="70%" stop-color="#64748b"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
        <linearGradient id="obsidianBase" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="50%" stop-color="#334155"/>
          <stop offset="100%" stop-color="#090d16"/>
        </linearGradient>
        <radialGradient id="cyanGem" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#e0f2fe"/>
          <stop offset="45%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </radialGradient>
        <radialGradient id="violetGem" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#f3e8ff"/>
          <stop offset="45%" stop-color="#c084fc"/>
          <stop offset="100%" stop-color="#6b21a8"/>
        </radialGradient>
        <radialGradient id="rubyGem" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ffe4e6"/>
          <stop offset="45%" stop-color="#fb7185"/>
          <stop offset="100%" stop-color="#9f1239"/>
        </radialGradient>
        <radialGradient id="sunHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fef9c3"/>
          <stop offset="45%" stop-color="#facc15" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
        </radialGradient>
        <filter id="dropGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000000" flood-opacity="0.65"/>
        </filter>
      </defs>
    `;

    const pedestal = trimColor => `
      <ellipse cx="100" cy="172" rx="58" ry="18" fill="url(#obsidianBase)" stroke="${trimColor}" stroke-width="3.5"/>
      <path d="M52,165 C52,150 148,150 148,165 L140,152 C140,142 60,142 60,152 Z" fill="url(#goldGrad)" stroke="#713f12" stroke-width="1.5"/>
      <ellipse cx="100" cy="152" rx="42" ry="11" fill="#1e293b" stroke="url(#goldGrad)" stroke-width="2.5"/>
    `;

    return {
      chalice: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${commonDefs}
          <g filter="url(#dropGlow)">
            ${pedestal('#facc15')}
            <path d="M84,150 L90,106 L110,106 L116,150 Z" fill="url(#goldGrad)" stroke="#fef08a" stroke-width="1.5"/>
            <path d="M54,74 C54,116 82,122 100,122 C118,122 146,116 146,74 L132,74 C128,96 112,102 100,102 C88,102 72,96 68,74 Z" fill="url(#goldGrad)" stroke="#fef9c3" stroke-width="2"/>
            <ellipse cx="100" cy="74" rx="46" ry="12" fill="#78350f" stroke="url(#goldGrad)" stroke-width="3.5"/>
            <circle cx="100" cy="112" r="9" fill="url(#cyanGem)" stroke="#fef08a" stroke-width="2"/>
            <circle cx="100" cy="52" r="34" fill="url(#sunHalo)"/>
            <circle cx="100" cy="52" r="17" fill="#fef9c3" stroke="#f59e0b" stroke-width="3"/>
            <path d="M100,24 L104,36 L116,36 L106,44 L110,56 L100,48 L90,56 L94,44 L84,36 L96,36 Z" fill="#facc15"/>
          </g>
        </svg>
      `,

      pawn: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${commonDefs}
          <g filter="url(#dropGlow)">
            ${pedestal('#38bdf8')}
            <path d="M66,152 C70,116 80,96 84,82 L116,82 C120,96 130,116 134,152 Z" fill="url(#ivoryArmor)" stroke="url(#goldGrad)" stroke-width="3"/>
            <path d="M62,92 Q100,106 138,92 L128,78 Q100,88 72,78 Z" fill="url(#goldGrad)" stroke="#fef08a" stroke-width="1.5"/>
            <circle cx="100" cy="56" r="24" fill="url(#ivoryArmor)" stroke="url(#goldGrad)" stroke-width="3"/>
            <path d="M84,54 L100,60 L116,54 L112,62 L100,66 L88,62 Z" fill="#38bdf8"/>
            <circle cx="100" cy="28" r="6" fill="url(#goldGrad)"/>
            <path d="M136,156 L146,34" stroke="url(#goldGrad)" stroke-width="5" stroke-linecap="round"/>
            <path d="M146,38 L172,52 L158,76 L143,66 Z" fill="url(#cyanGem)" stroke="#e0f2fe" stroke-width="2"/>
            <polygon points="100,100 109,114 100,128 91,114" fill="url(#cyanGem)" stroke="#fef08a" stroke-width="1.5"/>
          </g>
        </svg>
      `,

      rook: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${commonDefs}
          <g filter="url(#dropGlow)">
            ${pedestal('#fb923c')}
            <path d="M60,152 L68,72 L132,72 L140,152 Z" fill="url(#ivoryArmor)" stroke="url(#goldGrad)" stroke-width="3.5"/>
            <rect x="64" y="122" width="72" height="12" rx="3" fill="url(#goldGrad)"/>
            <rect x="67" y="86" width="66" height="10" rx="3" fill="url(#goldGrad)"/>
            <path d="M54,74 L54,42 L72,42 L72,56 L88,56 L88,42 L112,42 L112,56 L128,56 L128,42 L146,42 L146,74 Z" fill="url(#ivoryArmor)" stroke="url(#goldGrad)" stroke-width="3"/>
            <rect x="93" y="88" width="14" height="52" rx="4" fill="#ea580c" stroke="#fed7aa" stroke-width="2"/>
            <rect x="74" y="107" width="52" height="14" rx="4" fill="#ea580c" stroke="#fed7aa" stroke-width="2"/>
            <circle cx="100" cy="114" r="9" fill="#fef08a"/>
          </g>
        </svg>
      `,

      knight: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${commonDefs}
          <g filter="url(#dropGlow)">
            ${pedestal('#c084fc')}
            <path d="M64,152 C62,114 68,84 58,64 C52,48 68,28 92,26 L104,14 L112,28 C132,32 152,48 156,64 L138,78 L114,72 C110,84 128,96 134,152 Z" fill="url(#ivoryArmor)" stroke="url(#goldGrad)" stroke-width="3.5"/>
            <path d="M72,42 C56,64 60,104 68,142" fill="none" stroke="url(#goldGrad)" stroke-width="8" stroke-linecap="round"/>
            <polygon points="112,28 148,14 126,42" fill="url(#violetGem)" stroke="#f3e8ff" stroke-width="1.5"/>
            <circle cx="116" cy="48" r="6.5" fill="url(#violetGem)" stroke="#ffffff" stroke-width="1.5"/>
            <path d="M104,90 L90,114 L106,114 L94,140 L120,108 L104,108 Z" fill="#c084fc" stroke="#f3e8ff" stroke-width="1.5"/>
          </g>
        </svg>
      `,

      bishop: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${commonDefs}
          <g filter="url(#dropGlow)">
            ${pedestal('#2dd4bf')}
            <path d="M64,152 C68,108 78,86 100,82 C122,86 132,108 136,152 Z" fill="url(#ivoryArmor)" stroke="url(#goldGrad)" stroke-width="3"/>
            <path d="M70,86 C64,54 82,30 100,20 C118,30 136,54 130,86 Z" fill="url(#ivoryArmor)" stroke="url(#goldGrad)" stroke-width="3.5"/>
            <circle cx="100" cy="14" r="7" fill="url(#goldGrad)"/>
            <path d="M82,46 L118,82 M118,46 L82,82" stroke="#2dd4bf" stroke-width="6" stroke-linecap="round"/>
            <path d="M82,46 L118,82 M118,46 L82,82" stroke="#ccfbf1" stroke-width="2" stroke-linecap="round"/>
            <polygon points="50,64 58,50 66,64 58,78" fill="url(#cyanGem)" stroke="#fef08a" stroke-width="1.5"/>
            <polygon points="134,64 142,50 150,64 142,78" fill="url(#goldGrad)" stroke="#fef08a" stroke-width="1.5"/>
          </g>
        </svg>
      `,

      king: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${commonDefs}
          <g filter="url(#dropGlow)">
            ${pedestal('#fb7185')}
            <path d="M58,152 L68,78 L132,78 L142,152 Z" fill="url(#ivoryArmor)" stroke="url(#goldGrad)" stroke-width="3.5"/>
            <path d="M74,80 L126,80 L130,150 L70,150 Z" fill="#881337" stroke="url(#goldGrad)" stroke-width="2"/>
            <path d="M62,78 L56,48 L80,60 L100,44 L120,60 L144,48 L138,78 Z" fill="url(#goldGrad)" stroke="#fef9c3" stroke-width="2"/>
            <rect x="94" y="10" width="12" height="36" rx="3" fill="url(#goldGrad)" stroke="#fef9c3" stroke-width="1.5"/>
            <rect x="80" y="20" width="40" height="12" rx="3" fill="url(#goldGrad)" stroke="#fef9c3" stroke-width="1.5"/>
            <polygon points="100,92 114,112 100,132 86,112" fill="url(#rubyGem)" stroke="#fef08a" stroke-width="2"/>
          </g>
        </svg>
      `,

      queen: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${commonDefs}
          <g filter="url(#dropGlow)">
            ${pedestal('#facc15')}
            <circle cx="100" cy="72" r="56" fill="url(#sunHalo)"/>
            <path d="M60,152 C66,114 78,94 82,78 L118,78 C122,94 134,114 140,152 Z" fill="url(#goldGrad)" stroke="#fef9c3" stroke-width="3"/>
            <path d="M62,78 L46,38 L76,60 L100,26 L124,60 L154,38 L138,78 Z" fill="url(#ivoryArmor)" stroke="url(#goldGrad)" stroke-width="3"/>
            <circle cx="46" cy="34" r="6" fill="url(#cyanGem)" stroke="#fef9c3" stroke-width="2"/>
            <circle cx="100" cy="20" r="8" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
            <circle cx="154" cy="34" r="6" fill="url(#cyanGem)" stroke="#fef9c3" stroke-width="2"/>
            <polygon points="100,90 105,108 123,113 105,118 100,136 95,118 77,113 95,108" fill="#ffffff" stroke="#ca8a04" stroke-width="1.5"/>
          </g>
        </svg>
      `
    };
  }

  // ULTRA-DETAILED 256x256 Corrupted Black-Chess Undead Monsters!
  getEnemySVGDefinitions() {
    const defs = `
      <defs>
        <linearGradient id="ebonyArmor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#334155"/>
          <stop offset="45%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
        <linearGradient id="necroSkull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="45%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#475569"/>
        </linearGradient>
        <linearGradient id="blightBlade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ecfccb"/>
          <stop offset="40%" stop-color="#84cc16"/>
          <stop offset="100%" stop-color="#14532d"/>
        </linearGradient>
        <linearGradient id="crimsonEdge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffe4e6"/>
          <stop offset="45%" stop-color="#f43f5e"/>
          <stop offset="100%" stop-color="#881337"/>
        </linearGradient>
        <linearGradient id="frostSteel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e0f2fe"/>
          <stop offset="50%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#172554"/>
        </linearGradient>
        <radialGradient id="toxicCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="50%" stop-color="#84cc16" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#15803d" stop-opacity="0"/>
        </radialGradient>
        <filter id="monsterShadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.82"/>
        </filter>
      </defs>
    `;

    const darkPedestal = glowColor => `
      <ellipse cx="105" cy="176" rx="54" ry="15" fill="#050811" stroke="${glowColor}" stroke-width="2.5"/>
      <ellipse cx="105" cy="172" rx="42" ry="10" fill="url(#ebonyArmor)" stroke="#334155" stroke-width="1.5"/>
    `;

    return {
      // 1. Shambling Pawn-Thrall: Corrupted Black-Pawn Revenant with glowing ribcage, spiked shoulder pauldrons & jagged executioner cleaver
      thrall: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${defs}
          <g filter="url(#monsterShadow)">
            ${darkPedestal('#84cc16')}
            <!-- Necrotic Aura behind torso -->
            <circle cx="105" cy="105" r="52" fill="url(#toxicCore)"/>
            <!-- Tattered Dark Cloak -->
            <path d="M68,82 L54,166 L80,156 L98,170 L124,158 L146,168 L136,82 Z" fill="#1a2e05" stroke="#4d7c0f" stroke-width="2"/>
            <!-- Ebony Black-Pawn Armor Chest & Glowing Ribcage -->
            <path d="M72,162 C74,118 82,92 88,78 L122,78 C128,92 136,118 138,162 Z" fill="url(#ebonyArmor)" stroke="#84cc16" stroke-width="3"/>
            <path d="M84,98 Q105,106 126,98 M86,114 Q105,122 124,114 M88,130 Q105,138 122,130" fill="none" stroke="#bef264" stroke-width="4" stroke-linecap="round"/>
            <!-- Spiked Black Pauldrons -->
            <path d="M58,86 L86,74 L82,96 Z" fill="url(#ebonyArmor)" stroke="#a3e635" stroke-width="2"/>
            <path d="M152,86 L124,74 L128,96 Z" fill="url(#ebonyArmor)" stroke="#a3e635" stroke-width="2"/>
            <!-- Horned Skull Head + Cracked Black Pawn Finial -->
            <circle cx="102" cy="54" r="24" fill="url(#necroSkull)" stroke="#1e293b" stroke-width="3"/>
            <circle cx="102" cy="24" r="9" fill="url(#ebonyArmor)" stroke="#84cc16" stroke-width="2"/>
            <!-- Menacing Glowing Blight Eyes & Jaw -->
            <polygon points="84,48 98,52 88,58" fill="#84cc16"/>
            <circle cx="90" cy="52" r="3.5" fill="#fef08a"/>
            <path d="M88,68 L94,74 L100,68 L106,74 L112,68" fill="none" stroke="#1e293b" stroke-width="2.5"/>
            <!-- Jagged Blight Executioner Cleaver (Left Hand) -->
            <path d="M40,118 L78,94" stroke="#475569" stroke-width="7" stroke-linecap="round"/>
            <path d="M16,52 L52,66 L46,122 L18,108 L26,88 L12,78 Z" fill="url(#blightBlade)" stroke="#ecfccb" stroke-width="2"/>
          </g>
        </svg>
      `,

      // 2. Ironclad Buckler: Armored Black-Rook Dreadnought with Runic Fortress Tower Shield & War Flail
      buckler: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${defs}
          <g filter="url(#monsterShadow)">
            ${darkPedestal('#60a5fa')}
            <!-- Heavy Dreadnought Plate Body -->
            <path d="M76,164 L82,74 L146,74 L152,164 Z" fill="url(#ebonyArmor)" stroke="#60a5fa" stroke-width="3"/>
            <!-- Rook Battlement Helmet with Glowing Blue Visor -->
            <path d="M80,74 L80,34 L94,34 L94,44 L108,44 L108,34 L122,34 L122,44 L136,44 L136,34 L148,34 L148,74 Z" fill="url(#ebonyArmor)" stroke="#93c5fd" stroke-width="2.5"/>
            <rect x="88" y="54" width="38" height="7" rx="3" fill="#38bdf8"/>
            <!-- Spiked Morning-Star Flail (Right Side) -->
            <line x1="146" y1="92" x2="174" y2="62" stroke="#94a3b8" stroke-width="5"/>
            <circle cx="176" cy="56" r="14" fill="url(#frostSteel)" stroke="#e0f2fe" stroke-width="2"/>
            <!-- Colossal Runic Fortress Tower Shield (Left Front) -->
            <path d="M22,34 L82,24 L82,162 L52,178 L22,162 Z" fill="url(#ebonyArmor)" stroke="url(#frostSteel)" stroke-width="4.5"/>
            <path d="M32,44 L72,36 L72,154 L52,166 L32,154 Z" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
            <!-- Glowing Rook Shield Core -->
            <polygon points="52,66 68,98 52,130 36,98" fill="url(#frostSteel)" stroke="#ffffff" stroke-width="2"/>
            <circle cx="52" cy="98" r="7" fill="#e0f2fe"/>
          </g>
        </svg>
      `,

      // 3. Plaguevault Stalker: Corrupted Black-Knight Centaur/Warhorse Revenant with Twin Energy Lances
      sprinter: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${defs}
          <g filter="url(#monsterShadow)">
            ${darkPedestal('#c084fc')}
            <!-- Fluttering Phantom Violet Cape -->
            <path d="M96,64 C138,58 172,82 184,132 C156,124 134,132 118,148 Z" fill="#4c1d95" stroke="#c084fc" stroke-width="2"/>
            <!-- Armored Black-Knight Warhorse Skull & Neck -->
            <path d="M64,164 C62,118 72,88 62,62 C56,42 74,22 98,20 L112,8 L118,24 C138,28 152,44 148,62 L126,74 L104,68 C108,92 126,114 132,164 Z" fill="url(#ebonyArmor)" stroke="#c084fc" stroke-width="3.5"/>
            <!-- Skeletal Jaw & Violet Flame Eye -->
            <polygon points="78,42 96,46 84,54" fill="#e879f9"/>
            <circle cx="86" cy="46" r="4" fill="#ffffff"/>
            <!-- Spectral Spine Plates -->
            <path d="M114,34 L134,26 M118,50 L140,44 M120,68 L142,64" stroke="#e879f9" stroke-width="3.5" stroke-linecap="round"/>
            <!-- High-Voltage Vaulting Pole-Lance -->
            <line x1="14" y1="146" x2="178" y2="22" stroke="#f0abfc" stroke-width="5.5" stroke-linecap="round"/>
            <polygon points="10,150 32,118 46,134" fill="#c084fc" stroke="#ffffff" stroke-width="2"/>
          </g>
        </svg>
      `,

      // 4. Shadow-Knight Assassin: Wraith Queen-Slayer with Hooded Death Mask & Twin Crimson Crescent Scythes
      assassin: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${defs}
          <g filter="url(#monsterShadow)">
            ${darkPedestal('#f43f5e')}
            <!-- Swirling Shadow Smoke Tendrils -->
            <path d="M46,158 C32,124 48,88 74,72 L126,72 C152,88 168,124 154,158 L132,144 L105,168 L78,144 Z" fill="#1f0916" stroke="#f43f5e" stroke-width="2.5"/>
            <!-- Sleek Obsidian Assassin Cuirass -->
            <path d="M74,154 L84,74 L126,74 L136,154 Z" fill="url(#ebonyArmor)" stroke="#fb7185" stroke-width="3"/>
            <!-- Pointed Executioner Wraith Hood & Glowing Slit Eyes -->
            <path d="M68,78 L105,14 L142,78 Q105,64 68,78 Z" fill="#090d16" stroke="#f43f5e" stroke-width="3"/>
            <polygon points="84,54 100,58 88,64" fill="#f43f5e"/>
            <polygon points="126,54 110,58 122,64" fill="#f43f5e"/>
            <!-- Twin Crimson Queen-Slayer Crescent Scythes -->
            <path d="M12,114 C18,64 48,44 76,58 C52,68 38,88 38,118 Z" fill="url(#crimsonEdge)" stroke="#ffe4e6" stroke-width="2"/>
            <path d="M198,114 C192,64 162,44 134,58 C158,68 172,88 172,118 Z" fill="url(#crimsonEdge)" stroke="#ffe4e6" stroke-width="2"/>
            <!-- Crimson Heart Sigil -->
            <polygon points="105,90 116,108 105,126 94,108" fill="url(#crimsonEdge)" stroke="#ffffff" stroke-width="1.5"/>
          </g>
        </svg>
      `,

      // 5. Necro-Bishop Acolyte: Corrupted Arch-Lich Bishop with Split Mitre Crown, Ribcage & Levitating Hex Skull Staff
      necro: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${defs}
          <g filter="url(#monsterShadow)">
            ${darkPedestal('#2dd4bf')}
            <!-- Arch-Lich vestments with gold & teal runes -->
            <path d="M60,166 C64,114 78,86 105,78 C132,86 146,114 150,166 Z" fill="#042f2e" stroke="#2dd4bf" stroke-width="3"/>
            <path d="M92,82 L118,82 L124,164 L86,164 Z" fill="#0f172a" stroke="#5eead4" stroke-width="2"/>
            <!-- Corrupted Cleft Bishop Mitre Hat -->
            <path d="M74,78 C68,44 84,22 100,12 L104,34 L112,12 C128,22 142,44 136,78 Z" fill="url(#ebonyArmor)" stroke="#2dd4bf" stroke-width="3"/>
            <!-- Lich Skull Face -->
            <circle cx="105" cy="64" r="18" fill="url(#necroSkull)" stroke="#115e59" stroke-width="2.5"/>
            <circle cx="97" cy="62" r="5" fill="#2dd4bf"/>
            <circle cx="113" cy="62" r="5" fill="#2dd4bf"/>
            <!-- Cursed Diagonal Hex Crozier Staff -->
            <line x1="38" y1="168" x2="48" y2="38" stroke="#99f6e4" stroke-width="5.5" stroke-linecap="round"/>
            <circle cx="48" cy="34" r="18" fill="rgba(45, 212, 191, 0.25)" stroke="#2dd4bf" stroke-width="2.5"/>
            <polygon points="48,20 60,34 48,48 36,34" fill="#2dd4bf" stroke="#ffffff" stroke-width="1.5"/>
          </g>
        </svg>
      `,

      // 6. Cursed Blight-Imp: Winged Gargoyle Pawn-Fiend with Clawed Gauntlets
      imp: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${defs}
          <g filter="url(#monsterShadow)">
            <ellipse cx="100" cy="170" rx="38" ry="11" fill="#050811" stroke="#fb7185" stroke-width="2"/>
            <!-- Bat-like Gargoyle Wings -->
            <path d="M78,104 L28,68 L42,118 L76,124 Z" fill="#4c0519" stroke="#fb7185" stroke-width="2"/>
            <path d="M122,104 L172,68 L158,118 L124,124 Z" fill="#4c0519" stroke="#fb7185" stroke-width="2"/>
            <!-- Imp Armored Body -->
            <path d="M74,162 L82,94 L118,94 L126,162 Z" fill="#881337" stroke="#fda4af" stroke-width="2.5"/>
            <!-- Horned Fiend Skull -->
            <circle cx="100" cy="72" r="22" fill="url(#necroSkull)" stroke="#be123c" stroke-width="2.5"/>
            <path d="M84,56 L62,26 L94,50 Z" fill="url(#crimsonEdge)"/>
            <path d="M116,56 L138,26 L106,50 Z" fill="url(#crimsonEdge)"/>
            <circle cx="90" cy="70" r="5.5" fill="#fef08a"/>
            <circle cx="108" cy="70" r="5.5" fill="#fef08a"/>
          </g>
        </svg>
      `,

      // 7. Fallen Rook Gargantua (BOSS): Colossal Hellfire Obsidian Rook-Titan with Molten Core & Earthshaker Monolith
      gargantua: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220">
          ${defs}
          <g filter="url(#monsterShadow)">
            <ellipse cx="115" cy="190" rx="74" ry="20" fill="#050811" stroke="#f97316" stroke-width="4"/>
            <!-- Hulking Titan Obsidian Body -->
            <path d="M52,182 L62,56 L168,56 L178,182 Z" fill="url(#ebonyArmor)" stroke="#f97316" stroke-width="4.5"/>
            <!-- Twin Shattered Rook Citadel Shoulder Pauldrons -->
            <path d="M32,82 L32,38 L46,38 L46,48 L60,48 L60,38 L74,38 L74,82 Z" fill="url(#ebonyArmor)" stroke="#fb923c" stroke-width="3"/>
            <path d="M156,82 L156,38 L170,38 L170,48 L184,48 L184,38 L198,38 L198,82 Z" fill="url(#ebonyArmor)" stroke="#fb923c" stroke-width="3"/>
            <!-- Crowned Demon-King Skull Visage -->
            <circle cx="115" cy="48" r="28" fill="url(#necroSkull)" stroke="#ea580c" stroke-width="3.5"/>
            <path d="M92,28 L72,4 L104,22 M138,28 L158,4 L126,22" fill="#f97316"/>
            <circle cx="102" cy="46" r="7" fill="#facc15"/>
            <circle cx="126" cy="46" r="7" fill="#facc15"/>
            <!-- Blazing Hellfire Furnace Core in Chest -->
            <polygon points="115,82 142,122 115,162 88,122" fill="#ea580c" stroke="#fef08a" stroke-width="3"/>
            <polygon points="115,96 130,122 115,148 100,122" fill="#fef08a"/>
            <!-- Colossal Crushing Obsidian Rook Monolith Hammer (Left Hand) -->
            <line x1="34" y1="176" x2="34" y2="30" stroke="#78350f" stroke-width="10" stroke-linecap="round"/>
            <rect x="6" y="16" width="54" height="76" rx="6" fill="url(#ebonyArmor)" stroke="#f97316" stroke-width="3.5"/>
            <circle cx="33" cy="54" r="12" fill="#f97316"/>
          </g>
        </svg>
      `
    };
  }
}

window.RoyalSprites = new RoyalSpriteAtlas();
