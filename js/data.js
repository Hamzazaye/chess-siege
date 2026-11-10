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
    cooldown: 3.5,
    moveCooldown: 4.0,
    maxHp: 320,
    maxCount: 6,
    attackInterval: 8.0, // Balanced: produces +25 mana every 8.0s (+30 when buffed)
    manaYield: 25,
    damage: 0,
    accentColor: '#fbbf24',
    secondaryColor: '#f59e0b',
    roleBadge: 'ECONOMY • +15% SPD',
    chessRule: 'Steps 1 Square Any Direction • Produces +25☀ Every 8s & Grants +15% Attack Speed to Adjacent Pieces',
    description:
      'Sanctified golden reliquary that crystallizes +25 Crown Mana every 8.0s (+30☀ when inspired by the King) and buffs adjacent Chess Pieces (+15% Attack Speed). Max 6 on the board.',
    attackPatternText: 'Generates +25 Sovereign Mana & buffs 8 surrounding squares.',
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
    cooldown: 2.2,
    moveCooldown: 3.0,
    maxHp: 640,
    startingShield: 65,
    attackInterval: 2.35, // Balanced interval so a single Pawn cannot infinite-stall a lane alone
    damage: 14, // Physical shield push impact only (NEVER shoots lasers or bullets!)
    promoteCost: 125,
    accentColor: '#38bdf8',
    secondaryColor: '#0284c7',
    roleBadge: 'SHIELD PUSH • LINE MERGE → ♛',
    chessRule: 'Pure Shield Pusher (No Lasers/Shots) • Repels Foes & Regenerates Shield in Pawn Chains • Align 5 Pawns to Merge → ♛!',
    description:
      'Frontline Phalanx Defender with 640 HP + 65 Aegis Shield. Never fires lasers or projectiles — physically shoves adjacent enemies backward with its tower shield! Align 5 Pawns in a row or column for a Full-Screen Cinematic Merge into an Ascended Sovereign Queen!',
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
    cooldown: 4.5,
    moveCooldown: 4.2,
    maxHp: 1280,
    startingShield: 60,
    attackInterval: 2.25,
    damage: 48,
    accentColor: '#fb923c',
    secondaryColor: '#ea580c',
    roleBadge: 'TANK • + CROSS BEAM',
    chessRule: 'Slides Horizontally & Vertically • Fires Piercing Orthogonal Rank + File Beams (5.5 sq)',
    description:
      'Colossal obsidian-and-bronze fortress wall (1,280 HP + 60 Shield). Absorbs heavy undead punishment while firing Siege Cannon Beams along its Rank and File (up to 5.5 squares). Can slide orthogonally or Castle with the King!',
    attackPatternText: 'Rank + File Orthogonal Cross (+) Siege Beam (5.5-square range).',
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
    cooldown: 4.2,
    moveCooldown: 2.8,
    maxHp: 580,
    startingShield: 40,
    attackInterval: 1.65,
    damage: 56,
    accentColor: '#a855f7',
    secondaryColor: '#7e22ce',
    roleBadge: 'L-STRIKE • ROYAL FORK',
    chessRule: 'Attacks & Leaps to All 8 L-Shaped Squares (±2,±1) • Triggers 1.4x ROYAL FORK on 2+ Targets!',
    description:
      'Calls down Chain Lightning Lances onto all 8 authentic L-shaped Knight squares around itself — striking across adjacent and 2-away lanes! Bypasses 50% of enemy shields and leaps over obstacles with a stunning Thunder Slam.',
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
    cooldown: 4.2,
    moveCooldown: 3.5,
    maxHp: 480,
    startingShield: 45,
    attackInterval: 1.85,
    damage: 44,
    accentColor: '#2dd4bf',
    secondaryColor: '#0d9488',
    roleBadge: '4-DIAGONAL • CLEANSE',
    chessRule: 'Fires & Glides Along All 4 Diagonals (X) • Cleanses Hexes & Heals Allies • Light Sq = Burn | Dark Sq = Slow',
    description:
      'Projects Prismatic Beams along all 4 Diagonal Rays (up to 4.5 squares), searing undead (bypassing 50% shield) and healing/cleansing friendly pieces on those diagonals. Light-Square Bishops inflict Solar Burn; Dark-Square Bishops inflict 40% Slow!',
    attackPatternText: '4-Way Diagonal X-Rays (4.5 sq) + Ally Heal (+22 HP) & Hex Cleanse.',
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
    cooldown: 6.5,
    moveCooldown: 3.5,
    maxHp: 980,
    startingShield: 120,
    maxCount: 1, // Only 1 Sovereign King on the board!
    attackInterval: 1.95,
    damage: 58,
    accentColor: '#f43f5e',
    secondaryColor: '#be123c',
    roleBadge: 'MAX 1 • CASTLING AURA',
    chessRule: 'Max 1 on Board • 3×3 Royal Aura (+30% Atk Speed & +25% Armor) • Can CASTLE with aligned Rook!',
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
    cost: 300, // Balanced high cost (or fuse 5 Pawns via [M])!
    cooldown: 8.5,
    moveCooldown: 3.6,
    maxHp: 560, // Glass-cannon royalty (Ascended 5-Pawn Merged Queen gets 820 HP + 300 Shield!)
    startingShield: 75,
    maxCount: 2, // Max 2 Queens on the battlefield!
    maxRange: 3.8, // True line-of-sight range (3.8 squares) — must be positioned tactically!
    attackInterval: 1.75,
    damage: 50,
    accentColor: '#facc15',
    secondaryColor: '#eab308',
    roleBadge: 'MAX 2 • 8-WAY LINE (3.8 SQ)',
    chessRule: 'Max 2 Queens • True Line-of-Sight along 8 Rays (3.8-Square Range) • 5-Pawn Merged Queen gains +20% Power!',
    description:
      'Master of the 8 Starburst Lines (Rank, File & 4 Diagonals within 3.8 squares). Stops at the first enemy per ray (up to 2 rays per volley, or 3 when Ascended via 5-Pawn Merge)! Protect her from Shadow-Knight Assassins and Necro-Bishops.',
    attackPatternText: '8-Directional Line-of-Sight Rays (3.8-square range).',
    movePatternType: 'queen_slide'
  }
};

const UNDEAD_ENEMIES = {
  thrall: {
    id: 'thrall',
    name: 'Shambling Pawn-Thrall',
    title: 'Risen Footman',
    maxHp: 230,
    shieldHp: 0,
    speed: 0.36,
    dps: 36,
    manaDrop: 15,
    dropChance: 0.26,
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
    maxHp: 280,
    shieldHp: 390, // Heavy frontal shield — requires Diagonal Bishop or Knight L-Strikes!
    speed: 0.29,
    dps: 44,
    manaDrop: 25,
    dropChance: 0.36,
    score: 95,
    radius: 0.36,
    color: '#60a5fa',
    armorColor: '#1e293b',
    description:
      'Carries a heavy dark-iron tower shield that absorbs frontal blasts and resists Pawn knockback. Diagonal Bishop rays and Knight L-Strikes bypass 50% of its shield!'
  },

  sprinter: {
    id: 'sprinter',
    name: 'Plaguevault Stalker',
    title: 'Leaping Undead',
    maxHp: 300,
    shieldHp: 0,
    speed: 0.56,
    postVaultSpeed: 0.35,
    dps: 48,
    manaDrop: 25,
    dropChance: 0.38,
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
    maxHp: 340,
    shieldHp: 130,
    speed: 0.52,
    dps: 68, // Lethal against unguarded Queens!
    manaDrop: 30,
    dropChance: 0.50,
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
    maxHp: 360,
    shieldHp: 150,
    speed: 0.26,
    dps: 40,
    rangedDamage: 32,
    rangedInterval: 2.7,
    manaDrop: 35,
    dropChance: 0.55,
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
    maxHp: 135,
    shieldHp: 0,
    speed: 0.64,
    dps: 32,
    manaDrop: 15,
    dropChance: 0.22,
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
    maxHp: 2550,
    shieldHp: 800,
    speed: 0.18,
    dps: 155,
    manaDrop: 90,
    dropChance: 1.0,
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
    skyDropInterval: 8.5,
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
    skyDropInterval: 8.2,
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
    skyDropInterval: 7.8,
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
    skyDropInterval: 7.5,
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
    skyDropInterval: 7.2,
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
  'دمج سطر الجنود (PAWN-LINE MERGE): صفّ 5 جنود مدرعين في نفس العمود أو الصف واضغط [M] لدمجهم سينمائياً إلى وزير ملكي متوّج (820 HP + 300🛡)!',
  'الجندي المدافع (PHALANX PAWN): لا يطلق الليزر أو الرصاص — يدفع الوحوش للخلف بدرعه ويستعيد درعه عند الترابط القطري!',
  'البطارية الملكية (ROYAL BATTERY): اصطفاف القلعة أو الفيل أو الوزير على نفس الخط يمنح +30% قوة هجوم إضافية!',
  'تطهير اللعنات (HEX CLEANSE): كاهن الفيل الملعون يبطئ سرعة هجوم أقوى قطعك — ضع فيل الأشعة المقدسة على قطره لتطهيره فوراً!',
  'التبييت الملكي (CASTLING): ضع الملك والقلعة في نفس الصف أو العمود واضغط تبييت لتبادل موقعهما ومنح الصف درعاً ذهبياً شاملاً!',
  'اقتصاد المعركة (ROYAL TREASURY): كل نهاية موجة تمنحك مكافأة خزينة (+20☀ + 5☀ لكل كأس نور)، واستدعاء الموجة مبكراً يمنحك +25☀!'
];

window.CHESS_DATA = {
  PIECES: CHESS_PIECES,
  ENEMIES: UNDEAD_ENEMIES,
  ACTS: CAMPAIGN_ACTS,
  TIPS: CHESS_TIPS
};
