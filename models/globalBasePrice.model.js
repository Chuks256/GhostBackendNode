
const dbModule=require('../config/dbConfig.config');

const globalBasePriceModal=new dbModule.Schema({
    currentPrice:{type:Number,default:0.000003}
});

const BasePrice=dbModule.model("BasePrice",globalBasePriceModal);

module.exports=BasePrice;