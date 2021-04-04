[![Kubernetes](https://img.shields.io/badge/-kubernetes-3875A0?style=flat-square&logo=kubernetes&logoColor=white&link=https://kubernetes.io/docs/concepts/overview/what-is-kubernetes/)](https://kubernetes.io/docs/concepts/overview/what-is-kubernetes/)
[![NodeJS](https://img.shields.io/badge/-NodeJs-3CA80B?style=flat-square&logo=nodejs&logoColor=white&link=https://nodejs.org/en/)](https://nodejs.org/en/)
[![GitHub](https://img.shields.io/badge/-github-black?style=flat-square&labelColor=black&logo=github&logoColor=white&link)](https://github.com/cecilio-cannav/zipi-smkTest)
[![GitHub](https://img.shields.io/badge/-mongodb-43A617?style=flat-square&labelColor=43A617&logo=mongodb&logoColor=white&link)](https://www.mongodb.com/developer-tools)

<p align="left" src="https://cecilio-cannav.github.io/zipi-smkTest/">
  <img src="https://raw.githubusercontent.com/cecilio-cannav/zipi-smkTest/master/docs/zipi.png" width="256" title="Smoke-Test">
</p>

# swagger-smktest:

This is a library to facilitate the extraction of apis from the URL of the SWAGGER documentation and to be able to apply smoke testing techniques. It will help you in automation and fault detection issues.
Smoke tests: It is a type of stability test that must be applied before starting the rest of the deep tests. It is generally maintenance-free and can help detect stability issues in your architecture early.
Keyworld: Smoke Test, Sporadic failures, automatic, test

# Content:

- [Scanner of apis from Swagger](#markdown-header-span-elements)
- [How use the service with Docker](#markdown-header-span-elements)

# Commands :

| Command library | Level | Scann API Type | Parameters |
| :-------------- | :---- | :------------: | :--------: |
| getBasicApi     | Basic |      GET       |     NO     |

## Use Example (getBasicApi)

    const swaggerSmktest = require("swagger-smktest");

    async function example_getBasicApi(urlSwagger) {

      const urlSwagger = "https://petstore.swagger.io/v2/swagger.json";

      let simpleApis = await swaggerSmktest.getBasicApi(urlSwagger);


    }

    yarn install

### Output console:

      pathsForTest: [
        '/pet/findByStatus',
        '/pet/findByTags',
        '/store/inventory',
        '/user/login',
        '/user/logout'
      ]

     responseList: [
       { '200': [Object], '400': [Object] },
       { '200': [Object], '400': [Object] },
       { '200': [Object] },
       { '200': [Object], '400': [Object] },
       { default: [Object] }
    ],
     apiList: [ 'GET', 'GET', 'GET', 'GET', 'GET' ]

0

## Example of use with Jest:

1.  Install Jest
2.  Create jest file: basicSmktest_JestExample.test

3.  Example of basic smokeTest:

    const swaggerSmktest = require("swagger-smktest");

    let urlSwagger = "https://petstore.swagger.io/v2/swagger.json";
    let smktestCriterial = "basic";

    let {
    responseOfRequest,
    coverage,
    successSmokeTest,
    report,
    abstractReport,
    } = await swaggerSmktest.smktestBasic(smktestCriterial, urlSwagger);

    console.log(report.render());
    console.log(abstractReport.render());

    });

Console output:

![toolss_200px](/src/documentation/swagger-smktest.png)
