#!/usr/bin/env python3
"""Download the VinAI vi-en model into the repository's ignored model directory."""

from pathlib import Path

from transformers import AutoModelForSeq2SeqLM, AutoTokenizer


MODEL_NAME = "vinai/vinai-translate-vi2en-v2"
MODEL_DIR = Path(__file__).resolve().parents[1] / ".translation-model" / "vinai-translate-vi2en-v2"


def main() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, src_lang="vi_VN")
    model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
    tokenizer.save_pretrained(MODEL_DIR)
    model.save_pretrained(MODEL_DIR)
    print(f"Local vi-en model ready at {MODEL_DIR}")


if __name__ == "__main__":
    main()
