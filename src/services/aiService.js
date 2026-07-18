import API from "./api";

export const sendMessage = async (message) => {
    try {
        const response = await API.post("/ai/chat", {
            message
        });

        return response.data.reply;

    } catch (error) {

        console.error("AI Service Error:", error);

        return "Sorry! Something went wrong.";

    }
};