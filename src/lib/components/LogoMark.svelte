<script lang="ts">
  let { size = 42, glow = false }: { size?: number; glow?: boolean } = $props();
</script>

<div class="mark" class:glow style={`--size:${size}px`} aria-hidden="true">
  <span class="glyph arabic">ك</span>
  <span class="spark"></span>
</div>

<style>
  .mark {
    position: relative;
    width: var(--size);
    height: var(--size);
    display: grid;
    place-items: center;
    flex: none;
    border-radius: calc(var(--size) * 0.33);
    background: linear-gradient(145deg, var(--emerald) 0%, var(--emerald-2) 100%);
    color: var(--on-emerald);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.18),
      0 10px 22px -12px rgba(14, 90, 67, 0.55);
  }

  .mark.glow {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.18),
      0 10px 22px -12px rgba(14, 90, 67, 0.55),
      0 0 0 6px var(--emerald-soft);
  }

  .glyph {
    font-size: calc(var(--size) * 0.62);
    line-height: 1;
    transform: translateY(-2%);
    opacity: 0.98;
  }

  .spark {
    position: absolute;
    top: calc(var(--size) * 0.18);
    right: calc(var(--size) * 0.16);
    width: calc(var(--size) * 0.09);
    height: calc(var(--size) * 0.09);
    border-radius: 50%;
    background: var(--gold-bright);
  }
</style>
