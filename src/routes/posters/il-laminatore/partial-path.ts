const DEFAULT_WARMUP_FRAMES = 60;

export class PartialPath {
	private start: number;
	private length: number;
	private speed: number;
	private readonly targetStart: number;
	private readonly targetLength: number;
	private warmupFramesLeft: number;
	private readonly warmupFramesTotal: number;

	constructor(
		private path: paper.Path,
		options: { offset?: number; length?: number; speed?: number; warmupFrames?: number }
	) {
		this.targetStart = options.offset ?? 0;
		this.targetLength = options.length ?? 0.4;
		this.speed = options.speed ?? 0.001;
		this.warmupFramesTotal = options.warmupFrames ?? DEFAULT_WARMUP_FRAMES;
		this.warmupFramesLeft = this.warmupFramesTotal;
		// Start full, then animate to target over warmup frames
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
	animate(project: paper.Project) {
		if (this.warmupFramesLeft > 0) {
			const t = 1 - this.warmupFramesLeft / this.warmupFramesTotal;
			// Ease-out: start fast, slow at the end (or use linear t)
			this.start = this.targetStart * t;
			this.length = 1 + (this.targetLength - 1) * t;
			this.warmupFramesLeft--;
		} else {
			this.start += this.speed;
		}
		this.currentPath?.remove();
		this.currentPath = this.make(this.start, this.length);
		project.activeLayer.addChild(this.currentPath);
	}

	setSpeed(speed: number) {
		this.speed = speed;
	}
}
