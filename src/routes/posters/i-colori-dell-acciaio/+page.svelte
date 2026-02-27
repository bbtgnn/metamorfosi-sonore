<script lang="ts">
	import { DecayTime } from '$lib/decay-time';
	import { addBackground, getPathByNameOrThrow, getPathsFromItem, loadSvg } from '$lib/paper-utils';
	import { type PlayerEvent, PlayerWithEvents } from '$lib/player-with-events';
	import { imageSize } from '$lib/shared';
	import audioUrl from '$research/i colori dell_acciaio.mp3?url';
	import transients from '$research/i colori dell_acciaio.transients.json';
	import paper from 'paper';

	import { setState } from '../+layout.svelte';
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

	let project: paper.Project | null = null;

	const player = new PlayerWithEvents({
		audioUrl,
		loop: true,
		events,
		onStart: () => {
			project?.view.play();
		},
		onStop: () => {
			project?.view.pause();
		}
	});

	async function initProject(canvas: HTMLCanvasElement) {
		project = new paper.Project(canvas);
		addBackground(project, 'black');

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

		// draw first frame with max decay before starting animation
		decayRed.reset();
		decayBlue.reset();
		for (let i = 0; i < cloneCount; i++) {
			redClones[i].interpolate(redInner, redOuter, (i / cloneCount) * decayRed.amount);
			blueClones[i].interpolate(blueInner, blueOuter, (i / cloneCount) * decayBlue.amount);
		}

		project.view.onFrame = () => {
			decayRed.update();
			decayBlue.update();
			for (let i = 0; i < cloneCount; i++) {
				redClones[i].interpolate(redInner, redOuter, (i / cloneCount) * decayRed.amount);
				blueClones[i].interpolate(blueInner, blueOuter, (i / cloneCount) * decayBlue.amount);
			}
		};

		project.view.pause();

		setState({
			player,
			poster: project
		});
	}
</script>

<canvas
	width={imageSize.width}
	height={imageSize.height}
	{@attach (c) => {
		initProject(c);
	}}
></canvas>
