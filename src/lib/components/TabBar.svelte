<script lang="ts">
  import { House, BookOpen, Settings2 } from "@lucide/svelte";
  import type { Tab } from "../types";

  let {
    active,
    onChange,
  }: { active: Tab; onChange: (tab: Tab) => void } = $props();

  const tabs = [
    { id: "home" as const, label: "Home", icon: House },
    { id: "words" as const, label: "Words", icon: BookOpen },
    { id: "settings" as const, label: "Settings", icon: Settings2 },
  ];
</script>

<nav class="tabbar" aria-label="Main navigation">
  <div class="inner">
    {#each tabs as tab}
      {@const Icon = tab.icon}
      <button
        type="button"
        class="tab"
        class:active={active === tab.id}
        onclick={() => onChange(tab.id)}
        aria-current={active === tab.id ? "page" : undefined}
      >
        <Icon size={21} strokeWidth={1.9} />
        <span>{tab.label}</span>
      </button>
    {/each}
  </div>
</nav>

<style>
  .tabbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    display: flex;
    justify-content: center;
    padding: 0 calc(14px + var(--left-safe)) calc(10px + var(--bottom-safe))
      calc(14px + var(--right-safe));
    pointer-events: none;
  }

  .inner {
    pointer-events: auto;
    width: min(100%, 460px);
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    padding: 6px;
    border: 1px solid var(--line);
    border-radius: 24px;
    background: color-mix(in srgb, var(--surface) 86%, transparent);
    backdrop-filter: blur(20px) saturate(1.25);
    -webkit-backdrop-filter: blur(20px) saturate(1.25);
    box-shadow: var(--shadow-md);
  }

  .tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    height: 52px;
    border-radius: 18px;
    color: var(--muted);
    transition:
      color 180ms var(--ease-out),
      background-color 180ms var(--ease-out),
      transform 180ms var(--ease-out);
  }

  .tab span {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.01em;
  }

  .tab:active {
    transform: scale(0.96);
  }

  .tab.active {
    color: var(--emerald);
    background: var(--emerald-soft);
  }
</style>
