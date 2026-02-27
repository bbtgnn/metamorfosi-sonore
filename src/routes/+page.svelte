<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import Logo from '$lib/assets/logo.svg';
	import { imageSize } from '$lib/canvas/utils';

	import AcciaioPreview from './posters/i-colori-dell-acciaio/preview.jpg';
	import LaminatorePreview from './posters/il-laminatore/preview.jpg';
	import RisveglioPreview from './posters/il-risveglio/preview.jpg';
	import OperaioIgnotoPreview from './posters/operaio-ignoto/preview.jpg';

	type Routes = Parameters<typeof resolve>[0];
</script>

<div class="flex min-h-screen flex-col items-stretch justify-center">
	<div class="border-b border-b-foreground">
		<div class="mx-auto w-full max-w-7xl p-4">
			<img src={Logo} alt="Logo" class="h-20 sm:h-32" />
		</div>
	</div>
	<div class="mx-auto inline-grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
		{@render image(AcciaioPreview, "I colori dell'acciaio", '/posters/i-colori-dell-acciaio')}
		{@render image(LaminatorePreview, 'Il laminatore', '/posters/il-laminatore')}
		{@render image(RisveglioPreview, 'Il risveglio', '/posters/il-risveglio')}
		{@render image(OperaioIgnotoPreview, 'Operaio ignoto', '/posters/operaio-ignoto')}
	</div>
</div>

{#snippet image(image: string, title: string, href: Routes)}
	<a href={resolve(href)} class="space-y-2 p-4 hover:bg-foreground hover:text-background">
		<img src={image} alt={title} width={imageSize.width} height={imageSize.height} />
		<div class="flex items-center justify-between">
			<span>
				{title}
			</span>
			<ArrowRight size={16} />
		</div>
	</a>
{/snippet}

<style lang="postcss">
	@reference "./layout.css";

	img {
		@apply max-h-[400px] w-auto;
		aspect-ratio: attr(width) / attr(height);
		object-fit: contain;
		display: block;
	}
</style>
