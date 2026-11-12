/**
 * CROWN & BLIGHT: THE ROYAL SIEGE (AAA Art Director Edition — ChatGPT Spec)
 * High-Definition 256x256 Multi-Layered Dark-Fantasy Sprite & Texture Atlas
 *
 * Art Direction Palette (ChatGPT Principal Art Director Spec):
 *  - Royal Defenders: Polished Ivory (#F2E8CE -> #8C8276), Forged Gold (#FFF0B2 -> #C79A38),
 *    Lapis Lazuli Inlay (#234DAB), Upper-Right Starlight Rim (#CDEEFF)
 *  - Corrupted Ebony Undead: Polished Obsidian (#15131C -> #383342),
 *    Necrotic Emerald (#39D98A / #126348), Specialist Crimson (#A5253D), Boss Hellfire (#FF742B)
 *  - 10x5 Citadel Board Tiles: Light Stone (#817D79), Dark Slate (#34323C), Grout (#201F28), Gold Inlay (#B58E48)
 */

class RoyalSpriteAtlas {
  constructor() {
    this.pieceSprites = {};
    this.pieceDataUrls = {};
    this.enemySprites = {};
    this.enemyFlashSprites = {};
    this.enemyChillSprites = {};
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

    // 1. Royal Chess Pieces (Sanctified Ivory, Forged Gold, Lapis & Starlight Rim)
    const pieceSpecs = this.getPieceSVGDefinitions();
    Object.keys(pieceSpecs).forEach(key => {
      const svgStr = pieceSpecs[key];
      const dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgStr.trim());
      this.pieceDataUrls[key] = dataUrl;
      const img = new Image();
      img.src = dataUrl;
      this.pieceSprites[key] = img;
    });

    // 2. Winged Golden Rook Sentinel (Back-Rank Guardian Automaton)
    const sentinelSvg = this.getWingedRookSentinelSVG();
    this.sentinelDataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(sentinelSvg.trim());
    this.sentinelSprite = new Image();
    this.sentinelSprite.src = this.sentinelDataUrl;

    // 3. Corrupted Ebony Chess Undead Bestiary (Obsidian, Necrotic Emerald, Crimson & Hellfire)
    const enemySpecs = this.getEnemySVGDefinitions();
    Object.keys(enemySpecs).forEach(key => {
      const svgStr = enemySpecs[key];
      const dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgStr.trim());
      this.enemyDataUrls[key] = dataUrl;
      const img = new Image();
      img.onload = () => {
        this.bakeEnemyTints(key, img);
      };
      img.src = dataUrl;
      this.enemySprites[key] = img;
    });

    this.ready = true;
  }

  // Pre-bake offscreen hit-flash & chilled sprite canvases so renderer never runs slow ctx.filter per frame
  bakeEnemyTints(key, img) {
    if (!img || !img.naturalWidth || !img.naturalHeight) return;
    const size = 160;

    const flashCanvas = document.createElement('canvas');
    flashCanvas.width = size;
    flashCanvas.height = size;
    const fCtx = flashCanvas.getContext('2d');
    fCtx.drawImage(img, 0, 0, size, size);
    fCtx.globalCompositeOperation = 'source-atop';
    fCtx.fillStyle = 'rgba(255, 250, 235, 0.72)';
    fCtx.fillRect(0, 0, size, size);
    this.enemyFlashSprites[key] = flashCanvas;

    const chillCanvas = document.createElement('canvas');
    chillCanvas.width = size;
    chillCanvas.height = size;
    const cCtx = chillCanvas.getContext('2d');
    cCtx.drawImage(img, 0, 0, size, size);
    cCtx.globalCompositeOperation = 'source-atop';
    cCtx.fillStyle = 'rgba(56, 189, 248, 0.42)';
    cCtx.fillRect(0, 0, size, size);
    this.enemyChillSprites[key] = chillCanvas;
  }

  generateBoardTileTextures() {
    // ChatGPT Art Director Spec:
    // Light squares #817D79, Dark squares #34323C, Grout #201F28, Gold Inlay #B58E48
    const createCitadelTile = isLight => {
      const c = document.createElement('canvas');
      c.width = 160;
      c.height = 160;
      const ctx = c.getContext('2d');

      // 1. Continuous Grout Boundary (#201F28)
      ctx.fillStyle = '#201F28';
      ctx.fillRect(0, 0, 160, 160);

      // 2. Broad, Subdued Stone Surface Reflection (Upper-Left Key Light)
      const grad = ctx.createRadialGradient(52, 44, 10, 80, 80, 132);
      if (isLight) {
        grad.addColorStop(0, '#96918B');
        grad.addColorStop(0.48, '#817D79');
        grad.addColorStop(1, '#5E5A57');
      } else {
        grad.addColorStop(0, '#43414E');
        grad.addColorStop(0.52, '#34323C');
        grad.addColorStop(1, '#23222A');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(2, 2, 156, 156);

      // 3. Soft Diagonal Citadel Specular Wash (kept below piece highlight intensity)
      const sheen = ctx.createLinearGradient(0, 0, 160, 160);
      sheen.addColorStop(0, isLight ? 'rgba(242, 232, 206, 0.14)' : 'rgba(72, 83, 101, 0.14)');
      sheen.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
      sheen.addColorStop(1, 'rgba(13, 17, 27, 0.32)');
      ctx.fillStyle = sheen;
      ctx.fillRect(2, 2, 156, 156);

      // 4. Natural Weathered Limestone / Slate Veining
      ctx.strokeStyle = isLight ? 'rgba(242, 232, 206, 0.11)' : 'rgba(21, 19, 28, 0.35)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo((i * 41) % 156 + 2, 2);
        ctx.bezierCurveTo(
          36 + ((i * 29) % 84),
          52,
          24 + ((i * 53) % 104),
          108,
          (i * 47 + 50) % 156 + 2,
          158
        );
        ctx.stroke();
      }

      // 5. Sacred Inlay (#B58E48) Filigree & Recessed Inner Bevel
      ctx.save();
      ctx.translate(80, 80);
      ctx.strokeStyle = isLight ? 'rgba(181, 142, 72, 0.28)' : 'rgba(181, 142, 72, 0.16)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-19, -19, 38, 38);
      ctx.restore();

      // Corner Sacred Inlay Brackets (#B58E48)
      ctx.strokeStyle = isLight ? 'rgba(181, 142, 72, 0.45)' : 'rgba(181, 142, 72, 0.28)';
      ctx.lineWidth = 1.5;
      const m = 7;
      const len = 14;
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

      // Upper-Left Specular Bevel & Lower-Right Grout Shadow
      ctx.strokeStyle = isLight ? 'rgba(242, 232, 206, 0.26)' : 'rgba(205, 238, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(2, 158);
      ctx.lineTo(2, 2);
      ctx.lineTo(158, 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(13, 17, 27, 0.65)';
      ctx.beginPath();
      ctx.moveTo(158, 2);
      ctx.lineTo(158, 158);
      ctx.lineTo(2, 158);
      ctx.stroke();

      return c;
    };

    this.tileTextures.light = createCitadelTile(true);
    this.tileTextures.dark = createCitadelTile(false);
  }

  // Winged Golden Rook Sentinel (Sanctified Ivory, Forged Gold #C79A38, Lapis #234DAB & Starlight #CDEEFF)
  getWingedRookSentinelSVG() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260">
        <defs>
          <linearGradient id="forgedGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFF0B2"/>
            <stop offset="28%" stop-color="#E5C158"/>
            <stop offset="58%" stop-color="#C79A38"/>
            <stop offset="100%" stop-color="#6E4F12"/>
          </linearGradient>
          <linearGradient id="sanctifiedIvory" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stop-color="#FFFDF7"/>
            <stop offset="32%" stop-color="#F2E8CE"/>
            <stop offset="72%" stop-color="#8C8276"/>
            <stop offset="100%" stop-color="#4A433B"/>
          </linearGradient>
          <linearGradient id="lapisInlay" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4B7BE5"/>
            <stop offset="45%" stop-color="#234DAB"/>
            <stop offset="100%" stop-color="#0F2354"/>
          </linearGradient>
          <radialGradient id="starlightCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="45%" stop-color="#CDEEFF"/>
            <stop offset="100%" stop-color="#234DAB" stop-opacity="0"/>
          </radialGradient>
          <filter id="sentinelShadow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#0D111B" flood-opacity="0.88"/>
          </filter>
        </defs>

        <g filter="url(#sentinelShadow)">
          <!-- Starlight Halo Behind the Rook Crown -->
          <circle cx="130" cy="88" r="60" fill="url(#starlightCore)" opacity="0.6"/>
          <circle cx="130" cy="88" r="45" fill="none" stroke="url(#forgedGold)" stroke-width="2.2" stroke-dasharray="6 4"/>

          <!-- Confined Valkyrie Pinion Wings (Kept disciplined around Rook silhouette) -->
          <path d="M92,110 C56,82 28,54 16,22 C44,30 70,48 96,74 Z" fill="url(#forgedGold)" stroke="#FFF0B2" stroke-width="2"/>
          <path d="M168,110 C204,82 232,54 244,22 C216,30 190,48 164,74 Z" fill="url(#forgedGold)" stroke="#CDEEFF" stroke-width="2.2"/>
          <path d="M90,126 C50,108 24,88 14,60 C44,68 70,80 94,100 Z" fill="url(#sanctifiedIvory)" stroke="url(#forgedGold)" stroke-width="2"/>
          <path d="M170,126 C210,108 236,88 246,60 C216,68 190,80 166,100 Z" fill="url(#sanctifiedIvory)" stroke="#CDEEFF" stroke-width="2"/>

          <!-- Shared Stepped Forged-Gold & Lapis Pedestal Base -->
          <ellipse cx="130" cy="216" rx="64" ry="19" fill="#171C29" stroke="url(#forgedGold)" stroke-width="3.5"/>
          <path d="M74,208 C74,190 186,190 186,208 L174,192 C174,180 86,180 86,192 Z" fill="url(#forgedGold)" stroke="#6E4F12" stroke-width="2"/>
          <ellipse cx="130" cy="192" rx="46" ry="12" fill="url(#lapisInlay)" stroke="#FFF0B2" stroke-width="2.5"/>

          <!-- Sculpted Sanctified Ivory Rook Tower Body with Upper-Right Starlight Rim -->
          <path d="M86,192 L95,90 L165,90 L174,192 Z" fill="url(#sanctifiedIvory)" stroke="url(#forgedGold)" stroke-width="3"/>
          <line x1="164" y1="92" x2="172" y2="188" stroke="#CDEEFF" stroke-width="2.5" stroke-linecap="round"/>

          <!-- Central Lapis Lazuli Focal Inlay (#234DAB) -->
          <path d="M104,100 L156,100 L160,182 L100,182 Z" fill="url(#lapisInlay)" stroke="url(#forgedGold)" stroke-width="2.2"/>
          <rect x="89" y="162" width="82" height="10" rx="3" fill="url(#forgedGold)"/>
          <rect x="93" y="122" width="74" height="9" rx="3" fill="url(#forgedGold)"/>

          <!-- Unmistakable 5-Merlon Chess Rook Battlement Crown -->
          <path d="M78,92 L74,50 L92,50 L94,66 L108,66 L108,46 L124,46 L124,64 L136,64 L136,46 L152,46 L152,66 L166,66 L168,50 L186,50 L182,92 Z" fill="url(#sanctifiedIvory)" stroke="url(#forgedGold)" stroke-width="3"/>
          <path d="M152,46 L168,50 L186,50 L182,90" fill="none" stroke="#CDEEFF" stroke-width="2.2"/>

          <!-- Starlight Attack Origin Core -->
          <polygon points="130,106 146,142 130,178 114,142" fill="url(#forgedGold)" stroke="#FFF0B2" stroke-width="1.8"/>
          <circle cx="130" cy="142" r="10" fill="#CDEEFF" stroke="#FFFFFF" stroke-width="2"/>
        </g>
      </svg>
    `;
  }

  getPieceSVGDefinitions() {
    // ChatGPT Art Director Spec Gradients & Shared Stepped Gold/Lapis Pedestal
    const commonDefs = `
      <defs>
        <!-- Sanctified Ivory (#F2E8CE -> #8C8276) with Upper-Left Key Light -->
        <linearGradient id="ivoryCyl" x1="12%" y1="8%" x2="88%" y2="92%">
          <stop offset="0%" stop-color="#FFFDF8"/>
          <stop offset="26%" stop-color="#F2E8CE"/>
          <stop offset="68%" stop-color="#8C8276"/>
          <stop offset="100%" stop-color="#4A443C"/>
        </linearGradient>

        <!-- Forged Gold (#FFF0B2 -> #C79A38) with Sharp Specular Band -->
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF0B2"/>
          <stop offset="22%" stop-color="#E5C058"/>
          <stop offset="48%" stop-color="#C79A38"/>
          <stop offset="78%" stop-color="#8F681E"/>
          <stop offset="100%" stop-color="#52390B"/>
        </linearGradient>

        <!-- Lapis Lazuli Focal Inlay (#234DAB) -->
        <linearGradient id="lapisGrad" x1="15%" y1="15%" x2="85%" y2="85%">
          <stop offset="0%" stop-color="#5B8DEF"/>
          <stop offset="45%" stop-color="#234DAB"/>
          <stop offset="100%" stop-color="#0E2252"/>
        </linearGradient>

        <!-- Starlight Gem (#CDEEFF) -->
        <radialGradient id="starlightGem" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="48%" stop-color="#CDEEFF"/>
          <stop offset="100%" stop-color="#234DAB"/>
        </radialGradient>

        <radialGradient id="sunHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFF0B2"/>
          <stop offset="48%" stop-color="#C79A38" stop-opacity="0.75"/>
          <stop offset="100%" stop-color="#C79A38" stop-opacity="0"/>
        </radialGradient>

        <filter id="dropGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="7" stdDeviation="5" flood-color="#0D111B" flood-opacity="0.78"/>
        </filter>
      </defs>
    `;

    // Shared 3-Tier Stepped Forged-Gold & Lapis Pedestal Base (ChatGPT Upgrade #1)
    const steppedPedestal = () => `
      <!-- Tier 1: Lower Obsidian-Enamel Plinth Ring -->
      <ellipse cx="100" cy="175" rx="58" ry="16" fill="#171C29" stroke="url(#goldGrad)" stroke-width="3.2"/>
      <!-- Tier 2: Stepped Forged-Gold Moulding -->
      <path d="M50,168 C50,152 150,152 150,168 L140,154 C140,143 60,143 60,154 Z" fill="url(#goldGrad)" stroke="#52390B" stroke-width="1.6"/>
      <!-- Upper-Left Specular Band on Gold Base -->
      <path d="M58,162 C78,154 122,154 142,162" fill="none" stroke="#FFF0B2" stroke-width="2" stroke-linecap="round"/>
      <!-- Tier 3: Lapis Lazuli Collar Ring (#234DAB) -->
      <ellipse cx="100" cy="153" rx="42" ry="10.5" fill="url(#lapisGrad)" stroke="#FFF0B2" stroke-width="2.2"/>
    `;

    return {
      // 1. SUN-SPIRE CHALICE: Sanctified Ivory & Forged Gold Reliquary Goblet with Lapis Collar & Starlight Sun
      chalice: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${commonDefs}
          <g filter="url(#dropGlow)">
            ${steppedPedestal()}
            <!-- Sculpted Ivory & Gold Stem -->
            <path d="M84,151 L89,104 L111,104 L116,151 Z" fill="url(#ivoryCyl)" stroke="url(#goldGrad)" stroke-width="2.5"/>
            <!-- Lapis Lazuli Node on Stem -->
            <ellipse cx="100" cy="126" rx="16" ry="7" fill="url(#lapisGrad)" stroke="#FFF0B2" stroke-width="1.8"/>
            <!-- Sculpted Sanctified Ivory & Gold Reliquary Bowl -->
            <path d="M54,74 C54,116 80,122 100,122 C120,122 146,116 146,74 Z" fill="url(#ivoryCyl)" stroke="url(#goldGrad)" stroke-width="3.2"/>
            <!-- Engraved Gold Filigree Band & Upper-Right Starlight Rim -->
            <path d="M62,92 Q100,104 138,92" fill="none" stroke="url(#goldGrad)" stroke-width="3.5"/>
            <path d="M144,76 C142,102 128,114 112,119" fill="none" stroke="#CDEEFF" stroke-width="2.4" stroke-linecap="round"/>
            <ellipse cx="100" cy="74" rx="46" ry="11" fill="url(#lapisGrad)" stroke="url(#goldGrad)" stroke-width="3.2"/>
            <!-- Radiant Starlight-Gold Mana Sun (Attack/Mana Origin) -->
            <circle cx="100" cy="50" r="32" fill="url(#sunHalo)"/>
            <circle cx="100" cy="50" r="16" fill="#FFF0B2" stroke="#C79A38" stroke-width="2.8"/>
            <polygon points="100,24 105,40 122,45 105,50 100,66 95,50 78,45 95,40" fill="#FFFFFF"/>
          </g>
        </svg>
      `,

      // 2. PHALANX SHIELD-PAWN: Unmistakable Classic Pawn Sphere Finial + Sanctified Ivory Body + Forged-Gold & Lapis Push-Shield
      pawn: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${commonDefs}
          <g filter="url(#dropGlow)">
            ${steppedPedestal()}
            <!-- Classic Staunton Royal Pawn Tapered Ivory Column -->
            <path d="M62,152 C66,114 75,92 82,76 L112,76 C119,92 128,114 132,152 Z" fill="url(#ivoryCyl)" stroke="url(#goldGrad)" stroke-width="3"/>
            <!-- Forged-Gold Collar Ring -->
            <ellipse cx="97" cy="76" rx="24" ry="7" fill="url(#goldGrad)" stroke="#FFF0B2" stroke-width="1.8"/>
            <!-- Unmistakable Chess Pawn Sphere Head in Sanctified Ivory -->
            <circle cx="97" cy="50" r="23" fill="url(#ivoryCyl)" stroke="url(#goldGrad)" stroke-width="3"/>
            <!-- Soft Ivory Highlight (Upper-Left) & Starlight Rim (Upper-Right) -->
            <circle cx="89" cy="42" r="7" fill="#FFFFFF" opacity="0.65"/>
            <path d="M104,29 A22,22 0 0,1 119,52" fill="none" stroke="#CDEEFF" stroke-width="2.6" stroke-linecap="round"/>
            <!-- Lapis Lazuli Visor Inlay -->
            <path d="M80,49 L97,55 L114,49 L110,57 L97,62 L84,57 Z" fill="url(#lapisGrad)" stroke="#CDEEFF" stroke-width="1.2"/>
            <!-- Heavy Forged-Gold & Lapis Phalanx Tower Shield (Held Forward Facing Right for Shield Push!) -->
            <path d="M106,48 L162,38 L166,116 L136,158 L104,136 Z" fill="url(#goldGrad)" stroke="#FFF0B2" stroke-width="3"/>
            <path d="M113,55 L155,47 L158,112 L136,146 L111,128 Z" fill="url(#lapisGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
            <!-- Starlight Rim & Engraved Cross on Shield -->
            <line x1="162" y1="38" x2="166" y2="116" stroke="#CDEEFF" stroke-width="3" stroke-linecap="round"/>
            <line x1="135" y1="52" x2="135" y2="142" stroke="url(#goldGrad)" stroke-width="3.8"/>
            <line x1="114" y1="94" x2="156" y2="90" stroke="url(#goldGrad)" stroke-width="3.8"/>
            <polygon points="135,74 147,92 135,110 123,92" fill="url(#starlightGem)" stroke="#FFF0B2" stroke-width="1.8"/>
          </g>
        </svg>
      `,

      // 3. AEGIS ROOK: Unmistakable Castle Battlement Tower in Sanctified Ivory, Lapis Focal Inlay & Forged Gold
      rook: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${commonDefs}
          <g filter="url(#dropGlow)">
            ${steppedPedestal()}
            <!-- Cylindrical Sanctified Ivory Castle Tower -->
            <path d="M60,152 L68,74 L132,74 L140,152 Z" fill="url(#ivoryCyl)" stroke="url(#goldGrad)" stroke-width="3.2"/>
            <!-- Upper-Right Starlight Rim along Tower Edge -->
            <line x1="131" y1="76" x2="138" y2="149" stroke="#CDEEFF" stroke-width="2.6" stroke-linecap="round"/>
            <!-- Forged-Gold Structural Bands -->
            <rect x="63" y="126" width="74" height="10" rx="3" fill="url(#goldGrad)" stroke="#52390B" stroke-width="1.2"/>
            <rect x="66" y="84" width="68" height="9" rx="3" fill="url(#goldGrad)" stroke="#52390B" stroke-width="1.2"/>
            <!-- Unmistakable 4-Merlon Chess Rook Battlement Crown -->
            <path d="M54,74 L54,40 L72,40 L72,55 L88,55 L88,40 L112,40 L112,55 L128,55 L128,40 L146,40 L146,74 Z" fill="url(#ivoryCyl)" stroke="url(#goldGrad)" stroke-width="3.2"/>
            <path d="M128,40 L146,40 L146,72" fill="none" stroke="#CDEEFF" stroke-width="2.5" stroke-linecap="round"/>
            <!-- Central Lapis Lazuli Focal Inlay + Orthogonal Starlight Cross Core -->
            <polygon points="100,88 122,110 100,132 78,110" fill="url(#lapisGrad)" stroke="url(#goldGrad)" stroke-width="2.2"/>
            <rect x="95" y="92" width="10" height="36" rx="3" fill="#FFF0B2"/>
            <rect x="82" y="105" width="36" height="10" rx="3" fill="#FFF0B2"/>
            <circle cx="100" cy="110" r="6" fill="#CDEEFF"/>
          </g>
        </svg>
      `,

      // 4. TEMPEST KNIGHT: Unmistakable Sculpted Horse Profile in Sanctified Ivory, Forged-Gold Mane & Lapis Barding
      knight: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${commonDefs}
          <g filter="url(#dropGlow)">
            ${steppedPedestal()}
            <!-- Forged-Gold Segmented Mane Spine -->
            <path d="M74,32 C50,56 50,104 62,148 L78,148 C70,104 70,62 88,40 Z" fill="url(#goldGrad)" stroke="#FFF0B2" stroke-width="2"/>
            <!-- Classic Staunton Sculpted Warhorse Head & Arched Neck in Sanctified Ivory -->
            <path d="M64,152 C62,112 70,84 62,62 C56,44 72,26 96,24 L108,12 L114,26 C136,32 154,48 156,64 L136,78 L112,70 C108,86 128,100 134,152 Z" fill="url(#ivoryCyl)" stroke="url(#goldGrad)" stroke-width="3.2"/>
            <!-- Upper-Right Starlight Rim along Horse Snout & Neck -->
            <path d="M108,12 L114,26 C136,32 154,48 156,64" fill="none" stroke="#CDEEFF" stroke-width="2.6" stroke-linecap="round"/>
            <!-- Lapis Lazuli Royal Chamfron (Face Plate) & Chest Inlay -->
            <polygon points="106,28 144,54 132,66 102,44" fill="url(#lapisGrad)" stroke="#FFF0B2" stroke-width="1.6"/>
            <path d="M90,94 L118,94 L124,142 L84,142 Z" fill="url(#lapisGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
            <!-- Glowing Starlight Eye & L-Jump Lightning Sigil -->
            <circle cx="112" cy="44" r="5.5" fill="#CDEEFF" stroke="#FFFFFF" stroke-width="1.5"/>
            <path d="M104,98 L94,118 L106,118 L98,136 L116,112 L104,112 Z" fill="#FFF0B2"/>
          </g>
        </svg>
      `,

      // 5. RADIANT BISHOP: Unmistakable Cleft Mitre Slit Silhouette in Sanctified Ivory, Lapis Stole & Starlight Prisms
      bishop: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${commonDefs}
          <g filter="url(#dropGlow)">
            ${steppedPedestal()}
            <!-- Tapered Ivory Lower Vestment Column -->
            <path d="M64,152 C68,108 78,88 100,84 C122,88 132,108 136,152 Z" fill="url(#ivoryCyl)" stroke="url(#goldGrad)" stroke-width="3"/>
            <!-- Lapis Lazuli Vertical Stole Inlay -->
            <path d="M88,86 L112,86 L116,150 L84,150 Z" fill="url(#lapisGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
            <ellipse cx="100" cy="84" rx="28" ry="7.5" fill="url(#goldGrad)" stroke="#FFF0B2" stroke-width="1.6"/>
            <!-- Unmistakable Chess Bishop Mitre Head with Authentic Diagonal Cleft Slit -->
            <path d="M70,84 C64,50 80,26 100,18 C110,22 118,30 122,40 L102,56 L126,48 C132,60 132,72 130,84 Z" fill="url(#ivoryCyl)" stroke="url(#goldGrad)" stroke-width="3.2"/>
            <!-- Starlight Rim & Finial Orb -->
            <circle cx="100" cy="12" r="6.5" fill="url(#goldGrad)" stroke="#FFF0B2" stroke-width="1.8"/>
            <path d="M102,56 L124,42" stroke="#CDEEFF" stroke-width="3.5" stroke-linecap="round"/>
            <!-- Engraved Diagonal X-Cross on Chest (Attack Origin) -->
            <path d="M86,102 L114,130 M114,102 L86,130" stroke="#FFF0B2" stroke-width="4.5" stroke-linecap="round"/>
            <circle cx="100" cy="116" r="6" fill="#CDEEFF"/>
          </g>
        </svg>
      `,

      // 6. ARCANE KING: Unmistakable Towering Imperial Cross Finial, Sanctified Ivory & Lapis Sovereign Mantle
      king: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${commonDefs}
          <g filter="url(#dropGlow)">
            ${steppedPedestal()}
            <!-- Broad Sanctified Ivory Sovereign Column -->
            <path d="M58,152 L68,78 L132,78 L142,152 Z" fill="url(#ivoryCyl)" stroke="url(#goldGrad)" stroke-width="3.4"/>
            <line x1="131" y1="80" x2="140" y2="149" stroke="#CDEEFF" stroke-width="2.6" stroke-linecap="round"/>
            <!-- Lapis Lazuli Royal Tabard Inlay -->
            <path d="M76,80 L124,80 L128,150 L72,150 Z" fill="url(#lapisGrad)" stroke="url(#goldGrad)" stroke-width="2.2"/>
            <!-- Arched Forged-Gold Imperial Crown -->
            <path d="M60,78 L54,48 L78,58 L100,44 L122,58 L146,48 L140,78 Z" fill="url(#goldGrad)" stroke="#FFF0B2" stroke-width="2.4"/>
            <ellipse cx="100" cy="78" rx="36" ry="8" fill="url(#goldGrad)" stroke="#FFF0B2" stroke-width="1.8"/>
            <!-- Unmistakable Chess King Cross Finial at Apex -->
            <rect x="94" y="8" width="12" height="36" rx="3" fill="url(#goldGrad)" stroke="#FFF0B2" stroke-width="2"/>
            <rect x="80" y="18" width="40" height="12" rx="3" fill="url(#goldGrad)" stroke="#FFF0B2" stroke-width="2"/>
            <circle cx="100" cy="24" r="4.5" fill="#CDEEFF"/>
            <!-- Sovereign Starlight-Gold Command Crest on Chest -->
            <polygon points="100,92 116,114 100,136 84,114" fill="url(#goldGrad)" stroke="#FFF0B2" stroke-width="2"/>
            <circle cx="100" cy="114" r="7" fill="#CDEEFF" stroke="#FFFFFF" stroke-width="1.5"/>
          </g>
        </svg>
      `,

      // 7. SOVEREIGN QUEEN: Unmistakable 7-Spire Coronet Diadem, Sanctified Ivory & Forged-Gold Starburst Core
      queen: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${commonDefs}
          <g filter="url(#dropGlow)">
            ${steppedPedestal()}
            <circle cx="100" cy="70" r="54" fill="url(#sunHalo)"/>
            <!-- Graceful Fluted Sanctified Ivory & Gold Silhouette -->
            <path d="M60,152 C66,114 78,94 82,76 L118,76 C122,94 134,114 140,152 Z" fill="url(#ivoryCyl)" stroke="url(#goldGrad)" stroke-width="3.2"/>
            <path d="M118,78 C122,96 132,116 138,149" fill="none" stroke="#CDEEFF" stroke-width="2.6" stroke-linecap="round"/>
            <!-- Lapis Lazuli Focal Inlay Sash -->
            <path d="M84,80 L116,80 L122,150 L78,150 Z" fill="url(#lapisGrad)" stroke="url(#goldGrad)" stroke-width="2"/>
            <!-- Unmistakable Chess Queen Multi-Peaked Coronet Diadem -->
            <path d="M60,76 L44,36 L70,58 L84,30 L100,54 L116,30 L130,58 L156,36 L140,76 Z" fill="url(#goldGrad)" stroke="#FFF0B2" stroke-width="2.5"/>
            <ellipse cx="100" cy="76" rx="34" ry="7.5" fill="url(#goldGrad)" stroke="#FFF0B2" stroke-width="1.8"/>
            <!-- Starlight Pearls on Coronet Peaks -->
            <circle cx="44" cy="32" r="5" fill="#CDEEFF" stroke="#FFFFFF" stroke-width="1.5"/>
            <circle cx="84" cy="26" r="5.5" fill="#FFF0B2" stroke="#FFFFFF" stroke-width="1.5"/>
            <circle cx="100" cy="18" r="8" fill="#CDEEFF" stroke="#FFF0B2" stroke-width="2"/>
            <circle cx="116" cy="26" r="5.5" fill="#FFF0B2" stroke="#FFFFFF" stroke-width="1.5"/>
            <circle cx="156" cy="32" r="5" fill="#CDEEFF" stroke="#FFFFFF" stroke-width="1.5"/>
            <!-- 8-Directional Starlight-Gold Starburst Core on Chest -->
            <polygon points="100,90 105,108 123,113 105,118 100,136 95,118 77,113 95,108" fill="#FFF0B2" stroke="#C79A38" stroke-width="1.5"/>
            <circle cx="100" cy="113" r="6.5" fill="#FFFFFF"/>
          </g>
        </svg>
      `
    };
  }

  // CORRUPTED EBONY CHESS UNDEAD (ChatGPT Spec: Obsidian #15131C, Raised Planes #383342,
  // Baseline Emerald #39D98A/#126348, Specialist Crimson #A5253D, Elite Hellfire #FF742B)
  getEnemySVGDefinitions() {
    const defs = `
      <defs>
        <!-- Polished Obsidian (#15131C) with Readable Raised Planes (#383342) -->
        <linearGradient id="obsidianArmor" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stop-color="#524B61"/>
          <stop offset="32%" stop-color="#383342"/>
          <stop offset="72%" stop-color="#15131C"/>
          <stop offset="100%" stop-color="#09080D"/>
        </linearGradient>

        <!-- Weathered Bone / Skull -->
        <linearGradient id="boneSkull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#EAE4D7"/>
          <stop offset="55%" stop-color="#9E9689"/>
          <stop offset="100%" stop-color="#383342"/>
        </linearGradient>

        <!-- Baseline Corruption: Necrotic Emerald (#39D98A -> #126348) -->
        <linearGradient id="emeraldBlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#B8F7D4"/>
          <stop offset="45%" stop-color="#39D98A"/>
          <stop offset="100%" stop-color="#126348"/>
        </linearGradient>

        <!-- Specialist Corruption: Royal-Slayer Crimson (#A5253D) -->
        <linearGradient id="crimsonCorruption" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFD1D9"/>
          <stop offset="45%" stop-color="#E34B61"/>
          <stop offset="100%" stop-color="#A5253D"/>
        </linearGradient>

        <!-- Elite Corruption: Hellfire (#FF742B) -->
        <linearGradient id="hellfireCore" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF0B2"/>
          <stop offset="45%" stop-color="#FF742B"/>
          <stop offset="100%" stop-color="#8C2308"/>
        </linearGradient>

        <radialGradient id="emeraldAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#39D98A" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#126348" stop-opacity="0"/>
        </radialGradient>

        <filter id="monsterShadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#09080D" flood-opacity="0.88"/>
        </filter>
      </defs>
    `;

    const corruptedPedestal = cueColor => `
      <ellipse cx="105" cy="176" rx="54" ry="15" fill="#0D111B" stroke="${cueColor}" stroke-width="2.4"/>
      <ellipse cx="105" cy="171" rx="42" ry="10" fill="url(#obsidianArmor)" stroke="#383342" stroke-width="1.8"/>
    `;

    return {
      // 1. SHAMBLING PAWN-THRALL (Baseline Emerald Cue #39D98A): Fractured Black-Pawn Silhouette with Glowing Ribcage Cavities
      thrall: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${defs}
          <g filter="url(#monsterShadow)">
            ${corruptedPedestal('#39D98A')}
            <circle cx="105" cy="106" r="48" fill="url(#emeraldAura)"/>
            <!-- Corrupted Black-Pawn Tapered Obsidian Body -->
            <path d="M70,164 C72,118 82,92 88,76 L122,76 C128,92 138,118 140,164 Z" fill="url(#obsidianArmor)" stroke="#383342" stroke-width="3"/>
            <!-- Hard Fragmented Obsidian Specular Highlight -->
            <line x1="88" y1="80" x2="76" y2="156" stroke="#6E6782" stroke-width="2.5" stroke-linecap="round"/>
            <!-- Necrotic Emerald (#39D98A) Emission Inside Cracks & Ribcage Cavities -->
            <path d="M84,96 Q105,105 126,96 M86,114 Q105,123 124,114 M88,132 Q105,140 122,132" fill="none" stroke="#39D98A" stroke-width="4" stroke-linecap="round"/>
            <ellipse cx="105" cy="76" rx="24" ry="7" fill="url(#obsidianArmor)" stroke="#39D98A" stroke-width="1.8"/>
            <!-- Fractured Black-Pawn Sphere Head with Exposed Skull Jaw -->
            <circle cx="104" cy="50" r="24" fill="url(#obsidianArmor)" stroke="#383342" stroke-width="3"/>
            <path d="M96,26 L104,44 L116,32" fill="none" stroke="#39D98A" stroke-width="2.5"/>
            <polygon points="86,46 100,50 90,56" fill="#39D98A"/>
            <circle cx="92" cy="50" r="3.5" fill="#FFF0B2"/>
            <!-- Jagged Obsidian Cleaver with Emerald Crack -->
            <path d="M38,118 L76,94" stroke="#383342" stroke-width="6.5" stroke-linecap="round"/>
            <path d="M16,54 L50,68 L44,122 L18,108 L26,88 L14,78 Z" fill="url(#obsidianArmor)" stroke="#39D98A" stroke-width="2.2"/>
          </g>
        </svg>
      `,

      // 2. IRONCLAD BUCKLER (Baseline Emerald Shield-Bearer #39D98A): Fractured Black-Rook Tower with Obsidian Slab Shield
      buckler: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${defs}
          <g filter="url(#monsterShadow)">
            ${corruptedPedestal('#39D98A')}
            <!-- Fractured Black-Rook Obsidian Body -->
            <path d="M76,164 L82,74 L146,74 L152,164 Z" fill="url(#obsidianArmor)" stroke="#383342" stroke-width="3"/>
            <!-- Broken Rook Battlement Crown -->
            <path d="M78,74 L78,36 L94,36 L94,50 L108,50 L108,32 L124,38 L124,50 L136,50 L136,36 L150,36 L150,74 Z" fill="url(#obsidianArmor)" stroke="#6E6782" stroke-width="2.5"/>
            <rect x="88" y="54" width="38" height="6" rx="3" fill="#39D98A"/>
            <!-- Heavy Obsidian Rook-Slab Shield with Necrotic Emerald Fissures (Left Front) -->
            <path d="M22,34 L82,24 L82,162 L52,176 L22,162 Z" fill="url(#obsidianArmor)" stroke="#6E6782" stroke-width="3.5"/>
            <path d="M32,44 L72,36 L72,152 L52,164 L32,152 Z" fill="#15131C" stroke="#39D98A" stroke-width="2"/>
            <polygon points="52,68 66,98 52,128 38,98" fill="url(#emeraldBlight)" stroke="#FFFFFF" stroke-width="1.8"/>
          </g>
        </svg>
      `,

      // 3. PLAGUEVAULT STALKER (Specialist Crimson #A5253D): Corrupted Black-Knight with Exposed Skeletal Horse Muzzle
      sprinter: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${defs}
          <g filter="url(#monsterShadow)">
            ${corruptedPedestal('#A5253D')}
            <!-- Corrupted Black-Knight Arched Horse Silhouette in Polished Obsidian -->
            <path d="M64,164 C62,118 72,88 62,62 C56,42 74,22 98,20 L112,8 L118,24 C138,28 152,44 148,62 L126,74 L104,68 C108,92 126,114 132,164 Z" fill="url(#obsidianArmor)" stroke="#6E6782" stroke-width="3.2"/>
            <!-- Exposed Skeletal Horse Muzzle (ChatGPT Silhouette Spec) -->
            <path d="M96,24 L62,56 L84,68 L108,46 Z" fill="url(#boneSkull)" stroke="#15131C" stroke-width="2"/>
            <polygon points="78,42 94,46 84,54" fill="#E34B61"/>
            <circle cx="86" cy="46" r="3.5" fill="#FFF0B2"/>
            <!-- Crimson Corruption Fissures Along Neck & Vaulting Pole-Lance -->
            <path d="M98,74 L92,112 L106,148" fill="none" stroke="#E34B61" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="14" y1="146" x2="178" y2="22" stroke="url(#crimsonCorruption)" stroke-width="5.5" stroke-linecap="round"/>
            <polygon points="10,150 32,118 46,134" fill="url(#crimsonCorruption)" stroke="#FFD1D9" stroke-width="1.8"/>
          </g>
        </svg>
      `,

      // 4. SHADOW-KNIGHT ASSASSIN (Specialist Crimson #A5253D): Fractured-Crown Wraith with Twin Crimson Scythes
      assassin: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${defs}
          <g filter="url(#monsterShadow)">
            ${corruptedPedestal('#A5253D')}
            <!-- Obsidian Chess-Wraith Silhouette -->
            <path d="M68,162 C70,118 80,90 84,74 L126,74 C130,90 140,118 142,162 Z" fill="url(#obsidianArmor)" stroke="#6E6782" stroke-width="3"/>
            <!-- Broken Black-Queen/Knight Pointed Crown Hood -->
            <path d="M68,76 L82,34 L105,14 L128,34 L142,76 Q105,64 68,76 Z" fill="url(#obsidianArmor)" stroke="#E34B61" stroke-width="2.8"/>
            <polygon points="84,52 100,56 88,62" fill="#E34B61"/>
            <polygon points="126,52 110,56 122,62" fill="#E34B61"/>
            <!-- Twin Crimson Queen-Slayer Crescent Scythes (#A5253D) -->
            <path d="M14,114 C20,64 48,44 76,58 C52,68 38,88 38,118 Z" fill="url(#crimsonCorruption)" stroke="#FFD1D9" stroke-width="2"/>
            <path d="M196,114 C190,64 162,44 134,58 C158,68 172,88 172,118 Z" fill="url(#crimsonCorruption)" stroke="#FFD1D9" stroke-width="2"/>
            <polygon points="105,88 118,110 105,132 92,110" fill="url(#crimsonCorruption)" stroke="#FFD1D9" stroke-width="1.8"/>
          </g>
        </svg>
      `,

      // 5. NECRO-BISHOP ACOLYTE (Split Mitre + Emerald/Hellfire): Corrupted Black-Bishop with Split Mitre Cavity
      necro: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${defs}
          <g filter="url(#monsterShadow)">
            ${corruptedPedestal('#39D98A')}
            <!-- Obsidian Bishop Column Body -->
            <path d="M64,164 C68,112 80,86 105,78 C130,86 142,112 146,164 Z" fill="url(#obsidianArmor)" stroke="#6E6782" stroke-width="3"/>
            <path d="M92,82 L118,82 L124,162 L86,162 Z" fill="#15131C" stroke="#39D98A" stroke-width="2"/>
            <!-- Split Black-Bishop Mitre with Glowing Emerald Cavity (ChatGPT Silhouette Spec) -->
            <path d="M72,78 C66,44 82,20 98,10 L103,42 L112,10 C128,20 144,44 138,78 Z" fill="url(#obsidianArmor)" stroke="#39D98A" stroke-width="2.8"/>
            <polygon points="98,12 103,44 112,12 105,30" fill="#39D98A"/>
            <!-- Exposed Skull Visage -->
            <circle cx="105" cy="62" r="16" fill="url(#boneSkull)" stroke="#15131C" stroke-width="2.2"/>
            <circle cx="98" cy="60" r="4.5" fill="#39D98A"/>
            <circle cx="112" cy="60" r="4.5" fill="#39D98A"/>
            <!-- Cursed Diagonal Hex Crozier Staff -->
            <line x1="38" y1="166" x2="48" y2="38" stroke="#6E6782" stroke-width="5.5" stroke-linecap="round"/>
            <polygon points="48,18 62,34 48,50 34,34" fill="url(#emeraldBlight)" stroke="#FFFFFF" stroke-width="1.8"/>
          </g>
        </svg>
      `,

      // 6. CURSED BLIGHT-IMP: Fractured Black-Pawn Gargoyle with Crimson-Hellfire Wings
      imp: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          ${defs}
          <g filter="url(#monsterShadow)">
            ${corruptedPedestal('#FF742B')}
            <path d="M76,102 L26,66 L40,116 L76,122 Z" fill="url(#obsidianArmor)" stroke="#E34B61" stroke-width="2"/>
            <path d="M124,102 L174,66 L160,116 L124,122 Z" fill="url(#obsidianArmor)" stroke="#E34B61" stroke-width="2"/>
            <path d="M72,162 C76,122 82,98 86,86 L114,86 C118,98 124,122 128,162 Z" fill="url(#obsidianArmor)" stroke="#FF742B" stroke-width="2.5"/>
            <circle cx="100" cy="64" r="21" fill="url(#obsidianArmor)" stroke="#6E6782" stroke-width="2.5"/>
            <path d="M84,48 L64,22 L94,44 Z" fill="url(#hellfireCore)"/>
            <path d="M116,48 L136,22 L106,44 Z" fill="url(#hellfireCore)"/>
            <circle cx="91" cy="62" r="4.5" fill="#FFF0B2"/>
            <circle cx="109" cy="62" r="4.5" fill="#FFF0B2"/>
          </g>
        </svg>
      `,

      // 7. FALLEN ROOK GARGANTUA (BOSS — Elite Hellfire Cue #FF742B): Colossal Shattered-Rook Obsidian Titan
      gargantua: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220">
          ${defs}
          <g filter="url(#monsterShadow)">
            <ellipse cx="115" cy="192" rx="74" ry="19" fill="#0D111B" stroke="#FF742B" stroke-width="3.8"/>
            <!-- Colossal Shattered Obsidian Rook-Tower Body -->
            <path d="M52,184 L62,56 L168,56 L178,184 Z" fill="url(#obsidianArmor)" stroke="#FF742B" stroke-width="4"/>
            <line x1="64" y1="60" x2="56" y2="180" stroke="#6E6782" stroke-width="3" stroke-linecap="round"/>
            <!-- Fractured Rook Battlement Shoulders (ChatGPT Silhouette Spec) -->
            <path d="M32,82 L32,38 L46,38 L46,50 L60,50 L60,38 L74,38 L74,82 Z" fill="url(#obsidianArmor)" stroke="#FF742B" stroke-width="2.8"/>
            <path d="M156,82 L156,38 L170,38 L170,50 L184,50 L184,38 L198,38 L198,82 Z" fill="url(#obsidianArmor)" stroke="#FF742B" stroke-width="2.8"/>
            <!-- Crowned Skull Visage with Hellfire Horns -->
            <circle cx="115" cy="48" r="27" fill="url(#boneSkull)" stroke="#15131C" stroke-width="3"/>
            <path d="M92,28 L70,4 L104,22 M138,28 L160,4 L126,22" fill="url(#hellfireCore)"/>
            <circle cx="103" cy="46" r="6.5" fill="#FF742B"/>
            <circle cx="127" cy="46" r="6.5" fill="#FF742B"/>
            <!-- Hellfire (#FF742B) Emission Inside Cracked Obsidian Chest Cavity -->
            <polygon points="115,80 144,122 115,164 86,122" fill="url(#hellfireCore)" stroke="#FFF0B2" stroke-width="2.5"/>
            <polygon points="115,96 130,122 115,148 100,122" fill="#FFF0B2"/>
            <!-- Crushing Obsidian Rook-Monolith Hammer -->
            <line x1="34" y1="178" x2="34" y2="28" stroke="#383342" stroke-width="9" stroke-linecap="round"/>
            <rect x="6" y="16" width="54" height="74" rx="5" fill="url(#obsidianArmor)" stroke="#FF742B" stroke-width="3.2"/>
            <polygon points="33,34 45,53 33,72 21,53" fill="url(#hellfireCore)"/>
          </g>
        </svg>
      `,

      // 8. THE BLIGHT SOVEREIGN QUEEN (BOSS — Rank-Teleporting Astral Crimson/Emerald Lich-Queen)
      plague_queen: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220">
          ${defs}
          <g filter="url(#monsterShadow)">
            <ellipse cx="110" cy="192" rx="70" ry="18" fill="#0D111B" stroke="#E34B61" stroke-width="3.4"/>
            <circle cx="110" cy="84" r="64" fill="url(#emeraldAura)" opacity="0.65"/>
            <!-- Flowing Corrupted Obsidian Sovereign Robes -->
            <path d="M58,184 C68,128 80,96 86,78 L134,78 C140,96 152,128 162,184 Z" fill="url(#obsidianArmor)" stroke="#E34B61" stroke-width="3.5"/>
            <path d="M90,82 L130,82 L138,180 L82,180 Z" fill="#15131C" stroke="#39D98A" stroke-width="2.2"/>
            <!-- Fractured Multi-Spire Blight-Queen Coronet -->
            <path d="M62,78 L42,32 L74,56 L92,22 L110,50 L128,22 L146,56 L178,32 L158,78 Z" fill="url(#obsidianArmor)" stroke="#E34B61" stroke-width="3"/>
            <circle cx="42" cy="28" r="5" fill="#39D98A"/>
            <circle cx="92" cy="18" r="6" fill="#E34B61"/>
            <circle cx="110" cy="12" r="8" fill="#FFF0B2" stroke="#E34B61" stroke-width="2"/>
            <circle cx="128" cy="18" r="6" fill="#E34B61"/>
            <circle cx="178" cy="28" r="5" fill="#39D98A"/>
            <!-- Exposed Crowned Skull Visage -->
            <circle cx="110" cy="64" r="19" fill="url(#boneSkull)" stroke="#15131C" stroke-width="2.4"/>
            <polygon points="99,60 108,63 102,68" fill="#E34B61"/>
            <polygon points="121,60 112,63 118,68" fill="#E34B61"/>
            <!-- 8-Way Starburst Corruption Core on Chest -->
            <polygon points="110,96 118,120 142,128 118,136 110,160 102,136 78,128 102,120" fill="url(#crimsonCorruption)" stroke="#FFD1D9" stroke-width="2"/>
            <circle cx="110" cy="128" r="8" fill="#39D98A" stroke="#FFFFFF" stroke-width="1.6"/>
          </g>
        </svg>
      `
    };
  }
}

window.RoyalSprites = new RoyalSpriteAtlas();
