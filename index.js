
require("./config/dbConfig.config");
const express=require("express");
const app=express();
const cors=require("cors");
const port =6000 || process.env.PORT;
const bodyParser=require("body-parser");
const apiFunction = require("./functions/functionModule");

app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.json());
app.disable("x-powered-by");

// activate realtime socket server 
new apiFunction().activateSocketFunction(true)

app.listen(port,()=>{
    console.log("listening for incoming connection")
})