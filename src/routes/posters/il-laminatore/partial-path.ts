export class PartialPath {
	private start: number;
	private length: number;
	private speed: number;

	constructor(
		private path: paper.Path,
		options: { offset?: number; length?: number; speed?: number }
	) {
		this.start = options.offset ?? 0;
		this.length = options.length ?? 0.4;
		this.speed = options.speed ?? 0.001;
	}

	make(head: number, length: number) {
		const result = this.path.clone();
		const headLength = (this.path.length * head) % this.path.length;
		const tailLength = (this.path.length * length) % this.path.length;
		// Closed path: splitAt(head) just opens at that point (no second path). Then split at length and remove the tail to avoid leaks.
		result.splitAt(headLength);
		result.splitAt(tailLength)?.remove();
		return result;
	}

	private currentPath: paper.Path | null = null;
	animate(project: paper.Project) {
		this.currentPath?.remove();
		this.currentPath = this.make(this.start, this.length);
		project.activeLayer.addChild(this.currentPath);
		this.start += this.speed;
	}

	setSpeed(speed: number) {
		this.speed = speed;
	}
}
