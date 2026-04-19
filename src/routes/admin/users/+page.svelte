<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/shadcn-ui/button/index.js';
	import * as Table from '$lib/components/shadcn-ui/table/index.js';
	import * as Alert from '$lib/components/shadcn-ui/alert/index.js';
	import * as Dialog from '$lib/components/shadcn-ui/dialog/index.js';
	import * as Avatar from '$lib/components/shadcn-ui/avatar/index.js';
	import { Badge } from '$lib/components/shadcn-ui/badge/index.js';
	import { Input } from '$lib/components/shadcn-ui/input/index.js';
	import { Label } from '$lib/components/shadcn-ui/label/index.js';
	import * as Select from '$lib/components/shadcn-ui/select/index.js';
	import { Plus, KeyRound, Users } from '@lucide/svelte';
	import DeleteDialog from '../../../app/components/DeleteDialog.svelte';

	let { data, form } = $props();
	let createDialogOpen = $state(false);
	let resetDialogOpen = $state(false);
	let resetUserId = $state(0);
	let resetUsername = $state('');
	let createRole = $state('operator');
	const roleOptions = [
		{ value: 'operator', label: 'Operator' },
		{ value: 'admin', label: 'Admin' }
	];
	const createRoleLabel = $derived(roleOptions.find((o) => o.value === createRole)?.label ?? 'Pilih role');
</script>

<div>
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight"><Users class="h-6 w-6" /> Pengguna</h1>
			<p class="mt-1 text-sm text-muted-foreground">Kelola akun pengguna.</p>
		</div>
		<Dialog.Root bind:open={createDialogOpen}>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button {...props}><Plus class="mr-1.5 h-4 w-4" /> Tambah Pengguna</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header><Dialog.Title>Tambah Pengguna</Dialog.Title></Dialog.Header>
				<form method="POST" action="?/create" use:enhance={() => { return async ({ update, result }) => { await update(); if (result.type === 'success') createDialogOpen = false; }; }} class="space-y-3">
					<div class="space-y-1.5">
						<Label for="username">Username</Label>
						<Input id="username" name="username" required />
					</div>
					<div class="space-y-1.5">
						<Label for="password">Password</Label>
						<Input id="password" name="password" type="password" required minlength={6} />
					</div>
					<div class="space-y-1.5">
						<Label for="role">Role</Label>
						<Select.Root type="single" name="role" bind:value={createRole}>
							<Select.Trigger id="role" class="w-full">{createRoleLabel}</Select.Trigger>
							<Select.Content>
								{#each roleOptions as o}
									<Select.Item value={o.value} label={o.label}>{o.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
					<div class="flex justify-end gap-2 pt-3">
						<Button variant="outline" type="button" onclick={() => { createDialogOpen = false; }}>Batal</Button>
						<Button type="submit">Simpan</Button>
					</div>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	{#if form?.error}
		<Alert.Root variant="destructive" class="mb-4"><Alert.Description>{form.error}</Alert.Description></Alert.Root>
	{/if}
	{#if form?.created}
		<Alert.Root class="mb-4 border-emerald-200 bg-emerald-50 text-emerald-800"><Alert.Description>Pengguna berhasil ditambahkan</Alert.Description></Alert.Root>
	{/if}
	{#if form?.passwordReset}
		<Alert.Root class="mb-4 border-emerald-200 bg-emerald-50 text-emerald-800"><Alert.Description>Password berhasil direset</Alert.Description></Alert.Root>
	{/if}

	<div class="overflow-hidden rounded-xl border bg-card shadow-sm">
		<Table.Root>
			<Table.Header>
				<Table.Row class="bg-muted/40 hover:bg-muted/40">
					<Table.Head class="w-[60px] text-center font-semibold">No</Table.Head>
					<Table.Head class="font-semibold">Pengguna</Table.Head>
					<Table.Head class="font-semibold">Role</Table.Head>
					<Table.Head class="font-semibold">Dibuat</Table.Head>
					<Table.Head class="w-[160px] text-center font-semibold">Aksi</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.users as user, i}
					<Table.Row>
						<Table.Cell class="text-center text-muted-foreground">{i + 1}</Table.Cell>
						<Table.Cell>
							<div class="flex items-center gap-3">
								<Avatar.Root class="h-8 w-8">
									<Avatar.Fallback class="bg-primary text-xs font-semibold text-primary-foreground">
										{user.username.slice(0, 2).toUpperCase()}
									</Avatar.Fallback>
								</Avatar.Root>
								<span class="font-medium">{user.username}</span>
							</div>
						</Table.Cell>
						<Table.Cell>
							<Badge variant={user.role === 'admin' ? 'default' : 'secondary'} class="capitalize">{user.role}</Badge>
						</Table.Cell>
						<Table.Cell class="text-sm text-muted-foreground">{user.createdAt}</Table.Cell>
						<Table.Cell>
							<div class="flex justify-center gap-1">
								<Button variant="ghost" size="icon" onclick={() => { resetUserId = user.id; resetUsername = user.username; resetDialogOpen = true; }}>
									<KeyRound class="h-4 w-4" />
								</Button>
								<DeleteDialog id={user.id} message="Apakah Anda yakin ingin menghapus pengguna ini?" />
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<Dialog.Root bind:open={resetDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Reset Password</Dialog.Title>
				<Dialog.Description>Reset password untuk {resetUsername}</Dialog.Description>
			</Dialog.Header>
			<form method="POST" action="?/resetPassword" use:enhance={() => { return async ({ update, result }) => { await update(); if (result.type === 'success') resetDialogOpen = false; }; }} class="space-y-3">
				<input type="hidden" name="id" value={resetUserId} />
				<div class="space-y-1.5">
					<Label for="new-password">Password Baru</Label>
					<Input id="new-password" name="password" type="password" required minlength={6} />
				</div>
				<div class="flex justify-end gap-2 pt-3">
					<Button variant="outline" type="button" onclick={() => { resetDialogOpen = false; }}>Batal</Button>
					<Button type="submit">Reset Password</Button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
