<script lang="ts">
	import { type PlayerEvent, PlayerWithEvents } from '$lib/player-with-events';
	import { Button } from '$lib/shadcn/ui/button';
	import audioUrl from '$research/i colori dell_acciaio.mp3?url';
	import transients from '$research/i colori dell_acciaio.transients.json';

	import { DecayTime } from './decay-time';
	import { initProject } from './script';

	//

	const decayRed = new DecayTime({ delta: 0.002 });
	const decayBlue = new DecayTime({ delta: 0.002 });

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

	const player = new PlayerWithEvents({
		audioUrl,
		loop: true,
		events
	});
</script>

<canvas
	width="600"
	height="800"
	class="bg-black"
	{@attach (c) => {
		initProject(c, decayRed, decayBlue);
	}}
></canvas>

<Button onclick={() => player.start()}>Play</Button>
<Button onclick={() => player.stop()}>Stop</Button>
