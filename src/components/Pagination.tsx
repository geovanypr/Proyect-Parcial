import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>

      {pages.map((page, i) =>
        typeof page === 'string' ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              currentPage === page
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:border-emerald-200'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}
