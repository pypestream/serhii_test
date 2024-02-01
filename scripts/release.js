// https://github.com/tryfabric/notify-slack-on-release/blob/main/src/send-release-notification.ts
const core = require("@actions/core");
const github = require("@actions/github");
const { markdownToBlocks } = require("@instantish/mack");

const { IncomingWebhook } = require("@slack/webhook");
const { v2 } = require("cloudinary");

const cloudinary = v2;

cloudinary.config({
  cloud_name: "dvnmehqko",
  api_key: "473343293529714",
  api_secret: "bE-_OiM7f8DbVP9adlVgiWQx97Q",
});

// https://github.com/pypestream/frontend/assets/103273897/516dbbf3-606a-4ced-9ede-bc6ff79ce00b"

const preReleaseWebhook = process.env.SLACK_PRERELEASE_WEBHOOK_URL;
const releaseDevWebhook = process.env.SLACK_RELEASE_DEV_WEBHOOK_URL;
const releaseWebhook = process.env.SLACK_RELEASE_WEBHOOK_URL;
const npmToken = process.env.NPM_TOKEN;

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

    console.log(
      "%crelease------------------->",
      "color: green; font-size: larger; font-weight: bold",
      release
    );

    const isPreRelease = release.prerelease;
    const webhooks = isPreRelease
      ? [preReleaseWebhook]
      : [releaseWebhook, releaseDevWebhook];

    const bodyBlocks = await markdownToBlocks(release.body);
    const owner = repo.owner.charAt(0).toUpperCase() + repo.owner.slice(1);
    const repositoryName =
      repo.repo.charAt(0).toUpperCase() + repo.repo.slice(1);

    const body = await Promise.all(
      bodyBlocks.map((block) => {
        if (block.type !== "image") {
          return new Promise((resolve) => resolve(block));
        }

        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload(block.image_url, { public_id: block.alt_text })
            .then((result) => {
              resolve({
                type: "image",
                image_url: result.url,
                alt_text: result.public_id,
              });
            })
            .catch((error) => reject(error));
        });
      })
    );

    const message = {
      text: `${owner} ${repositoryName} ${release.tag_name} Released ${
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
            } has been Released ${isPreRelease ? "(candidate)" : ""}! :rocket:`,
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
        ...body,
      ],
    };

    console.log("MESSAGE: ", JSON.stringify(message, null, 2));

    webhooks.forEach(async (webhook) => {
      if (!webhook) {
        throw new Error(
          `No webhook URL found for ${
            isPreRelease ? "pre-release" : "release"
          } notification`
        );
      }

      const slackWebhook = new IncomingWebhook(webhook);

      await slackWebhook.send(message);
    });

    console.log("Sent notification");
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${JSON.stringify(error, null, 2)}`);
      core.setFailed(error.message);
    }
  }
}

run();
