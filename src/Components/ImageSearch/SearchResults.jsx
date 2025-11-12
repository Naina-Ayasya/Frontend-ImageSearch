import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useImage } from '../../Context/ImageContext';
import conf from '../../../conf/conf.js';
import SearchInput from './SearchInput.jsx';
import { FaHeart } from 'react-icons/fa';
import uploadIcon from '../../assets/changeImage.png';
import cube from '../../assets/cubeloader.mp4';
import threeLogo from '../../assets/grid3logo.png';
import fourLogo from '../../assets/grid4logo.png';
import filterLogo from '../../assets/filter.png';
import heartLogo from '../../assets/heart.png';
import {base64ToFile, convertToBase64, compressImage}  from '../../utils/common.util.js'
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
const ITEMS_PER_PAGE = 9;
import Pagination from "../Pagination/Pagination.jsx";


const SearchResults = () => {
  
  const imageData = useImage();
  if (!imageData) {
  // custom hook returned undefined / null / invalid
  return <div>No data available</div>;
}


  const { uploadedImage, searchResults, setUploadedImage, setSearchResults } = imageData;
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedFilters, setSelectedFilters] = useState({
    wallTiles: [],
    floorTiles: [],
    sizes: [],
    finishes: [],
    ranges: [],
    textures: [],
    colors: [],
    priceRange: [],
  });
  const [sortOrder, setSortOrder] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const failedImages = useRef(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFourColLayout, setIsFourColLayout] = useState(false);
  const [lastImageName, setLastImageName] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    wallTiles: true,
    floorTiles: true,
    sizes: true,
    finishes: true,
    ranges: true,
    textures: true,
    colors: true,
    priceRange: true,
  });
const [isLoading, setIsLoading] = useState(false)

let imageURL = null;

if (uploadedImage && uploadedImage instanceof File) {
  
  imageURL = URL.createObjectURL(uploadedImage);
}




useEffect(() => {
  const loadImageFromSession = async () => {
    const storedImage = sessionStorage.getItem("uploadedImage");
    if (!storedImage) return;
    const file = base64ToFile(storedImage, "uploadedImage.jpg");
    // Update uploadedImage as File again
    setUploadedImage(file);
    await handleImageSetter(file);
  };

  loadImageFromSession();
}, []);


  const handleFilterChange = (filterCategory, value) => {
    setSelectedFilters((prev) => {
      const currentFilters = prev[filterCategory] || [];
      if (currentFilters.includes(value)) {
        return {
          ...prev,
          [filterCategory]: currentFilters.filter((item) => item !== value),
        };
      } else {
        return {
          ...prev,
          [filterCategory]: [...currentFilters, value],
        };
      }
    });
  };


const handleImageSetter = async (file) =>{
    let imageToUpload = file;
          if (file.size > 5 * 1024 * 1024) {
            const compressedBlob = await compressImage(img);
            imageToUpload = new File([compressedBlob], file.name, { type: 'image/jpeg' });
          }
 const formData = new FormData();
  formData.append('image', imageToUpload);
      try {
        setIsLoading(true)
        const response = await fetch(`${conf.backendUri}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Upload failed');
        }

        const data = await response.json();
        const validResult = (data.results || []).filter(
          (item) => item.productName && item.productName.trim() !== ''
        );
        setSearchResults(validResult);
        setIsAnalyzing(false);
      } catch (error) {
        setIsLoading(false)
        setError(error.message);
        setIsAnalyzing(false);
      } finally{
        setIsLoading(false)
      }
}

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const base64Image = await convertToBase64(file);
    sessionStorage.setItem("uploadedImage", base64Image);
    setError(null);

    if (file.name === lastImageName) {
      setError('Please upload a different image.');
      return;
    }

    const image = new Image();
    const imageURL = URL.createObjectURL(file);

    image.src = imageURL;

    image.onload = async () => {
      if (image.width < 50 || image.height < 50) {
        setError('Uploaded image is too small. Please upload an image at least 50x50 pixels.');
        return;
      }

      setUploadedImage(file);
      setLastImageName(file.name);
      setIsAnalyzing(true);
      setCurrentPage(1);
      setSelectedFilters({
        wallTiles: [],
        floorTiles: [],
        sizes: [],
        finishes: [],
        ranges: [],
        textures: [],
        colors: [],
        priceRange: [],
      });
      setSortOrder('');
      setSelectedProduct(null);

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch(`${conf.backendUri}/upload`, {
          method: 'POST',
          body: formData,
        });
         setIsLoading(true)
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Upload failed');
        }

        const data = await response.json();
        const validResult = (data.results || []).filter(
          (item) => item.productName && item.productName.trim() !== ''
        );
        setSearchResults(validResult);

        setIsAnalyzing(false);
      } catch (error) {
        setError(error.message);
        setIsAnalyzing(false);
         setIsLoading(false)
      }finally{
        setIsLoading(false)
      }
    };
  };


  const filteredResults = useMemo(() => {
    if (!searchResults.length) return [];

    let results = [...searchResults];

    const filterKeys = Object.keys(selectedFilters);
    if (filterKeys.length > 0) {
      results = results.filter((item) =>
        filterKeys.every((filterName) => {
          const filters = selectedFilters[filterName];
          if (filters.length === 0) return true;
          return filters.some((filterVal) =>
            (item[filterName.toLowerCase().replace(/\s+/g, '_')] || '')
              .toLowerCase()
              .includes(filterVal.toLowerCase())
          );
        })
      );
    }

    if (sortOrder === 'high-to-low') {
      results.sort((a, b) => b.score - a.score);
    } else if (sortOrder === 'low-to-high') {
      results.sort((a, b) => a.score - b.score);
    }

    return results;
  }, [searchResults, selectedFilters, sortOrder]);

  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredResults.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];

  // const goToPage = (page) => {
  //   if (page >= 1 && page <= totalPages) {
  //     setCurrentPage(page);
  //   }
  // };

  // const renderPageNumbers = () => {
  //   const pages = [];
  //   const visiblePages = [1, 2, 3, totalPages - 1, totalPages];
  //   for (let i = 1; i <= totalPages; i++) {
  //     if (visiblePages.includes(i) || (i >= currentPage - 1 && i <= currentPage + 1)) {
  //       pages.push(i);
  //     } else if (pages[pages.length - 1] !== '...') {
  //       pages.push('...');
  //     }
  //   }
  //   return pages.map((page, idx) => (
  //     <button
  //       key={idx}
  //       onClick={() => typeof page === 'number' && goToPage(page)}
  //       className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline-primary'} mx-1 d-flex justify-content-center align-items-center
  //   border-0 rounded-0 p-0 px-3 fs-6 fw-semibold lh-sm text-white text-uppercase`}
  //       disabled={page === '...'}
  //       aria-label={typeof page === 'number' ? `Go to page ${page}` : 'ellipsis'}
  //     >
  //       {page}
  //     </button>
  //   ));
  // };

  const activeFilterCount = Object.values(selectedFilters).reduce(
    (total, filterArray) => total + filterArray.length,
    0
  );

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleFilters = () => {
    setIsFiltersOpen((prev) => !prev);
  };

  const ProductPlaceholder = () => (
    <div className="d-flex flex-column gap-2 animate-pulse" style={{ height: '495px' }}>
      <div
        className="bg-secondary w-100 rounded"
        style={{ height: isFourColLayout ? '260px' : '353px', width: isFourColLayout ? '259.5px' : '353px' }}
      ></div>
      <div className="d-flex flex-column gap-2">
        <div className="bg-secondary h-5 w-75 rounded"></div>
        <div className="bg-secondary h-4 w-50 rounded"></div>
        <div className="bg-secondary h-4 w-66 rounded"></div>
      </div>
    </div>
  );

  const FilterCheckbox = ({ category, label, isChecked }) => (
    <div className="form-check custom-checkbox mb-2" style={{ marginBottom: '8px' }}>
      <input
        type="checkbox"
        className="form-check-input"
        checked={isChecked}
        onChange={() => handleFilterChange(category, label)}
        id={`${category}-${label}`}
        style={{ width: '16px', height: '16px', marginTop: '2px' }}
      />
      <label
        className="form-check-label"
        htmlFor={`${category}-${label}`}
        style={{ marginLeft: '8px', fontSize: '14px', color: '#6B7280', display: 'flex', alignItems: 'center' }}
      >
        {label}
      </label>
    </div>
  );


  return (
    <div className="p-4 bg-light">
      <style>
        {`
          .product-image-container {
            position: relative !important;
            overflow: hidden !important;
          }
          .hover-overlay {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            opacity: 0 !important;
            transition: opacity 0.5s ease !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .product-image-container:hover .hover-overlay {
            opacity: 1 !important;
          }
          .hover-content {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 8px !important;
            transform: translateY(100%) !important;
            transition: transform 0.5s ease !important;
          }
          .product-image-container:hover .hover-content {
            transform: translateY(0) !important;
          }
          .heart-button {
            cursor: pointer !important;
          }
          .heart-button img {
            width: 24px !important;
            height: 24px !important;
          }
          .hover-text-dark:hover {
            color: #1a202c !important;
          }
          .hover-border-primary:hover {
            border-color: #007bff !important;
          }
          .filter-section {
            padding: 16px !important;
            background: #F9FAFB !important;
            border-right: 1px solid #E5E7EB !important;
          }
          .filter-section h3 {
            font-size: 14px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            color: #1F2937 !important;
            margin: 0 !important;
          }
          .filter-section h4 {
            font-size: 12px !important;
            font-weight: 600 !important;
            color: #6B7280 !important;
            margin: 8px 0 4px 8px !important;
          }
          .filter-section .form-check {
            margin-bottom: 8px !important;
          }
          .filter-section .form-check-label {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            font-size: 14px !important;
            color: #6B7280 !important;
          }
          .filter-section button {
            font-size: 12px !important;
            font-weight: 500 !important;
            color: #3B82F6 !important;
            background: none !important;
            border: none !important;
            padding: 0 !important;
            margin-top: 4px !important;
          }
          .product-grid {
            display: grid !important;
            grid-template-columns: repeat(${isFourColLayout ? 4 : 3}, 1fr) !important;
            gap: 16px !important;
          }
          @media (max-width: 768px) {
            .product-grid {
              grid-template-columns: repeat(1, 1fr) !important;
            }
          }
          .form-check-input {
            position: relative !important;
            appearance: checkbox !important;
          }
          .checkmark {
            display: none !important;
          }
          .page-btn:hover {
            background-color: var(--bs-primary) !important;
            color: #fff !important;
          }
        `}
      </style>
      <div className="container mb-4" style={{ maxWidth: '960px', marginBottom: '16px' }}>
        {/* SearchInput component */}
      </div>

      <div className="container-fluid" style={{ maxWidth: '1512px' }}>
        <div className="row" >
          <div
            className={`col-12 col-lg-3 p-4 bg-light overflow-y-auto d-lg-block mt-5 mt-lg-0 border boder-[#E5E7EB] bg-white ${isFiltersOpen ? 'd-block' : 'd-none'} filter-section`}
          >
            <div className="mb-4" style={{ marginBottom: '16px' }}>
              {/* <span className="text-sm text-secondary" style={{ fontSize: '12px', color: '#6B7280' }}>
                {activeFilterCount.toString().padStart(2, '0')} Filters Active Now
              </span> */}
            </div>

            {imageURL && (
              <>
              <div className="mb-4 position-relative d-none d-lg-block" style={{ marginBottom: '16px' }}>
                <div className="border border-secondary bg-white uploaded-image-container" style={{ border: '1px solid #D1D5DB', borderRadius: '8px' }}>
                 <img
                    src={imageURL}
                    alt="Uploaded Tile"
                    className="w-100 h-100 object-cover"
                    style={{ width: '336px', height: '362px', borderRadius: '8px' }}
                  />
                  
                  <label
                    role='button'
                    htmlFor="change-image-sidebar"
                    className="position-absolute bottom-0 start-0 m-2 w-10 h-10 bg-white rounded-circle d-flex align-items-center justify-content-center cursor-pointer"
                    style={{ margin: '8px', width: '40px', height: '40px', bottom: '0', left: '0' }}
                    aria-label="Change image"
                  >
                    <img src={uploadIcon} alt="Upload Icon" style={{ width: '24px', height: '24px' }} 
                    className="d-inline-block"
                    tabIndex={0}
                    data-bs-toggle="tooltip"
                    title=''/>
                    <input
                      type="file"
                      id="change-image-sidebar"
                      accept="image/*"
                      className="d-none"
                      capture="environment"
                      onChange={handleImageChange}
                    />
                    
                  </label>
                </div>
              </div>
                  <span className='fw-bold fs-6 text-dark d-none d-lg-inline'>Click on this icon to upload new image to search</span>

              </>
            )}
            {error && <p className="text-sm text-danger mb-4" style={{ fontSize: '12px', color: '#EF4444', marginBottom: '16px' }}>{error}</p>}
          </div>

          <div
            className={`col-12 col-lg-9 bg-white p-4 shadow overflow-y-auto overflow-x-hidden results-section ${isFiltersOpen ? 'd-none d-lg-block' : 'd-block'}`}
            style={{ padding: '16px', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}
          >
          
            {uploadedImage && (
              <>
              <div className="mb-4  position-relative d-block d-lg-none" style={{ marginBottom: '16px' }}>
                <div className="border border-secondary bg-white uploaded-image-container" style={{ border: '1px solid #D1D5DB', borderRadius: '8px' }}>
                  <img
                    src={imageURL}
                    alt="Uploaded Tile"
                    className="w-100 h-100 object-cover"
                    style={{ width: '336px', height: '362px', borderRadius: '8px' }}
                  />
                  <label
                    htmlFor="change-image-products"
                    className="position-absolute bottom-0 start-0 m-2 w-10 h-10 bg-white rounded-circle d-flex align-items-center justify-content-center cursor-pointer"
                    style={{ margin: '8px', width: '40px', height: '40px', bottom: '0', left: '0' }}
                    aria-label="Change image"
                  >
                    <img src={uploadIcon} alt="Upload Icon" style={{ width: '24px', height: '24px' }} />
                    <input
                      type="file"
                      id="change-image-products"
                      accept="image/*"
                      className="d-none"
                      capture="environment"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
              <span className='fw-bold fs-6 text-dark d-inline d-lg-none'>Click on this icon to upload new image to search</span>

              </>
            )}
            <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap" style={{ marginBottom: '16px' }}>
              <div className="d-flex gap-2 align-items-center" style={{ gap: '8px' }}>
                <img
                  src={threeLogo}
                  alt="3 per row"
                  onClick={() => setIsFourColLayout(false)}
                  className={`w-8 h-8 cursor-pointer p-1 border rounded ${!isFourColLayout ? 'border-primary' : 'border-transparent'} hover-border-primary`}
                  style={{ width: '32px', height: '32px', padding: '4px', borderWidth: '2px', borderRadius: '4px' }}
                />
                <img
                  src={fourLogo}
                  alt="4 per row"
                  onClick={() => setIsFourColLayout(true)}
                  className={`w-8 h-8 cursor-pointer p-1 border rounded ${isFourColLayout ? 'border-primary' : 'border-transparent'} hover-border-primary`}
                  style={{ width: '32px', height: '32px', padding: '4px', borderWidth: '2px', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div className="product-grid">
              {isLoading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                  <div key={idx} className="col">
                    <ProductPlaceholder />
                  </div>
                ))
              ) : currentProducts.length > 0 ? (
                currentProducts.filter((product) => product.productName)
                .map((product, idx) => {    
                  const { url, score, filename, productName, productUrl, sizes, category } = product;
                  const imageUrl = url;
                  return (
                    <div key={idx}>
                      <a
                      key={url + idx}
                      href={productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`col d-flex flex-column cursor-pointer gap-2 product-card ${isFourColLayout ? 'product-card-four-col' : ''}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setSelectedProduct({
                            image: imageUrl,
                            filename,
                            score,
                          });
                        }
                      }}
                      aria-label={`View details for ${filename}`}
                    >
                      <div
                        className={`position-relative product-image-container ${isFourColLayout ? 'product-image-container-four-col' : ''}`}
                        style={{ height: isFourColLayout ? '260px' : '353px'}}
                      >
                        <img
                          src={imageUrl}
                          alt={filename}
                          className="w-100 h-100 object-fit-cover"
                          style={{
                            width: isFourColLayout ? '259.5px' : '353px',
                            height: isFourColLayout ? '260px' : '303px',
                            borderRadius: '8px',
                          }}
                          onError={(e) => {
                            if (!failedImages.current.has(url)) {
                              failedImages.current.add(url);
                              e.target.src = '/images/fallback.jpg';
                              console.error(`Failed to load image: ${url}`);
                            }
                          }}
                        />

                      </div>
                      <div className="d-flex flex-column product-details">
                        <p className="fs-6 fw-bold text-dark text-uppercase text-start mb-3 mt-3" style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', marginBottom: '2px' }}>{productName}</p>

                        <div className="d-flex align-items-center" style={{  height: '50px'}}>
                          <div className="d-flex align-items-center h-100" style={{ width: "100%" }}>
                            <span
                              style={{ color: 'rgba(166, 135, 64, 1)', letterSpacing: '0.3em', fontSize: '12px', fontWeight: '600'}}
                              className="fw-semibold text-xs text-uppercase">
                              {category}
                            </span>
                          </div>
                          <div className="h-4 w-px bg-secondary mx-2" style={{ height: '16px', width: '1px', backgroundColor: '#D1D5DB', margin: '0 8px' }}></div>
                          <div
                            className="d-flex align-items-center text-xs text-secondary ms-5"
                            style={{ height: '100%', gap: '4px', whiteSpace: 'nowwrap', marginLeft: '20px' }}
                          >

                            <span style={{ fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap' }}>{sizes}</span>

                          </div>
                        </div>
                      </div>
                      </a>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-secondary col-span-full" style={{ fontSize: '14px', color: '#6B7280' }}>No products found.</p>
              )}
            </div>
           

          </div>
          <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          goToPage={(page) => setCurrentPage(page)}
          />

           {/* <div className="d-flex justify-content-end gap-2 mt-4 flex-wrap" style={{ marginTop: '16px', gap: '8px', cursor:'pointer' }}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className=" mx-1 page-btn"
                style={{ padding: '6px 6px', fontSize: '12px', margin: '0 4px' }}
                aria-label="Previous page"
              >
                <ChevronLeft/>
              </button>
              {renderPageNumbers()}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="mx-1 page-btn"
                style={{ padding: '6px 6px', fontSize: '12px', margin: '0 4px'}}
                aria-label="Next page"
              >
                <ChevronRight/>
              </button>
            </div> */}
        </div>
      </div>

    </div>
  );
};

export default SearchResults;