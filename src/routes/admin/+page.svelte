<script lang="ts">
	import {
		Wrench,
		Monitor,
		Building2,
		DoorOpen,
		Landmark,
		Route,
		PackagePlus,
		PackageOpen,
		MapPin
	} from '@lucide/svelte';

	let { data } = $props();

	const cards: { key: keyof typeof data.counts; href: string; label: string; icon: typeof Wrench }[] = [
		{ key: 'toolMachine', href: '/admin/tool-machine', label: 'Peralatan dan Mesin', icon: Wrench },
		{ key: 'toolSoftware', href: '/admin/tool-software', label: 'Peralatan Lain', icon: Monitor },
		{ key: 'building', href: '/admin/building', label: 'Gedung dan Bangunan', icon: Building2 },
		{ key: 'room', href: '/admin/room', label: 'Ruangan', icon: DoorOpen },
		{ key: 'permanentAsset', href: '/admin/permanent-asset', label: 'Aset Tetap Lainnya', icon: Landmark },
		{ key: 'road', href: '/admin/road', label: 'Jalan, Irigasi dan Jaringan', icon: Route },
		{ key: 'extraAsset', href: '/admin/extra-asset', label: 'Aset Ekstrakompt', icon: PackagePlus },
		{ key: 'otherAsset', href: '/admin/other-asset', label: 'Aset Lain-Lain', icon: PackageOpen },
		{ key: 'land', href: '/admin/land', label: 'Tanah', icon: MapPin }
	];

	const numberFormatter = new Intl.NumberFormat('id-ID');
</script>

<div>
	<h1 class="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
	<p class="mt-2 text-sm text-muted-foreground">Selamat datang, {data.user.username}!</p>
</div>

<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
	{#each cards as card}
		<a
			href={card.href}
			class="group relative flex flex-col justify-between gap-6 overflow-hidden rounded-xl border bg-gradient-to-br from-card via-card to-muted/40 p-5 shadow-sm ring-1 ring-foreground/5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:ring-foreground/10"
		>
			<div
				class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-foreground/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			></div>

			<div class="flex items-start justify-between gap-3">
				<p class="text-sm font-medium text-muted-foreground">{card.label}</p>
				<div
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-foreground/70 transition-transform duration-300 group-hover:scale-110 group-hover:text-foreground"
				>
					<card.icon class="h-4.5 w-4.5" />
				</div>
			</div>

			<div>
				<p class="text-3xl font-bold tracking-tight tabular-nums">
					{numberFormatter.format(data.counts[card.key])}
				</p>
				<p class="mt-1 text-xs text-muted-foreground">Total data</p>
			</div>
		</a>
	{/each}
</div>
