
const jwt=require("jsonwebtoken");
const user=require("../models/user.model.js");
const token = require("../models/token.model.js")


class functions{

    async activateSocketFunction(state=false){
        if(state===true){

        }
        else
        if(state===true){
            console.log("Something went wrong connecting with socket server")
        }
    }

    async onBoardNewUser(req,res){}

    async listAllNewToken(req,res){}

    async buyOrder(req,res){}

    async sellOrder(req,res){}

    async createToken(req,res){}

    async addLiquidity(req,res){}

    async releaseLiquidity(req,res){}

    async getUserOwnedTokens(req,res){}

    async getUserOwnedToken(req,res){}

    async getVirtualBaseCoinAmount(req,res){}

    async getTokenMarketCap(req,res){}

    async burnToken(req,res){}

    async  getTokenMetrics(req,res){}

    async isServerOk(req,res){}
}

module.exports=functions