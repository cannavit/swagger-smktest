const shell = require("shelljs");
const axios = require("axios");
const Table = require("tty-table");
const https = require("https");
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
  } catch (error) {}

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

// GET DOCUMENATATION DATA >>>>>>>>>>>>>>>>>
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>

async function getHeadersFromCURL(options, searchBy) {
  let curl = options.tokenConfig.curlRequest;

  //! Check if exist header:
  // let searchBy = "-H";
  let headerData = [];
  if (curl.includes(searchBy)) {
    curl = curl.substring(curl.search("-H"), curl.length - 1);
    curl = curl.split('"');

    let saveHeader = false;
    for (const key in curl) {
      const element = curl[key];

      if (saveHeader) {
        headerData.push(element);
        saveHeader = false;
      }
      if (element.replace(" ", "").replace(" ", "") === searchBy) {
        saveHeader = true;
      }
    }
  }

  //! Convert Header List in Object:
  let headerObj = {};
  for (const key in headerData) {
    const element = headerData[key];
    let data = element.split(":");
    headerObj[data[0].replace(" ", "")] = data[1].replace(" ", "");
  }

  //! Add token inside of the headers
  if (options.tokenObj.tokenVariable) {
    headerObj[options.tokenObj.tokenVariable] = options.token;
  } else {
    headerObj["Authorization"] = options.token;
  }

  options.headers = headerObj;

  return options;
}

async function getHeaders(options) {
  //! GET HEADERS:

  options = await getHeadersFromCURL(options, "-H");

  return options;
}
//! Run shell commands:

async function executeAxiosGetHeader(options) {
  let response = {};
  options.isAxiosError = false;

  try {
    response = await axios.get(options.api, {
      headers: options.headers,
      timeout: 6500,
    });
    options.response = response;
    options.isAxiosError = false;
  } catch (error) {
    options.response = error.response;
    options.isAxiosError = error.isAxiosError;
  }

  return options;
}

async function executeApiGETwithHeader(options) {
  return (
    executeAxiosGetHeader(options)
      //? Try request with Bearer
      .then(async (options) => {
        if (options.isAxiosError) {
          headers = options.headers;
          //! Try axios get respose with Bearer:
          headers.token = "Bearer " + options.headers.token;
          try {
            response = await axios.get(options.api, {
              headers: headers,
              timeout: 6500,
            });

            options.isAxiosError = false;
            options.response = response;
          } catch (error) {
            options.isAxiosError = error.isAxiosError;
            options.response = error.response;
          }
        }

        return options;
      })
      .then(async (options) => {
        //! With out Bearer
        // curl -X GET "https://pot-uat.paxitalia.com:8443/api/private/authorities" -H "accept: */*" -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjIxNjc5MDI5LCJleHAiOjE2MjE3MTE0MjksIlJPTEVTIjpbIlJPTEVfQ09NUEFOWV9BRE1JTiJdfQ.ZEDJA3FlyaQa7k9WdZdSfKAXeEI2P4_jBXm7biX7_dqj4_5HJsgXxDzKrd5YNRwE-tEKAH-6TpUe6zMviBcCbA"
        let requestStrategies = [
          { tokenName: "Authorization", useBearer: false, useHeader: true },
          { tokenName: "Authorization", useBearer: true, useHeader: true },
        ];

        axios.defaults.httpsAgent = new https.Agent({
          rejectUnauthorized: false,
        });

        for (const key in requestStrategies) {
          let response;
          let element = requestStrategies[key];
          let optionsCopy = options;

          //! <<<<< Only if is error >>>>>>
          if (options.isAxiosError || options.isAxiosError === undefined) {
            //! Add Bearer if is necessary:
            if (element.useBearer) {
              if (!options.tokenObj.tokenValue.includes("Bearer")) {
                optionsCopy.headers[optionsCopy.tokenObj.tokenVariable] =
                  "Bearer " + options.tokenObj.tokenValue;
              }
            } else {
              optionsCopy.headers[optionsCopy.tokenObj.tokenVariable] =
                options.tokenObj.tokenValue;
            }
            //! Create name token variable:

            optionsCopy.headers[element.tokenName] =
              optionsCopy.headers[optionsCopy.tokenObj.tokenVariable];

            delete optionsCopy.headers[optionsCopy.tokenObj.tokenVariable];
            delete optionsCopy.headers.token;

            // curl -X GET "https://pot-uat.paxitalia.com:8443/api/private/authorities" -H "accept: */*" -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjIxNjc5MDI5LCJleHAiOjE2MjE3MTE0MjksIlJPTEVTIjpbIlJPTEVfQ09NUEFOWV9BRE1JTiJdfQ.ZEDJA3FlyaQa7k9WdZdSfKAXeEI2P4_jBXm7biX7_dqj4_5HJsgXxDzKrd5YNRwE-tEKAH-6TpUe6zMviBcCbA"

            try {
              response = await axios.get(options.api, {
                headers: optionsCopy.headers,
                timeout: 7500,
              });
              options.isAxiosError = false;
              options.headers = headers;
              options.response = response;
            } catch (error) {
              options.isAxiosError = error.isAxiosError;
              options.response.error = error.message;
              options.response = error.response;
            }
          }

          if (!options.response) {
            options.response = response;
          }
        }

        return options;
      })
  );
}

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

async function simpleRequest(options) {
  let api = options.api;
  let swaggerApis = options.swaggerApis;
  let key = options.key;
  let data;
  let { pathsForTest, responseList, apiList, host, basePath } = swaggerApis;

  //! Api CURL:
  let apiVerb = apiList[key];

  let response, responseOutput, passTest, color;
  let successTest = true;

  options.api = api;

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
      options = await getHeaders(options);

      let headers = options.headers;

      //! If exist token

      if (headers) {
        //! Using Header configurations:
        options = await executeApiGETwithHeader(options);
        response = options.response;
      }
    } else {
    
    
      response = await axios.get(api, {
        timeout: 5500,
      });



    }

    try {
      data = JSON.stringify(response.data).substr(0, 200);
    } catch (error) {
      data = "";
    }

    responseOutput = {
      data: JSON.stringify(data),
      status: response.status,
      statusText: response.statusText,
      requestUrl: response.config.url,
      requestMethod: response.config.method,
      headers: JSON.stringify(options.headers) || "",
    };
  } catch (error) {
    response = error.response;

    if (!data) {
      data = "";
    }

    try {
      //!
      responseOutput = {
        data: response.data.message ? JSON.stringify(response.data.message) : "",
        status: response.status,
        statusText: response.statusText,
        requestUrl: response.config.url,
        requestMethod: response.config.method,
        headers: JSON.stringify(options.headers) || "",
      };
      //!''
    } catch (error) {
      //

      response = { config: { requestUrl: api, requestMethod: apiVerb } };
      response.data = "Internal Library error";
      response.status = 600;
      response.statusText = "Error in smokeTest request";
      response.requestUrl = api;
      response.requestMethod = apiVerb;
      response.error = error.message;

      responseOutput = {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        requestUrl: api,
        requestMethod: apiVerb,
        error: error.message,
        headers: JSON.stringify(options.headers) || "",
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

    let https = options.urlSwagger.substring(
      0,
      options.urlSwagger.search("//") + 2
    );

    api = https + host + basePath + pathsForTest[key];

    options.api = api;
    options.swaggerApis = swaggerApis;
    options.key = key;

    data = await simpleRequest(options);

    successTest = data.successTest;
    responseOutput = data.responseOutput;

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

async function smokeTest(urlSwagger, options) {
  //! Init versions
  let smktestCriterial;

  if (!options) {
    //? Define Options if not Exists
    options = {};
    smktestCriterial = "basic";
  }

  try {
    if (!options.tokenConfig.curlRequest) {
      smktestCriterial = "basic";
    } else {
      smktestCriterial = "basicWithAuth";
    }
  } catch (error) {
    smktestCriterial = "basic";
  }

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
async function trainSmokeTest(urlSwagger, options) {
  //!
  let data = await smokeTest(urlSwagger, options);

  let trainData = [];
  for (const key in data.responseOfRequest) {
    element = data.responseOfRequest[key];
    let dataElement = {
      type: "swaggerSmkTest",
      apiVerb: element.requestMethod,
      apiTest: element.requestUrl,
      assertStatusCode: element.status,
      passTrainingTest: element.passTest,
      trainingResponse: element.data,
    };
    trainData.push(dataElement);
  }
  return trainData;
}

// async function test() {
//   console.log("@1Marker-No:_354467327");
//   let data = await trainSmokeTest(
//     "https://edutelling-api-develop.openshift.techgap.it/api/v1/api-docs/"
//   );

//   console.log(">>>>>425065162>>>>>");
//   console.log(data);
//   console.log("<<<<<<<<<<<<<<<<<<<");
// }

// test();

module.exports.getPreview = getPreview;
module.exports.getBasicApi = getBasicApi;
module.exports.getBasicResponse = getBasicResponse;
module.exports.simpleRequest = simpleRequest;
module.exports.smokeTest = smokeTest;
module.exports.trainSmokeTest = trainSmokeTest;
