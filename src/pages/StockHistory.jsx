import { useEffect, useState } from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  FaArrowLeft
} from "react-icons/fa";

import API from "../services/api";

// import "./StockHistory.css";

function StockHistory() {

  const navigate = useNavigate();

  const [history, setHistory] = useState([]);

  const getHistory = async () => {

    try {

      const response =
        await API.get(
          "/stock-history"
        );

      setHistory(
        response.data
      );

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {

    getHistory();

  }, []);

  return (

    <div className="history-container">

      <button
        className="back-btn"
        onClick={() =>
          navigate("/dashboard")
        }
      >
        <FaArrowLeft />
      </button>

      <h1>
        Stock History
      </h1>

      <table>

        <thead>

          <tr>

            <th>
              Product
            </th>

            <th>
              Action
            </th>

            <th>
              Qty
            </th>

            <th>
              Previous
            </th>

            <th>
              New
            </th>

            <th>
              Date
            </th>

          </tr>

        </thead>

        <tbody>

          {
            history.map((item) => (

              <tr key={item._id}>

                <td>
                  {
                    item.product?.name
                  }
                </td>

                <td>
                  {
                    item.actionType
                  }
                </td>

                <td>
                  {
                    item.quantity
                  }
                </td>

                <td>
                  {
                    item.previousStock
                  }
                </td>

                <td>
                  {
                    item.newStock
                  }
                </td>

                <td>
                  {
                    new Date(
                      item.createdAt
                    ).toLocaleString()
                  }
                </td>

              </tr>
            ))
          }

        </tbody>

      </table>

    </div>
  );
}

export default StockHistory;