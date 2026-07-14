import axios from "axios";

const API_URL = "http://localhost:5000/api/ai/chat";

export const sendMessage = async (message) => {
    try {

        const token = localStorage.getItem("token");

        const response = await axios.post(
            API_URL,
            {
                message
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data.reply;

    } catch (error) {

        console.error("AI Service Error:", error);

        return "Sorry! Something went wrong.";

    }
};