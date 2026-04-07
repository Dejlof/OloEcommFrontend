// src/pages/AddProductImages.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { productImages as imagesApi, products as productsApi } from '../api/api';
import { Trash2, RefreshCw, Upload, Loader2, ImageOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { confirmToast } from '../utils/confirmToast';

const MAX_IMAGES = 4;

// ── Existing image card ───────────────────────────────────────────────────────
function ExistingImageCard({ img, isMain, onDelete, onReplace, deleting, replacing }) {
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onReplace(img.id, file);
    e.target.value = '';
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border-2 ${isMain ? 'border-orange-400' : 'border-gray-200'}`}>
      <img src={img.url} alt="Product" className="w-full h-28 object-cover" />

      {isMain && (
        <span className="absolute bottom-0 left-0 right-0 bg-orange-400 text-white text-[10px] text-center py-0.5">
          Main
        </span>
      )}

      {/* Action buttons */}
      <div className="absolute top-1 right-1 flex gap-1">
        {/* Replace */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={replacing || deleting}
          title="Replace image"
          className="bg-white rounded-full p-1.5 shadow hover:bg-blue-50 transition disabled:opacity-40">
          {replacing
            ? <Loader2 size={12} className="animate-spin text-blue-500" />
            : <RefreshCw size={12} className="text-blue-500" />}
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          disabled={deleting || replacing}
          title="Delete image"
          className="bg-white rounded-full p-1.5 shadow hover:bg-red-50 transition disabled:opacity-40">
          {deleting
            ? <Loader2 size={12} className="animate-spin text-red-500" />
            : <Trash2 size={12} className="text-red-500" />}
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const AddProductImages = () => {
  const { productId } = useParams();
  const navigate      = useNavigate();

  const [existingImages, setExistingImages] = useState([]);  // { id, url }[]
  const [newImages,      setNewImages]      = useState([]);  // { file, preview }[]
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [uploading,      setUploading]      = useState(false);
  const [error,          setError]          = useState('');
  const [deletingId,     setDeletingId]     = useState(null);
  const [replacingId,    setReplacingId]    = useState(null);

  // Fetch existing images from the product
  useEffect(() => {
    if (!productId) { setLoadingProduct(false); return; }
    productsApi.getById(productId)
      .then(prod => setExistingImages(prod?.productImages ?? []))
      .catch(() => {})
      .finally(() => setLoadingProduct(false));
  }, [productId]);

  const slotsLeft = MAX_IMAGES - existingImages.length;

  // ── New image selection ──────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (newImages.length + files.length > slotsLeft) {
      setError(`You can add at most ${slotsLeft} more image${slotsLeft !== 1 ? 's' : ''}.`);
      return;
    }
    setError('');
    setNewImages(prev => [
      ...prev,
      ...files.map(file => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    e.target.value = '';
  };

  const removeNew = (preview) => {
    URL.revokeObjectURL(preview);
    setNewImages(prev => prev.filter(img => img.preview !== preview));
  };

  // ── Delete existing ──────────────────────────────────────────────────────────
  const handleDelete = (imageId) => {
    confirmToast('Delete this image permanently?', async () => {
      setDeletingId(imageId);
      try {
        await imagesApi.delete(imageId);
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        toast.success('Image deleted.');
      } catch (err) {
        toast.error(err.message ?? 'Failed to delete image.');
      } finally {
        setDeletingId(null);
      }
    });
  };

  // ── Replace existing ─────────────────────────────────────────────────────────
  const handleReplace = async (imageId, file) => {
    setReplacingId(imageId);
    try {
      const formData = new FormData();
      formData.append('ImageFile', file);
      const updated = await imagesApi.update(imageId, formData);
      if (updated?.url) {
        setExistingImages(prev =>
          prev.map(img => img.id === imageId ? { ...img, url: updated.url } : img)
        );
      } else {
        // Reload product to get fresh URLs
        const prod = await productsApi.getById(productId);
        setExistingImages(prod?.productImages ?? []);
      }
      toast.success('Image replaced.');
    } catch (err) {
      toast.error(err.message ?? 'Failed to replace image.');
    } finally {
      setReplacingId(null);
    }
  };

  // ── Upload new images ────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (newImages.length === 0) { setError('Please select at least one image.'); return; }
    if (!productId) { setError('No product ID. Go back and create a product first.'); return; }

    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      newImages.forEach(img => formData.append('ImageFiles', img.file));
      await imagesApi.upload(productId, formData);

      // Refresh existing images
      const prod = await productsApi.getById(productId);
      setExistingImages(prod?.productImages ?? []);
      newImages.forEach(img => URL.revokeObjectURL(img.preview));
      setNewImages([]);
      toast.success('Images uploaded successfully.');
    } catch (err) {
      setError(err.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loadingProduct) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-32">
          <Loader2 className="animate-spin text-orange-400" size={36} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col justify-center items-center w-[92%] sm:w-[75%] m-auto min-h-[60vh] text-sm pt-16 pb-16">

        {/* Title */}
        <div className="w-full max-w-lg mb-6">
          <h1 className="text-xl font-bold text-green-900">Manage Product Images</h1>
          <p className="text-gray-500 text-xs mt-1">
            Up to {MAX_IMAGES} images per product. First image is the main photo.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg w-full max-w-lg text-sm">
            {error}
          </div>
        )}

        {/* ── Existing images ─────────────────────────────────────────────────── */}
        <div className="w-full max-w-lg">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Current Images ({existingImages.length}/{MAX_IMAGES})
          </h2>

          {existingImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
              <ImageOff size={28} className="mb-2" />
              <p className="text-xs">No images uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {existingImages.map((img, idx) => (
                <ExistingImageCard
                  key={img.id}
                  img={img}
                  isMain={idx === 0}
                  onDelete={() => handleDelete(img.id)}
                  onReplace={handleReplace}
                  deleting={deletingId === img.id}
                  replacing={replacingId === img.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Add new images ──────────────────────────────────────────────────── */}
        {slotsLeft > 0 && (
          <div className="w-full max-w-lg mt-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Add New Images ({newImages.length}/{slotsLeft} slots used)
            </h2>

            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-8 px-6 cursor-pointer transition
              ${newImages.length >= slotsLeft
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : 'border-orange-300 bg-orange-50 hover:bg-orange-100'}`}>
              <Upload size={24} className="text-orange-400 mb-2" />
              <p className="text-green-900 font-medium text-sm">
                {newImages.length >= slotsLeft ? 'Slots full' : 'Click to select images'}
              </p>
              <p className="text-gray-400 text-xs mt-1">JPG, PNG, WEBP — max 5 MB each</p>
              <input
                type="file" multiple accept="image/*"
                disabled={newImages.length >= slotsLeft}
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {newImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {newImages.map((img, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                    <img src={img.preview} alt={`New ${idx + 1}`} className="w-full h-28 object-cover" />
                    <button
                      onClick={() => removeNew(img.preview)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1.5 shadow hover:bg-red-50 transition">
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {newImages.length > 0 && (
              <div className="text-center mt-6">
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Uploading…
                    </span>
                  ) : `Upload ${newImages.length} Image${newImages.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            )}
          </div>
        )}

        {existingImages.length >= MAX_IMAGES && (
          <p className="mt-6 text-xs text-gray-400">
            Maximum {MAX_IMAGES} images reached. Delete an image to add a new one.
          </p>
        )}

        {/* Navigation */}
        <div className="mt-10 flex gap-3">
          <button onClick={() => navigate(`/product/${productId}`)}
            className="px-5 py-2.5 bg-green-900 text-orange-100 rounded-xl text-sm hover:bg-green-800 transition">
            View Product
          </button>
          <button onClick={() => navigate('/vendor')}
            className="px-5 py-2.5 border border-gray-300 text-green-900 rounded-xl text-sm hover:bg-gray-50 transition">
            Back to Dashboard
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddProductImages;
