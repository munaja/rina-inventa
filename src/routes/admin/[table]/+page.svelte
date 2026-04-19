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
	import { Plus, Upload, Search, X, ChevronLeft, ChevronRight, Pencil, Wrench, Monitor, Building2, Landmark, Route, PackagePlus, PackageOpen, MapPin } from '@lucide/svelte';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import DeleteDialog from '../../../app/components/DeleteDialog.svelte';
	import CodeTooltip from '../../../app/components/CodeTooltip.svelte';
	import DetailDialog from '../../../app/components/DetailDialog.svelte';
	import { isNumericColumn, isCodeColumn } from '$lib/format.js';

	const tableIcons: Record<string, typeof Wrench> = {
		'tool-machine': Wrench,
		'tool-software': Monitor,
		'building': Building2,
		'permanent-asset': Landmark,
		'road': Route,
		'extra-asset': PackagePlus,
		'other-asset': PackageOpen,
		'land': MapPin
	};

	let { data, form } = $props();
	const TableIcon = $derived(tableIcons[data.slug]);

	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let uploadDialogOpen = $state(false);
	let uploading = $state(false);
	let editItem = $state<Record<string, unknown>>({});
	let detailDialogOpen = $state(false);
	let detailItem = $state<Record<string, unknown> | null>(null);

	const tableCols = $derived(data.tableDef.columns.filter((c: { showInTable?: boolean }) => c.showInTable !== false));
	const allCols = $derived(data.tableDef.columns);
	const numericKeys = $derived(new Set(tableCols.filter((c: { key: string }) => isNumericColumn(data.items, c.key)).map((c: { key: string }) => c.key)));

	const CENTERED_LABELS = new Set(['Status', 'Condition', 'Quantity']);
	function isCentered(label: string): boolean {
		return CENTERED_LABELS.has(label);
	}
	function colAlign(col: { key: string; label: string }): string {
		if (isCentered(col.label)) return 'text-center';
		if (numericKeys.has(col.key)) return 'text-right';
		return '';
	}

	function buildUrl(params: Record<string, string | number>) {
		const url = new URL($page.url);
		for (const [key, val] of Object.entries(params)) {
			if (val) url.searchParams.set(key, String(val));
			else url.searchParams.delete(key);
		}
		return url.pathname + url.search;
	}

	function openEdit(item: Record<string, unknown>) {
		editItem = { ...item };
		editDialogOpen = true;
	}

	function openDetail(item: Record<string, unknown>) {
		detailItem = item;
		detailDialogOpen = true;
	}

	let searchValue = $state(data.search || '');
	let jumpValue = $state('');

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
</script>

<div>
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between gap-4">
		<div class="shrink-0">
			<h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight">{#if TableIcon}<TableIcon class="h-6 w-6" />{/if} {data.tableDef.label}</h1>
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
				<Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-lg">
					<Dialog.Header>
						<Dialog.Title>Tambah {data.tableDef.label}</Dialog.Title>
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
						{#each allCols as col}
							<div class="space-y-1.5">
								<Label for="create-{col.key}" class="text-sm">{col.label}</Label>
								<Input id="create-{col.key}" name={col.key} placeholder={col.label} />
							</div>
						{/each}
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
						<Button {...props} class="bg-cyan-500 text-white hover:bg-cyan-600">
							<Upload class="mr-1.5 h-4 w-4" />
							Upload
						</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content
					showCloseButton={!uploading}
					onEscapeKeydown={(e) => { if (uploading) e.preventDefault(); }}
					onInteractOutside={(e) => { if (uploading) e.preventDefault(); }}
				>
					<Dialog.Header>
						<Dialog.Title>Upload Data</Dialog.Title>
						<Dialog.Description>Upload file .xlsx atau gunakan file sumber bawaan.</Dialog.Description>
					</Dialog.Header>
					<form
						method="POST"
						action="?/upload"
						enctype="multipart/form-data"
						use:enhance={() => {
							uploading = true;
							return async ({ update, result }) => {
								await update();
								uploading = false;
								if (result.type === 'success') uploadDialogOpen = false;
							};
						}}
						class="space-y-4"
					>
						<fieldset disabled={uploading} class="space-y-4">
							<div class="space-y-2">
								<Label for="upload-file">File Excel (.xlsx)</Label>
								<Input id="upload-file" name="file" type="file" accept=".xlsx,.xls" />
								<p class="text-xs text-muted-foreground">Kosongkan untuk menggunakan file sumber bawaan.</p>
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
	</div>

	<!-- Alerts -->
	{#if form?.error}
		<Alert.Root variant="destructive" class="mb-4">
			<Alert.Description>{form.error}</Alert.Description>
		</Alert.Root>
	{/if}
	{#if form?.created}
		<Alert.Root class="mb-4 border-emerald-200 bg-emerald-50 text-emerald-800">
			<Alert.Description>Data berhasil ditambahkan</Alert.Description>
		</Alert.Root>
	{/if}
	{#if form?.updated}
		<Alert.Root class="mb-4 border-emerald-200 bg-emerald-50 text-emerald-800">
			<Alert.Description>Data berhasil diperbarui</Alert.Description>
		</Alert.Root>
	{/if}
	{#if form?.deleted}
		<Alert.Root class="mb-4 border-emerald-200 bg-emerald-50 text-emerald-800">
			<Alert.Description>Data berhasil dihapus</Alert.Description>
		</Alert.Root>
	{/if}
	{#if form?.uploaded}
		<Alert.Root class="mb-4 border-emerald-200 bg-emerald-50 text-emerald-800">
			<Alert.Description>Upload berhasil: {form.uploadCount} data diproses</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Table -->
	<div class="overflow-hidden rounded-xl border bg-card shadow-sm p-2">
		<div class="overflow-x-auto">
			<Table.Root>
				<Table.Header>
					<Table.Row class="bg-muted/40 hover:bg-muted/40">
						<Table.Head class="w-[60px] text-center font-semibold">No</Table.Head>
						{#each tableCols as col}
							<Table.Head class="font-semibold {colAlign(col)}">{col.label}</Table.Head>
						{/each}
						<Table.Head class="w-[120px] text-center font-semibold">Aksi</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.items as item, i}
						<Table.Row class="cursor-pointer" onclick={() => openDetail(item)}>
							<Table.Cell class="text-center text-muted-foreground">{(data.page - 1) * data.pageSize + i + 1}</Table.Cell>
							{#each tableCols as col}
								<Table.Cell class="max-w-[200px] {colAlign(col)}">
									{#if isCodeColumn(col.key)}
										<div class="min-w-[300px] max-w-[380px]">
											<CodeTooltip value={item[col.key] as string | number | null | undefined} />
										</div>
									{:else if col.key === 'description'}
										<div class="whitespace-normal">{item[col.key] ?? '-'}</div>
									{:else}
										<div class="truncate">{item[col.key] ?? '-'}</div>
									{/if}
								</Table.Cell>
							{/each}
							<Table.Cell onclick={(e: MouseEvent) => e.stopPropagation()}>
								<div class="flex justify-center gap-1">
									<Button variant="ghost" size="icon" onclick={() => openEdit(item)}>
										<Pencil class="h-4 w-4" />
									</Button>
									<DeleteDialog id={item.id} message="Apakah Anda yakin ingin menghapus data ini?" />
								</div>
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={tableCols.length + 2} class="py-12 text-center text-muted-foreground">
								Belum ada data.
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</div>

	<!-- Pagination -->
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

	<!-- Detail Dialog -->
	<DetailDialog bind:open={detailDialogOpen} title="Detail {data.tableDef.label}" columns={allCols} item={detailItem} />

	<!-- Edit Dialog -->
	<Dialog.Root bind:open={editDialogOpen}>
		<Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-lg">
			<Dialog.Header>
				<Dialog.Title>Edit {data.tableDef.label}</Dialog.Title>
			</Dialog.Header>
			<form
				method="POST"
				action="?/update"
				use:enhance={() => {
					return async ({ update, result }) => {
						await update();
						if (result.type === 'success') editDialogOpen = false;
					};
				}}
				class="space-y-3"
			>
				<input type="hidden" name="id" value={editItem.id} />
				{#each allCols as col}
					<div class="space-y-1.5">
						<Label for="edit-{col.key}" class="text-sm">{col.label}</Label>
						<Input
							id="edit-{col.key}"
							name={col.key}
							value={String(editItem[col.key] ?? '')}
							placeholder={col.label}
						/>
					</div>
				{/each}
				<div class="flex justify-end gap-2 pt-3">
					<Button variant="outline" type="button" onclick={() => { editDialogOpen = false; }}>Batal</Button>
					<Button type="submit">Simpan</Button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
