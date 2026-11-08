<script lang="ts">
  import { ArrowRight, Clock3, RotateCcw, Target, Sparkles } from "@lucide/svelte";
  import LogoMark from "../lib/components/LogoMark.svelte";
  import ProgressRing from "../lib/components/ProgressRing.svelte";
  import { formatDuration } from "../lib/date";
  import type { Deck, SessionResult } from "../lib/types";

  let {
    result,
    deck,
    nextUp,
    onHome,
    onAgain,
  }: {
    result: SessionResult;
    deck: Deck;
    nextUp: number;
    onHome: () => void;
    onAgain: () => void;
  } = $props();

  let accuracy = $derived(
    result.reviewed === 0
      ? 100
      : Math.round((result.correct / result.reviewed) * 100),
  );
  let duration = $derived(formatDuration(result.finishedAt - result.startedAt));
  let hasAgain = $derived(result.again > 0);
</script>

<div class="screen no-scrollbar">
  <header class="topbar">
    <div class="brand">
      <LogoMark size={34} />
      <span>Kalima</span>
    </div>
    <span class="session-tag">Session complete</span>
  </header>

  <main class="content">
    <section class="hero">
      <div class="halo" aria-hidden="true"></div>
      <div class="seal">
        <ProgressRing progress={1} size={126} stroke={5}>
          <span class="seal-glyph arabic">أحسنت</span>
          <span class="seal-caption">well done</span>
        </ProgressRing>
        <span class="spark spark-a" aria-hidden="true"></span>
        <span class="spark spark-b" aria-hidden="true"></span>
        <span class="spark spark-c" aria-hidden="true"></span>
      </div>

      <p class="eyebrow">{deck.name}</p>
      <h1>A little more<br />fluent.</h1>
      <p class="lede">
        {result.reviewed}
        {result.reviewed === 1 ? " card" : " cards"} reviewed in {duration}.
      </p>
    </section>

    <section class="stats" aria-label="Session statistics">
      <div class="stat">
        <span class="stat-icon emerald"><Target size={17} strokeWidth={2.1} /></span>
        <div class="stat-value">{accuracy}<span class="unit">%</span></div>
        <div class="stat-label">accuracy</div>
      </div>
      <div class="stat">
        <span class="stat-icon gold"><Clock3 size={17} strokeWidth={2.1} /></span>
        <div class="stat-value">{duration}</div>
        <div class="stat-label">time spent</div>
      </div>
      <div class="stat">
        <span class="stat-icon clay"><RotateCcw size={16} strokeWidth={2.2} /></span>
        <div class="stat-value">{result.again}</div>
        <div class="stat-label">to revisit</div>
      </div>
    </section>

    {#if hasAgain}
      <p class="again-note">
        <Sparkles class="note-icon" size={14} strokeWidth={2.1} />
        <span>
          {result.again === 1 ? "One card" : `${result.again} cards`} will return
          in your next session.
        </span>
      </p>
    {/if}

    <section class="proverb" aria-label="Arabic proverb">
      <p class="arabic proverb-ar">قَلِيلٌ دَائِمٌ خَيْرٌ مِنْ كَثِيرٍ مُنْقَطِع</p>
      <p class="proverb-en">
        A little that lasts is better than much that stops.
      </p>
    </section>
  </main>

  <footer class="actions">
    <button type="button" class="primary pressable" onclick={nextUp > 0 ? onAgain : onHome}>
      <span>{nextUp > 0 ? `Keep going · ${nextUp} waiting` : "Back to home"}</span>
      <ArrowRight size={19} strokeWidth={2.4} />
    </button>
    <button type="button" class="secondary pressable" onclick={onHome}>
      {nextUp > 0 ? "Finish for now" : "Review this deck again"}
    </button>
  </footer>
</div>

<style>
  .screen {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding: calc(16px + var(--top-safe)) 22px calc(20px + var(--bottom-safe));
    max-width: 560px;
    margin: 0 auto;
    overflow-y: auto;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .session-tag {
    padding: 6px 10px;
    border-radius: 999px;
    background: var(--emerald-soft);
    color: var(--emerald);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 18px 0 14px;
  }

  .hero {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 12px 0 22px;
  }

  .halo {
    position: absolute;
    top: -60px;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--gold-soft), transparent 66%);
    opacity: 0.9;
    pointer-events: none;
  }

  .seal {
    position: relative;
    margin-bottom: 23px;
  }

  .seal-glyph {
    display: block;
    font-size: 30px;
    line-height: 1.25;
    color: var(--emerald);
  }

  .seal-caption {
    display: block;
    margin-top: 3px;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.19em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .spark {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--gold-bright);
    box-shadow: 0 0 0 3px var(--gold-soft);
  }

  .spark-a {
    top: 3px;
    right: -14px;
  }

  .spark-b {
    bottom: 21px;
    left: -21px;
    width: 4px;
    height: 4px;
  }

  .spark-c {
    top: 48%;
    right: -27px;
    width: 3px;
    height: 3px;
    opacity: 0.65;
  }

  .eyebrow {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--gold);
  }

  h1 {
    margin-top: 7px;
    font-size: clamp(2.15rem, 10vw, 2.9rem);
    line-height: 1.02;
    font-weight: 700;
    letter-spacing: -0.05em;
  }

  .lede {
    margin-top: 11px;
    max-width: 310px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--muted);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 13px 7px 12px;
    border: 1px solid var(--line);
    border-radius: 20px;
    background: var(--surface);
    text-align: center;
  }

  .stat-icon {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    margin-bottom: 8px;
    border-radius: 11px;
  }

  .stat-icon.emerald {
    background: var(--emerald-soft);
    color: var(--emerald);
  }

  .stat-icon.gold {
    background: var(--gold-soft);
    color: var(--gold);
  }

  .stat-icon.clay {
    background: var(--again-soft);
    color: var(--again);
  }

  .stat-value {
    font-size: 18px;
    line-height: 1.15;
    font-weight: 800;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
  }

  .unit {
    margin-left: 1px;
    font-size: 10px;
    font-weight: 700;
    color: var(--muted);
  }

  .stat-label {
    margin-top: 3px;
    font-size: 9px;
    font-weight: 700;
    color: var(--muted);
  }

  .again-note {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 6px;
    max-width: 330px;
    margin: 12px auto 0;
    color: var(--muted);
    font-size: 10.5px;
    font-weight: 600;
    line-height: 1.45;
    text-align: left;
  }

  .again-note :global(.note-icon) {
    margin-top: 1px;
    color: var(--gold);
  }

  .proverb {
    margin-top: 16px;
    padding: 16px 18px 15px;
    border: 1px solid var(--line);
    border-radius: 22px;
    background: linear-gradient(165deg, var(--surface), var(--surface-2));
    text-align: center;
  }

  .proverb-ar {
    font-size: 19px;
    line-height: 1.65;
    color: var(--ink-2);
  }

  .proverb-en {
    margin-top: 6px;
    font-size: 9.5px;
    font-weight: 600;
    font-style: italic;
    color: var(--muted);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 4px;
  }

  .primary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    width: 100%;
    height: 54px;
    border-radius: 18px;
    background: var(--emerald);
    color: var(--on-emerald);
    font-size: 14px;
    font-weight: 800;
    letter-spacing: -0.01em;
    box-shadow: 0 16px 26px -18px color-mix(in srgb, var(--emerald) 80%, transparent);
  }

  .secondary {
    height: 42px;
    color: var(--muted);
    font-size: 11.5px;
    font-weight: 700;
  }
</style>
