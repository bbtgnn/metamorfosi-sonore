import { onDestroy } from 'svelte';
import * as Tone from 'tone';

//

export type PlayerEvent = {
	timestamp: number;
	fn: () => void;
};

type Props = {
	loop?: boolean;
	audioUrl: string;
	events: PlayerEvent[];
	onStart?: () => void;
	onStop?: () => void;
};

export class PlayerWithEvents {
	private player = new Tone.Player();
	private ready = false;

	get transport() {
		return Tone.getTransport();
	}

	constructor(private props: Props) {
		this.player.toDestination();

		onDestroy(() => {
			this.transport.stop();
			this.transport.cancel();
		});
	}

	async start() {
		await Tone.start();
		if (!this.ready) {
			await this.player.load(this.props.audioUrl);
			this.init();
			this.ready = true;
		}
		this.transport.start();
	}

	pause() {
		this.transport.pause();
	}

	stop() {
		this.transport.stop();
	}

	private init() {
		const duration = this.player.buffer?.duration ?? 0;
		if (duration <= 0) throw new Error('Player has no duration');

		const transport = this.transport;
		transport.cancel();

		if (this.props.loop) {
			transport.loop = true;
			transport.loopStart = 0;
			transport.loopEnd = duration + 1;
		}

		this.player.sync().start(0);

		transport.on('start', () => {
			this.props.onStart?.();
		});

		transport.on('stop', () => {
			this.props.onStop?.();
		});

		transport.on('pause', () => {
			this.props.onStop?.();
		});

		this.props.events.forEach((event) => {
			transport.schedule(event.fn, event.timestamp);
		});
	}
}
