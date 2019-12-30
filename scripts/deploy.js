/**
 * Copied from
 *    https://github.com/3stacks/github-actions-react-s3/blob/master/scripts/deploy.js
 *
 * Following this tutorial
 *    https://lukeboyle.com/blog-posts/2019/08/github-actions-for-web-apps/
 */

const AWS = require("aws-sdk");
const fs = require("fs");
const glob = require("glob");
const mimeTypes = require("mime-types");
require("dotenv").config();

AWS.config = new AWS.Config({
  credentials: new AWS.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }),
  region: process.env.AWS_DEFAULT_REGION
});

const s3 = new AWS.S3();

glob("./build/**/*", {}, (err, files) => {
  files.forEach(file => {
    if (!fs.lstatSync(file).isDirectory()) {
      const fileContents = fs.readFileSync(`./${file}`);
      const fileMime = mimeTypes.lookup(file);
      s3.upload(
        {
          Bucket: "kaminote",
          Key: file.replace("./build/", ""),
          Body: fileContents,
          ContentType: fileMime
        },
        { partSize: 10 * 1024 * 1024, queueSize: 1 },
        (err, data) => {
          if (err) {
            throw new Error(err.message);
          }

          console.log(data);
        }
      );
    }
  });
});
