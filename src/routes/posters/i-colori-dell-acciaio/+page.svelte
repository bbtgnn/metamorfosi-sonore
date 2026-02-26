<script lang="ts">
	import { DecayTime } from '$lib/decay-time';
	import { getPathByNameOrThrow, getPathsFromItem, loadSvg } from '$lib/paper-utils';
	import { type PlayerEvent, PlayerWithEvents } from '$lib/player-with-events';
	import { Button } from '$lib/shadcn/ui/button';
	import audioUrl from '$research/i colori dell_acciaio.mp3?url';
	import transients from '$research/i colori dell_acciaio.transients.json';
	import paper from 'paper';

	import svgPath from './paths.svg?url';

	//

	const decayRed = new DecayTime({ delta: 0.002 });
	const decayBlue = new DecayTime({ delta: 0.002 });

	const events: PlayerEvent[] = [];
	transients
		.filter((t) => t.rolloff_band === 'mid')
		.forEach((t) => {
			events.push({
				fn: () => decayBlue.reset(),
				timestamp: t.timestamp_s
			});
		});
	transients
		.filter((t) => t.rolloff_band === 'low' || t.rolloff_band === 'high')
		.forEach((t) => {
			events.push({
				fn: () => decayRed.reset(),
				timestamp: t.timestamp_s
			});
		});

	const player = new PlayerWithEvents({
		audioUrl,
		loop: true,
		events
	});

	async function initProject(canvas: HTMLCanvasElement) {
		const project = new paper.Project(canvas);

		const imported = await loadSvg(project, svgPath);
		imported.scale(0.4, [0, 0]);

		const paths = getPathsFromItem(imported);
		const redInner = getPathByNameOrThrow(paths, 'red-inner');
		const redOuter = getPathByNameOrThrow(paths, 'red-outer');
		const blueInner = getPathByNameOrThrow(paths, 'blue-inner');
		const blueOuter = getPathByNameOrThrow(paths, 'blue-outer');

		const cloneCount = 80;
		const redClones: paper.Path[] = [];
		const blueClones: paper.Path[] = [];
		for (let i = 0; i < cloneCount; i++) {
			redClones.push(redInner.clone());
			blueClones.push(blueInner.clone());
		}
		project.activeLayer.addChildren(redClones);
		project.activeLayer.addChildren(blueClones);

		project.view.onFrame = () => {
			decayRed.update();
			decayBlue.update();
			for (let i = 0; i < cloneCount; i++) {
				redClones[i].interpolate(redInner, redOuter, (i / cloneCount) * decayRed.amount);
				blueClones[i].interpolate(blueInner, blueOuter, (i / cloneCount) * decayBlue.amount);
			}
		};
	}
</script>

<canvas
	width="600"
	height="800"
	class="bg-black"
	{@attach (c) => {
		initProject(c);
	}}
></canvas>

<Button onclick={() => player.start()}>Play</Button>
<Button onclick={() => player.stop()}>Stop</Button>
