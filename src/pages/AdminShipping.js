import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminShipping() {
  const [rates, setRates] = useState([]);
  const [location, setLocation] = useState('');
  const [cost, setCost] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editLocation, setEditLocation] = useState('');
  const [editCost, setEditCost] = useState('');

  const fetchRates = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/admin/shipping`)
      .then(res => setRates(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchRates(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/shipping`, {
        location,
        cost: parseFloat(cost)
      });
      setLocation('');
      setCost('');
      fetchRates();
    } catch (err) { alert('Failed to add'); }
  };

  const startEdit = (rate) => {
    setEditingId(rate.id);
    setEditLocation(rate.location);
    setEditCost(rate.cost.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLocation('');
    setEditCost('');
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/shipping/${id}`, {
        location: editLocation,
        cost: parseFloat(editCost)
      });
      setEditingId(null);
      fetchRates();
    } catch (err) { alert('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rate?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/shipping/${id}`);
      fetchRates();
    } catch (err) { alert('Failed to delete'); }
  };

  return (
    <div className="container">
      <h2>Shipping Rates</h2>
      <form onSubmit={handleAdd} className="mb-3 p-3 border rounded">
        <div className="row">
          <div className="col-md-4">
            <input type="text" className="form-control" placeholder="Location" value={location}
              onChange={e => setLocation(e.target.value)} required />
          </div>
          <div className="col-md-4">
            <input type="number" step="0.01" className="form-control" placeholder="Cost (₦)" value={cost}
              onChange={e => setCost(e.target.value)} required />
          </div>
          <div className="col-md-4">
            <button type="submit" className="btn btn-success w-100">Add</button>
          </div>
        </div>
      </form>

      <ul className="list-group">
        {rates.map(rate => (
          <li key={rate.id} className="list-group-item d-flex justify-content-between align-items-center">
            {editingId === rate.id ? (
              <div className="d-flex gap-2 w-100">
                <input type="text" className="form-control" value={editLocation}
                  onChange={e => setEditLocation(e.target.value)} />
                <input type="number" step="0.01" className="form-control" value={editCost}
                  onChange={e => setEditCost(e.target.value)} />
                <button className="btn btn-sm btn-primary" onClick={() => handleUpdate(rate.id)}>Save</button>
                <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              <>
                <span>{rate.location} – ₦{rate.cost.toFixed(2)}</span>
                <div>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => startEdit(rate)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(rate.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}