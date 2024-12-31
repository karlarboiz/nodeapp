const { default: OpenAI } = require("openai");

class OpenAIAPI {
    constructor() {
        this.client = new OpenAI({
            apiKey: "your_API_Key", // This can be omitted if it's specified in the environment
        });
    }
 
    static async generateSummaryFromTextContent(textContext) {
        const client = new OpenAIAPI().client; // Create a new instance to access the client

        try {
            let prompt = `
            Give me a summary based on this text context from a website :
            ${textContext}
            `;
            
            const chatCompletion = await client.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: process.env.GPTVERSION,
            });
            
            return chatCompletion?.choices[0]?.message?.content;
        } catch (e) {
            throw new Error(e.message);
        }
    }
}

module.exports = OpenAIAPI;
