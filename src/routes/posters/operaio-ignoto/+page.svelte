<script lang="ts">
	import { Canvas } from '$lib/canvas';
	import { DecayTime } from '$lib/decay-time';
	import { loadSvg } from '$lib/paper-utils';
	import { type PlayerEvent, PlayerWithEvents } from '$lib/player-with-events';
	import audioUrl from '$research/operaio ignoto.mp3';
	import transients from '$research/operaio ignoto.transients.json';
	import paper from 'paper';

	import { setState } from '../+layout.svelte';
	import poster from './poster.svg?url';

	//

	const sides = 7;
	const copies = 7;
	const scaling = 1.04;
	const iterations = 30;
	const radius = 19;

	const minAngleIncrease = 6.42;
	const maxAngleIncrease = 15;

	let project: paper.Project | null = null;
	let linesGroup: paper.Group | null = null;

	const decay = new DecayTime({ delta: 0.004 });

	const events: PlayerEvent[] = [];
	transients.forEach((n, index) => {
		events.push({
			fn: () => {
				decay.reset();
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
		const imported = await loadSvg(project, poster);
		project.activeLayer.addChild(imported);

		linesGroup = new paper.Group();
		project.activeLayer.addChild(linesGroup);

		let rotation = 0;

		const centerDistance = radius * cosine(360 / sides / 2);
		const shapeAngle = ((sides - 2) * 180) / sides;

		function drawFrame() {
			decay.update();

			const angleIncrease = map(decay.amount, 0, 1, minAngleIncrease, maxAngleIncrease);
			const angle = shapeAngle / 2 + angleIncrease;
			const minAngle = 90 + angle;
			const minLength = (radius + centerDistance) * tangent(angle);

			linesGroup!.removeChildren();

			const baseMatrix = new paper.Matrix()
				.translate(paper.view.bounds.width / 2, paper.view.bounds.height / 2)
				.scale(-1, 1)
				.rotate(rotation, 0, 0);

			const iterMatrix = new paper.Matrix()
				.rotate(-minAngle, 0, 0)
				.scale(scaling)
				.prepend(new paper.Matrix().translate(minLength * 2, 0));

			for (let s = 0; s < copies; s++) {
				const copyMatrix = baseMatrix
					.clone()
					.rotate((360 / copies) * s + 360 / copies / 2, 0, 0)
					.translate(-minLength, centerDistance);

				let lineMatrix = copyMatrix.clone();

				for (let i = 0; i < iterations; i++) {
					const start = lineMatrix.transform(new paper.Point(0, 0));
					const end = lineMatrix.transform(new paper.Point(minLength * 2, 0));

					const line = new paper.Path.Line(start, end);
					line.strokeColor = new paper.Color('white');
					line.strokeWidth = 1.5;
					linesGroup!.addChild(line);

					lineMatrix = lineMatrix.clone().append(iterMatrix);
				}
			}

			rotation += 0.02;
		}

		drawFrame();
		project.view.onFrame = drawFrame;
		project.view.pause();

		setState({
			player,
			poster: project
		});
	}

	function tangent(angleDegrees: number) {
		const a = (Math.PI * angleDegrees) / 180;
		return Math.sin(a) / Math.cos(a);
	}

	function cosine(angleDegrees: number) {
		return Math.cos((angleDegrees / 180) * Math.PI);
	}

	function map(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
		return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
	}
</script>

<Canvas {initProject} />
