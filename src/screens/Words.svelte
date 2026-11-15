<script lang="ts">
  import {
    Plus,
    Search,
    X,
    FileUp,
    Download,
    Pencil,
    Trash2,
    ChevronRight,
    ChevronDown,
    FolderPlus,
    BookOpen,
    Check,
    Sparkles,
  } from "@lucide/svelte";
  import Sheet from "../lib/components/Sheet.svelte";
  import ArabicWord from "../lib/components/ArabicWord.svelte";
  import {
    createDeck,
    deleteCard,
    importCsv,
    saveCard,
    saveLibrary,
  } from "../lib/api";
  import { exportDeckFile } from "../lib/export";
  import { daysBetween, today } from "../lib/date";
  import type { Card, Deck, Library } from "../lib/types";

  let {
    library,
    showToast,
  }: {
    library: Library;
    showToast: (message: string, tone?: "default" | "error") => void;
  } = $props();

  let search = $state("");
  let pickerOpen = $state(false);
  let cardOpen = $state(false);
  let deckOpen = $state(false);
  let editingCard = $state<Card | null>(null);
  let editingDeck = $state<Deck | null>(null);
  let deleteArmed = $state(false);
  let deckDeleteArmed = $state(false);
  let formError = $state("");
  let deckError = $state("");
  let fileInput = $state<HTMLInputElement>();

  let form = $state({
    arabic: "",
    transliteration: "",
    english: "",
    notes: "",
  });
  let deckForm = $state({ name: "", arabicName: "", description: "" });

  let deck = $derived(
    library.decks.find((item) => item.id === library.activeDeckId) ??
      library.decks[0],
  );
  let cards = $derived(deck?.cards ?? []);
  let dueCount = $derived(
    cards.filter((card) => card.reps > 0 && card.due <= today()).length,
  );
  let newCount = $derived(cards.filter((card) => card.reps === 0).length);

  let filtered = $derived.by(() => {
    const query = search.trim().toLowerCase();
    if (!query) return cards;
    return cards.filter((card) =>
      [card.arabic, card.transliteration, card.english, card.notes ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  });

  function selectDeck(id: string) {
    library.activeDeckId = id;
    saveLibrary(library);
    search = "";
    pickerOpen = false;
  }

  function statusFor(card: Card): { label: string; tone: string } {
    if (card.reps === 0) return { label: "New", tone: "new" };
    if (card.due <= today()) return { label: "Due", tone: "due" };
    const days = daysBetween(today(), card.due);
    if (days === 1) return { label: "Tomorrow", tone: "future" };
    return { label: `${days}d`, tone: "future" };
  }

  function openAddCard() {
    editingCard = null;
    form = { arabic: "", transliteration: "", english: "", notes: "" };
    formError = "";
    deleteArmed = false;
    cardOpen = true;
  }

  function openEditCard(card: Card) {
    editingCard = card;
    form = {
      arabic: card.arabic,
      transliteration: card.transliteration,
      english: card.english,
      notes: card.notes ?? "",
    };
    formError = "";
    deleteArmed = false;
    cardOpen = true;
  }

  function submitCard() {
    formError = "";
    try {
      saveCard(library, deck.id, {
        id: editingCard?.id,
        arabic: form.arabic,
        transliteration: form.transliteration,
        english: form.english,
        notes: form.notes,
      });
      cardOpen = false;
      showToast(editingCard ? "Word updated" : "Word added");
    } catch (error) {
      formError = error instanceof Error ? error.message : "Could not save word";
    }
  }

  function removeCard() {
    if (!editingCard) return;
    if (!deleteArmed) {
      deleteArmed = true;
      return;
    }
    deleteCard(library, deck.id, editingCard.id);
    cardOpen = false;
    deleteArmed = false;
    showToast("Word deleted");
  }

  function openDeckPicker() {
    pickerOpen = true;
  }

  function openNewDeck() {
    editingDeck = null;
    deckForm = { name: "", arabicName: "", description: "" };
    deckError = "";
    deckDeleteArmed = false;
    pickerOpen = false;
    deckOpen = true;
  }

  function openDeckSettings(target: Deck) {
    editingDeck = target;
    deckForm = {
      name: target.name,
      arabicName: target.arabicName,
      description: target.description,
    };
    deckError = "";
    deckDeleteArmed = false;
    pickerOpen = false;
    deckOpen = true;
  }

  function submitDeck() {
    deckError = "";
    const name = deckForm.name.trim();
    if (!name) {
      deckError = "Please give this deck a name";
      return;
    }

    if (editingDeck) {
      editingDeck.name = name;
      editingDeck.arabicName = deckForm.arabicName.trim();
      editingDeck.description = deckForm.description.trim();
      saveLibrary(library);
      showToast("Deck updated");
    } else {
      const created = createDeck(library, name);
      created.arabicName = deckForm.arabicName.trim();
      created.description = deckForm.description.trim();
      saveLibrary(library);
      showToast("Deck created");
    }
    deckOpen = false;
  }

  function removeDeck() {
    if (!editingDeck) return;
    if (library.decks.length <= 1) return;
    if (!deckDeleteArmed) {
      deckDeleteArmed = true;
      return;
    }

    const removedId = editingDeck.id;
    library.decks = library.decks.filter((item) => item.id !== removedId);
    if (library.activeDeckId === removedId) {
      library.activeDeckId = library.decks[0].id;
    }
    saveLibrary(library);
    deckOpen = false;
    deckDeleteArmed = false;
    showToast("Deck deleted");
  }

  async function handleImport(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const name = file.name.replace(/\.csv$/i, "").replaceAll(/[_-]+/g, " ");
      const result = importCsv(library, name, text);
      search = "";
      pickerOpen = false;
      showToast(
        `Imported ${result.imported} word${result.imported === 1 ? "" : "s"}${
          result.skipped > 0 ? ` · ${result.skipped} skipped` : ""
        }`,
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not import that file",
        "error",
      );
    } finally {
      input.value = "";
    }
  }

  function exportDeck() {
    const outcome = exportDeckFile(library, deck.id, deck.name);
    if (!outcome) return;

    pickerOpen = false;
    showToast(
      outcome === "shared"
        ? "Deck ready to save or share"
        : "Deck exported as CSV",
    );
  }
</script>

<div class="screen no-scrollbar">
  <header class="topbar">
    <div>
      <p class="eyebrow">Vocabulary</p>
      <h1>Your words</h1>
    </div>
    <button type="button" class="add-btn pressable" onclick={openAddCard}>
      <Plus size={17} strokeWidth={2.6} />
      <span>Add word</span>
    </button>
  </header>

  <button
    type="button"
    class="deck-switch pressable"
    onclick={openDeckPicker}
    aria-haspopup="dialog"
  >
    <span class="deck-mark" aria-hidden="true">
      <BookOpen size={16} strokeWidth={2.1} />
    </span>
    <span class="deck-text">
      <span class="deck-name">{deck.name}</span>
      <span class="deck-meta">
        {cards.length} {cards.length === 1 ? "word" : "words"}
        {#if dueCount > 0}
          <span class="meta-dot"></span>
          <span class="meta-due">{dueCount} due</span>
        {:else if newCount > 0}
          <span class="meta-dot"></span>
          <span>{newCount} new</span>
        {/if}
      </span>
    </span>
    <ChevronDown size={17} strokeWidth={2.2} />
  </button>

  <div class="search-box">
    <Search size={17} strokeWidth={2.1} />
    <input
      type="search"
      placeholder="Search Arabic or English"
      aria-label="Search your words"
      bind:value={search}
    />
    {#if search}
      <button
        type="button"
        class="clear-search pressable"
        onclick={() => (search = "")}
        aria-label="Clear search"
      >
        <X size={14} strokeWidth={2.4} />
      </button>
    {/if}
  </div>

  <div class="list-head">
    <span>
      {#if search}
        {filtered.length} result{filtered.length === 1 ? "" : "s"}
      {:else}
        All words
      {/if}
    </span>
    <span class="list-count">{cards.length}</span>
  </div>

  {#if filtered.length > 0}
    <ul class="word-list">
      {#each filtered as card (card.id)}
        {@const status = statusFor(card)}
        <li>
          <button
            type="button"
            class="word-row pressable"
            onclick={() => openEditCard(card)}
          >
            <div class="word-main">
              <ArabicWord word={card.arabic} size="md" />
              <span class="status {status.tone}">{status.label}</span>
            </div>
            <p class="word-sub">
              {#if card.transliteration}
                <span class="translit">{card.transliteration}</span>
                <span class="sep" aria-hidden="true"></span>
              {/if}
              <span class="english">{card.english}</span>
            </p>
          </button>
        </li>
      {/each}
    </ul>
  {:else}
    <div class="empty">
      <span class="empty-icon">
        {#if search}
          <Search size={23} strokeWidth={1.9} />
        {:else}
          <Sparkles size={23} strokeWidth={1.9} />
        {/if}
      </span>
      <p class="empty-title">
        {search ? "No words found" : "This deck is waiting"}
      </p>
      <p class="empty-copy">
        {search
          ? "Try a different spelling or clear your search."
          : "Add your first word, or import a CSV to get started."}
      </p>
      {#if !search}
        <button type="button" class="empty-action pressable" onclick={openAddCard}>
          <Plus size={15} strokeWidth={2.5} />
          Add a word
        </button>
      {/if}
    </div>
  {/if}
</div>

<!-- Deck picker -->
<Sheet open={pickerOpen} title="Your decks" onClose={() => (pickerOpen = false)}>
  <ul class="deck-list">
    {#each library.decks as item (item.id)}
      <li class="deck-row" class:active={item.id === deck.id}>
        <button
          type="button"
          class="deck-row-main"
          onclick={() => selectDeck(item.id)}
        >
          <span class="deck-row-mark">
            {#if item.id === deck.id}
              <Check size={15} strokeWidth={2.6} />
            {:else}
              <BookOpen size={15} strokeWidth={2} />
            {/if}
          </span>
          <span class="deck-row-text">
            <span class="deck-row-name">{item.name}</span>
            <span class="deck-row-meta">
              {item.cards.length} {item.cards.length === 1 ? "word" : "words"}
              {#if item.arabicName}
                · <span class="font-arabic">{item.arabicName}</span>
              {/if}
            </span>
          </span>
        </button>
        <button
          type="button"
          class="deck-edit pressable"
          onclick={() => openDeckSettings(item)}
          aria-label={`Edit ${item.name}`}
        >
          <Pencil size={14} strokeWidth={2.1} />
        </button>
      </li>
    {/each}
  </ul>

  <div class="deck-actions">
    <button type="button" class="deck-action pressable" onclick={openNewDeck}>
      <FolderPlus size={17} strokeWidth={2.1} />
      <span>New deck</span>
    </button>
    <button
      type="button"
      class="deck-action pressable"
      onclick={() => fileInput?.click()}
    >
      <FileUp size={17} strokeWidth={2.1} />
      <span>Import CSV</span>
    </button>
    <button type="button" class="deck-action pressable" onclick={exportDeck}>
      <Download size={17} strokeWidth={2.1} />
      <span>Export</span>
    </button>
  </div>
  <p class="deck-hint">
    CSV files use the columns <b>arabic</b>, <b>transliteration</b>,{" "}
    <b>english</b>, and optional <b>notes</b>.
  </p>
</Sheet>

<!-- Word editor -->
<Sheet
  open={cardOpen}
  title={editingCard ? "Edit word" : "New word"}
  onClose={() => (cardOpen = false)}
>
  <div class="form">
    <label class="field">
      <span class="field-label">Arabic</span>
      <input
        class="arabic-input arabic"
        type="text"
        dir="rtl"
        lang="ar"
        placeholder="كلمة"
        bind:value={form.arabic}
        autocomplete="off"
        spellcheck="false"
      />
    </label>

    <label class="field">
      <span class="field-label">Transliteration</span>
      <input
        type="text"
        placeholder="kalima"
        bind:value={form.transliteration}
        autocomplete="off"
        spellcheck="false"
      />
    </label>

    <label class="field">
      <span class="field-label">English meaning</span>
      <input
        type="text"
        placeholder="word"
        bind:value={form.english}
        autocomplete="off"
      />
    </label>

    <label class="field">
      <span class="field-label">Notes <em>optional</em></span>
      <textarea
        rows="2"
        placeholder="Root, plural, or a memory hook…"
        bind:value={form.notes}
      ></textarea>
    </label>

    {#if formError}
      <p class="form-error" role="alert">{formError}</p>
    {/if}

    {#if editingCard}
      <button
        type="button"
        class="delete-btn pressable"
        class:armed={deleteArmed}
        onclick={removeCard}
      >
        <Trash2 size={15} strokeWidth={2.1} />
        <span>{deleteArmed ? "Tap again to delete for good" : "Delete word"}</span>
      </button>
    {/if}
  </div>

  {#snippet footer()}
    <div class="sheet-footer">
      <button
        type="button"
        class="ghost-btn pressable"
        onclick={() => (cardOpen = false)}
      >
        Cancel
      </button>
      <button type="button" class="save-btn pressable" onclick={submitCard}>
        {editingCard ? "Save changes" : "Add word"}
      </button>
    </div>
  {/snippet}
</Sheet>

<!-- Deck editor -->
<Sheet
  open={deckOpen}
  title={editingDeck ? "Deck settings" : "New deck"}
  onClose={() => (deckOpen = false)}
>
  <div class="form">
    <label class="field">
      <span class="field-label">Deck name</span>
      <input
        type="text"
        placeholder="My Arabic deck"
        bind:value={deckForm.name}
        autocomplete="off"
      />
    </label>

    <label class="field">
      <span class="field-label">Arabic name <em>optional</em></span>
      <input
        class="arabic-input arabic"
        type="text"
        dir="rtl"
        lang="ar"
        placeholder="مفرداتي"
        bind:value={deckForm.arabicName}
        autocomplete="off"
        spellcheck="false"
      />
    </label>

    <label class="field">
      <span class="field-label">Description <em>optional</em></span>
      <textarea
        rows="2"
        placeholder="What is this deck for?"
        bind:value={deckForm.description}
      ></textarea>
    </label>

    {#if deckError}
      <p class="form-error" role="alert">{deckError}</p>
    {/if}

    {#if editingDeck && library.decks.length > 1}
      <button
        type="button"
        class="delete-btn pressable"
        class:armed={deckDeleteArmed}
        onclick={removeDeck}
      >
        <Trash2 size={15} strokeWidth={2.1} />
        <span>
          {deckDeleteArmed
            ? "Tap again to delete this deck"
            : "Delete deck and its words"}
        </span>
      </button>
    {/if}
  </div>

  {#snippet footer()}
    <div class="sheet-footer">
      <button
        type="button"
        class="ghost-btn pressable"
        onclick={() => (deckOpen = false)}
      >
        Cancel
      </button>
      <button type="button" class="save-btn pressable" onclick={submitDeck}>
        {editingDeck ? "Save changes" : "Create deck"}
      </button>
    </div>
  {/snippet}
</Sheet>

<input
  bind:this={fileInput}
  class="sr-only"
  type="file"
  accept=".csv,text/csv,text/plain"
  onchange={handleImport}
  tabindex="-1"
/>

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
    gap: 14px;
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

  .add-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 40px;
    padding: 0 14px 0 11px;
    border-radius: 999px;
    background: var(--emerald);
    color: var(--on-emerald);
    font-size: 11.5px;
    font-weight: 800;
    white-space: nowrap;
    box-shadow: 0 10px 20px -14px color-mix(in srgb, var(--emerald) 85%, transparent);
  }

  .deck-switch {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    margin-top: 18px;
    padding: 11px 13px;
    border: 1px solid var(--line);
    border-radius: 19px;
    background: var(--surface);
    text-align: left;
    box-shadow: var(--shadow-sm);
  }

  .deck-mark {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    flex: none;
    border-radius: 12px;
    background: var(--emerald-soft);
    color: var(--emerald);
  }

  .deck-text {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .deck-name {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: -0.015em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .deck-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 600;
    color: var(--muted);
  }

  .meta-dot {
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: var(--faint);
  }

  .meta-due {
    color: var(--gold);
    font-weight: 800;
  }

  .deck-switch :global(svg) {
    color: var(--muted);
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 9px;
    height: 46px;
    margin-top: 11px;
    padding: 0 14px;
    border: 1px solid var(--line);
    border-radius: 15px;
    background: var(--surface-2);
    color: var(--faint);
  }

  .search-box input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    background: none;
    color: var(--ink);
    font-size: 12.5px;
    font-weight: 600;
  }

  .search-box input::placeholder {
    color: var(--faint);
    font-weight: 600;
  }

  .search-box input::-webkit-search-cancel-button {
    display: none;
  }

  .clear-search {
    display: grid;
    place-items: center;
    width: 23px;
    height: 23px;
    flex: none;
    border-radius: 50%;
    background: var(--line);
    color: var(--muted);
  }

  .list-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 3px 9px;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .list-count {
    display: grid;
    place-items: center;
    min-width: 22px;
    height: 20px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--surface-2);
    color: var(--muted);
    font-size: 9px;
    letter-spacing: 0;
    font-variant-numeric: tabular-nums;
  }

  .word-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .word-row {
    display: flex;
    flex-direction: column;
    gap: 3px;
    width: 100%;
    padding: 13px 15px 12px;
    border: 1px solid var(--line);
    border-radius: 17px;
    background: var(--surface);
    text-align: left;
  }

  .word-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .word-main :global(.word) {
    text-align: left;
  }

  .status {
    flex: none;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 8.5px;
    font-weight: 800;
    letter-spacing: 0.04em;
  }

  .status.new {
    background: var(--gold-soft);
    color: var(--gold);
  }

  .status.due {
    background: var(--again-soft);
    color: var(--again);
  }

  .status.future {
    background: var(--surface-2);
    color: var(--muted);
  }

  .word-sub {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 600;
    color: var(--muted);
    line-height: 1.4;
  }

  .translit {
    font-style: italic;
    letter-spacing: 0.015em;
  }

  .sep {
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: var(--faint);
  }

  .english {
    color: var(--ink-2);
    font-weight: 600;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 46px 18px 30px;
    text-align: center;
  }

  .empty-icon {
    display: grid;
    place-items: center;
    width: 58px;
    height: 58px;
    margin-bottom: 15px;
    border: 1px solid var(--line);
    border-radius: 19px;
    background: linear-gradient(150deg, var(--surface), var(--surface-2));
    color: var(--gold);
    box-shadow: var(--shadow-sm);
  }

  .empty-title {
    font-size: 16px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .empty-copy {
    max-width: 240px;
    margin-top: 6px;
    font-size: 11.5px;
    font-weight: 600;
    line-height: 1.5;
    color: var(--muted);
  }

  .empty-action {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 38px;
    margin-top: 17px;
    padding: 0 15px;
    border-radius: 999px;
    background: var(--emerald-soft);
    color: var(--emerald);
    font-size: 11px;
    font-weight: 800;
  }

  /* Sheets */
  .deck-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .deck-row {
    display: flex;
    align-items: center;
    gap: 4px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--surface-2);
    overflow: hidden;
  }

  .deck-row.active {
    border-color: color-mix(in srgb, var(--emerald) 35%, transparent);
    background: var(--emerald-soft);
  }

  .deck-row-main {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
    padding: 11px 4px 11px 11px;
    text-align: left;
  }

  .deck-row-mark {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    flex: none;
    border-radius: 10px;
    background: var(--surface);
    color: var(--emerald);
  }

  .deck-row-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .deck-row-name {
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .deck-row-meta {
    font-size: 9.5px;
    font-weight: 600;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .deck-edit {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    margin-right: 5px;
    flex: none;
    border-radius: 10px;
    color: var(--muted);
  }

  .deck-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 7px;
    margin-top: 10px;
  }

  .deck-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 13px 5px 11px;
    border: 1px solid var(--line);
    border-radius: 15px;
    background: var(--surface-2);
    color: var(--ink-2);
    font-size: 9.5px;
    font-weight: 800;
  }

  .deck-action :global(svg) {
    color: var(--emerald);
  }

  .deck-hint {
    margin-top: 11px;
    padding: 0 2px;
    font-size: 9.5px;
    line-height: 1.5;
    color: var(--muted);
    font-weight: 600;
  }

  .deck-hint b {
    color: var(--ink-2);
    font-weight: 800;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-bottom: 3px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-label {
    padding-left: 2px;
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .field-label em {
    font-size: 8.5px;
    font-style: normal;
    letter-spacing: 0.03em;
    text-transform: none;
    color: var(--faint);
  }

  .field input,
  .field textarea {
    width: 100%;
    padding: 11px 13px;
    border: 1px solid var(--line);
    border-radius: 13px;
    outline: none;
    background: var(--surface-2);
    color: var(--ink);
    font-size: 13px;
    font-weight: 600;
    transition:
      border-color 160ms var(--ease-out),
      background-color 160ms var(--ease-out);
  }

  .field input:focus,
  .field textarea:focus {
    border-color: color-mix(in srgb, var(--emerald) 55%, transparent);
    background: var(--surface);
  }

  .field input::placeholder,
  .field textarea::placeholder {
    color: var(--faint);
    font-weight: 500;
  }

  .field textarea {
    resize: none;
    line-height: 1.45;
  }

  .arabic-input {
    font-size: 20px !important;
    text-align: right;
    line-height: 1.6;
  }

  .form-error {
    padding: 9px 11px;
    border-radius: 10px;
    background: var(--again-soft);
    color: var(--again);
    font-size: 11px;
    font-weight: 700;
  }

  .delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 38px;
    margin-top: 2px;
    border-radius: 12px;
    background: var(--again-soft);
    color: var(--again);
    font-size: 10.5px;
    font-weight: 800;
  }

  .delete-btn.armed {
    background: var(--again);
    color: #fff8f4;
  }

  .sheet-footer {
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
    font-size: 12px;
    font-weight: 800;
  }

  .save-btn {
    height: 46px;
    border-radius: 14px;
    background: var(--emerald);
    color: var(--on-emerald);
    font-size: 12px;
    font-weight: 800;
    box-shadow: 0 12px 20px -16px color-mix(in srgb, var(--emerald) 85%, transparent);
  }
</style>
