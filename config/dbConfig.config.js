const mongooseModule=require("mongoose");
const configUrl="mongodb+srv://GhostNodeAdmin:chmodkalilinux@ghostnode0.uh9ny.mongodb.net/?retryWrites=true&w=majority&appName=GhostNode0"

mongooseModule.connect(configUrl).then((msg)=>{
    console.log("connected to database cluster")
}).catch((err)=>{
    console.log("Something went wrong")
})




module.exports=mongooseModule;