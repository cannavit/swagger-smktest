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

- [Smoke Test Commands](#markdown-header-span-elements)
- [General Commands](#markdown-header-span-elements)

# Smoke Test Commands :

| Command library | Level | Scann API Type | Parameters |
| :-------------- | :---- | :------------: | :--------: |
| smokeTest       | Basic |      GET       |     NO     |

# General Commands

| Command library                             | Description                                               |
| :------------------------------------------ | :-------------------------------------------------------- |
| swaggerSmktest.getPreview(urlSwagger)       | Get swagger object of the apis from swagger documentation |
| swaggerSmktest.getBasicApi(urlSwagger)      | Get list of the apis from swagger documentation           |
| swaggerSmktest.getBasicResponse(urlSwagger) | Create basic request using "axios.get "                   |

## Use Example (getBasicApi)

    const swaggerSmktest = require("swagger-smktest");

    async function example_getBasicApi(urlSwagger) {

      const urlSwagger = "https://petstore.swagger.io/v2/swagger.json";

      let simpleApis = await swaggerSmktest.getBasicApi(urlSwagger);


    }

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

## Example of use with Jest:

1.  Install Jest
2.  Create jest file: basicSmktest_JestExample.test

3.  Example of basic smokeTest:

### Test example with Jest:

      const swaggerSmktest = require("swagger-smktest");

      let urlSwagger = "https://petstore.swagger.io/v2/swagger.json";

      let {
        responseOfRequest,
        coverage,
        successSmokeTest,
        report,
        abstractReport,
      } = await swaggerSmktest.smokeTest(urlSwagger);

      // Render the APIs SmokeTest report
      console.log(report.render());

      // Render the General report:
      console.log(abstractReport.render());

      // Jest
      expect(successSmokeTest).toBe(false);

      });

Console output:

![toolss_200px](/src/documentation/swagger-smktest.png)

### Referents

https://app.swaggerhub.com/
