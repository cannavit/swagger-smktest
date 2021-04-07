const swaggerSmktest = require("./src/services/swaggerSmktest");

test("Basic Swagger smoke-testing with Gitlab apis from localhost", async () => {
  //! Is possible use /api-docs

  let urlSwagger = "https://axil.gitlab.io/swaggerapi/static/swagger.json";
  let smktestCriterial = "basic";

  //! Add options confiugrations for this case
  let options = {
    host: "https://gitlab.com",
    changeInsideApiRequest: [
      {
        this: "v3",
        by: "v4",
      },
    ],
  };

  option.tokenConfig = {
    headers: {
      "Private-Token": "kYcVQo1bHGUz1t8SPpPm",
    },
  };

  let {
    successSmokeTest,
    report,
    abstractReport,
  } = await swaggerSmktest.smokeTest(smktestCriterial, urlSwagger, options);

  // Print table reports
  console.log(report.render());
  console.log(abstractReport.render());

  // Jest asserts declaration:
  expect(successSmokeTest).toBe(true);
}, 800000);
