/**
 * Main Application Orchestrator & Battery Controller
 * Manages game transitions, session progress, telemetry drawer, and exports.
 */

class ApplicationController {
  constructor() {
    this.sound = new SoundEngine();
    this.telemetry = new TelemetryCollector();

    this.gameModules = {
      visual_search: {
        title: 'Visual Search',
        subtitle: 'Find and tap the target fast',
        icon: '🔍',
        classRef: VisualSearchGame
      },
      visual_memory: {
        title: 'Visual Memory',
        subtitle: 'Remember the picture and choose it',
        icon: '🧠',
        classRef: VisualMemoryGame
      },
      symmetry: {
        title: 'Symmetry & Discrimination',
        subtitle: 'Spot the identical twin shape',
        icon: '🪞',
        classRef: VisualSymmetryGame
      },
      pattern_memory: {
        title: 'Pattern Memory',
        subtitle: 'Watch the lights and repeat the path',
        icon: '✨',
        classRef: PatternMemoryGame
      },
      auditory_memory: {
        title: 'Auditory Memory',
        subtitle: 'Listen to the secret melody and match it',
        icon: '🎵',
        classRef: AuditoryMemoryGame
      },
      rhythm: {
        title: 'Rhythm Sequence',
        subtitle: 'Catch the beat and choose the matching pattern',
        icon: '🥁',
        classRef: RhythmGame
      }
    };

    this.batteryOrder = [
      'visual_search',
      'visual_memory',
      'symmetry',
      'pattern_memory',
      'auditory_memory',
      'rhythm'
    ];

    this.isBatteryMode = false;
    this.currentBatteryIndex = 0;
    this.currentGameInstance = null;
    this.currentGameKey = null;

    // DOM Caches
    this.elements = {};
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.setupTelemetrySync();
    this.showScreen('hubScreen');
    this.updateSessionBadge();
  }

  cacheElements() {
    this.elements = {
      // Screens
      hubScreen: document.getElementById('hubScreen'),
      gameScreen: document.getElementById('gameScreen'),
      summaryScreen: document.getElementById('summaryScreen'),

      // Game arena container
      gameArena: document.getElementById('gameArena'),

      // Header controls
      sessionBadge: document.getElementById('sessionBadge'),
      copySessionBtn: document.getElementById('copySessionBtn'),
      soundToggleBtn: document.getElementById('soundToggleBtn'),
      soundIcon: document.getElementById('soundIcon'),
      telemetryToggleBtn: document.getElementById('telemetryToggleBtn'),
      homeHeaderBtn: document.getElementById('homeHeaderBtn'),

      // Battery banner
      batteryStatusBar: document.getElementById('batteryStatusBar'),
      batteryProgressSteps: document.getElementById('batteryProgressSteps'),
      currentGameBadge: document.getElementById('currentGameBadge'),

      // Hub buttons
      startBatteryBtn: document.getElementById('startBatteryBtn'),
      gameCardsGrid: document.getElementById('gameCardsGrid'),

      // Telemetry Drawer
      telemetryDrawer: document.getElementById('telemetryDrawer'),
      closeDrawerBtn: document.getElementById('closeDrawerBtn'),
      liveTelemetryBody: document.getElementById('liveTelemetryBody'),
      jsonPreviewBlock: document.getElementById('jsonPreviewBlock'),
      drawerExportJsonBtn: document.getElementById('drawerExportJsonBtn'),
      drawerExportCsvBtn: document.getElementById('drawerExportCsvBtn'),

      // Summary elements
      summaryTotalRounds: document.getElementById('summaryTotalRounds'),
      summaryGamesCount: document.getElementById('summaryGamesCount'),
      summaryTableBody: document.getElementById('summaryTableBody'),
      downloadJsonBtn: document.getElementById('downloadJsonBtn'),
      downloadCsvBtn: document.getElementById('downloadCsvBtn'),
      summaryReturnHubBtn: document.getElementById('summaryReturnHubBtn')
    };
  }

  bindEvents() {
    // Sound toggle
    this.elements.soundToggleBtn.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      this.elements.soundIcon.textContent = isMuted ? '🔇' : '🔊';
    });

    // Copy session ID
    if (this.elements.copySessionBtn) {
      this.elements.copySessionBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(this.telemetry.sessionId).then(() => {
          this.showToast('Session ID copied to clipboard!');
        }).catch(() => {
          this.showToast(`Session ID: ${this.telemetry.sessionId}`);
        });
      });
    }

    // Home / Hub return
    this.elements.homeHeaderBtn.addEventListener('click', () => {
      if (this.currentGameInstance) {
        if (confirm('Return to Game Hub? Progress in current round will pause.')) {
          this.exitToHub();
        }
      } else {
        this.exitToHub();
      }
    });

    // Start full battery
    this.elements.startBatteryBtn.addEventListener('click', () => {
      this.sound.initContext();
      this.startFullBattery();
    });

    // Telemetry drawer
    this.elements.telemetryToggleBtn.addEventListener('click', () => {
      this.toggleTelemetryDrawer();
    });
    this.elements.closeDrawerBtn.addEventListener('click', () => {
      this.closeTelemetryDrawer();
    });

    // Export buttons
    this.elements.drawerExportJsonBtn.addEventListener('click', () => this.telemetry.exportJSON());
    this.elements.drawerExportCsvBtn.addEventListener('click', () => this.telemetry.exportCSV());
    this.elements.downloadJsonBtn.addEventListener('click', () => this.telemetry.exportJSON());
    this.elements.downloadCsvBtn.addEventListener('click', () => this.telemetry.exportCSV());

    // Summary screen return
    this.elements.summaryReturnHubBtn.addEventListener('click', () => {
      this.exitToHub();
    });

    // Bind individual game cards
    this.renderGameCards();
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'app-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('visible'), 50);
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  updateSessionBadge() {
    if (this.elements.sessionBadge) {
      this.elements.sessionBadge.textContent = this.telemetry.sessionId.substring(0, 13) + '...';
      this.elements.sessionBadge.title = `Full ID: ${this.telemetry.sessionId}`;
    }
  }

  showScreen(screenId) {
    ['hubScreen', 'gameScreen', 'summaryScreen'].forEach(id => {
      if (this.elements[id]) {
        this.elements[id].classList.remove('active-screen');
      }
    });
    if (this.elements[screenId]) {
      this.elements[screenId].classList.add('active-screen');
    }

    if (screenId === 'hubScreen') {
      this.elements.homeHeaderBtn.style.display = 'none';
      this.elements.batteryStatusBar.style.display = 'none';
    } else {
      this.elements.homeHeaderBtn.style.display = 'flex';
    }
  }

  renderGameCards() {
    const grid = this.elements.gameCardsGrid;
    if (!grid) return;

    grid.innerHTML = this.batteryOrder.map(gameKey => {
      const g = this.gameModules[gameKey];
      const roundsRecorded = (this.telemetry.gamesData[gameKey] || []).length;

      return `
        <div class="game-select-card" data-key="${gameKey}">
          <div class="card-icon-bubble">${g.icon}</div>
          <div class="card-content">
            <h3 class="card-game-title">${g.title}</h3>
            <p class="card-game-desc">${g.subtitle}</p>
          </div>
          <div class="card-footer">
            <span class="rounds-badge">${roundsRecorded > 0 ? `${roundsRecorded} rounds recorded` : 'Ready to play'}</span>
            <button class="play-chip-btn">Play Now ➔</button>
          </div>
        </div>
      `;
    }).join('');

    const cards = grid.querySelectorAll('.game-select-card');
    cards.forEach(card => {
      const key = card.dataset.key;
      card.addEventListener('click', () => {
        this.sound.initContext();
        this.startSingleGame(key);
      });
    });
  }

  startFullBattery() {
    this.isBatteryMode = true;
    this.currentBatteryIndex = 0;
    this.renderBatteryProgress();
    this.elements.batteryStatusBar.style.display = 'flex';
    this.launchCurrentBatteryGame();
  }

  startSingleGame(gameKey) {
    this.isBatteryMode = false;
    this.elements.batteryStatusBar.style.display = 'none';
    this.launchGame(gameKey);
  }

  renderBatteryProgress() {
    const stepsEl = this.elements.batteryProgressSteps;
    if (!stepsEl) return;

    stepsEl.innerHTML = this.batteryOrder.map((key, idx) => {
      let state = 'pending';
      if (idx < this.currentBatteryIndex) state = 'completed';
      else if (idx === this.currentBatteryIndex) state = 'current';

      const icon = this.gameModules[key].icon;
      return `
        <div class="battery-step ${state}" title="${this.gameModules[key].title}">
          <span class="step-icon">${icon}</span>
          <span class="step-num">${idx + 1}</span>
        </div>
      `;
    }).join('');
  }

  launchCurrentBatteryGame() {
    const gameKey = this.batteryOrder[this.currentBatteryIndex];
    this.renderBatteryProgress();
    this.launchGame(gameKey);
  }

  launchGame(gameKey) {
    if (this.currentGameInstance) {
      this.currentGameInstance.unmount();
      this.currentGameInstance = null;
    }

    this.currentGameKey = gameKey;
    const meta = this.gameModules[gameKey];
    this.elements.currentGameBadge.textContent = `${meta.icon} ${meta.title}`;

    this.showScreen('gameScreen');

    const GameClass = meta.classRef;
    this.currentGameInstance = new GameClass(
      this.sound,
      this.telemetry,
      (gKey, nextRound) => this.handleRoundCompleted(gKey, nextRound),
      (gKey) => this.handleGameCompleted(gKey)
    );

    this.currentGameInstance.mount(this.elements.gameArena);
  }

  handleRoundCompleted(gameKey, nextRound) {
    // Live update triggers automatically via telemetry listener
  }

  handleGameCompleted(gameKey) {
    if (this.isBatteryMode) {
      this.currentBatteryIndex++;
      if (this.currentBatteryIndex < this.batteryOrder.length) {
        this.launchCurrentBatteryGame();
      } else {
        // Full battery completed!
        this.showSessionSummary();
      }
    } else {
      // Single game completed: show summary of session so far
      this.showSessionSummary();
    }
  }

  exitToHub() {
    if (this.currentGameInstance) {
      this.currentGameInstance.unmount();
      this.currentGameInstance = null;
    }
    this.isBatteryMode = false;
    this.renderGameCards();
    this.showScreen('hubScreen');
  }

  showSessionSummary() {
    if (this.currentGameInstance) {
      this.currentGameInstance.unmount();
      this.currentGameInstance = null;
    }

    this.showScreen('summaryScreen');
    this.sound.playFanfare();

    const exportObj = this.telemetry.getSessionExportObject();
    const totalRounds = this.telemetry.getTotalRoundsCount();

    // Summary numbers
    this.elements.summaryTotalRounds.textContent = totalRounds;
    const playedGamesCount = exportObj.games.filter(g => g.rounds.length > 0).length;
    this.elements.summaryGamesCount.textContent = `${playedGamesCount} / ${this.batteryOrder.length}`;

    // Populate game breakdown table
    const tableBody = this.elements.summaryTableBody;
    tableBody.innerHTML = '';

    exportObj.games.forEach(g => {
      const gMeta = this.gameModules[g.game];
      const rounds = g.rounds;
      if (rounds.length === 0) return;

      const avgRT = rounds.length > 0 
        ? Math.round(rounds.reduce((acc, r) => acc + (r.first_click_interval || 0), 0) / rounds.length)
        : 0;

      const totalCorrect = rounds.reduce((acc, r) => acc + (r.correct_answers || r.correct_clicks || 0), 0);
      const totalClicks = rounds.reduce((acc, r) => acc + (r.total_clicks || 0), 0);
      const accPct = totalClicks > 0 ? Math.round((totalCorrect / totalClicks) * 100) : 100;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${gMeta.icon} ${gMeta.title}</strong></td>
        <td>${rounds.length}</td>
        <td>${avgRT > 0 ? `${avgRT} ms` : '-'}</td>
        <td>${accPct}%</td>
        <td><span class="status-tag-done">Collected</span></td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // ==========================================
  // RESEARCHER TELEMETRY DRAWER & LIVE STREAM
  // ==========================================
  toggleTelemetryDrawer() {
    const drawer = this.elements.telemetryDrawer;
    if (drawer.classList.contains('open')) {
      this.closeTelemetryDrawer();
    } else {
      this.openTelemetryDrawer();
    }
  }

  openTelemetryDrawer() {
    this.elements.telemetryDrawer.classList.add('open');
    this.refreshTelemetryPreview();
  }

  closeTelemetryDrawer() {
    this.elements.telemetryDrawer.classList.remove('open');
  }

  setupTelemetrySync() {
    this.telemetry.onUpdate((event) => {
      this.appendLiveTelemetryRow(event);
      this.refreshTelemetryPreview();
    });
  }

  appendLiveTelemetryRow(event) {
    const liveBody = this.elements.liveTelemetryBody;
    if (!liveBody || !event.round) return;

    const r = event.round;
    const row = document.createElement('div');
    row.className = 'telemetry-event-row';

    const intervalsStr = r.click_intervals && r.click_intervals.length > 0
      ? r.click_intervals.slice(0, 4).join(', ') + (r.click_intervals.length > 4 ? '...' : '')
      : 'none';

    row.innerHTML = `
      <div class="row-header">
        <span class="game-tag">${event.game}</span>
        <span class="round-tag">Round #${r.round_number} (Lvl ${r.difficulty})</span>
        <span class="time-tag">${new Date().toLocaleTimeString()}</span>
      </div>
      <div class="row-details">
        <span>1st Click: <strong>${r.first_click_interval !== null ? r.first_click_interval + 'ms' : '-'}</strong></span>
        <span>Clicks: <strong>${r.total_clicks || 0}</strong></span>
        <span>Intervals: [${intervalsStr}]</span>
      </div>
    `;

    liveBody.insertBefore(row, liveBody.firstChild);

    // Limit to latest 30 rows in drawer
    while (liveBody.children.length > 30) {
      liveBody.removeChild(liveBody.lastChild);
    }
  }

  refreshTelemetryPreview() {
    const previewBlock = this.elements.jsonPreviewBlock;
    if (!previewBlock) return;
    const sessionObj = this.telemetry.getSessionExportObject();
    previewBlock.textContent = JSON.stringify(sessionObj, null, 2);
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const app = new ApplicationController();
  app.init();
  window.App = app;
});
