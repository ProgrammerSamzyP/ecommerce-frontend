import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlistIds } = useWishlist();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);   // ✅ mobile toggle

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/products" onClick={closeMenu}>🛒 MyShop</Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/products" onClick={closeMenu}>Products</Link>
            </li>
            {token && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/orders" onClick={closeMenu}>My Orders</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile" onClick={closeMenu}>Profile</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/wishlist" onClick={closeMenu}>
                    Wishlist <span className="badge bg-danger">{wishlistIds.size}</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/cart" onClick={closeMenu}>
                    Cart <span className="badge bg-warning text-dark">{cartItems.length}</span>
                  </Link>
                </li>
                {user && user.role === 'ROLE_ADMIN' && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/dashboard" onClick={closeMenu}>Dashboard</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin" onClick={closeMenu}>Products</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/orders" onClick={closeMenu}>Orders</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/shipping" onClick={closeMenu}>Shipping</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/coupons" onClick={closeMenu}>Coupons</Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
          <div className="d-flex">
            {token ? (
              <button onClick={handleLogout} className="btn btn-outline-light">Logout</button>
            ) : (
              <Link className="btn btn-outline-light" to="/login" onClick={closeMenu}>Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}