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

| Command library | Description | Example |
| :-------------- | :---------- | :-----: |
| .....           | ....        |    -    |

## Use Example

......

#### 1) Run example_1 using docker-compose.yml (PASS TEST)

# docker-compose.yml

    version: '3.7'
    services:
      database:
        image: mongo:latest
        container_name: database
        environment:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: admin
          MONGODB_USERNAME: admin
          MONGODB_PASSWORD: admin
          MONGODB_DATABASE: admin
        ports:
          - 27017:27017
        networks:
          - host

      backend:
        image: cannit/zipi_backend_example_1:latest
        container_name: backend
        ports:
          - 8000:8000
        depends_on:
          - database
        environment:
          - DJANGO_ENV=docker
        command:  >
              bash -c "python manage.py migrate
              && python manage.py shell -c \"from django.contrib.auth.models import User; User.objects.filter(username='admin1').exists() or User.objects.create_superuser('admin', 'admin1@example.com', 'admin')\"
              && python manage.py runserver 0.0.0.0:8000"
        networks:
          - host

      smoke-test:
        image:  smktest2021/smktest:latest
        container_name: smoke-test
        depends_on:
          - backend
        privileged: true
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock
        environment:
          - PROJECT_NAME=example2_how_use_criterial
          - ZIPI_CONFIGURATION=env_variable
          - MODE_CONNECT=docker
          - SMOKE_TEST_CRITERIA=Service_Protocol_Coverage
          - RETRIES_NUMBER=0
          - TO_BREAK_PIPELINE=false
          - ENDPOINT_HOST=http://backend:8000
          - SERVICES_NAME=['database','backend']
          - LOGS_ERROR_EXCEPTION="['Watching for file changes with StatReloader']"
          - LOG_NUMBER_OF_LINE=5
          - LOG_KEYWORD=['error','TypeError']
          - CLEAN_LOGS_REPORTS_NUMBER=4
          - WAIT_TIME_SECONDS=10
          - MONITORING_TIME=10
        networks:
          - host
    networks:
      host:

This example recreates a stability problem in the absence of the database. The smokeTest service finds the fault.

#### 2) Run example_2 using docker-compose.yml (Fail Test)

    version: '3.7'
    services:
      backend:
        image: cannit/zipi_backend_example_1:latest
        container_name: backend
        ports:
          - 8000:8000
        environment:
          - DJANGO_ENV=docker
        command:  >
              bash -c "python manage.py migrate
              && python manage.py shell -c \"from django.contrib.auth.models import User; User.objects.filter(username='admin1').exists() or User.objects.create_superuser('admin', 'admin1@example.com', 'admin')\"
              && python manage.py runserver 0.0.0.0:8000"
        networks:
          - host

      smoke-test:
        image:  smktest2021/smktest:latest
        container_name: smoke-test
        depends_on:
          - backend
        privileged: true
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock
        environment:
          - PROJECT_NAME=example2_how_use_criterial
          - ZIPI_CONFIGURATION=env_variable
          - MODE_CONNECT=docker
          - SMOKE_TEST_CRITERIA=Service_Protocol_Coverage
          - RETRIES_NUMBER=0
          - TO_BREAK_PIPELINE=false
          - ENDPOINT_HOST=http://backend:8000
          - SERVICES_NAME=['database','backend']
          - LOGS_ERROR_EXCEPTION="['Watching for file changes with StatReloader']"
          - LOG_NUMBER_OF_LINE=5
          - LOG_KEYWORD=['error','TypeError']
          - CLEAN_LOGS_REPORTS_NUMBER=4
          - WAIT_TIME_SECONDS=10
          - MONITORING_TIME=10
        networks:
          - host
    networks:
      host:

## Use of Enviroment variable in Zipi-Smk-Service

The following are the environment variables that can be modified in the service.

### General settings

This is the segment of environment variables that can be used in the general configuration of the service.

| ENVIROMENT VARIABLE | Default Value        | Description                                                                                                                           |
| :------------------ | :------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| ZIPI_CONFIGURATION  | env_variable         | You can select whether you want to read the configuration data from the config.json file (config_file) or from environment variables. |
| MODE_CONNECT        | docker               | Is possible select connect mode (docker or kubernetes)                                                                                |
| WAIT_TIME_SECONDS   | 10                   | Waiting time for downed services                                                                                                      |
| RETRIES_NUMBER      | 3                    | Number of times the test will be repeated before rhombing the pipeline. To avoid the flaky test                                       |
| TO_BREAK_PIPELINE   | true                 | Break the pipeline after finding a fault.                                                                                             |
| SMOKE_TEST_CRITERIA | SERVICE_AVAILABILITY | Select the available criteria to apply to your test case. It can be documented from the Criteria in the Smoke-Test Criteria section   |
| MONITORING_TIME     | 20                   | Time (seconds) to monitor resources before starting the test. Only available for the Docker version at this time.                     |
