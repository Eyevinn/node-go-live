# Eyevinn Go Live

The `@eyevinn/go-live` NPM library provides the functionality to build an API layer on top of AWS Media Services to automate and simplify setting up a media pipeline for live using RTMP as the video signal contribution protocol.

```
RTMP -> MediaLive -> MediaPackage -> HLS
```

## Example on how to use it

Install dependency

```
npm install --save @eyevinn/go-live
```

Example implementation

```
/**
 * Reference implementation of @eyevinn/go-live API
 */

const { GoLiveApiServer } = require("@eyevinn/go-live");

const server = new GoLiveApiServer({
  aws_access_key_id: <AWS_ACCESS_KEY_ID>,
  aws_secret_access_key: <AWS_SECRET_ACCESS_KEY>,
  role_arn:  "arn:aws:iam::590877988961:role/AllowMediaLiveAccessRole"
});

try {
  server.listen(process.env.PORT || 3000);
} catch (err) {
  console.error(err);
  process.exit(1);
}
```

Run it

```
node server.js
```

## API

API docs (Swagger) is then available at `/api/docs`:

| Method | Url                            | Description |
| ------ | ------------------------------ | ----------- |
| POST   | `/api/v1/channels`             | Create and setup a channel |
| GET    | `/api/v1/channels`             | List channels |
| GET    | `/api/v1/channels/{channelId}` | Describe a channel |
| DELETE | `/api/v1/channels/{channelId}` | Remove a channel |
| PUT    | `/api/v1/channels/{channelId}` | Start or stop a channel |


### Examples

Create a channel
```
curl -X 'POST' \
  'http://localhost:3000/api/v1/channels' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "channel_id": "example1",
  "whitelist": "0.0.0.0/0",
  "media_package_channel": "eyevinn"
}'

{
  "channel_id": "example1",
  "rtmp_urls": [
    "rtmp://13.51.185.200:1935/example1A",
    "rtmp://13.51.225.136:1935/example1B"
  ],
  "hls_urls": [
    "https://e85dc9675199b759.mediapackage.eu-north-1.amazonaws.com/out/v1/84f7f98eb236463aa24a283282355e0d/index.m3u8"
  ]
}
```

Remove a channel
```
curl -X 'DELETE' \
  'http://localhost:3000/api/v1/channels/example1' \
  -H 'accept: application/json'
```