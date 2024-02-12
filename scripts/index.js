const cloudinary = require("cloudinary").v2;
const IncomingWebhook = require("@slack/webhook").IncomingWebhook;

cloudinary.config({
  cloud_name: "dvnmehqko",
  api_key: "473343293529714",
  api_secret: "bE-_OiM7f8DbVP9adlVgiWQx97Q",
});

const downloadImage = async (path) => {
  return await fetch(path, {
    headers: {
      Authorization: `token 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`,
      Accept: "application/vnd.github.v3.raw",
    },
  })
    .then(async (response) => {
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64buffer = Buffer.from(arrayBuffer).toString("base64");
      return `data:image/jpeg;base64,${base64buffer}`;
    })
    .catch((error) => {
      console.log("Download Error: ", error);
    });
};

const uploadImage = async (filename) => {
  return await cloudinary.uploader
    .upload(filename, { use_filename: true, unique_filename: true })
    .then((result) => {
      console.log(`File is uploaded. ${JSON.stringify(result.secure_url)}`);
      const imageBlock = {
        type: "image",
        image_url: result.secure_url,
        alt_text: result.public_id,
      };
      console.log(imageBlock);
      return imageBlock;
    })
    .catch((error) => {
      console.log("Upload Error: ", error);
    });
};

const createSlackMessage = (body, prerelease = false) => {
  return {
    timeout: 0,
    text: "Davaynamore Sandbox v1.0.19 Released (candidate)!",
    icon_emoji: ":rocket:",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `Davaynamore Sandbox v1.0.19 has been Released ${
            prerelease ? "candidate" : ""
          }! :rocket:`,
          emoji: true,
        },
      },
      body,
    ],
  };
};

const sendToSlack = (message, prerelease = false) => {
  const preReleaseWebhook =
    "https://hooks.slack.com/services/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";
  const releaseDevWebhook = preReleaseWebhook;
  const releaseWebhook =
    "https://hooks.slack.com/services/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";
  const webhooks = prerelease
    ? [preReleaseWebhook]
    : [releaseWebhook, releaseDevWebhook];
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
};

async function run() {
  const imageUrl =
    "https://images.pexels.com/photos/2071882/pexels-photo-2071882.jpeg?cs=srgb&dl=pexels-wojciech-kumpicki-2071882.jpg&fm=jpg";
  const filename = await downloadImage(imageUrl);

  if (!filename) {
    console.log("No filename");
    return;
  }

  const result = await uploadImage(filename);

  if (!result) {
    console.log("File didn't uploaded");
    return;
  }

  const prerelease = false;

  const message = createSlackMessage(result, prerelease);
  sendToSlack(message, prerelease);
}

run();
