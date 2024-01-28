import * as core from "@actions/core";
import * as github from "@actions/github";
import type { ReleaseReleasedEvent } from "@octokit/webhooks-types";
// import {sendReleaseNotification} from './send-release-notification'

async function run(): Promise<void> {
  try {
    core.debug(`Sending notification...`);
    // const slackWebhookUrl: string = core.getInput('slack_webhook_url')

    const context = github.context;
    const { eventName, repo } = context;
    if (eventName !== "release") {
      core.setFailed("Action should only be run on release publish events");
    }
    const payload = context.payload as ReleaseReleasedEvent;

    const release = payload.release;

    core.debug(JSON.stringify(release, null, 2));
    console.log("release: ", JSON.stringify(release, null, 2));
    core.debug(JSON.stringify(repo, null, 2));
    console.log("repo: ", repo);

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
