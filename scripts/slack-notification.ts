import * as fs from "fs";
import * as core from "@actions/core";
import * as github from "@actions/github";
import { IncomingWebhook } from "@slack/webhook";
import { markdownToBlocks } from "@instantish/mack";
import { v2 as cloudinary } from "cloudinary";

interface Repository {
  repo: string;
  owner: string;
}

interface Release {
  assets: unknown[];
  assets_url: string;
  author: Author;
  body: string;
  created_at: string;
  draft: boolean;
  html_url: string;
  id: number;
  name: string;
  node_id: string;
  prerelease: boolean;
  published_at: string;
  tag_name: string;
  tarball_url: string;
  target_commitish: string;
  upload_url: string;
  url: string;
  zipball_url: string;
}

interface Author {
  avatar_url: string;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string;
  html_url: string;
  id: number;
  login: string;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
}

const preReleaseWebhook = process.env.SLACK_PRERELEASE_WEBHOOK_URL;
const releaseDevWebhook = process.env.SLACK_RELEASE_DEV_WEBHOOK_URL;
const releaseWebhook = process.env.SLACK_RELEASE_WEBHOOK_URL;
const ghToken = process.env.NPM_TOKEN;
const cloudName = process.env.CLOUDINARY_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
});

const downloadImage = async (path: string) => {
  return await fetch(path, {
    headers: {
      Authorization: `token ${ghToken}`,
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

async function run(): Promise<void> {
  console.log("start notification creation process");
  try {
    const {
      context: {
        eventName,
        repo,
        payload: { release: _release },
      },
    } = github;

    const repository: Repository = repo;
    const release: Release = _release;

    console.log("checking GitHub event type...");
    if (eventName !== "release") {
      core.setFailed("Action should only be run on release publish events");
    }

    const { prerelease } = release;
    const webhooks = prerelease
      ? [preReleaseWebhook]
      : [releaseWebhook, releaseDevWebhook];

    // transform markdown to slack blocks
    const bodyBlocks = await markdownToBlocks(release.body);
    const owner =
      repository.owner.charAt(0).toUpperCase() + repository.owner.slice(1);
    const repositoryName =
      repository.repo.charAt(0).toUpperCase() + repository.repo.slice(1);

    console.log("Start notification generation...");
    const body = (await Promise.all(
      bodyBlocks.map(async (block) => {
        if (block.type !== "image") {
          return new Promise((resolve) => resolve(block));
        }

        console.log(`dowloading image ${block.image_url}...`);
        // download image to local file
        const filename = await downloadImage(block.image_url);

        if (!filename) {
          console.log("No filename found!");
          throw new Error("No filename found");
        }

        console.log(`image downloaded ${filename}...`);

        return new Promise((resolve, reject) => {
          // upload image to cloudinary
          console.log(`uploading image to cloudinary (${filename}...`);
          cloudinary.uploader
            .upload(filename, { use_filename: true, unique_filename: true })
            .then((result) => {
              // delete local file
              console.log("Deleting local file...");
              fs.unlink(filename, (err) => {
                if (err) {
                  reject(err);
                } else {
                  console.log(
                    `File is deleted. ${filename}(${block.image_url})`
                  );
                }
              });
              console.log(
                `File is uploaded. ${JSON.stringify(result.secure_url)}`
              );
              resolve({
                type: "image",
                image_url: result.secure_url,
                alt_text: result.public_id,
              });
            })
            .catch((error) => {
              reject(error);
            });
        });
      })
    )) as typeof bodyBlocks;

    const bodyBlocksLimit = 50;
    const message = {
      text: `${owner} ${repositoryName} ${release.tag_name} Released ${
        prerelease ? "(candidate)" : ""
      }!`,
      icon_emoji: ":rocket:",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${owner} ${repositoryName} ${
              release.tag_name
            } has been Released ${prerelease ? "(candidate)" : ""}! :rocket:`,
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
      ].slice(0, bodyBlocksLimit),
    };

    console.log(`Sending notification...`);

    webhooks.forEach(async (webhook) => {
      if (!webhook) {
        throw new Error(
          `No webhook URL found for ${
            prerelease ? "pre-release" : "release"
          } notification`
        );
      }

      const slackWebhook = new IncomingWebhook(webhook);

      await slackWebhook.send(message);
    });

    console.log("Success. Notification sent");
  } catch (error) {
    console.error(`Error: ${JSON.stringify(error, null, 2)}`);
    core.setFailed(error.message);
  }
}

run();
