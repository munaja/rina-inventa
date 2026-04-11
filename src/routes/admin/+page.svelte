<script lang="ts">
	let { data } = $props();
</script>

<div>
	<h1 class="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
	<p class="mt-2 text-sm text-muted-foreground">Selamat datang, {data.user.username}!</p>
</div>
