/**
 * Reference implementation of @eyevinn/go-live API
 */

const { GoLiveApiServer } = require("./index.js");

const server = new GoLiveApiServer({
  aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
  role_arn: process.env.AWS_ROLE_ARN || "arn:aws:iam::590877988961:role/AllowMediaLiveAccessRole"
});

try {
  server.listen(process.env.PORT || 3000);
} catch (err) {
  console.error(err);
  process.exit(1);
}