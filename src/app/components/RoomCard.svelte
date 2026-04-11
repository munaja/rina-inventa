<script lang="ts">
	import * as Card from '$lib/components/shadcn-ui/card/index.js';
	import * as ScrollArea from '$lib/components/shadcn-ui/scroll-area/index.js';
	import { formatRupiah, formatCompact } from '$lib/format.js';
	import type { RoomSummary } from '$lib/types.js';

	let { summary, inspectionDate }: { summary: RoomSummary; inspectionDate: string } = $props();

	let hoveredSegment = $state<{ label: string; count: number; price: number; color: string; percent: string } | null>(null);

	const PIE_R = 20;
	const PIE_SW = PIE_R * 2;
	const PIE_C = 2 * Math.PI * PIE_R;

	const baseUrl = $derived(
		`/inspection?room-id=${summary.roomId}&inspection-date=${inspectionDate}`
	);

	function showTooltip(label: string, count: number, price: number, color: string, total: number) {
		hoveredSegment = { label, count, price, color, percent: ((count / total) * 100).toFixed(1) };
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
			<!-- Condition pie chart -->
			{#if summary.totalCount > 0}
				{@const baikLen = (summary.baikCount / summary.totalCount) * PIE_C}
				{@const ringanLen = (summary.rusakRinganCount / summary.totalCount) * PIE_C}
				{@const beratLen = (summary.rusakBeratCount / summary.totalCount) * PIE_C}
				<div class="relative mb-3 flex justify-center">
					<svg viewBox="0 0 100 100" class="h-72 w-72">
						<circle cx="50" cy="50" r={PIE_R} fill="none" stroke-width={PIE_SW} class="stroke-muted" />
						{#if summary.baikCount > 0}
							<a href="{baseUrl}&kondisi=Baik" aria-label="Filter Baik">
								<circle
									cx="50" cy="50" r={PIE_R} fill="none"
									stroke="#10b981" stroke-width={PIE_SW}
									stroke-dasharray="{baikLen} {PIE_C - baikLen}"
									stroke-dashoffset={PIE_C * 0.25}
									role="img" aria-label="Baik: {summary.baikCount}"
									class="cursor-pointer transition-opacity hover:opacity-75"
									onmouseenter={() => showTooltip('Baik', summary.baikCount, summary.baikPrice, '#10b981', summary.totalCount)}
									onmouseleave={hideTooltip}
								/>
							</a>
						{/if}
						{#if summary.rusakRinganCount > 0}
							<a href="{baseUrl}&kondisi=Rusak Ringan" aria-label="Filter Rusak Ringan">
								<circle
									cx="50" cy="50" r={PIE_R} fill="none"
									stroke="#fbbf24" stroke-width={PIE_SW}
									stroke-dasharray="{ringanLen} {PIE_C - ringanLen}"
									stroke-dashoffset={PIE_C * 0.25 - baikLen}
									role="img" aria-label="Rusak Ringan: {summary.rusakRinganCount}"
									class="cursor-pointer transition-opacity hover:opacity-75"
									onmouseenter={() => showTooltip('Rusak Ringan', summary.rusakRinganCount, summary.rusakRinganPrice, '#fbbf24', summary.totalCount)}
									onmouseleave={hideTooltip}
								/>
							</a>
						{/if}
						{#if summary.rusakBeratCount > 0}
							<a href="{baseUrl}&kondisi=Rusak Berat" aria-label="Filter Rusak Berat">
								<circle
									cx="50" cy="50" r={PIE_R} fill="none"
									stroke="#ef4444" stroke-width={PIE_SW}
									stroke-dasharray="{beratLen} {PIE_C - beratLen}"
									stroke-dashoffset={PIE_C * 0.25 - baikLen - ringanLen}
									role="img" aria-label="Rusak Berat: {summary.rusakBeratCount}"
									class="cursor-pointer transition-opacity hover:opacity-75"
									onmouseenter={() => showTooltip('Rusak Berat', summary.rusakBeratCount, summary.rusakBeratPrice, '#ef4444', summary.totalCount)}
									onmouseleave={hideTooltip}
								/>
							</a>
						{/if}
					</svg>
					<!-- Chart center tooltip -->
					{#if hoveredSegment}
						<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
							<div class="rounded-lg bg-foreground px-3 py-2 text-center shadow-lg">
								<div class="flex items-center justify-center gap-1.5">
									<span class="h-2 w-2 rounded-full" style="background-color: {hoveredSegment.color}"></span>
									<span class="text-xs font-semibold text-background">{hoveredSegment.label}</span>
								</div>
								<p class="mt-0.5 text-sm font-bold text-background">{hoveredSegment.count} ({hoveredSegment.percent}%)</p>
								<p class="text-xs text-background/70">{formatCompact(hoveredSegment.price)}</p>
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<a
				href="{baseUrl}&kondisi=Baik"
				class="flex items-center justify-between rounded-md px-2.5 py-2 transition-colors hover:bg-emerald-50"
			>
				<div class="flex items-center gap-2">
					<span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
					<span class="text-sm font-medium text-foreground/80">Baik</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-xs text-muted-foreground">{formatCompact(summary.baikPrice)}</span>
					<span class="min-w-[1.75rem] rounded-md bg-emerald-100 px-1.5 py-0.5 text-center text-xs font-semibold text-emerald-700">{summary.baikCount}</span>
				</div>
			</a>

			<a
				href="{baseUrl}&kondisi=Rusak Ringan"
				class="flex items-center justify-between rounded-md px-2.5 py-2 transition-colors hover:bg-amber-50"
			>
				<div class="flex items-center gap-2">
					<span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
					<span class="text-sm font-medium text-foreground/80">Rusak Ringan</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-xs text-muted-foreground">{formatCompact(summary.rusakRinganPrice)}</span>
					<span class="min-w-[1.75rem] rounded-md bg-amber-100 px-1.5 py-0.5 text-center text-xs font-semibold text-amber-700">{summary.rusakRinganCount}</span>
				</div>
			</a>

			<a
				href="{baseUrl}&kondisi=Rusak Berat"
				class="flex items-center justify-between rounded-md px-2.5 py-2 transition-colors hover:bg-red-50"
			>
				<div class="flex items-center gap-2">
					<span class="h-2.5 w-2.5 rounded-full bg-red-500"></span>
					<span class="text-sm font-medium text-foreground/80">Rusak Berat</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-xs text-muted-foreground">{formatCompact(summary.rusakBeratPrice)}</span>
					<span class="min-w-[1.75rem] rounded-md bg-red-100 px-1.5 py-0.5 text-center text-xs font-semibold text-red-700">{summary.rusakBeratCount}</span>
				</div>
			</a>
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
