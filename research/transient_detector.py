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
# - i colori dell_acciaio / 0.7
# - I suoni della notte / 0.64 / divide in groups by distance
# - il laminatore / 0.78
# - il risveglio / 0.8
# - il tornitore / 0.83 / there is a loop, find indices
# - operaio ignoto / 0.6

config: list[tuple[str, float, float]] = [
    ("i colori dell_acciaio", 0.9, 0.1),
    ("I suoni della notte", 0.62, 0.1),
    ("il laminatore", 0.78, 0.1),
    ("il risveglio", 0.8, 0.1),
    ("il tornitore", 0.83, 0.3),
    ("operaio ignoto", 0.6, 0.1),
]

current_config = 5
current_config_name, current_config_sensitivity, current_config_min_peak_interval_s = config[
    current_config]
input_file = current_config_name + ".mp3"
output_file = current_config_name + ".transients.csv"

# ======================
# Config (from notebook)
# ======================
AUDIO_FILE = os.path.join(os.path.dirname(__file__), "data", input_file)
SENSITIVITY = current_config_sensitivity
# Minimum time (seconds) between consecutive peaks; closer peaks are merged (stronger kept). 0 = disabled.
MIN_PEAK_INTERVAL_S = current_config_min_peak_interval_s
OUTPUT_CSV = os.path.join(os.path.dirname(__file__), "data", output_file)


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


def filter_close_peaks(
    onset_times: np.ndarray,
    onset_strengths: np.ndarray,
    min_interval_s: float,
) -> tuple[np.ndarray, np.ndarray]:
    """Remove consecutive peaks closer than min_interval_s; when merging, keep the stronger peak."""
    if min_interval_s <= 0 or len(onset_times) <= 1:
        return onset_times, onset_strengths
    keep = [0]
    for i in range(1, len(onset_times)):
        if onset_times[i] - onset_times[keep[-1]] >= min_interval_s:
            keep.append(i)
        else:
            if onset_strengths[i] > onset_strengths[keep[-1]]:
                keep[-1] = i
    return onset_times[keep], onset_strengths[keep]


# ======================
# Run detection
# ======================
(
    y, sr, duration, onset_env_norm, onset_times, onset_strengths, hop_length
) = detect_transients(AUDIO_FILE, SENSITIVITY)

onset_times, onset_strengths = filter_close_peaks(
    onset_times, onset_strengths, MIN_PEAK_INTERVAL_S
)

print(f"File: {AUDIO_FILE}")
print(f"Sample rate: {sr} Hz")
print(f"Durata: {duration:.2f} s")
print(f"Transienti rilevati: {len(onset_times)}")

# ======================
# Spectral features (centroid, rolloff) and pitch (F0)
# ======================
centroid = librosa.feature.spectral_centroid(
    y=y, sr=sr, hop_length=hop_length
)[0]
# Rolloff: frequency below which 85% of spectral energy lies (brightness)
rolloff = librosa.feature.spectral_rolloff(
    y=y, sr=sr, hop_length=hop_length, roll_percent=0.85
)[0]
# Pitch (fundamental frequency F0) per frame; 0 where no clear pitch
f0, *_ = librosa.pyin(
    y,
    fmin=float(librosa.note_to_hz("C2")),
    fmax=float(librosa.note_to_hz("C7")),
    sr=sr,
    hop_length=hop_length,
)
f0 = np.nan_to_num(f0, nan=0.0, posinf=0.0, neginf=0.0)
# Align length (pyin can return one frame less)
n_frames = min(len(centroid), len(rolloff), len(f0))
centroid = centroid[:n_frames]
rolloff = rolloff[:n_frames]
f0 = f0[:n_frames]
centroid_times = librosa.frames_to_time(
    np.arange(n_frames), sr=sr, hop_length=hop_length
)

# ======================
# Plot (exact visualization from notebook)
# ======================
fig, axes = plt.subplots(2, 1, figsize=(16, 8), sharex=True)

time_axis = np.linspace(0, duration, num=len(y))
axes[0].plot(time_axis, y, linewidth=0.3, color="#3370cc")
ylim0 = axes[0].get_ylim()
for i, t in enumerate(onset_times):
    axes[0].axvline(x=t, color="red", alpha=0.6, linewidth=0.8)
    axes[0].text(t, ylim0[1] * 0.98, str(i + 1), fontsize=6,
                 ha="center", va="top", color="red")
axes[0].set_ylim(ylim0)
ax0_twin = axes[0].twinx()
ax0_twin.plot(
    centroid_times, centroid, color="lime", linewidth=1.2, label="Spectral centroid"
)
ax0_twin.set_ylabel("Centroide spettrale (Hz)", color="lime")
ax0_twin.tick_params(axis="y", labelcolor="lime")
axes[0].set_ylabel("Ampiezza")
axes[0].set_title("Forma d'onda + transienti rilevati + centroide spettrale")

env_time = librosa.frames_to_time(
    np.arange(len(onset_env_norm)), sr=sr, hop_length=hop_length
)
axes[1].plot(env_time, onset_env_norm, linewidth=0.6, color="#3370cc")
axes[1].set_ylim(0, 1)
for i, t in enumerate(onset_times):
    axes[1].axvline(x=t, color="red", alpha=0.6, linewidth=0.8)
    axes[1].text(t, 0.98, str(i + 1), fontsize=6,
                 ha="center", va="top", color="red")
axes[1].set_ylabel("Onset strength")
axes[1].set_xlabel("Tempo (s)")
axes[1].set_title("Onset envelope + transienti rilevati (0–1)")

# Playhead lines (one per subplot)
playhead0 = axes[0].axvline(0, color="white", linewidth=2)
playhead1 = axes[1].axvline(0, color="white", linewidth=2)

plt.tight_layout()

# ======================
# Peak descriptors at each onset (interpolate from frame-level features)
# ======================
peak_frequencies_hz = np.interp(onset_times, centroid_times, centroid)
peak_rolloff_hz = np.interp(onset_times, centroid_times, rolloff)
peak_pitch_hz = np.interp(onset_times, centroid_times, f0)

# Classify as low / mid / high (Hz): low <= 250, mid 250–2000, high > 2000


def frequency_band(f_hz: float) -> str:
    if f_hz <= 250:
        return "low"
    if f_hz <= 2000:
        return "mid"
    return "high"


# Pitch band: same bounds; "unvoiced" when no clear pitch (F0 ≈ 0)
def pitch_band(f0_hz: float) -> str:
    if f0_hz < 20:
        return "unvoiced"
    return frequency_band(f0_hz)


frequency_bands = np.array([frequency_band(f) for f in peak_frequencies_hz])
rolloff_bands = np.array([frequency_band(f) for f in peak_rolloff_hz])
pitch_bands = np.array([pitch_band(f) for f in peak_pitch_hz])

# Wavelength λ = c / f (c = speed of sound in air ≈ 343 m/s)
SPEED_OF_SOUND_M_S = 343.0
peak_freq_safe = np.maximum(
    peak_frequencies_hz, 1e-6)  # avoid division by zero
wavelength_m = SPEED_OF_SOUND_M_S / peak_freq_safe

# ======================
# CSV export (from notebook)
# ======================
df = pd.DataFrame({
    "transient_index": np.arange(1, len(onset_times) + 1),
    "timestamp_s": np.round(onset_times, 6),
    "strength": onset_strengths,
    "strength_rounded": np.round(onset_strengths, 2),
    "frequency_hz": peak_frequencies_hz,
    "frequency_hz_rounded": np.round(peak_frequencies_hz, 1),
    "frequency_band": frequency_bands,
    "wavelength_m": wavelength_m,
    "wavelength_m_rounded": np.round(wavelength_m, 4),
    "rolloff_hz": peak_rolloff_hz,
    "rolloff_hz_rounded": np.round(peak_rolloff_hz, 1),
    "rolloff_band": rolloff_bands,
    "pitch_hz": peak_pitch_hz,
    "pitch_hz_rounded": np.round(peak_pitch_hz, 1),
    "pitch_band": pitch_bands,
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
