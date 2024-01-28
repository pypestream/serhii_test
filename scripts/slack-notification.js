// // import { IncomingWebhook } from "@slack/webhook";
// // import { markdownToBlocks } from "@instantish/mack";

// const { IncomingWebhook } = require("@slack/webhook");
// const { markdownToBlocks } = require("@instantish/mack");

// const preReleaseWebhook = process.env.PRERELEASE_WEBHOOK_URL;
// const releaseWebhook = process.env.RELEASE_WEBHOOK_URL;

// /**
//  * TODOs & Questions:
//  * - Make sure we add checks to NOT send out the release notification if release error occurs!
//  * - Error handling? throwing an error could blow up the automated release if we aren't careful!
//  * - Decide if every release type is treated exactly the same (ie. "loudness" based on SEMVEr)
//  * - Option to have us send out a custom release notification (ex. something manually triggered)?
//  * - Figure out how we handle screenshots / assets
//  * - Markdown TLDR blurb?
//  * - Replace hard-coded version references with dynamic value
//  * - Update URLs to new `pypestream.dev` domains
//  * - Update prerelease / release tasks to fire off custom Slack webhook
//  * - Update script to be a function that passes in the webhook URL to use (ie. one script for both
//  *   release types)
//  * - In Slack App settings, confirm that the `SLACK_PRERELEASE_WEBHOOK_URL` and
//  *   `SLACK_RELEASE_WEBHOOK_URL` webhook URLs (ENV vars) point to the correct channels. If not,
//  *    update our Github & Vercel env vars to use the correct webhook urls.
//  * - Move webhook env vars to shared vars file pulled into both release scripts
//  * - Make sure the release script sends a notification out to the channel(s) we expect
//  *   (ie. just the engineering channel? any others? if so, need a different env var per channel to
//  *   send out notification)
//  * - Do we want to call these Slack release notifications something else other than "Pypestream FE"?
//  */

// // export async function sendReleaseNotification({ release, repo }) {
// async function sendReleaseNotification({ release, repo }) {
//   const isPreRelease = release.prerelease;
//   const hook = isPreRelease ? preReleaseWebhook : releaseWebhook;

//   if (hook) {
//     const webhook = new IncomingWebhook(hook);
//     const bodyBlocks = await markdownToBlocks(release.body);

//     await webhook.send({
//       text: `${repo.owner} ${repo.repo} ${release.tag_name} Released!`,
//       icon_emoji: ":rocket:",
//       blocks: [
//         {
//           type: "header",
//           text: {
//             type: "plain_text",
//             text: `${repo.owner} ${repo.repo} ${release.tag_name} has been released! :rocket:`,
//             emoji: true,
//           },
//         },

//         {
//           type: "section",
//           text: {
//             type: "mrkdwn",
//             text: `<${release.html_url}>`,
//           },
//         },

//         ...bodyBlocks,
//       ],
//     });
//   }
// }

// // export default sendReleaseNotification;

// module.exports = { sendReleaseNotification };

// exports.sendReleaseNotification = sendReleaseNotification;

// import axios from "axios";
// import { markdownToBlocks } from "@instantish/mack";

const axios = require("axios");
const { markdownToBlocks } = require("@instantish/mack");

const preReleaseWebhook =
  "https://hooks.slack.com/services/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";
const releaseWebhook =
  "https://hooks.slack.com/services/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";

async function sendReleaseNotification({ release, repo }) {
  const isPreRelease = release.prerelease;
  const hook = isPreRelease ? preReleaseWebhook : releaseWebhook;

  if (hook) {
    const introBlock = {
      type: "header",
      text: {
        type: "header",
        text: {
          type: "plain_text",
          text: `${repo.owner} ${repo.repo} ${release.tag_name} has been released! :rocket:`,
          emoji: true,
        },
      },
    };
    const linkBlock = {
      type: "section",
      text: {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<${release.html_url}>`,
        },
      },
    };

    const bodyBlocks = await markdownToBlocks(release.body);

    return await axios.post(hook, {
      text: `${release.name} has been released in ${repo.owner}/${repo.repo}`,
      blocks: [introBlock, linkBlock, ...bodyBlocks],
    });
  }
}

module.exports = { sendReleaseNotification };

exports.sendReleaseNotification = sendReleaseNotification;
