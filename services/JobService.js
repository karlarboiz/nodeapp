const Job = require("../models/Job");//import Job model

//Job service to process functions under the Job model
class JobService{
    //create job handler
    static async createJobHandler(url_name,status,summary=null){
        
        try{
           const jobResult = await Job.create({
                status: status,
                url:url_name,
                summary: summary
            })

            return await jobResult.dataValues.id
    
        }catch(e){
            throw new Error(e.message)
        }
    }


    //get job data
    static async getJobHandler(id){
        try{
            const job = await Job.findOne({where:{id:id}})
            const result = await job?.dataValues;
            
            return result;
        }catch(e){
            throw new Error(e.message);
        }
    }
}

module.exports = JobService;