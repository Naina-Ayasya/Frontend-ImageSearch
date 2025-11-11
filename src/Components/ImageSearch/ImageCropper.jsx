import Cropper from "react-easy-crop";
import getCroppedImg from "./cropUtils";
import { useState, useCallback } from "react";

const ImageCropper = ({ imageSrc, onComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;

    setLoading(true);
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    setLoading(false);
    onComplete(croppedImage); // Pass image and let parent handle rest
  };

  return (
    <div className="fixed inset-0 z-50  bg-opacity-60 flex items-center justify-center">
      <div className="bg-white border-2 rounded-lg p-6 relative w-[90%] max-w-xl">
        <div className="relative w-full h-[300px] bg-gray-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex justify-end mt-4">
          <button
            className={`px-6 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition ${
              !croppedAreaPixels || loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleCrop}
            disabled={!croppedAreaPixels || loading}
          >
            {loading ? "Processing..." : "Confirm Crop"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
