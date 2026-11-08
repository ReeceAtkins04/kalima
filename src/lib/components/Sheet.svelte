<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { X } from "@lucide/svelte";
  import { registerBackHandler } from "../back";

  let {
    open,
    title,
    onClose,
    children,
    footer,
  }: {
    open: boolean;
    title: string;
    onClose: () => void;
    children?: Snippet;
    footer?: Snippet;
  } = $props();

  let panel = $state<HTMLDivElement>();

  $effect(() => {
    if (!open) return;
    return registerBackHandler(() => {
      onClose();
      return true;
    });
  });

  $effect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => panel?.focus());
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previous;
    };
  });
</script>

<svelte:window
  onkeydown={(event) => {
    if (open && event.key === "Escape") onClose();
  }}
/>

{#if open}
  <div
    class="scrim"
    role="presentation"
    transition:fade={{ duration: 180 }}
    onclick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}
  >
    <div
      class="panel"
      bind:this={panel}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabindex="-1"
      transition:fly={{ y: 44, duration: 320, easing: cubicOut }}
    >
      <div class="handle" aria-hidden="true"></div>
      <header>
        <h2>{title}</h2>
        <button
          type="button"
          class="close pressable"
          onclick={onClose}
          aria-label="Close"
        >
          <X size={18} strokeWidth={2.2} />
        </button>
      </header>
      <div class="body no-scrollbar">
        {@render children?.()}
      </div>
      {#if footer}
        <div class="footer">{@render footer()}</div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    background: rgba(7, 14, 11, 0.48);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .panel {
    width: min(100%, 560px);
    max-height: 90dvh;
    display: flex;
    flex-direction: column;
    padding: 10px 20px calc(16px + var(--bottom-safe));
    border: 1px solid var(--line);
    border-bottom: none;
    border-radius: 30px 30px 0 0;
    background: var(--surface);
    box-shadow: var(--shadow-lg);
    outline: none;
  }

  .handle {
    width: 38px;
    height: 4px;
    margin: 2px auto 12px;
    border-radius: 999px;
    background: var(--line-strong);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 14px;
  }

  h2 {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.015em;
  }

  .close {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    flex: none;
    border-radius: 50%;
    background: var(--surface-2);
    color: var(--muted);
  }

  .body {
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-bottom: 4px;
  }

  .footer {
    padding-top: 14px;
  }

  @media (min-width: 700px) {
    .scrim {
      align-items: center;
      padding: 24px;
    }

    .panel {
      border-bottom: 1px solid var(--line);
      border-radius: 28px;
      padding-bottom: 20px;
      max-height: 84dvh;
    }

    .handle {
      display: none;
    }
  }
</style>
