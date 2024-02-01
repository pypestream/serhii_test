// https://github.com/tryfabric/notify-slack-on-release/blob/main/src/send-release-notification.ts
// import * as core from "@actions/core";
// import * as github from "@actions/github";
const core = require("@actions/core");
const github = require("@actions/github");
// import type { ReleaseReleasedEvent } from "@octokit/webhooks-types";
const sendReleaseNotification =
  require("./slack-notification").sendReleaseNotification;
const { Octokit } = require("@octokit/core");

const preReleaseWebhook = process.env.SLACK_PRERELEASE_WEBHOOK_URL;
const releaseDevWebhook = process.env.SLACK_RELEASE_DEV_WEBHOOK_URL;
const releaseWebhook = process.env.SLACK_RELEASE_WEBHOOK_URL;
const npmToken = process.env.NPM_TOKEN;

// async function run(): Promise<void> {
async function run() {
  try {
    console.log(`Sending notification...`);

    const {
      context: {
        eventName,
        repo,
        payload: { release },
      },
    } = github;

    if (eventName !== "release") {
      core.setFailed("Action should only be run on release publish events");
    }

    const octokit = new Octokit({
      auth: npmToken,
    });

    const data = await octokit.request(
      `GET /repos/${repo.owner}/${repo.repo}/releases/${release.id}/assets`,
      {
        owner: repo.owner,
        repo: repo.repo,
        release_id: release.id,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    console.log('%cRELEASE:', JSON.stringify(release, null, 2));

    console.log(
      "%cassets list: ",
      JSON.stringify(data, null, 2)
    );

    // const isPreRelease = release.prerelease;
    // const webhooks = isPreRelease
    //   ? [preReleaseWebhook]
    //   : [releaseWebhook, releaseDevWebhook];

    // webhooks.forEach(async (webhook) => {
    //   await sendReleaseNotification({
    //     webhook,
    //     release,
    //     repo,
    //     isPreRelease,
    //   });
    // });

    console.log("Sent notification");
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${JSON.stringify(error, null, 2)}`);
      core.setFailed(error.message);
    }
  }
}

run();


{
  "url": "https://api.github.com/repos/octocat/Hello-World/releases/assets/1",
  "browser_download_url": "https://github.com/octocat/Hello-World/releases/download/v1.0.0/example.zip",
  "id": 1,
  "node_id": "MDEyOlJlbGVhc2VBc3NldDE=",
  "name": "example.zip",
  "label": "short description",
  "state": "uploaded",
  "content_type": "application/zip",
  "size": 1024,
  "download_count": 42,
  "created_at": "2013-02-27T19:35:32Z",
  "updated_at": "2013-02-27T19:35:32Z",
  "uploader": {
    "login": "octocat",
    "id": 1,
    "node_id": "MDQ6VXNlcjE=",
    "avatar_url": "https://github.com/images/error/octocat_happy.gif",
    "gravatar_id": "",
    "url": "https://api.github.com/users/octocat",
    "html_url": "https://github.com/octocat",
    "followers_url": "https://api.github.com/users/octocat/followers",
    "following_url": "https://api.github.com/users/octocat/following{/other_user}",
    "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
    "organizations_url": "https://api.github.com/users/octocat/orgs",
    "repos_url": "https://api.github.com/users/octocat/repos",
    "events_url": "https://api.github.com/users/octocat/events{/privacy}",
    "received_events_url": "https://api.github.com/users/octocat/received_events",
    "type": "User",
    "site_admin": false
  }
}