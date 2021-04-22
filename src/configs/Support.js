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
      balance = await this.contract.balanceOf(this.wallet.address);
    }
    return ethers.BigNumber.from(balance);
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
    console.log("readKeyStoreJson>>>>>>", json, password);
    this.wallet = await ethers.Wallet.fromEncryptedJson(json, password);
    console.log("readKeyStoreJson1>>>>>>", this.wallet)
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

  async isAddress(checkValue) {
    return ethers.utils.isAddress(checkValue);
  }

  async transfer(addressReceiver, amount) {
    const overrides = {
      gasLimit: ethers.BigNumber.from("2000000"),
      gasPrice: ethers.BigNumber.from("10000000000000"),
    };
    const isAddress = this.isAddress(addressReceiver);
    if (isAddress) {
      const callPromise = this.contract.transfer(addressReceiver, ethers.BigNumber.from(amount.toString()), overrides);
      const receipt = await callPromise.wait();
      if (receipt.status !== 1) {
        return "Fail On Server Blockchain";
      }

      return receipt.transactionHash;
    }
    return "Fail - Not valid address!!";
  }

  // Add document to smart contract for identify it with wallet
  async addDocument(hash_id) {
    // console.log("Hash Id >>>>", hash_id);
    const signature = await this.getOwnerDocument(`0x${hash_id}`);
    console.log("signature>>>>>>>", signature);
    if (signature != null && signature !== ethers.constants.AddressZero && signature !== this.wallet.address) {
      return "Fail -- This media is belong to another user";
    }
    const overrides = {
      gasLimit: ethers.BigNumber.from("2000000"),
      gasPrice: ethers.BigNumber.from("10000000000000"),
    };
    const callPromise = await this.contract.addDocument(`0x${hash_id}`, overrides);
    const receipt = await callPromise.wait();
    if (receipt.status !== 1) {
      return "Fail On Server Blockchain";
    }
    return receipt.transactionHash;
  }

  async approveDocument(hash_id) {
    const signature = await this.getOwnerDocument(`0x${hash_id}`);
    console.log("signature>>>>>>>", signature);
    if (signature == null) {
      return "Fail -- User is not sign this";
    }

    const overrides = {
      gasLimit: ethers.BigNumber.from("2000000"),
      gasPrice: ethers.BigNumber.from("10000000000000"),
    };

    const approveDocumentFunction = await this.contract.approveDocument(`0x${hash_id}`, overrides);
    const receipt = await approveDocumentFunction.wait();
    if (receipt.status !== 1) {
      return "Fail On Server Blockchain";
    }
    return receipt.transactionHash;
  }

  async rejectDocument(hash_id) {
    const signature = await this.getOwnerDocument(`0x${hash_id}`);
    console.log("signature>>>>>>>", signature);
    if (signature == null) {
      return "Fail -- User is not sign this";
    }

    const overrides = {
      gasLimit: ethers.BigNumber.from("2000000"),
      gasPrice: ethers.BigNumber.from("10000000000000"),
    };

    const rejectDocumenttFunction = await this.contract.rejectDocument(`0x${hash_id}`, overrides);
    const receipt = await rejectDocumenttFunction.wait();
    if (receipt.status !== 1) {
      return "Fail On Server Blockchain";
    }
    return receipt.transactionHash;
  }

  async deleteDocument(hash_id) {
    const overrides = {
      gasLimit: ethers.BigNumber.from("2000000"),
      gasPrice: ethers.BigNumber.from("10000000000000"),
    };
    const signature = await this.getOwnerDocument(`0x${hash_id}`);
    console.log("signature>>>>>>>", signature);
    if (signature == null) {
      return "Fail - File is not on server";
    }
    const deleteDocumentFunction = await this.contract.deleteDocument(`0x${hash_id}`, overrides);
    const receipt = await deleteDocumentFunction.wait();
    if (receipt.status !== 1) {
      return "Fail On Server Blockchain";
    }
    console.log('====================================');
    console.log("deleteDocument>>>", receipt);
    console.log('====================================');
    return receipt.transactionHash;
  }

  async getOwnerDocument(id) {
    const callPromise = await this.contract.getOwnerDocument(id);
    return callPromise;
  }

  async sendToken(receiverAddress, numberOfToken) {
    let balance = await this.getBalance();
    balance = ethers.BigNumber.from(ethers.utils.parseEther(balance));
    const total = ethers.BigNumber.from(ethers.utils.parseEther(numberOfToken)).add(ethers.BigNumber.from(ethers.utils.parseEther(numberOfToken)));
    if (balance.ite(total)) {
      const callPromise = await this.contract.transfer(receiverAddress, numberOfToken);
      const receipt = await callPromise.wait();
      if (receipt.status !== 1) {
        return "Fail On Server Blockchain";
      }
    } else {
      return "Not Enough Money";
    }
    return "Success";
  }


  async createCampaign(campaignId, totalWithFee, totalBudget, remainBudget, feeCancel) {
    if (totalBudget < 100000) return "Not Enough Total Budget";
    if (totalWithFee < totalBudget) return "Wrong Total With Fee";
    if (remainBudget <= 100000) return "Not Enough Remain Budget";
    let minFeeCancel = feeCancel;
    if (feeCancel <= 100000) minFeeCancel = 100000;
    const totalWithFeeBN = ethers.BigNumber.from(totalWithFee.toString());
    const totalBudgetBN = ethers.BigNumber.from(totalBudget.toString());
    const remainBudgetBN = ethers.BigNumber.from(remainBudget.toString());
    const feeCancelBN = ethers.BigNumber.from(minFeeCancel.toString());
    console.log('====================================');
    console.log("totalWithFeeBN Campaign  >>>", totalWithFeeBN);
    console.log("totalBudgetBN Campaign  >>>", totalBudgetBN);
    console.log("remainBudgetBN Campaign  >>>", remainBudgetBN);
    console.log("feeCancelBN Campaign  >>>", feeCancelBN);
    console.log('====================================');
    const balance = await this.getBalance();
    if (totalWithFeeBN.lt(balance)) {
      const approveToTransferMoney = await this.contract.approve(this.evn.SUPPORT_ADDRESS, totalWithFeeBN);
      let receipt = await approveToTransferMoney.wait();

      if (receipt.status === 1) {
        const overrides = {
          gasLimit: ethers.BigNumber.from("2000000"),
          gasPrice: ethers.BigNumber.from("10000000000000"),
        };
        const createCampaign = await this.contract.createCampaign(campaignId, totalWithFeeBN, totalBudgetBN, remainBudgetBN, feeCancelBN, overrides);
        receipt = await createCampaign.wait();
        if (receipt.status !== 1) {
          return "Fail On Server Blockchain Create Campaign";
        }
        console.log('====================================');
        console.log("Create Campaign  >>>", createCampaign.hash);
        console.log('====================================');
        return createCampaign.hash;
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
    console.log("Cancel Campaign >>>", id, this.contract);
    const cancelCampaign = await this.contract.cancelCampaign(id);
    console.log("Cancel Campaign >>>", cancelCampaign);
    const receipt = await cancelCampaign.wait();
    console.log("Cancel Campaign Receipi>>>", receipt);
    if (receipt.status !== 1) {
      return "Fail On Server Blockchain Create Campaign";
    }
    const { feeCancel } = await this.getCampaignById(id);
    console.log("Cancel Campaign feeCancel>>>", feeCancel.toString());

    const result = {
      hash: cancelCampaign.hash, feeCancel: feeCancel.toString()
    }
    console.log("Cancel Campaign result>>>", result);
    return result;
  }

}
