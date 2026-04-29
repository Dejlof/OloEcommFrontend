// src/pages/CategoryPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import CategoryCard from '../components/CategoryCard';
import { products as productsApi, categories as categoriesApi } from '../api/api';
import { Loader2 } from 'lucide-react';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 12;

const CategoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [productList,   setProductList]   = useState([]);
  const [total,         setTotal]         = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [categoryList,  setCategoryList]  = useState([]);

  // URL-driven state
  const search     = searchParams.get('search')       ?? '';
  const categoryId = searchParams.get('categoryId')   ?? '';
  const categoryName = searchParams.get('categoryName') ?? '';
  const sortBy     = searchParams.get('sortBy')       ?? '';
  const sortDesc   = searchParams.get('sortDesc')     === 'true';
  const minPrice   = searchParams.get('minPrice')     ?? '';
  const maxPrice   = searchParams.get('maxPrice')     ?? '';
  const page       = Number(searchParams.get('page')  ?? 1);

  // Load category list for dropdown
  useEffect(() => {
    categoriesApi.getAll({ pageNumber: 1, pageSize: 100 })
      .then(d => setCategoryList(d?.items ?? d ?? []))
      .catch(() => {});
  }, []);

  // Fetch products whenever any filter changes
  useEffect(() => {
    setLoading(true);
    setError('');

    const fetchProducts = categoryId
      ? productsApi.getByCategory(categoryId, {
          pageNumber: page, pageSize: PAGE_SIZE,
          ...(search   && { search }),
          ...(sortBy   && { sortBy }),
          ...(sortDesc && { isSortDescending: true }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
        }).then(res => ({
          items: res?.items ?? (Array.isArray(res) ? res : (res?.products ?? [])),
          total: res?.totalCount ?? (Array.isArray(res) ? res.length : 0),
          totalPages: res?.totalPages ?? 1,
        }))
      : productsApi.getAll({
          pageNumber: page,
          pageSize:   PAGE_SIZE,
          ...(search   && { search }),
          ...(sortBy   && { sortBy }),
          ...(sortDesc && { isSortDescending: true }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
        }).then(data => ({
          items: Array.isArray(data) ? data : (data?.items ?? []),
          total: data?.totalCount ?? (Array.isArray(data) ? data.length : 0),
          totalPages: data?.totalPages ?? 1,
        }));

    fetchProducts
      .then(({ items, total, totalPages: tp }) => {
        // Apply client-side sort/filter when inside a category (API may not support it there)
        let filtered = items;
        if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
        if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));
        if (search)   filtered = filtered.filter(p =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()));

        if (sortBy === 'price') {
          filtered = [...filtered].sort((a, b) =>
            sortDesc ? b.price - a.price : a.price - b.price);
        } else if (sortBy === 'name') {
          filtered = [...filtered].sort((a, b) =>
            sortDesc ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name));
        }

        const filteredTotal = categoryId ? filtered.length : total;
        setProductList(filtered);
        setTotal(filteredTotal);
        setTotalPages(categoryId ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)) : tp);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, categoryId, sortBy, sortDesc, minPrice, maxPrice, page]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    // Only reset to page 1 when changing filters, not when changing the page itself
    if (key !== 'page') p.delete('page');
    setSearchParams(p);
  };

  const handleCategoryChange = (e) => {
    const p = new URLSearchParams(searchParams);
    const val = e.target.value;
    if (val) {
      const cat = categoryList.find(c => String(c.id) === val);
      p.set('categoryId', val);
      if (cat) p.set('categoryName', cat.name);
    } else {
      p.delete('categoryId');
      p.delete('categoryName');
    }
    p.delete('page');
    setSearchParams(p);
  };


  const pageTitle = categoryName
    ? categoryName
    : search
      ? `Results for "${search}"`
      : 'All Products';

  return (
    <MainLayout>
      <div className="w-[90%] m-auto my-10">

        {/* Header + filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-green-900">
              {pageTitle}
              {total > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({total} product{total !== 1 ? 's' : ''})
                </span>
              )}
            </h2>
          </div>

          <div className="flex flex-wrap gap-3 items-center text-sm">

            {/* ── Category dropdown — fetched from API ── */}
            <select
              value={categoryId}
              onChange={handleCategoryChange}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-green-900 focus:outline-none focus:ring-1 focus:ring-green-700 min-w-[140px]">
              <option value="">All Categories</option>
              {categoryList.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Price range */}
            <input type="number" placeholder="Min ₦" value={minPrice}
              onChange={e => setParam('minPrice', e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 w-24 text-green-900 focus:outline-none focus:ring-1 focus:ring-green-700" />
            <span className="text-gray-400">–</span>
            <input type="number" placeholder="Max ₦" value={maxPrice}
              onChange={e => setParam('maxPrice', e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 w-24 text-green-900 focus:outline-none focus:ring-1 focus:ring-green-700" />

            {/* Sort */}
            <select
              value={`${sortBy}-${sortDesc}`}
              onChange={e => {
                const [sb, sd] = e.target.value.split('-');
                const p = new URLSearchParams(searchParams);
                if (sb) p.set('sortBy', sb); else p.delete('sortBy');
                if (sd === 'true') p.set('sortDesc', 'true'); else p.delete('sortDesc');
                p.delete('page');
                setSearchParams(p);
              }}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-green-900 focus:outline-none focus:ring-1 focus:ring-green-700">
              <option value="-false">Default</option>
              <option value="price-false">Price: Low → High</option>
              <option value="price-true">Price: High → Low</option>
              <option value="name-false">Name: A → Z</option>
            </select>

            {/* Clear */}
            {(search || categoryId || sortBy || minPrice || maxPrice) && (
              <button onClick={() => setSearchParams({})}
                className="text-orange-500 underline text-xs hover:text-orange-700">
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin text-orange-400" size={36} />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : productList.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No products found. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {productList.map(product => {
              const reviews = Array.isArray(product.reviews)
                ? product.reviews
                : (product.reviews?.$values ?? []);
              const rating = parseFloat(product.averageRating)
                || (reviews.length
                  ? reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length
                  : 0);
              return (
                <CategoryCard
                  key={product.id}
                  productId={product.id}
                  ImgSource={product.productImages?.[0]?.url}
                  altname={product.name}
                  Name={product.name}
                  Price={`₦${Number(product.price).toLocaleString()}`}
                  rating={rating}
                  totalRatings={reviews.length}
                  quantityInStock={product.quantityInStock ?? 0}
                />
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={p => setParam('page', p)}
            /></div>
        )}
      </div>
    </MainLayout>
  );
};

export default CategoryPage;
