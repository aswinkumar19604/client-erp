import { useState, useRef, useEffect } from "react";
import "./ChatBot.css";
import { sendMessage } from "../services/aiService";

const ChatBot = () => {

    const [isOpen, setIsOpen] = useState(false);

    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);

    const [messages, setMessages] = useState([
        {
            sender: "ai",
            text: "👋 Hello! I am your ERP AI Assistant. How can I help you today?"
        }
    ]);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages]);

    const handleSend = async () => {

        if (!message.trim()) return;

        const userMessage = {
            sender: "user",
            text: message
        };

        setMessages(prev => [...prev, userMessage]);

        const currentMessage = message;

        setMessage("");

        setLoading(true);

        const aiReply = await sendMessage(currentMessage);

        setMessages(prev => [
            ...prev,
            {
                sender: "ai",
                text: aiReply
            }
        ]);

        setLoading(false);
    };

    const handleKeyPress = (e) => {

        if (e.key === "Enter") {
            handleSend();
        }

    };

    return (
        <>

            {/* Floating Button */}

            <button
                className="chatbot-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                🤖
            </button>

            {/* Chat Window */}

            {
                isOpen && (

                    <div className="chatbot-container">

                        <div className="chat-header">

                            <h3>ERP AI Assistant</h3>

                            <button
                                onClick={() => setIsOpen(false)}
                            >
                                ✖
                            </button>

                        </div>

                        <div className="chat-body">

                            {
                                messages.map((msg, index) => (

                                    <div
                                        key={index}
                                        className={
                                            msg.sender === "user"
                                                ? "user-message"
                                                : "ai-message"
                                        }
                                    >
                                        {msg.text}
                                    </div>

                                ))
                            }

                            {
                                loading && (

                                    <div className="ai-message">

                                        Typing...

                                    </div>

                                )
                            }

                            <div ref={messagesEndRef}></div>

                        </div>

                        <div className="chat-footer">

                            <input
                                type="text"
                                placeholder="Ask anything..."
                                value={message}
                                onChange={(e) =>
                                    setMessage(e.target.value)
                                }
                                onKeyDown={handleKeyPress}
                            />

                            <button onClick={handleSend}>
                                Send
                            </button>

                        </div>

                    </div>

                )
            }

        </>
    );
};

export default ChatBot;