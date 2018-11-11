////////////
// EOSJS
////////////

const { Api, JsonRpc, RpcError, JsSignatureProvider } = require('eosjs');
const fetch = require('node-fetch');                            // node only; not needed in browsers
const { TextDecoder, TextEncoder } = require('text-encoding');  // node, IE11 and IE Edge Browsers
const defaultPrivateKey = "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"; 
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);
const rpc = new JsonRpc('http://34.220.2.79:7777', { fetch });
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
const Eos = require('eosjs');

let pubkey = "EOS6nmhsqRwYMiRAGbHgxZpzZcNxZsfnn5Zsk3Ugr9Jw68nCSUj86";




////////////
// EXPRESS
////////////

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// Allow all requests from all domains & localhost
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


/// transaction template function 
function transaction(tr, success, error){
    (async () => {
      try{
        const result = await api.transact(tr, {
          blocksBehind: 3,
          expireSeconds: 30,
        });
        console.log(result);
        success(result);
      } catch (e) {
        console.log('\nCaught exception: ' + e);
        if (e instanceof RpcError){
          let error_string = JSON.stringify(e.json, null, 2);
          console.log(error_string);
          error({"error": e.json});
        }else{
            error({"error": e.toString()});
        }
      }
  })();
}

function ingredients(req, res) {
    console.log("GET From SERVER");
    let tr = {
        actions: [{
            account: 'eosio.token',
            name: 'transfer',
            authorization: [{
              actor: 'eosio',
              permission: 'active',
            }],
            data: {
                from: 'chuck',
                to: 'alice',
                quantity: '0.0001 CM',
                memo: '',
            },
        }]
    };
    let success = (result) => res.send({"success": true, "result": result}); 
    let error = (result) => res.send(result); 
    transaction(tr,success, error);
}





function signup(req, res) {
  if (typeof req.body.pubkey == 'undefined') {
    res.send({"error": "Missing pubkey", "req": req.body}); return;
  }
  if (typeof req.body.user == 'undefined') {
    res.send({"error": "Missing user", "req": req.body}); return;
  }
  let newuser_name = req.body.user;
  let newuser_pubkey = req.body.pubkey; 

  let tr = {
    actions: [{
      account: 'eosio',
      name: 'newaccount',
      authorization: [{
        actor: 'eosio',
        permission: 'active',
      }],
      data: {
        creator: 'eosio',
        name: newuser_name,
        owner: {
          threshold: 1,
          keys: [{
            key: newuser_pubkey,
            weight: 1
          }],
          accounts: [],
          waits: []
        },
        active: {
          threshold: 1,
          keys: [{
            key: newuser_pubkey,
            weight: 1
          }],
          accounts: [],
          waits: []
        },
      },
    },
    {
      account: 'eosio.token',
      name: 'issue',
      authorization: [{
        actor: 'eosio',
        permission: 'active',
      }],
      data: {
          to: newuser_name,
          quantity: '100.0000 CM',
          memo: '',
      }
    }]
  }
  let success = (result) => res.send({"success": true, "result": result}); 
  let error = (result) => res.send(result); 
  transaction(tr, success, error);
}


app.get('/ingredients', ingredients);
app.post('/signup', signup);


app.listen(6069);
