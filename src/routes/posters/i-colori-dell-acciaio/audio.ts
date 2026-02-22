import type * as Tone from 'tone';

//

type Transport = ReturnType<typeof Tone.getTransport>;

export function setupTransport(transport: Transport, player: Tone.Player) {
	const duration = player.buffer?.duration ?? 0;
	if (duration <= 0) throw new Error('Player has no duration');

	transport.cancel();

	transport.loop = true;
	transport.loopStart = 0;
	transport.loopEnd = duration + 1;

	transport.schedule((time) => {
		player.start(time);
	}, 0);

	transport.schedule(() => {
		player.stop();
	}, duration);

	transport.on('stop', () => {
		player.stop();
	});

	return transport;
}
