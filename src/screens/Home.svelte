<script lang="ts">
  import {
    ArrowRight,
    Flame,
    BookMarked,
    Target,
    Layers3,
    ChevronRight,
    CalendarClock,
  } from "@lucide/svelte";
  import LogoMark from "../lib/components/LogoMark.svelte";
  import ProgressRing from "../lib/components/ProgressRing.svelte";
  import ArabicWord from "../lib/components/ArabicWord.svelte";
  import { formatLongDate, formatShortDate, greeting } from "../lib/date";
  import type { Deck, HomeStats } from "../lib/types";

  let {
    stats,
    deck,
    decks,
    onStart,
    onSelectDeck,
    onOpenWords,
  }: {
    stats: HomeStats;
    deck: Deck;
    decks: Deck[];
    onStart: () => void;
    onSelectDeck: (id: string) => void;
    onOpenWords: () => void;
  } = $props();

  let dueTotal = $derived(stats.due + stats.newCards);
  let weekMax = $derived(Math.max(1, ...stats.week.map((day) => day.reviews)));
  let weekTotal = $derived(
    stats.week.reduce((sum, day) => sum + day.reviews, 0),
  );

  function weekdayInitial(iso: string): string {
    const [y, m, d] = iso.split("-").map(Number);
    return new Intl.DateTimeFormat("en-GB", { weekday: "narrow" }).format(
      new Date(y, m - 1, d, 12),
    );
  }
</script>

<div class="screen no-scrollbar">
  <header class="topbar">
    <div class="brand">
      <LogoMark size={40} />
      <div class="wordmark">
        <span class="name">Kalima</span>
        <span class="arabic tagline">كلمة</span>
      </div>
    </div>
    <div class="streak" title={`${stats.streak} day streak`}>
      <Flame size={15} strokeWidth={2.2} />
      <span>{stats.streak}</span>
    </div>
  </header>

  <section class="hello">
    <p class="eyebrow">{greeting()}</p>
    <h1>A few words,<br />every day.</h1>
    <p class="date">{formatLongDate()}</p>
  </section>

  <section class="hero" aria-labelledby="today-title">
    <div class="hero-glow" aria-hidden="true"></div>
    <div class="hero-top">
      <span class="overline" id="today-title">Today’s review</span>
      <span class="deck-pill">
        <span class="dot"></span>
        {deck.name}
      </span>
    </div>

    <div class="hero-main">
      <div class="count-block">
        {#if dueTotal > 0}
          <div class="count">{dueTotal}</div>
          <div class="count-caption">
            {dueTotal === 1 ? "card is waiting" : "cards are waiting"}
          </div>
          <div class="split">
            <span>{stats.due} review{stats.due === 1 ? "" : "s"}</span>
            <span class="split-dot"></span>
            <span>{stats.newCards} new</span>
          </div>
        {:else}
          <div class="count caught-up">All caught up</div>
          <div class="count-caption">
            {#if stats.nextDue}
              Next card on {formatShortDate(stats.nextDue)}
            {:else}
              Add a word to begin
            {/if}
          </div>
        {/if}
      </div>

      <ProgressRing progress={stats.goalProgress} size={94} stroke={7}>
        <span class="ring-value">{stats.reviewsToday}</span>
        <span class="ring-label">of {stats.goal}</span>
      </ProgressRing>
    </div>

    <button
      type="button"
      class="start pressable"
      class:muted={dueTotal === 0}
      onclick={onStart}
      disabled={dueTotal === 0}
    >
      <span>{dueTotal > 0 ? "Start review" : "Nothing due"}</span>
      {#if dueTotal > 0}
        <ArrowRight size={19} strokeWidth={2.4} />
      {:else}
        <CalendarClock size={19} strokeWidth={2.1} />
      {/if}
    </button>
  </section>

  <section class="stats" aria-label="Your progress">
    <div class="stat">
      <span class="stat-icon emerald"><BookMarked size={16} strokeWidth={2.1} /></span>
      <div>
        <div class="stat-value">{stats.learned}</div>
        <div class="stat-label">words known</div>
      </div>
    </div>
    <div class="stat">
      <span class="stat-icon gold"><Layers3 size={16} strokeWidth={2.1} /></span>
      <div>
        <div class="stat-value">{stats.reviewsToday}</div>
        <div class="stat-label">reviews today</div>
      </div>
    </div>
    <div class="stat">
      <span class="stat-icon teal"><Target size={16} strokeWidth={2.1} /></span>
      <div>
        <div class="stat-value">
          {stats.accuracy}<span class="unit">%</span>
        </div>
        <div class="stat-label">accuracy</div>
      </div>
    </div>
  </section>

  <section class="week-card" aria-label="Reviews this week">
    <div class="week-head">
      <div>
        <p class="overline">This week</p>
        <p class="week-total">{weekTotal} reviews</p>
      </div>
      <span class="week-goal">{Math.round((weekTotal / Math.max(1, stats.goal * 7)) * 100)}% of goal</span>
    </div>
    <div class="bars">
      {#each stats.week as day}
        <div class="bar-col">
          <div class="bar-track">
            <div
              class="bar"
              class:today={day.isToday}
              class:empty={day.reviews === 0}
              style={`height:${Math.round(6 + (day.reviews / weekMax) * 38)}px`}
            ></div>
          </div>
          <span class="bar-day" class:today={day.isToday}>{weekdayInitial(day.date)}</span>
        </div>
      {/each}
    </div>
  </section>

  <section class="decks-section">
    <div class="section-head">
      <h2>Your decks</h2>
      <button type="button" class="text-link" onclick={onOpenWords}>
        Manage <ChevronRight size={14} strokeWidth={2.4} />
      </button>
    </div>

    <div class="deck-list no-scrollbar">
      {#each decks as item}
        <button
          type="button"
          class="deck-card pressable"
          class:active={item.id === deck.id}
          onclick={() => onSelectDeck(item.id)}
          aria-pressed={item.id === deck.id}
        >
          <div class="deck-top">
            <span class="deck-name">{item.name}</span>
            <span class="deck-count">{item.cards.length}</span>
          </div>
          <ArabicWord word={item.arabicName} size="sm" />
          <div class="deck-progress">
            <span
              style={`width:${item.cards.length === 0 ? 0 : (item.cards.filter((card) => card.reps > 0).length / item.cards.length) * 100}%`}
            ></span>
          </div>
          <span class="deck-meta">
            {item.cards.filter((card) => card.reps > 0).length} learned
          </span>
        </button>
      {/each}
    </div>
  </section>
</div>

<style>
  .screen {
    min-height: 100dvh;
    overflow-y: auto;
    padding: calc(16px + var(--top-safe)) 20px calc(104px + var(--bottom-safe));
    max-width: 560px;
    margin: 0 auto;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .wordmark {
    display: flex;
    flex-direction: column;
    line-height: 1;
    gap: 4px;
  }

  .name {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.025em;
  }

  .tagline {
    font-size: 14px;
    color: var(--muted);
    line-height: 1;
  }

  .streak {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 32px;
    padding: 0 11px 0 9px;
    border: 1px solid color-mix(in srgb, var(--gold) 22%, transparent);
    border-radius: 999px;
    background: var(--gold-soft);
    color: var(--gold);
    font-size: 13px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  .hello {
    padding: 26px 2px 19px;
  }

  .eyebrow {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--emerald);
  }

  h1 {
    margin-top: 8px;
    font-size: clamp(2rem, 9vw, 2.55rem);
    line-height: 1.04;
    letter-spacing: -0.045em;
    font-weight: 700;
  }

  .date {
    margin-top: 10px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--muted);
  }

  .hero {
    position: relative;
    overflow: hidden;
    padding: 18px;
    border: 1px solid var(--line);
    border-radius: var(--radius-xl);
    background: var(--surface);
    box-shadow: var(--shadow-md);
  }

  .hero-glow {
    position: absolute;
    width: 190px;
    height: 190px;
    right: -82px;
    top: -108px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--emerald-soft), transparent 68%);
    pointer-events: none;
  }

  .hero-top {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .overline {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .deck-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 62%;
    padding: 6px 10px;
    border-radius: 999px;
    background: var(--surface-2);
    color: var(--ink-2);
    font-size: 10.5px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dot {
    width: 6px;
    height: 6px;
    flex: none;
    border-radius: 50%;
    background: var(--gold-bright);
  }

  .hero-main {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 17px 2px 18px;
  }

  .count {
    font-size: 3.7rem;
    line-height: 0.95;
    letter-spacing: -0.055em;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .count.caught-up {
    font-size: 1.65rem;
    letter-spacing: -0.03em;
    line-height: 1.2;
  }

  .count-caption {
    margin-top: 7px;
    font-size: 12.5px;
    color: var(--muted);
    font-weight: 600;
  }

  .split {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 8px;
    font-size: 11px;
    font-weight: 700;
    color: var(--ink-2);
  }

  .split-dot {
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: var(--faint);
  }

  .ring-value {
    display: block;
    font-size: 21px;
    font-weight: 800;
    letter-spacing: -0.04em;
    font-variant-numeric: tabular-nums;
  }

  .ring-label {
    display: block;
    margin-top: 2px;
    font-size: 9.5px;
    font-weight: 700;
    color: var(--muted);
  }

  .start {
    position: relative;
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
    box-shadow: 0 14px 24px -16px color-mix(in srgb, var(--emerald) 80%, transparent);
  }

  .start.muted {
    background: var(--surface-2);
    color: var(--muted);
    box-shadow: none;
    border: 1px solid var(--line);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 12px;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
    padding: 12px 10px;
    border: 1px solid var(--line);
    border-radius: 19px;
    background: var(--surface);
  }

  .stat-icon {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    flex: none;
    border-radius: 10px;
  }

  .stat-icon.emerald {
    background: var(--emerald-soft);
    color: var(--emerald);
  }

  .stat-icon.gold {
    background: var(--gold-soft);
    color: var(--gold);
  }

  .stat-icon.teal {
    background: var(--easy-soft);
    color: var(--easy);
  }

  .stat-value {
    font-size: 16px;
    line-height: 1.1;
    font-weight: 800;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  .unit {
    font-size: 10px;
    font-weight: 700;
    color: var(--muted);
  }

  .stat-label {
    margin-top: 2px;
    font-size: 9px;
    font-weight: 700;
    color: var(--muted);
    white-space: nowrap;
  }

  .week-card {
    margin-top: 12px;
    padding: 15px 16px 13px;
    border: 1px solid var(--line);
    border-radius: 22px;
    background: var(--surface);
  }

  .week-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .week-total {
    margin-top: 4px;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .week-goal {
    padding-top: 2px;
    font-size: 9.5px;
    font-weight: 700;
    color: var(--muted);
  }

  .bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8px;
    padding-top: 14px;
  }

  .bar-col {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .bar-track {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    width: 100%;
    height: 44px;
  }

  .bar {
    width: min(18px, 62%);
    min-height: 5px;
    border-radius: 6px;
    background: var(--emerald-soft);
    transition: height 500ms var(--ease-out);
  }

  .bar.today {
    background: linear-gradient(180deg, var(--emerald), var(--emerald-2));
    box-shadow: 0 4px 10px -4px color-mix(in srgb, var(--emerald) 55%, transparent);
  }

  .bar.empty {
    background: var(--surface-3);
  }

  .bar-day {
    font-size: 9px;
    font-weight: 700;
    color: var(--faint);
  }

  .bar-day.today {
    color: var(--emerald);
  }

  .decks-section {
    margin-top: 18px;
  }

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px 10px;
  }

  h2 {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .text-link {
    display: inline-flex;
    align-items: center;
    gap: 1px;
    color: var(--emerald);
    font-size: 11px;
    font-weight: 800;
  }

  .deck-list {
    display: flex;
    gap: 9px;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .deck-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 152px;
    flex: 1;
    gap: 6px;
    padding: 13px;
    border: 1px solid var(--line);
    border-radius: 19px;
    background: var(--surface);
    text-align: left;
    color: var(--ink-2);
    transition:
      border-color 180ms var(--ease-out),
      background-color 180ms var(--ease-out),
      transform 180ms var(--ease-out);
  }

  .deck-card.active {
    border-color: color-mix(in srgb, var(--emerald) 35%, transparent);
    background: linear-gradient(160deg, var(--emerald-soft), var(--surface) 80%);
  }

  .deck-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 6px;
  }

  .deck-name {
    font-size: 11.5px;
    font-weight: 800;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .deck-count {
    display: grid;
    place-items: center;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--surface-2);
    color: var(--muted);
    font-size: 9.5px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  .deck-progress {
    width: 100%;
    height: 4px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--line);
  }

  .deck-progress span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--emerald);
    transition: width 700ms var(--ease-out);
  }

  .deck-meta {
    font-size: 9.5px;
    font-weight: 700;
    color: var(--muted);
  }

  @media (max-width: 380px) {
    .screen {
      padding-inline: 16px;
    }

    .stat {
      flex-direction: column;
      align-items: flex-start;
      gap: 7px;
    }

    .stat-label {
      white-space: normal;
    }
  }
</style>
