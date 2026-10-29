/**
 * GAME 5: AUDITORY MEMORY
 * Features collected:
 * 1. instruction_listening_count
 * 2. round_duration
 * 3. thinking_duration
 * 4. target_audio_repetitions
 * 5. correct_answers
 * 6. wrong_answers
 * 7. total_correct_answers
 * 8. total_wrong_answers
 * 9. selected_cue
 * 10. selected_button_position
 * Also records:
 * - total_audio_replays
 * - audio_listening_duration
 * - difficulty
 * - target_sequence
 * - selected_sequence
 * - click_timestamps
 */

class AuditoryMemoryGame {
  constructor(soundEngine, telemetryCollector, onCompleteRound, onFinishGame) {
    this.sound = soundEngine;
    this.telemetry = telemetryCollector;
    this.onCompleteRound = onCompleteRound;
    this.onFinishGame = onFinishGame;

    this.totalRounds = 4;
    this.currentRound = 1;

    // Difficulty melodies
    this.roundPresets = {
      1: {
        difficulty: 1,
        target: ['C4', 'G4'],
        candidates: [
          { id: 'seq_c4_g4', notes: ['C4', 'G4'], isTarget: true },
          { id: 'seq_c4_e4', notes: ['C4', 'E4'], isTarget: false },
          { id: 'seq_g4_c4', notes: ['G4', 'C4'], isTarget: false }
        ]
      },
      2: {
        difficulty: 2,
        target: ['C4', 'E4', 'G4'],
        candidates: [
          { id: 'seq_c4_g4_e4', notes: ['C4', 'G4', 'E4'], isTarget: false },
          { id: 'seq_c4_e4_g4', notes: ['C4', 'E4', 'G4'], isTarget: true },
          { id: 'seq_e4_c4_g4', notes: ['E4', 'C4', 'G4'], isTarget: false }
        ]
      },
      3: {
        difficulty: 3,
        target: ['D4', 'A4', 'F4'],
        candidates: [
          { id: 'seq_d4_f4_a4', notes: ['D4', 'F4', 'A4'], isTarget: false },
          { id: 'seq_a4_f4_d4', notes: ['A4', 'F4', 'D4'], isTarget: false },
          { id: 'seq_d4_a4_f4', notes: ['D4', 'A4', 'F4'], isTarget: true }
        ]
      },
      4: {
        difficulty: 4,
        target: ['C4', 'G4', 'E4', 'C5'],
        candidates: [
          { id: 'seq_c4_e4_g4_c5', notes: ['C4', 'E4', 'G4', 'C5'], isTarget: false },
          { id: 'seq_c4_g4_e4_c5', notes: ['C4', 'G4', 'E4', 'C5'], isTarget: true },
          { id: 'seq_c4_g4_c5_e4', notes: ['C4', 'G4', 'C5', 'E4'], isTarget: false }
        ]
      }
    };

    // Tracking state
    this.roundStartEpoch = null;
    this.lastAudioEndEpoch = null;
    this.instructionListeningCount = 1;
    this.targetAudioRepetitions = 0;
    this.totalAudioReplays = 0;
    this.audioListeningDurationMs = 0;
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

    // Shuffle candidate cards
    const candidates = preset.candidates.map(c => ({ ...c }));
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    this.activeCandidates = candidates;

    // Reset round metrics
    this.roundStartEpoch = performance.now();
    this.lastAudioEndEpoch = null;
    this.instructionListeningCount = 1;
    this.targetAudioRepetitions = 0;
    this.totalAudioReplays = 0;
    this.audioListeningDurationMs = 0;
    this.clickTimestamps = [];

    this.renderStage();

    // Automatically audition target melody at round start
    setTimeout(() => {
      this.playTargetMelody(true);
    }, 400);
  }

  renderStage() {
    this.container.innerHTML = `
      <div class="game-stage auditory-memory-stage">
        <div class="stage-header">
          <div class="badge-pill">Game 5: Auditory Memory</div>
          <div class="badge-pill">Round ${this.currentRound} / ${this.totalRounds}</div>
          <div class="badge-pill">Notes: ${this.currentTarget.length}</div>
        </div>

        <div class="audio-target-card">
          <div class="prompt-text">
            🎵 Listen to the secret melody!
          </div>

          <button id="replayTargetAudioBtn" class="audio-play-btn pulse-target" tabindex="0">
            <span class="audio-btn-icon">🔊</span>
            <span class="audio-btn-label">Replay Target Melody</span>
          </button>
          <div id="targetPlayWave" class="sound-wave-bars">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>

        <div class="prompt-text center-prompt">
          Which sound matches the secret melody? Listen to each, then choose!
        </div>

        <div class="audio-candidates-grid">
          ${this.activeCandidates.map((candidate, index) => `
            <div class="audio-candidate-card" data-index="${index}">
              <div class="card-letter-badge">Choice ${String.fromCharCode(65 + index)}</div>
              <button class="listen-candidate-btn" data-index="${index}" tabindex="0">
                <span class="listen-icon">▶️</span>
                <span>Listen</span>
              </button>
              <button class="choose-candidate-btn" data-index="${index}" tabindex="0">
                <span>Select This</span>
                <span>⭐</span>
              </button>
            </div>
          `).join('')}
        </div>

        <div id="auditoryFeedbackBanner" class="feedback-hint-banner" style="display: none;"></div>
      </div>
    `;

    // Bind replay target button
    const replayBtn = document.getElementById('replayTargetAudioBtn');
    replayBtn.addEventListener('click', () => {
      const now = performance.now();
      this.clickTimestamps.push(now - this.roundStartEpoch);
      this.targetAudioRepetitions++;
      this.totalAudioReplays++;
      this.playTargetMelody(false);
    });

    // Bind candidate listen & choose buttons
    const candidateCards = this.container.querySelectorAll('.audio-candidate-card');
    candidateCards.forEach(card => {
      const idx = parseInt(card.dataset.index, 10);
      const listenBtn = card.querySelector('.listen-candidate-btn');
      const chooseBtn = card.querySelector('.choose-candidate-btn');

      listenBtn.addEventListener('click', (e) => {
        const now = performance.now();
        this.clickTimestamps.push(now - this.roundStartEpoch);
        this.totalAudioReplays++;
        this.playCandidateMelody(idx, card);
      });

      chooseBtn.addEventListener('click', (e) => {
        this.handleChooseCandidate(idx, card);
      });
    });
  }

  setWaveActive(active) {
    const wave = document.getElementById('targetPlayWave');
    if (!wave) return;
    if (active) wave.classList.add('playing');
    else wave.classList.remove('playing');
  }

  playTargetMelody(isInitialIntro = false) {
    if (this.isPlayingAudio) return;
    this.isPlayingAudio = true;
    this.setWaveActive(true);

    const noteDurationMs = 380;
    const gapMs = 140;
    const totalDuration = this.currentTarget.length * (noteDurationMs + gapMs);
    this.audioListeningDurationMs += totalDuration;

    this.sound.playMelodySequence(
      this.currentTarget,
      noteDurationMs,
      gapMs,
      null,
      () => {
        this.isPlayingAudio = false;
        this.setWaveActive(false);
        this.lastAudioEndEpoch = performance.now();
      }
    );
  }

  playCandidateMelody(index, cardEl) {
    if (this.isPlayingAudio) return;
    this.isPlayingAudio = true;

    cardEl.classList.add('playing-sound');
    const candidate = this.activeCandidates[index];
    const noteDurationMs = 380;
    const gapMs = 140;
    const totalDuration = candidate.notes.length * (noteDurationMs + gapMs);
    this.audioListeningDurationMs += totalDuration;

    this.sound.playMelodySequence(
      candidate.notes,
      noteDurationMs,
      gapMs,
      null,
      () => {
        this.isPlayingAudio = false;
        cardEl.classList.remove('playing-sound');
        this.lastAudioEndEpoch = performance.now();
      }
    );
  }

  handleChooseCandidate(index, cardEl) {
    if (this.isPlayingAudio) return;

    const chooseEpoch = performance.now();
    this.clickTimestamps.push(chooseEpoch - this.roundStartEpoch);

    const roundDuration = chooseEpoch - this.roundStartEpoch;
    // Thinking duration: from end of last heard sound to the moment of decision click
    const thinkingDuration = this.lastAudioEndEpoch
      ? Math.max(0, chooseEpoch - this.lastAudioEndEpoch)
      : Math.max(0, roundDuration - this.audioListeningDurationMs);

    const chosenCandidate = this.activeCandidates[index];
    const isCorrect = chosenCandidate.isTarget;

    const feedbackBanner = document.getElementById('auditoryFeedbackBanner');

    if (isCorrect) {
      cardEl.classList.add('choice-correct');
      this.sound.playSuccessChime();
      if (feedbackBanner) {
        feedbackBanner.style.display = 'block';
        feedbackBanner.className = 'feedback-hint-banner banner-success';
        feedbackBanner.textContent = '🎉 That matches the secret melody perfectly!';
      }
    } else {
      cardEl.classList.add('choice-wrong');
      this.sound.playRetryCue();
      if (feedbackBanner) {
        feedbackBanner.style.display = 'block';
        feedbackBanner.className = 'feedback-hint-banner banner-retry';
        feedbackBanner.textContent = 'Good listening try! Moving to next melody.';
      }
    }

    // Disable all buttons in cards
    const allBtns = this.container.querySelectorAll('button');
    allBtns.forEach(b => b.disabled = true);

    setTimeout(() => {
      this.finishRound(isCorrect, roundDuration, thinkingDuration, chosenCandidate, index);
    }, 1200);
  }

  finishRound(isCorrect, roundDuration, thinkingDuration, chosenCandidate, chosenIndex) {
    this.cleanup();

    const recordedRound = this.telemetry.recordAuditoryMemoryRound({
      round_number: this.currentRound,
      difficulty: this.currentRound,
      instruction_listening_count: this.instructionListeningCount,
      round_duration: roundDuration,
      thinking_duration: thinkingDuration,
      target_audio_repetitions: this.targetAudioRepetitions,
      is_correct: isCorrect,
      selected_cue: chosenCandidate.id,
      selected_button_position: chosenIndex,
      total_audio_replays: this.totalAudioReplays,
      audio_listening_duration: this.audioListeningDurationMs,
      target_sequence: this.currentTarget,
      selected_sequence: chosenCandidate.notes,
      click_timestamps: this.clickTimestamps
    });

    this.renderRoundCompleteModal(recordedRound, isCorrect);
  }

  renderRoundCompleteModal(recordedRound, isCorrect) {
    this.container.innerHTML = `
      <div class="game-stage round-feedback-stage">
        <div class="feedback-card">
          <div class="feedback-icon">${isCorrect ? '🎶' : '👂'}</div>
          <h3 class="feedback-title">${isCorrect ? 'Super Ears!' : 'Good Listening!'}</h3>
          <p class="feedback-subtext">Round ${this.currentRound} complete.</p>

          <div class="mini-metrics-pill-grid">
            <div class="m-pill">
              <span class="m-label">Thinking Time:</span>
              <span class="m-val">${Math.round(recordedRound.thinking_duration)} ms</span>
            </div>
            <div class="m-pill">
              <span class="m-label">Audio Replays:</span>
              <span class="m-val">${recordedRound.target_audio_repetitions}</span>
            </div>
            <div class="m-pill">
              <span class="m-label">Cumulative Correct:</span>
              <span class="m-val">${recordedRound.total_correct_answers}</span>
            </div>
          </div>

          <button id="nextRoundBtn" class="primary-btn pulse-anim">
            <span>${this.currentRound < this.totalRounds ? 'Next Sound' : 'Complete Game 5'}</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById('nextRoundBtn').addEventListener('click', () => {
      if (this.currentRound < this.totalRounds) {
        this.currentRound++;
        if (this.onCompleteRound) this.onCompleteRound('auditory_memory', this.currentRound);
        this.startRound();
      } else {
        if (this.onFinishGame) this.onFinishGame('auditory_memory');
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.AuditoryMemoryGame = AuditoryMemoryGame;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuditoryMemoryGame;
}

