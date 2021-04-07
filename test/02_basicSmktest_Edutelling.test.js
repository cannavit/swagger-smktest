const swaggerSmktest = require("../src/services/swaggerSmktest");
//TODO if have one error is beacouse the load of preview have problema. Need change other view before.
test("Basic Swagger smoke-testing with Jest", async () => {
  //! Is possible use /api-docs

  let urlSwagger =
    "https://edutelling-api-develop.openshift.techgap.it/api/v1/api-docs/";

  //! Its possible use /swagger.json
  let smktestCriterial = "basic";

  let {
    responseOfRequest,
    coverage,
    successSmokeTest,
    report,
    abstractReport,
  } = await swaggerSmktest.smokeTest(smktestCriterial, urlSwagger);

  console.log(report.render());
  console.log(abstractReport.render());

  expect(successSmokeTest).toBe(false);
});
