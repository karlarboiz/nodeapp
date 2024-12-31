// __tests__/jobService.test.js
const JobService = require('../services/JobService');
const Job = require('../models/Job');

jest.mock('../models/Job'); // Mock the Job model

describe('JobService', () => {
    
    describe('createJobHandler', () => {
        test('should create a job and return the job id', async () => {
            const url_name = 'http://example.com';
            const status = 'pending';
            const mockJob = {
                dataValues: {
                    id: '12345'
                }
            };

            // Arrange: Mock the Job.create method to return a mock job
            Job.create.mockResolvedValue(mockJob);

            // Act: Call the createJobHandler method
            const jobId = await JobService.createJobHandler(url_name, status);

            // Assert: Check that the job ID is returned
            expect(jobId).toBe('12345');
            expect(Job.create).toHaveBeenCalledWith({
                status: status,
                url: url_name,
                summary: null  // Summary defaults to null
            });
        });

        test('should throw an error if Job.create fails', async () => {
            const url_name = 'http://example.com';
            const status = 'pending';

            // Arrange: Mock the Job.create method to throw an error
            Job.create.mockRejectedValue(new Error('Database error'));

            // Act and Assert: Call the method and expect it to throw an error
            await expect(JobService.createJobHandler(url_name, status)).rejects.toThrow('Database error');
        });
    });

    describe('getJobHandler', () => {
        test('should return job data if job is found', async () => {
            const jobId = '12345';
            const mockJobData = {
                dataValues: {
                    id: jobId,
                    status: 'completed',
                    url: 'http://example.com',
                    summary: 'This is a summary'
                }
            };

            // Arrange: Mock the Job.findOne method to return a mock job
            Job.findOne.mockResolvedValue(mockJobData);

            // Act: Call the getJobHandler method
            const jobData = await JobService.getJobHandler(jobId);

            // Assert: Check that the returned job data is correct
            expect(jobData).toEqual(mockJobData.dataValues);
            expect(Job.findOne).toHaveBeenCalledWith({ where: { id: jobId } });
        });

        test('should return undefined if job is not found', async () => {
            const jobId = '12345';

            // Arrange: Mock the Job.findOne method to return null
            Job.findOne.mockResolvedValue(null);

            // Act: Call the getJobHandler method
            const jobData = await JobService.getJobHandler(jobId);

            // Assert: Check that the returned job data is undefined
            expect(jobData).toBeUndefined();
            expect(Job.findOne).toHaveBeenCalledWith({ where: { id: jobId } });
        });

        test('should throw an error if Job.findOne fails', async () => {
            const jobId = '12345';

            // Arrange: Mock the Job.findOne method to throw an error
            Job.findOne.mockRejectedValue(new Error('Database error'));

            // Act and Assert: Call the method and expect it to throw an error
            await expect(JobService.getJobHandler(jobId)).rejects.toThrow('Database error');
        });
    });
});
