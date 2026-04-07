// src/pages/VendorProfilePage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Pagination from '../components/Pagination';
import { auth, products as productsApi } from '../api/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { ArrowLeft, Loader2, Package, Star, BarChart2, ShoppingBag } from 'lucide-react';

const PAGE_SIZE = 12;

function StarRow({ rating }) {
  return (
    <span className="flex gap-0.5 text-sm">
      {[1, 2, 3, 4, 5].map(i => (
        <FontAwesomeIcon
          key={i}
          icon={rating >= i ? faStar : rating >= i - 0.5 ? faStarHalfAlt : faStar}
          className={rating >= i || rating >= i - 0.5 ? 'text-yellow-500' : 'text-gray-300'}
        />
      ))}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, colour }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colour}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-green-900">{value}</p>
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const price = Number(product.price);
  const discount = product.discountPrice && Number(product.discountPrice) < price
    ? Number(product.discountPrice)
    : null;
  const img     = product.productImages?.[0]?.url;
  const reviews = product.reviews ?? [];
  const rating  = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group"
    >
      <div className="h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
        {img
          ? <img src={img} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
          : <span className="text-5xl">📦</span>}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-green-900 text-sm truncate mb-1">{product.name}</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <StarRow rating={rating} />
            <span className="text-xs text-gray-400">({reviews.length})</span>
          </div>
        )}
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-green-900 text-sm">₦{price.toLocaleString()}</span>
          {discount && (
            <span className="text-xs line-through text-gray-400">₦{discount.toLocaleString()}</span>
          )}
        </div>
        {product.quantityInStock === 0 && (
          <p className="text-xs text-red-500 mt-1">Out of stock</p>
        )}
      </div>
    </Link>
  );
}

const VendorProfilePage = () => {
  const { email } = useParams();
  const navigate  = useNavigate();
  const decodedEmail = decodeURIComponent(email);

  const [vendor,       setVendor]       = useState(null);
  const [products,     setProducts]     = useState([]);
  const [totalCount,   setTotalCount]   = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [prodsLoading, setProdsLoading] = useState(false);
  const [error,        setError]        = useState('');
  const [statsProducts, setStatsProducts] = useState([]);

  // Fetch vendor info once
  useEffect(() => {
    auth.getUser(decodedEmail)
      .then(data => setVendor(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [decodedEmail]);

  // Fetch vendor products when page changes (table display)
  useEffect(() => {
    setProdsLoading(true);
    productsApi.getByVendor(decodedEmail, { pageNumber: page, pageSize: PAGE_SIZE })
      .then(data => {
        setProducts(data?.items ?? []);
        setTotalCount(data?.totalCount ?? 0);
        setTotalPages(data?.totalPages ?? 1);
      })
      .catch(() => {})
      .finally(() => setProdsLoading(false));
  }, [decodedEmail, page]);

  // Fetch ALL products once for accurate stats
  useEffect(() => {
    productsApi.getByVendor(decodedEmail, { pageNumber: 1, pageSize: 500 })
      .then(data => setStatsProducts(data?.items ?? []))
      .catch(() => {});
  }, [decodedEmail]);

  // Computed stats from full dataset, not just current page
  const allReviews   = statsProducts.flatMap(p => p.reviews ?? []);
  const totalRatings = allReviews.length;
  const avgRating    = totalRatings > 0
    ? allReviews.reduce((s, r) => s + r.rating, 0) / totalRatings
    : 0;

  if (loading) return (
    <MainLayout>
      <div className="flex justify-center items-center py-32">
        <Loader2 className="animate-spin text-orange-400" size={40} />
      </div>
    </MainLayout>
  );

  if (error) return (
    <MainLayout>
      <div className="text-center py-24 text-red-500">{error}</div>
    </MainLayout>
  );

  const displayName = vendor
    ? [vendor.firstName, vendor.lastName].filter(Boolean).join(' ') || vendor.username || decodedEmail
    : decodedEmail;

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

  return (
    <MainLayout>
      <div className="w-[90%] m-auto py-10">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-green-900 hover:text-orange-500 mb-6 transition"
        >
          <ArrowLeft size={16} /> Go Back
        </button>

        {/* Vendor header */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-green-900 flex items-center justify-center text-orange-100 text-2xl font-bold flex-shrink-0">
            {initials || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-green-900">{displayName}</h1>
            <p className="text-sm text-gray-500">{decodedEmail}</p>
            {vendor?.username && vendor.username !== displayName && (
              <p className="text-xs text-gray-400 mt-0.5">@{vendor.username}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatCard
            label="Total Products"
            value={totalCount}
            icon={Package}
            colour="bg-green-600"
          />
          <StatCard
            label="Avg Rating"
            value={avgRating > 0 ? `${avgRating.toFixed(1)} ★` : '—'}
            icon={Star}
            colour="bg-yellow-400"
          />
          <StatCard
            label="Total Ratings"
            value={totalRatings > 0 ? totalRatings : '—'}
            icon={BarChart2}
            colour="bg-blue-500"
          />
        </div>

        {/* Products grid */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-green-900">
            Products <span className="text-gray-400 text-sm font-normal">({totalCount})</span>
          </h2>
        </div>

        {prodsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-orange-400" size={36} />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <ShoppingBag size={40} className="text-orange-200 mb-3" />
            <p className="text-gray-500">This vendor has no products listed yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default VendorProfilePage;
