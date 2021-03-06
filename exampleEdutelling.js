const swaggerSmktest = require("./src/services/swaggerSmktest");

async function test(options) {
  let urlSwagger =
    "https://edutelling-api-develop.openshift.techgap.it/api/v1/api-docs/";

  let {
    responseOfRequest,
    coverage,
    successSmokeTest,
    report,
    abstractReport,
  } = await swaggerSmktest.smokeTest(urlSwagger);

  console.log(report.render());

  // console.log(abstractReport.render());

  return options;
}

test();
