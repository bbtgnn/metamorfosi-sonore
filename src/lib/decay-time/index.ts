export class DecayTime {
	private current = 0;

	constructor(private options: { decayRatePerSecond: number }) {}

	reset() {
		this.current = 1;
	}

	update(delta: number) {
		if (this.current <= 0) return;
		this.current -= this.options.decayRatePerSecond * delta;
	}

	get amount() {
		return this.current;
	}
}
