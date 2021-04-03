const swaggerSmktest = require("./src/services/swaggerSmktest");
const ora = require("ora");
const Table = require("tty-table");

let urlSwagger =
  "https://edutelling-api-develop.openshift.techgap.it/api/v1/api-docs/";

urlSwagger = "https://petstore.swagger.io/v2/swagger.json";

async function smktestBasic(report = false) {
  let { responseOfRequest, coverage } = await swaggerSmktest.getBasicResponse(
    urlSwagger
  );

  console.log(responseOfRequest);

  // Header:
  if (responseOfRequest && report) {
    let logsSpinner = ora(
      "Swagger SmokeTest with coverage: " + coverage
    ).start();
    logsSpinner.fail();
    let header = [
      { value: "requestUrl", width: 40, alias: "API", align: "left" },
      { value: "requestMethod", width: 10, alias: "api verbs" },
      { value: "status", width: 10, alias: "Status" },
      { value: "data", width: 50, alias: "Data Request", align: "left" },
      {
        alias: "Pass Test",
        value: "passTest",
        width: 15,
        color: "red",
        formatter: function (value) {
          if (value === "true") {
            value = this.style(value, "bgGreen", "black");
          } else if (value === "false") {
            value = this.style(value, "bgRed", "black");
          } else {
            value = this.style(value, "bgBlue", "white");
          }
          return value;
        },
      },
    ];
    const t3 = Table(header, responseOfRequest);
    console.log(t3.render());
  } else {
    logsSpinner.succeed();
  }
}

smktestBasic(true);
