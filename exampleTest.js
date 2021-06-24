const shell = require("shelljs");
const axios = require("axios");
const Table = require("tty-table");
const https = require("https");

const curlirize = require("axios-curlirize");
curlirize(axios);

async function test(options) {
  console.log("@1Marker-No:_354467327");

  let api = "https://petstore.swagger.io/v2/user/logout";
  api = "https://petstore.swagger.io/v2/user/logout";

  axios.defaults.httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  console.log(api);
  response = await axios.get(api, {
    timeout: 105000,
  });

  console.log("@1Marker-No:_-962060285");
  return options;
}

test();
