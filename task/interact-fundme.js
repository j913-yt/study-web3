const {task} = require("hardhat/config");

task("interact-contract","interact with fundme contract")
.addParam("addr","fundme contract address")
.setAction(async(taskArgs,hre)=>{


        const fundMeFactory = await ethers.getContractFactory("FundMe")
        const fundMe = fundMeFactory.attach(taskArgs.addr)

        const [firstAccount,secondAccount] = await ethers.getSigners()
    
        const fundTx = await fundMe.fund({value:ethers.parseEther("0.001")})
        await fundTx.wait()
    
        const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
        console.log(`Valance of the contract is ${balanceOfContract}`)
    
        //第二个账户
        const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({value:ethers.parseEther("0.001")})
        await fundTxWithSecondAccount.wait()
    
        const balanceOfcontractAfterSecondFund = await ethers.provider.getBalance(fundMe.target)
        console.log(`Valance of the contract is ${balanceOfContract}`)
    
        //查看俩个账户在合约中的余额
        
        const firstAccountbalanceInFundMe = await fundMe.funderToAmount(firstAccount.address)
        const secondAccountbalanceInFundMe = await fundMe.funderToAmount(secondAccount.address)
        console.log(`Balance of first account ${firstAccount.address} is ${firstAccountbalanceInFundMe}`)
        console.log(`Balance of second account ${secondAccount.address} is ${secondAccountbalanceInFundMe}`)
})

module.exports={}
