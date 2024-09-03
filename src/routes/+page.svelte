<script lang="ts">
	import * as ort from 'onnxruntime-web/webgpu';

	ort.env.wasm.numThreads = 4;
	ort.env.wasm.wasmPaths = '/js/';

	async function init() {
		const yolo = await ort.InferenceSession.create('/yolov7-tiny.onnx', {
			executionProviders: ['webgpu']
		});

		const array = new Float32Array(640 * 640 * 3);
		const tensor = new ort.Tensor('float32', array, [1, 3, 640, 640]);

		const inputName = yolo.inputNames[0];
		const outputName = yolo.outputNames[0];

		const inferenceResult = await yolo.run({ [inputName]: tensor });
		const output = inferenceResult[outputName];
		console.log('Output: ', output);
	}

	init();
</script>

<div>Test</div>
