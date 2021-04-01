//

// const checkLogs = require("../service/testLibrary/checkLogs");
// const tc = require("timezonecomplete");
// const Table = require("tty-table");
// var colors = require("colors");

const getConfigVariable_ENV = require("./getConfigVariable");

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

let ENDPOINT_SWAGGER_PAGE =
  "https://edutelling-api-develop.openshift.techgap.it/api/v1/api-docs/swagger-ui-init.js";

//! Run shell commands:
async function scanner() {
  const {
    ENDPOINT_SWAGGER_PAGE,
    ENDPOINT_SCANN_SWAGGER_FROM,
  } = await getConfigVariable_ENV.ConfigCommands();

  //! Init swagger page:
  // var ENDPOINT_SWAGGER_PAGE = global.config.ENDPOINT_SWAGGER_PAGE
  await shell.exec(ENDPOINT_SWAGGER_PAGE, { silent: true });
  sleep(1000);

  // var ENDPOINT_SCANN_SWAGGER_FROM = global.config.ENDPOINT_SCANN_SWAGGER_FROM
  resultOfExec = await shell.exec(ENDPOINT_SCANN_SWAGGER_FROM, {
    silent: true,
  });

  var swaggerFile = resultOfExec.stdout;
  var searchInit = swaggerFile.indexOf("var options");
  var searchEnd = swaggerFile.indexOf("url = options.swaggerUrl || url");
  var bodySwagger = swaggerFile.substring(searchInit, searchEnd);

  eval(bodySwagger); // Get variable options.

  var paths;
  try {
    paths = options.swaggerDoc.paths;
  } catch (error) {
    paths = [];
  }

  //! Rule, serach [GET] Apis with not parmams.

  var pathsName = Object.keys(paths);
  var pathsForTest = [];
  var responseList = [];
  var apiList = [];
  for (const key in pathsName) {
    path_i = paths[pathsName[key]];
    if (Object.keys(path_i)[0] === "get" && pathsName[key].search("{") === -1) {
      pathsForTest.push(pathsName[key]);
      responseList.push(path_i["get"].responses);
      apiList.push("GET");
    }
  }

  let outData = {
    pathsForTest: pathsForTest,
    responseList: responseList,
    apiList: apiList,
  };
  return outData;
}
