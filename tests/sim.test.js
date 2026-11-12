const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CHESS_DATA = require(path.join(ROOT, 'js', 'data.js'));

function runTests() {
  let passed = 0;
  const check = (name, fn) => {
    fn();
    passed++;
    console.log(`✓ ${name}`);
  };

  // 1. Asset Integrity, Crest Compression & PWA Manifest / Service Worker
  check('Assets, optimized royal-crest.png (<250 KB), manifest.json & sw.js verified', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const spritesJs = fs.readFileSync(path.join(ROOT, 'js', 'sprites.js'), 'utf8');
    const matches = [...(html + '\n' + spritesJs).matchAll(/['"](assets\/[^'"]+)['"]/g)];
    assert.ok(matches.length >= 2, 'Expected asset paths to be referenced');
    assert.equal(html.includes('crest.jpg'), false, 'Broken crest.jpg reference must be removed');
    for (const m of matches) {
      const fullPath = path.join(ROOT, m[1]);
      assert.ok(fs.existsSync(fullPath), `Missing asset file: ${m[1]}`);
    }

    const crestStat = fs.statSync(path.join(ROOT, 'assets', 'royal-crest.png'));
    assert.ok(
      crestStat.size < 250 * 1024,
      `royal-crest.png should be optimized below 250 KB (got ${crestStat.size} bytes)`
    );

    const manifestRaw = fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8');
    const manifest = JSON.parse(manifestRaw);
    assert.equal(manifest.display, 'standalone');
    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 1);
    assert.ok(fs.existsSync(path.join(ROOT, 'sw.js')), 'sw.js Service Worker must exist');
  });

  // 2. Balance & DPS Integrity
  check('Piece DPS hierarchy & roster counts (7 Pieces, 8 Enemies, 5 Acts)', () => {
    assert.equal(Object.keys(CHESS_DATA.PIECES).length, 7);
    assert.equal(Object.keys(CHESS_DATA.ENEMIES).length, 8);
    assert.equal(CHESS_DATA.ACTS.length, 5);

    const rook = CHESS_DATA.PIECES.rook;
    const queen = CHESS_DATA.PIECES.queen;
    const rookDps = rook.damage / rook.attackInterval;
    const queenSingleRayDps = queen.damage / queen.attackInterval;
    assert.ok(
      queenSingleRayDps > rookDps,
      `Queen single-ray DPS (${queenSingleRayDps.toFixed(1)}) must exceed Rook (${rookDps.toFixed(1)})`
    );
    assert.ok(queen.maxRange >= 4.5, 'Queen range should cover >= 4.5 squares');
    assert.equal(CHESS_DATA.PIECES.pawn.damage, 14, 'Pawn base melee shield-push damage');
  });

  // 3. Signature Boss Integration across Campaign, Endless & Codex
  check('Blight Sovereign Queen boss wired across Campaign, Endless, Sprites & Codex', () => {
    const pq = CHESS_DATA.ENEMIES.plague_queen;
    assert.ok(pq && pq.isBoss && pq.isTeleportBoss, 'plague_queen must have boss flags');

    const actsWithBoss = CHESS_DATA.ACTS.filter(act =>
      (act.waves || []).some(w => w.spawns.some(s => s.type === 'plague_queen'))
    );
    assert.ok(actsWithBoss.length >= 2, 'plague_queen must appear in at least 2 campaign acts');

    const spritesJs = fs.readFileSync(path.join(ROOT, 'js', 'sprites.js'), 'utf8');
    const gameJs = fs.readFileSync(path.join(ROOT, 'js', 'game.js'), 'utf8');
    assert.ok(spritesJs.includes('plague_queen:'), 'plague_queen SVG missing in sprites.js');

    const endlessMatch = gameJs.match(/generateEndlessWave\(waveNum\)\s*\{([\s\S]*?)^\s{2}\}/m);
    assert.ok(endlessMatch && endlessMatch[1].includes('plague_queen'), 'plague_queen must spawn in Endless Act V');

    const codexMatch = gameJs.match(/populateCodexModal\(\)\s*\{([\s\S]*?)^\s{2}\}/m);
    assert.ok(codexMatch && codexMatch[1].includes('plague_queen:'), 'plague_queen metadata must exist in Codex');
  });

  // 4. v4.0 Buildcraft: Commanders, Doctrines, Ascensions, Achievements, 20 Decrees & 5 Deterministic Puzzles
  check('v4.0 Commanders (3), Doctrines (3), Ascensions (6), Achievements (10), Decrees (20) & Puzzles (5)', () => {
    assert.equal(Object.keys(CHESS_DATA.COMMANDERS).length, 3);
    assert.equal(Object.keys(CHESS_DATA.DOCTRINES).length, 3);
    assert.equal(CHESS_DATA.ASCENSIONS.length, 6);
    assert.equal(CHESS_DATA.ACHIEVEMENTS.length, 10);
    assert.equal(CHESS_DATA.DECREES.length, 20);
    assert.equal(CHESS_DATA.PUZZLES.length, 5);
    assert.equal(CHESS_DATA.TIPS.length, CHESS_DATA.TIPS_EN.length);

    // Every puzzle spawn must define deterministic fixedRows matching count
    for (const pz of CHESS_DATA.PUZZLES) {
      for (const w of pz.waves) {
        for (const s of w.spawns) {
          assert.ok(
            Array.isArray(s.fixedRows) && s.fixedRows.length >= s.count,
            `Puzzle ${pz.id} spawn ${s.type} must define deterministic fixedRows`
          );
        }
      }
    }

    // Execute every Decree's apply() function safely against a mock state + mock game
    const mockState = {
      damageMult: 1, atkSpeedMult: 1, chaliceRateMult: 1, moveCdMult: 1,
      pawnKnockbackMult: 1, knightDmgMult: 1, knightStun: false, knightChain: false,
      casterDmgMult: 1, bonusHeal: 0, rookDmgMult: 1, rookExecuteThreshold: 0,
      batteryBonus: 0, killManaBonus: 0, promoteCost: 125, queenDmgMult: 1,
      queenBonusRange: 0, queenSupernova: false, enPassantSlash: false,
      kingAuraExpanded: false, kingRegenPerSec: 0, chaliceShieldPulse: 0,
      twinPrisms: false, sacrificeRefundBonus: 0, sacrificeBlastBonus: 0,
      compoundInterestCap: 0, cursedEnemyHpMult: 1, cursedPawnHpMult: 1,
      shatterShrapnel: false
    };
    const mockGame = {
      mana: 100,
      totalManaEarned: 100,
      pieces: [{ type: 'pawn', hp: 500, maxHp: 640, shieldHp: 0 }],
      chariots: [
        { row: 0, active: false, used: true, x: 200 },
        { row: 1, active: false, used: false, x: -20 }
      ],
      renderer: { chariotX: -20 }
    };
    for (const d of CHESS_DATA.DECREES) {
      assert.doesNotThrow(() => d.apply(mockState, mockGame), `Decree ${d.id} threw`);
    }
    assert.ok(mockGame.pieces[0].shieldHp >= 160, 'phalanx_steel must add shieldHp');
    assert.equal(mockState.enPassant, true, 'en_passant decree flag must activate');
    assert.equal(mockState.kingExpandedAura, true, 'imperial_guard decree flag must activate');
    assert.ok(mockState.queenBonusRange >= 1.0, 'starlight_nova decree range must activate');
  });

  // 5. Bilingual AR/EN Parity & DOM ID Sync
  check('100% AR/EN I18N key parity & applyLanguage() DOM target IDs exist in index.html', () => {
    const arKeys = Object.keys(CHESS_DATA.I18N.ar).sort();
    const enKeys = Object.keys(CHESS_DATA.I18N.en).sort();
    assert.deepEqual(arKeys, enKeys, 'I18N keys must match identically between ar and en');

    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const gameJs = fs.readFileSync(path.join(ROOT, 'js', 'game.js'), 'utf8');
    const swapIds = [...gameJs.matchAll(/swap\(\s*'([^']+)'/g)].map(m => m[1]);
    assert.ok(swapIds.length >= 30, 'Expected >= 30 localized swap IDs');
    for (const id of swapIds) {
      assert.ok(html.includes(`id="${id}"`), `Missing localized element id="${id}" in index.html`);
    }
  });

  // 6. Critical Engine & Chess Rules Regression Checks
  check('Unobstructed Castling, moveCdMult, Seeded RNG, Progressive Unlocks & Renderer guards', () => {
    const gameJs = fs.readFileSync(path.join(ROOT, 'js', 'game.js'), 'utf8');
    const rendererJs = fs.readFileSync(path.join(ROOT, 'js', 'renderer.js'), 'utf8');

    // Unobstructed Castling check
    assert.ok(gameJs.includes('isCastlingPathClear('), 'Unobstructed castling helper must exist');
    assert.ok(
      gameJs.includes('this.isCastlingPathClear(piece, other)'),
      'King castling branch must enforce clear path via isCastlingPathClear'
    );

    // moveCdMult wired in executeChessMove
    const execMatch = gameJs.match(/executeChessMove\(piece,\s*move\)\s*\{([\s\S]*?)^\s{2}\}/m);
    assert.ok(execMatch && execMatch[1].includes('moveCdMult'), 'executeChessMove must apply decreeState.moveCdMult');

    // Seeded Mulberry32 PRNG + deterministic decree shuffle
    assert.ok(gameJs.includes('initSeededRng('), 'Seeded RNG must exist for Daily Siege & Puzzles');
    const decreeMatch = gameJs.match(/openDecreeDraft\(\)\s*\{([\s\S]*?)^\s{2}\}/m);
    assert.ok(decreeMatch && !decreeMatch[1].includes('Math.random()'), 'openDecreeDraft must use seeded this.rand()');

    // Progressive Act Unlocking & Sentinel-free Puzzles
    assert.ok(gameJs.includes('unlockedActs: 1'), 'Fresh profile starts at Act I unlocked');
    assert.ok(gameJs.includes('used: sentinelsDisabled'), 'Checkmate Puzzles must disable back-rank Sentinels');

    // Gamepad & Keyboard Cursor
    assert.ok(gameJs.includes('pollGamepad('), 'HTML5 Gamepad polling must be active');

    // Zero per-frame ctx.filter assignments in renderer.js
    assert.equal(/ctx\.filter\s*=/.test(rendererJs), false, 'Slow per-frame ctx.filter must be eliminated');
    assert.ok(rendererJs.includes('drawFloorDecals(') && rendererJs.includes('drawTelegraphZones('));
  });

  console.log(`\nAll ${passed} v4.0 Commercial Edition integrity & simulation tests passed cleanly.`);
}

runTests();
