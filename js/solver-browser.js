// Solver browser — lists verified postflop spots from data/postflop/_index.json
// and renders the root strategy (per-hand action frequencies) for the picked
// spot. Hands are grouped by category so the view stays readable.
(function () {
  'use strict';

  var INDEX_URL = '../data/postflop/_index.json';
  var SPOT_BASE = '../data/postflop/';

  function $(id) { return document.getElementById(id); }

  function fmtPct(x) { return (x * 100).toFixed(1) + '%'; }

  function handCategory(hand) {
    // hand tokens are 4 chars, e.g. "AsKh". We just care about the two ranks.
    var r1 = hand[0], r2 = hand[2];
    if (r1 === r2) return 'Pairs';
    var s1 = hand[1], s2 = hand[3];
    var suited = s1 === s2 ? 's' : 'o';
    var pair = [r1, r2].sort(function (a, b) {
      return 'AKQJT98765432'.indexOf(a) - 'AKQJT98765432'.indexOf(b);
    }).join('') + suited;
    if (r1 === 'A' || r2 === 'A') return 'Ace-X';
    if (r1 === 'K' || r2 === 'K') return 'King-X';
    return 'Broadways & suited connectors';
  }

  function renderStrategy(spot) {
    var root = spot.root_strategy || {};
    var actions = root.actions || [];
    var byHand = root.by_hand || {};
    var hands = Object.keys(byHand).sort();
    if (!actions.length || !hands.length) {
      return '<p class="muted">This spot has no root strategy data.</p>';
    }

    var groups = {};
    hands.forEach(function (h) {
      var cat = handCategory(h);
      (groups[cat] = groups[cat] || []).push(h);
    });

    var out = '<div class="solver-actions"><strong>Root actions:</strong> ' +
      actions.map(function (a) { return '<span class="solver-action">' + a + '</span>'; }).join(' · ') +
      '</div>';

    Object.keys(groups).forEach(function (cat) {
      out += '<h3 class="solver-cat">' + cat + '</h3>';
      out += '<table class="solver-table"><thead><tr><th>Hand</th>';
      actions.forEach(function (a) { out += '<th>' + a + '</th>'; });
      out += '</tr></thead><tbody>';
      groups[cat].forEach(function (h) {
        out += '<tr><td class="hand">' + h + '</td>';
        (byHand[h] || []).forEach(function (p) {
          var pct = fmtPct(p);
          var cls = p > 0.66 ? 'hi' : p > 0.33 ? 'mid' : 'lo';
          out += '<td class="freq ' + cls + '">' + pct + '</td>';
        });
        out += '</tr>';
      });
      out += '</tbody></table>';
    });
    return out;
  }

  function renderSpot(spot) {
    var src = spot.source || {};
    var params = src.params || {};
    var betSizes = params.bet_sizes || {};
    var header =
      '<div class="solver-spot-header">' +
      '<h2>' + spot.title + '</h2>' +
      '<div class="solver-meta">' +
        '<span class="provenance-badge verified">Verified</span>' +
        '<span>Solver: <code>' + (src.solver || '?') + '</code></span>' +
        '<span>Board: <code>' + (params.board || '?') + '</code></span>' +
        '<span>Pot: ' + params.pot_bb + 'bb · Stacks: ' + params.stacks_bb + 'bb</span>' +
        '<span>Iter: ' + (params.iterations || '?') + '</span>' +
        '<span>Run: ' + (src.run_date || '?') + '</span>' +
      '</div>' +
      '<div class="solver-betsizes">' +
        'Bet sizes · flop ' + (betSizes.flop || []).map(function (x) { return (x * 100).toFixed(0) + '%'; }).join('/') +
        ' · turn ' + (betSizes.turn || []).map(function (x) { return (x * 100).toFixed(0) + '%'; }).join('/') +
        ' · river ' + (betSizes.river || []).map(function (x) { return (x * 100).toFixed(0) + '%'; }).join('/') +
      '</div>' +
      '</div>';
    $('spot-view').innerHTML = header + renderStrategy(spot);
  }

  function loadSpot(file) {
    $('spot-view').innerHTML = '<p class="muted">Loading…</p>';
    fetch(SPOT_BASE + file)
      .then(function (r) { return r.json(); })
      .then(renderSpot)
      .catch(function (e) {
        $('spot-view').innerHTML = '<p class="range-error">Could not load ' + file + ': ' + e + '</p>';
      });
  }

  function renderPicker(idx) {
    if (!idx.spots || !idx.spots.length) {
      $('spot-picker').innerHTML = '<p class="muted">No verified spots yet. Run the <code>Solve spots</code> workflow to populate.</p>';
      $('spot-view').innerHTML = '';
      return;
    }
    var html = '<label for="solver-spot-select">Spot:</label> <select id="solver-spot-select">';
    idx.spots.forEach(function (s, i) {
      html += '<option value="' + s.file + '">' + s.title + '</option>';
    });
    html += '</select>';
    $('spot-picker').innerHTML = html;
    var sel = document.getElementById('solver-spot-select');
    sel.addEventListener('change', function () { loadSpot(sel.value); });
    loadSpot(idx.spots[0].file);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!$('spot-picker')) return;
    fetch(INDEX_URL)
      .then(function (r) { return r.json(); })
      .then(renderPicker)
      .catch(function (e) {
        $('spot-view').innerHTML = '<p class="range-error">Could not load spot index: ' + e + '</p>';
      });
  });
})();
