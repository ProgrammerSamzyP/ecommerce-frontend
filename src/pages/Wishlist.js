import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Wishlist() {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { removeFromWishlist } = useWishlist();

  const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://via.placeholder.com/200';
  if (imageUrl.startsWith('/uploads/')) {
    // replace /uploads/ with /images/ and point to backend
    const filename = imageUrl.replace('/uploads/', '');
    return `${process.env.REACT_APP_API_URL}/images/${filename}`;
  }
  return imageUrl;
};

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/wishlist`)
      .then(res => setWishlistProducts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
    setWishlistProducts(prev => prev.filter(p => p.id !== productId));
  };

  if (loading) return <div className="container mt-4"><div className="spinner-border" /></div>;

  return (
    <div className="container">
      <h2 className="mb-4">My Wishlist ❤️</h2>
      {wishlistProducts.length === 0 ? (
        <div className="alert alert-info">
          Your wishlist is empty. <Link to="/products">Browse products</Link>
        </div>
      ) : (
        <div className="row">
          {wishlistProducts.map(p => (
            <div key={p.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <Link to={`/products/${p.id}`}>
                  <img
                    src={getImageUrl(p.imageUrl)}
                    className="card-img-top"
                    alt={p.name}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                </Link>
                <div className="card-body d-flex flex-column">
                  <Link to={`/products/${p.id}`} className="text-decoration-none text-dark">
                    <h5 className="card-title">{p.name}</h5>
                  </Link>
                  <p className="card-text text-success fw-bold">₦{p.price.toFixed(2)}</p>
                  <span className={`badge ${p.stock > 0 ? 'bg-success' : 'bg-danger'} mb-2`}>
                    {p.stock > 0 ? `In Stock (${p.stock})` : 'Sold Out'}
                  </span>
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <button
                      onClick={() => addToCart(p)}
                      className="btn btn-primary btn-sm"
                      disabled={p.stock <= 0}
                    >
                      {p.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="btn btn-outline-danger btn-sm"
                    >
                      ❌ Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}