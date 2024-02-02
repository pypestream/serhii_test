// https://github.com/tryfabric/notify-slack-on-release/blob/main/src/send-release-notification.ts
const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const { markdownToBlocks } = require("@instantish/mack");
const { IncomingWebhook } = require("@slack/webhook");
const { v2 } = require("cloudinary");

const cloudinary = v2;

const preReleaseWebhook = process.env.SLACK_PRERELEASE_WEBHOOK_URL;
const releaseDevWebhook = process.env.SLACK_RELEASE_DEV_WEBHOOK_URL;
const releaseWebhook = process.env.SLACK_RELEASE_WEBHOOK_URL;
const npmToken = process.env.NPM_TOKEN;
const cloudName = process.env.CLOUDINARY_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
});

const downloadImage = async (url) => {
  return await fetch(url, {
    headers: {
      Authorization: `token ${npmToken}`,
      Accept: "application/vnd.github.v3.raw",
    },
  })
    .then(async (response) => {
      // get rid of extra url params in response
      const { url } = response;
      const urlObj = new URL(url);
      urlObj.search = "";
      const urlResult = urlObj.toString();

      // grab just the filename
      const filename = urlResult.substring(urlResult.lastIndexOf("/") + 1);

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filename, buffer);

      return filename;
    })
    .catch((error) => {
      console.log(error);
    });
};

async function run() {
  try {
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

    const isPreRelease = release.prerelease;
    const webhooks = isPreRelease
      ? [preReleaseWebhook]
      : [releaseWebhook, releaseDevWebhook];

    const bodyBlocks = await markdownToBlocks(release.body);
    const owner = repo.owner.charAt(0).toUpperCase() + repo.owner.slice(1);
    const repositoryName =
      repo.repo.charAt(0).toUpperCase() + repo.repo.slice(1);

    const body = await Promise.all(
      bodyBlocks.map(async (block) => {
        if (block.type !== "image") {
          return new Promise((resolve) => resolve(block));
        }

        const filename = await downloadImage(block.image_url);

        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload(filename, { public_id: block.alt_text })
            .then((result) => {
              fs.unlink(filename);
              resolve({
                type: "image",
                image_url: result.url,
                alt_text: result.public_id,
              });
            })
            .catch((error) => {
              reject(error);
            });
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

    // console.log("MESSAGE: ", JSON.stringify(message, null, 2));

    console.log(`Sending notification...`);

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
