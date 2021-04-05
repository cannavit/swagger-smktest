const swaggerSmktest = require("../src/services/swaggerSmktest");

test("Basic Swagger smoke-testing with Gitlab apis", async () => {
  //! Is possible use /api-docs

  let urlSwagger = "https://axil.gitlab.io/swaggerapi/static/swagger.json";
  let smktestCriterial = "basic";

  //! Add options confiugrations for this case
  let options = {
    host: "https://gitlab.com",
  };

  let {
    successSmokeTest,
    report,
    abstractReport,
  } = await swaggerSmktest.smktestBasic(smktestCriterial, urlSwagger, options);

  // Print table reports
  console.log(report.render());
  console.log(abstractReport.render());

  // Jest asserts declaration:
  expect(successSmokeTest).toBe(true);
}, 400000);
