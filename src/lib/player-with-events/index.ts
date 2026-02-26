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
};

export class PlayerWithEvents {
	private player = new Tone.Player();
	private ready = false;

	get transport() {
		return Tone.getTransport();
	}

	constructor(private props: Props) {
		this.player.toDestination();
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

		transport.schedule((time) => {
			this.player.start(time);
		}, 0);

		transport.schedule(() => {
			this.player.stop();
		}, duration);

		transport.on('stop', () => {
			this.player.stop();
		});

		this.props.events.forEach((event) => {
			transport.schedule(event.fn, event.timestamp);
		});
	}
}
