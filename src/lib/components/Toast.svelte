<script lang="ts">
  import { Check, AlertCircle } from "@lucide/svelte";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  let {
    message,
    tone = "default",
  }: { message: string; tone?: "default" | "error" } = $props();
</script>

<div
  class="toast"
  class:error={tone === "error"}
  role="status"
  aria-live="polite"
  transition:fly={{ y: 14, duration: 240, easing: cubicOut }}
>
  {#if tone === "error"}
    <AlertCircle size={16} strokeWidth={2.2} />
  {:else}
    <Check size={16} strokeWidth={2.6} />
  {/if}
  <span>{message}</span>
</div>

<style>
  .toast {
    position: fixed;
    left: 50%;
    bottom: calc(92px + var(--bottom-safe));
    z-index: 80;
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: calc(100vw - 36px);
    padding: 10px 15px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    background: var(--ink);
    color: var(--bg);
    box-shadow: var(--shadow-md);
    font-size: 12.5px;
    font-weight: 700;
    transform: translateX(-50%);
  }

  .toast.error {
    background: var(--again);
    color: #fff8f4;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
