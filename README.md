# Adobe Target SDK Testing

## Overview

This repository contains real-world test artifacts along with test models that are used to verify on-device decisioning functionality within each Adobe Target SDK ( AKA the "test schema" ).

The test schema files reside within the `schema` folder of this repo.  There are two folders inside that will be of interest in testing:

| Folder         | Description                                                                                                                              |
|----------------|------------------------------------------------------------------------------------------------------------------------------------------|
| schema/artifacts | Contains a series of json files representing artifacts that are used when testing various on-device decisioning scenarios.               |
| schema/models    | Contains a series of json files, each one describing a suite of tests to run along with the artifact, config, input and expected outputs. |

## How to use in an SDK

In order to use these test files you need to reference the `schema` folder of this repo within a specific target SDK repo.  This is done via git subtree.  And there is a script for you to use that makes the process very simple.  

## Setup

Follow these steps to establlish the git subtree for the first time.

1. Download the [updateTestSchema.sh](https://raw.githubusercontent.com/adobe/target-sdk-testing/main/src/updateTestSchema.sh) file from this repo into the target SDK.  
1. Edit `updateTestSchema.sh` and change the `TEST_SCHEMA_DESTINATION_FOLDER` variable to the path for where you want the `schema` folder to live within the target SDK repo.
1. Set file permissions to execute: `chmod +x updateTestSchema.sh`
1. Execute the script from the repo root folder: `./updateTestSchema.sh`

## Updating to the latest schema

To update to the latest test schema, simply execute the `updateTestSchema.sh` script at any time.

```bash
./updateTestSchema.sh
```

## Usage

To use the schema, you will need to create a test that reads the test suite files, and dynamically instruments tests based on the definitions.   

### Read the test suites and hydrate the artifacts

1. When the test begins, it lists the `.json` files within `schema/models`.  Each `TEST_SUITE_XXXXXX.json` file represents a suite of tests to execute.
1. Each `TEST_SUITE_XXXXXX.json` file is read and parsed.
1. The json tree within `TEST_SUITE_XXXXXX.json` is traversed, looking for properties named `artifact` with a value that begins with `TEST_ARTIFACT_`.  In every case, the artifact value is then replaced with the json content of the corresponding artifact in the `schema/artifacts` folder.  For example, if `schema/models/TEST_SUITE_AB_SIMPLE.json` has an `artifact` property set to `TEST_ARTIFACT_AB_SIMPLE`, then the contents of `schema/artifacts/TEST_ARTIFACT_AB_SIMPLE.json` replaces the value for `artifact`.

### Run the test suites

For each test suite file...

1. Setup mocks
   * The request for the artifact must be mocked so that the `artifact` specified for the suite is returned when the SDK requests it.  If an `artifact` is specified in the test itself, use it instead.
   * Mock the geo response if a `mockGeo` object is specified in the test.
   * Lock the system date to the `mockDate` if one is specified for the test.
1. Initialize the SDK using the `conf` object from the suite.  If a `conf` is specified in the test itself, use it instead.
1. Make a `getOffers` call, passing in the `input` object specified in the test.
1. Validate
   * Validate the result from the `getOffers` call contains the keys and values specified within the `output` object.
   * If `notificationOutput` is specified within the test, validate that a notification was sent and that it contains the keys and values specified within `notificationOutput`.  If `notificationOutput` is null, verify that no notifications were sent.

To see a working example check out the [Node.js test runner](https://github.com/adobe/target-nodejs-sdk/blob/main/packages/target-decisioning-engine/test/decisioning.spec.js)

### Test Models

#### Suite

The `schema/models/TEST_SUITE_XXXXXX.json` files have the following properties.

| property    | description                                                                                                                                                                                                              |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| description | A brief description of the test suite.                                                                                                                                                                                   |
| artifact    | A string referencing an artifact file within `schema/artifacts` without the file extension.  This artifact is to be used for each test defined within the suite, unless `artifact` is specified in the test itself. |
| conf        | An object with configuration values that will be passed into the SDK initialization during the test.                                                                                                                     |
| test        | An object with key values where the key is a unique idenifier for the test and the value is a json object with additional details for the specific test.                                                                 |


#### Test

Each test object may have the following properties.

| property           | required | description                                                                                                                                                                                                        |
|--------------------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| artifact           | NO       | Same as above, but not always specified.  It is used to override the artifact set at the suite level, which is necessary for some tests.                                                                           |
| conf               | NO       | Same as above, but not always specified.  It is used to override the configuration set at the suite level, which is necessary for some tests.                                                                      |
| description        | YES      | A brief description of the test.                                                                                                                                                                                   |
| input              | YES      | An object representing the Target Delivery Request passed in to a getOffers call.                                                                                                                                  |
| output             | YES      | An object representing the expected Target Delivery Response from a getOffers call.  It specifies properties that must be present and validated.  Some properties are excluded if they are irrelevant to the test. |
| notificationOutput | NO       | An object representing the expected notification output.  Used to validate notification payloads when making execute requests.  Not always present.                                                                |
| mockDate           | NO       | An object indicating a specific date to lock the test to (year, month, date, hours).  Used in some tests to override the system date used during runtime.                                                          |
| mockGeo            | NO       | An object indicating a geo payload as would be received from `/v1/geo`.  If present, the test needs to use it to mock any requests made to that endpoint.                                                          |


## Test Artifact Data
The test artifacts are generated from a real production artifact.  This artifact belongs to the following test organization.

| Property       | Value                  			     |
|----------------|-----------------------------------|
| clientId       | adobesummit2018                   |
| organizationId | 65453EA95A70434F0A495D34@AdobeOrg |
| environment    | production                        |

More details about the specific Target Activities and Properties use for testing can be found [here](https://wiki.corp.adobe.com/display/Target/On-device+Decisioning%3A+Test+Artifacts) 

### Generating updated test artifacts

To generate new test artifacts, simply follow these steps.

1. Clone the repo.
1. run `npm install`
1. run `npm run build`.

These commands generate new and/or updated artifacts in the `schema/artifacts` folder.  The generated files need to be committed once generated, so they can be used by each implementing Adobe Target SDK.

## Contributing

Please read the [Contributing Guide](CONTRIBUTING.md) as well as [Code of Conduct](CODE_OF_CONDUCT.md) for more information.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
