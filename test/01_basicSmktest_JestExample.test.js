const swaggerSmktest = require("../src/services/swaggerSmktest");

test("Basic Swagger smoke-testing with Jest", async () => {
  //! Its possible use /swagger.json

  let urlSwagger = "https://petstore.swagger.io/v2/swagger.json";
  let smktestCriterial = "basic";

  let {
    responseOfRequest,
    coverage,
    successSmokeTest,
    report,
    abstractReport,
  } = await swaggerSmktest.smktestBasic(smktestCriterial, urlSwagger);

  console.log(report.render());
  console.log(abstractReport.render());

  expect(successSmokeTest).toBe(true);
});
