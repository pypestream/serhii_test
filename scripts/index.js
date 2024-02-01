// const http = require("https");
// const fs = require("fs");
// const getMarkdownUrls = require("gh-md-urls");
// const { v2 } = require("cloudinary");

// const cloudinary = v2;

// cloudinary.config({
//   cloud_name: "dvnmehqko",
//   api_key: "473343293529714",
//   api_secret: "bE-_OiM7f8DbVP9adlVgiWQx97Q",
// });

// function getRemoteFile(file, url) {
//   try {
//     const localFile = fs.createWriteStream(file);
//     http.get(url, function (response) {
//       response.pipe(localFile);

//       localFile.on("finish", () => {
//         localFile.close();
//         console.log("Download Completed");

//         cloudinary.uploader
//           .upload(file, { use_filename: true })
//           .then((result) => {
//             console.log(
//               "%cresult------------------->",
//               "color: green; font-size: larger; font-weight: bold",
//               result
//             );
//           })
//           .catch((error) => {
//             console.log(
//               "%ccoudinary_error------------------->",
//               "color: green; font-size: larger; font-weight: bold",
//               error
//             );
//           });
//       });
//     });
//   } catch (error) {
//     console.log(
//       "%cerror------------------->",
//       "color: green; font-size: larger; font-weight: bold",
//       error
//     );
//   }
// }

// const item = {
//   name: "remote-image",
//   file: "image.png",
//   url: "https://github.com/pypestream/frontend/assets/103273897/516dbbf3-606a-4ced-9ede-bc6ff79ce00b",
// };

// getRemoteFile(item.file, item.url);

const core = require("@actions/core");
const github = require("@actions/github");
// const artifact = require("@actions/artifact");
const { replaceMdImages } = require("./replace-md-images");

// const { notify } = require("./notify");

// const uploadArtifact = async (infos) => {
//   const artifactClient = artifact.create();
//   const artifactName = "md";
//   const files = infos.map((info) => info.newFileName);
//   console.log(`artifact: ${JSON.stringify(files)}`);
//   const rootDirectory = process.cwd();
//   const options = {
//     continueOnError: false,
//   };

//   const uploadResult = await artifactClient.uploadArtifact(
//     artifactName,
//     files,
//     rootDirectory,
//     options
//   );
//   return uploadResult;
// };

const run = async () => {
  //   const token = core.getInput("token"); // githubtoken
  const token = process.env.NPM_TOKEN;
  console.log(
    "%ctoken------------------->",
    "color: green; font-size: larger; font-weight: bold",
    token
  );
  //   const secretId = core.getInput("secretId");
  //   const secretKey = core.getInput("secretKey");
  //   const bucket = core.getInput("bucket");
  //   const region = core.getInput("region");
  //   const prefix = core.getInput("prefix");
  //   const mdfile = core.getInput("mdfile");
  //   const webhookUrl = core.getInput("webhookUrl");
  const webhookUrl = process.env.SLACK_PRERELEASE_WEBHOOK_URL;

  const octokit = new github.getOctokit(token);

  try {
    const {
      context: {
        payload: { release },
      },
    } = github;
    const repo = github.context.repo;
    console.log(`repo: ${JSON.stringify(repo)}`);
    console.log(`sha: ${github.context.sha}`);

    console.log(
      "%crelease------------------->",
      "color: green; font-size: larger; font-weight: bold",
      release
    );

    const res = await octokit.request(
      //   "GET /repos/{owner}/{repo}/commits/{ref}",
      //   "GET /repos/{owner}/{repo}/releases/{release_id}",
      "GET /repos/{owner}/{repo}/assets/103273897",
      {
        owner: repo.owner,
        repo: repo.repo,
        release_id: release.id,
        // ref: github.context.ref,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    console.log(
      "%cres------------------->",
      "color: green; font-size: larger; font-weight: bold",
      res
    );
    // let mdfiles = res.data.files
    //   .filter(
    //     (file) => file.status !== "removed" && file.filename.endsWith(".md")
    //   )
    //   .map((file) => file.filename);
    // console.log(`markdown files: ${JSON.stringify(mdfiles, undefined, 2)}`);

    // const cosOptions = {
    //   secretId,
    //   secretKey,
    //   bucket,
    //   region,
    //   prefix,
    // };
    // const infos = await Promise.all(
    //   mdfiles.map(async (mdfile) => {
    //     const { newFileName, previewUrl, newContent } = await replaceMdImages(
    //       mdfile
    //       //   cosOptions
    //     );
    //     return {
    //       filename: mdfile,
    //       newFileName: newFileName,
    //       previewUrl,
    //       newContent,
    //     };
    //   })
    // );
    // console.log(
    //   `previewUrl: ${JSON.stringify(infos.map((info) => info.previewUrl))}`
    // );
    // if (infos.length > 0) {
    //   const result = uploadArtifact(infos);
    //   console.log(`result: ${JSON.stringify(result)}`);
    //   if (webhookUrl) {
    //     notify(infos, webhookUrl);
    //   }
    // }
    // core.setOutput("result", infos);
  } catch (error) {
    core.setFailed(`run error: ${error.message}`);
  }
};

run();
