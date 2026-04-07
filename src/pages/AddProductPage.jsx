// src/pages/AddProductPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import Input from '../components/Input';
import Label from '../components/Label';
import Header from '../components/Header';
import Button from '../components/Button';
import { products as productsApi, categories as categoriesApi } from '../api/api';
import { CheckCircle } from 'lucide-react';

const AddProductPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', description: '', quantityInStock: '',
    price: '', discountPrice: '',
  });
  const [categoryId, setCategoryId] = useState('');
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [createdId, setCreatedId] = useState(null);

  useEffect(() => {
    categoriesApi.getAll()
      .then(data => setCategoryList(Array.isArray(data) ? data : (data?.items ?? [])))
      .catch(() => {});
  }, []);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) { toast.error('Please select a category.'); return; }
    if (!form.name || !form.price || !form.quantityInStock) {
      toast.error('Name, price and quantity are required.'); return;
    }

    setLoading(true);
    try {
      const product = await productsApi.create(categoryId, {
        name:            form.name,
        description:     form.description,
        price:           parseFloat(form.price),
        discountPrice:   form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        quantityInStock: parseInt(form.quantityInStock, 10),
      });
      setCreatedId(product.id);
    } catch (err) {
      toast.error(err.message ?? 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  if (createdId) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <CheckCircle size={48} className="text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-green-900 mb-2">Product Created!</h2>
          <p className="text-sm text-gray-500 mb-6">Now add images to make it look great.</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/productimages/${createdId}`)}
              className="px-5 py-2.5 bg-green-900 text-orange-100 rounded-xl text-sm hover:bg-green-800 transition">
              Add Images →
            </button>
            <button
              onClick={() => { setCreatedId(null); setForm({ name:'', description:'', quantityInStock:'', price:'', discountPrice:'' }); }}
              className="px-5 py-2.5 border border-gray-300 text-green-900 rounded-xl text-sm hover:bg-gray-50 transition">
              Add Another Product
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col justify-center items-center w-[92%] sm:w-[75%] m-auto min-h-[80vh] text-sm pt-16 pb-16">
        <Header title="Add Your Product" word="Fill in the details below to list your product" />

        <form onSubmit={handleSubmit} className="pt-4 w-full max-w-lg">
          <div>
            <Label label="Product Name" />
            <Input name="name" value={form.name} onChange={handle}
              placeholder="Name of product" type="text" wmd="w-150" />
          </div>

          <div className="pt-4">
            <Label label="Description" />
            <textarea name="description" value={form.description}
              onChange={handle} placeholder="Describe your product…" rows={5}
              className="border py-2 pl-3 pr-3 w-full text-green-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="pt-4">
            <Label label="Category" />
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="border py-2 pl-3 pr-3 w-full text-green-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Select category --</option>
              {categoryList.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <Label label="Quantity in Stock" />
            <Input name="quantityInStock" value={form.quantityInStock} onChange={handle}
              placeholder="Available quantity" type="number" wmd="w-150" />
          </div>

          <div className="pt-4">
            <Label label="Price (₦)" />
            <Input name="price" value={form.price} onChange={handle}
              placeholder="Selling price" type="number" wmd="w-150" />
          </div>

          <div className="pt-4">
            <Label label="Discount Price (₦) — optional" />
            <Input name="discountPrice" value={form.discountPrice} onChange={handle}
              placeholder="Original price before discount" type="number" wmd="w-150" />
          </div>

          <div className="text-center pt-8">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default AddProductPage;
