<script lang="ts">
	import { Canvas } from '$lib/canvas';
	import { addBackground, findByNameAndClass, loadSvg } from '$lib/paper-utils';
	import { type PlayerEvent, PlayerWithEvents } from '$lib/player-with-events';
	import audioUrl from '$research/il risveglio.mp3';
	import notes from '$research/il risveglio.notes.json';
	import transients from '$research/il risveglio.transients.json';
	import paper from 'paper';

	import { setState } from '../+layout.svelte';
	import { Gear } from './gear';
	import poster from './poster.svg?url';

	//

	let project: paper.Project | null = null;

	const gears: Gear[] = [];
	const speeds = [10, 3, 1, 0.1, 0];

	const events: PlayerEvent[] = [];
	notes.forEach((n, index) => {
		events.push({
			fn: () => {
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

		const imported = await loadSvg(project, poster);
		project.activeLayer.addChild(imported);

		const top = findByNameAndClass(project, 'top', paper.Path);
		const topCenter = findByNameAndClass(project, 'top-center', paper.Path);
		const bottom = findByNameAndClass(project, 'bot', paper.Path);
		const bottomCenter = findByNameAndClass(project, 'bot-center', paper.Path);

		top.strokeWidth = 2;
		bottom.strokeWidth = 2;

		const topGear = new Gear(top, topCenter.bounds.center);
		const bottomGear = new Gear(bottom, bottomCenter.bounds.center);
		bottomGear.setDirection(-1);

		topCenter.remove();
		bottomCenter.remove();

		topGear.addToProject(project);
		bottomGear.addToProject(project);
		gears.push(topGear, bottomGear);

		const clones = 15;
		const tx = 7;

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

		project.view.onFrame = (event: { delta: number }) => {
			gears.forEach((g) => g.rotate(event.delta));
		};

		project.view.pause();

		setState({
			player,
			poster: project
		});
	}
</script>

<Canvas {initProject} />
