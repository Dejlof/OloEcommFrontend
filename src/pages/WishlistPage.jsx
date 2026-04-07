// src/pages/WishlistPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import { wishlist as wishlistApi } from '../api/api';
import { useCart } from '../context/CartContext';
import { Heart, Loader2, Trash2, ShoppingCart } from 'lucide-react';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 10;

const WishlistPage = () => {
  const { addToCart } = useCart();
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    wishlistApi.getAll({ pageNumber: page, pageSize: PAGE_SIZE })
      .then(data => {
        setItems(data?.items ?? []);
        setTotalPages(data?.totalPages ?? 1);
        setTotalCount(data?.totalCount ?? 0);
      })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  const handleRemove = async (id) => {
    try {
      await wishlistApi.remove(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {}
  };

  const handleAddToCart = async (item) => {
    setAddingId(item.id);
    try {
      await addToCart(item.productId ?? item.id, 1);
    } catch {}
    setAddingId(null);
  };

  return (
    <MainLayout>
      <div className="w-[85%] m-auto py-10 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-green-900 flex items-center gap-2">
            <Heart size={24} className="text-orange-400" /> Wishlist
          </h1>
          {totalCount > 0 && (
            <span className="text-sm text-gray-500">{totalCount} item{totalCount !== 1 ? 's' : ''}</span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-orange-400" size={36} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Heart size={48} className="text-orange-200 mb-4" />
            <p className="text-green-900 mb-2">Your wishlist is empty.</p>
            <Link to="/category" className="text-orange-500 underline text-sm">
              Discover products
            </Link>
          </div>
        ) : (
          <>
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="min-w-0">
                    <Link to={`/product/${item.productId ?? item.id}`}
                      className="font-medium text-green-900 hover:text-orange-500 truncate block transition">
                      {item.wishlistItem ?? `Product #${item.productId}`}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Added {new Date(item.createdDate ?? Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={addingId === item.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-300 text-green-900 rounded-lg text-xs font-medium hover:bg-orange-400 transition disabled:opacity-50">
                    <ShoppingCart size={13} />
                    {addingId === item.id ? 'Adding…' : 'Add to Cart'}
                  </button>
                  <button onClick={() => handleRemove(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default WishlistPage;
