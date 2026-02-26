<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<div class="space-y-3 p-3">
	<a href={resolve('/posters/i-colori-dell-acciaio')}>I colori dell'acciaio</a>
	<a href={resolve('/posters/il-laminatore')}>Il laminatore</a>
	<a href={resolve('/ar-test')}>AR Test</a>
</div>

<style lang="postcss">
	@reference "./layout.css";

	a {
		@apply text-blue-500 underline;
	}
</style>
