require('dotenv').config(); //a step to ensure that .env file is readable
const express = require('express');//to allow express functions to be used
const cors = require('cors');//require cors file to 
const app = express();//call express to enable express functions
const sequelize = require("./db/db-connection");//get db
const port = 4000;//default port to run the web app

// CORS options to allow requests from frontend running on port 5500
const corsOptions = {
    origin: 'http://localhost:5500', // Allow only requests from this origin
    methods: 'GET,POST', // Allow only these methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow only these headers
};

// Use CORS middleware with specified options
app.use(cors(corsOptions));

app.use(express.json());//enable json data to be parsed
app.use(express.urlencoded({ extended: true }));//enable parsing of URL-encoded data

//getting the routes
const mainRoutes = require("./views/main-routes");

//integrate the route and make every request and response url process thru the
//following urls
app.use("/job",mainRoutes);

//run this to process any errors
app.use((err,req,res,next)=>{ 
    if(err){
        res.status(500).send({
            isSuccess: false,
            message: err.message
        })
        
    }    
})



// Database connection and server start
async function startServer() {
    try {
        // // Database connection
        await sequelize.authenticate();
        // // Table will be created if it does not exist yet.
        await sequelize.sync();
        //app will listen to the port
        app.listen(port, async() => {

            console.log(`Server is running on http://localhost:${port}`);
        });
     
    } catch (error) {
        console.log(error);
    }
}
//run the function to finish configuring everything
startServer();