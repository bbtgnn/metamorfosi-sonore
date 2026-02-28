<script lang="ts">
	import { NavigationHistory } from '$lib';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';

	import './layout.css';

	//

	let { children } = $props();

	NavigationHistory.setupRecorder();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher />

{@render children()}
