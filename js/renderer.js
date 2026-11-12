/**
 * CROWN & BLIGHT: THE ROYAL GAMBIT (Ultra-Visual & UX Edition)
 * High-DPI 60FPS Tactical Canvas Renderer:
 * - Winged Golden Rook Sentinels (Back-Rank Sweepers replacing Lawnmowers)
 * - Multi-layered Corrupted Ebony Chess Monsters with Afterimages, Runic Shields & Weapon Swings
 * - Ghost 3D Piece Placement Preview & Live Synergy Badges
 */

class RoyalBoardRenderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;

    this.cols = 10; // Columns A - J (10x5 Grandmaster Grid)
    this.rows = 5; // Ranks 5 - 1

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = 1120;
    this.height = 640;
    this.boardLeft = 118;
    this.boardTop = 54;
    this.tileSize = 92;
    this.chariotX = 58;

    // Procedural Ambient Golden Dust Motes & Arcane Embers
    this.ambientMotes = Array.from({ length: 34 }, (_, i) => ({
      xFrac: (i * 0.173) % 1,
      yFrac: (i * 0.291) % 1,
      speedY: 8 + (i % 5) * 4,
      driftX: 12 + (i % 4) * 5,
      size: 1.4 + (i % 3) * 0.9,
      phase: i * 1.3,
      isGold: i % 3 !== 0
    }));

    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement
      ? this.canvas.parentElement.getBoundingClientRect()
      : { width: window.innerWidth || 1120, height: window.innerHeight || 640 };

    const targetW = Math.max(320, Math.floor(rect.width || window.innerWidth || 1120));
    const targetH = Math.max(240, Math.floor(rect.height || window.innerHeight || 640));

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = targetW * this.dpr;
    this.canvas.height = targetH * this.dpr;
    this.width = targetW;
    this.height = targetH;

    // Dynamically measure floating Top HUD and Bottom Reliquary Dock so the 10x5 board never overlaps on any screen
    const topHud = document.querySelector('.floating-top-hud');
    const bottomDock = document.querySelector('.floating-bottom-altar');
    const topRect = topHud ? topHud.getBoundingClientRect() : null;
    const botRect = bottomDock ? bottomDock.getBoundingClientRect() : null;

    const safeTop = topRect && topRect.height > 0 ? Math.min(targetH * 0.28, topRect.bottom + 14) : Math.max(54, targetH * 0.14);
    const bottomReserved =
      botRect && botRect.height > 0
        ? Math.min(targetH * 0.30, targetH - botRect.top + 12)
        : Math.max(88, targetH * 0.17);
    const safeBottom = Math.max(safeTop + 140, targetH - bottomReserved);

    const availH = Math.max(130, safeBottom - safeTop);
    // Reserve ~1.15 tile widths horizontally for Left Winged Rook Sentinels + Right Spawn Portal
    const availW = Math.max(260, targetW * 0.92);

    this.tileSize = Math.max(
      26,
      Math.min(110, Math.floor(Math.min(availW / (this.cols + 1.15), availH / (this.rows + 0.35))))
    );

    const totalBoardW = this.tileSize * this.cols;
    const totalBoardH = this.tileSize * this.rows;

    // Shift board slightly right of true center to leave room on the left for the 5 Winged Golden Rook Sentinels
    const sentinelRoom = Math.floor(this.tileSize * 0.72);
    this.boardLeft = Math.max(
      sentinelRoom + 12,
      Math.floor((this.width - totalBoardW + sentinelRoom * 0.55) * 0.5)
    );
    this.boardTop = Math.floor(safeTop + (availH - totalBoardH) * 0.5);
    this.chariotX = this.boardLeft - Math.floor(this.tileSize * 0.62);

    if (this.game && Array.isArray(this.game.chariots)) {
      for (const c of this.game.chariots) {
        if (!c.active) c.x = this.chariotX;
      }
    }
  }

  screenToBoard(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * this.width;
    const y = ((clientY - rect.top) / rect.height) * this.height;

    const col = Math.floor((x - this.boardLeft) / this.tileSize);
    const row = Math.floor((y - this.boardTop) / this.tileSize);
    const valid = col >= 0 && col < this.cols && row >= 0 && row < this.rows;

    return { x, y, col, row, valid };
  }

  tileCenter(col, row) {
    return {
      x: this.boardLeft + (col + 0.5) * this.tileSize,
      y: this.boardTop + (row + 0.5) * this.tileSize
    };
  }

  algebraicLabel(col, row) {
    const file = String.fromCharCode(97 + col);
    const rank = 5 - row;
    return `${file}${rank}`;
  }

  render(timeSeconds) {
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    if (this.game.screenShake > 0.01) {
      const mag = this.game.screenShake * 9;
      ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }

    this.drawBackdrop(ctx, timeSeconds);
    this.drawBoard(ctx, timeSeconds);
    this.drawFloorDecals(ctx);
    this.drawSynergyLinks(ctx, timeSeconds);
    this.drawTacticalOverlays(ctx, timeSeconds);
    this.drawTelegraphZones(ctx, timeSeconds);
    this.drawRoyalSentinels(ctx, timeSeconds);

    // Draw Pieces & Undead sorted by row for 2.5D depth
    for (let r = 0; r < this.rows; r++) {
      for (const piece of this.game.pieces) {
        if (piece.row === r) {
          this.drawChessPiece(ctx, piece, timeSeconds);
        }
      }
      for (const enemy of this.game.enemies) {
        if (Math.round(enemy.row) === r) {
          this.drawUndeadEnemy(ctx, enemy, timeSeconds);
        }
      }
    }

    this.drawShockwaves(ctx);
    this.drawProjectilesAndBeams(ctx, timeSeconds);
    this.drawParticles(ctx, timeSeconds);
    this.drawAmbientEmbers(ctx, timeSeconds);
    this.drawManaOrbs(ctx, timeSeconds);
    this.drawFloatingTexts(ctx, timeSeconds);
    this.drawDragPreview(ctx);
    this.drawMergeCinematic(ctx, timeSeconds);

    ctx.restore();
  }

  drawBackdrop(ctx, t) {
    const act = this.game.currentAct;
    const theme = act.boardTheme;
    const bgImg = window.RoyalSprites && window.RoyalSprites.bgImage;

    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      const imgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
      const canvasAspect = this.width / this.height;
      let drawW = this.width;
      let drawH = this.height;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasAspect > imgAspect) {
        drawH = this.width / imgAspect;
        offsetY = (this.height - drawH) * 0.5;
      } else {
        drawW = this.height * imgAspect;
        offsetX = (this.width - drawW) * 0.5;
      }

      ctx.drawImage(bgImg, offsetX, offsetY, drawW, drawH);

      const vig = ctx.createRadialGradient(
        this.width * 0.5,
        this.height * 0.5,
        this.tileSize * 2.8,
        this.width * 0.5,
        this.height * 0.5,
        this.width * 0.74
      );
      vig.addColorStop(0, 'rgba(6, 9, 18, 0.14)');
      vig.addColorStop(1, 'rgba(4, 6, 12, 0.68)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, this.width, this.height);
    } else {
      const bgGrad = ctx.createRadialGradient(
        this.width * 0.5,
        this.height * 0.45,
        60,
        this.width * 0.5,
        this.height * 0.5,
        this.width * 0.75
      );
      bgGrad.addColorStop(0, '#14192b');
      bgGrad.addColorStop(0.6, '#0b0e18');
      bgGrad.addColorStop(1, '#06080f');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // Volumetric Cathedral God-Rays slanting across the Sanctum
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const rayX = this.boardLeft + i * this.tileSize * 3.1 + Math.sin(t * 0.4 + i) * 18;
      const rayGrad = ctx.createLinearGradient(rayX - 80, 0, rayX + 180, this.height * 0.85);
      rayGrad.addColorStop(0, 'rgba(254, 240, 138, 0.055)');
      rayGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.025)');
      rayGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(rayX - 60, 0);
      ctx.lineTo(rayX + 70, 0);
      ctx.lineTo(rayX + 260, this.height);
      ctx.lineTo(rayX + 90, this.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Sanctum Light & Graveyard Blight Ambient Pulses
    const leftGlow = ctx.createRadialGradient(
      this.boardLeft - 45,
      this.height * 0.5,
      10,
      this.boardLeft - 45,
      this.height * 0.5,
      this.tileSize * 2.8
    );
    leftGlow.addColorStop(0, `rgba(250, 204, 21, ${0.16 + Math.sin(t * 2) * 0.04})`);
    leftGlow.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = leftGlow;
    ctx.fillRect(0, 0, this.width * 0.4, this.height);

    const rightGlow = ctx.createRadialGradient(
      this.boardLeft + this.cols * this.tileSize + 45,
      this.height * 0.5,
      10,
      this.boardLeft + this.cols * this.tileSize + 45,
      this.height * 0.5,
      this.tileSize * 2.8
    );
    rightGlow.addColorStop(0, `rgba(16, 185, 129, ${0.18 + Math.cos(t * 2.2) * 0.05})`);
    rightGlow.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = rightGlow;
    ctx.fillRect(this.width * 0.55, 0, this.width * 0.45, this.height);

    ctx.fillStyle = theme.ambientGlow || 'rgba(56, 189, 248, 0.08)';
    ctx.beginPath();
    ctx.arc(this.width * 0.5, this.height * 0.5, this.tileSize * 4.2, 0, Math.PI * 2);
    ctx.fill();

    // Per-Act Atmospheric Biome Color Grading Wash (Acts I - V)
    const actId = (act && act.id) || 1;
    const biomeGrades = {
      1: ['rgba(250, 204, 21, 0.055)', 'rgba(15, 23, 42, 0.06)'],
      2: ['rgba(168, 85, 247, 0.075)', 'rgba(20, 184, 166, 0.065)'],
      3: ['rgba(56, 189, 248, 0.085)', 'rgba(30, 41, 59, 0.14)'],
      4: ['rgba(244, 63, 94, 0.095)', 'rgba(88, 28, 135, 0.085)'],
      5: ['rgba(99, 102, 241, 0.11)', 'rgba(16, 185, 129, 0.08)']
    };
    const grade = biomeGrades[actId] || biomeGrades[1];
    const gradeGrad = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradeGrad.addColorStop(0, grade[0]);
    gradeGrad.addColorStop(1, grade[1]);
    ctx.fillStyle = gradeGrad;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  drawFloorDecals(ctx) {
    const decals = this.game.floorDecals;
    if (!decals || decals.length === 0) return;
    ctx.save();
    for (const d of decals) {
      const alpha = Math.max(0, Math.min(1, d.life / d.maxLife)) * 0.72;
      const pt = this.tileCenter(d.col, d.row);
      ctx.save();
      ctx.translate(pt.x, pt.y + this.tileSize * 0.12);
      ctx.globalAlpha = alpha;
      if (d.kind === 'gold') {
        ctx.strokeStyle = '#facc15';
        ctx.fillStyle = 'rgba(250, 204, 21, 0.14)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.tileSize * 0.36, this.tileSize * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (d.kind === 'frost') {
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.tileSize * 0.33, this.tileSize * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        const scorchGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, this.tileSize * 0.36);
        scorchGrad.addColorStop(0, 'rgba(15, 23, 42, 0.78)');
        scorchGrad.addColorStop(0.6, 'rgba(244, 63, 94, 0.18)');
        scorchGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = scorchGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.tileSize * 0.36, this.tileSize * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  drawTelegraphZones(ctx, t) {
    const zones = this.game.telegraphZones;
    const isEn = this.game.lang === 'en';
    if (zones && zones.length > 0) {
      ctx.save();
      for (const z of zones) {
        if (z.col < 0 || z.col >= this.cols || z.row < 0 || z.row >= this.rows) continue;
        const x = this.boardLeft + z.col * this.tileSize;
        const y = this.boardTop + z.row * this.tileSize;
        const prog = 1 - Math.max(0, z.timer / (z.duration || 1.1));
        const pulse = 0.45 + Math.abs(Math.sin(t * 11)) * 0.45;

        ctx.fillStyle = `rgba(244, 63, 94, ${0.14 + prog * 0.22})`;
        ctx.fillRect(x + 3, y + 3, this.tileSize - 6, this.tileSize - 6);

        ctx.strokeStyle = `rgba(251, 113, 133, ${pulse})`;
        ctx.lineWidth = 2.4;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
        ctx.setLineDash([]);

        ctx.font = '800 9.5px "Orbitron", "Cairo", sans-serif';
        ctx.fillStyle = '#fecdd3';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.95)';
        ctx.shadowBlur = 4;
        const warnTxt = z.label || (isEn ? '⚠ CHECK!' : '⚠ كش!');
        ctx.fillText(warnTxt, x + this.tileSize * 0.5, y + 15);
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    }

    // Keyboard / Gamepad Tactical Grid Cursor
    if (this.game.cursorActive && this.game.cursorCell) {
      const { col, row } = this.game.cursorCell;
      if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
        const x = this.boardLeft + col * this.tileSize;
        const y = this.boardTop + row * this.tileSize;
        const s = this.tileSize;
        const br = Math.max(10, s * 0.22);
        const pad = 3 + Math.sin(t * 7) * 1.5;

        ctx.save();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        // Top-left
        ctx.moveTo(x + pad, y + pad + br);
        ctx.lineTo(x + pad, y + pad);
        ctx.lineTo(x + pad + br, y + pad);
        // Top-right
        ctx.moveTo(x + s - pad - br, y + pad);
        ctx.lineTo(x + s - pad, y + pad);
        ctx.lineTo(x + s - pad, y + pad + br);
        // Bottom-left
        ctx.moveTo(x + pad, y + s - pad - br);
        ctx.lineTo(x + pad, y + s - pad);
        ctx.lineTo(x + pad + br, y + s - pad);
        // Bottom-right
        ctx.moveTo(x + s - pad - br, y + s - pad);
        ctx.lineTo(x + s - pad, y + s - pad);
        ctx.lineTo(x + s - pad, y + s - pad - br);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  drawAmbientEmbers(ctx, t) {
    const actId = (this.game.currentAct && this.game.currentAct.id) || 1;
    ctx.save();

    // Act II: Twilight Aurora Beams | Act III: Storm Lightning Flash
    if (actId === 2) {
      const aurGrad = ctx.createLinearGradient(0, 0, this.width, this.height * 0.45);
      aurGrad.addColorStop(0, 'rgba(45, 212, 191, 0.045)');
      aurGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.045)');
      aurGrad.addColorStop(1, 'rgba(45, 212, 191, 0)');
      ctx.fillStyle = aurGrad;
      ctx.fillRect(0, 0, this.width, this.height * 0.5);
    } else if (actId === 3) {
      const flashGate = Math.sin(t * 0.9) * Math.sin(t * 7.3);
      if (flashGate > 0.96) {
        ctx.fillStyle = `rgba(186, 230, 253, ${(flashGate - 0.96) * 2.4})`;
        ctx.fillRect(0, 0, this.width, this.height);
      }
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
      ctx.lineWidth = 1.1;
      for (let i = 0; i < 26; i++) {
        const rx = ((i * 197 + t * 240) % (this.width + 120)) - 60;
        const ry = ((i * 131 + t * 520) % (this.height + 80)) - 40;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 9, ry + 26);
        ctx.stroke();
      }
    }

    for (const m of this.ambientMotes) {
      const y = (m.yFrac * this.height - ((t * m.speedY) % this.height) + this.height) % this.height;
      const x =
        (m.xFrac * this.width + Math.sin(t * 0.9 + m.phase) * m.driftX + this.width) % this.width;
      const alpha = 0.25 + 0.25 * Math.sin(t * 2.4 + m.phase);
      ctx.globalAlpha = alpha;
      let col = m.isGold ? '#fef08a' : '#38bdf8';
      if (actId === 2) col = m.isGold ? '#e9d5ff' : '#2dd4bf';
      else if (actId === 3) col = m.isGold ? '#fde68a' : '#94a3b8';
      else if (actId === 4) col = m.isGold ? '#fb923c' : '#f43f5e';
      else if (actId === 5) col = m.isGold ? '#38bdf8' : '#c084fc';
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(x, y, m.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawBoard(ctx, t) {
    const act = this.game.currentAct;
    const theme = act.boardTheme;
    const boardW = this.cols * this.tileSize;
    const boardH = this.rows * this.tileSize;

    // 1. Deep 3D Carved Cathedral Stone Sanctuary Plinth (#242733 -> #0D111B) + 3D Stepped Front Lip
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.92)';
    ctx.shadowBlur = 46;
    ctx.shadowOffsetY = 18;

    const outerPad = 15;
    // 3D Front Elevation Thickness Lip below Rank 1
    const frontLipH = 14;
    const lipGrad = ctx.createLinearGradient(0, this.boardTop + boardH, 0, this.boardTop + boardH + outerPad + frontLipH);
    lipGrad.addColorStop(0, '#242733');
    lipGrad.addColorStop(0.5, '#15131C');
    lipGrad.addColorStop(1, '#09080D');
    ctx.fillStyle = lipGrad;
    this.roundRect(
      ctx,
      this.boardLeft - outerPad,
      this.boardTop - outerPad + frontLipH,
      boardW + outerPad * 2,
      boardH + outerPad * 2,
      14
    );
    ctx.fill();

    const plinthGrad = ctx.createLinearGradient(
      this.boardLeft,
      this.boardTop - outerPad,
      this.boardLeft,
      this.boardTop + boardH + outerPad
    );
    plinthGrad.addColorStop(0, '#2E3242');
    plinthGrad.addColorStop(0.5, '#242733');
    plinthGrad.addColorStop(1, '#141722');
    ctx.fillStyle = plinthGrad;
    this.roundRect(
      ctx,
      this.boardLeft - outerPad,
      this.boardTop - outerPad,
      boardW + outerPad * 2,
      boardH + outerPad * 2,
      14
    );
    ctx.fill();
    ctx.restore();

    // 2. Ornate Double Sacred-Inlay Frame Border (#B58E48 & #FFF0B2 Specular)
    ctx.save();
    ctx.strokeStyle = '#B58E48';
    ctx.lineWidth = 2.8;
    this.roundRect(
      ctx,
      this.boardLeft - 11,
      this.boardTop - 11,
      boardW + 22,
      boardH + 22,
      11
    );
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 240, 178, 0.42)';
    ctx.lineWidth = 1.2;
    this.roundRect(
      ctx,
      this.boardLeft - 5,
      this.boardTop - 5,
      boardW + 10,
      boardH + 10,
      6
    );
    ctx.stroke();
    ctx.restore();

    // 3. Left Back-Rank Sentinel Sanctum Pedestal Lane
    const sentinelLaneLeft = this.chariotX - this.tileSize * 0.38;
    const sentinelLaneW = this.boardLeft - sentinelLaneLeft - 13;
    const laneGrad = ctx.createLinearGradient(sentinelLaneLeft, 0, this.boardLeft - 13, 0);
    laneGrad.addColorStop(0, 'rgba(250, 204, 21, 0.25)');
    laneGrad.addColorStop(1, 'rgba(15, 23, 42, 0.88)');
    ctx.fillStyle = laneGrad;
    this.roundRect(ctx, sentinelLaneLeft, this.boardTop - 6, sentinelLaneW, boardH + 12, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.62)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // 4. Draw 10x5 Veined Marble & Obsidian Chess Squares
    const lightTile = window.RoyalSprites && window.RoyalSprites.tileTextures.light;
    const darkTile = window.RoyalSprites && window.RoyalSprites.tileTextures.dark;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.boardLeft + c * this.tileSize;
        const y = this.boardTop + r * this.tileSize;
        const isLight = (r + c) % 2 === 0;

        ctx.save();
        ctx.globalAlpha = 0.92;
        if (isLight && lightTile) {
          ctx.drawImage(lightTile, x, y, this.tileSize, this.tileSize);
        } else if (!isLight && darkTile) {
          ctx.drawImage(darkTile, x, y, this.tileSize, this.tileSize);
        } else {
          ctx.fillStyle = isLight ? theme.lightSquare : theme.darkSquare;
          ctx.fillRect(x, y, this.tileSize, this.tileSize);
        }
        ctx.restore();

        // Spawn danger corner brackets (#E34B61) + Live Incoming Wave Telegraph on Column J (col 9)
        if (c === this.cols - 1) {
          const teleCount =
            typeof this.game.getIncomingLaneCount === 'function'
              ? this.game.getIncomingLaneCount(r)
              : 0;
          const pulse = teleCount > 0 ? 0.68 + 0.3 * Math.sin(t * 6.5 + r) : 0.4 + 0.2 * Math.sin(t * 2.8 + r);
          ctx.strokeStyle = teleCount > 0 ? `rgba(244, 63, 94, ${pulse})` : `rgba(227, 75, 97, ${pulse})`;
          ctx.lineWidth = teleCount > 0 ? 2.6 : 2;
          const b = 6;
          const l = 12;
          ctx.beginPath();
          ctx.moveTo(x + b, y + b + l);
          ctx.lineTo(x + b, y + b);
          ctx.lineTo(x + b + l, y + b);
          ctx.moveTo(x + this.tileSize - b - l, y + b);
          ctx.lineTo(x + this.tileSize - b, y + b);
          ctx.lineTo(x + this.tileSize - b, y + b + l);
          ctx.moveTo(x + b, y + this.tileSize - b - l);
          ctx.lineTo(x + b, y + this.tileSize - b);
          ctx.lineTo(x + b + l, y + this.tileSize - b);
          ctx.moveTo(x + this.tileSize - b - l, y + this.tileSize - b);
          ctx.lineTo(x + this.tileSize - b, y + this.tileSize - b);
          ctx.lineTo(x + this.tileSize - b, y + this.tileSize - b - l);
          ctx.stroke();

          if (teleCount > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(225, 29, 72, 0.86)';
            this.roundRect(ctx, x + this.tileSize - 24, y + 6, 18, 15, 4);
            ctx.fill();
            ctx.font = '800 9px "JetBrains Mono", monospace';
            ctx.fillStyle = '#fff1f2';
            ctx.textAlign = 'center';
            ctx.fillText(`!${Math.min(9, teleCount)}`, x + this.tileSize - 15, y + 16.5);
            ctx.restore();
          }
        }

        // Algebraic Coordinate watermark (a1..j5)
        if (this.game.showGridOverlay !== false) {
          const coord = this.algebraicLabel(c, r);
          ctx.font = '700 9.5px "JetBrains Mono", monospace';
          ctx.fillStyle = isLight ? 'rgba(242, 232, 206, 0.55)' : 'rgba(184, 180, 175, 0.36)';
          ctx.textAlign = 'left';
          ctx.fillText(coord, x + 5, y + this.tileSize - 5);
        }
      }
    }

    // 5. 4 Animated Corner Royal Flame Braziers on the Board Frame
    const corners = [
      [this.boardLeft - 9, this.boardTop - 9],
      [this.boardLeft + boardW + 9, this.boardTop - 9],
      [this.boardLeft - 9, this.boardTop + boardH + 9],
      [this.boardLeft + boardW + 9, this.boardTop + boardH + 9]
    ];
    for (let i = 0; i < corners.length; i++) {
      const [bx, by] = corners[i];
      const flicker = 1 + Math.sin(t * 8 + i * 1.7) * 0.16;
      ctx.save();
      const brazierGlow = ctx.createRadialGradient(bx, by, 2, bx, by, 18 * flicker);
      brazierGlow.addColorStop(0, '#ffffff');
      brazierGlow.addColorStop(0.35, '#facc15');
      brazierGlow.addColorStop(0.7, 'rgba(245, 158, 11, 0.4)');
      brazierGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = brazierGlow;
      ctx.beginPath();
      ctx.arc(bx, by, 18 * flicker, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bx, by, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 6. Clean Royal Diamond Medallion Column Headers (A - J, without the word "FILE")
    ctx.save();
    for (let c = 0; c < this.cols; c++) {
      const colChar = String.fromCharCode(65 + c);
      const cx = this.boardLeft + (c + 0.5) * this.tileSize;
      const cy = this.boardTop - 20;

      // Subtle diamond crest behind letter
      ctx.fillStyle = 'rgba(12, 18, 34, 0.88)';
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx + 11, cy);
      ctx.lineTo(cx, cy + 10);
      ctx.lineTo(cx - 11, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.font = '800 10.5px "Orbitron", sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText(colChar, cx, cy + 3.8);
    }

    // 7. Rank Headers (5 - 1) on the Left Sanctum Margin
    for (let r = 0; r < this.rows; r++) {
      const rankNum = 5 - r;
      const rx = sentinelLaneLeft - 15;
      const ry = this.boardTop + (r + 0.5) * this.tileSize;

      ctx.fillStyle = 'rgba(12, 18, 34, 0.88)';
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(rx, ry, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '800 10.5px "Orbitron", sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText(`${rankNum}`, rx, ry + 3.8);
    }
    ctx.restore();
  }

  drawSynergyLinks(ctx, t) {
    // 1. Royal Battery Golden Links
    if (this.game.batteryLinks && this.game.batteryLinks.length > 0) {
      ctx.save();
      for (const link of this.game.batteryLinks) {
        const p1 = this.tileCenter(link.a.col, link.a.row);
        const p2 = this.tileCenter(link.b.col, link.b.row);
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -t * 28;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Diagonal Pawn Chain Links
    if (this.game.pawnChainLinks && this.game.pawnChainLinks.length > 0) {
      ctx.save();
      for (const link of this.game.pawnChainLinks) {
        const p1 = this.tileCenter(link.a.col, link.a.row);
        const p2 = this.tileCenter(link.b.col, link.b.row);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Ready 5-Pawn Line Convergence Beam (سطر جنود جاهز للدمج إلى وزير!)
    if (this.game.readyPawnLines && this.game.readyPawnLines.length > 0) {
      ctx.save();
      for (const line of this.game.readyPawnLines) {
        const first = this.tileCenter(line.pawns[0].col, line.pawns[0].row);
        const last = this.tileCenter(
          line.pawns[line.pawns.length - 1].col,
          line.pawns[line.pawns.length - 1].row
        );

        // Glowing golden convergence conduit connecting all 5 Pawns in the line
        ctx.strokeStyle = `rgba(250, 204, 21, ${0.75 + Math.sin(t * 7) * 0.22})`;
        ctx.lineWidth = 7;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        ctx.lineTo(last.x, last.y);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        ctx.lineTo(last.x, last.y);
        ctx.stroke();

        // Floating Golden Merge Banner above the center Pawn of the line
        const midPawn = line.pawns[Math.floor(line.pawns.length / 2)];
        const midPt = this.tileCenter(midPawn.col, midPawn.row);
        const bobY = midPt.y - this.tileSize * 0.56 + Math.sin(t * 6) * 3.5;

        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(120, 53, 15, 0.95)';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        this.roundRect(ctx, midPt.x - 76, bobY - 13, 152, 22, 11);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.font = '800 10.5px "Cairo", "Orbitron", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        const mergeBannerTxt = this.game.lang === 'en' ? '♛ CLICK OR [M] TO FUSE QUEEN' : '♛ اضغط لدمج السطر ← وزير [M]';
        ctx.fillText(mergeBannerTxt, midPt.x, bobY + 2);
      }
      ctx.restore();
    }
  }

  drawTacticalOverlays(ctx, t) {
    const hover = this.game.hoverCell;
    const selectedBoardPiece = this.game.selectedBoardPiece;
    const selectedDeckId = this.game.selectedDeckPieceId;

    if (selectedBoardPiece) {
      this.highlightAttackSquares(
        ctx,
        selectedBoardPiece.type,
        selectedBoardPiece.col,
        selectedBoardPiece.row,
        t,
        0.24
      );

      const sx = this.boardLeft + selectedBoardPiece.col * this.tileSize;
      const sy = this.boardTop + selectedBoardPiece.row * this.tileSize;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.strokeRect(sx + 2, sy + 2, this.tileSize - 4, this.tileSize - 4);

      const legalMoves = this.game.getLegalMovesForPiece(selectedBoardPiece);
      for (const move of legalMoves) {
        const mx = this.boardLeft + move.col * this.tileSize;
        const my = this.boardTop + move.row * this.tileSize;
        const isCastle = move.isCastle;

        ctx.fillStyle = isCastle
          ? 'rgba(250, 204, 21, 0.34)'
          : 'rgba(16, 185, 129, 0.28)';
        ctx.fillRect(mx + 2, my + 2, this.tileSize - 4, this.tileSize - 4);

        ctx.strokeStyle = isCastle ? '#facc15' : '#10b981';
        ctx.lineWidth = 2.2;
        ctx.strokeRect(mx + 3, my + 3, this.tileSize - 6, this.tileSize - 6);

        const center = this.tileCenter(move.col, move.row);
        ctx.beginPath();
        ctx.arc(center.x, center.y, 11 + Math.sin(t * 6) * 2, 0, Math.PI * 2);
        ctx.fillStyle = isCastle ? '#facc15' : '#34d399';
        ctx.fill();

        if (isCastle) {
          ctx.font = '800 10px "Orbitron", sans-serif';
          ctx.fillStyle = '#fef08a';
          ctx.textAlign = 'center';
          ctx.fillText('CASTLE', center.x, center.y - 16);
        }
      }
    }

    if (hover && hover.valid) {
      const hx = this.boardLeft + hover.col * this.tileSize;
      const hy = this.boardTop + hover.row * this.tileSize;

      if (this.game.shovelMode) {
        ctx.fillStyle = 'rgba(227, 75, 97, 0.28)';
        ctx.fillRect(hx + 2, hy + 2, this.tileSize - 4, this.tileSize - 4);
        ctx.strokeStyle = '#E34B61';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(hx + 3, hy + 3, this.tileSize - 6, this.tileSize - 6);
      } else if (selectedDeckId && !selectedBoardPiece) {
        // Restrained Gold Edge along selected lane (ChatGPT Readability Spec)
        const laneY = this.boardTop + hover.row * this.tileSize;
        ctx.strokeStyle = 'rgba(181, 142, 72, 0.42)';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(this.boardLeft + 1, laneY + 1, this.cols * this.tileSize - 2, this.tileSize - 2);

        const occupied = this.game.getPieceAt(hover.col, hover.row);
        ctx.fillStyle = occupied ? 'rgba(227, 75, 97, 0.22)' : 'rgba(205, 238, 255, 0.16)';
        ctx.fillRect(hx + 3, hy + 3, this.tileSize - 6, this.tileSize - 6);
        ctx.strokeStyle = occupied ? '#E34B61' : '#CDEEFF';
        ctx.lineWidth = 2.4;
        ctx.strokeRect(hx + 4, hy + 4, this.tileSize - 8, this.tileSize - 8);

        if (!occupied) {
          this.highlightAttackSquares(ctx, selectedDeckId, hover.col, hover.row, t, 0.28);

          // Ghost 3D Piece Sprite Preview on the hovered square!
          const ghostSprite =
            window.RoyalSprites && window.RoyalSprites.pieceSprites[selectedDeckId];
          if (ghostSprite && ghostSprite.complete && ghostSprite.naturalWidth > 0) {
            const center = this.tileCenter(hover.col, hover.row);
            const sz = this.tileSize * 0.88;
            ctx.save();
            ctx.globalAlpha = 0.58;
            ctx.drawImage(ghostSprite, center.x - sz / 2, center.y - sz / 2 - 4, sz, sz);
            ctx.restore();
          }
        }
      } else if (!selectedBoardPiece) {
        const hoveredPiece = this.game.getPieceAt(hover.col, hover.row);
        if (hoveredPiece) {
          this.highlightAttackSquares(ctx, hoveredPiece.type, hoveredPiece.col, hoveredPiece.row, t, 0.18);
        }
      }
    }
  }

  highlightAttackSquares(ctx, pieceType, col, row, t, alpha = 0.24) {
    const squares = this.game.getAttackVisionSquares(pieceType, col, row);
    const pieceDef = window.CHESS_DATA.PIECES[pieceType];
    const color = pieceDef ? pieceDef.accentColor : '#38bdf8';

    ctx.save();
    for (const sq of squares) {
      const x = this.boardLeft + sq.col * this.tileSize;
      const y = this.boardTop + sq.row * this.tileSize;

      ctx.fillStyle = sq.isCrit
        ? `rgba(250, 204, 21, ${alpha + 0.08})`
        : `rgba(56, 189, 248, ${alpha})`;
      ctx.fillRect(x + 3, y + 3, this.tileSize - 6, this.tileSize - 6);

      ctx.strokeStyle = color;
      ctx.globalAlpha = Math.min(1, alpha * 2.4);
      ctx.lineWidth = 1.6;
      ctx.strokeRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
    }
    ctx.restore();
  }

  // Draw the 5 Imperial Winged Golden Rook Sentinels (Celestial Back-Rank Chess Automatons)
  drawRoyalSentinels(ctx, t) {
    const sentinelImg = window.RoyalSprites && window.RoyalSprites.sentinelSprite;

    for (const sentinel of this.game.chariots) {
      const cy = this.boardTop + (sentinel.row + 0.5) * this.tileSize;

      // 1. Rotating Celestial Astrolabe Sanctum Seal on the Left Balcony Floor
      ctx.save();
      ctx.translate(this.chariotX, cy + 12);
      ctx.scale(1, 0.42);
      ctx.rotate(t * (sentinel.used ? 0.2 : 0.9) + sentinel.row);

      ctx.strokeStyle = sentinel.used
        ? 'rgba(148, 163, 184, 0.22)'
        : 'rgba(250, 204, 21, 0.72)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, this.tileSize * 0.36, 0, Math.PI * 2);
      ctx.stroke();

      if (!sentinel.used) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, this.tileSize * 0.26, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      if (sentinel.used && !sentinel.active) {
        // ChatGPT Visual Audit #5: Broken-Shield Marker & Localized Crimson Lane Wash on Threatened Ranks
        const laneThreatened = this.game.enemies.some(
          e => Math.round(e.row) === sentinel.row && e.colPos <= 3.5
        );
        const pulse = laneThreatened ? 0.55 + Math.sin(t * 7.5) * 0.35 : 0.32;

        if (laneThreatened) {
          ctx.save();
          const dangerGrad = ctx.createLinearGradient(
            this.boardLeft,
            cy,
            this.boardLeft + this.tileSize * 3.8,
            cy
          );
          dangerGrad.addColorStop(0, `rgba(225, 29, 72, ${0.28 * pulse})`);
          dangerGrad.addColorStop(0.6, `rgba(225, 29, 72, ${0.12 * pulse})`);
          dangerGrad.addColorStop(1, 'rgba(225, 29, 72, 0)');
          ctx.fillStyle = dangerGrad;
          ctx.fillRect(
            this.boardLeft,
            this.boardTop + sentinel.row * this.tileSize + 2,
            this.tileSize * 3.8,
            this.tileSize - 4
          );
          ctx.restore();
        }

        // Broken Sentinel Shield Emblem at the Left Balcony
        ctx.save();
        ctx.translate(this.chariotX, cy);
        ctx.fillStyle = laneThreatened ? `rgba(225, 29, 72, ${0.32 + pulse * 0.25})` : 'rgba(30, 41, 59, 0.65)';
        ctx.strokeStyle = laneThreatened ? '#fb7185' : 'rgba(244, 63, 94, 0.45)';
        ctx.lineWidth = laneThreatened ? 2.0 : 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, this.tileSize * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = laneThreatened ? '#ffe4e6' : '#fda4af';
        ctx.font = `900 ${Math.round(this.tileSize * 0.22)}px "Cinzel", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', 0, 1);
        ctx.restore();
        continue;
      }

      const cx = sentinel.active ? sentinel.x : this.chariotX;
      const hoverBob = sentinel.active ? 0 : Math.sin(t * 3.4 + sentinel.row * 1.1) * 4;
      const wingBreath = sentinel.active ? 1.18 : 1 + Math.sin(t * 3.4 + sentinel.row) * 0.06;

      // 2. When actively sweeping the Rank like a Chess Rook, draw a Blazing Golden Orthogonal Spear Wake!
      if (sentinel.active) {
        ctx.save();
        const wakeGrad = ctx.createLinearGradient(this.boardLeft, cy, cx + 24, cy);
        wakeGrad.addColorStop(0, 'rgba(250, 204, 21, 0)');
        wakeGrad.addColorStop(0.45, 'rgba(245, 158, 11, 0.35)');
        wakeGrad.addColorStop(1, 'rgba(254, 249, 195, 0.92)');
        ctx.fillStyle = wakeGrad;
        ctx.fillRect(
          this.boardLeft,
          cy - this.tileSize * 0.36,
          Math.max(0, cx - this.boardLeft),
          this.tileSize * 0.72
        );

        // Forward Golden Rook Spearhead
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(cx + 12, cy - 22);
        ctx.lineTo(cx + 52, cy);
        ctx.lineTo(cx + 12, cy + 22);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.translate(cx, cy + hoverBob);

      // 3. Ambient Golden Halo Aura Behind Winged Rook
      const auraGrad = ctx.createRadialGradient(0, -4, 4, 0, -4, this.tileSize * 0.48);
      auraGrad.addColorStop(0, 'rgba(254, 240, 138, 0.42)');
      auraGrad.addColorStop(0.55, 'rgba(245, 158, 11, 0.16)');
      auraGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, -4, this.tileSize * 0.48, 0, Math.PI * 2);
      ctx.fill();

      // 4. Render Multi-Layered Imperial Winged Golden Rook Sprite with Wing-Breathing Scale
      const sz = this.tileSize * (sentinel.active ? 1.12 : 0.94);
      if (sentinelImg && sentinelImg.complete && sentinelImg.naturalWidth > 0) {
        ctx.save();
        ctx.scale(wingBreath, 1);
        ctx.drawImage(sentinelImg, -sz / 2, -sz / 2 - 6, sz, sz);
        ctx.restore();
      }

      ctx.restore();
    }
  }

  drawChessPiece(ctx, piece, t) {
    if (piece.inMergeCinematic) return;
    const center = this.tileCenter(piece.col, piece.row);

    let drawX = center.x;
    let drawY = center.y;
    let jumpLift = 0;
    let scaleX = 1;
    let scaleY = 1;
    if (piece.moveAnimTimer > 0) {
      const prog = 1 - piece.moveAnimTimer / piece.moveAnimDuration;
      const ease = 1 - Math.pow(1 - prog, 3);
      drawX = piece.moveFromX + (center.x - piece.moveFromX) * ease;
      drawY = piece.moveFromY + (center.y - piece.moveFromY) * ease;
      const arcPeak = piece.type === 'knight' ? 46 : 16;
      jumpLift = Math.sin(prog * Math.PI) * arcPeak;
      // Subtle stretch in mid-air, squash upon touch-down
      const squashWave = Math.sin(prog * Math.PI * 2) * 0.08;
      scaleX = 1 - squashWave;
      scaleY = 1 + squashWave;
    } else if (piece.recoilTimer > 0) {
      const rWave = Math.sin((piece.recoilTimer / 0.18) * Math.PI);
      scaleX = 1 + rWave * 0.07;
      scaleY = 1 - rWave * 0.05;
    } else if (piece.shoveTimer > 0) {
      const sWave = Math.sin((piece.shoveTimer / 0.30) * Math.PI);
      scaleX = 1 + sWave * 0.11;
      scaleY = 1 - sWave * 0.08;
    }

    const recoil = piece.recoilTimer > 0 ? Math.sin((piece.recoilTimer / 0.18) * Math.PI) * -6 : 0;
    const shoveLunge = piece.shoveTimer > 0 ? Math.sin((piece.shoveTimer / 0.30) * Math.PI) * 15 : 0;
    const bob = Math.sin(t * 3.0 + piece.id) * 2.2;

    ctx.save();
    ctx.translate(drawX + recoil + shoveLunge, drawY);

    // 0. Compact Contact Shadow Anchoring Piece to Stone Tile (shrinks slightly with 3D jump height!)
    const shadowScale = Math.max(0.58, 1 - jumpLift / 95);
    ctx.fillStyle = `rgba(13, 17, 27, ${0.72 * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(
      0,
      this.tileSize * 0.29,
      this.tileSize * 0.34 * shadowScale,
      this.tileSize * 0.12 * shadowScale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // 1. Synergy / King Aura / Ready Pawn-Line Merge Ring under base
    if (piece.inReadyPawnLine) {
      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(0, this.tileSize * 0.25, this.tileSize * 0.42, this.tileSize * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (piece.buffedByKing || piece.inBattery || piece.inPawnChain) {
      ctx.strokeStyle = piece.inBattery ? '#facc15' : piece.buffedByKing ? '#f43f5e' : '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, this.tileSize * 0.25, this.tileSize * 0.38, this.tileSize * 0.16, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Phalanx Shield-Pawn Frontal Bastion Arc & Kinetic Shield-Push Wave (Facing Right toward Undead!)
    if (piece.type === 'pawn') {
      ctx.save();
      const arcPulse = 0.55 + Math.sin(t * 4 + piece.id) * 0.18;
      ctx.strokeStyle = piece.inReadyPawnLine
        ? `rgba(250, 204, 21, ${arcPulse + 0.25})`
        : `rgba(56, 189, 248, ${arcPulse})`;
      ctx.lineWidth = piece.shoveTimer > 0 ? 4.8 : 3.2;
      ctx.beginPath();
      ctx.arc(6, -2, this.tileSize * 0.36, -Math.PI * 0.36, Math.PI * 0.36);
      ctx.stroke();

      // Kinetic forward shield-push wave when shoving enemies back
      if (piece.shoveTimer > 0) {
        const pushProg = 1 - piece.shoveTimer / 0.30;
        const waveX = 12 + pushProg * (this.tileSize * 0.55);
        ctx.strokeStyle = `rgba(125, 211, 252, ${1 - pushProg})`;
        ctx.lineWidth = 5 * (1 - pushProg * 0.5);
        ctx.beginPath();
        ctx.arc(waveX, -2, this.tileSize * (0.34 + pushProg * 0.18), -Math.PI * 0.42, Math.PI * 0.42);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Hex Curse Ring
    if (piece.hexTimer > 0) {
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.ellipse(0, 0, this.tileSize * 0.38, this.tileSize * 0.38, t * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Castling / Phalanx Aegis Shield Bubble
    if (piece.shieldHp > 0) {
      ctx.save();
      const isPawnShield = piece.type === 'pawn';
      ctx.strokeStyle = isPawnShield ? 'rgba(56, 189, 248, 0.72)' : 'rgba(250, 204, 21, 0.8)';
      ctx.fillStyle = isPawnShield ? 'rgba(56, 189, 248, 0.10)' : 'rgba(250, 204, 21, 0.14)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -4, this.tileSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. High-Res 3D Piece Sprite (with parabolic jump lift & squash-and-stretch)
    const sprite = window.RoyalSprites && window.RoyalSprites.pieceSprites[piece.type];
    const spriteSize = this.tileSize * 0.92;
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      ctx.save();
      ctx.translate(0, -jumpLift + bob - 4);
      ctx.scale(scaleX, scaleY);
      ctx.drawImage(sprite, -spriteSize / 2, -spriteSize / 2, spriteSize, spriteSize);
      ctx.restore();
    }

    // 3. Pawn XP / Line-Merge Status Bar
    if (piece.type === 'pawn') {
      const xpRatio = Math.min(1, piece.xp / 100);
      const barW = this.tileSize * 0.56;
      const barY = this.tileSize * 0.34;
      ctx.fillStyle = 'rgba(9, 13, 24, 0.9)';
      ctx.fillRect(-barW / 2, barY, barW, 5);
      ctx.fillStyle = piece.inReadyPawnLine || xpRatio >= 1 ? '#facc15' : '#38bdf8';
      ctx.fillRect(-barW / 2, barY, barW * (piece.inReadyPawnLine ? 1 : xpRatio), 5);

      const isEn = this.game.lang === 'en';
      if (piece.inReadyPawnLine) {
        ctx.font = '800 9px "Orbitron", "Cairo", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.95)';
        ctx.shadowBlur = 4;
        ctx.fillText(isEn ? '♛ MERGE [M]' : '♛ دمج [M]', 0, -this.tileSize * 0.41);
        ctx.shadowBlur = 0;
      } else if (xpRatio >= 1) {
        const pCost = (this.game.decreeState && this.game.decreeState.promoteCost) || 125;
        ctx.font = '800 9px "Orbitron", "Cairo", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.95)';
        ctx.shadowBlur = 4;
        ctx.fillText(isEn ? `♛ CROWN (${pCost}☀)` : `♛ تتويج (${pCost}☀)`, 0, -this.tileSize * 0.41);
        ctx.shadowBlur = 0;
      }
    }

    // 4. Health + Shield Bar
    if (piece.hp < piece.maxHp || piece.shieldHp > 0) {
      const hpRatio = Math.max(0, piece.hp / piece.maxHp);
      const barW = this.tileSize * 0.58;
      const barY = -this.tileSize * 0.36;
      ctx.fillStyle = 'rgba(9, 13, 24, 0.92)';
      this.roundRect(ctx, -barW / 2, barY, barW, 6, 3);
      ctx.fill();
      ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#f59e0b' : '#ef4444';
      this.roundRect(ctx, -barW / 2, barY, barW * hpRatio, 6, 3);
      ctx.fill();

      if (piece.shieldHp > 0) {
        const maxSh = piece.type === 'pawn' ? 100 : 250;
        const shRatio = Math.min(1, piece.shieldHp / maxSh);
        ctx.fillStyle = '#38bdf8';
        this.roundRect(ctx, -barW / 2, barY - 4, barW * shRatio, 3.2, 1.5);
        ctx.fill();
      }
    }

    // 5. Tactical Chess Move Ready Emerald Pip
    const moveReady = piece.moveCd <= 0;
    ctx.fillStyle = moveReady ? '#10b981' : 'rgba(148, 163, 184, 0.4)';
    ctx.beginPath();
    ctx.arc(this.tileSize * 0.28, this.tileSize * 0.24, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  // Draw Hyper-Detailed Corrupted Ebony Chess Monsters with Live Auras, Afterimages & Attack Swings!
  drawUndeadEnemy(ctx, enemy, t) {
    const x = this.boardLeft + enemy.colPos * this.tileSize;
    const y = this.boardTop + (enemy.row + 0.5) * this.tileSize;

    let jumpOffsetY = 0;
    if (enemy.vaultAnimTimer > 0) {
      const p = 1 - enemy.vaultAnimTimer / 0.55;
      jumpOffsetY = -Math.sin(p * Math.PI) * 52;
    }

    const walkBob =
      Math.abs(Math.sin(t * (enemy.isBoss ? 4.5 : 7.8) + enemy.id)) *
      (enemy.isBoss ? 5.5 : 3.8);
    const scale = enemy.isBoss ? 1.32 : enemy.type === 'imp' ? 0.8 : 1.0;

    // Attack lunge tilt when biting/smashing a Chess Piece
    const attackTilt = enemy.isAttacking ? Math.sin(t * 18 + enemy.id) * -0.14 : 0;

    ctx.save();
    ctx.translate(x, y + jumpOffsetY);

    // 0. Compact Contact Shadow Anchoring Undead to Stone Tile (ChatGPT Art Director Spec)
    ctx.fillStyle = 'rgba(9, 8, 13, 0.76)';
    ctx.beginPath();
    ctx.ellipse(0, this.tileSize * 0.30, this.tileSize * (enemy.isBoss ? 0.44 : 0.32), this.tileSize * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. Class-Specific Dynamic Ground & Trail Auras
    if (enemy.type === 'assassin') {
      // Phantom Crimson Shadow-Afterimages trailing behind the Assassin!
      const sprite = window.RoyalSprites && window.RoyalSprites.enemySprites.assassin;
      const sz = this.tileSize * scale;
      if (sprite && sprite.complete && sprite.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.drawImage(sprite, -sz / 2 + 18, -sz / 2 - walkBob, sz, sz);
        ctx.globalAlpha = 0.11;
        ctx.drawImage(sprite, -sz / 2 + 34, -sz / 2 - walkBob, sz, sz);
        ctx.restore();
      }
    } else if (enemy.type === 'buckler' && enemy.shieldHp > 0) {
      // Glowing Frontal Runic Barrier Arc
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.78)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-6, -4, this.tileSize * 0.38, Math.PI * 0.62, Math.PI * 1.38);
      ctx.stroke();
      ctx.restore();
    } else if (enemy.type === 'necro') {
      // Orbiting Cursed Bishop Hex Sigils
      ctx.save();
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.5)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.ellipse(0, 14, this.tileSize * 0.36, this.tileSize * 0.14, t * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (enemy.isBoss) {
      // Fallen Rook Gargantua Molten Seismic Ring
      ctx.save();
      ctx.strokeStyle = `rgba(249, 115, 22, ${0.45 + Math.sin(t * 5) * 0.2})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 18, this.tileSize * 0.48, this.tileSize * 0.18, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Render Pre-baked High-Res 3D Monster Sprite (zero per-frame ctx.filter!)
    const atlas = window.RoyalSprites;
    let sprite = atlas && atlas.enemySprites[enemy.type];
    if (enemy.hitFlash > 0 && atlas && atlas.enemyFlashSprites && atlas.enemyFlashSprites[enemy.type]) {
      sprite = atlas.enemyFlashSprites[enemy.type];
    } else if (enemy.slowTimer > 0 && atlas && atlas.enemyChillSprites && atlas.enemyChillSprites[enemy.type]) {
      sprite = atlas.enemyChillSprites[enemy.type];
    }
    const spriteSize = this.tileSize * scale;

    ctx.save();
    ctx.rotate(attackTilt);
    if (sprite && ((sprite.complete && sprite.naturalWidth > 0) || sprite.width > 0)) {
      ctx.drawImage(sprite, -spriteSize / 2, -spriteSize / 2 - walkBob, spriteSize, spriteSize);
    }
    ctx.restore();

    // Melee Slash Arc when actively attacking a defender
    if (enemy.isAttacking && Math.sin(t * 18 + enemy.id) > 0.4) {
      ctx.save();
      ctx.strokeStyle = enemy.isBoss ? '#f97316' : '#f43f5e';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(-18, -6, 18, Math.PI * 0.7, Math.PI * 1.4);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Enemy Health + Shield Barplate with Corrupted Chess Emblem
    const barW = enemy.isBoss ? 74 : 48;
    const barY = enemy.isBoss ? -this.tileSize * 0.6 : -this.tileSize * 0.44;
    const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);

    ctx.fillStyle = 'rgba(9, 13, 24, 0.92)';
    this.roundRect(ctx, -barW / 2, barY, barW, 6.5, 3);
    ctx.fill();

    ctx.fillStyle = enemy.isBoss ? '#f97316' : enemy.type === 'assassin' ? '#f43f5e' : '#ef4444';
    this.roundRect(ctx, -barW / 2, barY, barW * hpRatio, 6.5, 3);
    ctx.fill();

    if (enemy.shieldHp > 0 && enemy.maxShieldHp > 0) {
      const shRatio = Math.max(0, enemy.shieldHp / enemy.maxShieldHp);
      ctx.fillStyle = '#38bdf8';
      this.roundRect(ctx, -barW / 2, barY - 5, barW * shRatio, 4, 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawShockwaves(ctx) {
    if (!this.game.shockwaves || this.game.shockwaves.length === 0) return;
    for (const sw of this.game.shockwaves) {
      const prog = 1 - sw.life / sw.maxLife;
      const r = sw.startR + (sw.endR - sw.startR) * prog;
      const alpha = Math.max(0, sw.life / sw.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha * 0.85;
      ctx.strokeStyle = sw.color || '#facc15';
      ctx.lineWidth = 4 * (1 - prog * 0.5);
      ctx.shadowColor = sw.color || '#facc15';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawProjectilesAndBeams(ctx) {
    for (const beam of this.game.beams) {
      const alpha = Math.max(0, beam.life / beam.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = beam.color;
      ctx.lineWidth = (beam.width || 4) * 1.4;
      ctx.shadowColor = beam.color;
      ctx.shadowBlur = 16;
      ctx.lineCap = 'round';

      ctx.beginPath();
      if (beam.isLightning) {
        ctx.moveTo(beam.x1, beam.y1);
        const steps = 5;
        for (let i = 1; i < steps; i++) {
          const frac = i / steps;
          const jx = beam.x1 + (beam.x2 - beam.x1) * frac + (Math.random() - 0.5) * 18;
          const jy = beam.y1 + (beam.y2 - beam.y1) * frac + (Math.random() - 0.5) * 18;
          ctx.lineTo(jx, jy);
        }
        ctx.lineTo(beam.x2, beam.y2);
        ctx.stroke();
      } else {
        ctx.moveTo(beam.x1, beam.y1);
        ctx.lineTo(beam.x2, beam.y2);
        ctx.stroke();

        // Inner white-gold bloom core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1.5, (beam.width || 4) * 0.42);
        ctx.shadowBlur = 4;
        ctx.stroke();
      }
      ctx.restore();
    }

    for (const proj of this.game.projectiles) {
      ctx.save();
      ctx.translate(proj.x, proj.y);
      ctx.fillStyle = proj.color;
      ctx.shadowColor = proj.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius || 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawParticles(ctx) {
    for (const p of this.game.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.isShard) {
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot || 0) + (p.maxLife - p.life) * (p.spin || 6));
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 1.4);
        ctx.lineTo(p.size, p.size * 0.5);
        ctx.lineTo(-p.size * 0.85, p.size);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  drawManaOrbs(ctx, t) {
    for (const orb of this.game.manaOrbs) {
      ctx.save();
      ctx.translate(orb.x, orb.y);
      const pulse = 1 + Math.sin(t * 7 + orb.id) * 0.1;
      ctx.scale(pulse, pulse);

      const radGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 26);
      radGrad.addColorStop(0, '#fef9c3');
      radGrad.addColorStop(0.45, '#facc15');
      radGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '800 10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#78350f';
      ctx.textAlign = 'center';
      ctx.fillText(`+${orb.value}`, 0, 3.5);
      ctx.restore();
    }
  }

  drawFloatingTexts(ctx) {
    for (const ft of this.game.floatingTexts) {
      const alpha = Math.min(1, ft.life / (ft.maxLife * 0.6));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = ft.big
        ? '800 15px "Orbitron", sans-serif'
        : '700 12px "JetBrains Mono", monospace';
      ctx.fillStyle = ft.color || '#fef08a';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.92)';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  drawDragPreview(ctx) {
    const drag = this.game.dragState;
    if (!drag || !drag.active || !drag.pieceType) return;
    const sprite = window.RoyalSprites && window.RoyalSprites.pieceSprites[drag.pieceType];
    if (!sprite || !sprite.complete) return;

    const size = this.tileSize * 0.88;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.shadowColor = drag.kind === 'board' ? '#38bdf8' : '#facc15';
    ctx.shadowBlur = 18;
    ctx.drawImage(sprite, drag.x - size / 2, drag.y - size / 2, size, size);
    ctx.restore();
  }

  // Full-Screen Cinematic 5-Pawn Merge Sequence into an Ascended Sovereign Queen
  drawMergeCinematic(ctx, t) {
    const mc = this.game.mergeCinematic;
    if (!mc) return;

    const prog = Math.min(1, mc.elapsed / mc.duration);
    const fadeAlpha =
      prog < 0.12
        ? prog / 0.12
        : prog > 0.85
          ? Math.max(0, (1 - prog) / 0.15)
          : 1;

    ctx.save();

    // 1. Full-Screen Royal Obsidian Spotlight Backdrop & Cinema Letterbox Bars
    const radSpot = ctx.createRadialGradient(
      mc.targetX,
      mc.targetY,
      this.tileSize * 0.6,
      mc.targetX,
      mc.targetY,
      Math.max(this.width, this.height) * 0.75
    );
    radSpot.addColorStop(0, `rgba(250, 204, 21, ${0.18 * fadeAlpha})`);
    radSpot.addColorStop(0.35, `rgba(10, 15, 30, ${0.46 * fadeAlpha})`);
    radSpot.addColorStop(1, `rgba(3, 5, 12, ${0.78 * fadeAlpha})`);
    ctx.fillStyle = radSpot;
    ctx.fillRect(0, 0, this.width, this.height);

    // Top & Bottom Cinema Letterbox Bars
    const barH = Math.round(48 * fadeAlpha);
    if (barH > 2) {
      ctx.fillStyle = 'rgba(4, 6, 14, 0.94)';
      ctx.fillRect(0, 0, this.width, barH);
      ctx.fillRect(0, this.height - barH, this.width, barH);

      ctx.strokeStyle = `rgba(250, 204, 21, ${0.75 * fadeAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, barH);
      ctx.lineTo(this.width, barH);
      ctx.moveTo(0, this.height - barH);
      ctx.lineTo(this.width, this.height - barH);
      ctx.stroke();
    }

    // 2. Rotating Sacred Golden Astrolabe Circle at the Ascension Square
    ctx.save();
    ctx.translate(mc.targetX, mc.targetY);
    ctx.rotate(t * 2.6);
    const ringRadius = this.tileSize * (0.65 + Math.sin(prog * Math.PI) * 0.85);
    ctx.strokeStyle = `rgba(250, 204, 21, ${0.88 * fadeAlpha})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(-t * 4.2);
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.75 * fadeAlpha})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 3. Stage 1 (prog 0.0 -> 0.56): 5 Pawn Sprites Levitate & Fly Across the Screen into the Center!
    if (prog < 0.58) {
      const flyT = Math.min(1, prog / 0.55);
      const easeIn = flyT * flyT * (3 - 2 * flyT);
      const pawnSprite = window.RoyalSprites && window.RoyalSprites.pieceSprites.pawn;

      for (const src of mc.sources) {
        const arcLift = Math.sin(flyT * Math.PI) * 68;
        const spiralAngle = flyT * Math.PI * 1.4 + src.idx * ((Math.PI * 2) / 5);
        const spiralRadius = (1 - easeIn) * 28;

        const px =
          src.x + (mc.targetX - src.x) * easeIn + Math.cos(spiralAngle) * spiralRadius;
        const py =
          src.y + (mc.targetY - src.y) * easeIn - arcLift + Math.sin(spiralAngle) * (spiralRadius * 0.5);

        // Glowing golden comet ribbon behind each flying Pawn
        const tailGrad = ctx.createLinearGradient(src.x, src.y, px, py);
        tailGrad.addColorStop(0, 'rgba(250, 204, 21, 0)');
        tailGrad.addColorStop(1, 'rgba(254, 240, 138, 0.85)');
        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = 5 * (1 - flyT * 0.3);
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Glowing aura + Pawn sprite
        const sz = this.tileSize * (0.95 - flyT * 0.25);
        ctx.save();
        ctx.translate(px, py);
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 18;
        if (pawnSprite && pawnSprite.complete && pawnSprite.naturalWidth > 0) {
          ctx.drawImage(pawnSprite, -sz / 2, -sz / 2, sz, sz);
        }
        ctx.restore();
      }
    }

    // 4. Stage 2 (prog >= 0.48): Celestial Pillar of Golden Light from the Top of the Screen & Ascended Queen!
    if (prog >= 0.48) {
      const pillarProg = Math.min(1, (prog - 0.48) / 0.52);
      const pillarAlpha = Math.sin(pillarProg * Math.PI);
      const pillarW = this.tileSize * (1.25 - pillarProg * 0.45);

      // Vertical Celestial Pillar of Light from y=0 to targetY
      const pillarGrad = ctx.createLinearGradient(mc.targetX - pillarW, 0, mc.targetX + pillarW, 0);
      pillarGrad.addColorStop(0, 'rgba(250, 204, 21, 0)');
      pillarGrad.addColorStop(0.3, `rgba(250, 204, 21, ${0.48 * pillarAlpha})`);
      pillarGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.92 * pillarAlpha})`);
      pillarGrad.addColorStop(0.7, `rgba(250, 204, 21, ${0.48 * pillarAlpha})`);
      pillarGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');

      ctx.fillStyle = pillarGrad;
      ctx.fillRect(mc.targetX - pillarW, 0, pillarW * 2, mc.targetY + this.tileSize * 0.4);

      // Full-screen supernova flash at the exact moment of fusion (prog 0.52 - 0.68)
      if (prog >= 0.50 && prog <= 0.72) {
        const flashAlpha = Math.sin(((prog - 0.50) / 0.22) * Math.PI) * 0.45;
        ctx.fillStyle = `rgba(254, 249, 195, ${flashAlpha})`;
        ctx.fillRect(0, 0, this.width, this.height);
      }

      // Giant Ascended Sovereign Queen Descending inside the Golden Pillar
      const queenSprite = window.RoyalSprites && window.RoyalSprites.pieceSprites.queen;
      if (queenSprite && queenSprite.complete && queenSprite.naturalWidth > 0) {
        const scaleMult = 1.85 - Math.min(1, pillarProg * 1.25) * 0.85;
        const qSize = this.tileSize * 0.96 * scaleMult;
        const liftY = (1 - Math.min(1, pillarProg * 1.3)) * 55;

        ctx.save();
        ctx.translate(mc.targetX, mc.targetY - liftY);
        ctx.shadowColor = '#fef08a';
        ctx.shadowBlur = 28;
        ctx.drawImage(queenSprite, -qSize / 2, -qSize / 2 - 4, qSize, qSize);
        ctx.restore();
      }
    }

    // 5. Full-Screen Cinematic Royal Typography Banner
    ctx.save();
    ctx.globalAlpha = fadeAlpha;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 12;

    const bannerY = Math.max(82, this.boardTop * 0.72);
    const isEn = this.game.lang === 'en';
    ctx.font = '900 22px "Cairo", "Cinzel", serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText(
      isEn
        ? '♛ ROYAL ASCENSION • PHALANX FUSED INTO SOVEREIGN QUEEN! ♛'
        : '♛ اندماج ملكي سينمائي • تحوّل الفيلق إلى الوزير المتوّج! ♛',
      this.width * 0.5,
      bannerY
    );

    ctx.font = '700 13px "Orbitron", "Cairo", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(
      isEn
        ? '5 PHALANX PAWNS ASCENDED INTO SOVEREIGN QUEEN (+300 ROYAL SHIELD)'
        : 'اندماج 5 جنود مدرعين إلى وزير ملكي متوّج (+300 درع ذهبي)',
      this.width * 0.5,
      bannerY + 24
    );
    ctx.restore();

    ctx.restore();
  }

  roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }
}

window.RoyalBoardRenderer = RoyalBoardRenderer;
