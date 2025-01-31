import { Signature } from "./models";

/**
 * Convert a Blob to a base64 encoded string.
 * @param blob - The blob to convert
 * @returns A promise that resolves to the base64 encoded string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

/**
 * Convert a file to a base64 encoded string.
 * @param file - The file to convert
 * @returns A promise that resolves to the base64 encoded string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = (event) => {
      //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      resolve(event.target!.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Get the dimensions of an image file.
 * @param imageFile - The image file to get the dimensions of
 * @returns A promise that resolves to an object containing the dimensions of the image
 */
export const getImageDimensions = (
  imageFile: File
): Promise<{ width: number; height: number }> => {
  return new Promise<{ width: number; height: number }>((resolve) => {
    const _URL = window.URL || window.webkitURL;
    const img = new Image();
    const objectUrl = _URL.createObjectURL(imageFile);
    img.onload = () => {
      const imageWidth = img.width;
      const imageHeight = img.height;
      _URL.revokeObjectURL(objectUrl);
      resolve({ width: imageWidth, height: imageHeight });
    };
    img.src = objectUrl;
  });
};

export const uploadSignature = (): Promise<Signature> => {
  return new Promise((resolve, reject) => {
    try {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/png, image/jpeg, image/bmp, image/webp";
      fileInput.multiple = false;

      fileInput.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
        }

        const base64Image = await fileToBase64(file);
        const dimensions = await getImageDimensions(file);
        resolve({
          data: base64Image,
          width: dimensions.width,
          height: dimensions.height,
        });
      };

      fileInput.click();
    } catch (error) {
      reject(error);
    }
  });
};
