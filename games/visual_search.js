/**
 * GAME 1: VISUAL SEARCH
 * Features collected:
 * - first_click_interval, second_click_interval, third_click_interval,
 *   fourth_click_interval, fifth_click_interval, sixth_click_interval
 * - time_last_click, total_clicks
 * - correct_answers, wrong_answers
 * - distractor_1_clicks, distractor_2_clicks, distractor_3_clicks
 * - efficiency, accuracy
 * - raw click timestamps
 */

class VisualSearchGame {
  constructor(soundEngine, telemetryCollector, onCompleteRound, onFinishGame) {
    this.sound = soundEngine;
    this.telemetry = telemetryCollector;
    this.onCompleteRound = onCompleteRound;
    this.onFinishGame = onFinishGame;

    this.categories = [
      'symbols', 'shapes', 'z_shapes', 'rectangles',
      'faces', 'fruits', 'kitchen', 'plants', 'animals'
    ];

    this.totalRounds = 4;
    this.currentRound = 1;
    this.roundDurationSec = 15; // 15-second active search window

    // Round state
    this.targetStimulus = null;
    this.distractorStimuli = []; // [d1, d2, d3, ...]
    this.gridDim = 2; // 2x2 or 3x3
    this.searchStartEpoch = null;
    this.clickTimestamps = [];
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.distractorClicks = { 0: 0, 1: 0, 2: 0, other: 0 };
    this.timerInterval = null;
    this.timerTimeLeft = 0;
    this.isActive = false;

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
    this.isActive = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  startRound() {
    this.cleanup();

    // Select category and layout
    // Rounds 1-2: 2x2 layout. Rounds 3-4: 3x3 layout.
    this.gridDim = this.currentRound <= 2 ? 2 : 3;
    const catIndex = (this.currentRound - 1) % this.categories.length;
    const currentCategory = this.categories[catIndex];

    // Pick target from category
    this.targetStimulus = StimuliLibrary.getRandomStimulus(currentCategory);

    // Pick 3 dedicated distractors from other items
    this.distractorStimuli = StimuliLibrary.getDistinctStimuli(3, this.targetStimulus.id);

    // Reset tracking
    this.clickTimestamps = [];
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.distractorClicks = { 0: 0, 1: 0, 2: 0, other: 0 };
    this.searchStartEpoch = null;

    this.renderInspectionPhase();
  }

  /**
   * Phase 1: Show target cue for ~3 seconds
   */
  renderInspectionPhase() {
    let countdown = 3;
    this.container.innerHTML = `
      <div class="game-stage visual-search-stage">
        <div class="stage-header">
          <div class="badge-pill">Game 1: Visual Search</div>
          <div class="badge-pill">Round ${this.currentRound} / ${this.totalRounds}</div>
          <div class="badge-pill layout-badge">${this.gridDim}×${this.gridDim} Grid</div>
        </div>

        <div class="cue-focus-card">
          <div class="prompt-text">
            <span class="prompt-icon">👀</span> Look closely at this target!
          </div>

          <div class="cue-target-display pulse-target">
            ${this.targetStimulus.render()}
          </div>
          <div class="cue-target-name">${this.targetStimulus.name}</div>

          <div class="countdown-bar-container">
            <div id="cueCountdownFill" class="countdown-bar-fill" style="width: 100%;"></div>
          </div>
          <div id="cueCountdownLabel" class="countdown-subtext">Starting in ${countdown}...</div>
        </div>
      </div>
    `;

    const countdownFill = document.getElementById('cueCountdownFill');
    const countdownLabel = document.getElementById('cueCountdownLabel');

    const interval = setInterval(() => {
      countdown--;
      if (countdownLabel) countdownLabel.textContent = `Starting in ${countdown}...`;
      if (countdownFill) countdownFill.style.width = `${(countdown / 3) * 100}%`;

      if (countdown <= 0) {
        clearInterval(interval);
        this.renderSearchPhase();
      }
    }, 1000);
  }

  /**
   * Phase 2: Active Search Grid (Find & click target repeatedly within limited time)
   */
  renderSearchPhase() {
    this.isActive = true;
    this.timerTimeLeft = this.roundDurationSec;

    this.container.innerHTML = `
      <div class="game-stage visual-search-stage">
        <div class="stage-header">
          <div class="hud-item"><span class="hud-label">Find:</span> <span class="mini-target-preview">${this.targetStimulus.render()}</span></div>
          <div class="hud-item"><span class="hud-label">Hits:</span> <strong id="searchHitCounter" class="stat-highlight">0</strong></div>
          <div class="hud-item timer-hud">
            <span class="hud-label">Time:</span>
            <span id="searchTimerNumber" class="timer-bold">${this.timerTimeLeft}s</span>
          </div>
        </div>

        <div class="timer-track">
          <div id="searchTimerBar" class="timer-bar" style="width: 100%;"></div>
        </div>

        <div class="search-arena-wrapper">
          <div id="searchGrid" class="search-grid search-grid-${this.gridDim}x${this.gridDim}">
            <!-- Dynamic Grid Cells -->
          </div>
        </div>

        <div class="helper-hint">
          ✨ Tap the matching target as many times as you can! Positions shuffle every tap!
        </div>
      </div>
    `;

    this.searchStartEpoch = performance.now();
    this.populateAndShuffleGrid();
    this.startRoundCountdown();
  }

  startRoundCountdown() {
    const timerBar = document.getElementById('searchTimerBar');
    const timerNumber = document.getElementById('searchTimerNumber');

    this.timerInterval = setInterval(() => {
      this.timerTimeLeft -= 0.1;
      if (this.timerTimeLeft <= 0) {
        this.timerTimeLeft = 0;
        this.finishRound();
        return;
      }

      if (timerNumber) {
        timerNumber.textContent = `${Math.ceil(this.timerTimeLeft)}s`;
      }
      if (timerBar) {
        const pct = (this.timerTimeLeft / this.roundDurationSec) * 100;
        timerBar.style.width = `${Math.max(0, pct)}%`;
        if (pct < 25) {
          timerBar.classList.add('urgent');
        }
      }
    }, 100);
  }

  /**
   * Populates grid with 1 target and (total - 1) distractors, randomized!
   */
  populateAndShuffleGrid() {
    const gridEl = document.getElementById('searchGrid');
    if (!gridEl || !this.isActive) return;

    gridEl.innerHTML = '';
    const totalSlots = this.gridDim * this.gridDim;
    const targetSlotIndex = Math.floor(Math.random() * totalSlots);

    for (let slot = 0; slot < totalSlots; slot++) {
      const tileBtn = document.createElement('button');
      tileBtn.className = 'search-tile';
      tileBtn.setAttribute('tabindex', '0');

      if (slot === targetSlotIndex) {
        tileBtn.dataset.type = 'target';
        tileBtn.innerHTML = this.targetStimulus.render();
      } else {
        // Pick one of the distractors
        const distractorIdx = slot % this.distractorStimuli.length;
        tileBtn.dataset.type = 'distractor';
        tileBtn.dataset.distractorIndex = distractorIdx;
        tileBtn.innerHTML = this.distractorStimuli[distractorIdx].render();
      }

      tileBtn.addEventListener('click', (e) => this.handleTileClick(tileBtn, e));
      gridEl.appendChild(tileBtn);
    }
  }

  handleTileClick(tileBtn, event) {
    if (!this.isActive) return;

    const clickNow = performance.now();
    const relativeTime = clickNow - this.searchStartEpoch;
    this.clickTimestamps.push(relativeTime);

    const isTarget = tileBtn.dataset.type === 'target';

    if (isTarget) {
      this.correctAnswers++;
      this.sound.playTileClick(this.correctAnswers);
      tileBtn.classList.add('click-correct');
    } else {
      this.wrongAnswers++;
      const distractorIndex = parseInt(tileBtn.dataset.distractorIndex, 10);
      if (distractorIndex in this.distractorClicks) {
        this.distractorClicks[distractorIndex]++;
      } else {
        this.distractorClicks.other++;
      }
      this.sound.playRetryCue();
      tileBtn.classList.add('click-wrong');
    }

    // Update hits count in HUD
    const counterEl = document.getElementById('searchHitCounter');
    if (counterEl) counterEl.textContent = this.correctAnswers;

    // Requirement: "Randomize positions after every click."
    setTimeout(() => {
      this.populateAndShuffleGrid();
    }, 120);
  }

  finishRound() {
    this.cleanup();

    const totalClicks = this.clickTimestamps.length;
    const timeLastClick = totalClicks > 0 ? this.clickTimestamps[totalClicks - 1] : 0;
    const accuracy = totalClicks > 0 ? (this.correctAnswers / totalClicks) : 0;
    const efficiency = totalClicks > 0 ? (this.correctAnswers / totalClicks) : 0;

    // Record behavioral features in centralized TelemetryCollector
    const recordedRound = this.telemetry.recordVisualSearchRound({
      round_number: this.currentRound,
      difficulty: this.gridDim === 2 ? 1 : 2,
      grid_layout: `${this.gridDim}x${this.gridDim}`,
      target_category: this.targetStimulus.category,
      target_id: this.targetStimulus.id,
      click_timestamps: this.clickTimestamps,
      time_last_click: timeLastClick,
      total_clicks: totalClicks,
      correct_answers: this.correctAnswers,
      wrong_answers: this.wrongAnswers,
      distractor_1_clicks: this.distractorClicks[0] || 0,
      distractor_2_clicks: this.distractorClicks[1] || 0,
      distractor_3_clicks: this.distractorClicks[2] || 0,
      efficiency: efficiency,
      accuracy: accuracy
    });

    this.sound.playSuccessChime();
    this.renderRoundCompleteModal(recordedRound);
  }

  renderRoundCompleteModal(recordedRound) {
    this.container.innerHTML = `
      <div class="game-stage round-feedback-stage">
        <div class="feedback-card">
          <div class="feedback-icon">🌟</div>
          <h3 class="feedback-title">Round ${this.currentRound} Done!</h3>
          <p class="feedback-subtext">You found <strong>${this.correctAnswers}</strong> targets!</p>

          <div class="mini-metrics-pill-grid">
            <div class="m-pill">
              <span class="m-label">First Click:</span>
              <span class="m-val">${recordedRound.first_click_interval !== null ? recordedRound.first_click_interval + ' ms' : 'N/A'}</span>
            </div>
            <div class="m-pill">
              <span class="m-label">Total Clicks:</span>
              <span class="m-val">${recordedRound.total_clicks}</span>
            </div>
            <div class="m-pill">
              <span class="m-label">Accuracy:</span>
              <span class="m-val">${Math.round(recordedRound.accuracy * 100)}%</span>
            </div>
          </div>

          <button id="nextRoundBtn" class="primary-btn pulse-anim">
            <span>${this.currentRound < this.totalRounds ? 'Next Round' : 'Complete Game 1'}</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById('nextRoundBtn').addEventListener('click', () => {
      if (this.currentRound < this.totalRounds) {
        this.currentRound++;
        if (this.onCompleteRound) this.onCompleteRound('visual_search', this.currentRound);
        this.startRound();
      } else {
        if (this.onFinishGame) this.onFinishGame('visual_search');
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.VisualSearchGame = VisualSearchGame;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisualSearchGame;
}

