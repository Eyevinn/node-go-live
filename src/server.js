require("make-promises-safe") // installs an 'unhandledRejection' handler

const debug = require("debug")("api-server");
const Fastify = require("fastify")({ ignoreTrailingSlash: true });
const AWS = require("aws-sdk");

const Channel = require("./aws/channel.js");
const Input = require("./aws/input.js");

const { StartChannel, StopChannel, ListChannels } = require("./aws/wrapper.js");

class GoLiveApiServer {
  constructor(opts) {
    this.aws_access_key_id = opts.aws_access_key_id;
    this.aws_secret_access_key = opts.aws_secret_access_key;
    this.aws_region = opts.aws_region || "eu-north-1";
    this.role_arn = opts.role_arn;

    if (!this.aws_access_key_id && !this.aws_secret_access_key) {
      throw new Error("Missing AWS credentials");
    }

    this.mediaLiveClient = new AWS.MediaLive({ 
      region: this.aws_region,
      aws_access_key_id: this.aws_access_key_id,
      aws_secret_access_key: this.aws_secret_access_key,
    });

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

  async createChannel({ channelId, mediaPackageChannel, whiteListRules }) {    
    const input = new Input(this.mediaLiveClient, { channelId: channelId, whiteListRules: whiteListRules });
    if (!(await input.exists())) {
      debug(`${channelId}: Creating input`);
      await input.create();
    }

    const channel = new Channel(this.mediaLiveClient, 
      { channelId: channelId, input: input, mediaPackageChannel: mediaPackageChannel, roleArn: this.role_arn });
    if (!(await channel.exists())) {
      debug(`${channelId}: Creating channel`);
      await channel.create();
    }

    return {
      channel_id: channelId,
      rtmp_urls: input.getRtmpUrls(),
    };
  }

  async listChannels() {
    const data = await ListChannels(this.mediaLiveClient, {});
    const channels = data.Channels.map(ch => {
      return { 
        channel_id: ch.Name
      }
    });
    return channels;
  }

  async removeChannel() {
    
  }

  async startChannel({ channelId }) {
    const data = await ListChannels(this.mediaLiveClient, {});
    const channel = data.Channels.find(ch => ch.Name === channelId);
    if (channel) {
      await StartChannel(this.mediaLiveClient, { ChannelId: channel.Id });
      return {
        status: "STARTED"
      }        
    } else {
      throw new Error(`Could not find channel "${channelId}"`);
    }
  }

  async stopChannel({ channelId }) {
    const data = await ListChannels(this.mediaLiveClient, {});
    const channel = data.Channels.find(ch => ch.Name === channelId);
    if (channel) {
      await StopChannel(this.mediaLiveClient, { ChannelId: channel.Id });
      return {
        status: "STOPPED"
      }
    } else {
      throw new Error(`Could not find channel "${channelId}"`);
    }
  }
}

module.exports = GoLiveApiServer;