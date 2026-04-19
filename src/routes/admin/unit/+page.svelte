<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/shadcn-ui/button/index.js';
	import * as Table from '$lib/components/shadcn-ui/table/index.js';
	import * as Alert from '$lib/components/shadcn-ui/alert/index.js';
	import * as Dialog from '$lib/components/shadcn-ui/dialog/index.js';
	import { Input } from '$lib/components/shadcn-ui/input/index.js';
	import { Label } from '$lib/components/shadcn-ui/label/index.js';
	import { Plus, Pencil, Building } from '@lucide/svelte';
	import DeleteDialog from '../../../app/components/DeleteDialog.svelte';
	import CodeTooltip from '../../../app/components/CodeTooltip.svelte';
	import DetailDialog from '../../../app/components/DetailDialog.svelte';

	let { data, form } = $props();
	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let editItem = $state({ id: 0, code: '', name: '' });
	let detailDialogOpen = $state(false);
	let detailItem = $state<Record<string, unknown> | null>(null);
	const unitDetailCols = [
		{ key: 'code', label: 'Kode' },
		{ key: 'name', label: 'Nama' }
	];
	function openDetail(item: Record<string, unknown>) {
		detailItem = item;
		detailDialogOpen = true;
	}
</script>

<div>
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight"><Building class="h-6 w-6" /> Unit</h1>
			<p class="mt-1 text-sm text-muted-foreground">{data.units.length} unit</p>
		</div>
		<Dialog.Root bind:open={createDialogOpen}>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button {...props}><Plus class="mr-1.5 h-4 w-4" /> Tambah Unit</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header><Dialog.Title>Tambah Unit</Dialog.Title></Dialog.Header>
				<form method="POST" action="?/create" use:enhance={() => { return async ({ update, result }) => { await update(); if (result.type === 'success') createDialogOpen = false; }; }} class="space-y-3">
					<div class="space-y-1.5">
						<Label for="code">Kode</Label>
						<Input id="code" name="code" required placeholder="Kode unit" />
					</div>
					<div class="space-y-1.5">
						<Label for="name">Nama</Label>
						<Input id="name" name="name" required placeholder="Nama unit" />
					</div>
					<div class="flex justify-end gap-2 pt-3">
						<Button variant="outline" type="button" onclick={() => { createDialogOpen = false; }}>Batal</Button>
						<Button type="submit">Simpan</Button>
					</div>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	{#if form?.error}
		<Alert.Root variant="destructive" class="mb-4"><Alert.Description>{form.error}</Alert.Description></Alert.Root>
	{/if}
	{#if form?.created || form?.updated || form?.deleted}
		<Alert.Root class="mb-4 border-emerald-200 bg-emerald-50 text-emerald-800">
			<Alert.Description>{form?.created ? 'Unit berhasil ditambahkan' : form?.updated ? 'Unit berhasil diperbarui' : 'Unit berhasil dihapus'}</Alert.Description>
		</Alert.Root>
	{/if}

	<div class="overflow-hidden rounded-xl border bg-card shadow-sm">
		<Table.Root>
			<Table.Header>
				<Table.Row class="bg-muted/40 hover:bg-muted/40">
					<Table.Head class="w-[60px] text-center font-semibold">No</Table.Head>
					<Table.Head class="font-semibold">Kode</Table.Head>
					<Table.Head class="font-semibold">Nama</Table.Head>
					<Table.Head class="w-[120px] text-center font-semibold">Aksi</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.units as unit, i}
					<Table.Row class="cursor-pointer" onclick={() => openDetail(unit as unknown as Record<string, unknown>)}>
						<Table.Cell class="text-center text-muted-foreground">{i + 1}</Table.Cell>
						<Table.Cell class="font-medium">
							<div class="min-w-[300px] max-w-[380px]">
								<CodeTooltip value={unit.code} />
							</div>
						</Table.Cell>
						<Table.Cell>{unit.name}</Table.Cell>
						<Table.Cell onclick={(e: MouseEvent) => e.stopPropagation()}>
							<div class="flex justify-center gap-1">
								<Button variant="ghost" size="icon" onclick={() => { editItem = { ...unit }; editDialogOpen = true; }}>
									<Pencil class="h-4 w-4" />
								</Button>
								<DeleteDialog id={unit.id} message="Apakah Anda yakin ingin menghapus unit ini?" />
							</div>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={4} class="py-12 text-center text-muted-foreground">Belum ada unit.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<DetailDialog bind:open={detailDialogOpen} title="Detail Unit" columns={unitDetailCols} item={detailItem} />

	<Dialog.Root bind:open={editDialogOpen}>
		<Dialog.Content>
			<Dialog.Header><Dialog.Title>Edit Unit</Dialog.Title></Dialog.Header>
			<form method="POST" action="?/update" use:enhance={() => { return async ({ update, result }) => { await update(); if (result.type === 'success') editDialogOpen = false; }; }} class="space-y-3">
				<input type="hidden" name="id" value={editItem.id} />
				<div class="space-y-1.5">
					<Label for="edit-code">Kode</Label>
					<Input id="edit-code" name="code" required bind:value={editItem.code} />
				</div>
				<div class="space-y-1.5">
					<Label for="edit-name">Nama</Label>
					<Input id="edit-name" name="name" required bind:value={editItem.name} />
				</div>
				<div class="flex justify-end gap-2 pt-3">
					<Button variant="outline" type="button" onclick={() => { editDialogOpen = false; }}>Batal</Button>
					<Button type="submit">Simpan</Button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
