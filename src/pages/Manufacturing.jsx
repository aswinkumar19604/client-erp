import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHammer, FaClipboardList, FaPlus, FaTrash, FaCheckCircle, FaTimesCircle, FaPlay } from "react-icons/fa";
import API from "../services/api";
import "./Manufacturing.css";

function Manufacturing() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [products, setProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("work-orders"); // 'work-orders' or 'boms'
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Shortfalls to display if production cannot start
  const [shortfallsList, setShortfallsList] = useState([]);

  // BOM Form state
  const [bomName, setBomName] = useState("");
  const [finishedProduct, setFinishedProduct] = useState("");
  const [bomComponents, setBomComponents] = useState([{ product: "", quantity: 1 }]);

  // Work Order Form state
  const [selectedBOM, setSelectedBOM] = useState("");
  const [selectedProductToProduce, setSelectedProductToProduce] = useState("");
  const [qtyToProduce, setQtyToProduce] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const fetchData = async () => {
    try {
      const [prodRes, bomRes, woRes] = await Promise.all([
        API.get("/products"),
        API.get("/mrp/bom"),
        API.get("/mrp/work-order")
      ]);
      setProducts(prodRes.data);
      setBoms(bomRes.data);
      setWorkOrders(woRes.data);

      if (bomRes.data.length > 0) {
        setSelectedBOM(bomRes.data[0]._id);
        setSelectedProductToProduce(bomRes.data[0].finishedProduct?._id || "");
      }
    } catch (err) {
      console.log("Failed to load MRP datasets:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredWorkOrders = workOrders.filter(wo => {
    if (!startDate && !endDate) return true;
    const woDate = new Date(wo.startDate || wo.createdAt || wo.date).toISOString().slice(0, 10);
    const start = startDate || "0000-00-00";
    const end = endDate || "9999-99-99";
    return woDate >= start && woDate <= end;
  });

  const handleAddComponent = () => {
    setBomComponents([...bomComponents, { product: "", quantity: 1 }]);
  };

  const handleRemoveComponent = (idx) => {
    const updated = bomComponents.filter((_, i) => i !== idx);
    setBomComponents(updated);
  };

  const handleComponentChange = (idx, field, value) => {
    const updated = [...bomComponents];
    updated[idx][field] = value;
    setBomComponents(updated);
  };

  const handleBOMSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!bomName || !finishedProduct || bomComponents.some(c => !c.product || c.quantity <= 0)) {
      setErrorMsg("All formulation fields and components must be correctly filled.");
      return;
    }

    try {
      await API.post("/mrp/bom", {
        finishedProduct,
        name: bomName,
        components: bomComponents
      });
      setSuccessMsg("Bill of Materials recipe created successfully!");
      setBomName("");
      setFinishedProduct("");
      setBomComponents([{ product: "", quantity: 1 }]);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create BOM formulation");
    }
  };

  const handleWOSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedBOM || !selectedProductToProduce || qtyToProduce < 1) {
      setErrorMsg("BOM formulation, product to produce, and quantity are required.");
      return;
    }

    try {
      await API.post("/mrp/work-order", {
        bom: selectedBOM,
        productToProduce: selectedProductToProduce,
        quantityToProduce: qtyToProduce
      });
      setSuccessMsg("Work Order planned successfully!");
      setQtyToProduce(1);
      setSelectedProductToProduce("");
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create Work Order");
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setErrorMsg("");
    setSuccessMsg("");
    setShortfallsList([]);

    try {
      const res = await API.put(`/mrp/work-order/${id}/status`, { status });
      setSuccessMsg(res.data.message);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update Work Order status");
      if (err.response?.data?.shortfalls) {
        setShortfallsList(err.response.data.shortfalls);
      }
    }
  };

  return (
    <div className="mrp-layout">
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
              <li><Link to="/notifications">Notifications</Link></li>
              <li><Link to="/sales">Sales</Link></li>
              <li><Link to="/quotations">Quotations</Link></li>
              <li><Link to="/sales-orders">Sales Orders</Link></li>
              <li><Link to="/purchases">Purchases</Link></li>
              <li><Link to="/purchase-orders">Purchase Orders</Link></li>
              <li><Link to="/goods-receipts">Goods Receipts</Link></li>
              <li><Link to="/general-ledger">General Ledger</Link></li>
              <li><Link to="/financial-reports">Financial Reports</Link></li>
              <li><Link to="/accounting">Accounting</Link></li>
              <li><Link to="/expenses">Expenses</Link></li>
              <li><Link to="/hr">HR</Link></li>
              <li><Link to="/payroll">Payroll</Link></li>
              <li className="active"><Link to="/manufacturing">Manufacturing</Link></li>
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

      {/* MAIN CONTAINER */}
      <div className="mrp-container">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <FaArrowLeft />
        </button>
        <h1>Manufacturing & Assembly Board</h1>
        <p className="subtitle">Formulate Bill of Materials and track factory Work Orders</p>

        {/* Tab switchers */}
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === "work-orders" ? "active" : ""}`}
            onClick={() => { setActiveTab("work-orders"); setErrorMsg(""); setSuccessMsg(""); setShortfallsList([]); }}
          >
            <FaClipboardList /> Active Work Orders
          </button>
          <button
            className={`tab-btn ${activeTab === "boms" ? "active" : ""}`}
            onClick={() => { setActiveTab("boms"); setErrorMsg(""); setSuccessMsg(""); setShortfallsList([]); }}
          >
            <FaHammer /> Bill of Materials (BOM)
          </button>
        </div>

        {/* Messaging banners */}
        {errorMsg && (
          <div className="alert-banner error">
            <p><strong>Error:</strong> {errorMsg}</p>
            {shortfallsList.length > 0 && (
              <div className="shortfalls-box">
                <p><strong>Stock Shortfalls List:</strong></p>
                <ul>
                  {shortfallsList.map((s, i) => (
                    <li key={i}>
                      {s.name}: Needed: {s.required} units &bull; Available: {s.available} units (Short by {s.short} units)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {successMsg && <div className="alert-banner success">{successMsg}</div>}

        {/* TAB content: Work Orders list and planner */}
        {activeTab === "work-orders" && (
          <div className="mrp-split-panel">
            {/* Planner Form */}
            <div className="form-card">
              <h3>Plan Production Run</h3>
              <form onSubmit={handleWOSubmit}>
                <div className="form-item">
                  <label>Select Formulation (BOM)</label>
                  <select
                    value={selectedBOM}
                    required
                    onChange={(e) => {
                      const bomId = e.target.value;
                      setSelectedBOM(bomId);
                      const bomObj = boms.find(b => b._id === bomId);
                      if (bomObj) {
                        setSelectedProductToProduce(bomObj.finishedProduct?._id || "");
                      } else {
                        setSelectedProductToProduce("");
                      }
                    }}
                  >
                    <option value="">-- Choose BOM Formulation --</option>
                    {boms.map(bom => (
                      <option key={bom._id} value={bom._id}>
                        {bom.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBOM && (
                  <div className="form-item">
                    <label>Select Product to Plan/Produce</label>
                    <select
                      value={selectedProductToProduce}
                      required
                      onChange={(e) => setSelectedProductToProduce(e.target.value)}
                    >
                      <option value="">-- Choose Product --</option>
                      {/* Finished Product */}
                      {boms.find(b => b._id === selectedBOM)?.finishedProduct && (
                        <option value={boms.find(b => b._id === selectedBOM).finishedProduct._id}>
                          {boms.find(b => b._id === selectedBOM).finishedProduct.name} (Finished Good)
                        </option>
                      )}
                      {/* Component Products */}
                      {boms.find(b => b._id === selectedBOM)?.components.map(comp => (
                        <option key={comp.product?._id} value={comp.product?._id}>
                          {comp.product?.name} (Raw Component)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-item">
                  <label>Quantity to Produce</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={qtyToProduce}
                    onChange={(e) => setQtyToProduce(Number(e.target.value))}
                  />
                </div>

                {selectedBOM && selectedProductToProduce && (
                  <div className="bom-preview-box">
                    <p className="preview-title">
                      Ingredients needed for production (for {qtyToProduce} units):
                    </p>
                    <ul className="preview-list">
                      {(() => {
                        // Check if this product has its own sub-BOM formulation first
                        let activeFormula = boms.find(b => b._id === selectedBOM);
                        if (activeFormula && selectedProductToProduce !== activeFormula.finishedProduct?._id) {
                          const subFormula = boms.find(b => b.finishedProduct?._id === selectedProductToProduce);
                          if (subFormula) {
                            activeFormula = subFormula;
                          } else {
                            activeFormula = null; // Direct assembly without components
                          }
                        }

                        if (!activeFormula) {
                          return <li>No components recipe defined for this product. Ready to produce directly.</li>;
                        }

                        return activeFormula.components.map((comp, idx) => (
                          <li key={idx}>
                            <strong>{comp.product?.name}</strong>: {(comp.quantity * qtyToProduce).toFixed(1)} units (Available: {comp.product?.stock || 0})
                          </li>
                        ));
                      })()}
                    </ul>
                  </div>
                )}

                <button type="submit" className="plan-btn" disabled={!selectedBOM || !selectedProductToProduce}>
                  Plan Work Order
                </button>
              </form>
            </div>

            {/* Work Orders List */}
            <div className="table-card">
              <h3>Job Orders List</h3>

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
                    <th>WO ID</th>
                    <th>Product</th>
                    <th>Produce Qty</th>
                    <th>Status</th>
                    <th>Dates Logged</th>
                    <th className="amount-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkOrders.map(wo => (
                    <tr key={wo._id}>
                      <td><strong>{wo.workOrderNumber}</strong></td>
                      <td>{wo.productToProduce?.name || "N/A"}</td>
                      <td>{wo.quantityToProduce} units</td>
                      <td>
                        <span className={`status-pill ${wo.status.toLowerCase().replace(" ", "-")}`}>
                          {wo.status}
                        </span>
                      </td>
                      <td className="date-field-col">
                        <small>
                          {wo.startDate && `Started: ${new Date(wo.startDate).toLocaleDateString()}`}
                          <br />
                          {wo.completionDate && `Completed: ${new Date(wo.completionDate).toLocaleDateString()}`}
                        </small>
                      </td>
                      <td className="action-cell">
                        {wo.status === "Planned" && (
                          <div className="action-row">
                            <button
                              className="btn-action start"
                              onClick={() => handleStatusUpdate(wo._id, "In Progress")}
                              title="Start Production Run"
                            >
                              <FaPlay /> Start
                            </button>
                            <button
                              className="btn-action cancel"
                              onClick={() => handleStatusUpdate(wo._id, "Cancelled")}
                              title="Cancel Order"
                            >
                              <FaTimesCircle /> Cancel
                            </button>
                          </div>
                        )}
                        {wo.status === "In Progress" && (
                          <div className="action-row">
                            <button
                              className="btn-action complete"
                              onClick={() => handleStatusUpdate(wo._id, "Completed")}
                              title="Complete Assembly"
                            >
                              <FaCheckCircle /> Complete
                            </button>
                            <button
                              className="btn-action cancel"
                              onClick={() => handleStatusUpdate(wo._id, "Cancelled")}
                              title="Cancel Order"
                            >
                              <FaTimesCircle /> Cancel
                            </button>
                          </div>
                        )}
                        {wo.status === "Completed" && (
                          <span className="complete-msg"><FaCheckCircle /> Stock Assembled</span>
                        )}
                        {wo.status === "Cancelled" && (
                          <span className="cancel-msg"><FaTimesCircle /> Cancelled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredWorkOrders.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-row-txt">No Job Work Orders planned yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB content: Bill of Materials builder */}
        {activeTab === "boms" && (
          <div className="mrp-split-panel">
            {/* Create BOM Form */}
            <div className="form-card large-form-card">
              <h3>Create New Bill of Materials</h3>
              <form onSubmit={handleBOMSubmit}>
                <div className="form-item">
                  <label>Recipe/BOM Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BOM for Office Chair"
                    value={bomName}
                    onChange={(e) => setBomName(e.target.value)}
                  />
                </div>

                <div className="form-item">
                  <label>Target Assembled Product</label>
                  <select
                    value={finishedProduct}
                    required
                    onChange={(e) => setFinishedProduct(e.target.value)}
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="components-heading-row">
                  <h4>Required Raw Components</h4>
                  <button
                    type="button"
                    className="add-ingredient-btn"
                    onClick={handleAddComponent}
                  >
                    <FaPlus /> Add Component
                  </button>
                </div>

                {bomComponents.map((comp, idx) => (
                  <div key={idx} className="ingredient-row">
                    <select
                      value={comp.product}
                      required
                      onChange={(e) => handleComponentChange(idx, "product", e.target.value)}
                    >
                      <option value="">-- Choose Raw Ingredient --</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name} (Stock: {p.stock || 0})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      required
                      placeholder="Qty needed"
                      value={comp.quantity}
                      onChange={(e) => handleComponentChange(idx, "quantity", Number(e.target.value))}
                    />
                    {bomComponents.length > 1 && (
                      <button
                        type="button"
                        className="delete-row-btn"
                        onClick={() => handleRemoveComponent(idx)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}

                <button type="submit" className="save-bom-btn">
                  Save BOM Recipe Formulation
                </button>
              </form>
            </div>

            {/* List of existing BOMs */}
            <div className="table-card">
              <h3>BOM Formulations</h3>
              <div className="boms-list">
                {boms.map(bom => (
                  <div key={bom._id} className="bom-details-card">
                    <h4>{bom.name}</h4>
                    <p className="bom-target-txt">Finished Product: <strong>{bom.finishedProduct?.name || "N/A"}</strong></p>
                    <table className="bom-ingredients-mini-table">
                      <thead>
                        <tr>
                          <th>Raw Component</th>
                          <th>Formula Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bom.components.map((c, i) => (
                          <tr key={i}>
                            <td>{c.product?.name || "N/A"}</td>
                            <td>{c.quantity} units per finished good</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
                {boms.length === 0 && (
                  <p className="empty-row-txt">No BOM formulations registered yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Manufacturing;
