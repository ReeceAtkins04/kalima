<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    progress = 0,
    size = 116,
    stroke = 8,
    children,
  }: {
    progress?: number;
    size?: number;
    stroke?: number;
    children?: Snippet;
  } = $props();

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = $derived(
    circumference * (1 - Math.min(1, Math.max(0, progress))),
  );
</script>

<div class="ring" style={`--size:${size}px`}>
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <circle
      class="track"
      cx="60"
      cy="60"
      r={radius}
      fill="none"
      stroke-width={stroke}
    />
    <circle
      class="value"
      cx="60"
      cy="60"
      r={radius}
      fill="none"
      stroke-width={stroke}
      stroke-dasharray={circumference}
      stroke-dashoffset={offset}
      transform="rotate(-90 60 60)"
    />
  </svg>
  {#if children}
    <div class="center">{@render children()}</div>
  {/if}
</div>

<style>
  .ring {
    position: relative;
    width: var(--size);
    height: var(--size);
    flex: none;
  }

  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .track {
    stroke: var(--line);
  }

  .value {
    stroke: var(--emerald);
    stroke-linecap: round;
    transition: stroke-dashoffset 700ms var(--ease-out);
    filter: drop-shadow(0 2px 5px rgba(14, 90, 67, 0.18));
  }

  .center {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    text-align: center;
    line-height: 1.05;
  }
</style>
