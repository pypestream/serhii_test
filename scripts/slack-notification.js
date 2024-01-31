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

  console.log("release: ", JSON.stringify(release, null, 2));

  const slackWebhook = new IncomingWebhook(webhook);
  const bodyBlocks = await markdownToBlocks(release.body);
  const owner = repo.owner.charAt(0).toUpperCase() + repo.owner.slice(1);
  const repositoryName = repo.repo.charAt(0).toUpperCase() + repo.repo.slice(1);

  await slackWebhook.send({
    timeout: 0,
    text: "Pypestream Frontend v1.12.0-rc.1 Released (candidate)!",
    icon_emoji: ":rocket:",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Pypestream Frontend v1.12.0-rc.1 has been Released (candidate)! :rocket:",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Check out the latest release notes <https://github.com/pypestream/frontend/releases/tag/v1.12.0-rc.1|on Github> to see what's changed!",
        },
      },
      ...bodyBlocks,
      // { type: "header", text: { type: "plain_text", text: "Release Notes" } },
      // {
      //   type: "header",
      //   text: {
      //     type: "plain_text",
      //     text: "[DesignSystem] Bulk actions part 3 (#512)",
      //   },
      // },
      // {
      //   type: "section",
      //   text: {
      //     type: "mrkdwn",
      //     text: "• adds delete items functionality\\n• updates/fixes bulk-actions methods",
      //   },
      // },
      // // {
      // //   type: "section",
      // //   text: {
      // //     type: "mrkdwn",
      // //     text: "<https://github.com/pypestream/frontend/assets/103594165/37a68182-d8a2-425e-837c-0bf652275d29|https://github.com/pypestream/frontend/assets/103594165/37a68182-d8a2-425e-837c-0bf652275d29> ",
      // //   },
      // // },
      // {
      //   type: "header",
      //   text: {
      //     type: "plain_text",
      //     text: "PE-27020: Added release bot for slack (#446)",
      //   },
      // },
      // {
      //   type: "section",
      //   text: {
      //     type: "mrkdwn",
      //     text: "<https://pypestream.atlassian.net/browse/PE-27020|Ticket> ",
      //   },
      // },
      // {
      //   type: "section",
      //   text: {
      //     type: "mrkdwn",
      //     text: "added release bot for slack\\nmessages will be sent in `manager-and-admin-product` slack channel after releases\\nmessages will be sent in `manager-and-admin-dev` slack channel after releases and pre-releases",
      //   },
      // },
      // {
      //   type: "section",
      //   text: { type: "mrkdwn", text: "Example of Slack notification:\\n" },
      // },
      // {
      //   type: "image",
      //   image_url:
      //     "https://github.com/pypestream/frontend/assets/103273897/516dbbf3-606a-4ced-9ede-bc6ff79ce00b",
      //   alt_text: "image",
      // },
      // {
      //   type: "section",
      //   text: {
      //     type: "mrkdwn",
      //     text: "@LeoDAuriaGupta \\nhere is the original text of the notification above:",
      //   },
      // },
      // {
      //   type: "section",
      //   text: {
      //     type: "mrkdwn",
      //     text: "Pypestream Serhii_test v1.0.4 has been Released! :rocket:\\nCheck out the latest release notes <https://github.com/pypestream/serhii_test/releases/tag/v1.0.4|on Github>  to see what&#39;s changed!\\nFull Changelog: <https://github.com/pypestream/serhii_test/compare/v1.0.1...v1.0.4|https://github.com/pypestream/serhii_test/compare/v1.0.1...v1.0.4> ",
      //   },
      // },
      // {
      //   type: "header",
      //   text: {
      //     type: "plain_text",
      //     text: "PE-27668: User onboarding - terms and conditions (#508)",
      //   },
      // },
      // {
      //   type: "image",
      //   image_url:
      //     "https://github.com/pypestream/frontend/assets/103273897/75864fc7-6571-4d06-b11d-1e52d5329de5",
      //   alt_text: "image",
      // },
      // {
      //   type: "section",
      //   text: {
      //     type: "mrkdwn",
      //     text: "Added a modal window with a form to complete account creation and an agreement with the terms and conditions for new users (user status `INVITED`)",
      //   },
      // },
      // { type: "header", text: { type: "plain_text", text: "How to QA this" } },
      // {
      //   type: "section",
      //   text: {
      //     type: "mrkdwn",
      //     text: "• invite new user on `Users` page in `Admin`\\n• log in with a new user credential on `Auth` page\\n• a user who has not previously accepted the terms and conditions agreement should see a modal window with a form to complete account creation\\n• the modal window cannot be closed by clicking outside, using the escape button, or in any other way, thereby gaining access to the Manager dashboard without accepting the `term and conditions`\\n• fill out the form, accept the `terms and conditions`, and click the `Create account` button\\n• the modal window should close\\n• the modal window should not appear after the page refresh\\n• log out and log in again\\n• the modal window should not be shown again to the user who accepted the `terms and conditions`",
      //   },
      // },
      // { type: "divider" },
      // { type: "header", text: { type: "plain_text", text: "🚀 Enhancement" } },
      // {
      //   type: "section",
      //   text: {
      //     type: "mrkdwn",
      //     text: "• [DesignSystem] Bulk actions part 3 <https://github.com/pypestream/frontend/pull/512|#512>  (<https://github.com/vbondarps|@vbondarps>  <https://github.com/schupryna|@schupryna> )\\n• <https://pypestream.atlassian.net/browse/PE-27020|PE-27020> : Added release bot for slack <https://github.com/pypestream/frontend/pull/446|#446>  (<https://github.com/schupryna|@schupryna> )\\n• <https://pypestream.atlassian.net/browse/PE-27668|PE-27668> : User onboarding - terms and conditions <https://github.com/pypestream/frontend/pull/508|#508>  (<https://github.com/schupryna|@schupryna> )",
      //   },
      // },
      // {
      //   type: "header",
      //   text: { type: "plain_text", text: "⚠️ Pushed to `candidate`" },
      // },
      // {
      //   type: "section",
      //   text: {
      //     type: "mrkdwn",
      //     text: "• chore: bump package version manually (<https://github.com/schupryna|@schupryna> )",
      //   },
      // },
      // { type: "header", text: { type: "plain_text", text: "Authors: 2" } },
      // {
      //   type: "section",
      //   text: {
      //     type: "mrkdwn",
      //     text: "• Serhii Chupryna (<https://github.com/schupryna|@schupryna> )\\n• Vitalii Bondar (<https://github.com/vbondarps|@vbondarps> )",
      //   },
      // },
    ],
  });
}

module.exports = { sendReleaseNotification };

exports.sendReleaseNotification = sendReleaseNotification;
