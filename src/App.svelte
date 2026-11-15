<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import Home from "./screens/Home.svelte";
  import Review from "./screens/Review.svelte";
  import Summary from "./screens/Summary.svelte";
  import Words from "./screens/Words.svelte";
  import Settings from "./screens/Settings.svelte";
  import TabBar from "./lib/components/TabBar.svelte";
  import Toast from "./lib/components/Toast.svelte";
  import {
    buildSession,
    computeHomeStats,
    getActiveDeck,
    gradeCard,
    loadLibrary,
    previewIntervals,
    resetProgress,
    saveLibrary,
  } from "./lib/api";
  import { createSeedLibrary } from "./lib/seed";
  import {
    applyNativeInsets,
    initNativeStorage,
    isTauri,
    setNativeTheme,
  } from "./lib/native";
  import { registerBackHandler } from "./lib/back";
  import { exportDeckFile } from "./lib/export";
  import type {
    Grade,
    Library,
    Screen,
    SessionResult,
    SessionState,
    Settings as SettingsModel,
    Tab,
  } from "./lib/types";

  let library = $state<Library>(loadLibrary());
  let screen = $state<Screen>("home");
  let session = $state<SessionState | null>(null);
  let result = $state<SessionResult | null>(null);
  let overrideTheme = $state<"light" | "dark" | null>(null);
  let systemDark = $state(false);
  let toast = $state<{
    id: number;
    message: string;
    tone: "default" | "error";
  } | null>(null);
  let toastTimer: number | undefined;

  let deck = $derived(getActiveDeck(library));
  let stats = $derived(computeHomeStats(library));
  let tab = $derived<Tab>(
    screen === "words" ? "words" : screen === "settings" ? "settings" : "home",
  );
  let showTabs = $derived(
    screen === "home" || screen === "words" || screen === "settings",
  );
  let currentCard = $derived(
    session ? (session.cards[session.index] ?? null) : null,
  );
  let remaining = $derived(
    session ? session.initialCount - session.reviewed : 0,
  );
  let progress = $derived(
    session && session.initialCount > 0
      ? session.reviewed / session.initialCount
      : 0,
  );
  let intervals = $derived(
    currentCard
      ? previewIntervals(currentCard)
      : { again: "later", hard: "1d", good: "1d", easy: "3d" },
  );
  let resolvedTheme = $derived<"light" | "dark">(
    overrideTheme ??
      (library.settings.theme === "system"
        ? systemDark
          ? "dark"
          : "light"
        : library.settings.theme),
  );

  $effect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", resolvedTheme === "dark" ? "#0b1210" : "#f5efe3");
    setNativeTheme(resolvedTheme === "dark");
  });

  onMount(() => {
    let disposed = false;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    systemDark = media.matches;
    const onChange = (event: MediaQueryListEvent) => {
      systemDark = event.matches;
    };
    media.addEventListener("change", onChange);

    // Android draws the WebView under the status and navigation bars.
    applyNativeInsets();
    const onResize = () => applyNativeInsets();
    window.addEventListener("resize", onResize);

    const params = new URLSearchParams(window.location.search);

    const unregisterBack = registerBackHandler(() => {
      if (screen === "review") {
        leaveReview();
        return true;
      }
      if (screen === "summary") {
        goHomeFromSummary();
        return true;
      }
      if (screen === "words" || screen === "settings") {
        screen = "home";
        return true;
      }
      return false;
    });

    async function boot() {
      if (isTauri) {
        const raw = await initNativeStorage();
        if (disposed) return;

        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Library;
            if (
              parsed?.version === 1 &&
              Array.isArray(parsed.decks) &&
              parsed.settings
            ) {
              library = parsed;
            }
          } catch (error) {
            console.warn("Ignoring unreadable native library.", error);
          }
        }

        // Creates the native library on first launch and mirrors valid state.
        saveLibrary(library);
      }

      if (disposed) return;
      applyNativeInsets();
      applyDemoRoute(params);
    }

    void boot();

    return () => {
      disposed = true;
      unregisterBack();
      window.removeEventListener("resize", onResize);
      media.removeEventListener("change", onChange);
    };
  });

  onDestroy(() => {
    if (toastTimer) window.clearTimeout(toastTimer);
  });

  function notify(message: string, tone: "default" | "error" = "default") {
    if (toastTimer) window.clearTimeout(toastTimer);
    toast = { id: Date.now(), message, tone };
    toastTimer = window.setTimeout(() => {
      toast = null;
    }, 2700);
  }

  function startReview() {
    const cards = buildSession(library, library.activeDeckId);
    if (cards.length === 0) {
      notify("No cards are due in this deck", "error");
      return;
    }

    session = {
      cards,
      index: 0,
      revealed: false,
      reviewed: 0,
      correct: 0,
      again: 0,
      initialCount: cards.length,
      startedAt: Date.now(),
    };
    result = null;
    screen = "review";
  }

  function applyDemoRoute(params: URLSearchParams) {
    const demoTheme = params.get("theme");
    if (demoTheme === "light" || demoTheme === "dark") {
      overrideTheme = demoTheme;
    }

    const demoScreen = params.get("screen");
    if (demoScreen === "words") {
      screen = "words";
    } else if (demoScreen === "settings") {
      screen = "settings";
    } else if (demoScreen === "review") {
      startReview();
      if (params.get("revealed") === "1" && session) {
        session.revealed = true;
      }
    } else if (demoScreen === "summary") {
      result = {
        reviewed: 12,
        correct: 10,
        again: 2,
        startedAt: Date.now() - 402_000,
        finishedAt: Date.now(),
        initialCount: 12,
      };
      screen = "summary";
    }
  }

  function revealCard() {
    if (session) session.revealed = true;
  }

  function handleGrade(grade: Grade) {
    if (!session || !currentCard) return;

    try {
      gradeCard(library, library.activeDeckId, currentCard.id, grade);
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Could not save that review",
        "error",
      );
      return;
    }

    const reviewed = session.reviewed + 1;
    const correct = session.correct + (grade === "again" ? 0 : 1);
    const again = session.again + (grade === "again" ? 1 : 0);

    if (reviewed >= session.initialCount) {
      result = {
        reviewed,
        correct,
        again,
        startedAt: session.startedAt,
        finishedAt: Date.now(),
        initialCount: session.initialCount,
      };
      session = null;
      screen = "summary";
      return;
    }

    session.reviewed = reviewed;
    session.correct = correct;
    session.again = again;
    session.index += 1;
    session.revealed = false;
  }

  function leaveReview() {
    session = null;
    screen = "home";
  }

  function goTab(next: Tab) {
    screen = next;
  }

  function openWords() {
    screen = "words";
  }

  function selectDeck(id: string) {
    if (library.activeDeckId === id) return;
    library.activeDeckId = id;
    saveLibrary(library);
  }

  function updateSettings(patch: Partial<SettingsModel>) {
    Object.assign(library.settings, patch);
    if (patch.theme) overrideTheme = null;
    saveLibrary(library);
  }

  function downloadDeck() {
    const outcome = exportDeckFile(library, library.activeDeckId, deck.name);
    if (!outcome) {
      notify("There is nothing to export yet", "error");
      return;
    }

    notify(
      outcome === "shared"
        ? "Deck ready to save or share"
        : "Deck exported as CSV",
    );
  }

  function resetDeckProgress() {
    resetProgress(library, library.activeDeckId);
    notify("Review progress reset");
  }

  function restoreStarterContent() {
    library = createSeedLibrary();
    saveLibrary(library);
    session = null;
    result = null;
    screen = "home";
    notify("Starter decks restored");
  }

  function goHomeFromSummary() {
    result = null;
    screen = "home";
  }

  function reviewAgain() {
    result = null;
    startReview();
  }
</script>

{#if screen === "review" && session && currentCard}
  <Review
    {deck}
    card={currentCard}
    revealed={session.revealed}
    {remaining}
    initialCount={session.initialCount}
    {progress}
    showTransliteration={library.settings.showTransliteration}
    {intervals}
    onReveal={revealCard}
    onGrade={handleGrade}
    onClose={leaveReview}
  />
{:else if screen === "summary" && result}
  <Summary
    {result}
    {deck}
    nextUp={stats.due + stats.newCards}
    onHome={goHomeFromSummary}
    onAgain={reviewAgain}
  />
{:else if screen === "words"}
  <Words {library} showToast={notify} />
{:else if screen === "settings"}
  <Settings
    settings={library.settings}
    deckName={deck.name}
    onUpdate={updateSettings}
    onExportDeck={downloadDeck}
    onResetProgress={resetDeckProgress}
    onRestoreStarter={restoreStarterContent}
  />
{:else}
  <Home
    {stats}
    {deck}
    decks={library.decks}
    onStart={startReview}
    onSelectDeck={selectDeck}
    onOpenWords={openWords}
  />
{/if}

{#if showTabs}
  <TabBar active={tab} onChange={goTab} />
{/if}

{#if toast}
  {#key toast.id}
    <Toast message={toast.message} tone={toast.tone} />
  {/key}
{/if}
