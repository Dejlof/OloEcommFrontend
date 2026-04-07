// src/components/Category.jsx
// Categories are fetched live from the API.
// Images are mapped by category name keyword — the images stay local assets
// so the homepage looks great even before vendors upload product photos.
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categories as categoriesApi } from '../api/api';

import MaleFashion  from '../assets/GuyFashion.jpg';
import WomenFashion from '../assets/Womenwear.jpeg';
import Cosmetic     from '../assets/Cosmetic.jpg';
import Tech         from '../assets/Tech.jpg';
import Groceries    from '../assets/Groceries.jpg';
import GirlShop     from '../assets/girlshop.png'; // fallback

// Map a category name to a local hero image by keyword matching
const IMAGE_MAP = [
  { keywords: ["men", "male", "guy", "boy", "cloth"],     img: MaleFashion  },
  { keywords: ["women", "female", "lady", "girl", "fashion"], img: WomenFashion },
  { keywords: ["cosmetic", "beauty", "makeup", "skin"],   img: Cosmetic     },
  { keywords: ["tech", "phone", "laptop", "electronic", "gadget", "computer"], img: Tech },
  { keywords: ["grocer", "food", "fruit", "vegetable", "fresh"], img: Groceries },
];

function resolveImage(categoryName = '') {
  const lower = categoryName.toLowerCase();
  for (const entry of IMAGE_MAP) {
    if (entry.keywords.some(k => lower.includes(k))) return entry.img;
  }
  return GirlShop; // fallback for any category not matched
}

const Category = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    categoriesApi.getAll()
      .then(data => setCategoryList(Array.isArray(data) ? data : (data?.items ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="my-16 flex justify-center">
      <div className="animate-pulse text-orange-300 text-sm">Loading categories…</div>
    </div>
  );

  if (!categoryList.length) return null;

  return (
    <div className="my-16">
      <div className="w-[85%] m-auto">
        <h2 className="text-2xl font-bold text-green-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {categoryList.map(cat => (
            <Link
              key={cat.id}
              to={`/category?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`}
              className="group text-center transition hover:-translate-y-1 duration-300"
            >
              <div className="overflow-hidden rounded-2xl bg-gray-100 h-48">
                <img
                  src={resolveImage(cat.name)}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <p className="mt-2 text-sm font-medium text-orange-500">{cat.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Category;
