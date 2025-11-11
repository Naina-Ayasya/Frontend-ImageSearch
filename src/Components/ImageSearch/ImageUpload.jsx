import { useState } from 'react';
import { useImage } from '../../Context/ImageContext';
import { useNavigate } from 'react-router-dom';
import { FaCamera } from 'react-icons/fa';
import conf from '../../../conf/conf.js';

const ImageUpload = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const { setUploadedImage, setSearchResults } = useImage();
  const navigate = useNavigate();

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
              attemptCompression(); // Retry with lower quality
            } else {
              resolve(blob); // Best-effort fallback
            }
          },
          'image/jpeg',
          currentQuality
        );
      };

      attemptCompression();
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageURL = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      const minSize = 38;

      if (img.width <= minSize && img.height <= minSize) {
        setError('Image is too small (less than or equal to 1cm x 1cm). Please upload a larger image.');
        setIsAnalyzing(false);
        event.target.value = null;
        return;
      }

      setUploadedImage(imageURL);
      setIsAnalyzing(true);
      setError(null);

      try {
        // 🔄 Compress image if it's > 5MB
        let imageToUpload = file;
        if (file.size > 5 * 1024 * 1024) {
          const compressedBlob = await compressImage(img);
          imageToUpload = new File([compressedBlob], file.name, { type: 'image/jpeg' });
        }

        const formData = new FormData();
        formData.append('image', imageToUpload);

        const response = await fetch(`${conf.backendUri}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Upload failed');
        }

        const data = await response.json();
        setSearchResults(data.results);
        setIsAnalyzing(false);
        navigate('/results');
      } catch (error) {
        setError(error.message);
        setIsAnalyzing(false);
      }
    };

    img.onerror = () => {
      setError('Invalid image file. Please upload a valid image.');
      setIsAnalyzing(false);
    };

    img.src = imageURL;
  };

  const closeErrorPopup = () => {
    setError(null);
  };

  return (
    <div className="flex justify-center items-center bg-gray-100">
      <label
        htmlFor="upload"
        className="w-64 h-64 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-200 flex flex-col items-center justify-center text-center"
      >
        <FaCamera className="text-4xl text-gray-600 mb-3" />
        <p className="text-lg font-semibold text-gray-700">Click to Upload Image</p>
        <input
          type="file"
          id="upload"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageUpload}
        />
      </label>

     {isAnalyzing && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{
      backgroundColor: 'rgba(0, 0, 0, 0.3)', // semi-transparent black
      backdropFilter: 'blur(6px)',          // blur effect
      WebkitBackdropFilter: 'blur(6px)',   // for Safari support
    }}
  >
    <div className="bg-white p-10 rounded-lg text-center">
      <div className="loader mb-4"></div>
      <h2 className="text-lg font-medium">Analyzing Image...</h2>
      <p className="text-sm text-gray-600 mt-2">Please wait a few seconds</p>
    </div>
  </div>
)}


      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
        style={{
      backgroundColor: 'rgba(0, 0, 0, 0.3)', // semi-transparent black
      backdropFilter: 'blur(6px)',          // blur effect
      WebkitBackdropFilter: 'blur(6px)',   // for Safari support
    }}>
          <div className="bg-white rounded-lg shadow-lg max-w-xs p-6 text-center">
            <h2 className="text-lg font-bold text-red-600 mb-2">Error</h2>
            <p className="text-sm text-gray-700">{error}</p>
            <button
              onClick={closeErrorPopup}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
