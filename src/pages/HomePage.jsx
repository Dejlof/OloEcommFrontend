// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import CategoryCard from '../components/CategoryCard';
import { products as productsApi, categories as categoriesApi } from '../api/api';
import GirlShop    from '../assets/girlshop.png';
import Macbook     from '../assets/M4Macbook.png';
import MaleFashion from '../assets/GuyFashion.jpg';
import WomenFashion from '../assets/Womenwear.jpeg';
import Cosmetic    from '../assets/Cosmetic.jpg';
import Tech        from '../assets/Tech.jpg';
import Groceries   from '../assets/Groceries.jpg';
import { Loader2, ArrowRight } from 'lucide-react';

// ── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' },
  }),
};

const slideLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const slideRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

// ── Static category tiles ────────────────────────────────────────────────────
const CATEGORY_TILES = [
  { name: "Men's Fashion", img: MaleFashion, query: "men" },
  { name: "Women's Fashion", img: WomenFashion, query: "women" },
  { name: "Cosmetics", img: Cosmetic, query: "cosmetic" },
  { name: "Tech", img: Tech, query: "tech" },
  { name: "Groceries", img: Groceries, query: "groceries" },
];

// ── ProductGrid helper ───────────────────────────────────────────────────────
function ProductGrid({ items, loading }) {
  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="animate-spin text-orange-400" size={32} />
    </div>
  );
  if (!items.length) return (
    <p className="text-center text-gray-400 py-8 text-sm">No products yet.</p>
  );
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {items.map((p, i) => (
        <motion.div
          key={p.id}
          custom={i}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {(() => {
            const reviews = Array.isArray(p.reviews) ? p.reviews : (p.reviews?.$values ?? []);
            const rating = parseFloat(p.averageRating)
              || (reviews.length ? reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length : 0);
            return (
              <CategoryCard
                product={p}
                ImgSource={p.productImages?.[0]?.url}
                altname={p.name}
                Name={p.name}
                Price={`₦${Number(p.price).toLocaleString()}`}
                rating={rating}
                totalRatings={reviews.length}
                productId={p.id}
              />
            );
          })()}
        </motion.div>
      ))}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ title, linkTo }) {
  return (
    <motion.div
      className="flex justify-between items-center mb-6"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <h2 className="text-2xl font-bold text-green-900">{title}</h2>
      {linkTo && (
        <Link to={linkTo}
          className="text-sm text-orange-500 flex items-center gap-1 hover:text-orange-700 transition">
          See All <ArrowRight size={14} />
        </Link>
      )}
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const HomePage = () => {
  const navigate = useNavigate();
  const [popular, setPopular]       = useState([]);
  const [latest, setLatest]         = useState([]);
  const [popularLoading, setPop]    = useState(true);
  const [latestLoading, setLat]     = useState(true);
  const [searchQuery, setSearch]    = useState('');

  useEffect(() => {
    productsApi.getPopular()
      .then(d => setPopular((d ?? []).slice(0, 10)))
      .catch(() => {})
      .finally(() => setPop(false));

    productsApi.getAll({ pageNumber: 1, pageSize: 10 })
      .then(d => setLatest(Array.isArray(d) ? d : (d?.items ?? [])))
      .catch(() => {})
      .finally(() => setLat(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim())
      navigate(`/category?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <MainLayout>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-orange-200 pb-6 px-4 md:px-6 overflow-hidden">
        <div className="flex flex-col md:flex-row w-[92%] md:w-[90%] m-auto items-center gap-8">

          <motion.div
            className="md:basis-1/2 pt-10 md:pt-16 pb-8 text-green-900"
            variants={slideLeft}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className="font-bold text-3xl leading-tight mb-3"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              Oloja Marketplace —<br/>Your Ultimate Shopping Destination!
            </motion.h1>
            <motion.p
              className="text-base mb-6 text-green-800"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              Buy & sell with ease. Thousands of products from verified vendors across Nigeria.
            </motion.p>

            {/* Hero search */}
            <motion.form
              onSubmit={handleSearch}
              className="flex gap-2 max-w-sm mb-6"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for products…"
                className="flex-1 px-4 py-2 rounded-lg border border-green-800 bg-orange-100 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 text-sm"
              />
              <button type="submit"
                className="px-4 py-2 bg-green-900 text-orange-100 rounded-lg text-sm hover:bg-green-800 transition">
                Search
              </button>
            </motion.form>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
              <Link to="/category"
                className="inline-block px-5 py-2.5 bg-green-900 text-orange-100 rounded-lg hover:bg-green-800 transition text-sm font-medium">
                Explore All Products
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="hidden md:flex md:basis-1/2 justify-center py-6"
            variants={slideRight}
            initial="hidden"
            animate="visible"
          >
            <motion.img
              src={GirlShop}
              alt="Shop"
              className="h-80 object-contain"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Category tiles ───────────────────────────────────────────────── */}
      <section className="my-16">
        <div className="w-[85%] m-auto">
          <SectionHeader title="Shop by Category" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {CATEGORY_TILES.map((cat, i) => (
              <motion.div
                key={cat.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <Link
                  to={`/category?search=${cat.query}`}
                  className="group text-center block transition">
                  <div className="overflow-hidden rounded-2xl bg-gray-100 h-48">
                    <img src={cat.img} alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-green-900">{cat.name}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Best Sellers ─────────────────────────────────────────────────── */}
      <section className="my-16 bg-orange-50 py-12">
        <div className="w-[85%] m-auto">
          <SectionHeader title="Best Sellers" linkTo="/category?sortBy=reviews" />
          <ProductGrid items={popular} loading={popularLoading} />
        </div>
      </section>

      {/* ── Promo banner ─────────────────────────────────────────────────── */}
      <section className="my-10 bg-orange-100 py-8 overflow-hidden">
        <div className="flex flex-col md:flex-row w-[80%] m-auto items-center gap-6">
          <motion.div
            className="md:basis-1/2 flex justify-center"
            variants={slideLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.img
              src={Macbook}
              alt="MacBook Air M4"
              className="w-80 h-60 object-contain"
              whileHover={{ scale: 1.05, rotate: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            />
          </motion.div>
          <motion.div
            className="md:basis-1/2 text-green-900"
            variants={slideRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-orange-500 text-sm font-medium mb-1 uppercase tracking-wide">Oloja's Week Deal</p>
            <h2 className="text-3xl font-bold mb-2">MacBook Air M4</h2>
            <p className="text-sm text-green-700 mb-4">
              Blazing-fast M4 chip, 18-hour battery, 12MP camera, dual external display support.
            </p>
            <p className="text-2xl font-bold mb-4">₦1,870,000</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/category?search=macbook"
                className="inline-block px-5 py-2.5 bg-green-900 text-orange-100 rounded-lg hover:bg-green-800 transition text-sm">
                Shop Now
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Latest Products ───────────────────────────────────────────────── */}
      <section className="my-16">
        <div className="w-[85%] m-auto">
          <SectionHeader title="Latest Products" linkTo="/category" />
          <ProductGrid items={latest} loading={latestLoading} />
        </div>
      </section>

    </MainLayout>
  );
};

export default HomePage;
