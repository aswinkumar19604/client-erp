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

import "./Customers.css";

function Customers() {

  const navigate =
    useNavigate();

  const [customers,
  setCustomers] =
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

  const getCustomers =
  async () => {

    const response =
      await API.get(
        "/customers"
      );

    setCustomers(
      response.data
    );
  };

  useEffect(() => {

    getCustomers();

  }, []);

  const handleSubmit =
  async (e) => {

    e.preventDefault();

    try {

      if (editingId) {

        await API.put(

          `/customers/${editingId}`,

          formData
        );

        alert(
          "Customer Updated"
        );

      } else {

        await API.post(
          "/customers",
          formData
        );

        alert(
          "Customer Created"
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

      getCustomers();

    } catch (error) {

      alert(
        error.response.data.message
      );
    }
  };

  const handleEdit =
  (customer) => {

    setEditingId(
      customer._id
    );

    setFormData({

      name:
        customer.name,

      email:
        customer.email,

      phone:
        customer.phone,

      address:
        customer.address,

      gstNumber:
        customer.gstNumber
    });
  };

  const handleDelete =
  async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete Customer?"
      );

    if (!confirmDelete) {
      return;
    }

    await API.delete(
      `/customers/${id}`
    );

    getCustomers();
  };

  const filteredCustomers =
    customers.filter(
      (customer) =>

        customer.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (

    <div className="customer-container">

      <button
        className="back-btn"
        onClick={() =>
          navigate("/dashboard")
        }
      >
        <FaArrowLeft />
      </button>

      <h1>
        Customers
      </h1>

      <form
        className="customer-form"
        onSubmit={handleSubmit}
      >

        <input
          type="text"
          name="name"
          placeholder="Customer Name"
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
            ? "Update Customer"
            : "Add Customer"
          }

        </button>

      </form>

      <input
        type="text"
        placeholder="Search Customer"
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
            filteredCustomers.map(
            (customer) => (

            <tr key={customer._id}>

              <td>
                {customer.name}
              </td>

              <td>
                {customer.email}
              </td>

              <td>
                {customer.phone}
              </td>

              <td>
                {customer.address}
              </td>

              <td>
                {customer.gstNumber}
              </td>

              <td>

                <button
                  className="edit-btn"
                  onClick={() =>
                    handleEdit(
                      customer
                    )
                  }
                >
                  <FaEdit />
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(
                      customer._id
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

export default Customers;