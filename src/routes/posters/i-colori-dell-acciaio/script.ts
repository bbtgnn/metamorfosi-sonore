import paper from 'paper';

import svgPath from './paths.svg?url';

interface TimeEvent {
	count: number;
	time: number;
	delta: number;
}

export async function initProject(canvas: HTMLCanvasElement) {
	const project = new paper.Project(canvas);

	const rect = new paper.Path.Rectangle({
		point: [0, 0],
		size: [100, 100]
	});
	rect.fillColor = new paper.Color('red');

	const imported = await loadSvg(project, svgPath);
	imported.scale(0.5, [0, 0]);

	const paths = getPathsFromItem(imported);
	project.activeLayer.addChildren(paths);

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

	const minCount = 20;
	project.view.onFrame = (event: TimeEvent) => {
		const currentCount = Math.round(
			(Math.sin(event.time) * 0.5 + 0.5) * (cloneCount - minCount) + minCount
		);
		for (let i = 0; i < currentCount; i++) {
			redClones[i].opacity = 1;
			blueClones[i].opacity = 1;
			redClones[i].interpolate(redInner, redOuter, i / currentCount);
			blueClones[i].interpolate(blueInner, blueOuter, i / currentCount);
		}
		for (let i = currentCount; i < cloneCount; i++) {
			redClones[i].opacity = 0;
			blueClones[i].opacity = 0;
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

export interface PaperProjectResult {
	project: paper.Project;
	scope: paper.PaperScope;
	width: number;
	height: number;
}

/**
 * Parses width and height from an SVG string (from width/height attributes or viewBox).
 */
function parseSvgDimensions(svgString: string): { width: number; height: number } {
	const parser = new DOMParser();
	const doc = parser.parseFromString(svgString, 'image/svg+xml');
	const svg = doc.querySelector('svg');
	if (!svg) {
		throw new Error('Invalid SVG: no root <svg> element');
	}
	const w = svg.getAttribute('width');
	const h = svg.getAttribute('height');
	if (w != null && h != null) {
		const width = parseFloat(w);
		const height = parseFloat(h);
		if (!Number.isNaN(width) && !Number.isNaN(height)) {
			return { width, height };
		}
	}
	const viewBox = svg.getAttribute('viewBox');
	if (viewBox) {
		const parts = viewBox.trim().split(/\s+/);
		if (parts.length >= 4) {
			const width = parseFloat(parts[2]);
			const height = parseFloat(parts[3]);
			if (!Number.isNaN(width) && !Number.isNaN(height)) {
				return { width, height };
			}
		}
	}
	throw new Error('SVG has no readable width/height or viewBox');
}

/**
 * Creates a Paper.js project: loads the SVG, reads its dimensions, sets up the project on the canvas, then imports the SVG using [Path.importSVG](http://paperjs.org/reference/path/#importsvg-svg-onLoad).
 * @param canvas - The canvas element to draw on
 * @param svgSource - URL of the SVG file or the SVG markup string
 * @param onLoad - Optional callback when the SVG has been imported (receives the imported item and the raw SVG string). For URL loads this is called by Paper.js; for string content we call it after the synchronous import.
 * @returns Promise resolving to the project, scope, width and height
 */
export function createPaperProject(
	canvas: HTMLCanvasElement,
	svgSource: string,
	onLoad?: (item: paper.Item, svgData: string) => void
): Promise<PaperProjectResult> {
	return new Promise((resolve, reject) => {
		const finish = (
			scope: paper.PaperScope,
			width: number,
			height: number,
			item: paper.Item,
			svgData: string
		) => {
			onLoad?.(item, svgData);
			resolve({
				project: scope.project,
				scope,
				width,
				height
			});
		};

		const loadSvg = (svgString: string) => {
			const { width, height } = parseSvgDimensions(svgString);
			const scope = new paper.PaperScope();
			scope.setup(canvas);
			scope.view.viewSize = new scope.Size(width, height);
			// When svg is a string, importSVG is synchronous and does not call onLoad
			const item = scope.project.importSVG(svgString, {
				insert: true,
				onLoad: (item: paper.Item, svgData: string) => {
					finish(scope, width, height, item, svgData);
				}
			});
			if (item != null) {
				finish(scope, width, height, item, svgString);
			}
		};

		const isUrl =
			svgSource.startsWith('http') ||
			svgSource.startsWith('/') ||
			svgSource.startsWith('./') ||
			svgSource.startsWith('../');

		if (isUrl) {
			fetch(svgSource)
				.then((r) => {
					if (!r.ok) throw new Error(`Failed to load SVG: ${r.status}`);
					return r.text();
				})
				.then(loadSvg)
				.catch(reject);
		} else {
			try {
				loadSvg(svgSource);
			} catch (e) {
				reject(e);
			}
		}
	});
}
