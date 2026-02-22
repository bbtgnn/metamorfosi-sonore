<script lang="ts">
	import { initProject } from './script';
</script>

<canvas
	width="600"
	height="800"
	class="bg-black"
	{@attach (c) => {
		initProject(c);
	}}
></canvas>
