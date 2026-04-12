<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/shadcn-ui/button/index.js';
	import * as DropdownMenu from '$lib/components/shadcn-ui/dropdown-menu/index.js';
	import * as Avatar from '$lib/components/shadcn-ui/avatar/index.js';
	import type { User } from '$lib/types.js';
	import { Wrench, Monitor, Building2, Landmark, Route, PackagePlus, PackageOpen, MapPin, ChevronDown, DoorOpen } from '@lucide/svelte';
	import ScanMeDialog from './ScanMeDialog.svelte';

	const inventarisItems = [
		{ href: '/inventaris/tool-machine', label: 'Peralatan dan Mesin', icon: Wrench },
		{ href: '/inventaris/tool-software', label: 'Peralatan Lain', icon: Monitor },
		{ href: '/room', label: 'Ruang', icon: DoorOpen },
		{ href: '/inventaris/building', label: 'Gedung dan Bangunan', icon: Building2 },
		{ href: '/inventaris/permanent-asset', label: 'Aset Tetap Lainnya', icon: Landmark },
		{ href: '/inventaris/road', label: 'Jalan, Irigasi dan Jaringan', icon: Route },
		{ href: '/inventaris/extra-asset', label: 'Aset Ekstrakompt', icon: PackagePlus },
		{ href: '/inventaris/other-asset', label: 'Aset Lain-Lain', icon: PackageOpen },
		{ href: '/inventaris/land', label: 'Tanah', icon: MapPin }
	];

	let { user }: { user: User | null } = $props();

	let scanMeOpen = $state(false);

	function isActive(path: string): boolean {
		if (path === '/') return $page.url.pathname === '/';
		return $page.url.pathname.startsWith(path);
	}
</script>

<nav class="sticky top-0 z-50 border-b bg-gradient-to-r from-sky-500 to-sky-700 shadow-md">
	<div class="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 {isActive('/admin') ? '' : 'mx-auto max-w-7xl'}">
		<div class="flex items-center gap-8">
			<a href="/" class="flex items-center gap-2.5">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-xs font-bold text-white">
					IN
				</div>
				<span class="text-base font-semibold tracking-tight text-white">Inventaris</span>
			</a>
			{#if !isActive('/admin')}
			<div class="hidden items-center gap-1 sm:flex">
				<a
					href="/inspection"
					class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {isActive('/inspection')
						? 'bg-white/20 text-white'
						: 'text-white/70 hover:bg-white/10 hover:text-white'}"
				>
					Inspeksi
				</a>
				<button
					type="button"
					onclick={() => (scanMeOpen = true)}
					class="rounded-md px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
				>
					Scan Me
				</button>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<button
								{...props}
								class="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors {isActive('/inventaris')
									? 'bg-white/20 text-white'
									: 'text-white/70 hover:bg-white/10 hover:text-white'}"
							>
								Inventaris
								<ChevronDown class="h-3.5 w-3.5" />
							</button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="start" class="w-64">
						{#each inventarisItems as item}
							<DropdownMenu.Item>
								<a href={item.href} class="flex w-full items-center gap-2">
									<item.icon class="h-4 w-4" />
									{item.label}
								</a>
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
			{/if}
		</div>

		<div class="flex items-center gap-3">
			{#if user}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<button
								{...props}
								class="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
							>
								<Avatar.Root class="h-7 w-7">
									<Avatar.Fallback class="bg-white/20 text-[10px] font-semibold text-white">
										{user.username.slice(0, 2).toUpperCase()}
									</Avatar.Fallback>
								</Avatar.Root>
								<span class="hidden sm:inline">{user.username}</span>
							</button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="w-48">
						<DropdownMenu.Label class="font-normal">
							<div class="flex flex-col gap-1">
								<p class="text-sm font-medium">{user.username}</p>
								<p class="text-xs capitalize text-muted-foreground">{user.role}</p>
							</div>
						</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item>
							<a href="/admin" class="flex w-full items-center gap-2">
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"/></svg>
								Dashboard Admin
							</a>
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item>
							<form method="POST" action="/login?/logout" class="w-full">
								<button type="submit" class="flex w-full items-center gap-2 text-left">
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"/></svg>
									Logout
								</button>
							</form>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else}
				<Button size="sm" href="/login" class="bg-white/20 text-white hover:bg-white/30">Masuk</Button>
			{/if}
		</div>
	</div>
</nav>

<ScanMeDialog bind:open={scanMeOpen} />
