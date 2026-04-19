<script lang="ts">
	import RoomCard from '../app/components/RoomCard.svelte';
	import { Archive, CircleCheck, AlertTriangle, CircleX } from '@lucide/svelte';
	import { formatRupiah } from '$lib/format.js';

	let { data } = $props();

	const totalItems = $derived(data.summaries.reduce((a, s) => a + s.totalCount, 0));
	const totalPrice = $derived(data.summaries.reduce((a, s) => a + s.totalPrice, 0));
	const totalBaik = $derived(data.summaries.reduce((a, s) => a + s.baikCount, 0));
	const totalBaikPrice = $derived(data.summaries.reduce((a, s) => a + s.baikPrice, 0));
	const totalRusakRingan = $derived(data.summaries.reduce((a, s) => a + s.rusakRinganCount, 0));
	const totalRusakRinganPrice = $derived(data.summaries.reduce((a, s) => a + s.rusakRinganPrice, 0));
	const totalRusakBerat = $derived(data.summaries.reduce((a, s) => a + s.rusakBeratCount, 0));
	const totalRusakBeratPrice = $derived(data.summaries.reduce((a, s) => a + s.rusakBeratPrice, 0));
</script>

<!-- Hero section -->
<div class="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-primary/3">
	<div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.12),transparent)]"></div>
	<div class="relative mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
		<div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Dashboard Inventaris</h1>
			</div>

			{#if data.dates.length > 0}
				<form class="flex items-center gap-2.5">
					<label
						for="inspection_date"
						class="text-sm font-medium text-muted-foreground whitespace-nowrap"
					>
						Tanggal Inspeksi
					</label>
					<select
						id="inspection_date"
						name="inspection-date"
						class="w-56 rounded-lg border border-input bg-card px-3.5 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
						onchange={(e) => {
							(e.currentTarget as HTMLSelectElement).form?.submit();
						}}
					>
						{#each data.dates as d}
							<option value={d.date} selected={d.date === data.selectedDate}>{d.date}</option>
						{/each}
					</select>
				</form>
			{/if}
		</div>

		<!-- Summary stats -->
		{#if data.summaries.length > 0}
			<div class="mt-8 grid grid-cols-1 gap-3 font-heading md:grid-cols-2 lg:grid-cols-4">
				<a href="/inspection?inspection-date={data.selectedDate}" class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-800 p-5 shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30">
					<Archive class="absolute top-3 right-3 h-16 w-16 text-white/20 transition-all duration-300 group-hover:scale-110 group-hover:text-white/35" />
					<p class="text-sm font-medium uppercase tracking-wider text-primary-foreground/70 transition-colors duration-300 group-hover:text-white">Semua Item</p>
					<p class="mt-2 text-4xl font-bold text-primary-foreground">{totalItems.toLocaleString('id-ID')}</p>
					<p class="mt-1 text-base font-semibold text-primary-foreground/70">{formatRupiah(totalPrice)}</p>
				</a>
				<a href="/inspection?kondisi=Baik&inspection-date={data.selectedDate}" class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 p-5 shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-600/30">
					<CircleCheck class="absolute top-3 right-3 h-16 w-16 text-white/20 transition-all duration-300 group-hover:scale-110 group-hover:text-white/35" />
					<p class="text-sm font-medium uppercase tracking-wider text-white/70 transition-colors duration-300 group-hover:text-white">Baik</p>
					<p class="mt-2 text-4xl font-bold text-white">{totalBaik.toLocaleString('id-ID')}</p>
					<p class="mt-1 text-base font-semibold text-white/70">{formatRupiah(totalBaikPrice)}</p>
				</a>
				<a href="/inspection?kondisi=Rusak Ringan&inspection-date={data.selectedDate}" class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-5 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/30">
					<AlertTriangle class="absolute top-3 right-3 h-16 w-16 text-white/20 transition-all duration-300 group-hover:scale-110 group-hover:text-white/35" />
					<p class="text-sm font-medium uppercase tracking-wider text-white/70 transition-colors duration-300 group-hover:text-white">Rusak Ringan</p>
					<p class="mt-2 text-4xl font-bold text-white">{totalRusakRingan.toLocaleString('id-ID')}</p>
					<p class="mt-1 text-base font-semibold text-white/70">{formatRupiah(totalRusakRinganPrice)}</p>
				</a>
				<a href="/inspection?kondisi=Rusak Berat&inspection-date={data.selectedDate}" class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-red-800 p-5 shadow-lg shadow-red-600/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-600/30">
					<CircleX class="absolute top-3 right-3 h-16 w-16 text-white/20 transition-all duration-300 group-hover:scale-110 group-hover:text-white/35" />
					<p class="text-sm font-medium uppercase tracking-wider text-white/70 transition-colors duration-300 group-hover:text-white">Rusak Berat</p>
					<p class="mt-2 text-4xl font-bold text-white">{totalRusakBerat.toLocaleString('id-ID')}</p>
					<p class="mt-1 text-base font-semibold text-white/70">{formatRupiah(totalRusakBeratPrice)}</p>
				</a>
			</div>
		{/if}
	</div>
</div>

<!-- Room cards -->
<div class="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
	{#if data.summaries.length === 0}
		<div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-20">
			<Archive class="h-12 w-12 text-muted-foreground/40" />
			<p class="mt-4 text-base font-medium text-muted-foreground">Belum ada data inspeksi</p>
			<p class="mt-1 text-sm text-muted-foreground/70">Upload data melalui menu admin untuk memulai.</p>
		</div>
	{:else}
		<div class="mb-5 flex items-center justify-between">
			<h2 class="text-lg font-semibold">Per Ruangan</h2>
			<span class="text-xs text-muted-foreground">{data.summaries.length} ruangan</span>
		</div>
		<div class="grid gap-4 lg:grid-cols-2">
			{#each data.summaries as summary}
				<RoomCard {summary} inspectionDate={data.selectedDate} />
			{/each}
		</div>
	{/if}
</div>
