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
    core.debug(`Sending notification...`);

    const context = github.context;
    const { eventName, repo } = context;
    if (eventName !== "release") {
      core.setFailed("Action should only be run on release publish events");
    }
    // const payload = context.payload as ReleaseReleasedEvent;
    const payload = context.payload;

    const release = payload.release;
    const isPreRelease = payload.release.prerelease;

    core.debug(JSON.stringify(release, null, 2));
    console.log("release: ", JSON.stringify(release, null, 2));
    core.debug(JSON.stringify(repo, null, 2));
    console.log("repo: ", repo);
    core.debug(`prerelease: ${isPreRelease}`);

    const slackWebhookUrl = isPreRelease ? preReleaseWebhook : releaseWebhook;

    core.debug(`slackWebhookUrl: ${slackWebhookUrl}`);

    // await sendReleaseNotification({
    //   slackWebhookUrl,
    //   release: payload.release,
    //   repo
    // })

    core.debug("Sent notification");
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
