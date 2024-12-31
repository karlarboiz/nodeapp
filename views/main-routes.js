const express = require("express");//require express
const { generateSummaryBasedOnId, createJob } = require("../controllers/main-controller"); // get functions from main-controller file
const router = express.Router();//enable express routing to export to be used in every transaction

//process job
router.post("/create-job",createJob);
//get summary based on an id
router.get("/:jobid/summary",generateSummaryBasedOnId);


//export route
module.exports = router;