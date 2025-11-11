import React from 'react';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import './Pagination.css';

function Pagination({ totalPages, currentPage, goToPage }) {
    
  const renderPageNumbers = () => {
    const pages = [];
    const visiblePages = [1, 2, 3, totalPages - 1, totalPages];
    for (let i = 1; i <= totalPages; i++) {
      if (visiblePages.includes(i) || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages.map((page, idx) => (
      <button
        key={idx}
        onClick={() => typeof page === 'number' && goToPage(page)}
        className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline-primary'} mx-1`}
        disabled={page === '...'}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="d-flex justify-content-end gap-2 mt-4 flex-wrap">
      <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
        className=" mx-1 page-btn"
                style={{ padding: '6px 6px', fontSize: '12px', margin: '0 4px' }}
                aria-label="Previous page">
        <ChevronLeft />
      </button>
      {renderPageNumbers()}
      <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
        className="mx-1 page-btn"
                style={{ padding: '6px 6px', fontSize: '12px', margin: '0 4px'}}
                aria-label="Next page">
        <ChevronRight />
      </button>
    </div>
  );
}

export default Pagination;
