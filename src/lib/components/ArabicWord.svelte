<script lang="ts">
  let {
    word,
    size = "md",
  }: { word: string; size?: "hero" | "lg" | "md" | "sm" } = $props();
</script>

<span class="arabic word {size}" lang="ar" dir="rtl">{word}</span>

<style>
  .word {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    overflow-wrap: normal;
    word-break: keep-all;
  }

  .hero {
    font-size: clamp(3.25rem, 14.5vw, 5.1rem);
    line-height: 1.5;
    padding-block: 0.04em;
    letter-spacing: 0 !important;
  }

  .lg {
    font-size: clamp(2rem, 9vw, 2.7rem);
    line-height: 1.45;
  }

  .md {
    font-size: 1.42rem;
    line-height: 1.5;
  }

  .sm {
    font-size: 1.08rem;
    line-height: 1.45;
  }
</style>
