const puppeteer = require("puppeteer");
const BrowserService = require("../../services/BrowserService");

jest.mock("puppeteer");

describe("BrowserService Integration Tests", () => {
    let mockBrowser, mockPage;

    beforeEach(() => {
        // Mock Puppeteer methods
        mockPage = {
            goto: jest.fn(),
            $eval: jest.fn().mockResolvedValue("Sample extracted text"),
        };

        mockBrowser = {
            newPage: jest.fn().mockResolvedValue(mockPage),
            close: jest.fn(),
        };

        puppeteer.launch = jest.fn().mockResolvedValue(mockBrowser);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should extract text content from the provided URL", async () => {
        const url = "https://example.com";
        const result = await BrowserService.generateTextContext(url);

        // Assertions
        expect(result.isSuccess).toBe(true);
        expect(result.extractedText).toBe("Sample extracted text");
        expect(puppeteer.launch).toHaveBeenCalled();
        expect(mockBrowser.newPage).toHaveBeenCalled();
        expect(mockPage.goto).toHaveBeenCalledWith(url);
        expect(mockPage.$eval).toHaveBeenCalledWith("*", expect.any(Function));
        expect(mockBrowser.close).toHaveBeenCalled();
    });

    it("should throw an error if Puppeteer fails to launch", async () => {
        puppeteer.launch.mockRejectedValue(new Error("Failed to launch browser"));

        await expect(BrowserService.generateTextContext("https://example.com"))
            .rejects
            .toThrow("Failed to launch browser");
    });

    it("should throw an error if page.goto fails", async () => {
        mockPage.goto.mockRejectedValue(new Error("Failed to navigate to URL"));

        await expect(BrowserService.generateTextContext("https://example.com"))
            .rejects
            .toThrow("Failed to navigate to URL");
    });

    it("should throw an error if page.$eval fails", async () => {
        mockPage.$eval.mockRejectedValue(new Error("Failed to extract text"));

        await expect(BrowserService.generateTextContext("https://example.com"))
            .rejects
            .toThrow("Failed to extract text");
    });
});
