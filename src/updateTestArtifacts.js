/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

require("dotenv").config();

const fetch = require("node-fetch");
const fs = require("fs");
const fse = require("fs-extra");
const appRoot = require("app-root-path");

const prettier = require("prettier");

const TargetDecisioningEngine = require("@adobe/target-decisioning-engine");

const outputFolder = appRoot.resolve("schema/artifacts");

const REQUIRED_ENV_VARS = ["CLIENT_ID", "IMS_ORG_ID", "ENVIRONMENT"];

function fetchAndSaveArtifact() {
  for (const name of REQUIRED_ENV_VARS) {
    if (!process.env.hasOwnProperty(name)) {
      console.error(`${name} must be set in the .env file.`);
      return;
    }
  }

  const artifactLocation = appRoot.resolve("schema/artifact.json");

  return TargetDecisioningEngine({
    client: process.env.CLIENT_ID,
    organizationId: process.env.IMS_ORG_ID,
    environment: process.env.ENVIRONMENT,
    pollingInterval: 0,
    fetchApi: fetch,
  }).then((decisioningEngine) => {
    const artifact = decisioningEngine.getRawArtifact();
    fs.writeFileSync(
      artifactLocation,
      prettier.format(JSON.stringify(artifact), { parser: "json" })
    );

    return artifact;
  });
}

/**
 *
 * @param {"views"|"mboxes"} what
 * @param { Array<String> } activityIds
 * @param artifact
 * @return {{}}
 */
function getRules(what, activityIds, artifact) {
  const things = artifact.rules[what];
  const result = {};
  const names = Object.keys(things);

  names.forEach((name) => {
    const rules = things[name];
    for (const rule of rules) {
      if (activityIds.includes(rule.meta["activity.id"])) {
        if (!(result[name] instanceof Array)) {
          result[name] = [];
        }

        result[name].push(rule);
      }
    }
  });

  return result;
}

async function updateTestArtifacts() {
  const smokescreenArtifact = await fetchAndSaveArtifact();

  // https://wiki.corp.adobe.com/display/elm/Local+Decisioning%3A+Test+Artifacts
  const testArtifactDefinitions = require("./testArtifacts.json").artifacts;

  await fse.ensureDir(outputFolder);

  testArtifactDefinitions.forEach((artifactDefinition) => {
    const {
      activityIds,
      artifactFilename,
      adminUrls,
      remoteMboxes,
    } = artifactDefinition;

    const artifact = {
      ...smokescreenArtifact,
      remoteMboxes: Array.from(
        new Set([...remoteMboxes, ...smokescreenArtifact.remoteMboxes])
      ),

      rules: {
        mboxes: getRules("mboxes", activityIds, smokescreenArtifact),
        views: getRules("views", activityIds, smokescreenArtifact),
      },
    };

    fs.writeFileSync(
      `${outputFolder}/${artifactFilename}`,
      prettier.format(
        JSON.stringify({
          targetAdminActivityUrls: adminUrls instanceof Array ? adminUrls : [],
          ...artifact,
        }),
        { parser: "json" }
      )
    );
  });
}

module.exports = updateTestArtifacts;
