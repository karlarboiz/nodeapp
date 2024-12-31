const OpenAIAPI = require("../../services/ChatGPTAPI");
const OpenAI = require("openai");

jest.mock("openai");

describe("OpenAIAPI Integration Tests", () => {
    const mockOpenAIResponse = {
        choices: [
            {
                message: {
                    content: "This is a summary of the provided text context.",
                },
            },
        ],
    };

    beforeEach(() => {
        // Mock the `chat.completions.create` method
        OpenAI.prototype.chat = {
            completions: {
                create: jest.fn().mockResolvedValue(mockOpenAIResponse),
            },
        };

        process.env.OPENAI_SECRET_KEY = "test-secret-key";
        process.env.GPTVERSION = "gpt-4";
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete process.env.OPENAI_SECRET_KEY;
        delete process.env.GPTVERSION;
    });

    it("should return a summary of the given text context", async () => {
        const textContext = "This is some example text content from a website.";
        const expectedSummary = "This is a summary of the provided text context.";

        const summary = await OpenAIAPI.generateSummaryFromTextContent(textContext);

        // Assertions
        expect(summary).toBe(expectedSummary);
        expect(OpenAI.prototype.chat.completions.create).toHaveBeenCalledWith({
            messages: [
                {
                    role: "user",
                    content: `
            Give me a summary based on this text context from a website :
            ${textContext}
            `,
                },
            ],
            model: process.env.GPTVERSION,
        });
    });

    it("should throw an error if the OpenAI API call fails", async () => {
        const errorMessage = "OpenAI API call failed";

        // Make the API call throw an error
        OpenAI.prototype.chat.completions.create.mockRejectedValue(new Error(errorMessage));

        await expect(
            OpenAIAPI.generateSummaryFromTextContent("Some text")
        ).rejects.toThrow(errorMessage);
    });
});
