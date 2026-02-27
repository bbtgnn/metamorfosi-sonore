<script lang="ts">
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

	type Event = 'bzz' | 'clunk' | 'stair';
	const eventToSpeed: Record<Event, number> = {
		bzz: 0.001,
		clunk: 0.0001,
		stair: 0.002
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

		const imported = await loadSvg(project, svgPath);
		imported.scale(0.4, [0, 0]);

		// project.activeLayer.addChild(imported);

		const paths = getPathsFromItem(imported);
		const sx = getPathByNameOrThrow(paths, 'sx');
		const dx = getPathByNameOrThrow(paths, 'dx');

		sx.strokeWidth = dx.strokeWidth = 1;
		sx.strokeColor = dx.strokeColor;
		dx.reorient(true, false);

		const interpolation = new Interpolation(sx, dx, 80);

		partials = interpolation.paths.map(
			(path) =>
				new PartialPath(path, {
					offset: Math.random() / 6,
					length: (Math.random() / 3) * 2,
					speed: Math.random() / 1000
				})
		);

		partials.forEach((p) => p.animate(project!));

		project.view.onFrame = () => {
			partials.forEach((p) => p.animate(project!));
		};

		project.view.pause();
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
