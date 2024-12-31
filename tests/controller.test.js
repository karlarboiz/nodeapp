// __tests__/job-controller.test.js
const { generateSummaryBasedOnId, createJob } = require('../controllers/main-controller');
const JobService = require('../services/JobService');
const OpenAIAPI = require('../services/ChatGPTAPI');
const BrowserService = require('../services/BrowserService');
const Error = require('../models/Error');
const Job = require('../models/Job');

// Mock the services and models
jest.mock('../services/JobService');
jest.mock('../services/ChatGPTAPI');
jest.mock('../services/BrowserService');
jest.mock('../models/Error');
jest.mock('../models/Job');

describe('Job Controller', () => {

    // Test for generateSummaryBasedOnId function
    describe('generateSummaryBasedOnId', () => {
        test('should return job details when job is completed', async () => {
            const req = { params: { jobid: '1' } };
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
            const next = jest.fn();

            // Mocking the JobService
            JobService.getJobHandler.mockResolvedValue({
                id: '1',
                status: 'completed',
                // other props you may need
            });

            await generateSummaryBasedOnId(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                id: '1',
                status: 'completed',
                // include other properties you're sending
            });
            expect(next).not.toHaveBeenCalled(); // Ensure next() is not called
        });

        test('should return job details with error message when job has failed', async () => {
            const req = { params: { jobid: '2' } };
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
            const next = jest.fn();
            
            // Mocking the JobService
            JobService.getJobHandler.mockResolvedValue({
                id: '2',
                status: 'failed',
                // other props you may need
            });

            Error.findOne.mockResolvedValue({
                error_message: 'Error occurred'
            });

            await generateSummaryBasedOnId(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                id: '2',
                status: 'failed',
                error_message: 'Error occurred',
                // rest of the properties
            });
            expect(next).not.toHaveBeenCalled();
        });

        test('should call next with error when getJobHandler throws an error', async () => {
            const req = { params: { jobid: '3' } };
            const res = {};
            const next = jest.fn();
            
            // Mocking the JobService to throw an error
            JobService.getJobHandler.mockRejectedValue(new Error('Some error'));

            await generateSummaryBasedOnId(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    // Test for createJob function
    describe('createJob', () => {
        test('should create a job and return response', async () => {
            const req = { body: { url_name: 'http://example.com' } };
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
            const next = jest.fn();

            JobService.createJobHandler.mockResolvedValue('12345'); // Mocking jobId
            BrowserService.generateTextContext.mockResolvedValue('Sample Text Content');
            OpenAIAPI.generateSummaryFromTextContent.mockResolvedValue('Generated Summary');

            await createJob(req, res, next);

            expect(JobService.createJobHandler).toHaveBeenCalledWith('http://example.com', 'pending');
            expect(Job.update).toHaveBeenCalledWith(
                { status: 'completed', summary: 'Generated Summary' },
                { where: { id: '12345' } }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                id: '12345',
                url: 'http://example.com',
                status: 'pending'
            });
        });

        test('should handle errors and update job to failed', async () => {
            const req = { body: { url_name: 'http://example.com' } };
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
            const next = jest.fn();

            JobService.createJobHandler.mockResolvedValue('12345');
            BrowserService.generateTextContext.mockRejectedValue(new Error('Puppeteer Error'));

            await createJob(req, res, next);

            expect(Error.create).toHaveBeenCalled();
            expect(Job.update).toHaveBeenCalledWith(
                { status: 'failed' },
                { where: { id: '12345' } }
            );
            expect(res.status).toHaveBeenCalledWith(200); // In this case, returning a response
        });
    });
});
