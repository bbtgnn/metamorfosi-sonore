<script lang="ts">
	import { Button } from '$lib/shadcn/ui/button';
	import audioUrl from '$research/i colori dell_acciaio.mp3?url';
	import transients from '$research/i colori dell_acciaio.transients.json';
	import * as Tone from 'tone';

	import { setupTransport } from './audio';
	import { DecayTime } from './decay-time';
	import { initProject } from './script';

	//

	const decayRed = new DecayTime({ delta: 0.002 });
	const decayBlue = new DecayTime({ delta: 0.002 });

	const player = new Tone.Player({ loop: true });
	player.load(audioUrl).then(() => {
		player.toDestination();
	});

	let ready = false;

	function handlePlay() {
		Tone.start().then(() => {
			const transport = Tone.getTransport();

			if (ready) {
				transport.start();
			} else {
				setupTransport(transport, player);

				transients
					.filter((t) => t.rolloff_band === 'mid')
					.forEach((t) => {
						transport.schedule(() => {
							decayBlue.reset();
						}, t.timestamp_s);
					});

				transients
					.filter((t) => t.rolloff_band === 'low' || t.rolloff_band === 'high')
					.forEach((t) => {
						transport.schedule(() => {
							decayRed.reset();
						}, t.timestamp_s);
					});

				ready = true;
				transport.start();
			}
		});
	}

	function handleStop() {
		const transport = Tone.getTransport();
		transport.stop();
	}
</script>

<canvas
	width="600"
	height="800"
	class="bg-black"
	{@attach (c) => {
		initProject(c, decayRed, decayBlue);
	}}
></canvas>

<Button onclick={handlePlay}>Play</Button>
<Button onclick={handleStop}>Stop</Button>
