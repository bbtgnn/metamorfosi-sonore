<script lang="ts">
	import { Button } from '$lib/shadcn/ui/button';
	import audioUrl from '$research/i colori dell_acciaio.mp3?url';
	import transients from '$research/i colori dell_acciaio.transients.json';
	import * as Tone from 'tone';

	import { setupTransport } from './audio';

	//

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

				transients.map((t) => {
					transport.schedule(() => {
						console.log(t);
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

<!-- <canvas
	width="600"
	height="800"
	class="bg-black"
	{@attach (c) => {
		initProject(c, player, { onTransient });
	}}
></canvas> -->

<Button onclick={handlePlay}>Play</Button>
<Button onclick={handleStop}>Stop</Button>
