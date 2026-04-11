<script lang="ts">
	import Sidebar from '../../app/components/Sidebar.svelte';

	let { children, data } = $props();
</script>

<div class="flex flex-1">
	<Sidebar user={data.user} />
	<div class="flex-1 overflow-auto bg-background">
		<div class="mx-auto px-6 py-8">
			{@render children()}
		</div>
	</div>
</div>
