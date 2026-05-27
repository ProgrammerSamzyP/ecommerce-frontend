import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: '', discount: '', expiryDate: '', usageLimit: '-1', active: true });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ code: '', discount: '', expiryDate: '', usageLimit: '-1', active: true });

  const fetchCoupons = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/admin/coupons`)
      .then(res => setCoupons(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/coupons`, {
        code: form.code,
        discount: parseFloat(form.discount),
        expiryDate: form.expiryDate || null,
        usageLimit: parseInt(form.usageLimit),
        active: form.active
      });
      setForm({ code: '', discount: '', expiryDate: '', usageLimit: '-1', active: true });
      fetchCoupons();
    } catch (err) { alert('Failed to add'); }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditForm({
      code: c.code,
      discount: c.discount.toString(),
      expiryDate: c.expiryDate ? c.expiryDate.substring(0,16) : '',
      usageLimit: c.usageLimit.toString(),
      active: c.active
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ code: '', discount: '', expiryDate: '', usageLimit: '-1', active: true });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/coupons/${id}`, {
        code: editForm.code,
        discount: parseFloat(editForm.discount),
        expiryDate: editForm.expiryDate || null,
        usageLimit: parseInt(editForm.usageLimit),
        active: editForm.active
      });
      setEditingId(null);
      fetchCoupons();
    } catch (err) { alert('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/coupons/${id}`);
      fetchCoupons();
    } catch (err) { alert('Failed to delete'); }
  };

  return (
    <div className="container">
      <h2>Coupons</h2>
      <form onSubmit={handleAdd} className="mb-3 p-3 border rounded">
        <div className="row">
          <div className="col-md-3">
            <input type="text" className="form-control" placeholder="Code" value={form.code}
              onChange={e => setForm({...form, code: e.target.value})} required />
          </div>
          <div className="col-md-2">
            <input type="number" step="0.01" className="form-control" placeholder="Discount %" value={form.discount}
              onChange={e => setForm({...form, discount: e.target.value})} required />
          </div>
          <div className="col-md-2">
            <input type="datetime-local" className="form-control" value={form.expiryDate}
              onChange={e => setForm({...form, expiryDate: e.target.value})} />
          </div>
          <div className="col-md-2">
            <input type="number" className="form-control" placeholder="Usage limit (-1=unlimited)" value={form.usageLimit}
              onChange={e => setForm({...form, usageLimit: e.target.value})} />
          </div>
          <div className="col-md-1 d-flex align-items-center">
            <label className="form-check-label me-2">Active</label>
            <input type="checkbox" checked={form.active}
              onChange={e => setForm({...form, active: e.target.checked})} />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-success w-100">Add</button>
          </div>
        </div>
      </form>

      <ul className="list-group">
        {coupons.map(c => (
          <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
            {editingId === c.id ? (
              <div className="d-flex gap-2 w-100">
                <input type="text" className="form-control" value={editForm.code}
                  onChange={e => setEditForm({...editForm, code: e.target.value})} />
                <input type="number" step="0.01" className="form-control" value={editForm.discount}
                  onChange={e => setEditForm({...editForm, discount: e.target.value})} />
                <input type="datetime-local" className="form-control" value={editForm.expiryDate}
                  onChange={e => setEditForm({...editForm, expiryDate: e.target.value})} />
                <input type="number" className="form-control" value={editForm.usageLimit}
                  onChange={e => setEditForm({...editForm, usageLimit: e.target.value})} />
                <label className="form-check-label me-2">Active</label>
                <input type="checkbox" checked={editForm.active}
                  onChange={e => setEditForm({...editForm, active: e.target.checked})} />
                <button className="btn btn-sm btn-primary" onClick={() => handleUpdate(c.id)}>Save</button>
                <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              <>
                <span>{c.code} – {c.discount}% {!c.active && '(inactive)'}</span>
                <div>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => startEdit(c)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}