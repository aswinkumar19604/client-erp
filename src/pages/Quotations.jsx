import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFileInvoice, FaPlus, FaTrash, FaCheck, FaTimes, FaExchangeAlt, FaPrint } from "react-icons/fa";
import API from "../services/api";
import "./Quotations.css";
import Sidebar from "../components/Sidebar";

function Quotations() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Create form state
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [quoteItems, setQuoteItems] = useState([{ product: "", quantity: 1, price: 0 }]);

  // Convert modal/inline state
  const [convertingQuoteId, setConvertingQuoteId] = useState(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");


  const fetchData = async () => {
    try {
      const [custRes, prodRes, quoteRes] = await Promise.all([
        API.get("/customers"),
        API.get("/products"),
        API.get("/sales-workflow/quotations")
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
      setQuotations(quoteRes.data);
    } catch (err) {
      console.log("Failed to load Quotation datasets:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredQuotations = quotations.filter(q => {
    if (!startDate && !endDate) return true;
    const qDate = new Date(q.createdAt || q.date).toISOString().slice(0, 10);
    const start = startDate || "0000-00-00";
    const end = endDate || "9999-99-99";
    return qDate >= start && qDate <= end;
  });

  const handleAddItem = () => {
    setQuoteItems([...quoteItems, { product: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (idx) => {
    const updated = quoteItems.filter((_, i) => i !== idx);
    setQuoteItems(updated);
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...quoteItems];
    updated[idx][field] = value;
    
    // Auto-fill price when product changes
    if (field === "product") {
      const productObj = products.find(p => p._id === value);
      if (productObj) {
        updated[idx].price = productObj.price || 0;
      }
    }
    
    setQuoteItems(updated);
  };

  const calculateTotal = () => {
    return quoteItems.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedCustomer || !validUntil || quoteItems.some(i => !i.product || i.quantity < 1 || i.price < 0)) {
      setErrorMsg("All fields and items must be correctly filled.");
      return;
    }

    try {
      await API.post("/sales-workflow/quotations", {
        customer: selectedCustomer,
        validUntil,
        items: quoteItems
      });
      setSuccessMsg("Quotation created successfully!");
      setSelectedCustomer("");
      setValidUntil("");
      setQuoteItems([{ product: "", quantity: 1, price: 0 }]);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create quotation");
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await API.put(`/sales-workflow/quotations/${id}/status`, { status });
      setSuccessMsg(res.data.message);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update quotation status");
    }
  };

  const handleConvertSO = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await API.post(`/sales-workflow/quotations/${convertingQuoteId}/convert-so`, {
        shippingAddress,
        deliveryDate
      });
      setSuccessMsg(res.data.message);
      setConvertingQuoteId(null);
      setShippingAddress("");
      setDeliveryDate("");
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to convert quotation to Sales Order");
    }
  };

  const handlePrintQuote = (quote) => {
    // Generate simple printable invoice popup layout
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Quotation ${quote.quotationNumber}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; }
            .meta { text-align: right; font-size: 14px; line-height: 1.6; }
            .client-card { margin-bottom: 30px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #f8fafc; font-weight: bold; }
            .total-row { text-align: right; font-size: 18px; font-weight: bold; margin-top: 30px; }
            .footer { border-top: 1px solid #ddd; margin-top: 50px; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">OFFICIAL QUOTATION</div>
              <div>ERP Corp Ltd.</div>
            </div>
            <div class="meta">
              <strong>Quote No:</strong> ${quote.quotationNumber}<br>
              <strong>Date:</strong> ${new Date(quote.createdAt).toLocaleDateString()}<br>
              <strong>Valid Until:</strong> ${new Date(quote.validUntil).toLocaleDateString()}<br>
              <strong>Status:</strong> ${quote.status}
            </div>
          </div>

          <div class="client-card">
            <strong>Prepared For:</strong><br>
            Name: ${quote.customer?.name || "N/A"}<br>
            Email: ${quote.customer?.email || "N/A"}<br>
            Phone: ${quote.customer?.phone || "N/A"}
          </div>

          <table>
            <thead>
              <tr>
                <th>Product Description</th>
                <th>Qty</th>
                <th>Price (₹)</th>
                <th>Subtotal (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${quote.items.map(item => `
                <tr>
                  <td>${item.product?.name || "N/A"}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price.toLocaleString()}</td>
                  <td>₹${(item.quantity * item.price).toLocaleString()}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="total-row">
            Total Quotation Amount: ₹${quote.totalAmount.toLocaleString()}
          </div>

          <div class="footer">
            Thank you for choosing ERP Corp. This is a computer-generated quotation and does not require a signature.
          </div>

          <script>
            window.print();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="quotations-layout">
      {/* SIDEBAR */}
      <Sidebar activePage="quotations" />

      {/* MAIN CONTAINER */}
      <div className="quotations-container">
        <button className="back-btn no-print" onClick={() => navigate("/dashboard")}>
          <FaArrowLeft />
        </button>
        <h1>Quotations & Proposals Sheet</h1>
        <p className="subtitle no-print">Draft official product quotations and convert quotes to Sales Orders</p>

        {/* Action modal for conversion */}
        {convertingQuoteId && (
          <div className="modal-overlay no-print">
            <div className="modal-card">
              <h3>Convert Quotation to Sales Order</h3>
              <form onSubmit={handleConvertSO}>
                <div className="form-item">
                  <label>Fulfillment/Shipping Address</label>
                  <textarea
                    required
                    placeholder="Enter shipping address for this Sales Order..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                  />
                </div>
                <div className="form-item">
                  <label>Commitment Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>
                <div className="modal-buttons">
                  <button type="submit" className="confirm-btn">Confirm Convert</button>
                  <button type="button" className="cancel-btn" onClick={() => setConvertingQuoteId(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Messaging alerts */}
        {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
        {successMsg && <div className="alert-banner success">{successMsg}</div>}

        <div className="quotations-split-panel">
          {/* Create Form */}
          <div className="form-card no-print">
            <h3>Prepare New Quotation</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-item">
                <label>Select Target Customer</label>
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
                <label>Proposal Validity Until</label>
                <input
                  type="date"
                  required
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>

              <div className="items-heading-row">
                <h4>Quotation Items List</h4>
                <button
                  type="button"
                  className="add-item-btn"
                  onClick={handleAddItem}
                >
                  <FaPlus /> Add Line Item
                </button>
              </div>

              {quoteItems.map((item, idx) => (
                <div key={idx} className="quote-item-row">
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
                  {quoteItems.length > 1 && (
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
                <span>Total Amount:</span>
                <strong>₹{calculateTotal().toLocaleString()}</strong>
              </div>

              <button type="submit" className="save-quote-btn">
                Save & Draft Quotation
              </button>
            </form>
          </div>

          {/* List Table */}
          <div className="table-card">
            <h3>Registered Quotations Ledger</h3>

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
                  <th>Quote No</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                  <th className="amount-header no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.map(quote => (
                  <tr key={quote._id}>
                    <td><strong>{quote.quotationNumber}</strong></td>
                    <td>
                      {quote.customer?.name || "N/A"}
                      <br />
                      <small className="sub-txt">{quote.customer?.email}</small>
                    </td>
                    <td>₹{quote.totalAmount.toLocaleString()}</td>
                    <td>{new Date(quote.validUntil).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-pill ${quote.status.toLowerCase()}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="action-cell no-print">
                      <div className="action-row">
                        <button
                          className="btn-action print"
                          onClick={() => handlePrintQuote(quote)}
                          title="Print/Download Quote PDF"
                        >
                          <FaPrint /> Print
                        </button>
                        {quote.status === "Draft" && (
                          <>
                            <button
                              className="btn-action send"
                              onClick={() => handleStatusUpdate(quote._id, "Sent")}
                              title="Mark as Sent"
                            >
                              Send
                            </button>
                            <button
                              className="btn-action reject"
                              onClick={() => handleStatusUpdate(quote._id, "Rejected")}
                              title="Reject Proposal"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        {quote.status === "Sent" && (
                          <>
                            <button
                              className="btn-action convert"
                              onClick={() => setConvertingQuoteId(quote._id)}
                              title="Convert to Sales Order"
                            >
                              <FaExchangeAlt /> Convert to SO
                            </button>
                            <button
                              className="btn-action reject"
                              onClick={() => handleStatusUpdate(quote._id, "Rejected")}
                              title="Reject Proposal"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        {quote.status === "Approved" && (
                          <span className="converted-lbl"><FaCheck /> Converted to SO</span>
                        )}
                        {quote.status === "Rejected" && (
                          <span className="rejected-lbl"><FaTimes /> Rejected Proposal</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredQuotations.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-row-txt">No quotations registered yet.</td>
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

export default Quotations;
