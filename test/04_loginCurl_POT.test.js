const swaggerSmktest = require("../src/services/swaggerSmktest");
const dotenv = require("dotenv");
dotenv.config();

//TODO if have one error is beacouse the load of preview have problema. Need change other view before.
test("Login POT Swagger smoke-testing with Jest", async () => {
  //! Is possible use /api-docs

  let options = {
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
  } = await swaggerSmktest.smokeTest(
    "https://pot-uat.paxitalia.com:8443/api/v2/api-docs",
    options
  );

  console.log(report.render());
  console.log(abstractReport.render());

  expect(successSmokeTest).toBe(true);
}, 10000);
