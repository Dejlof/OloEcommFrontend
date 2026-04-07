// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { categories as categoriesApi } from '../api/api';
import { ShoppingCart, User, Search, Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout, isVendor, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [searchQuery,    setSearchQuery]    = useState('');
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const [catMenuOpen,    setCatMenuOpen]    = useState(false);
  const [categoryList,   setCategoryList]   = useState([]);
  const [catMobileOpen,  setCatMobileOpen]  = useState(false);
  const catRef = useRef(null);

  useEffect(() => {
    categoriesApi.getAll()
      .then(data => {
        if (Array.isArray(data)) setCategoryList(data);
        else if (Array.isArray(data?.items)) setCategoryList(data.items);
        else if (Array.isArray(data?.$values)) setCategoryList(data.$values);
        else setCategoryList([]);
      })
      .catch(() => {});
  }, []);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-orange-300 text-green-900 shadow-md">
      <div className="flex flex-row justify-between items-center px-6 py-4 w-[90%] m-auto">

        {/* Brand */}
        <Link to="/" className="text-xl font-bold whitespace-nowrap">
          Oloja <span className="font-light">MarketPlace</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex list-none m-0 flex-row gap-1 text-sm font-medium">
          <li><Link to="/" className="px-3 py-1 hover:text-orange-700 transition">Home</Link></li>
          <li><Link to="/category" className="px-3 py-1 hover:text-orange-700 transition">Products</Link></li>

          {/* Categories dropdown */}
          <li className="relative" ref={catRef}>
            <button
              onClick={() => setCatMenuOpen(o => !o)}
              className="flex items-center gap-1 px-3  hover:text-orange-700 transition">
              Categories <ChevronDown size={13} />
            </button>
            {catMenuOpen && categoryList.length > 0 && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] py-1 z-50">
                {categoryList.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/category?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`}
                    onClick={() => setCatMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-green-900 hover:bg-orange-50">
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </li>

          {isVendor && (
            <li><Link to="/vendor" className="px-3 py-1 hover:text-orange-700 transition">My Store</Link></li>
          )}
          {isAdmin && (
            <li><Link to="/admin" className="px-3 py-1 hover:text-orange-700 transition font-semibold">Admin</Link></li>
          )}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="pl-3 pr-8 py-1.5 rounded-lg border border-green-800 bg-orange-100 text-green-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 w-48"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-green-700">
                <Search size={15} />
              </button>
            </div>
          </form>

          {/* Cart */}
          <Link to="/cart" className="relative p-1.5 hover:text-orange-700 transition">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-900 text-orange-200 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          {/* User menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-1 p-1.5 hover:text-orange-700 transition text-sm">
                <User size={20} />
                <span className="hidden md:inline">{user?.firstName || user?.username}</span>
                <ChevronDown size={14} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-48 py-1 z-50">
                  <Link to="/account" onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-green-900 hover:bg-orange-50">
                    My Account
                  </Link>
                  <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-green-900 hover:bg-orange-50">
                    My Orders
                  </Link>
                  <Link to="/wishlist" onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-green-900 hover:bg-orange-50">
                    Wishlist
                  </Link>

                  {/* Vendor dashboard */}
                  {isVendor && (
                    <Link to="/vendor" onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-green-900 hover:bg-orange-50 font-medium">
                      🛍 My Store
                    </Link>
                  )}

                  {/* Admin dashboard */}
                  {isAdmin && (
                    <>
                      <Link to="/vendor" onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-green-900 hover:bg-orange-50">
                        🛍 My Store
                      </Link>
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-semibold">
                        🛡 Admin Panel
                      </Link>
                    </>
                  )}

                  <hr className="my-1 border-gray-200" />
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login"
                className="text-sm px-3 py-1.5 border border-green-900 rounded-lg hover:bg-green-900 hover:text-orange-100 transition">
                Log In
              </Link>
              <Link to="/register"
                className="hidden md:block text-sm px-3 py-1.5 bg-green-900 text-orange-100 rounded-lg hover:bg-green-800 transition">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="md:hidden p-1" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-orange-200 px-6 pb-4 flex flex-col gap-2 text-sm">
          <form onSubmit={handleSearch} className="flex gap-2 pt-2">
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="flex-1 px-3 py-1.5 rounded-lg border border-green-800 bg-orange-100 focus:outline-none" />
            <button type="submit" className="px-3 py-1.5 bg-green-900 text-white rounded-lg">
              <Search size={15} />
            </button>
          </form>
          <Link to="/"         onClick={() => setMenuOpen(false)} className="py-1">Home</Link>
          <Link to="/category" onClick={() => setMenuOpen(false)} className="py-1">Products</Link>

          {/* Mobile categories */}
          <div>
            <button
              onClick={() => setCatMobileOpen(o => !o)}
              className="flex items-center gap-1 py-1 w-full text-left">
              Categories <ChevronDown size={13} />
            </button>
            {catMobileOpen && (
              <div className="pl-3 flex flex-col gap-1 mt-1">
                {categoryList.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/category?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`}
                    onClick={() => { setMenuOpen(false); setCatMobileOpen(false); }}
                    className="py-1 text-orange-700 text-sm">
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {isAuthenticated ? (
            <>
              <Link to="/account"  onClick={() => setMenuOpen(false)} className="py-1">My Account</Link>
              <Link to="/orders"   onClick={() => setMenuOpen(false)} className="py-1">My Orders</Link>
              {(isVendor || isAdmin) && (
                <Link to="/vendor" onClick={() => setMenuOpen(false)} className="py-1 font-medium">My Store</Link>
              )}
              {isAdmin && (
                <Link to="/admin"  onClick={() => setMenuOpen(false)} className="py-1 text-purple-700 font-semibold">Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="text-left py-1 text-red-500">Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login"    onClick={() => setMenuOpen(false)} className="py-1">Log In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="py-1">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
