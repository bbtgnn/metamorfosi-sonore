export class Gear {
	private path: paper.Path | null = null;
	private center: paper.Point | null = null;
	private speed = 0;
	private direction: 1 | -1 = 1;

	constructor(path?: paper.Path, center?: paper.Point) {
		if (path && center) this.init(path, center);
	}

	init(path: paper.Path, center: paper.Point) {
		this.path = path;
		this.center = center;
	}

	setDirection(direction: 1 | -1) {
		this.direction = direction;
	}

	rotate(delta: number) {
		if (!this.path || !this.center) return;
		this.path.rotate(this.speed * this.direction * delta * 60, this.center);
	}

	setSpeed(speed: number) {
		this.speed = speed;
	}

	addToProject(project: paper.Project) {
		if (!this.path) return;
		project.activeLayer.addChild(this.path);
	}

	clone() {
		if (!this.path || !this.center) throw new Error('Path or center not found');
		const gear = new Gear(this.path.clone(), this.center.clone());
		gear.setDirection(this.direction);
		return gear;
	}

	translate(x: number, y: number) {
		if (!this.path || !this.center) return;
		this.path.translate([x, y]);
		this.center = this.center.add([x, y]);
	}
}
