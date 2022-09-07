const { timeStamp } = require("console");
const FormData = require("form-data"),
  fs = require("fs"),
  pinataSDK = require("@pinata/sdk"),
  path = require("path");
require("dotenv").config();

const uploadToPinata = async (pinataApiKey, pinataSecretApiKey, imageName) => {
  console.log("we are helper");
  const pinata = pinataSDK(pinataApiKey, pinataSecretApiKey);
  const readableStreamForFile = fs.createReadStream(
    path.join(__dirname, `../../public/assets/${imageName}`)
  );
  const options = {
    pinataMetadata: {
      name: imageName + Date.now(),
      keyvalues: {
        customKey: "customValue",
        customKey2: "customValue2",
      },
    },
    pinataOptions: {
      cidVersion: 0,
    },
  };
  return pinata
    .pinFileToIPFS(readableStreamForFile, options)
    .then((result) => {
      let url = `https://${process.env.MY_PINATA_API_GATEWAY}/ipfs/${result.IpfsHash}`;

      // remove all the filese in images directory
      const directory = path.join(__dirname, "../../public/assets");
      fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
          fs.unlink(path.join(directory, file), (err) => {
            if (err) return err;
          });
        }
      });
      return url;
    })
    .catch((err) => {
      return err; //handle error here
    });
};

module.exports = { uploadToPinata };
