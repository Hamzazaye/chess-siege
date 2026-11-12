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
    attackInterval: 2.0,
    damage: 58,
    accentColor: '#fb923c',
    secondaryColor: '#ea580c',
    roleBadge: 'TANK • + CROSS BEAM',
    roleBadgeAr: 'دبابة • شعاع متعامد',
    chessRule: 'Slides Horizontally & Vertically • Fires Heavy Orthogonal Cross Beams (First Target Per Ray, 5.5 sq)',
    chessRuleAr: 'ينزلق أفقياً وعمودياً • يطلق أشعة حصار متعامدة تصيب أول عدو في كل اتجاه (5.5 مربعات)',
    description:
      'Colossal obsidian-and-bronze fortress wall (1,280 HP + 60 Shield). Absorbs heavy undead punishment while firing Siege Cannon Beams along its Rank and File (stops on first foe in each direction, up to 5.5 sq). Can slide orthogonally or Castle with the King!',
    descriptionAr:
      'قلعة بازلتية وبرونزية ضخمة (1,280 صحة + 60 درع). تصد الهجوم العنيف وتطلق مدافع حصار متعامدة تصيب أول وحش في كل اتجاه حتى 5.5 مربعات. يمكنها التبييت مع الملك!',
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
    maxRange: 4.6, // True line-of-sight range (4.6 squares) — commanding multi-ray sweep!
    attackInterval: 1.35,
    damage: 72,
    accentColor: '#f5d061',
    secondaryColor: '#b45309',
    roleBadge: 'MAX 2 • 3-RAY CROWN LASER',
    roleBadgeAr: 'الحد 2 • 3 أشعة ملكية',
    chessRule: 'Max 2 on Board • Fires 3 True Line-of-Sight Star Rays (4 Rays when Ascended) within 4.6 sq',
    chessRuleAr: 'الحد الأقصى 2 • تطلق 3 أشعة نجمية بخط رؤية حقيقي (4 عند الدمج المتوّج) بمدى 4.6 مربعات',
    description:
      'Supreme Sovereign (Max 2 on board). Commands 3-way true line-of-sight Star Rays (4 when Ascended from a 5-Pawn Merge!) up to 4.6 squares — piercing obstacles only when unblocked along Chess ranks, files, and diagonals.',
    descriptionAr:
      'الوزيرة الملكية العظمى (الحد 2 في الرقعة). تطلق 3 أشعة نجمية (4 عند دمج 5 جنود) بمدى 4.6 مربعات عبر الصفوف والأعمدة والأقطار غير المحجوبة.',
    attackPatternText: '3-Ray True Chess Line-of-Sight Star Beam (4 Rays if 5-Pawn Merged).',
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
    arabicName: 'العملاق الصخري',
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
      'Towering siege monstrosity wielding a shattered obsidian Rook monolith. Projects an Anti-Beam Shroud (reducing distant sniper damage by 40%), hurls Blight-Imps into your back ranks, and demands coordinated Chess Combos!',
    descriptionAr:
      'وحش حصار عملاق يضع درعاً مضاداً للأشعة يقلص ضرر القنص البعيد 40%، ويقذف العفاريت إلى صفوفك الخلفية!'
  },

  plague_queen: {
    id: 'plague_queen',
    name: 'Blight Sovereign Queen',
    arabicName: 'الوزيرة الملعونة',
    title: 'Spectral Monarch',
    maxHp: 2100,
    shieldHp: 450,
    speed: 0.27,
    dps: 115,
    teleportInterval: 7.5,
    manaDrop: 100,
    dropChance: 1.0,
    score: 750,
    radius: 0.44,
    color: '#e879f9',
    armorColor: '#4a044e',
    isBoss: true,
    isTeleportBoss: true,
    description:
      'Fallen Shadow Queen that phases diagonally across Ranks every 7.5 seconds to dodge Rook kill-boxes and Hex surrounding pieces! Counter with Knight L-Forks and Queen Star-Rays.',
    descriptionAr:
      'وزيرة الظلال الساقطة: تنتقل قطرياً بين المسارات كل 7.5 ثوانٍ لتجنب دفاعات القلاع! دمرها بشوكة الفارس وأشعة الوزير.'
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
      { label: 'CATHEDRAL CLIMAX', isFlag: true, spawns: [{ type: 'plague_queen', count: 1, interval: 4.5 }, { type: 'gargantua', count: 1, interval: 4.5 }, { type: 'assassin', count: 4, interval: 2.0 }, { type: 'necro', count: 4, interval: 2.4 }, { type: 'sprinter', count: 5, interval: 1.8 }] }
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
      { label: 'Twin Monoliths', isFlag: true, spawns: [{ type: 'gargantua', count: 1, interval: 4.5 }, { type: 'plague_queen', count: 1, interval: 4.5 }, { type: 'assassin', count: 5, interval: 1.8 }, { type: 'necro', count: 4, interval: 2.2 }] },
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
      { label: 'BLOOD MOON WAVE II', isFlag: true, spawns: [{ type: 'gargantua', count: 2, interval: 3.8 }, { type: 'plague_queen', count: 1, interval: 4.0 }, { type: 'necro', count: 6, interval: 1.8 }, { type: 'assassin', count: 6, interval: 1.5 }] },
      { label: 'Endgame Pressure', isFlag: false, spawns: [{ type: 'sprinter', count: 8, interval: 1.4 }, { type: 'buckler', count: 8, interval: 1.4 }, { type: 'necro', count: 6, interval: 1.8 }] },
      { label: 'GRANDMASTER CHECKMATE SIEGE', isFlag: true, spawns: [{ type: 'gargantua', count: 3, interval: 3.2 }, { type: 'plague_queen', count: 2, interval: 4.0 }, { type: 'assassin', count: 8, interval: 1.4 }, { type: 'necro', count: 6, interval: 1.6 }, { type: 'buckler', count: 8, interval: 1.4 }] }
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

const ROYAL_COMMANDERS = {
  bastion: {
    id: 'bastion',
    symbol: '♜',
    nameEn: 'Iron Bastion',
    nameAr: 'حصن الحديد',
    subtitleEn: 'Fortification & Pawn Vanguard',
    subtitleAr: 'التحصين وطليعة الجنود',
    descEn: 'All Pieces start with +35% Max HP & +30 Shield. Pawns cost 50 Mana.',
    descAr: 'تبدأ جميع القطع بـ +35% صحة و+30 درعاً إضافياً. تكلفة الجندي 50 طاقة فقط.',
    accent: '#fb923c',
    mods: { hpMult: 1.35, bonusShield: 30, pawnDiscount: 10 }
  },
  astral: {
    id: 'astral',
    symbol: '♝',
    nameEn: 'Astral Order',
    nameAr: 'النظام النجمي',
    subtitleEn: 'Sun Economy & Arcane Rays',
    subtitleAr: 'اقتصاد النور والأشعة السحرية',
    descEn: '+75 Starting Mana, Chalices produce every 6.5s, and Bishops/Queens gain +18% Attack Speed.',
    descAr: '+75 طاقة بداية، الكؤوس تنتج كل 6.5ث، وسرعة هجوم الفيلة والوزراء +18%.',
    accent: '#38bdf8',
    mods: { startingManaBonus: 75, chaliceIntervalMult: 0.8125, casterSpdMult: 1.18 }
  },
  crimson: {
    id: 'crimson',
    symbol: '♞',
    nameEn: 'Crimson Gambit',
    nameAr: 'مقامرة القرمزي',
    subtitleEn: 'Tempest Blitz & Critical Strikes',
    subtitleAr: 'هجوم الفرسان والضربات الحرجة',
    descEn: 'All Attackers deal +20% Damage, Move Cooldowns -35%, Knights cost 130 Mana.',
    descAr: 'جميع القطع تسبب +20% ضرراً، انتظار الحركة ينقص 35%، وتكلفة الفارس 130 طاقة.',
    accent: '#f43f5e',
    mods: { dmgMult: 1.2, moveCdMult: 0.65, knightDiscount: 20 }
  }
};

const ROYAL_DECREES = [
  {
    id: 'obsidian_edge',
    icon: '⚔',
    tier: 'OFFENSE',
    nameEn: 'Obsidian Honing',
    nameAr: 'شحذ النصل السبجي',
    descEn: 'All Chess Pieces deal +22% Attack Damage for the rest of the siege.',
    descAr: 'تزداد قوة هجوم جميع القطع بنسبة +22% حتى نهاية المرحلة.',
    apply(state) { state.damageMult *= 1.22; }
  },
  {
    id: 'sun_mint',
    icon: '☀',
    tier: 'ECONOMY',
    nameEn: 'Sovereign Mint',
    nameAr: 'دار السك الملكية',
    descEn: 'Gain +120 Mana immediately and +20% faster Chalice Mana harvests.',
    descAr: 'احصل على +120 طاقة فوراً وزيادة سرعة إنتاج الكؤوس بنسبة +20%.',
    apply(state, game) {
      game.mana += 120;
      game.totalManaEarned += 120;
      state.chaliceRateMult *= 1.2;
    }
  },
  {
    id: 'phalanx_steel',
    icon: '🛡',
    tier: 'DEFENSE',
    nameEn: 'Aegis Phalanx',
    nameAr: 'تروس الكتيبة المقدسة',
    descEn: 'Grant +160 Shield to every deployed piece & double Pawn knockback force.',
    descAr: 'يمنح +160 درعاً لجميع القطع في الرقعة ويضاعف قوة دفع الجنود للخلف.',
    apply(state, game) {
      state.pawnKnockbackMult *= 1.85;
      for (const p of game.pieces) {
        p.shieldHp = (p.shieldHp || 0) + 160;
        p.hp = Math.min(p.maxHp, p.hp + 150);
      }
    }
  },
  {
    id: 'haste_gambit',
    icon: '⚡',
    tier: 'TEMPO',
    nameEn: 'Grandmaster Tempo',
    nameAr: 'إيقاع الأستاذ الكبير',
    descEn: '+20% Attack Speed for all pieces and -30% Chess Move cooldown.',
    descAr: '+20% سرعة هجوم لجميع القطع وتقليص انتظار التحريك بنسبة 30%.',
    apply(state) {
      state.atkSpeedMult *= 1.2;
      state.moveCdMult *= 0.7;
    }
  },
  {
    id: 'knight_thunder',
    icon: '♞',
    tier: 'SYNERGY',
    nameEn: 'Stormhoof Relay',
    nameAr: 'صاعقة الفرسان',
    descEn: 'Tempest Knights gain +45% L-Strike Damage and stun targets briefly.',
    descAr: 'يزداد ضرر فرسان العاصفة +45% مع صدمة تبطئ الوحوش مؤقتاً.',
    apply(state) {
      state.knightDmgMult *= 1.45;
      state.knightStun = true;
    }
  },
  {
    id: 'prismatic_focus',
    icon: '♝',
    tier: 'SYNERGY',
    nameEn: 'Prismatic Cathedral',
    nameAr: 'منشور الكاتدرائية',
    descEn: 'Bishops & Queens fire +30% harder and heal allies +15 HP per volley.',
    descAr: 'أشعة الفيلة والوزراء أقوى بـ +30% وتداوي الحلفاء +15 صحة بكل ضربة.',
    apply(state) {
      state.casterDmgMult *= 1.3;
      state.bonusHeal += 15;
    }
  },
  {
    id: 'rook_caliber',
    icon: '♜',
    tier: 'SIEGE',
    nameEn: 'Siege Battery Protocol',
    nameAr: 'بروتوكول المدفعية الثقيلة',
    descEn: 'Aegis Rooks deal +40% Damage & execute foes under 18% HP.',
    descAr: 'تزداد قوة القلاع +40% وتقضي فوراً على الوحوش تحت 18% صحة.',
    apply(state) {
      state.rookDmgMult *= 1.4;
      state.rookExecuteThreshold = 0.18;
    }
  },
  {
    id: 'bastion_repair',
    icon: '🏰',
    tier: 'DEFENSE',
    nameEn: 'Repair Left Chariots',
    nameAr: 'ترميم العربات المجنحة',
    descEn: 'Restore 1 destroyed Sentinel Chariot on Rank A & boost Royal Battery +15%.',
    descAr: 'تعيد بناء عربة حماية محطمة وتزيد قوة البطارية الملكية +15%.',
    apply(state, game) {
      const broken = (game.chariots || []).find(c => c.used && !c.active);
      if (broken) {
        broken.used = false;
        broken.active = false;
        broken.x = (game.renderer && game.renderer.chariotX) || -20;
      }
      state.batteryBonus += 0.15;
    }
  },
  {
    id: 'mana_reclaim',
    icon: '💎',
    tier: 'ECONOMY',
    nameEn: 'Blight Transmutation',
    nameAr: 'تحويل رماد الظلام',
    descEn: 'Every slain Undead grants +12 direct Mana into your Crown Treasury.',
    descAr: 'كل وحش يُقتل يضيف +12 طاقة مباشرة إلى خزينة التاج.',
    apply(state) { state.killManaBonus += 12; }
  },
  {
    id: 'swift_promotion',
    icon: '♛',
    tier: 'ROYALTY',
    nameEn: 'Coronation Charter',
    nameAr: 'ميثاق التتويج الملكي',
    descEn: 'Pawn Promotions cost 65 Mana instead of 125, and Queens deal +25% damage.',
    descAr: 'تصبح ترقية الجندي إلى وزير بـ 65 طاقة فقط، والوزراء أقوى بـ +25%.',
    apply(state) {
      state.promoteCost = 65;
      state.queenDmgMult *= 1.25;
    }
  }
];

const CHESS_PUZZLES = [
  {
    id: 'pz_fork',
    code: 'PUZZLE I',
    nameEn: 'The Royal L-Fork',
    nameAr: 'الشوكة الملكية المزدوجة',
    descEn: 'Defeat dual Shielded Bucklers & an Assassin using Knight L-Strikes and Rook Castling!',
    descAr: 'اهزم الحراس المدرعين والقاتل المتخفي عبر شوكة الفارس وتبييت القلعة!',
    startingMana: 180,
    pieces: [
      { type: 'king', row: 2, col: 1 },
      { type: 'rook', row: 2, col: 0 },
      { type: 'knight', row: 1, col: 3 }
    ],
    waves: [
      {
        label: 'PUZZLE: THE ROYAL FORK',
        isFlag: true,
        spawns: [
          { type: 'buckler', count: 3, interval: 1.6, fixedRows: [1, 2, 3] },
          { type: 'assassin', count: 2, interval: 2.2, fixedRows: [0, 4] }
        ]
      }
    ]
  },
  {
    id: 'pz_merge',
    code: 'PUZZLE II',
    nameEn: 'Five-Rank Phalanx Ascension',
    nameAr: 'ارتقاء الكتيبة الخماسية',
    descEn: '4 Phalanx Pawns await on File D! Place the 5th Pawn on D1 and press [M] to trigger the Queen Merge!',
    descAr: '4 جنود مصطفون على العمود D! ضع الجندي الخامس في D1 واضغط [M] لتفجير الدمج الملكي!',
    startingMana: 160,
    pieces: [
      { type: 'pawn', row: 1, col: 3 },
      { type: 'pawn', row: 2, col: 3 },
      { type: 'pawn', row: 3, col: 3 },
      { type: 'pawn', row: 4, col: 3 },
      { type: 'chalice', row: 2, col: 0 }
    ],
    waves: [
      {
        label: 'PUZZLE: ASCENDED QUEEN',
        isFlag: true,
        spawns: [
          { type: 'plague_queen', count: 1, interval: 2.0 },
          { type: 'buckler', count: 4, interval: 1.8 }
        ]
      }
    ]
  },
  {
    id: 'pz_cleanse',
    code: 'PUZZLE III',
    nameEn: 'Sanctify the Hexed Cathedral',
    nameAr: 'تطهير الكاتدرائية الملعونة',
    descEn: 'Hex-casting Necro-Bishops bombard your Queen! Deploy Bishops diagonally to cleanse & burn them down.',
    descAr: 'كهنة الظلام يلقون اللعنات على وزيرتك! انشر الفيلة قطرياً لتطهير اللعنة وحرقهم.',
    startingMana: 240,
    pieces: [
      { type: 'queen', row: 2, col: 2 },
      { type: 'pawn', row: 2, col: 4 },
      { type: 'pawn', row: 1, col: 4 },
      { type: 'pawn', row: 3, col: 4 }
    ],
    waves: [
      {
        label: 'PUZZLE: HEX CLEANSE',
        isFlag: true,
        spawns: [
          { type: 'necro', count: 4, interval: 1.8 },
          { type: 'gargantua', count: 1, interval: 3.0 },
          { type: 'imp', count: 6, interval: 1.2 }
        ]
      }
    ]
  }
];

const CHESS_TIPS = [
  'دمج سطر الجنود (PAWN-LINE MERGE): صفّ 5 جنود مدرعين في نفس العمود أو الصف واضغط [M] لدمجهم سينمائياً إلى وزير ملكي متوّج (820 HP + 300🛡)!',
  'الجندي المدافع (PHALANX PAWN): لا يطلق الليزر — يدفع الوحوش للخلف بدرعه ويستعيد درعه عند الترابط القطري، كما يتحرك عند اكتمال 100 XP دون قفل!',
  'البطارية الملكية (ROYAL BATTERY): اصطفاف القلعة أو الفيل أو الوزير على نفس الخط يمنح +30% قوة هجوم إضافية!',
  'تطهير اللعنات (HEX CLEANSE): كاهن الفيل الملعون يبطئ سرعة هجوم أقوى قطعك — ضع فيل الأشعة المقدسة على قطره لتطهيره فوراً!',
  'التبييت الملكي (CASTLING): ضع الملك والقلعة في نفس الصف أو العمود واضغط تبييت لتبادل موقعهما ومنح الصف درعاً ذهبياً شاملاً!',
  'اقتصاد المعركة (ROYAL TREASURY): كل نهاية موجة تمنحك مكافأة خزينة (+20☀ + 5☀ لكل كأس نور)، واستدعاء الموجة مبكراً يمنحك مكافأة الخزينة + 25☀ معاً!'
];

const CHESS_TIPS_EN = [
  'PAWN-LINE MERGE: Align 5 Phalanx Pawns on any Rank or File and press [M] for a Full-Screen Cinematic Queen Ascension (820 HP + 300🛡)!',
  'PHALANX PAWN: Pure melee shield pusher that knocks foes back — even at 100 XP you can freely click to move it or press [U] to Promote!',
  'ROYAL BATTERY: Align Rook + Queen or Bishop + Queen along orthogonal/diagonal sightlines for +30% Royal Battery Damage!',
  'HEX CLEANSE: Necro-Bishops slow your Queens from diagonals — align a Radiant Bishop diagonally to cleanse the curse and boost DPS!',
  'ROYAL CASTLING: Align Arcane King with Aegis Rook and cast Castle to swap positions and grant +200 Golden Shield across the rank!',
  'EARLY WAVE BONUS: Calling the next wave early awards BOTH the +25☀ Early Call bonus AND the Wave-Clear Treasury bonus!'
];

const I18N = {
  ar: {
    dir: 'rtl',
    langName: 'العربية',
    manaTitle: 'طاقة التاج',
    wavePrefix: 'WAVE',
    nextWaveBtn: 'الموجة التالية',
    earlyBonusPrefix: 'مكافأة',
    menuBtn: 'القائمة',
    actsBtn: 'المراحل',
    codexBtn: 'الدليل',
    sacrificeLabel: 'تضحية',
    sacrificeHint: '+60%☀',
    endlessLabel: 'موجة لا نهائية',
    titleStartCampaign: 'بدء الحملة الملكية',
    titlePuzzles: 'ألغاز الكش مات',
    titleDaily: 'المقامرة اليومية',
    titleCommanderLabel: 'اختر قائد الميدان (Commander)',
    titleModeLabel: 'نمط المعركة',
    decreeEyebrow: 'مرسوم ملكي — اختر بركة واحدة',
    decreeTitle: 'المجلس الملكي للحرب'
  },
  en: {
    dir: 'ltr',
    langName: 'English',
    manaTitle: 'CROWN MANA',
    wavePrefix: 'WAVE',
    nextWaveBtn: 'Next Wave',
    earlyBonusPrefix: 'Bonus',
    menuBtn: 'Menu',
    actsBtn: 'Campaign',
    codexBtn: 'Codex',
    sacrificeLabel: 'Sacrifice',
    sacrificeHint: '+60%☀',
    endlessLabel: 'Endless Tide',
    titleStartCampaign: 'Launch Royal Campaign',
    titlePuzzles: 'Checkmate Puzzles',
    titleDaily: 'Daily Gambit Seed',
    titleCommanderLabel: 'Select Battlefield Commander',
    titleModeLabel: 'Battle Mode',
    decreeEyebrow: 'ROYAL DECREE DRAFT — CHOOSE ONE BLESSING',
    decreeTitle: 'Council of the Crown'
  }
};

const CHESS_DATA_EXPORT = {
  PIECES: CHESS_PIECES,
  ENEMIES: UNDEAD_ENEMIES,
  ACTS: CAMPAIGN_ACTS,
  TIPS: CHESS_TIPS,
  TIPS_EN: CHESS_TIPS_EN,
  COMMANDERS: ROYAL_COMMANDERS,
  DECREES: ROYAL_DECREES,
  PUZZLES: CHESS_PUZZLES,
  I18N
};

if (typeof window !== 'undefined') {
  window.CHESS_DATA = CHESS_DATA_EXPORT;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CHESS_DATA_EXPORT;
}
