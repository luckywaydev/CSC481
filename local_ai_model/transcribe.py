import os
import sys
import argparse
import warnings
from tqdm import tqdm
import wave
import contextlib

# ปิด warning messages
warnings.filterwarnings("ignore", category=UserWarning)

try:
    from faster_whisper import WhisperModel
except Exception as e:
    WhisperModel = None
    import_error = e


def transcribe_audio(audio_path, model_size="large-v3", use_gpu=True, debug=False):
    """
    ฟังก์ชันหลักสำหรับถอดเสียงไฟล์

    พารามิเตอร์:
    - audio_path: path ของไฟล์เสียง (เช่น "test.mp3")
    - model_size: ขนาดโมเดล (เช่น "small", "medium", "large-v3")
        * ปรับตรงนี้ถ้าต้องการลดการใช้หน่วยความจำหรือความแม่นยำ
    - use_gpu: ถ้า True จะพยายามรันบน GPU (compute_type = float16)
        * ถ้าไม่มี GPU หรือต้องการใช้ CPU ให้ส่ง use_gpu=False หรือใช้ --no-gpu
    - debug: ถ้า True จะแสดง word timestamps
    """
    if WhisperModel is None:
        print("Error: faster-whisper is not available. Install it with: pip install faster-whisper")
        print(f"(Import error: {import_error})")
        sys.exit(1)

    # กำหนดอุปกรณ์และ compute type
    # - device: "cuda" เมื่อใช้ GPU, "cpu" เมื่อใช้ CPU
    # - compute_type: float16 (GPU, แม่นยำและเร็ว) หรือ int8 (CPU, ประหยัดหน่วยความจำ)
    device = "cuda" if use_gpu else "cpu"
    compute_type = "float16" if use_gpu else "int8"

    print(f"Loading model {model_size} (device={device}, compute_type={compute_type})...", end='', flush=True)
    model = WhisperModel(model_size, device=device, compute_type=compute_type)
    print(" Done!")

    print(f"Transcribing {audio_path}...")
    # เรียก transcribe:
    # - beam_size: ค่ามาตรฐานที่นี่เป็น 5 (เพิ่มค่า -> มักได้ผลลัพธ์แม่นขึ้นแต่ช้าลง)
    # - word_timestamps: ถ้าต้องการเวลาเป็นระดับคำให้ True
    # - vad_filter: กรองช่วงเงียบ (ช่วยลดเวลาและ noise)
    segments, info = model.transcribe(
        audio_path,
        beam_size=5,  # <-- ปรับตรงนี้ถ้าต้องการ trade-off accuracy/speed
        word_timestamps=True,  # <-- ปรับเป็น False ถ้าไม่ต้องการเวลาเป็นระดับคำ
        vad_filter=True,  # <-- ปรับเป็น False ถ้าต้องการ transcribe ทุกช่วง
    )

    # Convert generator to list to actually run the transcription
    segments = list(segments)

    print(f"\nDetected language: {info.language} (probability: {info.language_probability:.2f})")

    # Print results
    print("\nTranscription:")
    for segment in segments:
        print(f"\n[{segment.start:.2f}s -> {segment.end:.2f}s] {segment.text}")
        # แสดง word timestamps เฉพาะเมื่อ debug=True
        if debug and hasattr(segment, "words") and segment.words:
            print("Word timestamps:")
            for word in segment.words:
                print(f"  {word.word}: {word.start:.2f}s -> {word.end:.2f}s")

    return segments, info


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