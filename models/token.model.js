
const dbModule=require('../config/dbConfig.config');


const tokenModal=new dbModule.Schema({
   owner_session_id:{type:String},
   name:{type:String},
   description:{type:String},
   ticker:{type:String},
   photo:{type:String},
   address:{type:String},
   marketcap:{type:Number,default:0},
   currentprice:{type:Number,default:0.00},
   volume:{type:Number,default:0},
   totalsupply:{type:Number,default:1000000},
   liquidityForBase:{type:Number,default:0.00},
   liquidityForToken:{type:Number,default:0.00},
   liquiditypool:{type:Number,default:0},
   liquiditytimelock:{type:Number,default:30},
   liquiditylocked:{type:Boolean,default:true}
})

const Token=dbModule.model("Token",tokenModal)

module.exports=Token