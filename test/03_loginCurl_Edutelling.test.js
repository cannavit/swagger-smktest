const swaggerSmktest = require("../src/services/swaggerSmktest");
const dotenv = require("dotenv");
dotenv.config();

//TODO if have one error is beacouse the load of preview have problema. Need change other view before.
test("Login Swagger smoke-testing with Jest", async () => {
  //! Is possible use /api-docs

  let options = {
    tokenConfig: {
      curlRequest: process.env.CURL03,
    },
  };

  let {
    responseOfRequest,
    coverage,
    successSmokeTest,
    report,
    abstractReport,
  } = await swaggerSmktest.smokeTest(process.env.TEST02_URL, options);

  console.log(report.render());
  console.log(abstractReport.render());

  expect(successSmokeTest).toBe(false);
}, 800000);
