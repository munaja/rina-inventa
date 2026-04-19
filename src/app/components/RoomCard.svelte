<script lang="ts">
	import * as Card from '$lib/components/shadcn-ui/card/index.js';
	import * as ScrollArea from '$lib/components/shadcn-ui/scroll-area/index.js';
	import { formatRupiah, formatCompact } from '$lib/format.js';
	import type { RoomSummary } from '$lib/types.js';

	let { summary, inspectionDate }: { summary: RoomSummary; inspectionDate: string } = $props();

	type ViewMode = 'condition' | 'category';
	type MetricMode = 'count' | 'value';

	let viewMode = $state<ViewMode>('condition');
	let metricMode = $state<MetricMode>('count');
	let hoveredSegment = $state<{
		label: string;
		count: number;
		price: number;
		color: string;
		percent: string;
	} | null>(null);

	const PIE_R = 20;
	const PIE_SW = PIE_R * 2;
	const PIE_C = 2 * Math.PI * PIE_R;

	const CATEGORY_COLORS = [
		'#6366f1', '#8b5cf6', '#ec4899', '#f97316',
		'#14b8a6', '#06b6d4', '#84cc16', '#f43f5e',
		'#a855f7', '#eab308', '#0ea5e9', '#d946ef',
		'#22c55e', '#e11d48', '#2563eb', '#ca8a04',
		'#0d9488', '#c026d3', '#ea580c', '#4f46e5'
	];

	const CATEGORY_BG_CLASSES = [
		'bg-indigo-100 text-indigo-700',
		'bg-violet-100 text-violet-700',
		'bg-pink-100 text-pink-700',
		'bg-orange-100 text-orange-700',
		'bg-teal-100 text-teal-700',
		'bg-cyan-100 text-cyan-700',
		'bg-lime-100 text-lime-700',
		'bg-rose-100 text-rose-700',
		'bg-purple-100 text-purple-700',
		'bg-yellow-100 text-yellow-700',
		'bg-sky-100 text-sky-700',
		'bg-fuchsia-100 text-fuchsia-700',
		'bg-green-100 text-green-700',
		'bg-red-100 text-red-700',
		'bg-blue-100 text-blue-700',
		'bg-amber-100 text-amber-700',
		'bg-teal-100 text-teal-700',
		'bg-fuchsia-100 text-fuchsia-700',
		'bg-orange-100 text-orange-700',
		'bg-indigo-100 text-indigo-700'
	];

	const CATEGORY_HOVER_CLASSES = [
		'hover:bg-indigo-50',
		'hover:bg-violet-50',
		'hover:bg-pink-50',
		'hover:bg-orange-50',
		'hover:bg-teal-50',
		'hover:bg-cyan-50',
		'hover:bg-lime-50',
		'hover:bg-rose-50',
		'hover:bg-purple-50',
		'hover:bg-yellow-50',
		'hover:bg-sky-50',
		'hover:bg-fuchsia-50',
		'hover:bg-green-50',
		'hover:bg-red-50',
		'hover:bg-blue-50',
		'hover:bg-amber-50',
		'hover:bg-teal-50',
		'hover:bg-fuchsia-50',
		'hover:bg-orange-50',
		'hover:bg-indigo-50'
	];

	const baseUrl = $derived(
		`/inspeksi?room-id=${summary.roomId}&inspection-date=${inspectionDate}`
	);

	type Segment = {
		label: string;
		count: number;
		price: number;
		color: string;
		bgClass: string;
		hoverClass: string;
		href: string;
	};

	const conditionSegments = $derived<Segment[]>([
		{
			label: 'Baik',
			count: summary.baikCount,
			price: summary.baikPrice,
			color: '#10b981',
			bgClass: 'bg-emerald-100 text-emerald-700',
			hoverClass: 'hover:bg-emerald-50',
			href: `${baseUrl}&kondisi=Baik`
		},
		{
			label: 'Rusak Ringan',
			count: summary.rusakRinganCount,
			price: summary.rusakRinganPrice,
			color: '#fbbf24',
			bgClass: 'bg-amber-100 text-amber-700',
			hoverClass: 'hover:bg-amber-50',
			href: `${baseUrl}&kondisi=Rusak Ringan`
		},
		{
			label: 'Rusak Berat',
			count: summary.rusakBeratCount,
			price: summary.rusakBeratPrice,
			color: '#ef4444',
			bgClass: 'bg-red-100 text-red-700',
			hoverClass: 'hover:bg-red-50',
			href: `${baseUrl}&kondisi=Rusak Berat`
		}
	]);

	const categorySegments = $derived<Segment[]>(
		summary.categories.map((cat, idx) => ({
			label: cat.label,
			count: cat.count,
			price: cat.price,
			color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
			bgClass: CATEGORY_BG_CLASSES[idx % CATEGORY_BG_CLASSES.length],
			hoverClass: CATEGORY_HOVER_CLASSES[idx % CATEGORY_HOVER_CLASSES.length],
			href: `${baseUrl}&search=${encodeURIComponent(cat.label)}`
		}))
	);

	const segments = $derived(viewMode === 'condition' ? conditionSegments : categorySegments);
	const metricOf = (seg: Segment) => (metricMode === 'count' ? seg.count : seg.price);
	const segmentTotal = $derived(segments.reduce((s, seg) => s + metricOf(seg), 0));

	type Arc = Segment & { segLen: number; dashOffset: number; metric: number };
	const arcs = $derived.by<Arc[]>(() => {
		if (segmentTotal <= 0) return [];
		let cumulative = 0;
		return segments.map((seg) => {
			const metric = metricOf(seg);
			const segLen = (metric / segmentTotal) * PIE_C;
			const dashOffset = PIE_C * 0.25 - cumulative;
			cumulative += segLen;
			return { ...seg, segLen, dashOffset, metric };
		});
	});

	function showTooltip(seg: Segment) {
		const metric = metricOf(seg);
		const percent = segmentTotal > 0 ? ((metric / segmentTotal) * 100).toFixed(1) : '0.0';
		hoveredSegment = {
			label: seg.label,
			count: seg.count,
			price: seg.price,
			color: seg.color,
			percent
		};
	}

	function hideTooltip() {
		hoveredSegment = null;
	}
</script>

<Card.Root
	class="group relative overflow-hidden border border-border/60 bg-card shadow-sm transition-all duration-200 hover:border-border hover:shadow-md max-h-[640px] flex flex-col"
>
	<!-- Top accent bar -->
	<div class="h-1 w-full shrink-0 bg-gradient-to-r from-primary/80 via-primary/50 to-primary/20"></div>

	<Card.Header class="pb-3 shrink-0">
		<div class="flex items-start justify-between gap-2">
			<Card.Title class="text-sm font-semibold leading-snug">{summary.roomName}</Card.Title>
			<div class="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-sm font-bold text-primary">
				{summary.totalCount} | {formatRupiah(summary.totalPrice)}
			</div>
		</div>
	</Card.Header>

	<ScrollArea.Root class="min-h-0 flex-1">
		<Card.Content class="space-y-1.5 pb-4">
			<!-- View mode toggles -->
			{#if summary.totalCount > 0}
				<div class="mb-2 grid grid-cols-2 gap-2">
					<div class="flex gap-1 rounded-lg bg-muted/50 p-1">
						<button
							type="button"
							class="flex-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors {viewMode === 'condition' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
							onclick={() => (viewMode = 'condition')}
						>
							Kondisi
						</button>
						<button
							type="button"
							class="flex-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors {viewMode === 'category' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
							onclick={() => (viewMode = 'category')}
							disabled={summary.categories.length === 0}
						>
							Kategori
						</button>
					</div>
					<div class="flex gap-1 rounded-lg bg-muted/50 p-1">
						<button
							type="button"
							class="flex-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors {metricMode === 'count' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
							onclick={() => (metricMode = 'count')}
						>
							Jumlah
						</button>
						<button
							type="button"
							class="flex-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors {metricMode === 'value' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
							onclick={() => (metricMode = 'value')}
						>
							Nilai
						</button>
					</div>
				</div>
			{/if}

			<!-- Pie chart -->
			{#if segmentTotal > 0}
				<div class="relative mb-3 flex justify-center">
					<svg viewBox="0 0 100 100" class="h-72 w-72">
						<circle
							cx="50"
							cy="50"
							r={PIE_R}
							fill="none"
							stroke-width={PIE_SW}
							class="stroke-muted"
						/>
						{#each arcs as arc}
							{#if arc.metric > 0}
								<a href={arc.href} aria-label="Filter {arc.label}">
									<circle
										cx="50"
										cy="50"
										r={PIE_R}
										fill="none"
										stroke={arc.color}
										stroke-width={PIE_SW}
										stroke-dasharray="{arc.segLen} {PIE_C - arc.segLen}"
										stroke-dashoffset={arc.dashOffset}
										role="img"
										aria-label="{arc.label}: {arc.metric}"
										class="cursor-pointer transition-opacity hover:opacity-75"
										onmouseenter={() => showTooltip(arc)}
										onmouseleave={hideTooltip}
									/>
								</a>
							{/if}
						{/each}
					</svg>
					{#if hoveredSegment}
						<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
							<div class="rounded-lg bg-foreground px-3 py-2 text-center shadow-lg">
								<div class="flex items-center justify-center gap-1.5">
									<span class="h-2 w-2 rounded-full" style="background-color: {hoveredSegment.color}"></span>
									<span class="text-xs font-semibold text-background">{hoveredSegment.label}</span>
								</div>
								{#if metricMode === 'count'}
									<p class="mt-0.5 text-sm font-bold text-background">
										{hoveredSegment.count} ({hoveredSegment.percent}%)
									</p>
									<p class="text-xs text-background/70">{formatCompact(hoveredSegment.price)}</p>
								{:else}
									<p class="mt-0.5 text-sm font-bold text-background">
										{formatCompact(hoveredSegment.price)} ({hoveredSegment.percent}%)
									</p>
									<p class="text-xs text-background/70">{hoveredSegment.count} item</p>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Legend rows -->
			{#each segments as seg}
				{#if seg.count > 0 || seg.price > 0}
					<a
						href={seg.href}
						class="flex items-center justify-between rounded-md px-2.5 py-2 transition-colors {seg.hoverClass}"
					>
						<div class="flex min-w-0 items-center gap-2">
							<span class="h-2.5 w-2.5 shrink-0 rounded-full" style="background-color: {seg.color}"></span>
							<span class="truncate text-sm font-medium text-foreground/80">{seg.label}</span>
						</div>
						<div class="flex shrink-0 items-center gap-2">
							{#if metricMode === 'count'}
								<span class="text-xs text-muted-foreground">{formatCompact(seg.price)}</span>
								<span class="min-w-[1.75rem] rounded-md px-1.5 py-0.5 text-center text-xs font-semibold {seg.bgClass}">
									{seg.count}
								</span>
							{:else}
								<span class="text-xs text-muted-foreground">{seg.count} item</span>
								<span class="min-w-[1.75rem] rounded-md px-1.5 py-0.5 text-center text-xs font-semibold {seg.bgClass}">
									{formatCompact(seg.price)}
								</span>
							{/if}
						</div>
					</a>
				{/if}
			{/each}
		</Card.Content>
	</ScrollArea.Root>

	<div class="shrink-0 border-t bg-muted/30 px-5 py-2.5">
		<a
			href={baseUrl}
			class="flex items-center justify-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
		>
			Lihat semua inspeksi
			<svg class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
		</a>
	</div>
</Card.Root>
