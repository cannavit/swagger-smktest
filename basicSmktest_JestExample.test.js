const swaggerSmktest = require("./src/services/swaggerSmktest");

test("Basic Swagger smoke-testing with Jest", async () => {
  //! Is possible use /api-docs

  let urlSwagger =
    "https://edutelling-api-develop.openshift.techgap.it/api/v1/api-docs/";

  //! Its possible use /swagger.json
  // let urlSwagger = "https://petstore.swagger.io/v2/swagger.json";
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
