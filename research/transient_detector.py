"""
Transient detector: same analysis and visualization as tranDec.ipynb,
with sound playback and playhead overlay from main.py.
"""
import os
import time
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import librosa
import librosa.onset
import sounddevice as sd
from matplotlib.animation import FuncAnimation

# Good ones
# - il risveglio / 0.8
# - il laminatore / 0.78
# - i colori dell_acciaio / 0.7

# ======================
# Config (from notebook)
# ======================
AUDIO_FILE = os.path.join(
    os.path.dirname(__file__), "sounds", "Forno in fusione.mp3"
)
SENSITIVITY = 0.7
OUTPUT_CSV = os.path.join(
    os.path.dirname(__file__), "transients.csv"
)


def _local_maxima_1d(x: np.ndarray) -> np.ndarray:
    """Indices where x is strictly greater than both neighbors (interior only)."""
    if len(x) < 3:
        return np.array([], dtype=int)
    left = x[1:-1] > x[:-2]
    right = x[1:-1] > x[2:]
    return np.nonzero(left & right)[0] + 1


def detect_transients(audio_path: str, sensitivity: float = 0.5):
    """Load audio, onset envelope; detect every local maximum above threshold.
    Unlike librosa's onset_detect (which uses wait/delta and can skip high
    peaks in dense regions), we mark every peak above threshold so the graph
    is consistent: high peaks are never ignored in favour of lower ones.
    """
    y, sr = librosa.load(audio_path, sr=None, mono=True)
    duration = librosa.get_duration(y=y, sr=sr)

    hop_length = 512
    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_length)
    onset_env_norm = onset_env / (onset_env.max() + 1e-10)

    threshold = 1.0 - np.clip(sensitivity, 0.0, 1.0)

    # Every local maximum in the envelope above threshold → one transient
    peak_frames = _local_maxima_1d(onset_env_norm)
    mask = onset_env_norm[peak_frames] >= threshold
    onset_frames = peak_frames[mask]

    onset_times = librosa.frames_to_time(
        onset_frames, sr=sr, hop_length=hop_length
    )
    onset_strengths = onset_env_norm[onset_frames]

    return (
        y, sr, duration, onset_env_norm, onset_times, onset_strengths, hop_length
    )


# ======================
# Run detection
# ======================
(
    y, sr, duration, onset_env_norm, onset_times, onset_strengths, hop_length
) = detect_transients(AUDIO_FILE, SENSITIVITY)

print(f"File: {AUDIO_FILE}")
print(f"Sample rate: {sr} Hz")
print(f"Durata: {duration:.2f} s")
print(f"Transienti rilevati: {len(onset_times)}")

# ======================
# Plot (exact visualization from notebook)
# ======================
fig, axes = plt.subplots(2, 1, figsize=(16, 8), sharex=True)

time_axis = np.linspace(0, duration, num=len(y))
axes[0].plot(time_axis, y, linewidth=0.3, color="#3370cc")
for t in onset_times:
    axes[0].axvline(x=t, color="red", alpha=0.6, linewidth=0.8)
axes[0].set_ylabel("Ampiezza")
axes[0].set_title("Forma d'onda + transienti rilevati")

env_time = librosa.frames_to_time(
    np.arange(len(onset_env_norm)), sr=sr, hop_length=hop_length
)
axes[1].plot(env_time, onset_env_norm, linewidth=0.6, color="#3370cc")
axes[1].set_ylim(0, 1)
for t in onset_times:
    axes[1].axvline(x=t, color="red", alpha=0.6, linewidth=0.8)
axes[1].set_ylabel("Onset strength")
axes[1].set_xlabel("Tempo (s)")
axes[1].set_title("Onset envelope + transienti rilevati (0–1)")

# Playhead lines (one per subplot)
playhead0 = axes[0].axvline(0, color="white", linewidth=2)
playhead1 = axes[1].axvline(0, color="white", linewidth=2)

plt.tight_layout()

# ======================
# CSV export (from notebook)
# ======================
df = pd.DataFrame({
    "transient_index": np.arange(1, len(onset_times) + 1),
    "timestamp_s": np.round(onset_times, 6),
    "strength": onset_strengths,
    "strength_rounded": np.round(onset_strengths, 2),
})
df.to_csv(OUTPUT_CSV, index=False)
print(f"CSV salvato in: {os.path.abspath(OUTPUT_CSV)}")

# ======================
# Audio playback (from main.py: loop + play/pause)
# ======================
stream_start_time = None
stream_start_position = 0.0
paused = False
paused_position = 0.0


def play_from(position=0.0):
    global stream_start_time, stream_start_position, paused
    paused = False
    stream_start_position = position
    stream_start_time = time.perf_counter()
    start_sample = int(position * sr)
    sd.play(y[start_sample:], sr, blocking=False)


def pause_playback():
    global paused, paused_position, stream_start_time, stream_start_position
    sd.stop()
    paused = True
    if stream_start_time is not None:
        elapsed = time.perf_counter() - stream_start_time
        paused_position = stream_start_position + elapsed


def get_elapsed():
    if paused:
        return paused_position
    if stream_start_time is not None:
        elapsed = time.perf_counter() - stream_start_time
        return stream_start_position + elapsed
    return 0.0


def on_key(event):
    global paused
    if event.key != " ":
        return
    if paused:
        play_from(paused_position)
    else:
        pause_playback()


fig.canvas.mpl_connect("key_press_event", on_key)

# ======================
# Animation: update playhead (from main.py)
# ======================


def update(frame):
    if stream_start_time is None and not paused:
        return playhead0, playhead1

    elapsed = get_elapsed()
    if not paused and elapsed >= duration:
        play_from(0.0)
        elapsed = 0.0

    playhead0.set_xdata([elapsed, elapsed])
    playhead1.set_xdata([elapsed, elapsed])
    return playhead0, playhead1


ani = FuncAnimation(fig, update, interval=30, blit=True)

# Start playback when window appears
plt.pause(0.1)
play_from(0.0)

plt.show()
sd.stop()
