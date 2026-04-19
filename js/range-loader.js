// Renders range grids from JSON data files.
// Usage: <div class="range-grid" data-range-src="data/ranges/foo.json"></div>
// Path is resolved relative to the site root (derived from css/styles.css link).
(function () {
  'use strict';

  var HAND_ORDER = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];

  function rootPrefix() {
    var link = document.querySelector('link[rel="stylesheet"][href*="styles.css"]');
    if (!link) return '';
    return link.getAttribute('href').replace('css/styles.css', '');
  }

  function handLabel(i, j) {
    var a = HAND_ORDER[i], b = HAND_ORDER[j];
    if (i === j) return a + b;           // pair, e.g. AA
    if (i < j)  return a + b + 's';      // suited above diagonal
    return b + a + 'o';                  // offsuit below diagonal
  }

  function cellClass(entry) {
    if (!entry) return 'fold';
    var a = entry.action, f = entry.freq == null ? 1 : entry.freq;
    if (a === 'fold' || f <= 0.02) return 'fold';
    if (a === 'raise')   return f >= 0.9 ? 'r-100' : (f >= 0.5 ? 'r-mix' : 'r-mix2');
    if (a === 'call')    return f >= 0.9 ? 'c-100' : 'c-mix';
    if (a === 'threebet' || a === '3bet') return f >= 0.9 ? 'three' : 'three-mix';
    if (a === 'shove')   return f >= 0.9 ? 'shove' : 'shove-mix';
    if (a === 'mixed')   return 'rc-mix';
    return 'fold';
  }

  function badge(tier) {
    var t = (tier || 'unverified').toLowerCase();
    var label = t === 'verified' ? 'Solver-verified'
              : t === 'published' ? 'Published'
              : 'Unverified';
    return '<span class="provenance-badge ' + t + '">' + label + '</span>';
  }

  function render(container, data) {
    container.innerHTML = '';
    if (data.title) {
      var h = document.createElement('div');
      h.className = 'range-title';
      h.innerHTML = data.title + ' ' + badge(data.source && data.source.tier);
      container.parentNode.insertBefore(h, container);
    }
    for (var i = 0; i < 13; i++) {
      for (var j = 0; j < 13; j++) {
        var hand = handLabel(i, j);
        var entry = data.grid ? data.grid[hand] : null;
        var cell = document.createElement('div');
        cell.className = 'cell ' + cellClass(entry);
        cell.textContent = hand;
        if (entry && entry.freq != null && entry.freq > 0 && entry.freq < 1) {
          cell.title = hand + ' — ' + Math.round(entry.freq * 100) + '%';
        }
        container.appendChild(cell);
      }
    }
  }

  function load(container) {
    var src = container.getAttribute('data-range-src');
    if (!src) return;
    var url = rootPrefix() + src;
    fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      render(container, data);
    }).catch(function (err) {
      container.innerHTML = '<div class="range-error">Failed to load range: ' + err.message + '</div>';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.range-grid[data-range-src]'))
      .forEach(load);
  });
})();
