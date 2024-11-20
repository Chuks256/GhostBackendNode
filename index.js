
const express=require("express");
const app=express();
const cors=require("cors");
const port =6000 || process.env.PORT;
const bodyParser=require("body-parser");
const db=require("./config/dbConfig.config");

app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.json());
app.disable("x-powered-by");


app.listen(port,()=>{
    console.log("listening for incoming connection")
})