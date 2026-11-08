<script lang="ts">
  import {
    Sun,
    Moon,
    Smartphone,
    RotateCcw,
    Download,
    DatabaseBackup,
    ChevronRight,
    Languages,
    CalendarDays,
    Layers3,
    Target,
    Sparkles,
    BookOpen,
  } from "@lucide/svelte";
  import LogoMark from "../lib/components/LogoMark.svelte";
  import Stepper from "../lib/components/Stepper.svelte";
  import Switch from "../lib/components/Switch.svelte";
  import Sheet from "../lib/components/Sheet.svelte";
  import type { Settings, ThemePreference } from "../lib/types";

  let {
    settings,
    deckName,
    onUpdate,
    onExportDeck,
    onResetProgress,
    onRestoreStarter,
  }: {
    settings: Settings;
    deckName: string;
    onUpdate: (patch: Partial<Settings>) => void;
    onExportDeck: () => void;
    onResetProgress: () => void;
    onRestoreStarter: () => void;
  } = $props();

  let confirmAction = $state<null | "reset" | "restore">(null);

  const themes: {
    id: ThemePreference;
    label: string;
    icon: typeof Sun;
  }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Smartphone },
  ];

  let confirmTitle = $derived(
    confirmAction === "restore" ? "Restore starter content?" : "Reset review progress?",
  );
  let confirmCopy = $derived(
    confirmAction === "restore"
      ? "This replaces all decks, words, and review history with the two original starter decks. This cannot be undone."
      : `This clears the review history for “${deckName}” and makes every word new again. Your words stay in the deck.`,
  );

  function runConfirmed() {
    if (confirmAction === "reset") onResetProgress();
    if (confirmAction === "restore") onRestoreStarter();
    confirmAction = null;
  }
</script>

<div class="screen no-scrollbar">
  <header class="topbar">
    <div>
      <p class="eyebrow">Preferences</p>
      <h1>Settings</h1>
    </div>
    <div class="avatar" aria-hidden="true">
      <span class="arabic">ك</span>
    </div>
  </header>

  <section class="group" aria-labelledby="appearance-title">
    <h2 class="group-title" id="appearance-title">Appearance</h2>
    <div class="card">
      <div class="theme-head">
        <div>
          <p class="row-title">Theme</p>
          <p class="row-copy">Warm parchment by day, deep green by night.</p>
        </div>
      </div>
      <div class="theme-picker" role="radiogroup" aria-label="Theme">
        {#each themes as theme}
          {@const Icon = theme.icon}
          <button
            type="button"
            class="theme-option pressable"
            class:active={settings.theme === theme.id}
            role="radio"
            aria-checked={settings.theme === theme.id}
            onclick={() => onUpdate({ theme: theme.id })}
          >
            <span class="theme-preview {theme.id}" aria-hidden="true">
              <span class="preview-sky"></span>
              <span class="preview-card">
                <span class="preview-line"></span>
                <span class="preview-line short"></span>
              </span>
            </span>
            <span class="theme-label">
              <Icon size={14} strokeWidth={2.1} />
              {theme.label}
            </span>
          </button>
        {/each}
      </div>
    </div>
  </section>

  <section class="group" aria-labelledby="study-title">
    <h2 class="group-title" id="study-title">Study</h2>
    <div class="card rows">
      <div class="setting-row">
        <span class="row-icon emerald"><Sparkles size={16} strokeWidth={2.1} /></span>
        <div class="row-text">
          <p class="row-title">New words per day</p>
          <p class="row-copy">Fresh vocabulary introduced daily.</p>
        </div>
        <Stepper
          value={settings.newPerDay}
          min={0}
          max={50}
          label="new words per day"
          onChange={(value) => onUpdate({ newPerDay: value })}
        />
      </div>

      <div class="setting-row">
        <span class="row-icon gold"><Layers3 size={16} strokeWidth={2.1} /></span>
        <div class="row-text">
          <p class="row-title">Cards per session</p>
          <p class="row-copy">Keep sessions short and focused.</p>
        </div>
        <Stepper
          value={settings.sessionSize}
          min={4}
          max={50}
          label="cards per session"
          onChange={(value) => onUpdate({ sessionSize: value })}
        />
      </div>

      <div class="setting-row">
        <span class="row-icon teal"><Target size={16} strokeWidth={2.1} /></span>
        <div class="row-text">
          <p class="row-title">Daily goal</p>
          <p class="row-copy">Reviews needed to close your ring.</p>
        </div>
        <Stepper
          value={settings.dailyGoal}
          min={5}
          max={200}
          step={5}
          label="daily goal"
          onChange={(value) => onUpdate({ dailyGoal: value })}
        />
      </div>
    </div>
  </section>

  <section class="group" aria-labelledby="reading-title">
    <h2 class="group-title" id="reading-title">Reading</h2>
    <div class="card rows">
      <div class="setting-row">
        <span class="row-icon clay"><Languages size={16} strokeWidth={2.1} /></span>
        <div class="row-text">
          <p class="row-title">Show transliteration</p>
          <p class="row-copy">Latin-script pronunciation under Arabic.</p>
        </div>
        <Switch
          checked={settings.showTransliteration}
          label="Show transliteration"
          onChange={(value) => onUpdate({ showTransliteration: value })}
        />
      </div>
    </div>
  </section>

  <section class="group" aria-labelledby="data-title">
    <h2 class="group-title" id="data-title">Your data</h2>
    <div class="card rows">
      <button type="button" class="action-row pressable" onclick={onExportDeck}>
        <span class="row-icon emerald"><Download size={16} strokeWidth={2.1} /></span>
        <div class="row-text">
          <p class="row-title">Export current deck</p>
          <p class="row-copy">Save “{deckName}” as a CSV file.</p>
        </div>
        <ChevronRight size={16} strokeWidth={2.1} class="chev" />
      </button>

      <button
        type="button"
        class="action-row pressable"
        onclick={() => (confirmAction = "reset")}
      >
        <span class="row-icon gold"><RotateCcw size={16} strokeWidth={2.1} /></span>
        <div class="row-text">
          <p class="row-title">Reset review progress</p>
          <p class="row-copy">Start this deck fresh, keeping every word.</p>
        </div>
        <ChevronRight size={16} strokeWidth={2.1} class="chev" />
      </button>

      <button
        type="button"
        class="action-row danger pressable"
        onclick={() => (confirmAction = "restore")}
      >
        <span class="row-icon danger"><DatabaseBackup size={16} strokeWidth={2.1} /></span>
        <div class="row-text">
          <p class="row-title">Restore starter content</p>
          <p class="row-copy">Replace everything with the original decks.</p>
        </div>
        <ChevronRight size={16} strokeWidth={2.1} class="chev" />
      </button>
    </div>
  </section>

  <section class="about" aria-label="About Kalima">
    <div class="about-head">
      <LogoMark size={36} />
      <div>
        <p class="about-name">Kalima <span class="arabic">كلمة</span></p>
        <p class="about-meta">Version 0.1.0 · Made for daily study</p>
      </div>
    </div>
    <div class="about-rule"></div>
    <p class="about-quote arabic">اللُّغَةُ بَيْتٌ يَسْكُنُهُ الفِكْر</p>
    <p class="about-translation">Language is a house in which thought lives.</p>
    <div class="about-badges">
      <span><BookOpen size={12} strokeWidth={2.1} /> Offline first</span>
      <span><CalendarDays size={12} strokeWidth={2.1} /> SM-2 lite</span>
    </div>
  </section>
</div>

<Sheet
  open={confirmAction !== null}
  title={confirmTitle}
  onClose={() => (confirmAction = null)}
>
  <div class="confirm">
    <span class="confirm-icon" class:danger={confirmAction === "restore"}>
      {#if confirmAction === "restore"}
        <DatabaseBackup size={24} strokeWidth={1.9} />
      {:else}
        <RotateCcw size={24} strokeWidth={1.9} />
      {/if}
    </span>
    <p class="confirm-copy">{confirmCopy}</p>
  </div>

  {#snippet footer()}
    <div class="confirm-actions">
      <button
        type="button"
        class="ghost-btn pressable"
        onclick={() => (confirmAction = null)}
      >
        Keep as is
      </button>
      <button
        type="button"
        class="confirm-btn pressable"
        class:danger={confirmAction === "restore"}
        onclick={runConfirmed}
      >
        {confirmAction === "restore" ? "Restore starter decks" : "Reset deck"}
      </button>
    </div>
  {/snippet}
</Sheet>

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
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .eyebrow {
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--emerald);
  }

  h1 {
    margin-top: 6px;
    font-size: clamp(1.9rem, 8.5vw, 2.35rem);
    line-height: 1.05;
    font-weight: 700;
    letter-spacing: -0.045em;
  }

  .avatar {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: linear-gradient(150deg, var(--emerald-soft), var(--surface));
    color: var(--emerald);
    font-size: 23px;
    box-shadow: var(--shadow-sm);
  }

  .group {
    margin-top: 23px;
  }

  .group-title {
    padding: 0 3px 8px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .card {
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 21px;
    background: var(--surface);
    box-shadow: var(--shadow-sm);
  }

  .rows {
    display: flex;
    flex-direction: column;
  }

  .theme-head {
    padding: 14px 15px 0;
  }

  .row-title {
    font-size: 12.5px;
    font-weight: 800;
    letter-spacing: -0.012em;
  }

  .row-copy {
    margin-top: 2px;
    font-size: 9.5px;
    line-height: 1.4;
    font-weight: 600;
    color: var(--muted);
  }

  .theme-picker {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 7px;
    padding: 12px 13px 13px;
  }

  .theme-option {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 5px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: var(--surface-2);
    color: var(--muted);
  }

  .theme-option.active {
    border-color: color-mix(in srgb, var(--emerald) 45%, transparent);
    background: var(--emerald-soft);
    color: var(--emerald);
  }

  .theme-preview {
    position: relative;
    display: block;
    width: 100%;
    height: 48px;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 9px;
  }

  .theme-preview.light {
    background: #f5efe3;
  }

  .theme-preview.dark {
    background: #0d1512;
  }

  .theme-preview.system {
    background: linear-gradient(105deg, #f5efe3 50%, #0d1512 50%);
  }

  .preview-sky {
    position: absolute;
    top: -13px;
    right: -11px;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba(185, 143, 53, 0.22);
  }

  .dark .preview-sky {
    background: rgba(216, 181, 98, 0.18);
  }

  .preview-card {
    position: absolute;
    left: 6px;
    right: 6px;
    bottom: 5px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 6px;
    border-radius: 5px;
    background: rgba(255, 253, 248, 0.86);
  }

  .dark .preview-card {
    background: rgba(18, 27, 23, 0.9);
  }

  .system .preview-card {
    background: rgba(255, 253, 248, 0.55);
  }

  .preview-line {
    width: 58%;
    height: 3px;
    border-radius: 999px;
    background: rgba(14, 90, 67, 0.55);
  }

  .dark .preview-line,
  .system .preview-line {
    background: rgba(79, 174, 134, 0.7);
  }

  .preview-line.short {
    width: 34%;
    background: rgba(185, 143, 53, 0.55);
  }

  .theme-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding-bottom: 1px;
    font-size: 9.5px;
    font-weight: 800;
  }

  .setting-row,
  .action-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 13px 14px;
    text-align: left;
  }

  .setting-row + .setting-row,
  .action-row + .action-row {
    border-top: 1px solid var(--line);
  }

  .action-row {
    min-height: 66px;
  }

  .action-row.danger .row-title {
    color: var(--again);
  }

  .row-icon {
    display: grid;
    place-items: center;
    width: 33px;
    height: 33px;
    flex: none;
    border-radius: 10px;
  }

  .row-icon.emerald {
    background: var(--emerald-soft);
    color: var(--emerald);
  }

  .row-icon.gold {
    background: var(--gold-soft);
    color: var(--gold);
  }

  .row-icon.teal {
    background: var(--easy-soft);
    color: var(--easy);
  }

  .row-icon.clay {
    background: var(--again-soft);
    color: var(--again);
  }

  .row-icon.danger {
    background: var(--again-soft);
    color: var(--again);
  }

  .row-text {
    flex: 1;
    min-width: 0;
  }

  .chev {
    color: var(--faint);
  }

  .about {
    margin-top: 23px;
    padding: 17px;
    border: 1px solid var(--line);
    border-radius: 22px;
    background:
      radial-gradient(120% 90% at 50% 120%, var(--emerald-soft), transparent 65%),
      var(--surface);
  }

  .about-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .about-name {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .about-name .arabic {
    font-size: 15px;
    font-weight: 400;
    color: var(--muted);
  }

  .about-meta {
    margin-top: 2px;
    font-size: 9px;
    font-weight: 600;
    color: var(--muted);
  }

  .about-rule {
    height: 1px;
    margin: 15px 0 13px;
    background: var(--line);
  }

  .about-quote {
    font-size: 19px;
    line-height: 1.65;
    text-align: center;
    color: var(--ink-2);
  }

  .about-translation {
    margin-top: 3px;
    text-align: center;
    font-size: 9.5px;
    font-style: italic;
    font-weight: 600;
    color: var(--muted);
  }

  .about-badges {
    display: flex;
    justify-content: center;
    gap: 7px;
    margin-top: 14px;
  }

  .about-badges span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 8px;
    border-radius: 999px;
    background: var(--surface-2);
    color: var(--muted);
    font-size: 8.5px;
    font-weight: 700;
  }

  /* Confirm sheet */
  .confirm {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 8px 12px;
    text-align: center;
  }

  .confirm-icon {
    display: grid;
    place-items: center;
    width: 58px;
    height: 58px;
    margin-bottom: 14px;
    border-radius: 18px;
    background: var(--gold-soft);
    color: var(--gold);
  }

  .confirm-icon.danger {
    background: var(--again-soft);
    color: var(--again);
  }

  .confirm-copy {
    max-width: 320px;
    font-size: 11.5px;
    line-height: 1.55;
    font-weight: 600;
    color: var(--muted);
  }

  .confirm-actions {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 8px;
  }

  .ghost-btn {
    height: 46px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: var(--surface-2);
    color: var(--muted);
    font-size: 11.5px;
    font-weight: 800;
  }

  .confirm-btn {
    min-height: 46px;
    padding: 0 10px;
    border-radius: 14px;
    background: var(--emerald);
    color: var(--on-emerald);
    font-size: 11.5px;
    font-weight: 800;
  }

  .confirm-btn.danger {
    background: var(--again);
    color: #fff8f4;
  }
</style>
