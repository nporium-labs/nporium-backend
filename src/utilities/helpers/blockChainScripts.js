const fcl = require("@onflow/fcl");
const t = require("@onflow/types");
const {
  authorizationFunction,
  authorizationFunctionProposer,
} = require("./authorization");

require("dotenv").config();

fcl.config().put("accessNode.api", "https://rest-testnet.onflow.org");

const mintNFT = async (name, description, media, data) => {
  // const testdata = [{ key: "artist", value: "danish" }];
  data = [data];
  let resourceOwner = process.env.MY_ADDRESS;
  let recipientAddress = process.env.MY_ADDRESS;

  const transactionId = await fcl
    .send([
      fcl.transaction`
        import NPMContract from ${process.env.NPMCONTRACT_ADDRESS}
  
        transaction() {
            prepare(acct: AuthAccount) {
                let account = getAccount(${resourceOwner})
                let adminRef = account.getCapability(NPMContract.NFTAdminResourcePublicPath)
                    .borrow<&{NPMContract.NFTAdminResourcePublic}>()
                    ?? panic("Could not borrow public sale reference")
                adminRef.mintToken(name: ${name}, description: ${description}, media: ${media}, data: ${data}, recipientAddress: ${recipientAddress})
            }
        }`,
      fcl.proposer(authorizationFunction),
      fcl.authorizations([authorizationFunction]),
      fcl.payer(authorizationFunction),
      fcl.limit(9999),
    ])
    .then(fcl.decode);

  //   console.log(transactionId);
  let response = await fcl.tx(transactionId).onceSealed();
  return response;
};

const updateRoyalityCut = async (newValue) => {
  const transactionId = await fcl
    .send([
      fcl.transaction`
        import NFTMarketplace from ${process.env.NFTMarketplace_ADDRESS}
        transaction(){
          prepare(account:AuthAccount){
              let adminRef = account.borrow<&NFTMarketplace.AdminResource>(from:NFTMarketplace.AdminResourceStoragePath)
                           ?? panic("could not borrow admin refrence")
              adminRef.setRoyaltyCut(value: UFix64(${newValue}))
          }
      }`,
      fcl.proposer(authorizationFunction),
      fcl.authorizations([authorizationFunction]),
      fcl.payer(authorizationFunction),
      fcl.limit(9999),
    ])
    .then(fcl.decode);

  let response = await fcl.tx(transactionId).onceSealed();
  return response;
};

const updateMarketingCut = async (newValue) => {
  const transactionId = await fcl
    .send([
      fcl.transaction`
      import NFTMarketplace from ${process.env.NFTMarketplace_ADDRESS}
      transaction(){
        prepare(account:AuthAccount){
            let adminRef = account.borrow<&NFTMarketplace.AdminResource>(from:NFTMarketplace.AdminResourceStoragePath)
                         ?? panic("could not borrow admin refrence")
            adminRef.setMarketplaceCut(value: UFix64(${newValue}))
        }
      }`,
      fcl.proposer(authorizationFunction),
      fcl.authorizations([authorizationFunction]),
      fcl.payer(authorizationFunction),
      fcl.limit(9999),
    ])
    .then(fcl.decode);

  let response = await fcl.tx(transactionId).onceSealed();
  return response;
};

const listNFTsForSale = async (tokenId, price) => {
  const transactionId = await fcl
    .send([
      fcl.transaction`
      import NonFungibleToken from ${process.env.NONFUNGIBLETOKEN_ADDRESS}
      import NPMContract from ${process.env.NPMCONTRACT_ADDRESS}
      import FungibleToken from ${process.env.FUNGIBLETOKEN_ADDRESS}
      import FlowToken from ${process.env.FLOWTOKEN_ADDRESS}
      import NFTMarketplace from ${process.env.NFTMarketplace_ADDRESS}

      transaction(){
          let collectionRef: &NPMContract.Collection
          let NFTMarketplaceSaleCollectionRef: &NFTMarketplace.SaleCollection
          prepare(account:AuthAccount){
              self.collectionRef = account.borrow<&NPMContract.Collection>(from: NPMContract.CollectionStoragePath) 
                                  ??panic("could not borrow NPMContract collection")
              self.NFTMarketplaceSaleCollectionRef = account.borrow<&NFTMarketplace.SaleCollection>(from: NFTMarketplace.SaleCollectionStoragePath)
                                                      ??panic("could not borrow NFTMarketplace collection")
              }
          execute{
              let token <-  self.collectionRef.withdraw(withdrawID: ${tokenId}) as! @NPMContract.NFT
              self.NFTMarketplaceSaleCollectionRef.listForSale(token: <-token, price: UFix64(${price}))
          }
      }`,
      fcl.proposer(authorizationFunction),
      fcl.authorizations([authorizationFunction]),
      fcl.payer(authorizationFunction),
      fcl.limit(9999),
    ])
    .then(fcl.decode);
  let response = await fcl.tx(transactionId).onceSealed();
  return response;
};

const unListNFTsForSale = async (tokenId) => {
  const transactionId = await fcl
    .send([
      fcl.transaction`
      import NonFungibleToken from ${process.env.NONFUNGIBLETOKEN_ADDRESS}
      import NPMContract from ${process.env.NPMCONTRACT_ADDRESS}
      import FungibleToken from ${process.env.FUNGIBLETOKEN_ADDRESS}
      import FlowToken from ${process.env.FLOWTOKEN_ADDRESS}
      import NFTMarketplace from ${process.env.NFTMarketplace_ADDRESS}

      transaction(){
          let collectionRef: &NPMContract.Collection
          let NFTMarketplaceSaleCollectionRef: &NFTMarketplace.SaleCollection

          prepare(account:AuthAccount){ 
              let collectionCap = account.getCapability<&{NPMContract.NPMContractCollectionPublic}>(NPMContract.CollectionPublicPath)
              if !collectionCap.check(){
                  account.save(<- NPMContract.createEmptyCollection(), to: NPMContract.CollectionStoragePath)
                  account.link<&{NPMContract.NPMContractCollectionPublic}>(NPMContract.CollectionPublicPath, target: NPMContract.CollectionStoragePath) 
              }
              self.collectionRef = account.borrow<&NPMContract.Collection>(from: NPMContract.CollectionStoragePath) 
                                  ??panic("could not borrow NPMContract collection")
              self.NFTMarketplaceSaleCollectionRef = account.borrow<&NFTMarketplace.SaleCollection>(from: NFTMarketplace.SaleCollectionStoragePath)
                                                      ??panic("could not borrow NFTMarketplace collection")
              }
          execute{
              
              let token <- self.NFTMarketplaceSaleCollectionRef.withdraw(tokenID: ${tokenId})
              self.collectionRef.deposit(token: <- token)
          }
      }`,
      fcl.proposer(authorizationFunction),
      fcl.authorizations([authorizationFunction]),
      fcl.payer(authorizationFunction),
      fcl.limit(9999),
    ])
    .then(fcl.decode);
  let response = await fcl.tx(transactionId).onceSealed();
  return response;
};

const updatePriceOfSaleNFT = async (tokenId, newPrice) => {
  const transactionId = await fcl
    .send([
      fcl.transaction`
      import NFTMarketplace from ${process.env.NFTMarketplace_ADDRESS}

      transaction(){
        let NFTMarketplaceSaleCollectionRef: &NFTMarketplace.SaleCollection
    
        prepare(account:AuthAccount){
            self.NFTMarketplaceSaleCollectionRef = account.borrow<&NFTMarketplace.SaleCollection>(from: NFTMarketplace.SaleCollectionStoragePath)
                                                    ??panic("Could not borrow from sale in storage")
            }
        execute{
            self.NFTMarketplaceSaleCollectionRef.changePrice(tokenID: ${tokenId}, newPrice: UFix64(${newPrice}))
        }
    }`,
      fcl.proposer(authorizationFunction),
      fcl.authorizations([authorizationFunction]),
      fcl.payer(authorizationFunction),
      fcl.limit(9999),
    ])
    .then(fcl.decode);
  let response = await fcl.tx(transactionId).onceSealed();
  return response;
};

const createEmptySaleCollection = async () => {
  const transactionId = await fcl
    .send([
      fcl.transaction`
      import FungibleToken from ${process.env.FUNGIBLETOKEN_ADDRESS}
      import FlowToken from ${process.env.FLOWTOKEN_ADDRESS}
      import NFTMarketplace from ${process.env.NFTMarketplace_ADDRESS}

      transaction() {
          prepare(acct: AuthAccount) {
              let ownerVault = acct.getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(/public/flowTokenReceiver)
              acct.save(<- NFTMarketplace.createSaleCollection(ownerVault: ownerVault), to: NFTMarketplace.SaleCollectionStoragePath)
              acct.link<&{NFTMarketplace.SalePublic}>(NFTMarketplace.SaleCollectionPublicPath, target: NFTMarketplace.SaleCollectionStoragePath)
          }
      }`,
      fcl.proposer(authorizationFunction),
      fcl.authorizations([authorizationFunction]),
      fcl.payer(authorizationFunction),
      fcl.limit(9999),
    ])
    .then(fcl.decode);
  let response = await fcl.tx(transactionId).onceSealed();
  return response;
};

const createEmptyNFTCollection = async () => {
  const transactionId = await fcl
    .send([
      fcl.transaction`
      import NonFungibleToken from ${process.env.NONFUNGIBLETOKEN_ADDRESS}
      import NPMContract from ${process.env.NPMCONTRACT_ADDRESS}

      transaction() {
          prepare(acct: AuthAccount) {
              acct.save(<- NPMContract.createEmptyCollection(), to: NPMContract.CollectionStoragePath)
              acct.link<&{NPMContract.NPMContractCollectionPublic}>(NPMContract.CollectionPublicPath, target: NPMContract.CollectionStoragePath)
          }
      }`,
      fcl.proposer(authorizationFunction),
      fcl.authorizations([authorizationFunction]),
      fcl.payer(authorizationFunction),
      fcl.limit(9999),
    ])
    .then(fcl.decode);
  let response = await fcl.tx(transactionId).onceSealed();
  return response;
};

const getAllListedNFTsByUser = async (user) => {
  const response = await fcl
    .send([
      fcl.script`
    import NFTMarketplace from ${process.env.NFTMarketplace_ADDRESS}

    pub fun main() : {UInt64: NFTMarketplace.ListingItemPublic} {
        return NFTMarketplace.getAllListingNMPsByUser(user: ${user})
    }`,
    ])
    .then(fcl.decode);
  return response;
};

const getUserNFTs = async (account) => {
  const response = await fcl
    .send([
      fcl.script`
    import NPMContract from ${process.env.NPMCONTRACT_ADDRESS}

    pub fun main() : {UInt64: AnyStruct}{
        let account1 = getAccount(${account})
        let acct1Capability =  account1.getCapability(NPMContract.CollectionPublicPath)
                                .borrow<&{NPMContract.NPMContractCollectionPublic}>()
                                ??panic("could not borrow receiver reference ")

          let nftIds = acct1Capability.getIDs()

        var dict : {UInt64: AnyStruct} = {}

        for nftId in nftIds {
            let nftData = acct1Capability.borrowNFTNPMContractContract(id: nftId)
            var nftMetaData : {String:AnyStruct} = {}
            
            nftMetaData["name"] =nftData!.name;
            nftMetaData["description"] = nftData!.description;
            nftMetaData["media"] = nftData!.thumbnail;
            nftMetaData["data"] = nftData!.data;
            nftMetaData["creator"] = nftData!.author;
            nftMetaData["ownerAdress"] = account;
            dict.insert(key: nftId,nftMetaData)
        }
        return dict
    }`,
    ])
    .then(fcl.decode);
  return response;
};

const getUserFlowBalance = async (account) => {
  const response = await fcl
    .send([
      fcl.script`
      import FungibleToken from ${process.env.FUNGIBLETOKEN_ADDRESS}
      import FlowToken from ${process.env.FLOWTOKEN_ADDRESS}
      pub fun main():UFix64 {
          let vaultRef = getAccount(${account})
          .getCapability(/public/flowTokenBalance)
          .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
          ?? panic("Could not borrow Balance reference to the Vault")
          return vaultRef.balance
      }
      `,
    ])
    .then(fcl.decode);
  return response;
};

module.exports = {
  mintNFT,
  updateRoyalityCut,
  updateMarketingCut,
  listNFTsForSale,
  unListNFTsForSale,
  updatePriceOfSaleNFT,
  getAllListedNFTsByUser,
  getUserNFTs,
  getUserFlowBalance,
  createEmptySaleCollection,
  createEmptyNFTCollection,
};
