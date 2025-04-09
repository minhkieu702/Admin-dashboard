import React from 'react';
import { Pagination as BootstrapPagination } from 'react-bootstrap';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const renderPaginationItems = () => {
    const items = [];

    // Previous button
    items.push(
      <BootstrapPagination.Prev
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      />
    );

    // First page
    items.push(
      <BootstrapPagination.Item
        key={0}
        active={currentPage === 0}
        onClick={() => onPageChange(0)}
      >
        1
      </BootstrapPagination.Item>
    );

    // Ellipsis after first page
    if (currentPage > 2) {
      items.push(<BootstrapPagination.Ellipsis key="ellipsis1" />);
    }

    // Pages around current page
    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
      items.push(
        <BootstrapPagination.Item
          key={i}
          active={currentPage === i}
          onClick={() => onPageChange(i)}
        >
          {i + 1}
        </BootstrapPagination.Item>
      );
    }

    // Ellipsis before last page
    if (currentPage < totalPages - 3) {
      items.push(<BootstrapPagination.Ellipsis key="ellipsis2" />);
    }

    // Last page
    if (totalPages > 1) {
      items.push(
        <BootstrapPagination.Item
          key={totalPages - 1}
          active={currentPage === totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
        >
          {totalPages}
        </BootstrapPagination.Item>
      );
    }

    // Next button
    items.push(
      <BootstrapPagination.Next
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      />
    );

    return items;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="d-flex justify-content-center mt-4">
      <BootstrapPagination>{renderPaginationItems()}</BootstrapPagination>
    </div>
  );
};

export default Pagination;
