const swaggerSmktest = require("./src/services/swaggerSmktest");

//! Its possible use /swagger.json

async function test() {
  let urlSwagger = "https://axil.gitlab.io/swaggerapi/static/swagger.json";
  let smktestCriterial = "basic";

  //! Add options confiugrations for this case
  let options = {
    host: "http://localhost:10080",
    changeInsideApiRequest: [
      {
        this: "v3",
        by: "v4",
      },
    ],
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
}

test();
