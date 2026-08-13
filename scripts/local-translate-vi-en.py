#!/usr/bin/env python3
"""Line-delimited JSON bridge for a local VinAI Vietnamese-to-English model."""

import json
import os
import select
import sys

import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer


def main() -> None:
    default_model_path = (
        os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            ".translation-model",
            "vinai-translate-vi2en-v2",
        )
    )
    model_path = os.environ.get("LOCAL_TRANSLATOR_MODEL", default_model_path)
    tokenizer = AutoTokenizer.from_pretrained(
        model_path,
        src_lang="vi_VN",
        local_files_only=True,
    )
    model = AutoModelForSeq2SeqLM.from_pretrained(model_path, local_files_only=True)
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    num_beams = max(1, int(os.environ.get("LOCAL_TRANSLATOR_NUM_BEAMS", "2")))
    max_new_tokens = max(64, int(os.environ.get("LOCAL_TRANSLATOR_MAX_NEW_TOKENS", "384")))
    model.to(device)
    model.eval()

    while True:
        raw_line = sys.stdin.readline()
        if not raw_line:
            break

        raw_lines = [raw_line]
        while len(raw_lines) < 8:
            ready, _, _ = select.select([sys.stdin], [], [], 0.03)
            if not ready:
                break
            next_line = sys.stdin.readline()
            if not next_line:
                break
            raw_lines.append(next_line)

        requests = []
        for line in raw_lines:
            try:
                requests.append(json.loads(line))
            except Exception as error:
                sys.stdout.write(json.dumps({"id": None, "error": str(error)}) + "\n")

        try:
            active_requests = [request for request in requests if request.get("text", "")]
            translations = {}
            if active_requests:
                texts = [request["text"] for request in active_requests]
                encoded = tokenizer(
                    texts,
                    return_tensors="pt",
                    padding=True,
                    truncation=True,
                    max_length=512,
                ).to(device)
                with torch.inference_mode():
                    output_ids = model.generate(
                        **encoded,
                        decoder_start_token_id=tokenizer.lang_code_to_id["en_XX"],
                        num_return_sequences=1,
                        num_beams=num_beams,
                        early_stopping=num_beams > 1,
                        no_repeat_ngram_size=3,
                        max_new_tokens=max_new_tokens,
                    )
                decoded = tokenizer.batch_decode(output_ids, skip_special_tokens=True)
                translations = {
                    request["id"]: translated
                    for request, translated in zip(active_requests, decoded, strict=True)
                }

            for request in requests:
                response = {
                    "id": request.get("id"),
                    "translated": translations.get(request.get("id"), request.get("text", "")),
                }
                sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
            sys.stdout.flush()
        except Exception as error:  # Keep the bridge alive and report per batch.
            for request in requests:
                response = {"id": request.get("id"), "error": str(error)}
                sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
