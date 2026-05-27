import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Helper to correct image URL
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
    axios.get(`${process.env.REACT_APP_API_URL}/api/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <h1 className="mb-4">Products</h1>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filteredProducts.length === 0 && (
        <div className="alert alert-info">No products found.</div>
      )}

      <div className="row">
        {filteredProducts.map(p => (
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
                    className="btn btn-primary"
                    disabled={p.stock <= 0}
                  >
                    {p.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="btn btn-outline-danger"
                    title={isInWishlist(p.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {isInWishlist(p.id) ? '❤️' : '🤍'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}