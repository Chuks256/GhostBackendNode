require("dotenv").config();
const jwt=require("jsonwebtoken");
const user=require("../models/user.model.js");
const token = require("../models/token.model.js")
const orderbook = require("../models/orderbook.model.js")
const basePrice=require("../models/globalBasePrice.model.js")
const wsModule = require("ws");
const cryptoModule=require("crypto");
const ellipticModule = require("elliptic");
const Ec=new ellipticModule.ec("secp256k1"); 
const socketServer =new wsModule.Server({port:4682});
        
class api_functions{

    constructor(){
        this.SOCKET_SERVER_PORT=4682;
        this.SESSION_STORAGE=[];
        this.NODE_COUNT=0;
        this.SIMULATED_BASE_PRICE=0.000003;
    }

    // sanitize incoming relayed data
    sanitizeData(relayedInstruction,state=""){
        if(state==="INCOMING_INSTRUCTION"){
            return JSON.parse(relayedInstruction);
        }
        else
        if(state==="OUTGOING_INSTRUCTION"){
            return JSON.stringify(relayedInstruction,null,3);
        }
    }

    // method to activate socket function 
    async activateSocketFunction(state=false){
        if(state===true){
            socketServer.on("connection",async(session)=>{
                this.SESSION_STORAGE.push(session);
                this.NODE_COUNT+=1;
                this.NODE_COUNT>1?
                console.log(`${this.NODE_COUNT} Nodes is connected to the trading server `)
                :
                console.log(`${this.NODE_COUNT} Node is connected to the trading server `)
                await this.listenForTradeOrders(session); // listening for trade orders from connected nodes  
            })
            console.log("Trading socket server is actively waiting for connection")         
        }
        else
            console.log("Something went wrong connecting with socket server")
    }


    //  function to onboard user 
    async onBoardNewUser(req,res){        
        const generateSessionId=cryptoModule.randomBytes(20).toString("hex");
        const generatePrivateKey=Ec.genKeyPair().getPrivate('hex').toString("hex");
        const createAcct=await new user({
          user_session_id:generateSessionId,
          point:500,
          publicKey:Ec.keyFromPrivate(generatePrivateKey).getPublic("hex").toString("hex") ,
          privateKey:generatePrivateKey,
        })

        const createSessionToken=jwt.sign({
            session_token:generateSessionId
        },process.env.TOKEN_SECRET)

        await createAcct.save();
        res.status(200).json({authorization:createSessionToken,msg:"onboard_successful"})
         }


async getUserData(req,res){
    const {authorization}=req.headers;
    const verifySessionToken=jwt.verify(authorization,process.env.TOKEN_SECRET);
    const getData=user.findOne({user_session_id:verifySessionToken.session_token});
    const getUserAsset=orderbook.findOne({user_session_id:verifySessionToken.session_token});
    res.status(200).json({userData:getData,userAssets:getUserAsset});
}

        //  function to list newtoken 
    async listAllNewToken(req,res){}

    // function tolistn for trade order either buy or sell 
   async listenForTradeOrders(userSession){
    userSession.on("message",async(relayedData)=>{
        const sanitizeRelayedData=this.sanitizeData(relayedData,"INCOMING_INSTRUCTION");
        switch(sanitizeRelayedData.type){
            case "BUY_ORDER":
                await this.initializeBuyOrder(userSession,sanitizeRelayedData);    
            break;

            case "SELL_ORDER":
            await this.initializeSellOrder(userSession,sanitizedRelayedData);
            break;
        }
    })
   }

//    function to convert virtual base coin to virtual base price 
async convertVirtualBaseCoinAmountToPrice(coinAmt=0){
    const currentBasePrice=await basePrice.find({});
    const constantValue=1/currentBasePrice.currentprice;
    const actualPriceOfCoinAmt=coinAmt/constantValue;
    return actualPriceOfCoinAmt;
}


// function to determine amount of memecoin for swap 
async determineMemeCoinAmount(priceToSwap=0.00,currentTokenPrice=0.00){
    const constantValue=1/currentTokenPrice
    const amountOfTokenToGive=constantValue*priceToSwap;
    return amountOfTokenToGive;
}

    //function to initialize buy order 
    async initializeBuyOrder(userSession,relayedData){
        const {authorization,tokenAddr,baseBuyAmount}=relayedData.data;
        const verifySessionToken=jwt.verify(authorization,process.env.TOKEN_SECRET);
        const getUserData=await user.findOne({user_session_id:verifySessionToken.session_token})
        // check user balance ;
        if(getUserData.virtualBaseCoin <= baseBuyAmount){
            const outGoingMsg=this.sanitizeData({msg:"Insufficient_Balance"},"OUTGOING_INSTRUCTION");
            userSession.send(outGoingMsg);
        }
        else
        if(getUserData.virtualBaseCoin > baseBuyAmount ){
            const tokenToBuy=await token.findOne({address:tokenAddr});
            const baseLiquidity=tokenToBuy.liquidityForBase+baseBuyAmount;
            const TokenLiquidity=tokenToBuy.liquiditypool/baseLiquidity;
            const tokenSwappedAmount=tokenToBuy.liquidityForToken-TokenLiquidity;
            const priceRatio=baseLiquidity/TokenLiquidity;
            const currentTokenPrice=this.SIMULATED_BASE_PRICE/priceRatio;
            const currentMarketCap= currentTokenPrice*tokenToBuy.totalsupply;

            // update token params 
            tokenToBuy.marketcap=currentMarketCap;
            tokenToBuy.currentprice=currentTokenPrice;
            tokenToBuy.liquidityForBase=baseLiquidity;
            tokenToBuy.liquidityForToken=TokenLiquidity;
            await tokenToBuy.save()

            // update order book params
            const tradeOrderBook=new orderbook({
                user_session_id:verifySessionToken.session_token,
                token_id:tokenToBuy._id,
                userpubaddr:getUserData.publicKey,
                AmountOfBase:baseBuyAmount,
                quantityOfToken:tokenSwappedAmount,
                currentPrice:currentTokenPrice,
                type:"Buy"
            });

            await tradeOrderBook.save();
            
            // broadcast updated order book list 
            this.SESSION_STORAGE.forEach(async(_sessions)=>{
                const getUpdatedData=await orderbook.find({});
                const sanitizedData=this.sanitizeData(getUpdatedData,"OUTGOING_INSTRUCTION")
                _sessions.send(sanitizedData); // broadcast updated data to all connected nodes 
            })

        }
    }


    // function to initialize sell order 
    async initializeSellOrder(userSession,relayedData){
        const {authorization,tokenAddr,tokenAmt,percentage}=relayedData.data;
        const verifySessionToken=jwt.verify(authorization,process.env.TOKEN_SECRET);
        const getUserData=await user.findOne({user_session_id:verifySessionToken.session_token})
        const transactionFee=666666.66 // $2 dollar for creation of meme coin
        // check user balance ;
        if(getUserData.virtualBaseCoin <= transactionFee){
            const outGoingMsg=this.sanitizeData({msg:"Insufficient_Balance"},"OUTGOING_INSTRUCTION");
            userSession.send(outGoingMsg);
        }
        else
        if(getUserData.virtualBaseCoin > transactionFee){
            const tokenToSell=await token.findOne({address:tokenAddr});
            const calculatedPercentageTokenAmt=percentage/100*tokenAmt;
            const TokenLiquidity=tokenToSell.liquidityForToken+calculatedPercentageTokenAmt; // calcualtedpercentageamt -> based on the user percentage choice 
            const baseLiquidity=tokenToSell.liquiditypool/TokenLiquidity;
            const baseAmountToGiveUser=tokenToSell.liquidityForBase-baseLiquidity;
            const priceRatio=baseLiquidity/TokenLiquidity;
            const currentTokenPrice=this.SIMULATED_BASE_PRICE/priceRatio;
            const currentMarketCap= currentTokenPrice*tokenToSell.totalsupply;

            // update user base balance 
            getUserData.virtualBaseCoin=baseAmountToGiveUser;
            getUserData.save();

            // update token params 
            tokenToSell.marketcap=currentMarketCap;
            tokenToSell.currentprice=currentTokenPrice;
            tokenToSell.liquidityForBase=baseLiquidity;
            tokenToSell.liquidityForToken=TokenLiquidity;
            await tokenToSell.save()

            // update order book params
            const tradeOrderBook=new orderbook({
                user_session_id:verifySessionToken.session_token,
                token_id:tokenToSell._id,
                userpubaddr:getUserData.publicKey,
                AmountOfBase:baseAmountToGiveUser,
                quantityOfToken:calculatedPercentageTokenAmt,
                currentPrice:currentTokenPrice,
                type:"Sell"
            });

            await tradeOrderBook.save();
            
            // broadcast updated order book list 
            this.SESSION_STORAGE.forEach(async(_sessions)=>{
                const getUpdatedData=await orderbook.find({});
                const sanitizedData=this.sanitizeData(getUpdatedData,"OUTGOING_INSTRUCTION")
                _sessions.send(sanitizedData); // broadcast updated data to all connected nodes 
            })

        }
    }

    async createToken(req,res){
        const {authorization}=req.headers
        const {name,desc,ticker,totalsupply}=req.body;
        const verifySessionToken=jwt.verify(authorization,process.env.TOKEN_SECRET);
       const tokenCreationAddress=cryptoModule.randomBytes(32).toString('hex');
        const createNewToken = new token({
            owner_session_id:verifySessionToken.session_token,
            name:name,
            description:desc,
            ticker:ticker,
            totalsupply:totalsupply,
            address:tokenCreationAddress
        })
        await createNewToken.save()
        res.status(200).json({msg:"meme coin successfully created", tokenAddr:tokenCreationAddress})
    }

    // function to upload token 
    async uploadTokenPhoto(req,res){

    } 

    // function to add liquidity 
    async addLiquidity(req,res){
        const {authorization}=req.headers
        const {baseAmount , tokenAmount , tokenCreationAddr }=req.body;
        const verifySessionToken=jwt.verify(authorization,process.env.TOKEN_SECRET);
        const transactionFee=666666.66 // $2 dollar for creation of meme coin
        const getUserBalance=user.findOne({user_session_token:verifySessionToken.session_token});
      
        //check user balance
      if(getUserBalance.virtualBaseCoin>transactionFee){
        const liquidityPool = baseAmount*tokenAmount;
        const addTokenLiquidity=token.findOne({
            address:tokenCreationAddr
        })

        // calculate current price and marketcap of token b
        const priceRatio=baseAmount/tokenAmount;
        const priceOfToken=this.SIMULATED_BASE_PRICE/priceRatio;

        // # Marketcap of token 
        const currentMarketCap=priceOfToken*addTokenLiquidity.totalsupply;
        
        // add liquidity to base and meme coin 
        addTokenLiquidity.liquidityForBase=baseAmount;
        addTokenLiquidity.liquidityForToken=tokenAmount;
        addTokenLiquidity.liquidityPool=liquidityPool;
        addTokenLiquidity.currentprice=priceOfToken;
        addTokenLiquidity.marketcap=currentMarketCap;
        getUserBalance.virtualBaseCoin -= transactionFee; // deduct transaction fee

        await getUserBalance.save(); 
        await addTokenLiquidity.save();

        res.status(200).json({msg:"token_creation_Successful"})
      } 
      else
      if(getUserBalance.virtualBaseCoin <= transactionFee ){
        res.status(200).json({msg:"Insufficient_balance"});
      }
    }

    // function to remove liquidity 
    async removeLiquidity(req,res){
    }

    async getUserOwnedTokens(req,res){}

    async getVirtualBaseCoinAmount(req,res){
        const {authorization}=req.headers
        const verifySessionToken=jwt.verify(authorization,process.env.TOKEN_SECRET);
        const getUserBaseCoinBal=await user.findOne({user_session_id:verifySessionToken.session_token});
        res.status(200).json({balance:getUserBaseCoinBal.virtualBaseCoin});
    }

    async getTokenMarketCap(req,res){
        const {tokenAddr}=req.body;
        const findToken=await token.findOne({address:tokenAddr});
        res.status(200).json(findToken)
    }

    async burnToken(req,res){}

    async  getTokenMetrics(req,res){
        const {token_address}=req.body;
        const getTokenMetrics=await token.findOne({address:token_address});
        const MetricsParams={
            name:getTokenMetrics.name,
            description:getTokenMetrics.description,
            ticker:getTokenMetrics.ticker,
            photo:getTokenMetrics.photo,
            address:getTokenMetrics.address,
            marketcap:getTokenMetrics.marketcap,
            price:getTokenMetrics.price,
            volume:getTokenMetrics.volume,
            totalsupply:getTokenMetrics.totalsupply,
            pooledliquidity:getTokenMetrics.liquiditypool,
            liquiditylocked:getTokenMetrics.liquiditylocked
        }
        res.status(200).json({data:MetricsParams})
    }

    async isServerOk(req,res){
        res.json({msg:"allis good"})
    }
}

module.exports=api_functions