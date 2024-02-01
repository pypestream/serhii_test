// import { IncomingWebhook } from "@slack/webhook";
// import { markdownToBlocks } from "@instantish/mack";

const { IncomingWebhook } = require("@slack/webhook");
const { markdownToBlocks } = require("@instantish/mack");
const { v2 } = require("cloudinary");

const cloudinary = v2;

cloudinary.config({
  cloud_name: "dvnmehqko",
  api_key: "473343293529714",
  api_secret: "bE-_OiM7f8DbVP9adlVgiWQx97Q",
});

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

  // console.log("release: ", JSON.stringify(release, null, 2));

  const slackWebhook = new IncomingWebhook(webhook);
  const bodyBlocks = await markdownToBlocks(release.body);
  const owner = repo.owner.charAt(0).toUpperCase() + repo.owner.slice(1);
  const repositoryName = repo.repo.charAt(0).toUpperCase() + repo.repo.slice(1);

  const images = bodyBlocks
    .filter((block) => block.type === "image")
    .map((block) => ({ url: block.image_url, name: block.alt_text }));

  // const results = await Promise.all(
  //   images.map(({ url, name }) => {
  //     return new Promise((resolve, reject) => {
  //       cloudinary.uploader
  //         .upload(url, { public_id: name })
  //         .then((result) => {
  //           resolve(result.url);
  //         })
  //         .catch((error) => reject(error));
  //     });
  //   })
  // );

  const body = await Promise.all(
    bodyBlocks.map((block) => {
      if (block.type !== "image") {
        return new Promise((resolve) => resolve(block));
      }

      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload(block.image_url, { public_id: block.alt_text })
          .then((result) => {
            resolve(result);
          })
          .catch((error) => reject(error));
      });
    })
  );

  console.log("BODY: ", JSON.stringify(body));

  const message = {
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
      ...body,
    ],
  };

  console.log("MESSAGE: ", JSON.stringify(message, null, 2));

  // await slackWebhook.send(message);
}

module.exports = { sendReleaseNotification };

exports.sendReleaseNotification = sendReleaseNotification;

// "body": "![14-47](https://github.com/pypestream/serhii_test/assets/103273897/761d80f4-e52b-4d2a-a21b-4c86933a10e6)\r\n",
