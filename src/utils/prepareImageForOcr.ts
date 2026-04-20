const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal memuat gambar untuk OCR.'));
    };

    image.src = objectUrl;
  });

export const prepareImageForOcr = async (file: File): Promise<string> => {
  const image = await loadImage(file);
  const scale = 1.8;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas OCR tidak tersedia di browser ini.');
  }

  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];

    const gray = red * 0.299 + green * 0.587 + blue * 0.114;
    const boosted = gray > 150 ? 255 : gray < 110 ? 0 : gray * 1.15;

    data[index] = boosted;
    data[index + 1] = boosted;
    data[index + 2] = boosted;
  }

  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
};
