// import * as core from "@actions/core";
// import * as github from "@actions/github";
const core = require("@actions/core");
const github = require("@actions/github");
// import type { ReleaseReleasedEvent } from "@octokit/webhooks-types";
// import {sendReleaseNotification} from './send-release-notification'

const preReleaseWebhook = process.env.PRERELEASE_WEBHOOK_URL;
const releaseWebhook = process.env.RELEASE_WEBHOOK_URL;

// async function run(): Promise<void> {
async function run() {
  try {
    console.log(`Sending notification...`);

    const context = github.context;
    const { eventName, repo } = context;
    if (eventName !== "release") {
      core.setFailed("Action should only be run on release publish events");
    }
    // const payload = context.payload as ReleaseReleasedEvent;
    const payload = context.payload;
    const release = payload.release;
    const isPreRelease = payload.release.prerelease;

    console.log("release: ", JSON.stringify(release, null, 2));
    console.log("repo: ", repo);
    console.log("prerelease: ", isPreRelease);

    const slackWebhookUrl = isPreRelease ? preReleaseWebhook : releaseWebhook;
    console.log(`slackWebhookUrl: ${slackWebhookUrl}`);

    // await sendReleaseNotification({
    //   slackWebhookUrl,
    //   release: payload.release,
    //   repo
    // })

    console.log("Sent notification");
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${JSON.stringify(error, null, 2)}`);
      core.setFailed(error.message);
    }
  }
}

run();
