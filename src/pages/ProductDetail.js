import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewError, setReviewError] = useState('');

  // Image state – active index for thumbnail/carousel
  const [activeIndex, setActiveIndex] = useState(0);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/400';
    if (imageUrl.startsWith('/uploads/')) {
      const filename = imageUrl.replace('/uploads/', '');
      return `${process.env.REACT_APP_API_URL}/images/${filename}`;
    }
    return imageUrl;
  };

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/products/${id}/reviews`)
      .then(res => setReviews(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewError('Please login to leave a review.');
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/products/${id}/reviews`, {
        rating: rating,
        comment: reviewText
      });
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/${id}/reviews`);
      setReviews(res.data);
      setReviewText('');
      setRating(5);
      setReviewError('');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  const handlePrev = () => {
    if (allImages.length > 0) {
      setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    }
  };

  const handleNext = () => {
    if (allImages.length > 0) {
      setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    }
  };

  if (loading) return <div className="container mt-4"><div className="spinner-border" /></div>;
  if (!product) return <div className="container mt-4"><h2>Product not found</h2></div>;

  const allImages = [product.imageUrl, ...(product.additionalImages || [])].filter(Boolean);

  return (
    <div className="container mt-4">
      <Link to="/products" className="btn btn-outline-secondary mb-3">← Back to Products</Link>
      <div className="row">
        {/* Image section */}
        <div className="col-md-6">
          {allImages.length > 1 ? (
            <>
              {/* Simple carousel with manual controls */}
              <div className="position-relative">
                <img
                  src={getImageUrl(allImages[activeIndex])}
                  alt={product.name}
                  className="d-block w-100 rounded"
                  style={{ objectFit: 'cover', height: 400 }}
                />
                <button
                  className="btn btn-dark position-absolute top-50 start-0 translate-middle-y"
                  onClick={handlePrev}
                  style={{ borderRadius: '50%', width: 40, height: 40 }}
                >
                  ‹
                </button>
                <button
                  className="btn btn-dark position-absolute top-50 end-0 translate-middle-y"
                  onClick={handleNext}
                  style={{ borderRadius: '50%', width: 40, height: 40 }}
                >
                  ›
                </button>
              </div>

              {/* Thumbnail strip */}
              <div className="d-flex flex-wrap gap-2 mt-3">
                {allImages.map((img, index) => (
                  <img
                    key={index}
                    src={getImageUrl(img)}
                    alt={`View ${index + 1}`}
                    onClick={() => setActiveIndex(index)}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: 'cover',
                      cursor: 'pointer',
                      borderRadius: 4,
                      border: index === activeIndex ? '3px solid #0d6efd' : '2px solid #dee2e6',
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <img src={getImageUrl(product.imageUrl)} alt={product.name} className="img-fluid rounded" />
          )}
        </div>

        {/* Product info + reviews (unchanged) */}
        <div className="col-md-6">
          <h1>{product.name}</h1>
          <p className="lead text-success fw-bold">₦{product.price.toFixed(2)}</p>
          <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'} mb-2`}>
            {product.stock > 0 ? `In Stock (${product.stock})` : 'Sold Out'}
          </span>
          <div className="mb-3">
            <button
              onClick={() => addToCart(product)}
              className="btn btn-primary btn-lg me-2"
              disabled={product.stock <= 0}
            >
              {product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`btn ${isInWishlist(product.id) ? 'btn-danger' : 'btn-outline-danger'} btn-lg`}
            >
              {isInWishlist(product.id) ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Reviews (same as before) */}
          <hr className="my-4" />
          <h4>Reviews</h4>
          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet. Be the first!</p>
          ) : (
            <div className="list-group mb-3">
              {reviews.map(r => (
                <div key={r.id} className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <strong>{'⭐'.repeat(r.rating)}</strong>
                    <small className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</small>
                  </div>
                  <p className="mb-0">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
          {user ? (
            <form onSubmit={handleSubmitReview}>
              <div className="mb-2">
                <label className="form-label">Rating</label>
                <select className="form-select" value={rating} onChange={e => setRating(e.target.value)}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} star{n>1?'s':''}</option>)}
                </select>
              </div>
              <div className="mb-2">
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Write your review..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  required
                />
              </div>
              {reviewError && <div className="text-danger mb-2">{reviewError}</div>}
              <button type="submit" className="btn btn-success">Submit Review</button>
            </form>
          ) : (
            <p className="text-muted">Please <Link to="/login">login</Link> to leave a review.</p>
          )}
        </div>
      </div>
    </div>
  );
}