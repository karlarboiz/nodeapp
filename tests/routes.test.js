// __tests__/main-routes.test.js
const express = require('express');
const request = require('supertest');
const jobRouter = require('../views/main-routes'); // Adjust the path as needed

// Mocking the controller functions
jest.mock('../controllers/main-controller', () => ({
    generateSummaryBasedOnId: jest.fn((req, res) => {
        const jobId = req.params.jobid;
        res.status(200).json({ message: `Summary for job ID: ${jobId}` });
    }),
    createJob: jest.fn((req, res) => {
        const jobData = req.body;
        res.status(201).json({ message: "Job created", data: jobData });
    }),
}));

const app = express();
app.use(express.json());
app.use('/jobs', jobRouter); // Use the job router under the '/jobs' path

describe('Job Routes', () => {
    test('POST /jobs/create-job - should create a job', async () => {
        const jobData = { name: 'Sample Job', description: 'This is a test job.' };

        const response = await request(app)
            .post('/jobs/create-job')
            .send(jobData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Job created');
        expect(response.body.data).toEqual(jobData);
    });

    test('GET /jobs/:jobid/summary - should return summary based on job ID', async () => {
        const jobId = '12345';

        const response = await request(app)
            .get(`/jobs/${jobId}/summary`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(`Summary for job ID: ${jobId}`);
    });
});
