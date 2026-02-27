<script lang="ts">
	import type { Picture } from '@sveltejs/enhanced-img';

	import { ArrowRight } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import Logo from '$lib/assets/logo.svg';

	import AcciaioPreview from './posters/i-colori-dell-acciaio/preview.jpg?enhanced';
	import LaminatorePreview from './posters/il-laminatore/preview.jpg?enhanced';
	import RisveglioPreview from './posters/il-risveglio/preview.jpg?enhanced';
	import OperaioIgnotoPreview from './posters/operaio-ignoto/preview.jpg?enhanced';

	type Routes = Parameters<typeof resolve>[0];
</script>

<div class="max-w-screen-7xl mx-auto flex min-h-screen flex-col items-stretch justify-center">
	<div class="w-full border-b border-b-foreground">
		<div class="mx-auto max-w-7xl p-4">
			<img src={Logo} alt="Logo" class="h-20 sm:h-32" />
		</div>
	</div>
	<div
		class="mx-auto flex max-w-[400px] flex-col sm:inline-grid sm:max-w-7xl sm:grid-cols-2 lg:grid-cols-4"
	>
		{@render image(AcciaioPreview, "I colori dell'acciaio", '/posters/i-colori-dell-acciaio')}
		{@render image(LaminatorePreview, 'Il laminatore', '/posters/il-laminatore')}
		{@render image(RisveglioPreview, 'Il risveglio', '/posters/il-risveglio')}
		{@render image(OperaioIgnotoPreview, 'Operaio ignoto', '/posters/operaio-ignoto')}
	</div>
</div>

{#snippet image(image: Picture, title: string, href: Routes)}
	<a href={resolve(href)} class="flex flex-col gap-2 p-4 hover:bg-foreground hover:text-background">
		<enhanced:img src={image} alt={title} class="block bg-gray-500" />
		<div class="flex items-center justify-between">
			<p>{title}</p>
			<ArrowRight size={16} />
		</div>
	</a>
{/snippet}

<style lang="postcss">
	@reference "./layout.css";
</style>
