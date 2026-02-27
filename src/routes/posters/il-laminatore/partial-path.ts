export class PartialPath {
	constructor(private path: paper.Path) {}

	make(head: number, length: number) {
		const result = this.path.clone();
		const headLength = (this.path.length * head) % this.path.length;
		const tailLength = (this.path.length * length) % this.path.length;
		result.splitAt(headLength);
		result.splitAt(tailLength);
		return result;
	}

	private currentPath: paper.Path | null = null;
	private start: number = 0;
	private length: number = 0.4;
	animate(project: paper.Project) {
		this.currentPath?.remove();
		this.currentPath = this.make(this.start, this.length);
		project.activeLayer.addChild(this.currentPath);
		this.start += 0.001;
	}
}
