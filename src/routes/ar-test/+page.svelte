<script lang="ts">
	import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	import targetUrl from './targets.mind?url';

	onMount(() => {
		const mindarThree = new MindARThree({
			container: document.querySelector('#container'),
			imageTargetSrc: targetUrl // served from public folder
		});

		const { renderer, scene, camera } = mindarThree;

		const anchor = mindarThree.addAnchor(0);

		// Create plane
		const geometry = new THREE.PlaneGeometry(1, 0.55);
		const material = new THREE.MeshBasicMaterial({
			color: 0x00ffff,
			transparent: true,
			opacity: 0.5
		});
		const plane = new THREE.Mesh(geometry, material);
		anchor.group.add(plane);

		const start = async () => {
			await mindarThree.start();
			renderer.setAnimationLoop(() => {
				renderer.render(scene, camera);
			});
		};

		document.querySelector('#startButton')?.addEventListener('click', () => {
			start();
		});

		document.querySelector('#stopButton')?.addEventListener('click', () => {
			mindarThree.stop();
			renderer.setAnimationLoop(null);
		});
	});
</script>

<div id="control" class="fixed top-0 left-0 z-2">
	<button id="startButton">Start</button>
	<button id="stopButton">Stop</button>
</div>

<div id="container" class="relative h-screen w-screen overflow-hidden"></div>
