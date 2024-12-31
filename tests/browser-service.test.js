// __tests__/browserService.test.js
const puppeteer = require('puppeteer');
const BrowserService = require('../services/BrowserService');

// Mock the Puppeteer module
jest.mock('puppeteer');

describe('BrowserService', () => {
    
    describe('generateTextContext', () => {
        test('should extract text from the given URL', async () => {
            // Arrange: Set up the mock for puppeteer
            const mockBrowser = {
                newPage: jest.fn().mockResolvedValue({
                    goto: jest.fn().mockResolvedValue(true),
                    $eval: jest.fn().mockResolvedValue('Extracted Text')
                }),
                close: jest.fn(),
            };
            puppeteer.launch.mockResolvedValue(mockBrowser);

            const url = 'http://example.com';

            // Act: Call the method being tested
            const result = await BrowserService.generateTextContext(url);

            // Assert: Verify the outputs and interactions
            expect(result).toEqual({
                isSuccess: true,
                extractedText: 'Extracted Text'
            });
            expect(puppeteer.launch).toHaveBeenCalled();
            expect(mockBrowser.newPage).toHaveBeenCalled();
            expect(mockBrowser.close).toHaveBeenCalled();
        });

        test('should throw an error when an error occurs', async () => {
            // Arrange: Set up the mock to throw an error
            puppeteer.launch.mockRejectedValue(new Error('Puppeteer launch failed'));

            const url = 'http://example.com';

            // Act and Assert: Call the method and expect it to throw an error
            await expect(BrowserService.generateTextContext(url)).rejects.toThrow('Puppeteer launch failed');
            expect(puppeteer.launch).toHaveBeenCalled();
        });
    });
});
