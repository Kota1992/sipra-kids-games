(function () {
  'use strict';

  const {
    S, t, A, register,
    celebrateEl, finishGame,
    LEVEL_COUNT, startWithLevels, createLevelHub,
    showLevelComplete, renderLevelHeader,
    safeTimeout, safeInterval
  } = window.SiPraGameKit;

  const GAME_ID = 'guess-animal';

  const ANIMALS = [
    { id: 'cow', emoji: '🐄', bg: '#FFE082', name: { en: 'Cow', te: 'ఆవు' }, sound: 'cow' },
    { id: 'dog', emoji: '🐶', bg: '#FFCC80', name: { en: 'Dog', te: 'కుక్క' }, sound: 'dog' },
    { id: 'cat', emoji: '🐱', bg: '#F8BBD0', name: { en: 'Cat', te: 'పిల్లి' }, sound: 'cat' },
    { id: 'elephant', emoji: '🐘', bg: '#B0BEC5', name: { en: 'Elephant', te: 'ఏనుగు' }, sound: 'elephant' },
    { id: 'lion', emoji: '🦁', bg: '#FFCC80', name: { en: 'Lion', te: 'సింహం' }, sound: 'lion' },
    { id: 'monkey', emoji: '🐵', bg: '#D7CCC8', name: { en: 'Monkey', te: 'కోతి' }, sound: 'monkey' },
    { id: 'duck', emoji: '🦆', bg: '#FFF59D', name: { en: 'Duck', te: 'బాతు' }, sound: 'duck' },
    { id: 'frog', emoji: '🐸', bg: '#C5E1A5', name: { en: 'Frog', te: 'కప్ప' }, sound: 'frog' },
    { id: 'horse', emoji: '🐴', bg: '#D7CCC8', name: { en: 'Horse', te: 'గుర్రం' }, sound: 'horse' },
    { id: 'sheep', emoji: '🐑', bg: '#ECEFF1', name: { en: 'Sheep', te: 'గొర్రె' }, sound: 'sheep' }
  ];

  /** 10 levels — which animal + how many distractors */
  const LEVELS = [
    { pick: 'cow', distractors: 2, reveal: 'silhouette', roundLabel: 'Savannah start' },
    { pick: 'dog', distractors: 2, reveal: 'silhouette', roundLabel: 'Bush trail' },
    { pick: 'cat', distractors: 2, reveal: 'peek', roundLabel: 'Grass hide' },
    { pick: 'duck', distractors: 2, reveal: 'silhouette', roundLabel: 'Water hole' },
    { pick: 'frog', distractors: 3, reveal: 'peek', roundLabel: 'Pond splash' },
    { pick: 'monkey', distractors: 3, reveal: 'silhouette', roundLabel: 'Jungle swing' },
    { pick: 'lion', distractors: 3, reveal: 'peek', roundLabel: 'King lookout' },
    { pick: 'elephant', distractors: 3, reveal: 'silhouette', roundLabel: 'Big footprints' },
    { pick: 'horse', distractors: 3, reveal: 'peek', roundLabel: 'Sunset ride' },
    { pick: 'sheep', distractors: 3, reveal: 'silhouette', roundLabel: 'Safari finale' }
  ];

  function animalName(a) {
    const lang = S().state.language || 'en';
    return a.name[lang] || a.name.en;
  }

  register('guess-animal', {
    name: { en: 'Guess the Animal', te: 'జంతువు ఊహించండి' },
    desc: { en: 'Who is hiding? Tap to guess!', te: 'ఎవరు దాక్కున్నారు? ఊహించండి!' },
    icon: '🦁',
    cat: 'animals',
    introKey: 'g5_intro',

    start(stage) {
      startWithLevels(stage, '🦁', 'g5_intro', {
        gameId: GAME_ID,
        title: 'Animal Safari',
        subtitle: '10 wild guessing stops!',
        emoji: '🦒',
        themeClass: 'ganimal-hub'
      }, (st, lv) => play(st, lv));

      function openHub(st) {
        createLevelHub(st, {
          gameId: GAME_ID,
          title: 'Animal Safari',
          subtitle: '10 wild guessing stops!',
          emoji: '🦒',
          themeClass: 'ganimal-hub',
          onPlay(lv) { play(st, lv); }
        });
      }

      function play(stage, levelIndex) {
        const plan = LEVELS[levelIndex] || LEVELS[0];
        const correct = ANIMALS.find(a => a.id === plan.pick) || ANIMALS[0];
        const pool = ANIMALS.filter(a => a.id !== correct.id);
        const wrong = S().shuffle(pool).slice(0, plan.distractors);
        const choices = S().shuffle([correct, ...wrong]);

        stage.innerHTML = '';
        const arena = document.createElement('div');
        arena.className = 'gp-arena ganimal-game';

        arena.innerHTML = `
          <div class="gaf-bg" aria-hidden="true">
            <div class="gaf-sky"></div>
            <div class="gaf-sun"></div>
            <div class="gaf-savanna"></div>
            <div class="gaf-acacia gaf-t1">🌳</div>
            <div class="gaf-acacia gaf-t2">🌴</div>
            <div class="gaf-jeep">🛻</div>
          </div>
          <div class="gaf-ranger" aria-hidden="true">
            <span class="gaf-ranger-face">🧑‍🌾</span>
            <span class="gaf-ranger-tip">Listen closely!</span>
          </div>
        `;

        const titleEl = document.createElement('div');
        titleEl.className = 'gaf-title gp-title';
        titleEl.textContent = t('find_animal');

        const labelEl = document.createElement('div');
        labelEl.className = 'gaf-stop';
        labelEl.textContent = plan.roundLabel;

        const stageBox = document.createElement('div');
        stageBox.className = 'gaf-hideout';

        const sil = document.createElement('button');
        sil.type = 'button';
        sil.className = 'gaf-sil' + (plan.reveal === 'peek' ? ' gaf-peek' : '');
        sil.innerHTML = `<span class="gaf-sil-emoji">${correct.emoji}</span>`;
        sil.addEventListener('click', () => {
          try { A().animal(correct.id); } catch (e) {}
          celebrateEl(sil, 'sil-bounce');
        });
        stageBox.appendChild(sil);

        const listenBtn = document.createElement('button');
        listenBtn.type = 'button';
        listenBtn.className = 'gaf-listen';
        listenBtn.textContent = '🔊 Listen';
        listenBtn.addEventListener('click', () => {
          A().click();
          try { A().animal(correct.id); } catch (e) {}
        });

        const pad = document.createElement('div');
        pad.className = 'gaf-pad';

        const tipEl = arena.querySelector('.gaf-ranger-tip');
        let answered = false;

        choices.forEach(a => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'gaf-choice';
          btn.style.setProperty('--ac-bg', a.bg);
          btn.innerHTML = `
            <span class="gaf-choice-emoji">${a.emoji}</span>
            <span class="gaf-choice-name">${animalName(a)}</span>
          `;
          btn.addEventListener('click', () => {
            if (answered) return;
            if (a.id === correct.id) {
              answered = true;
              sil.classList.add('revealed');
              sil.style.setProperty('--revealed-bg', correct.bg);
              A().success();
              const r = sil.getBoundingClientRect();
              S().burstParticles(r.left + r.width / 2, r.top + r.height / 2,
                ['⭐', correct.emoji, '💖'], 12);
              try { S().showFeedback(arena, t('wonderful'), true); } catch (e) {}
              tipEl.textContent = `Yes! It is a ${animalName(correct)}!`;

              safeTimeout(() => {
                const isFinal = levelIndex >= LEVEL_COUNT - 1;
                showLevelComplete(arena, {
                  levelIndex,
                  gameId: GAME_ID,
                  title: isFinal ? 'Safari hero!' : 'Level complete!',
                  message: 'You found the hidden friend!',
                  isFinal,
                  onHub: () => openHub(stage),
                  onNext: () => {
                    if (isFinal) finishGame(arena, 3);
                    else play(stage, levelIndex + 1);
                  }
                });
              }, 800);
            } else {
              celebrateEl(btn, 'wiggle');
              try { A().animal(correct.id); } catch (e) {}
              try { S().showFeedback(arena, t('try_again'), false); } catch (e) {}
              tipEl.textContent = 'Hmm, try another animal!';
            }
          });
          pad.appendChild(btn);
        });

        arena.insertBefore(titleEl, arena.querySelector('.gaf-ranger'));
        arena.insertBefore(labelEl, arena.querySelector('.gaf-ranger'));
        arena.appendChild(stageBox);
        arena.appendChild(listenBtn);
        arena.appendChild(pad);

        renderLevelHeader(arena, levelIndex, '', () => openHub(stage));

        safeTimeout(() => {
          try { A().animal(correct.id); } catch (e) {}
        }, 400);

        let scrollT = 0;
        safeInterval(() => {
          scrollT++;
          const jeep = arena.querySelector('.gaf-jeep');
          if (jeep) jeep.style.transform = `translateX(${Math.sin(scrollT * 0.08) * 6}px)`;
        }, 100);

        stage.appendChild(arena);
      }
    }
  });
})();