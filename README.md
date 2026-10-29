# Cognitive Quest: Research Dyslexia Behavioral Telemetry Battery

A research-grounded web mini-game battery designed to collect language-independent behavioral interaction features for early dyslexia screening research, inspired by:

> **"Screening Dyslexia Using Visual Auditory Computer Games and Machine Learning"**  
> *Maria Rauschenberger, Ricardo Baeza-Yates, Luz Rello (IEEE Access 2025)*

---

## ⚠️ Important Scientific & Ethical Disclaimer
- **Non-Diagnostic:** This prototype **does not diagnose**, predict dyslexia, or assign risk probability scores to children.
- **Objective Feature Collection:** Its sole function is to record high-resolution natural behavioral interaction features (click intervals, reaction times, error orientations, thinking duration) while a child engages in playful gameplay.
- **No In-Game Forms:** The child experiences only enjoyable, child-friendly games. All telemetry is measured passively and automatically in the background.

---

## 🎮 The 6 Research Games

### 1. Visual Search (`visual_search`)
- **Stimuli:** 9 distinct non-linguistic categories: symbols, shapes, Z-like shapes, rectangles, faces, fruits, kitchen objects, plants, animals.
- **Mechanics:** 
  1. Displays the target visual cue for ~3 seconds.
  2. Displays the search grid (2×2 for early rounds, 3×3 for advanced rounds).
  3. The child finds and taps the target repeatedly within a 15-second active search window.
  4. **Dynamic Reshuffle:** Grid positions randomize after every single click.
- **Features Collected:**
  - `first_click_interval` (ms)
  - `second_click_interval` (ms)
  - `third_click_interval` (ms)
  - `fourth_click_interval` (ms)
  - `fifth_click_interval` (ms)
  - `sixth_click_interval` (ms)
  - `time_last_click` (ms)
  - `total_clicks`
  - `correct_answers`
  - `wrong_answers`
  - `distractor_1_clicks`, `distractor_2_clicks`, `distractor_3_clicks`
  - `efficiency`
  - `accuracy`
  - `click_timestamps` (raw ms timestamps array)

---

### 2. Visual Memory (`visual_memory`)
- **Mechanics:**
  1. Presents target cue for observation (3s).
  2. Hides the target behind a brief retention delay mask.
  3. Displays candidate choice cards (2 to 4 choices, increasing with difficulty).
  4. Child selects the remembered target.
- **Features Collected:**
  - `first_click_interval`
  - `total_response_time`
  - `correct_answers`
  - `wrong_answers`
  - `total_clicks`
  - `attempts`
  - `target_position`
  - `selected_position`
  - `accuracy`
  - `difficulty`
  - `click_timestamps`

---

### 3. Visual Symmetry / Discrimination (`symmetry`)
- **Mechanics:**
  1. Displays an asymmetric target shape.
  2. Presents candidate cards including:
     - Exact match target
     - Distractor 1: Horizontally mirrored shape (reflection)
     - Distractor 2: Vertically mirrored or 90°/180° rotated shape
     - Distractor 3: Visually similar altered shape (subtle contour/notch variation)
  3. Child identifies the identical twin shape.
- **Features Collected:**
  - `first_click_interval`
  - `subsequent_click_intervals`
  - `total_clicks`
  - `correct_answers`
  - `wrong_answers`
  - `distractor_1_clicks`
  - `distractor_2_clicks`
  - `distractor_3_clicks`
  - `accuracy`
  - `efficiency`
  - `error_type` (`'none'`, `'mirrored_horizontal'`, `'mirrored_vertical'`, `'rotated_90'`, `'visually_similar'`)
  - `click_timestamps`

---

### 4. Pattern Memory (`pattern_memory`)
- **Preserved from Pattern Quest:**
  - Sequential highlighted tile lighting with synthesized musical pentatonic feedback.
  - Difficulty levels:
    - Level 1: 3×3 grid → 2 tiles
    - Level 2: 3×3 grid → 3 tiles
    - Level 3: 3×3 grid → 4 tiles
    - Level 4: 4×4 grid → 4 tiles
    - Level 5: 4×4 grid → 5 tiles
- **Features Collected:**
  - `first_click_interval`
  - `second_click_interval`
  - `third_click_interval`
  - `fourth_click_interval`
  - `fifth_click_interval`
  - `total_clicks`
  - `correct_clicks`
  - `wrong_clicks`
  - `completion_time`
  - `accuracy`
  - `efficiency`
  - `pattern_length`
  - `difficulty`
  - `click_timestamps`

---

### 5. Auditory Memory (`auditory_memory`)
- **Mechanics:**
  1. Synthesizes a target melody (e.g. C4-E4-G4 using pure Web Audio API marimba synthesis).
  2. Child can replay the target melody at any time via a dedicated replay button.
  3. Displays 3 candidate melody cards with audition play buttons.
  4. Child listens and selects the matching sound sequence.
- **Features Collected:**
  - `instruction_listening_count`
  - `round_duration`
  - `thinking_duration` (latency between the completion of audio playback and the decision tap)
  - `target_audio_repetitions`
  - `correct_answers`
  - `wrong_answers`
  - `total_correct_answers` (cumulative across auditory rounds)
  - `total_wrong_answers` (cumulative across auditory rounds)
  - `selected_cue`
  - `selected_button_position`
  - `total_audio_replays`
  - `audio_listening_duration`
  - `difficulty`
  - `target_sequence`
  - `selected_sequence`
  - `click_timestamps`

---

### 6. Rhythm / Auditory Sequence (`rhythm`)
- **Mechanics:**
  1. Plays a target percussion rhythm (e.g., `TAP → TAP → CLAP` with woodblock, claps, and bells).
  2. Displays an animated beat visualizer.
  3. Child can replay the target rhythm.
  4. Four candidate choices are provided with audition playback.
  5. Child selects the matching rhythm.
- **Features Collected:**
  - `target_audio_repetitions`
  - `round_duration`
  - `thinking_duration`
  - `correct_answers`
  - `wrong_answers`
  - `total_answers`
  - `selected_cue`
  - `selected_button_position`
  - `sequence_length`
  - `timing_error` (mathematical beat offset discrepancy in ms)
  - `click_timestamps`

---

## 📦 Data Structure

Sessions are structured as follows:

```json
{
  "session_id": "sess_x8f9a2b_1774415829102",
  "started_at": "2026-09-24T05:15:30.000Z",
  "completed_at": "2026-09-24T05:22:15.000Z",
  "metadata": {
    "paper": "Screening Dyslexia Using Visual Auditory Computer Games and Machine Learning (IEEE Access 2025)",
    "tool_type": "Research Behavioral Telemetry Collector (Non-Diagnostic)",
    "total_games": 6,
    "total_rounds": 25
  },
  "games": [
    {
      "game": "visual_search",
      "rounds": [
        {
          "round_number": 1,
          "difficulty": 1,
          "grid_layout": "2x2",
          "target_category": "shapes",
          "first_click_interval": 1240,
          "second_click_interval": 840,
          "third_click_interval": 1110,
          "fourth_click_interval": 950,
          "fifth_click_interval": 1020,
          "sixth_click_interval": 880,
          "time_last_click": 14200,
          "total_clicks": 14,
          "correct_answers": 12,
          "wrong_answers": 2,
          "distractor_1_clicks": 1,
          "distractor_2_clicks": 1,
          "distractor_3_clicks": 0,
          "efficiency": 0.8571,
          "accuracy": 0.8571,
          "click_timestamps": [1240, 2080, 3190, 4140, 5160, 6040, 7100, 8300, 9500, 10700, 11800, 12600, 13400, 14200],
          "click_intervals": [1240, 840, 1110, 950, 1020, 880, 1060, 1200, 1200, 1200, 1100, 800, 800, 800]
        }
      ]
    },
    { "game": "visual_memory", "rounds": [...] },
    { "game": "symmetry", "rounds": [...] },
    { "game": "pattern_memory", "rounds": [...] },
    { "game": "auditory_memory", "rounds": [...] },
    { "game": "rhythm", "rounds": [...] }
  ]
}
```

---

## 🛠️ Built-In Tools for Researchers
- **Live Telemetry Side Drawer (`🔬 Telemetry`):** Click the button in the top right to open a real-time stream of incoming click intervals, reaction times, and live JSON tree updates while observing the child.
- **One-Click JSON Export:** Downloads the complete structured session file.
- **One-Click CSV Export:** Generates an ML-ready flattened dataset file with column headers ready for `pandas.read_csv()`.
- **Pure Web Audio API:** Zero external audio files; all sounds are generated programmatically in the browser. Zero network lag or missing assets.

---

## 🚀 How to Run
Simply open `index.html` in any modern web browser:
```bash
# Optional: Launch with Python simple server
python -m http.server 8000
# Then navigate to: http://localhost:8000
```
Or double-click `index.html` directly in File Explorer.
