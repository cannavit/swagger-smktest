const shell = require("shelljs");

// function sleep(milliseconds) {
//   const date = Date.now();
//   let currentDate = null;
//   do {
//     currentDate = Date.now();
//   } while (currentDate - date < milliseconds);
// }

async function getPreview(urlSwagger) {
  //! Init swagger page:
  // let ENDPOINT_SWAGGER_PAGE = `curl -XPOST -H \"accept-language: it\" -H \"Content-type: application/json\" '${urlSwagger}'`;
  //   await shell.exec(ENDPOINT_SWAGGER_PAGE, { silent: true });
  //   sleep(500);

  let ENDPOINT_SCANN_SWAGGER_FROM = `curl -XPOST -H \"accept-language: it\" -H \"Content-type: application/json\" '${urlSwagger}/swagger-ui-init.js'`,
    resultOfExec = await shell.exec(ENDPOINT_SCANN_SWAGGER_FROM, {
      silent: true,
    });

  var swaggerFile = resultOfExec.stdout;
  var searchInit = swaggerFile.indexOf("var options");
  var searchEnd = swaggerFile.indexOf("url = options.swaggerUrl || url");
  var bodySwagger = swaggerFile.substring(searchInit, searchEnd);

  return bodySwagger;
}

//! Run shell commands:
// This Automatic Test is for the basic level:
// Basic level:
//   Only Api type:  GET
//   Parameters: Not-required

async function getBasicApi(urlSwagger) {
  //
  //Get Json Swagger preview
  let bodySwagger = await getPreview(urlSwagger);

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
      //
      pathsForTest.push(pathsName[key]);
      responseList.push(path_i["get"].responses);
      apiList.push("GET");
    }
  }

  return {
    pathsForTest: pathsForTest,
    responseList: responseList,
    apiList: apiList,
  };
}

module.exports.getPreview = getPreview;
module.exports.getBasicApi = getBasicApi;
