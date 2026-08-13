# Dual MongoDB English content sync

This migration fills only `translations.en` in the two configured MongoDB
sources. It never copies orders, users, stock, vouchers, or payment data
between clusters. Audit is read-only, preview creates a review artifact, and
apply creates compressed backups before writing.

## Local translator setup

The translator runs locally. MongoDB content is not sent to a translation API.

```bash
python3 -m venv .translation-venv
.translation-venv/bin/pip install -r scripts/requirements-i18n-sync.txt
.translation-venv/bin/python scripts/setup-local-translation.py
```

The model and virtual environment are ignored by Git.

## Environment

Set these values in the shell without committing them:

```bash
export MONGODB_PRIMARY_A_URI='mongodb+srv://...'
export MONGODB_PRIMARY_B_URI='mongodb+srv://...'
```

Optional overrides:

```bash
export LOCAL_TRANSLATOR_PYTHON="$PWD/.translation-venv/bin/python"
export LOCAL_TRANSLATOR_MODEL="$PWD/.translation-model/vinai-translate-vi2en-v2"
```

## Safe execution order

```bash
npm run audit:i18n:dual
npm run preview:i18n:dual
npm run sync:i18n:dual
npm run audit:i18n:dual
```

- `audit` only reports missing/partial/complete coverage.
- `preview` translates locally but does not write MongoDB.
- `sync` creates full compressed backups, then fills missing English fields.
- Existing English values are preserved unless `--overwrite` is explicitly
  supplied.
- `--cluster=A`, `--cluster=B`, `--collection=products`, and `--limit=10` can
  be used to scope a run.
- Reports and backups are written to the ignored `backups/` directory.
