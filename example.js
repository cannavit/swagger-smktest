const swaggerScann = require("./src/services/swaggerScann");

// This Automatic Test is for the basic level:
//   Basic level:
//     Only Api type:  GET
//     Parameters: Not-require
async function getSwaggerJson(urlSwagger) {
  let simpleApis = await swaggerScann.getBasicApi(urlSwagger);

  console.log(simpleApis);
}

let urlSwagger =
  "https://edutelling-api-develop.openshift.techgap.it/api/v1/api-docs/";
getSwaggerJson(urlSwagger);
