import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  FaTrash,
  FaArrowLeft,
  FaFilePdf,
  FaFileExcel
} from "react-icons/fa";

import API from "../services/api";

import "./Sales.css";

function Sales() {

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);

  const [formData, setFormData] = useState({

    customer: "",   // ✅ FIXED
    product: "",
    quantity: "",
    paymentStatus: "Paid"
  });

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // GET PRODUCTS
  // =========================
  const getProducts = async () => {
    try {
      const response = await API.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // GET CUSTOMERS
  // =========================
  const getCustomers = async () => {
    try {
      const response = await API.get("/customers");
      setCustomers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // GET SALES
  // =========================
  const getSales = async () => {
    try {
      const response = await API.get("/sales");
      setSales(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    getProducts();
    getCustomers();
    getSales();
  }, []);

  // =========================
  // SUBMIT SALE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/sales", formData);

      alert("Sale Completed");

      setFormData({
        customer: "",
        product: "",
        quantity: "",
        paymentStatus: "Paid"
      });

      getSales();

    } catch (error) {
      alert(error.response.data.message);
    }
  };

  // =========================
  // DELETE SALE
  // =========================
  const handleDelete = async (id) => {

    const confirmDelete = window.confirm("Delete Sale?");

    if (!confirmDelete) return;

    try {
      await API.delete(`/sales/${id}`);

      alert("Sale Deleted");

      getSales();

    } catch (error) {
      console.log(error);
    }
  };
// =========================
// EXPORT SALES EXCEL
// =========================
const exportSalesExcel = async () => {

  try {

    const response = await API.get(
      "/sales/export/excel",
      {
        responseType: "blob"
      }
    );

    const url =
      window.URL.createObjectURL(
        new Blob([response.data])
      );

    const link =
      document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      "sales-report.xlsx"
    );

    document.body.appendChild(link);

    link.click();

    link.remove();

  } catch (error) {

    console.log(error);

    alert("Excel export failed");
  }
};
  return (

    <div className="sales-container">

      {/* BACK BUTTON */}
      <button
        className="back-btn"
        onClick={() => navigate("/dashboard")}
      >
        <FaArrowLeft />
      </button>

      <h1>Sales Management</h1>

      <div className="top-actions">

        <button
          className="excel-btn"
          onClick={exportSalesExcel}
        >
          <FaFileExcel />
          Export Excel
        </button>

      </div>

      {/* FORM */}
      <form className="sales-form" onSubmit={handleSubmit}></form>
            {/* FORM */}
      <form className="sales-form" onSubmit={handleSubmit}>

        {/* CUSTOMER DROPDOWN */}
        <select
          name="customer"
          value={formData.customer}
          onChange={handleChange}
          required
        >
          <option value="">
            Select Customer
          </option>

          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* PRODUCT DROPDOWN */}
        <select
          name="product"
          value={formData.product}
          onChange={handleChange}
          required
        >
          <option value="">
            Select Product
          </option>

          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />

        <select
          name="paymentStatus"
          value={formData.paymentStatus}
          onChange={handleChange}
        >
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>

        <button type="submit">
          Create Sale
        </button>

      </form>

      {/* TABLE */}
      <table>

        <thead>
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {sales.map((sale) => (
            <tr key={sale._id}>

              <td>{sale.invoiceNumber}</td>

              <td>{sale.customer?.name}</td>

              <td>{sale.product?.name}</td>

              <td>{sale.quantity}</td>

              <td>₹ {sale.price}</td>

              <td>₹ {sale.total}</td>

              <td>{sale.paymentStatus}</td>

              <td>

                {/* PDF */}
                <button
                  className="pdf-btn"
                  onClick={() => {
                    window.location.href =
                      `http://localhost:5000/api/invoice/${sale._id}`;
                  }}
                >
                  <FaFilePdf />
                </button>

                {/* DELETE */}
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(sale._id)}
                >
                  <FaTrash />
                </button>

              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}

export default Sales;