// Calculators: MDF, pot odds, bluff ratio, simple ICM (Malmuth-Harville).
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  function fmt(n, d) { return Number(n).toFixed(d == null ? 1 : d); }

  // ---------- MDF / Alpha ----------
  function calcMDF() {
    var pot = parseFloat($('mdf-pot').value) || 0;
    var bet = parseFloat($('mdf-bet').value) || 0;
    if (pot <= 0 || bet <= 0) {
      $('mdf-out').innerHTML = '<div class="row muted">Enter pot &amp; bet sizes.</div>';
      return;
    }
    var mdf = pot / (pot + bet);
    var alpha = bet / (pot + bet);
    var ratio = bet / pot;
    $('mdf-out').innerHTML =
      '<div class="row"><span>Bet as % of pot</span><strong>' + fmt(ratio * 100) + '%</strong></div>' +
      '<div class="row"><span>MDF (defender continues)</span><strong>' + fmt(mdf * 100) + '%</strong></div>' +
      '<div class="row"><span>Alpha (bluff needs to work)</span><strong>' + fmt(alpha * 100) + '%</strong></div>';
  }

  // ---------- Pot odds ----------
  function calcOdds() {
    var pot = parseFloat($('odds-pot').value) || 0;
    var call = parseFloat($('odds-call').value) || 0;
    if (pot <= 0 || call <= 0) {
      $('odds-out').innerHTML = '<div class="row muted">Enter pot before call &amp; call amount.</div>';
      return;
    }
    var equity = call / (pot + call);
    var ratio = pot / call;
    $('odds-out').innerHTML =
      '<div class="row"><span>Pot odds</span><strong>' + fmt(ratio, 2) + ' : 1</strong></div>' +
      '<div class="row"><span>Required equity</span><strong>' + fmt(equity * 100) + '%</strong></div>' +
      '<div class="row"><span>You call profitably with at least</span><strong>' + fmt(equity * 100) + '%</strong></div>';
  }

  // ---------- Bluff ratio ----------
  function calcBluff() {
    var pot = parseFloat($('br-pot').value) || 0;
    var bet = parseFloat($('br-bet').value) || 0;
    if (pot <= 0 || bet <= 0) {
      $('br-out').innerHTML = '<div class="row muted">Enter pot &amp; bet sizes.</div>';
      return;
    }
    var alpha = bet / (pot + bet);
    var bluffPct = alpha;
    var valuePct = 1 - alpha;
    var ratio = valuePct / bluffPct;
    $('br-out').innerHTML =
      '<div class="row"><span>Optimal bluff frequency</span><strong>' + fmt(bluffPct * 100) + '%</strong></div>' +
      '<div class="row"><span>Optimal value frequency</span><strong>' + fmt(valuePct * 100) + '%</strong></div>' +
      '<div class="row"><span>Value : Bluff ratio</span><strong>' + fmt(ratio, 2) + ' : 1</strong></div>';
  }

  // ---------- ICM (Malmuth-Harville) ----------
  // Computes each player's expected payout given stacks and prizes.
  function icmEquity(stacks, prizes) {
    var n = stacks.length;
    var totalChips = stacks.reduce(function (a, b) { return a + b; }, 0);
    if (totalChips === 0) return stacks.map(function () { return 0; });
    var equities = stacks.map(function () { return 0; });

    function recursivePush(remaining, place, weight) {
      if (place >= prizes.length || remaining.length === 0) return;
      var sumStacks = 0;
      for (var i = 0; i < remaining.length; i++) sumStacks += stacks[remaining[i]];
      if (sumStacks <= 0) return;
      for (var k = 0; k < remaining.length; k++) {
        var idx = remaining[k];
        var pFinish = stacks[idx] / sumStacks;
        equities[idx] += weight * pFinish * prizes[place];
        if (place < prizes.length - 1) {
          var next = remaining.slice(0, k).concat(remaining.slice(k + 1));
          recursivePush(next, place + 1, weight * pFinish);
        }
      }
    }

    var startList = stacks.map(function (_, i) { return i; });
    // First place
    var sumAll = startList.reduce(function (a, i) { return a + stacks[i]; }, 0);
    for (var k = 0; k < startList.length; k++) {
      var idx = startList[k];
      var p1 = stacks[idx] / sumAll;
      equities[idx] += p1 * prizes[0];
      if (prizes.length > 1) {
        var rest = startList.slice(0, k).concat(startList.slice(k + 1));
        recursivePush(rest, 1, p1);
      }
    }
    return equities;
  }

  function calcICM() {
    var stacksRaw = $('icm-stacks').value.trim();
    var prizesRaw = $('icm-prizes').value.trim();
    var stacks = stacksRaw.split(/[, ]+/).map(parseFloat).filter(function (n) { return !isNaN(n) && n > 0; });
    var prizes = prizesRaw.split(/[, ]+/).map(parseFloat).filter(function (n) { return !isNaN(n) && n >= 0; });
    if (stacks.length < 2 || prizes.length < 1) {
      $('icm-out').innerHTML = '<div class="row muted">Enter at least 2 stacks &amp; 1 prize (comma or space separated).</div>';
      return;
    }
    if (stacks.length > 9) {
      $('icm-out').innerHTML = '<div class="row muted">Max 9 players for performance.</div>';
      return;
    }
    var totalChips = stacks.reduce(function (a, b) { return a + b; }, 0);
    var totalPrize = prizes.reduce(function (a, b) { return a + b; }, 0);
    var eq = icmEquity(stacks, prizes);
    var html = '';
    html += '<div class="row"><span><strong>Player</strong></span><span><strong>Stack</strong></span><span><strong>Chip %</strong></span><span><strong>$EV</strong></span><span><strong>Equity %</strong></span></div>';
    stacks.forEach(function (s, i) {
      var chipPct = (s / totalChips) * 100;
      var equityPct = totalPrize > 0 ? (eq[i] / totalPrize) * 100 : 0;
      html += '<div class="row">' +
        '<span>P' + (i + 1) + '</span>' +
        '<span>' + s.toLocaleString() + '</span>' +
        '<span>' + fmt(chipPct) + '%</span>' +
        '<strong>$' + fmt(eq[i], 2) + '</strong>' +
        '<span>' + fmt(equityPct) + '%</span>' +
      '</div>';
    });
    html += '<div class="row" style="margin-top:6px;color:var(--muted)"><span>Total</span><span>' + totalChips.toLocaleString() + ' chips</span><span></span><span>$' + fmt(totalPrize, 2) + '</span><span></span></div>';
    $('icm-out').innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if ($('mdf-pot')) {
      ['mdf-pot','mdf-bet'].forEach(function (id) { $(id).addEventListener('input', calcMDF); });
      calcMDF();
    }
    if ($('odds-pot')) {
      ['odds-pot','odds-call'].forEach(function (id) { $(id).addEventListener('input', calcOdds); });
      calcOdds();
    }
    if ($('br-pot')) {
      ['br-pot','br-bet'].forEach(function (id) { $(id).addEventListener('input', calcBluff); });
      calcBluff();
    }
    if ($('icm-stacks')) {
      ['icm-stacks','icm-prizes'].forEach(function (id) { $(id).addEventListener('input', calcICM); });
      calcICM();
    }
  });
})();
