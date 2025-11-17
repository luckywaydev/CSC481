import os
import sys
import argparse
import warnings
import time

# ปิด warning messages
warnings.filterwarnings("ignore", category=UserWarning)

try:
    from faster_whisper import WhisperModel
except Exception as e:
    WhisperModel = None
    import_error = e

def print_progress(percentage):
    """แสดง progress ในบรรทัดเดียว"""
    sys.stdout.write(f"\rTranscribing: {percentage:3.0f}%")
    sys.stdout.flush()

def transcribe_audio(audio_path, model_size="large-v3", use_gpu=True, debug=False):
    if WhisperModel is None:
        print("Error: faster-whisper is not available. Install it with: pip install faster-whisper")
        print(f"(Import error: {import_error})")
        sys.exit(1)

    device = "cuda" if use_gpu else "cpu"
    compute_type = "float16" if use_gpu else "int8"

    model = WhisperModel(model_size, device=device, compute_type=compute_type)
    print_progress(0)

    segments, info = model.transcribe(
        audio_path,
        beam_size=5,
        word_timestamps=True,
        vad_filter=True
    )

    collected_segments = []
    last_time = 0
    total_duration = 21.80

    for segment in segments:
        collected_segments.append(segment)
        if segment.end > last_time:
            last_time = segment.end
            progress = min(100, int((last_time / total_duration) * 100))
            print_progress(progress)

    print_progress(100)
    print("\n")

    print(f"Detected language: {info.language} (probability: {info.language_probability:.2f})")
    print("\nTranscription:")
    for segment in collected_segments:
        print(f"[{segment.start:.2f}s -> {segment.end:.2f}s] {segment.text}")
        if debug and hasattr(segment, "words") and segment.words:
            for word in segment.words:
                print(f"  {word.word}: {word.start:.2f}s -> {word.end:.2f}s")

    return collected_segments, info

def main(argv=None):
    parser = argparse.ArgumentParser(description="Transcribe audio with faster-whisper")
    parser.add_argument("audio_file", nargs="?", help="Path to the audio file (e.g. test.mp3)")
    parser.add_argument("--model", default="large-v3", help="Model size to use (default: large-v3)")
    parser.add_argument("--no-gpu", action="store_true", help="Disable GPU even if available")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode to show word timestamps")

    args = parser.parse_args(argv)
    audio_file = args.audio_file or "test.mp3"

    if not os.path.exists(audio_file):
        print(f"Please place an audio file at {audio_file}")
        sys.exit(1)

    use_gpu = not args.no_gpu
    transcribe_audio(audio_file, model_size=args.model, use_gpu=use_gpu, debug=args.debug)

if __name__ == "__main__":
    main()
