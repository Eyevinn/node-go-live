/**
 * Reference implementation of @eyevinn/go-live API
 */

const { GoLiveApiServer } = require("./index.js");

const server = new GoLiveApiServer({
  aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY
});

try {
  server.listen(process.env.PORT || 3000);
} catch (err) {
  console.error(err);
  process.exit(1);
}