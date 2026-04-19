// Preflop range presets, approximated from solver solutions.
// Each preset is a map of hand → action code:
//   'R'  = pure raise
//   'r'  = mostly raise (~70%) mixed with fold
//   'r2' = some raise (~30%) mixed with fold
//   'C'  = pure call
//   'c'  = mostly call mixed with fold
//   'M'  = even raise/call mix
//   '3'  = pure 3-bet
//   '3m' = 3-bet mix
//   'S'  = pure shove (push/fold)
//   's'  = shove mix
//   'F'  = fold (default for any hand not listed)
// Hand notation: pairs as 'AA', suited as 'AKs', offsuit as 'AKo'.

window.RANGES = {
  // ---------------- 6-max RFI ----------------
  'UTG_RFI': {
    label: 'UTG open-raise (6-max, 100bb)',
    desc: '~14% RFI. Linear range — pairs, broadways, suited connectors 76s+, suited aces.',
    pct: 14,
    hands: {
      'AA':'R','KK':'R','QQ':'R','JJ':'R','TT':'R','99':'R','88':'R','77':'R','66':'R','55':'R','44':'R','33':'R','22':'R',
      'AKs':'R','AQs':'R','AJs':'R','ATs':'R','A9s':'R','A8s':'R','A7s':'R','A6s':'R','A5s':'R','A4s':'R',
      'KQs':'R','KJs':'R','KTs':'R',
      'QJs':'R','QTs':'R',
      'JTs':'R',
      'T9s':'R','98s':'R','87s':'R','76s':'R','65s':'r2',
      'AKo':'R','AQo':'R','AJo':'R','ATo':'r','KQo':'R','KJo':'r2'
    }
  },
  'LJ_RFI': {
    label: 'LJ open-raise (6-max, 100bb)',
    desc: '~17% RFI. Adds A3s, A2s, suited gappers, KJo pure.',
    pct: 17,
    hands: {
      'AA':'R','KK':'R','QQ':'R','JJ':'R','TT':'R','99':'R','88':'R','77':'R','66':'R','55':'R','44':'R','33':'R','22':'R',
      'AKs':'R','AQs':'R','AJs':'R','ATs':'R','A9s':'R','A8s':'R','A7s':'R','A6s':'R','A5s':'R','A4s':'R','A3s':'R','A2s':'R',
      'KQs':'R','KJs':'R','KTs':'R','K9s':'r2',
      'QJs':'R','QTs':'R','Q9s':'r2',
      'JTs':'R','J9s':'r',
      'T9s':'R','T8s':'r2','98s':'R','97s':'r2','87s':'R','76s':'R','65s':'r','54s':'r2',
      'AKo':'R','AQo':'R','AJo':'R','ATo':'R','KQo':'R','KJo':'R','QJo':'r2'
    }
  },
  'HJ_RFI': {
    label: 'HJ open-raise (6-max, 100bb)',
    desc: '~21% RFI. Adds K9s, Q9s, J9s, all suited Ax, weaker broadway offsuit.',
    pct: 21,
    hands: {
      'AA':'R','KK':'R','QQ':'R','JJ':'R','TT':'R','99':'R','88':'R','77':'R','66':'R','55':'R','44':'R','33':'R','22':'R',
      'AKs':'R','AQs':'R','AJs':'R','ATs':'R','A9s':'R','A8s':'R','A7s':'R','A6s':'R','A5s':'R','A4s':'R','A3s':'R','A2s':'R',
      'KQs':'R','KJs':'R','KTs':'R','K9s':'R','K8s':'r2',
      'QJs':'R','QTs':'R','Q9s':'R','Q8s':'r2',
      'JTs':'R','J9s':'R','J8s':'r2',
      'T9s':'R','T8s':'R','98s':'R','97s':'r','87s':'R','86s':'r2','76s':'R','75s':'r2','65s':'R','54s':'r',
      'AKo':'R','AQo':'R','AJo':'R','ATo':'R','A9o':'r2','KQo':'R','KJo':'R','KTo':'r','QJo':'R','QTo':'r2'
    }
  },
  'CO_RFI': {
    label: 'CO open-raise (6-max, 100bb)',
    desc: '~27% RFI. Most suited holdings, more broadway offsuit, light suited connectors.',
    pct: 27,
    hands: {
      'AA':'R','KK':'R','QQ':'R','JJ':'R','TT':'R','99':'R','88':'R','77':'R','66':'R','55':'R','44':'R','33':'R','22':'R',
      'AKs':'R','AQs':'R','AJs':'R','ATs':'R','A9s':'R','A8s':'R','A7s':'R','A6s':'R','A5s':'R','A4s':'R','A3s':'R','A2s':'R',
      'KQs':'R','KJs':'R','KTs':'R','K9s':'R','K8s':'R','K7s':'R','K6s':'r','K5s':'r2',
      'QJs':'R','QTs':'R','Q9s':'R','Q8s':'R','Q7s':'r2',
      'JTs':'R','J9s':'R','J8s':'R','J7s':'r2',
      'T9s':'R','T8s':'R','T7s':'r','98s':'R','97s':'R','96s':'r2','87s':'R','86s':'R','76s':'R','75s':'r','65s':'R','64s':'r2','54s':'R',
      'AKo':'R','AQo':'R','AJo':'R','ATo':'R','A9o':'R','A8o':'r2','KQo':'R','KJo':'R','KTo':'R','K9o':'r2','QJo':'R','QTo':'R','JTo':'r'
    }
  },
  'BTN_RFI': {
    label: 'BTN open-raise (6-max, 100bb)',
    desc: '~44% RFI. Open very wide — almost all suited, most broadway offsuit, weak connectors.',
    pct: 44,
    hands: {
      'AA':'R','KK':'R','QQ':'R','JJ':'R','TT':'R','99':'R','88':'R','77':'R','66':'R','55':'R','44':'R','33':'R','22':'R',
      'AKs':'R','AQs':'R','AJs':'R','ATs':'R','A9s':'R','A8s':'R','A7s':'R','A6s':'R','A5s':'R','A4s':'R','A3s':'R','A2s':'R',
      'KQs':'R','KJs':'R','KTs':'R','K9s':'R','K8s':'R','K7s':'R','K6s':'R','K5s':'R','K4s':'R','K3s':'R','K2s':'R',
      'QJs':'R','QTs':'R','Q9s':'R','Q8s':'R','Q7s':'R','Q6s':'R','Q5s':'r','Q4s':'r2',
      'JTs':'R','J9s':'R','J8s':'R','J7s':'R','J6s':'r2',
      'T9s':'R','T8s':'R','T7s':'R','T6s':'r2','98s':'R','97s':'R','96s':'R','87s':'R','86s':'R','85s':'r','76s':'R','75s':'R','65s':'R','64s':'r','54s':'R','53s':'r2',
      'AKo':'R','AQo':'R','AJo':'R','ATo':'R','A9o':'R','A8o':'R','A7o':'R','A6o':'r','A5o':'r','A4o':'r2','A3o':'r2','A2o':'r2',
      'KQo':'R','KJo':'R','KTo':'R','K9o':'R','K8o':'r','K7o':'r2',
      'QJo':'R','QTo':'R','Q9o':'R','Q8o':'r2',
      'JTo':'R','J9o':'r','T9o':'r','98o':'r2'
    }
  },
  'SB_RFI': {
    label: 'SB open-raise (6-max, 100bb)',
    desc: '~40% raise-only strategy. Solver mixes limps too; this preset shows the pure-raise build.',
    pct: 40,
    hands: {
      'AA':'R','KK':'R','QQ':'R','JJ':'R','TT':'R','99':'R','88':'R','77':'R','66':'R','55':'R','44':'R','33':'R','22':'R',
      'AKs':'R','AQs':'R','AJs':'R','ATs':'R','A9s':'R','A8s':'R','A7s':'R','A6s':'R','A5s':'R','A4s':'R','A3s':'R','A2s':'R',
      'KQs':'R','KJs':'R','KTs':'R','K9s':'R','K8s':'R','K7s':'R','K6s':'R','K5s':'R','K4s':'r','K3s':'r2','K2s':'r2',
      'QJs':'R','QTs':'R','Q9s':'R','Q8s':'R','Q7s':'r','Q6s':'r2',
      'JTs':'R','J9s':'R','J8s':'R','J7s':'r','J6s':'r2',
      'T9s':'R','T8s':'R','T7s':'R','98s':'R','97s':'R','87s':'R','86s':'R','76s':'R','75s':'R','65s':'R','54s':'R',
      'AKo':'R','AQo':'R','AJo':'R','ATo':'R','A9o':'R','A8o':'R','A7o':'R','A5o':'r','A4o':'r2',
      'KQo':'R','KJo':'R','KTo':'R','K9o':'r','K8o':'r2',
      'QJo':'R','QTo':'R','Q9o':'r','JTo':'R','J9o':'r2','T9o':'r2'
    }
  },
  'BB_VS_BTN': {
    label: 'BB defend vs BTN 2.5× open',
    desc: 'Wide defense with mix of calls, 3-bets and folds. ~70% defended.',
    pct: 70,
    hands: {
      'AA':'3','KK':'3','QQ':'3','JJ':'3','TT':'C','99':'C','88':'C','77':'C','66':'C','55':'C','44':'C','33':'C','22':'C',
      'AKs':'3','AQs':'3','AJs':'3','ATs':'C','A9s':'C','A8s':'C','A7s':'C','A6s':'C','A5s':'3m','A4s':'3m','A3s':'3m','A2s':'3m',
      'KQs':'3','KJs':'C','KTs':'C','K9s':'C','K8s':'C','K7s':'C','K6s':'C','K5s':'C','K4s':'C','K3s':'C','K2s':'c',
      'QJs':'C','QTs':'C','Q9s':'C','Q8s':'C','Q7s':'C','Q6s':'C','Q5s':'C','Q4s':'c','Q3s':'c','Q2s':'c',
      'JTs':'C','J9s':'C','J8s':'C','J7s':'C','J6s':'c','J5s':'c','J4s':'c',
      'T9s':'C','T8s':'C','T7s':'C','T6s':'c','98s':'C','97s':'C','96s':'C','95s':'c','87s':'C','86s':'C','85s':'c','76s':'C','75s':'C','74s':'c','65s':'C','64s':'C','54s':'C','53s':'C','43s':'C',
      'AKo':'3','AQo':'3','AJo':'C','ATo':'C','A9o':'C','A8o':'C','A7o':'C','A6o':'C','A5o':'C','A4o':'C','A3o':'C','A2o':'c',
      'KQo':'3','KJo':'C','KTo':'C','K9o':'C','K8o':'c','K7o':'c','K6o':'c',
      'QJo':'C','QTo':'C','Q9o':'C','Q8o':'c',
      'JTo':'C','J9o':'C','J8o':'c','T9o':'C','T8o':'c','98o':'C','97o':'c','87o':'c','76o':'c','65o':'c'
    }
  },

  // ---------------- Heads-up ----------------
  'HU_SB_RFI': {
    label: 'HU SB min-raise (100bb)',
    desc: '~75-80% raise-first. Folds only the worst offsuit.',
    pct: 78,
    hands: {
      'AA':'R','KK':'R','QQ':'R','JJ':'R','TT':'R','99':'R','88':'R','77':'R','66':'R','55':'R','44':'R','33':'R','22':'R',
      'AKs':'R','AQs':'R','AJs':'R','ATs':'R','A9s':'R','A8s':'R','A7s':'R','A6s':'R','A5s':'R','A4s':'R','A3s':'R','A2s':'R',
      'KQs':'R','KJs':'R','KTs':'R','K9s':'R','K8s':'R','K7s':'R','K6s':'R','K5s':'R','K4s':'R','K3s':'R','K2s':'R',
      'QJs':'R','QTs':'R','Q9s':'R','Q8s':'R','Q7s':'R','Q6s':'R','Q5s':'R','Q4s':'R','Q3s':'R','Q2s':'R',
      'JTs':'R','J9s':'R','J8s':'R','J7s':'R','J6s':'R','J5s':'R','J4s':'r','J3s':'r','J2s':'r2',
      'T9s':'R','T8s':'R','T7s':'R','T6s':'R','T5s':'r','T4s':'r2','T3s':'r2','T2s':'r2',
      '98s':'R','97s':'R','96s':'R','95s':'r','94s':'r2','87s':'R','86s':'R','85s':'R','84s':'r','83s':'r2','76s':'R','75s':'R','74s':'r','73s':'r2','65s':'R','64s':'R','63s':'r2','54s':'R','53s':'r','52s':'r2','43s':'r','42s':'r2','32s':'r2',
      'AKo':'R','AQo':'R','AJo':'R','ATo':'R','A9o':'R','A8o':'R','A7o':'R','A6o':'R','A5o':'R','A4o':'R','A3o':'R','A2o':'R',
      'KQo':'R','KJo':'R','KTo':'R','K9o':'R','K8o':'R','K7o':'R','K6o':'r','K5o':'r','K4o':'r','K3o':'r2','K2o':'r2',
      'QJo':'R','QTo':'R','Q9o':'R','Q8o':'R','Q7o':'r','Q6o':'r','Q5o':'r2','Q4o':'r2',
      'JTo':'R','J9o':'R','J8o':'r','J7o':'r','J6o':'r2',
      'T9o':'R','T8o':'r','T7o':'r','T6o':'r2',
      '98o':'r','97o':'r','96o':'r2','87o':'r','86o':'r2','76o':'r2','65o':'r2'
    }
  },
  'HU_BB_VS_SB': {
    label: 'HU BB defend vs SB min-raise',
    desc: '~75% defense — wide calls plus polar 3-bets. Folds only the worst offsuit garbage.',
    pct: 75,
    hands: {
      'AA':'3','KK':'3','QQ':'3','JJ':'3','TT':'3','99':'C','88':'C','77':'C','66':'C','55':'C','44':'C','33':'C','22':'C',
      'AKs':'3','AQs':'3','AJs':'3','ATs':'C','A9s':'C','A8s':'C','A7s':'C','A6s':'C','A5s':'3m','A4s':'3m','A3s':'3m','A2s':'3m',
      'KQs':'3','KJs':'C','KTs':'C','K9s':'C','K8s':'C','K7s':'C','K6s':'C','K5s':'C','K4s':'C','K3s':'C','K2s':'C',
      'QJs':'C','QTs':'C','Q9s':'C','Q8s':'C','Q7s':'C','Q6s':'C','Q5s':'C','Q4s':'C','Q3s':'C','Q2s':'C',
      'JTs':'C','J9s':'C','J8s':'C','J7s':'C','J6s':'C','J5s':'C','J4s':'c','J3s':'c','J2s':'c',
      'T9s':'C','T8s':'C','T7s':'C','T6s':'C','T5s':'C','T4s':'c','98s':'C','97s':'C','96s':'C','95s':'C','94s':'c','87s':'C','86s':'C','85s':'C','84s':'c','76s':'C','75s':'C','74s':'C','65s':'C','64s':'C','54s':'C','53s':'C','43s':'C',
      'AKo':'3','AQo':'3','AJo':'C','ATo':'C','A9o':'C','A8o':'C','A7o':'C','A6o':'C','A5o':'C','A4o':'C','A3o':'C','A2o':'C',
      'KQo':'3','KJo':'C','KTo':'C','K9o':'C','K8o':'C','K7o':'C','K6o':'C','K5o':'c','K4o':'c',
      'QJo':'C','QTo':'C','Q9o':'C','Q8o':'C','Q7o':'C','Q6o':'c',
      'JTo':'C','J9o':'C','J8o':'C','J7o':'c','T9o':'C','T8o':'C','T7o':'c','98o':'C','97o':'c','87o':'C','76o':'C','65o':'c'
    }
  },

  // ---------------- Tournament push/fold ----------------
  'NASH_15bb': {
    label: 'Nash open-shove SB, 15bb (chip-EV)',
    desc: '~38% shoving range when stack ≤15bb. Heads-up vs BB.',
    pct: 38,
    hands: {
      'AA':'S','KK':'S','QQ':'S','JJ':'S','TT':'S','99':'S','88':'S','77':'S','66':'S','55':'S','44':'S','33':'S','22':'S',
      'AKs':'S','AQs':'S','AJs':'S','ATs':'S','A9s':'S','A8s':'S','A7s':'S','A6s':'S','A5s':'S','A4s':'S','A3s':'S','A2s':'S',
      'KQs':'S','KJs':'S','KTs':'S','K9s':'S','K8s':'S','K7s':'S','K6s':'S','K5s':'S','K4s':'S','K3s':'S','K2s':'S',
      'QJs':'S','QTs':'S','Q9s':'S','Q8s':'S','Q7s':'S','Q6s':'S','Q5s':'S',
      'JTs':'S','J9s':'S','J8s':'S','J7s':'S',
      'T9s':'S','T8s':'S','T7s':'s','98s':'S','97s':'s',
      'AKo':'S','AQo':'S','AJo':'S','ATo':'S','A9o':'S','A8o':'S','A7o':'S','A6o':'S','A5o':'S','A4o':'S','A3o':'S','A2o':'S',
      'KQo':'S','KJo':'S','KTo':'S','K9o':'S','K8o':'s',
      'QJo':'S','QTo':'S','Q9o':'s',
      'JTo':'S'
    }
  },
  'NASH_10bb': {
    label: 'Nash open-shove SB, 10bb (chip-EV)',
    desc: '~55% shoving range at 10bb. Most suited hands, broad offsuit broadway.',
    pct: 55,
    hands: {
      'AA':'S','KK':'S','QQ':'S','JJ':'S','TT':'S','99':'S','88':'S','77':'S','66':'S','55':'S','44':'S','33':'S','22':'S',
      'AKs':'S','AQs':'S','AJs':'S','ATs':'S','A9s':'S','A8s':'S','A7s':'S','A6s':'S','A5s':'S','A4s':'S','A3s':'S','A2s':'S',
      'KQs':'S','KJs':'S','KTs':'S','K9s':'S','K8s':'S','K7s':'S','K6s':'S','K5s':'S','K4s':'S','K3s':'S','K2s':'S',
      'QJs':'S','QTs':'S','Q9s':'S','Q8s':'S','Q7s':'S','Q6s':'S','Q5s':'S','Q4s':'S','Q3s':'s','Q2s':'s',
      'JTs':'S','J9s':'S','J8s':'S','J7s':'S','J6s':'S','J5s':'s','J4s':'s',
      'T9s':'S','T8s':'S','T7s':'S','T6s':'S','T5s':'s','98s':'S','97s':'S','96s':'S','95s':'s','87s':'S','86s':'S','85s':'s','76s':'S','75s':'S','65s':'S','54s':'s',
      'AKo':'S','AQo':'S','AJo':'S','ATo':'S','A9o':'S','A8o':'S','A7o':'S','A6o':'S','A5o':'S','A4o':'S','A3o':'S','A2o':'S',
      'KQo':'S','KJo':'S','KTo':'S','K9o':'S','K8o':'S','K7o':'S','K6o':'s','K5o':'s',
      'QJo':'S','QTo':'S','Q9o':'S','Q8o':'s','Q7o':'s',
      'JTo':'S','J9o':'S','J8o':'s',
      'T9o':'S','T8o':'s','98o':'s'
    }
  }
};

// Action color/letter metadata used by the explorer + grids
window.ACTION_META = {
  'R':  { cls: 'r-100',     label: 'Raise' },
  'r':  { cls: 'r-mix',     label: 'Raise mix (~70%)' },
  'r2': { cls: 'r-mix2',    label: 'Raise mix (~30%)' },
  'C':  { cls: 'c-100',     label: 'Call' },
  'c':  { cls: 'c-mix',     label: 'Call mix' },
  'M':  { cls: 'rc-mix',    label: 'Raise / Call mix' },
  '3':  { cls: 'three',     label: '3-bet' },
  '3m': { cls: 'three-mix', label: '3-bet mix' },
  'S':  { cls: 'shove',     label: 'Shove' },
  's':  { cls: 'shove-mix', label: 'Shove mix' },
  'F':  { cls: 'fold',      label: 'Fold' }
};

// 13x13 grid helpers
window.RANK_ORDER = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
window.handAt = function (row, col) {
  var r = window.RANK_ORDER[row];
  var c = window.RANK_ORDER[col];
  if (row === col) return r + r;          // pair
  if (row < col) return r + c + 's';      // suited (higher first)
  return c + r + 'o';                      // offsuit (higher first)
};
