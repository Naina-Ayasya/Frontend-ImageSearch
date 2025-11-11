const base64ToFile = (base64, fileName) => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], fileName, { type: mime });
};


const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (typeof file === "string" && file.startsWith("data:image")) {
      resolve(file);
      return;
    }

    if (!(file instanceof Blob)) {
      reject("Invalid file type. Expected Blob/File.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};


 const compressImage = (image, quality = 0.8, maxSizeMB = 5) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      let currentQuality = quality;
      const attemptCompression = () => {
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size <= maxSizeMB * 1024 * 1024) {
              resolve(blob);
            } else if (currentQuality > 0.1) {
              currentQuality -= 0.1;
              attemptCompression();
            } else {
              resolve(blob);
            }
          },
          'image/jpeg',
          currentQuality
        );
      };
      attemptCompression();
    });
  };

export {convertToBase64, base64ToFile, compressImage }