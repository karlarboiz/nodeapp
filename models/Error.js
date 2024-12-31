const { DataTypes } = require("sequelize");
const sequelize = require("../db/db-connection");
const Job = require("./Job");

//define Error Table
const Error = sequelize.define("Error",{
    error_id:{
        type:DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    job_id:{
        type:DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: Job,
            key: 'id'
            }
    },
    error_message:{
        type: DataTypes.STRING,
        allowNull: false    
    },
    date_register: {
        type: DataTypes.DATE,
        defaultValue: new Date()
    }
},
{
    tableName: 'error',
    timestamps:false
})

module.exports = Error;