<script lang="ts">
	import { downloadImage, overrideConsoleError, prepareToDetectYoloV7 } from '$lib';
	import * as ort from 'onnxruntime-web/webgpu';

	ort.env.wasm.numThreads = 0;
	ort.env.wasm.wasmPaths = '/js/';

	let isWorking: boolean | undefined = undefined;
	let result: string = '';
	let errorList: string[] = [];

	async function init() {
		errorList = [];
		const consoleOverride = overrideConsoleError('ONNX Runtime', (...data) =>
			errorList.push(JSON.stringify(data))
		);
		try {
			const img = await downloadImage();
			const prepared = prepareToDetectYoloV7(img);

			const yolo = await ort.InferenceSession.create('/yolov7-tiny.onnx', {
				executionProviders: ['webgpu'],
				logSeverityLevel: 3
			});

			const tensor = new ort.Tensor('float32', prepared, [1, 3, 640, 640]);

			const inputName = yolo.inputNames[0];
			const outputName = yolo.outputNames[0];

			const inferenceResult = await yolo.run({ [inputName]: tensor });
			const output = inferenceResult[outputName];

			result = JSON.stringify(output);
			console.log('Output: ', output);

			isWorking = !consoleOverride.errorCalled();
		} catch (e) {
			console.error('There was an error!', e);
			isWorking = false;
		} finally {
			consoleOverride.restoreConsoleError();
		}
	}

	init();
</script>

{#if isWorking === undefined}
	<div>Loading</div>
{:else}
	<div>Is it working: {isWorking}</div>

	{#if isWorking}
		<p>ONNX Runtime has used the model correctly with GPU.</p>
		<div class="result">Result: {result}</div>
	{:else}
		<p>See Dev Tools Console for more information</p>
		<p>Errors :</p>
		<div>
			{#each errorList as error}
				<p class="error-container">
					{error}
				</p>
			{/each}
		</div>
	{/if}
{/if}

<style>
	.result {
		text-wrap: wrap;
		line-break: anywhere;
	}

	.error-container {
		border-bottom: 1px solid black;
	}
</style>
