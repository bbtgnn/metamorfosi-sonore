<script lang="ts">
	import { addBackground, getPathByNameOrThrow, getPathsFromItem, loadSvg } from '$lib/paper-utils';
	import { type PlayerEvent, PlayerWithEvents } from '$lib/player-with-events';
	import { imageSize } from '$lib/shared';
	import { onMount } from 'svelte';
	import audioUrl from '$research/il risveglio.mp3';
	import notes from '$research/il risveglio.notes.json';
	import transients from '$research/il risveglio.transients.json';
	import paper from 'paper';

	import { setState } from '../+layout.svelte';
	import { Gear } from './gear';
	import svgPath from './paths.svg?url';

	const canvasPadding = 24;
	let canvasWidth = imageSize.width;
	let canvasHeight = imageSize.height;

	function updateCanvasSize() {
		const availableWidth = window.innerWidth - canvasPadding * 2;
		const availableHeight = window.innerHeight - canvasPadding * 2;
		const scale = Math.min(
			availableWidth / imageSize.width,
			availableHeight / imageSize.height,
			1
		);
		canvasWidth = imageSize.width * scale;
		canvasHeight = imageSize.height * scale;
	}

	onMount(() => {
		updateCanvasSize();
		const handler = () => updateCanvasSize();
		window.addEventListener('resize', handler);
		return () => window.removeEventListener('resize', handler);
	});

	//

	let project: paper.Project | null = null;

	const gears: Gear[] = [];
	const speeds = [10, 5, 1, 0.1, 0];

	const events: PlayerEvent[] = [];
	notes.forEach((n, index) => {
		events.push({
			fn: () => {
				console.log(n);
				gears.forEach((g) => g.setSpeed(speeds[n.transient_index - 1]));
			},
			timestamp: transients[index].timestamp_s
		});
	});

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

		const topGear = new Gear(
			getPathByNameOrThrow(paths, 'top'),
			getPathByNameOrThrow(paths, 'top-center').bounds.center
		);
		const bottomGear = new Gear(
			getPathByNameOrThrow(paths, 'bot'),
			getPathByNameOrThrow(paths, 'bot-center').bounds.center
		);
		bottomGear.setDirection(-1);

		topGear.addToProject(project);
		bottomGear.addToProject(project);
		gears.push(topGear, bottomGear);

		const clones = 15;
		const tx = 10;

		for (let i = 0; i < clones; i++) {
			const clone = bottomGear.clone();
			clone.translate(tx * i, 0);
			clone.addToProject(project);
			gears.push(clone);
		}

		for (let i = 0; i < clones; i++) {
			const clone = topGear.clone();
			clone.translate(tx * i, 0);
			clone.addToProject(project);
			gears.push(clone);
		}

		project.view.onFrame = () => {
			gears.forEach((g) => g.rotate());
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
	class="bg-black"
	style={`display: block; margin: ${canvasPadding}px; width: ${canvasWidth}px; height: ${canvasHeight}px;`}
	{@attach (c) => {
		initProject(c);
	}}
></canvas>
