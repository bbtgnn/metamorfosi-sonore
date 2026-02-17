<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<div class="space-y-3 p-3">
	<a href={resolve('/posters/poster-1')}>Poster 1</a>
	<a href={resolve('/ar-test')}>Poster 2</a>
</div>

<style lang="postcss">
	@reference "./layout.css";

	a {
		@apply text-blue-500 underline;
	}
</style>
