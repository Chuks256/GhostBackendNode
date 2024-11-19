const mongooseModule=require("mongoose");
const configUrl="mongodb+srv://GhostNodeAdmin:GhostNodeAdmin@ghostnode0.uh9ny.mongodb.net/?retryWrites=true&w=majority&appName=GhostNode0"

mongooseModule.connect(configUrl).then(()=>{
    console.log("Successfully Connected")
})


module.exports=mongooseModule;