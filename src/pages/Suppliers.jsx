import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  FaTrash,
  FaEdit,
  FaArrowLeft
} from "react-icons/fa";

import API from "../services/api";

import "./Suppliers.css";

function Suppliers() {

  const navigate =
    useNavigate();

  const [suppliers,
  setSuppliers] =
    useState([]);

  const [editingId,
  setEditingId] =
    useState(null);

  const [search,
  setSearch] =
    useState("");

  const [formData,
  setFormData] =
    useState({

      name: "",
      email: "",
      phone: "",
      address: "",
      gstNumber: ""
    });

  const handleChange =
  (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value
    });
  };

  const getSuppliers =
  async () => {

    const response =
      await API.get(
        "/suppliers"
      );

    setSuppliers(
      response.data
    );
  };

  useEffect(() => {

    getSuppliers();

  }, []);

  const handleSubmit =
  async (e) => {

    e.preventDefault();

    try {

      if (editingId) {

        await API.put(

          `/suppliers/${editingId}`,

          formData
        );

        alert(
          "Supplier Updated"
        );

      } else {

        await API.post(
          "/suppliers",
          formData
        );

        alert(
          "Supplier Created"
        );
      }

      setFormData({

        name: "",
        email: "",
        phone: "",
        address: "",
        gstNumber: ""
      });

      setEditingId(null);

      getSuppliers();

    } catch (error) {

      alert(
        error.response.data.message
      );
    }
  };

  const handleEdit =
  (supplier) => {

    setEditingId(
      supplier._id
    );

    setFormData({

      name:
        supplier.name,

      email:
        supplier.email,

      phone:
        supplier.phone,

      address:
        supplier.address,

      gstNumber:
        supplier.gstNumber
    });
  };

  const handleDelete =
  async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete Supplier?"
      );

    if (!confirmDelete) {
      return;
    }

    await API.delete(
      `/suppliers/${id}`
    );

    getSuppliers();
  };

  const filteredSuppliers =
    suppliers.filter(
      (supplier) =>

        supplier.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (

    <div className="supplier-container">

      <button
        className="back-btn"
        onClick={() =>
          navigate("/dashboard")
        }
      >
        <FaArrowLeft />
      </button>

      <h1>
        Suppliers
      </h1>

      <form
        className="supplier-form"
        onSubmit={handleSubmit}
      >

        <input
          type="text"
          name="name"
          placeholder="Supplier Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
        />

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
        />

        <input
          type="text"
          name="gstNumber"
          placeholder="GST Number"
          value={formData.gstNumber}
          onChange={handleChange}
        />

        <button type="submit">

          {
            editingId
            ? "Update Supplier"
            : "Add Supplier"
          }

        </button>

      </form>

      <input
        type="text"
        placeholder="Search Supplier"
        className="search-box"
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
      />

      <table>

        <thead>

          <tr>

            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>GST</th>
            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {
            filteredSuppliers.map(
            (supplier) => (

            <tr key={supplier._id}>

              <td>
                {supplier.name}
              </td>

              <td>
                {supplier.email}
              </td>

              <td>
                {supplier.phone}
              </td>

              <td>
                {supplier.address}
              </td>

              <td>
                {supplier.gstNumber}
              </td>

              <td>

                <button
                  className="edit-btn"
                  onClick={() =>
                    handleEdit(
                      supplier
                    )
                  }
                >
                  <FaEdit />
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(
                      supplier._id
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

export default Suppliers;