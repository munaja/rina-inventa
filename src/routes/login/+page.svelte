<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/shadcn-ui/button/index.js';
	import * as Card from '$lib/components/shadcn-ui/card/index.js';
	import * as Alert from '$lib/components/shadcn-ui/alert/index.js';
	import { Input } from '$lib/components/shadcn-ui/input/index.js';
	import { Label } from '$lib/components/shadcn-ui/label/index.js';

	let { form } = $props();
</script>

<div class="flex min-h-[75vh] items-center justify-center px-4">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
				<span class="text-xl font-bold text-primary-foreground">IN</span>
			</div>
			<h1 class="text-2xl font-bold tracking-tight">Selamat Datang</h1>
			<p class="mt-1.5 text-sm text-muted-foreground">Masuk ke dashboard inventaris</p>
		</div>

		<Card.Root class="border-border/60 shadow-lg">
			<Card.Content class="pt-6">
				{#if form?.error}
					<Alert.Root variant="destructive" class="mb-4">
						<Alert.Description>{form.error}</Alert.Description>
					</Alert.Root>
				{/if}
				<form method="POST" action="?/login" use:enhance class="space-y-4">
					<div class="space-y-2">
						<Label for="username" class="text-sm">Username</Label>
						<Input
							id="username"
							name="username"
							type="text"
							required
							placeholder="Masukkan username"
							value={form?.username ?? ''}
							autocomplete="username"
							class="h-10"
						/>
					</div>
					<div class="space-y-2">
						<Label for="password" class="text-sm">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							required
							placeholder="Masukkan password"
							autocomplete="current-password"
							class="h-10"
						/>
					</div>
					<Button type="submit" class="h-10 w-full font-medium">Masuk</Button>
				</form>
			</Card.Content>
		</Card.Root>

		<p class="mt-6 text-center text-xs text-muted-foreground/60">
			Sistem Inventaris &copy; {new Date().getFullYear()}
		</p>
	</div>
</div>
