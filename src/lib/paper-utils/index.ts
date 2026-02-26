import paper from 'paper';

export function getPathsFromItem(root: paper.Item): paper.Path[] {
	const paths: paper.Path[] = [];
	const stack: paper.Item[] = [root];

	while (stack.length > 0) {
		const item = stack.pop()!;

		if (item instanceof paper.Path) {
			paths.push(item);
			continue;
		}

		// Any item type that exposes `children` (e.g. Group, Layer, SymbolItem)
		if ('children' in item && item.children) {
			for (const child of item.children) {
				stack.push(child);
			}
		}
	}

	return paths;
}

export function getPathByNameOrThrow(paths: paper.Path[], name: string): paper.Path {
	const path = paths.find((p) => p.name == name);
	if (!path) {
		throw new Error(`Path with name ${name} not found`);
	}
	return path;
}

export async function loadSvg(project: paper.Project, svgPath: string): Promise<paper.Item> {
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

export class Interpolation {
	paths: paper.Path[] = [];

	constructor(start: paper.Path, end: paper.Path, copies: number) {
		for (let i = 0; i < copies; i++) {
			const path = start.clone();
			this.paths.push(path);
			path.interpolate(start, end, i / copies);
		}
	}
}
