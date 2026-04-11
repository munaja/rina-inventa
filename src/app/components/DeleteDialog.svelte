<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/shadcn-ui/button/index.js';
	import * as Dialog from '$lib/components/shadcn-ui/dialog/index.js';
	import { Trash2 } from '@lucide/svelte';

	let {
		id,
		message = 'Apakah Anda yakin ingin menghapus data ini?'
	}: {
		id: string | number;
		message?: string;
	} = $props();

	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button variant="ghost" size="icon" {...props} class="text-destructive hover:bg-destructive/10">
				<Trash2 class="h-4 w-4" />
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Konfirmasi Hapus</Dialog.Title>
			<Dialog.Description>{message}</Dialog.Description>
		</Dialog.Header>
		<div class="flex justify-end gap-2 pt-4">
			<Button variant="outline" onclick={() => { open = false; }}>Batal</Button>
			<form method="POST" action="?/delete" use:enhance={() => { return async ({ update }) => { await update(); open = false; }; }}>
				<input type="hidden" name="id" value={id} />
				<Button variant="destructive" type="submit">Hapus</Button>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>
