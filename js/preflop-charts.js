// Preflop RFI chart widget: one 13x13 grid, tabs to switch between the 6
// opening positions. Drop `<div class="preflop-chart"></div>` anywhere and
// this script populates it.
//
// Range data encoded as {HAND: state}. State is one of:
//   'raise'  = pure open
//   'mixed'  = mixed open/fold (solver ~50% open)
//   'fold'   = pure fold
// Hands not listed are 'fold'. Ranges are ~approximations of solver-style
// 100bb 6-max RFI at 2.5bb.
(function () {
  'use strict';

  var RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

  function hand(r1, r2) {
    // cell at row r1 (0=A..12=2), col r2 (0=A..12=2)
    if (r1 === r2) return RANKS[r1] + RANKS[r2];
    if (r1 < r2) return RANKS[r1] + RANKS[r2] + 'o'; // offsuit above diag
    return RANKS[r2] + RANKS[r1] + 's';              // suited below diag
  }

  // Six positions, each with explicit raise/mixed sets. Easier to maintain
  // than a full 169-entry table; every other hand is fold.
  var POSITIONS = [
    {
      id: 'UTG', name: 'UTG', pct: 14,
      blurb: 'Tightest seat. 5 players left to act. Linear value — pairs, broadways, suited connectors 76s+, best suited aces.',
      raise: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AKo,AQs,AQo,AJs,AJo,ATs,KQs,KQo,KJs,KTs,QJs,QTs,JTs,T9s,98s,87s,76s,A9s,A8s,A7s,A6s,A5s,A4s',
      mixed: 'ATo,KJo,65s'
    },
    {
      id: 'LJ', name: 'LJ', pct: 17,
      blurb: '4 left to act. Adds A3s/A2s, suited gappers (T8s, 97s), and mixes KJo/QJo.',
      raise: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AKo,AQs,AQo,AJs,AJo,ATs,ATo,A9s,A8s,A7s,A6s,A5s,A4s,A3s,KQs,KQo,KJs,KJo,KTs,QJs,QTs,JTs,T9s,98s,87s,76s,65s',
      mixed: 'A2s,KTo,QJo,T8s,97s,54s'
    },
    {
      id: 'HJ', name: 'HJ', pct: 21,
      blurb: '3 left. Fills in all Axs, adds K9s/Q9s/J9s, weaker broadway offsuit, suited gappers and 54s pure.',
      raise: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AKo,AQs,AQo,AJs,AJo,ATs,ATo,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KQo,KJs,KJo,KTs,KTo,K9s,QJs,QJo,QTs,Q9s,JTs,J9s,T9s,98s,87s,76s,65s,54s,T8s,97s',
      mixed: 'A9o,QTo,JTo,K8s,Q8s,86s,75s'
    },
    {
      id: 'CO', name: 'CO', pct: 27,
      blurb: '2 left. All Kxs pure, all Qxs down to Q8s, weak broadway offsuit (QTo, JTo). First seat where button play matters.',
      raise: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AKo,AQs,AQo,AJs,AJo,ATs,ATo,A9s,A9o,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQs,KQo,KJs,KJo,KTs,KTo,K9s,K8s,K7s,K6s,K5s,K4s,K3s,K2s,QJs,QJo,QTs,QTo,Q9s,Q8s,JTs,JTo,J9s,J8s,T9s,T8s,98s,97s,87s,76s,65s,54s',
      mixed: 'A8o,A7o,K9o,Q9o,J9o,T9o,86s,75s,64s,T7s'
    },
    {
      id: 'BTN', name: 'BTN', pct: 44,
      blurb: 'Only blinds left. Widest seat. Almost all suited, most offsuit broadways, suited gappers. Tight here is a major leak.',
      raise: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AKo,AQs,AQo,AJs,AJo,ATs,ATo,A9s,A9o,A8s,A8o,A7s,A7o,A6s,A6o,A5s,A5o,A4s,A4o,A3s,A3o,A2s,A2o,KQs,KQo,KJs,KJo,KTs,KTo,K9s,K9o,K8s,K7s,K6s,K5s,K4s,K3s,K2s,QJs,QJo,QTs,QTo,Q9s,Q9o,Q8s,Q7s,Q6s,Q5s,Q4s,Q3s,Q2s,JTs,JTo,J9s,J9o,J8s,J7s,J6s,T9s,T9o,T8s,T7s,T6s,98s,97s,96s,87s,86s,85s,76s,75s,65s,64s,54s',
      mixed: 'K8o,Q8o,J8o,T8o,98o,J5s,T5s,J4s,53s'
    },
    {
      id: 'SB', name: 'SB', pct: 40,
      blurb: 'vs BB only. Solver uses raise-or-fold (no limp) when BB defends like a solver — polarized: premiums + suited blockers, drop weak offsuit.',
      raise: 'AA,KK,QQ,JJ,TT,99,88,77,66,55,44,33,22,AKs,AKo,AQs,AQo,AJs,AJo,ATs,ATo,A9s,A9o,A8s,A8o,A7s,A7o,A6s,A5s,A5o,A4s,A3s,A2s,KQs,KQo,KJs,KJo,KTs,KTo,K9s,K9o,K8s,K7s,K6s,K5s,K4s,K3s,K2s,QJs,QJo,QTs,QTo,Q9s,Q8s,Q7s,Q6s,Q5s,JTs,JTo,J9s,J8s,J7s,T9s,T8s,T7s,98s,97s,87s,86s,76s,65s,54s',
      mixed: 'A6o,A4o,K8o,Q9o,J9o,T9o,96s,75s,64s'
    }
  ];

  function parseList(s) {
    var set = Object.create(null);
    s.split(',').forEach(function (t) {
      t = t.trim();
      if (t) set[t] = true;
    });
    return set;
  }

  function stateFor(pos, h) {
    if (!pos._raise) { pos._raise = parseList(pos.raise); pos._mixed = parseList(pos.mixed || ''); }
    if (pos._raise[h]) return 'raise';
    if (pos._mixed[h]) return 'mixed';
    return 'fold';
  }

  // Inline style fallbacks so colors render even if CSS class rules are
  // overridden, missing, or cached stale. Belt-and-suspenders.
  var STATE_STYLE = {
    raise: 'background:#c73636;color:#fff;border-color:#a82828',
    mixed: 'background:linear-gradient(135deg,#c73636 50%,#e8ecea 50%);color:#1a2420;border-color:#a82828',
    fold:  'background:#e8ecea;color:#6b7d73;border-color:#c7d4cc'
  };

  function renderGrid(pos) {
    var html = '';
    for (var r = 0; r < 13; r++) {
      for (var c = 0; c < 13; c++) {
        var h = hand(r, c);
        var state = stateFor(pos, h);
        html += '<div class="cell ' + state + '" style="' + STATE_STYLE[state] +
                '" title="' + h + '">' + h + '</div>';
      }
    }
    return html;
  }

  function buildWidget(container) {
    container.innerHTML =
      '<div class="preflop-tabs" role="tablist"></div>' +
      '<div class="preflop-header">' +
        '<div class="preflop-pct"></div>' +
        '<div class="preflop-blurb"></div>' +
      '</div>' +
      '<div class="range-grid preflop-grid" aria-label="RFI range chart"></div>' +
      '<div class="legend preflop-legend">' +
        '<span><span class="sw sw-raise"></span>Open raise</span>' +
        '<span><span class="sw sw-mixed"></span>Mixed (≈50/50)</span>' +
        '<span><span class="sw sw-fold"></span>Fold</span>' +
      '</div>';

    var tabs = container.querySelector('.preflop-tabs');
    var grid = container.querySelector('.preflop-grid');
    var pctEl = container.querySelector('.preflop-pct');
    var blurbEl = container.querySelector('.preflop-blurb');

    POSITIONS.forEach(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'preflop-tab';
      b.textContent = p.name;
      b.setAttribute('role', 'tab');
      b.addEventListener('click', function () { select(i); });
      tabs.appendChild(b);
    });

    function select(i) {
      Array.prototype.forEach.call(tabs.children, function (el, j) {
        el.classList.toggle('active', i === j);
      });
      var p = POSITIONS[i];
      pctEl.innerHTML = '<strong>' + p.name + '</strong> · ' + p.pct + '% RFI';
      blurbEl.textContent = p.blurb;
      grid.innerHTML = renderGrid(p);
    }

    // Initial = read data-start attr or default to UTG (0)
    var start = parseInt(container.getAttribute('data-start'), 10);
    if (isNaN(start) || start < 0 || start >= POSITIONS.length) start = 0;
    select(start);
  }

  // ---------------------------------------------------------------------------
  // Entry heatmap: for each hand, color the cell by the earliest position that
  // opens it. "Opens" counts both pure-raise and mixed. Hands never opened
  // stay in the fold color. Visual palette — darker = tighter position.
  var ENTRY_PALETTE = [
    { key: 'UTG', bg: '#8b1a1a' },
    { key: 'LJ',  bg: '#b02828' },
    { key: 'HJ',  bg: '#d0533a' },
    { key: 'CO',  bg: '#e78740' },
    { key: 'BTN', bg: '#eab64e' },
    { key: 'SB',  bg: '#c89c2a' }
  ];

  function firstOpener(h) {
    for (var i = 0; i < POSITIONS.length; i++) {
      var s = stateFor(POSITIONS[i], h);
      if (s === 'raise' || s === 'mixed') return i;
    }
    return -1;
  }

  function buildEntryHeatmap(container) {
    var html =
      '<div class="range-grid" aria-label="Earliest position heatmap">';
    for (var r = 0; r < 13; r++) {
      for (var c = 0; c < 13; c++) {
        var h = hand(r, c);
        var idx = firstOpener(h);
        if (idx < 0) {
          html += '<div class="cell fold" title="' + h + ' — never opened">' + h + '</div>';
        } else {
          var entry = ENTRY_PALETTE[idx];
          html += '<div class="cell" style="background:' + entry.bg + ';color:#fff" ' +
            'title="' + h + ' — first opened by ' + entry.key + '">' + h + '</div>';
        }
      }
    }
    html += '</div><div class="entry-legend">';
    ENTRY_PALETTE.forEach(function (e) {
      html += '<span><span class="sw" style="background:' + e.bg + '"></span>' + e.key + '</span>';
    });
    html += '<span><span class="sw" style="background:var(--range-fold-bg);border:1px solid var(--border)"></span>Never opened</span>';
    html += '</div>';
    container.innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('.preflop-chart'), buildWidget);
    Array.prototype.forEach.call(document.querySelectorAll('.entry-heatmap'), buildEntryHeatmap);
  });
})();
