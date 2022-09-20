import { SecretNetworkClient, grpc,MsgExecuteContract } from "secretjs";
import { Wallet } from "secretjs";
import express from "express";
import cors from "cors";
import jwt_decode from "jwt-decode";
import sha256 from "sha256";
import axios from "axios";
const wallet = new Wallet("YOUR NODES SEED PHRASE");
const myAddress = wallet.address;
const myMnemonicPhrase = wallet.mnemonic;
const grpcWebUrl = "https://grpc.pulsar.scrttestnet.com";

// To create a readonly secret.js client, just pass in a gRPC-web endpoint
const secretjs = await SecretNetworkClient.create({
  grpcWebUrl,
  chainId: "pulsar-2",
  wallet: wallet,
  walletAddress: myAddress,
});

const app=express();
app.use(
  cors({
    origin:"*",
  })
)
app.get("/vote",(req,res)=>{
  // var contract_add=req.query.address;
  var token=req.query.token;
  var decoded = jwt_decode(token);
  jwt.verify(token, 'shhhhh', function(err, decoded) {
    console.log(decoded.foo) // bar
  });
  console.log(decoded);
  res.send(decoded.email);
})
app.get("/verify",async (req,res)=>{
  var tken=req.query.token;
  var stoken=sha256(tken).toString();
  var email=req.query.email;
  const sSCRT = "secret1ffutl6duh5m6sfj8gz0mxmugm809t9ayz9rtlf";
const sScrtCodeHash ="0xa2e6056c96fbd9378a64a732191a86f137f2170f06d70ea3a6139a58236a36e8";
  const result = await secretjs.query.compute.queryContract({
    contractAddress: sSCRT,
    codeHash: sScrtCodeHash, 
    query: {getrecord:{key:email}},
  });
  console.log(result.getrecord.value);
  if(result.getrecord.value=="no data found"){
  res.send("no data found");
  }
  else{
    var x=await  secretjs.query.compute.contractCodeHash(result.getrecord.value);
    axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${tken}`).then(async function(resp,err){
      
      if(resp.data.aud=="your apps aud received from jwt id token"){
        const vote = new MsgExecuteContract({
          sender: myAddress,
          contractAddress: result.getrecord.value,
          codeHash: x, // optional but way faster
          msg: {votefor:{token:stoken,vote:true}},
        });
        const tx = await secretjs.tx.broadcast([vote], {
          gasLimit: 200_000,
        });
        console.log(tx);
      }
      else{
        const vote = new MsgExecuteContract({
          sender: myAddress,
          contractAddress: contractAddress,
          codeHash: x, // optional but way faster
          msg: {votefor:{token:stoken,vote:false}},
        });
        const tx = await secretjs.tx.broadcast([vote], {
          gasLimit: 200_000,
        }); 
        console.log(tx);
      }
      res.send("done!");
  }).catch(e=>{
    console.log(e);
    res.send("error");
  });

  }

})
app.get("/",async(req,res)=>{
  var x=await  secretjs.query.compute.contractCodeHash("secret10388exa2c6s52q6ss2et9jaqa0zgtew3h0svhc");
  console.log(x);
})

app.listen(4200);