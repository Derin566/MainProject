/**
 * GAME 3: VISUAL SYMMETRY / DISCRIMINATION
 * Features collected:
 * - first_click_interval
 * - subsequent_click_intervals
 * - total_clicks
 * - correct_answers
 * - wrong_answers
 * - distractor_1_clicks (e.g. mirrored horizontal)
 * - distractor_2_clicks (e.g. mirrored vertical / rotated)
 * - distractor_3_clicks (e.g. visually similar shape)
 * - accuracy
 * - efficiency
 * - error_type (mirrored_horizontal, mirrored_vertical, rotated_90, visually_similar, none)
 * 
 * Strict research notice:
 * No diagnostic assertions are made regarding symmetry/mirroring errors.
 */

class VisualSymmetryGame {
  constructor(soundEngine, telemetryCollector, onCompleteRound, onFinishGame) {
    this.sound = soundEngine;
    this.telemetry = telemetryCollector;
    this.onCompleteRound = onCompleteRound;
    this.onFinishGame = onFinishGame;

    this.totalRounds = 4;
    this.currentRound = 1;

    // Round state
    this.template = null;
    this.targetVariant = null;
    this.choices = []; // [{ type, isTarget, svgHtml, distractorCategory }]
    this.presentationEpoch = null;
    this.clickTimestamps = [];
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.totalClicks = 0;
    this.distractor1Clicks = 0;
    this.distractor2Clicks = 0;
    this.distractor3Clicks = 0;
    this.firstErrorType = 'none';
    this.isInputAllowed = false;
    this.attempts = 1;
    this.maxAttempts = 2;

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

    // Generate symmetry challenge from library
    const challenge = StimuliLibrary.getSymmetryChallenge(this.currentRound);
    this.template = challenge.template;
    this.targetVariant = challenge.targetVariant;

    // Build choices
    const rawChoices = [
      {
        type: 'original',
        label: 'Exact Target',
        isTarget: true,
        distractorCategory: null,
        svgHtml: StimuliLibrary.renderSymmetryVariant(this.template, 'original')
      },
      {
        type: challenge.distractors[0].type, // 'mirrored_horizontal'
        label: 'Mirrored Horizontal',
        isTarget: false,
        distractorCategory: 'distractor_1',
        svgHtml: StimuliLibrary.renderSymmetryVariant(this.template, challenge.distractors[0].type)
      },
      {
        type: challenge.distractors[1].type, // 'mirrored_vertical' or 'rotated_90'
        label: challenge.distractors[1].type,
        isTarget: false,
        distractorCategory: 'distractor_2',
        svgHtml: StimuliLibrary.renderSymmetryVariant(this.template, challenge.distractors[1].type)
      },
      {
        type: challenge.distractors[2].type, // 'visually_similar'
        label: 'Visually Similar Alteration',
        isTarget: false,
        distractorCategory: 'distractor_3',
        svgHtml: StimuliLibrary.renderSymmetryVariant(this.template, challenge.distractors[2].type)
      }
    ];

    // Shuffle choices
    for (let i = rawChoices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawChoices[i], rawChoices[j]] = [rawChoices[j], rawChoices[i]];
    }

    this.choices = rawChoices;

    // Reset tracking
    this.clickTimestamps = [];
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.totalClicks = 0;
    this.distractor1Clicks = 0;
    this.distractor2Clicks = 0;
    this.distractor3Clicks = 0;
    this.firstErrorType = 'none';
    this.attempts = 1;

    this.renderStage();
  }

  renderStage() {
    const targetSvg = StimuliLibrary.renderSymmetryVariant(this.template, 'original');

    this.container.innerHTML = `
      <div class="game-stage symmetry-stage">
        <div class="stage-header">
          <div class="badge-pill">Game 3: Symmetry & Discrimination</div>
          <div class="badge-pill">Round ${this.currentRound} / ${this.totalRounds}</div>
          <div class="badge-pill">Attempt ${this.attempts} / ${this.maxAttempts}</div>
        </div>

        <div class="symmetry-target-card">
          <div class="prompt-text">
            🔍 Find the exact match! (Watch out for flipped or turned shapes)
          </div>
          <div class="symmetry-target-display pulse-target">
            ${targetSvg}
          </div>
        </div>

        <div class="prompt-text center-prompt">
          Which one is identical to the target above?
        </div>

        <div class="symmetry-choices-grid">
          ${this.choices.map((choice, index) => `
            <button class="symmetry-choice-card" data-index="${index}" tabindex="0">
              <div class="choice-num-tag">${index + 1}</div>
              <div class="symmetry-choice-svg">${choice.svgHtml}</div>
            </button>
          `).join('')}
        </div>

        <div id="symmetryFeedbackBanner" class="feedback-hint-banner" style="display: none;"></div>
      </div>
    `;

    this.presentationEpoch = performance.now();
    this.isInputAllowed = true;

    const cards = this.container.querySelectorAll('.symmetry-choice-card');
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

    const index = parseInt(cardEl.dataset.index, 10);
    const choice = this.choices[index];
    const feedbackBanner = document.getElementById('symmetryFeedbackBanner');

    if (choice.isTarget) {
      // Correct!
      this.isInputAllowed = false;
      this.correctAnswers = 1;
      cardEl.classList.add('choice-correct');
      this.sound.playSuccessChime();

      if (feedbackBanner) {
        feedbackBanner.style.display = 'block';
        feedbackBanner.className = 'feedback-hint-banner banner-success';
        feedbackBanner.textContent = '🎉 Exact match found!';
      }

      setTimeout(() => {
        this.finishRound(true);
      }, 1000);
    } else {
      // Distractor clicked
      this.wrongAnswers++;
      cardEl.classList.add('choice-wrong');
      this.sound.playRetryCue();

      if (this.firstErrorType === 'none') {
        this.firstErrorType = choice.type;
      }

      if (choice.distractorCategory === 'distractor_1') this.distractor1Clicks++;
      if (choice.distractorCategory === 'distractor_2') this.distractor2Clicks++;
      if (choice.distractorCategory === 'distractor_3') this.distractor3Clicks++;

      if (this.attempts < this.maxAttempts) {
        this.attempts++;
        if (feedbackBanner) {
          feedbackBanner.style.display = 'block';
          feedbackBanner.className = 'feedback-hint-banner banner-warning';
          feedbackBanner.textContent = '👀 That one is flipped or rotated! Look closely at the original.';
        }
      } else {
        // Out of attempts
        this.isInputAllowed = false;
        this.correctAnswers = 0;
        if (feedbackBanner) {
          feedbackBanner.style.display = 'block';
          feedbackBanner.className = 'feedback-hint-banner banner-retry';
          feedbackBanner.textContent = 'Good try! Moving to next round.';
        }

        setTimeout(() => {
          this.finishRound(false);
        }, 1200);
      }
    }
  }

  finishRound(isCorrect) {
    this.cleanup();

    const accuracy = this.totalClicks > 0 ? (this.correctAnswers / this.totalClicks) : 0;
    const efficiency = this.totalClicks > 0 ? (this.correctAnswers / this.totalClicks) : 0;
    const intervals = TelemetryCollector.calculateClickIntervals(this.clickTimestamps);

    const recordedRound = this.telemetry.recordSymmetryRound({
      round_number: this.currentRound,
      difficulty: this.currentRound,
      first_click_interval: intervals[0] || 0,
      total_clicks: this.totalClicks,
      correct_answers: this.correctAnswers,
      wrong_answers: this.wrongAnswers,
      distractor_1_clicks: this.distractor1Clicks,
      distractor_2_clicks: this.distractor2Clicks,
      distractor_3_clicks: this.distractor3Clicks,
      accuracy: accuracy,
      efficiency: efficiency,
      error_type: this.firstErrorType,
      target_cue: this.template.name,
      selected_cue: this.firstErrorType === 'none' ? 'original' : this.firstErrorType,
      click_timestamps: this.clickTimestamps
    });

    this.renderRoundCompleteModal(recordedRound, isCorrect);
  }

  renderRoundCompleteModal(recordedRound, isCorrect) {
    this.container.innerHTML = `
      <div class="game-stage round-feedback-stage">
        <div class="feedback-card">
          <div class="feedback-icon">${isCorrect ? '✨' : '🎯'}</div>
          <h3 class="feedback-title">${isCorrect ? 'Excellent Discrimination!' : 'Good Effort!'}</h3>
          <p class="feedback-subtext">Round ${this.currentRound} complete.</p>

          <div class="mini-metrics-pill-grid">
            <div class="m-pill">
              <span class="m-label">First Click:</span>
              <span class="m-val">${recordedRound.first_click_interval} ms</span>
            </div>
            <div class="m-pill">
              <span class="m-label">Distractor Clicks:</span>
              <span class="m-val">${recordedRound.distractor_1_clicks + recordedRound.distractor_2_clicks + recordedRound.distractor_3_clicks}</span>
            </div>
            <div class="m-pill">
              <span class="m-label">Error Type:</span>
              <span class="m-val">${recordedRound.error_type}</span>
            </div>
          </div>

          <button id="nextRoundBtn" class="primary-btn pulse-anim">
            <span>${this.currentRound < this.totalRounds ? 'Next Round' : 'Complete Game 3'}</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById('nextRoundBtn').addEventListener('click', () => {
      if (this.currentRound < this.totalRounds) {
        this.currentRound++;
        if (this.onCompleteRound) this.onCompleteRound('symmetry', this.currentRound);
        this.startRound();
      } else {
        if (this.onFinishGame) this.onFinishGame('symmetry');
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.VisualSymmetryGame = VisualSymmetryGame;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisualSymmetryGame;
}

