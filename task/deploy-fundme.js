const {task} = require("hardhat/config")

task("deploy-fundme","deploy and verify fundme").setAction(async(taskArgs,hre)=>{
     // 创建合约工厂实例，用于部署 FundMe 合约
        const fundMeFactory = await ethers.getContractFactory("FundMe")
        
        console.log("合约部署中...")
        
        // 使用工厂部署合约，传入构造函数参数 300（锁定期时间）
        const fundMe = await fundMeFactory.deploy(300)
        
        // 等待合约部署完成
        await fundMe.waitForDeployment()
        
        // 输出部署成功的消息和合约地址
        console.log(`合约已成功部署，合约地址为：${fundMe.target}`);
    
    
        if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){
        // 等待 5 个区块确认，确保交易被确认
        await fundMe.deploymentTransaction().wait(5)
        console.log("等待 5 个区块确认中...")
    
        // 运行 Etherscan 验证任务，验证合约源代码
        // 注意：这里使用了硬编码的构造函数参数 10，与部署时的 300 不一致
        // 这可能会导致验证失败，需要确保参数一致
    
        verigyFundMe(fundMe.target,[300])
        }else{
            console.log("verification skipped..")
        }
})

module.exports = {}


async function verigyFundMe(fundMeAddr,args) {
     await hre.run("verify:verify", {
        address: fundMeAddr,           // 要验证的合约地址
        constructorArguments: args,       // 构造函数参数（需要与部署时一致）
    });

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
    
    const firstAccountbalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address)
    const secondAccountbalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address)
    console.log(`Balance of first account ${firstAccount.address} is ${firstAccountbalanceInFundMe}`)
    console.log(`Balance of second account ${secondAccount.address} is ${secondAccountbalanceInFundMe}`)


    
}