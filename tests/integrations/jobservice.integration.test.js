const Job = require("../../models/Job");
const JobService = require("../../services/JobService");

jest.mock("../../models/Job");

describe("JobService Integration Tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createJobHandler", () => {
        it("should create a job and return its ID", async () => {
            // Mock Job.create response
            const mockJobResult = { dataValues: { id: 1 } };
            Job.create.mockResolvedValue(mockJobResult);

            const url_name = "https://example.com";
            const status = "pending";
            const summary = "This is a test summary";

            const result = await JobService.createJobHandler(url_name, status, summary);

            // Assertions
            expect(Job.create).toHaveBeenCalledWith({
                status,
                url: url_name,
                summary,
            });
            expect(result).toBe(1);
        });

        it("should throw an error if Job.create fails", async () => {
            Job.create.mockRejectedValue(new Error("Failed to create job"));

            await expect(
                JobService.createJobHandler("https://example.com", "pending")
            ).rejects.toThrow("Failed to create job");
        });
    });

    describe("getJobHandler", () => {
        it("should retrieve job data by ID", async () => {
            // Mock Job.findOne response
            const mockJobData = { dataValues: { id: 1, status: "pending", url: "https://example.com", summary: "Test summary" } };
            Job.findOne.mockResolvedValue(mockJobData);

            const result = await JobService.getJobHandler(1);

            // Assertions
            expect(Job.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual(mockJobData.dataValues);
        });

        it("should return undefined if no job is found", async () => {
            Job.findOne.mockResolvedValue(null);

            const result = await JobService.getJobHandler(1);

            // Assertions
            expect(Job.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toBeUndefined();
        });

        it("should throw an error if Job.findOne fails", async () => {
            Job.findOne.mockRejectedValue(new Error("Failed to retrieve job"));

            await expect(JobService.getJobHandler(1)).rejects.toThrow("Failed to retrieve job");
        });
    });
});
