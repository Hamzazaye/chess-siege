/**
 * CROWN & BLIGHT: THE ROYAL GAMBIT (AAA Balanced & Ultra-UX Edition)
 * Core Real-Time Tactical Simulation Engine:
 * - Authentic Chess Geometry + Balanced Queen & Counter-Play
 * - Winged Golden Rook Sentinels (Back-Rank Sweepers)
 * - Live Tactical Unit Inspector, One-Click Actions, Wave Radar & Early Wave Bonus
 */

class RoyalGambitGame {
  constructor() {
    this.canvas = document.getElementById('battleCanvas');
    this.cols = 10;
    this.rows = 5;

    this.actIndex = 0;
    this.currentAct = window.CHESS_DATA.ACTS[0];
    this.eloRating = Number(localStorage.getItem('royal_gambit_elo') || 1500);
    this.unlockedActs = Number(localStorage.getItem('royal_gambit_unlocked') || 5);

    this.mana = 150;
    this.score = 0;
    this.ultimateCharge = 25;
    this.gameSpeed = 1;
    this.autoCollectMana = true;
    this.showGridOverlay = true;
    this.paused = false;
    this.gameOver = false;
    this.victory = false;

    this.pieces = [];
    this.enemies = [];
    this.projectiles = [];
    this.beams = [];
    this.shockwaves = [];
    this.particles = [];
    this.manaOrbs = [];
    this.floatingTexts = [];
    this.chariots = [];
    this.batteryLinks = [];
    this.pawnChainLinks = [];
    this.readyPawnLines = [];
    this.mergeCinematic = null;

    this.selectedDeckPieceId = 'pawn';
    this.selectedBoardPiece = null;
    this.shovelMode = false;
    this.hoverCell = null;
    this.cardCooldowns = {};
    this.lastInspectedKey = '';

    this.waveIndex = 0;
    this.waveInProgress = false;
    this.waveSpawnQueue = [];
    this.waveCooldownTimer = 3.5;
    this.skyManaTimer = 4.8;
    this.tipTimer = 0;
    this.tipIndex = 0;

    this.entityIdCounter = 1;
    this.screenShake = 0;
    this.lastTimestamp = performance.now();

    this.renderer = new window.RoyalBoardRenderer(this.canvas, this);

    this.bindEvents();
    this.buildDeckBar();
    this.populateCodexModal();
    this.populateActsDrawer();
    this.startAct(0);
    this.renderer.resize();

    requestAnimationFrame(ts => this.loop(ts));
  }

  startAct(actIdx) {
    this.actIndex = Math.max(0, Math.min(window.CHESS_DATA.ACTS.length - 1, actIdx));
    this.currentAct = window.CHESS_DATA.ACTS[this.actIndex];

    this.mana = this.currentAct.startingMana || 150;
    this.score = 0;
    this.ultimateCharge = 25;
    this.paused = false;
    this.gameOver = false;
    this.victory = false;

    this.pieces = [];
    this.enemies = [];
    this.projectiles = [];
    this.beams = [];
    this.shockwaves = [];
    this.particles = [];
    this.manaOrbs = [];
    this.floatingTexts = [];
    this.batteryLinks = [];
    this.pawnChainLinks = [];
    this.readyPawnLines = [];
    this.mergeCinematic = null;

    this.selectedBoardPiece = null;
    this.shovelMode = false;
    this.lastInspectedKey = '';
    this.cardCooldowns = {};
    Object.keys(window.CHESS_DATA.PIECES).forEach(k => {
      this.cardCooldowns[k] = 0;
    });

    // 5 Winged Golden Rook Sentinels guarding Ranks 5-1
    this.chariots = [];
    for (let r = 0; r < this.rows; r++) {
      this.chariots.push({
        row: r,
        x: this.renderer.chariotX,
        active: false,
        used: false
      });
    }

    this.spawnStarterFormation();

    this.waveIndex = 0;
    this.waveInProgress = false;
    this.waveSpawnQueue = [];
    this.waveCooldownTimer = 3.2;
    this.skyManaTimer = 4.0;
    window.RoyalAudio.setIntenseMode(false);

    this.hideModals();
    this.updateWaveThreatIcons();
    this.updateHUD();
    this.announceBanner(
      `${this.currentAct.code}: ${this.currentAct.name}`,
      this.currentAct.subtitle
    );
  }

  spawnStarterFormation() {
    this.placePieceInternal('chalice', 0, 1, true);
    this.placePieceInternal('chalice', 0, 3, true);
    this.recalculateSynergies();
  }

  bindEvents() {
    window.addEventListener('resize', () => this.renderer.resize());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.renderer.resize(), 120);
    });

    this.canvas.addEventListener('mousemove', e => {
      this.hoverCell = this.renderer.screenToBoard(e.clientX, e.clientY);

      for (const orb of this.manaOrbs) {
        if (!orb.collected) {
          const dx = this.hoverCell.x - orb.x;
          const dy = this.hoverCell.y - orb.y;
          if (Math.hypot(dx, dy) < 42) {
            this.collectManaOrb(orb);
          }
        }
      }
    });

    this.canvas.addEventListener(
      'touchmove',
      e => {
        if (!e.touches || e.touches.length === 0) return;
        const touch = e.touches[0];
        this.hoverCell = this.renderer.screenToBoard(touch.clientX, touch.clientY);
        for (const orb of this.manaOrbs) {
          if (!orb.collected) {
            const dx = this.hoverCell.x - orb.x;
            const dy = this.hoverCell.y - orb.y;
            if (Math.hypot(dx, dy) < 48) {
              this.collectManaOrb(orb);
            }
          }
        }
      },
      { passive: true }
    );

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverCell = null;
    });

    this.canvas.addEventListener('click', e => {
      window.RoyalAudio.init();
      window.RoyalAudio.startMusic();

      const pos = this.renderer.screenToBoard(e.clientX, e.clientY);

      for (const orb of this.manaOrbs) {
        if (!orb.collected && Math.hypot(pos.x - orb.x, pos.y - orb.y) < 44) {
          this.collectManaOrb(orb);
          return;
        }
      }

      if (!pos.valid || this.paused || this.gameOver) return;

      this.handleBoardClick(pos.col, pos.row);
    });

    this.canvas.addEventListener('contextmenu', e => {
      e.preventDefault();
      this.selectedBoardPiece = null;
      this.shovelMode = false;
      this.updateHUD();
    });

    window.addEventListener('keydown', e => {
      if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();
      if (key >= '1' && key <= '7') {
        const pieceKeys = Object.keys(window.CHESS_DATA.PIECES);
        const idx = Number(key) - 1;
        if (pieceKeys[idx]) {
          this.selectDeckPiece(pieceKeys[idx]);
        }
      } else if (key === 'm') {
        this.tryMergePawnLine(this.selectedBoardPiece);
      } else if (key === 's' || key === 'x') {
        this.toggleShovel();
      } else if (key === 'f') {
        this.toggleFullscreen();
      } else if (key === ' ') {
        e.preventDefault();
        this.triggerCheckmateUltimate();
      } else if (key === 'p') {
        this.togglePause();
      } else if (key === 'escape') {
        this.selectedBoardPiece = null;
        this.shovelMode = false;
        this.hideModals();
        this.updateHUD();
      }
    });

    const bindBtn = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };

    bindBtn('shovelBtn', () => this.toggleShovel());
    bindBtn('ultimateBtn', () => this.triggerCheckmateUltimate());
    bindBtn('screenMergeCtaBtn', () => this.tryMergePawnLine(this.selectedBoardPiece));
    bindBtn('callWaveBtn', () => this.callNextWaveEarly());
    bindBtn('speedBtn', () => this.cycleGameSpeed());
    bindBtn('autoManaBtn', () => {
      this.autoCollectMana = !this.autoCollectMana;
      this.updateHUD();
    });
    bindBtn('pauseBtn', () => this.togglePause());
    bindBtn('restartBtn', () => this.startAct(this.actIndex));
    bindBtn('fullscreenBtn', () => this.toggleFullscreen());
    bindBtn('audioMuteBtn', () => {
      const muted = window.RoyalAudio.toggleMute();
      const btn = document.getElementById('audioMuteBtn');
      if (btn) btn.setAttribute('aria-pressed', String(!muted));
      this.updateHUD();
    });

    // Royal Command Menu & Modals
    bindBtn('openMenuBtn', () => this.openModal('commandMenuModal'));
    bindBtn('closeMenuBtn', () => this.hideModals());
    bindBtn('menuResumeBtn', () => this.hideModals());
    bindBtn('menuRestartBtn', () => this.startAct(this.actIndex));
    bindBtn('menuSpeedBtn', () => this.cycleGameSpeed());
    bindBtn('menuAutoManaBtn', () => {
      this.autoCollectMana = !this.autoCollectMana;
      this.updateHUD();
    });
    bindBtn('menuGridCoordsBtn', () => {
      this.showGridOverlay = !this.showGridOverlay;
      this.updateHUD();
    });
    bindBtn('menuAudioBtn', () => {
      const muted = window.RoyalAudio.toggleMute();
      const btn = document.getElementById('audioMuteBtn');
      if (btn) btn.setAttribute('aria-pressed', String(!muted));
      this.updateHUD();
    });
    bindBtn('menuFullscreenBtn', () => this.toggleFullscreen());
    bindBtn('menuOpenActsBtn', () => {
      this.hideModals();
      this.openModal('actsModal');
    });
    bindBtn('menuOpenCodexBtn', () => {
      this.hideModals();
      this.openModal('codexModal');
    });

    bindBtn('openCodexBtn', () => this.openModal('codexModal'));
    bindBtn('closeCodexBtn', () => this.hideModals());
    bindBtn('openActsBtn', () => this.openModal('actsModal'));
    bindBtn('closeActsBtn', () => this.hideModals());
    bindBtn('modalRetryBtn', () => this.startAct(this.actIndex));
    bindBtn('modalNextActBtn', () => {
      const next = (this.actIndex + 1) % window.CHESS_DATA.ACTS.length;
      this.startAct(next);
    });

    // Close modals when clicking the dark backdrop outside the modal window
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', e => {
        if (e.target === backdrop && backdrop.id !== 'resultModal') {
          this.hideModals();
        }
      });
    });

    // Codex Filter Tabs
    document.querySelectorAll('[data-codex-tab]').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        const filter = tabBtn.getAttribute('data-codex-tab');
        document.querySelectorAll('[data-codex-tab]').forEach(b => b.classList.toggle('active', b === tabBtn));
        const rulesSec = document.getElementById('codexRulesSection');
        const piecesSec = document.getElementById('codexPiecesSection');
        const enemiesSec = document.getElementById('codexEnemiesSection');
        if (rulesSec) rulesSec.style.display = filter === 'all' ? '' : 'none';
        if (piecesSec) piecesSec.style.display = filter === 'all' || filter === 'pieces' ? '' : 'none';
        if (enemiesSec) enemiesSec.style.display = filter === 'all' || filter === 'enemies' ? '' : 'none';
      });
    });
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
    setTimeout(() => {
      this.renderer.resize();
      this.updateHUD();
    }, 150);
  }

  countPiecesOfType(type) {
    return this.pieces.filter(p => p.type === type).length;
  }

  flashManaWarning() {
    const pod = document.getElementById('manaPodBox');
    if (!pod) return;
    pod.classList.add('mana-flash');
    setTimeout(() => pod.classList.remove('mana-flash'), 280);
  }

  callNextWaveEarly() {
    if (this.paused || this.gameOver) return;
    const canCall =
      this.waveSpawnQueue.length === 0 &&
      (this.currentAct.isEndless || this.waveIndex < this.currentAct.waves.length);
    if (!canCall) return;

    this.mana += 35;
    window.RoyalAudio.playManaCollect();
    this.addFloatingText(
      '+35☀ EARLY WAVE BONUS!',
      this.renderer.width * 0.5,
      this.renderer.boardTop + 24,
      '#fef08a',
      true
    );
    this.startNextWave();
    this.updateHUD();
  }

  handleBoardClick(col, row) {
    const existing = this.getPieceAt(col, row);

    if (this.shovelMode) {
      if (existing) {
        this.sacrificePiece(existing);
      }
      this.shovelMode = false;
      this.updateHUD();
      return;
    }

    // One-click merge if clicking a Pawn that belongs to a ready 5-Pawn Line!
    if (existing && existing.type === 'pawn' && existing.inReadyPawnLine) {
      this.tryMergePawnLine(existing);
      return;
    }

    if (this.selectedBoardPiece) {
      if (existing && existing.id === this.selectedBoardPiece.id) {
        if (existing.type === 'pawn' && existing.xp >= 100) {
          this.tryPromotePawn(existing);
        }
        this.selectedBoardPiece = null;
        this.updateHUD();
        return;
      }

      const legalMoves = this.getLegalMovesForPiece(this.selectedBoardPiece);
      const chosenMove = legalMoves.find(m => m.col === col && m.row === row);
      if (chosenMove) {
        this.executeChessMove(this.selectedBoardPiece, chosenMove);
        this.selectedBoardPiece = null;
        this.updateHUD();
        return;
      }

      if (existing) {
        if (existing.type === 'pawn' && existing.xp >= 100) {
          this.tryPromotePawn(existing);
          this.selectedBoardPiece = null;
          this.updateHUD();
          return;
        }
        this.selectedBoardPiece = existing;
        this.selectedDeckPieceId = null;
        this.updateHUD();
        return;
      }

      this.selectedBoardPiece = null;
      this.updateHUD();
      return;
    }

    if (existing) {
      if (existing.type === 'pawn' && existing.xp >= 100) {
        this.tryPromotePawn(existing);
        return;
      }
      this.selectedBoardPiece = existing;
      this.updateHUD();
      return;
    }

    if (this.selectedDeckPieceId) {
      this.tryDeployPiece(this.selectedDeckPieceId, col, row);
    }
  }

  selectDeckPiece(pieceId) {
    this.selectedDeckPieceId = pieceId;
    this.selectedBoardPiece = null;
    this.shovelMode = false;
    this.updateHUD();
  }

  toggleShovel() {
    this.shovelMode = !this.shovelMode;
    if (this.shovelMode) {
      this.selectedBoardPiece = null;
    }
    this.updateHUD();
  }

  tryDeployPiece(pieceId, col, row) {
    const def = window.CHESS_DATA.PIECES[pieceId];
    if (!def) return;
    if (this.getPieceAt(col, row)) return;

    const center = this.renderer.tileCenter(col, row);

    if (def.maxCount && this.countPiecesOfType(pieceId) >= def.maxCount) {
      this.addFloatingText(
        `MAX ${def.maxCount} ${def.name.toUpperCase()}S!`,
        center.x,
        center.y,
        '#f43f5e',
        true
      );
      return;
    }

    const cd = this.cardCooldowns[pieceId] || 0;
    if (cd > 0) {
      this.addFloatingText('RECHARGING!', center.x, center.y, '#f43f5e', false);
      return;
    }

    if (this.mana < def.cost) {
      this.flashManaWarning();
      this.addFloatingText(`NEED ${def.cost} MANA!`, center.x, center.y, '#fbbf24', false);
      return;
    }

    this.mana -= def.cost;
    this.cardCooldowns[pieceId] = def.cooldown;

    this.placePieceInternal(pieceId, col, row, false);
    window.RoyalAudio.playPlacePiece(pieceId);

    this.spawnParticles(center.x, center.y, def.accentColor, 14);
    this.recalculateSynergies();
    this.updateHUD();
  }

  placePieceInternal(pieceId, col, row, isFreeStarter = false) {
    const def = window.CHESS_DATA.PIECES[pieceId];
    const piece = {
      id: this.entityIdCounter++,
      type: pieceId,
      col,
      row,
      hp: def.maxHp,
      maxHp: def.maxHp,
      shieldHp: def.startingShield || 0,
      attackTimer: isFreeStarter ? 2.5 : def.attackInterval * 0.5,
      moveCd: 0,
      xp: 0,
      hexTimer: 0,
      recoilTimer: 0,
      shoveTimer: 0,
      inMergeCinematic: false,
      moveAnimTimer: 0,
      moveAnimDuration: 0.25,
      moveFromX: 0,
      moveFromY: 0,
      buffedByKing: false,
      buffedByChalice: false,
      inBattery: false,
      inPawnChain: false,
      inReadyPawnLine: false
    };
    this.pieces.push(piece);
    return piece;
  }

  getLegalMovesForPiece(piece) {
    if (!piece || piece.moveCd > 0) return [];
    const moves = [];
    const { col, row, type } = piece;

    const addIfEmpty = (c, r, extra = {}) => {
      if (c >= 0 && c < this.cols && r >= 0 && r < this.rows && !this.getPieceAt(c, r)) {
        moves.push({ col: c, row: r, ...extra });
        return true;
      }
      return false;
    };

    switch (type) {
      case 'pawn': {
        addIfEmpty(col + 1, row);
        [-1, 1].forEach(dr => {
          const tc = col + 1;
          const tr = row + dr;
          if (tc < this.cols && tr >= 0 && tr < this.rows && !this.getPieceAt(tc, tr)) {
            const hasEnemyNear = this.enemies.some(
              e => Math.round(e.row) === tr && Math.abs(e.colPos - (tc + 0.5)) <= 1.5
            );
            if (hasEnemyNear) {
              moves.push({ col: tc, row: tr, isDiagonalCapture: true });
            }
          }
        });
        break;
      }

      case 'rook': {
        const dirs = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1]
        ];
        for (const [dc, dr] of dirs) {
          for (let step = 1; step <= 4; step++) {
            if (!addIfEmpty(col + dc * step, row + dr * step)) break;
          }
        }
        break;
      }

      case 'knight': {
        const jumps = [
          [2, 1],
          [2, -1],
          [-2, 1],
          [-2, -1],
          [1, 2],
          [1, -2],
          [-1, 2],
          [-1, -2]
        ];
        for (const [dc, dr] of jumps) {
          addIfEmpty(col + dc, row + dr);
        }
        break;
      }

      case 'bishop': {
        const diagDirs = [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1]
        ];
        for (const [dc, dr] of diagDirs) {
          for (let step = 1; step <= 4; step++) {
            if (!addIfEmpty(col + dc * step, row + dr * step)) break;
          }
        }
        break;
      }

      case 'queen': {
        const allDirs = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1]
        ];
        for (const [dc, dr] of allDirs) {
          for (let step = 1; step <= 3; step++) {
            if (!addIfEmpty(col + dc * step, row + dr * step)) break;
          }
        }
        break;
      }

      case 'king':
      case 'chalice': {
        for (let dc = -1; dc <= 1; dc++) {
          for (let dr = -1; dr <= 1; dr++) {
            if (dc !== 0 || dr !== 0) {
              addIfEmpty(col + dc, row + dr);
            }
          }
        }
        if (type === 'king') {
          for (const other of this.pieces) {
            if (other.type === 'rook' && (other.row === row || other.col === col)) {
              moves.push({
                col: other.col,
                row: other.row,
                isCastle: true,
                rookTarget: other
              });
            }
          }
        }
        break;
      }
    }

    return moves;
  }

  executeChessMove(piece, move) {
    const def = window.CHESS_DATA.PIECES[piece.type];
    const oldCol = piece.col;
    const oldRow = piece.row;
    const oldCenter = this.renderer.tileCenter(oldCol, oldRow);

    if (move.isCastle && move.rookTarget) {
      const rook = move.rookTarget;
      const rookCenter = this.renderer.tileCenter(rook.col, rook.row);

      piece.moveFromX = oldCenter.x;
      piece.moveFromY = oldCenter.y;
      piece.moveAnimDuration = 0.32;
      piece.moveAnimTimer = 0.32;

      rook.moveFromX = rookCenter.x;
      rook.moveFromY = rookCenter.y;
      rook.moveAnimDuration = 0.32;
      rook.moveAnimTimer = 0.32;

      piece.col = move.col;
      piece.row = move.row;
      rook.col = oldCol;
      rook.row = oldRow;

      piece.moveCd = def.moveCooldown;
      rook.moveCd = 5.0;

      for (const ally of this.pieces) {
        if (ally.row === piece.row || ally.row === rook.row || ally.col === piece.col) {
          ally.shieldHp = 220;
          ally.hp = Math.min(ally.maxHp, ally.hp + 100);
          ally.hexTimer = 0;
        }
      }
      for (const enemy of this.enemies) {
        if (Math.round(enemy.row) === piece.row || Math.round(enemy.row) === rook.row) {
          this.damageEnemy(enemy, 85, true, 1.0);
          enemy.colPos = Math.min(this.cols + 0.2, enemy.colPos + 0.95);
        }
      }

      window.RoyalAudio.playCastling();
      this.screenShake = 0.32;
      const newCenter = this.renderer.tileCenter(piece.col, piece.row);
      this.spawnShockwave(newCenter.x, newCenter.y, 14, 150, '#facc15');
      this.addFloatingText('🏰 تبييت ملكي! +درع ذهبي!', newCenter.x, newCenter.y - 18, '#facc15', true);
      this.spawnParticles(newCenter.x, newCenter.y, '#facc15', 24);
      this.recalculateSynergies();
      return;
    }

    piece.moveFromX = oldCenter.x;
    piece.moveFromY = oldCenter.y;
    piece.moveAnimDuration = piece.type === 'knight' ? 0.34 : 0.24;
    piece.moveAnimTimer = piece.moveAnimDuration;

    piece.col = move.col;
    piece.row = move.row;
    piece.moveCd = def.moveCooldown;

    const newCenter = this.renderer.tileCenter(piece.col, piece.row);
    window.RoyalAudio.playChessMove(piece.type === 'knight');

    if (piece.type === 'knight') {
      this.screenShake = 0.25;
      this.spawnShockwave(newCenter.x, newCenter.y, 12, 125, '#c084fc');
      this.spawnParticles(newCenter.x, newCenter.y, '#a855f7', 20);
      this.addFloatingText('⚡ KNIGHT LEAP SLAM!', newCenter.x, newCenter.y - 18, '#c084fc', true);
      for (const enemy of this.enemies) {
        if (
          Math.abs(enemy.row - piece.row) <= 1.15 &&
          Math.abs(enemy.colPos - (piece.col + 0.5)) <= 1.5
        ) {
          this.damageEnemy(enemy, 75, true, 1.0);
          enemy.slowTimer = Math.max(enemy.slowTimer, 2.2);
          enemy.colPos = Math.min(this.cols + 0.2, enemy.colPos + 0.45);
        }
      }
    } else if (piece.type === 'rook') {
      this.spawnParticles(newCenter.x, newCenter.y, '#fb923c', 16);
      this.addFloatingText('ROOK BULLDOZE!', newCenter.x, newCenter.y - 16, '#fb923c', false);
      for (const enemy of this.enemies) {
        if (Math.round(enemy.row) === piece.row && Math.abs(enemy.colPos - (piece.col + 0.5)) <= 1.2) {
          this.damageEnemy(enemy, 80, false, 1.0);
          enemy.colPos = Math.min(this.cols + 0.2, enemy.colPos + 0.65);
        }
      }
    } else if (piece.type === 'pawn' && move.isDiagonalCapture) {
      this.spawnParticles(newCenter.x, newCenter.y, '#38bdf8', 16);
      this.addFloatingText('⚔ DIAGONAL CAPTURE! (+30 XP)', newCenter.x, newCenter.y - 16, '#38bdf8', true);
      piece.xp = Math.min(100, piece.xp + 30);
      for (const enemy of this.enemies) {
        if (Math.round(enemy.row) === piece.row && Math.abs(enemy.colPos - (piece.col + 0.5)) <= 1.5) {
          this.damageEnemy(enemy, 95, true, 1.0);
        }
      }
    } else if (piece.type === 'pawn' && piece.col >= this.cols - 2) {
      piece.xp = Math.min(100, piece.xp + 35);
    }

    this.checkDiscoveredAttack(oldCol, oldRow, piece.id);
    this.recalculateSynergies();
  }

  checkDiscoveredAttack(vacatedCol, vacatedRow, movedPieceId) {
    for (const ally of this.pieces) {
      if (ally.id === movedPieceId) continue;
      if (ally.type !== 'rook' && ally.type !== 'bishop' && ally.type !== 'queen') continue;

      const sameRow = ally.row === vacatedRow && ally.col < vacatedCol;
      const sameDiag =
        Math.abs(ally.col - vacatedCol) === Math.abs(ally.row - vacatedRow) && ally.col < vacatedCol;

      if (
        ((ally.type === 'rook' || ally.type === 'queen') && sameRow) ||
        ((ally.type === 'bishop' || ally.type === 'queen') && sameDiag)
      ) {
        const c = this.renderer.tileCenter(ally.col, ally.row);
        this.addFloatingText('💥 DISCOVERED ATTACK! (1.6x)', c.x, c.y - 22, '#facc15', true);
        this.performPieceAttack(ally, 1.6);
        break;
      }
    }
  }

  // Full-Screen Cinematic 5-Pawn Line Merge into an Ascended Sovereign Queen! (دمج سطر جنود لوزير سينمائياً عبر الشاشة)
  tryMergePawnLine(anchorPawn = null) {
    if (this.mergeCinematic) return false;
    if (!this.readyPawnLines || this.readyPawnLines.length === 0) return false;

    let chosenLine = this.readyPawnLines[0];
    if (anchorPawn) {
      const match = this.readyPawnLines.find(line =>
        line.pawns.some(p => p.id === anchorPawn.id)
      );
      if (match) chosenLine = match;
    }

    const pawnsToMerge = chosenLine.pawns.slice(0, 5);
    if (pawnsToMerge.length < 5) return false;

    const targetPawn =
      anchorPawn && pawnsToMerge.some(p => p.id === anchorPawn.id)
        ? anchorPawn
        : pawnsToMerge[Math.floor(pawnsToMerge.length / 2)];

    const queenCenter = this.renderer.tileCenter(targetPawn.col, targetPawn.row);

    const sources = pawnsToMerge.map((p, idx) => {
      const pc = this.renderer.tileCenter(p.col, p.row);
      this.spawnParticles(pc.x, pc.y, '#facc15', 14);
      return {
        x: pc.x,
        y: pc.y,
        col: p.col,
        row: p.row,
        idx
      };
    });

    // Remove the other 4 Pawns and hide the anchor Pawn while the Full-Screen Cinematic plays
    const removeIds = new Set(pawnsToMerge.filter(p => p.id !== targetPawn.id).map(p => p.id));
    this.pieces = this.pieces.filter(p => !removeIds.has(p.id));
    targetPawn.inMergeCinematic = true;

    window.RoyalAudio.playChessMove(true);
    this.screenShake = 0.25;

    this.mergeCinematic = {
      elapsed: 0,
      duration: 1.95,
      climaxTriggered: false,
      targetPawn,
      targetCol: targetPawn.col,
      targetRow: targetPawn.row,
      targetX: queenCenter.x,
      targetY: queenCenter.y,
      sources
    };

    this.recalculateSynergies();
    this.updateHUD();
    return true;
  }

  updateMergeCinematic(rawDt) {
    const mc = this.mergeCinematic;
    if (!mc) return;

    mc.elapsed += rawDt;
    const prog = Math.min(1, mc.elapsed / mc.duration);

    // At 55% of the cinematic, the 5 flying Pawns collide at the center and ascend into the Sovereign Queen!
    if (prog >= 0.55 && !mc.climaxTriggered) {
      mc.climaxTriggered = true;
      const targetPawn = mc.targetPawn;
      const queenDef = window.CHESS_DATA.PIECES.queen;

      if (targetPawn) {
        targetPawn.inMergeCinematic = false;
        targetPawn.type = 'queen';
        targetPawn.maxHp = Math.round(queenDef.maxHp * 1.45); // 780 HP Ascended Queen!
        targetPawn.hp = targetPawn.maxHp;
        targetPawn.shieldHp = 300;
        targetPawn.attackTimer = 0.2;
        targetPawn.moveCd = 0;
        targetPawn.hexTimer = 0;
        this.selectedBoardPiece = targetPawn;
      }

      // Triple Golden Shockwave & Undead Repulsion
      this.spawnShockwave(mc.targetX, mc.targetY, 16, 240, '#fef08a');
      this.spawnShockwave(mc.targetX, mc.targetY, 10, 165, '#facc15');
      this.spawnParticles(mc.targetX, mc.targetY, '#facc15', 36);

      for (const enemy of this.enemies) {
        const dist = Math.hypot(enemy.colPos - (mc.targetCol + 0.5), enemy.row - mc.targetRow);
        if (dist <= 3.2) {
          this.damageEnemy(enemy, 145, true, dist);
          enemy.colPos = Math.min(this.cols + 0.2, enemy.colPos + 1.05);
        }
      }

      window.RoyalAudio.playPromotion();
      this.screenShake = 0.55;
      this.score += 300;

      this.addFloatingText(
        '👑 ارتقاء ملكي -> الوزير المتوّج!',
        mc.targetX,
        mc.targetY - 30,
        '#fef08a',
        true
      );
      this.recalculateSynergies();
      this.updateHUD();
    }

    if (mc.elapsed >= mc.duration) {
      if (mc.targetPawn) mc.targetPawn.inMergeCinematic = false;
      this.mergeCinematic = null;
      this.recalculateSynergies();
      this.updateHUD();
    }
  }

  tryPromotePawn(pawn) {
    if (!pawn || pawn.type !== 'pawn') return;
    if (pawn.inReadyPawnLine) {
      this.tryMergePawnLine(pawn);
      return;
    }
    if (pawn.xp < 100) return;

    const promoteCost = window.CHESS_DATA.PIECES.pawn.promoteCost || 125;
    const center = this.renderer.tileCenter(pawn.col, pawn.row);

    if (this.mana < promoteCost) {
      this.flashManaWarning();
      this.addFloatingText(`NEED ${promoteCost} MANA TO CROWN!`, center.x, center.y - 18, '#fbbf24', true);
      return;
    }

    this.mana -= promoteCost;

    const currentQueens = this.countPiecesOfType('queen');
    const targetType = currentQueens < 2 ? 'queen' : 'knight';
    const targetDef = window.CHESS_DATA.PIECES[targetType];

    pawn.type = targetType;
    pawn.maxHp = targetDef.maxHp;
    pawn.hp = targetDef.maxHp;
    pawn.shieldHp = 120;
    pawn.attackTimer = 0.4;
    pawn.moveCd = 0;

    window.RoyalAudio.playPromotion();
    this.screenShake = 0.3;
    this.spawnShockwave(center.x, center.y, 12, 130, '#facc15');
    this.spawnParticles(center.x, center.y, '#facc15', 28);
    this.addFloatingText(
      targetType === 'queen'
        ? '👑 تمت الترقية إلى الوزير الملكي!'
        : '⚡ تمت الترقية إلى فارس العاصفة! (الحد 2 وزير)',
      center.x,
      center.y - 24,
      '#fef08a',
      true
    );
    this.score += 175;
    this.recalculateSynergies();
    this.updateHUD();
  }

  sacrificePiece(piece) {
    const def = window.CHESS_DATA.PIECES[piece.type];
    const refund = Math.floor(def.cost * 0.6);
    this.mana += refund;

    const center = this.renderer.tileCenter(piece.col, piece.row);
    this.spawnParticles(center.x, center.y, '#f43f5e', 20);
    this.addFloatingText(`SACRIFICED (+${refund} MANA)`, center.x, center.y - 14, '#fb7185', true);

    for (const enemy of this.enemies) {
      if (
        Math.abs(enemy.row - piece.row) <= 1.1 &&
        Math.abs(enemy.colPos - (piece.col + 0.5)) <= 1.5
      ) {
        this.damageEnemy(enemy, 90, true, 1.0);
      }
    }

    if (this.selectedBoardPiece && this.selectedBoardPiece.id === piece.id) {
      this.selectedBoardPiece = null;
    }
    this.pieces = this.pieces.filter(p => p.id !== piece.id);
    window.RoyalAudio.playHit(true);
    this.recalculateSynergies();
    this.updateHUD();
  }

  triggerCheckmateUltimate() {
    if (this.ultimateCharge < 100 || this.paused || this.gameOver) return;
    this.ultimateCharge = 0;
    this.screenShake = 0.5;
    window.RoyalAudio.playUltimate();

    this.announceBanner('⚡ CHECKMATE OVERLOAD!', 'Sovereign Sky-Spears Strike Every Rank!');

    for (const enemy of [...this.enemies]) {
      const ex = this.renderer.boardLeft + enemy.colPos * this.renderer.tileSize;
      const ey = this.renderer.boardTop + (enemy.row + 0.5) * this.renderer.tileSize;
      this.beams.push({
        x1: ex - 25,
        y1: 0,
        x2: ex,
        y2: ey,
        color: '#facc15',
        width: 7,
        life: 0.45,
        maxLife: 0.45
      });
      this.spawnParticles(ex, ey, '#facc15', 16);
      this.damageEnemy(enemy, enemy.isBoss ? 420 : 260, true, 1.0);
    }

    for (const piece of this.pieces) {
      piece.hp = Math.min(piece.maxHp, piece.hp + 120);
      piece.hexTimer = 0;
      piece.moveCd = 0;
    }

    this.updateHUD();
  }

  recalculateSynergies() {
    this.batteryLinks = [];
    this.pawnChainLinks = [];
    this.readyPawnLines = [];
    this.mergeCinematic = null;

    for (const p of this.pieces) {
      p.buffedByKing = false;
      p.buffedByChalice = false;
      p.inBattery = false;
      p.inPawnChain = false;
      p.inReadyPawnLine = false;
    }

    for (let i = 0; i < this.pieces.length; i++) {
      const a = this.pieces[i];

      if (a.type === 'king' || a.type === 'chalice') {
        for (const b of this.pieces) {
          if (a.id !== b.id && Math.abs(a.col - b.col) <= 1 && Math.abs(a.row - b.row) <= 1) {
            if (a.type === 'king') b.buffedByKing = true;
            if (a.type === 'chalice') b.buffedByChalice = true;
          }
        }
      }

      for (let j = i + 1; j < this.pieces.length; j++) {
        const b = this.pieces[j];

        if (a.type === 'pawn' && b.type === 'pawn') {
          if (Math.abs(a.col - b.col) === 1 && Math.abs(a.row - b.row) === 1) {
            a.inPawnChain = true;
            b.inPawnChain = true;
            this.pawnChainLinks.push({ a, b });
          }
        }

        const lineTypes = ['rook', 'bishop', 'queen'];
        if (lineTypes.includes(a.type) && lineTypes.includes(b.type)) {
          const sameOrth = (a.row === b.row || a.col === b.col) && Math.hypot(a.col - b.col, a.row - b.row) <= 4;
          const sameDiag =
            Math.abs(a.col - b.col) === Math.abs(a.row - b.row) && Math.abs(a.col - b.col) <= 4;

          const orthValid =
            sameOrth &&
            (a.type === 'rook' || a.type === 'queen') &&
            (b.type === 'rook' || b.type === 'queen');
          const diagValid =
            sameDiag &&
            (a.type === 'bishop' || a.type === 'queen') &&
            (b.type === 'bishop' || b.type === 'queen');

          if (orthValid || diagValid) {
            a.inBattery = true;
            b.inBattery = true;
            this.batteryLinks.push({ a, b });
          }
        }
      }
    }

    // Check Vertical Columns (5 Pawns across all 5 Ranks in column c)
    const allPawns = this.pieces.filter(p => p.type === 'pawn');
    for (let c = 0; c < this.cols; c++) {
      const colPawns = allPawns.filter(p => p.col === c).sort((a, b) => a.row - b.row);
      if (colPawns.length >= 5) {
        this.readyPawnLines.push({ kind: 'col', index: c, pawns: colPawns.slice(0, 5) });
        colPawns.slice(0, 5).forEach(p => {
          p.inReadyPawnLine = true;
        });
      }
    }

    // Check Horizontal Rows (5+ Pawns in the same Rank r)
    for (let r = 0; r < this.rows; r++) {
      const rowPawns = allPawns.filter(p => p.row === r).sort((a, b) => a.col - b.col);
      if (rowPawns.length >= 5) {
        this.readyPawnLines.push({ kind: 'row', index: r, pawns: rowPawns.slice(0, 5) });
        rowPawns.slice(0, 5).forEach(p => {
          p.inReadyPawnLine = true;
        });
      }
    }
  }

  getAttackVisionSquares(pieceType, col, row) {
    const squares = [];
    const addSq = (c, r, isCrit = false) => {
      if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
        squares.push({ col: c, row: r, isCrit });
      }
    };

    switch (pieceType) {
      case 'chalice':
      case 'king':
        for (let dc = -1; dc <= 1; dc++) {
          for (let dr = -1; dr <= 1; dr++) {
            if (dc !== 0 || dr !== 0) addSq(col + dc, row + dr, pieceType === 'king');
          }
        }
        break;

      case 'pawn':
        // Pure Frontline Shield Pusher: Physical Shield Shove directly in front (col+1, row)
        addSq(col + 1, row, false);
        break;

      case 'rook':
        for (let step = 1; step <= 5; step++) {
          addSq(col + step, row, false);
          addSq(col - step, row, false);
          addSq(col, row + step, false);
          addSq(col, row - step, false);
        }
        break;

      case 'knight':
        [
          [2, 1],
          [2, -1],
          [-2, 1],
          [-2, -1],
          [1, 2],
          [1, -2],
          [-1, 2],
          [-1, -2]
        ].forEach(([dc, dr]) => addSq(col + dc, row + dr, true));
        break;

      case 'bishop':
        [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1]
        ].forEach(([dc, dr]) => {
          for (let s = 1; s <= 4; s++) addSq(col + dc * s, row + dr * s, false);
        });
        break;

      case 'queen':
        [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1]
        ].forEach(([dc, dr]) => {
          for (let s = 1; s <= 3; s++) addSq(col + dc * s, row + dr * s, true);
        });
        break;
    }

    return squares;
  }

  loop(timestamp) {
    const rawDt = Math.min(0.05, (timestamp - this.lastTimestamp) / 1000);
    this.lastTimestamp = timestamp;

    if (!this.paused && !this.gameOver) {
      if (this.mergeCinematic) {
        this.updateMergeCinematic(rawDt);
      }
      const simSpeed = this.mergeCinematic ? 0.12 : this.gameSpeed;
      const dt = rawDt * simSpeed;
      this.update(dt);
    }

    this.renderer.render(timestamp / 1000);
    requestAnimationFrame(ts => this.loop(ts));
  }

  update(dt) {
    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 1.5);

    for (const k of Object.keys(this.cardCooldowns)) {
      if (this.cardCooldowns[k] > 0) {
        this.cardCooldowns[k] = Math.max(0, this.cardCooldowns[k] - dt);
      }
    }

    this.skyManaTimer -= dt;
    if (this.skyManaTimer <= 0) {
      this.skyManaTimer = this.currentAct.skyDropInterval || 6.8;
      const randCol = 1 + Math.floor(Math.random() * (this.cols - 2));
      const randRow = Math.floor(Math.random() * this.rows);
      const target = this.renderer.tileCenter(randCol, randRow);
      this.spawnManaOrb(target.x, 18, target.y, 25);
    }

    this.updateWaves(dt);
    this.updatePieces(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updateChariots(dt);
    this.updateVFX(dt);

    this.updateHUD();
  }

  updateWaves(dt) {
    if (this.waveSpawnQueue.length > 0) {
      this.waveSpawnQueue[0].delay -= dt;
      if (this.waveSpawnQueue[0].delay <= 0) {
        const item = this.waveSpawnQueue.shift();
        this.spawnEnemy(item.type, item.row);
      }
      return;
    }

    if (this.enemies.length === 0) {
      this.waveCooldownTimer -= dt;
      if (this.waveCooldownTimer <= 0) {
        this.startNextWave();
      }
    }
  }

  startNextWave() {
    const act = this.currentAct;

    if (!act.isEndless && this.waveIndex >= act.waves.length) {
      this.handleActVictory();
      return;
    }

    let waveDef;
    if (act.isEndless) {
      waveDef = this.generateEndlessWave(this.waveIndex + 1);
    } else {
      waveDef = act.waves[this.waveIndex];
    }

    this.waveIndex++;
    this.waveCooldownTimer = 3.8;

    this.waveSpawnQueue = [];
    for (const group of waveDef.spawns) {
      for (let i = 0; i < group.count; i++) {
        this.waveSpawnQueue.push({
          type: group.type,
          row: this.pickStrategicSpawnRow(group.type),
          delay: i === 0 ? 0.6 : group.interval * (0.75 + Math.random() * 0.4)
        });
      }
    }

    this.updateWaveThreatIcons(waveDef);

    if (waveDef.isFlag) {
      window.RoyalAudio.playWaveHorn();
      window.RoyalAudio.setIntenseMode(true);
      this.announceBanner(`🚩 ${waveDef.label}`, `Wave ${this.waveIndex} — A Massive Horde Approaches!`);
    } else {
      window.RoyalAudio.setIntenseMode(false);
    }
  }

  updateWaveThreatIcons(waveDef = null) {
    const container = document.getElementById('waveEnemyIcons');
    if (!container) return;

    const act = this.currentAct;
    const targetWave =
      waveDef ||
      (!act.isEndless && act.waves[Math.min(this.waveIndex, act.waves.length - 1)]) ||
      null;

    if (!targetWave || !targetWave.spawns) {
      container.innerHTML = '';
      return;
    }

    const uniqueTypes = [...new Set(targetWave.spawns.map(s => s.type))];
    container.innerHTML = uniqueTypes
      .map(t => {
        const url = window.RoyalSprites ? window.RoyalSprites.enemyDataUrls[t] : '';
        const eDef = window.CHESS_DATA.ENEMIES[t];
        return `<img src="${url}" alt="${eDef ? eDef.name : t}" title="${eDef ? eDef.name : t}" class="wave-mini-enemy" />`;
      })
      .join('');
  }

  pickStrategicSpawnRow(enemyType) {
    if (enemyType === 'assassin' || enemyType === 'necro') {
      const royalty = this.pieces.filter(p => p.type === 'queen' || p.type === 'king' || p.type === 'bishop');
      if (royalty.length > 0) {
        const chosen = royalty[Math.floor(Math.random() * royalty.length)];
        return chosen.row;
      }
    }
    return Math.floor(Math.random() * this.rows);
  }

  generateEndlessWave(waveNum) {
    const isFlag = waveNum % 3 === 0;
    const spawns = [
      { type: 'thrall', count: 3 + Math.floor(waveNum * 0.8), interval: 1.9 },
      { type: 'buckler', count: 2 + Math.floor(waveNum * 0.75), interval: 2.1 },
      { type: 'sprinter', count: 2 + Math.floor(waveNum * 0.6), interval: 2.1 },
      { type: 'assassin', count: 1 + Math.floor(waveNum * 0.55), interval: 2.3 }
    ];
    if (waveNum >= 2) {
      spawns.push({ type: 'necro', count: Math.ceil(waveNum * 0.5), interval: 2.5 });
    }
    if (isFlag) {
      spawns.push({ type: 'gargantua', count: Math.max(1, Math.floor(waveNum / 2.5)), interval: 3.8 });
    }
    return {
      label: isFlag ? `IMMORTAL GAMBIT WAVE ${waveNum}` : `Endless Wave ${waveNum}`,
      isFlag,
      spawns
    };
  }

  spawnEnemy(type, row) {
    const def = window.CHESS_DATA.ENEMIES[type];
    if (!def) return;

    const scale = this.currentAct.isEndless ? 1 + this.waveIndex * 0.1 : 1;

    this.enemies.push({
      id: this.entityIdCounter++,
      type,
      row,
      colPos: this.cols - 0.05 + Math.random() * 0.25,
      hp: Math.round(def.maxHp * scale),
      maxHp: Math.round(def.maxHp * scale),
      shieldHp: Math.round(def.shieldHp * scale),
      maxShieldHp: Math.round(def.shieldHp * scale),
      speed: def.speed,
      dps: def.dps,
      isBoss: Boolean(def.isBoss),
      isAttacking: false,
      hasVaulted: false,
      vaultAnimTimer: 0,
      hasThrownImp: false,
      rangedTimer: def.rangedInterval || 2.6,
      slowTimer: 0,
      burnTimer: 0,
      hitFlash: 0
    });
  }

  updatePieces(dt) {
    for (const piece of this.pieces) {
      if (piece.inMergeCinematic) continue;
      if (piece.recoilTimer > 0) piece.recoilTimer = Math.max(0, piece.recoilTimer - dt);
      if (piece.shoveTimer > 0) piece.shoveTimer = Math.max(0, piece.shoveTimer - dt);
      if (piece.moveAnimTimer > 0) piece.moveAnimTimer = Math.max(0, piece.moveAnimTimer - dt);
      if (piece.moveCd > 0) piece.moveCd = Math.max(0, piece.moveCd - dt);
      if (piece.hexTimer > 0) piece.hexTimer = Math.max(0, piece.hexTimer - dt);

      // Phalanx Shield-Pawn Defender: light synergy repair in Pawn Chain (balanced, not immortal!)
      if (piece.type === 'pawn') {
        const hpRegen = piece.inPawnChain || piece.inReadyPawnLine ? 4 : 0;
        if (hpRegen > 0 && piece.hp < piece.maxHp) {
          piece.hp = Math.min(piece.maxHp, piece.hp + hpRegen * dt);
        }
        if (piece.shieldHp < 90) {
          piece.shieldHp = Math.min(90, piece.shieldHp + 2.0 * dt);
        }
      } else if (piece.inPawnChain && piece.hp < piece.maxHp) {
        piece.hp = Math.min(piece.maxHp, piece.hp + 5 * dt);
      }

      let speedMult = 1.0;
      if (piece.buffedByKing) speedMult += 0.3;
      if (piece.buffedByChalice) speedMult += 0.15;
      if (piece.hexTimer > 0) speedMult *= 0.6;

      piece.attackTimer -= dt * speedMult;
      if (piece.attackTimer <= 0) {
        const def = window.CHESS_DATA.PIECES[piece.type];
        const didAct = this.performPieceAttack(piece, 1.0);
        piece.attackTimer = didAct ? def.attackInterval : 0.25;
      }
    }
  }

  performPieceAttack(piece, bonusMultiplier = 1.0) {
    const def = window.CHESS_DATA.PIECES[piece.type];
    const center = this.renderer.tileCenter(piece.col, piece.row);
    const batteryMult = piece.inBattery ? 1.3 : 1.0;
    const totalMult = bonusMultiplier * batteryMult;

    switch (piece.type) {
      case 'chalice': {
        this.spawnManaOrb(center.x, center.y - 12, center.y + 10, def.manaYield || 30);
        piece.recoilTimer = 0.16;
        return true;
      }

      case 'pawn': {
        // Pure Physical Shield Pusher (NO lasers, NO beams, NO projectiles!)
        const meleeEnemies = this.enemies.filter(
          e =>
            Math.round(e.row) === piece.row &&
            e.colPos >= piece.col - 0.15 &&
            e.colPos <= piece.col + 1.38
        );
        if (meleeEnemies.length === 0) return false;

        // Forward physical shield lunge + dust & shockwave
        piece.shoveTimer = 0.30;
        this.spawnShockwave(center.x + 18, center.y, 8, 42, '#38bdf8');
        this.spawnParticles(center.x + 22, center.y, '#38bdf8', 10);

        for (const target of meleeEnemies) {
          this.damageEnemy(target, def.damage * totalMult, false, 0.8);
          // Physically shove enemies backward down the rank!
          target.colPos = Math.min(this.cols + 0.2, target.colPos + 0.42);
          target.slowTimer = Math.max(target.slowTimer, 0.85);
        }

        this.addFloatingText('🛡 دفع!', center.x + 18, center.y - 18, '#7dd3fc', false);
        piece.xp = Math.min(100, piece.xp + 14);
        window.RoyalAudio.playAttack('pawn');
        return true;
      }

      case 'rook': {
        const rankEnemies = this.enemies.filter(
          e => Math.round(e.row) === piece.row && Math.abs(e.colPos - (piece.col + 0.5)) <= 5.2
        );
        const fileEnemies = this.enemies.filter(
          e => Math.abs(e.colPos - (piece.col + 0.5)) <= 0.65
        );

        if (rankEnemies.length === 0 && fileEnemies.length === 0) return false;

        if (rankEnemies.length > 0) {
          const maxCol = Math.min(this.cols, piece.col + 5.5);
          this.beams.push({
            x1: center.x,
            y1: center.y,
            x2: this.renderer.boardLeft + maxCol * this.renderer.tileSize,
            y2: center.y,
            color: '#fb923c',
            width: 5.5,
            life: 0.25,
            maxLife: 0.25
          });
          for (const e of rankEnemies) {
            const dist = Math.abs(e.colPos - (piece.col + 0.5));
            this.damageEnemy(e, def.damage * totalMult, false, dist);
          }
        }

        if (fileEnemies.length > 0) {
          this.beams.push({
            x1: center.x,
            y1: this.renderer.boardTop,
            x2: center.x,
            y2: this.renderer.boardTop + this.rows * this.renderer.tileSize,
            color: '#fb923c',
            width: 5.5,
            life: 0.25,
            maxLife: 0.25
          });
          for (const e of fileEnemies) {
            const dist = Math.abs(e.row - piece.row);
            this.damageEnemy(e, def.damage * totalMult, false, dist);
          }
        }

        piece.recoilTimer = 0.18;
        window.RoyalAudio.playAttack('rook');
        return true;
      }

      case 'knight': {
        const lSquares = [
          [2, 1],
          [2, -1],
          [-2, 1],
          [-2, -1],
          [1, 2],
          [1, -2],
          [-1, 2],
          [-1, -2]
        ];
        const hitEnemies = [];

        for (const [dc, dr] of lSquares) {
          const tc = piece.col + dc;
          const tr = piece.row + dr;
          if (tc < 0 || tc >= this.cols || tr < 0 || tr >= this.rows) continue;

          for (const e of this.enemies) {
            if (Math.round(e.row) === tr && Math.abs(e.colPos - (tc + 0.5)) <= 0.78) {
              hitEnemies.push({ enemy: e, tc, tr });
            }
          }
        }

        if (hitEnemies.length === 0) return false;

        const isFork = hitEnemies.length >= 2;
        const forkMult = isFork ? 1.4 : 1.0;

        for (const item of hitEnemies) {
          const ex = this.renderer.boardLeft + item.enemy.colPos * this.renderer.tileSize;
          const ey = this.renderer.boardTop + (item.enemy.row + 0.5) * this.renderer.tileSize;
          this.beams.push({
            x1: center.x,
            y1: center.y - 10,
            x2: ex,
            y2: ey,
            color: isFork ? '#facc15' : '#c084fc',
            width: isFork ? 4.5 : 3.2,
            life: 0.25,
            maxLife: 0.25,
            isLightning: true
          });
          this.damageEnemy(item.enemy, def.damage * totalMult * forkMult, true, 2.0);
        }

        if (isFork) {
          this.addFloatingText(
            `⚡ ROYAL FORK! (${hitEnemies.length}x HIT)`,
            center.x,
            center.y - 24,
            '#fde047',
            true
          );
        }

        piece.recoilTimer = 0.18;
        window.RoyalAudio.playAttack('knight');
        return true;
      }

      case 'bishop': {
        const isLightSquare = (piece.row + piece.col) % 2 === 0;
        const diagEnemies = this.enemies.filter(e => {
          const dCol = Math.abs(e.colPos - (piece.col + 0.5));
          const dRow = Math.abs(e.row - piece.row);
          return dRow >= 0.35 && dRow <= 4.5 && Math.abs(dCol - dRow) <= 0.65;
        });

        if (diagEnemies.length === 0) return false;

        const dirs = [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1]
        ];
        for (const [dc, dr] of dirs) {
          const maxSteps = 4;
          const endCol = Math.max(0, Math.min(this.cols - 1, piece.col + dc * maxSteps));
          const endRow = Math.max(0, Math.min(this.rows - 1, piece.row + dr * maxSteps));
          const endPt = this.renderer.tileCenter(endCol, endRow);
          this.beams.push({
            x1: center.x,
            y1: center.y,
            x2: endPt.x,
            y2: endPt.y,
            color: isLightSquare ? '#fbbf24' : '#2dd4bf',
            width: 3.5,
            life: 0.24,
            maxLife: 0.24
          });
        }

        for (const e of diagEnemies) {
          const dist = Math.hypot(e.colPos - (piece.col + 0.5), e.row - piece.row);
          this.damageEnemy(e, def.damage * totalMult * (isLightSquare ? 1.2 : 1.0), true, dist);
          if (isLightSquare) {
            e.burnTimer = 2.8;
          } else {
            e.slowTimer = 3.0;
          }
        }

        for (const ally of this.pieces) {
          if (
            ally.id !== piece.id &&
            Math.abs(ally.col - piece.col) === Math.abs(ally.row - piece.row)
          ) {
            ally.hp = Math.min(ally.maxHp, ally.hp + 18);
            if (ally.hexTimer > 0) {
              ally.hexTimer = 0;
              const ac = this.renderer.tileCenter(ally.col, ally.row);
              this.addFloatingText('✨ HEX CLEANSED!', ac.x, ac.y - 16, '#2dd4bf', false);
            }
          }
        }

        piece.recoilTimer = 0.18;
        window.RoyalAudio.playAttack('bishop');
        return true;
      }

      case 'king': {
        const nearby = this.enemies.filter(
          e =>
            Math.abs(e.row - piece.row) <= 1.35 &&
            Math.abs(e.colPos - (piece.col + 0.5)) <= 1.85
        );
        if (nearby.length === 0) return false;

        this.spawnShockwave(center.x, center.y, 10, 95, '#fb7185');
        this.spawnParticles(center.x, center.y, '#fb7185', 16);
        for (const e of nearby) {
          this.damageEnemy(e, def.damage * totalMult, true, 1.2);
          e.colPos = Math.min(this.cols + 0.2, e.colPos + 0.25);
        }
        piece.recoilTimer = 0.18;
        window.RoyalAudio.playAttack('king');
        return true;
      }

      case 'queen': {
        const maxRange = def.maxRange || 3.6;
        const rayCandidates = [];

        for (const e of this.enemies) {
          const dCol = e.colPos - (piece.col + 0.5);
          const dRow = e.row - piece.row;
          const dist = Math.hypot(dCol, dRow);
          if (dist > maxRange) continue;

          const onRank = Math.abs(dRow) <= 0.42;
          const onFile = Math.abs(dCol) <= 0.55;
          const onDiag = Math.abs(Math.abs(dCol) - Math.abs(dRow)) <= 0.55;

          if (onRank || onFile || onDiag) {
            rayCandidates.push({ enemy: e, dist });
          }
        }

        if (rayCandidates.length === 0) return false;

        rayCandidates.sort((a, b) => a.dist - b.dist);
        const chosen = rayCandidates.slice(0, 2);

        for (const item of chosen) {
          const e = item.enemy;
          const ex = this.renderer.boardLeft + e.colPos * this.renderer.tileSize;
          const ey = this.renderer.boardTop + (e.row + 0.5) * this.renderer.tileSize;
          this.beams.push({
            x1: center.x,
            y1: center.y - 8,
            x2: ex,
            y2: ey,
            color: '#facc15',
            width: 4.5,
            life: 0.24,
            maxLife: 0.24
          });
          this.damageEnemy(e, def.damage * totalMult, true, item.dist);
        }

        piece.recoilTimer = 0.18;
        window.RoyalAudio.playAttack('queen');
        return true;
      }
    }

    return false;
  }

  updateEnemies(dt) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt * 5);
      if (e.vaultAnimTimer > 0) e.vaultAnimTimer = Math.max(0, e.vaultAnimTimer - dt);

      if (e.burnTimer > 0) {
        e.burnTimer -= dt;
        e.hp -= 16 * dt;
        if (e.hp <= 0) {
          this.killEnemy(e);
          continue;
        }
      }

      let speedMult = 1.0;
      if (e.slowTimer > 0) {
        e.slowTimer -= dt;
        speedMult = 0.58;
      }

      const blockingPiece = this.pieces.find(
        p =>
          p.row === Math.round(e.row) &&
          e.colPos >= p.col + 0.15 &&
          e.colPos <= p.col + 0.95
      );
      e.isAttacking = Boolean(blockingPiece);

      if (blockingPiece && (e.type === 'sprinter' || e.type === 'assassin') && !e.hasVaulted) {
        if (e.type === 'assassin' && blockingPiece.type === 'rook') {
          // Stopped by Aegis Rook!
        } else {
          e.hasVaulted = true;
          e.vaultAnimTimer = 0.55;
          if (e.type === 'sprinter') {
            e.speed = window.CHESS_DATA.ENEMIES.sprinter.postVaultSpeed || 0.35;
          }
          e.colPos = Math.max(0.2, blockingPiece.col - 0.35);

          const adjQueen = this.pieces.find(
            p => p.type === 'queen' && Math.abs(p.row - e.row) === 1
          );
          if (adjQueen) {
            e.row = adjQueen.row;
          } else if (e.row > 0 && Math.random() < 0.5) {
            e.row -= 1;
          } else if (e.row < this.rows - 1) {
            e.row += 1;
          }

          const ex = this.renderer.boardLeft + e.colPos * this.renderer.tileSize;
          const ey = this.renderer.boardTop + (e.row + 0.5) * this.renderer.tileSize;
          this.addFloatingText(
            e.type === 'assassin' ? '🗡 SHADOW L-AMBUSH!' : 'KNIGHT-VAULT!',
            ex,
            ey - 22,
            e.type === 'assassin' ? '#f43f5e' : '#c084fc',
            true
          );
          continue;
        }
      }

      if (e.type === 'necro' && !blockingPiece && e.colPos <= this.cols - 1.2 && e.colPos >= 2.0) {
        e.rangedTimer -= dt;
        if (e.rangedTimer <= 0) {
          e.rangedTimer = 2.8;
          if (this.pieces.length > 0) {
            const sortedTargets = [...this.pieces].sort((a, b) => {
              const prio = { queen: 3, king: 2, bishop: 2 };
              return (prio[b.type] || 1) - (prio[a.type] || 1);
            });
            const targetPiece = sortedTargets[0];
            const tc = this.renderer.tileCenter(targetPiece.col, targetPiece.row);
            const ex = this.renderer.boardLeft + e.colPos * this.renderer.tileSize;
            const ey = this.renderer.boardTop + (e.row + 0.5) * this.renderer.tileSize;
            this.beams.push({
              x1: ex,
              y1: ey - 10,
              x2: tc.x,
              y2: tc.y,
              color: '#2dd4bf',
              width: 3.5,
              life: 0.28,
              maxLife: 0.28
            });
            targetPiece.hexTimer = 4.0;
            this.damagePiece(targetPiece, 32);
            this.addFloatingText('☠ HEXED (-40% SPD)', tc.x, tc.y - 18, '#2dd4bf', false);
          }
        }
      }

      if (e.isBoss && !e.hasThrownImp && e.hp <= e.maxHp * 0.55) {
        e.hasThrownImp = true;
        const impDef = window.CHESS_DATA.ENEMIES.imp;
        this.enemies.push({
          id: this.entityIdCounter++,
          type: 'imp',
          row: Math.floor(Math.random() * this.rows),
          colPos: 2.0,
          hp: impDef.maxHp,
          maxHp: impDef.maxHp,
          shieldHp: 0,
          maxShieldHp: 0,
          speed: impDef.speed,
          dps: impDef.dps,
          isBoss: false,
          isAttacking: false,
          hasVaulted: false,
          vaultAnimTimer: 0.5,
          slowTimer: 0,
          burnTimer: 0,
          hitFlash: 0
        });
        const ex = this.renderer.boardLeft + e.colPos * this.renderer.tileSize;
        const ey = this.renderer.boardTop + (e.row + 0.5) * this.renderer.tileSize;
        this.addFloatingText('IMP LAUNCHED!', ex, ey - 32, '#f97316', true);
      }

      if (blockingPiece) {
        const assassinBonus =
          e.type === 'assassin' && (blockingPiece.type === 'queen' || blockingPiece.type === 'bishop')
            ? 1.5
            : 1.0;
        this.damagePiece(blockingPiece, e.dps * assassinBonus * dt);
      } else {
        e.colPos -= e.speed * speedMult * dt;
      }

      if (e.colPos < -0.05) {
        const sentinel = this.chariots[Math.round(e.row)];
        if (sentinel && !sentinel.used) {
          sentinel.used = true;
          sentinel.active = true;
          sentinel.x = this.renderer.chariotX;
          window.RoyalAudio.playChariotCharge();
          this.screenShake = 0.38;
          this.addFloatingText(
            '🪽 القلعة المجنحة: تطهير الصف! • WINGED ROOK SWEEP!',
            this.renderer.boardLeft + 210,
            this.renderer.boardTop + (sentinel.row + 0.5) * this.renderer.tileSize,
            '#fef08a',
            true
          );
        } else if (!sentinel || !sentinel.active) {
          this.handleDefeat();
          return;
        }
      }
    }
  }

  damagePiece(piece, amount) {
    let dmg = amount;
    if (piece.buffedByKing) dmg *= 0.75;
    if (piece.inPawnChain || piece.inReadyPawnLine) dmg *= 0.85;

    if (piece.shieldHp > 0) {
      const absorbed = Math.min(piece.shieldHp, dmg);
      piece.shieldHp -= absorbed;
      dmg -= absorbed;
    }

    piece.hp -= dmg;
    if (piece.hp <= 0) {
      const c = this.renderer.tileCenter(piece.col, piece.row);
      this.spawnParticles(c.x, c.y, '#ef4444', 18);
      if (this.selectedBoardPiece && this.selectedBoardPiece.id === piece.id) {
        this.selectedBoardPiece = null;
      }
      this.pieces = this.pieces.filter(p => p.id !== piece.id);
      this.recalculateSynergies();
    }
  }

  damageEnemy(enemy, amount, bypassHalfShield = false, distanceSquares = 1.5) {
    if (!enemy || enemy.hp <= 0) return;
    enemy.hitFlash = 1.0;

    let remaining = amount;

    if ((enemy.type === 'assassin' || enemy.isBoss) && distanceSquares > 2.5) {
      remaining *= 0.55;
    }

    if (enemy.shieldHp > 0) {
      if (bypassHalfShield) {
        const shieldDmg = remaining * 0.5;
        enemy.shieldHp = Math.max(0, enemy.shieldHp - shieldDmg);
        enemy.hp -= remaining * 0.5;
        window.RoyalAudio.playHit(true);
      } else {
        const absorbed = Math.min(enemy.shieldHp, remaining);
        enemy.shieldHp -= absorbed;
        remaining -= absorbed;
        enemy.hp -= remaining;
        window.RoyalAudio.playHit(true);
      }
    } else {
      enemy.hp -= remaining;
      window.RoyalAudio.playHit(false);
    }

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  killEnemy(enemy) {
    const idx = this.enemies.findIndex(e => e.id === enemy.id);
    if (idx === -1) return;
    this.enemies.splice(idx, 1);

    const def = window.CHESS_DATA.ENEMIES[enemy.type];
    const ex = this.renderer.boardLeft + enemy.colPos * this.renderer.tileSize;
    const ey = this.renderer.boardTop + (enemy.row + 0.5) * this.renderer.tileSize;

    const lanePawn = this.pieces.find(p => p.type === 'pawn' && p.row === Math.round(enemy.row));
    if (lanePawn) {
      lanePawn.xp = Math.min(100, lanePawn.xp + 18);
    }

    this.score += def.score || 50;
    this.ultimateCharge = Math.min(100, this.ultimateCharge + (enemy.isBoss ? 30 : 7));
    this.spawnParticles(ex, ey, def.color || '#84cc16', enemy.isBoss ? 30 : 14);

    if (enemy.isBoss || Math.random() < 0.35) {
      this.spawnManaOrb(ex, ey - 10, ey + 6, def.manaDrop || 20);
    }
  }

  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      let hit = false;
      for (const e of this.enemies) {
        if (Math.round(e.row) === p.row) {
          const ex = this.renderer.boardLeft + e.colPos * this.renderer.tileSize;
          if (Math.abs(p.x - ex) <= 22) {
            const dist = Math.abs(e.colPos - (p.originCol || 0));
            this.damageEnemy(e, p.damage, false, dist);
            this.spawnParticles(p.x, p.y, p.color, 6);
            hit = true;
            break;
          }
        }
      }

      if (hit || p.x > this.renderer.width + 40) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  updateChariots(dt) {
    for (const sentinel of this.chariots) {
      if (!sentinel.active) continue;
      sentinel.x += 620 * dt;

      const cy = this.renderer.boardTop + (sentinel.row + 0.5) * this.renderer.tileSize;
      if (Math.random() < 0.45) {
        this.spawnParticles(sentinel.x, cy, '#facc15', 2);
      }

      for (const e of [...this.enemies]) {
        if (Math.round(e.row) === sentinel.row) {
          const ex = this.renderer.boardLeft + e.colPos * this.renderer.tileSize;
          if (Math.abs(sentinel.x - ex) <= 42) {
            this.damageEnemy(e, 9999, true, 0);
          }
        }
      }

      if (sentinel.x > this.renderer.width + 60) {
        sentinel.active = false;
      }
    }
  }

  spawnManaOrb(x, startY, targetY, value = 25) {
    this.manaOrbs.push({
      id: this.entityIdCounter++,
      x,
      y: startY,
      targetY,
      value,
      life: 11.0,
      collected: false,
      autoCollectDelay: 0.85
    });
  }

  collectManaOrb(orb) {
    if (orb.collected) return;
    orb.collected = true;
    this.mana += orb.value;
    window.RoyalAudio.playManaCollect();
    this.addFloatingText(`+${orb.value} MANA`, orb.x, orb.y - 10, '#fef08a', false);
    this.updateHUD();
  }

  updateVFX(dt) {
    for (let i = this.beams.length - 1; i >= 0; i--) {
      this.beams[i].life -= dt;
      if (this.beams[i].life <= 0) this.beams.splice(i, 1);
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      this.shockwaves[i].life -= dt;
      if (this.shockwaves[i].life <= 0) this.shockwaves.splice(i, 1);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.manaOrbs.length - 1; i >= 0; i--) {
      const orb = this.manaOrbs[i];
      if (orb.collected) {
        orb.x += (90 - orb.x) * 9 * dt;
        orb.y += (30 - orb.y) * 9 * dt;
        if (Math.hypot(orb.x - 90, orb.y - 30) < 24) {
          this.manaOrbs.splice(i, 1);
        }
        continue;
      }

      if (orb.y < orb.targetY) {
        orb.y = Math.min(orb.targetY, orb.y + 115 * dt);
      } else if (this.autoCollectMana) {
        orb.autoCollectDelay -= dt;
        if (orb.autoCollectDelay <= 0) {
          this.collectManaOrb(orb);
        }
      }

      orb.life -= dt;
      if (orb.life <= 0) this.manaOrbs.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 28 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  spawnShockwave(x, y, startR = 10, endR = 90, color = '#facc15') {
    this.shockwaves.push({
      x,
      y,
      startR,
      endR,
      color,
      life: 0.38,
      maxLife: 0.38
    });
  }

  spawnParticles(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 35 + Math.random() * 115;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.2 + Math.random() * 3.2,
        color,
        life: 0.35 + Math.random() * 0.3,
        maxLife: 0.65
      });
    }
  }

  addFloatingText(text, x, y, color = '#fef08a', big = false) {
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      big,
      life: big ? 1.35 : 0.95,
      maxLife: big ? 1.35 : 0.95
    });
  }

  getPieceAt(col, row) {
    return this.pieces.find(p => p.col === col && p.row === row) || null;
  }

  cycleGameSpeed() {
    if (this.gameSpeed === 1) this.gameSpeed = 1.5;
    else if (this.gameSpeed === 1.5) this.gameSpeed = 2;
    else this.gameSpeed = 1;
    this.updateHUD();
  }

  togglePause() {
    this.paused = !this.paused;
    this.updateHUD();
  }

  handleActVictory() {
    this.victory = true;
    this.gameOver = true;
    this.eloRating += 45;
    localStorage.setItem('royal_gambit_elo', String(this.eloRating));
    window.RoyalAudio.playVictory();
    window.RoyalAudio.setIntenseMode(false);

    const modal = document.getElementById('resultModal');
    const title = document.getElementById('resultModalTitle');
    const sub = document.getElementById('resultModalSubtitle');
    const stats = document.getElementById('resultModalStats');
    if (title) title.textContent = '👑 CHECKMATE VICTORY!';
    if (sub) sub.textContent = `${this.currentAct.code}: ${this.currentAct.name} Secured!`;
    if (stats) {
      stats.innerHTML = `
        <div class="stat-pill"><span>Score</span><strong>${this.score.toLocaleString()}</strong></div>
        <div class="stat-pill"><span>Grandmaster ELO</span><strong>${this.eloRating} (+45)</strong></div>
        <div class="stat-pill"><span>Surviving Pieces</span><strong>${this.pieces.length}</strong></div>
      `;
    }
    if (modal) modal.classList.remove('hidden');
  }

  handleDefeat() {
    this.gameOver = true;
    this.victory = false;
    window.RoyalAudio.playDefeat();
    window.RoyalAudio.setIntenseMode(false);

    const modal = document.getElementById('resultModal');
    const title = document.getElementById('resultModalTitle');
    const sub = document.getElementById('resultModalSubtitle');
    const stats = document.getElementById('resultModalStats');
    if (title) title.textContent = '💀 THE SANCTUM FELL';
    if (sub) sub.textContent = 'The Corrupted Ebony Horde breached your final rank. Adjust your Chess Formation and strike back!';
    if (stats) {
      stats.innerHTML = `
        <div class="stat-pill"><span>Wave Reached</span><strong>${this.waveIndex} / ${this.currentAct.totalWaves}</strong></div>
        <div class="stat-pill"><span>Score</span><strong>${this.score.toLocaleString()}</strong></div>
        <div class="stat-pill"><span>Grandmaster ELO</span><strong>${this.eloRating}</strong></div>
      `;
    }
    if (modal) modal.classList.remove('hidden');
  }

  announceBanner(title, subtitle) {
    const banner = document.getElementById('waveAnnouncement');
    const tEl = document.getElementById('waveBannerTitle');
    const sEl = document.getElementById('waveBannerSub');
    if (!banner || !tEl || !sEl) return;

    tEl.textContent = title;
    sEl.textContent = subtitle;
    banner.classList.remove('hidden');
    clearTimeout(this.bannerTimeout);
    this.bannerTimeout = setTimeout(() => {
      banner.classList.add('hidden');
    }, 3100);
  }

  buildDeckBar() {
    const deck = document.getElementById('chessDeckBar');
    if (!deck) return;
    deck.innerHTML = '';

    Object.values(window.CHESS_DATA.PIECES).forEach(def => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'deck-card';
      btn.dataset.pieceId = def.id;
      const spriteUrl =
        window.RoyalSprites && window.RoyalSprites.pieceDataUrls[def.id]
          ? window.RoyalSprites.pieceDataUrls[def.id]
          : '';

      btn.innerHTML = `
        <div class="deck-card-cooldown" id="cd-${def.id}"></div>
        <div class="deck-card-top">
          <span class="deck-hotkey">[${def.hotkey}]</span>
          <span class="deck-cap-badge" id="cap-${def.id}"></span>
          <span class="deck-cost"><span class="mana-gem">☀</span>${def.cost}</span>
        </div>
        <div class="deck-piece-portrait">
          <img src="${spriteUrl}" alt="${def.name}" class="deck-sprite-img" />
        </div>
        <div class="deck-card-info">
          <strong class="deck-piece-name">${def.arabicTitle || def.name}</strong>
          <span class="deck-piece-role">${def.name}</span>
        </div>
      `;
      btn.addEventListener('click', () => {
        window.RoyalAudio.init();
        window.RoyalAudio.startMusic();
        this.selectDeckPiece(def.id);
      });
      deck.appendChild(btn);
    });
  }

  populateCodexModal() {
    const piecesGrid = document.getElementById('codexPiecesGrid');
    const enemiesGrid = document.getElementById('codexEnemiesGrid');
    if (piecesGrid) {
      piecesGrid.innerHTML = Object.values(window.CHESS_DATA.PIECES)
        .map(p => {
          const url = window.RoyalSprites ? window.RoyalSprites.pieceDataUrls[p.id] : '';
          return `
        <article class="codex-card" style="--accent: ${p.accentColor}">
          <div class="codex-card-head">
            <img src="${url}" alt="${p.name}" class="codex-portrait-img" />
            <div>
              <h4>${p.arabicTitle ? `${p.arabicTitle} • ` : ''}${p.name}</h4>
              <span class="codex-badge">${p.roleBadge} • Cost ${p.cost} Mana</span>
            </div>
          </div>
          <p class="codex-rule"><strong>Chess Geometry:</strong> ${p.chessRule}</p>
          <p class="codex-desc">${p.description}</p>
        </article>
      `;
        })
        .join('');
    }
    if (enemiesGrid) {
      enemiesGrid.innerHTML = Object.values(window.CHESS_DATA.ENEMIES)
        .map(e => {
          const url = window.RoyalSprites ? window.RoyalSprites.enemyDataUrls[e.id] : '';
          return `
        <article class="codex-card enemy-card" style="--accent: ${e.color}">
          <div class="codex-card-head">
            <img src="${url}" alt="${e.name}" class="codex-portrait-img" />
            <div>
              <h4>${e.name}</h4>
              <span class="codex-badge">${e.title} • HP ${e.maxHp}${e.shieldHp ? ` (+${e.shieldHp} Shield)` : ''}</span>
            </div>
          </div>
          <p class="codex-desc">${e.description}</p>
        </article>
      `;
        })
        .join('');
    }
  }

  populateActsDrawer() {
    const container = document.getElementById('actsListContainer');
    const quickMenuContainer = document.getElementById('menuQuickActsGrid');

    const renderActsHtml = () =>
      window.CHESS_DATA.ACTS.map((act, idx) => {
        const isCurrent = idx === this.actIndex;
        const wavesTxt = act.isEndless ? '∞ موجات لا نهائية' : `${act.totalWaves} موجات`;
        return `
      <div class="act-card ${isCurrent ? 'active-act' : ''}" data-act-idx="${idx}">
        <div class="act-card-header">
          <span class="act-code">${act.code} ${isCurrent ? '• قيد اللعب' : ''}</span>
          <span class="act-diff">${act.difficulty}</span>
        </div>
        <h4>${act.name}</h4>
        <p>${act.description}</p>
        <div class="act-meta-pills">
          <span class="act-meta-pill">⚔ ${wavesTxt}</span>
          <span class="act-meta-pill">☀ ${act.startingMana || 150} طاقة</span>
        </div>
        <button type="button" class="launch-act-btn" data-launch-idx="${idx}">
          ${isCurrent ? '↻ إعادة المرحلة الحالية' : `⚔ انطلاق إلى ${act.code} ←`}
        </button>
      </div>
    `;
      }).join('');

    if (container) {
      container.innerHTML = renderActsHtml();
      container.querySelectorAll('[data-launch-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-launch-idx'));
          this.startAct(idx);
        });
      });
    }

    if (quickMenuContainer) {
      quickMenuContainer.innerHTML = window.CHESS_DATA.ACTS.map((act, idx) => {
        const isCurrent = idx === this.actIndex;
        return `
          <button type="button" class="menu-act-pill ${isCurrent ? 'active' : ''}" data-menu-act-idx="${idx}">
            <strong>${act.code}</strong>
            <span>${act.name}</span>
          </button>
        `;
      }).join('');
      quickMenuContainer.querySelectorAll('[data-menu-act-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-menu-act-idx'));
          this.startAct(idx);
        });
      });
    }
  }

  openModal(id) {
    this.paused = true;
    this.populateActsDrawer();
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
    this.updateHUD();
  }

  hideModals() {
    ['commandMenuModal', 'codexModal', 'actsModal', 'resultModal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
    if (!this.gameOver) this.paused = false;
  }

  // Render a 5x5 Mini Chessboard Attack Matrix inside the Inspector Dock
  renderMiniChessMatrix(pieceType) {
    const gridEl = document.getElementById('miniMatrixGrid');
    if (!gridEl || gridEl.dataset.renderedType === pieceType) return;
    gridEl.dataset.renderedType = pieceType;

    // Center of 5x5 is (2, 2)
    const cells = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const dc = c - 2;
        const dr = r - 2;
        let cls = (r + c) % 2 === 0 ? 'matrix-cell light' : 'matrix-cell';

        if (dc === 0 && dr === 0) {
          cls += ' center-self';
        } else {
          switch (pieceType) {
            case 'chalice':
            case 'king':
              if (Math.abs(dc) <= 1 && Math.abs(dr) <= 1) cls += ' attack-sq';
              break;
            case 'pawn':
              if (dr === 0 && dc === 1) cls += ' attack-sq';
              break;
            case 'rook':
              if (dc === 0 || dr === 0) cls += ' attack-sq';
              break;
            case 'knight':
              if (
                (Math.abs(dc) === 2 && Math.abs(dr) === 1) ||
                (Math.abs(dc) === 1 && Math.abs(dr) === 2)
              ) {
                cls += ' crit-sq';
              }
              break;
            case 'bishop':
              if (Math.abs(dc) === Math.abs(dr)) cls += ' attack-sq';
              break;
            case 'queen':
              if (dc === 0 || dr === 0 || Math.abs(dc) === Math.abs(dr)) cls += ' crit-sq';
              break;
          }
        }
        cells.push(`<span class="${cls}"></span>`);
      }
    }
    gridEl.innerHTML = cells.join('');
  }

  // Update the Live Tactical Unit Inspector in the Bottom Dock
  updateInspectorPanel() {
    const portraitEl = document.getElementById('inspectorPortrait');
    const nameEl = document.getElementById('inspectorName');
    const statsEl = document.getElementById('inspectorStats');
    const ruleEl = document.getElementById('inspectorRule');
    const actionsEl = document.getElementById('inspectorQuickActions');
    if (!portraitEl || !nameEl || !statsEl || !ruleEl || !actionsEl) return;

    const boardPiece = this.selectedBoardPiece;
    const typeId = boardPiece ? boardPiece.type : this.selectedDeckPieceId || 'pawn';
    const def = window.CHESS_DATA.PIECES[typeId];
    if (!def) return;

    this.renderMiniChessMatrix(typeId);

    const url = window.RoyalSprites ? window.RoyalSprites.pieceDataUrls[typeId] : '';
    if (portraitEl.getAttribute('src') !== url) {
      portraitEl.setAttribute('src', url);
    }

    const readyLinesCount = this.readyPawnLines ? this.readyPawnLines.length : 0;

    if (boardPiece) {
      const coord = this.renderer.algebraicLabel(boardPiece.col, boardPiece.row);
      nameEl.textContent = `${def.arabicTitle || def.name} [${coord.toUpperCase()}]`;

      let extraInfo = '';
      if (boardPiece.type === 'pawn') {
        const colPawns = this.pieces.filter(p => p.type === 'pawn' && p.col === boardPiece.col).length;
        const rowPawns = this.pieces.filter(p => p.type === 'pawn' && p.row === boardPiece.row).length;
        const bestLine = Math.max(colPawns, rowPawns);
        extraInfo = ` • سطر ${bestLine}/5 • XP ${Math.floor(boardPiece.xp)}%`;
      }
      const shieldTxt = boardPiece.shieldHp > 0 ? ` (+${Math.ceil(boardPiece.shieldHp)}🛡)` : '';
      statsEl.textContent = `HP ${Math.ceil(boardPiece.hp)}/${boardPiece.maxHp}${shieldTxt}${extraInfo}`;
      ruleEl.textContent = def.chessRule;

      // Render context-sensitive one-click action buttons when a board piece is selected
      const key = `board-${boardPiece.id}-${Math.floor(boardPiece.xp)}-${Math.floor(this.mana)}-${readyLinesCount}`;
      if (this.lastInspectedKey !== key) {
        this.lastInspectedKey = key;
        actionsEl.innerHTML = '';

        // 0. One-click 5-Pawn Line Merge into Sovereign Queen! (دمج سطر جنود لوزير)
        if (readyLinesCount > 0) {
          const mergeBtn = document.createElement('button');
          mergeBtn.type = 'button';
          mergeBtn.className = 'quick-action-btn';
          mergeBtn.textContent = '👑 دمج سطر الجنود -> وزير [M]';
          mergeBtn.addEventListener('click', () => this.tryMergePawnLine(boardPiece));
          actionsEl.appendChild(mergeBtn);
        }

        // 1. One-click Pawn Promotion button!
        if (boardPiece.type === 'pawn') {
          const crownBtn = document.createElement('button');
          crownBtn.type = 'button';
          crownBtn.className = 'quick-action-btn';
          const canCrown = boardPiece.xp >= 100 && this.mana >= 125;
          crownBtn.disabled = !canCrown;
          crownBtn.textContent =
            boardPiece.xp >= 100 ? '👑 ترقية (125☀)' : `👑 XP ${Math.floor(boardPiece.xp)}/100`;
          crownBtn.addEventListener('click', () => this.tryPromotePawn(boardPiece));
          actionsEl.appendChild(crownBtn);
        }

        // 2. One-click Castling button if King has an aligned Rook!
        if (boardPiece.type === 'king') {
          const legal = this.getLegalMovesForPiece(boardPiece);
          const castleMove = legal.find(m => m.isCastle);
          if (castleMove) {
            const cBtn = document.createElement('button');
            cBtn.type = 'button';
            cBtn.className = 'quick-action-btn';
            cBtn.textContent = '🏰 تبييت • Castle!';
            cBtn.addEventListener('click', () => {
              this.executeChessMove(boardPiece, castleMove);
              this.selectedBoardPiece = null;
              this.updateHUD();
            });
            actionsEl.appendChild(cBtn);
          }
        }
      }
    } else {
      nameEl.textContent = `${def.arabicTitle || ''} • ${def.name}`;
      const shieldInfo = def.startingShield ? ` (+${def.startingShield}🛡)` : '';
      statsEl.textContent = `HP ${def.maxHp}${shieldInfo} • ${def.cost}☀`;
      ruleEl.textContent = def.chessRule;
      const deckKey = `deck-${typeId}-${readyLinesCount}`;
      if (this.lastInspectedKey !== deckKey) {
        this.lastInspectedKey = deckKey;
        actionsEl.innerHTML = '';
        if (readyLinesCount > 0) {
          const mergeBtn = document.createElement('button');
          mergeBtn.type = 'button';
          mergeBtn.className = 'quick-action-btn';
          mergeBtn.textContent = '👑 دمج سطر الجنود -> وزير [M]';
          mergeBtn.addEventListener('click', () => this.tryMergePawnLine(null));
          actionsEl.appendChild(mergeBtn);
        }
      }
    }
  }

  updateHUD() {
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt('manaCounterVal', Math.floor(this.mana));
    setTxt('scoreCounterVal', this.score.toLocaleString());
    setTxt('eloCounterVal', this.eloRating);
    setTxt('actTitleBadge', `${this.currentAct.code}: ${this.currentAct.name}`);

    // Remaining Winged Golden Rook Sentinels
    const remainingSentinels = this.chariots.filter(c => !c.used || c.active).length;
    setTxt('sentinelCountBadge', `🪽 ${remainingSentinels}/5 القلاع المجنحة`);

    const totalW = this.currentAct.isEndless ? '∞' : this.currentAct.totalWaves;
    setTxt('waveCounterText', `WAVE ${Math.max(1, this.waveIndex)} / ${totalW}`);

    const waveBar = document.getElementById('waveProgressBar');
    if (waveBar) {
      const pct = this.currentAct.isEndless
        ? 100
        : Math.min(100, Math.round((this.waveIndex / this.currentAct.totalWaves) * 100));
      waveBar.style.width = `${pct}%`;
    }

    // Early Wave Call button availability
    const callWaveBtn = document.getElementById('callWaveBtn');
    if (callWaveBtn) {
      const canCall =
        this.waveSpawnQueue.length === 0 &&
        (this.currentAct.isEndless || this.waveIndex < this.currentAct.waves.length);
      callWaveBtn.disabled = !canCall;
    }

    // Floating On-Screen Cinematic Merge CTA Button
    const mergeCtaBtn = document.getElementById('screenMergeCtaBtn');
    if (mergeCtaBtn) {
      const showMergeCta =
        Boolean(this.readyPawnLines && this.readyPawnLines.length > 0) && !this.mergeCinematic;
      mergeCtaBtn.classList.toggle('hidden', !showMergeCta);
    }

    // Active Synergies Row
    const synRow = document.getElementById('activeSynergiesRow');
    if (synRow) {
      const pills = [];
      if (this.readyPawnLines && this.readyPawnLines.length > 0) {
        pills.push(
          `<span class="synergy-pill">👑 سطر جنود مكتمل (${this.readyPawnLines.length}) — اضغط [M] للدمج إلى وزير!</span>`
        );
      }
      if (this.batteryLinks.length > 0) {
        pills.push(`<span class="synergy-pill">⚡ بطارية ملكية (${this.batteryLinks.length}) +30%</span>`);
      }
      if (this.pawnChainLinks.length > 0) {
        pills.push(`<span class="synergy-pill">🛡 سلسلة جنود (${this.pawnChainLinks.length})</span>`);
      }
      if (this.pieces.some(p => p.type === 'king')) {
        pills.push(`<span class="synergy-pill">👑 هالة الملك +30%</span>`);
      }
      synRow.innerHTML = pills.join('');
    }

    // Ultimate Button
    const ultBtn = document.getElementById('ultimateBtn');
    const ultFill = document.getElementById('ultimateFillBar');
    const ultPct = Math.floor(this.ultimateCharge);
    if (ultFill) ultFill.style.width = `${ultPct}%`;
    if (ultBtn) {
      ultBtn.classList.toggle('ready', ultPct >= 100);
      ultBtn.disabled = ultPct < 100;
    }
    setTxt('ultimateText', ultPct >= 100 ? '⚡ الضربة القاضية جاهزة [SPACE]' : `⚡ الضربة القاضية ${ultPct}%`);

    // Deck Cards
    document.querySelectorAll('.deck-card').forEach(card => {
      const pid = card.dataset.pieceId;
      const def = window.CHESS_DATA.PIECES[pid];
      const cd = this.cardCooldowns[pid] || 0;
      const count = this.countPiecesOfType(pid);
      const atCap = Boolean(def.maxCount && count >= def.maxCount);
      const canAfford = this.mana >= def.cost && !atCap;

      card.classList.toggle(
        'selected',
        this.selectedDeckPieceId === pid && !this.shovelMode && !this.selectedBoardPiece
      );
      card.classList.toggle('unaffordable', !canAfford || cd > 0);

      const capEl = document.getElementById(`cap-${pid}`);
      if (capEl) {
        capEl.textContent = def.maxCount ? `${count}/${def.maxCount}` : '';
        capEl.classList.toggle('cap-full', atCap);
      }

      const cdEl = document.getElementById(`cd-${pid}`);
      if (cdEl) {
        const pct = cd > 0 ? Math.min(100, (cd / def.cooldown) * 100) : 0;
        cdEl.style.height = `${pct}%`;
      }
    });

    // Tactical Status Pill
    const statusPill = document.getElementById('tacticalStatusPill');
    if (statusPill) {
      if (this.shovelMode) {
        statusPill.textContent = '🔥 وضع التضحية: انقر على أي قطعة لاسترجاع 60% من الطاقة وتفجير الأعداء حولها!';
        statusPill.className = 'tactical-status-pill mode-shovel';
      } else if (this.selectedBoardPiece) {
        const pDef = window.CHESS_DATA.PIECES[this.selectedBoardPiece.type];
        const cd = this.selectedBoardPiece.moveCd;
        statusPill.textContent =
          cd > 0
            ? `⏳ حركة ${pDef.arabicTitle || pDef.name} قيد الشحن (${cd.toFixed(1)}ث)`
            : `♟ حركة شطرنج جاهزة: انقر على أي مربع أخضر لتحريك ${pDef.arabicTitle || pDef.name}!`;
        statusPill.className = 'tactical-status-pill mode-move';
      } else if (this.selectedDeckPieceId) {
        const dDef = window.CHESS_DATA.PIECES[this.selectedDeckPieceId];
        statusPill.textContent = `⚔ نشر: ${dDef.arabicTitle || dDef.name} (${dDef.cost}☀) — انقر على مربع فارغ للوضع، أو على قطعة موضوعة لتحريكها!`;
        statusPill.className = 'tactical-status-pill mode-deploy';
      }
    }

    this.updateInspectorPanel();

    const shovelBtn = document.getElementById('shovelBtn');
    if (shovelBtn) shovelBtn.classList.toggle('active', this.shovelMode);

    setTxt('speedBtn', `⏩ ${this.gameSpeed}x`);

    const autoBtn = document.getElementById('autoManaBtn');
    if (autoBtn) {
      autoBtn.classList.toggle('active', this.autoCollectMana);
      autoBtn.textContent = this.autoCollectMana ? '☀ تلقائي: ON' : '☀ تلقائي: OFF';
    }

    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) pauseBtn.textContent = this.paused ? '▶' : '⏸';

    // Synchronize Royal Command Menu controls
    setTxt('menuSpeedBtn', `⏩ السرعة: ${this.gameSpeed}x`);
    setTxt('menuAutoManaBtn', this.autoCollectMana ? '☀ جمع الطاقة: تلقائي' : '☀ جمع الطاقة: يدوي');
    setTxt('menuGridCoordsBtn', this.showGridOverlay ? '♟ إحداثيات الرقعة: مفعلة' : '♟ إحداثيات الرقعة: مخفية');
    const isMuted = window.RoyalAudio && window.RoyalAudio.muted;
    setTxt('menuAudioBtn', isMuted ? '🔇 الصوت: مكتوم' : '🔊 الصوت: مفعل');
    setTxt('audioMuteBtn', isMuted ? '🔇' : '🔊');
    const isFs = Boolean(document.fullscreenElement);
    setTxt('menuFullscreenBtn', isFs ? '🗗 الخروج من ملء الشاشة' : '⛶ ملء الشاشة الكاملة');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.royalGame = new RoyalGambitGame();
});
