import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Star,
  PlusCircle,
  X,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import api from '../services/api';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    'All',
    'Food',
    'Grooming',
    'Toys',
    'Healthcare',
    'Accessories',
    'Bedding & Bowls',
  ]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // List product modal
  const [showListModal, setShowListModal] = useState(false);
  const [listForm, setListForm] = useState({
    name: '',
    category: 'Food',
    price: '',
    description: '',
    link: '',
    submitterPhone: '',
  });
  const [productImageFile, setProductImageFile] = useState(null);
  const [listSubmitting, setListSubmitting] = useState(false);
  const [listFeedback, setListFeedback] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get(
        `/api/shop?category=${encodeURIComponent(selectedCategory)}&search=${encodeURIComponent(search)}`
      );
      if (res.data && res.data.success) {
        setProducts(res.data.products || []);
        if (res.data.categories) setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleListSubmit = async (e) => {
    e.preventDefault();
    setListSubmitting(true);
    setListFeedback(null);

    try {
      const data = new FormData();
      Object.keys(listForm).forEach((key) => {
        data.append(key, listForm[key]);
      });
      if (productImageFile) {
        data.append('productImage', productImageFile);
      }

      const res = await api.post('/api/products/request', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data && res.data.success) {
        setListFeedback({ type: 'success', text: res.data.message });
        setListForm({
          name: '',
          category: 'Food',
          price: '',
          description: '',
          link: '',
          submitterPhone: '',
        });
        setProductImageFile(null);
      } else {
        setListFeedback({ type: 'error', text: res.data.message || 'Failed to submit product.' });
      }
    } catch (err) {
      setListFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Error occurred while submitting product.',
      });
    } finally {
      setListSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
            <ShoppingBag className="w-3.5 h-3.5" /> Curated Pet Essentials
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Woffy Pet Care Marketplace
          </h1>
          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            Nutritious meals, dental chews, orthopedic bedding, grooming supplies, and toys reviewed by dog parents.
          </p>
        </div>

        <button
          onClick={() => setShowListModal(true)}
          className="px-6 py-3 rounded-2xl bg-white text-amber-700 hover:bg-amber-50 font-extrabold text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> List Your Product
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by brand, food type, or toy..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-xs transition-colors shrink-0"
          >
            Search Products
          </button>
        </form>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100 text-xs font-semibold">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-500 text-xs font-semibold">Loading pet products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-gray-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No products found in this category</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try choosing a different category or search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <div
              key={prod._id}
              className="bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-48 object-cover"
                  />
                  <span className="absolute top-3 left-3 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white/90 text-amber-800 backdrop-blur-xs shadow-xs">
                    {prod.category}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold text-gray-800">{prod.rating || 4.8}</span>
                    <span className="text-gray-400">({prod.reviewCount || 25})</span>
                  </div>

                  <h3 className="font-bold text-base text-gray-900 line-clamp-1">{prod.name}</h3>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Price</span>
                  <span className="text-lg font-black text-gray-900">₹{prod.price}</span>
                </div>

                {prod.buyUrl ? (
                  <a
                    href={prod.buyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-colors"
                  >
                    Buy Now <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    In Stock
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List Product Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Submit Pet Product</h3>
                <p className="text-xs text-gray-500">List high quality pet supplies on Woffy</p>
              </div>
              <button onClick={() => setShowListModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {listFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  listFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {listFeedback.text}
              </div>
            )}

            <form onSubmit={handleListSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={listForm.name}
                  onChange={(e) => setListForm({ ...listForm, name: e.target.value })}
                  placeholder="e.g. Pedigree Adult Dog Food 3kg"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Category</label>
                  <select
                    value={listForm.category}
                    onChange={(e) => setListForm({ ...listForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={listForm.price}
                    onChange={(e) => setListForm({ ...listForm, price: e.target.value })}
                    placeholder="e.g. 599"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Description *</label>
                <textarea
                  rows="3"
                  required
                  value={listForm.description}
                  onChange={(e) => setListForm({ ...listForm, description: e.target.value })}
                  placeholder="Ingredients, dimensions, or suitable dog breeds..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={listForm.submitterPhone}
                    onChange={(e) => setListForm({ ...listForm, submitterPhone: e.target.value })}
                    placeholder="For vendor verification"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Product Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductImageFile(e.target.files[0])}
                    className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-amber-100 file:text-amber-800"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowListModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={listSubmitting}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
                >
                  {listSubmitting ? 'Submitting...' : 'Submit For Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
