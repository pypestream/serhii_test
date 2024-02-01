const fetch = require("node-fetch");

const notify = async (infos, webhookUrl) => {
  let links = infos.map((info) => `[${info.previewUrl}](${info.previewUrl})`);
  if (links.length > 1) {
    links = links.map((link, index) => `${index + 1}. ${link}`);
  }
  const content = `### New article is ready:\n\n${links.join(
    "\n"
  )}\n\nYou can enter the [Typesetting page](https://markdown.com.cn/editor/)Check the effect`;
  const res = await fetch(webhookUrl, {
    method: "POST",
    body: JSON.stringify({
      msgtype: "markdown",
      markdown: { content },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await res.json();
  console.log(`notify response: ${JSON.stringify(json)}`);
};

module.exports = {
  notify,
};
