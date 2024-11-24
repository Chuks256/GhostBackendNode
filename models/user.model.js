const dbModule=require('../config/dbConfig.config');

const UserModal=new dbModule.Schema({
    user_session_id: {type:String},
    point:{type:Number,default:0},
    lastClaimed:{type:String,default:Date.now()},
    publicKey:{type:String},
    privateKey:{type:String},
    virtualBaseCoin:{type:Number , default:33333333.33},
    referrals:[]
});

const User=dbModule.model("User",UserModal);

module.exports=User