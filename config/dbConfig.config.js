const mongooseModule=require("mongoose");
const configUrl="mongodb+srv://GhostNodeAdmin:chmodkalilinux@ghostnode0.uh9ny.mongodb.net/?retryWrites=true&w=majority&appName=GhostNode0"

mongooseModule.connect(configUrl)

console.log("connected to database cluster ")


module.exports=mongooseModule;