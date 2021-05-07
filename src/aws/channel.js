const debug = require("debug")("api-channel");
const { nanoid } = require("nanoid");
const Input = require("./input.js");
const MediaPackageChannel = require("./media_package_channel.js");
const { ListChannels } = require("./wrapper.js");

const { ChannelNotFoundError } = require("../errors.js");

const CreateChannel = (client, params) => {
  return new Promise((resolve, reject) => {
    client.createChannel(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

const DeleteChannel = (client, params) => {
  return new Promise((resolve, reject) => {
    client.deleteChannel(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });  
}

const GetChannelByName = async (client, name) => {
  const data = await ListChannels(client, {});
  const channel = data.Channels.find(ch => ch.Name === name);
  return channel;
}

const StartChannel = (client, params) => {
  return new Promise((resolve, reject) => {
    client.startChannel(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

const StopChannel = (client, params) => {
  return new Promise((resolve, reject) => {
    client.stopChannel(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

const VideoDescription = ({ name, maxBitrate, frameRate, height, width }) => {
  return {
    CodecSettings: { 
      H264Settings: {
        AfdSignaling: "NONE",
        ColorMetadata: "INSERT",
        Syntax: "DEFAULT",
        AdaptiveQuantization: "HIGH",
        FramerateControl: "SPECIFIED",
        FramerateDenominator: frameRate[1],
        FramerateNumerator: frameRate[0],
        GopSize: 2,
        GopSizeUnits: "SECONDS",
        Level: "H264_LEVEL_AUTO",
        LookAheadRateControl: "MEDIUM",
        MaxBitrate: maxBitrate,
        ParControl: "SPECIFIED",
        ParDenominator: 1,
        ParNumerator: 1,
        QvbrQualityLevel: 7,
        RateControlMode: "QVBR",
        SceneChangeDetect: "ENABLED",
        TimecodeInsertion: "DISABLED",
        Profile: "HIGH",
        FlickerAq: "ENABLED",
        ForceFieldPictures: "DISABLED",
        SpatialAq: "ENABLED",
        TemporalAq: "ENABLED",
        GopBReference: "DISABLED",
      }
    },
    Name: name,
    Height: height,
    Width: width,
  };
};

const AudioDescription = ({ name, bitrate, sampleRate }) => {
  return { 
    CodecSettings: {
      AacSettings: {
        InputType: "NORMAL",
        RawFormat: "NONE",
        Spec: "MPEG4",
        Bitrate: bitrate,
        SampleRate: sampleRate,
        CodingMode: "CODING_MODE_2_0",
        RateControlMode: "CBR",
        Profile: "LC",
      }
    },
    AudioTypeControl: "FOLLOW_INPUT",
    LanguageCodeControl: "FOLLOW_INPUT",
    Name: name,
    AudioSelectorName: name,
  };
};

const InputSettings = () => {
  return {
    InputFilter: "AUTO",
    FilterStrength: 1,
    DeblockFilter: "DISABLED",
    DenoiseFilter: "DISABLED",
    Smpte2038DataPreference: "IGNORE",
    SourceEndBehavior: "CONTINUE",
    AudioSelectors: [],
    CaptionSelectors: [], 
  };
};

class Channel {
  constructor(client, mediaPackageClient, { channelId }) {
    this.client = client;
    this.mediaPackageClient = mediaPackageClient;
    this.channelId = channelId;
  }

  async create({ input, mediaPackageChannelId, roleArn }) {
    const destinationId = nanoid(6);

    const channelParams = {
      Name: this.channelId,
      RoleArn: roleArn,
      ChannelClass: "STANDARD",
      LogLevel: "INFO",
      Destinations: [ { 
        Id: destinationId,
        Settings: [],
        MediaPackageSettings: [ { ChannelId: mediaPackageChannelId } ]
      } ],
      EncoderSettings: {
        TimecodeConfig: {
          Source: "EMBEDDED",
        },
        AudioDescriptions: [ 
          AudioDescription({ name: "audio_48000_128k", bitrate: 128000, sampleRate: 48000 }),
        ],
        VideoDescriptions: [ 
          VideoDescription({ name: "video_224_250k", maxBitrate: 250000, width: 400, height: 224, frameRate: [15, 1]}),
          VideoDescription({ name: "video_540_1800k", maxBitrate: 1800000, width: 960, height: 540, frameRate: [30, 1]}),
          VideoDescription({ name: "video_720_3500k", maxBitrate: 3500000, width: 1280, height: 720, frameRate: [30, 1]}),
        ],
        CaptionDescriptions: [],
        OutputGroups: [ {
          Name: this.mediaPackageChannel,
          OutputGroupSettings: {
            MediaPackageGroupSettings: {
              Destination: { 
                DestinationRefId: destinationId 
              }
            }
          },
          Outputs: [ {
            OutputName: "400x224",
            AudioDescriptionNames: [ "audio_48000_128k" ],
            VideoDescriptionName: "video_224_250k",
            CaptionDescriptionNames: [],
            OutputSettings: { MediaPackageOutputSettings: {} }
          }, {
            OutputName: "960x540",
            AudioDescriptionNames: [ "audio_48000_128k" ],
            VideoDescriptionName: "video_540_1800k" ,
            CaptionDescriptionNames: [],
            OutputSettings: { MediaPackageOutputSettings: {} }
          }, {
            OutputName: "1280x720",
            AudioDescriptionNames: [ "audio_48000_128k" ],
            VideoDescriptionName: "video_720_3500k",
            CaptionDescriptionNames: [],
            OutputSettings: { MediaPackageOutputSettings: {} }
          }]
        }],
        GlobalConfiguration: { }
      },
      InputAttachments: [ {
        InputId: input.getInputId(),
        InputAttachmentName: input.getInputName(),
        InputSettings: InputSettings(),
      } ],
      InputSpecification: {
        Codec: "AVC",
        MaximumBitrate: "MAX_10_MBPS",
        Resolution: "HD"
      },
    };
    const data = await CreateChannel(this.client, channelParams);
    debug("Success", data);
    this.data = data;
  }

  async exists() {
    const channel = await this.details();
    return (channel !== null);
  }

  async details() {
    const channel = await GetChannelByName(this.client, this.channelId);
    if (channel) {
      const input = new Input(this.client, { channelId: this.channelId, inputId: channel.InputAttachments[0].InputId });
      await input.details();
      const mediaPackageChannel = new MediaPackageChannel(this.mediaPackageClient, { channelId: channel.Destinations[0].MediaPackageSettings[0].ChannelId });
      const mediaPackageChannelEndpoints = await mediaPackageChannel.endpoints();
      const hlsPackages = mediaPackageChannelEndpoints.OriginEndpoints.filter(ep => ep.HlsPackage !== undefined);
      this.data = {
        Channel: channel
      };
      return {
        channel_id: channel.Name,
        rtmp_urls: input.getRtmpUrls(),
        hls_urls: hlsPackages.map(pkg => pkg.Url)
      }
    }
    return null;
  }

  async delete() {
    const channel = await GetChannelByName(this.client, this.channelId);
    if (channel) {
      debug(`${this.channelId}: Removing channel`);
      const data = await DeleteChannel(this.client, { ChannelId: channel.Id });
      const input = new Input(this.client, { channelId: this.channelId, inputId: data.InputAttachments[0].InputId });
      await input.delete();
    } else {
      throw new ChannelNotFoundError(`Could not find channel "${this.channelId}"`);
    }
  }

  async start() {
    const channel = await GetChannelByName(this.client, this.channelId);
    if (channel) {
      await StartChannel(this.client, { ChannelId: channel.Id });
    } else {
      throw new ChannelNotFoundError(`Could not find channel "${this.channelId}"`);
    }
  }

  async stop() {
    const channel = await GetChannelByName(this.client, this.channelId);
    if (channel) {
      await StopChannel(this.client, { ChannelId: channel.Id });
    } else {
      throw new ChannelNotFoundError(`Could not find channel "${this.channelId}"`);
    }
  }
}

module.exports = Channel;