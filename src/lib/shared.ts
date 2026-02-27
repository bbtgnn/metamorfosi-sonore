export const imageSize = {
	width: 700,
	height: 920
};

const canvasPadding = 24;

export function resizeCanvas(canvas: HTMLCanvasElement) {
	const availableWidth = window.innerWidth - canvasPadding * 2;
	const availableHeight = window.innerHeight - canvasPadding * 2;
	const scale = Math.min(availableWidth / imageSize.width, availableHeight / imageSize.height, 1);
	canvas.style.width = `${imageSize.width * scale}px`;
	canvas.style.height = `${imageSize.height * scale}px`;
}

export function resizeCanvasAttachment(canvas: HTMLCanvasElement) {
	const handler = () => resizeCanvas(canvas);
	handler();
	window.addEventListener('resize', handler);
	return () => window.removeEventListener('resize', handler);
}
