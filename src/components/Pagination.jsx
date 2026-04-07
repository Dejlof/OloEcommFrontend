// src/components/Pagination.jsx
const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pageNumbers = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => start + i
  );

  return (
    <div className="flex justify-center gap-2 mt-10">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-orange-100 transition">
        ← Prev
      </button>
      {pageNumbers.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1.5 rounded-lg text-sm transition ${
            p === page
              ? 'bg-green-900 text-white'
              : 'border border-gray-300 hover:bg-orange-100'
          }`}>
          {p}
        </button>
      ))}
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-orange-100 transition">
        Next →
      </button>
    </div>
  );
};

export default Pagination;
