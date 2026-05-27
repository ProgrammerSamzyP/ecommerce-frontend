import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const fetchProducts = useCallback(() => {
    const url = showDeleted
      ? `${process.env.REACT_APP_API_URL}/api/admin/products/deleted`
      : `${process.env.REACT_APP_API_URL}/api/products`;
    axios.get(url)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, [showDeleted]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Add form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    imageUrl: '',
    stock: ''
  });
  const [imageFiles, setImageFiles] = useState([]);

  // Edit form states
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    imageUrl: '',
    additionalImages: [],
    stock: ''
  });

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/100';
    if (url.startsWith('/uploads/')) return `${process.env.REACT_APP_API_URL}/images/${url.replace('/uploads/', '')}`;
    return url;
  };

  const handleImageUpload = async (files) => {
    const urls = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/upload-image`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        urls.push(res.data.imageUrl);
      } catch (err) {
        alert('Image upload failed for ' + file.name);
        return null;
      }
    }
    return urls;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = newProduct.imageUrl;
      let additionalImages = [];
      if (imageFiles.length > 0) {
        const uploadedUrls = await handleImageUpload(imageFiles);
        if (!uploadedUrls) return;
        imageUrl = uploadedUrls[0];
        additionalImages = uploadedUrls.slice(1);
      }
      await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/products`, {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        imageUrl: imageUrl,
        additionalImages: additionalImages,
        stock: parseInt(newProduct.stock) || 0
      });
      setNewProduct({ name: '', price: '', imageUrl: '', stock: '' });
      setImageFiles([]);
      fetchProducts();
    } catch (err) {
      alert('Failed to add product');
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: product.price.toString(),
      imageUrl: product.imageUrl || '',
      additionalImages: product.additionalImages || [],
      stock: product.stock.toString()
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', price: '', imageUrl: '', additionalImages: [], stock: '' });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/products/${id}`, {
        name: editForm.name,
        price: parseFloat(editForm.price),
        imageUrl: editForm.imageUrl,
        additionalImages: editForm.additionalImages,
        stock: parseInt(editForm.stock) || 0
      });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      alert('Failed to update product');
    }
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm('Hide this product?')) return;
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/products/${id}/delete`);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleRestore = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/products/${id}/restore`);
      fetchProducts();
    } catch (err) {
      alert('Failed to restore');
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('Permanently delete?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/products/${id}/permanent`);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="container">
      <h2>Admin Product Management</h2>

      <form onSubmit={handleAdd} className="mb-4 p-3 border rounded">
        <h5>Add New Product</h5>
        <div className="row">
          <div className="col-md-3 mb-2">
            <input type="text" className="form-control" placeholder="Name" value={newProduct.name}
              onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
          </div>
          <div className="col-md-2 mb-2">
            <input type="number" step="0.01" className="form-control" placeholder="Price" value={newProduct.price}
              onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
          </div>
          <div className="col-md-2 mb-2">
            <input type="number" className="form-control" placeholder="Stock" value={newProduct.stock}
              onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
          </div>
          <div className="col-md-3 mb-2">
            <input type="file" className="form-control" multiple onChange={e => setImageFiles([...e.target.files])} />
            <small className="form-text text-muted">Select multiple images – first becomes main, rest are additional.</small>
          </div>
          <div className="col-md-2 mb-2">
            <input type="text" className="form-control" placeholder="Image URL (optional)" value={newProduct.imageUrl}
              onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
          </div>
        </div>
        <button type="submit" className="btn btn-success">Add Product</button>
      </form>

      <button onClick={() => setShowDeleted(!showDeleted)} className="btn btn-outline-secondary mb-3">
        {showDeleted ? 'Show Active Products' : 'Show Deleted Products'}
      </button>

      <div className="list-group">
        {products.map(product => (
          <div key={product.id} className="list-group-item d-flex justify-content-between align-items-center">
            {editingId === product.id ? (
              <div className="d-flex flex-wrap align-items-center gap-2 w-100">
                <input type="text" className="form-control" value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})} />
                <input type="number" step="0.01" className="form-control" value={editForm.price}
                  onChange={e => setEditForm({...editForm, price: e.target.value})} />
                <input type="number" className="form-control" value={editForm.stock}
                  onChange={e => setEditForm({...editForm, stock: e.target.value})} />
                <input type="text" className="form-control" value={editForm.imageUrl}
                  onChange={e => setEditForm({...editForm, imageUrl: e.target.value})} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Additional URLs (comma-separated)"
                  value={editForm.additionalImages.join(',')}
                  onChange={e => setEditForm({...editForm, additionalImages: e.target.value.split(',').map(s => s.trim())})}
                />
                <button className="btn btn-sm btn-primary" onClick={() => handleUpdate(product.id)}>Save</button>
                <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              <>
                <div className="d-flex align-items-center">
                  <img src={getImageUrl(product.imageUrl)} alt={product.name} width="50" height="50" className="me-3 rounded" />
                  <div>
                    <strong>{product.name}</strong> – ₦{product.price.toFixed(2)} 
                    <span className={`ms-2 badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
                <div>
                  {!showDeleted ? (
                    <>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => startEdit(product)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleSoftDelete(product.id)}>Delete</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-sm btn-success me-2" onClick={() => handleRestore(product.id)}>Restore</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handlePermanentDelete(product.id)}>Delete Forever</button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}