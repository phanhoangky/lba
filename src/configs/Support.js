import { ethers } from "ethers";

export default class EtherService {
  constructor(abi, evn) {
    this.abi = abi;
    this.evn = evn;
    this.provider = new ethers.providers.JsonRpcProvider(this.evn.RPC_ENDPOINT);
    this.signer = this.provider.getSigner();
  }

  static async build() {
    const abiJson = await this.getJson("https://lbacontract.github.io/build/contracts/Support.json");
    const evn = await this.getJson("https://lbacontract.github.io/evn/testnet.json");
    return new EtherService(abiJson.abi, evn);
  }

  static async getJson(url) {
    const settings = { method: "Get" };
    const res = await fetch(url, settings);
    return await res.json();
  }

  async getBalance() {
    let balance = 0;

    if (this.wallet !== undefined) {
      console.log('====================================');
      console.log("Wallet >>>>", this.wallet, this.wallet.address);
      console.log("Wallet >>>>", this.contract);
      console.log('====================================');
      balance = await this.contract.balanceOf(this.wallet.address);
    }
    return balance.toString();
  }

  async createAccount() {
    if (this.wallet === undefined) {
      this.wallet = await ethers.Wallet.createRandom();
      this.wallet = this.wallet.connect(this.provider);
    }
  }

  async createKeyStoreJson(password) {
    const json = await this.wallet.encrypt(password, {
      scrypt: {
        N: 2 ** 16,
      },
    });
    return json;
  }

  // Sign in wallet
  async readKeyStoreJson(json, password) {
    this.wallet = await ethers.Wallet.fromEncryptedJson(json, password);
    this.wallet = this.wallet.connect(this.provider);
  }

  // Already have blockchain wallet and sign in with private key
  async readPrivateKey(privateKey) {
    this.wallet = await ethers.Wallet(privateKey);
    this.wallet = this.wallet.connect(this.provider);
  }

  // init contract with provider and wallet
  async initContracts() {
    this.contract = new ethers.Contract(
      this.evn.SUPPORT_ADDRESS,
      this.abi,
      this.wallet
    );
    this.contract.provider.polling = false;
  }

  // Add document to smart contract for identify it with wallet
  async addDocument(hash_id, isSign) {
    const overrides = {
      gasLimit: ethers.BigNumber.from("2000000"),
      gasPrice: ethers.BigNumber.from("10000000000000"),

    };
    const callPromise = await this.contract.addDocument(`0x${hash_id}`, overrides);
    const receipt = await this.provider.getTransactionReceipt(callPromise.hash);
    if (receipt.status !== 1) {
      return "Fail On Server Blockchain";
    }
    if (isSign === 1) {
      await this.signDocument(hash_id);
    }
    return "Success";
  }

  async signDocument(hash_id) {
    const overrides = {
      gasLimit: ethers.BigNumber.from("2000000"),
      gasPrice: ethers.BigNumber.from("10000000000000"),
    };

    const signDocumentFunction = await this.contract.signDocument(`0x${hash_id}`, overrides);
    const receipt = await this.provider.getTransactionReceipt(signDocumentFunction.hash);
    if (receipt.status !== 1) {
      return "Fail On Server Blockchain";
    }
    return signDocumentFunction;
  }

  async getSignatureDocument(id) {
    const callPromise = await this.contract.getSignatures(id);
    return callPromise;
  }

  async sendToken(receiverAddress, numberOfToken) {
    let balance = await this.getBalance();
    balance = ethers.BigNumber.from(ethers.utils.parseEther(balance));
    const total = ethers.BigNumber.from(ethers.utils.parseEther(numberOfToken)).add(ethers.BigNumber.from(ethers.utils.parseEther(numberOfToken)));
    if (balance.ite(total)) {
      const callPromise = await this.contract.transfer(receiverAddress, numberOfToken);
      const receipt = await this.provider.getTransactionReceipt(callPromise.hash);
      if (receipt.status !== 1) {
        return "Fail On Server Blockchain";
      }
    } else {
      return "Not Enough Money";
    }
    return "Success";
  }


  async createCampaign(campaignId, totalWithFee, totalBudget, remainBudget, feeCancel) {
    if (totalBudget < 1000000) return "Not Enough Total Budget";
    if (totalWithFee < totalBudget) return "Wrong Total With Fee";
    if (remainBudget <= 100000) return "Not Enough Remain Budget";
    let minFeeCancel = feeCancel;
    if (feeCancel <= 100000) minFeeCancel = 100000;

    const totalWithFeeBN = ethers.BigNumber.from(totalWithFee.toString());
    const totalBudgetBN = ethers.BigNumber.from(totalBudget.toString());
    const remainBudgetBN = ethers.BigNumber.from(remainBudget.toString());
    const feeCancelBN = ethers.BigNumber.from(minFeeCancel.toString());

    const balance = await this.getBalance();
    if (totalWithFeeBN < balance) {
      const approveToTransferMoney = await this.contract.approve(this.evn.SUPPORT_ADDRESS, totalWithFeeBN);
      let receipt = await this.provider.getTransactionReceipt(approveToTransferMoney.hash);
      if (receipt.status === 1) {
        const overrides = {
          gasLimit: ethers.BigNumber.from("2000000"),
          gasPrice: ethers.BigNumber.from("10000000000000"),
        };

        const createCampaign = await this.contract.createCampaign(campaignId, totalWithFeeBN, totalBudgetBN, remainBudgetBN, feeCancelBN, overrides);
        receipt = await this.provider.getTransactionReceipt(createCampaign.hash);
        if (receipt.status !== 1) {
          return "Fail On Server Blockchain Create Campaign";
        }
      } else {
        return "Fail On Server Blockchain Approve Money";
      }
    } else {
      return "Not Enough Money";
    }
    return "Success";
  }

  async getCampaignById(id) {
    const getCampaignById = await this.contract.getCampaignById(id);
    return getCampaignById;
  }

  async cancelCampaign(id) {
    const cancelCampaign = await this.contract.cancelCampaign(id);
    const receipt = await this.provider.getTransactionReceipt(cancelCampaign.hash);
    if (receipt.status !== 1) {
      return "Fail On Server Blockchain Create Campaign";
    }
    return "Success";
  }

}
