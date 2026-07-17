import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import API from "../services/api";
import "./GoodsReceipts.css";

function GoodsReceipts() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [receipts, setReceipts] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  
  const [selectedPOId, setSelectedPOId] = useState("");
  const [selectedPO, setSelectedPO] = useState(null);
  const [notes, setNotes] = useState("");
  const [itemsToReceive, setItemsToReceive] = useState([]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getReceipts = async () => {
    try {
      const res = await API.get("/goods-receipts");
      setReceipts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getPurchaseOrders = async () => {
    try {
      const res = await API.get("/purchase-orders");
      // Only POs with status Ordered or Partially Received can receive goods
      const activePOs = res.data.filter(po => 
        ["Ordered", "Partially Received"].includes(po.status)
      );
      setPurchaseOrders(activePOs);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getReceipts();
    getPurchaseOrders();
  }, []);

  const handlePOSelect = (poId) => {
    setSelectedPOId(poId);
    if (!poId) {
      setSelectedPO(null);
      setItemsToReceive([]);
      return;
    }

    const po = purchaseOrders.find(o => o._id === poId);
    if (po) {
      setSelectedPO(po);
      // Create receiving items: only items not fully received
      const initialItems = po.items
        .map(item => ({
          product: item.product?._id || item.product,
          productName: item.product?.name || "Product",
          orderedQty: item.quantity,
          receivedQty: item.receivedQuantity || 0,
          quantityReceived: 0
        }))
        .filter(item => item.receivedQty < item.orderedQty);
      setItemsToReceive(initialItems);
    }
  };

  const handleQtyChange = (index, value) => {
    const updated = [...itemsToReceive];
    const maxQty = updated[index].orderedQty - updated[index].receivedQty;
    updated[index].quantityReceived = Math.max(0, Math.min(maxQty, Number(value)));
    setItemsToReceive(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPOId) {
      alert("Please select a Purchase Order");
      return;
    }

    // Filter items where quantityReceived > 0
    const finalItems = itemsToReceive
      .filter(item => item.quantityReceived > 0)
      .map(item => ({
        product: item.product,
        quantityReceived: item.quantityReceived
      }));

    if (finalItems.length === 0) {
      alert("Please enter a received quantity greater than 0 for at least one item");
      return;
    }

    try {
      await API.post("/goods-receipts", {
        purchaseOrder: selectedPOId,
        itemsReceived: finalItems,
        notes
      });
      alert("Goods Receipt processed and inventory updated!");
      // Reset form
      setSelectedPOId("");
      setSelectedPO(null);
      setNotes("");
      setItemsToReceive([]);
      getReceipts();
      getPurchaseOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Error processing Goods Receipt");
    }
  };

  const filteredReceipts = receipts.filter(rec => {
    if (!startDate && !endDate) return true;
    const recDate = new Date(rec.receivedDate || rec.createdAt).toISOString().slice(0, 10);
    const start = startDate || "0000-00-00";
    const end = endDate || "9999-99-99";
    return recDate >= start && recDate <= end;
  });

  return (
    <div className="grn-layout">
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
              <li><Link to="/purchase-orders">Purchase Orders</Link></li>
              <li className="active"><Link to="/goods-receipts">Goods Receipts</Link></li>
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
      <div className="grn-container">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <FaArrowLeft />
        </button>
        <h1>Goods Receipts</h1>
        <p className="subtitle">Log received products from supplier purchase orders into inventory</p>

        {/* GRN CREATION CARD */}
        <div className="grn-form-card">
          <h3>Record Goods Receipt (GRN)</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group-row">
              <label>
                Select Active Purchase Order:
                <select value={selectedPOId} onChange={(e) => handlePOSelect(e.target.value)} required>
                  <option value="">Select PO...</option>
                  {purchaseOrders.map(po => (
                    <option key={po._id} value={po._id}>
                      {po.poNumber} ({po.supplier?.name || po.supplier?.email})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Notes:
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Condition of shipment..." />
              </label>
            </div>

            {selectedPO && itemsToReceive.length > 0 && (
              <div className="receiving-items-section">
                <h4>Items to Receive</h4>
                <table className="sub-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Ordered Qty</th>
                      <th>Received So Far</th>
                      <th>Receiving Now</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsToReceive.map((item, idx) => {
                      const maxQty = item.orderedQty - item.receivedQty;
                      return (
                        <tr key={idx}>
                          <td>{item.productName}</td>
                          <td>{item.orderedQty}</td>
                          <td>{item.receivedQty}</td>
                          <td>
                            <input
                              type="number"
                              value={item.quantityReceived}
                              onChange={(e) => handleQtyChange(idx, e.target.value)}
                              min="0"
                              max={maxQty}
                              required
                            />
                            <span className="max-hint-text"> (Max: {maxQty})</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="form-actions">
                  <button type="submit" className="submit-grn-btn">
                    Confirm Receipt & Update Inventory
                  </button>
                </div>
              </div>
            )}

            {selectedPO && itemsToReceive.length === 0 && (
              <p className="success-info-text">All items in this Purchase Order have already been fully received.</p>
            )}
          </form>
        </div>

        {/* GRN HISTORY TABLE */}
        <div className="grn-list-card">
          <h3>Receipt Logs</h3>

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
                <th>Receipt Number</th>
                <th>Date Received</th>
                <th>PO Reference</th>
                <th>Items Received</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map(rec => (
                <tr key={rec._id}>
                  <td><strong>{rec.grnNumber}</strong></td>
                  <td>{new Date(rec.receivedDate).toLocaleDateString()}</td>
                  <td>{rec.purchaseOrder?.poNumber || "N/A"}</td>
                  <td>
                    <ul className="items-list-cell">
                      {rec.itemsReceived.map((item, idx) => (
                        <li key={idx}>
                          {item.product?.name || "Product"}: {item.quantityReceived} received
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{rec.notes || "-"}</td>
                </tr>
              ))}
              {filteredReceipts.length === 0 && (
                <tr>
                  <td colSpan="5">No receipt logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GoodsReceipts;
