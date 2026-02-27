<script lang="ts">
	import { DecayTime } from '$lib/decay-time';
	import { type PlayerEvent, PlayerWithEvents } from '$lib/player-with-events';
	import { imageSize } from '$lib/shared';
	import audioUrl from '$research/operaio ignoto.mp3';
	import transients from '$research/operaio ignoto.transients.json';
	import P5 from 'p5';

	import { setState } from '../+layout.svelte';

	//

	const sides = 7;
	const copies = 7;
	const scaling = 1.04;
	const iterations = 23;
	const radius = 13;

	const minAngleIncrease = 6.42;
	const maxAngleIncrease = 15;

	let sketch: P5 | null = null;
	const decay = new DecayTime({ delta: 0.008 });

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
			sketch?.loop();
		},
		onStop: () => {
			sketch?.noLoop();
		}
	});

	async function initProject(canvas: HTMLCanvasElement) {
		sketch = new P5((_) => {
			const centerDistance = radius * cosine(360 / sides / 2);
			const shapeAngle = ((sides - 2) * 180) / sides;

			let angleIncrease = 6.42;
			let angle: number, minAngle: number, minLength: number;
			let rotation = 0;

			_.setup = () => {
				_.createCanvas(imageSize.width, imageSize.height, 'p2d', canvas);
				_.angleMode(_.DEGREES);
				_.ellipseMode(_.CENTER);
				_.noLoop();
			};

			_.draw = () => {
				decay.update();

				angleIncrease = _.map(decay.amount, 0, 1, minAngleIncrease, maxAngleIncrease);
				angle = shapeAngle / 2 + angleIncrease;
				minAngle = 90 + angle;
				minLength = (radius + centerDistance) * tangent(angle);

				_.background(0);
				_.translate(_.width / 2, _.height / 2);
				_.scale(-1, 1);
				_.stroke(255);
				_.rotate(rotation);

				for (let s = 0; s < copies; s++) {
					let currentStroke = 1;
					_.push();
					_.translate(-minLength, centerDistance);
					for (let i = 0; i < iterations; i++) {
						_.strokeWeight(currentStroke);
						_.line(0, 0, minLength * 2, 0);
						_.translate(minLength * 2, 0);
						_.rotate(-minAngle);
						_.scale(scaling);
						currentStroke = currentStroke / scaling;
					}
					_.pop();
					_.rotate(360 / copies);
				}

				rotation += 0.02;
			};
		});
	}

	setState({
		player
	});

	function tangent(angleDegrees: number) {
		const a = (Math.PI * angleDegrees) / 180;
		return Math.sin(a) / Math.cos(a);
	}

	function cosine(angleDegrees: number) {
		return Math.cos((angleDegrees / 180) * Math.PI);
	}
</script>

<canvas
	class="bg-black"
	{@attach (c) => {
		initProject(c);
	}}
></canvas>
