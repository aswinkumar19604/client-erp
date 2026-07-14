import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  FaTrash,
  FaArrowLeft
} from "react-icons/fa";

import API from "../services/api";

import "./Purchases.css";

function Purchases() {

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const [formData, setFormData] = useState({

    supplier: "",   // ✅ FIXED
    product: "",
    quantity: "",
    purchasePrice: "",
    paymentStatus: "Paid"
  });

  // =========================
  // HANDLE CHANGE
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
  // GET SUPPLIERS
  // =========================
  const getSuppliers = async () => {
    try {
      const response = await API.get("/suppliers");
      setSuppliers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // GET PURCHASES
  // =========================
  const getPurchases = async () => {
    try {
      const response = await API.get("/purchases");
      setPurchases(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    getProducts();
    getSuppliers();
    getPurchases();
  }, []);

  // =========================
  // SUBMIT PURCHASE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/purchases", formData);

      alert("Purchase Completed");

      setFormData({
        supplier: "",
        product: "",
        quantity: "",
        purchasePrice: "",
        paymentStatus: "Paid"
      });

      getPurchases();

    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  // =========================
  // DELETE PURCHASE
  // =========================
  const handleDelete = async (id) => {

    const confirmDelete = window.confirm("Delete Purchase?");

    if (!confirmDelete) return;

    try {
      await API.delete(`/purchases/${id}`);

      alert("Purchase Deleted");

      getPurchases();

    } catch (error) {
      console.log(error);
    }
  };

  return (

    <div className="purchase-container">

      {/* BACK BUTTON */}
      <button
        className="back-btn"
        onClick={() => navigate("/dashboard")}
      >
        <FaArrowLeft />
      </button>

      <h1>Purchase Management</h1>

      {/* FORM */}
      <form className="purchase-form" onSubmit={handleSubmit}>

        {/* SUPPLIER DROPDOWN */}
        <select
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
          required
        >
          <option value="">
            Select Supplier
          </option>

          {suppliers.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
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

        <input
          type="number"
          name="purchasePrice"
          placeholder="Purchase Price"
          value={formData.purchasePrice}
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
          Create Purchase
        </button>

      </form>

      {/* TABLE */}
      <table>

        <thead>
          <tr>
            <th>Invoice</th>
            <th>Supplier</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {purchases.map((purchase) => (
            <tr key={purchase._id}>

              <td>{purchase.invoiceNumber}</td>

              <td>{purchase.supplier?.name}</td>

              <td>{purchase.product?.name}</td>

              <td>{purchase.quantity}</td>

              <td>₹ {purchase.purchasePrice}</td>

              <td>₹ {purchase.total}</td>

              <td>{purchase.paymentStatus}</td>

              <td>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(purchase._id)}
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

export default Purchases;   