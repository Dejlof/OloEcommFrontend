// src/components/OtherProductsLike.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoryCard from './CategoryCard';
import { products as productsApi } from '../api/api';
import { ArrowRight, Loader2 } from 'lucide-react';

const OtherProductsLike = ({ currentProductId }) => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch popular products and exclude the current one
    productsApi.getPopular()
      .then(data => {
        const filtered = (data ?? [])
          .filter(p => p.id !== currentProductId)
          .slice(0, 5);
        setItems(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentProductId]);

  if (loading) return (
    <div className="flex justify-center py-10">
      <Loader2 className="animate-spin text-orange-300" size={28} />
    </div>
  );

  if (items.length === 0) return null;

  return (
    <div className="mt-16">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xl font-bold text-green-900">You May Also Like</h3>
        <Link to="/category"
          className="text-sm text-orange-500 flex items-center gap-1 hover:text-orange-700 transition">
          See All <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
        {items.map(p => (
          <CategoryCard
            key={p.id}
            product={p}
            ImgSource={p.productImages?.[0]?.url}
            altname={p.name}
            Name={p.name}
            Price={`₦${Number(p.price).toLocaleString()}`}
            rating={p.averageRating ?? 0}
            totalRatings={p.reviews?.length ?? 0}
            productId={p.id}
          />
        ))}
      </div>
    </div>
  );
};

export default OtherProductsLike;
