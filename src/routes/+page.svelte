<script lang="ts">
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
	<div class="border-b border-b-foreground p-4">
		<div class="max-w-screen-4xl mx-auto w-full">
			<img src={Logo} alt="Logo" class="h-20 sm:h-32" />
		</div>
	</div>
	<div class="max-w-screen-7xl mx-auto inline-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
		{@render image(AcciaioPreview, "I colori dell'acciaio", '/posters/i-colori-dell-acciaio')}
		{@render image(LaminatorePreview, 'Il laminatore', '/posters/il-laminatore')}
		{@render image(RisveglioPreview, 'Il risveglio', '/posters/il-risveglio')}
		{@render image(OperaioIgnotoPreview, 'Operaio ignoto', '/posters/operaio-ignoto')}
	</div>
</div>

{#snippet image(image: string, title: string, href: Routes)}
	<a href={resolve(href)} class="space-y-2 p-2 hover:bg-foreground hover:text-background md:p-4">
		<img src={image} alt={title} width={imageSize.width} height={imageSize.height} />
		<span>
			{title}
		</span>
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
