<script lang="ts">
	import { imageSize, resizeCanvasAttachment } from './utils';

	type Props = {
		initProject: (canvas: HTMLCanvasElement) => void;
	};

	let { initProject }: Props = $props();
</script>

<canvas
	width={imageSize.width}
	height={imageSize.height}
	{@attach (c) => {
		initProject(c);
	}}
	{@attach (c) => resizeCanvasAttachment(c)}
	data-paper-resize="true"
	data-paper-keepalive="true"
></canvas>
