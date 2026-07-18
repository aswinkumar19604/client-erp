import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaShoppingCart, FaPlus, FaTrash, FaCheck, FaTimes, FaShippingFast, FaFileInvoiceDollar } from "react-icons/fa";
import API from "../services/api";
import "./SalesOrders.css";
import Sidebar from "../components/Sidebar";

function SalesOrders() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Insufficient inventory shortfalls list
  const [shortfallsList, setShortfallsList] = useState([]);

  // Create form state
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [orderItems, setOrderItems] = useState([{ product: "", quantity: 1, price: 0 }]);


  const fetchData = async () => {
    try {
      const [custRes, prodRes, soRes] = await Promise.all([
        API.get("/customers"),
        API.get("/products"),
        API.get("/sales-workflow/sales-orders")
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
      setSalesOrders(soRes.data);
    } catch (err) {
      console.log("Failed to load Sales Order datasets:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSO = salesOrders.filter(so => {
    if (!startDate && !endDate) return true;
    const soDate = new Date(so.createdAt || so.date).toISOString().slice(0, 10);
    const start = startDate || "0000-00-00";
    const end = endDate || "9999-99-99";
    return soDate >= start && soDate <= end;
  });

  const handleAddItem = () => {
    setOrderItems([...orderItems, { product: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (idx) => {
    const updated = orderItems.filter((_, i) => i !== idx);
    setOrderItems(updated);
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...orderItems];
    updated[idx][field] = value;

    if (field === "product") {
      const productObj = products.find(p => p._id === value);
      if (productObj) {
        updated[idx].price = productObj.price || 0;
      }
    }

    setOrderItems(updated);
  };

  const calculateTotal = () => {
    return orderItems.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedCustomer || !shippingAddress || orderItems.some(i => !i.product || i.quantity < 1 || i.price < 0)) {
      setErrorMsg("All fields and items must be correctly filled.");
      return;
    }

    try {
      await API.post("/sales-workflow/sales-orders", {
        customer: selectedCustomer,
        shippingAddress,
        deliveryDate: deliveryDate || undefined,
        items: orderItems
      });
      setSuccessMsg("Sales Order created successfully!");
      setSelectedCustomer("");
      setShippingAddress("");
      setDeliveryDate("");
      setOrderItems([{ product: "", quantity: 1, price: 0 }]);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create Sales Order");
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await API.put(`/sales-workflow/sales-orders/${id}/status`, { status });
      setSuccessMsg(res.data.message);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update Sales Order status");
    }
  };

  const handleInvoiceOrder = async (id) => {
    setErrorMsg("");
    setSuccessMsg("");
    setShortfallsList([]);

    try {
      const res = await API.post(`/sales-workflow/sales-orders/${id}/convert-invoice`);
      setSuccessMsg(res.data.message);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Fulfillment checkout failed");
      if (err.response?.data?.shortfalls) {
        setShortfallsList(err.response.data.shortfalls);
      }
    }
  };

  return (
    <div className="so-layout">
      {/* SIDEBAR */}
      <Sidebar activePage="sales-orders" />

      {/* MAIN CONTAINER */}
      <div className="so-container">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <FaArrowLeft />
        </button>
        <h1>Fulfillment Sales Orders</h1>
        <p className="subtitle">Confirm client delivery commitments and checkout final invoices</p>

        {/* Messaging alerts */}
        {errorMsg && (
          <div className="alert-banner error">
            <p><strong>Error:</strong> {errorMsg}</p>
            {shortfallsList.length > 0 && (
              <div className="shortfalls-box">
                <p><strong>Available Stock Shortages:</strong></p>
                <ul>
                  {shortfallsList.map((s, i) => (
                    <li key={i}>
                      {s.name}: Required: {s.required} &bull; Available: {s.available} (Short by {s.short} units)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {successMsg && <div className="alert-banner success">{successMsg}</div>}

        <div className="so-split-panel">
          {/* Create Form */}
          <div className="form-card">
            <h3>Plan Sales Order</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-item">
                <label>Target Customer</label>
                <select
                  value={selectedCustomer}
                  required
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-item">
                <label>Fulfillment Shipping Address</label>
                <textarea
                  required
                  placeholder="Street address, city, country..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>

              <div className="form-item">
                <label>Target Delivery Date</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>

              <div className="items-heading-row">
                <h4>Sales Order Lines</h4>
                <button
                  type="button"
                  className="add-item-btn"
                  onClick={handleAddItem}
                >
                  <FaPlus /> Add Line Item
                </button>
              </div>

              {orderItems.map((item, idx) => (
                <div key={idx} className="so-item-row">
                  <select
                    value={item.product}
                    required
                    onChange={(e) => handleItemChange(idx, "product", e.target.value)}
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} (₹{p.price})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                  />
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => handleItemChange(idx, "price", Number(e.target.value))}
                  />
                  {orderItems.length > 1 && (
                    <button
                      type="button"
                      className="delete-row-btn"
                      onClick={() => handleRemoveItem(idx)}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}

              <div className="total-calculation-display">
                <span>Estimated Total:</span>
                <strong>₹{calculateTotal().toLocaleString()}</strong>
              </div>

              <button type="submit" className="save-order-btn">
                Create Sales Order
              </button>
            </form>
          </div>

          {/* List Table */}
          <div className="table-card">
            <h3>Active Orders Ledger</h3>

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
                  <th>Order No</th>
                  <th>Customer</th>
                  <th>Shipping & Delivery</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="amount-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSO.map(order => (
                  <tr key={order._id}>
                    <td><strong>{order.salesOrderNumber}</strong></td>
                    <td>
                      {order.customer?.name}
                      <br />
                      <small className="sub-txt">{order.customer?.email}</small>
                    </td>
                    <td>
                      <small>
                        <strong>To:</strong> {order.shippingAddress}
                        <br />
                        <strong>Date:</strong> {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "Flexible"}
                      </small>
                    </td>
                    <td>₹{order.totalAmount.toLocaleString()}</td>
                    <td>
                      <span className={`status-pill ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="action-cell">
                      <div className="action-row">
                        {order.status === "Draft" && (
                          <>
                            <button
                              className="btn-action approve"
                              onClick={() => handleStatusUpdate(order._id, "Approved")}
                              title="Approve Order"
                            >
                              Approve
                            </button>
                            <button
                              className="btn-action cancel"
                              onClick={() => handleStatusUpdate(order._id, "Cancelled")}
                              title="Cancel Order"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        {order.status === "Approved" && (
                          <>
                            <button
                              className="btn-action dispatch"
                              onClick={() => handleStatusUpdate(order._id, "Dispatched")}
                              title="Fulfill & Dispatch"
                            >
                              <FaShippingFast /> Dispatch
                            </button>
                            <button
                              className="btn-action cancel"
                              onClick={() => handleStatusUpdate(order._id, "Cancelled")}
                              title="Cancel Order"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        {order.status === "Dispatched" && (
                          <button
                            className="btn-action invoice"
                            onClick={() => handleInvoiceOrder(order._id)}
                            title="Generate Sales Invoice (Ledger Debit)"
                          >
                            <FaFileInvoiceDollar /> Invoice
                          </button>
                        )}
                        {order.status === "Invoiced" && (
                          <span className="complete-lbl"><FaCheck /> Invoiced</span>
                        )}
                        {order.status === "Cancelled" && (
                          <span className="cancelled-lbl"><FaTimes /> Cancelled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSO.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-row-txt">No Sales Orders logged yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesOrders;
