const swaggerSmktest = require("./src/services/swaggerSmktest");

//! Its possible use /swagger.json

async function test() {
  let urlSwagger = "https://axil.gitlab.io/swaggerapi/static/swagger.json";
  let smktestCriterial = "basic";

  //! Add options confiugrations for this case
  let option = {
    host: "https://gitlab.com",
  };

  //   let data = await swaggerSmktest.getPreview(urlSwagger);
  let {
    responseOfRequest,
    coverage,
    successSmokeTest,
    report,
    abstractReport,
  } = await swaggerSmktest.smktestBasic("basic", urlSwagger, option);

  // let data = await swaggerSmktest.getPreview(urlSwagger);

  console.log(report.render());
  console.log(abstractReport.render());
}

test();