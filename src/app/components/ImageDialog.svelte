<script lang="ts">
	import * as Dialog from '$lib/components/shadcn-ui/dialog/index.js';
	import { Button } from '$lib/components/shadcn-ui/button/index.js';
	import { Input } from '$lib/components/shadcn-ui/input/index.js';
	import { Label } from '$lib/components/shadcn-ui/label/index.js';
	import { Upload } from '@lucide/svelte';
	import { invalidateAll } from '$app/navigation';

	let { open = $bindable(false), itemId, imgUrl }: { open: boolean; itemId: number; imgUrl: string | null } = $props();

	let uploading = $state(false);
	let error = $state('');

	async function handleUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		uploading = true;
		error = '';

		const formData = new FormData();
		formData.append('file', file);
		formData.append('id', String(itemId));

		try {
			const res = await fetch('/api/upload/image', {
				method: 'POST',
				body: formData
			});
			const data = await res.json();
			if (data.success) {
				imgUrl = data.url;
				await invalidateAll();
			} else {
				error = data.error || 'Upload gagal';
			}
		} catch {
			error = 'Upload gagal';
		} finally {
			uploading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Foto Inspeksi</Dialog.Title>
		</Dialog.Header>
		<div class="flex flex-col items-center gap-4 py-4">
			{#if imgUrl}
				<img src={imgUrl} alt="Inspection" class="max-h-64 rounded-lg border object-contain" />
			{:else}
				<div class="flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/30">
					<p class="text-sm text-muted-foreground">Belum ada foto</p>
				</div>
			{/if}

			{#if error}
				<p class="text-sm text-destructive">{error}</p>
			{/if}

			<div class="w-full space-y-2">
				<Label for="image-upload" class="text-sm">Upload foto baru</Label>
				<Input
					id="image-upload"
					type="file"
					accept="image/*"
					onchange={handleUpload}
					disabled={uploading}
				/>
				{#if uploading}
					<p class="text-sm text-muted-foreground">Mengupload...</p>
				{/if}
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
