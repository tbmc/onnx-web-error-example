import Horses from './horses.jpg';

export async function downloadImage(): Promise<Uint8Array> {
	return new Promise((resolve) => {
		const img = new Image();
		img.src = Horses;
		img.onload = () => {
			const canvas = new OffscreenCanvas(img.width, img.height);
			const context = canvas.getContext('2d')!;
			context.drawImage(img, 0, 0);
			const imageData = context.getImageData(0, 0, 640, 640); // I don't take full image, but I don't care
			resolve(new Uint8Array(imageData?.data.buffer));
		};
	});
}

export function prepareToDetectYoloV7(image: Uint8Array | Float32Array): Float32Array {
	const resultTotalSize = 640 * 640 * 3;
	const output = new Float32Array(resultTotalSize);

	const rowLength = 640 * 4;
	if (image.length !== rowLength * 640) {
		throw new Error();
	}

	const tempShape = [640, 640, 3];
	const newShape = [2, 0, 1].map((i) => tempShape[i]);
	const rRowLength = newShape[1] * newShape[2];

	for (let row = 0; row < 640; row++) {
		const rowStart = row * rowLength;

		for (let col = 0; col < 640; col++) {
			const colStart = col * 4;

			for (let color = 0; color < 3; color++) {
				const value = image[rowStart + colStart + color];
				output[color * rRowLength + row * newShape[2] + col] = value / 255;
			}
		}
	}

	return output;
}

export interface ConsoleErrorOverride {
	originalConsoleError(...data: unknown[]): void;
	restoreConsoleError(): void;
	errorCalled(): boolean;
}

export function overrideConsoleError(
	label: string,
	callback?: (...data: unknown[]) => void
): ConsoleErrorOverride {
	const originalConsoleError = console.error;
	let errorHasBeenCalled = false;

	console.error = (...data: unknown[]) => {
		errorHasBeenCalled = true;
		console.group(`Captured error : ${label}`);
		originalConsoleError(...data);
		if (callback) callback(...data);
		console.groupEnd();
	};

	return {
		originalConsoleError,
		restoreConsoleError() {
			console.error = originalConsoleError;
		},
		errorCalled() {
			return errorHasBeenCalled;
		}
	};
}
