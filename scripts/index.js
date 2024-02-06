// import { v2 as cloudinary } from "cloudinary";
// import * as fs from "fs";

const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: "dvnmehqko",
  api_key: "473343293529714",
  api_secret: "bE-_OiM7f8DbVP9adlVgiWQx97Q",
});

function generateUniqueFileName(length) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return `${result}_${new Date().getTime()}`;
}

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

const uploadImage = (filename, imageName) => {
  cloudinary.uploader
    .upload(filename, { use_filename: true, unique_filename: true })
    .then((result) => {
      // delete local file
      console.log("Deleting local file...");
      fs.unlink(filename, (err) => {
        if (err) {
          console.log("Error: ", err);
        } else {
          console.log(`File is deleted. ${filename}`);
        }
      });
      console.log(`File is uploaded. ${JSON.stringify(result.url)}`);
      console.log({
        type: "image",
        image_url: result.url,
        alt_text: result.public_id,
      });
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
};

async function run() {
  const imageUrl =
    "https://github.com/davaynamore/sandbox/assets/15155397/9320d1bb-8e2d-4c1f-b7c3-c251b29a1ab4";
  const filename = await downloadImage(imageUrl);

  if (!filename) {
    console.log("No filename");
    return;
  }

  const imageName = generateUniqueFileName(10);
  uploadImage(filename, imageName);
}

run();
