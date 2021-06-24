const swaggerSmktest = require("./src/services/swaggerSmktest");

async function test(options) {
  let urlSwagger = "https://pot-uat.paxitalia.com:8443/api/v2/api-docs";
  // let urlSwagger = "https://petstore.swagger.io/v2/swagger.json";
  // https://pot-uat.paxitalia.com:8443/api/v2/api-docs

  options = {
    tokenConfig: {
      curlRequest: process.env.CURLTEST04,
    },
  };

  let {
    responseOfRequest,
    coverage,
    successSmokeTest,
    report,
    abstractReport,
  } = await swaggerSmktest.smokeTest(urlSwagger, options);

  console.log(report.render());
  console.log(abstractReport.render());

  //  expect(successSmokeTest).toBe(true);

  return options;
}
// const https = require("https");
// const axios = require("axios");

// async function test(options) {
//   console.log("@1Marker-No:_354467327");
//   let api = "https://pot-uat.paxitalia.com:8443/api/public/rma-ship-form";

//   let response;

//   axios.defaults.httpsAgent = new https.Agent({
//     rejectUnauthorized: false,
//   });
//   try {
//     response = await axios.get(api, {
//       timeout: 10500,
//     });
//   } catch (error) {
//     console.log(error);
//   }

//   console.log(">>>>>-183511179>>>>>");
//   console.log(response);
//   console.log("<<<<<<<<<<<<<<<<<<<");
//   return options;
// }
test();
