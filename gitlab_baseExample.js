const swaggerSmktest = require("./src/services/swaggerSmktest");

test("Basic Swagger smoke-testing with Jest with gitlabnm", async () => {
  //! Is possible use /api-docs

  //! Its possible use /swagger.json
  let urlSwagger = "https://axil.gitlab.io/swaggerapi/static/swagger.json";
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
}, 100000);
