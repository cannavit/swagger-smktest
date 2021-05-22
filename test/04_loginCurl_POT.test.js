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
  } = await swaggerSmktest.smokeTest(process.env.TEST04, options);

  console.log(report.render());
  console.log(abstractReport.render());

  expect(successSmokeTest).toBe(true);
}, 160000000);
