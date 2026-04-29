// src/components/CategoryCard.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart } from 'lucide-react';

const CategoryCard = ({
  productId,
  ImgSource,
  altname,
  Name,
  Price,
  rating = 0,
  totalRatings = 0,
  quantityInStock = 1,
}) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);
  const [added,  setAdded]  = useState(false);
  const [err,    setErr]    = useState('');

  const outOfStock = quantityInStock <= 0;

  const stars = [1,2,3,4,5].map(i => {
    const full = rating >= i;
    const half = !full && rating >= i - 0.5;
    return (
      <FontAwesomeIcon
        key={i}
        icon={full || half ? (half ? faStarHalfAlt : faStar) : faStar}
        className={`text-[11px] ${full || half ? 'text-yellow-500' : 'text-gray-300'}`}
      />
    );
  });

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (outOfStock) return;
    setAdding(true); setErr('');
    try {
      await addToCart(productId, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      setErr(error.message);
      setTimeout(() => setErr(''), 3000);
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      className="group relative text-left"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link to={`/product/${productId}`} className="block">
        <div className="overflow-hidden rounded-xl bg-gray-100 h-44 relative">
          {ImgSource ? (
            <motion.img
              src={ImgSource}
              alt={altname}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.4 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">📦</div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-xs font-semibold text-red-500 bg-white px-2 py-1 rounded-full shadow-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <h3 className="mt-2 text-sm font-medium text-green-900 truncate">{Name}</h3>
        <p className="text-sm font-bold text-green-900">{Price}</p>

        <div className="flex items-center gap-1 my-1">
          {stars}
          <span className="text-[10px] text-gray-400 ml-1">
            ({totalRatings > 0 ? totalRatings : 'No reviews'})
          </span>
        </div>
      </Link>

      <motion.button
        onClick={handleAddToCart}
        disabled={adding || outOfStock}
        title={outOfStock ? 'Out of stock' : err || (added ? 'Added!' : 'Add to cart')}
        whileHover={!outOfStock ? { scale: 1.03 } : {}}
        whileTap={!outOfStock ? { scale: 0.97 } : {}}
        className={`mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border text-xs rounded-lg transition
          ${outOfStock
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            : added
              ? 'bg-green-900 text-orange-100 border-green-900'
              : err
                ? 'bg-red-50 border-red-300 text-red-500'
                : 'bg-white border-orange-300 text-orange-500 hover:bg-orange-400 hover:text-white hover:border-orange-400'
          } disabled:opacity-60`}
      >
        <ShoppingCart size={12} />
        {outOfStock ? 'Out of Stock' : adding ? 'Adding…' : added ? '✓ Added' : err ? 'Try again' : 'Add to Cart'}
      </motion.button>
    </motion.div>
  );
};

export default CategoryCard;
