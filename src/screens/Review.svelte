<script lang="ts">
  import { ChevronLeft, Eye, Sparkles } from "@lucide/svelte";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import ArabicWord from "../lib/components/ArabicWord.svelte";
  import GradeBar from "../lib/components/GradeBar.svelte";
  import type { Card, Deck, Grade } from "../lib/types";

  let {
    deck,
    card,
    revealed,
    remaining,
    initialCount,
    progress,
    showTransliteration,
    intervals,
    onReveal,
    onGrade,
    onClose,
  }: {
    deck: Deck;
    card: Card;
    revealed: boolean;
    remaining: number;
    initialCount: number;
    progress: number;
    showTransliteration: boolean;
    intervals: Record<Grade, string>;
    onReveal: () => void;
    onGrade: (grade: Grade) => void;
    onClose: () => void;
  } = $props();

  let isNew = $derived(card.reps === 0);
  let finished = $derived(initialCount - remaining);

  function reveal() {
    if (revealed) return;
    if (navigator.vibrate) navigator.vibrate(8);
    onReveal();
  }

  function grade(value: Grade) {
    if (navigator.vibrate) navigator.vibrate(6);
    onGrade(value);
  }

  function handleKey(event: KeyboardEvent) {
    if (event.repeat) return;
    if (!revealed && (event.key === " " || event.key === "Enter")) {
      event.preventDefault();
      reveal();
      return;
    }
    if (revealed && ["1", "2", "3", "4"].includes(event.key)) {
      event.preventDefault();
      grade(
        (["again", "hard", "good", "easy"] as const)[Number(event.key) - 1],
      );
    }
  }
</script>

<svelte:window onkeydown={handleKey} />

<div class="screen">
  <header class="review-top">
    <button
      type="button"
      class="icon-btn pressable"
      onclick={onClose}
      aria-label="Leave review"
    >
      <ChevronLeft size={21} strokeWidth={2.4} />
    </button>

    <div class="title-block">
      <span class="deck-name">{deck.name}</span>
      <span class="count">{remaining} left</span>
    </div>

    <div class="session-badge" aria-label={`${finished} reviewed this session`}>
      <Sparkles size={13} strokeWidth={2.2} />
      <span>{finished}</span>
    </div>
  </header>

  <div class="progress-track" aria-hidden="true">
    <div class="progress-fill" style={`width:${Math.max(2, progress * 100)}%`}></div>
  </div>

  <main class="stage">
    {#key card.id}
      <div class="card-wrap" in:fly={{ y: 18, duration: 300, easing: cubicOut }}>
        <button
          type="button"
          class="card"
          class:revealed
          class:clickable={!revealed}
          aria-label={revealed ? "Meaning revealed" : "Reveal the meaning"}
          onclick={reveal}
          disabled={revealed}
        >
          <div class="card-top">
            <span class="badge" class:new={isNew}>
              {isNew ? "New word" : "Review"}
            </span>
            <span class="card-deck arabic">{deck.arabicName}</span>
          </div>

          <div class="word-zone">
            <ArabicWord word={card.arabic} size="hero" />
            {#if showTransliteration && card.transliteration}
              <div class="transliteration">{card.transliteration}</div>
            {/if}
          </div>

          {#if revealed}
            <div
              class="answer"
              in:fly={{ y: 10, duration: 260, easing: cubicOut }}
            >
              <div class="rule">
                <span></span>
                <i></i>
                <span></span>
              </div>
              <p class="meaning-label">Meaning</p>
              <p class="meaning">{card.english}</p>
              {#if card.notes}
                <p class="notes">{card.notes}</p>
              {/if}
            </div>
          {:else}
            <div class="hint">
              <span class="hint-icon"><Eye size={15} strokeWidth={2.1} /></span>
              <span>Tap the card to reveal</span>
            </div>
          {/if}
        </button>
      </div>
    {/key}
  </main>

  <footer class="actions">
    {#if revealed}
      <p class="grade-label">How well did you know it?</p>
      <GradeBar {intervals} onGrade={grade} />
    {:else}
      <button type="button" class="reveal-btn pressable" onclick={reveal}>
        <Eye size={18} strokeWidth={2.2} />
        <span>Show answer</span>
      </button>
      <p class="key-hint">Tap anywhere on the card</p>
    {/if}
  </footer>
</div>

<style>
  .screen {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding: calc(10px + var(--top-safe)) 18px calc(16px + var(--bottom-safe));
    max-width: 560px;
    margin: 0 auto;
  }

  .review-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 2px 0 13px;
  }

  .icon-btn {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    flex: none;
    border: 1px solid var(--line);
    border-radius: 50%;
    background: var(--surface);
    color: var(--ink-2);
    box-shadow: var(--shadow-sm);
  }

  .title-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 0;
  }

  .deck-name {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 48vw;
  }

  .count {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  .session-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 32px;
    padding: 0 10px;
    border-radius: 999px;
    background: var(--gold-soft);
    color: var(--gold);
    font-size: 11px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  .progress-track {
    height: 4px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--line);
  }

  .progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--emerald-2), var(--emerald));
    transition: width 500ms var(--ease-out);
  }

  .stage {
    flex: 1;
    display: flex;
    align-items: stretch;
    padding: 16px 0;
  }

  .card-wrap {
    display: flex;
    width: 100%;
  }

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: min(56dvh, 470px);
    padding: 18px;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: var(--radius-xl);
    background:
      radial-gradient(
        120% 80% at 50% 115%,
        color-mix(in srgb, var(--emerald-soft) 60%, transparent),
        transparent 62%
      ),
      var(--surface);
    box-shadow: var(--shadow-md);
    outline: none;
    color: inherit;
    text-align: left;
  }

  .card:disabled {
    opacity: 1;
  }

  .card.clickable {
    cursor: pointer;
  }

  .card.clickable:active {
    transform: scale(0.995);
  }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .badge {
    padding: 5px 9px;
    border-radius: 999px;
    background: var(--surface-2);
    color: var(--muted);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .badge.new {
    background: var(--gold-soft);
    color: var(--gold);
  }

  .card-deck {
    font-size: 13px;
    color: var(--faint);
    line-height: 1;
  }

  .word-zone {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px 6px;
    text-align: center;
  }

  .transliteration {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.035em;
    color: var(--muted);
    font-style: italic;
  }

  .hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 12px 0 2px;
    color: var(--faint);
    font-size: 11px;
    font-weight: 700;
  }

  .hint-icon {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--surface-2);
  }

  .answer {
    padding-top: 2px;
    text-align: center;
  }

  .rule {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    padding: 2px 32px 13px;
  }

  .rule span {
    height: 1px;
    flex: 1;
    background: var(--line);
  }

  .rule i {
    width: 5px;
    height: 5px;
    flex: none;
    border-radius: 50%;
    background: var(--gold-bright);
  }

  .meaning-label {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--faint);
  }

  .meaning {
    margin-top: 5px;
    font-size: 20px;
    line-height: 1.3;
    font-weight: 800;
    letter-spacing: -0.025em;
    color: var(--ink);
  }

  .notes {
    margin: 10px auto 0;
    max-width: 300px;
    font-size: 11.5px;
    line-height: 1.5;
    font-weight: 600;
    color: var(--muted);
  }

  .actions {
    padding-top: 2px;
  }

  .grade-label {
    padding: 0 0 9px 2px;
    font-size: 10.5px;
    font-weight: 700;
    color: var(--muted);
    text-align: center;
  }

  .reveal-btn {
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
    box-shadow: 0 16px 26px -18px color-mix(in srgb, var(--emerald) 80%, transparent);
  }

  .key-hint {
    padding-top: 9px;
    text-align: center;
    font-size: 9.5px;
    font-weight: 700;
    color: var(--faint);
  }
</style>
