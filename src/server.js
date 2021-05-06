require("make-promises-safe") // installs an 'unhandledRejection' handler

const debug = require("debug")("api-server");
const Fastify = require("fastify")({ ignoreTrailingSlash: true });
const AWS = require("aws-sdk");

const Channel = require("./aws/channel.js");
const Input = require("./aws/input.js");

const { StartChannel, StopChannel, ListChannels, DeleteChannel, 
  DeleteInput, GetChannelByName, GetInputById, WaitForInputToBeDetached } = require("./aws/wrapper.js");

const { ChannelNotFoundError } = require("./errors.js");

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

  async getChannelDetails({ channelId }) {
    const channel = await GetChannelByName(this.mediaLiveClient, channelId);
    if (channel) {
      const input = await GetInputById(this.mediaLiveClient, channel.InputAttachments[0].InputId);
      return {
        channel_id: channel.Name,
        rtmp_urls: input.Destinations.map(d => d.Url)
      }
    } else {
      throw new ChannelNotFoundError(`Could not find channel "${channelId}"`);
    }
  }

  async removeChannel({ channelId }) {
    const channel = await GetChannelByName(this.mediaLiveClient, channelId);
    if (channel) {
      debug(`${channelId}: Removing channel`);
      const data = await DeleteChannel(this.mediaLiveClient, { ChannelId: channel.Id });
      await WaitForInputToBeDetached(this.mediaLiveClient, data.InputAttachments[0].InputId);
      await DeleteInput(this.mediaLiveClient, { InputId: data.InputAttachments[0].InputId });
    } else {
      throw new ChannelNotFoundError(`Could not find channel "${channelId}"`);
    }
  }

  async startChannel({ channelId }) {
    const channel = await GetChannelByName(this.mediaLiveClient, channelId);
    if (channel) {
      await StartChannel(this.mediaLiveClient, { ChannelId: channel.Id });
      return {
        status: "STARTED"
      }        
    } else {
      throw new ChannelNotFoundError(`Could not find channel "${channelId}"`);
    }
  }

  async stopChannel({ channelId }) {
    const channel = await GetChannelByName(this.mediaLiveClient, channelId);
    if (channel) {
      await StopChannel(this.mediaLiveClient, { ChannelId: channel.Id });
      return {
        status: "STOPPED"
      }
    } else {
      throw new ChannelNotFoundError(`Could not find channel "${channelId}"`);
    }
  }
}

module.exports = GoLiveApiServer;