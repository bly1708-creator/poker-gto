// 3-bet chart widget: pick a 3-bettor vs opener matchup, see the 3-bet range
// on a 13x13 grid. Purple = pure 3-bet, half-purple = mix, empty = flat/fold.
(function () {
  'use strict';

  var RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

  function hand(r1, r2) {
    if (r1 === r2) return RANKS[r1] + RANKS[r2];
    if (r1 < r2) return RANKS[r1] + RANKS[r2] + 'o';
    return RANKS[r2] + RANKS[r1] + 's';
  }

  // Each scenario: 3-bet / mixed-3bet / call (flat) / fold is implicit.
  // Ranges approximate solver-style 100bb 6-max at 2.5bb open.
  var SCENARIOS = [
    {
      id: 'btn-vs-co', label: 'BTN 3-bet vs CO (IP)', pct: 11,
      blurb: 'IP polarized. Value (QQ+, AK) plus A5s-A3s blocker bluffs. Flat AQo, JJ-99, AJs, KQs, suited broadways.',
      threebet: 'AA,KK,QQ,AKs,AKo,AQs,A5s,A4s,A3s',
      'threebet-mix': 'JJ,AQo,KQs,KJs,QJs,K9s,A2s',
      call: 'TT,99,88,77,66,55,AJs,ATs,KTs,QTs,JTs,T9s,98s,87s,76s,AJo,KQo,A9s,A8s'
    },
    {
      id: 'btn-vs-hj', label: 'BTN 3-bet vs HJ (IP, tighter)', pct: 7,
      blurb: 'HJ opens tighter (21%) so our 3-bet is more value-dense. Drop ~40% of the mixed bluffs vs CO line.',
      threebet: 'AA,KK,QQ,AKs,AKo,AQs,A5s',
      'threebet-mix': 'JJ,AQo,KQs,A4s',
      call: 'TT,99,88,77,66,55,AJs,ATs,KJs,KTs,QTs,JTs,T9s,98s,87s,76s,AJo,KQo,A9s'
    },
    {
      id: 'sb-vs-btn', label: 'SB 3-bet vs BTN (OOP, polarized)', pct: 15,
      blurb: 'OOP + no flats = pure 3-bet-or-fold. Widest bluff set because BTN opens widest. A5s-A2s, suited K-blockers, some AQo.',
      threebet: 'AA,KK,QQ,JJ,AKs,AKo,AQs,AQo,AJs,KQs,A5s,A4s,A3s,A2s',
      'threebet-mix': 'TT,99,ATs,KJs,KTs,QJs,K9s,Q9s,J9s,KQo,AJo,ATo,98s,87s,65s,76s'
    },
    {
      id: 'sb-vs-co', label: 'SB 3-bet vs CO (OOP)', pct: 12,
      blurb: 'CO open is tighter than BTN so 3-bet is tighter. Drop some speculative bluffs; keep blockers.',
      threebet: 'AA,KK,QQ,JJ,AKs,AKo,AQs,AJs,KQs,A5s,A4s,A3s',
      'threebet-mix': 'TT,AQo,ATs,KJs,KTs,A2s,KQo,AJo,98s,87s'
    },
    {
      id: 'bb-vs-btn', label: 'BB 3-bet vs BTN (OOP, widest)', pct: 18,
      blurb: 'BB has pot odds to flat almost anything, so 3-bets are polar: premiums + the widest blocker set. ~1:1 bluff/value.',
      threebet: 'AA,KK,QQ,JJ,AKs,AKo,AQs,AQo,AJs,AJo,KQs,A5s,A4s,A3s,A2s',
      'threebet-mix': 'TT,99,ATs,ATo,KQo,KJs,KJo,KTs,QJs,QTs,J9s,K9s,Q9s,76s,65s,54s,98s,87s'
    },
    {
      id: 'bb-vs-co', label: 'BB 3-bet vs CO (OOP)', pct: 15,
      blurb: 'CO opens 27% — narrower than BTN. Cut the weaker suited-connector bluffs; keep A-blockers and broadways.',
      threebet: 'AA,KK,QQ,JJ,AKs,AKo,AQs,AQo,AJs,KQs,A5s,A4s,A3s',
      'threebet-mix': 'TT,99,AJo,KJs,KTs,QJs,ATs,A2s,KQo,98s,87s,76s'
    }
  ];

  function parseList(s) {
    var set = Object.create(null);
    (s || '').split(',').forEach(function (t) {
      t = t.trim();
      if (t) set[t] = true;
    });
    return set;
  }

  function stateFor(scn, h) {
    if (!scn._three) {
      scn._three = parseList(scn.threebet);
      scn._threeMix = parseList(scn['threebet-mix']);
      scn._call = parseList(scn.call);
    }
    if (scn._three[h]) return 'threebet';
    if (scn._threeMix[h]) return 'threebet-mix';
    if (scn._call[h]) return 'call';
    return 'fold';
  }

  // Inline style fallbacks so colors render regardless of CSS state.
  var STATE_STYLE = {
    'threebet':     'background:#7345c9;color:#fff;border-color:#5a32a8',
    'threebet-mix': 'background:linear-gradient(135deg,#7345c9 60%,#e8ecea 60%);color:#1a2420;border-color:#5a32a8',
    'call':         'background:#1e9452;color:#fff;border-color:#176e3d',
    'fold':         'background:#e8ecea;color:#6b7d73;border-color:#c7d4cc'
  };

  function renderGrid(scn) {
    var html = '';
    for (var r = 0; r < 13; r++) {
      for (var c = 0; c < 13; c++) {
        var h = hand(r, c);
        var state = stateFor(scn, h);
        html += '<div class="cell ' + state + '" style="' + STATE_STYLE[state] +
                '" title="' + h + '">' + h + '</div>';
      }
    }
    return html;
  }

  function buildWidget(container) {
    container.innerHTML =
      '<div class="preflop-tabs threebet-tabs" role="tablist"></div>' +
      '<div class="preflop-header">' +
        '<div class="preflop-pct"></div>' +
        '<div class="preflop-blurb"></div>' +
      '</div>' +
      '<div class="range-grid preflop-grid" aria-label="3-bet range chart"></div>' +
      '<div class="legend preflop-legend">' +
        '<span><span class="sw sw-three"></span>3-bet</span>' +
        '<span><span class="sw sw-three-mix"></span>Mixed 3-bet</span>' +
        '<span><span class="sw sw-call"></span>Flat call</span>' +
        '<span><span class="sw sw-fold"></span>Fold</span>' +
      '</div>';

    var tabs = container.querySelector('.preflop-tabs');
    var grid = container.querySelector('.preflop-grid');
    var pctEl = container.querySelector('.preflop-pct');
    var blurbEl = container.querySelector('.preflop-blurb');

    SCENARIOS.forEach(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'preflop-tab';
      b.textContent = p.label;
      b.setAttribute('role', 'tab');
      b.addEventListener('click', function () { select(i); });
      tabs.appendChild(b);
    });

    function select(i) {
      Array.prototype.forEach.call(tabs.children, function (el, j) {
        el.classList.toggle('active', i === j);
      });
      var s = SCENARIOS[i];
      pctEl.innerHTML = '<strong>' + s.label + '</strong> · ~' + s.pct + '% 3-bet';
      blurbEl.textContent = s.blurb;
      grid.innerHTML = renderGrid(s);
    }

    select(0);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var containers = document.querySelectorAll('.threebet-chart');
    Array.prototype.forEach.call(containers, buildWidget);
  });
})();
