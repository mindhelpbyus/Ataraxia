#!/bin/bash
# Design-token gate — CLAUDE.md "Design System" section, rule 1.
#
# Flags raw Tailwind color utilities (slate/zinc/gray/indigo/blue/red/green/
# emerald/purple/violet/rose/amber/orange) instead of the Ink-on-Parchment
# token utilities. Chart-library props (Recharts fill/stroke/tick) legitimately
# need literal color strings — those live as var(--token) and are exempted by
# file, not by pattern, since a text-based exemption would just become the new
# escape hatch.
#
# BASELINE MODE (default): the 2026-07 audit found ~750 pre-existing hits
# outside the 5 files already swept. Rather than block all other work on a
# full-codebase rewrite, this gate fails only when the count *increases* past
# the tracked baseline — i.e. it stops new drift immediately and turns the
# backlog into a visible, shrinking number instead of an invisible one.
# Pay down the baseline by fixing a file, re-running with --update-baseline,
# and committing the new (lower) number.
#
# Usage:
#   ./scripts/check-design-tokens.sh                  # gate mode (CI)
#   ./scripts/check-design-tokens.sh --update-baseline # after fixing files
#   ./scripts/check-design-tokens.sh --all             # print every hit, no gate

set -euo pipefail
cd "$(dirname "$0")/.."

BASELINE_FILE="scripts/.design-token-baseline"

PATTERN='(bg|text|border|ring|from|via|to|fill|stroke|divide|outline|shadow)-(slate|zinc|gray|indigo|blue|red|green|emerald|purple|violet|rose|amber|orange)-[0-9]{2,3}\b'

# Deliberate multi-color semantic content, reviewed and allowed (see CLAUDE.md
# rule 1 exception): mood scales / time-of-day gradients. Add new exemptions
# here only with a comment explaining why — this list should stay short.
EXEMPT_FILES=(
  "src/components/ClientDashboardView.tsx"   # 5-point mood-scale color array + getMoodIcon
  "src/components/TherapistHomeView.tsx"     # time-of-day greeting gradient (morning/afternoon/evening)
)

exempt_grep_args=()
for f in "${EXEMPT_FILES[@]}"; do
  exempt_grep_args+=(--exclude="$(basename "$f")")
done

MATCHES=$(grep -rnE "$PATTERN" src/components src/App.tsx --include="*.tsx" "${exempt_grep_args[@]}" 2>/dev/null || true)
COUNT=$(echo "$MATCHES" | grep -c "^src/" || true)

if [ "${1:-}" = "--all" ]; then
  echo "$MATCHES"
  echo ""
  echo "Total: $COUNT"
  exit 0
fi

if [ "${1:-}" = "--update-baseline" ]; then
  echo "$COUNT" > "$BASELINE_FILE"
  echo "✅ Baseline updated to $COUNT hits. Commit scripts/.design-token-baseline."
  exit 0
fi

BASELINE=$(cat "$BASELINE_FILE" 2>/dev/null || echo 0)

if [ "$COUNT" -gt "$BASELINE" ]; then
  echo "❌ Raw Tailwind color utilities: $COUNT found, baseline is $BASELINE — new drift introduced."
  echo "   Use the Ink-on-Parchment tokens instead (bg-action, text-ink, border-rule, etc.)."
  echo ""
  echo "   Run '$0 --all' to see every hit, or 'git diff' to find what you just added."
  echo "   See CLAUDE.md → Design System, rule 1."
  exit 1
fi

if [ "$COUNT" -lt "$BASELINE" ]; then
  echo "✅ $COUNT hits (was $BASELINE) — nice, you paid down some debt."
  echo "   Run '$0 --update-baseline' to lock in the new lower number."
else
  echo "✅ $COUNT hits — unchanged from baseline, no new drift."
fi
