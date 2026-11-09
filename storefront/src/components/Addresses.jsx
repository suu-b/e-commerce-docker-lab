import { useState, useEffect } from 'react';
import { addressesApi } from '../api/addressesApi';
import { useAuth } from '../context/AuthContext';
import './Addresses.css';

function Addresses() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false,
  });

  useEffect(() => {
    loadAddresses();
  }, [token]);

  const loadAddresses = async () => {
    try {
      const response = await addressesApi.list(token);
      if (response.addresses) {
        setAddresses(response.addresses);
      }
    } catch (err) {
      setError('Failed to load addresses');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (editingAddress) {
        await addressesApi.update(token, editingAddress.id, formData);
      } else {
        await addressesApi.create(token, formData);
      }
      await loadAddresses();
      setShowForm(false);
      setEditingAddress(null);
      setFormData({
        full_name: '',
        phone: '',
        address_line: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        is_default: false,
      });
    } catch (err) {
      setError(editingAddress ? 'Failed to update address' : 'Failed to create address');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      full_name: address.full_name,
      phone: address.phone,
      address_line: address.address_line,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default,
    });
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      await addressesApi.delete(token, addressId);
      await loadAddresses();
    } catch (err) {
      setError('Failed to delete address');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
    setFormData({
      full_name: '',
      phone: '',
      address_line: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      is_default: false,
    });
  };

  return (
    <div className="addresses-container">
      <div className="addresses-header">
        <h2>My Addresses</h2>
        <button onClick={() => setShowForm(true)} className="add-button primary">
          Add New Address
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="address-form-overlay">
          <div className="address-form">
            <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name:</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address Line:</label>
                <input
                  type="text"
                  value={formData.address_line}
                  onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City:</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State:</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Postal Code:</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Country:</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  />
                  Set as default address
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading} className="primary">
                  {loading ? 'Saving...' : editingAddress ? 'Update' : 'Add'}
                </button>
                <button type="button" onClick={handleCancel} className="secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="addresses-list">
        {addresses.length === 0 ? (
          <p className="no-addresses">No addresses found. Add your first address!</p>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="address-card">
              {address.is_default && <span className="default-badge">Default</span>}
              <h3>{address.full_name}</h3>
              <p>{address.phone}</p>
              <p>{address.address_line}</p>
              <p>
                {address.city}, {address.state} {address.postal_code}
              </p>
              <p>{address.country}</p>
              <div className="address-actions">
                <button onClick={() => handleEdit(address)}>Edit</button>
                <button onClick={() => handleDelete(address.id)} className="delete">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Addresses;
