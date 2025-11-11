import React from 'react';

const ProductDescription = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full p-6 relative shadow-lg"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl"
          aria-label="Close modal"
        >
          ✕
        </button>
        <img
          src={product.image}
          alt={product.filename}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
        <h2 className="text-xl font-semibold mb-2">{product.filename}</h2>
        <p className="text-gray-700">
          This is a dummy description for the product. You can replace this with actual product details later.
        </p>
      </div>
    </div>
  );
};

export default ProductDescription;
