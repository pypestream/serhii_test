// import { IncomingWebhook } from "@slack/webhook";
// import { markdownToBlocks } from "@instantish/mack";

const { IncomingWebhook } = require("@slack/webhook");
const { markdownToBlocks } = require("@instantish/mack");

/**
 * TODOs & Questions:
 * - Make sure we add checks to NOT send out the release notification if release error occurs!
 * - Error handling? throwing an error could blow up the automated release if we aren't careful!
 * - Decide if every release type is treated exactly the same (ie. "loudness" based on SEMVEr)
 * - Option to have us send out a custom release notification (ex. something manually triggered)?
 * - Figure out how we handle screenshots / assets
 * - Markdown TLDR blurb?
 * - Replace hard-coded version references with dynamic value
 * - Update URLs to new `pypestream.dev` domains
 * - Update prerelease / release tasks to fire off custom Slack webhook
 * - Update script to be a function that passes in the webhook URL to use (ie. one script for both
 *   release types)
 * - In Slack App settings, confirm that the `SLACK_PRERELEASE_WEBHOOK_URL` and
 *   `SLACK_RELEASE_WEBHOOK_URL` webhook URLs (ENV vars) point to the correct channels. If not,
 *    update our Github & Vercel env vars to use the correct webhook urls.
 * - Move webhook env vars to shared vars file pulled into both release scripts
 * - Make sure the release script sends a notification out to the channel(s) we expect
 *   (ie. just the engineering channel? any others? if so, need a different env var per channel to
 *   send out notification)
 * - Do we want to call these Slack release notifications something else other than "Pypestream FE"?
 */

// export async function sendReleaseNotification({ release, repo }) {
async function sendReleaseNotification({
  release,
  repo,
  webhook,
  isPreRelease,
}) {
  if (!webhook) {
    throw new Error(
      `No webhook URL found for ${
        isPreRelease ? "pre-release" : "release"
      } notification`
    );
  }

  const slackWebhook = new IncomingWebhook(webhook);
  const bodyBlocks = await markdownToBlocks(release.body);
  const owner = repo.owner.charAt(0).toUpperCase() + repo.owner.slice(1);
  const repositoryName = repo.repo.charAt(0).toUpperCase() + repo.repo.slice(1);

  await slackWebhook.send({
    text: `${owner} ${repositoryName} ${release.tag_name} Released${
      isPreRelease ? "(candidate)" : ""
    }!`,
    icon_emoji: ":rocket:",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${owner} ${repositoryName} ${
            release.tag_name
          } has been Released${isPreRelease ? "(candidate)" : ""}! :rocket:`,
          emoji: true,
        },
      },

      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Check out the latest release notes <${release.html_url}|on Github> to see what's changed!`,
        },
      },

      ...bodyBlocks,
    ],
  });
}

module.exports = { sendReleaseNotification };

exports.sendReleaseNotification = sendReleaseNotification;
