// create-smktest --check-swagger-apis=https://edutelling-api-develop.openshift.techgap.it/api/v1/api-docs/ --swagger-login-curl='curl -X POST "https://edutelling-api-develop.openshift.techgap.it/api/v1/auth/authentication" -H "accept: application/json" -H "Content-Type: application/json" -d "{ \"email\": \"formazione@edutelling.it\", \"password\": \"Passw0rd\", \"stayLogged\": false }"'
const swaggerSmktest = require("./src/services/swaggerSmktest");

require("dotenv").config();

async function test() {
  // let SWAGGER_LOGIN_CURL=curl -X POST "https://edutelling-api-develop.openshift.techgap.it/api/v1/auth/authentication" -H "accept: application/json" -H "Content-Type: application/json" -d "{ \"email\": \"formazione@edutelling.it\", \"password\": \"Passw0rd\", \"stayLogged\": false }"
  let swaggerLoginCurl = process.env.SMKTEST_SWAGGER_LOGIN_CURL;
  let checkSwaggerApis = process.env.SMKTEST_CHECK_SWAGGER_APIS;

  // let swaggerLoginCurl = `curl -X POST "https://edutelling-api-develop.openshift.techgap.it/api/v1/auth/authentication" -H "accept: application/json" -H "Content-Type: application/json" -d "{ \"email\": \"formazione@edutelling.it\", \"password\": \"Passw0rd\", \"stayLogged\": false }"`;

  let options = {
    tokenConfig: {
      curlRequest: swaggerLoginCurl,
    },
  };

  let {
    responseOfRequest,
    coverage,
    successSmokeTest,
    report,
    abstractReport,
  } = await swaggerSmktest.smokeTest(checkSwaggerApis, options);

  console.log(report.render());
  console.log(abstractReport.render());
}

test();
