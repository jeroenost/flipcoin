var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var myAccount;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
      contractInstance = new web3.eth.Contract(abi, "0x85B65E39b680C2538317Ee19F4de8b92A7bfe151",
      { from: accounts[0]});
      myAccount = accounts[0];
      getBalances();
      contractInstance.events.allEvents()
        .on('data', (event) => {
             console.log("Received event:",event);
             var owner = event.returnValues["owner"];
             var amount = event.returnValues["amountWon"];
             console.log(owner);
             console.log(myAccount);
             if (owner.toUpperCase() === myAccount.toUpperCase()) {
                  var msg;
                  if (amount > 0) {
                    msg = "You won: "+prettyBalance(amount);
                  } else {
                    msg = "You lost: "+prettyBalance(-amount);
                  }
                  console.log(msg);
                  $("#message").text(msg);
                  getBalances();
             }
          })
        .on('error', console.error);
    });
    $("#flip_button").click(flip);
});

function prettyBalance(arg) {
  return web3.utils.fromWei(arg,"ether")+" ether";
}
function getBalances() {
  contractInstance.methods.getBalance().call().then(function(res) {
    var amount = prettyBalance(res);
    console.log("Current contract balance: "+amount);
    $("#contractBalance").text(amount);
    web3.eth.getBalance(myAccount, (err, balance) => {
      console.log("Your wallet balance: "+prettyBalance(balance));
      $("#yourBalance").text(prettyBalance(balance));
    });
  })
}

function flip() {
  var amount = $("#amount_input").val();
  $("#message").text("Sign your coinflip transaction");
  web3.eth.getBalance(myAccount).then(function(myBalance) {
    console.log("my balance before: "+prettyBalance(myBalance));
    contractInstance.methods.flipCoin().send({value: web3.utils.toWei(amount,"ether")})
    .on("transactionHash",function(hash){
      $("#message").text("Coin is flipping..... wait!");
      console.log("Flip transaction hash: "+hash);
    })
    .on("receipt", function(receipt) {
      console.log("Flip transaction receipt:"+receipt);
    });
  });


  //
  // web3.eth.getBalance(myAccount).then(function(newBalance) {
  //   console.log("New balance: ", newBalance);
  //   if (newBalance > myBalance) {
  //     console.log("Success you won!!!");
  //     alert("You won!!!");
  //   } else {
  //     alert("Unfortunately you lost!");
  //   }
  //   setTimeout(function() {
  //     getContractBalance();
  //   }, 100);

}
