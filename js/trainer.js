// Hand trainer — present a scenario, user picks an action, get GTO feedback.
(function () {
  'use strict';

  var QUESTIONS = [
    {
      track: '6-max', stage: '6-max NL · Preflop',
      title: 'CO opens, you have JJ on the BTN',
      setup: { Position: 'BTN', Stacks: '100bb effective', Action: 'CO opens 2.5bb · folds to you', Pot: '4bb' },
      hand: 'J♠ J♥',
      actions: ['Fold', 'Call', '3-bet small (8bb)', '3-bet big (12bb)'],
      correct: 2,
      explanation: 'JJ is a clear 3-bet for value vs CO open from BTN. Use a smaller IP sizing (~3× the open). Big sizings turn JJ into a top-of-range hand that loses value when called by tighter ranges.'
    },
    {
      track: '6-max', stage: '6-max NL · Postflop',
      title: 'You opened UTG, BB defended. Flop K72r.',
      setup: { Position: 'IP vs BB', Stacks: '~94bb behind', Action: 'BB checks to you', Pot: '6bb' },
      hand: 'A♥ Q♥',
      actions: ['Check back', 'Bet 25% pot', 'Bet 75% pot', 'Bet pot'],
      correct: 1,
      explanation: 'Massive range advantage on K72r — you have all the kings, queens, and overpairs that BB doesn\'t. Range c-bet small (25-33%) with your entire range, including AQ as a backdoor + overcard hand.'
    },
    {
      track: '6-max', stage: '6-max NL · Turn',
      title: 'Triple-barrel decision on the turn',
      setup: { Position: 'BTN vs BB', Stacks: '~85bb', Action: 'You bet 33% flop, BB called. Turn brings 9♠.', Pot: '~14bb', Board: 'A♠ K♣ 4♥ 9♠' },
      hand: 'Q♥ J♥',
      actions: ['Check back', 'Bet 33% pot', 'Bet 75% pot', 'Bet pot'],
      correct: 2,
      explanation: 'QJ has a gutshot (T fills) plus minimal showdown value. Pure bluff candidate that picks up equity with the 9. Big bet (75%) puts maximum pressure and capitalizes on BB\'s capped range.'
    },
    {
      track: '6-max', stage: '6-max NL · River',
      title: 'River bluff selection',
      setup: { Position: 'OOP vs BTN', Stacks: '~50bb', Action: 'You c/r flop & barreled turn. River is a brick (2♠).', Pot: '~50bb', Board: 'K♣ T♣ 7♠ 4♦ 2♠' },
      hand: 'A♣ 5♣',
      actions: ['Check (give up)', 'Bet 1/3 pot', 'Bet 2/3 pot', 'Overbet 1.5× pot'],
      correct: 3,
      explanation: 'Nut flush blocker (A♣) makes this an ideal river overbet bluff. Your range has KK/TT/77/44 sets and KT for value, plus blocker bluffs like A♣x. Polarize big — villain folds two pair / weak straights.'
    },
    {
      track: '6-max', stage: '6-max NL · Defense',
      title: 'Facing a 3-bet',
      setup: { Position: 'BTN', Stacks: '100bb', Action: 'You opened 2.5bb · SB 3-bets to 11bb', Pot: '14.5bb' },
      hand: 'A♣ 5♣',
      actions: ['Fold', 'Call', '4-bet to 25bb', '5-bet shove'],
      correct: 2,
      explanation: 'A5s is a textbook blocker bluff 4-bet. Blocks SB\'s AA / AK value combos and has nut-flush potential when called. Pure flat is too passive (you don\'t close action and play OOP-equivalent vs squeezes).'
    },

    // Heads-up
    {
      track: 'Heads-Up', stage: 'HU Cash · Preflop',
      title: 'SB at 100bb with K7o',
      setup: { Position: 'SB (button equiv.)', Stacks: '100bb HU', Action: 'You are first to act', Pot: '1.5bb' },
      hand: 'K♠ 7♥',
      actions: ['Fold', 'Limp 1bb', 'Min-raise (2bb)', 'Raise 3bb'],
      correct: 2,
      explanation: 'In HU at 100bb, SB opens ~75-80% of hands at 2bb. K7o is a clear min-raise — too strong to fold/limp, and 2bb is the optimal sizing in solver solutions.'
    },
    {
      track: 'Heads-Up', stage: 'HU Cash · Postflop',
      title: 'HU SB c-bet decision',
      setup: { Position: 'IP', Stacks: '~95bb', Action: 'You raised, BB called. Flop is K-high dry.', Pot: '4bb', Board: 'K♥ 7♣ 2♦' },
      hand: '9♠ 8♠',
      actions: ['Check back', 'Bet 25% pot', 'Bet 75% pot', 'Overbet'],
      correct: 1,
      explanation: 'K72r is a max range-advantage flop for the HU SB. Range bet small (25-33%) with your entire range — even 98s without backdoor flush. The small size denies equity to BB\'s under-pairs and ace-highs cheaply.'
    },
    {
      track: 'Heads-Up', stage: 'HU Cash · River',
      title: 'Bluffcatching a HU overbet',
      setup: { Position: 'BB', Stacks: '~65bb behind', Action: 'BTN overbets 1.5× pot on river', Pot: '40bb · bet 60bb', Board: 'Q♠ J♥ 6♣ 4♦ 2♠' },
      hand: 'K♣ Q♦',
      actions: ['Fold', 'Call', 'Raise (shove)'],
      correct: 1,
      explanation: 'KQ is a strong bluff-catcher: top pair top kicker, blocks villain\'s QQ value combo. MDF vs 1.5× overbet is ~40% — KQ is squarely in your defending range. Folds give villain too cheap a bluff.'
    },

    // MTT
    {
      track: 'MTT', stage: 'Tournament · Push/Fold',
      title: 'Open-shove decision at 12bb',
      setup: { Position: 'SB', Stacks: '12bb effective', Action: 'Folds to you. BB has 25bb.', Pot: '1.5bb + 1bb ante' },
      hand: 'A♠ 7♣',
      actions: ['Fold', 'Limp', 'Min-raise', 'Open-shove all-in'],
      correct: 3,
      explanation: 'A7o is in the Nash open-shove range at 12bb from SB. Min-raise/fold burns 20% of your stack and gives a covering BB an easy reshove. Just shove — the FE plus 30% equity when called is +EV.'
    },
    {
      track: 'MTT', stage: 'Tournament · ICM',
      title: 'Bubble call vs covering shove',
      setup: { Position: 'BTN', Stacks: 'You 25bb · CO covers (shoves all-in for 25bb)', Action: 'Money bubble — 1 spot from min-cash', Pot: '~28bb after antes' },
      hand: 'A♥ Q♠',
      actions: ['Fold', 'Call'],
      correct: 0,
      explanation: 'AQo has ~52% equity vs CO\'s shoving range. Chip-EV says call, but ICM risk premium on the bubble adds ~10-15% to required equity. Required equity becomes ~62-65%. Fold AQo, ladder, find a better spot.'
    },
    {
      track: 'MTT', stage: 'Tournament · Final Table',
      title: 'Big stack opens vs covered mid stack',
      setup: { Position: 'BB (you cover SB by 5bb)', Stacks: 'You 35bb · SB shoves 30bb · 6 players left', Action: 'Pay jumps still significant', Pot: '~33bb' },
      hand: 'T♠ T♣',
      actions: ['Fold', 'Call'],
      correct: 1,
      explanation: 'TT is a clear call even under ICM at this depth. You cover, the pay jump is significant but TT has 55%+ equity vs SB\'s shoving range from a 30bb stack. Risk premium here is small (~3-5%) — TT is well above threshold.'
    },
    {
      track: 'MTT', stage: 'Tournament · Stack Sizes',
      title: 'Mid-stack 3-bet decision',
      setup: { Position: 'SB · 28bb effective', Stacks: '28bb', Action: 'BTN min-raises to 2bb', Pot: '4.5bb' },
      hand: 'A♥ J♠',
      actions: ['Fold', 'Call', '3-bet to 7bb', '3-bet shove'],
      correct: 3,
      explanation: 'At 28bb, the 3-bet shove is the standard tool. Flatting OOP with 26bb behind creates a bad SPR; small 3-betting allows villain to 4-bet shove and tax your fold. Just jam — AJo gets calls dominated and folds 3-bet bluffs.'
    }
  ];

  var state = { idx: 0, answered: 0, correct: 0, locked: false };

  function $(id) { return document.getElementById(id); }

  function render() {
    var q = QUESTIONS[state.idx];
    var setupHTML = '';
    Object.keys(q.setup).forEach(function (k) {
      setupHTML += '<div><span class="label">' + k + ':</span> ' + q.setup[k] + '</div>';
    });

    $('q-stage').textContent = q.stage;
    $('q-title').textContent = q.title;
    $('q-setup').innerHTML = setupHTML;
    $('q-hand').textContent = q.hand;
    $('q-actions').innerHTML = '';
    q.actions.forEach(function (a, i) {
      var btn = document.createElement('button');
      btn.textContent = a;
      btn.addEventListener('click', function () { answer(i); });
      $('q-actions').appendChild(btn);
    });
    $('q-feedback').className = 'feedback';
    $('q-feedback').innerHTML = '';
    state.locked = false;

    $('score-num').textContent = state.correct + ' / ' + state.answered;
    $('q-counter').textContent = 'Question ' + (state.idx + 1) + ' of ' + QUESTIONS.length;
    var pct = QUESTIONS.length ? ((state.idx) / QUESTIONS.length) * 100 : 0;
    $('q-progress').style.width = pct + '%';

    $('next-btn').textContent = state.idx === QUESTIONS.length - 1 ? 'Restart' : 'Next →';
    $('next-btn').disabled = !state.locked;
    $('next-btn').style.opacity = state.locked ? '1' : '0.5';
  }

  function answer(i) {
    if (state.locked) return;
    state.locked = true;
    state.answered++;
    var q = QUESTIONS[state.idx];
    var btns = $('q-actions').querySelectorAll('button');
    Array.prototype.forEach.call(btns, function (b, j) {
      b.classList.add('disabled');
      if (j === q.correct) b.classList.add('show-correct');
    });
    var fb = $('q-feedback');
    if (i === q.correct) {
      state.correct++;
      btns[i].classList.add('correct');
      fb.className = 'feedback show correct';
      fb.innerHTML = '<h4>✓ Correct</h4><p>' + q.explanation + '</p>';
    } else {
      btns[i].classList.add('wrong');
      fb.className = 'feedback show wrong';
      fb.innerHTML = '<h4>✗ Not optimal</h4><p>Optimal action: <strong>' + q.actions[q.correct] + '</strong>. ' + q.explanation + '</p>';
    }
    $('score-num').textContent = state.correct + ' / ' + state.answered;
    $('next-btn').disabled = false;
    $('next-btn').style.opacity = '1';
  }

  function next() {
    if (state.idx >= QUESTIONS.length - 1) {
      // restart
      state.idx = 0;
      state.answered = 0;
      state.correct = 0;
    } else {
      state.idx++;
    }
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!$('q-actions')) return;
    $('next-btn').addEventListener('click', next);
    render();
  });
})();
