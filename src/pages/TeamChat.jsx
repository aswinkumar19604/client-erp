import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { FaArrowLeft, FaPaperPlane, FaUserCircle, FaComments, FaCircle } from "react-icons/fa";
import API from "../services/api";
import "./TeamChat.css";

function TeamChat() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // Local user parsing
  const currentUserStr = localStorage.getItem("user");
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const userEmail = currentUser ? currentUser.email : "";
  const userName = currentUser ? (currentUser.name || currentUser.email) : "Me";

  const [colleagues, setColleagues] = useState([]);
  const [selectedColleague, setSelectedColleague] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [socket, setSocket] = useState(null);

  const messagesEndRef = useRef(null);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getColleagues = async () => {
    try {
      const res = await API.get("/auth/users");
      // Filter out yourself from the list
      const list = res.data.filter(emp => emp.email !== userEmail);
      setColleagues(list);
      if (list.length > 0) {
        setSelectedColleague(list[0]);
      }
    } catch (err) {
      console.log("Failed to load colleagues:", err);
    }
  };

  const fetchHistory = async (colleagueEmail) => {
    try {
      const res = await API.get(`/chat/history?user1=${userEmail}&user2=${colleagueEmail}`);
      setMessages(res.data);
    } catch (err) {
      console.log("Failed to load chat history:", err);
    }
  };

  useEffect(() => {
    getColleagues();
  }, []);

  // Fetch history when selecting active user
  useEffect(() => {
    if (selectedColleague) {
      fetchHistory(selectedColleague.email);
    }
  }, [selectedColleague]);

  // Handle Socket.io lifecycle
  useEffect(() => {
    if (!userEmail) return;

    // Connect to backend WebSocket server
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || "https://server-erp-3.onrender.com");
    setSocket(newSocket);

    // Register room
    newSocket.emit("join", userEmail);

    // Receive message
    newSocket.on("message", (msg) => {
      setMessages((prev) => {
        // Prevent duplicate logs
        if (prev.some(m => m._id === msg._id)) return prev;

        // Check if message belongs to the current open window
        const isFromSelected = msg.sender === selectedColleague?.email && msg.recipient === userEmail;
        const isToSelected = msg.sender === userEmail && msg.recipient === selectedColleague?.email;

        if (isFromSelected || isToSelected) {
          return [...prev, msg];
        }
        return prev;
      });
    });

    return () => newSocket.close();
  }, [userEmail, selectedColleague]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!msgText.trim() || !socket || !selectedColleague) return;

    // Emit private message to backend Socket.io
    socket.emit("private_message", {
      sender: userEmail,
      senderName: userName,
      recipient: selectedColleague.email,
      content: msgText.trim()
    });

    setMsgText("");
  };

  return (
    <div className="chat-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>ERP System</h2>
        <ul>
          {role === "admin" ? (
            <li><Link to="/dashboard">Dashboard</Link></li>
          ) : (
            <li><Link to="/ess-portal">ESS Portal</Link></li>
          )}
          {role === "admin" && (
            <>
              <li><Link to="/employees">Employees</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/inventory">Inventory</Link></li>
              <li><Link to="/stock-history">Stock History</Link></li>
              <li><Link to="/manufacturing">Manufacturing</Link></li>
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

      {/* MAIN CONTENT */}
      <div className="chat-container-shell" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: '28px', background: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.04)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="back-btn" onClick={() => navigate(role === "admin" ? "/dashboard" : "/ess-portal")} style={{ marginBottom: 0 }}>
            <FaArrowLeft />
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaComments style={{ color: '#3b82f6' }} />
            Internal Team Chat
          </h1>
        </div>

        {/* CHAT INTERFACE WINDOW */}
        <div className="chat-interface" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* LEFT: TEAM MEMBERS LIST */}
          <div className="colleagues-sidebar" style={{ width: '280px', borderRight: '1px solid #f1f5f9', overflowY: 'auto', background: '#f8fafc', padding: '16px' }}>
            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '16px', fontWeight: 700 }}>
              Team Colleagues ({colleagues.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {colleagues.map((emp) => {
                const isActive = selectedColleague?._id === emp._id;
                return (
                  <button
                    key={emp._id}
                    onClick={() => setSelectedColleague(emp)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      width: '100%',
                      textAlign: 'left',
                      border: '1px solid transparent',
                      borderRadius: '10px',
                      background: isActive ? '#3b82f6' : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.2)' : '0 2px 4px rgba(15, 23, 42, 0.01)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                  >
                    <FaUserCircle size={28} style={{ color: isActive ? '#ffffff' : '#94a3b8' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {emp.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isActive ? 'rgba(255,255,255,0.8)' : '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {emp.email}
                      </div>
                    </div>
                    <FaCircle size={8} style={{ color: '#16a34a', flexShrink: 0 }} />
                  </button>
                );
              })}
              {colleagues.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginTop: '20px' }}>
                  No other colleagues found.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: CHAT FEED WINDOW */}
          <div className="chat-thread-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {selectedColleague ? (
              <>
                {/* Active Chat Header */}
                <div className="chat-thread-header" style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff' }}>
                  <FaUserCircle size={32} style={{ color: '#3b82f6' }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      {selectedColleague.name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <FaCircle size={6} /> Active Online
                    </span>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="messages-feed" style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#fafbfc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {messages.map((msg) => {
                    const isMyMessage = msg.sender === userEmail;
                    return (
                      <div
                        key={msg._id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMyMessage ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          alignSelf: isMyMessage ? 'flex-end' : 'flex-start'
                        }}
                      >
                        {/* Bubble */}
                        <div
                          style={{
                            padding: '12px 16px',
                            borderRadius: isMyMessage ? '16px 16px 0 16px' : '16px 16px 16px 0',
                            background: isMyMessage ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#ffffff',
                            color: isMyMessage ? '#ffffff' : '#1e293b',
                            fontSize: '0.9rem',
                            lineHeight: '1.4',
                            boxShadow: isMyMessage ? '0 4px 10px rgba(37, 99, 235, 0.15)' : '0 2px 6px rgba(15, 23, 42, 0.04)',
                            border: isMyMessage ? 'none' : '1px solid #e2e8f0',
                            wordBreak: 'break-word'
                          }}
                        >
                          {msg.content}
                        </div>
                        {/* Timestamp */}
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', padding: '0 4px' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Text Form Footer */}
                <form onSubmit={handleSendMessage} style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', background: '#ffffff', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder={`Type message to ${selectedColleague.name}...`}
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      padding: '12px 16px !important',
                      border: '1px solid #cbd5e1 !important',
                      borderRadius: '10px !important',
                      fontSize: '0.9rem !important',
                      boxShadow: 'none !important'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: '#ffffff',
                      border: 'none',
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)',
                      flexShrink: 0
                    }}
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '12px' }}>
                <FaComments size={48} />
                <p style={{ fontSize: '0.95rem' }}>Select a colleague on the sidebar list to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamChat;
