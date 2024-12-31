const OpenAIAPI = require('../services/ChatGPTAPI');
const { default: OpenAI } = require('openai');

// Mock OpenAI module
jest.mock('openai', () => ({
    default: jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: jest.fn(),
            },
        },
    })),
}));

describe('OpenAIAPI', () => {
    let client;

    beforeEach(() => {
        const OpenAIInstance = new OpenAI();
        client = OpenAIInstance.chat.completions;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return generated summary from OpenAI', async () => {
        const textContext = 'This is some text content.';
        const expectedSummary = 'This is the summary';

        // Mock resolved value for chat.completions.create
        client.create.mockResolvedValue({
            choices: [
                {
                    message: {
                        content: expectedSummary,
                    },
                },
            ],
        });

        const result = await OpenAIAPI.generateSummaryFromTextContent(textContext);

        expect(result).toBe(expectedSummary); // Verify the returned summary
        expect(client.create).toHaveBeenCalledWith({
            messages: [{ role: 'user', content: expect.stringContaining(textContext) }],
            model: process.env.GPTVERSION,
        });
    });

    test('should handle errors from OpenAI API', async () => {
        const textContext = 'This is some text content.';
        const errorMessage = 'OpenAI API error';

        // Mock rejection for chat.completions.create
        client.create.mockRejectedValue(new Error(errorMessage));

        await expect(OpenAIAPI.generateSummaryFromTextContent(textContext)).rejects.toThrow(errorMessage);
    });

    test('should return undefined if chatCompletion is undefined', async () => {
        const textContext = 'This is some text content.';

        // Mock resolved value as undefined
        client.create.mockResolvedValue(undefined);

        const result = await OpenAIAPI.generateSummaryFromTextContent(textContext);

        expect(result).toBeUndefined();
    });
});
