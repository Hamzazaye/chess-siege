/**
 * CROWN & BLIGHT: THE ROYAL GAMBIT (AAA Balanced Edition)
 * Authentic Chess Piece Definitions, Strategic Counter-Balance, Undead Bestiary & Campaign Acts
 */

const CHESS_PIECES = {
  chalice: {
    id: 'chalice',
    name: 'Sun-Spire Chalice',
    arabicTitle: 'كأس النور الملكي',
    chessTitle: 'Royal Treasury',
    hotkey: '1',
    symbol: '⚱',
    cost: 50,
    cooldown: 2.2,
    moveCooldown: 4.0,
    maxHp: 300,
    attackInterval: 7.5, // produces mana every 7.5s
    manaYield: 30,
    damage: 0,
    accentColor: '#fbbf24',
    secondaryColor: '#f59e0b',
    roleBadge: 'ECONOMY • +15% SPD',
    chessRule: 'Steps 1 Square Any Direction • Grants +15% Attack Speed to Adjacent Pieces',
    description:
      'Sanctified golden reliquary that crystallizes +30 Crown Mana every 7.5s and inspires adjacent Chess Pieces (+15% Attack Speed). Can step 1 square in any direction to evade danger.',
    attackPatternText: 'Generates +30 Sovereign Mana & buffs 8 surrounding squares.',
    movePatternType: 'king_step'
  },

  pawn: {
    id: 'pawn',
    name: 'Phalanx Shield-Pawn',
    arabicTitle: 'الجندي المدرع',
    chessTitle: 'Frontline Shield Pusher',
    hotkey: '2',
    symbol: '♟',
    cost: 60,
    cooldown: 1.5,
    moveCooldown: 3.0,
    maxHp: 640,
    startingShield: 65,
    attackInterval: 2.0,
    damage: 12, // Physical shield push impact only (NEVER shoots lasers or bullets!)
    promoteCost: 125,
    accentColor: '#38bdf8',
    secondaryColor: '#0284c7',
    roleBadge: 'SHIELD PUSH • LINE MERGE → ♛',
    chessRule: 'Pure Shield Pusher (No Lasers/Shots) • Physically Shoves Enemies Back • Align 5 Pawns for Cinematic Queen Merge!',
    description:
      'Frontline Phalanx Defender with 640 HP + 65 Aegis Shield. Never fires lasers or projectiles — physically shoves adjacent enemies backward with its heavy tower shield! Align 5 Pawns in a row or column for a Full-Screen Cinematic Merge into a Sovereign Queen!',
    attackPatternText: 'Physical Shield Push (Repels adjacent enemies) + 5-Pawn Cinematic Merge → Queen.',
    movePatternType: 'pawn_move'
  },

  rook: {
    id: 'rook',
    name: 'Aegis Rook',
    arabicTitle: 'قلعة الحصار',
    chessTitle: 'Orthogonal Bastion',
    hotkey: '3',
    symbol: '♜',
    cost: 125,
    cooldown: 3.8,
    moveCooldown: 4.2,
    maxHp: 1450,
    attackInterval: 2.35,
    damage: 46,
    accentColor: '#fb923c',
    secondaryColor: '#ea580c',
    roleBadge: 'TANK • + CROSS BEAM',
    chessRule: 'Slides Horizontally & Vertically • Fires Piercing Orthogonal Rank + File Beams (5 sq)',
    description:
      'Colossal obsidian-and-bronze fortress wall. Absorbs heavy undead punishment while firing Siege Cannon Beams along its Rank and File (up to 5 squares). Can slide along any unobstructed orthogonal line, crushing foes!',
    attackPatternText: 'Rank + File Orthogonal Cross (+) Siege Beam (5-square range).',
    movePatternType: 'rook_slide'
  },

  knight: {
    id: 'knight',
    name: 'Tempest Knight',
    arabicTitle: 'فارس العاصفة',
    chessTitle: 'L-Jump Storm Lancer',
    hotkey: '4',
    symbol: '♞',
    cost: 150,
    cooldown: 3.5,
    moveCooldown: 2.8,
    maxHp: 620,
    attackInterval: 1.7,
    damage: 54,
    accentColor: '#a855f7',
    secondaryColor: '#7e22ce',
    roleBadge: 'L-STRIKE • ROYAL FORK',
    chessRule: 'Attacks & Leaps to All 8 L-Shaped Squares (±2,±1) • Triggers 1.4x ROYAL FORK on 2+ Targets!',
    description:
      'Calls down Chain Lightning Lances onto all 8 authentic L-shaped Knight squares around itself — striking across adjacent and 2-away lanes! Leaps over any obstacle to a valid L-square with a stunning Thunder Slam.',
    attackPatternText: 'All 8 L-Shaped Knight Squares (±2, ±1 & ±1, ±2). Bypasses 50% shield!',
    movePatternType: 'knight_jump'
  },

  bishop: {
    id: 'bishop',
    name: 'Radiant Bishop',
    arabicTitle: 'فيل الأشعة المقدسة',
    chessTitle: 'Prismatic Sanctifier',
    hotkey: '5',
    symbol: '♝',
    cost: 150,
    cooldown: 3.6,
    moveCooldown: 3.5,
    maxHp: 500,
    attackInterval: 1.9,
    damage: 42,
    accentColor: '#2dd4bf',
    secondaryColor: '#0d9488',
    roleBadge: '4-DIAGONAL • CLEANSE',
    chessRule: 'Fires & Glides Along All 4 Diagonals (X) • Cleanses Hexes • Light Sq = Burn | Dark Sq = Slow',
    description:
      'Projects Prismatic Beams along all 4 Diagonal Rays (up to 4.5 squares), searing undead and healing/cleansing friendly pieces on those diagonals. Light-Square Bishops inflict Solar Burn; Dark-Square Bishops inflict 40% Cryo-Slow!',
    attackPatternText: '4-Way Diagonal X-Rays (4.5 sq) + Ally Heal & Hex Cleanse.',
    movePatternType: 'bishop_slide'
  },

  king: {
    id: 'king',
    name: 'Arcane King',
    arabicTitle: 'الملك القائد',
    chessTitle: 'Sovereign Commander',
    hotkey: '6',
    symbol: '♚',
    cost: 175,
    cooldown: 5.0,
    moveCooldown: 3.5,
    maxHp: 980,
    maxCount: 1, // Only 1 Sovereign King on the board!
    attackInterval: 2.0,
    damage: 62,
    accentColor: '#f43f5e',
    secondaryColor: '#be123c',
    roleBadge: 'MAX 1 • CASTLING AURA',
    chessRule: 'Max 1 on Board • 3×3 Royal Aura (+30% Atk Speed & Armor) • Can CASTLE with aligned Rook!',
    description:
      'Radiates an Imperial Command Aura across all 8 surrounding King squares (+30% Attack Speed & 25% Damage Reduction) while blasting nearby foes. Align with an Aegis Rook to trigger CASTLING — shielding the whole lane!',
    attackPatternText: '3×3 Sovereign Shockwave + Royal Court Buff Aura + Rook Castling.',
    movePatternType: 'king_step'
  },

  queen: {
    id: 'queen',
    name: 'Sovereign Queen',
    arabicTitle: 'الوزير الملكي',
    chessTitle: 'Grand Arbiter of Light',
    hotkey: '7',
    symbol: '♛',
    cost: 300, // Balanced high cost!
    cooldown: 7.5, // Fast strategic deployment cooldown
    moveCooldown: 3.8,
    maxHp: 540, // Glass-cannon royalty — needs protection from Shadow-Knight Assassins!
    maxCount: 2, // Max 2 Queens on the battlefield!
    maxRange: 3.6, // True line-of-sight range (3.5 squares) — must be positioned tactically!
    attackInterval: 1.85,
    damage: 46,
    accentColor: '#facc15',
    secondaryColor: '#eab308',
    roleBadge: 'MAX 2 • 8-WAY LINE (3.5 SQ)',
    chessRule: 'Max 2 Queens • True Line-of-Sight along 8 Rays (3.5-Square Range) • Forms Royal Batteries',
    description:
      'Master of the 8 Starburst Lines (Rank, File & 4 Diagonals within 3.5 squares). Stops at the first enemy per ray (up to 2 rays per volley) — cannot shoot through blockers! Protect her from Shadow-Knight Assassins and Necro-Bishops.',
    attackPatternText: '8-Directional Line-of-Sight Rays (3.5-square range, max 2 rays/volley).',
    movePatternType: 'queen_slide'
  }
};

const UNDEAD_ENEMIES = {
  thrall: {
    id: 'thrall',
    name: 'Shambling Pawn-Thrall',
    title: 'Risen Footman',
    maxHp: 240,
    shieldHp: 0,
    speed: 0.36,
    dps: 38,
    manaDrop: 15,
    score: 50,
    radius: 0.32,
    color: '#84cc16',
    armorColor: '#3f6212',
    description: 'Relentless undead foot soldier that marches down its rank and gnaws through frontline defenders.'
  },

  buckler: {
    id: 'buckler',
    name: 'Ironclad Buckler',
    title: 'Shielded Vanguard',
    maxHp: 290,
    shieldHp: 420, // Heavy frontal shield — requires Diagonal Bishop or Knight L-Strikes!
    speed: 0.29,
    dps: 46,
    manaDrop: 25,
    score: 95,
    radius: 0.36,
    color: '#60a5fa',
    armorColor: '#1e293b',
    description:
      'Carries a heavy dark-iron tower shield that absorbs frontal blasts. Diagonal Bishop rays and Knight L-Strikes strike from an angle, bypassing 50% of its shield!'
  },

  sprinter: {
    id: 'sprinter',
    name: 'Plaguevault Stalker',
    title: 'Leaping Undead',
    maxHp: 320,
    shieldHp: 0,
    speed: 0.58,
    postVaultSpeed: 0.35,
    dps: 50,
    manaDrop: 30,
    score: 125,
    radius: 0.34,
    color: '#c084fc',
    armorColor: '#581c87',
    canVault: true,
    description:
      'Charges rapidly down the rank and executes an undead Knight-Vault right over the first Chess Piece in its path (shifting 1 rank diagonally)!'
  },

  assassin: {
    id: 'assassin',
    name: 'Shadow-Knight Assassin',
    title: 'Queen & Backline Hunter',
    maxHp: 360,
    shieldHp: 140,
    speed: 0.54,
    dps: 72, // Lethal against unguarded Queens!
    manaDrop: 35,
    score: 165,
    radius: 0.34,
    color: '#f43f5e',
    armorColor: '#1f122b',
    isAssassin: true,
    description:
      'Cloaked in dark mist (reduces long-range damage from >2.5 squares away by 45%). Specifically spawns in lanes with a Sovereign Queen or Bishop and leaps in an L-shape to assassinate backline royalty!'
  },

  necro: {
    id: 'necro',
    name: 'Necro-Bishop Acolyte',
    title: 'Queen-Hexing Caster',
    maxHp: 380,
    shieldHp: 160,
    speed: 0.26,
    dps: 42,
    rangedDamage: 34,
    rangedInterval: 2.6,
    manaDrop: 35,
    score: 155,
    radius: 0.35,
    color: '#2dd4bf',
    armorColor: '#115e59',
    isCaster: true,
    description:
      'Dark mirror of the Bishop. Prioritizes firing Cursed Diagonal Hex Bolts at your highest-value piece (especially Queens!), reducing their Attack Speed by 40% for 4s unless cleansed by a Radiant Bishop!'
  },

  imp: {
    id: 'imp',
    name: 'Cursed Blight-Imp',
    title: 'Swarm Fiend',
    maxHp: 145,
    shieldHp: 0,
    speed: 0.66,
    dps: 34,
    manaDrop: 10,
    score: 40,
    radius: 0.24,
    color: '#fb7185',
    armorColor: '#881337',
    description: 'Nimble backline pest spawned by Necro-Bishops or hurled deep into your ranks by Siege Gargantuas.'
  },

  gargantua: {
    id: 'gargantua',
    name: 'Fallen Rook Gargantua',
    title: 'Colossus of Ruin',
    maxHp: 2650,
    shieldHp: 850,
    speed: 0.18,
    dps: 165,
    manaDrop: 90,
    score: 650,
    radius: 0.46,
    color: '#f97316',
    armorColor: '#431407',
    isBoss: true,
    description:
      'Towering siege monstrosity wielding a shattered obsidian Rook monolith. Projects an Anti-Beam Shroud (reducing distant sniper damage by 40%), hurls Blight-Imps into your back ranks, and demands coordinated Chess Combos!'
  }
};

const CAMPAIGN_ACTS = [
  {
    id: 1,
    code: 'ACT I',
    name: 'The Courtyard Breach',
    subtitle: 'Sunlit Ivory & Obsidian Bastion',
    difficulty: 'Tactical Initiate',
    startingMana: 150,
    skyDropInterval: 6.8,
    boardTheme: {
      lightSquare: 'rgba(54, 64, 96, 0.72)',
      darkSquare: 'rgba(18, 23, 38, 0.80)',
      borderGold: '#d4af37',
      ambientGlow: 'rgba(56, 189, 248, 0.12)'
    },
    description:
      'The Undead Blight approaches the Outer Royal Courtyard. Establish your Sun-Spire Chalices, form a Vanguard Pawn phalanx, and intercept Shadow-Knight Assassins before they reach your backline.',
    totalWaves: 6,
    waves: [
      { label: 'Scout Skirmish', isFlag: false, spawns: [{ type: 'thrall', count: 4, interval: 3.8 }] },
      { label: 'Shielded Advance', isFlag: false, spawns: [{ type: 'thrall', count: 4, interval: 3.0 }, { type: 'buckler', count: 3, interval: 3.8 }] },
      { label: 'FIRST GRAND WAVE', isFlag: true, spawns: [{ type: 'thrall', count: 6, interval: 2.0 }, { type: 'buckler', count: 4, interval: 2.6 }, { type: 'sprinter', count: 2, interval: 3.0 }] },
      { label: 'Leaping Stalkers', isFlag: false, spawns: [{ type: 'buckler', count: 4, interval: 3.0 }, { type: 'sprinter', count: 4, interval: 2.6 }, { type: 'assassin', count: 2, interval: 3.5 }] },
      { label: 'Royal Ambush', isFlag: false, spawns: [{ type: 'assassin', count: 3, interval: 2.6 }, { type: 'necro', count: 2, interval: 3.2 }, { type: 'buckler', count: 4, interval: 2.6 }] },
      { label: 'FINAL COURTYARD SIEGE', isFlag: true, spawns: [{ type: 'gargantua', count: 1, interval: 4.0 }, { type: 'assassin', count: 3, interval: 2.2 }, { type: 'buckler', count: 5, interval: 2.0 }, { type: 'sprinter', count: 4, interval: 2.2 }] }
    ]
  },
  {
    id: 2,
    code: 'ACT II',
    name: 'Diagonal Eclipse',
    subtitle: 'Twilight Prismatic Cathedral',
    difficulty: 'Knight & Bishop Mastery',
    startingMana: 175,
    skyDropInterval: 7.0,
    boardTheme: {
      lightSquare: 'rgba(58, 48, 92, 0.72)',
      darkSquare: 'rgba(20, 16, 38, 0.82)',
      borderGold: '#2dd4bf',
      ambientGlow: 'rgba(168, 85, 247, 0.15)'
    },
    description:
      'Shadow-Knight Assassins and Necro-Bishop Acolytes hunt unguarded Queens! Use Radiant Bishops to cleanse Hexes and Tempest Knights to execute devastating L-Forks.',
    totalWaves: 7,
    waves: [
      { label: 'Twilight Recon', isFlag: false, spawns: [{ type: 'thrall', count: 5, interval: 2.8 }, { type: 'sprinter', count: 3, interval: 3.2 }] },
      { label: 'Hexed Diagonals', isFlag: false, spawns: [{ type: 'buckler', count: 4, interval: 2.8 }, { type: 'necro', count: 3, interval: 3.4 }] },
      { label: 'ECLIPSE GRAND WAVE', isFlag: true, spawns: [{ type: 'assassin', count: 4, interval: 2.2 }, { type: 'sprinter', count: 5, interval: 2.0 }, { type: 'buckler', count: 4, interval: 2.4 }, { type: 'necro', count: 3, interval: 3.0 }] },
      { label: 'Queen Hunters', isFlag: false, spawns: [{ type: 'assassin', count: 5, interval: 2.0 }, { type: 'imp', count: 6, interval: 1.4 }, { type: 'necro', count: 3, interval: 2.8 }] },
      { label: 'Iron Phalanx', isFlag: false, spawns: [{ type: 'buckler', count: 7, interval: 2.0 }, { type: 'sprinter', count: 5, interval: 2.2 }] },
      { label: 'Covenant Assault', isFlag: false, spawns: [{ type: 'necro', count: 5, interval: 2.4 }, { type: 'assassin', count: 4, interval: 2.2 }, { type: 'buckler', count: 5, interval: 2.0 }] },
      { label: 'CATHEDRAL CLIMAX', isFlag: true, spawns: [{ type: 'gargantua', count: 2, interval: 4.5 }, { type: 'assassin', count: 4, interval: 2.0 }, { type: 'necro', count: 4, interval: 2.4 }, { type: 'sprinter', count: 5, interval: 1.8 }] }
    ]
  },
  {
    id: 3,
    code: 'ACT III',
    name: 'The Twin Citadels',
    subtitle: 'Storm-Lit Royal Keep',
    difficulty: 'Royal Battery & Castling',
    startingMana: 200,
    skyDropInterval: 7.0,
    boardTheme: {
      lightSquare: 'rgba(64, 44, 78, 0.72)',
      darkSquare: 'rgba(22, 14, 32, 0.82)',
      borderGold: '#f59e0b',
      ambientGlow: 'rgba(244, 63, 94, 0.15)'
    },
    description:
      'Fallen Rook Gargantuas lead the charge! Align Sovereign Queens with Rooks and Bishops to form +30% Damage Royal Batteries, and use Arcane King Castling to shield endangered lanes.',
    totalWaves: 8,
    waves: [
      { label: 'Storm Vanguard', isFlag: false, spawns: [{ type: 'buckler', count: 5, interval: 2.4 }, { type: 'sprinter', count: 4, interval: 2.6 }] },
      { label: 'Dark Bishop Synod', isFlag: false, spawns: [{ type: 'necro', count: 5, interval: 2.4 }, { type: 'assassin', count: 4, interval: 2.4 }] },
      { label: 'FIRST CITADEL BREACH', isFlag: true, spawns: [{ type: 'gargantua', count: 1, interval: 3.8 }, { type: 'assassin', count: 4, interval: 2.0 }, { type: 'buckler', count: 6, interval: 2.0 }] },
      { label: 'Swarm Blitz', isFlag: false, spawns: [{ type: 'imp', count: 10, interval: 1.1 }, { type: 'sprinter', count: 6, interval: 1.8 }] },
      { label: 'Armored Column', isFlag: false, spawns: [{ type: 'buckler', count: 8, interval: 1.8 }, { type: 'necro', count: 4, interval: 2.4 }] },
      { label: 'Twin Monoliths', isFlag: true, spawns: [{ type: 'gargantua', count: 2, interval: 4.5 }, { type: 'assassin', count: 5, interval: 1.8 }, { type: 'necro', count: 4, interval: 2.2 }] },
      { label: 'Relentless Tide', isFlag: false, spawns: [{ type: 'sprinter', count: 7, interval: 1.6 }, { type: 'buckler', count: 7, interval: 1.8 }, { type: 'assassin', count: 5, interval: 1.8 }] },
      { label: 'THE SOVEREIGN STAND', isFlag: true, spawns: [{ type: 'gargantua', count: 3, interval: 3.8 }, { type: 'assassin', count: 6, interval: 1.6 }, { type: 'necro', count: 5, interval: 2.0 }, { type: 'buckler', count: 6, interval: 1.6 }] }
    ]
  },
  {
    id: 4,
    code: 'ACT IV',
    name: "Grandmaster's Gauntlet",
    subtitle: 'Blood-Moon Sovereign Throne',
    difficulty: 'Grandmaster (2400 ELO)',
    startingMana: 250,
    skyDropInterval: 6.8,
    boardTheme: {
      lightSquare: 'rgba(72, 38, 48, 0.72)',
      darkSquare: 'rgba(26, 12, 18, 0.82)',
      borderGold: '#fb7185',
      ambientGlow: 'rgba(249, 115, 22, 0.16)'
    },
    description:
      'High-tempo Grandmaster blitz! The Undead Horde attacks across all 5 Ranks simultaneously with Shadow-Knight Assassins and Fallen Rook Gargantuas. Reposition your pieces constantly!',
    totalWaves: 8,
    waves: [
      { label: 'Opening Blitz', isFlag: false, spawns: [{ type: 'sprinter', count: 6, interval: 1.9 }, { type: 'assassin', count: 4, interval: 2.0 }] },
      { label: 'Sacrificial Gambit', isFlag: false, spawns: [{ type: 'necro', count: 5, interval: 2.0 }, { type: 'buckler', count: 6, interval: 1.8 }] },
      { label: 'BLOOD MOON WAVE I', isFlag: true, spawns: [{ type: 'gargantua', count: 2, interval: 3.6 }, { type: 'assassin', count: 6, interval: 1.6 }, { type: 'buckler', count: 6, interval: 1.7 }] },
      { label: 'Knightmare Stampede', isFlag: false, spawns: [{ type: 'sprinter', count: 9, interval: 1.3 }, { type: 'assassin', count: 6, interval: 1.6 }] },
      { label: 'Obsidian Wall', isFlag: false, spawns: [{ type: 'gargantua', count: 2, interval: 4.0 }, { type: 'buckler', count: 9, interval: 1.5 }] },
      { label: 'BLOOD MOON WAVE II', isFlag: true, spawns: [{ type: 'gargantua', count: 3, interval: 3.8 }, { type: 'necro', count: 6, interval: 1.8 }, { type: 'assassin', count: 6, interval: 1.5 }] },
      { label: 'Endgame Pressure', isFlag: false, spawns: [{ type: 'sprinter', count: 8, interval: 1.4 }, { type: 'buckler', count: 8, interval: 1.4 }, { type: 'necro', count: 6, interval: 1.8 }] },
      { label: 'GRANDMASTER CHECKMATE SIEGE', isFlag: true, spawns: [{ type: 'gargantua', count: 4, interval: 3.2 }, { type: 'assassin', count: 8, interval: 1.4 }, { type: 'necro', count: 6, interval: 1.6 }, { type: 'buckler', count: 8, interval: 1.4 }] }
    ]
  },
  {
    id: 5,
    code: 'ACT V',
    name: 'Endless Immortal Gambit',
    subtitle: 'Infinite Astral Chessboard',
    difficulty: 'Infinite Escalation',
    startingMana: 225,
    skyDropInterval: 6.5,
    isEndless: true,
    boardTheme: {
      lightSquare: 'rgba(42, 56, 94, 0.72)',
      darkSquare: 'rgba(16, 22, 42, 0.82)',
      borderGold: '#38bdf8',
      ambientGlow: 'rgba(56, 189, 248, 0.18)'
    },
    description:
      'Infinite dynamically generated waves that scale your Grandmaster ELO rating skyward! Test how many waves your Royal Chess formation can endure.',
    totalWaves: 999,
    waves: []
  }
];

const CHESS_TIPS = [
  'PAWN-LINE MERGE (دمج سطر الجنود): Align 5 Phalanx Pawns in the same column or row, then click the Golden Crown [M] to fuse them into a Sovereign Queen!',
  'PHALANX DEFENDER: The Phalanx Pawn does not shoot projectiles — it holds the line with 1,150 HP, regenerating Aegis shields, and close-quarters shield bashes!',
  'BALANCE NOTE: Sovereign Queens require true Line-of-Sight within 3.5 squares and are hunted by Shadow-Knight Assassins!',
  'ROYAL BATTERY: Align an Aegis Rook, Radiant Bishop, or Sovereign Queen on the same line for a +30% Damage Golden Battery!',
  'HEX CLEANSE: Necro-Bishops curse your highest-cost pieces (-40% speed). Place a Radiant Bishop on their diagonal to cleanse them!',
  'CASTLING: Place an Arcane King and Aegis Rook in the same Rank or Column, then click CASTLE to swap them and shield the entire lane!'
];

window.CHESS_DATA = {
  PIECES: CHESS_PIECES,
  ENEMIES: UNDEAD_ENEMIES,
  ACTS: CAMPAIGN_ACTS,
  TIPS: CHESS_TIPS
};
