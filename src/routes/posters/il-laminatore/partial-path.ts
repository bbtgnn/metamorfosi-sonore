const DEFAULT_WARMUP_DURATION = 1;

export class PartialPath {
	private start: number;
	private length: number;

	private speed: number;
	private readonly targetStart: number;
	private readonly targetLength: number;
	private warmupTimeLeft: number;
	private readonly warmupDuration: number;

	constructor(
		private path: paper.Path,
		options: { offset?: number; length?: number; speed?: number; warmupDuration?: number }
	) {
		this.targetStart = options.offset ?? 0;
		this.targetLength = options.length ?? 0.4;
		this.speed = options.speed ?? 0.06;
		this.warmupDuration = options.warmupDuration ?? DEFAULT_WARMUP_DURATION;
		this.warmupTimeLeft = this.warmupDuration;
		// Start full, then animate to target over warmup
		this.start = 0;
		this.length = 1;
	}

	make(head: number, length: number) {
		const result = this.path.clone();
		const headLength = (this.path.length * head) % this.path.length;
		const segmentLength = this.path.length * length;
		// splitAt(offset) keeps [0, offset) in the path, returns [offset, end]. We want [head, head+length].
		const fromHead = result.splitAt(headLength);
		if (!fromHead) return result;
		const tail = fromHead.splitAt(Math.min(segmentLength, fromHead.length));
		tail?.remove();
		return fromHead;
	}

	private currentPath: paper.Path | null = null;
	animate(project: paper.Project, delta: number) {
		if (this.warmupTimeLeft > 0) {
			this.warmupTimeLeft -= delta;
			const t = 1 - Math.max(0, this.warmupTimeLeft) / this.warmupDuration;
			// Ease-out: start fast, slow at the end (or use linear t)
			this.start = this.targetStart * t;
			this.length = 1 + (this.targetLength - 1) * t;
		} else {
			this.start += this.speed * delta;
		}
		this.currentPath?.remove();
		this.currentPath = this.make(this.start, this.length);
		project.activeLayer.addChild(this.currentPath);
	}

	setSpeed(speed: number) {
		this.speed = speed;
	}
}
