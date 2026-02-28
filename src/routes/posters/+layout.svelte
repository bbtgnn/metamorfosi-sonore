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
	import { Download, PauseIcon, PlayIcon } from '@lucide/svelte';
	import {} from '$app/navigation';
	import { resolve } from '$app/paths';
	import { NavigationHistory } from '$lib';
	import Button from '$lib/shadcn/ui/button/button.svelte';
	import { fly } from 'svelte/transition';

	let { children } = $props();

	//

	function downloadPoster() {
		if (!state?.poster) return;
		const svg = state.poster.exportSVG({ asString: true });
		if (typeof svg !== 'string') return;
		const blob = new Blob([svg], { type: 'image/svg+xml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'poster.svg';
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="relative flex h-dvh w-dvw items-center justify-center overflow-hidden">
	<div class="absolute top-2 left-2">
		<NavigationHistory.BackButton variant="ghost" size="icon" href={resolve('/')} />
	</div>
	<main in:fly={{ duration: 1000, y: 50 }}>
		{@render children()}
	</main>
	<div class="absolute right-2 bottom-2">
		<Button variant="ghost" size="icon" onclick={() => state?.player.start()}>
			<PlayIcon />
		</Button>
		<Button variant="ghost" size="icon" onclick={() => state?.player.pause()}>
			<PauseIcon />
		</Button>
		<Button disabled={!state?.poster} variant="ghost" size="icon" onclick={downloadPoster}>
			<Download />
		</Button>
	</div>
</div>
