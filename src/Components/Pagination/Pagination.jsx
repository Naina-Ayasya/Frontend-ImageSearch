import React from 'react';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import './Pagination.css';

function Pagination({ totalPages, currentPage, goToPage }) {

  if(totalPages <= 1){
    return null; //no pagination when only single component.
  }
    
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
        className={`btn pagination-btn ${page === currentPage ? 'btn-primary' : 'btn-outline-primary'} mx-1 d-flex justify-content-center align-items-center
    border-0 rounded-0 p-0 px-3 fs-6 fw-semibold lh-sm text-black text-uppercase`}
        disabled={page === '...'}
        // aria-label={typeof page === 'number' ? `Go to page ${page}` : 'ellipsis'}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="d-flex justify-content-end gap-2 mt-4 flex-wrap">
      {currentPage >= 1 && (
      <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
        className=" mx-1 text-black pagination-btn"
                style={{ padding: '6px 6px', fontSize: '12px', margin: '0 4px' }}
                aria-label="Previous page">
        <ChevronLeft />
      </button>
      )}
      {renderPageNumbers()}
      {currentPage <= totalPages &&(
      <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
        className="mx-1 pagination-btn"
                style={{ padding: '6px 6px', fontSize: '12px', margin: '0 4px'}}
                aria-label="Next page">
        <ChevronRight />
      </button>
      )}
    </div>
  );
}

export default Pagination;
