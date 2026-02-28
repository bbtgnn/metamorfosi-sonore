<script lang="ts">
	import { Canvas } from '$lib/canvas';
	import { DecayTime } from '$lib/decay-time';
	import { findByNameAndClass, loadSvg } from '$lib/paper-utils';
	import { type PlayerEvent, PlayerWithEvents } from '$lib/player-with-events';
	import audioUrl from '$research/i colori dell_acciaio.mp3?url';
	import transients from '$research/i colori dell_acciaio.transients.json';
	import paper from 'paper';

	import { setState } from '../+layout.svelte';
	import poster from './poster.svg?url';

	//

	const decayRed = new DecayTime({ decayRatePerSecond: 0.2 });
	const decayBlue = new DecayTime({ decayRatePerSecond: 0.2 });

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

		const imported = await loadSvg(project, poster);
		if (imported instanceof paper.Group) {
			for (const child of imported.children) {
				if (child.name == 'i-colori-dell-acciaio' && child instanceof paper.Group) {
					project.activeLayer.addChildren(child.children);
				}
			}
		}

		const redInner = findByNameAndClass(project, 'red-inner', paper.Path);
		const redOuter = findByNameAndClass(project, 'red-outer', paper.Path);
		const blueInner = findByNameAndClass(project, 'blue-inner', paper.Path);
		const blueOuter = findByNameAndClass(project, 'blue-outer', paper.Path);

		const cloneCount = 80;
		const redClones: paper.Path[] = [];
		const blueClones: paper.Path[] = [];
		for (let i = 0; i < cloneCount; i++) {
			redClones.push(redInner.clone());
			blueClones.push(blueInner.clone());
		}
		const shapesGroup = new paper.Group();
		shapesGroup.addChildren(redClones);
		shapesGroup.addChildren(blueClones);
		project.activeLayer.addChild(shapesGroup);

		redInner.remove();
		redOuter.remove();
		blueInner.remove();
		blueOuter.remove();

		// draw first frame with max decay before starting animation
		decayRed.reset();
		decayBlue.reset();
		for (let i = 0; i < cloneCount; i++) {
			redClones[i].interpolate(redInner, redOuter, (i / cloneCount) * decayRed.amount);
			blueClones[i].interpolate(blueInner, blueOuter, (i / cloneCount) * decayBlue.amount);
		}

		project.view.onFrame = (event: { delta: number }) => {
			decayRed.update(event.delta);
			decayBlue.update(event.delta);
			for (let i = 0; i < cloneCount; i++) {
				redClones[i].interpolate(redInner, redOuter, (i / cloneCount) * decayRed.amount);
				blueClones[i].interpolate(blueInner, blueOuter, (i / cloneCount) * decayBlue.amount);
			}
		};

		project.view.pause();

		const textGroup = findByNameAndClass(project, 'testo', paper.Group);
		textGroup.bringToFront();

		setState({
			player,
			poster: project
		});
	}
</script>

<Canvas {initProject} />
