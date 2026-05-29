// src/pages/ProductPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import RatingSummary from '../components/RatingSummary';
import OtherProductsLike from '../components/OtherProductsLike';
import { products as productsApi, reviews as reviewsApi, wishlist as wishlistApi } from '../api/api'; // reviewsApi used in handleReviewSubmit
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { Heart, ArrowLeft, Loader2, ShoppingCart } from 'lucide-react';

function StarRow({ rating, size = 'text-sm' }) {
  return (
    <span className={`flex gap-0.5 ${size}`}>
      {[1,2,3,4,5].map(i => (
        <FontAwesomeIcon key={i}
          icon={rating >= i ? faStar : rating >= i - 0.5 ? faStarHalfAlt : faStar}
          className={rating >= i || rating >= i - 0.5 ? 'text-yellow-500' : 'text-gray-300'} />
      ))}
    </span>
  );
}

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct]         = useState(null);
  const [reviewList, setReviewList]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [qty, setQty]                 = useState(1);
  const [activeImg, setActiveImg]     = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [cartMsg, setCartMsg]         = useState('');
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlisted, setWishlisted]   = useState(false);

  // Review form
  const [reviewForm, setReviewForm]   = useState({ comment: '', rating: 5 });
  const [reviewError, setReviewError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productsApi.getById(id)
      .then(prod => {
        setProduct(prod);
        // Use reviews embedded in the product response (most reliable)
        const raw = prod?.reviews;
        const embedded = Array.isArray(raw) ? raw : (raw?.$values ?? []);
        setReviewList(embedded);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (hasVariants && !selectedVariant) { setCartMsg('Please select a variant.'); return; }
    setCartLoading(true);
    setCartMsg('');
    try {
      await addToCart(Number(id), qty, selectedVariant?.id);
      setCartMsg('Added to cart!');
      setTimeout(() => setCartMsg(''), 2500);
    } catch (err) {
      setCartMsg(err.message ?? 'Failed to add to cart.');
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await wishlistApi.add(Number(id), { wishlistItem: product.name });
      setWishlisted(true);
    } catch {}
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!reviewForm.comment.trim()) { setReviewError('Please write a comment.'); return; }
    setReviewLoading(true);
    setReviewError('');
    try {
      const newReview = await reviewsApi.create(id, reviewForm.rating, { comment: reviewForm.comment });
      setReviewList(prev => [newReview, ...prev]);
      setReviewForm({ comment: '', rating: 5 });
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return (
    <MainLayout>
      <div className="flex justify-center items-center py-32">
        <Loader2 className="animate-spin text-orange-400" size={40} />
      </div>
    </MainLayout>
  );

  if (error || !product) return (
    <MainLayout>
      <div className="text-center py-24 text-red-500">{error || 'Product not found.'}</div>
    </MainLayout>
  );

  const images      = product.productImages ?? [];
  const variants    = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const avgVariantPrice = hasVariants
    ? variants.reduce((s, v) => s + (v.priceOverride ?? 0), 0) / variants.length
    : 0;
  const displayPrice = selectedVariant?.priceOverride ?? (hasVariants ? avgVariantPrice : product.price);
  const displayStock = selectedVariant?.quantityInStock ?? product.quantityInStock;
  const variantLabel = v => [v.color, v.size].filter(Boolean).join(' / ') || v.sku || `#${v.id}`;

  const avgRating = parseFloat(product.averageRating)
    || (reviewList.length
      ? reviewList.reduce((s, r) => s + Number(r.rating), 0) / reviewList.length
      : 0);

  const ratingDistribution = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: reviewList.filter(rv => Math.round(rv.rating) === r).length,
  }));

  return (
    <MainLayout>
      <div className="w-[92%] md:w-[80%] m-auto py-10">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-green-900 hover:text-orange-500 mb-6 transition">
          <ArrowLeft size={16} /> Go Back
        </button>

        {/* Product detail */}
        <div className="flex flex-col md:flex-row gap-10">

          {/* Images */}
          <div className="md:basis-1/2">
            <div className="bg-gray-100 rounded-2xl overflow-hidden h-80 md:h-96 flex items-center justify-center">
              {images[activeImg]?.url
                ? <img src={images[activeImg].url} alt={product.name} className="h-full object-contain" />
                : <div className="text-gray-300 text-6xl">📦</div>}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === activeImg ? 'border-orange-400' : 'border-transparent'}`}>
                    <img src={img.url} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:basis-1/2">
            <h1 className="text-2xl font-bold text-green-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-3">
              <StarRow rating={avgRating} />
              <span className="text-sm text-gray-500">({reviewList.length} reviews)</span>
            </div>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">{product.description}</p>

            {/* Variant selector */}
            {hasVariants && (
              <div className="mb-5">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Select Variant</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => { setSelectedVariant(v); setQty(1); }}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
                        selectedVariant?.id === v.id
                          ? 'border-green-900 bg-green-900 text-orange-100'
                          : 'border-gray-300 text-green-900 hover:border-green-700'
                      } ${v.quantityInStock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                      disabled={v.quantityInStock === 0}
                    >
                      {variantLabel(v)}
                      {v.priceOverride && (
                        <span className="ml-1.5 text-xs opacity-75">
                          ₦{Number(v.priceOverride).toLocaleString()}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-2xl font-bold text-green-900">
                {hasVariants && !selectedVariant && <span className="text-base font-normal text-gray-400 mr-1">avg</span>}
                ₦{Number(displayPrice).toLocaleString()}
              </span>
              {!hasVariants && product.discountPrice && product.discountPrice < product.price && (
                <span className="text-sm line-through text-gray-400">
                  ₦{Number(product.discountPrice).toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-sm mb-5">
              <span className={displayStock > 0 ? 'text-green-600' : 'text-red-500'}>
                {displayStock > 0 ? `${displayStock} in stock` : 'Out of stock'}
              </span>
            </p>

            {/* Qty + Add to cart */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2 text-sm">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="hover:text-orange-500 text-lg font-bold w-5 text-center">−</button>
                <span className="w-6 text-center font-medium">{qty}</span>
                <button onClick={() => setQty(q => Math.min(displayStock, q + 1))}
                  className="hover:text-orange-500 text-lg font-bold w-5 text-center">+</button>
              </div>

              <button
                disabled={cartLoading || displayStock === 0 || (hasVariants && !selectedVariant)}
                onClick={handleAddToCart}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-300 text-green-900 rounded-xl font-medium text-sm hover:bg-orange-400 transition disabled:opacity-50">
                <ShoppingCart size={16} />
                {cartLoading ? 'Adding…' : hasVariants && !selectedVariant ? 'Select a variant' : 'Add to Cart'}
              </button>

              <button onClick={handleWishlist}
                className={`p-2.5 rounded-xl border transition ${wishlisted ? 'text-red-500 border-red-300 bg-red-50' : 'text-gray-400 border-gray-300 hover:text-red-400'}`}>
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {cartMsg && (
              <p className={`text-sm mt-1 ${cartMsg.includes('Added') ? 'text-green-600' : 'text-red-500'}`}>
                {cartMsg}
              </p>
            )}

            {(product.vendorBusinessName || product.createdBy) && (
              <p className="text-xs text-gray-400 mt-3">
                Sold by{' '}
                {product.vendorId ? (
                  <Link
                    to={`/vendor/profile/${product.vendorId}`}
                    className="font-medium text-green-800 hover:text-orange-500 underline transition"
                  >
                    {product.vendorBusinessName || product.createdBy}
                  </Link>
                ) : (
                  <span className="font-medium text-green-800">
                    {product.vendorBusinessName || product.createdBy}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16">
          <h3 className="text-xl font-bold text-green-900 mb-6">Customer Reviews</h3>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Rating summary */}
            {reviewList.length > 0 && (
              <div className="md:basis-1/3">
                <RatingSummary
                  averageRating={parseFloat(avgRating.toFixed(1))}
                  totalRatings={reviewList.length}
                  ratingDistribution={ratingDistribution}
                />
              </div>
            )}

            {/* Review list + form */}
            <div className="md:basis-2/3">
              {/* Write review */}
              <form onSubmit={handleReviewSubmit}
                className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-green-900 mb-3 text-sm">
                  {isAuthenticated ? 'Write a Review' : 'Log in to leave a review'}
                </h4>
                {reviewError && <p className="text-red-500 text-xs mb-2">{reviewError}</p>}

                <div className="flex gap-2 mb-3">
                  {[1,2,3,4,5].map(r => (
                    <button key={r} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: r }))}>
                      <FontAwesomeIcon icon={faStar}
                        className={r <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'} />
                    </button>
                  ))}
                </div>

                <textarea
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Share your experience with this product…"
                  rows={3}
                  disabled={!isAuthenticated}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                />

                <button type="submit" disabled={reviewLoading || !isAuthenticated}
                  className="mt-3 px-4 py-2 bg-green-900 text-white text-sm rounded-lg hover:bg-green-800 disabled:opacity-50 transition">
                  {reviewLoading ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>

              {/* Review items */}
              {reviewList.length === 0 ? (
                <p className="text-sm text-gray-400">No reviews yet. Be the first!</p>
              ) : (
                reviewList.map((r, i) => (
                  <div key={i} className="border-b border-gray-200 py-4 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <StarRow rating={r.rating} />
                      <span className="text-xs text-gray-400">{r.createdBy}</span>
                    </div>
                    <p className="text-gray-700">{r.comment}</p>
                    {r.reviewDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(r.reviewDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Similar products */}
        <OtherProductsLike currentProductId={Number(id)} />
      </div>
    </MainLayout>
  );
};

export default ProductPage;
