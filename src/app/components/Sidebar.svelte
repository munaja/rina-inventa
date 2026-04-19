<script lang="ts">
	import { page } from '$app/stores';
	import * as Avatar from '$lib/components/shadcn-ui/avatar/index.js';
	import { Separator } from '$lib/components/shadcn-ui/separator/index.js';
	import type { User } from '$lib/types.js';
	import {
		ClipboardCheck,
		Wrench,
		Monitor,
		Building2,
		Landmark,
		Route,
		PackagePlus,
		PackageOpen,
		MapPin,
		DoorOpen,
		Users,
		Home,
		LayoutDashboard
	} from '@lucide/svelte';

	let { user }: { user: User } = $props();

	interface MenuGroup {
		label: string;
		items: MenuItem[];
	}

	interface MenuItem {
		href: string;
		label: string;
		icon: typeof ClipboardCheck;
		adminOnly?: boolean;
	}

	const menuGroups: MenuGroup[] = [
		{
			label: 'Utama',
			items: [
				{ href: '/admin/tool-machine-inspection', label: 'Inspeksi', icon: ClipboardCheck }
			]
		},
		{
			label: 'Source',
			items: [
				{ href: '/admin/tool-machine', label: 'Peralatan dan Mesin', icon: Wrench },
				{ href: '/admin/tool-software', label: 'Peralatan Lain', icon: Monitor },
				{ href: '/admin/building', label: 'Gedung dan Bangunan', icon: Building2 },
				{ href: '/admin/room', label: 'Ruangan', icon: DoorOpen },
				{ href: '/admin/permanent-asset', label: 'Aset Tetap Lainnya', icon: Landmark },
				{ href: '/admin/road', label: 'Jalan, Irigasi dan Jaringan', icon: Route },
				{ href: '/admin/extra-asset', label: 'Aset Ekstrakompt', icon: PackagePlus },
				{ href: '/admin/other-asset', label: 'Aset Lain-Lain', icon: PackageOpen },
				{ href: '/admin/land', label: 'Tanah', icon: MapPin }
			]
		}
	];

	const topItems: MenuItem[] = [
		{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }
	];

	const bottomItems: MenuItem[] = [
		{ href: '/admin/users', label: 'Pengguna', icon: Users, adminOnly: true }
	];

	function isActive(href: string, exact = false): boolean {
		const path = $page.url.pathname;
		if (exact) return path === href;
		return path === href || path.startsWith(href + '/');
	}
</script>

<aside class="hidden w-64 shrink-0 border-r bg-sidebar md:block">
	<div class="flex h-full flex-col">
		<!-- User section -->
		<div class="flex items-center gap-3 border-b px-4 py-4">
			<Avatar.Root class="h-9 w-9">
				<Avatar.Fallback class="bg-primary text-xs font-semibold text-primary-foreground">
					{user.username.slice(0, 2).toUpperCase()}
				</Avatar.Fallback>
			</Avatar.Root>
			<div class="flex-1 overflow-hidden">
				<p class="truncate text-sm font-semibold">{user.username}</p>
				<p class="text-xs capitalize text-muted-foreground">{user.role}</p>
			</div>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 overflow-y-auto px-3 py-4">
			{#each topItems as item}
				<a
					href={item.href}
					class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all {isActive(item.href, true)
						? 'bg-primary text-primary-foreground shadow-sm'
						: 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}"
				>
					<item.icon class="h-4 w-4" />
					{item.label}
				</a>
			{/each}

			{#each menuGroups as group}
				<Separator class="my-3" />
				<p class="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
					{group.label}
				</p>
				{#each group.items as item}
					<a
						href={item.href}
						class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all {isActive(item.href)
							? 'bg-primary text-primary-foreground shadow-sm'
							: 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}"
					>
						<item.icon class="h-4 w-4" />
						{item.label}
					</a>
				{/each}
			{/each}

			<Separator class="my-3" />

			{#each bottomItems as item}
				{#if !item.adminOnly || user.role === 'admin'}
					<a
						href={item.href}
						class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all {isActive(item.href)
							? 'bg-primary text-primary-foreground shadow-sm'
							: 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}"
					>
						<item.icon class="h-4 w-4" />
						{item.label}
					</a>
				{/if}
			{/each}
		</nav>

		<!-- Footer -->
		<div class="border-t px-4 py-3">
			<a
				href="/"
				class="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
			>
				<Home class="h-3.5 w-3.5" />
				Kembali ke Beranda
			</a>
		</div>
	</div>
</aside>
