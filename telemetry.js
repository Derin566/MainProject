/**
 * Dyslexia Screening Game Battery - Telemetry & Behavioral Feature Collector
 * Strictly implements data collection from:
 * "Screening Dyslexia Using Visual Auditory Computer Games and Machine Learning"
 * (Rauschenberger, Baeza-Yates, Rello - IEEE Access 2025)
 * 
 * NOTICE:
 * This prototype only collects objective behavioral interaction features.
 * It DOES NOT classify, diagnose, or output dyslexia probabilities.
 */

class TelemetryCollector {
  constructor() {
    this.sessionId = this.generateUUID();
    this.startedAt = new Date().toISOString();
    this.completedAt = null;

    // Ordered list of 6 research games
    this.gameNames = [
      'visual_search',
      'visual_memory',
      'symmetry',
      'pattern_memory',
      'auditory_memory',
      'rhythm'
    ];

    // Core session storage structure as explicitly requested:
    // {
    //   session_id: "...",
    //   games: [
    //     { game: "visual_search", rounds: [...] }, ...
    //   ]
    // }
    this.gamesData = {};
    this.gameNames.forEach(name => {
      this.gamesData[name] = [];
    });

    // Event listeners for live telemetry UI updates
    this.listeners = [];
  }

  generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
  }

  onUpdate(callback) {
    this.listeners.push(callback);
  }

  notifyUpdate(gameName, roundData) {
    this.listeners.forEach(cb => {
      try {
        cb({
          sessionId: this.sessionId,
          game: gameName,
          round: roundData,
          totalRounds: this.getTotalRoundsCount()
        });
      } catch (e) {
        console.error('Telemetry update callback error:', e);
      }
    });
  }

  getTotalRoundsCount() {
    return Object.values(this.gamesData).reduce((sum, rounds) => sum + rounds.length, 0);
  }

  /**
   * Helper: Given relative click timestamps [t1, t2, t3, ...], calculate sequential intervals
   * click 1 = 1240 ms -> first_click_interval = 1240 ms
   * click 2 = 2080 ms -> second_click_interval = 2080 - 1240 = 840 ms
   * click 3 = 3190 ms -> third_click_interval = 3190 - 2080 = 1110 ms
   */
  static calculateClickIntervals(timestamps) {
    const intervals = [];
    if (!timestamps || timestamps.length === 0) return intervals;

    intervals.push(Math.round(timestamps[0]));
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(Math.round(timestamps[i] - timestamps[i - 1]));
    }
    return intervals;
  }

  /**
   * RECORD ROUND: Visual Search (Game 1)
   */
  recordVisualSearchRound(data) {
    const rawClicks = data.click_timestamps || [];
    const intervals = TelemetryCollector.calculateClickIntervals(rawClicks);

    const round = {
      round_number: data.round_number || 1,
      difficulty: data.difficulty || 1,
      grid_layout: data.grid_layout || '2x2', // '2x2' or '3x3'
      target_category: data.target_category || 'shapes',
      target_id: data.target_id || '',
      first_click_interval: intervals[0] !== undefined ? intervals[0] : null,
      second_click_interval: intervals[1] !== undefined ? intervals[1] : null,
      third_click_interval: intervals[2] !== undefined ? intervals[2] : null,
      fourth_click_interval: intervals[3] !== undefined ? intervals[3] : null,
      fifth_click_interval: intervals[4] !== undefined ? intervals[4] : null,
      sixth_click_interval: intervals[5] !== undefined ? intervals[5] : null,
      time_last_click: data.time_last_click !== undefined ? Math.round(data.time_last_click) : (rawClicks.length > 0 ? Math.round(rawClicks[rawClicks.length - 1]) : 0),
      total_clicks: data.total_clicks !== undefined ? data.total_clicks : rawClicks.length,
      correct_answers: data.correct_answers || 0,
      wrong_answers: data.wrong_answers || 0,
      distractor_1_clicks: data.distractor_1_clicks || 0,
      distractor_2_clicks: data.distractor_2_clicks || 0,
      distractor_3_clicks: data.distractor_3_clicks || 0,
      efficiency: data.efficiency !== undefined ? parseFloat(data.efficiency.toFixed(4)) : (data.total_clicks > 0 ? parseFloat((data.correct_answers / data.total_clicks).toFixed(4)) : 0),
      accuracy: data.accuracy !== undefined ? parseFloat(data.accuracy.toFixed(4)) : (data.total_clicks > 0 ? parseFloat((data.correct_answers / data.total_clicks).toFixed(4)) : 0),
      click_timestamps: rawClicks.map(t => Math.round(t)),
      click_intervals: intervals,
      timestamp: new Date().toISOString()
    };

    this.gamesData.visual_search.push(round);
    this.notifyUpdate('visual_search', round);
    return round;
  }

  /**
   * RECORD ROUND: Visual Memory (Game 2)
   */
  recordVisualMemoryRound(data) {
    const rawClicks = data.click_timestamps || [];
    const intervals = TelemetryCollector.calculateClickIntervals(rawClicks);

    const round = {
      round_number: data.round_number || 1,
      difficulty: data.difficulty || 1,
      first_click_interval: intervals[0] !== undefined ? intervals[0] : (data.first_click_interval || 0),
      total_response_time: Math.round(data.total_response_time || 0),
      correct_answers: data.correct_answers !== undefined ? data.correct_answers : (data.is_correct ? 1 : 0),
      wrong_answers: data.wrong_answers || 0,
      total_clicks: data.total_clicks || rawClicks.length || 1,
      attempts: data.attempts || 1,
      target_position: data.target_position !== undefined ? data.target_position : 0,
      selected_position: data.selected_position !== undefined ? data.selected_position : 0,
      accuracy: data.accuracy !== undefined ? parseFloat(data.accuracy.toFixed(4)) : (data.is_correct ? 1.0 : 0.0),
      target_cue: data.target_cue || '',
      selected_cue: data.selected_cue || '',
      click_timestamps: rawClicks.map(t => Math.round(t)),
      click_intervals: intervals,
      timestamp: new Date().toISOString()
    };

    this.gamesData.visual_memory.push(round);
    this.notifyUpdate('visual_memory', round);
    return round;
  }

  /**
   * RECORD ROUND: Visual Symmetry / Discrimination (Game 3)
   */
  recordSymmetryRound(data) {
    const rawClicks = data.click_timestamps || [];
    const intervals = TelemetryCollector.calculateClickIntervals(rawClicks);

    const round = {
      round_number: data.round_number || 1,
      difficulty: data.difficulty || 1,
      first_click_interval: intervals[0] !== undefined ? intervals[0] : (data.first_click_interval || 0),
      subsequent_click_intervals: intervals.slice(1),
      total_clicks: data.total_clicks || rawClicks.length || 1,
      correct_answers: data.correct_answers !== undefined ? data.correct_answers : (data.is_correct ? 1 : 0),
      wrong_answers: data.wrong_answers || 0,
      distractor_1_clicks: data.distractor_1_clicks || 0,
      distractor_2_clicks: data.distractor_2_clicks || 0,
      distractor_3_clicks: data.distractor_3_clicks || 0,
      accuracy: data.accuracy !== undefined ? parseFloat(data.accuracy.toFixed(4)) : (data.is_correct ? 1.0 : 0.0),
      efficiency: data.efficiency !== undefined ? parseFloat(data.efficiency.toFixed(4)) : (data.is_correct ? 1.0 : 0.0),
      error_type: data.error_type || (data.is_correct ? 'none' : 'unspecified'),
      target_cue: data.target_cue || '',
      selected_cue: data.selected_cue || '',
      click_timestamps: rawClicks.map(t => Math.round(t)),
      click_intervals: intervals,
      timestamp: new Date().toISOString()
    };

    this.gamesData.symmetry.push(round);
    this.notifyUpdate('symmetry', round);
    return round;
  }

  /**
   * RECORD ROUND: Pattern Memory (Game 4)
   * Matches original game logic + exact requested intervals
   */
  recordPatternMemoryRound(data) {
    const rawClicks = data.click_timestamps || [];
    const intervals = TelemetryCollector.calculateClickIntervals(rawClicks);

    const round = {
      round_number: data.round_number || 1,
      difficulty: data.difficulty || 1,
      pattern_length: data.pattern_length || 2,
      grid_size: data.grid_size || 3,
      first_click_interval: intervals[0] !== undefined ? intervals[0] : null,
      second_click_interval: intervals[1] !== undefined ? intervals[1] : null,
      third_click_interval: intervals[2] !== undefined ? intervals[2] : null,
      fourth_click_interval: intervals[3] !== undefined ? intervals[3] : null,
      fifth_click_interval: intervals[4] !== undefined ? intervals[4] : null,
      total_clicks: data.total_clicks || rawClicks.length,
      correct_clicks: data.correct_clicks || 0,
      wrong_clicks: data.wrong_clicks || 0,
      completion_time: Math.round(data.completion_time || 0),
      accuracy: data.accuracy !== undefined ? parseFloat(data.accuracy.toFixed(4)) : (data.total_clicks > 0 ? parseFloat((data.correct_clicks / data.total_clicks).toFixed(4)) : 0),
      efficiency: data.efficiency !== undefined ? parseFloat(data.efficiency.toFixed(4)) : (data.pattern_length > 0 && data.total_clicks > 0 ? parseFloat((data.pattern_length / data.total_clicks).toFixed(4)) : 0),
      pattern_positions: data.pattern_positions ? [...data.pattern_positions] : [],
      selected_positions: data.selected_positions ? [...data.selected_positions] : [],
      click_timestamps: rawClicks.map(t => Math.round(t)),
      click_intervals: intervals,
      timestamp: new Date().toISOString()
    };

    this.gamesData.pattern_memory.push(round);
    this.notifyUpdate('pattern_memory', round);
    return round;
  }

  /**
   * RECORD ROUND: Auditory Memory (Game 5)
   */
  recordAuditoryMemoryRound(data) {
    const rawClicks = data.click_timestamps || [];
    const intervals = TelemetryCollector.calculateClickIntervals(rawClicks);

    // Cumulative stats
    const priorRounds = this.gamesData.auditory_memory;
    const priorCorrect = priorRounds.reduce((acc, r) => acc + r.correct_answers, 0);
    const priorWrong = priorRounds.reduce((acc, r) => acc + r.wrong_answers, 0);
    const roundCorrect = data.is_correct ? 1 : 0;
    const roundWrong = data.is_correct ? 0 : 1;

    const round = {
      round_number: data.round_number || 1,
      difficulty: data.difficulty || 1,
      instruction_listening_count: data.instruction_listening_count || 1,
      round_duration: Math.round(data.round_duration || 0),
      thinking_duration: Math.round(data.thinking_duration || 0),
      target_audio_repetitions: data.target_audio_repetitions || 0,
      correct_answers: roundCorrect,
      wrong_answers: roundWrong,
      total_correct_answers: priorCorrect + roundCorrect,
      total_wrong_answers: priorWrong + roundWrong,
      selected_cue: data.selected_cue || '',
      selected_button_position: data.selected_button_position !== undefined ? data.selected_button_position : 0,
      total_audio_replays: data.total_audio_replays || data.target_audio_repetitions || 0,
      audio_listening_duration: Math.round(data.audio_listening_duration || 0),
      target_sequence: data.target_sequence || [],
      selected_sequence: data.selected_sequence || [],
      click_timestamps: rawClicks.map(t => Math.round(t)),
      click_intervals: intervals,
      timestamp: new Date().toISOString()
    };

    this.gamesData.auditory_memory.push(round);
    this.notifyUpdate('auditory_memory', round);
    return round;
  }

  /**
   * RECORD ROUND: Rhythm / Auditory Sequence (Game 6)
   */
  recordRhythmRound(data) {
    const rawClicks = data.click_timestamps || [];
    const intervals = TelemetryCollector.calculateClickIntervals(rawClicks);

    const round = {
      round_number: data.round_number || 1,
      difficulty: data.difficulty || 1,
      sequence_length: data.sequence_length || 3,
      target_audio_repetitions: data.target_audio_repetitions || 0,
      round_duration: Math.round(data.round_duration || 0),
      thinking_duration: Math.round(data.thinking_duration || 0),
      correct_answers: data.is_correct ? 1 : 0,
      wrong_answers: data.is_correct ? 0 : 1,
      total_answers: data.total_answers || 1,
      selected_cue: data.selected_cue || '',
      selected_button_position: data.selected_button_position !== undefined ? data.selected_button_position : 0,
      timing_error: Math.round(data.timing_error || 0),
      target_rhythm: data.target_rhythm || [],
      selected_rhythm: data.selected_rhythm || [],
      click_timestamps: rawClicks.map(t => Math.round(t)),
      click_intervals: intervals,
      timestamp: new Date().toISOString()
    };

    this.gamesData.rhythm.push(round);
    this.notifyUpdate('rhythm', round);
    return round;
  }

  /**
   * Get exact Session Object structure as defined in user prompt:
   * {
   *   session_id: "...",
   *   games: [
   *     { game: "visual_search", rounds: [...] },
   *     { game: "visual_memory", rounds: [...] },
   *     { game: "symmetry", rounds: [...] },
   *     { game: "pattern_memory", rounds: [...] },
   *     { game: "auditory_memory", rounds: [...] },
   *     { game: "rhythm", rounds: [...] }
   *   ]
   * }
   */
  getSessionExportObject() {
    return {
      session_id: this.sessionId,
      started_at: this.startedAt,
      completed_at: this.completedAt || new Date().toISOString(),
      metadata: {
        paper: "Screening Dyslexia Using Visual Auditory Computer Games and Machine Learning (IEEE Access 2025)",
        tool_type: "Research Behavioral Telemetry Collector (Non-Diagnostic)",
        total_games: this.gameNames.length,
        total_rounds: this.getTotalRoundsCount()
      },
      games: this.gameNames.map(name => ({
        game: name,
        rounds: this.gamesData[name] || []
      }))
    };
  }

  /**
   * Download Session JSON file
   */
  exportJSON() {
    this.completedAt = new Date().toISOString();
    const payload = this.getSessionExportObject();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dyslexia_screening_session_${this.sessionId.slice(0, 8)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Download comprehensive flattened CSV for data analysis / Pandas ML pipelines
   */
  exportCSV() {
    const flatRows = [];
    const headers = [
      "session_id",
      "game_name",
      "round_number",
      "difficulty",
      "first_click_interval",
      "second_click_interval",
      "third_click_interval",
      "fourth_click_interval",
      "fifth_click_interval",
      "sixth_click_interval",
      "time_last_click",
      "total_clicks",
      "correct_answers",
      "wrong_answers",
      "distractor_1_clicks",
      "distractor_2_clicks",
      "distractor_3_clicks",
      "efficiency",
      "accuracy",
      "round_duration",
      "thinking_duration",
      "target_audio_repetitions",
      "timing_error",
      "error_type",
      "selected_cue",
      "timestamp"
    ];

    this.gameNames.forEach(gameName => {
      const rounds = this.gamesData[gameName] || [];
      rounds.forEach(r => {
        flatRows.push([
          this.sessionId,
          gameName,
          r.round_number || 1,
          r.difficulty || 1,
          r.first_click_interval !== undefined && r.first_click_interval !== null ? r.first_click_interval : "",
          r.second_click_interval !== undefined && r.second_click_interval !== null ? r.second_click_interval : "",
          r.third_click_interval !== undefined && r.third_click_interval !== null ? r.third_click_interval : "",
          r.fourth_click_interval !== undefined && r.fourth_click_interval !== null ? r.fourth_click_interval : "",
          r.fifth_click_interval !== undefined && r.fifth_click_interval !== null ? r.fifth_click_interval : "",
          r.sixth_click_interval !== undefined && r.sixth_click_interval !== null ? r.sixth_click_interval : "",
          r.time_last_click || "",
          r.total_clicks || "",
          r.correct_answers !== undefined ? r.correct_answers : (r.correct_clicks || ""),
          r.wrong_answers !== undefined ? r.wrong_answers : (r.wrong_clicks || ""),
          r.distractor_1_clicks !== undefined ? r.distractor_1_clicks : "",
          r.distractor_2_clicks !== undefined ? r.distractor_2_clicks : "",
          r.distractor_3_clicks !== undefined ? r.distractor_3_clicks : "",
          r.efficiency !== undefined ? r.efficiency : "",
          r.accuracy !== undefined ? r.accuracy : "",
          r.round_duration || r.completion_time || r.total_response_time || "",
          r.thinking_duration || "",
          r.target_audio_repetitions || "",
          r.timing_error !== undefined ? r.timing_error : "",
          `"${r.error_type || ''}"`,
          `"${r.selected_cue || ''}"`,
          r.timestamp
        ].join(","));
      });
    });

    if (flatRows.length === 0) {
      alert("No gameplay rounds have been recorded yet in this session.");
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent([headers.join(","), ...flatRows].join("\n"));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", `dyslexia_screening_features_${this.sessionId.slice(0, 8)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Reset session
   */
  resetSession() {
    this.sessionId = this.generateUUID();
    this.startedAt = new Date().toISOString();
    this.completedAt = null;
    this.gameNames.forEach(name => {
      this.gamesData[name] = [];
    });
    this.notifyUpdate('reset', null);
  }
}

if (typeof window !== 'undefined') {
  window.TelemetryCollector = TelemetryCollector;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TelemetryCollector;
}

