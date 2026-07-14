import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  FaEdit,
  FaTrash,
  FaArrowLeft
} from "react-icons/fa";

import API from "../services/api";

import "./Products.css";

function Products() {

  const navigate =
    useNavigate();

  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [editId, setEditId] =
    useState(null);

  const [formData, setFormData] =
    useState({
      sku: "",
      name: "",
      category: "",
      brand: "",
      price: "",
      stock: "",
      description: "",
      minimum_record_qty:""
    });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value
    });
  };

  const getProducts =
  async () => {

    const response =
      await API.get("/products");

    setProducts(
      response.data
    );
  };

  useEffect(() => {

    getProducts();

  }, []);

  const handleSubmit =
  async (e) => {

    e.preventDefault();

    try {

      if (editId) {

        await API.put(
          `/products/${editId}`,
          formData
        );

        alert(
          "Product Updated"
        );

        setEditId(null);

      } else {

        await API.post(
          "/products",
          formData
        );

        alert(
          "Product Added"
        );
      }

      setFormData({
        sku: "",
        name: "",
        category: "",
        brand: "",
        price: "",
        stock: "",
        description: "",
        minimum_record_qty:""
      });

      getProducts();

    } catch (error) {

      alert(
        error.response.data.message
      );
    }
  };

  const handleDelete =
  async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete Product?"
      );

    if (!confirmDelete) {
      return;
    }

    await API.delete(
      `/products/${id}`
    );

    getProducts();
  };

  const handleEdit =
  (product) => {

    setFormData(product);

    setEditId(product._id);
  };

  const filteredProducts =
    products.filter((product) =>
      product.name
      .toLowerCase()
      .includes(
        search.toLowerCase()
      )
    );

  return (
    <div className="product-container">

      <button
        className="back-btn"
        onClick={() =>
          navigate("/dashboard")
        }
      >
        <FaArrowLeft />
      </button>

      <h1>
        Product Management
      </h1>

      <form
        className="product-form"
        onSubmit={handleSubmit}
      >

        <input
          type="text"
          name="sku"
          placeholder="SKU"
          value={formData.sku}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
        />

        <input
          type="text"
          name="brand"
          placeholder="Brand"
          value={formData.brand}
          onChange={handleChange}
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
        />

        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={formData.stock}
          onChange={handleChange}
        />
        <input
          type="number"
          name="minimum_record_qty"
          placeholder="Minimum Stock Level"
          value={formData.minimum_record_qty}
          onChange={handleChange}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />

        <button type="submit">

          {
            editId
            ? "Update Product"
            : "Add Product"
          }

        </button>

      </form>

      <input
        className="search-input"
        type="text"
        placeholder="Search Product"
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      <table>

        <thead>

          <tr>

            <th>SKU</th>

            <th>Name</th>

            <th>Min Qty</th>

            <th>Category</th>

            <th>Brand</th>

            <th>Price</th>

            <th>Stock</th>

            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {
            filteredProducts.map(
            (product) => (

            <tr key={product._id}>

              <td>
                {product.sku}
              </td>

              <td>
                {product.name}
              </td>
              <td>{product.minimum_record_qty}</td>
              <td>
                {product.category}
              </td>

              <td>
                {product.brand}
              </td>

              <td>
                ₹ {product.price}
              </td>

              <td>
                {product.stock}
              </td>

              <td>

                <button
                  className="edit-btn"
                  onClick={() =>
                    handleEdit(product)
                  }
                >
                  <FaEdit />
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(
                      product._id
                    )
                  }
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

export default Products;