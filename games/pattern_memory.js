/**
 * GAME 4: PATTERN MEMORY
 * Preserves the original Pattern Quest mechanics while precisely logging:
 * - first_click_interval
 * - second_click_interval
 * - third_click_interval
 * - fourth_click_interval
 * - fifth_click_interval
 * - total_clicks
 * - correct_clicks
 * - wrong_clicks
 * - completion_time
 * - accuracy
 * - efficiency
 * - pattern_length
 * - difficulty
 * 
 * Levels:
 * 1: 3×3 → 2 tiles
 * 2: 3×3 → 3 tiles
 * 3: 3×3 → 4 tiles
 * 4: 4×4 → 4 tiles
 * 5: 4×4 → 5 tiles
 */

class PatternMemoryGame {
  constructor(soundEngine, telemetryCollector, onCompleteRound, onFinishGame) {
    this.sound = soundEngine;
    this.telemetry = telemetryCollector;
    this.onCompleteRound = onCompleteRound;
    this.onFinishGame = onFinishGame;

    this.levelConfigs = {
      1: { gridSize: 3, patternLength: 2, label: '3×3 (2 tiles)' },
      2: { gridSize: 3, patternLength: 3, label: '3×3 (3 tiles)' },
      3: { gridSize: 3, patternLength: 4, label: '3×3 (4 tiles)' },
      4: { gridSize: 4, patternLength: 4, label: '4×4 (4 tiles)' },
      5: { gridSize: 4, patternLength: 5, label: '4×4 (5 tiles)' }
    };

    this.totalRounds = 5;
    this.currentRound = 1;

    // Timing constants
    this.HIGHLIGHT_DURATION_MS = 600;
    this.INTER_TILE_PAUSE_MS = 250;

    // Round state
    this.currentPattern = [];
    this.userSelectedIndices = [];
    this.userStep = 0;
    this.roundAttempts = 1;
    this.maxAttempts = 2;
    this.correctClicks = 0;
    this.wrongClicks = 0;
    this.totalClicks = 0;

    this.inputEnabledEpoch = null;
    this.firstClickEpoch = null;
    this.lastClickEpoch = null;
    this.clickTimestamps = [];
    this.isInputAllowed = false;
    this.lastDebounce = 0;

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

  generateRandomSequence(totalTiles, length) {
    const pool = Array.from({ length: totalTiles }, (_, i) => i);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, length);
  }

  startRound() {
    this.cleanup();
    const config = this.levelConfigs[this.currentRound] || this.levelConfigs[1];
    const totalTiles = config.gridSize * config.gridSize;

    this.currentPattern = this.generateRandomSequence(totalTiles, config.patternLength);
    this.userSelectedIndices = [];
    this.userStep = 0;
    this.roundAttempts = 1;
    this.correctClicks = 0;
    this.wrongClicks = 0;
    this.totalClicks = 0;
    this.clickTimestamps = [];
    this.inputEnabledEpoch = null;
    this.firstClickEpoch = null;
    this.lastClickEpoch = null;

    this.renderStage(config);

    // Presentation start
    setTimeout(() => {
      this.presentSequence();
    }, 500);
  }

  renderStage(config) {
    this.container.innerHTML = `
      <div class="game-stage pattern-memory-stage">
        <div class="stage-header">
          <div class="badge-pill">Game 4: Pattern Memory</div>
          <div class="badge-pill">Round ${this.currentRound} / ${this.totalRounds}</div>
          <div class="badge-pill">${config.label}</div>
        </div>

        <div id="patternStatusBanner" class="status-banner banner-watch">
          <span id="patternStatusIcon" class="status-banner-icon">👀</span>
          <span id="patternStatusText" class="status-banner-text">Watch the pattern lights carefully...</span>
        </div>

        <div class="pattern-grid-wrapper">
          <div id="patternGrid" class="game-grid grid-${config.gridSize}x${config.gridSize} grid-disabled">
            ${Array.from({ length: config.gridSize * config.gridSize }, (_, i) => `
              <button class="tile" data-index="${i}" aria-label="Tile ${i + 1}"></button>
            `).join('')}
          </div>
        </div>

        <div class="attempt-indicator-bar">
          <span class="attempt-label">Attempt:</span>
          <div id="patternAttemptIndicator" class="attempt-dots">
            <span class="attempt-dot active"></span>
            <span class="attempt-dot"></span>
          </div>
        </div>
      </div>
    `;

    const tiles = this.container.querySelectorAll('.tile');
    tiles.forEach(tile => {
      const idx = parseInt(tile.dataset.index, 10);
      tile.addEventListener('click', (e) => this.handleTileClick(idx, tile, e));
    });
  }

  updateAttemptIndicator() {
    const dots = this.container.querySelectorAll('.attempt-dot');
    dots.forEach((dot, index) => {
      dot.className = 'attempt-dot';
      if (index + 1 === this.roundAttempts) {
        dot.classList.add('active');
      } else if (index + 1 < this.roundAttempts) {
        dot.classList.add('failed');
      }
    });
  }

  setBanner(type, icon, text) {
    const banner = document.getElementById('patternStatusBanner');
    const iconEl = document.getElementById('patternStatusIcon');
    const textEl = document.getElementById('patternStatusText');
    if (!banner) return;

    banner.className = `status-banner banner-${type}`;
    if (iconEl) iconEl.textContent = icon;
    if (textEl) textEl.textContent = text;
  }

  presentSequence() {
    this.isInputAllowed = false;
    const gridEl = document.getElementById('patternGrid');
    if (gridEl) gridEl.classList.add('grid-disabled');
    this.setBanner('watch', '👀', 'Watch the glowing lights...');

    let step = 0;
    const playNext = () => {
      if (step >= this.currentPattern.length) {
        setTimeout(() => {
          this.enableUserInput();
        }, 350);
        return;
      }

      const tileIndex = this.currentPattern[step];
      const tileEl = this.container ? this.container.querySelector(`.tile[data-index="${tileIndex}"]`) : null;

      if (tileEl) {
        tileEl.classList.add('highlighted');
        this.sound.playTileHighlight(tileIndex);

        setTimeout(() => {
          tileEl.classList.remove('highlighted');
          step++;
          setTimeout(playNext, this.INTER_TILE_PAUSE_MS);
        }, this.HIGHLIGHT_DURATION_MS);
      } else {
        step++;
        playNext();
      }
    };

    playNext();
  }

  enableUserInput() {
    this.isInputAllowed = true;
    const gridEl = document.getElementById('patternGrid');
    if (gridEl) gridEl.classList.remove('grid-disabled');
    this.setBanner('turn', '👉', 'Your turn! Tap the tiles in order');

    this.inputEnabledEpoch = performance.now();
    this.userStep = 0;
    this.userSelectedIndices = [];
  }

  handleTileClick(tileIndex, tileEl, event) {
    if (!this.isInputAllowed) return;

    // Debounce
    const now = performance.now();
    if (now - this.lastDebounce < 80) return;
    this.lastDebounce = now;

    // Track click timestamps relative to inputEnabledEpoch
    const relativeTime = now - this.inputEnabledEpoch;
    this.clickTimestamps.push(relativeTime);
    this.totalClicks++;

    if (this.firstClickEpoch === null) {
      this.firstClickEpoch = now;
    }
    this.lastClickEpoch = now;

    this.userSelectedIndices.push(tileIndex);
    const expected = this.currentPattern[this.userStep];

    if (tileIndex === expected) {
      // Correct click
      this.correctClicks++;
      tileEl.classList.add('selected');
      this.sound.playTileClick(tileIndex);

      setTimeout(() => {
        tileEl.classList.remove('selected');
      }, 250);

      this.userStep++;

      if (this.userStep === this.currentPattern.length) {
        // Complete pattern matched!
        this.handleSuccess();
      }
    } else {
      // Wrong click
      this.wrongClicks++;
      tileEl.classList.add('wrong');
      this.sound.playRetryCue();

      setTimeout(() => {
        tileEl.classList.remove('wrong');
      }, 350);

      this.handleFailure();
    }
  }

  handleSuccess() {
    this.isInputAllowed = false;
    const gridEl = document.getElementById('patternGrid');
    if (gridEl) gridEl.classList.add('grid-disabled');
    this.setBanner('success', '⭐', 'Great job! Pattern matched!');
    this.sound.playSuccessChime();

    setTimeout(() => {
      this.finishRound(true);
    }, 1100);
  }

  handleFailure() {
    this.isInputAllowed = false;
    const gridEl = document.getElementById('patternGrid');
    if (gridEl) gridEl.classList.add('grid-disabled');

    if (this.roundAttempts < this.maxAttempts) {
      this.roundAttempts++;
      this.updateAttemptIndicator();
      this.setBanner('retry', '🔄', 'Try again! Watch one more time.');

      setTimeout(() => {
        this.presentSequence();
      }, 1000);
    } else {
      this.setBanner('retry', '💪', 'Good effort! Moving to next round.');

      setTimeout(() => {
        this.finishRound(false);
      }, 1200);
    }
  }

  finishRound(isCorrect) {
    this.cleanup();
    const config = this.levelConfigs[this.currentRound] || this.levelConfigs[1];

    const completionTime = (this.lastClickEpoch && this.inputEnabledEpoch)
      ? (this.lastClickEpoch - this.inputEnabledEpoch)
      : 0;

    const accuracy = this.totalClicks > 0 ? (this.correctClicks / this.totalClicks) : 0;
    const efficiency = this.totalClicks > 0 ? (config.patternLength / this.totalClicks) : 0;

    const recordedRound = this.telemetry.recordPatternMemoryRound({
      round_number: this.currentRound,
      difficulty: this.currentRound,
      pattern_length: config.patternLength,
      grid_size: config.gridSize,
      total_clicks: this.totalClicks,
      correct_clicks: this.correctClicks,
      wrong_clicks: this.wrongClicks,
      completion_time: completionTime,
      accuracy: accuracy,
      efficiency: efficiency,
      pattern_positions: this.currentPattern,
      selected_positions: this.userSelectedIndices,
      click_timestamps: this.clickTimestamps
    });

    this.renderRoundCompleteModal(recordedRound, isCorrect);
  }

  renderRoundCompleteModal(recordedRound, isCorrect) {
    this.container.innerHTML = `
      <div class="game-stage round-feedback-stage">
        <div class="feedback-card">
          <div class="feedback-icon">${isCorrect ? '🏆' : '✨'}</div>
          <h3 class="feedback-title">${isCorrect ? 'Awesome Memory!' : 'Good Try!'}</h3>
          <p class="feedback-subtext">Level ${this.currentRound} complete.</p>

          <div class="mini-metrics-pill-grid">
            <div class="m-pill">
              <span class="m-label">First Click:</span>
              <span class="m-val">${recordedRound.first_click_interval !== null ? recordedRound.first_click_interval + ' ms' : 'N/A'}</span>
            </div>
            <div class="m-pill">
              <span class="m-label">Second Click:</span>
              <span class="m-val">${recordedRound.second_click_interval !== null ? recordedRound.second_click_interval + ' ms' : 'N/A'}</span>
            </div>
            <div class="m-pill">
              <span class="m-label">Completion Time:</span>
              <span class="m-val">${Math.round(recordedRound.completion_time)} ms</span>
            </div>
          </div>

          <button id="nextRoundBtn" class="primary-btn pulse-anim">
            <span>${this.currentRound < this.totalRounds ? 'Next Level' : 'Complete Game 4'}</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById('nextRoundBtn').addEventListener('click', () => {
      if (this.currentRound < this.totalRounds) {
        this.currentRound++;
        if (this.onCompleteRound) this.onCompleteRound('pattern_memory', this.currentRound);
        this.startRound();
      } else {
        if (this.onFinishGame) this.onFinishGame('pattern_memory');
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.PatternMemoryGame = PatternMemoryGame;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PatternMemoryGame;
}

