const request = require("supertest");
const express = require("express");
const router = require("../../views/main-routes"); // Path to your router file
const { createJob, generateSummaryBasedOnId } = require("../../controllers/main-controller");

// Mock the controller functions
jest.mock("../../controllers/main-controller");

const app = express();
app.use(express.json()); // Middleware for parsing JSON
app.use("/api", router); // Mount the router under /api

describe("Integration Tests for Main Routes", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /api/create-job", () => {
        it("should call createJob and return a response", async () => {
            // Mock implementation for createJob
            createJob.mockImplementation((req, res) => {
                res.status(200).send({
                    id: 1,
                    url: "https://example.com",
                    status: "pending",
                });
            });

            const response = await request(app)
                .post("/api/create-job")
                .send({ url_name: "https://example.com" });

            expect(createJob).toHaveBeenCalled();
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: 1,
                url: "https://example.com",
                status: "pending",
            });
        });

        it("should return a 400 status if the request body is invalid", async () => {
            createJob.mockImplementation((req, res) => {
                res.status(400).send({ error: "Invalid request body" });
            });

            const response = await request(app).post("/api/create-job").send({});

            expect(createJob).toHaveBeenCalled();
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: "Invalid request body" });
        });
    });

    describe("GET /api/:jobid/summary", () => {
        it("should call generateSummaryBasedOnId and return a response", async () => {
            // Mock implementation for generateSummaryBasedOnId
            generateSummaryBasedOnId.mockImplementation((req, res) => {
                res.status(200).send({
                    id: 1,
                    status: "completed",
                    summary: "This is a test summary",
                });
            });

            const response = await request(app).get("/api/1/summary");

            expect(generateSummaryBasedOnId).toHaveBeenCalled();
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: 1,
                status: "completed",
                summary: "This is a test summary",
            });
        });

        it("should return a 404 status if the job ID is not found", async () => {
            generateSummaryBasedOnId.mockImplementation((req, res) => {
                res.status(404).send({ error: "Job not found" });
            });

            const response = await request(app).get("/api/999/summary");

            expect(generateSummaryBasedOnId).toHaveBeenCalled();
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: "Job not found" });
        });
    });
});
