const swaggerSmktest = require("../src/services/swaggerSmktest");

test("Edutelling: BasicWithAuth Swagger ", async () => {
  //! Is possible use /api-docs

  let options = {
    tokenConfig: {
      curlRequest: `curl -X POST "https://edutelling-api-develop.openshift.techgap.it/api/v1/auth/authentication" -H "accept: application/json" -H "Content-Type: application/json" -d '{ \"email\": \"formazione@edutelling.it\", \"password\": \"Passw0rd\", \"stayLogged\": false }'`,
      tokenVariableName: "token",
      headers: {
        "Content-Type": "application/json",
        "accept-language": "en",
        Authorization: "Bearer TOKEN",
      },
    },
  };

  let {
    successSmokeTest,
    report,
    abstractReport,
  } = await swaggerSmktest.smokeTest(
    "basicWithAuth",
    "https://edutelling-api-develop.openshift.techgap.it/api/v1/api-docs/",
    options
  );

  // Print table reports
  console.log(report.render());
  console.log(abstractReport.render());

  expect(successSmokeTest).toBe(false);
}, 100000);
