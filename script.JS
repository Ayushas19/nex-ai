
// ⚠️ SECURITY NOTE: Replace this placeholder with your actual, private API key.
// NEVER hardcode this in client-side code (like a browser), use environment variables (Node.js).
const OPENROUTER_API_KEY = "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";

// The model you were trying to use
const MODEL_NAME = "deepseek/deepseek-r1:free";

/**
 * Sends a message to the OpenRouter API using the Deepseek-R1 free model.
 * @param {string} userMessage The message to send to the chatbot.
 */
async function sendMessage(userMessage) {
    const url = "https://openrouter.ai/api/v1/chat/completions";

    const payload = {
        model: MODEL_NAME,
        messages: [
            // System message sets the persona of the AI
            { role: "system", content: "You are a helpful and concise AI assistant." },
            // User's message
            { role: "user", content: userMessage }
        ],
        // Set optional parameters here (e.g., max_tokens, temperature)
        temperature: 0.7, 
        max_tokens: 1024
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                // OpenRouter often requires a referrer/title for statistics and to lift some limits.
                'HTTP-Referer': 'https://yourchatbotdomain.com', // Replace with your domain
                'X-Title': 'Your ChatBot Name'                    // Replace with your chatbot name
            },
            body: JSON.stringify(payload)
        });

        // Handle the HTTP response
        if (!response.ok) {
            // Read the error body for detailed error information (like the 429 rate limit)
            const errorBody = await response.json();
            
            // Check specifically for the 429 rate limit error
            if (response.status === 429) {
                throw new Error(`Rate Limit Hit (429): ${errorBody.message || 'Please retry shortly or check your OpenRouter limits.'}`);
            }

            // Throw a general error for other non-200 responses
            throw new Error(`API Request Failed with status ${response.status}: ${errorBody.message}`);
        }

        const data = await response.json();
        
        // Extract and return the AI's response text
        const aiResponse = data.choices[0].message.content;
        return aiResponse;

    } catch (error) {
        console.error("Error calling OpenRouter API:", error.message);
        return `ERROR: ${error.message}. Please check your key or rate limits.`;
    }
}

// --- Example Usage ---
// This is how you would call the function to get a response
(async () => {
    const message = "Hello, what is the fastest way to solve a rate limit issue?";
    console.log(`User: ${message}`);

    const result = await sendMessage(message);
    console.log(`AI Response: ${result}`);
})();