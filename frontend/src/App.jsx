import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://it-asset-2hz0.onrender.com/api/assets";

const emptyForm = {
  assetName: "",
  assetId: "",
  category: "Laptop",
  brand: "",
  status: "Available",
  assignedTo: ""
};

function App() {
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState({ total: 0, assigned: 0, available: 0 });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assetRes, statRes] = await Promise.all([
        axios.get(API, { params: { search, status: statusFilter } }),
        axios.get(`${API}/stats`)
      ]);
      setAssets(assetRes.data);
      setStats(statRes.data);
    } catch (error) {
      alert(error.response?.data?.message || "Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadData, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (form.status === "Available") form.assignedTo = "";

    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, form);
      } else {
        await axios.post(API, form);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to save asset.");
    }
  };

  const editAsset = (asset) => {
    setForm({
      assetName: asset.assetName,
      assetId: asset.assetId,
      category: asset.category,
      brand: asset.brand,
      status: asset.status,
      assignedTo: asset.assignedTo || ""
    });
    setEditingId(asset._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteAsset = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to delete asset.");
    }
  };

  const cancelForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="brand">IT Asset Manager</div>
          <div className="subtitle">Company asset tracking system</div>
        </div>
        <button className="primary" onClick={() => {
          if (showForm) cancelForm();
          else setShowForm(true);
        }}>
          {showForm ? "Close Form" : "+ Add Asset"}
        </button>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <h1>Asset Dashboard</h1>
            <p>Track laptops, monitors, keyboards and other company IT equipment.</p>
          </div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span>Total Assets</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat-card">
            <span>Assigned</span>
            <strong>{stats.assigned}</strong>
          </div>
          <div className="stat-card">
            <span>Available</span>
            <strong>{stats.available}</strong>
          </div>
        </section>

        {showForm && (
          <section className="panel">
            <div className="panel-title">
              <h2>{editingId ? "Update Asset" : "Add New Asset"}</h2>
            </div>
            <form className="form-grid" onSubmit={submitForm}>
              <label>
                Asset Name
                <input name="assetName" value={form.assetName} onChange={handleChange}
                  placeholder="e.g. Dell Latitude 5440" required />
              </label>
              <label>
                Asset ID
                <input name="assetId" value={form.assetId} onChange={handleChange}
                  placeholder="e.g. AST-001" required />
              </label>
              <label>
                Category
                <select name="category" value={form.category} onChange={handleChange}>
                  {["Laptop", "Mouse", "Keyboard", "Monitor", "Desktop", "Printer", "Headset", "Other"]
                    .map(x => <option key={x}>{x}</option>)}
                </select>
              </label>
              <label>
                Brand
                <input name="brand" value={form.brand} onChange={handleChange}
                  placeholder="e.g. Dell" required />
              </label>
              <label>
                Status
                <select name="status" value={form.status} onChange={handleChange}>
                  <option>Available</option>
                  <option>Assigned</option>
                </select>
              </label>
              <label>
                Assigned To
                <input name="assignedTo" value={form.assignedTo} onChange={handleChange}
                  placeholder="Employee name (optional)"
                  disabled={form.status === "Available"} />
              </label>
              <div className="form-actions">
                <button className="primary" type="submit">{editingId ? "Update Asset" : "Save Asset"}</button>
                <button className="secondary" type="button" onClick={cancelForm}>Cancel</button>
              </div>
            </form>
          </section>
        )}

        <section className="panel">
          <div className="toolbar">
            <div>
              <h2>All Assets</h2>
              <p>{assets.length} asset(s) shown</p>
            </div>
            <div className="filters">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search Asset ID or Name..." />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
              </select>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Asset ID</th>
                  <th>Asset Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="empty">Loading...</td></tr>
                ) : assets.length === 0 ? (
                  <tr><td colSpan="7" className="empty">No assets found.</td></tr>
                ) : assets.map(asset => (
                  <tr key={asset._id}>
                    <td><b>{asset.assetId}</b></td>
                    <td>{asset.assetName}</td>
                    <td>{asset.category}</td>
                    <td>{asset.brand}</td>
                    <td><span className={`badge ${asset.status.toLowerCase()}`}>{asset.status}</span></td>
                    <td>{asset.assignedTo || "—"}</td>
                    <td className="actions">
                      <button className="edit" onClick={() => editAsset(asset)}>Edit</button>
                      <button className="delete" onClick={() => deleteAsset(asset._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer>IT Asset Management System • MERN Stack</footer>
    </div>
  );
}

export default App;