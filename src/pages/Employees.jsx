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

import "./Employees.css";

function Employees() {

  const navigate =
    useNavigate();

  const [employees, setEmployees] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [editId, setEditId] =
    useState(null);

  const [currentPage,
  setCurrentPage] =
    useState(1);

  const recordsPerPage = 5;

  const [formData, setFormData] =
    useState({
      employeeId: "",
      name: "",
      email: "",
      phone: "",
      department: "",
      designation: "",
      salary: ""
    });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value
    });
  };

  const getEmployees =
  async () => {

    try {

      const response =
        await API.get("/employees");

      setEmployees(
        response.data
      );

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {

    getEmployees();

  }, []);

  const handleSubmit =
  async (e) => {

    e.preventDefault();

    try {

      if (editId) {

        await API.put(
          `/employees/${editId}`,
          formData
        );

        alert(
          "Employee Updated"
        );

        setEditId(null);

      } else {

        await API.post(
          "/employees",
          formData
        );

        alert(
          "Employee Added"
        );
      }

      setFormData({
        employeeId: "",
        name: "",
        email: "",
        phone: "",
        department: "",
        designation: "",
        salary: ""
      });

      getEmployees();

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
        "Are you sure want to delete?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      await API.delete(
        `/employees/${id}`
      );

      alert(
        "Employee Deleted"
      );

      getEmployees();

    } catch (error) {

      console.log(error);
    }
  };

  const handleEdit = (emp) => {

    setFormData({
      employeeId:
        emp.employeeId,

      name: emp.name,

      email: emp.email,

      phone: emp.phone,

      department:
        emp.department,

      designation:
        emp.designation,

      salary: emp.salary
    });

    setEditId(emp._id);
  };

  // SEARCH FILTER

  const filteredEmployees =
    employees.filter((emp) =>
      emp.name
      .toLowerCase()
      .includes(
        search.toLowerCase()
      )
    );

  // PAGINATION

  const lastIndex =
    currentPage *
    recordsPerPage;

  const firstIndex =
    lastIndex -
    recordsPerPage;

  const records =
    filteredEmployees.slice(
      firstIndex,
      lastIndex
    );

  const npage =
    Math.ceil(
      filteredEmployees.length /
      recordsPerPage
    );

  return (

    <div className="employee-container">

      <button
        className="back-btn"
        onClick={() =>
          navigate("/dashboard")
        }
      >
        <FaArrowLeft />
      </button>

      <h1>
        Employee Management
      </h1>

      <form
        className="employee-form"
        onSubmit={handleSubmit}
      >

        <input
          type="text"
          name="employeeId"
          placeholder="Employee ID"
          value={formData.employeeId}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="name"
          placeholder="Employee Name"
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
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
        />

        <input
          type="text"
          name="designation"
          placeholder="Designation"
          value={formData.designation}
          onChange={handleChange}
        />

        <input
          type="number"
          name="salary"
          placeholder="Salary"
          value={formData.salary}
          onChange={handleChange}
        />

        <button type="submit">

          {
            editId
            ? "Update Employee"
            : "Add Employee"
          }

        </button>

      </form>

      <input
        className="search-input"
        type="text"
        placeholder="Search Employee"
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
      />

      <table>

        <thead>

          <tr>

            <th>ID</th>

            <th>Name</th>

            <th>Email</th>

            <th>Phone</th>

            <th>Department</th>

            <th>Designation</th>

            <th>Salary</th>

            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {
            records.map((emp) => (

            <tr key={emp._id}>

              <td>
                {emp.employeeId}
              </td>

              <td>
                {emp.name}
              </td>

              <td>
                {emp.email}
              </td>

              <td>
                {emp.phone}
              </td>

              <td>
                {emp.department}
              </td>

              <td>
                {emp.designation}
              </td>

              <td>
                ₹ {emp.salary}
              </td>

              <td>

                <button
                  className="edit-btn"
                  onClick={() =>
                    handleEdit(emp)
                  }
                >
                  <FaEdit />
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(
                      emp._id
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

      <div className="pagination">

        {
          [...Array(npage)].map(
            (_, i) => (

            <button
              key={i}
              onClick={() =>
                setCurrentPage(i + 1)
              }
            >
              {i + 1}
            </button>
          ))
        }

      </div>

    </div>
  );
}

export default Employees; 