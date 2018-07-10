import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './main.html';

//asignación del proveedor
if(typeof web3 !== 'undefined'){//MetaMask inyecta el proveedor directamente
  web3 = new Web3(web3.currentProvider);
}else{
	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));//en el caso de no utilizar MetaMask, poner url del noto Ethereum a utilizar
};

Template.Smsg.onCreated(function () {

  this.signedmsg = new ReactiveVar();
  this.address = new ReactiveVar();
});

Template.Smsg.helpers({
  signedmsg() {
    return Template.instance().signedmsg.get();
    },
  address(){
    return Template.instance().address.get();
    }
});

//variables
var abi=[
	{
		"constant": false,
		"inputs": [],
		"name": "Timeout",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_precioVendedor",
				"type": "uint256"
			},
			{
				"name": "hash",
				"type": "bytes32"
			},
			{
				"name": "v",
				"type": "uint8"
			},
			{
				"name": "r",
				"type": "bytes32"
			},
			{
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "finished",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_vendedor",
				"type": "address"
			},
			{
				"name": "duracion",
				"type": "uint256"
			}
		],
		"payable": true,
		"stateMutability": "payable",
		"type": "constructor"
	}
];
var address;
var date;
var signature;
var hash;
var _sellerPrice;
var _buyerPrice;
var fixed_msg_sha;
var r;
var s;
var v;
var finish='false';
var receipt;
var trHash;
var mined='false';
var _vendedor;
var _comprador;
var recibo;
var duracion;

//events al clicar sobre los botones de la web
Template.Smsg.events({
  //clic para crear contrato
    "click #createContract"(event, Template){
    document.getElementById("container").style.display = "none";
    document.getElementById("loader").style.display = "block";
    alert('Creating a contract. This process can take a few minutes.')
    _vendedor = $("input[id=sellerAddress").val();
    duracion = $("input[id=timeOut").val();
    _duracion = parseFloat(duracion)+20.9;
    console.log(_duracion);
    date = $("input[id=date").val();
    _buyerPrice = $("input[id=payableCost").val()*1000000000000000000;
    var MyContract = web3.eth.contract(abi);
    var payfairfixedtimeout = MyContract.new(
      _vendedor,
      _duracion,
   {
      from: web3.eth.accounts[0],
      data: '0x60806040526040516040806104f28339810180604052810190808051906020019092919080519060200190929190505050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600460006101000a81548160ff021916908315150217905550804201600381905550346005819055505050610405806100ed6000396000f30060806040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680632af0c7f814610051578063f362bcec14610068575b600080fd5b34801561005d57600080fd5b506100666100cc565b005b34801561007457600080fd5b506100ca600480360381019080803590602001909291908035600019169060200190929190803560ff169060200190929190803560001916906020019092919080356000191690602001909291905050506101a9565b005b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614801561012a57506003544210155b8015610149575060001515600460009054906101000a900460ff161515145b151561015457600080fd5b6001600460006101000a81548160ff0219169083151502179055506000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b84600681905550600184848484604051600081526020016040526040518085600019166000191681526020018460ff1660ff1681526020018360001916600019168152602001826000191660001916815260200194505050505060206040516020810390808403906000865af1158015610227573d6000803e3d6000fd5b50505060206040510351600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161480156102cf575060035442105b80156102de5750600554600654145b80156103595750600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16145b8015610378575060001515600460009054906101000a900460ff161515145b151561038357600080fd5b6001600460006101000a81548160ff021916908315150217905550600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff00a165627a7a72305820755c6c853b0894b2499d286c1e5b921ba64e624fdcdf6c985edec43df03de7320029',
      gas: '4700000',
      value: _buyerPrice
   }, function (e, contract){
    console.log(e, contract);
    try{
    if (typeof contract.address !== 'undefined') {//el contrato se ha creado
      document.getElementById("buyer").style.display = "block";
      document.getElementById("seller").style.display = "block";
      document.getElementById("cancel1").disabled = true;
      document.getElementById("cancel1").innerHTML = "Waiting expire time to cancel...";
      document.getElementById("sellerPrice").style.display = "block";
      document.getElementById("finished").disabled = false;
      document.getElementById("finished").innerHTML = "Finished";
      address=contract.address;
      _comprador=web3.eth.accounts[0];
      console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
      alert('The contract with address: '+address+' has been created. ')
      setTimeout(deshabilitar_btnCancel, duracion*1000);
      document.getElementById("loader").style.display = "none";
      document.getElementById("container").style.display = "block";
    }}catch{
      alert("The contract hasn't been created "+e);
      document.getElementById("loader").style.display = "none";
      document.getElementById("container").style.display = "block";
    }
 })

    },

//clic para cancelar
    "click #cancel1"(event, Template){
        web3.eth.contract(abi).at(address).Timeout(function(err, result){//se ejecuta la función de cancelación del contrato
          console.log('error cancel'+err);
          console.log(result);
          if(typeof result!=='undefined'){//la transacción se ha ejecutado
            alert('Operation cancelled. '+result);
          }else{
            alert('Error cancelling the purchase. '+err);
          }
      });
    },

//clic para finalizar
    "click #finished"(event, Template){
        _sellerPrice = $("input[id=sellerPrice").val()*1000000000000000000;
        if(_sellerPrice==_buyerPrice){//los ethers del comprador y vendedor coinciden
          sign(function () {//se realiza la función sign y se ejecutará el código siguiente
            if(typeof signature!=='undefined'){//en este momento se ha obtenido la firma
              console.log("Signed.");
              //se extraen los valores r,s y v de la firma
              r = '0x' + signature.slice(2, 66);
              s = '0x' + signature.slice(66, 130);
              v = '0x' + signature.slice(130, 132);
              console.log(signature);
              console.log(r);
              console.log(s);
              console.log(v);
              console.log('ahora llama funcion finished hash= '+hash+' precio= '+_sellerPrice);
              web3.eth.contract(abi).at(address).finished(_sellerPrice, hash, v, r, s, function(err, result){//se ejecuta la función de finalización del contrato
                console.log(_sellerPrice);
                console.log(hash);
                trHash = result;
                console.log(err);
                console.log(result);
                if(typeof result!=='undefined'){//la transacción se ha ejecutado
                  alert("Finalized purchase. Ethers will be deposited in the seller's account. ");
                  document.getElementById('recibo').value = 'Order: '+ address +'\n\nDate: '+ date +'\n\nBuyer address: '+_comprador+'\n\nSeller address: '+_vendedor+'\n\nCost (ethers): '
                  +_sellerPrice/1000000000000000000
                  +'\n\nSeller sign: '+signature;
                }else{
                  alert('Error finalizing the purchase. '+err)
                }
            });
          }
        });
      }else{
          alert('The price that the buyer is willing to pay is not the same price that the seller wants to charge.\n Please seller, if you do not agree with the price that the buyer is willing to pay, do not end this process.\nBuyer price: '+_buyerPrice/1000000000000000000+'\nSeller price: '+_sellerPrice/1000000000000000000);
          document.getElementById('sellerPrice').style.background = 'red';
          document.getElementById("sellerPrice").onclick = function() {white()};
      }
    }
  });

//función web3 para firmar
function sign(cb) {
  var messageToSign='Order: '+ address +'\n\nDate: '+ date +'\n\nBuyer address: '+_comprador+'\n\nSeller address: '+_vendedor+'\n\nCost (ethers): '
  +_sellerPrice/1000000000000000000;//se genera el mensaje que enviará el comprador al vendedor
  console.log(messageToSign);
  hash = web3.sha3(messageToSign);//se raliza el hash del mensaje
  web3.eth.sign(web3.eth.accounts[0], hash, function(err, res){//se realiza la firma sobre el hash del mensaje
  console.log(err,res);
  if(typeof res!=='undefined'){//la firma se ha realizado
    signature=res;
    cb(signature);
    console.log(signature);
    console.log(hash);
    alert('Message signed by the seller. ');
  }else{
    alert('Error signing the message. '+err);
  }
  });
}

function white() {
  document.getElementById("sellerPrice").style.background = 'white';
}

//función javascript para deshabilitar el botón de cancelar del comprador si el timeout no ha expirado
function deshabilitar_btnCancel(){
  document.getElementById("cancel1").disabled = false;
  document.getElementById("cancel1").innerHTML = "Cancel";
  document.getElementById("sellerPrice").style.display = "none";
  document.getElementById("finished").disabled = true;
  document.getElementById("finished").innerHTML = "You can't finalize. Expire time!";
}
