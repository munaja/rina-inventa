<script lang="ts">
	import * as Dialog from '$lib/components/shadcn-ui/dialog/index.js';

	type Col = { key: string; label: string };
	let {
		open = $bindable(false),
		title = 'Detail Data',
		columns,
		item
	}: {
		open: boolean;
		title?: string;
		columns: Col[];
		item: Record<string, unknown> | null;
	} = $props();

	function display(val: unknown): string {
		if (val == null || val === '') return '-';
		return String(val);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
		</Dialog.Header>
		{#if item}
			<dl class="divide-y text-sm">
				{#each columns as col}
					<div class="grid grid-cols-[160px_1fr] gap-3 py-2">
						<dt class="text-muted-foreground">{col.label}</dt>
						<dd class="break-words">{display(item[col.key])}</dd>
					</div>
				{/each}
			</dl>
		{/if}
	</Dialog.Content>
</Dialog.Root>
