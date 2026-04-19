<script lang="ts">
	import * as Dialog from '$lib/components/shadcn-ui/dialog/index.js';
	import { page } from '$app/stores';

	let {
		open = $bindable(false),
		roomId,
		roomName,
		path = '/inspeksi'
	}: { open: boolean; roomId: number; roomName: string; path?: string } = $props();

	const qrUrl = $derived(`${$page.url.origin}${path}?room_id=${roomId}`);
	let qrDataUrl = $state('');

	async function generateQr(url: string) {
		if (!roomId) return;
		const QRCode = await import('qrcode');
		qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
	}

	$effect(() => {
		if (open && roomId) {
			generateQr(qrUrl);
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>QR Code: {roomName}</Dialog.Title>
			<Dialog.Description>Scan QR code ini untuk membuka halaman inspeksi ruangan.</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col items-center gap-4 py-4">
			{#if qrDataUrl}
				<img src={qrDataUrl} alt="QR Code for {roomName}" class="rounded-lg border" />
				<a
					href={qrUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="text-center text-xs text-muted-foreground break-all underline hover:text-foreground"
				>
					{qrUrl}
				</a>
			{:else}
				<p class="text-sm text-muted-foreground">Generating QR code...</p>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
