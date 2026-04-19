<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/shadcn-ui/button/index.js';
	import * as Table from '$lib/components/shadcn-ui/table/index.js';
	import { Input } from '$lib/components/shadcn-ui/input/index.js';
	import { Search, X, ChevronLeft, ChevronRight, Wrench, Monitor, Building2, Landmark, Route, PackagePlus, PackageOpen, MapPin } from '@lucide/svelte';
	import CodeTooltip from '../../../app/components/CodeTooltip.svelte';
	import DetailDialog from '../../../app/components/DetailDialog.svelte';

	import { isNumericColumn, isCodeColumn, formatIDNumber } from '$lib/format.js';

	const tableIcons: Record<string, typeof Wrench> = {
		'peralatan-mesin': Wrench,
		'peralatan-lain': Monitor,
		'gedung-bangunan': Building2,
		'aset-tetap-lainnya': Landmark,
		'jalan-irigasi-jaringan': Route,
		'aset-ekstrakompt': PackagePlus,
		'aset-lain-lain': PackageOpen,
		'tanah': MapPin
	};

	let { data } = $props();
	const TableIcon = $derived(tableIcons[data.slug]);

	const tableCols = $derived.by(() => {
		const cols = data.tableDef.columns.filter((c: { showInTable?: boolean }) => c.showInTable !== false);
		const idx = cols.findIndex((c: { key: string }) => c.key === 'acquisitionValue');
		if (idx === -1) return cols;
		return [...cols.slice(0, idx), ...cols.slice(idx + 1), cols[idx]];
	});
	const allCols = $derived(data.tableDef.columns);
	const numericKeys = $derived(new Set(tableCols.filter((c: { key: string }) => isNumericColumn(data.items, c.key)).map((c: { key: string }) => c.key)));

	let detailDialogOpen = $state(false);
	let detailItem = $state<Record<string, unknown> | null>(null);
	function openDetail(item: Record<string, unknown>) {
		detailItem = item;
		detailDialogOpen = true;
	}

	const CENTERED_LABELS = new Set(['Status', 'Condition', 'Quantity']);
	function colAlign(col: { key: string; label: string }): string {
		if (CENTERED_LABELS.has(col.label)) return 'text-center';
		if (numericKeys.has(col.key)) return 'text-right';
		return '';
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

	function buildUrl(params: Record<string, string | number>) {
		const url = new URL($page.url);
		for (const [key, val] of Object.entries(params)) {
			if (val) url.searchParams.set(key, String(val));
			else url.searchParams.delete(key);
		}
		return url.pathname + url.search;
	}

	function handleJump() {
		const p = Number(jumpValue);
		if (p >= 1 && p <= data.totalPages) {
			goto(buildUrl({ page: p }));
		}
		jumpValue = '';
	}
</script>

<div class="mx-auto container px-4 py-8 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between gap-4">
		<div class="shrink-0">
			<h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight">{#if TableIcon}<TableIcon class="h-6 w-6" />{/if} {data.tableDef.label}</h1>
		</div>
		<form onsubmit={(e) => { e.preventDefault(); goto(buildUrl({ search: searchValue, page: '' })); }} class="relative flex-1 max-w-sm">
			<Input
				placeholder="Cari..."
				bind:value={searchValue}
				class="pr-16 bg-white"
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
	</div>

	<!-- Table -->
	<div class="overflow-hidden rounded-xl border bg-card shadow-sm">
		<div class="overflow-x-auto">
			<Table.Root>
				<Table.Header>
					<Table.Row class="bg-muted/80 hover:bg-muted">
						<Table.Head class="w-[60px] text-center font-semibold pt-4 pb-4">No</Table.Head>
						{#each tableCols as col}
							<Table.Head class="font-semibold {colAlign(col)}">{col.label}</Table.Head>
						{/each}
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
									{:else if col.key === 'acquisitionValue'}
										<div class="truncate">{formatIDNumber(item[col.key])}</div>
									{:else if col.key === 'description'}
										<div class="whitespace-normal">{item[col.key] ?? '-'}</div>
									{:else}
										<div class="truncate">{item[col.key] ?? '-'}</div>
									{/if}
								</Table.Cell>
							{/each}
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={tableCols.length + 1} class="py-12 text-center text-muted-foreground">
								Belum ada data.
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</div>

	<DetailDialog bind:open={detailDialogOpen} title="Detail {data.tableDef.label}" columns={allCols} item={detailItem} />

	<!-- Pagination -->
	<div class="mt-4 flex items-center justify-between">
		<p class="text-sm text-muted-foreground">
			Total Data: {data.total}{#if data.totalPages > 1}, Halaman {data.page} dari {data.totalPages}{/if}
		</p>
		{#if data.totalPages > 1}
			<div class="flex items-center gap-3">
				<div class="flex gap-1">
					<Button variant="outline" size="sm" href={buildUrl({ page: data.page - 1 })} disabled={data.page <= 1} class="bg-white">
						<ChevronLeft class="h-4 w-4" />
					</Button>
					{#each pageButtons as p}
						<Button variant={p === data.page ? 'default' : 'outline'} size="sm" href={buildUrl({ page: p })} class={`w-9 ${p === data.page ? '' : 'bg-white'}`}>
							{p}
						</Button>
					{/each}
					<Button variant="outline" size="sm" href={buildUrl({ page: data.page + 1 })} disabled={data.page >= data.totalPages} class="bg-white">
						<ChevronRight class="h-4 w-4" />
					</Button>
				</div>
				<form onsubmit={(e) => { e.preventDefault(); handleJump(); }} class="flex items-center gap-1.5 ">
					<span class="text-sm text-muted-foreground whitespace-nowrap">Jump to</span>
					<Input bind:value={jumpValue} class="h-8 w-16 text-center bg-white" placeholder="#" />
				</form>
			</div>
		{/if}
	</div>
</div>
