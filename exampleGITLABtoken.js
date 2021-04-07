const swaggerSmktest = require("./src/services/swaggerSmktest");

//! Using Login Access"

async function test() {
  let urlSwagger = "https://axil.gitlab.io/swaggerapi/static/swagger.json";

  let options = {
    host: "https://gitlab.com",
    changeInsideApiRequest: [
      {
        this: "v3",
        by: "v4",
      },
    ],
  };

  let tokenConfig = {
    headers: {
      "Private-Token": "kYcVQo1bHGUz1t8SPpPm",
    },
  };

  options.tokenConfig = tokenConfig;

  let {
    successSmokeTest,
    report,
    abstractReport,
  } = await swaggerSmktest.smokeTest("basic", urlSwagger, options);

  // Print table reports
  console.log(report.render());
  console.log(abstractReport.render());

  // Jest asserts declaration:
}

test();
