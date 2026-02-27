export class PartialPath {
	constructor(private path: paper.Path) {}

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
	private start: number = 0;
	private length: number = 0.4;
	animate(project: paper.Project) {
		this.currentPath?.remove();
		this.currentPath = this.make(this.start, this.length);
		project.activeLayer.addChild(this.currentPath);
		this.start += 0.01;
	}
}
