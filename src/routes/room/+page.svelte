<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/shadcn-ui/button/index.js';
	import * as Table from '$lib/components/shadcn-ui/table/index.js';
	import { Input } from '$lib/components/shadcn-ui/input/index.js';
	import { Search, X, ChevronLeft, ChevronRight, DoorOpen } from '@lucide/svelte';
	import { isNumericColumn } from '$lib/format.js';

	let { data } = $props();
	const spaceIsNumeric = $derived(isNumericColumn(data.items, 'space'));

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

	function buildUrl(params: Record<string, string | number>) {
		const url = new URL($page.url);
		for (const [key, val] of Object.entries(params)) {
			if (val) url.searchParams.set(key, String(val));
			else url.searchParams.delete(key);
		}
		return url.pathname + url.search;
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-6 flex items-center justify-between gap-4">
		<div class="shrink-0">
			<h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight"><DoorOpen class="h-6 w-6" /> Ruangan</h1>
		</div>
		<form onsubmit={(e) => { e.preventDefault(); goto(buildUrl({ search: searchValue, page: '' })); }} class="relative w-72">
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
	</div>

	<div class="overflow-hidden rounded-xl border bg-card shadow-sm">
		<Table.Root>
			<Table.Header>
				<Table.Row class="bg-muted/40 hover:bg-muted/40">
					<Table.Head class="w-[60px] text-center font-semibold">No</Table.Head>
					<Table.Head class="font-semibold">Kode</Table.Head>
					<Table.Head class="font-semibold">Nama</Table.Head>
					<Table.Head class="font-semibold {spaceIsNumeric ? 'text-right' : ''}">Luas</Table.Head>
					<Table.Head class="font-semibold">Gedung</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.items as item, i}
					<Table.Row>
						<Table.Cell class="text-center text-muted-foreground">{(data.page - 1) * data.pageSize + i + 1}</Table.Cell>
						<Table.Cell>{item.code ?? '-'}</Table.Cell>
						<Table.Cell class="font-medium">{item.name}</Table.Cell>
						<Table.Cell class={spaceIsNumeric ? 'text-right' : ''}>{item.space ?? '-'}</Table.Cell>
						<Table.Cell>{item.buildingName ?? '-'}</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={5} class="py-12 text-center text-muted-foreground">
							Belum ada ruangan.
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

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
</div>
