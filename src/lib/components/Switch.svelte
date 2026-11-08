<script lang="ts">
  let {
    checked,
    onChange,
    label,
  }: {
    checked: boolean;
    onChange: (value: boolean) => void;
    label: string;
  } = $props();
</script>

<button
  type="button"
  class="switch"
  class:on={checked}
  role="switch"
  aria-checked={checked}
  aria-label={label}
  onclick={() => onChange(!checked)}
>
  <span class="thumb"></span>
</button>

<style>
  .switch {
    position: relative;
    width: 48px;
    height: 29px;
    flex: none;
    padding: 3px;
    border-radius: 999px;
    background: var(--line-strong);
    transition: background-color 220ms var(--ease-out);
  }

  .switch.on {
    background: var(--emerald);
  }

  .thumb {
    display: block;
    width: 23px;
    height: 23px;
    border-radius: 50%;
    background: #fffdf8;
    box-shadow: 0 1px 3px rgba(20, 35, 27, 0.25);
    transform: translateX(0);
    transition: transform 240ms var(--ease-spring);
  }

  .switch.on .thumb {
    transform: translateX(19px);
  }
</style>
