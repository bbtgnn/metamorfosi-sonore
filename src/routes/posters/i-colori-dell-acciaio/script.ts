import paper from 'paper';

import type { DecayTime } from './decay-time';

import svgPath from './paths.svg?url';

export async function initProject(
	canvas: HTMLCanvasElement,
	decayRed: DecayTime,
	decayBlue: DecayTime
) {
	const project = new paper.Project(canvas);

	const rect = new paper.Path.Rectangle({
		point: [0, 0],
		size: [100, 100]
	});
	rect.fillColor = new paper.Color('red');

	const imported = await loadSvg(project, svgPath);
	imported.scale(0.5, [0, 0]);

	const paths = getPathsFromItem(imported);
	// project.activeLayer.addChildren(paths);

	const redInner = getPathByName(paths, 'red-inner');
	const redOuter = getPathByName(paths, 'red-outer');
	const blueInner = getPathByName(paths, 'blue-inner');
	const blueOuter = getPathByName(paths, 'blue-outer');
	if (!redInner || !redOuter || !blueInner || !blueOuter) {
		throw new Error('Red or blue inner or outer not found');
	}

	const cloneCount = 80;
	const redClones: paper.Path[] = [];
	const blueClones: paper.Path[] = [];
	for (let i = 0; i < cloneCount; i++) {
		redClones.push(redInner.clone());
		blueClones.push(blueInner.clone());
	}
	project.activeLayer.addChildren(redClones);
	project.activeLayer.addChildren(blueClones);

	// const minCount = 20;
	project.view.onFrame = () => {
		decayRed.update();
		decayBlue.update();
		// const duration = player.buffer?.duration ?? 0;
		// const currentLoopTime =
		// 	duration > 0 ? Tone.getTransport().seconds % duration : 0;
		// const currentCount = Math.round(
		// 	(currentLoopTime / duration) * (cloneCount - minCount) + minCount
		// );
		for (let i = 0; i < cloneCount; i++) {
			redClones[i].interpolate(redInner, redOuter, (i / cloneCount) * decayRed.amount);
			blueClones[i].interpolate(blueInner, blueOuter, (i / cloneCount) * decayBlue.amount);
		}
	};
}

function getPathsFromItem(item: paper.Item): paper.Path[] {
	if (!(item instanceof paper.Group)) return [];
	return item.children.filter((child) => child instanceof paper.Path);
}

function getPathByName(paths: paper.Path[], name: string): paper.Path | undefined {
	return paths.find((p) => p.name == name);
}

async function loadSvg(project: paper.Project, svgPath: string): Promise<paper.Item> {
	return new Promise((resolve, reject) => {
		project.importSVG(svgPath, {
			expandShapes: true,
			insert: false,
			onError: (e: unknown) => {
				reject(new Error('Loading failure: ' + String(e)));
			},
			onLoad: (item: unknown) => {
				if (!(item instanceof paper.Item)) {
					reject(new Error('Loading failure: invalid item'));
				} else {
					resolve(item);
				}
			}
		});
	});
}
