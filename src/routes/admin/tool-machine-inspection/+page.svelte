<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/shadcn-ui/button/index.js';
	import * as Table from '$lib/components/shadcn-ui/table/index.js';
	import * as Alert from '$lib/components/shadcn-ui/alert/index.js';
	import * as Dialog from '$lib/components/shadcn-ui/dialog/index.js';
	import { Badge } from '$lib/components/shadcn-ui/badge/index.js';
	import { Input } from '$lib/components/shadcn-ui/input/index.js';
	import { Label } from '$lib/components/shadcn-ui/label/index.js';
	import { Plus, Upload, ChevronLeft, ChevronRight, Pencil, Trash2, Image, ClipboardCheck } from '@lucide/svelte';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import ImageDialog from '../../../app/components/ImageDialog.svelte';
	import DeleteDialog from '../../../app/components/DeleteDialog.svelte';

	let { data, form } = $props();

	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let uploadDialogOpen = $state(false);
	let uploading = $state(false);
	let imageDialogOpen = $state(false);
	let editItem = $state<Record<string, unknown>>({});
	let imageItem = $state<{ id: number; imgUrl: string | null }>({ id: 0, imgUrl: null });
	let searchValue = $state(data.search || '');

	function buildUrl(params: Record<string, string | number>) {
		const url = new URL($page.url);
		for (const [key, val] of Object.entries(params)) {
			if (val) url.searchParams.set(key, String(val));
			else url.searchParams.delete(key);
		}
		return url.pathname + url.search;
	}

	function conditionBadgeClass(condition: string | null) {
		switch (condition) {
			case 'Baik': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
			case 'Rusak Ringan': return 'bg-amber-100 text-amber-700 border-amber-200';
			case 'Rusak Berat': return 'bg-red-100 text-red-700 border-red-200';
			default: return '';
		}
	}
</script>

<div>
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight"><ClipboardCheck class="h-6 w-6" /> Inspeksi Peralatan dan Mesin</h1>
			<p class="mt-1 text-sm text-muted-foreground">{data.total} data</p>
		</div>
		<div class="flex gap-2">
			<Dialog.Root bind:open={createDialogOpen}>
				<Dialog.Trigger>
					{#snippet child({ props })}
						<Button {...props}><Plus class="mr-1.5 h-4 w-4" /> Tambah</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-lg">
					<Dialog.Header><Dialog.Title>Tambah Inspeksi</Dialog.Title></Dialog.Header>
					<form method="POST" action="?/create" use:enhance={() => { return async ({ update, result }) => { await update(); if (result.type === 'success') createDialogOpen = false; }; }} class="space-y-3">
						<div class="space-y-1.5">
							<Label for="create-room_id">Ruangan</Label>
							<select name="room_id" id="create-room_id" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
								<option value="">-- Pilih Ruangan --</option>
								{#each data.rooms as room}
									<option value={room.id}>{room.name}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-1.5"><Label for="create-code">Code</Label><Input id="create-code" name="toolMachine_code" /></div>
						<div class="space-y-1.5"><Label for="create-description">Description</Label><Input id="create-description" name="description" /></div>
						<div class="space-y-1.5"><Label for="create-brandType">Brand/Type</Label><Input id="create-brandType" name="brandType" /></div>
						<div class="space-y-1.5">
							<Label for="create-condition">Condition</Label>
							<select name="condition" id="create-condition" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
								<option value="">-- Kondisi --</option>
								<option value="Baik">Baik</option>
								<option value="Rusak Ringan">Rusak Ringan</option>
								<option value="Rusak Berat">Rusak Berat</option>
							</select>
						</div>
						<div class="space-y-1.5"><Label for="create-remarks">Remarks</Label><Input id="create-remarks" name="remarks" /></div>
						<div class="flex justify-end gap-2 pt-3">
							<Button variant="outline" type="button" onclick={() => { createDialogOpen = false; }}>Batal</Button>
							<Button type="submit">Simpan</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Root>

			<Dialog.Root
				open={uploadDialogOpen}
				onOpenChange={(v) => { if (!uploading) uploadDialogOpen = v; }}
			>
				<Dialog.Trigger>
					{#snippet child({ props })}
						<Button {...props} class="bg-cyan-500 text-white hover:bg-cyan-600"><Upload class="mr-1.5 h-4 w-4" /> Upload</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content
					showCloseButton={!uploading}
					onEscapeKeydown={(e) => { if (uploading) e.preventDefault(); }}
					onInteractOutside={(e) => { if (uploading) e.preventDefault(); }}
				>
					<Dialog.Header>
						<Dialog.Title>Upload Data Inspeksi</Dialog.Title>
						<Dialog.Description>Upload file .xlsx KIR (sheet pertama). Kode Gedung dan nama Ruang diambil dari header sheet.</Dialog.Description>
					</Dialog.Header>
					<form method="POST" action="?/upload" enctype="multipart/form-data" use:enhance={() => { uploading = true; return async ({ update, result }) => { await update(); uploading = false; if (result.type === 'success') uploadDialogOpen = false; }; }} class="space-y-4">
						<fieldset disabled={uploading} class="space-y-4">
							<div class="space-y-2">
								<Label for="upload-file">File Excel (.xlsx)</Label>
								<Input id="upload-file" name="file" type="file" accept=".xlsx,.xls" required />
							</div>
							{#if uploading}
								<div class="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
									<Loader2 class="h-4 w-4 animate-spin" />
									<span>Mengupload data, mohon tunggu...</span>
								</div>
							{/if}
							<div class="flex justify-end gap-2 pt-2">
								<Button variant="outline" type="button" onclick={() => { uploadDialogOpen = false; }}>Batal</Button>
								<Button type="submit">
									{#if uploading}
										<Loader2 class="mr-1.5 h-4 w-4 animate-spin" />
										Mengupload...
									{:else}
										Upload
									{/if}
								</Button>
							</div>
						</fieldset>
					</form>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	</div>

	{#if form?.error}
		<Alert.Root variant="destructive" class="mb-4"><Alert.Description>{form.error}</Alert.Description></Alert.Root>
	{/if}
	{#if form?.created || form?.updated || form?.deleted}
		<Alert.Root class="mb-4 border-emerald-200 bg-emerald-50 text-emerald-800">
			<Alert.Description>{form?.created ? 'Data berhasil ditambahkan' : form?.updated ? 'Data berhasil diperbarui' : 'Data berhasil dihapus'}</Alert.Description>
		</Alert.Root>
	{/if}
	{#if form?.uploaded}
		<Alert.Root class="mb-4 border-emerald-200 bg-emerald-50 text-emerald-800">
			<Alert.Description>Upload berhasil: {form.uploadCount} data diproses</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Filters -->
	<form class="mb-6 rounded-xl border bg-card p-4 shadow-sm" onsubmit={(e) => { e.preventDefault(); goto(buildUrl({ search: searchValue, inspection_date: (document.getElementById('filter-date') as HTMLSelectElement).value, 'room-id': (document.getElementById('filter-room') as HTMLSelectElement).value, condition: (document.getElementById('filter-condition') as HTMLSelectElement).value, page: '' })); }}>
		<div class="flex flex-wrap items-end gap-3">
			<div class="w-40">
				<label for="filter-date" class="mb-1.5 block text-xs font-medium text-muted-foreground">Tanggal</label>
				<select id="filter-date" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
					<option value="">Semua</option>
					{#each data.dates as date}
						<option value={date} selected={date === data.inspectionDate}>{date}</option>
					{/each}
				</select>
			</div>
			<div class="w-44">
				<label for="filter-room" class="mb-1.5 block text-xs font-medium text-muted-foreground">Ruangan</label>
				<select id="filter-room" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
					<option value="">Semua</option>
					{#each data.rooms as room}
						<option value={room.id} selected={String(room.id) === data.roomId}>{room.name}</option>
					{/each}
				</select>
			</div>
			<div class="w-36">
				<label for="filter-condition" class="mb-1.5 block text-xs font-medium text-muted-foreground">Kondisi</label>
				<select id="filter-condition" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
					<option value="">Semua</option>
					<option value="Baik" selected={data.condition === 'Baik'}>Baik</option>
					<option value="Rusak Ringan" selected={data.condition === 'Rusak Ringan'}>Rusak Ringan</option>
					<option value="Rusak Berat" selected={data.condition === 'Rusak Berat'}>Rusak Berat</option>
				</select>
			</div>
			<div class="min-w-[150px] flex-1">
				<label for="filter-search" class="mb-1.5 block text-xs font-medium text-muted-foreground">Cari</label>
				<Input id="filter-search" placeholder="Cari kode, deskripsi, brand..." bind:value={searchValue} />
			</div>
			<div class="flex gap-2">
				<Button type="submit">Filter</Button>
				<Button variant="ghost" href="/admin/tool-machine-inspection">Reset</Button>
			</div>
		</div>
	</form>

	<!-- Table -->
	<div class="overflow-hidden rounded-xl border bg-card shadow-sm">
		<div class="overflow-x-auto">
			<Table.Root>
				<Table.Header>
					<Table.Row class="bg-muted/40 hover:bg-muted/40">
						<Table.Head class="w-[60px] text-center font-semibold">No</Table.Head>
						<Table.Head class="font-semibold">Code</Table.Head>
						<Table.Head class="font-semibold">Name</Table.Head>
						<Table.Head class="font-semibold">Description</Table.Head>
						<Table.Head class="font-semibold">Brand/Type</Table.Head>
						<Table.Head class="font-semibold">Ruangan</Table.Head>
						<Table.Head class="text-center font-semibold">Kondisi</Table.Head>
						<Table.Head class="font-semibold">Image</Table.Head>
						<Table.Head class="w-[120px] text-center font-semibold">Aksi</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.items as item, i}
						<Table.Row>
							<Table.Cell class="text-center text-muted-foreground">{(data.page - 1) * data.pageSize + i + 1}</Table.Cell>
							<Table.Cell class="max-w-[120px] truncate">{item.toolMachine_code ?? '-'}</Table.Cell>
							<Table.Cell class="max-w-[200px] truncate">{item.toolMachineName ?? '-'}</Table.Cell>
							<Table.Cell class="max-w-[200px] truncate">{item.description ?? '-'}</Table.Cell>
							<Table.Cell class="max-w-[120px] truncate">{item.brandType ?? '-'}</Table.Cell>
							<Table.Cell>{item.roomName ?? '-'}</Table.Cell>
							<Table.Cell class="text-center">
								{#if item.condition}
									<Badge variant="outline" class={conditionBadgeClass(String(item.condition))}>{item.condition}</Badge>
								{:else}
									-
								{/if}
							</Table.Cell>
							<Table.Cell>
								<Button variant="ghost" size="icon" onclick={() => { imageItem = { id: Number(item.id), imgUrl: item.imgUrl ? String(item.imgUrl) : null }; imageDialogOpen = true; }}>
									<Image class="h-4 w-4" />
								</Button>
							</Table.Cell>
							<Table.Cell>
								<div class="flex justify-center gap-1">
									<Button variant="ghost" size="icon" onclick={() => { editItem = { ...item }; editDialogOpen = true; }}>
										<Pencil class="h-4 w-4" />
									</Button>
									<DeleteDialog id={item.id} message="Apakah Anda yakin ingin menghapus data inspeksi ini?" />
								</div>
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={9} class="py-12 text-center text-muted-foreground">Belum ada data.</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</div>

	{#if data.totalPages > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">Halaman {data.page} dari {data.totalPages}</p>
			<div class="flex gap-2">
				{#if data.page > 1}
					<Button variant="outline" size="sm" href={buildUrl({ page: data.page - 1 })}><ChevronLeft class="mr-1 h-4 w-4" /> Sebelumnya</Button>
				{/if}
				{#if data.page < data.totalPages}
					<Button variant="outline" size="sm" href={buildUrl({ page: data.page + 1 })}>Selanjutnya <ChevronRight class="ml-1 h-4 w-4" /></Button>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Edit Dialog -->
	<Dialog.Root bind:open={editDialogOpen}>
		<Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-lg">
			<Dialog.Header><Dialog.Title>Edit Inspeksi</Dialog.Title></Dialog.Header>
			<form method="POST" action="?/update" use:enhance={() => { return async ({ update, result }) => { await update(); if (result.type === 'success') editDialogOpen = false; }; }} class="space-y-3">
				<input type="hidden" name="id" value={editItem.id} />
				<div class="space-y-1.5">
					<Label for="edit-room_id">Ruangan</Label>
					<select name="room_id" id="edit-room_id" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
						<option value="">-- Pilih Ruangan --</option>
						{#each data.rooms as room}
							<option value={room.id} selected={room.id === editItem.room_id}>{room.name}</option>
						{/each}
					</select>
				</div>
				<div class="space-y-1.5"><Label for="edit-code">Code</Label><Input id="edit-code" name="toolMachine_code" value={String(editItem.toolMachine_code ?? '')} /></div>
				<div class="space-y-1.5"><Label for="edit-description">Description</Label><Input id="edit-description" name="description" value={String(editItem.description ?? '')} /></div>
				<div class="space-y-1.5"><Label for="edit-brandType">Brand/Type</Label><Input id="edit-brandType" name="brandType" value={String(editItem.brandType ?? '')} /></div>
				<div class="space-y-1.5">
					<Label for="edit-condition">Condition</Label>
					<select name="condition" id="edit-condition" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
						<option value="">-- Kondisi --</option>
						<option value="Baik" selected={editItem.condition === 'Baik'}>Baik</option>
						<option value="Rusak Ringan" selected={editItem.condition === 'Rusak Ringan'}>Rusak Ringan</option>
						<option value="Rusak Berat" selected={editItem.condition === 'Rusak Berat'}>Rusak Berat</option>
					</select>
				</div>
				<div class="space-y-1.5"><Label for="edit-remarks">Remarks</Label><Input id="edit-remarks" name="remarks" value={String(editItem.remarks ?? '')} /></div>
				<div class="flex justify-end gap-2 pt-3">
					<Button variant="outline" type="button" onclick={() => { editDialogOpen = false; }}>Batal</Button>
					<Button type="submit">Simpan</Button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Image Dialog -->
	<ImageDialog bind:open={imageDialogOpen} itemId={imageItem.id} imgUrl={imageItem.imgUrl} />
</div>
