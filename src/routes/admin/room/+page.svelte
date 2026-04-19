<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/shadcn-ui/button/index.js';
	import * as Table from '$lib/components/shadcn-ui/table/index.js';
	import * as Alert from '$lib/components/shadcn-ui/alert/index.js';
	import * as Dialog from '$lib/components/shadcn-ui/dialog/index.js';
	import { Input } from '$lib/components/shadcn-ui/input/index.js';
	import { Label } from '$lib/components/shadcn-ui/label/index.js';
	import { Plus, Search, X, ChevronLeft, ChevronRight, Pencil, QrCode, DoorOpen } from '@lucide/svelte';
	import QrCodeDialog from '../../../app/components/QrCodeDialog.svelte';
	import DeleteDialog from '../../../app/components/DeleteDialog.svelte';
	import CodeTooltip from '../../../app/components/CodeTooltip.svelte';
	import DetailDialog from '../../../app/components/DetailDialog.svelte';
	import { isNumericColumn } from '$lib/format.js';

	const roomDetailCols = [
		{ key: 'code', label: 'Kode' },
		{ key: 'name', label: 'Nama' },
		{ key: 'space', label: 'Luas' },
		{ key: 'buildingName', label: 'Gedung' },
		{ key: 'building_code', label: 'Kode Gedung' }
	];

	let { data, form } = $props();
	const spaceIsNumeric = $derived(isNumericColumn(data.items, 'space'));

	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let qrDialogOpen = $state(false);
	let editItem = $state<Record<string, unknown>>({});
	let qrRoomId = $state(0);
	let qrRoomName = $state('');
	let searchValue = $state(data.search || '');
	let jumpValue = $state('');
	let detailDialogOpen = $state(false);
	let detailItem = $state<Record<string, unknown> | null>(null);
	function openDetail(item: Record<string, unknown>) {
		detailItem = item;
		detailDialogOpen = true;
	}

	const pageButtons = $derived.by(() => {
		const total = data.totalPages;
		const current = data.page;
		const maxVisible = 5;
		let start = Math.max(1, current - Math.floor(maxVisible / 2));
		let end = start + maxVisible - 1;
		if (end > total) {
			end = total;
			start = Math.max(1, end - maxVisible + 1);
		}
		const pages: number[] = [];
		for (let i = start; i <= end; i++) pages.push(i);
		return pages;
	});

	function handleJump() {
		const p = Number(jumpValue);
		if (p >= 1 && p <= data.totalPages) {
			goto(buildUrl({ page: p }));
		}
		jumpValue = '';
	}

	function buildUrl(params: Record<string, string | number>) {
		const url = new URL($page.url);
		for (const [key, val] of Object.entries(params)) {
			if (val) url.searchParams.set(key, String(val));
			else url.searchParams.delete(key);
		}
		return url.pathname + url.search;
	}

	function showQr(id: number, name: string) {
		qrRoomId = id;
		qrRoomName = name;
		qrDialogOpen = true;
	}
</script>

<div>
	<div class="mb-6 flex items-center justify-between gap-4">
		<div class="shrink-0">
			<h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight"><DoorOpen class="h-6 w-6" /> Ruangan</h1>
		</div>
		<div class="flex items-center gap-2" style="width: 50%; min-width: 450px;">
			<form onsubmit={(e) => { e.preventDefault(); goto(buildUrl({ search: searchValue, page: '' })); }} class="relative flex-1">
				<Input
					placeholder="Cari..."
					bind:value={searchValue}
					class="pr-16"
				/>
				{#if searchValue}
					<button type="button" onclick={() => { searchValue = ''; goto(buildUrl({ search: '', page: '' })); }} class="absolute right-9 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
						<X class="h-4 w-4" />
					</button>
				{/if}
				<button type="submit" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
					<Search class="h-4 w-4" />
				</button>
			</form>
			<div class="flex gap-2">
		<Dialog.Root bind:open={createDialogOpen}>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button {...props}>
						<Plus class="mr-1.5 h-4 w-4" />
						Tambah
					</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Tambah Ruangan</Dialog.Title>
				</Dialog.Header>
				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						return async ({ update, result }) => {
							await update();
							if (result.type === 'success') createDialogOpen = false;
						};
					}}
					class="space-y-3"
				>
					<div class="space-y-1.5">
						<Label for="name">Nama Ruangan</Label>
						<Input id="name" name="name" required placeholder="Nama ruangan" />
					</div>
					<div class="space-y-1.5">
						<Label for="space">Luas</Label>
						<Input id="space" name="space" placeholder="Luas ruangan" />
					</div>
					<div class="space-y-1.5">
						<Label for="building_code">Gedung</Label>
						<select name="building_code" id="building_code" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
							<option value="">-- Pilih Gedung --</option>
							{#each data.buildings as b}
								<option value={b.code}>{b.description}</option>
							{/each}
						</select>
					</div>
					<div class="flex justify-end gap-2 pt-3">
						<Button variant="outline" type="button" onclick={() => { createDialogOpen = false; }}>Batal</Button>
						<Button type="submit">Simpan</Button>
					</div>
				</form>
			</Dialog.Content>
		</Dialog.Root>
		</div>
		</div>
	</div>

	{#if form?.error}
		<Alert.Root variant="destructive" class="mb-4">
			<Alert.Description>{form.error}</Alert.Description>
		</Alert.Root>
	{/if}
	{#if form?.created || form?.updated || form?.deleted}
		<Alert.Root class="mb-4 border-emerald-200 bg-emerald-50 text-emerald-800">
			<Alert.Description>
				{form?.created ? 'Ruangan berhasil ditambahkan' : form?.updated ? 'Ruangan berhasil diperbarui' : 'Ruangan berhasil dihapus'}
			</Alert.Description>
		</Alert.Root>
	{/if}

	<div class="overflow-hidden rounded-xl border bg-card shadow-sm">
		<Table.Root>
			<Table.Header>
				<Table.Row class="bg-muted/40 hover:bg-muted/40">
					<Table.Head class="w-[60px] text-center font-semibold">No</Table.Head>
					<Table.Head class="font-semibold">Kode</Table.Head>
					<Table.Head class="font-semibold">Nama</Table.Head>
					<Table.Head class="font-semibold {spaceIsNumeric ? 'text-right' : ''}">Luas</Table.Head>
					<Table.Head class="font-semibold">Gedung</Table.Head>
					<Table.Head class="font-semibold">QR Code</Table.Head>
					<Table.Head class="w-[120px] text-center font-semibold">Aksi</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.items as item, i}
					<Table.Row class="cursor-pointer" onclick={() => openDetail(item)}>
						<Table.Cell class="text-center text-muted-foreground">{(data.page - 1) * data.pageSize + i + 1}</Table.Cell>
						<Table.Cell>
							<div class="min-w-[300px] max-w-[380px]">
								<CodeTooltip value={item.code as string | null | undefined} />
							</div>
						</Table.Cell>
						<Table.Cell class="font-medium">{item.name}</Table.Cell>
						<Table.Cell class={spaceIsNumeric ? 'text-right' : ''}>{item.space ?? '-'}</Table.Cell>
						<Table.Cell>{item.buildingName ?? '-'}</Table.Cell>
						<Table.Cell onclick={(e: MouseEvent) => e.stopPropagation()}>
							<Button variant="ghost" size="icon" onclick={() => showQr(Number(item.id), String(item.name))}>
								<QrCode class="h-4 w-4" />
							</Button>
						</Table.Cell>
						<Table.Cell onclick={(e: MouseEvent) => e.stopPropagation()}>
							<div class="flex justify-center gap-1">
								<Button variant="ghost" size="icon" onclick={() => { editItem = { ...item }; editDialogOpen = true; }}>
									<Pencil class="h-4 w-4" />
								</Button>
								<DeleteDialog id={item.id} message="Apakah Anda yakin ingin menghapus ruangan ini?" />
							</div>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={7} class="py-12 text-center text-muted-foreground">
							Belum ada ruangan.
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<DetailDialog bind:open={detailDialogOpen} title="Detail Ruangan" columns={roomDetailCols} item={detailItem} />

	<div class="mt-4 flex items-center justify-between">
		<p class="text-sm text-muted-foreground">
			Total Data: {data.total}{#if data.totalPages > 1}, Halaman {data.page} dari {data.totalPages}{/if}
		</p>
		{#if data.totalPages > 1}
			<div class="flex items-center gap-3">
				<div class="flex gap-1">
					<Button variant="outline" size="sm" href={buildUrl({ page: data.page - 1 })} disabled={data.page <= 1}>
						<ChevronLeft class="h-4 w-4" />
					</Button>
					{#each pageButtons as p}
						<Button variant={p === data.page ? 'default' : 'outline'} size="sm" href={buildUrl({ page: p })} class="w-9">
							{p}
						</Button>
					{/each}
					<Button variant="outline" size="sm" href={buildUrl({ page: data.page + 1 })} disabled={data.page >= data.totalPages}>
						<ChevronRight class="h-4 w-4" />
					</Button>
				</div>
				<form onsubmit={(e) => { e.preventDefault(); handleJump(); }} class="flex items-center gap-1.5">
					<span class="text-sm text-muted-foreground whitespace-nowrap">Jump to</span>
					<Input bind:value={jumpValue} class="h-8 w-16 text-center text-sm" placeholder="#" />
				</form>
			</div>
		{/if}
	</div>

	<!-- Edit Dialog -->
	<Dialog.Root bind:open={editDialogOpen}>
		<Dialog.Content>
			<Dialog.Header><Dialog.Title>Edit Ruangan</Dialog.Title></Dialog.Header>
			<form method="POST" action="?/update" use:enhance={() => { return async ({ update, result }) => { await update(); if (result.type === 'success') editDialogOpen = false; }; }} class="space-y-3">
				<input type="hidden" name="id" value={editItem.id} />
				<div class="space-y-1.5">
					<Label for="edit-name">Nama</Label>
					<Input id="edit-name" name="name" required value={String(editItem.name ?? '')} />
				</div>
				<div class="space-y-1.5">
					<Label for="edit-space">Luas</Label>
					<Input id="edit-space" name="space" value={String(editItem.space ?? '')} />
				</div>
				<div class="space-y-1.5">
					<Label for="edit-building_code">Gedung</Label>
					<select name="building_code" id="edit-building_code" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
						<option value="">-- Pilih Gedung --</option>
						{#each data.buildings as b}
							<option value={b.code} selected={b.code === editItem.building_code}>{b.description}</option>
						{/each}
					</select>
				</div>
				<div class="flex justify-end gap-2 pt-3">
					<Button variant="outline" type="button" onclick={() => { editDialogOpen = false; }}>Batal</Button>
					<Button type="submit">Simpan</Button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Root>

	<!-- QR Code Dialog -->
	<QrCodeDialog bind:open={qrDialogOpen} roomId={qrRoomId} roomName={qrRoomName} />
</div>
