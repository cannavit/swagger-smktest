const shell = require("shelljs");
const axios = require("axios");

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

  let urlSwaggerJson = urlSwagger.search("swagger.json");

  let ENDPOINT_SCANN_SWAGGER_FROM,
    swaggerFile,
    searchInit,
    searchEnd,
    bodySwagger,
    isSwaggerJson;

  if (urlSwaggerJson === -1) {
    //? If the URL get not content swagger.json

    ENDPOINT_SCANN_SWAGGER_FROM = `curl -XGET -H \"accept-language: it\" -H \"Content-type: application/json\" '${urlSwagger}/swagger-ui-init.js'`;

    resultOfExec = await shell.exec(ENDPOINT_SCANN_SWAGGER_FROM, {
      silent: true,
    });

    swaggerFile = resultOfExec.stdout;
    searchInit = swaggerFile.indexOf("var options");
    searchEnd = swaggerFile.indexOf("url = options.swaggerUrl || url");
    bodySwagger = swaggerFile.substring(searchInit, searchEnd);

    isSwaggerJson = false;
  } else {
    //
    ENDPOINT_SCANN_SWAGGER_FROM = `curl -XGET -H \"accept-language: en\" -H \"Content-type: application/json\" '${urlSwagger}'`;

    resultOfExec = await shell.exec(ENDPOINT_SCANN_SWAGGER_FROM, {
      silent: true,
    });

    bodySwagger = JSON.stringify(resultOfExec);
    bodySwagger = JSON.parse(resultOfExec);
    isSwaggerJson = true;
  }

  return { bodySwagger: bodySwagger, isSwaggerJson: isSwaggerJson };
}

//! Run shell commands:
// This Automatic Test is for the basic level:
// Basic level:
//   Only Api type:  GET
//   Parameters: Not-required

async function getBasicApi(urlSwagger) {
  //
  //Get Json Swagger preview
  let { bodySwagger, isSwaggerJson } = await getPreview(urlSwagger);

  let paths, host, basePath;

  if (!isSwaggerJson) {
    //
    eval(bodySwagger); // Get variable options.

    try {
      paths = options.swaggerDoc.paths;
      basePath = options.swaggerDoc.basePath;
      host = urlSwagger.substr(0, urlSwagger.search(basePath));
      host = host.substr(urlSwagger.search("//") + 2, host.length);
    } catch (error) {
      paths = [];
    }
  } else {
    paths = bodySwagger.paths;
    host = bodySwagger.host;
    basePath = bodySwagger.basePath;
  }

  //! Rule, search [GET] Apis with not parmams.

  var pathsName = Object.keys(paths);
  var pathsForTest = [];
  var responseList = [];
  var apiList = [];
  var totalApis = 0;
  var numberBasicApis = 0;
  //
  for (const key in pathsName) {
    //
    totalApis = totalApis + 1;
    let pathI = paths[pathsName[key]];

    if (Object.keys(pathI)[0] === "get" && pathsName[key].search("{") === -1) {
      //
      pathsForTest.push(pathsName[key]);
      responseList.push(pathI["get"].responses);
      apiList.push("GET");
      numberBasicApis = numberBasicApis + 1;
      //
    }
  }
  100 - 10;
  90;
  let coverage = 1 - (totalApis - numberBasicApis) / totalApis;

  return {
    pathsForTest: pathsForTest,
    responseList: responseList,
    apiList: apiList,
    host: host,
    basePath: basePath,
    totalApis: totalApis,
    numberBasicApis: numberBasicApis,
    coverage: coverage,
  };
}

async function simpleRequest(api, swaggerApis, key) {
  //
  let { pathsForTest, responseList, apiList, host, basePath } = swaggerApis;

  //! Api CURL:
  let apiVerb = apiList[key];

  let response, responseOutput, passTest, color;
  try {
    // response = await axios.get(api);
    response = await axios.get(api, {
      timeout: 500,
    });

    responseOutput = {
      data: JSON.stringify(response.data).substr(0, 200),
      status: response.status,
      statusText: response.statusText,
      requestUrl: response.config.url,
      requestMethod: response.config.method,
    };
  } catch (error) {
    response = error.response;

    try {
      responseOutput = {
        data: JSON.stringify(response.data),
        status: response.status,
        statusText: response.statusText,
        requestUrl: response.config.url,
        requestMethod: response.config.method,
      };
    } catch (error) {
      response = { config: { requestUrl: api, requestMethod: apiVerb } };
      response.data = "Internal Library error";
      response.status = 600;
      response.statusText = "Error in smokeTest request";
      response.requestUrl = api;
      response.requestMethod = apiVerb;

      responseOutput = {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        requestUrl: api,
        requestMethod: apiVerb,
      };
    }
  }
  // console.log(response);
  if (String(responseOutput.status).includes("20")) {
    passTest = "true";
    color = "success";
  } else if (String(responseOutput.status).includes("40")) {
    passTest = "true";
    color = "warning";
  } else if (String(responseOutput.status).includes("50")) {
    passTest = "false";
    color = "alert";
  } else if (String(responseOutput.status).includes("60")) {
    passTest = "null";
    color = "libraryError";
  }

  responseOutput.passTest = passTest;
  responseOutput.color = color;

  return responseOutput;
}

// const https = require("https");
// This Automatic Test is for the basic level
//   Basic level:
//     Only Api type:  GET
//     Parameters: Not-require

async function getBasicResponse(urlSwagger) {
  //
  let swaggerApis = await getBasicApi(urlSwagger);

  let {
    pathsForTest,
    responseList,
    apiList,
    host,
    basePath,
    totalApis,
    numberBasicApis,
    coverage,
  } = swaggerApis;

  let responseOfRequest = [];

  for (const key in responseList) {
    //! Api address with https:
    let api = "https://" + host + basePath + pathsForTest[key];
    let responseOutput = await simpleRequest(api, swaggerApis, key);

    if (responseOutput.status === 600) {
      api = "http://" + host + basePath + pathsForTest[key];
      responseOutput = await simpleRequest(api, swaggerApis, key);
    }
    responseOfRequest.push(responseOutput);
  }

  // console.log(responseOfRequest);
  //! Try to exec SmokeTest:
  return { responseOfRequest, coverage };
}

module.exports.getPreview = getPreview;
module.exports.getBasicApi = getBasicApi;
module.exports.getBasicResponse = getBasicResponse;
module.exports.simpleRequest = simpleRequest;
