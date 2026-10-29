/**
 * GAME 2: VISUAL MEMORY
 * Features collected:
 * - first_click_interval
 * - total_response_time
 * - correct_answers
 * - wrong_answers
 * - total_clicks
 * - attempts
 * - target_position
 * - selected_position
 * - accuracy
 * - difficulty
 * - raw click timestamps
 */

class VisualMemoryGame {
  constructor(soundEngine, telemetryCollector, onCompleteRound, onFinishGame) {
    this.sound = soundEngine;
    this.telemetry = telemetryCollector;
    this.onCompleteRound = onCompleteRound;
    this.onFinishGame = onFinishGame;

    this.totalRounds = 4;
    this.currentRound = 1;

    // Difficulty settings
    // Level 1: 2 choices (easy)
    // Level 2: 3 choices
    // Level 3: 4 choices
    // Level 4: 4 choices (from same category, requiring finer discrimination)
    this.difficultyConfigs = {
      1: { choicesCount: 2, sameCategory: false },
      2: { choicesCount: 3, sameCategory: false },
      3: { choicesCount: 4, sameCategory: false },
      4: { choicesCount: 4, sameCategory: true }
    };

    // State per round
    this.targetStimulus = null;
    this.choiceStimuli = []; // [{ item, isTarget, position }]
    this.targetPosition = 0;
    this.selectedPosition = -1;
    this.presentationEpoch = null;
    this.firstClickInterval = null;
    this.clickTimestamps = [];
    this.attempts = 1;
    this.maxAttempts = 2;
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.totalClicks = 0;
    this.isInputAllowed = false;

    this.container = null;
  }

  mount(containerEl) {
    this.container = containerEl;
    this.currentRound = 1;
    this.startRound();
  }

  unmount() {
    this.cleanup();
    if (this.container) this.container.innerHTML = '';
  }

  cleanup() {
    this.isInputAllowed = false;
  }

  startRound() {
    this.cleanup();
    const config = this.difficultyConfigs[this.currentRound] || this.difficultyConfigs[1];

    // Pick target
    const category = config.sameCategory ? 'shapes' : null;
    this.targetStimulus = StimuliLibrary.getRandomStimulus(category);

    // Pick distractors
    const distractorCount = config.choicesCount - 1;
    let pool;
    if (config.sameCategory && StimuliLibrary.CATALOG[this.targetStimulus.category]) {
      pool = StimuliLibrary.CATALOG[this.targetStimulus.category].filter(i => i.id !== this.targetStimulus.id);
    } else {
      pool = StimuliLibrary.getDistinctStimuli(distractorCount + 2, this.targetStimulus.id);
    }
    const distractors = pool.slice(0, distractorCount);

    // Build choices array and shuffle
    const choices = [
      { item: this.targetStimulus, isTarget: true },
      ...distractors.map(d => ({ item: d, isTarget: false }))
    ];

    // Shuffle choices
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }

    this.choiceStimuli = choices;
    this.targetPosition = choices.findIndex(c => c.isTarget);

    // Reset round tracking
    this.attempts = 1;
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.totalClicks = 0;
    this.clickTimestamps = [];
    this.firstClickInterval = null;
    this.selectedPosition = -1;
    this.isInputAllowed = false;

    this.renderObservationPhase();
  }

  /**
   * Phase 1: Observation phase (Show target cue)
   */
  renderObservationPhase() {
    let timeLeft = 3;
    this.container.innerHTML = `
      <div class="game-stage visual-memory-stage">
        <div class="stage-header">
          <div class="badge-pill">Game 2: Visual Memory</div>
          <div class="badge-pill">Round ${this.currentRound} / ${this.totalRounds}</div>
          <div class="badge-pill layout-badge">Level ${this.currentRound}</div>
        </div>

        <div class="cue-focus-card">
          <div class="prompt-text">
            <span class="prompt-icon">🧠</span> Remember this picture!
          </div>

          <div class="cue-target-display pulse-target">
            ${this.targetStimulus.render()}
          </div>
          <div class="cue-target-name">${this.targetStimulus.name}</div>

          <div class="countdown-bar-container">
            <div id="memCountdownFill" class="countdown-bar-fill" style="width: 100%;"></div>
          </div>
          <div id="memCountdownLabel" class="countdown-subtext">Memorize: ${timeLeft}s...</div>
        </div>
      </div>
    `;

    const fill = document.getElementById('memCountdownFill');
    const label = document.getElementById('memCountdownLabel');

    const interval = setInterval(() => {
      timeLeft--;
      if (label) label.textContent = `Memorize: ${timeLeft}s...`;
      if (fill) fill.style.width = `${(timeLeft / 3) * 100}%`;

      if (timeLeft <= 0) {
        clearInterval(interval);
        this.renderRetentionDelay();
      }
    }, 1000);
  }

  /**
   * Phase 2: Retention Delay (Brief mask)
   */
  renderRetentionDelay() {
    this.container.innerHTML = `
      <div class="game-stage visual-memory-stage">
        <div class="cue-focus-card mask-card">
          <div class="mask-icon">❓</div>
          <div class="countdown-subtext">Where was it? Get ready...</div>
        </div>
      </div>
    `;

    setTimeout(() => {
      this.renderChoicePhase();
    }, 600);
  }

  /**
   * Phase 3: Choice Selection Phase
   */
  renderChoicePhase() {
    this.container.innerHTML = `
      <div class="game-stage visual-memory-stage">
        <div class="stage-header">
          <div class="badge-pill">Game 2: Visual Memory</div>
          <div class="badge-pill">Round ${this.currentRound} / ${this.totalRounds}</div>
          <div class="badge-pill">Attempt ${this.attempts} / ${this.maxAttempts}</div>
        </div>

        <div class="prompt-text center-prompt">
          👉 Tap the picture you just saw!
        </div>

        <div class="choice-cards-container count-${this.choiceStimuli.length}">
          ${this.choiceStimuli.map((c, index) => `
            <button class="memory-choice-card" data-index="${index}" tabindex="0">
              <div class="choice-svg-box">${c.item.render()}</div>
            </button>
          `).join('')}
        </div>

        <div id="memoryFeedbackBanner" class="feedback-hint-banner" style="display: none;"></div>
      </div>
    `;

    this.presentationEpoch = performance.now();
    this.isInputAllowed = true;

    const cards = this.container.querySelectorAll('.memory-choice-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => this.handleChoiceClick(card, e));
    });
  }

  handleChoiceClick(cardEl, event) {
    if (!this.isInputAllowed) return;

    const now = performance.now();
    const relativeTime = now - this.presentationEpoch;
    this.clickTimestamps.push(relativeTime);
    this.totalClicks++;

    if (this.firstClickInterval === null) {
      this.firstClickInterval = Math.round(relativeTime);
    }

    const clickedIndex = parseInt(cardEl.dataset.index, 10);
    this.selectedPosition = clickedIndex;
    const choice = this.choiceStimuli[clickedIndex];

    const feedbackBanner = document.getElementById('memoryFeedbackBanner');

    if (choice.isTarget) {
      // Correct!
      this.isInputAllowed = false;
      this.correctAnswers = 1;
      cardEl.classList.add('choice-correct');
      this.sound.playSuccessChime();

      if (feedbackBanner) {
        feedbackBanner.style.display = 'block';
        feedbackBanner.className = 'feedback-hint-banner banner-success';
        feedbackBanner.textContent = '🎉 You found it! Great memory!';
      }

      setTimeout(() => {
        this.finishRound(true, relativeTime);
      }, 1000);
    } else {
      // Wrong!
      this.wrongAnswers++;
      cardEl.classList.add('choice-wrong');
      this.sound.playRetryCue();

      if (this.attempts < this.maxAttempts) {
        this.attempts++;
        if (feedbackBanner) {
          feedbackBanner.style.display = 'block';
          feedbackBanner.className = 'feedback-hint-banner banner-warning';
          feedbackBanner.textContent = '🤔 Not that one! Try one more time!';
        }
      } else {
        // Out of attempts
        this.isInputAllowed = false;
        this.correctAnswers = 0;
        if (feedbackBanner) {
          feedbackBanner.style.display = 'block';
          feedbackBanner.className = 'feedback-hint-banner banner-retry';
          feedbackBanner.textContent = 'Good effort! Let’s see the next one.';
        }

        setTimeout(() => {
          this.finishRound(false, relativeTime);
        }, 1200);
      }
    }
  }

  finishRound(isCorrect, totalResponseTime) {
    this.cleanup();

    const accuracy = this.totalClicks > 0 ? (this.correctAnswers / this.totalClicks) : 0;

    const recordedRound = this.telemetry.recordVisualMemoryRound({
      round_number: this.currentRound,
      difficulty: this.currentRound,
      first_click_interval: this.firstClickInterval,
      total_response_time: totalResponseTime,
      correct_answers: this.correctAnswers,
      wrong_answers: this.wrongAnswers,
      total_clicks: this.totalClicks,
      attempts: this.attempts,
      target_position: this.targetPosition,
      selected_position: this.selectedPosition,
      accuracy: accuracy,
      target_cue: this.targetStimulus.name,
      selected_cue: this.choiceStimuli[this.selectedPosition] ? this.choiceStimuli[this.selectedPosition].item.name : '',
      click_timestamps: this.clickTimestamps
    });

    this.renderRoundCompleteModal(recordedRound, isCorrect);
  }

  renderRoundCompleteModal(recordedRound, isCorrect) {
    this.container.innerHTML = `
      <div class="game-stage round-feedback-stage">
        <div class="feedback-card">
          <div class="feedback-icon">${isCorrect ? '⭐' : '💪'}</div>
          <h3 class="feedback-title">${isCorrect ? 'Well Done!' : 'Nice Effort!'}</h3>
          <p class="feedback-subtext">Round ${this.currentRound} finished.</p>

          <div class="mini-metrics-pill-grid">
            <div class="m-pill">
              <span class="m-label">First Click:</span>
              <span class="m-val">${recordedRound.first_click_interval} ms</span>
            </div>
            <div class="m-pill">
              <span class="m-label">Response Time:</span>
              <span class="m-val">${Math.round(recordedRound.total_response_time)} ms</span>
            </div>
            <div class="m-pill">
              <span class="m-label">Attempts:</span>
              <span class="m-val">${recordedRound.attempts}</span>
            </div>
          </div>

          <button id="nextRoundBtn" class="primary-btn pulse-anim">
            <span>${this.currentRound < this.totalRounds ? 'Next Round' : 'Complete Game 2'}</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById('nextRoundBtn').addEventListener('click', () => {
      if (this.currentRound < this.totalRounds) {
        this.currentRound++;
        if (this.onCompleteRound) this.onCompleteRound('visual_memory', this.currentRound);
        this.startRound();
      } else {
        if (this.onFinishGame) this.onFinishGame('visual_memory');
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.VisualMemoryGame = VisualMemoryGame;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisualMemoryGame;
}

