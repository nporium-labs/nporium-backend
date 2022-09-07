const mongoose = require("mongoose"),
  userAccount = mongoose.model("userAccount"),
  usersPaswords = mongoose.model("usersPasword"),
  FormData = require("form-data"),
  bcrypt = require("bcryptjs"),
  crypto = require("crypto"),
  result = require("../response/result"),
  uploadData = require("../utilities/loginHelper"),
  blockchainScripts = require("../utilities/helpers/blockChainScripts"),
  loginResult = require("../response/loginResponse"),
  userResult = require("../response/userResponse"),
  messages = require("../utilities/errormessages");

require("dotenv").config();

const mintNFT = async (req, res) => {
  try {
    if (req.body.name && req.body.description && req.file) {
      //   const data = [{ key: "artist", value: "danish" }];
      var data = [];
      if (req.body?.artist) {
        data = [{ key: "artist", value: req.body?.artist }];
      }

      const response = await uploadData.uploadToPinata(
        process.env.MY_PINATA_API_KEY,
        process.env.MY_PINATA_SECRET_KEY,
        req.file.originalname
      );
      const mintNFTs = await blockchainScripts.mintNFT(
        req.body.name,
        req.body.description,
        data,
        response
      );
      result.isError = false;
      result.message = messages.nftMintedSuccess;
      res.status(200).send(result);
    } else {
      result.isError = true;
      result.message = messages.nftMintedError;
      res.status(400).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = error;
    res.status(400).send(result);
  }
};

const listNFTForSale = async (req, res) => {
  try {
    if (req.body.tokenId && req.body.price) {
      const listNFT = await blockchainScripts.listNFTsForSale(
        req.body.tokenId,
        req.body.price
      );
      result.isError = false;
      result.message = messages.nftListedSuccess;
      res.status(200).send(result);
    } else {
      result.isError = true;
      result.message = messages.nftListedError;
      res.status(400).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = error;
    res.status(400).send(result);
  }
};

const unlistNFTFromSale = async (req, res) => {
  try {
    if (req.body.tokenId) {
      const unlistNFT = await blockchainScripts.unListNFTsForSale(
        req.body.tokenId
      );
      result.isError = false;
      result.message = messages.nftUnListedSuccess;
      res.status(200).send(result);
    } else {
      result.isError = true;
      result.message = messages.nftUnListedError;
      res.status(400).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = error;
    res.status(400).send(result);
  }
};

const updatelistNFTPrice = async (req, res) => {
  try {
    if (req.body.tokenId && req.body.price) {
      const updatePrice = await blockchainScripts.updatePriceOfSaleNFT(
        req.body.tokenId,
        req.body.price
      );
      result.isError = false;
      result.message = messages.nftPriceUpdatedSuccess;
      res.status(200).send(result);
    } else {
      result.isError = true;
      result.message = messages.nftPriceUpdatedError;
      res.status(400).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = error;
    res.status(400).send(result);
  }
};

const updateRoyalityCut = async (req, res) => {
  try {
    if (req.body.value) {
      const royality = await blockchainScripts.updateRoyalityCut(
        req.body.value
      );
      result.isError = false;
      result.message = messages.nftRoyalityUpdatedSuccess;
      res.status(200).send(result);
    } else {
      result.isError = true;
      result.message = messages.nftRoyalityUpdatedError;
      res.status(400).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = error;
    res.status(400).send(result);
  }
};

const updateMarketingCut = async (req, res) => {
  try {
    if (req.body.value) {
      const marketcut = await blockchainScripts.updateMarketingCut(
        req.body.value
      );
      result.isError = false;
      result.message = messages.nftMarketCutUpdatedSuccess;
      res.status(200).send(result);
    } else {
      result.isError = true;
      result.message = messages.nftMarketCutUpdatedError;
      res.status(400).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = error;
    res.status(400).send(result);
  }
};

const createUserEmptySaleCollection = async (req, res) => {
  try {
    if (req.headers.sessionid) {
      const marketcut = await blockchainScripts.createEmptySaleCollection();
      result.isError = false;
      result.message = messages.createSaleCollectionSuccess;
      res.status(200).send(result);
    } else {
      result.isError = true;
      result.message = messages.createSaleCollectionError;
      res.status(400).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = error;
    res.status(400).send(result);
  }
};

const createUserEmptyNFTCollection = async (req, res) => {
  try {
    if (req.headers.sessionid) {
      const marketcut = await blockchainScripts.createEmptyNFTCollection();
      result.isError = false;
      result.message = messages.createNFTCollectionSuccess;
      res.status(200).send(result);
    } else {
      result.isError = true;
      result.message = messages.createNFTCollectionError;
      res.status(400).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = error;
    res.status(400).send(result);
  }
};

const getAllListedNFTsByUser = async (req, res) => {
  try {
    if (req.body.user) {
      const marketcut = await blockchainScripts.getAllListedNFTsByUser(
        req.body.user
      );
      result.isError = false;
      result.message = messages.getAllListedNFTsByUserSuccess;
      res.status(200).send(result);
    } else {
      result.isError = true;
      result.message = messages.getAllListedNFTsByUserError;
      res.status(400).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = error;
    res.status(400).send(result);
  }
};

const getUserNFTs = async (req, res) => {
  try {
    if (req.body.account) {
      const marketcut = await blockchainScripts.getUserNFTs(req.body.account);
      result.isError = false;
      result.message = messages.getUserNFTsSuccess;
      res.status(200).send(result);
    } else {
      result.isError = true;
      result.message = messages.getUserNFTsError;
      res.status(400).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = error;
    res.status(400).send(result);
  }
};
const getUserFlowBalance = async (req, res) => {
  try {
    if (req.body.account) {
      const marketcut = await blockchainScripts.getUserFlowBalance(
        req.body.account
      );
      result.isError = false;
      result.message = messages.getUserBalanceSuccess;
      res.status(200).send(result);
    } else {
      result.isError = true;
      result.message = messages.getUserBalanceError;
      res.status(400).send(result);
    }
  } catch (error) {
    result.isError = true;
    result.message = error;
    res.status(400).send(result);
  }
};

module.exports = {
  mintNFT,
  listNFTForSale,
  unlistNFTFromSale,
  updatelistNFTPrice,
  updateRoyalityCut,
  updateMarketingCut,
  createUserEmptySaleCollection,
  createUserEmptyNFTCollection,
  getAllListedNFTsByUser,
  getUserNFTs,
  getUserFlowBalance,
};
