    const express = require('express');
    const morgan = require('morgan')
    const mongoose = require('mongoose')
    const {modelNames, mongo} = require("mongoose");
    require('dotenv/config')
    const app = express()
    mongoose.connect('mongodb+srv://mirim:<tiger>@cluster0.rlmfn.mongodb.net/?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology: true}
    )
    const db = mongoose.connection;
    db.on('error',function (process.env.DB_CONNECTION){
        console.log(err)
    })

    db.once('open',function (){
        console.log(err)
    })
    //morgan HTTP request 기록해주는 미들웨어
    app.use(morgan('dev'))

    const PORT = process.env.PORT || 3333;
    app.listen(PORT);
