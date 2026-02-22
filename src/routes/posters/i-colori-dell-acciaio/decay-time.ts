export class DecayTime {
	private current = 0;

	constructor(private options: { delta: number }) {}

	reset() {
		this.current = 1;
	}

	update() {
		if (this.current <= 0) return;
		this.current -= this.options.delta;
	}

	get amount() {
		return this.current;
	}
}
