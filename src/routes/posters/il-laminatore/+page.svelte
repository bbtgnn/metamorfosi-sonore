<script lang="ts">
	import { DecayTime } from '$lib/decay-time';
	import { getPathByName, getPathsFromItem, loadSvg } from '$lib/paper-utils';
	import { type PlayerEvent, PlayerWithEvents } from '$lib/player-with-events';
	import { Button } from '$lib/shadcn/ui/button';
	import audioUrl from '$research/il laminatore.mp3';
	import notes from '$research/il laminatore.notes.json';
	import transients from '$research/il laminatore.transients.json';
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
		const sx = getPathByName(paths, 'sx');
		const dx = getPathByName(paths, 'dx');
		if (!sx || !dx) {
			throw new Error('sx or dx not found');
		}

		// project.activeLayer.addChild(sx);
		const result = getPartialPath(sx, 0, 0.4);
		// project.activeLayer.addChild(result);
		// project.activeLayer.addChild(beforeStart);
		// project.activeLayer.addChild(copy);
		// // project.activeLayer.addChild(partial2);
		// project.activeLayer.addChild(rest);

		// sx.strokeWidth = dx.strokeWidth = 1;
		// sx.strokeColor = dx.strokeColor;

		// dx.reorient(true, false);
		// project.activeLayer.addChild(dx);

		// const interpolation = new Interpolation(sx, dx, 80);
		// project.activeLayer.addChildren(interpolation.paths);

		let ps: paper.Path[] = [];
		let amount = 0.1;

		let p = getPartialPath(sx, 0, amount);
		// project.activeLayer.addChild(p);

		project.view.onFrame = () => {
			ps.forEach((p) => p.remove());
			p = getPartialPath(sx, amount - 0.1, amount);
			project.activeLayer.addChild(p);
			amount += 0.001;
			ps.push(p);
		};
	}

	function getPartialPath(path: paper.Path, start: number, end: number) {
		if (start > end) start = end - 0.1;
		const result = path.clone();
		const startLength = path.length * start;
		result.splitAt(startLength);
		result.splitAt(path.length * end - startLength);
		return result;
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
