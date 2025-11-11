// src/hooks/useImageUploader.js
import { useState } from 'react';
import { useImage } from '../Context/ImageContext';
import { useNavigate } from 'react-router-dom';
import conf from '../../conf/conf.js';
import {compressImage, convertToBase64} from '../utils/common.util.js'
export const useImageUploader = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const { setUploadedImage, setSearchResults } = useImage();
  const navigate = useNavigate();


  const handleImageUpload = async (file) => {
    if (!file) return;
     const imageURL = URL.createObjectURL(file);
    const img = new Image();
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        const minSize = 38;
        if (img.width <= minSize && img.height <= minSize) {
          setError('Image is too small. Please upload a larger one.');
          setIsAnalyzing(false);
          return reject('Image too small');
        }
        setUploadedImage(file);
         const base64Image = await convertToBase64(file);
         sessionStorage.setItem("uploadedImage", base64Image);
        setIsAnalyzing(true);
        setError(null);
        try {
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
          navigate("/results");
          resolve();
        } catch (error) {
          setError(error.message);
          setIsAnalyzing(false);
          reject(error);
        }
      };
      img.onerror = () => {
        setError('Invalid image file.');
        setIsAnalyzing(false);
        reject('Invalid image');
      };

      img.src = imageURL;
    });
  };

  return { handleImageUpload, isAnalyzing, error, setError };
};
