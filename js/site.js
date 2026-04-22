// Shared site enhancements: mobile nav, "Tools" link injection, reading progress,
// mark-complete, lesson TOC, and glossary search. Loaded by every page.
(function () {
  'use strict';

  // Find the depth of the current page relative to the site root so relative links work.
  // Pages live at root, /course/, /course/<track>/, /tools/.
  function rootPrefix() {
    var path = location.pathname;
    // Find the segment containing 'poker-gto' or treat current page's directory
    // depth as offset from a deployed root. We rely on the page's own <link rel=stylesheet href> path.
    var link = document.querySelector('link[rel="stylesheet"][href*="styles.css"]');
    if (!link) return '';
    var href = link.getAttribute('href');
    return href.replace('css/styles.css', '');
  }

  var ROOT = rootPrefix();

  // ---------- Theme toggle ----------
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
    var btn = document.querySelector('.theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀' : '☾';
  }
  function setupThemeToggle() {
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) {}
    applyTheme(saved === 'dark' ? 'dark' : 'light');
    var header = document.querySelector('header.site .row');
    if (!header) return;
    if (header.querySelector('.theme-toggle')) return;
    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
    header.appendChild(btn);
    applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
  }

  // ---------- Lesson search ----------
  var SEARCH_INDEX = null;
  function loadSearchIndex() {
    if (SEARCH_INDEX !== null) return Promise.resolve(SEARCH_INDEX);
    return fetch(ROOT + 'data/search-index.json')
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) { SEARCH_INDEX = data; return data; })
      .catch(function () { SEARCH_INDEX = []; return []; });
  }
  function scorePage(page, terms) {
    var score = 0;
    var title = (page.title || '').toLowerCase();
    var headings = (page.headings || []).join(' ').toLowerCase();
    var body = (page.body || '').toLowerCase();
    terms.forEach(function (t) {
      if (!t) return;
      if (title.indexOf(t) >= 0) score += 10;
      if (headings.indexOf(t) >= 0) score += 5;
      var bmatches = (body.match(new RegExp(t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g')) || []).length;
      score += Math.min(bmatches, 5);
    });
    return score;
  }
  function buildExcerpt(page, terms) {
    var body = page.body || '';
    var lower = body.toLowerCase();
    for (var i = 0; i < terms.length; i++) {
      var idx = lower.indexOf(terms[i]);
      if (idx >= 0) {
        var start = Math.max(0, idx - 40);
        var end = Math.min(body.length, idx + 120);
        return (start > 0 ? '…' : '') + body.substring(start, end) + (end < body.length ? '…' : '');
      }
    }
    return page.excerpt || '';
  }
  function setupLessonSearch() {
    var header = document.querySelector('header.site .row');
    if (!header || header.querySelector('.lesson-search-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'lesson-search-wrap';
    wrap.innerHTML =
      '<input type="search" placeholder="Search lessons…" aria-label="Search lessons" />' +
      '<div class="lesson-search-results" role="listbox"></div>';
    header.appendChild(wrap);
    var input = wrap.querySelector('input');
    var results = wrap.querySelector('.lesson-search-results');
    var closeOnBlur;
    input.addEventListener('focus', function () { loadSearchIndex(); });
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      if (!q) { results.classList.remove('show'); results.innerHTML = ''; return; }
      loadSearchIndex().then(function (pages) {
        var terms = q.split(/\s+/);
        var scored = pages.map(function (p) { return { p: p, s: scorePage(p, terms) }; })
          .filter(function (x) { return x.s > 0; })
          .sort(function (a, b) { return b.s - a.s; })
          .slice(0, 8);
        if (!scored.length) {
          results.innerHTML = '<div class="no-results">No matches.</div>';
        } else {
          results.innerHTML = scored.map(function (x) {
            var excerpt = buildExcerpt(x.p, terms);
            return '<a href="' + ROOT + x.p.url + '">' +
              '<div class="result-track">' + (x.p.track || '') + '</div>' +
              '<div class="result-title">' + x.p.title + '</div>' +
              '<div class="result-excerpt">' + excerpt.replace(/</g, '&lt;') + '</div>' +
              '</a>';
          }).join('');
        }
        results.classList.add('show');
      });
    });
    input.addEventListener('blur', function () {
      closeOnBlur = setTimeout(function () { results.classList.remove('show'); }, 150);
    });
    results.addEventListener('mousedown', function () { clearTimeout(closeOnBlur); });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== input && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
        e.preventDefault();
        input.focus();
      }
      if (e.key === 'Escape') { input.blur(); results.classList.remove('show'); }
    });
  }

  // ---------- Mobile nav + Tools link injection ----------
  function setupNav() {
    var header = document.querySelector('header.site');
    if (!header) return;
    var nav = header.querySelector('nav.site');
    if (!nav) return;

    // Inject Tools link before Glossary if not present
    var hasTools = nav.querySelector('a[data-tools-link]');
    if (!hasTools) {
      var glossary = Array.prototype.slice.call(nav.querySelectorAll('a'))
        .find(function (a) { return /glossary/i.test(a.getAttribute('href') || ''); });
      var toolsLink = document.createElement('a');
      toolsLink.href = ROOT + 'tools/index.html';
      toolsLink.textContent = 'Tools';
      toolsLink.setAttribute('data-tools-link', '');
      if (/\/tools\//.test(location.pathname)) toolsLink.classList.add('active');
      if (glossary) {
        nav.insertBefore(toolsLink, glossary);
      } else {
        nav.appendChild(toolsLink);
      }
    }

    // Add hamburger toggle
    var row = header.querySelector('.row');
    if (!row.querySelector('.menu-toggle')) {
      var btn = document.createElement('button');
      btn.className = 'menu-toggle';
      btn.setAttribute('aria-label', 'Toggle menu');
      btn.innerHTML = '☰';
      row.appendChild(btn);
      btn.addEventListener('click', function () {
        nav.classList.toggle('open');
        btn.innerHTML = nav.classList.contains('open') ? '✕' : '☰';
      });
      // close on link click
      nav.addEventListener('click', function (e) {
        if (e.target.tagName === 'A' && nav.classList.contains('open')) {
          nav.classList.remove('open');
          btn.innerHTML = '☰';
        }
      });
    }
  }

  // ---------- Lesson reading progress + mark complete ----------
  function setupLessonExtras() {
    var article = document.querySelector('article.lesson');
    if (!article) return;
    if (!document.querySelector('.crumbs')) return;

    var slug = location.pathname.replace(/\/index\.html?$/, '/').replace(/[^a-z0-9_/-]/gi, '');
    if (!slug || slug === '/') return;

    // Reading progress bar
    var bar = document.createElement('div');
    bar.className = 'read-progress';
    document.body.appendChild(bar);
    var update = function () {
      var h = document.documentElement;
      var max = (h.scrollHeight - h.clientHeight) || 1;
      var pct = Math.min(100, Math.max(0, (h.scrollTop / max) * 100));
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();

    // Reading time estimate (pin near subtitle)
    var subtitle = article.querySelector('.subtitle');
    if (subtitle && !article.querySelector('.meta-row')) {
      var words = (article.textContent || '').trim().split(/\s+/).length;
      var mins = Math.max(2, Math.round(words / 240));
      var metaRow = document.createElement('div');
      metaRow.className = 'meta-row';
      metaRow.innerHTML = '<span>⏱ ' + mins + ' min read</span>';
      // Mark-complete button
      var done = JSON.parse(localStorage.getItem('ss-progress') || '{}');
      var key = location.pathname.split('/').slice(-2).join('/');
      var btn = document.createElement('button');
      btn.className = 'complete-btn' + (done[key] ? ' done' : '');
      btn.textContent = done[key] ? '✓ Completed' : 'Mark complete';
      btn.addEventListener('click', function () {
        var p = JSON.parse(localStorage.getItem('ss-progress') || '{}');
        if (p[key]) {
          delete p[key];
          btn.classList.remove('done');
          btn.textContent = 'Mark complete';
        } else {
          p[key] = Date.now();
          btn.classList.add('done');
          btn.textContent = '✓ Completed';
        }
        localStorage.setItem('ss-progress', JSON.stringify(p));
      });
      metaRow.appendChild(btn);
      subtitle.parentNode.insertBefore(metaRow, subtitle.nextSibling);
    }

    // Auto TOC (desktop sidebar) — collect h2s
    var headings = article.querySelectorAll('h2');
    if (headings.length >= 3 && !article.querySelector('aside.toc')) {
      headings.forEach(function (h) {
        if (!h.id) {
          h.id = h.textContent.toLowerCase().trim()
            .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60);
        }
      });
      var container = article.querySelector('.container');
      if (container) {
        // Wrap existing children of container in a new div, add aside next to it
        var inner = document.createElement('div');
        inner.className = 'lesson-main';
        while (container.firstChild) inner.appendChild(container.firstChild);
        var layout = document.createElement('div');
        layout.className = 'lesson-layout';
        var aside = document.createElement('aside');
        aside.className = 'toc';
        aside.innerHTML = '<h4>On this page</h4>';
        var ul = document.createElement('ul');
        headings.forEach(function (h) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = '#' + h.id;
          a.textContent = h.textContent;
          li.appendChild(a);
          ul.appendChild(li);
        });
        aside.appendChild(ul);
        layout.appendChild(inner);
        layout.appendChild(aside);
        container.appendChild(layout);

        // active highlight on scroll
        var links = aside.querySelectorAll('a');
        var setActive = function () {
          var pos = window.scrollY + 120;
          var current = null;
          headings.forEach(function (h) {
            if (h.offsetTop <= pos) current = h.id;
          });
          links.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + current);
          });
        };
        window.addEventListener('scroll', setActive, { passive: true });
        setActive();
      }
    }
  }

  // ---------- Mark completed lessons in catalog/track lists ----------
  function decorateLessonLists() {
    var lists = document.querySelectorAll('.lesson-list');
    if (!lists.length) return;
    var done = JSON.parse(localStorage.getItem('ss-progress') || '{}');
    Array.prototype.forEach.call(lists, function (ul) {
      Array.prototype.forEach.call(ul.querySelectorAll('a'), function (a) {
        var href = a.getAttribute('href');
        if (!href) return;
        var key = href.split('/').slice(-2).join('/');
        if (done[key]) {
          if (!a.querySelector('.done-mark')) {
            var span = document.createElement('span');
            span.className = 'done-mark';
            span.textContent = '✓';
            a.appendChild(span);
          }
        }
      });
    });
  }

  // ---------- Glossary search ----------
  function setupGlossarySearch() {
    var dl = document.querySelector('[data-glossary]');
    if (!dl) return;

    // Wrap each h3+p into a glossary-term div for filterability
    var headings = dl.querySelectorAll('h3');
    Array.prototype.forEach.call(headings, function (h) {
      var p = h.nextElementSibling;
      if (!p || p.tagName !== 'P') return;
      var wrap = document.createElement('div');
      wrap.className = 'glossary-term';
      wrap.setAttribute('data-term', (h.textContent + ' ' + p.textContent).toLowerCase());
      h.parentNode.insertBefore(wrap, h);
      wrap.appendChild(h);
      wrap.appendChild(p);
    });

    var searchWrap = document.createElement('div');
    searchWrap.className = 'search-bar';
    var input = document.createElement('input');
    input.type = 'search';
    input.placeholder = 'Search glossary…';
    searchWrap.appendChild(input);
    var empty = document.createElement('div');
    empty.className = 'glossary-empty';
    empty.textContent = 'No matching terms.';

    var subtitle = document.querySelector('article.lesson .subtitle');
    if (subtitle) {
      subtitle.parentNode.insertBefore(searchWrap, subtitle.nextSibling);
      subtitle.parentNode.insertBefore(empty, searchWrap.nextSibling);
    }

    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var visibleTotal = 0;
      Array.prototype.forEach.call(document.querySelectorAll('.glossary-term'), function (t) {
        var match = !q || t.getAttribute('data-term').indexOf(q) !== -1;
        t.setAttribute('data-hidden', match ? 'false' : 'true');
        if (match) visibleTotal++;
      });
      Array.prototype.forEach.call(document.querySelectorAll('article.lesson h2'), function (h2) {
        var section = [];
        var sib = h2.nextElementSibling;
        while (sib && sib.tagName !== 'H2') {
          if (sib.classList && sib.classList.contains('glossary-term')) section.push(sib);
          sib = sib.nextElementSibling;
        }
        if (section.length) {
          var anyVisible = section.some(function (t) { return t.getAttribute('data-hidden') !== 'true'; });
          h2.style.display = anyVisible ? '' : 'none';
        }
      });
      empty.classList.toggle('show', visibleTotal === 0);
    });
  }

  // ---------- Provenance banner ----------
  function setupProvenanceBanner() {
    if (document.body.classList.contains('no-provenance')) return;
    if (/methodology\.html$/.test(location.pathname)) return;
    var dismissed = false;
    try { dismissed = localStorage.getItem('provenance-dismissed') === '1'; } catch (e) {}
    if (dismissed) return;
    var banner = document.createElement('div');
    banner.className = 'provenance-banner';
    banner.innerHTML =
      '<span>Educational illustrations — charts and frequencies on this site are not solver-verified. ' +
      '<a href="' + ROOT + 'methodology.html">How to verify &rarr;</a></span>' +
      '<button aria-label="Dismiss">&times;</button>';
    banner.querySelector('button').addEventListener('click', function () {
      banner.remove();
      try { localStorage.setItem('provenance-dismissed', '1'); } catch (e) {}
    });
    document.body.insertBefore(banner, document.body.firstChild);
  }

  // ---------- Methodology link in nav ----------
  function addMethodologyLink() {
    var nav = document.querySelector('header.site nav.site');
    if (!nav || nav.querySelector('a[data-methodology-link]')) return;
    var a = document.createElement('a');
    a.href = ROOT + 'methodology.html';
    a.textContent = 'Methodology';
    a.setAttribute('data-methodology-link', '');
    if (/methodology\.html$/.test(location.pathname)) a.classList.add('active');
    nav.appendChild(a);
  }

  // ---------- Lazy-load range-loader.js if page uses JSON ranges ----------
  function maybeLoadRangeLoader() {
    if (!document.querySelector('.range-grid[data-range-src]')) return;
    var s = document.createElement('script');
    s.src = ROOT + 'js/range-loader.js';
    s.defer = true;
    document.head.appendChild(s);
  }

  // ---------- Boot ----------
  document.addEventListener('DOMContentLoaded', function () {
    setupNav();
    addMethodologyLink();
    setupProvenanceBanner();
    setupThemeToggle();
    setupLessonSearch();
    setupLessonExtras();
    decorateLessonLists();
    setupGlossarySearch();
    maybeLoadRangeLoader();
  });
})();
