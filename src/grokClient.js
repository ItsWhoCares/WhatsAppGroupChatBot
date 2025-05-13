import OpenAI from "openai";
import { grokJailbreakPrompt } from "./utils/prompts.js";

// Initialize the xAI client with API key and base URL
const client = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: "https://api.x.ai/v1"
});
const model = "grok-3-beta"; // Kept as per your code; could use "grok-3-latest" if preferred

// Maximum number of messages (user + assistant) to keep in history
const MAX_HISTORY_MESSAGES = 12;
let chatHistory = []; // Stores the conversation history

/**
 * Sends the prompt to Grok AI and maintains conversation history.
 * @param {string} prompt - The user's message.
 * @returns {Promise<string>} - The assistant's reply.
 */
export async function handleGrok(prompt) {
    console.log("Grok Prompt:", prompt);

    // Add the latest user message to the chat history
    chatHistory.push({ role: "user", content: prompt });

    // Create a sliding window of the last MAX_HISTORY_MESSAGES messages
    const windowedHistory = chatHistory.slice(-MAX_HISTORY_MESSAGES);

    // Assemble messages: system prompt followed by recent history
    const messages = [
        ...grokJailbreakPrompt,
        ...windowedHistory
    ];

    try {
        // Call the xAI API with the model and messages
        const completion = await client.chat.completions.create({
            model,
            messages
        });

        // Extract and trim the assistant's reply
        const reply = completion.choices[0].message.content.trim();

        // Add User's message to the chat history
        chatHistory.push({
            role: "user", content: prompt
        });

        // Add the assistant's reply to the chat history
        chatHistory.push({
            role: "assistant", content: reply
        });


        // Trim history to keep only the last MAX_HISTORY_MESSAGES messages
        if (chatHistory.length > MAX_HISTORY_MESSAGES) {
            chatHistory = chatHistory.slice(-MAX_HISTORY_MESSAGES);
        }

        console.log("Grok Reply:", reply);
        return reply;
    } catch (error) {
        console.error("Error calling Grok API:", error);
        throw error; // Let the caller handle the error
    }
}