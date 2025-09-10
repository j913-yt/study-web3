//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";


//1.创建一个收款函数
//2.记录投资人并且查看
//3.在锁定期内达到目标值生产商可以提款
//4.在锁定期内没有达到目标值投资者可以退款

contract FundMe{
    mapping ( address => uint256) public funderToAmount;

    uint256 MINIMUM_VALUE = 100*10**18;

    uint256 constant TARGET = 1 * 10 ** 18;

    address owner;
    address erc20Addr;
    bool public  getFundSuccess;

     uint256 deploymentTimestamp;
     uint256 locktime;

    AggregatorV3Interface internal dataFeed;
    constructor(uint256 _locktime){
        deploymentTimestamp = block.timestamp;
        locktime = _locktime;
        owner = msg.sender;
        dataFeed=AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    }
    
    function setErc20Addr(address _Erc20addr) public {
        require(msg.sender==owner,"this dunction can only be caller by owner");
        erc20Addr = _Erc20addr;
    }

    function setFunderToAmount(address funder,uint256 amountToUpdate) external {
        require(msg.sender == erc20Addr);
        funderToAmount[funder] = amountToUpdate;
    }

    function fund() external payable {
        // require(convertEthToUsd(msg.value) >= MINIMUM_VALUE,"Send more ETH");
        require(block.timestamp > deploymentTimestamp+locktime,"window is closed");
        funderToAmount[msg.sender]=msg.value;

    }

    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }
    function convertEthToUsd(uint256 ethAmount) internal view returns (uint256){
        uint256 ethPrice = uint(getChainlinkDataFeedLatestAnswer());
        return ethAmount * ethPrice/(10**8);
    }

    function transferOwnership(address newOwner) public {
        require(msg.sender==owner,"this dunction can only be caller by owner");
        owner=newOwner;
    }

    function getFund() external windowClosed{
        require(block.timestamp <= deploymentTimestamp+locktime,"window is closed");
        require(convertEthToUsd(address(this).balance) >= TARGET,"Target is not reached");
        
        bool success;
        (success,)=payable(msg.sender).call{value:address(this).balance}("");
        require(success,"transfer tx failed");
        getFundSuccess = true;
        }
        
    function reFund() external windowClosed{
        
        require(convertEthToUsd(address(this).balance) < TARGET,"Target is reached");
        require(funderToAmount[msg.sender] != 0,"there is no fund for you");
        funderToAmount[msg.sender]=0;
        bool success;
        (success,)=payable(msg.sender).call{value:funderToAmount[msg.sender]}("");
        require(success,"transfer tx failed");

    }

    modifier windowClosed(){
        require(block.timestamp <= deploymentTimestamp+locktime,"window is closed");
        _;

    }

    }

    


