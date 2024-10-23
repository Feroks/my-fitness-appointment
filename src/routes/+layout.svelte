<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="dark h-dvh w-dvw">
	<div class="flex h-full w-full justify-center dark:bg-neutral-800 dark:text-gray-200">
		<div class="w-full p-5 lg:w-3/4">
			{@render children?.()}
		</div>
	</div>
</div>
