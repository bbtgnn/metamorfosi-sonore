<script module lang="ts">
	import type { PlayerWithEvents } from '$lib/player-with-events';

	type State = {
		player: PlayerWithEvents;
		poster?: paper.Project;
	};

	let state = $state<State>();

	export function setState(newState: State) {
		state = newState;
	}
</script>

<script lang="ts">
	import { ArrowLeftIcon, Download, PauseIcon, PlayIcon } from '@lucide/svelte';
	import Button from '$lib/shadcn/ui/button/button.svelte';

	let { children } = $props();
</script>

<div class="relative flex h-screen w-screen items-center justify-center overflow-hidden">
	<div class="absolute top-2 left-2">
		<Button variant="ghost" size="icon" href="/"><ArrowLeftIcon /></Button>
	</div>
	{@render children()}
	<div class="absolute right-2 bottom-2">
		<Button variant="ghost" size="icon" onclick={() => state?.player.start()}>
			<PlayIcon />
		</Button>
		<Button variant="ghost" size="icon" onclick={() => state?.player.pause()}>
			<PauseIcon />
		</Button>
		<Button
			disabled={!state?.poster}
			variant="ghost"
			size="icon"
			onclick={() => state?.poster?.exportSVG()}
		>
			<Download />
		</Button>
	</div>
</div>
