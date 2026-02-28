<script lang="ts">
	import { Canvas } from '$lib/canvas';
	import { findByNameAndClass, Interpolation, loadSvg } from '$lib/paper-utils';
	import { type PlayerEvent, PlayerWithEvents } from '$lib/player-with-events';
	import audioUrl from '$research/il laminatore.mp3';
	import notes from '$research/il laminatore.notes.json';
	import transients from '$research/il laminatore.transients.json';
	import paper from 'paper';

	import { setState } from '../+layout.svelte';
	import { PartialPath } from './partial-path';
	import poster from './poster.svg?url';

	//

	type Event = 'bzz' | 'clunk' | 'stair';
	const eventToSpeed: Record<Event, number> = {
		bzz: 0.06,
		clunk: 0.006,
		stair: 0.12
	};

	let partials: PartialPath[] = [];

	let project: paper.Project | null = null;
	const events: PlayerEvent[] = [];

	let lastEvent: Event | null = null;
	notes.forEach((n) => {
		const currentEvent = n.event as Event;
		let baseSpeed = eventToSpeed[n.event as Event];
		if (lastEvent == currentEvent) {
			if (currentEvent == 'stair') {
				baseSpeed += 2 * baseSpeed;
			} else if (currentEvent == 'clunk') {
				baseSpeed = 0;
			}
		}
		const transient = transients.find((t) => t.transient_index == n.transient_index);
		if (!transient) throw new Error(`Transient not found for note ${n.event}`);
		events.push({
			fn: () => {
				partials.forEach((p) => p.setSpeed(baseSpeed));
			},
			timestamp: transient.timestamp_s
		});
		lastEvent = currentEvent;
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

		const imported = await loadSvg(project, poster);
		project.activeLayer.addChild(imported);

		const sx = findByNameAndClass(project, 'sx', paper.Path);
		const dx = findByNameAndClass(project, 'dx', paper.Path);
		dx.reorient(true, false);
		sx.remove();
		dx.remove();
		sx.strokeWidth = dx.strokeWidth = 1.3;

		const interpolation = new Interpolation(sx, dx, 80);

		partials = interpolation.paths.map(
			(path) =>
				new PartialPath(path, {
					offset: Math.random() / 6,
					length: (Math.random() / 3) * 2,
					speed: (Math.random() / 1000) * 60
				})
		);

		partials.forEach((p) => p.animate(project!, 0));

		project.view.onFrame = (event: { delta: number }) => {
			partials.forEach((p) => p.animate(project!, event.delta));
		};

		project.view.pause();

		setState({
			player,
			poster: project
		});
	}
</script>

<Canvas {initProject} />
