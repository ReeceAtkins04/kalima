<script lang="ts">
  import { RotateCcw, Minus, Check, Sparkles } from "@lucide/svelte";
  import type { Grade } from "../types";

  let {
    intervals,
    onGrade,
    disabled = false,
  }: {
    intervals: Record<Grade, string>;
    onGrade: (grade: Grade) => void;
    disabled?: boolean;
  } = $props();
</script>

<div class="grades" aria-label="Grade this card">
  <button
    type="button"
    class="grade again"
    onclick={() => onGrade("again")}
    {disabled}
    aria-label={`Again, next review ${intervals.again}`}
  >
    <span class="top"><RotateCcw size={15} strokeWidth={2.2} />Again</span>
    <span class="interval">{intervals.again}</span>
  </button>

  <button
    type="button"
    class="grade hard"
    onclick={() => onGrade("hard")}
    {disabled}
    aria-label={`Hard, next review ${intervals.hard}`}
  >
    <span class="top"><Minus size={15} strokeWidth={2.4} />Hard</span>
    <span class="interval">{intervals.hard}</span>
  </button>

  <button
    type="button"
    class="grade good"
    onclick={() => onGrade("good")}
    {disabled}
    aria-label={`Good, next review ${intervals.good}`}
  >
    <span class="top"><Check size={15} strokeWidth={2.6} />Good</span>
    <span class="interval">{intervals.good}</span>
  </button>

  <button
    type="button"
    class="grade easy"
    onclick={() => onGrade("easy")}
    {disabled}
    aria-label={`Easy, next review ${intervals.easy}`}
  >
    <span class="top"><Sparkles size={15} strokeWidth={2.1} />Easy</span>
    <span class="interval">{intervals.easy}</span>
  </button>
</div>

<style>
  .grades {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    width: 100%;
  }

  .grade {
    --tone: var(--muted);
    --tone-soft: var(--surface-2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 62px;
    padding: 9px 4px;
    border: 1px solid transparent;
    border-radius: 17px;
    background: var(--tone-soft);
    color: var(--tone);
    transition:
      transform 160ms var(--ease-out),
      filter 160ms var(--ease-out),
      opacity 160ms var(--ease-out);
  }

  .grade:active:not(:disabled) {
    transform: scale(0.955);
  }

  .grade:disabled {
    opacity: 0.6;
  }

  .top {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.005em;
  }

  .interval {
    font-size: 10px;
    font-weight: 700;
    opacity: 0.62;
    font-variant-numeric: tabular-nums;
  }

  .again {
    --tone: var(--again);
    --tone-soft: var(--again-soft);
    border-color: color-mix(in srgb, var(--again) 16%, transparent);
  }

  .hard {
    --tone: var(--hard);
    --tone-soft: var(--hard-soft);
    border-color: color-mix(in srgb, var(--hard) 16%, transparent);
  }

  .good {
    --tone: var(--good);
    --tone-soft: var(--good-soft);
    border-color: color-mix(in srgb, var(--good) 16%, transparent);
  }

  .easy {
    --tone: var(--easy);
    --tone-soft: var(--easy-soft);
    border-color: color-mix(in srgb, var(--easy) 16%, transparent);
  }
</style>
