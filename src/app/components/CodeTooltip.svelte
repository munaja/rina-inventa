<script lang="ts">
	let {
		value,
		class: className = ''
	}: {
		value: string | number | null | undefined;
		class?: string;
	} = $props();

	const display = $derived(value == null || value === '' ? '-' : String(value));
	const parts = $derived(display.split('-'));
</script>

<span class="whitespace-normal {className}">
	{#each parts as part, i}<span class="inline-block whitespace-nowrap">{part}{i < parts.length - 1 ? '-' : ''}</span>{/each}
</span>
