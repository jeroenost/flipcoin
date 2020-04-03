import "./Ownable.sol";
import "./provableAPI_0.5.sol";
pragma solidity 0.5.12;

contract Flipcoin is Ownable, usingProvable  {

  struct Bet {
    address payable sender;
    uint256 amount;
  }
  uint256 balance;
  uint256 constant MAX_INT_FROM_BYTE = 256;
  uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;
  mapping (bytes32 => Bet) private betMap;
  event BetResult(address payable owner, uint256 amountWon);

  constructor () public {
  }

  function flipCoin() public payable returns (bytes32) {
    require(msg.value < balance,"There is not enough balance left in the flipcoin contract.");
    require(msg.value <= 1 ether, "Maximum Flipcoin amount is 1 ether.");

    bytes32 queryId = requestRandom(); //bytes32(keccak256(abi.encodePacked(msg.sender)));// requestRandom()
    Bet memory newBet = Bet(msg.sender, msg.value);
    betMap[queryId] = newBet;

    return queryId;
  }

  function processResult(address payable better, uint256 amount, uint8 result) private {
    if (result == 0) {
      balance += amount;
      emit BetResult(better, 0);
    } else {
      better.transfer(2 * amount);
      balance -= amount;
      emit BetResult(better, amount);
    }
  }

  function addToBalance() payable onlyOwner public {
    balance += msg.value;
  }

  function getBalance() view public returns (uint256){
    return balance;
  }

  function __callback(bytes32 _queryId,string memory _result,bytes memory _proof) public {
      require(msg.sender == provable_cbAddress());
      //require(provable_randomDS_proofVerify__returnCode(_queryId, _result, _proof) == 0);

      uint8 betResult = uint8(uint256(keccak256(abi.encodePacked(_result))) % 2);
      Bet memory existingBet = betMap[_queryId];
      delete( betMap[_queryId]);
      processResult(existingBet.sender, existingBet.amount, betResult);
  }

  function requestRandom() private returns (bytes32)
  {
      uint256 QUERY_EXECUTION_DELAY = 0;
      uint256 GAS_FOR_CALLBACK = 200000;
      bytes32 queryId = provable_newRandomDSQuery(
          QUERY_EXECUTION_DELAY,
          NUM_RANDOM_BYTES_REQUESTED,
          GAS_FOR_CALLBACK
      );

      return queryId;
  }

  function testRandom() public returns (bytes32) {
      bytes32 queryId = bytes32(keccak256(abi.encodePacked(msg.sender)));
      __callback(queryId,"1", bytes("test"));
      return queryId;
  }

}
