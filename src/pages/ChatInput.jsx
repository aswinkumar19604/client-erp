// import React, { useState } from "react";

// const ChatInput = ({ onSend }) => {
//     const [message, setMessage] = useState("");

//     const handleSend = () => {
//         if (!message.trim()) return;

//         onSend(message);
//         setMessage(""); // clear input after send
//     };

//     const handleKeyPress = (e) => {
//         if (e.key === "Enter") {
//             handleSend();
//         }
//     };

//     return (
//         <div className="chat-input-container">
//             <input
//                 type="text"
//                 placeholder="Type your message..."
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 onKeyDown={handleKeyPress}
//             />

//             <button onClick={handleSend}>
//                 Send
//             </button>
//         </div>   
//     );
// };

// export default ChatInput;