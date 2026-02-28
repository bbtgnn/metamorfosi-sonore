<script module lang="ts">
	import type { PlayerWithEvents } from '$lib/player-with-events';

	import * as Tone from 'tone';

	type State = {
		player: PlayerWithEvents;
		poster?: paper.Project;
	};

	let state = $state<State>();
	let showOverlay = $state(false);

	export function setState(newState: State) {
		state = newState;
		const audioContextState = Tone.getContext().state;
		if (audioContextState == 'running') {
			setTimeout(() => {
				newState.player.start();
			}, 500);
		} else {
			showOverlay = true;
		}
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
	<div class="absolute top-2 left-2 z-10">
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

	{#if showOverlay}
		<div class="absolute inset-0 flex items-center justify-center bg-black/50">
			<Button
				size="icon-lg"
				onclick={() => {
					showOverlay = false;
					state?.player.start();
				}}
			>
				<PlayIcon />
			</Button>
		</div>
	{/if}
</div>
