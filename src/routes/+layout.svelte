<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '../app/components/Navbar.svelte';
	import { Toaster } from '$lib/components/shadcn-ui/sonner/index.js';

	let { children, data } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col">
	<Navbar user={data.user} />
	<main class="flex-1">
		{@render children()}
	</main>
	<footer class="border-t bg-muted/30">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
			<p class="text-xs text-muted-foreground">
				&copy; {new Date().getFullYear()} Sistem Inventaris. Semua hak dilindungi.
			</p>
			<p class="text-xs text-muted-foreground/60">v1.0</p>
		</div>
	</footer>
</div>
<Toaster richColors />
