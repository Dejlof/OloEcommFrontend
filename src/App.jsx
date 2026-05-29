// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider }  from './context/AuthContext';
import { CartProvider }  from './context/CartContext';
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';

// Pages
import HomePage            from './pages/HomePage';
import ProductPage         from './pages/ProductPage';
import CategoryPage        from './pages/CategoryPage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import ForgotPassword      from './pages/ForgotPassword';
import ResetPassword       from './pages/ResetPassword';
import Account             from './pages/Account';
import CartPage            from './pages/CartPage';
import CheckoutPage        from './pages/CheckoutPage';
import PaymentCallbackPage from './pages/PaymentCallbackPage';
import OrdersPage          from './pages/OrdersPage';
import WishlistPage        from './pages/WishlistPage';
import AddProductPage      from './pages/AddProductPage';
import AddProductImages    from './pages/AddProductImages';
import VendorPage          from './pages/VendorPage';
import VendorProfilePage   from './pages/VendorProfilePage';
import AdminPage           from './pages/AdminPage';
import VendorRegisterPage         from './pages/VendorRegisterPage';
import ForceChangePasswordPage    from './pages/ForceChangePasswordPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
        <Routes>
          {/* ── Public ───────────────────────────────────── */}
          <Route path="/"               element={<HomePage />} />
          <Route path="/product/:id"    element={<ProductPage />} />
          <Route path="/category"       element={<CategoryPage />} />
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/register"       element={<RegisterPage />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword"  element={<ResetPassword />} />
        
        

          {/* ── Authenticated ─────────────────────────────── */}
          <Route path="/force-change-password" element={<ProtectedRoute><ForceChangePasswordPage /></ProtectedRoute>} />
          <Route path="/account"        element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/vendor/register" element={<ProtectedRoute><VendorRegisterPage /></ProtectedRoute>} />
          <Route path="/cart"     element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/orders"   element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/checkout/:orderId" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/vendor/profile/:vendorId" element={<ProtectedRoute><VendorProfilePage /></ProtectedRoute>} />
          <Route path="/payment/callback" element={<ProtectedRoute><PaymentCallbackPage /></ProtectedRoute>} />

          {/* ── Vendor dashboard (Vendor OR Admin) ────────── */}
          <Route path="/vendor"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['Vendor', 'Admin']}>
                  <VendorPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Add / upload product (Vendor OR Admin) */}
          <Route path="/addproduct"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['Vendor', 'Admin']}>
                  <AddProductPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route path="/productimages/:productId"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['Vendor', 'Admin']}>
                  <AddProductImages />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route path="/productimages"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['Vendor', 'Admin']}>
                  <AddProductImages />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* ── Admin panel (Admin only) ───────────────────── */}
          <Route path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['Admin']}>
                  <AdminPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* ── 404 ──────────────────────────────────────── */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-screen text-green-900">
              <h1 className="text-6xl font-bold text-orange-300 mb-4">404</h1>
              <p className="text-lg mb-6">Page not found</p>
              <a href="/" className="px-5 py-2.5 bg-green-900 text-orange-100 rounded-xl text-sm hover:bg-green-800 transition">
                Go Home
              </a>
            </div>
          } />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
