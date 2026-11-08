<script lang="ts">
  import { Minus, Plus } from "@lucide/svelte";

  let {
    value,
    min = 1,
    max = 999,
    step = 1,
    onChange,
    label,
  }: {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
    label: string;
  } = $props();

  function update(delta: number) {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) onChange(next);
  }
</script>

<div class="stepper">
  <button
    type="button"
    onclick={() => update(-step)}
    disabled={value <= min}
    aria-label={`Decrease ${label}`}
  >
    <Minus size={14} strokeWidth={2.4} />
  </button>
  <span class="value" aria-live="polite">{value}</span>
  <button
    type="button"
    onclick={() => update(step)}
    disabled={value >= max}
    aria-label={`Increase ${label}`}
  >
    <Plus size={14} strokeWidth={2.4} />
  </button>
</div>

<style>
  .stepper {
    display: inline-flex;
    align-items: center;
    height: 36px;
    padding: 3px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--surface-2);
  }

  button {
    display: grid;
    place-items: center;
    width: 29px;
    height: 28px;
    border-radius: 50%;
    color: var(--emerald);
    transition: background-color 160ms var(--ease-out), opacity 160ms;
  }

  button:hover {
    background: var(--emerald-soft);
  }

  button:disabled {
    opacity: 0.3;
  }

  .value {
    min-width: 30px;
    padding: 0 2px;
    text-align: center;
    font-size: 13.5px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
</style>
