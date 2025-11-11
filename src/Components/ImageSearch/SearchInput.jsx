// src/components/SearchInput.jsx
import { useState, useEffect } from 'react';
import { useImage } from '../../Context/ImageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import conf from "../../../conf/conf.js";

const SearchInput = () => {
  const {
    setSearchResults,
    searchDescription,
    setSearchDescription,
  } = useImage();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    if (!searchDescription.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${conf.backendUri}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: searchDescription }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results);
      setError(null);
      if (location.pathname !== '/results') {
        navigate('/results');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (location.pathname === '/results' && searchDescription.trim()) {
      handleSearch();
    }
  }, []);

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto mt-6">
      <div className="flex items-center overflow-hidden rounded-lg border border-gray-400">
        <input
          type="text"
          value={searchDescription}
          onChange={(e) => setSearchDescription(e.target.value)}
          placeholder="Search for products"
          className="flex-1 px-4 py-2 text-gray-700 focus:outline-none bg-white"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-gray-500 text-white font-semibold px-6 py-2 cursor-pointer flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Searching...</span>
            </>
          ) : (
            'Search'
          )}
        </button>
      </div>
      {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
    </form>
  );
};

export default SearchInput;
