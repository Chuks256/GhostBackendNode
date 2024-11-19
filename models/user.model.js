const dbModule=require('../config/dbConfig.config');


const UserModal=new dbModule.Schema({
    user_session_id: {type:String},
    point:{type:String},
    lastClaimed:{type:String},
    publicKey:{type:String},
    privateKey:{type:String},
    virtualBaseCoin:{type:String},
    referrals:{type:String}
});

const User=dbModule.model(UserModal,"User")