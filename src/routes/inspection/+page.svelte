<script lang="ts">
	import { Button } from "$lib/components/shadcn-ui/button/index.js";
	import * as Table from "$lib/components/shadcn-ui/table/index.js";
	import * as Dialog from "$lib/components/shadcn-ui/dialog/index.js";
	import { Badge } from "$lib/components/shadcn-ui/badge/index.js";
	import { Input } from "$lib/components/shadcn-ui/input/index.js";
	import { Label } from "$lib/components/shadcn-ui/label/index.js";
	import * as Select from "$lib/components/shadcn-ui/select/index.js";
	import { Image, ClipboardCheck } from "@lucide/svelte";
	import CodeTooltip from "../../app/components/CodeTooltip.svelte";
	import DetailDialog from "../../app/components/DetailDialog.svelte";

	let { data } = $props();

	let imageDialogOpen = $state(false);
	let imageUrl = $state<string | null>(null);
	let detailDialogOpen = $state(false);
	let detailItem = $state<Record<string, unknown> | null>(null);

	let filterDate = $state(data.filters.inspection_date ?? '');
	let filterRoom = $state(data.filters.room_id ?? '');
	let filterKondisi = $state(data.filters.kondisi ?? '');
	const kondisiOptions = [
		{ value: 'Baik', label: 'Baik' },
		{ value: 'Rusak Ringan', label: 'Rusak Ringan' },
		{ value: 'Rusak Berat', label: 'Rusak Berat' }
	];
	const filterDateLabel = $derived(filterDate || 'Semua');
	const filterRoomLabel = $derived(data.rooms.find((r) => String(r.id) === filterRoom)?.name ?? 'Semua');
	const filterKondisiLabel = $derived(kondisiOptions.find((k) => k.value === filterKondisi)?.label ?? 'Semua');
	const inspectionDetailCols = [
		{ key: "toolMachine_code", label: "Code" },
		{ key: "toolMachineName", label: "Name" },
		{ key: "description", label: "Description" },
		{ key: "brandType", label: "Brand/Type" },
		{ key: "sizeCC", label: "Ukuran" },
		{ key: "material", label: "Bahan" },
		{ key: "factoryNumber", label: "No. Seri Pabrik" },
		{ key: "acquisitionDate", label: "Tgl Perolehan" },
		{ key: "acquisitionValue", label: "Nilai Perolehan" },
		{ key: "currentValue", label: "Nilai Saat Ini" },
		{ key: "roomName", label: "Ruangan" },
		{ key: "inspectionDate", label: "Tanggal Inspeksi" },
		{ key: "condition", label: "Kondisi" },
		{ key: "remarks", label: "Keterangan" },
	];
	function openDetail(item: Record<string, unknown>) {
		detailItem = item;
		detailDialogOpen = true;
	}

	function buildUrl(overrides: Record<string, string | number>) {
		const params = new URLSearchParams();
		const filters = { ...data.filters, ...overrides };
		for (const [k, v] of Object.entries(filters)) {
			if (v) params.set(k, String(v));
		}
		return `/inspection?${params.toString()}`;
	}

	function conditionBadgeClass(condition: string | null) {
		switch (condition) {
			case "Baik":
				return "bg-emerald-100 text-emerald-700 border-emerald-200";
			case "Rusak Ringan":
				return "bg-amber-100 text-amber-700 border-amber-200";
			case "Rusak Berat":
				return "bg-red-100 text-red-700 border-red-200";
			default:
				return "";
		}
	}
</script>

<div class="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-6">
		<h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight">
			<ClipboardCheck class="h-6 w-6" /> Inspeksi
		</h1>
	</div>

	<!-- Filters -->
	<form class="mb-6 rounded-xl border bg-card p-4 shadow-sm">
		<div class="flex flex-wrap items-end gap-3">
			<div class="w-40">
				<Label for="inspection_date" class="mb-1.5 text-xs text-muted-foreground">Tanggal</Label>
				<Select.Root type="single" name="inspection_date" bind:value={filterDate}>
					<Select.Trigger id="inspection_date" class="w-full">{filterDateLabel}</Select.Trigger>
					<Select.Content>
						<Select.Item value="" label="Semua">Semua</Select.Item>
						{#each data.dates as date}
							<Select.Item value={date} label={date}>{date}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="w-44">
				<Label for="room_id" class="mb-1.5 text-xs text-muted-foreground">Ruang</Label>
				<Select.Root type="single" name="room_id" bind:value={filterRoom}>
					<Select.Trigger id="room_id" class="w-full">{filterRoomLabel}</Select.Trigger>
					<Select.Content>
						<Select.Item value="" label="Semua">Semua</Select.Item>
						{#each data.rooms as room}
							<Select.Item value={String(room.id)} label={room.name}>{room.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="w-36">
				<Label for="kondisi" class="mb-1.5 text-xs text-muted-foreground">Kondisi</Label>
				<Select.Root type="single" name="kondisi" bind:value={filterKondisi}>
					<Select.Trigger id="kondisi" class="w-full">{filterKondisiLabel}</Select.Trigger>
					<Select.Content>
						<Select.Item value="" label="Semua">Semua</Select.Item>
						{#each kondisiOptions as k}
							<Select.Item value={k.value} label={k.label}>{k.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="min-w-[150px] flex-1">
				<Label for="search" class="mb-1.5 text-xs text-muted-foreground">Cari</Label>
				<Input
					id="search"
					name="search"
					placeholder="Cari nama atau deskripsi..."
					value={data.filters.search}
				/>
			</div>
			<div class="flex gap-2">
				<Button type="submit" size="default">Filter</Button>
				<Button variant="ghost" size="default" href="/inspection">Reset</Button>
			</div>
		</div>
	</form>

	<!-- Table -->
	<div class="overflow-hidden rounded-xl border bg-card shadow-sm">
		<div class="overflow-x-auto">
			<Table.Root>
				<Table.Header>
					<Table.Row class="bg-muted/40 hover:bg-muted/40">
						<Table.Head class="w-12 text-center font-semibold pt-4 pb-4">No</Table.Head>
						<Table.Head class="font-semibold">Code</Table.Head>
						<Table.Head class="font-semibold">Name</Table.Head>
						<Table.Head class="font-semibold">Description</Table.Head>
						<Table.Head class="font-semibold">Brand/Type</Table.Head>
						<Table.Head class="font-semibold">Ruangan</Table.Head>
						<Table.Head class="font-semibold">Kondisi</Table.Head>
						<Table.Head class="font-semibold">Keterangan</Table.Head>
						<Table.Head class="font-semibold">Image</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.items as item, i}
						<Table.Row class="cursor-pointer" onclick={() => openDetail(item)}>
							<Table.Cell class="text-center text-muted-foreground"
								>{(data.page - 1) * 20 + i + 1}</Table.Cell
							>
							<Table.Cell>
								<CodeTooltip
									value={item.toolMachine_code as string | null | undefined}
								/>
							</Table.Cell>
							<Table.Cell class="truncate"
								>{item.toolMachineName ?? "-"}</Table.Cell
							>
							<Table.Cell class="truncate whitespace-normal">
								{item.description ?? "-"}
							</Table.Cell>
							<Table.Cell class="truncate">{item.brandType ?? "-"}</Table.Cell>
							<Table.Cell>{item.roomName ?? "-"}</Table.Cell>
							<Table.Cell>
								{#if item.condition}
									<Badge
										variant="outline"
										class={conditionBadgeClass(String(item.condition))}
										>{item.condition}</Badge
									>
								{:else}
									-
								{/if}
							</Table.Cell>
							<Table.Cell class="truncate">{item.remarks ?? "-"}</Table.Cell>
							<Table.Cell onclick={(e: MouseEvent) => e.stopPropagation()}>
								<Button
									variant="ghost"
									size="icon"
									onclick={() => {
										imageUrl = item.imgUrl ? String(item.imgUrl) : null;
										imageDialogOpen = true;
									}}
								>
									<Image class="h-4 w-4" />
								</Button>
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell
								colspan={9}
								class="py-12 text-center text-muted-foreground"
							>
								Belum ada data inspeksi.
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</div>

	<DetailDialog
		bind:open={detailDialogOpen}
		title="Detail Inspeksi"
		columns={inspectionDetailCols}
		item={detailItem}
	/>

	<div class="mt-4 flex items-center justify-between">
		<p class="text-sm text-muted-foreground">
			<span class="font-medium text-foreground">{data.total}</span> inspeksi ditemukan
		</p>
		{#if data.totalPages > 1}
			<div class="flex items-center gap-3">
				{#if data.page > 1}
					<Button
						variant="outline"
						size="default"
						href={buildUrl({ page: data.page - 1 })}
					>
						Sebelumnya
					</Button>
				{/if}
				<div class="flex items-center gap-1.5 text-sm">
					<span
						class="rounded-md bg-primary px-2.5 py-1 font-medium text-primary-foreground"
						>{data.page}</span
					>
					<span class="text-muted-foreground">dari {data.totalPages}</span>
				</div>
				{#if data.page < data.totalPages}
					<Button
						variant="outline"
						size="default"
						href={buildUrl({ page: data.page + 1 })}
					>
						Selanjutnya
					</Button>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Image Dialog (view only) -->
	<Dialog.Root bind:open={imageDialogOpen}>
		<Dialog.Content class="sm:max-w-md">
			<Dialog.Header>
				<Dialog.Title>Foto Inspeksi</Dialog.Title>
			</Dialog.Header>
			<div class="flex flex-col items-center py-4">
				{#if imageUrl}
					<img
						src={imageUrl}
						alt="Inspection"
						class="max-h-64 rounded-lg border object-contain"
					/>
				{:else}
					<div
						class="flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/30"
					>
						<p class="text-sm text-muted-foreground">Belum ada foto</p>
					</div>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Root>
</div>
