/**
 * GAME 6: RHYTHM / AUDITORY SEQUENCE
 * Features collected:
 * - target_audio_repetitions
 * - round_duration
 * - thinking_duration
 * - correct_answers
 * - wrong_answers
 * - total_answers
 * - selected_cue
 * - selected_button_position
 * - sequence_length
 * - timing_error
 * - raw click timestamps
 */

class RhythmGame {
  constructor(soundEngine, telemetryCollector, onCompleteRound, onFinishGame) {
    this.sound = soundEngine;
    this.telemetry = telemetryCollector;
    this.onCompleteRound = onCompleteRound;
    this.onFinishGame = onFinishGame;

    this.totalRounds = 4;
    this.currentRound = 1;

    // Rhythm configs for each level
    this.roundPresets = {
      1: {
        difficulty: 1,
        length: 3,
        target: {
          id: 'rhythm_tap_tap_clap',
          name: 'Tap • Tap • Clap',
          beats: [
            { type: 'TAP', timeOffsetMs: 0 },
            { type: 'TAP', timeOffsetMs: 400 },
            { type: 'CLAP', timeOffsetMs: 800 }
          ]
        },
        candidates: [
          {
            id: 'rhythm_tap_tap_clap',
            name: 'Tap • Tap • Clap',
            isTarget: true,
            beats: [
              { type: 'TAP', timeOffsetMs: 0 },
              { type: 'TAP', timeOffsetMs: 400 },
              { type: 'CLAP', timeOffsetMs: 800 }
            ]
          },
          {
            id: 'rhythm_tap_clap_tap',
            name: 'Tap • Clap • Tap',
            isTarget: false,
            beats: [
              { type: 'TAP', timeOffsetMs: 0 },
              { type: 'CLAP', timeOffsetMs: 400 },
              { type: 'TAP', timeOffsetMs: 800 }
            ]
          },
          {
            id: 'rhythm_clap_tap_tap',
            name: 'Clap • Tap • Tap',
            isTarget: false,
            beats: [
              { type: 'CLAP', timeOffsetMs: 0 },
              { type: 'TAP', timeOffsetMs: 400 },
              { type: 'TAP', timeOffsetMs: 800 }
            ]
          },
          {
            id: 'rhythm_tap_tap_tap',
            name: 'Tap • Tap • Tap',
            isTarget: false,
            beats: [
              { type: 'TAP', timeOffsetMs: 0 },
              { type: 'TAP', timeOffsetMs: 400 },
              { type: 'TAP', timeOffsetMs: 800 }
            ]
          }
        ]
      },
      2: {
        difficulty: 2,
        length: 4,
        target: {
          id: 'rhythm_tap_clap_tap_clap',
          name: 'Tap • Clap • Tap • Clap',
          beats: [
            { type: 'TAP', timeOffsetMs: 0 },
            { type: 'CLAP', timeOffsetMs: 380 },
            { type: 'TAP', timeOffsetMs: 760 },
            { type: 'CLAP', timeOffsetMs: 1140 }
          ]
        },
        candidates: [
          {
            id: 'rhythm_tap_tap_clap_clap',
            name: 'Tap • Tap • Clap • Clap',
            isTarget: false,
            beats: [
              { type: 'TAP', timeOffsetMs: 0 },
              { type: 'TAP', timeOffsetMs: 380 },
              { type: 'CLAP', timeOffsetMs: 760 },
              { type: 'CLAP', timeOffsetMs: 1140 }
            ]
          },
          {
            id: 'rhythm_tap_clap_tap_clap',
            name: 'Tap • Clap • Tap • Clap',
            isTarget: true,
            beats: [
              { type: 'TAP', timeOffsetMs: 0 },
              { type: 'CLAP', timeOffsetMs: 380 },
              { type: 'TAP', timeOffsetMs: 760 },
              { type: 'CLAP', timeOffsetMs: 1140 }
            ]
          },
          {
            id: 'rhythm_clap_tap_clap_tap',
            name: 'Clap • Tap • Clap • Tap',
            isTarget: false,
            beats: [
              { type: 'CLAP', timeOffsetMs: 0 },
              { type: 'TAP', timeOffsetMs: 380 },
              { type: 'CLAP', timeOffsetMs: 760 },
              { type: 'TAP', timeOffsetMs: 1140 }
            ]
          },
          {
            id: 'rhythm_tap_clap_clap_tap',
            name: 'Tap • Clap • Clap • Tap',
            isTarget: false,
            beats: [
              { type: 'TAP', timeOffsetMs: 0 },
              { type: 'CLAP', timeOffsetMs: 380 },
              { type: 'CLAP', timeOffsetMs: 760 },
              { type: 'TAP', timeOffsetMs: 1140 }
            ]
          }
        ]
      },
      3: {
        difficulty: 3,
        length: 4,
        target: {
          id: 'rhythm_tap_pause_clap_bell',
          name: 'Tap • Pause • Clap • Bell',
          beats: [
            { type: 'TAP', timeOffsetMs: 0 },
            { type: 'TAP', timeOffsetMs: 320 },
            { type: 'CLAP', timeOffsetMs: 750 },
            { type: 'BELL', timeOffsetMs: 1150 }
          ]
        },
        candidates: [
          {
            id: 'rhythm_tap_pause_clap_bell',
            name: 'Tap • Pause • Clap • Bell',
            isTarget: true,
            beats: [
              { type: 'TAP', timeOffsetMs: 0 },
              { type: 'TAP', timeOffsetMs: 320 },
              { type: 'CLAP', timeOffsetMs: 750 },
              { type: 'BELL', timeOffsetMs: 1150 }
            ]
          },
          {
            id: 'rhythm_tap_tap_bell_clap',
            name: 'Tap • Tap • Bell • Clap',
            isTarget: false,
            beats: [
              { type: 'TAP', timeOffsetMs: 0 },
              { type: 'TAP', timeOffsetMs: 320 },
              { type: 'BELL', timeOffsetMs: 750 },
              { type: 'CLAP', timeOffsetMs: 1150 }
            ]
          },
          {
            id: 'rhythm_clap_tap_tap_bell',
            name: 'Clap • Tap • Tap • Bell',
            isTarget: false,
            beats: [
              { type: 'CLAP', timeOffsetMs: 0 },
              { type: 'TAP', timeOffsetMs: 320 },
              { type: 'TAP', timeOffsetMs: 750 },
              { type: 'BELL', timeOffsetMs: 1150 }
            ]
          },
          {
            id: 'rhythm_tap_clap_bell_tap',
            name: 'Tap • Clap • Bell • Tap',
            isTarget: false,
            beats: [
              { type: 'TAP', timeOffsetMs: 0 },
              { type: 'CLAP', timeOffsetMs: 320 },
              { type: 'BELL', timeOffsetMs: 750 },
              { type: 'TAP', timeOffsetMs: 1150 }
            ]
          }
        ]
      },
      4: {
        difficulty: 4,
        length: 5,
        target: {
          id: 'rhythm_5_tap_tap_clap_tap_bell',
          name: 'Tap • Tap • Clap • Tap • Bell',
          beats: [
            { type: 'TAP', timeOffsetMs: 0 },
            { type: 'TAP', timeOffsetMs: 320 },
            { type: 'CLAP', timeOffsetMs: 640 },
            { type: 'TAP', timeOffsetMs: 960 },
            { type: 'BELL', timeOffsetMs: 1280 }
          ]
        },
        candidates: [
          {
            id: 'rhythm_5_tap_clap_tap_clap_bell',
            name: 'Tap • Clap • Tap • Clap • Bell',
            isTarget: false,
            beats: [
              { type: 'TAP', timeOffsetMs: 0 },
              { type: 'CLAP', timeOffsetMs: 320 },
              { type: 'TAP', timeOffsetMs: 640 },
              { type: 'CLAP', timeOffsetMs: 960 },
              { type: 'BELL', timeOffsetMs: 1280 }
            ]
          },
          {
            id: 'rhythm_5_tap_tap_clap_tap_bell',
            name: 'Tap • Tap • Clap • Tap • Bell',
            isTarget: true,
            beats: [
              { type: 'TAP', timeOffsetMs: 0 },
              { type: 'TAP', timeOffsetMs: 320 },
              { type: 'CLAP', timeOffsetMs: 640 },
              { type: 'TAP', timeOffsetMs: 960 },
              { type: 'BELL', timeOffsetMs: 1280 }
            ]
          },
          {
            id: 'rhythm_5_tap_tap_tap_clap_bell',
            name: 'Tap • Tap • Tap • Clap • Bell',
            isTarget: false,
            beats: [
              { type: 'TAP', timeOffsetMs: 0 },
              { type: 'TAP', timeOffsetMs: 320 },
              { type: 'TAP', timeOffsetMs: 640 },
              { type: 'CLAP', timeOffsetMs: 960 },
              { type: 'BELL', timeOffsetMs: 1280 }
            ]
          },
          {
            id: 'rhythm_5_clap_tap_clap_tap_bell',
            name: 'Clap • Tap • Clap • Tap • Bell',
            isTarget: false,
            beats: [
              { type: 'CLAP', timeOffsetMs: 0 },
              { type: 'TAP', timeOffsetMs: 320 },
              { type: 'CLAP', timeOffsetMs: 640 },
              { type: 'TAP', timeOffsetMs: 960 },
              { type: 'BELL', timeOffsetMs: 1280 }
            ]
          }
        ]
      }
    };

    // Tracking
    this.roundStartEpoch = null;
    this.lastAudioEndEpoch = null;
    this.targetAudioRepetitions = 0;
    this.clickTimestamps = [];
    this.isPlayingAudio = false;
    this.activeCandidates = [];
    this.currentTarget = null;

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
    this.isPlayingAudio = false;
  }

  startRound() {
    this.cleanup();
    const preset = this.roundPresets[this.currentRound] || this.roundPresets[1];
    this.currentTarget = preset.target;

    // Shuffle candidates
    const candidates = preset.candidates.map(c => ({ ...c }));
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    this.activeCandidates = candidates;

    // Reset tracking
    this.roundStartEpoch = performance.now();
    this.lastAudioEndEpoch = null;
    this.targetAudioRepetitions = 0;
    this.clickTimestamps = [];

    this.renderStage();

    // Automatically play target rhythm once at start
    setTimeout(() => {
      this.playTargetRhythm();
    }, 400);
  }

  renderStage() {
    this.container.innerHTML = `
      <div class="game-stage rhythm-stage">
        <div class="stage-header">
          <div class="badge-pill">Game 6: Rhythm Sequence</div>
          <div class="badge-pill">Round ${this.currentRound} / ${this.totalRounds}</div>
          <div class="badge-pill">Beats: ${this.currentTarget.beats.length}</div>
        </div>

        <div class="rhythm-target-card">
          <div class="prompt-text">
            🥁 Listen to the secret rhythm pattern!
          </div>

          <button id="replayTargetRhythmBtn" class="audio-play-btn pulse-target" tabindex="0">
            <span class="audio-btn-icon">🥁</span>
            <span class="audio-btn-label">Replay Target Rhythm</span>
          </button>

          <div id="targetBeatIndicators" class="rhythm-beat-indicators">
            ${this.currentTarget.beats.map((b, idx) => `
              <div class="beat-dot" data-step="${idx}">
                <span class="beat-icon">${b.type === 'CLAP' ? '👏' : (b.type === 'BELL' ? '🔔' : '🪵')}</span>
                <span class="beat-label">${b.type}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="prompt-text center-prompt">
          Which choice has the exact same rhythm? Listen to each, then choose!
        </div>

        <div class="rhythm-choices-grid">
          ${this.activeCandidates.map((candidate, index) => `
            <div class="rhythm-choice-card" data-index="${index}">
              <div class="card-letter-badge">Choice ${index + 1}</div>
              <div class="rhythm-mini-pattern">
                ${candidate.beats.map(b => `<span class="mini-beat">${b.type === 'CLAP' ? '👏' : (b.type === 'BELL' ? '🔔' : '🪵')}</span>`).join('')}
              </div>
              <button class="listen-candidate-btn" data-index="${index}" tabindex="0">
                <span class="listen-icon">▶️</span>
                <span>Listen</span>
              </button>
              <button class="choose-candidate-btn" data-index="${index}" tabindex="0">
                <span>Select</span>
                <span>⭐</span>
              </button>
            </div>
          `).join('')}
        </div>

        <div id="rhythmFeedbackBanner" class="feedback-hint-banner" style="display: none;"></div>
      </div>
    `;

    // Replay target button
    const replayBtn = document.getElementById('replayTargetRhythmBtn');
    replayBtn.addEventListener('click', () => {
      const now = performance.now();
      this.clickTimestamps.push(now - this.roundStartEpoch);
      this.targetAudioRepetitions++;
      this.playTargetRhythm();
    });

    // Candidates buttons
    const choiceCards = this.container.querySelectorAll('.rhythm-choice-card');
    choiceCards.forEach(card => {
      const idx = parseInt(card.dataset.index, 10);
      const listenBtn = card.querySelector('.listen-candidate-btn');
      const chooseBtn = card.querySelector('.choose-candidate-btn');

      listenBtn.addEventListener('click', () => {
        const now = performance.now();
        this.clickTimestamps.push(now - this.roundStartEpoch);
        this.playCandidateRhythm(idx, card);
      });

      chooseBtn.addEventListener('click', () => {
        this.handleChooseCandidate(idx, card);
      });
    });
  }

  playTargetRhythm() {
    if (this.isPlayingAudio) return;
    this.isPlayingAudio = true;

    const dots = this.container.querySelectorAll('#targetBeatIndicators .beat-dot');

    this.sound.playRhythmSequence(
      this.currentTarget.beats,
      (stepIdx) => {
        if (dots[stepIdx]) {
          dots[stepIdx].classList.add('pulse-beat');
          setTimeout(() => dots[stepIdx].classList.remove('pulse-beat'), 240);
        }
      },
      () => {
        this.isPlayingAudio = false;
        this.lastAudioEndEpoch = performance.now();
      }
    );
  }

  playCandidateRhythm(index, cardEl) {
    if (this.isPlayingAudio) return;
    this.isPlayingAudio = true;

    cardEl.classList.add('playing-sound');
    const candidate = this.activeCandidates[index];
    const miniBeats = cardEl.querySelectorAll('.mini-beat');

    this.sound.playRhythmSequence(
      candidate.beats,
      (stepIdx) => {
        if (miniBeats[stepIdx]) {
          miniBeats[stepIdx].classList.add('pulse-beat');
          setTimeout(() => miniBeats[stepIdx].classList.remove('pulse-beat'), 240);
        }
      },
      () => {
        this.isPlayingAudio = false;
        cardEl.classList.remove('playing-sound');
        this.lastAudioEndEpoch = performance.now();
      }
    );
  }

  /**
   * Calculates timing error (ms deviation between target beats and selected beats)
   */
  calculateTimingError(targetBeats, chosenBeats) {
    let error = 0;
    const maxLen = Math.max(targetBeats.length, chosenBeats.length);

    for (let i = 0; i < maxLen; i++) {
      const tb = targetBeats[i];
      const cb = chosenBeats[i];
      if (!tb || !cb) {
        error += 400; // missing beat penalty
      } else {
        if (tb.type !== cb.type) {
          error += 300; // timbre mismatch penalty
        }
        error += Math.abs(tb.timeOffsetMs - cb.timeOffsetMs);
      }
    }
    return error;
  }

  handleChooseCandidate(index, cardEl) {
    if (this.isPlayingAudio) return;

    const chooseEpoch = performance.now();
    this.clickTimestamps.push(chooseEpoch - this.roundStartEpoch);

    const roundDuration = chooseEpoch - this.roundStartEpoch;
    const thinkingDuration = this.lastAudioEndEpoch
      ? Math.max(0, chooseEpoch - this.lastAudioEndEpoch)
      : roundDuration;

    const chosen = this.activeCandidates[index];
    const isCorrect = chosen.isTarget;
    const timingError = isCorrect ? 0 : this.calculateTimingError(this.currentTarget.beats, chosen.beats);

    const feedbackBanner = document.getElementById('rhythmFeedbackBanner');

    if (isCorrect) {
      cardEl.classList.add('choice-correct');
      this.sound.playSuccessChime();
      if (feedbackBanner) {
        feedbackBanner.style.display = 'block';
        feedbackBanner.className = 'feedback-hint-banner banner-success';
        feedbackBanner.textContent = '🎉 You matched the rhythm perfectly!';
      }
    } else {
      cardEl.classList.add('choice-wrong');
      this.sound.playRetryCue();
      if (feedbackBanner) {
        feedbackBanner.style.display = 'block';
        feedbackBanner.className = 'feedback-hint-banner banner-retry';
        feedbackBanner.textContent = 'Good rhythm attempt! Let’s continue to the next one.';
      }
    }

    const allBtns = this.container.querySelectorAll('button');
    allBtns.forEach(b => b.disabled = true);

    setTimeout(() => {
      this.finishRound(isCorrect, roundDuration, thinkingDuration, chosen, index, timingError);
    }, 1200);
  }

  finishRound(isCorrect, roundDuration, thinkingDuration, chosen, chosenIndex, timingError) {
    this.cleanup();

    const recordedRound = this.telemetry.recordRhythmRound({
      round_number: this.currentRound,
      difficulty: this.currentRound,
      sequence_length: this.currentTarget.beats.length,
      target_audio_repetitions: this.targetAudioRepetitions,
      round_duration: roundDuration,
      thinking_duration: thinkingDuration,
      is_correct: isCorrect,
      total_answers: 1,
      selected_cue: chosen.id,
      selected_button_position: chosenIndex,
      timing_error: timingError,
      target_rhythm: this.currentTarget.beats,
      selected_rhythm: chosen.beats,
      click_timestamps: this.clickTimestamps
    });

    this.renderRoundCompleteModal(recordedRound, isCorrect);
  }

  renderRoundCompleteModal(recordedRound, isCorrect) {
    this.container.innerHTML = `
      <div class="game-stage round-feedback-stage">
        <div class="feedback-card">
          <div class="feedback-icon">${isCorrect ? '🥁' : '✨'}</div>
          <h3 class="feedback-title">${isCorrect ? 'Rhythm Master!' : 'Good Rhythm Effort!'}</h3>
          <p class="feedback-subtext">Round ${this.currentRound} complete.</p>

          <div class="mini-metrics-pill-grid">
            <div class="m-pill">
              <span class="m-label">Thinking Time:</span>
              <span class="m-val">${Math.round(recordedRound.thinking_duration)} ms</span>
            </div>
            <div class="m-pill">
              <span class="m-label">Timing Error:</span>
              <span class="m-val">${recordedRound.timing_error} ms</span>
            </div>
            <div class="m-pill">
              <span class="m-label">Sequence Length:</span>
              <span class="m-val">${recordedRound.sequence_length}</span>
            </div>
          </div>

          <button id="nextRoundBtn" class="primary-btn pulse-anim">
            <span>${this.currentRound < this.totalRounds ? 'Next Rhythm' : 'Complete Game 6'}</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById('nextRoundBtn').addEventListener('click', () => {
      if (this.currentRound < this.totalRounds) {
        this.currentRound++;
        if (this.onCompleteRound) this.onCompleteRound('rhythm', this.currentRound);
        this.startRound();
      } else {
        if (this.onFinishGame) this.onFinishGame('rhythm');
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.RhythmGame = RhythmGame;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RhythmGame;
}

