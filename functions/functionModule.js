
const jwt=require("jsonwebtoken");
const user=require("../models/user.model.js");
const token = require("../models/token.model.js")
const wsModule = require("websocket");

class api_functions{

    constructor(){
        this.SOCKET_SERVER_PORT=4682;
        this.SESSION_STORAGE=[];
        this.NODE_COUNT=0;
    }

    async activateSocketFunction(state=false){
        if(state===true){
            const socketServer=new wsModule.server({port:this.SOCKET_SERVER_PORT});
            socketServer.on("connection",async(session)=>{
                this.SESSION_STORAGE.push(session);
                this.NODE_COUNT+=1;
                this.NODE_COUNT>1 ?
                console.log(`${this.NODE_COUNT} Nodes connected to trading server`)
                :
                console.log(`${this.NODE_COUNT} Node connected to trading server`)
            })
        }
        else
            console.log("Something went wrong connecting with socket server")
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

module.exports=api_functions