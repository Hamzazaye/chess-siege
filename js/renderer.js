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
    this.drawSynergyLinks(ctx, timeSeconds);
    this.drawTacticalOverlays(ctx, timeSeconds);
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
  }

  drawAmbientEmbers(ctx, t) {
    ctx.save();
    for (const m of this.ambientMotes) {
      const y = (m.yFrac * this.height - ((t * m.speedY) % this.height) + this.height) % this.height;
      const x =
        (m.xFrac * this.width + Math.sin(t * 0.9 + m.phase) * m.driftX + this.width) % this.width;
      const alpha = 0.25 + 0.25 * Math.sin(t * 2.4 + m.phase);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = m.isGold ? '#fef08a' : '#38bdf8';
      ctx.shadowColor = m.isGold ? '#facc15' : '#38bdf8';
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

    // 1. Deep 3D Carved Obsidian Sanctuary Plinth
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 42;
    ctx.shadowOffsetY = 16;

    const outerPad = 15;
    const plinthGrad = ctx.createLinearGradient(
      this.boardLeft,
      this.boardTop - outerPad,
      this.boardLeft,
      this.boardTop + boardH + outerPad
    );
    plinthGrad.addColorStop(0, 'rgba(18, 25, 44, 0.96)');
    plinthGrad.addColorStop(0.5, 'rgba(9, 13, 24, 0.96)');
    plinthGrad.addColorStop(1, 'rgba(4, 6, 14, 0.98)');
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

    // 2. Ornate Double Forged-Gold Frame Border
    ctx.save();
    ctx.strokeStyle = theme.borderGold || '#d4af37';
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

    ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)';
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

        // Spawn warning zone on the rightmost column (col 9 / J)
        if (c === this.cols - 1) {
          const pulse = 0.08 + 0.04 * Math.sin(t * 2.5 + r);
          ctx.fillStyle = `rgba(244, 63, 94, ${pulse})`;
          ctx.fillRect(x, y, this.tileSize, this.tileSize);
        }

        // Algebraic Coordinate watermark (a1..j5)
        if (this.game.showGridOverlay !== false) {
          const coord = this.algebraicLabel(c, r);
          ctx.font = '700 9.5px "JetBrains Mono", monospace';
          ctx.fillStyle = isLight ? 'rgba(254, 240, 138, 0.44)' : 'rgba(148, 163, 184, 0.30)';
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
        ctx.fillText('👑 اضغط لدمج السطر -> وزير [M]', midPt.x, bobY + 2);
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
        ctx.fillStyle = 'rgba(244, 63, 94, 0.34)';
        ctx.fillRect(hx, hy, this.tileSize, this.tileSize);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(hx + 2, hy + 2, this.tileSize - 4, this.tileSize - 4);
      } else if (selectedDeckId && !selectedBoardPiece) {
        const occupied = this.game.getPieceAt(hover.col, hover.row);
        ctx.fillStyle = occupied ? 'rgba(244, 63, 94, 0.24)' : 'rgba(56, 189, 248, 0.22)';
        ctx.fillRect(hx, hy, this.tileSize, this.tileSize);
        ctx.strokeStyle = occupied ? '#f43f5e' : '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(hx + 2, hy + 2, this.tileSize - 4, this.tileSize - 4);

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

      if (sentinel.used && !sentinel.active) continue;

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
    const center = this.tileCenter(piece.col, piece.row);

    let drawX = center.x;
    let drawY = center.y;
    if (piece.moveAnimTimer > 0) {
      const prog = 1 - piece.moveAnimTimer / piece.moveAnimDuration;
      const ease = 1 - Math.pow(1 - prog, 3);
      drawX = piece.moveFromX + (center.x - piece.moveFromX) * ease;
      drawY = piece.moveFromY + (center.y - piece.moveFromY) * ease;
      if (piece.type === 'knight') {
        drawY -= Math.sin(prog * Math.PI) * 42;
      }
    }

    const recoil = piece.recoilTimer > 0 ? Math.sin((piece.recoilTimer / 0.18) * Math.PI) * -6 : 0;
    const bob = Math.sin(t * 3.0 + piece.id) * 2.2;

    ctx.save();
    ctx.translate(drawX + recoil, drawY);

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

    // Phalanx Shield-Pawn Frontal Bastion Arc (Facing Right toward Undead!)
    if (piece.type === 'pawn') {
      ctx.save();
      const arcPulse = 0.55 + Math.sin(t * 4 + piece.id) * 0.18;
      ctx.strokeStyle = piece.inReadyPawnLine
        ? `rgba(250, 204, 21, ${arcPulse + 0.25})`
        : `rgba(56, 189, 248, ${arcPulse})`;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(6, -2, this.tileSize * 0.36, -Math.PI * 0.36, Math.PI * 0.36);
      ctx.stroke();
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

    // 2. High-Res 3D Piece Sprite
    const sprite = window.RoyalSprites && window.RoyalSprites.pieceSprites[piece.type];
    const spriteSize = this.tileSize * 0.92;
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      ctx.drawImage(sprite, -spriteSize / 2, -spriteSize / 2 + bob - 4, spriteSize, spriteSize);
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

      if (piece.inReadyPawnLine) {
        ctx.font = '800 9px "Orbitron", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.95)';
        ctx.shadowBlur = 4;
        ctx.fillText('👑 MERGE → ♛', 0, -this.tileSize * 0.41);
        ctx.shadowBlur = 0;
      } else if (xpRatio >= 1) {
        ctx.font = '800 9px "Orbitron", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.95)';
        ctx.shadowBlur = 4;
        ctx.fillText('👑 CROWN (125☀)', 0, -this.tileSize * 0.41);
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

    // 2. Render High-Res 3D Monster Sprite with Attack Lunge
    const sprite = window.RoyalSprites && window.RoyalSprites.enemySprites[enemy.type];
    const spriteSize = this.tileSize * scale;

    ctx.save();
    ctx.rotate(attackTilt);
    if (enemy.hitFlash > 0) {
      ctx.filter = 'brightness(1.85)';
    } else if (enemy.slowTimer > 0) {
      ctx.filter = 'hue-rotate(150deg) saturate(1.5)';
    }
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
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
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
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
