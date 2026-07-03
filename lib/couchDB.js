require("dotenv").config();
const Cloudant = require("@cloudant/cloudant");

const cloudant = Cloudant({
  url: `https://${process.env.CLOUDANT_HOST}`,
  plugins: { iamauth: { iamApiKey: process.env.CLOUDANT_APIKEY } },
});

module.exports = cloudant;
