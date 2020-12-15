# Adobe Target SDK Testing

## Overview

This repository contains real-world test artifacts along with test models that are used to verify on-device decisioning functionality within each Adobe Target SDK.

There are two folders within this repository that are of interest for testing:

| Folder         | Description                                                                                                                              |
|----------------|------------------------------------------------------------------------------------------------------------------------------------------|
| schema/artifacts | Contains a series of json files representing artifacts that are used when testing various on-device decisioning scenarios.               |
| schema/models    | Contains a series of json files, each one describing a suite of tests to run along with the artifact, config, input and expected output. |

## How to use in an SDK

Use git subtree to include the contents of the `schema` folder within the SDK.  That way, when the artifacts or test models are updated, the SDK can receive those updates via a simple command.

## Test Artifact Data
The test artifacts are generated from a real production artifact.  This artifact belongs to the following test organization.

| Property       | Value                  			     |
|----------------|-----------------------------------|
| clientId       | adobesummit2018                   |
| organizationId | 65453EA95A70434F0A495D34@AdobeOrg |
| environment    | production                        |


### Generating new test artifacts

To generate new test artifacts, simply follow these steps.

1. Clone the repo.
1. run `npm install`
1. run `npm run build`.

These commands generate new and/or updated artifacts in the `schema/artifacts` folder.  The generated files need to be committed once generated so they can be used by each Adobe Target SDK.

## Contributing

Please read the [Contributing Guide](CONTRIBUTING.md) as well as [Code of Conduct](CODE_OF_CONDUCT.md) for more information.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
