const dbModule=require('../config/dbConfig.config');


const OrderbookModel=new dbModule.Schema({
    user_session_id: {type:String},
    token_id:{type:String},
    userpubaddr:{type:String},
    quantity:{type:Number,default:0},
    price:{type:Number,default:0},
    type:{type:String}
});

const orderbook=dbModule.model(OrderbookModel,"orderbook")