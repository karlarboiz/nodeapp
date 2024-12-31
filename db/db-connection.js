
const { Sequelize } = require('sequelize');

//process connection db
const sequelize =  new Sequelize(
    process.env.DB,//get db name
    process.env.USER,//get user name
    process.env.PASSWORD,//get password
    {
    host: process.env.HOST, // get host name
    dialect: 'mysql'
}); 


//export sequelize
module.exports =  sequelize;


