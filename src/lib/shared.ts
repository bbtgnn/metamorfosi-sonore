export const imageSize = {
	width: 700,
	height: 920
};

const canvasPadding = 24;

function resizeCanvas(canvas: HTMLCanvasElement) {
	const availableWidth = window.innerWidth - canvasPadding * 2;
	const availableHeight = window.innerHeight - canvasPadding * 2;
	const scale = Math.min(availableWidth / imageSize.width, availableHeight / imageSize.height, 1);
	canvas.width = imageSize.width * scale;
	canvas.height = imageSize.height * scale;
}

export function resizeCanvasAttachment(canvas: HTMLCanvasElement) {
	const handler = () => resizeCanvas(canvas);
	window.addEventListener('resize', handler);
	return () => window.removeEventListener('resize', handler);
}
