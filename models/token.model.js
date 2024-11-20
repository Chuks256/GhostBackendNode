
const dbModule=require('../config/dbConfig.config');


const tokenModal=new dbModule.Schema({
   owner_id:{type:String},
   name:{type:String},
   description:{type:String},
   photo:{type:String},
   marketcap:{type:Number,default:0},
   volume:{type:Number,default:0},
   totalsupply:{type:Number,default:0},
   liquidity:{type:Number,default:0},
   liquidtypool:{type:Number,default:0},
   liquiditytimelock:{type:Number,default:30},
   liquiditylocked:{type:Boolean,default:true}
})

const Token=dbModule.model("Token",tokenModal)

module.exports=Token