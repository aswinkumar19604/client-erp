import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaArrowLeft, FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import API from "../services/api";
import "./PurchaseOrders.css";

function PurchaseOrders() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    { product: "", quantity: 1, purchasePrice: 0 }
  ]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getSuppliers = async () => {
    try {
      const res = await API.get("/suppliers");
      setSuppliers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getPurchaseOrders = async () => {
    try {
      const res = await API.get("/purchase-orders");
      setPurchaseOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getSuppliers();
    getProducts();
    getPurchaseOrders();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { product: "", quantity: 1, purchasePrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === "product") {
      newItems[index].product = value;
      // Auto populate product price if found
      const selectedProd = products.find(p => p._id === value);
      if (selectedProd) {
        newItems[index].purchasePrice = selectedProd.price || 0;
      }
    } else if (field === "quantity") {
      newItems[index].quantity = Math.max(1, Number(value));
    } else if (field === "purchasePrice") {
      newItems[index].purchasePrice = Math.max(0, Number(value));
    }
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId) {
      alert("Please select a supplier");
      return;
    }
    
    // Validate items
    const invalidItem = items.some(item => !item.product || item.quantity <= 0);
    if (invalidItem) {
      alert("Please select a product and valid quantity for all items");
      return;
    }

    try {
      await API.post("/purchase-orders", {
        supplier: supplierId,
        items,
        notes
      });
      alert("Purchase Order created!");
      // Reset form
      setSupplierId("");
      setNotes("");
      setItems([{ product: "", quantity: 1, purchasePrice: 0 }]);
      getPurchaseOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating Purchase Order");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.put(`/purchase-orders/${id}`, { status });
      alert(`PO marked as ${status}`);
      getPurchaseOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    }
  };

  const handleDeletePO = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Purchase Order?")) return;
    try {
      await API.delete(`/purchase-orders/${id}`);
      alert("Purchase Order deleted");
      getPurchaseOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting Purchase Order");
    }
  };

  const filteredPO = purchaseOrders.filter(po => {
    if (!startDate && !endDate) return true;
    const poDate = new Date(po.createdAt || po.date).toISOString().slice(0, 10);
    const start = startDate || "0000-00-00";
    const end = endDate || "9999-99-99";
    return poDate >= start && poDate <= end;
  });

  return (
    <div className="po-layout">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>ERP System</h2>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/ess-portal">ESS Portal</Link></li>
          <li><Link to="/team-chat">Team Chat</Link></li>
          {role === "admin" && (
            <>
              <li><Link to="/employees">Employees</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/inventory">Inventory</Link></li>
              <li><Link to="/stock-history">Stock History</Link></li>
              <li><Link to="/manufacturing">Manufacturing</Link></li>
              <li><Link to="/notifications">Notifications</Link></li>
              <li><Link to="/sales">Sales</Link></li>
              <li><Link to="/quotations">Quotations</Link></li>
              <li><Link to="/sales-orders">Sales Orders</Link></li>
              <li><Link to="/purchases">Purchases</Link></li>
              <li className="active"><Link to="/purchase-orders">Purchase Orders</Link></li>
              <li><Link to="/goods-receipts">Goods Receipts</Link></li>
              <li><Link to="/general-ledger">General Ledger</Link></li>
              <li><Link to="/financial-reports">Financial Reports</Link></li>
              <li><Link to="/accounting">Accounting</Link></li>
              <li><Link to="/expenses">Expenses</Link></li>
              <li><Link to="/hr">HR</Link></li>
              <li><Link to="/payroll">Payroll</Link></li>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/leads">CRM Leads</Link></li>
              <li><Link to="/customers">Customers</Link></li>
              <li><Link to="/suppliers">Suppliers</Link></li>
              <li><Link to="/audit-logs">Audit Logs</Link></li>
            </>
          )}
        </ul>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="po-container">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <FaArrowLeft />
        </button>
        <h1>Purchase Orders</h1>
        <p className="subtitle">Manage procurement orders to your suppliers</p>

        {/* PO CREATION FORM */}
        <div className="po-form-card">
          <h3>Create Purchase Order</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group-row">
              <label>
                Supplier:
                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.name || s.email}</option>
                  ))}
                </select>
              </label>
              <label>
                Notes:
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery notes..." />
              </label>
            </div>

            <h4>Order Items</h4>
            {items.map((item, index) => (
              <div key={index} className="item-row">
                <select
                  value={item.product}
                  onChange={(e) => handleItemChange(index, "product", e.target.value)}
                  required
                >
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (Price: ₹{p.price})</option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                  min="1"
                  required
                />

                <input
                  type="number"
                  placeholder="Unit Price"
                  value={item.purchasePrice}
                  onChange={(e) => handleItemChange(index, "purchasePrice", e.target.value)}
                  min="0"
                  required
                />

                <span className="row-total">
                  Total: ₹{Number(item.quantity || 0) * Number(item.purchasePrice || 0)}
                </span>

                <button type="button" className="remove-row-btn" onClick={() => handleRemoveItem(index)} disabled={items.length === 1}>
                  <FaTimes />
                </button>
              </div>
            ))}

            <div className="form-actions">
              <button type="button" className="add-row-btn" onClick={handleAddItem}>
                <FaPlus /> Add Item
              </button>
              <button type="submit" className="submit-po-btn">
                Create Purchase Order (Draft)
              </button>
            </div>
          </form>
        </div>

        {/* PO TABLE */}
        <div className="po-list-card">
          <h3>Recent Purchase Orders</h3>
          
          <div className="filter-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
              Start date:
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
              End date:
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          </div>

          <table>
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Items Ordered (Qty / Recvd)</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPO.map(po => (
                <tr key={po._id}>
                  <td><strong>{po.poNumber}</strong></td>
                  <td>{po.supplier?.name || po.supplier?.email || "N/A"}</td>
                  <td>
                    <ul className="items-list-cell">
                      {po.items.map((pi, idx) => (
                        <li key={idx}>
                          {pi.product?.name}: {pi.quantity} ordered ({pi.receivedQuantity} recvd)
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>₹{po.totalAmount}</td>
                  <td>
                    <span className={`status-badge ${po.status.toLowerCase().replace(" ", "-")}`}>
                      {po.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-cell">
                      {po.status === "Draft" && (
                        <>
                          <button
                            title="Order items"
                            className="btn-order"
                            onClick={() => handleUpdateStatus(po._id, "Ordered")}
                          >
                            <FaCheck /> Send Order
                          </button>
                          <button
                            title="Delete draft"
                            className="btn-delete"
                            onClick={() => handleDeletePO(po._id)}
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                      {po.status === "Ordered" && (
                        <button
                          title="Cancel order"
                          className="btn-cancel"
                          onClick={() => handleUpdateStatus(po._id, "Cancelled")}
                        >
                          <FaTimes /> Cancel
                        </button>
                      )}
                      {["Partially Received", "Fully Received"].includes(po.status) && (
                        <span className="no-actions-text">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPO.length === 0 && (
                <tr>
                  <td colSpan="6">No purchase orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PurchaseOrders;
