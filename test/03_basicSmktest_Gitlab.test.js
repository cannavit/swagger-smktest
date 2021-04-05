const swaggerSmktest = require("../src/services/swaggerSmktest");

test("Basic Swagger smoke-testing with Gitlab apis", async () => {
  //! Is possible use /api-docs

  let urlSwagger = "https://axil.gitlab.io/swaggerapi/static/swagger.json";
  let smktestCriterial = "basic";

  //! Add options confiugrations for this case
  let option = {
    host: "https://gitlab.com",
  };

  let {
    responseOfRequest,
    coverage,
    successSmokeTest,
    report,
    abstractReport,
  } = await swaggerSmktest.smktestBasic(smktestCriterial, urlSwagger, option);

  console.log(report.render());
  console.log(abstractReport.render());

  expect(successSmokeTest).toBe(true);
}, 400000);
