import React, { useRef } from 'react';
import { useImageUploader } from '../../Context/useImageUploader';
import marble from '../../assets/blackmarble.jpg';
import uploadImg from '../../assets/uploadlogo.png';
import exploreImg from '../../assets/explore.png';
import dragImg from '../../assets/dragdrop.png';
import cube from '../../assets/cubeloader.mp4';

const UploadTiles = () => {
  const inputRef = useRef(null);
  const { handleImageUpload, isAnalyzing, error, setError } = useImageUploader();
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  return (
    <div className="position-relative w-100 h-auto min-vh-[450px] d-flex align-items-center justify-content-center text-white py-10 py-md-0 mt-5" style={{ marginBottom: '2rem' }}>
      <style>
        {`
          .bg-marble {
            background-image: url(${marble}) !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
          }
          .bg-dark-overlay {
            background-color: rgba(0, 0, 0, 0.6) !important;
          }
          .upload-box {
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            border: 2px dashed rgba(255, 255, 255, 0.4) !important;
          }
          .font-playfair {
            font-family: 'Playfair Display', serif !important;
            font-weight: 700 !important;
            color: #ffffff !important;
          }
          .step-heading {
            color: #ffffff !important;
          }
          .step-description {
            color: #ffffff !important;
          }
          .select-file-text {
            color: #ffffff !important;
          }
          .select-file-button {
            background-color: transparent !important;
            border: 1px solid white !important;
            color: white !important;
            padding: 0.6rem 1.5rem !important;
            font-weight: 500 !important;
            transition: all 0.3s ease !important;
          }
          .select-file-button:hover {
            background-color: white !important;
            color: black !important;
          }
          .modal-overlay {
            background-color: rgba(0, 0, 0, 0.3) !important;
            backdrop-filter: blur(6px) !important;
            -webkit-backdrop-filter: blur(6px) !important;
          }
          .error-modal {
            background-color: rgba(0, 0, 0, 0.4) !important;
            backdrop-filter: blur(6px) !important;
            -webkit-backdrop-filter: blur(6px) !important;
          }
        `}
      </style>

      {/* Background */}
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-marble" />
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark-overlay" />

      {/* Content */}
      <div className="position-relative container py-5 z-2">
        <div className="row align-items-center">
          {/* LEFT SECTION */}
          <div className="col-md-6 text-center text-md-start">
            <h1 className="font-playfair mb-5 fs-2 fs-md-1">
              Upload Image to<br />Find Similar Tiles
            </h1>

            <div className="d-flex flex-column flex-md-row gap-5 justify-content-start">
              {/* Step 1 */}
              <div className="d-flex align-items-start gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                  <img src={uploadImg} alt="Upload Icon" className="img-fluid" />
                </div>
                <div>
                  <p className="fw-semibold small mb-1 mt-1 step-heading">STEP 1: UPLOAD YOUR IMAGE</p>
                  <p className="text-secondary small step-description">Choose a photo of your space or a tile design you love.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="d-flex align-items-start gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                  <img src={exploreImg} alt="Explore Icon" className="img-fluid" />
                </div>
                <div>
                  <p className="fw-semibold small mb-1 mt-1 step-heading">STEP 2: EXPLORE MATCHING TILES</p>
                  <p className="text-secondary small step-description">Browse through our suggested tile options that fit your style.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="col-md-6 d-flex justify-content-md-end justify-content-center mt-5 mt-md-0">
            <div className="upload-box rounded text-center p-4 w-100" style={{ maxWidth: '448px' }}>
              <div className="mb-3">
                <img src={dragImg} alt="Drag" style={{ width: '48px', height: '48px' }} />
              </div>
              <p className="fw-semibold fs-6 mb-1 select-file-text">SELECT A FILE OR DRAG AND<br />DROP HERE</p>
              <p className="text-secondary small mb-4">JPG, PNG. Maximum file size: 5MB</p>
              <button
                onClick={() => inputRef.current?.click()}
                className="select-file-button"
              >
                SELECT FILE
              </button>
              <input
                type="file"
                ref={inputRef}
                accept="image/*"
                onChange={onFileChange}
                className="d-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Analyzing Modal */}
      {isAnalyzing && (
        <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3">
          <video
            src={cube}
            autoPlay
            loop
            muted
            style={{ width: '48px', height: '48px' }}
          />
        </div>
      )}

      {/* Error Modal */}
      {error && (
        <div className="error-modal position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3">
          <div className="bg-white rounded shadow p-4 text-center" style={{ maxWidth: '320px' }}>
            <h2 className="fs-5 fw-bold text-danger mb-2">Error</h2>
            <p className="text-secondary small">{error}</p>
            <button
              onClick={() => setError(null)}
              className="btn btn-danger mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadTiles;