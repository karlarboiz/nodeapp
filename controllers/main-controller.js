
const JobService = require("../services/JobService");// import job service
const OpenAIAPI = require("../services/ChatGPTAPI");//import chat gpt service
const BrowserService = require("../services/BrowserService");//import browser service
const Error = require("../models/Error");//import Model class to handle errors
const Job = require("../models/Job");//import Job Model
 
//get result from job table by using the id
const generateSummaryBasedOnId =async(req,res,next)=>{
    //parse the job id from the request params
    const {jobid} = req.params;
   
    try{
        //search for hte job
        const result = await JobService.getJobHandler(jobid);
        

        //do a filter on the status of the job to provide 
        //transparent result to the front end

        //if result status failed
        if(result.status === "failed"){
            //search for the job id in the error table
            const error = await Error.findOne({
                where: {
                    job_id:result.id
                }
            })

            /***
             * 
             * deleted some object properties to better render out put
             */

            //delete result.date_register
            delete result.date_register;
            
            //delete summary
            delete result.summary;

            //add new object property with error_message
            result.error_message = error.error_message

            //return result
            return res.status(200).send(result)
        }else {
            //return result if job is completed and not failed
            return res.status(200).send(result)
        }
        
    }catch(e){
        //catch any errors and then proceed to send a different result
        next(e)
    }
}


//create job
const createJob = async (req,res)=>{
    //parse url name as part of tne request body of the user
    const {url_name} = req.body;

    //create job with initial status of pending
    const jobId = await JobService.createJobHandler(url_name,"pending");
    try{
             
        //get text content using puppeteer
        const textContent = await BrowserService.generateTextContext(url_name);

        //process summary based on the textContent
        const summary = await OpenAIAPI.generateSummaryFromTextContent(textContent);


        //update the recent added job with status complete
        await Job.update({
            status: "completed",
            summary:summary
        },{
            where:{
                id:jobId
            }
        })

    }catch(e){

        //if any error happens from generating text content using puppeteer
        //and the summary provided by LLM
        //and create new error
        await Error.create({
            job_id:jobId,
            error_message: e.message
        })

        //update the newly added job with status failed
        await Job.update({
            status: "failed"
        },{
            where:{
                id:jobId
            }
        })
        
    }

    //return response from creating job
    return res.status(200).send({
        id: jobId,
        url:url_name,
        status:"pending"
    })
}

//export functions
module.exports = {
    generateSummaryBasedOnId,
    createJob
}