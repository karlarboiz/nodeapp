const { generateSummaryBasedOnId, createJob } = require("../../controllers/main-controller"); // Update with the actual file path
const JobService = require("../../services/JobService");
const OpenAIAPI = require("../../services/ChatGPTAPI");
const BrowserService = require("../../services/BrowserService");
const ErrorModel = require("../../models/Error");
const Job = require("../../models/Job");

jest.mock("../../services/JobService");
jest.mock("../../services/ChatGPTAPI");
jest.mock("../../services/BrowserService");
jest.mock("../../models/Error");
jest.mock("../../models/Job");

describe("Controller Integration Tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("generateSummaryBasedOnId", () => {
        it("should return job result with error message if status is 'failed'", async () => {
            const mockReq = { params: { jobid: 1 } };
            const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
            const mockNext = jest.fn();

            JobService.getJobHandler.mockResolvedValue({
                id: 1,
                status: "failed",
                summary: "some summary",
                date_register: "2024-01-01",
            });

            ErrorModel.findOne.mockResolvedValue({
                error_message: "Test error message",
            });

            await generateSummaryBasedOnId(mockReq, mockRes, mockNext);

            expect(JobService.getJobHandler).toHaveBeenCalledWith(1);
            expect(ErrorModel.findOne).toHaveBeenCalledWith({ where: { job_id: 1 } });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith({
                id: 1,
                status: "failed",
                error_message: "Test error message",
            });
        });

        it("should return job result if status is not 'failed'", async () => {
            const mockReq = { params: { jobid: 1 } };
            const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
            const mockNext = jest.fn();

            JobService.getJobHandler.mockResolvedValue({
                id: 1,
                status: "completed",
                summary: "This is a summary",
            });

            await generateSummaryBasedOnId(mockReq, mockRes, mockNext);

            expect(JobService.getJobHandler).toHaveBeenCalledWith(1);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith({
                id: 1,
                status: "completed",
                summary: "This is a summary",
            });
        });

        it("should call next with an error if an exception occurs", async () => {
            const mockReq = { params: { jobid: 1 } };
            const mockRes = {};
            const mockNext = jest.fn();

            JobService.getJobHandler.mockRejectedValue(new Error("Job handler error"));

            await generateSummaryBasedOnId(mockReq, mockRes, mockNext);
 
            expect(JobService.getJobHandler).toHaveBeenCalledWith(1);
            expect(mockNext).toHaveBeenCalledWith(new Error("Job handler error"));
        });
    });

    describe("createJob", () => {
        it("should create a job, generate a summary, and update the job as completed", async () => {
            const mockReq = { body: { url_name: "https://example.com" } };
            const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
            const mockNext = jest.fn();

            JobService.createJobHandler.mockResolvedValue(1);
            BrowserService.generateTextContext.mockResolvedValue("Sample text content");
            OpenAIAPI.generateSummaryFromTextContent.mockResolvedValue("Generated summary");

            await createJob(mockReq, mockRes, mockNext);

            expect(JobService.createJobHandler).toHaveBeenCalledWith("https://example.com", "pending");
            expect(BrowserService.generateTextContext).toHaveBeenCalledWith("https://example.com");
            expect(OpenAIAPI.generateSummaryFromTextContent).toHaveBeenCalledWith("Sample text content");
            expect(Job.update).toHaveBeenCalledWith(
                { status: "completed", summary: "Generated summary" },
                { where: { id: 1 } }
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith({
                id: 1,
                url: "https://example.com",
                status: "pending",
            });
        });

        it("should handle errors during job processing and update the job as failed", async () => {
            const mockReq = { body: { url_name: "https://example.com" } };
            const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
            const mockNext = jest.fn();

            JobService.createJobHandler.mockResolvedValue(1);
            BrowserService.generateTextContext.mockRejectedValue(new Error("Browser error"));

            await createJob(mockReq, mockRes, mockNext);

            expect(JobService.createJobHandler).toHaveBeenCalledWith("https://example.com", "pending");
            expect(BrowserService.generateTextContext).toHaveBeenCalledWith("https://example.com");
            expect(ErrorModel.create).toHaveBeenCalledWith({
                job_id: 1,
                error_message: "Browser error",
            });
            expect(Job.update).toHaveBeenCalledWith(
                { status: "failed" },
                { where: { id: 1 } }
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith({
                id: 1,
                url: "https://example.com",
                status: "pending",
            });
        });
    });
});
