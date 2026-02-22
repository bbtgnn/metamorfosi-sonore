<script lang="ts">
	import type { Snippet } from 'svelte';

	import * as Popover from '$lib/shadcn/ui/popover/index.js';

	type Props = {
		trigger: Snippet<[{ props: Record<string, unknown> }]>;
		content: Snippet;
	};

	let { trigger, content }: Props = $props();
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			{@render trigger({ props })}
		{/snippet}
	</Popover.Trigger>

	<Popover.Content>{@render content()}</Popover.Content>
</Popover.Root>
