<script lang="ts">
	import { DecayTime } from '$lib/decay-time';
	import { getPathByNameOrThrow, getPathsFromItem, Interpolation, loadSvg } from '$lib/paper-utils';
	import { type PlayerEvent, PlayerWithEvents } from '$lib/player-with-events';
	import { Button } from '$lib/shadcn/ui/button';
	import audioUrl from '$research/il laminatore.mp3';
	import notes from '$research/il laminatore.notes.json';
	import transients from '$research/il laminatore.transients.json';
	import paper from 'paper';

	import { PartialPath } from './partial-path';
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

	notes.forEach((e) => {
		// console.log(e);
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

		// project.activeLayer.addChild(imported);

		const paths = getPathsFromItem(imported);
		const sx = getPathByNameOrThrow(paths, 'sx');
		const dx = getPathByNameOrThrow(paths, 'dx');

		sx.strokeWidth = dx.strokeWidth = 1;
		sx.strokeColor = dx.strokeColor;
		dx.reorient(true, false);
		// project.activeLayer.addChild(dx);

		const interpolation = new Interpolation(sx, dx, 40);
		const partials = interpolation.paths.map((path) => new PartialPath(path));

		project.view.onFrame = () => {
			partials.forEach((p) => p.animate(project));
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
