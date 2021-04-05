const shell = require("shelljs");
const axios = require("axios");
const Table = require("tty-table");

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
    //
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

async function getBasicApi(urlSwagger, option = { host: undefined }) {
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

      //! Select the host if not exist inside to the option:
      if (!option.host) {
        host = host.substr(urlSwagger.search("//") + 2, host.length);
      } else {
        host = option.host;
      }
    } catch (error) {
      paths = [];
    }
  } else {
    paths = bodySwagger.paths;

    //! Select the host if not exist inside to the option:
    if (!option.host) {
      host = bodySwagger.host;
    } else {
      host = option.host;
    }

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
  let successTest = true;

  try {
    response = await axios.get(api, {
      timeout: 1500,
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
  if (String(responseOutput.status).includes("20")) {
    passTest = "true";
    color = "success";
  } else if (String(responseOutput.status).includes("40")) {
    passTest = "true";
    color = "warning";
  } else if (String(responseOutput.status).includes("50")) {
    passTest = "false";
    successTest = false;

    color = "alert";
  } else if (String(responseOutput.status).includes("60")) {
    passTest = "null";
    color = "libraryError";
  }

  responseOutput.passTest = passTest;
  responseOutput.color = color;

  return { successTest, responseOutput };
}

// const https = require("https");
// This Automatic Test is for the basic level
//   Basic level:
//     Only Api type:  GET
//     Parameters: Not-require

async function getBasicResponse(urlSwagger, option = { host: undefined }) {
  //
  let swaggerApis = await getBasicApi(urlSwagger, option);
  let successSmokeTest = true;

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
  let successTest, responseOutput;

  for (const key in responseList) {
    //! Api address with https:
    let api;
    let data;

    if (!option.host) {
      api = "https://" + host + basePath + pathsForTest[key];
    } else {
      api = host + basePath + pathsForTest[key];
    }

    data = await simpleRequest(api, swaggerApis, key);

    successTest = data.successTest;
    responseOutput = data.responseOutput;

    if (responseOutput.status === 600) {
      api = "http://" + host + basePath + pathsForTest[key];
      data = await simpleRequest(api, swaggerApis, key);

      successTest = data.successTest;
      responseOutput = data.responseOutput;
    }

    if (!successTest) {
      successSmokeTest = false;
    }

    responseOfRequest.push(responseOutput);
  }

  //! Try to exec SmokeTest:
  return {
    responseOfRequest,
    coverage,
    successSmokeTest,
    totalApis,
    numberBasicApis,
    host,
  };
}

async function smktestBasic(smktestCriterial, urlSwagger, option) {
  //
  let responseOfRequest,
    coverage,
    successSmokeTest,
    totalApis,
    numberBasicApis,
    report,
    abstractReport;

  if (smktestCriterial === "basic") {
    // Basic Criterial
    let data = await getBasicResponse(urlSwagger, option);

    responseOfRequest = data.responseOfRequest;
    coverage = data.coverage;
    successSmokeTest = data.successSmokeTest;
    totalApis = data.totalApis;
    numberBasicApis = data.numberBasicApis;
    host = data.host;

    // Header:
    //! Cases Test report.
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
    report = t3;

    //! SmokeTest abstract report:
    let smktestAbstract = [
      { nameVarialbe: "SmokeTest criterial", value: smktestCriterial },
      { nameVarialbe: "Host", value: host },
      { nameVarialbe: "Number of Cases", value: totalApis },
      { nameVarialbe: "Number of cases processed", value: numberBasicApis },
      { nameVarialbe: "Test Coverage", value: coverage.toFixed(4) },
      { nameVarialbe: "Pass SmokeTest", value: String(successSmokeTest) },
    ];

    let header2 = [
      { value: "nameVarialbe", width: 30, alias: "Reports", align: "left" },
      { value: "value", width: 40, alias: "Value", align: "left" },
    ];
    abstractReport = Table(header2, smktestAbstract);
  }

  return {
    successSmokeTest,
    responseOfRequest,
    coverage,
    report,
    abstractReport,
  };
}

module.exports.getPreview = getPreview;
module.exports.getBasicApi = getBasicApi;
module.exports.getBasicResponse = getBasicResponse;
module.exports.simpleRequest = simpleRequest;
module.exports.smktestBasic = smktestBasic;
