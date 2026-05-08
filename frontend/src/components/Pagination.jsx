import React from 'react';
import '../styles/Pagination.css';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) {
  const pages = [];
  const maxVisible = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button
        className="pagination-btn prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← Previous
      </button>

      {startPage > 1 && (
        <>
          <button
            className="pagination-btn"
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          {startPage > 2 && <span className="pagination-dots">...</span>}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="pagination-dots">...</span>}
          <button
            className="pagination-btn"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        className="pagination-btn next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next →
      </button>
    </div>
  );
}
