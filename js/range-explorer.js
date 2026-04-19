// Interactive 13x13 preflop range explorer.
(function () {
  'use strict';

  var SELECT_ID = 'range-select';
  var GRID_ID   = 'range-grid';
  var META_ID   = 'range-meta';
  var STATS_ID  = 'range-stats';

  // Order of presets shown in dropdown
  var ORDER = [
    { group: '6-max RFI (100bb)', items: ['UTG_RFI','LJ_RFI','HJ_RFI','CO_RFI','BTN_RFI','SB_RFI'] },
    { group: '6-max Defense',     items: ['BB_VS_BTN'] },
    { group: 'Heads-Up',          items: ['HU_SB_RFI','HU_BB_VS_SB'] },
    { group: 'MTT push/fold',     items: ['NASH_15bb','NASH_10bb'] }
  ];

  function buildSelect() {
    var sel = document.getElementById(SELECT_ID);
    if (!sel) return;
    ORDER.forEach(function (g) {
      var og = document.createElement('optgroup');
      og.label = g.group;
      g.items.forEach(function (key) {
        var r = window.RANGES[key];
        if (!r) return;
        var opt = document.createElement('option');
        opt.value = key;
        opt.textContent = r.label;
        og.appendChild(opt);
      });
      sel.appendChild(og);
    });
    sel.addEventListener('change', function () { render(sel.value); });
  }

  function freqOf(code) {
    switch (code) {
      case 'R': case 'C': case '3': case 'S': return 1.0;
      case 'r': case 'c': case '3m':           return 0.7;
      case 'M': case 's':                      return 0.5;
      case 'r2':                               return 0.3;
      default:                                  return 0;
    }
  }

  function comboCount(hand) {
    if (hand.length === 2) return 6;             // pair
    if (hand.endsWith('s')) return 4;            // suited
    return 12;                                    // offsuit
  }

  function render(key) {
    var preset = window.RANGES[key];
    if (!preset) return;
    var grid = document.getElementById(GRID_ID);
    var meta = document.getElementById(META_ID);
    var stats = document.getElementById(STATS_ID);

    grid.innerHTML = '';
    var totalCombos = 0;
    var inCombos = 0;

    for (var r = 0; r < 13; r++) {
      for (var c = 0; c < 13; c++) {
        var hand = window.handAt(r, c);
        var combos = comboCount(hand);
        var code = preset.hands[hand] || 'F';
        var amt = freqOf(code);
        totalCombos += combos;
        inCombos += combos * amt;

        var cell = document.createElement('div');
        cell.className = 'cell ' + window.ACTION_META[code].cls;
        cell.textContent = hand;
        cell.title = hand + ' — ' + window.ACTION_META[code].label +
                     (amt > 0 && amt < 1 ? ' (~' + Math.round(amt * 100) + '%)' : '');
        grid.appendChild(cell);
      }
    }

    var pct = (inCombos / totalCombos) * 100;
    meta.innerHTML =
      '<h3 style="margin:0 0 6px">' + preset.label + '</h3>' +
      '<p class="muted" style="margin:0">' + preset.desc + '</p>';

    stats.innerHTML =
      '<div class="stat"><span class="label">Combos</span><span class="value">' + Math.round(inCombos) + ' / ' + totalCombos + '</span></div>' +
      '<div class="stat"><span class="label">Range %</span><span class="value green">' + pct.toFixed(1) + '%</span></div>' +
      '<div class="stat"><span class="label">Listed PCT</span><span class="value gold">' + preset.pct + '%</span></div>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById(GRID_ID)) return;
    buildSelect();
    var sel = document.getElementById(SELECT_ID);
    // pick first option
    var first = sel.querySelector('option');
    if (first) {
      sel.value = first.value;
      render(first.value);
    }
  });
})();
