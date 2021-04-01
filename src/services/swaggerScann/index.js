const _ = require("lodash");
const config = require("../config.json");
const env = process.env.NODE_ENV || "dev";
global.config = _.merge(config["dev"], config[env]);
const shell = require("shelljs");
const log = require("./logger")("scannSwagger");
const checkLogs = require("../service/testLibrary/checkLogs");
const tc = require("timezonecomplete");
const Table = require("tty-table");
var colors = require("colors");

const getConfigVariable_ENV = require("./getConfigVariable");

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

//! Run shell commands:
async function getApisFromSwaggerFile() {
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

async function getTokenServiceFromCurl() {
  const { ENDPOINT_GET_TOKEN } = await getConfigVariable_ENV.ConfigCommands();

  // var ENDPOINT_GET_TOKEN = global.config.ENDPOINT_GET_TOKEN

  resultOfExec = await shell.exec(ENDPOINT_GET_TOKEN, { silent: true });

  var results;

  try {
    results = JSON.parse(resultOfExec.stdout)["token"];
    log.info("results: ", results);
  } catch (error) {
    results = "";
    log.error("Not is possible get token");
  }

  return results;
}

async function buildListOfCurlTest() {
  const { ENDPOINT_HOST } = await getConfigVariable_ENV.ConfigCommands();

  var token = await getTokenServiceFromCurl();
  var outData = await getApisFromSwaggerFile();

  var pathsGetOutParams = outData.pathsForTest;
  var responseList = outData.responseList;

  var len = "it";
  var accept = "application/json";
  var formatCurl =
    'curl -X GET -H "accept-language: $LENG" -H "accept: $ACCEPT" -H "Authorization: Bearer $TOKEN" "$URL" --speed-time 10';

  formatCurl = formatCurl.replace("$LENG", len);
  formatCurl = formatCurl.replace("$ACCEPT", accept);
  formatCurl = formatCurl.replace("$TOKEN", token);

  var curlTestList = [];

  if (ENDPOINT_HOST !== "") {
    for (const key in pathsGetOutParams) {
      var formatCurl_i = formatCurl;
      path = ENDPOINT_HOST + "/api/v1" + pathsGetOutParams[key];
      formatCurl_i = formatCurl_i.replace("$URL", path);

      var data = {
        testCurl: formatCurl_i,
        path: pathsGetOutParams[key],
        responseExpect: responseList[key],
        apiVerbs: outData.apiList[key],
      };
      curlTestList.push(data);
    }
  }
  return curlTestList;
}

async function executeTestCurl() {
  console.log(colors.bgGreen("EntryPoint Families Execution Test :"));

  var curlTestList = await buildListOfCurlTest();

  var passTest = true;
  let outputTest = [];

  for (const key in curlTestList) {
    var dataBeforeToStart = new Date().toISOString();
    sleep(1000);

    var data = await curlTestList[key];
    resultOfExec = await shell.exec(data.testCurl, { silent: true });
    outputData = await checkLogs.detectOnlyStdErrInsideToLogs(
      dataBeforeToStart,
      curlTestList,
      data
    );

    for (const key in outputData) {
      var dataLogs = outputData[key];

      var dataResponse = {
        serviceName: dataLogs.serviceName,
        apiVerb: data.apiVerbs,
        apiPath: data.path,
        curl: data.testCurl,
        logError:
          dataLogs.stdErr !== "" ? dataLogs.stdErr : resultOfExec.stdErr,
        passTest: String(dataLogs.passLogsTest),
      };

      if (!dataLogs.passLogsTest || outputData.stdErr !== undefined) {
        outputTest.push(dataResponse);
        passTest = false;
      }
    }

    sleep(1000);
  }

  //! PassTest.

  if (!passTest) {
    let header = [
      { value: "serviceName", alias: "Service Name", align: "left", width: 20 },
      { value: "apiVerb", alias: "Verb", align: "left", width: 10 },
      { value: "apiPath", alias: "Api Path", align: "left", width: 30 },
      { value: "curl", alias: "CURL", align: "left", width: 60 },
      { value: "logError", alias: "logErr", align: "left", width: 80 },
      {
        alias: "Success",
        value: "passTest",
        width: 10,
        color: "red",
        formatter: function (value) {
          if (value === "true") {
            value = this.style(value, "bgGreen", "black");
          } else {
            value = this.style(value, "bgRed", "white");
          }
          return value;
        },
      },
    ];

    const t3 = Table(header, outputTest);
    console.log(t3.render());
  }

  return passTest;
}

module.exports.executeTestCurl = executeTestCurl;
