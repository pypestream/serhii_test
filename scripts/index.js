const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const { uuid } = require("uuidv4");
const IncomingWebhook = require("@slack/webhook").IncomingWebhook;
const https = require("https");

cloudinary.config({
  cloud_name: "dvnmehqko",
  api_key: "473343293529714",
  api_secret: "bE-_OiM7f8DbVP9adlVgiWQx97Q",
});

// const downloadImage = async (path) => {
//   const options = {
//     hostname: "github.com",
//     path: "/davaynamore/sandbox/assets/15155397/074f02db-c6d6-4c9c-b09a-1e5cbcf6836b",
//     headers: {
//       Authorization: "token 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",
//       Accept: "application/vnd.github.v3.raw",
//     },
//   };

//   const req = https.get(options, function (res) {
//     console.log(
//       "%cres------------------->",
//       "color: green; font-size: larger; font-weight: bold",
//       res
//     );
//     const chunks = [];

//     res.on("data", function (chunk) {
//       chunks.push(chunk);
//     });

//     res.on("end", function () {
//       const body = Buffer.concat(chunks);
//       console.log("Message: ", body.toString());
//     });
//   });
// };

const downloadImage = async (path) => {
  return await fetch(path, {
    headers: {
      Authorization: `token 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`,
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
      const filename = `${uuid()}.jpg`;

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filename, buffer);

      return filename;
    })
    .catch((error) => {
      console.log("Download Error: ", error);
    });
};

const uploadImage = async (filename) => {
  return await cloudinary.uploader
    .upload(filename, { use_filename: true, unique_filename: true })
    .then((result) => {
      console.log(`File is uploaded. ${JSON.stringify(result.url)}`);
      const imageBlock = {
        type: "image",
        image_url: result.url,
        alt_text: result.public_id,
      };
      console.log(imageBlock);
      return imageBlock;
    })
    .catch((error) => {
      console.log("Upload Error: ", error);
    })
    .finally(() => {
      // delete local file
      // console.log("Deleting local file...");
      // fs.unlink(filename, (err) => {
      //   if (err) {
      //     console.log("Delete file Error: ", err);
      //   } else {
      //     console.log(`File is deleted. ${filename}`);
      //   }
      // });
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
      // body,
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
    "https://github.com/davaynamore/sandbox/assets/15155397/9320d1bb-8e2d-4c1f-b7c3-c251b29a1ab4";
  // const filename = await downloadImage(imageUrl);

  // if (!filename) {
  //   console.log("No filename");
  //   return;
  // }

  // const result = await uploadImage(filename);

  const prerelease = true;

  const message = createSlackMessage({}, prerelease);
  sendToSlack(message, prerelease);
}

run();
