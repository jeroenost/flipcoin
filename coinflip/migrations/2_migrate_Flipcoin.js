const Flipcoin = artifacts.require("Flipcoin");

module.exports = function(deployer,accounts) {
  deployer.deploy(Flipcoin).then(function(instance){
    instance.addToBalance({value: web3.utils.toWei("0.3","ether")});
  }).catch(function(err){
    console.log("Deploy failed: "+err);
  });
};
