const shell = require("shelljs");
const axios = require("axios");
const Table = require("tty-table");

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

async function processDataOfresultOfExec(options) {
  let resultOfExec = options.resultOfExec;

  try {
    // bodySwagger = JSON.stringify(resultOfExec); //TODO check it

    let bodySwagger = JSON.parse(resultOfExec);

    let isSwaggerJson = true;

    if (!options.processSwaggerData) {
      options.processSwaggerData = {};
    }

    options.processSwaggerData.bodySwagger = bodySwagger;
    options.processSwaggerData.isSwaggerJson = isSwaggerJson;
  } catch (error) {
    console.log("@1Marker-No:_1507067606");
  }

  return options;
}
async function swaggerNotHaveJson(options) {
  //? Case edutelling.

  //!Check first edutelling format.
  let ENDPOINT_SCANN_SWAGGER_FROM = `curl -XGET -H \"accept-language: it\" -H \"Content-type: application/json\" '${options.urlSwagger}/swagger-ui-init.js'`;

  let resultOfExec = await shell.exec(ENDPOINT_SCANN_SWAGGER_FROM, {
    silent: true,
  });

  if (resultOfExec.stdout.length > 400) {
    options.resultOfExec = resultOfExec;
    options = processDataOfresultOfExec(options);
  }

  // NOT USE SWAGGER LIBRARY

  return options;
}

async function swaggerHaveJson(options) {
  let ENDPOINT_SCANN_SWAGGER_FROM = `curl -XGET -H \"accept-language: en\" -H \"Content-type: application/json\" '${options.urlSwagger}'`;

  options.resultOfExec = await shell.exec(ENDPOINT_SCANN_SWAGGER_FROM, {
    silent: true,
  });

  //! URL SWAGGER DIRECT
  options = processDataOfresultOfExec(options);

  return options;
}

async function getPreview(options) {
  //
  //! Init swagger page:

  return await swaggerNotHaveJson(options)
    .then(async (options) => {
      if (!options.resultOfExec) {
        ENDPOINT_SCANN_SWAGGER_FROM = `curl -XGET -H \"accept-language: it\" -H \"Content-type: application/json\" '${urlSwagger}'`;

        options.resultOfExec = await shell.exec(ENDPOINT_SCANN_SWAGGER_FROM, {
          silent: true,
        });

        options = processDataOfresultOfExec(options);
      }

      return options;
    })
    .then((options) => {
      //! Is not is swagger.json format.

      let swaggerFile = options.resultOfExec.stdout;
      let searchInit = swaggerFile.indexOf("var options");

      if (searchInit !== -1) {
        searchEnd = swaggerFile.indexOf("url = options.swaggerUrl || url");
        bodySwagger = swaggerFile.substring(searchInit, searchEnd);
        isSwaggerJson = false;

        if (!options.processSwaggerData) {
          options.processSwaggerData = {};
        }
        options.processSwaggerData.swaggerFile = options.resultOfExec.stdout;
        options.processSwaggerData.searchInit = searchInit;
        options.processSwaggerData.searchEnd = searchEnd;
        options.processSwaggerData.bodySwagger = bodySwagger;
        options.processSwaggerData.resultOfExec = options.resultOfExec;
      }

      return options;
    })
    .then((options) => {
      //? Get original swagger format
      //! ***** Swagger with json file here>

      if (options.resultOfExec.stdout === "") {
        options = swaggerHaveJson(options);
      }

      return options;
    });
}

async function getHeaders(headers, token) {
  for (const key in headers) {
    headers[key] = headers[key].replace("TOKEN", token);
  }
  return headers;
}
//! Run shell commands:
// This Automatic Test is for the basic level:
// Basic level:
//   Only Api type:  GET
//   Parameters: Not-required

async function getBasicApi(options) {
  urlSwagger = options.urlSwagger;

  options = await getPreview(options);

  let bodySwagger = options.processSwaggerData.bodySwagger;
  let isSwaggerJson = options.processSwaggerData.isSwaggerJson;

  let paths, host, basePath;

  if (!isSwaggerJson) {
    eval(bodySwagger); // Get variable options.

    try {
      paths = options.swaggerDoc.paths;
      basePath = options.swaggerDoc.basePath;
      host = urlSwagger.substr(0, urlSwagger.search(basePath));

      //! Select the host if not exist inside to the option:
      if (!options.host) {
        host = host.substr(urlSwagger.search("//") + 2, host.length);
      } else {
        host = options.host;
      }
    } catch (error) {
      paths = [];
    }
  } else {
    paths = bodySwagger.paths;

    //! Select the host if not exist inside to the option:
    if (!options.host) {
      host = bodySwagger.host;
    } else {
      host = options.host;
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

async function simpleRequest(
  api,
  swaggerApis,
  key,
  options = {
    host,
    changeInsideApiRequest,
    token: {},
    tokenConfig: { headerTokenVariableName: undefined, headers: undefined },
  }
) {
  let { pathsForTest, responseList, apiList, host, basePath } = swaggerApis;

  //! Api CURL:
  let apiVerb = apiList[key];

  let response, responseOutput, passTest, color;
  let successTest = true;

  try {
    //Change request api from changeInsideApiRequest

    if (options.changeInsideApiRequest) {
      for (const key in options.changeInsideApiRequest) {
        let change = options.changeInsideApiRequest[key];
        api = api.replace(change.this, change.by);
      }
    }

    //! If headers exist:

    if (options.token) {
      let headers = await getHeaders(
        options.tokenConfig.headers,
        options.token
      );

      //! If exist token

      if (headers) {
        //! Using Header configurations:

        // timeout: 5500,
        response = await axios.get(api, {
          headers: headers,
          timeout: 6500,
        });
      }
    } else {
      response = await axios.get(api, {
        timeout: 5500,
      });
    }

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

async function getBasicResponse(options) {
  //
  let urlSwagger = options.urlSwagger;

  let swaggerApis = await getBasicApi(options);
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
    let api, data;

    if (!options.host) {
      api = "https://" + host + basePath + pathsForTest[key];
    } else {
      api = host + basePath + pathsForTest[key];
    }

    data = await simpleRequest(api, swaggerApis, key, options);

    successTest = data.successTest;
    responseOutput = data.responseOutput;

    if (responseOutput.status === 600) {
      api = "http://" + host + basePath + pathsForTest[key];
      data = await simpleRequest(api, swaggerApis, key, options);

      successTest = data.successTest;
      responseOutput = data.responseOutput;
    }

    if (!successTest) {
      successSmokeTest = false;
    }

    responseOfRequest.push(responseOutput);
  }

  //! Try to exec SmokeTest:

  options.basicResponse = {
    responseOfRequest: responseOfRequest,
    coverage: coverage,
    successSmokeTest: successSmokeTest,
    totalApis: totalApis,
    numberBasicApis: numberBasicApis,
    host: host,
  };

  return options;
}

async function reportSmokeTest(responseOfRequest, smktestAbstract) {
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

  let report = Table(header, responseOfRequest);

  let header2 = [
    { value: "nameVarialbe", width: 30, alias: "Reports", align: "left" },
    { value: "value", width: 40, alias: "Value", align: "left" },
  ];

  let abstractReport = Table(header2, smktestAbstract);

  return { report, abstractReport };
}

async function getToken(options) {
  let tokenVariable, tokenValue, token, bearerVariable;
  let bearerValue = "";
  if (options.tokenConfig) {
    let shellResult = await shell.exec(options.tokenConfig.curlRequest, {
      silent: true,
    });

    let shellResultsJson = JSON.parse(shellResult.stdout);

    let nameKey = Object.keys(shellResultsJson);

    for (const key in nameKey) {
      let name = nameKey[key];
      let value = shellResultsJson[name];

      if (value.length > 100) {
        tokenVariable = name;
        tokenValue = value;
      }

      try {
        if (value.toLowerCase() === "bearer") {
          bearerVariable = name;
          bearerValue = value;
        }
      } catch (error) {
        errorDetected = true;
      }
    }
  }

  options.tokenObj = {
    tokenValue: tokenValue,
    tokenVariable: tokenVariable,
    bearerValue: bearerValue,
    bearerVariable: bearerVariable,
  };

  return options;
}

async function smokeTest(smktestCriterial, urlSwagger, options) {
  //
  let responseOfRequest,
    coverage,
    successSmokeTest,
    totalApis,
    numberBasicApis,
    report,
    abstractReport,
    data,
    host,
    dataReport,
    token;

  if (!options) {
    options = {};
  }

  options.urlSwagger = urlSwagger;
  options.smktestCriterial = smktestCriterial;

  if (smktestCriterial === "basic") {
    // Basic Criterial

    options.urlSwagger = urlSwagger;

    options = await getBasicResponse(options);

    responseOfRequest = options.basicResponse.responseOfRequest;
    coverage = options.basicResponse.coverage;
    successSmokeTest = options.basicResponse.successSmokeTest;
    totalApis = options.basicResponse.totalApis;
    numberBasicApis = options.basicResponse.numberBasicApis;
    host = options.basicResponse.host;

    //! Create report
  } else if (smktestCriterial === "basicWithAuth") {
    //! Get Token

    options = await getToken(options);
    options.token = options.tokenObj.tokenValue;

    options = await getBasicResponse(options);

    responseOfRequest = options.basicResponse.responseOfRequest;
    coverage = options.basicResponse.coverage;
    successSmokeTest = options.basicResponse.successSmokeTest;
    totalApis = options.basicResponse.totalApis;
    numberBasicApis = options.basicResponse.numberBasicApis;
    host = options.basicResponse.host;
  }

  //! SmokeTest abstract report:
  let smktestAbstract = [
    { nameVarialbe: "SmokeTest criterial", value: smktestCriterial },
    { nameVarialbe: "Host", value: host },
    { nameVarialbe: "Number of Cases", value: totalApis },
    { nameVarialbe: "Number of cases processed", value: numberBasicApis },
    { nameVarialbe: "Test Coverage", value: coverage.toFixed(4) },
    { nameVarialbe: "Pass SmokeTest", value: String(successSmokeTest) },
  ];

  dataReport = await reportSmokeTest(responseOfRequest, smktestAbstract);
  report = dataReport.report;
  abstractReport = dataReport.abstractReport;

  return {
    successSmokeTest,
    responseOfRequest,
    coverage,
    report,
    abstractReport,
    token,
  };
}

// async function trainSmokeTest(smktestCriterial, urlSwagger, options = {}) {
async function trainSmokeTest() {
  //!

  // //! TEST 01 ---- >>>>
  // let data = await smokeTest(
  //   "basic",
  //   "https://petstore.swagger.io/v2/swagger.json"
  // );
  // //! <<<<<

  let data = await smokeTest(
    "basic",
    "https://edutelling-api-develop.openshift.techgap.it/api/v1/api-docs/"
  );

  // let optionsSwagger = {
  //   tokenConfig: {
  //     curlRequest: `curl -X POST "https://edutelling-api-develop.openshift.techgap.it/api/v1/auth/authentication" -H "accept: application/json" -H "Content-Type: application/json" -d '{ \"email\": \"formazione@edutelling.it\", \"password\": \"Passw0rd\", \"stayLogged\": false }'`,
  //     tokenVariableName: "token",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "accept-language": "en",
  //       Authorization: "Bearer TOKEN",
  //     },
  //   },
  // };

  // let data = await smokeTest(
  //   "basicWithAuth",
  //   "https://edutelling-api-develop.openshift.techgap.it/api/v1/api-docs/",
  //   optionsSwagger
  // );

  // let optionsSwagger = {
  //   tokenConfig: {
  //     curlRequest:
  //       'curl -X POST "https://pot-uat.paxitalia.com:8443/api/public/auth/signin" -H "accept: */*" -H "Content-Type: application/json" -d "{ \\"password\\": \\"AdminPOT\\", \\"usernameOrEmail\\": \\"AdminPOT\\"}"',
  //     tokenVariableName: "token",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "accept-language": "en",
  //       Authorization: "Bearer TOKEN",
  //     },
  //   },
  // };

  // let data = await smokeTest(
  //   "basicWithAuth",
  //   "https://pot-uat.paxitalia.com:8443/api/v2/api-docs",
  //   optionsSwagger
  // );

  // console.log(">>>>>1078952754>>>>>");
  // console.log(data);
  // console.log("<<<<<<<<<<<<<<<<<<<");
  //! >>>>>>>>>>>>>>>

  // let data = await smokeTest(smktestCriterial, urlSwagger, (options = {}));

  // let trainData = [];

  // for (const key in data.responseOfRequest) {
  //   element = data.responseOfRequest[key];

  //   let dataElement = {
  //     type: "swaggerSmkTest",
  //     level: smktestCriterial,
  //     apiVerb: element.requestMethod,
  //     apiTest: element.requestUrl,
  //     assertStatusCode: element.status,
  //     passTrainingTest: element.passTest,
  //     trainingResponse: element.data,
  //   };

  //   trainData.push(dataElement);
  // }

  // return trainData;
}

module.exports.getPreview = getPreview;
module.exports.getBasicApi = getBasicApi;
module.exports.getBasicResponse = getBasicResponse;
module.exports.simpleRequest = simpleRequest;
module.exports.smokeTest = smokeTest;
module.exports.trainSmokeTest = trainSmokeTest;

trainSmokeTest();
