<script lang="ts">
	import * as Dialog from '$lib/components/shadcn-ui/dialog/index.js';
	import { page } from '$app/stores';

	let { open = $bindable(false), roomId, roomName }: { open: boolean; roomId: number; roomName: string } = $props();

	let qrDataUrl = $state('');

	async function generateQr(id: number) {
		if (!id) return;
		const origin = $page.url.origin;
		const url = `${origin}/inspection?room_id=${id}`;
		const QRCode = await import('qrcode');
		qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
	}

	$effect(() => {
		if (open && roomId) {
			generateQr(roomId);
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
				<p class="text-center text-xs text-muted-foreground break-all">
					{$page.url.origin}/inspection?room_id={roomId}
				</p>
			{:else}
				<p class="text-sm text-muted-foreground">Generating QR code...</p>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
