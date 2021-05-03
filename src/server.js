require("make-promises-safe") // installs an 'unhandledRejection' handler

const debug = require("debug")("api-server");
const Fastify = require("fastify")({ ignoreTrailingSlash: true });

const { MediaLive } = require("@aws-sdk/client-medialive");

const Input = require("./aws/input.js");

class GoLiveApiServer {
  constructor(opts) {
    this.aws_access_key_id = opts.aws_access_key_id;
    this.aws_secret_access_key = opts.aws_secret_access_key;

    if (!this.aws_access_key_id && !this.aws_secret_access_key) {
      throw new Error("Missing AWS credentials");
    }

    this.mediaLiveClient = new MediaLive({ region: "eu-north-1"});

    Fastify.register(require('fastify-swagger'), {
      routePrefix: '/api/docs',
      swagger: {
        info: {
          title: "Eyevinn Go Live",
          description: "API layer on top of AWS Media Services to stream live",
          version: "0.1.0"
        },
      },
      exposeRoute: true
    }); 
    
    Fastify.register(require("./api/channel.js"), {
      prefix: "/api/v1/channels",
      controller: this
    });
    Fastify.register(require("./api/healthcheck.js"), {
      prefix: "/healthcheck"
    });
    Fastify.register(require("fastify-cors"), {});
  }

  async listen(port) {
    const address = await Fastify.listen(port, "0.0.0.0");
    debug(`Listening on ${address}`);
  }

  async createChannel({ channelId }) {
    debug(`${channelId}: Creating channel`);
    // Create input
    const input = new Input(this.mediaLiveClient, { channelId: channelId });
    await input.create();

    // Attach input

    // Attach storage (create if it doesn't exist)

    // Create outputs

    const channel = {
      channel_id: channelId,
      rtmp_url: input.getRtmpUrl(),
    };
    return channel;
  }

  async removeChannel() {
    
  }

  async startChannel() {

  }

  async stopChannel() {

  }
}

module.exports = GoLiveApiServer;