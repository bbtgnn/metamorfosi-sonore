<script lang="ts">
	import { type PlayerEvent, PlayerWithEvents } from '$lib/player-with-events';
	import { Button } from '$lib/shadcn/ui/button';
	import audioUrl from '$research/operaio ignoto.mp3';
	import transients from '$research/operaio ignoto.transients.json';
	import paper from 'paper';

	//

	let project: paper.Project | null = null;

	const events: PlayerEvent[] = [];
	transients.forEach((n, index) => {
		events.push({
			fn: () => {
				console.log(n);
			},
			timestamp: transients[index].timestamp_s
		});
	});

	const player = new PlayerWithEvents({
		audioUrl,
		loop: true,
		events
	});

	async function initProject(canvas: HTMLCanvasElement) {
		project = new paper.Project(canvas);

		const center = project.view.bounds.center;
		const sides = 7;
		const angle = 360 / sides;
		const initalLength = 100;
		const distance = 30;

		const angleIncrease = 5;
		const phi = (1 + Math.sqrt(5)) / 2; // golden ratio for spiral r(θ) = a·φ^(θ/360°)

		const startLine = new paper.Path.Line(
			[center.x - initalLength / 2, center.y + distance],
			[center.x + initalLength / 2, center.y + distance]
		);
		startLine.strokeColor = new paper.Color('white');

		const group = new paper.Group();
		group.addChild(startLine);

		const branchCopies = 28;
		for (let i = 0; i < branchCopies; i++) {
			const angleDeg = angleIncrease * i;
			const radius = distance * Math.pow(phi, angleDeg / 360);
			const line = startLine.clone();
			line.translate([0, radius - distance]);
			line.rotate(angleDeg, center);
			line.scale((radius / distance) * i * 0.1, line.bounds.center);
			group.addChild(line);
		}

		for (let i = 0; i < sides; i++) {
			const clone = group.clone();
			clone.rotate(angle * i, center);
		}
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
