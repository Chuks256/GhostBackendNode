const dbModule=require('../config/dbConfig.config');


const OrderbookModel=new dbModule.Schema({
    user_session_id: {type:String},
    token_id:{type:String},
    userpubaddr:{type:String},
    AmountOfBase:{type:Number,default:0.00},
    quantityOfToken:{type:Number,default:0},
    currentPrice:{type:Number,default:0.00},
    type:{type:String}
});

const orderbook=dbModule.model("orderbook",OrderbookModel);

module.exports=orderbook;