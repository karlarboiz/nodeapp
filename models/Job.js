const { DataTypes } = require("sequelize");
const sequelize = require("../db/db-connection");

//define Job table
const Job = sequelize.define("Job",{
    id:{
        type:DataTypes.INTEGER,
        allowNull: false,
            primaryKey: true,
            autoIncrement: true
    },
    status: {
        type:DataTypes.STRING,
        allowNull: false,
    }
    ,
    url: {
        type:DataTypes.STRING,
        allowNull: false,
    },
    summary: {
        type:DataTypes.TEXT,
        allowNull:true
    },
    date_register: {
        type: DataTypes.DATE,
        defaultValue: new Date()
    }
},
{
    tableName: 'job',
    timestamps:false
})

module.exports = Job;