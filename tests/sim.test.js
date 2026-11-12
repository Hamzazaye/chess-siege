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

  // 1. Asset Integrity: every assets/... path referenced in index.html & js must exist on disk
  check('All referenced assets exist on disk (no broken crest.jpg)', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const spritesJs = fs.readFileSync(path.join(ROOT, 'js', 'sprites.js'), 'utf8');
    const matches = [...(html + '\n' + spritesJs).matchAll(/['"](assets\/[^'"]+)['"]/g)];
    assert.ok(matches.length >= 2, 'Expected asset paths to be referenced');
    assert.equal(html.includes('crest.jpg'), false, 'Broken crest.jpg reference must be removed');
    for (const m of matches) {
      const fullPath = path.join(ROOT, m[1]);
      assert.ok(fs.existsSync(fullPath), `Missing asset file: ${m[1]}`);
    }
  });

  // 2. Balance & DPS Integrity: Queen single-ray & multi-ray DPS beats Rook; Knight/Queen/Pawn rules coherent
  check('Piece DPS hierarchy & balance (Queen > Rook)', () => {
    const rook = CHESS_DATA.PIECES.rook;
    const queen = CHESS_DATA.PIECES.queen;
    const rookDps = rook.damage / rook.attackInterval;
    const queenSingleRayDps = queen.damage / queen.attackInterval;
    assert.ok(
      queenSingleRayDps > rookDps,
      `Queen single-ray DPS (${queenSingleRayDps.toFixed(1)}) must exceed Rook (${rookDps.toFixed(1)})`
    );
    assert.ok(queen.maxRange >= 4.5, 'Queen range should cover >= 4.5 squares');
    assert.equal(CHESS_DATA.PIECES.pawn.damage, 14, 'Pawn remains melee shield-push damage');
  });

  // 3. New Signature Boss & Act Wave Integration
  check('Blight Sovereign Queen boss defined & scheduled in Campaign Acts', () => {
    const pq = CHESS_DATA.ENEMIES.plague_queen;
    assert.ok(pq, 'plague_queen enemy missing');
    assert.ok(pq.isBoss && pq.isTeleportBoss, 'plague_queen must have boss flags');
    const actsWithBoss = CHESS_DATA.ACTS.filter(act =>
      (act.waves || []).some(w => w.spawns.some(s => s.type === 'plague_queen'))
    );
    assert.ok(actsWithBoss.length >= 2, 'plague_queen must appear in at least 2 campaign acts');

    const spritesJs = fs.readFileSync(path.join(ROOT, 'js', 'sprites.js'), 'utf8');
    assert.ok(spritesJs.includes('plague_queen:'), 'plague_queen SVG missing in sprites.js');
    assert.ok(spritesJs.includes('bakeEnemyTints('), 'Pre-baked tint cache missing in sprites.js');
  });

  // 4. Commanders, Decrees, Puzzles & Bilingual AR/EN parity
  check('Commanders, Decrees, Puzzles, and AR/EN I18N completeness', () => {
    assert.equal(Object.keys(CHESS_DATA.COMMANDERS).length, 3);
    assert.equal(CHESS_DATA.DECREES.length, 10);
    assert.equal(CHESS_DATA.PUZZLES.length, 3);
    assert.equal(CHESS_DATA.TIPS.length, CHESS_DATA.TIPS_EN.length);

    const arKeys = Object.keys(CHESS_DATA.I18N.ar).sort();
    const enKeys = Object.keys(CHESS_DATA.I18N.en).sort();
    assert.deepEqual(arKeys, enKeys, 'I18N keys must match identically between ar and en');

    // Run every Decree's apply() function safely against a mock state + mock game
    const mockState = {
      damageMult: 1, atkSpeedMult: 1, chaliceRateMult: 1, moveCdMult: 1,
      pawnKnockbackMult: 1, knightDmgMult: 1, knightStun: false, casterDmgMult: 1,
      bonusHeal: 0, rookDmgMult: 1, rookExecuteThreshold: 0, batteryBonus: 0,
      killManaBonus: 0, promoteCost: 125, queenDmgMult: 1
    };
    const mockGame = {
      mana: 100,
      totalManaEarned: 100,
      pieces: [{ hp: 100, maxHp: 500, shieldHp: 0 }],
      chariots: [{ row: 0, active: false, used: true, x: 200 }],
      renderer: { chariotX: -20 }
    };
    for (const d of CHESS_DATA.DECREES) {
      assert.doesNotThrow(() => d.apply(mockState, mockGame), `Decree ${d.id} threw`);
    }
    assert.ok(mockGame.pieces[0].shieldHp >= 160, 'phalanx_steel must add shieldHp');
    assert.equal(mockGame.chariots[0].used, false, 'bastion_repair must restore used chariot');
    assert.ok(mockState.damageMult > 1 && mockState.queenDmgMult > 1);
  });

  // 5. Critical Engine Regression Checks on js/game.js & js/renderer.js
  check('Critical gameplay bug fixes & performance guards verified in engine source', () => {
    const gameJs = fs.readFileSync(path.join(ROOT, 'js', 'game.js'), 'utf8');
    const rendererJs = fs.readFileSync(path.join(ROOT, 'js', 'renderer.js'), 'utf8');

    // 100-XP Pawn movement lockout fix: handleBoardClick must NOT call tryPromotePawn
    const boardClickMatch = gameJs.match(/handleBoardClick\(col, row\)\s*\{([\s\S]*?)^\s{2}\}/m);
    assert.ok(boardClickMatch, 'handleBoardClick method found');
    assert.equal(
      boardClickMatch[1].includes('tryPromotePawn'),
      false,
      '100-XP Pawns must remain selectable for movement instead of auto-promoting on click'
    );

    // Max-Queen 5-Pawn merge guard
    assert.ok(
      gameJs.includes('const canMergeQueen = this.countPiecesOfType(\'queen\') < queenMax'),
      '5-Pawn merge highlight must respect Queen cap'
    );

    // Early Wave call treasury conservation
    const earlyMatch = gameJs.match(/callNextWaveEarly\(\)\s*\{([\s\S]*?)^\s{2}\}/m);
    assert.ok(earlyMatch && earlyMatch[1].includes('waveClearRewarded'), 'Early wave call preserves treasury reward');

    // Zero per-frame ctx.filter assignments in renderer.js
    assert.equal(/ctx\.filter\s*=/.test(rendererJs), false, 'Slow per-frame ctx.filter must be eliminated');
    assert.ok(rendererJs.includes('enemyFlashSprites'), 'Renderer must use pre-baked flash sprites');

    // Dirty-check HUD signature
    assert.ok(gameJs.includes('if (sig === this._lastHudSig) return;'), 'HUD updates must be dirty-checked');
  });

  console.log(`\nAll ${passed} AAA integrity & simulation tests passed cleanly.`);
}

runTests();
