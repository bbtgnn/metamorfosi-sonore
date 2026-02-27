<script lang="ts">
	import { resolve } from '$app/paths';

	import AcciaioPreview from './posters/i-colori-dell-acciaio/preview.jpg';
	import LaminatorePreview from './posters/il-laminatore/preview.jpg';
	import RisveglioPreview from './posters/il-risveglio/preview.jpg';
	import OperaioIgnotoPreview from './posters/operaio-ignoto/preview.jpg';

	const imageWidth = 700;
	const imageSize = 920;

	type Routes = Parameters<typeof resolve>[0];
</script>

<div class="grid grid-cols-1 gap-3 p-3 md:grid-cols-2 lg:grid-cols-4">
	{@render image(AcciaioPreview, "I colori dell'acciaio", '/posters/i-colori-dell-acciaio')}
	{@render image(LaminatorePreview, 'Il laminatore', '/posters/il-laminatore')}
	{@render image(RisveglioPreview, 'Il risveglio', '/posters/il-risveglio')}
	{@render image(OperaioIgnotoPreview, 'Operaio ignoto', '/posters/operaio-ignoto')}
</div>

{#snippet image(image: string, title: string, href: Routes)}
	<a href={resolve(href)} class="self-center p-4 hover:bg-foreground hover:text-background">
		<img src={image} alt={title} width={imageWidth} height={imageSize} />
		{title}
	</a>
{/snippet}

<style lang="postcss">
	@reference "./layout.css";

	img {
		@apply h-[400px] w-auto;
		aspect-ratio: attr(width) / attr(height);
		object-fit: contain;
		display: block;
	}
</style>
