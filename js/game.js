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

    this.profile = this.loadProfile();
    this.lang = this.profile.lang || 'ar';
    this.commanderId = this.profile.commander || 'bastion';
    this.doctrineId = this.profile.doctrine || 'phalanx';
    this.ascensionLevel = Number(this.profile.ascension || 0);
    this.gameMode = 'campaign'; // 'campaign' | 'daily' | 'puzzle'
    this.puzzleIndex = 0;
    this._seededRng = null;

    this.actIndex = 0;
    this.currentAct = window.CHESS_DATA.ACTS[0];
    this.eloRating = Number(this.profile.elo || localStorage.getItem('royal_gambit_elo') || 1500);
    this.unlockedActs = this.computeUnlockedActs();

    this.mana = 150;
    this.score = 0;
    this.ultimateCharge = 25;
    this.gameSpeed = 1;
    this.autoCollectMana = true;
    this.showGridOverlay = true;
    this.onTitleScreen = true;
    this.paused = true;
    this.gameOver = false;
    this.victory = false;

    this.pieces = [];
    this.enemies = [];
    this.projectiles = [];
    this.beams = [];
    this.shockwaves = [];
    this.particles = [];
    this.floorDecals = [];
    this.telegraphZones = [];
    this.manaOrbs = [];
    this.floatingTexts = [];
    this.chariots = [];
    this.batteryLinks = [];
    this.pawnChainLinks = [];
    this.readyPawnLines = [];
    this.mergeCinematic = null;
    this.activeDecrees = [];
    this.decreeState = this.createDefaultDecreeState();

    this.selectedDeckPieceId = 'pawn';
    this.selectedBoardPiece = null;
    this.shovelMode = false;
    this.hoverCell = null;
    this.cursorActive = false;
    this.cursorCell = { col: 2, row: 2 };
    this._gpPrevButtons = {};
    this._gpAxisCooldown = 0;
    this.tutorialStep = -1;
    this.dragState = null;
    this.cardCooldowns = {};
    this.lastInspectedKey = '';
    this._lastHudSig = '';

    this.waveIndex = 0;
    this.waveInProgress = false;
    this.waveSpawnQueue = [];
    this.waveCooldownTimer = 3.5;
    this.skyManaTimer = 4.8;
    this.tipTimer = 0;
    this.tipIndex = 0;
    this.hitStopTimer = 0;

    this.entityIdCounter = 1;
    this.screenShake = 0;
    this.lastTimestamp = performance.now();

    this.renderer = new window.RoyalBoardRenderer(this.canvas, this);

    this.bindEvents();
    this.applyVolumeSettings();
    this.buildDeckBar();
    this.populateCodexModal();
    this.populateActsDrawer();
    this.renderTitleScreen();
    this.applyLanguage(this.lang);
    this.startAct(0, { keepTitleOpen: true });
    this.renderer.resize();

    requestAnimationFrame(ts => this.loop(ts));
  }

  initSeededRng(seedInt) {
    let a = (seedInt >>> 0) || 1337;
    this._seededRng = () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  rand() {
    if ((this.gameMode === 'daily' || this.gameMode === 'puzzle') && this._seededRng) {
      return this._seededRng();
    }
    return Math.random();
  }

  computeUnlockedActs() {
    const stars = (this.profile && this.profile.actStars) || {};
    let highestUnlocked = Number((this.profile && this.profile.unlockedActs) || 1);
    for (let i = 1; i <= 4; i++) {
      if (Number(stars[String(i)] || 0) > 0) {
        highestUnlocked = Math.max(highestUnlocked, Math.min(5, i + 1));
      }
    }
    return Math.max(1, Math.min(5, highestUnlocked));
  }

  loadProfile() {
    try {
      const raw = localStorage.getItem('royal_gambit_profile_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          elo: Number(parsed.elo || localStorage.getItem('royal_gambit_elo') || 1500),
          lang: parsed.lang === 'en' ? 'en' : 'ar',
          commander: window.CHESS_DATA.COMMANDERS[parsed.commander] ? parsed.commander : 'bastion',
          doctrine: window.CHESS_DATA.DOCTRINES && window.CHESS_DATA.DOCTRINES[parsed.doctrine] ? parsed.doctrine : 'phalanx',
          ascension: Math.max(0, Math.min(5, Number(parsed.ascension || 0))),
          unlockedActs: Math.max(1, Math.min(5, Number(parsed.unlockedActs || 1))),
          actStars: parsed.actStars || {},
          actBestScores: parsed.actBestScores || {},
          endlessBestWave: Number(parsed.endlessBestWave || 0),
          dailyBestScore: Number(parsed.dailyBestScore || 0),
          dailyDateKey: parsed.dailyDateKey || '',
          solvedPuzzles: parsed.solvedPuzzles || {},
          achievements: parsed.achievements || {},
          tutorialDone: Boolean(parsed.tutorialDone),
          sfxVol: parsed.sfxVol !== undefined ? Number(parsed.sfxVol) : 0.8,
          musicVol: parsed.musicVol !== undefined ? Number(parsed.musicVol) : 0.52
        };
      }
    } catch {
      // Ignore storage errors cleanly
    }
    return {
      elo: Number(localStorage.getItem('royal_gambit_elo') || 1500),
      lang: 'ar',
      commander: 'bastion',
      doctrine: 'phalanx',
      ascension: 0,
      unlockedActs: 1,
      actStars: {},
      actBestScores: {},
      endlessBestWave: 0,
      dailyBestScore: 0,
      dailyDateKey: '',
      solvedPuzzles: {},
      achievements: {},
      tutorialDone: false,
      sfxVol: 0.8,
      musicVol: 0.52
    };
  }

  saveProfile() {
    try {
      this.profile.elo = this.eloRating;
      this.profile.lang = this.lang;
      this.profile.commander = this.commanderId;
      this.profile.doctrine = this.doctrineId;
      this.profile.ascension = this.ascensionLevel;
      this.profile.unlockedActs = this.unlockedActs;
      localStorage.setItem('royal_gambit_profile_v2', JSON.stringify(this.profile));
      localStorage.setItem('royal_gambit_elo', String(this.eloRating));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }

  unlockAchievement(achId) {
    if (!this.profile.achievements) this.profile.achievements = {};
    if (this.profile.achievements[achId]) return;
    const def = (window.CHESS_DATA.ACHIEVEMENTS || []).find(a => a.id === achId);
    if (!def) return;

    this.profile.achievements[achId] = Date.now();
    this.saveProfile();
    if (window.RoyalAudio && window.RoyalAudio.playAchievement) {
      window.RoyalAudio.playAchievement();
    }

    const toast = document.getElementById('achievementToast');
    const iconEl = document.getElementById('achievementToastIcon');
    const titleEl = document.getElementById('achievementToastTitle');
    const descEl = document.getElementById('achievementToastDesc');
    if (toast && titleEl && descEl) {
      const isEn = this.lang === 'en';
      if (iconEl) iconEl.textContent = def.icon || '♛';
      titleEl.textContent = isEn ? `Achievement Unlocked: ${def.nameEn}` : `إنجاز ملكي جديد: ${def.nameAr}`;
      descEl.textContent = isEn ? def.descEn : def.descAr;
      toast.classList.remove('hidden');
      clearTimeout(this._achToastTimer);
      this._achToastTimer = setTimeout(() => toast.classList.add('hidden'), 3800);
    }
  }

  updateTutorialBanner() {
    const banner = document.getElementById('tutorialBanner');
    const stepEl = document.getElementById('tutorialStepBadge');
    const txtEl = document.getElementById('tutorialStepText');
    if (!banner || !txtEl) return;

    if (this.tutorialStep < 0 || this.tutorialStep > 2 || this.onTitleScreen || this.gameOver) {
      banner.classList.add('hidden');
      return;
    }

    const isEn = this.lang === 'en';
    const stepsEn = [
      'STEP 1/3 • Select Phalanx Shield-Pawn [2] and click any front tile (Cols C–E) to form your shield wall!',
      'STEP 2/3 • Deploy an Aegis Rook [3], Knight [4], or Bishop [5] behind your Pawn to shatter invaders!',
      'STEP 3/3 • Click any deployed Piece on the board and slide/jump it to a glowing green Chess square!'
    ];
    const stepsAr = [
      'خطوة 1/3 • اختر الجندي المدرع [2] وانقر على مربع أمامي (الأعمدة C–E) لبناء جدار الدروع!',
      'خطوة 2/3 • انشر قلعة حصار [3] أو فارساً [4] أو فيلاً [5] خلف الجندي لسحق الغزاة!',
      'خطوة 3/3 • انقر على أي قطعة فوق الرقعة وحرّكها إلى أحد المربعات الخضراء المتوهجة!'
    ];

    const skipEl = document.getElementById('tutorialSkipBtn');
    if (skipEl) skipEl.textContent = isEn ? 'Skip ✕' : 'تخطي ✕';
    if (stepEl) stepEl.textContent = `${this.tutorialStep + 1} / 3`;
    txtEl.textContent = isEn ? stepsEn[this.tutorialStep] : stepsAr[this.tutorialStep];
    banner.classList.remove('hidden');
  }

  advanceTutorial(completedStep) {
    if (this.tutorialStep !== completedStep) return;
    this.tutorialStep++;
    if (this.tutorialStep > 2) {
      this.tutorialStep = -1;
      this.profile.tutorialDone = true;
      this.saveProfile();
    }
    this.updateTutorialBanner();
  }

  createDefaultDecreeState() {
    return {
      damageMult: 1.0,
      atkSpeedMult: 1.0,
      chaliceRateMult: 1.0,
      moveCdMult: 1.0,
      pawnKnockbackMult: 1.0,
      knightDmgMult: 1.0,
      knightStun: false,
      knightChain: false,
      casterDmgMult: 1.0,
      bonusHeal: 0,
      rookDmgMult: 1.0,
      rookExecuteThreshold: 0,
      batteryBonus: 0,
      killManaBonus: 0,
      promoteCost: 125,
      queenDmgMult: 1.0,
      queenBonusRange: 0,
      ultChargeMult: 1.0,
      enPassant: false,
      martyrPact: false,
      twinPrisms: false,
      interestRate: 0,
      kingExpandedAura: false,
      chaliceShieldPulse: 0,
      deathExplosionDmg: 0
    };
  }

  getCommander() {
    return window.CHESS_DATA.COMMANDERS[this.commanderId] || window.CHESS_DATA.COMMANDERS.bastion;
  }

  getDoctrine() {
    return (window.CHESS_DATA.DOCTRINES && window.CHESS_DATA.DOCTRINES[this.doctrineId]) || { id: 'phalanx' };
  }

  getAscension() {
    const list = window.CHESS_DATA.ASCENSIONS || [];
    return list[Math.max(0, Math.min(list.length - 1, this.ascensionLevel))] || { level: 0, hpMult: 1, spdMult: 1, eloBonus: 0 };
  }

  getPieceCost(pieceId) {
    const def = window.CHESS_DATA.PIECES[pieceId];
    if (!def) return 0;
    const cmd = this.getCommander();
    let cost = def.cost;
    if (pieceId === 'pawn' && cmd.mods.pawnDiscount) cost -= cmd.mods.pawnDiscount;
    if (pieceId === 'pawn' && this.doctrineId === 'artillery') cost += 10;
    if (pieceId === 'knight' && cmd.mods.knightDiscount) cost -= cmd.mods.knightDiscount;
    return Math.max(25, cost);
  }

  startAct(actIdx, options = {}) {
    const keepTitle = Boolean(options.keepTitleOpen);
    const requestedMode = options.mode || 'campaign';

    // Progressive Campaign Act Gate: prevent jumping into locked Acts unless unlocked
    if (requestedMode === 'campaign' && !keepTitle && actIdx >= this.unlockedActs) {
      actIdx = Math.max(0, this.unlockedActs - 1);
    }

    this.gameMode = requestedMode;
    this.puzzleIndex = Number(options.puzzleIndex || 0);

    if (this.gameMode === 'daily') {
      const dayNum = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
      this.initSeededRng(dayNum * 2654435761);
    } else if (this.gameMode === 'puzzle') {
      this.initSeededRng(9001 + this.puzzleIndex * 7919);
    } else {
      this._seededRng = null;
    }

    this.actIndex = Math.max(0, Math.min(window.CHESS_DATA.ACTS.length - 1, actIdx));
    let baseAct = window.CHESS_DATA.ACTS[this.actIndex];

    if (this.gameMode === 'puzzle') {
      const puz = window.CHESS_DATA.PUZZLES[this.puzzleIndex] || window.CHESS_DATA.PUZZLES[0];
      baseAct = {
        id: 90 + this.puzzleIndex,
        code: puz.code,
        name: puz.nameEn,
        subtitle: puz.nameAr,
        difficulty: 'Checkmate Puzzle',
        startingMana: puz.startingMana,
        skyDropInterval: 999,
        boardTheme: window.CHESS_DATA.ACTS[1].boardTheme,
        totalWaves: puz.waves.length,
        waves: puz.waves,
        isPuzzle: true,
        puzzleDef: puz
      };
    } else if (this.gameMode === 'daily') {
      baseAct = {
        ...window.CHESS_DATA.ACTS[2],
        id: 80,
        code: 'DAILY',
        name: 'Daily Royal Gambit',
        subtitle: new Date().toISOString().slice(0, 10),
        startingMana: 200,
        isDaily: true
      };
    }

    this.currentAct = baseAct;
    const cmd = this.getCommander();
    const asc = this.gameMode === 'campaign' ? this.getAscension() : { hpMult: 1, spdMult: 1, manaPenalty: 0, eloBonus: 0 };

    this.activeDecrees = [];
    this.decreeState = this.createDefaultDecreeState();
    if (cmd.mods.dmgMult) this.decreeState.damageMult *= cmd.mods.dmgMult;
    if (cmd.mods.moveCdMult) this.decreeState.moveCdMult *= cmd.mods.moveCdMult;
    if (this.doctrineId === 'halberd') {
      this.decreeState.pawnKnockbackMult *= 0.55;
    } else if (this.doctrineId === 'artillery') {
      this.decreeState.rookDmgMult *= 1.18;
      this.decreeState.casterDmgMult *= 1.18;
    }

    const baseStartMana = (this.currentAct.startingMana || 150) + (this.gameMode === 'puzzle' ? 0 : (cmd.mods.startingManaBonus || 0));
    this.mana = Math.max(50, baseStartMana - (asc.manaPenalty || 0));
    this.score = 0;
    this.ultimateCharge = this.gameMode === 'puzzle' ? 0 : 25;
    this.onTitleScreen = keepTitle;
    this.paused = keepTitle;
    this.gameOver = false;
    this.victory = false;
    this.enemiesKilled = 0;
    this.totalManaEarned = this.mana;
    this.breachInfo = null;
    this.waveClearRewarded = false;
    this.hitStopTimer = 0;

    this.pieces = [];
    this.enemies = [];
    this.projectiles = [];
    this.beams = [];
    this.shockwaves = [];
    this.particles = [];
    this.floorDecals = [];
    this.telegraphZones = [];
    this.manaOrbs = [];
    this.floatingTexts = [];
    this.batteryLinks = [];
    this.pawnChainLinks = [];
    this.readyPawnLines = [];
    this.mergeCinematic = null;

    this.selectedBoardPiece = null;
    this.shovelMode = false;
    this.dragState = null;
    this.lastInspectedKey = '';
    this._lastHudSig = '';
    this.cardCooldowns = {};
    Object.keys(window.CHESS_DATA.PIECES).forEach(k => {
      this.cardCooldowns[k] = 0;
    });

    // 5 Winged Golden Rook Sentinels guarding Ranks 5-1 (Disabled in Checkmate Puzzles so any breach = instant Defeat!)
    const sentinelsDisabled = this.gameMode === 'puzzle';
    this.chariots = [];
    for (let r = 0; r < this.rows; r++) {
      this.chariots.push({
        row: r,
        x: this.renderer.chariotX,
        active: false,
        used: sentinelsDisabled
      });
    }

    this.spawnStarterFormation();

    this.waveIndex = 0;
    this.waveInProgress = false;
    this.waveSpawnQueue = [];
    this.waveCooldownTimer = 3.2;
    this.skyManaTimer = 4.0;

    // 3-Step Interactive Spotlight Tutorial on Act I for first-time players
    if (!keepTitle && this.gameMode === 'campaign' && this.actIndex === 0 && !this.profile.tutorialDone) {
      this.tutorialStep = 0;
    } else {
      this.tutorialStep = -1;
    }
    this.updateTutorialBanner();

    if (window.RoyalAudio) {
      window.RoyalAudio.setIntenseMode(false);
      window.RoyalAudio.setActMood(this.actIndex);
    }

    this.hideModals();
    this.buildDeckBar();
    const titleEl = document.getElementById('titleOverlay');
    if (titleEl) {
      titleEl.classList.toggle('hidden', !keepTitle);
    }
    this.updateWaveThreatIcons();
    this.updateTipTicker();
    this.updateHUD();
    if (!keepTitle) {
      const subTxt =
        this.gameMode === 'puzzle' && this.currentAct.puzzleDef
          ? (this.lang === 'en' ? this.currentAct.puzzleDef.descEn : this.currentAct.puzzleDef.descAr)
          : this.currentAct.subtitle;
      this.announceBanner(`${this.currentAct.code}: ${this.currentAct.name}`, subTxt);
    }
  }

  spawnStarterFormation() {
    if (this.gameMode === 'puzzle' && this.currentAct.puzzleDef) {
      for (const p of this.currentAct.puzzleDef.pieces) {
        this.placePieceInternal(p.type, p.col, p.row, true);
      }
      this.recalculateSynergies();
      return;
    }
    this.placePieceInternal('chalice', 0, 1, true);
    this.placePieceInternal('chalice', 0, 3, true);
    this.recalculateSynergies();
  }

  bindEvents() {
    window.addEventListener('resize', () => this.renderer.resize());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.renderer.resize(), 120);
    });

    this.canvas.addEventListener('pointerdown', e => {
      if (e.button !== 0 || this.paused || this.gameOver || this.onTitleScreen) return;
      const pos = this.renderer.screenToBoard(e.clientX, e.clientY);
      if (!pos.valid) return;
      const existing = this.getPieceAt(pos.col, pos.row);
      if (existing && existing.moveCd <= 0 && !this.shovelMode && !existing.inReadyPawnLine) {
        this.dragState = {
          kind: 'board',
          piece: existing,
          pieceType: existing.type,
          startX: e.clientX,
          startY: e.clientY,
          x: pos.x,
          y: pos.y,
          active: false,
          pointerId: e.pointerId
        };
      }
    });

    window.addEventListener('pointermove', e => {
      if (!this.dragState) return;
      const dist = Math.hypot(e.clientX - this.dragState.startX, e.clientY - this.dragState.startY);
      if (dist > 14) {
        this.dragState.active = true;
        if (this.dragState.kind === 'board') {
          this.selectedBoardPiece = this.dragState.piece;
        } else if (this.dragState.kind === 'deck') {
          this.selectedDeckPieceId = this.dragState.pieceType;
          this.selectedBoardPiece = null;
        }
      }
      const liftY = e.pointerType === 'touch' ? -46 : 0;
      const pos = this.renderer.screenToBoard(e.clientX, e.clientY + liftY);
      this.hoverCell = pos;
      this.dragState.x = pos.x;
      this.dragState.y = pos.y;
    });

    window.addEventListener('pointerup', e => {
      if (!this.dragState) return;
      const drag = this.dragState;
      this.dragState = null;
      if (!drag.active) return;

      this._suppressNextClick = true;
      setTimeout(() => { this._suppressNextClick = false; }, 60);

      const liftY = e.pointerType === 'touch' ? -46 : 0;
      const pos = this.renderer.screenToBoard(e.clientX, e.clientY + liftY);
      if (!pos.valid || this.paused || this.gameOver) return;

      window.RoyalAudio.init();
      window.RoyalAudio.startMusic();

      if (drag.kind === 'deck') {
        this.tryDeployPiece(drag.pieceType, pos.col, pos.row);
      } else if (drag.kind === 'board' && drag.piece) {
        const legal = this.getLegalMovesForPiece(drag.piece);
        const move = legal.find(m => m.col === pos.col && m.row === pos.row);
        if (move) {
          this.executeChessMove(drag.piece, move);
          this.selectedBoardPiece = null;
          this.updateHUD();
        }
      }
    });

    this.canvas.addEventListener('mousemove', e => {
      this.cursorActive = false;
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
      if (this._suppressNextClick) return;
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

    this.canvas.addEventListener('dblclick', e => {
      const pos = this.renderer.screenToBoard(e.clientX, e.clientY);
      if (!pos.valid || this.paused || this.gameOver) return;
      const existing = this.getPieceAt(pos.col, pos.row);
      if (existing && existing.type === 'pawn' && existing.xp >= 100) {
        this.tryPromotePawn(existing);
      }
    });

    this.canvas.addEventListener('contextmenu', e => {
      e.preventDefault();
      this.selectedBoardPiece = null;
      this.shovelMode = false;
      this.updateHUD();
    });

    window.addEventListener('keydown', e => {
      if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();
      if (key >= '1' && key <= '7') {
        const pieceKeys = Object.keys(window.CHESS_DATA.PIECES);
        const idx = Number(key) - 1;
        if (pieceKeys[idx]) {
          this.selectDeckPiece(pieceKeys[idx]);
        }
      } else if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 'd'].includes(key)) {
        if (this.paused || this.gameOver || this.onTitleScreen) return;
        e.preventDefault();
        this.cursorActive = true;
        if (key === 'arrowup' || key === 'w') this.cursorCell.row = Math.max(0, this.cursorCell.row - 1);
        else if (key === 'arrowdown') this.cursorCell.row = Math.min(this.rows - 1, this.cursorCell.row + 1);
        else if (key === 'arrowleft' || key === 'a') this.cursorCell.col = Math.max(0, this.cursorCell.col - 1);
        else if (key === 'arrowright' || key === 'd') this.cursorCell.col = Math.min(this.cols - 1, this.cursorCell.col + 1);
        const pt = this.renderer.tileCenter(this.cursorCell.col, this.cursorCell.row);
        this.hoverCell = { col: this.cursorCell.col, row: this.cursorCell.row, x: pt.x, y: pt.y, valid: true };
      } else if (key === 'q' || key === 'e') {
        if (this.paused || this.gameOver || this.onTitleScreen) return;
        const pieceKeys = Object.keys(window.CHESS_DATA.PIECES);
        const curIdx = Math.max(0, pieceKeys.indexOf(this.selectedDeckPieceId || 'pawn'));
        const nextIdx = (curIdx + (key === 'e' ? 1 : -1) + pieceKeys.length) % pieceKeys.length;
        this.selectDeckPiece(pieceKeys[nextIdx]);
      } else if (key === 'enter') {
        if (this.paused || this.gameOver || this.onTitleScreen) return;
        window.RoyalAudio.init();
        window.RoyalAudio.startMusic();
        this.cursorActive = true;
        this.handleBoardClick(this.cursorCell.col, this.cursorCell.row);
      } else if (key === 'm') {
        this.tryMergePawnLine(this.selectedBoardPiece);
      } else if (key === 'u') {
        if (this.selectedBoardPiece && this.selectedBoardPiece.type === 'pawn' && this.selectedBoardPiece.xp >= 100) {
          this.tryPromotePawn(this.selectedBoardPiece);
        }
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
        if (this.gameOver) {
          const resultEl = document.getElementById('resultModal');
          if (resultEl && resultEl.classList.contains('hidden')) {
            this.openModal('resultModal');
          }
          return;
        }
        this.hideModals();
        this.updateHUD();
      }
    });

    const bindBtn = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };

    bindBtn('tutorialSkipBtn', () => {
      this.tutorialStep = -1;
      this.profile.tutorialDone = true;
      this.saveProfile();
      this.updateTutorialBanner();
    });

    bindBtn('shovelBtn', () => this.toggleShovel());
    bindBtn('ultimateBtn', () => this.triggerCheckmateUltimate());
    bindBtn('screenMergeCtaBtn', () => this.tryMergePawnLine(this.selectedBoardPiece));
    bindBtn('tutorialSkipBtn', () => {
      this.tutorialStep = -1;
      this.profile.tutorialDone = true;
      this.saveProfile();
      this.updateTutorialBanner();
    });
    bindBtn('callWaveBtn', () => this.callNextWaveEarly());
    bindBtn('speedBtn', () => this.cycleGameSpeed());
    bindBtn('autoManaBtn', () => {
      this.autoCollectMana = !this.autoCollectMana;
      this.updateHUD();
    });
    bindBtn('pauseBtn', () => this.togglePause());
    bindBtn('restartBtn', () => this.startAct(this.actIndex, { mode: this.gameMode, puzzleIndex: this.puzzleIndex }));
    bindBtn('fullscreenBtn', () => this.toggleFullscreen());
    bindBtn('audioMuteBtn', () => {
      const muted = window.RoyalAudio.toggleMute();
      const btn = document.getElementById('audioMuteBtn');
      if (btn) btn.setAttribute('aria-pressed', String(!muted));
      this.updateHUD();
    });

    // Royal Command Menu & Modals
    const closeOrReturn = () => {
      if (this.gameOver) {
        this.hideModals();
        this.openModal('resultModal');
      } else {
        this.hideModals();
      }
    };
    bindBtn('openMenuBtn', () => this.openModal('commandMenuModal'));
    bindBtn('closeMenuBtn', closeOrReturn);
    bindBtn('menuResumeBtn', closeOrReturn);
    bindBtn('menuRestartBtn', () => this.startAct(this.actIndex, { mode: this.gameMode, puzzleIndex: this.puzzleIndex }));
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
    bindBtn('closeCodexBtn', closeOrReturn);
    bindBtn('openActsBtn', () => this.openModal('actsModal'));
    bindBtn('closeActsBtn', closeOrReturn);
    bindBtn('modalRetryBtn', () => this.startAct(this.actIndex, { mode: this.gameMode, puzzleIndex: this.puzzleIndex }));
    bindBtn('modalActsBtn', () => {
      this.hideModals();
      this.openModal('actsModal');
    });
    bindBtn('modalCodexBtn', () => {
      this.hideModals();
      this.openModal('codexModal');
    });
    // Audio Sliders + Language Switch + Mobile Floating Bar
    const bindSlider = (id, key, setter) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.value = String(Math.round((this.profile[key] || 0.7) * 100));
      el.addEventListener('input', () => {
        const val = Number(el.value) / 100;
        this.profile[key] = val;
        setter(val);
        this.saveProfile();
      });
    };
    bindSlider('sfxVolSlider', 'sfxVol', v => window.RoyalAudio.setSfxVolume(v));
    bindSlider('musicVolSlider', 'musicVol', v => window.RoyalAudio.setMusicVolume(v));

    bindBtn('langToggleBtn', () => {
      window.RoyalAudio.playUiClick();
      this.setLanguage(this.lang === 'ar' ? 'en' : 'ar');
    });
    bindBtn('titleLangBtn', () => {
      window.RoyalAudio.playUiClick();
      this.setLanguage(this.lang === 'ar' ? 'en' : 'ar');
    });
    bindBtn('titleLaunchCampaignBtn', () => {
      window.RoyalAudio.init();
      window.RoyalAudio.playUiClick();
      window.RoyalAudio.startMusic();
      const targetAct = Math.min(this.unlockedActs - 1, Math.max(0, Number(this.profile.lastAct || 0)));
      this.startAct(targetAct, { mode: 'campaign' });
    });
    bindBtn('titleDailyBtn', () => {
      window.RoyalAudio.init();
      window.RoyalAudio.playUiClick();
      window.RoyalAudio.startMusic();
      this.startAct(2, { mode: 'daily' });
    });
    bindBtn('titlePuzzlesBtn', () => {
      window.RoyalAudio.init();
      window.RoyalAudio.playUiClick();
      window.RoyalAudio.startMusic();
      this.startAct(0, { mode: 'puzzle', puzzleIndex: 0 });
    });
    bindBtn('menuOpenTitleBtn', () => {
      this.hideModals();
      this.onTitleScreen = true;
      this.paused = true;
      this.updateTutorialBanner();
      this.renderTitleScreen();
      const titleEl = document.getElementById('titleOverlay');
      if (titleEl) titleEl.classList.remove('hidden');
    });

    bindBtn('modalMainMenuBtn', () => {
      this.hideModals();
      this.openModal('commandMenuModal');
    });
    bindBtn('modalNextActBtn', () => {
      if (this.gameMode === 'puzzle') {
        const nextPz = (this.puzzleIndex + 1) % window.CHESS_DATA.PUZZLES.length;
        this.startAct(0, { mode: 'puzzle', puzzleIndex: nextPz });
        return;
      }
      const next = (this.actIndex + 1) % window.CHESS_DATA.ACTS.length;
      this.startAct(next, { mode: 'campaign' });
    });

    // Unified Sanctum Top Navigation Tabs inside Modals
    document.querySelectorAll('[data-switch-modal]').forEach(navBtn => {
      navBtn.addEventListener('click', () => {
        const targetModalId = navBtn.getAttribute('data-switch-modal');
        if (!targetModalId) return;
        ['commandMenuModal', 'codexModal', 'actsModal'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.classList.toggle('hidden', id !== targetModalId);
        });
        this.paused = true;
        this.populateActsDrawer();
        this.updateHUD();
      });
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

    // Never forfeit Wave Clear Treasury Bonus + Compound Interest if player calls next wave early!
    let earlyTotal = 25;
    if (this.waveIndex >= 1 && !this.waveClearRewarded) {
      this.waveClearRewarded = true;
      const activeChalices = this.countPiecesOfType('chalice');
      earlyTotal += 20 + activeChalices * 5;
      if (this.decreeState && this.decreeState.interestRate > 0) {
        earlyTotal += Math.min(55, Math.floor(this.mana * this.decreeState.interestRate));
      }
      this.score += 75;
    }

    this.mana += earlyTotal;
    this.totalManaEarned += earlyTotal;
    this.score += 50;
    window.RoyalAudio.playManaCollect();
    this.addFloatingText(
      `+${earlyTotal}☀ ${this.lang === 'en' ? 'Early Call + Treasury!' : 'استدعاء مبكر + خزينة!'}`,
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

    // One-click merge if clicking a Pawn that belongs to a ready 5-Pawn Line (when Queen slot available)
    if (existing && existing.type === 'pawn' && existing.inReadyPawnLine) {
      this.tryMergePawnLine(existing);
      return;
    }

    if (this.selectedBoardPiece) {
      if (existing && existing.id === this.selectedBoardPiece.id) {
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
        // Select clicked piece cleanly (never lock 100-XP Pawns out of moving; use [U], double-click, or button to promote)
        this.selectedBoardPiece = existing;
        this.selectedDeckPieceId = null;
        window.RoyalAudio.playUiClick();
        this.updateHUD();
        return;
      }

      this.selectedBoardPiece = null;
      this.updateHUD();
      return;
    }

    if (existing) {
      this.selectedBoardPiece = existing;
      window.RoyalAudio.playUiClick();
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

    const cost = this.getPieceCost(pieceId);
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

    if (this.mana < cost) {
      this.flashManaWarning();
      this.addFloatingText(`NEED ${cost} MANA!`, center.x, center.y, '#fbbf24', false);
      return;
    }

    this.mana -= cost;
    this.cardCooldowns[pieceId] = def.cooldown;

    this.placePieceInternal(pieceId, col, row, false);
    window.RoyalAudio.playPlacePiece(pieceId, col);

    if (pieceId === 'pawn') {
      this.advanceTutorial(0);
    } else if (['rook', 'knight', 'bishop', 'queen'].includes(pieceId)) {
      this.advanceTutorial(1);
    }

    this.spawnParticles(center.x, center.y, def.accentColor, 14);
    this.recalculateSynergies();
    this.updateHUD();
  }

  placePieceInternal(pieceId, col, row, isFreeStarter = false) {
    const def = window.CHESS_DATA.PIECES[pieceId];
    const cmd = this.getCommander();
    const hpMult = (cmd.mods && cmd.mods.hpMult) || 1.0;
    const bonusShield = (cmd.mods && cmd.mods.bonusShield) || 0;
    const doctrinePawnShield = pieceId === 'pawn' && this.doctrineId === 'phalanx' ? 25 : 0;
    const maxHp = Math.round(def.maxHp * hpMult);
    const piece = {
      id: this.entityIdCounter++,
      type: pieceId,
      col,
      row,
      hp: maxHp,
      maxHp,
      shieldHp: (def.startingShield || 0) + bonusShield + doctrinePawnShield,
      dmgBonusMult: 1.0,
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

  isCastlingPathClear(king, rook) {
    if (!king || !rook) return false;
    if (king.row === rook.row) {
      const r = king.row;
      const minC = Math.min(king.col, rook.col);
      const maxC = Math.max(king.col, rook.col);
      for (let c = minC + 1; c < maxC; c++) {
        if (this.getPieceAt(c, r)) return false;
        const enemyOnSq = this.enemies.some(
          e => Math.round(e.row) === r && Math.floor(e.colPos) === c
        );
        if (enemyOnSq) return false;
      }
      return true;
    }
    if (king.col === rook.col) {
      const c = king.col;
      const minR = Math.min(king.row, rook.row);
      const maxR = Math.max(king.row, rook.row);
      for (let r = minR + 1; r < maxR; r++) {
        if (this.getPieceAt(c, r)) return false;
        const enemyOnSq = this.enemies.some(
          e => Math.round(e.row) === r && Math.floor(e.colPos) === c
        );
        if (enemyOnSq) return false;
      }
      return true;
    }
    return false;
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
            if (
              other.type === 'rook' &&
              (other.row === row || other.col === col) &&
              this.isCastlingPathClear(piece, other)
            ) {
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
    const cdMult = (this.decreeState && this.decreeState.moveCdMult) || 1.0;
    const oldCol = piece.col;
    const oldRow = piece.row;
    const oldCenter = this.renderer.tileCenter(oldCol, oldRow);

    this.advanceTutorial(2);

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

      piece.moveCd = def.moveCooldown * cdMult;
      rook.moveCd = 5.0 * cdMult;

      for (const ally of this.pieces) {
        if (ally.row === piece.row || ally.row === rook.row || ally.col === piece.col) {
          ally.shieldHp = Math.max(ally.shieldHp || 0, 220);
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

      this.addFloorDecal(piece.col, piece.row, 'gold', 10);
      this.addFloorDecal(rook.col, rook.row, 'gold', 10);
      this.unlockAchievement('grand_castle');

      window.RoyalAudio.playCastling();
      this.screenShake = 0.32;
      const newCenter = this.renderer.tileCenter(piece.col, piece.row);
      this.spawnShockwave(newCenter.x, newCenter.y, 14, 150, '#facc15');
      this.addFloatingText(
        this.lang === 'en' ? '♜ ROYAL CASTLING! +GOLD SHIELD!' : '♜ تبييت ملكي! +درع ذهبي!',
        newCenter.x,
        newCenter.y - 18,
        '#facc15',
        true
      );
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
    piece.moveCd = def.moveCooldown * cdMult;

    const newCenter = this.renderer.tileCenter(piece.col, piece.row);
    window.RoyalAudio.playChessMove(piece.type === 'knight');

    if (piece.type === 'knight') {
      this.screenShake = 0.25;
      this.addFloorDecal(piece.col, piece.row, 'scorch', 7.5);
      this.spawnShockwave(newCenter.x, newCenter.y, 12, 125, '#c084fc');
      this.spawnParticles(newCenter.x, newCenter.y, '#a855f7', 20);
      this.addFloatingText(
        this.lang === 'en' ? '⚡ KNIGHT LEAP SLAM!' : '⚡ قفزة الفارس الصاعقة!',
        newCenter.x,
        newCenter.y - 18,
        '#c084fc',
        true
      );
      for (const enemy of [...this.enemies]) {
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
      this.addFloorDecal(piece.col, piece.row, 'scorch', 6.5);
      this.spawnParticles(newCenter.x, newCenter.y, '#fb923c', 16);
      this.addFloatingText(
        this.lang === 'en' ? 'ROOK BULLDOZE!' : 'اجتياح القلعة!',
        newCenter.x,
        newCenter.y - 16,
        '#fb923c',
        false
      );
      for (const enemy of [...this.enemies]) {
        if (Math.round(enemy.row) === piece.row && Math.abs(enemy.colPos - (piece.col + 0.5)) <= 1.2) {
          this.damageEnemy(enemy, 80, false, 1.0);
          enemy.colPos = Math.min(this.cols + 0.2, enemy.colPos + 0.65);
        }
      }
    } else if (piece.type === 'pawn' && move.isDiagonalCapture) {
      this.spawnParticles(newCenter.x, newCenter.y, '#38bdf8', 16);
      this.addFloatingText(
        this.lang === 'en' ? '⚔ DIAGONAL CAPTURE! (+30 XP)' : '⚔ أسر قطري! (+30 خبرة)',
        newCenter.x,
        newCenter.y - 16,
        '#38bdf8',
        true
      );
      piece.xp = Math.min(100, piece.xp + 30);
      for (const enemy of [...this.enemies]) {
        if (Math.round(enemy.row) === piece.row && Math.abs(enemy.colPos - (piece.col + 0.5)) <= 1.5) {
          this.damageEnemy(enemy, 95, true, 1.0);
        }
      }
    } else if (piece.type === 'pawn' && piece.col >= this.cols - 2) {
      piece.xp = Math.min(100, piece.xp + 35);
    }

    // En Passant Execution Decree: sliding adjacent to foes slashes for 145 DMG & executes <30% HP!
    if (this.decreeState && this.decreeState.enPassant) {
      let didSlash = false;
      for (const enemy of [...this.enemies]) {
        if (
          Math.abs(enemy.row - piece.row) <= 1.05 &&
          Math.abs(enemy.colPos - (piece.col + 0.5)) <= 1.35
        ) {
          didSlash = true;
          const prevAlive = enemy.hp > 0;
          this.damageEnemy(enemy, 145, true, 0.8);
          if (enemy.hp > 0 && !enemy.isBoss && enemy.hp / enemy.maxHp <= 0.3) {
            this.damageEnemy(enemy, enemy.hp + 999, true, 0.5);
          }
          if (prevAlive && enemy.hp <= 0) {
            this.unlockAchievement('en_passant_kill');
          }
        }
      }
      if (didSlash) {
        this.spawnShockwave(newCenter.x, newCenter.y, 10, 95, '#38bdf8');
        this.addFloatingText(
          this.lang === 'en' ? '♟ EN PASSANT SLASH!' : '♟ إعدام الأخذ بالتجاوز!',
          newCenter.x,
          newCenter.y - 26,
          '#7dd3fc',
          true
        );
      }
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
        this.addFloatingText(
          this.lang === 'en' ? '⚔ DISCOVERED ATTACK! (1.6x)' : '⚔ هجوم مكشوف! (1.6x)',
          c.x,
          c.y - 22,
          '#facc15',
          true
        );
        this.performPieceAttack(ally, 1.6);
        break;
      }
    }
  }

  // Full-Screen Cinematic 5-Pawn Line Merge into an Ascended Sovereign Queen!
  tryMergePawnLine(anchorPawn = null) {
    if (this.mergeCinematic) return false;
    if (!this.readyPawnLines || this.readyPawnLines.length === 0) return false;

    const queenDef = window.CHESS_DATA.PIECES.queen;
    if (this.countPiecesOfType('queen') >= (queenDef.maxCount || 2)) {
      const anchor = anchorPawn || this.readyPawnLines[0].pawns[0];
      const center = this.renderer.tileCenter(anchor.col, anchor.row);
      this.addFloatingText(
        this.lang === 'en' ? 'MAX QUEENS REACHED (2/2)!' : 'الحد الأقصى للوزراء مكتمل (2/2)!',
        center.x,
        center.y - 20,
        '#f87171',
        true
      );
      return false;
    }

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

      if (targetPawn) {
        targetPawn.inMergeCinematic = false;
        targetPawn.type = 'queen';
        targetPawn.isAscended = true;
        targetPawn.maxHp = 820; // 820 HP Ascended Queen!
        targetPawn.hp = targetPawn.maxHp;
        targetPawn.shieldHp = 300;
        targetPawn.attackTimer = 0.2;
        targetPawn.moveCd = 0;
        targetPawn.hexTimer = 0;
        this.selectedBoardPiece = targetPawn;
      }

      this.addFloorDecal(mc.targetCol, mc.targetRow, 'gold', 14);
      this.unlockAchievement('ascended_merge');

      // Triple Golden Shockwave & Undead Repulsion
      this.spawnShockwave(mc.targetX, mc.targetY, 16, 240, '#fef08a');
      this.spawnShockwave(mc.targetX, mc.targetY, 10, 165, '#facc15');
      this.spawnParticles(mc.targetX, mc.targetY, '#facc15', 36);

      for (const enemy of [...this.enemies]) {
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
        this.lang === 'en' ? '♛ ROYAL ASCENSION → SOVEREIGN QUEEN!' : '♛ ارتقاء ملكي ← الوزير المتوّج!',
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
    if (pawn.inReadyPawnLine && this.countPiecesOfType('queen') < (window.CHESS_DATA.PIECES.queen.maxCount || 2)) {
      this.tryMergePawnLine(pawn);
      return;
    }
    if (pawn.xp < 100) return;

    const promoteCost =
      (this.decreeState && this.decreeState.promoteCost) ||
      window.CHESS_DATA.PIECES.pawn.promoteCost ||
      125;
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

    this.addFloorDecal(pawn.col, pawn.row, 'gold', 9);
    window.RoyalAudio.playPromotion();
    this.screenShake = 0.3;
    this.spawnShockwave(center.x, center.y, 12, 130, '#facc15');
    this.spawnParticles(center.x, center.y, '#facc15', 28);
    this.addFloatingText(
      targetType === 'queen'
        ? (this.lang === 'en' ? '♛ PROMOTED TO SOVEREIGN QUEEN!' : '♛ تمت الترقية إلى الوزير الملكي!')
        : (this.lang === 'en' ? '⚡ PROMOTED TO TEMPEST KNIGHT! (MAX 2 QUEENS)' : '⚡ تمت الترقية إلى فارس العاصفة! (الحد 2 وزير)'),
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
    const costPaid = this.getPieceCost(piece.type);
    const refund = Math.floor(costPaid * 0.6);
    this.mana += refund;
    this.totalManaEarned += refund;

    const center = this.renderer.tileCenter(piece.col, piece.row);
    this.addFloorDecal(piece.col, piece.row, 'scorch', 8);
    this.spawnParticles(center.x, center.y, '#f43f5e', 20);
    this.addFloatingText(
      this.lang === 'en' ? `SACRIFICED (+${refund}☀)` : `تضحية (+${refund}☀)`,
      center.x,
      center.y - 14,
      '#fb7185',
      true
    );

    if (this.decreeState && this.decreeState.martyrPact) {
      for (const ally of this.pieces) {
        if (
          ally.id !== piece.id &&
          Math.abs(ally.col - piece.col) <= 1 &&
          Math.abs(ally.row - piece.row) <= 1
        ) {
          ally.dmgBonusMult = (ally.dmgBonusMult || 1.0) * 1.18;
          ally.shieldHp = (ally.shieldHp || 0) + 120;
          const ac = this.renderer.tileCenter(ally.col, ally.row);
          this.spawnParticles(ac.x, ac.y, '#facc15', 10);
        }
      }
    }

    for (const enemy of [...this.enemies]) {
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

    this.announceBanner(
      this.lang === 'en' ? '⚡ CHECKMATE OVERLOAD!' : '⚡ كش مات الشاملة!',
      this.lang === 'en'
        ? 'Sovereign Sky-Spears Strike Every Rank!'
        : 'رماح السماء الذهبية تطهّر جميع الصفوف!'
    );

    for (const enemy of [...this.enemies]) {
      const ex = this.renderer.boardLeft + enemy.colPos * this.renderer.tileSize;
      const ey = this.renderer.boardTop + (enemy.row + 0.5) * this.renderer.tileSize;
      const colFloor = Math.max(0, Math.min(this.cols - 1, Math.floor(enemy.colPos)));
      this.addFloorDecal(colFloor, Math.round(enemy.row), 'gold', 8);
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

    for (const p of this.pieces) {
      p.buffedByKing = false;
      p.buffedByChalice = false;
      p.inBattery = false;
      p.inPawnChain = false;
      p.inReadyPawnLine = false;
    }

    const kingAuraRadius = this.decreeState && this.decreeState.kingExpandedAura ? 2 : 1;

    for (let i = 0; i < this.pieces.length; i++) {
      const a = this.pieces[i];

      if (a.type === 'king' || a.type === 'chalice') {
        const rad = a.type === 'king' ? kingAuraRadius : 1;
        for (const b of this.pieces) {
          if (a.id !== b.id && Math.abs(a.col - b.col) <= rad && Math.abs(a.row - b.row) <= rad) {
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

    // Check Vertical Columns & Horizontal Rows (ONLY highlight merge lines when Queen cap < maxCount!)
    const queenMax = (window.CHESS_DATA.PIECES.queen && window.CHESS_DATA.PIECES.queen.maxCount) || 2;
    const canMergeQueen = this.countPiecesOfType('queen') < queenMax;
    if (canMergeQueen) {
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
  }

  getAttackVisionSquares(pieceType, col, row) {
    const squares = [];
    const addSq = (c, r, isCrit = false) => {
      if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
        squares.push({ col: c, row: r, isCrit });
      }
    };
    const artBonus = this.doctrineId === 'artillery' ? 1 : 0;
    const qBonus = Math.round((this.decreeState && this.decreeState.queenBonusRange) || 0);
    const kingRad = this.decreeState && this.decreeState.kingExpandedAura ? 2 : 1;

    switch (pieceType) {
      case 'chalice':
      case 'king': {
        const rad = pieceType === 'king' ? kingRad : 1;
        for (let dc = -rad; dc <= rad; dc++) {
          for (let dr = -rad; dr <= rad; dr++) {
            if (dc !== 0 || dr !== 0) addSq(col + dc, row + dr, pieceType === 'king');
          }
        }
        break;
      }

      case 'pawn':
        addSq(col + 1, row, false);
        break;

      case 'rook':
        for (let step = 1; step <= 5 + artBonus; step++) {
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
          for (let s = 1; s <= 4 + artBonus; s++) addSq(col + dc * s, row + dr * s, false);
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
          for (let s = 1; s <= 3 + qBonus; s++) addSq(col + dc * s, row + dr * s, true);
        });
        break;
    }

    return squares;
  }

  pollGamepad(rawDt) {
    if (!navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    const gp = pads && (pads[0] || pads[1] || pads[2] || pads[3]);
    if (!gp) return;

    if (this._gpAxisCooldown > 0) {
      this._gpAxisCooldown = Math.max(0, this._gpAxisCooldown - rawDt);
    }

    const pressedNow = idx => Boolean(gp.buttons && gp.buttons[idx] && gp.buttons[idx].pressed);
    const justPressed = idx => {
      const cur = pressedNow(idx);
      const prev = Boolean(this._gpPrevButtons[idx]);
      this._gpPrevButtons[idx] = cur;
      return cur && !prev;
    };

    if (justPressed(9)) {
      this.togglePause();
      return;
    }
    if (this.paused || this.gameOver || this.onTitleScreen) return;

    // D-Pad (12..15) or Left Stick (axes 0, 1)
    let moveDc = 0;
    let moveDr = 0;
    if (justPressed(12)) moveDr = -1;
    else if (justPressed(13)) moveDr = 1;
    else if (justPressed(14)) moveDc = -1;
    else if (justPressed(15)) moveDc = 1;
    else if (this._gpAxisCooldown <= 0 && gp.axes && gp.axes.length >= 2) {
      if (gp.axes[0] < -0.55) moveDc = -1;
      else if (gp.axes[0] > 0.55) moveDc = 1;
      else if (gp.axes[1] < -0.55) moveDr = -1;
      else if (gp.axes[1] > 0.55) moveDr = 1;
      if (moveDc !== 0 || moveDr !== 0) this._gpAxisCooldown = 0.17;
    }

    if (moveDc !== 0 || moveDr !== 0) {
      this.cursorActive = true;
      this.cursorCell.col = Math.max(0, Math.min(this.cols - 1, this.cursorCell.col + moveDc));
      this.cursorCell.row = Math.max(0, Math.min(this.rows - 1, this.cursorCell.row + moveDr));
      const pt = this.renderer.tileCenter(this.cursorCell.col, this.cursorCell.row);
      this.hoverCell = { col: this.cursorCell.col, row: this.cursorCell.row, x: pt.x, y: pt.y, valid: true };
    }

    // LB (4) / RB (5): Cycle Deck Piece
    if (justPressed(4) || justPressed(5)) {
      const pieceKeys = Object.keys(window.CHESS_DATA.PIECES);
      const curIdx = Math.max(0, pieceKeys.indexOf(this.selectedDeckPieceId || 'pawn'));
      const dir = this._gpPrevButtons[5] ? 1 : -1;
      this.selectDeckPiece(pieceKeys[(curIdx + dir + pieceKeys.length) % pieceKeys.length]);
    }
    // A / Cross (0): Deploy / Select / Move on cursorCell
    if (justPressed(0)) {
      window.RoyalAudio.init();
      window.RoyalAudio.startMusic();
      this.cursorActive = true;
      this.handleBoardClick(this.cursorCell.col, this.cursorCell.row);
    }
    // B / Circle (1): Cancel selection / shovel
    if (justPressed(1)) {
      this.selectedBoardPiece = null;
      this.shovelMode = false;
      this.updateHUD();
    }
    // X (2): Merge [M] or Promote [U]
    if (justPressed(2)) {
      if (!this.tryMergePawnLine(this.selectedBoardPiece) && this.selectedBoardPiece && this.selectedBoardPiece.type === 'pawn' && this.selectedBoardPiece.xp >= 100) {
        this.tryPromotePawn(this.selectedBoardPiece);
      }
    }
    // Y (3): Checkmate Ultimate
    if (justPressed(3)) {
      this.triggerCheckmateUltimate();
    }
  }

  loop(timestamp) {
    const rawDt = Math.min(0.05, (timestamp - this.lastTimestamp) / 1000);
    this.lastTimestamp = timestamp;

    this.pollGamepad(rawDt);

    if (!this.paused && !this.gameOver) {
      if (this.mergeCinematic) {
        this.updateMergeCinematic(rawDt);
      }
      if (this.hitStopTimer > 0) {
        this.hitStopTimer = Math.max(0, this.hitStopTimer - rawDt);
        this.updateVFX(rawDt * 0.45);
      } else {
        const simSpeed = this.mergeCinematic ? 0.12 : this.gameSpeed;
        const dt = rawDt * simSpeed;
        this.update(dt);
      }
    }

    this.renderer.render(timestamp / 1000);
    requestAnimationFrame(ts => this.loop(ts));
  }

  update(dt) {
    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 1.5);

    this.tipTimer += dt;
    if (this.tipTimer >= 13.0) {
      this.tipTimer = 0;
      const list = this.lang === 'en' ? window.CHESS_DATA.TIPS_EN : window.CHESS_DATA.TIPS;
      this.tipIndex = (this.tipIndex + 1) % list.length;
      this.updateTipTicker();
    }

    for (const k of Object.keys(this.cardCooldowns)) {
      if (this.cardCooldowns[k] > 0) {
        this.cardCooldowns[k] = Math.max(0, this.cardCooldowns[k] - dt);
      }
    }

    // Deterministic Puzzles skip random Sky Mana drops so resource math is 100% pure!
    if (this.gameMode !== 'puzzle') {
      this.skyManaTimer -= dt;
      if (this.skyManaTimer <= 0) {
        this.skyManaTimer = this.currentAct.skyDropInterval || 6.8;
        const randCol = 1 + Math.floor(this.rand() * (this.cols - 2));
        const randRow = Math.floor(this.rand() * this.rows);
        const target = this.renderer.tileCenter(randCol, randRow);
        this.spawnManaOrb(target.x, 18, target.y, 25);
      }
    }

    this.updateWaves(dt);
    this.updatePieces(dt);
    this.updateEnemies(dt);
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
      // Award Wave Clear Treasury Bonus + Compound Interest once when a wave is cleared
      if (this.waveIndex >= 1 && !this.waveClearRewarded) {
        this.waveClearRewarded = true;
        const activeChalices = this.countPiecesOfType('chalice');
        const interest =
          this.decreeState && this.decreeState.interestRate > 0
            ? Math.min(55, Math.floor(this.mana * this.decreeState.interestRate))
            : 0;
        const waveBonus = 20 + activeChalices * 5 + interest;
        this.mana += waveBonus;
        this.totalManaEarned += waveBonus;
        this.score += 75;
        this.addFloatingText(
          `+${waveBonus}☀ ${this.lang === 'en' ? `Wave ${this.waveIndex} Clear!` : `مكافأة تطهير الموجة ${this.waveIndex}!`}`,
          this.renderer.width * 0.5,
          this.renderer.boardTop + 32,
          '#facc15',
          true
        );

        // If this was the final wave of a campaign Act / Puzzle, trigger Victory immediately!
        if (!this.currentAct.isEndless && this.waveIndex >= this.currentAct.waves.length) {
          this.handleActVictory();
          return;
        }

        // Royal Decree Draft after waves 2, 4, 6 in Campaign/Daily, or every 3 waves in Endless!
        const shouldDraft = this.gameMode !== 'puzzle' && (
          this.currentAct.isEndless ? this.waveIndex % 3 === 0 : this.waveIndex % 2 === 0
        );
        if (shouldDraft) {
          this.openDecreeDraft();
          return;
        }
      }

      if (!this.currentAct.isEndless && this.waveIndex >= this.currentAct.waves.length) {
        this.handleActVictory();
        return;
      }

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
    this.waveClearRewarded = false;
    this.waveCooldownTimer = 3.8;

    this.waveSpawnQueue = [];
    for (const group of waveDef.spawns) {
      for (let i = 0; i < group.count; i++) {
        const fixedRow =
          Array.isArray(group.fixedRows) && group.fixedRows.length > 0
            ? group.fixedRows[i % group.fixedRows.length]
            : this.pickStrategicSpawnRow(group.type, i);
        const jitter = this.gameMode === 'puzzle' ? 1.0 : 0.75 + this.getWaveRandom(i) * 0.4;
        this.waveSpawnQueue.push({
          type: group.type,
          row: fixedRow,
          delay: i === 0 ? 0.6 : group.interval * jitter
        });
      }
    }

    this.updateWaveThreatIcons(waveDef);

    if (waveDef.isFlag) {
      window.RoyalAudio.playWaveHorn();
      window.RoyalAudio.setIntenseMode(true);
      this.announceBanner(
        `⚔ ${waveDef.label}`,
        this.lang === 'en'
          ? `Wave ${this.waveIndex} — A Massive Horde Approaches!`
          : `الموجة ${this.waveIndex} — جحافل الظلام الكبرى تتقدم!`
      );
    } else {
      window.RoyalAudio.setIntenseMode(false);
    }
  }

  getWaveRandom(seedOffset = 0) {
    if (this.gameMode === 'daily' || this.gameMode === 'puzzle') {
      return this.rand();
    }
    return Math.random();
  }

  getIncomingLaneCount(row) {
    let count = 0;
    for (let i = 0; i < Math.min(8, this.waveSpawnQueue.length); i++) {
      if (this.waveSpawnQueue[i].row === row) count++;
    }
    return count;
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

  pickStrategicSpawnRow(enemyType, seedOffset = 0) {
    if (enemyType === 'assassin' || enemyType === 'necro') {
      const royalty = this.pieces.filter(p => p.type === 'queen' || p.type === 'king' || p.type === 'bishop');
      if (royalty.length > 0) {
        const chosen = royalty[Math.floor(this.getWaveRandom(seedOffset) * royalty.length)];
        return chosen.row;
      }
    }
    return Math.floor(this.getWaveRandom(seedOffset + 11) * this.rows);
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
      if (waveNum >= 4) {
        spawns.push({ type: 'plague_queen', count: Math.max(1, Math.floor(waveNum / 5)), interval: 4.4 });
      }
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

    const endlessScale = this.currentAct.isEndless ? 1 + this.waveIndex * 0.1 : 1;
    const asc = this.gameMode === 'campaign' ? this.getAscension() : { hpMult: 1, spdMult: 1, shieldMult: 1 };
    const hpScale = endlessScale * (asc.hpMult || 1.0);
    const shieldScale = endlessScale * (asc.shieldMult || 1.0);
    const spdScale = asc.spdMult || 1.0;
    const colJitter = this.gameMode === 'puzzle' ? 0.05 : this.rand() * 0.25;

    this.enemies.push({
      id: this.entityIdCounter++,
      type,
      row,
      colPos: this.cols - 0.05 + colJitter,
      hp: Math.round(def.maxHp * hpScale),
      maxHp: Math.round(def.maxHp * hpScale),
      shieldHp: Math.round((def.shieldHp || 0) * shieldScale),
      maxShieldHp: Math.round((def.shieldHp || 0) * shieldScale),
      speed: def.speed * spdScale,
      dps: def.dps,
      isBoss: Boolean(def.isBoss),
      isAttacking: false,
      hasVaulted: false,
      vaultAnimTimer: 0,
      hasThrownImp: false,
      rangedTimer: def.rangedInterval || 2.6,
      telegraphedHex: false,
      telegraphedBlink: false,
      slowTimer: 0,
      burnTimer: 0,
      hitFlash: 0
    });
  }

  updatePieces(dt) {
    const imperialRegen = this.decreeState && this.decreeState.kingExpandedAura ? 14 : 0;

    for (const piece of this.pieces) {
      if (piece.inMergeCinematic) continue;
      if (piece.recoilTimer > 0) piece.recoilTimer = Math.max(0, piece.recoilTimer - dt);
      if (piece.shoveTimer > 0) piece.shoveTimer = Math.max(0, piece.shoveTimer - dt);
      if (piece.moveAnimTimer > 0) piece.moveAnimTimer = Math.max(0, piece.moveAnimTimer - dt);
      if (piece.moveCd > 0) piece.moveCd = Math.max(0, piece.moveCd - dt);
      if (piece.hexTimer > 0) piece.hexTimer = Math.max(0, piece.hexTimer - dt);

      if (imperialRegen > 0 && piece.buffedByKing && piece.hp < piece.maxHp) {
        piece.hp = Math.min(piece.maxHp, piece.hp + imperialRegen * dt);
      }

      // Phalanx Shield-Pawn Defender: balanced shield & HP regeneration
      if (piece.type === 'pawn') {
        const isBeingChewed = this.enemies.some(
          e =>
            Math.round(e.row) === piece.row &&
            e.colPos >= piece.col + 0.12 &&
            e.colPos <= piece.col + 0.98
        );
        const hpRegen = piece.inPawnChain || piece.inReadyPawnLine ? 4.5 : 0;
        if (hpRegen > 0 && piece.hp < piece.maxHp) {
          piece.hp = Math.min(piece.maxHp, piece.hp + hpRegen * dt);
        }
        const maxShield = (piece.inPawnChain || piece.inReadyPawnLine ? 95 : 65) + (this.doctrineId === 'phalanx' ? 25 : 0);
        if ((!isBeingChewed || piece.inPawnChain) && piece.shieldHp < maxShield) {
          piece.shieldHp = Math.min(maxShield, piece.shieldHp + 2.5 * dt);
        }
      } else if (piece.inPawnChain && piece.hp < piece.maxHp) {
        piece.hp = Math.min(piece.maxHp, piece.hp + 5 * dt);
      }

      const cmd = this.getCommander();
      let speedMult = (this.decreeState && this.decreeState.atkSpeedMult) || 1.0;
      if (piece.buffedByKing) speedMult += 0.3;
      if (piece.buffedByChalice) speedMult += 0.15;
      if (cmd.mods.casterSpdMult && (piece.type === 'bishop' || piece.type === 'queen')) {
        speedMult *= cmd.mods.casterSpdMult;
      }
      if (piece.type === 'chalice') {
        const chRate = (this.decreeState && this.decreeState.chaliceRateMult) || 1.0;
        speedMult *= chRate / (cmd.mods.chaliceIntervalMult || 1.0);
      }
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
    const batteryPct = 0.3 + ((this.decreeState && this.decreeState.batteryBonus) || 0);
    const batteryMult = piece.inBattery ? 1 + batteryPct : 1.0;
    const totalMult =
      bonusMultiplier *
      batteryMult *
      (piece.dmgBonusMult || 1.0) *
      ((this.decreeState && this.decreeState.damageMult) || 1.0);

    switch (piece.type) {
      case 'chalice': {
        const yieldVal = piece.buffedByKing ? 30 : def.manaYield || 25;
        this.spawnManaOrb(center.x, center.y - 12, center.y + 10, yieldVal);
        const pulseShield = (this.decreeState && this.decreeState.chaliceShieldPulse) || 0;
        if (pulseShield > 0) {
          for (const ally of this.pieces) {
            if (
              ally.id !== piece.id &&
              Math.abs(ally.col - piece.col) <= 1 &&
              Math.abs(ally.row - piece.row) <= 1
            ) {
              ally.shieldHp = Math.min(260, (ally.shieldHp || 0) + pulseShield);
            }
          }
        }
        piece.recoilTimer = 0.16;
        return true;
      }

      case 'pawn': {
        // Pure Physical Shield Pusher / Halberd Vanguard (NO lasers, NO beams, NO projectiles!)
        const meleeEnemies = this.enemies.filter(
          e =>
            Math.round(e.row) === piece.row &&
            e.colPos >= piece.col - 0.15 &&
            e.colPos <= piece.col + 1.32
        );
        if (meleeEnemies.length === 0) return false;

        piece.shoveTimer = 0.30;
        const isHalberd = this.doctrineId === 'halberd';
        this.spawnShockwave(center.x + 18, center.y, 8, 42, isHalberd ? '#fb7185' : '#38bdf8');
        this.spawnParticles(center.x + 22, center.y, isHalberd ? '#fb7185' : '#38bdf8', 10);

        const kbMult = (this.decreeState && this.decreeState.pawnKnockbackMult) || 1.0;
        const pawnDmgMult = isHalberd ? 2.4 : 1.0;
        for (const target of [...meleeEnemies]) {
          this.damageEnemy(target, def.damage * totalMult * pawnDmgMult, isHalberd, 0.8);
          const baseShove = target.isBoss ? 0.04 : target.type === 'buckler' ? 0.12 : 0.24;
          target.colPos = Math.min(this.cols + 0.2, target.colPos + baseShove * kbMult);
          target.slowTimer = Math.max(target.slowTimer, 0.70);
        }

        this.addFloatingText(
          isHalberd
            ? (this.lang === 'en' ? '⚔ HALBERD THRUST!' : '⚔ طعنة المطارد!')
            : (this.lang === 'en' ? '❖ SHIELD PUSH!' : '❖ دفع بالدرع!'),
          center.x + 18,
          center.y - 18,
          isHalberd ? '#fda4af' : '#7dd3fc',
          false
        );
        piece.xp = Math.min(100, piece.xp + (isHalberd ? 23 : 15));
        window.RoyalAudio.playAttack('pawn', piece.col);
        return true;
      }

      case 'rook': {
        // True First-Enemy Line-of-Sight Blocking along 4 Cardinal Directions
        const maxDist = 5.5 + (this.doctrineId === 'artillery' ? 1.0 : 0);
        const pCol = piece.col + 0.5;
        const cardinalBest = { E: null, W: null, S: null, N: null };

        for (const e of this.enemies) {
          const dCol = e.colPos - pCol;
          const dRow = e.row - piece.row;
          if (Math.round(e.row) === piece.row && Math.abs(dCol) <= maxDist) {
            const dir = dCol >= 0 ? 'E' : 'W';
            const d = Math.abs(dCol);
            if (!cardinalBest[dir] || d < cardinalBest[dir].dist) {
              cardinalBest[dir] = { enemy: e, dist: d };
            }
          } else if (Math.abs(dCol) <= 0.6 && Math.abs(dRow) <= maxDist) {
            const dir = dRow >= 0 ? 'S' : 'N';
            const d = Math.abs(dRow);
            if (!cardinalBest[dir] || d < cardinalBest[dir].dist) {
              cardinalBest[dir] = { enemy: e, dist: d };
            }
          }
        }

        const hits = Object.values(cardinalBest).filter(Boolean);
        if (hits.length === 0) return false;

        const rookDmg = def.damage * totalMult * ((this.decreeState && this.decreeState.rookDmgMult) || 1.0);
        const execThresh = (this.decreeState && this.decreeState.rookExecuteThreshold) || 0;

        for (const h of hits) {
          const e = h.enemy;
          const ex = this.renderer.boardLeft + e.colPos * this.renderer.tileSize;
          const ey = this.renderer.boardTop + (e.row + 0.5) * this.renderer.tileSize;
          this.beams.push({
            x1: center.x,
            y1: center.y,
            x2: ex,
            y2: ey,
            color: '#fb923c',
            width: 5.5,
            life: 0.25,
            maxLife: 0.25
          });
          this.damageEnemy(e, rookDmg, false, h.dist);
          if (execThresh > 0 && !e.isBoss && e.hp > 0 && e.hp / e.maxHp <= execThresh) {
            this.damageEnemy(e, e.hp + 999, true, 0.5);
          }
        }

        piece.recoilTimer = 0.18;
        window.RoyalAudio.playAttack('rook', piece.col);
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
        if (isFork) this.unlockAchievement('royal_fork');
        const forkMult = isFork ? 1.4 : 1.0;
        const knightMult = (this.decreeState && this.decreeState.knightDmgMult) || 1.0;
        const strikeDmg = def.damage * totalMult * forkMult * knightMult;
        const hitIds = new Set(hitEnemies.map(h => h.enemy.id));

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
          this.damageEnemy(item.enemy, strikeDmg, true, 2.0);
          if (this.decreeState && this.decreeState.knightStun) {
            item.enemy.slowTimer = Math.max(item.enemy.slowTimer, 1.4);
          }

          // Tempest Chain-Arc Decree: arc 60% splash lightning to 1 extra nearby enemy!
          if (this.decreeState && this.decreeState.knightChain) {
            const chainTarget = this.enemies.find(
              other =>
                !hitIds.has(other.id) &&
                other.hp > 0 &&
                Math.hypot(other.colPos - item.enemy.colPos, other.row - item.enemy.row) <= 1.85
            );
            if (chainTarget) {
              hitIds.add(chainTarget.id);
              const cx = this.renderer.boardLeft + chainTarget.colPos * this.renderer.tileSize;
              const cy = this.renderer.boardTop + (chainTarget.row + 0.5) * this.renderer.tileSize;
              this.beams.push({
                x1: ex,
                y1: ey,
                x2: cx,
                y2: cy,
                color: '#38bdf8',
                width: 2.8,
                life: 0.22,
                maxLife: 0.22,
                isLightning: true
              });
              this.damageEnemy(chainTarget, strikeDmg * 0.6, true, 2.0);
            }
          }
        }

        if (isFork) {
          this.addFloatingText(
            this.lang === 'en' ? `⚡ ROYAL FORK! (${hitEnemies.length}x HIT)` : `⚡ شوكة الفارس! (${hitEnemies.length}x)`,
            center.x,
            center.y - 24,
            '#fde047',
            true
          );
        }

        piece.recoilTimer = 0.18;
        window.RoyalAudio.playAttack('knight', piece.col);
        return true;
      }

      case 'bishop': {
        const isLightSquare = (piece.row + piece.col) % 2 === 0;
        const twin = Boolean(this.decreeState && this.decreeState.twinPrisms);
        const maxDiag = 4.5 + (this.doctrineId === 'artillery' ? 1.0 : 0);
        const diagEnemies = this.enemies.filter(e => {
          const dCol = Math.abs(e.colPos - (piece.col + 0.5));
          const dRow = Math.abs(e.row - piece.row);
          return dRow >= 0.35 && dRow <= maxDiag && Math.abs(dCol - dRow) <= 0.65;
        });

        if (diagEnemies.length === 0) return false;

        const dirs = [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1]
        ];
        const maxSteps = Math.floor(maxDiag);
        for (const [dc, dr] of dirs) {
          const endCol = Math.max(0, Math.min(this.cols - 1, piece.col + dc * maxSteps));
          const endRow = Math.max(0, Math.min(this.rows - 1, piece.row + dr * maxSteps));
          const endPt = this.renderer.tileCenter(endCol, endRow);
          this.beams.push({
            x1: center.x,
            y1: center.y,
            x2: endPt.x,
            y2: endPt.y,
            color: twin ? '#e879f9' : isLightSquare ? '#fbbf24' : '#2dd4bf',
            width: 3.5,
            life: 0.24,
            maxLife: 0.24
          });
        }

        const casterMult = (this.decreeState && this.decreeState.casterDmgMult) || 1.0;
        const healAmt = 18 + ((this.decreeState && this.decreeState.bonusHeal) || 0);

        for (const e of [...diagEnemies]) {
          const dist = Math.hypot(e.colPos - (piece.col + 0.5), e.row - piece.row);
          const sqMult = isLightSquare || twin ? 1.2 : 1.0;
          this.damageEnemy(e, def.damage * totalMult * casterMult * sqMult, true, dist);
          if (isLightSquare || twin) e.burnTimer = 2.8;
          if (!isLightSquare || twin) {
            e.slowTimer = 3.0;
            this.addFloorDecal(Math.max(0, Math.min(this.cols - 1, Math.floor(e.colPos))), Math.round(e.row), 'frost', 4.5);
          }
        }

        for (const ally of this.pieces) {
          if (
            ally.id !== piece.id &&
            Math.abs(ally.col - piece.col) === Math.abs(ally.row - piece.row)
          ) {
            ally.hp = Math.min(ally.maxHp, ally.hp + healAmt);
            if (ally.hexTimer > 0) {
              ally.hexTimer = 0;
              const ac = this.renderer.tileCenter(ally.col, ally.row);
              this.addFloatingText(
                this.lang === 'en' ? '❖ HEX CLEANSED!' : '❖ تطهير اللعنة!',
                ac.x,
                ac.y - 16,
                '#2dd4bf',
                false
              );
            }
          }
        }

        piece.recoilTimer = 0.18;
        window.RoyalAudio.playAttack('bishop', piece.col);
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
        for (const e of [...nearby]) {
          this.damageEnemy(e, def.damage * totalMult, true, 1.2);
          e.colPos = Math.min(this.cols + 0.2, e.colPos + 0.25);
        }
        piece.recoilTimer = 0.18;
        window.RoyalAudio.playAttack('king', piece.col);
        return true;
      }

      case 'queen': {
        const maxRange = (def.maxRange || 4.6) + ((this.decreeState && this.decreeState.queenBonusRange) || 0);
        // Group candidates by 8 discrete starburst ray directions; keep only the closest enemy per ray!
        const rayMap = new Map();

        for (const e of this.enemies) {
          const dCol = e.colPos - (piece.col + 0.5);
          const dRow = e.row - piece.row;
          const dist = Math.hypot(dCol, dRow);
          if (dist > maxRange) continue;

          const onRank = Math.abs(dRow) <= 0.42;
          const onFile = Math.abs(dCol) <= 0.55;
          const onDiag = Math.abs(Math.abs(dCol) - Math.abs(dRow)) <= 0.55;

          let rayKey = null;
          if (onRank) {
            rayKey = dCol >= 0 ? 'E' : 'W';
          } else if (onFile) {
            rayKey = dRow >= 0 ? 'S' : 'N';
          } else if (onDiag) {
            rayKey = (dRow >= 0 ? 'S' : 'N') + (dCol >= 0 ? 'E' : 'W');
          }

          if (rayKey) {
            const existing = rayMap.get(rayKey);
            if (!existing || dist < existing.dist) {
              rayMap.set(rayKey, { enemy: e, dist, rayKey });
            }
          }
        }

        if (rayMap.size === 0) return false;

        const rayCandidates = Array.from(rayMap.values()).sort((a, b) => a.dist - b.dist);
        const maxRays = piece.isAscended ? 4 : 3;
        const ascMult = piece.isAscended ? 1.22 : 1.0;
        const qMult =
          ((this.decreeState && this.decreeState.queenDmgMult) || 1.0) *
          ((this.decreeState && this.decreeState.casterDmgMult) || 1.0);
        const chosen = rayCandidates.slice(0, maxRays);

        for (const item of chosen) {
          const e = item.enemy;
          const ex = this.renderer.boardLeft + e.colPos * this.renderer.tileSize;
          const ey = this.renderer.boardTop + (e.row + 0.5) * this.renderer.tileSize;
          this.beams.push({
            x1: center.x,
            y1: center.y - 8,
            x2: ex,
            y2: ey,
            color: piece.isAscended ? '#fef08a' : '#facc15',
            width: piece.isAscended ? 5.2 : 4.5,
            life: 0.24,
            maxLife: 0.24
          });
          this.damageEnemy(e, def.damage * totalMult * ascMult * qMult, true, item.dist);
        }

        piece.recoilTimer = 0.18;
        window.RoyalAudio.playAttack('queen', piece.col);
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
          } else if (e.row > 0 && this.rand() < 0.5) {
            e.row -= 1;
          } else if (e.row < this.rows - 1) {
            e.row += 1;
          }

          const ex = this.renderer.boardLeft + e.colPos * this.renderer.tileSize;
          const ey = this.renderer.boardTop + (e.row + 0.5) * this.renderer.tileSize;
          this.addFloatingText(
            e.type === 'assassin'
              ? (this.lang === 'en' ? '⚔ SHADOW L-AMBUSH!' : '⚔ كمين الفارس الشبح!')
              : (this.lang === 'en' ? 'KNIGHT-VAULT!' : 'قفزة الحصان!'),
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
        const eCol = e.colPos - 0.5;
        const diagTargets = this.pieces.filter(p => {
          const dCol = Math.abs(p.col - eCol);
          const dRow = Math.abs(p.row - e.row);
          return dRow >= 0.4 && Math.abs(dCol - dRow) <= 0.8 && dRow <= 4.5;
        });
        const candidatePool = diagTargets.length > 0 ? diagTargets : this.pieces.filter(p => p.row === Math.round(e.row));

        // Red "CHECK!" Telegraph Zone 1.0s before Necro-Bishop fires!
        if (!e.telegraphedHex && e.rangedTimer <= 1.05 && candidatePool.length > 0) {
          e.telegraphedHex = true;
          const prio = { queen: 3, king: 2, bishop: 2 };
          const previewTarget = [...candidatePool].sort((a, b) => (prio[b.type] || 1) - (prio[a.type] || 1))[0];
          this.addTelegraphZone(
            previewTarget.col,
            previewTarget.row,
            1.05,
            this.lang === 'en' ? '⚠ HEX CHECK!' : '⚠ كش لعنة!'
          );
        }

        if (e.rangedTimer <= 0) {
          e.rangedTimer = 2.8;
          e.telegraphedHex = false;
          if (candidatePool.length > 0) {
            const sortedTargets = [...candidatePool].sort((a, b) => {
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
            this.addFloatingText(
              this.lang === 'en' ? '❖ HEXED (-40% SPD)' : '❖ ملعون (-40% سرعة)',
              tc.x,
              tc.y - 18,
              '#2dd4bf',
              false
            );
          }
        }
      }

      // Signature Boss AI: Blight Sovereign Queen diagonally teleports between ranks every 7.5s (with Red Telegraph!)
      if (e.type === 'plague_queen' && e.colPos < this.cols - 0.8 && e.colPos > 1.2) {
        e.teleportTimer = (e.teleportTimer ?? 6.5) - dt;
        if (!e.telegraphedBlink && e.teleportTimer <= 1.1) {
          e.telegraphedBlink = true;
          const shift = this.rand() < 0.5 ? -1 : 1;
          e._pendingNextRow = (Math.round(e.row) + shift + this.rows) % this.rows;
          const destCol = Math.max(1, Math.min(this.cols - 1, Math.floor(e.colPos - 0.35)));
          this.addTelegraphZone(
            destCol,
            e._pendingNextRow,
            1.1,
            this.lang === 'en' ? '♛ BLINK!' : '♛ انتقال!'
          );
        }
        if (e.teleportTimer <= 0) {
          e.teleportTimer = 7.5;
          e.telegraphedBlink = false;
          const nextRow =
            e._pendingNextRow !== undefined
              ? e._pendingNextRow
              : (Math.round(e.row) + (this.rand() < 0.5 ? -1 : 1) + this.rows) % this.rows;
          e._pendingNextRow = undefined;
          const oldX = this.renderer.boardLeft + e.colPos * this.renderer.tileSize;
          const oldY = this.renderer.boardTop + (e.row + 0.5) * this.renderer.tileSize;
          this.spawnParticles(oldX, oldY, '#e879f9', 16, true);
          e.row = nextRow;
          e.colPos = Math.max(1.2, e.colPos - 0.35);
          const newX = this.renderer.boardLeft + e.colPos * this.renderer.tileSize;
          const newY = this.renderer.boardTop + (e.row + 0.5) * this.renderer.tileSize;
          this.spawnShockwave(newX, newY, 8, 56, '#e879f9');
          this.addFloatingText(
            this.lang === 'en' ? '♛ PHASE BLINK!' : '♛ انتقال طيفي!',
            newX,
            newY - 24,
            '#f0abfc',
            true
          );
        }
      }

      if (e.type === 'gargantua' && !e.hasThrownImp && e.hp <= e.maxHp * 0.55) {
        e.hasThrownImp = true;
        const impDef = window.CHESS_DATA.ENEMIES.imp;
        const impRow = Math.floor(this.rand() * this.rows);
        this.addTelegraphZone(2, impRow, 0.75, this.lang === 'en' ? '⚠ IMP!' : '⚠ عفريت!');
        this.enemies.push({
          id: this.entityIdCounter++,
          type: 'imp',
          row: impRow,
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
        this.addFloatingText(
          this.lang === 'en' ? 'IMP LAUNCHED!' : 'قذف عفريت الوباء!',
          ex,
          ey - 32,
          '#f97316',
          true
        );
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
            this.lang === 'en' ? '♜ WINGED ROOK SWEEP!' : '♜ القلعة المجنحة: تطهير الصف!',
            this.renderer.boardLeft + 210,
            this.renderer.boardTop + (sentinel.row + 0.5) * this.renderer.tileSize,
            '#fef08a',
            true
          );
        } else if (!sentinel || !sentinel.active) {
          const bDef = window.CHESS_DATA.ENEMIES[e.type];
          this.breachInfo = {
            enemyType: e.type,
            enemyName: bDef ? bDef.name : e.type,
            row: Math.round(e.row)
          };
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

    const colIdx = Math.max(0, Math.min(this.cols - 1, Math.round(enemy.colPos)));
    const hadShield = enemy.shieldHp > 0;
    const prevHp = enemy.hp;

    if (enemy.shieldHp > 0) {
      if (bypassHalfShield) {
        const shieldDmg = remaining * 0.5;
        enemy.shieldHp = Math.max(0, enemy.shieldHp - shieldDmg);
        enemy.hp -= remaining * 0.5;
        window.RoyalAudio.playHit(true, colIdx);
      } else {
        const absorbed = Math.min(enemy.shieldHp, remaining);
        enemy.shieldHp -= absorbed;
        remaining -= absorbed;
        enemy.hp -= remaining;
        window.RoyalAudio.playHit(true, colIdx);
      }
      if (hadShield && enemy.shieldHp <= 0) {
        window.RoyalAudio.playShieldBreak(colIdx);
        const sx = this.renderer.boardLeft + enemy.colPos * this.renderer.tileSize;
        const sy = this.renderer.boardTop + (enemy.row + 0.5) * this.renderer.tileSize;
        this.spawnParticles(sx, sy, '#38bdf8', 12, true);
      }
    } else {
      enemy.hp -= remaining;
      window.RoyalAudio.playHit(false, colIdx);
    }

    const dealt = Math.round(amount);
    if (dealt >= 25 && (!enemy._lastPopTime || performance.now() - enemy._lastPopTime > 180)) {
      enemy._lastPopTime = performance.now();
      const px = this.renderer.boardLeft + enemy.colPos * this.renderer.tileSize + (Math.random() - 0.5) * 14;
      const py = this.renderer.boardTop + (enemy.row + 0.35) * this.renderer.tileSize;
      this.addFloatingText(`-${dealt}`, px, py, bypassHalfShield ? '#fde047' : '#f8fafc', dealt >= 95);
    }

    if (enemy.hp <= 0 && prevHp > 0) {
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
    const colIdx = Math.max(0, Math.min(this.cols - 1, Math.round(enemy.colPos)));

    this.unlockAchievement('first_blood');
    if (enemy.type === 'plague_queen') {
      this.unlockAchievement('queen_slayer');
    }

    const lanePawn = this.pieces.find(p => p.type === 'pawn' && p.row === Math.round(enemy.row));
    if (lanePawn) {
      const xpGain = this.doctrineId === 'halberd' ? 27 : 18;
      lanePawn.xp = Math.min(100, lanePawn.xp + xpGain);
    }

    this.enemiesKilled = (this.enemiesKilled || 0) + 1;
    this.score += def.score || 50;
    const ultMult = (this.decreeState && this.decreeState.ultChargeMult) || 1.0;
    this.ultimateCharge = Math.min(100, this.ultimateCharge + (enemy.isBoss ? 30 : 7) * ultMult);

    if (this.decreeState && this.decreeState.killManaBonus > 0) {
      this.mana += this.decreeState.killManaBonus;
      this.totalManaEarned += this.decreeState.killManaBonus;
    }

    // Obsidian Detonation Decree: slain foes explode for AoE damage in the same rank!
    const shrapnelDmg = (this.decreeState && this.decreeState.deathExplosionDmg) || 0;
    if (shrapnelDmg > 0 && !enemy._fromShrapnel) {
      this.spawnShockwave(ex, ey, 6, 52, '#fb7185');
      for (const near of [...this.enemies]) {
        if (
          near.hp > 0 &&
          Math.abs(near.row - enemy.row) <= 0.55 &&
          Math.abs(near.colPos - enemy.colPos) <= 1.45
        ) {
          near._fromShrapnel = true;
          this.damageEnemy(near, shrapnelDmg, false, 1.0);
          near._fromShrapnel = false;
        }
      }
    }

    if (enemy.isBoss) {
      this.hitStopTimer = 0.04;
      this.screenShake = Math.max(this.screenShake, 0.42);
      this.addFloorDecal(colIdx, Math.round(enemy.row), 'scorch', 12);
    } else if (def.score >= 150) {
      this.hitStopTimer = 0.024;
    }

    window.RoyalAudio.playEnemyShatter(enemy.isBoss, colIdx);
    this.spawnParticles(ex, ey, def.color || '#84cc16', enemy.isBoss ? 24 : 10, true);
    this.spawnParticles(ex, ey, '#facc15', enemy.isBoss ? 14 : 6, false);

    if (this.gameMode !== 'puzzle') {
      const dropChance = def.dropChance !== undefined ? def.dropChance : 0.30;
      if (enemy.isBoss || this.rand() < dropChance) {
        this.spawnManaOrb(ex, ey - 10, ey + 6, def.manaDrop || 20);
      }
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
    this.totalManaEarned = (this.totalManaEarned || 0) + orb.value;
    window.RoyalAudio.playManaCollect();
    this.addFloatingText(`+${orb.value}☀`, orb.x, orb.y - 10, '#fef08a', false);
    this.updateHUD();
  }

  addFloorDecal(col, row, kind = 'scorch', duration = 7.0) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;
    if (this.floorDecals.length >= 28) this.floorDecals.shift();
    this.floorDecals.push({ col, row, kind, life: duration, maxLife: duration });
  }

  addTelegraphZone(col, row, duration = 1.0, label = '') {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;
    this.telegraphZones.push({ col, row, timer: duration, duration, label });
  }

  updateVFX(dt) {
    for (let i = this.floorDecals.length - 1; i >= 0; i--) {
      this.floorDecals[i].life -= dt;
      if (this.floorDecals[i].life <= 0) this.floorDecals.splice(i, 1);
    }

    for (let i = this.telegraphZones.length - 1; i >= 0; i--) {
      this.telegraphZones[i].timer -= dt;
      if (this.telegraphZones[i].timer <= 0) this.telegraphZones.splice(i, 1);
    }

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

  spawnParticles(x, y, color, count = 12, isShard = false) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isShard ? 55 + Math.random() * 145 : 35 + Math.random() * 115;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: isShard ? 3.0 + Math.random() * 4.0 : 2.2 + Math.random() * 3.2,
        color,
        isShard,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 14,
        life: (isShard ? 0.42 : 0.35) + Math.random() * 0.3,
        maxLife: 0.72
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

  getResultCrestSVG(isVictory) {
    if (isVictory) {
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" aria-hidden="true">
          <defs>
            <linearGradient id="vicGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFF7CC"/>
              <stop offset="45%" stop-color="#FACC15"/>
              <stop offset="100%" stop-color="#B45309"/>
            </linearGradient>
            <linearGradient id="vicLapis" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#38BDF8"/>
              <stop offset="100%" stop-color="#1E3A8A"/>
            </linearGradient>
          </defs>
          <!-- Crossed Golden Sovereign Scepters / Blades -->
          <line x1="14" y1="64" x2="66" y2="16" stroke="url(#vicGold)" stroke-width="3.2" stroke-linecap="round"/>
          <line x1="66" y1="64" x2="14" y2="16" stroke="url(#vicGold)" stroke-width="3.2" stroke-linecap="round"/>
          <!-- Heraldic Lapis & Gold Shield Backing -->
          <path d="M22,22 L58,22 L58,46 C58,58 40,68 40,68 C40,68 22,58 22,46 Z" fill="url(#vicLapis)" stroke="url(#vicGold)" stroke-width="2.6"/>
          <!-- 5-Spire Imperial Sovereign Crown -->
          <path d="M16,46 L12,24 L26,34 L40,16 L54,34 L68,24 L64,46 Z" fill="url(#vicGold)" stroke="#FFFBEB" stroke-width="2"/>
          <rect x="18" y="45" width="44" height="7" rx="3" fill="url(#vicGold)" stroke="#FFFBEB" stroke-width="1.6"/>
          <!-- Crown Starlight Jewels -->
          <circle cx="12" cy="22" r="3" fill="#E0F2FE"/>
          <circle cx="40" cy="13" r="4" fill="#FFFBEB"/>
          <circle cx="68" cy="22" r="3" fill="#E0F2FE"/>
          <polygon points="40,32 45,39 40,46 35,39" fill="#E0F2FE"/>
        </svg>
      `;
    }
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" aria-hidden="true">
        <defs>
          <linearGradient id="defBone" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F5F0E6"/>
            <stop offset="52%" stop-color="#B8B0A4"/>
            <stop offset="100%" stop-color="#4A4356"/>
          </linearGradient>
          <linearGradient id="defObsidian" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#524B61"/>
            <stop offset="55%" stop-color="#231F2E"/>
            <stop offset="100%" stop-color="#09080D"/>
          </linearGradient>
          <linearGradient id="defCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFE4E6"/>
            <stop offset="45%" stop-color="#FB7185"/>
            <stop offset="100%" stop-color="#9F1239"/>
          </linearGradient>
        </defs>
        <!-- Crossed Crimson-Edged Executioner Blades Behind Skull -->
        <line x1="12" y1="66" x2="68" y2="14" stroke="url(#defCrimson)" stroke-width="3.4" stroke-linecap="round"/>
        <line x1="68" y1="66" x2="12" y2="14" stroke="url(#defCrimson)" stroke-width="3.4" stroke-linecap="round"/>
        <!-- Dark-Fantasy Obsidian & Bone Heraldic Shield -->
        <path d="M20,22 L60,22 L60,46 C60,60 40,70 40,70 C40,70 20,60 20,46 Z" fill="url(#defObsidian)" stroke="#FB7185" stroke-width="2.2"/>
        <!-- Fractured Fallen Sovereign Crown -->
        <path d="M20,32 L16,16 L29,25 L38,12 L43,24 L51,14 L64,17 L60,32 Z" fill="url(#defCrimson)" stroke="#FFE4E6" stroke-width="1.6"/>
        <!-- Sculpted Gothic War-Skull (Cranium, Cheekbones & Armored Jaw) -->
        <path d="M24,38 C24,26 56,26 56,38 C56,44 53,48 50,51 L49,60 L31,60 L30,51 C27,48 24,44 24,38 Z" fill="url(#defBone)" stroke="#15131C" stroke-width="2.2"/>
        <!-- Glowing Crimson Eye Sockets -->
        <polygon points="29,39 37,41 35,47 28,45" fill="#9F1239" stroke="#FF3B5C" stroke-width="1.2"/>
        <polygon points="51,39 43,41 45,47 52,45" fill="#9F1239" stroke="#FF3B5C" stroke-width="1.2"/>
        <circle cx="33" cy="43" r="2" fill="#FFE4E6"/>
        <circle cx="47" cy="43" r="2" fill="#FFE4E6"/>
        <!-- Nasal Cavity & Carved Jaw Grill -->
        <polygon points="40,45 37,51 43,51" fill="#15131C"/>
        <line x1="35" y1="54" x2="35" y2="59" stroke="#15131C" stroke-width="2" stroke-linecap="round"/>
        <line x1="40" y1="54" x2="40" y2="59" stroke="#15131C" stroke-width="2" stroke-linecap="round"/>
        <line x1="45" y1="54" x2="45" y2="59" stroke="#15131C" stroke-width="2" stroke-linecap="round"/>
        <!-- Forehead Battle Fracture -->
        <path d="M40,28 L37,35 L41,38" fill="none" stroke="#E11D48" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `;
  }

  handleActVictory() {
    this.victory = true;
    this.gameOver = true;
    const ascBonus = this.gameMode === 'campaign' ? (this.getAscension().eloBonus || 0) : 0;
    const eloGain = 45 + ascBonus;
    this.eloRating += eloGain;
    const isEn = this.lang === 'en';

    const remainingSentinels = this.chariots.filter(c => !c.used || c.active).length;
    const earnedStars =
      this.gameMode === 'puzzle'
        ? 3
        : remainingSentinels === 5
          ? 3
          : remainingSentinels >= 3
            ? 2
            : 1;

    // Persist progression, stars, unlocking & achievements
    if (this.gameMode === 'puzzle' && this.currentAct.puzzleDef) {
      this.profile.solvedPuzzles[this.currentAct.puzzleDef.id] = true;
      this.unlockAchievement('puzzle_solver');
      const totalPuzzles = (window.CHESS_DATA.PUZZLES || []).length;
      if (Object.keys(this.profile.solvedPuzzles).length >= totalPuzzles) {
        this.unlockAchievement('puzzle_master');
      }
    } else if (this.gameMode === 'daily') {
      const todayKey = new Date().toISOString().slice(0, 10);
      if (this.profile.dailyDateKey !== todayKey || this.score > (this.profile.dailyBestScore || 0)) {
        this.profile.dailyDateKey = todayKey;
        this.profile.dailyBestScore = this.score;
      }
    } else {
      const actKey = String(this.currentAct.id);
      this.profile.actStars[actKey] = Math.max(this.profile.actStars[actKey] || 0, earnedStars);
      this.profile.actBestScores[actKey] = Math.max(this.profile.actBestScores[actKey] || 0, this.score);
      this.unlockedActs = Math.max(this.unlockedActs || 1, Math.min(5, this.actIndex + 2));
      this.profile.unlockedActs = this.unlockedActs;
      this.profile.lastAct = Math.min(4, this.actIndex + 1);
      if (remainingSentinels === 5) this.unlockAchievement('flawless_act');
      if (this.ascensionLevel >= 1) this.unlockAchievement('ascension_win');
    }
    this.saveProfile();

    window.RoyalAudio.playVictory();
    window.RoyalAudio.setIntenseMode(false);

    const modal = document.getElementById('resultModal');
    const glyphEl = document.getElementById('resultCrestGlyph');
    const ribbonEl = document.getElementById('resultRibbonTag');
    const starsEl = document.getElementById('resultStarsRow');
    const title = document.getElementById('resultModalTitle');
    const sub = document.getElementById('resultModalSubtitle');
    const breachStrip = document.getElementById('resultBreachStrip');
    const stats = document.getElementById('resultModalStats');
    const advBadge = document.getElementById('resultAdvisorBadge');
    const advText = document.getElementById('resultAdvisorText');
    const nextBtn = document.getElementById('modalNextActBtn');
    const retryBtn = document.getElementById('modalRetryBtn');

    if (modal) {
      modal.classList.add('is-victory');
      modal.classList.remove('is-defeat');
    }
    if (glyphEl) glyphEl.innerHTML = this.getResultCrestSVG(true);
    if (ribbonEl) {
      ribbonEl.textContent = isEn ? 'SOVEREIGN VICTORY DECREE' : 'مرسوم النصر الملكي';
    }
    if (starsEl) {
      starsEl.className = 'result-stars-banner victory-stars';
      starsEl.innerHTML = [0, 1, 2]
        .map(i => {
          const isEarned = i < earnedStars;
          return `<span class="result-star ${isEarned ? 'earned' : 'unearned'}" style="--star-delay: ${i * 100}ms">${isEarned ? '★' : '☆'}</span>`;
        })
        .join('');
    }
    if (title) {
      title.textContent = isEn ? '♛ CHECKMATE — SOVEREIGN VICTORY!' : '♛ كش مات — انتصار ملكي ساحق!';
    }
    if (sub) {
      sub.innerHTML = isEn
        ? `Secured <strong>${this.currentAct.code} (${this.currentAct.name})</strong> and crushed the Blight Horde!`
        : `تم تأمين <bdi dir="ltr">${this.currentAct.code}</bdi> وسحق جحافل الظلام بنجاح!`;
    }
    if (breachStrip) {
      breachStrip.classList.add('hidden');
      breachStrip.textContent = '';
    }
    if (stats) {
      const sentVal = this.gameMode === 'puzzle' ? (isEn ? 'NO SENTINELS' : 'بدون قلاع') : `♜ ${remainingSentinels} / 5`;
      stats.innerHTML = isEn
        ? `
        <div class="stat-pill highlight-sentinel"><span>Sentinels Intact</span><strong dir="ltr">${sentVal}</strong></div>
        <div class="stat-pill"><span>Grandmaster ELO</span><strong dir="ltr">${this.eloRating} (+${eloGain})</strong></div>
        <div class="stat-pill"><span>Battle Score</span><strong dir="ltr">${this.score.toLocaleString()}</strong></div>
        <div class="stat-pill"><span>Undead Slain</span><strong dir="ltr">⚔ ${this.enemiesKilled || 0}</strong></div>
        <div class="stat-pill"><span>Mana Harvested</span><strong dir="ltr">☀ ${Math.floor(this.totalManaEarned || this.mana)}</strong></div>
        <div class="stat-pill"><span>Standing Army</span><strong dir="ltr">♟ ${this.pieces.length} Units</strong></div>
      `
        : `
        <div class="stat-pill highlight-sentinel"><span>القلاع الصامدة</span><strong dir="ltr">${sentVal}</strong></div>
        <div class="stat-pill"><span>التصنيف الملكي</span><strong dir="ltr">${this.eloRating} (+${eloGain})</strong></div>
        <div class="stat-pill"><span>النقاط</span><strong dir="ltr">${this.score.toLocaleString()}</strong></div>
        <div class="stat-pill"><span>الوحوش المدمّرة</span><strong dir="ltr">⚔ ${this.enemiesKilled || 0}</strong></div>
        <div class="stat-pill"><span>إجمالي الطاقة</span><strong dir="ltr">☀ ${Math.floor(this.totalManaEarned || this.mana)}</strong></div>
        <div class="stat-pill"><span>الجيش الصامد</span><strong>♟ <bdi dir="ltr">${this.pieces.length}</bdi> قطع</strong></div>
      `;
    }
    if (advBadge) {
      advBadge.innerHTML =
        earnedStars === 3
          ? isEn
            ? '♛ Grandmaster Commendation • Flawless 3/3 ★'
            : '♛ وسام الأستاذ الدولي الكبير • دفاع مثالي (3/3 ★)'
          : isEn
            ? '♚ Royal War-Council Report • Tactical Victory'
            : '♚ تقرير القيادة الملكية • انتصار تكتيكي';
    }
    if (advText) {
      const queensCount = this.countPiecesOfType('queen');
      const chalicesCount = this.countPiecesOfType('chalice');
      if (isEn) {
        advText.innerHTML =
          earnedStars === 3
            ? `Masterful command! You finished with ${chalicesCount} Sun-Spire Chalice(s) and ${queensCount} Sovereign Queen(s) standing. Advance to the next operation or raise your Ascension Rank!`
            : `Hard-won victory with ${remainingSentinels}/5 Winged Sentinels intact. For a 3-Star rating, anchor lanes with Phalanx Pawn Chains or trigger Unobstructed Royal Castling!`;
      } else {
        advText.innerHTML =
          earnedStars === 3
            ? `أداء أسطوري! أنهيت المعركة بـ <bdi dir="ltr">${chalicesCount}</bdi> كؤوس نور و<bdi dir="ltr">${queensCount}</bdi> وزير في الميدان. انتقل للفصل التالي لتحدٍ أعمق!`
            : `انتصار تكتيكي ثمين! حافظت على <bdi dir="ltr">${remainingSentinels}</bdi> من أصل <bdi dir="ltr">5</bdi> قلاع مجنحة. للحصول على العلامة الكاملة، عزّز الخطوط بسلسلة جنود أو استخدم التبييت الملكي!`;
      }
    }
    if (nextBtn) {
      if (this.gameMode === 'daily') {
        nextBtn.style.display = 'none';
      } else {
        nextBtn.style.display = '';
        nextBtn.textContent =
          this.gameMode === 'puzzle'
            ? isEn
              ? '♟ Next Puzzle →'
              : '♟ اللغز التالي ←'
            : isEn
              ? '⚔ Next Campaign Act →'
              : '⚔ المرحلة التالية ←';
      }
    }
    if (retryBtn) retryBtn.textContent = isEn ? '↻ Replay Stage' : '↻ إعادة المرحلة';
    if (modal) modal.classList.remove('hidden');
  }

  handleDefeat() {
    this.gameOver = true;
    this.victory = false;
    this.eloRating = Math.max(1200, this.eloRating - 15);
    const isEn = this.lang === 'en';
    if (this.currentAct.isEndless && this.waveIndex > (this.profile.endlessBestWave || 0)) {
      this.profile.endlessBestWave = this.waveIndex;
    }
    this.saveProfile();
    window.RoyalAudio.playDefeat();
    window.RoyalAudio.setIntenseMode(false);

    const modal = document.getElementById('resultModal');
    const glyphEl = document.getElementById('resultCrestGlyph');
    const ribbonEl = document.getElementById('resultRibbonTag');
    const starsEl = document.getElementById('resultStarsRow');
    const title = document.getElementById('resultModalTitle');
    const sub = document.getElementById('resultModalSubtitle');
    const stats = document.getElementById('resultModalStats');
    const advBadge = document.getElementById('resultAdvisorBadge');
    const advText = document.getElementById('resultAdvisorText');
    const nextBtn = document.getElementById('modalNextActBtn');
    const retryBtn = document.getElementById('modalRetryBtn');

    const enemyArabicNames = {
      thrall: 'بيدق الظلام الزاحف',
      buckler: 'حامل الدرع الحديدي',
      sprinter: 'المتسلل الوثّاب',
      assassin: 'الفارس الشبح القاتل',
      necro: 'كاهن الفيل الملعون',
      imp: 'عفريت الوباء السريع',
      gargantua: 'عملاق القلعة المحطمة',
      plague_queen: 'الوزيرة الملعونة الطيفية'
    };

    const breachCounterTipsAr = {
      thrall:
        'اخترق بيدق الظلام دفاعك! ضع جندياً مدرعاً (60☀) في الصفوف الأمامية ليدفعه بالدرع للخلف ويمنعه من التقدم.',
      buckler:
        'اخترق حامل الدرع الحديدي المسار! درعه الأمامي يقاوم الدفع العادي — استخدم فيل الأشعة أو فارس العاصفة لتجاوز 50% من درعه!',
      sprinter:
        'اخترق المتسلل الوثّاب دفاعك بقفزة الحصان! ضع جندياً أمامياً لاستنزاف قفزته الأولى، ثم ضع قلعة حصار خلفه لسحقه.',
      assassin:
        'الفارس الشبح القاتل اغتال دفاعاتك! يقفز بحرف L فوق القطع العادية لكنه يتوقف تماماً أمام قلعة الحصار. احمِ الوزير بقلعة أو ملك!',
      necro:
        'كاهن الفيل الملعون أبطأ قطعك بلعناته! ضع فيل الأشعة المقدسة على قطره لتطهير اللعنات فوراً وعلاج قطعك.',
      imp:
        'تسلل عفريت الوباء السريع إلى الخلفية! هالة الملك القائد أو أشعة القلعة المتقاطعة تمحو الأسراب السريعة بثوانٍ.',
      gargantua:
        'عملاق القلعة المحطمة حطّم المسار! لمواجهته: ادمج 5 جنود لوزير متوّج [M]، أو شكّل بطارية ملكية (+30%)، وأطلق كش مات الشاملة [Space]!',
      plague_queen:
        'الوزيرة الملعونة تغير مسارها بالانتقال الطيفي! راقب تحذير CHECK! الأحمر واستخدم فارس العاصفة وأشعة الوزير الصائدة.'
    };

    const breachCounterTipsEn = {
      thrall:
        'A Shambling Pawn-Thrall breached the sanctum! Anchor forward squares with Phalanx Shield-Pawns (60☀) to shove undead backward.',
      buckler:
        'An Ironclad Buckler broke through! Use Radiant Bishops (diagonal) or Tempest Knights (L-jump) to bypass 50% of its frontal shield!',
      sprinter:
        'A Plaguevault Sprinter vaulted your front rank! Bait its single leap with a forward Pawn, then crush it with an Aegis Rook behind.',
      assassin:
        'A Shadow-Knight Assassin slipped past! It L-jumps non-Rook pieces to hunt Queens, but is HARD-STOPPED by Aegis Rooks.',
      necro:
        'A Necro-Bishop hexed your backline! Align a Radiant Bishop along the diagonal to instantly cleanse curses and heal allies.',
      imp:
        'Blight Imp-Pawns swarmed the lane! Deploy an Arcane King aura or crossfire Aegis Rook beams to vaporize fast swarms.',
      gargantua:
        'A Siege Gargantua crushed the rank! Fuse 5 Pawns into an Ascended Queen [M], form a +30% Royal Battery, and unleash Checkmate Overload [Space]!',
      plague_queen:
        'The Blighted Shadow-Queen blinked across ranks! Watch the red CHECK! telegraph tile and cover adjacent lanes with Tempest Knights and Queens.'
    };

    const bInfo = this.breachInfo || { enemyType: 'thrall', enemyName: 'Shambling Pawn-Thrall', row: 2 };
    const rankNum = 5 - bInfo.row;
    const totalW = this.currentAct.isEndless ? '∞' : this.currentAct.totalWaves;
    const arEnemyName = enemyArabicNames[bInfo.enemyType] || bInfo.enemyName;
    const enemySpriteUrl =
      window.RoyalSprites && window.RoyalSprites.enemyDataUrls[bInfo.enemyType]
        ? window.RoyalSprites.enemyDataUrls[bInfo.enemyType]
        : '';

    if (modal) {
      modal.classList.remove('is-victory');
      modal.classList.add('is-defeat');
    }
    if (glyphEl) glyphEl.innerHTML = this.getResultCrestSVG(false);
    if (ribbonEl) {
      ribbonEl.textContent = isEn ? 'CITADEL BREACH REPORT' : 'تقرير سقوط الدفاعات';
    }
    if (starsEl) {
      starsEl.className = 'result-stars-banner defeat-stars';
      starsEl.innerHTML = [0, 1, 2]
        .map(i => `<span class="result-star unearned" style="--star-delay: ${i * 80}ms">☆</span>`)
        .join('');
    }
    if (title) {
      title.textContent = isEn ? '♚ CITADEL BREACHED — KING IN CHECK!' : '♚ سقطت القلعة الملكية — كش ملك!';
    }
    if (sub) {
      sub.textContent = isEn
        ? this.gameMode === 'puzzle'
          ? 'Checkmate Puzzle operates with Zero Sentinels — any Undead reaching File A ends the trial!'
          : 'The Undead Horde pierced your final rank after exhausting its Winged Rook Sentinel!'
        : this.gameMode === 'puzzle'
          ? 'ألغاز الكش مات تعمل بدون قلاع مجنحة — وصول أي وحش للعمود الأول ينهي التحدي فوراً!'
          : 'اخترق جيش الظلام خط الدفاع الأخير بعد استنفاد القلعة المجنحة في المسار المخترق!';
    }
    const breachStrip = document.getElementById('resultBreachStrip');
    if (breachStrip) {
      breachStrip.classList.remove('hidden');
      const iconHtml = enemySpriteUrl
        ? `<img src="${enemySpriteUrl}" alt="" class="breach-enemy-icon" />`
        : '<span>⚔</span>';
      breachStrip.innerHTML = isEn
        ? `${iconHtml}<span>Breach Cause: <strong>${bInfo.enemyName}</strong> on <strong>Rank ${rankNum}</strong></span>`
        : `${iconHtml}<span>سبب الاختراق: <strong>${arEnemyName}</strong> في الصف رقم <bdi dir="ltr">${rankNum}</bdi></span>`;
    }
    if (stats) {
      stats.innerHTML = isEn
        ? `
        <div class="stat-pill"><span>Wave Reached</span><strong dir="ltr">${Math.max(1, this.waveIndex)} / ${totalW}</strong></div>
        <div class="stat-pill"><span>Breached Lane</span><strong dir="ltr">Rank ${rankNum}</strong></div>
        <div class="stat-pill"><span>Undead Slain</span><strong dir="ltr">⚔ ${this.enemiesKilled || 0}</strong></div>
        <div class="stat-pill"><span>Total Mana</span><strong dir="ltr">☀ ${Math.floor(this.totalManaEarned || this.mana)}</strong></div>
        <div class="stat-pill"><span>Score</span><strong dir="ltr">${this.score.toLocaleString()}</strong></div>
        <div class="stat-pill"><span>ELO Rating</span><strong dir="ltr">${this.eloRating} (-15)</strong></div>
      `
        : `
        <div class="stat-pill"><span>الموجة</span><strong dir="ltr">${Math.max(1, this.waveIndex)} / ${totalW}</strong></div>
        <div class="stat-pill"><span>مسار الاختراق</span><strong>الصف <bdi dir="ltr">${rankNum}</bdi></strong></div>
        <div class="stat-pill"><span>الوحوش المدمّرة</span><strong dir="ltr">⚔ ${this.enemiesKilled || 0}</strong></div>
        <div class="stat-pill"><span>إجمالي الطاقة</span><strong dir="ltr">☀ ${Math.floor(this.totalManaEarned || this.mana)}</strong></div>
        <div class="stat-pill"><span>النقاط</span><strong dir="ltr">${this.score.toLocaleString()}</strong></div>
        <div class="stat-pill"><span>التصنيف الملكي</span><strong dir="ltr">${this.eloRating} (-15)</strong></div>
      `;
    }
    if (advBadge) {
      advBadge.innerHTML = isEn
        ? `❖ Counter-Strategy Diagnostics (Rank ${rankNum})`
        : `❖ التشخيص التكتيكي المضاد (الصف <bdi dir="ltr">${rankNum}</bdi>)`;
    }
    if (advText) {
      advText.innerHTML = isEn
        ? breachCounterTipsEn[bInfo.enemyType] ||
          'Build 2–3 Sun-Spire Chalices early to fund an interlocked Phalanx Pawn wall backed by Rooks and Bishops.'
        : breachCounterTipsAr[bInfo.enemyType] ||
          'احرص على بناء كؤوس النور الملكية مبكراً لتمويل خط دفاع متوازن من الجنود المدرعين والقلاع.';
    }
    if (nextBtn) nextBtn.style.display = 'none';
    if (retryBtn) {
      retryBtn.textContent = isEn ? '⚔ Avenge & Retry Immediately!' : '⚔ الثأر وإعادة المرحلة فوراً!';
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
      const cost = this.getPieceCost(def.id);

      btn.innerHTML = `
        <div class="deck-card-cooldown" id="cd-${def.id}"></div>
        <div class="deck-card-top">
          <bdi dir="ltr" class="deck-hotkey">[${def.hotkey}]</bdi>
          <bdi dir="ltr" class="deck-cost" id="cost-${def.id}"><span class="mana-gem">☀</span>${cost}</bdi>
        </div>
        <div class="deck-piece-portrait">
          <img src="${spriteUrl}" alt="${def.name}" class="deck-sprite-img" />
          <bdi dir="ltr" class="deck-cap-badge" id="cap-${def.id}"></bdi>
        </div>
        <div class="deck-card-info" dir="${this.lang === 'en' ? 'ltr' : 'rtl'}">
          <strong class="deck-piece-name">${this.lang === 'en' ? def.name : (def.arabicTitle || def.name)}</strong>
          <span class="deck-piece-role">${this.lang === 'en' ? def.chessTitle : (def.roleBadgeAr || def.chessTitle)}</span>
        </div>
      `;
      btn.addEventListener('pointerdown', e => {
        if (e.button !== 0 || this.paused || this.gameOver || this.onTitleScreen) return;
        const pos = this.renderer.screenToBoard(e.clientX, e.clientY);
        this.dragState = {
          kind: 'deck',
          pieceType: def.id,
          startX: e.clientX,
          startY: e.clientY,
          x: pos.x,
          y: pos.y,
          active: false
        };
      });
      btn.addEventListener('click', () => {
        if (this._suppressNextClick) return;
        window.RoyalAudio.init();
        window.RoyalAudio.startMusic();
        this.selectDeckPiece(def.id);
      });
      deck.appendChild(btn);
    });
  }

  buildMiniMatrixCellsHTML(pieceType) {
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
    return cells.join('');
  }

  populateCodexModal() {
    const piecesGrid = document.getElementById('codexPiecesGrid');
    const enemiesGrid = document.getElementById('codexEnemiesGrid');
    const isEn = this.lang === 'en';

    const enemyMeta = {
      thrall: {
        arName: 'بيدق الظلام الزاحف',
        tierAr: '♟ جندي أساسي',
        tierEn: '♟ Footman',
        tierClass: 'tier-emerald',
        descAr: 'مشاة الظلام الأساسيون؛ يزحفون للأمام لقضم الدفاعات ويمكن دفعهم بالجنود المدرعين.',
        counterAr: '❖ <strong>المضاد:</strong> الجندي المدرع يدفعه للخلف بسهولة ويمنعه من التقدم.',
        counterEn: '❖ <strong>Counter:</strong> Phalanx Shield-Pawns shove Thralls backward and hold the line.'
      },
      buckler: {
        arName: 'حامل الدرع الحديدي',
        tierAr: '♜ مدرع ثقيل',
        tierEn: '♜ Heavy Shield',
        tierClass: 'tier-emerald',
        descAr: 'يحمل درعاً أمامياً يمتص الضربات المستقيمة ويقاوم الدفع، لكنه ضعيف أمام الهجمات القطرية.',
        counterAr: '❖ <strong>المضاد:</strong> فيل الأشعة أو فارس العاصفة لتجاوز 50% من درعه الأمامي!',
        counterEn: '❖ <strong>Counter:</strong> Radiant Bishops & Tempest Knights bypass 50% of its frontal shield!'
      },
      sprinter: {
        arName: 'المتسلل الوثّاب',
        tierAr: '♞ نخبة سريعة',
        tierEn: '♞ Vaulting Elite',
        tierClass: 'tier-crimson',
        descAr: 'يعدو بسرعة عالية ويقفز فوق أول قطعة دفاعية تعترض طريقه مرة واحدة.',
        counterAr: '❖ <strong>المضاد:</strong> ضع جندياً في الأمام ليمتص قفزته الأولى، ثم اسحقه بقلعة الحصار.',
        counterEn: '❖ <strong>Counter:</strong> Bait its single vault with a frontline Pawn, then crush it with an Aegis Rook.'
      },
      assassin: {
        arName: 'الفارس الشبح القاتل',
        tierAr: '⚔ صائد الوزير',
        tierEn: '⚔ Queen Hunter',
        tierClass: 'tier-crimson',
        descAr: 'ينفّذ قفزة حصان بحرف L لتجاوز الدفاعات واغتيال الوزير في الخلفية.',
        counterAr: '❖ <strong>المضاد:</strong> احمِ الوزير بقلعة أو ملك؛ الفارس الشبح يتوقف تماماً أمام القلعة!',
        counterEn: '❖ <strong>Counter:</strong> Guard Queens with Aegis Rooks — Rooks hard-stop Assassin L-jumps!'
      },
      necro: {
        arName: 'كاهن الفيل الملعون',
        tierAr: '♝ ساحر ظلام',
        tierEn: '♝ Hex Caster',
        tierClass: 'tier-crimson',
        descAr: 'يطلق لعنات قطرية تبطئ سرعة هجوم أقوى قطعك بنسبة 35% ويستدعي العفاريت.',
        counterAr: '❖ <strong>المضاد:</strong> فيل الأشعة المقدسة يطهّر لعناته ويعيد سرعة الهجوم فوراً.',
        counterEn: '❖ <strong>Counter:</strong> Align a Radiant Bishop diagonally to cleanse Hexes and heal allies.'
      },
      imp: {
        arName: 'عفريت الوباء السريع',
        tierAr: '⚡ سرب خاطف',
        tierEn: '⚡ Swarm Runner',
        tierClass: 'tier-emerald',
        descAr: 'مخلوق خفيف فائق السرعة يندفع في أسراب لإرباك الخطوط الأمامية.',
        counterAr: '❖ <strong>المضاد:</strong> هالة الملك القائد أو أشعة القلعة المتقاطعة تمحو الأسراب بثوانٍ.',
        counterEn: '❖ <strong>Counter:</strong> Arcane King shockwaves and Rook beams vaporize Imp swarms.'
      },
      gargantua: {
        arName: 'عملاق القلعة المحطمة',
        tierAr: '♚ زعيم الحصار',
        tierEn: '♚ Siege Boss',
        tierClass: 'tier-boss',
        descAr: 'حصن متحرك عملاق مدرع يسحق الدفاعات بضربات مدمرة ويقذف عفاريت الظلام عند إصابته.',
        counterAr: '❖ <strong>المضاد:</strong> ادمج 5 جنود لوزير متوّج [M] أو أطلق كش مات الشاملة [Space] مع بطارية ملكية!',
        counterEn: '❖ <strong>Counter:</strong> Fuse 5 Pawns into an Ascended Queen [M] and form a +30% Royal Battery!'
      },
      plague_queen: {
        arName: 'الوزيرة الملعونة الطيفية',
        tierAr: '♛ زعيمة الظلال',
        tierEn: '♛ Shadow Boss',
        tierClass: 'tier-boss',
        descAr: 'زعيمة طيفية تنتقل بين الصفوف بعد إشارة تحذير حمراء (CHECK!) وتطلق صواعق ظلامية.',
        counterAr: '❖ <strong>المضاد:</strong> راقب مربع التحذير الأحمر وغطِّ المسارات المتجاورة بفارس العاصفة والوزير!',
        counterEn: '❖ <strong>Counter:</strong> Watch the red CHECK! telegraph tile and cover adjacent lanes with Knights & Queens!'
      }
    };

    const pieceDescAr = {
      chalice: 'كأس نور مقدس يبلور طاقة التاج كل 8 ثوانٍ ويمنح القطع المجاورة سرعة هجوم إضافية (+15%).',
      pawn: 'مدافع أمامي صلب يدفع الوحوش للخلف بدرعه — صفّ 5 جنود في سطر واحد واضغط [M] لدمجهم إلى وزير متوّج!',
      rook: 'حصن ثقيل يطلق أشعة حصار متعامدة تخترق الصف والعمود ويوقف قفزات الفارس الشبح تماماً.',
      knight: 'فارس صاعق يضرب مربعات حرف L الثمانية بضربات حرجة تتجاوز الدروع ويقفز فوق كل العوائق.',
      bishop: 'حكيم سماوي يطلق أشعة قطرية تخترق الدروع ويعالج القطع الحليفة ويطهرها من اللعنات.',
      king: 'قائد التاج الأعلى (حد أقصى 1)؛ يطلق موجات ذهبية محيطة ويمنح +30% ضرر للقطع المجاورة وينفذ التبييت.',
      queen: 'أقوى قطعة على الرقعة (حد أقصى 2)؛ تجمع خطوط القلعة وأقطار الفيل وتصطاد أخطر الوحوش آلياً.'
    };

    if (piecesGrid) {
      piecesGrid.innerHTML = Object.values(window.CHESS_DATA.PIECES)
        .map(p => {
          const url = window.RoyalSprites ? window.RoyalSprites.pieceDataUrls[p.id] : '';
          const matrixHtml = this.buildMiniMatrixCellsHTML(p.id);
          const powerVal = isEn
            ? p.damage > 0
              ? `${p.damage} DMG`
              : `+${p.manaYield}☀ Mana`
            : p.damage > 0
              ? `<bdi dir="ltr">${p.damage}</bdi> ضرر`
              : `<bdi dir="ltr">+${p.manaYield}☀</bdi> طاقة`;
          const hpVal = p.startingShield ? `${p.maxHp} (+${p.startingShield}❖)` : `${p.maxHp}`;
          const titleTxt = isEn ? p.name : (p.arabicTitle || p.name);
          const subTxt = isEn ? `${p.chessTitle} • ${p.roleBadge}` : p.chessRuleAr || p.roleBadge;
          const ruleTxt = isEn ? p.chessRule : (p.chessRuleAr || p.chessRule);
          const descTxt = isEn ? p.description : (pieceDescAr[p.id] || p.description);
          return `
        <article class="codex-card" style="--accent: ${p.accentColor}">
          <div class="codex-card-head">
            <img src="${url}" alt="${p.name}" class="codex-portrait-img" />
            <div class="codex-head-text">
              <div class="codex-title-line">
                <h4>${titleTxt}</h4>
                <span class="codex-hotkey-pill" dir="ltr">[${p.hotkey}]</span>
              </div>
              <span class="codex-sub-en">${subTxt}</span>
            </div>
            <div class="codex-mini-matrix" title="${isEn ? '5×5 Attack Geometry' : 'هندسة الهجوم 5×5'}">
              <div class="mini-matrix-grid">${matrixHtml}</div>
            </div>
          </div>
          <div class="codex-stats-strip">
            <span class="codex-stat-chip">☀ ${isEn ? 'Cost' : 'التكلفة'}: <strong dir="ltr">${p.cost}</strong></span>
            <span class="codex-stat-chip">❖ ${isEn ? 'HP' : 'الصحة'}: <strong dir="ltr">${hpVal}</strong></span>
            <span class="codex-stat-chip">⚔ ${isEn ? 'Power' : 'القدرة'}: <strong>${powerVal}</strong></span>
            <span class="codex-stat-chip">◈ ${isEn ? 'CD' : 'الشحن'}: <strong dir="ltr">${p.cooldown}s</strong></span>
          </div>
          <p class="codex-rule">♟ <strong>${isEn ? 'Chess Geometry:' : 'قاعدة الشطرنج:'}</strong> ${ruleTxt}</p>
          <p class="codex-desc">${descTxt}</p>
        </article>
      `;
        })
        .join('');
    }
    if (enemiesGrid) {
      enemiesGrid.innerHTML = Object.values(window.CHESS_DATA.ENEMIES)
        .map(e => {
          const url = window.RoyalSprites ? window.RoyalSprites.enemyDataUrls[e.id] : '';
          const meta = enemyMeta[e.id] || {
            arName: e.name,
            tierAr: '⚔ جيش الظلام',
            tierEn: '⚔ Blight Unit',
            tierClass: 'tier-emerald',
            descAr: e.description,
            counterAr: '❖ <strong>المضاد:</strong> استخدم التشكيلات المتقاطعة لصد تقدمه.',
            counterEn: '❖ <strong>Counter:</strong> Combine orthogonal and diagonal crossfire.'
          };
          const titleTxt = isEn ? e.name : meta.arName;
          const tierTxt = isEn ? meta.tierEn : meta.tierAr;
          const subTxt = isEn ? e.title : meta.tierAr;
          const descTxt = isEn ? e.description : meta.descAr;
          const counterTxt = isEn ? meta.counterEn : meta.counterAr;
          return `
        <article class="codex-card enemy-card" style="--accent: ${e.color}">
          <div class="codex-card-head">
            <img src="${url}" alt="${e.name}" class="codex-portrait-img" />
            <div class="codex-head-text">
              <div class="codex-title-line">
                <h4>${titleTxt}</h4>
                <span class="codex-tier-pill ${meta.tierClass}">${tierTxt}</span>
              </div>
              <span class="codex-sub-en">${subTxt}</span>
            </div>
          </div>
          <div class="codex-stats-strip">
            <span class="codex-stat-chip">❖ ${isEn ? 'HP' : 'الصحة'}: <strong dir="ltr">${e.maxHp}</strong></span>
            <span class="codex-stat-chip">◈ ${isEn ? 'Shield' : 'الدرع'}: <strong dir="ltr">${e.shieldHp || 0}</strong></span>
            <span class="codex-stat-chip">⚡ ${isEn ? 'Speed' : 'السرعة'}: <strong dir="ltr">${e.speed}</strong></span>
            <span class="codex-stat-chip">⚔ ${isEn ? 'DPS' : 'الضرر/ث'}: <strong dir="ltr">${e.dps}</strong></span>
          </div>
          <p class="codex-desc">${descTxt}</p>
          <div class="codex-counter-tip">${counterTxt}</div>
        </article>
      `;
        })
        .join('');
    }
  }

  populateActsDrawer() {
    const container = document.getElementById('actsListContainer');
    const quickMenuContainer = document.getElementById('menuQuickActsGrid');
    const isEn = this.lang === 'en';
    const unlockedCount = Math.max(1, this.unlockedActs || 1);

    const actArabicNames = [
      'الفصل الأول: اختراق الفناء الملكي',
      'الفصل الثاني: كسوف الأقطار المظلم',
      'الفصل الثالث: حصار القلعتين التوأم',
      'الفصل الرابع: تحدي الأستاذ الكبير',
      'الفصل الخامس: المناورة الخالدة اللانهائية'
    ];
    const actArabicDesc = [
      'تعلّم اقتصاد كؤوس النور وتشكيل حائط الجنود المدرعين لصد طلائع جيش الظلام.',
      'كهنة الفيل الملعون والمتسللون يهاجمون الأقطار — استخدم الفيلة والفرسان لتطهير المسارات.',
      'فرسان الظل القتلة والمدرعون يتقدمون — شكّل البطاريات الملكية ونفّذ التبييت الدفاعي.',
      'عمالقة الحصار والوزيرة الطيفية في هجوم شامل — ادمج 5 جنود لوزير متوّج لحسم المعركة!',
      'موجات لا نهائية متصاعدة مع مراسيم ملكية مستمرة لاختبار أعلى تصنيف ELO عالمي!'
    ];
    const actStars = ['★☆☆☆☆', '★★☆☆☆', '★★★☆☆', '★★★★☆', '★★★★★'];

    const renderActsHtml = () =>
      window.CHESS_DATA.ACTS.map((act, idx) => {
        const isCurrent = idx === this.actIndex && this.gameMode === 'campaign';
        const isLocked = idx >= unlockedCount;
        const earned = Number((this.profile && this.profile.actStars && this.profile.actStars[String(act.id)]) || 0);
        const starsDisplay = earned > 0
          ? `<span class="earned-stars-pill" dir="ltr">${'★'.repeat(earned)}${'☆'.repeat(3 - earned)}</span>`
          : `<span dir="ltr">${actStars[idx] || '★★★'}</span>`;
        const wavesTxt = act.isEndless
          ? isEn
            ? '∞ Endless Waves'
            : '∞ موجات لا نهائية'
          : isEn
            ? `${act.totalWaves} Waves`
            : `${act.totalWaves} موجات`;

        const enemyTypesSet = new Set();
        if (act.waves && act.waves.length > 0) {
          act.waves.forEach(w => w.spawns.forEach(s => enemyTypesSet.add(s.type)));
        } else {
          Object.keys(window.CHESS_DATA.ENEMIES).forEach(k => enemyTypesSet.add(k));
        }

        const rosterIconsHtml = Array.from(enemyTypesSet)
          .map(typeId => {
            const eDef = window.CHESS_DATA.ENEMIES[typeId];
            const eUrl = window.RoyalSprites ? window.RoyalSprites.enemyDataUrls[typeId] : '';
            return eDef
              ? `<span class="act-enemy-icon" title="${eDef.name}"><img src="${eUrl}" alt="${eDef.name}" /></span>`
              : '';
          })
          .join('');

        const titleTxt = isEn ? `${act.code}: ${act.name}` : (actArabicNames[idx] || act.name);
        const subTxt = isEn ? act.subtitle || '' : act.name;
        const descTxt = isEn ? act.description : (actArabicDesc[idx] || act.description);
        const btnLabel = isLocked
          ? isEn
            ? `🔒 Clear Act ${idx} to Unlock`
            : `🔒 يُفتح بعد إنهاء الفصل ${idx}`
          : isCurrent
            ? isEn
              ? '↻ Restart Current Act'
              : '↻ إعادة تشغيل هذا الفصل'
            : isEn
              ? `⚔ Launch ${act.code} →`
              : `⚔ قيادة المعركة في ${act.code} ←`;

        return `
      <div class="act-card ${isCurrent ? 'active-act' : ''} ${isLocked ? 'locked-act' : ''}" data-act-idx="${idx}">
        <div class="act-card-header">
          <span class="act-code"><bdi dir="ltr">${act.code}</bdi> ${isCurrent ? (isEn ? '• ACTIVE' : '• قيد اللعب') : ''}</span>
          <span class="act-diff" dir="ltr">${starsDisplay} • ${act.difficulty}</span>
        </div>
        <div>
          <h4>${titleTxt}</h4>
          <span class="act-sub-en">${subTxt}</span>
        </div>
        <p>${descTxt}</p>
        <div class="act-enemy-roster">
          <span class="roster-label">${isEn ? '⚔ Horde Roster:' : '⚔ وحوش الفصل:'}</span>
          <div class="roster-icons-row">${rosterIconsHtml}</div>
        </div>
        <div class="act-meta-pills">
          <span class="act-meta-pill">⚔ ${wavesTxt}</span>
          <span class="act-meta-pill">☀ <bdi dir="ltr">${act.startingMana || 150}</bdi> ${isEn ? 'Start Mana' : 'طاقة ابتدائية'}</span>
          <span class="act-meta-pill" dir="ltr">♛ +45 ELO</span>
        </div>
        <button type="button" class="launch-act-btn" data-launch-idx="${idx}" ${isLocked ? 'disabled' : ''}>
          ${btnLabel}
        </button>
      </div>
    `;
      }).join('');

    if (container) {
      container.innerHTML = renderActsHtml();
      container.querySelectorAll('[data-launch-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-launch-idx'));
          if (idx >= unlockedCount) return;
          this.startAct(idx, { mode: 'campaign' });
        });
      });
    }

    if (quickMenuContainer) {
      quickMenuContainer.innerHTML = window.CHESS_DATA.ACTS.map((act, idx) => {
        const isCurrent = idx === this.actIndex && this.gameMode === 'campaign';
        const isLocked = idx >= unlockedCount;
        const wavesTxt = act.isEndless
          ? isEn
            ? '∞ Waves'
            : '∞ موجات'
          : isEn
            ? `${act.totalWaves} Waves`
            : `${act.totalWaves} موجات`;
        return `
          <button type="button" class="menu-act-pill ${isCurrent ? 'active' : ''} ${isLocked ? 'locked' : ''}" data-menu-act-idx="${idx}" ${isLocked ? 'disabled' : ''} aria-current="${isCurrent ? 'true' : 'false'}">
            <div class="menu-act-pill-top">
              <strong>${isLocked ? '🔒 ' : isCurrent ? '♛ ' : ''}<bdi dir="ltr">${act.code}</bdi></strong>
              <small>${wavesTxt}</small>
            </div>
            <span>${isEn ? act.name : (actArabicNames[idx] || act.name)}</span>
          </button>
        `;
      }).join('');
      quickMenuContainer.querySelectorAll('[data-menu-act-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-menu-act-idx'));
          if (idx >= unlockedCount) return;
          this.startAct(idx, { mode: 'campaign' });
        });
      });
    }
  }

  openModal(id) {
    this.paused = true;
    this.populateActsDrawer();
    if (id === 'codexModal') this.populateCodexModal();
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
    const resumeBtn = document.getElementById('menuResumeBtn');
    if (resumeBtn && id === 'commandMenuModal') {
      const isEn = this.lang === 'en';
      resumeBtn.textContent = this.gameOver
        ? isEn
          ? '↺ Return to Battle Report'
          : '↺ العودة لتقرير المعركة'
        : isEn
          ? '▶ Resume Battle Now'
          : '▶ استئناف المعركة الآن';
    }
    this._lastHudSig = '';
    this.updateHUD();
  }

  hideModals() {
    const modalIds = this.gameOver
      ? ['commandMenuModal', 'codexModal', 'actsModal', 'decreeModal']
      : ['commandMenuModal', 'codexModal', 'actsModal', 'decreeModal', 'resultModal'];
    modalIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
    if (!this.gameOver && !this.onTitleScreen) this.paused = false;
  }

  applyVolumeSettings() {
    if (!window.RoyalAudio) return;
    window.RoyalAudio.setSfxVolume(this.profile.sfxVol ?? 0.8);
    window.RoyalAudio.setMusicVolume(this.profile.musicVol ?? 0.52);
  }

  setLanguage(lang) {
    this.lang = lang === 'en' ? 'en' : 'ar';
    this.saveProfile();
    this.applyLanguage(this.lang);
    this.buildDeckBar();
    this.populateCodexModal();
    this.renderTitleScreen();
    this.populateActsDrawer();
    this.updateTutorialBanner();
    this.updateTipTicker();
    this.lastInspectedKey = '';
    this._lastHudSig = '';
    this.updateHUD();
  }

  applyLanguage(lang) {
    const t = window.CHESS_DATA.I18N[lang] || window.CHESS_DATA.I18N.ar;
    const isEn = lang === 'en';
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
    document.title = isEn
      ? 'CROWN & BLIGHT: The Royal Gambit — Tactical Chess Defense'
      : 'CROWN & BLIGHT: The Royal Gambit | حرب التاج والظلام';

    // Synchronize direction on key containers so RTL/LTR never clash
    [
      '.stage-top-ribbon',
      '#tacticalStatusPill',
      '#activeSynergiesRow',
      '#tacticalInspectorCard',
      '#commandMenuModal',
      '#codexModal',
      '#actsModal',
      '#resultModal',
      '#decreeModal',
      '#titleOverlay'
    ].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        el.setAttribute('dir', t.dir);
        el.setAttribute('lang', lang);
      }
    });

    const swap = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.textContent = val;
    };
    swap('manaTitleLabel', t.manaTitle);
    swap('scoreLabelTxt', t.scoreLabel);
    swap('eloLabelTxt', t.eloLabel);
    swap('nextWaveLabelText', t.nextWaveBtn);
    swap('earlyBonusSubTxt', t.earlyBonusSub);
    swap('openMenuBtnLabel', t.menuBtn);
    swap('openActsBtnLabel', t.actsBtn);
    swap('openCodexBtnLabel', t.codexBtn);
    swap('shovelLabelTxt', t.sacrificeLabel);
    swap('ultCrownTxt', t.ultCrownTitle);
    swap('mergeCtaTitleTxt', t.mergeCtaTitle);
    swap('mergeCtaSubTxt', t.mergeCtaSub);
    swap('matrixCaptionTxt', t.matrixCaption);
    swap('langToggleText', lang === 'ar' ? 'EN' : 'عربي');
    swap('titleLangText', lang === 'ar' ? 'English' : 'العربية');
    swap('titleSubText', t.titleSub);
    swap('titleLaunchCampaignTxt', t.titleStartCampaign);
    swap('titlePuzzlesTxt', t.titlePuzzles);
    swap('titleDailyTxt', t.titleDaily);
    swap('titleCommanderHeader', t.titleCommanderLabel);
    swap('titleDoctrineHeader', t.titleDoctrineLabel);
    swap('decreeEyebrowTxt', t.decreeEyebrow);
    swap('decreeModalTitle', t.decreeTitle);
    swap('commandMenuTitle', t.cmdMenuTitle);
    swap('codexModalTitle', t.codexTitle);
    swap('actsModalTitle', t.actsTitle);
    swap('closeMenuBtn', t.closeModalEsc);
    swap('closeCodexBtn', t.closeModalEsc);
    swap('closeActsBtn', t.closeModalEsc);
    swap('landscapeHintTxt', t.rotatePhoneMsg);

    // Modal navigation tabs & Codex filter tabs
    document.querySelectorAll('[data-switch-modal="commandMenuModal"]').forEach(el => {
      el.textContent = t.navSettings;
    });
    document.querySelectorAll('[data-switch-modal="actsModal"]').forEach(el => {
      el.textContent = t.navActs;
    });
    document.querySelectorAll('[data-switch-modal="codexModal"]').forEach(el => {
      el.textContent = t.navCodex;
    });
    const tabAll = document.querySelector('[data-codex-tab="all"]');
    if (tabAll) tabAll.textContent = t.codexTabAll;
    const tabPieces = document.querySelector('[data-codex-tab="pieces"]');
    if (tabPieces) tabPieces.textContent = t.codexTabPieces;
    const tabEnemies = document.querySelector('[data-codex-tab="enemies"]');
    if (tabEnemies) tabEnemies.textContent = t.codexTabEnemies;

    // Result modal footer buttons
    swap('modalActsBtn', isEn ? '❖ Campaign Map' : '❖ خريطة الحملة');
    swap('modalCodexBtn', isEn ? '◈ Counter Codex' : '◈ الموسوعة المضادة');
    swap('modalMainMenuBtn', isEn ? '♚ Command Hub' : '♚ مركز القيادة');

    // Command Menu & Codex static headings
    swap(
      'menuHeroGameTitle',
      isEn ? 'CROWN & BLIGHT: THE ROYAL GAMBIT' : 'حرب التاج والظلام • CROWN & BLIGHT'
    );
    swap(
      'menuHeroSubTxt',
      isEn
        ? 'Authentic 10×5 Tactical Chess Geometry against the Corrupted Undead Horde — build Sun-Spire Chalices, anchor Phalanx Pawn walls, and fuse 5 Pawns into an Ascended Sovereign Queen!'
        : 'هندسة الشطرنج الحقيقية على رقعة 10×5 في مواجهة جحافل الظلام — ابنِ اقتصاد كؤوس النور، شكّل جدار الجنود المدرعين، وادمج 5 جنود في سطر لترقيتهم سينمائياً إلى وزير متوّج!'
    );
    swap('menuEconIncomeLbl', isEn ? 'Mana Generation' : 'معدل إنتاج الطاقة');
    swap('menuEconArmyLbl', isEn ? 'Field Army Value' : 'قيمة الجيش بالميدان');
    swap('menuEconKillsLbl', isEn ? 'Undead Slain' : 'الوحوش المدمّرة');
    swap('menuTelEloLbl', isEn ? 'GRANDMASTER ELO' : 'التصنيف الملكي');
    swap('menuTelWaveLbl', isEn ? 'CAMPAIGN WAVE' : 'المرحلة والموجة');
    swap('menuTelSentLbl', isEn ? 'SENTINEL ROOKS' : 'القلاع المجنحة');
    swap('menuTelSentSub', isEn ? 'Final rank defense' : 'خط الدفاع الأخير للصفوف');
    swap('menuTelForcesLbl', isEn ? 'FIELD STATUS' : 'قوات الميدان والطاقة');
    swap('menuRestartBtn', isEn ? '↻ Restart Current Stage' : '↻ إعادة المرحلة الحالية');
    swap('menuOpenActsBtn', isEn ? '❖ Campaign Map (5 Acts)' : '❖ خريطة الحملة (5 فصول)');
    swap('menuOpenCodexBtn', isEn ? '◈ Chess & Bestiary Codex' : '◈ موسوعة الشطرنج والوحوش');
    swap('menuSettingsHeader', isEn ? '⚙ Battle & Display Settings' : '⚙ إعدادات المعركة والعرض');
    swap('menuQuickActsHeader', isEn ? '⚔ Quick Campaign Select (5 Acts)' : '⚔ انتقال سريع بين فصول الحملة');
    swap('menuShortcutsHeader', isEn ? '♚ Tactical Controls (Mouse, Keyboard & Gamepad)' : '♚ اختصارات التحكم (الماوس ولوحة المفاتيح ويد التحكم)');
    swap('sfxSliderLbl', isEn ? '⚔ Sound Effects • SFX' : '⚔ المؤثرات الصوتية');
    swap('musicSliderLbl', isEn ? '♫ Symphonic Score • Music' : '♫ الموسيقى الملكية');
    swap('setSpeedTitle', isEn ? 'Battle Speed' : 'سرعة المعركة');
    swap('setSpeedSub', isEn ? 'Cycle 1x / 1.5x / 2x pace' : 'التحكم في وتيرة الوقت');
    swap('setAutoTitle', isEn ? 'Auto-Harvest Mana' : 'جمع الطاقة الملكية');
    swap('setAutoSub', isEn ? 'Collect sun crystals automatically' : 'التقاط بلورات النور آلياً');
    swap('setGridTitle', isEn ? 'Algebraic Coordinates' : 'إحداثيات رقعة الشطرنج');
    swap('setGridSub', isEn ? 'Toggle A1–J5 square labels' : 'إظهار ترقيم المربعات A1–J5');
    swap('setAudioTitle', isEn ? 'Symphonic Audio' : 'الموسيقى والمؤثرات');
    swap('setAudioSub', isEn ? 'Toggle music & physical Foley' : 'الأوركسترا الملكية وأصوات القتال');
    swap('setFullTitle', isEn ? 'Fullscreen Mode' : 'وضع الشاشة الكاملة');
    swap('setFullSub', isEn ? 'Borderless theater view' : 'تجربة سينمائية بدون حواف');
    swap('setTitleHubTitle', isEn ? 'Title Sanctuary & Modes' : 'الشاشة الرئيسية والأطوار');
    swap('setTitleHubSub', isEn ? 'Commanders / Doctrines / Puzzles' : 'اختيار القائد / العقيدة / الألغاز');
    swap('codexRulesHeader', isEn ? '♛ Tactical Chess Geometry & Synergies' : '♛ قواعد الدمج والاقتصاد المتوازن');
    swap(
      'codexRulesDesc',
      isEn
        ? 'Command a 10×5 (A1–J5) cathedral chessboard where every unit attacks and repositions using authentic Chess rules. Align 5 Phalanx Pawns on any rank or file and press [M] to fuse them into an Ascended Sovereign Queen!'
        : 'ساحة المعركة رقعة شطرنج 10×5 حيث تهاجم كل قطعة وتتحرك وفق هندسة الشطرنج الحقيقية. صفّ 5 جنود مدرعين في نفس السطر واضغط [M] لدمجهم سينمائياً إلى وزير ملكي متوّج!'
    );
    swap('codexPiecesHeader', isEn ? '♟ Royal Chess Defenders (7 Units)' : '♟ قطع الشطرنج الملكية (7 وحدات)');
    swap('codexEnemiesHeader', isEn ? '⚔ Corrupted Ebony Bestiary (8 Enemies)' : '⚔ جيش الشطرنج الأسود الملعون (8 وحوش)');
  }

  updateTipTicker() {
    const tips = this.lang === 'en' ? window.CHESS_DATA.TIPS_EN : window.CHESS_DATA.TIPS;
    if (!tips || tips.length === 0) return;
    const tipText = tips[this.tipIndex % tips.length];
    const hudTip = document.getElementById('liveTipBannerText');
    if (hudTip) hudTip.textContent = tipText;
    const menuTip = document.getElementById('menuTipBannerText');
    if (menuTip) menuTip.textContent = tipText;
  }

  renderTitleScreen() {
    const grid = document.getElementById('titleCommanderGrid');
    const docGrid = document.getElementById('titleDoctrineGrid');
    const ascGrid = document.getElementById('titleAscensionGrid');
    const summaryEl = document.getElementById('titleCampaignProgress');
    const puzzleRow = document.getElementById('titlePuzzleList');
    const achStrip = document.getElementById('titleAchievementsStrip');
    const isEn = this.lang === 'en';
    const cmders = Object.values(window.CHESS_DATA.COMMANDERS || {});

    if (grid) {
      grid.innerHTML = cmders
        .map(c => {
          const active = c.id === this.commanderId;
          const name = isEn ? c.nameEn : c.nameAr;
          const sub = isEn ? c.subtitleEn : c.subtitleAr;
          const desc = isEn ? c.descEn : c.descAr;
          return `
            <button type="button" class="commander-card ${active ? 'selected' : ''}" data-commander-id="${c.id}" style="--cmd-accent: ${c.accent}">
              <div class="cmd-head">
                <span class="cmd-glyph">${c.symbol}</span>
                <div>
                  <strong>${name}</strong>
                  <small>${sub}</small>
                </div>
              </div>
              <p>${desc}</p>
            </button>
          `;
        })
        .join('');

      grid.querySelectorAll('[data-commander-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.commanderId = btn.getAttribute('data-commander-id');
          this.saveProfile();
          window.RoyalAudio.playUiClick();
          this.renderTitleScreen();
          this.buildDeckBar();
        });
      });
    }

    if (docGrid) {
      const docs = Object.values(window.CHESS_DATA.DOCTRINES || {});
      docGrid.innerHTML = docs
        .map(d => {
          const active = d.id === this.doctrineId;
          return `
            <button type="button" class="doctrine-pill ${active ? 'selected' : ''}" data-doctrine-id="${d.id}" title="${isEn ? d.descEn : d.descAr}">
              <span class="doc-icon">${d.icon}</span>
              <span class="doc-copy">
                <strong>${isEn ? d.nameEn : d.nameAr}</strong>
                <small>${isEn ? d.descEn : d.descAr}</small>
              </span>
            </button>
          `;
        })
        .join('');
      docGrid.querySelectorAll('[data-doctrine-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.doctrineId = btn.getAttribute('data-doctrine-id');
          this.saveProfile();
          window.RoyalAudio.playUiClick();
          this.renderTitleScreen();
        });
      });
    }

    if (ascGrid) {
      const ascs = window.CHESS_DATA.ASCENSIONS || [];
      ascGrid.innerHTML = ascs
        .map(a => {
          const active = a.level === this.ascensionLevel;
          return `
            <button type="button" class="ascension-pill ${active ? 'selected' : ''}" data-asc-lvl="${a.level}" title="${isEn ? a.descEn : a.descAr}">
              <strong dir="ltr">${a.level === 0 ? 'A0' : `🔥A${a.level}`}</strong>
              <small>${isEn ? a.nameEn : a.nameAr}</small>
            </button>
          `;
        })
        .join('');
      ascGrid.querySelectorAll('[data-asc-lvl]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.ascensionLevel = Number(btn.getAttribute('data-asc-lvl')) || 0;
          this.saveProfile();
          window.RoyalAudio.playUiClick();
          this.renderTitleScreen();
        });
      });
    }

    if (puzzleRow) {
      const puzzles = window.CHESS_DATA.PUZZLES || [];
      puzzleRow.innerHTML = puzzles
        .map((pz, idx) => {
          const solved = Boolean(this.profile.solvedPuzzles && this.profile.solvedPuzzles[pz.id]);
          const title = isEn ? pz.nameEn : pz.nameAr;
          return `
            <button type="button" class="title-puzzle-chip ${solved ? 'solved' : ''}" data-puzzle-idx="${idx}" title="${isEn ? pz.descEn : pz.descAr}">
              <span>${solved ? '★' : '♟'} ${title}</span>
              <small dir="ltr">${pz.code}</small>
            </button>
          `;
        })
        .join('');

      puzzleRow.querySelectorAll('[data-puzzle-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
          window.RoyalAudio.init();
          window.RoyalAudio.playUiClick();
          window.RoyalAudio.startMusic();
          const idx = Number(btn.getAttribute('data-puzzle-idx'));
          this.startAct(0, { mode: 'puzzle', puzzleIndex: idx });
        });
      });
    }

    if (achStrip) {
      const achs = window.CHESS_DATA.ACHIEVEMENTS || [];
      achStrip.innerHTML = achs
        .map(a => {
          const unlocked = Boolean(this.profile.achievements && this.profile.achievements[a.id]);
          const nm = isEn ? a.nameEn : a.nameAr;
          const ds = isEn ? a.descEn : a.descAr;
          return `
            <span class="ach-badge ${unlocked ? 'unlocked' : ''}" title="${nm} — ${ds}">
              <span>${a.icon}</span>
              <small>${nm}</small>
            </span>
          `;
        })
        .join('');
    }

    if (summaryEl) {
      const stars = Object.values(this.profile.actStars || {}).reduce((a, b) => a + b, 0);
      const totalPuzzles = (window.CHESS_DATA.PUZZLES || []).length;
      const solvedCount = Object.keys(this.profile.solvedPuzzles || {}).length;
      const achCount = Object.keys(this.profile.achievements || {}).length;
      const totalAch = (window.CHESS_DATA.ACHIEVEMENTS || []).length;
      summaryEl.innerHTML = isEn
        ? `ELO <strong dir="ltr">${this.eloRating}</strong> • Unlocked <strong dir="ltr">${this.unlockedActs}/5</strong> • Stars <strong dir="ltr">${stars}/12 ★</strong> • Puzzles <strong dir="ltr">${solvedCount}/${totalPuzzles}</strong> • Seals <strong dir="ltr">${achCount}/${totalAch}</strong> • Endless <strong dir="ltr">W${this.profile.endlessBestWave || 0}</strong>`
        : `التصنيف <strong dir="ltr">${this.eloRating}</strong> • الفصول <strong dir="ltr">${this.unlockedActs}/5</strong> • النجوم <strong dir="ltr">${stars}/12 ★</strong> • الألغاز <strong dir="ltr">${solvedCount}/${totalPuzzles}</strong> • الأوسمة <strong dir="ltr">${achCount}/${totalAch}</strong> • اللانهائي <strong dir="ltr">W${this.profile.endlessBestWave || 0}</strong>`;
    }
  }

  openDecreeDraft() {
    const pool = (window.CHESS_DATA.DECREES || []).filter(d => !this.activeDecrees.includes(d.id));
    if (pool.length === 0) {
      this.waveCooldownTimer = 1.6;
      return;
    }

    // Seeded Fisher-Yates shuffle so Daily Gambit drafts are 100% deterministic across players
    const copy = [...pool];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.rand() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    const shuffled = copy.slice(0, 3);
    const modal = document.getElementById('decreeModal');
    const grid = document.getElementById('decreeCardsGrid');
    if (!modal || !grid) return;

    this.paused = true;
    grid.innerHTML = shuffled
      .map(d => {
        const title = this.lang === 'en' ? d.nameEn : d.nameAr;
        const desc = this.lang === 'en' ? d.descEn : d.descAr;
        const isCursed = d.tier === 'CURSED GAMBIT';
        return `
          <button type="button" class="decree-draft-card ${isCursed ? 'cursed-card' : ''}" data-decree-id="${d.id}">
            <span class="decree-tier-badge" dir="ltr">${d.tier}</span>
            <div class="decree-icon-orb">${d.icon}</div>
            <h4>${title}</h4>
            <p>${desc}</p>
            <span class="decree-pick-cta">${this.lang === 'en' ? 'Accept Decree →' : 'اختيار المرسوم ←'}</span>
          </button>
        `;
      })
      .join('');

    grid.querySelectorAll('[data-decree-id]').forEach(cardBtn => {
      cardBtn.addEventListener('click', () => {
        const id = cardBtn.getAttribute('data-decree-id');
        const picked = (window.CHESS_DATA.DECREES || []).find(d => d.id === id);
        if (picked) {
          this.activeDecrees.push(picked.id);
          picked.apply(this.decreeState, this);
          window.RoyalAudio.playDecreePick();
          this.addFloatingText(
            `✦ ${this.lang === 'en' ? picked.nameEn : picked.nameAr}`,
            this.renderer.width * 0.5,
            this.renderer.boardTop + 44,
            '#fde047',
            true
          );
        }
        modal.classList.add('hidden');
        this.paused = false;
        this.waveCooldownTimer = 1.6;
        this._lastHudSig = '';
        this.updateHUD();
      });
    });

    modal.classList.remove('hidden');
  }

  updateMobilePieceBar() {
    const bar = document.getElementById('mobilePieceActions');
    if (!bar) return;
    if (!this.selectedBoardPiece || this.paused || this.gameOver) {
      bar.classList.add('hidden');
      return;
    }
    const p = this.selectedBoardPiece;
    const def = window.CHESS_DATA.PIECES[p.type];
    const promoteCost = (this.decreeState && this.decreeState.promoteCost) || 125;
    const isEn = this.lang === 'en';
    const buttons = [];

    if (p.inReadyPawnLine && this.countPiecesOfType('queen') < 2) {
      buttons.push(
        `<button type="button" class="mob-act-btn gold" data-mob-act="merge">♛ ${isEn ? 'Merge [M]' : 'دمج [M]'}</button>`
      );
    }
    if (p.type === 'pawn' && p.xp >= 100) {
      const can = this.mana >= promoteCost;
      buttons.push(
        `<button type="button" class="mob-act-btn ${can ? 'gold' : ''}" data-mob-act="promote">♛ ${isEn ? 'Promote' : 'ترقية'} (${promoteCost}☀)</button>`
      );
    }
    if (p.type === 'king') {
      const castleMove = this.getLegalMovesForPiece(p).find(m => m.isCastle);
      if (castleMove) {
        buttons.push(
          `<button type="button" class="mob-act-btn cyan" data-mob-act="castle">♜ ${isEn ? 'Castle' : 'تبييت'}</button>`
        );
      }
    }
    buttons.push(
      `<button type="button" class="mob-act-btn danger" data-mob-act="sacrifice">✕ +${Math.floor(this.getPieceCost(def.id) * 0.6)}☀</button>`
    );

    bar.innerHTML = buttons.join('');
    bar.classList.remove('hidden');
    bar.querySelectorAll('[data-mob-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.getAttribute('data-mob-act');
        if (act === 'merge') this.tryMergePawnLine(p);
        else if (act === 'promote') this.tryPromotePawn(p);
        else if (act === 'castle') {
          const mv = this.getLegalMovesForPiece(p).find(m => m.isCastle);
          if (mv) {
            this.executeChessMove(p, mv);
            this.selectedBoardPiece = null;
          }
        } else if (act === 'sacrifice') {
          this.sacrificePiece(p);
          this.selectedBoardPiece = null;
        }
        this.updateHUD();
      });
    });
  }

  // Render a 5x5 Mini Chessboard Attack Matrix inside the Inspector Dock
  renderMiniChessMatrix(pieceType) {
    const gridEl = document.getElementById('miniMatrixGrid');
    if (!gridEl || gridEl.dataset.renderedType === pieceType) return;
    gridEl.dataset.renderedType = pieceType;
    gridEl.innerHTML = this.buildMiniMatrixCellsHTML(pieceType);
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
    const promoteCost = (this.decreeState && this.decreeState.promoteCost) || 125;

    if (boardPiece) {
      const coord = this.renderer.algebraicLabel(boardPiece.col, boardPiece.row);
      const displayName = this.lang === 'en' ? def.name : (def.arabicTitle || def.name);
      nameEl.innerHTML = `${displayName} <bdi dir="ltr">[${coord.toUpperCase()}]</bdi>`;

      let extraInfo = '';
      if (boardPiece.type === 'pawn') {
        const colPawns = this.pieces.filter(p => p.type === 'pawn' && p.col === boardPiece.col).length;
        const rowPawns = this.pieces.filter(p => p.type === 'pawn' && p.row === boardPiece.row).length;
        const bestLine = Math.max(colPawns, rowPawns);
        extraInfo = ` • LINE ${bestLine}/5 • XP ${Math.floor(boardPiece.xp)}%`;
      }
      const shieldTxt = boardPiece.shieldHp > 0 ? ` (+${Math.ceil(boardPiece.shieldHp)}❖)` : '';
      statsEl.textContent = `HP ${Math.ceil(boardPiece.hp)}/${boardPiece.maxHp}${shieldTxt}${extraInfo}`;
      ruleEl.textContent = this.lang === 'en' ? def.chessRule : (def.chessRuleAr || def.chessRule);

      const key = `board-${boardPiece.id}-${Math.floor(boardPiece.xp)}-${Math.floor(this.mana)}-${readyLinesCount}-${promoteCost}-${this.lang}`;
      if (this.lastInspectedKey !== key) {
        this.lastInspectedKey = key;
        actionsEl.innerHTML = '';

        if (readyLinesCount > 0) {
          const mergeBtn = document.createElement('button');
          mergeBtn.type = 'button';
          mergeBtn.className = 'quick-action-btn';
          mergeBtn.innerHTML =
            this.lang === 'en'
              ? '♛ Merge 5-Pawn Line → Queen <bdi dir="ltr">[M]</bdi>'
              : '♛ دمج سطر الجنود ← وزير <bdi dir="ltr">[M]</bdi>';
          mergeBtn.addEventListener('click', () => this.tryMergePawnLine(boardPiece));
          actionsEl.appendChild(mergeBtn);
        }

        if (boardPiece.type === 'pawn') {
          const crownBtn = document.createElement('button');
          crownBtn.type = 'button';
          crownBtn.className = 'quick-action-btn';
          const canCrown = boardPiece.xp >= 100 && this.mana >= promoteCost;
          crownBtn.disabled = !canCrown;
          crownBtn.innerHTML =
            boardPiece.xp >= 100
              ? `♛ ${this.lang === 'en' ? 'Promote [U]' : 'ترقية [U]'} <bdi dir="ltr">(${promoteCost}☀)</bdi>`
              : `♛ <bdi dir="ltr">XP ${Math.floor(boardPiece.xp)}/100</bdi>`;
          crownBtn.addEventListener('click', () => this.tryPromotePawn(boardPiece));
          actionsEl.appendChild(crownBtn);
        }

        if (boardPiece.type === 'king') {
          const legal = this.getLegalMovesForPiece(boardPiece);
          const castleMove = legal.find(m => m.isCastle);
          if (castleMove) {
            const cBtn = document.createElement('button');
            cBtn.type = 'button';
            cBtn.className = 'quick-action-btn';
            cBtn.innerHTML = this.lang === 'en' ? '♜ Castle!' : '♜ تبييت ملكي!';
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
      const effCost = this.getPieceCost(typeId);
      nameEl.innerHTML =
        this.lang === 'en'
          ? `${def.name} • <bdi dir="ltr">${def.chessTitle}</bdi>`
          : `${def.arabicTitle || def.name}`;
      const shieldInfo = def.startingShield ? ` (+${def.startingShield}❖)` : '';
      statsEl.textContent = `HP ${def.maxHp}${shieldInfo} • ${effCost}☀`;
      ruleEl.textContent = this.lang === 'en' ? def.chessRule : (def.chessRuleAr || def.chessRule);
      const deckKey = `deck-${typeId}-${readyLinesCount}-${this.lang}-${effCost}`;
      if (this.lastInspectedKey !== deckKey) {
        this.lastInspectedKey = deckKey;
        actionsEl.innerHTML = '';
        if (readyLinesCount > 0) {
          const mergeBtn = document.createElement('button');
          mergeBtn.type = 'button';
          mergeBtn.className = 'quick-action-btn';
          mergeBtn.innerHTML =
            this.lang === 'en'
              ? '♛ Merge 5-Pawn Line → Queen <bdi dir="ltr">[M]</bdi>'
              : '♛ دمج سطر الجنود ← وزير <bdi dir="ltr">[M]</bdi>';
          mergeBtn.addEventListener('click', () => this.tryMergePawnLine(null));
          actionsEl.appendChild(mergeBtn);
        }
      }
    }
  }

  updateHUD() {
    // Cooldown curtain bars update smoothly without dirtying text DOM every frame
    document.querySelectorAll('.deck-card').forEach(card => {
      const pid = card.dataset.pieceId;
      const def = window.CHESS_DATA.PIECES[pid];
      const cd = this.cardCooldowns[pid] || 0;
      const cdEl = document.getElementById(`cd-${pid}`);
      if (cdEl && def) {
        const pct = cd > 0 ? Math.min(100, (cd / def.cooldown) * 100) : 0;
        cdEl.style.height = `${pct}%`;
      }
    });

    const cdSig = Object.keys(this.cardCooldowns)
      .map(k => Math.ceil((this.cardCooldowns[k] || 0) * 5))
      .join(',');
    const selKey = this.selectedBoardPiece
      ? `${this.selectedBoardPiece.id}:${Math.ceil(this.selectedBoardPiece.hp)}:${Math.floor(this.selectedBoardPiece.xp)}:${Math.ceil(this.selectedBoardPiece.moveCd * 5)}`
      : `d:${this.selectedDeckPieceId}`;
    const sig = [
      Math.floor(this.mana),
      this.score,
      this.eloRating,
      this.actIndex,
      this.waveIndex,
      this.waveSpawnQueue.length,
      this.enemiesKilled,
      this.pieces.length,
      Math.floor(this.ultimateCharge),
      this.shovelMode ? 1 : 0,
      this.paused ? 1 : 0,
      this.gameSpeed,
      this.autoCollectMana ? 1 : 0,
      this.showGridOverlay ? 1 : 0,
      this.lang,
      this.commanderId,
      this.doctrineId,
      this.ascensionLevel,
      this.unlockedActs,
      this.batteryLinks.length,
      this.pawnChainLinks.length,
      this.readyPawnLines.length,
      this.activeDecrees.length,
      selKey,
      cdSig,
      Boolean(this.mergeCinematic) ? 1 : 0
    ].join('|');

    if (sig === this._lastHudSig) return;
    this._lastHudSig = sig;

    this.updateMobilePieceBar();

    const isEn = this.lang === 'en';
    const t = window.CHESS_DATA.I18N[this.lang] || window.CHESS_DATA.I18N.ar;
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt('manaCounterVal', Math.floor(this.mana));
    setTxt('scoreCounterVal', this.score.toLocaleString());
    setTxt('eloCounterVal', this.eloRating);
    const ascTag = this.gameMode === 'campaign' && this.ascensionLevel > 0 ? ` [A${this.ascensionLevel}]` : '';
    setTxt('actTitleBadge', `${this.currentAct.code}: ${this.currentAct.name}${ascTag}`);

    const remainingSentinels = this.chariots.filter(c => !c.used || c.active).length;
    setTxt(
      'sentinelCountBadge',
      this.gameMode === 'puzzle'
        ? isEn
          ? '♟ Puzzle • 0 Sentinels'
          : '♟ لغز • بدون قلاع'
        : isEn
          ? `♜ ${remainingSentinels}/5 Sentinels`
          : `♜ ${remainingSentinels}/5 القلاع المجنحة`
    );

    const totalW = this.currentAct.isEndless ? '∞' : this.currentAct.totalWaves;
    setTxt('waveCounterText', `${t.wavePrefix} ${Math.max(1, this.waveIndex)} / ${totalW}`);

    const waveBar = document.getElementById('waveProgressBar');
    if (waveBar) {
      const pct = this.currentAct.isEndless
        ? 100
        : Math.min(100, Math.round((this.waveIndex / this.currentAct.totalWaves) * 100));
      waveBar.style.width = `${pct}%`;
    }

    const callWaveBtn = document.getElementById('callWaveBtn');
    if (callWaveBtn) {
      const canCall =
        this.gameMode !== 'puzzle' &&
        this.waveSpawnQueue.length === 0 &&
        (this.currentAct.isEndless || this.waveIndex < this.currentAct.waves.length);
      callWaveBtn.disabled = !canCall;
    }

    const mergeCtaBtn = document.getElementById('screenMergeCtaBtn');
    if (mergeCtaBtn) {
      const showMergeCta =
        Boolean(this.readyPawnLines && this.readyPawnLines.length > 0) && !this.mergeCinematic;
      mergeCtaBtn.classList.toggle('hidden', !showMergeCta);
    }

    const synRow = document.getElementById('activeSynergiesRow');
    if (synRow) {
      const pills = [];
      if (this.readyPawnLines && this.readyPawnLines.length > 0) {
        pills.push(
          isEn
            ? `<span class="synergy-pill">♛ 5-Pawn Line Ready <bdi dir="ltr">(${this.readyPawnLines.length})</bdi> — Press <bdi dir="ltr">[M]</bdi></span>`
            : `<span class="synergy-pill">♛ سطر جنود مكتمل <bdi dir="ltr">(${this.readyPawnLines.length})</bdi> — اضغط <bdi dir="ltr">[M]</bdi> للدمج إلى وزير!</span>`
        );
      }
      if (this.batteryLinks.length > 0) {
        const pct = Math.round((0.3 + ((this.decreeState && this.decreeState.batteryBonus) || 0)) * 100);
        pills.push(
          isEn
            ? `<span class="synergy-pill">⚡ Royal Battery <bdi dir="ltr">(${this.batteryLinks.length}) +${pct}%</bdi></span>`
            : `<span class="synergy-pill">⚡ بطارية ملكية <bdi dir="ltr">(${this.batteryLinks.length}) +${pct}%</bdi></span>`
        );
      }
      if (this.pawnChainLinks.length > 0) {
        pills.push(
          isEn
            ? `<span class="synergy-pill">❖ Pawn Chain <bdi dir="ltr">(${this.pawnChainLinks.length})</bdi></span>`
            : `<span class="synergy-pill">❖ سلسلة جنود <bdi dir="ltr">(${this.pawnChainLinks.length})</bdi></span>`
        );
      }
      if (this.pieces.some(p => p.type === 'king')) {
        const auraPct = Math.round(
          (0.3 + ((this.decreeState && this.decreeState.kingExpandedAura) ? 0.1 : 0)) * 100
        );
        pills.push(
          isEn
            ? `<span class="synergy-pill">♚ King Aura <bdi dir="ltr">+${auraPct}%</bdi></span>`
            : `<span class="synergy-pill">♚ هالة الملك <bdi dir="ltr">+${auraPct}%</bdi></span>`
        );
      }
      if (this.activeDecrees.length > 0) {
        pills.push(
          `<span class="synergy-pill">✦ ${isEn ? 'Decrees' : 'مراسيم'} <bdi dir="ltr">${this.activeDecrees.length}</bdi></span>`
        );
      }
      synRow.innerHTML = pills.join('');
    }

    const ultBtn = document.getElementById('ultimateBtn');
    const ultFill = document.getElementById('ultimateFillBar');
    const ultPct = Math.floor(this.ultimateCharge);
    if (ultFill) ultFill.style.width = `${ultPct}%`;
    if (ultBtn) {
      ultBtn.classList.toggle('ready', ultPct >= 100);
      ultBtn.disabled = ultPct < 100;
    }
    setTxt('ultimateText', ultPct >= 100 ? (isEn ? 'READY [SPACE]' : 'جاهزة [SPACE]') : `${ultPct}% [SPACE]`);

    document.querySelectorAll('.deck-card').forEach(card => {
      const pid = card.dataset.pieceId;
      const def = window.CHESS_DATA.PIECES[pid];
      const cost = this.getPieceCost(pid);
      const cd = this.cardCooldowns[pid] || 0;
      const count = this.countPiecesOfType(pid);
      const atCap = Boolean(def.maxCount && count >= def.maxCount);
      const canAfford = this.mana >= cost && !atCap;

      const costEl = document.getElementById(`cost-${pid}`);
      if (costEl) {
        costEl.innerHTML = `<span class="mana-gem">☀</span>${cost}`;
      }

      card.classList.toggle(
        'selected',
        this.selectedDeckPieceId === pid && !this.shovelMode && !this.selectedBoardPiece
      );
      card.classList.toggle('unaffordable', !canAfford || cd > 0);

      const capEl = document.getElementById(`cap-${pid}`);
      if (capEl) {
        let badgeTxt = '';
        if (atCap) {
          badgeTxt = `MAX ${count}/${def.maxCount}`;
        } else if (cd > 0) {
          badgeTxt = `${cd.toFixed(1)}s`;
        } else if (this.mana < cost) {
          badgeTxt = isEn ? 'LOW ☀' : 'نقص ☀';
        } else if (def.maxCount) {
          badgeTxt = `${count}/${def.maxCount}`;
        }
        capEl.textContent = badgeTxt;
        capEl.classList.toggle('has-badge', Boolean(badgeTxt));
        capEl.classList.toggle('cap-full', atCap || cd > 0 || this.mana < cost);
      }
    });

    const statusPill = document.getElementById('tacticalStatusPill');
    if (statusPill) {
      if (this.shovelMode) {
        statusPill.innerHTML = isEn
          ? '⚔ <strong>Sacrifice Mode:</strong> Click any piece to refund <bdi dir="ltr">60%☀</bdi> and detonate nearby foes!'
          : '⚔ <strong>وضع التضحية:</strong> انقر على أي قطعة لاسترجاع <bdi dir="ltr">60%☀</bdi> وتفجير الأعداء حولها!';
        statusPill.className = 'tactical-status-pill mode-shovel';
      } else if (this.selectedBoardPiece) {
        const pDef = window.CHESS_DATA.PIECES[this.selectedBoardPiece.type];
        const pName = isEn ? pDef.name : (pDef.arabicTitle || pDef.name);
        const cd = this.selectedBoardPiece.moveCd;
        statusPill.innerHTML =
          cd > 0
            ? isEn
              ? `◈ <strong>${pName}</strong> move recharging <bdi dir="ltr">(${cd.toFixed(1)}s)</bdi>`
              : `◈ حركة <strong>${pName}</strong> قيد الشحن <bdi dir="ltr">(${cd.toFixed(1)}s)</bdi>`
            : isEn
              ? `♟ <strong>Chess Move Ready:</strong> Click or drag <strong>${pName}</strong> to any glowing square!`
              : `♟ <strong>حركة شطرنج جاهزة:</strong> انقر أو اسحب <strong>${pName}</strong> لأي مربع متوهج!`;
        statusPill.className = 'tactical-status-pill mode-move';
      } else if (this.selectedDeckPieceId) {
        const dDef = window.CHESS_DATA.PIECES[this.selectedDeckPieceId];
        const dName = isEn ? dDef.name : (dDef.arabicTitle || dDef.name);
        const effCost = this.getPieceCost(this.selectedDeckPieceId);
        statusPill.innerHTML = isEn
          ? `⚔ <strong>Deploy ${dName} <bdi dir="ltr">(${effCost}☀)</bdi>:</strong> Click/Drag to empty tile, or click ally to move!`
          : `⚔ <strong>نشر ${dName} <bdi dir="ltr">(${effCost}☀)</bdi>:</strong> انقر أو اسحب لمربع فارغ، أو انقر قطعة لتحريكها!`;
        statusPill.className = 'tactical-status-pill mode-deploy';
      }
    }

    this.updateInspectorPanel();

    const shovelBtn = document.getElementById('shovelBtn');
    if (shovelBtn) shovelBtn.classList.toggle('active', this.shovelMode);

    setTxt('speedBtnText', `${this.gameSpeed}x`);

    const autoBtn = document.getElementById('autoManaBtn');
    if (autoBtn) {
      autoBtn.classList.toggle('active', this.autoCollectMana);
    }
    const autoTxtEl = document.getElementById('autoManaText');
    if (autoTxtEl) {
      autoTxtEl.innerHTML = isEn
        ? `Auto: <bdi dir="ltr">${this.autoCollectMana ? 'ON' : 'OFF'}</bdi>`
        : `تلقائي: <bdi dir="ltr">${this.autoCollectMana ? 'ON' : 'OFF'}</bdi>`;
    }

    const pauseSvg = document.getElementById('pauseBtnSvg');
    if (pauseSvg) {
      pauseSvg.innerHTML = this.paused
        ? '<polygon points="6 4 20 12 6 20 6 4"/>'
        : '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    }

    // Synchronize Royal Command Menu Telemetry, Hero Economy Pulse & Settings Cards
    setTxt(
      'menuHeroProgressPill',
      isEn
        ? `Act ${this.actIndex + 1} of ${window.CHESS_DATA.ACTS.length} • ${this.currentAct.code}`
        : `الفصل ${this.actIndex + 1} من ${window.CHESS_DATA.ACTS.length} • ${this.currentAct.code}`
    );
    const chalicesCount = this.countPiecesOfType('chalice');
    const skyRatePer10s =
      this.gameMode === 'puzzle'
        ? 0
        : Math.round((25 / (this.currentAct.skyDropInterval || 8.0)) * 10);
    const chaliceRatePer10s = Math.round(chalicesCount * (25 / 8.0) * 10);
    setTxt('menuIncomeRateVal', `+${skyRatePer10s + chaliceRatePer10s}☀ / 10s`);
    const armyVal = this.pieces.reduce((sum, p) => {
      const pDef = window.CHESS_DATA.PIECES[p.type];
      return sum + (pDef ? pDef.cost : 0);
    }, 0);
    setTxt('menuArmyValueVal', `${armyVal}☀`);
    setTxt('menuKillsVal', `⚔ ${this.enemiesKilled || 0}`);

    setTxt('menuEloVal', this.eloRating);
    const rankTitle =
      this.eloRating >= 1700
        ? isEn
          ? 'Grandmaster Sovereign'
          : 'أستاذ دولي كبير'
        : this.eloRating >= 1580
          ? isEn
            ? 'Arch-Marshall'
            : 'قائد الفرسان الملكي'
          : isEn
            ? 'Royal Commander'
            : 'قائد التاج الملكي';
    setTxt('menuRankTitle', rankTitle);
    setTxt('menuActWaveVal', `${this.currentAct.code} • ${Math.max(1, this.waveIndex)}/${totalW}`);
    setTxt('menuActNameSub', this.currentAct.name);
    setTxt('menuSentinelsVal', `♜ ${remainingSentinels} / 5`);
    const forcesEl = document.getElementById('menuForcesVal');
    if (forcesEl) {
      forcesEl.innerHTML = isEn
        ? `<bdi dir="ltr">${this.pieces.length}</bdi> Units • <bdi dir="ltr">${Math.floor(this.mana)}☀</bdi>`
        : `<bdi dir="ltr">${this.pieces.length}</bdi> قطع • <bdi dir="ltr">${Math.floor(this.mana)}☀</bdi>`;
    }

    const readyLines = this.readyPawnLines ? this.readyPawnLines.length : 0;
    setTxt(
      'menuSynergySub',
      readyLines > 0
        ? isEn
          ? `♛ 5-Pawn Line Ready (${readyLines})!`
          : `♛ سطر جنود جاهز للدمج (${readyLines})!`
        : this.batteryLinks.length > 0
          ? isEn
            ? `⚡ Royal Battery Active (${this.batteryLinks.length})`
            : `⚡ بطارية ملكية نشطة (${this.batteryLinks.length})`
          : isEn
            ? 'Tactical Formations Ready'
            : 'الدمج التكتيكي جاهز'
    );

    setTxt('menuSpeedPill', `${this.gameSpeed}x`);
    setTxt('menuAutoManaPill', this.autoCollectMana ? 'AUTO: ON' : 'AUTO: OFF');
    setTxt('menuGridCoordsPill', this.showGridOverlay ? 'GRID: ON' : 'GRID: OFF');

    const isMuted = Boolean(window.RoyalAudio && window.RoyalAudio.muted);
    setTxt('menuAudioPill', isMuted ? 'AUDIO: OFF' : 'AUDIO: ON');
    setTxt('menuAudioIcon', isMuted ? '✕' : '♫');
    const audioSvg = document.getElementById('audioMuteSvg');
    if (audioSvg) {
      audioSvg.innerHTML = isMuted
        ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>'
        : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>';
    }

    const isFs = Boolean(document.fullscreenElement);
    setTxt('menuFullscreenPill', isFs ? 'FULL: ON' : '[F] FULL');

    const toggleCardState = (id, active) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.toggle('is-on', Boolean(active));
        el.setAttribute('aria-pressed', String(Boolean(active)));
      }
    };
    toggleCardState('menuSpeedBtn', this.gameSpeed > 1);
    toggleCardState('menuAutoManaBtn', this.autoCollectMana);
    toggleCardState('menuGridCoordsBtn', this.showGridOverlay);
    toggleCardState('menuAudioBtn', !isMuted);
    toggleCardState('menuFullscreenBtn', isFs);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.royalGame = new RoyalGambitGame();
});
