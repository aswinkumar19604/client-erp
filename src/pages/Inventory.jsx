import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaArrowLeft, FaExclamationTriangle } from "react-icons/fa";
import API from "../services/api";
import "./Inventory.css";

function Inventory() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [formData, setFormData] = useState({
    product: "",
    stockIn: "",
    stockOut: "",
    warehouse: "Main Warehouse"
  });

  // =========================
  // HANDLE INPUT
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
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // GET INVENTORY
  // =========================
  const getInventory = async () => {
    try {
      const res = await API.get("/inventory");
      setInventory(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    getProducts();
    getInventory();
  }, []);

  // =========================
  // LOW STOCK ALERT
  // =========================
  useEffect(() => {
    const lowStockItems = inventory.filter(
      (item) => item.status === "Low Stock"
    );

    if (lowStockItems.length > 0) {
      console.log("LOW STOCK ITEMS:", lowStockItems);

      // simple alert (you can replace with toast later)
      alert(`⚠ ${lowStockItems.length} product(s) are low in stock!`);
    }
  }, [inventory]);

  // =========================
  // SUBMIT INVENTORY
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/inventory", formData);

      alert("Inventory Updated");

      setFormData({
        product: "",
        stockIn: "",
        stockOut: "",
        warehouse: "Main Warehouse"
      });

      getInventory();
    } catch (error) {
      alert(error.response?.data?.message);
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete Inventory?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/inventory/${id}`);
      getInventory();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="inventory-container">

      {/* BACK BUTTON */}
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        <FaArrowLeft />
      </button>

      <h1>Inventory Management</h1>

      {/* =========================
          FORM
      ========================= */}
      <form className="inventory-form" onSubmit={handleSubmit}>

        {/* PRODUCT */}
        <select
          name="product"
          value={formData.product}
          onChange={handleChange}
          required
        >
          <option value="">Select Product</option>

          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* STOCK IN */}
        <input
          type="number"
          name="stockIn"
          placeholder="Stock In"
          value={formData.stockIn}
          onChange={handleChange}
        />

        {/* STOCK OUT */}
        <input
          type="number"
          name="stockOut"
          placeholder="Stock Out"
          value={formData.stockOut}
          onChange={handleChange}
        />

        {/* WAREHOUSE */}
        <input
          type="text"
          name="warehouse"
          placeholder="Warehouse"
          value={formData.warehouse}
          onChange={handleChange}
        />

        <button type="submit">Update Inventory</button>
      </form>

      {/* =========================
          TABLE
      ========================= */}
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Stock In</th>
            <th>Stock Out</th>
            <th>Available</th>
            <th>Warehouse</th>
            <th>Status</th>
            <th>Alert</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {inventory.map((item) => {
            const minQty =
              item.product?.minimum_record_qty || 10;

            const isLow =
              item.availableStock <= minQty;

            return (
              <tr key={item._id} className={isLow ? "low-row" : ""}>

                <td>{item.product?.name}</td>
                <td>{item.stockIn}</td>
                <td>{item.stockOut}</td>
                <td>{item.availableStock}</td>
                <td>{item.warehouse}</td>

                <td className={isLow ? "low-stock" : "in-stock"}>
                  {item.status}
                </td>

                {/* ALERT ICON */}
                <td>
                  {isLow && (
                    <FaExclamationTriangle color="red" />
                  )}
                </td>

                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item._id)}
                  >
                    <FaTrash />
                  </button>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>

    </div>
  );
}

export default Inventory;