const debug = require("debug")("api-channel");
const { nanoid } = require("nanoid");

const { CreateChannelCommand } = require("@aws-sdk/client-medialive");

const VideoDescription = ({ name, maxBitrate, frameRate, height, width }) => {
  return {
    CodecSettings: { 
      H264Settings: {
        AfdSignaling: "NONE",
        ColorMetadata: "INSERT",
        EntropyCoding: "CABAC",
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
    Name: name
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
  constructor(client, { channelId, input, mediaPackageChannel, roleArn }) {
    this.client = client;
    this.channelId = channelId;
    this.input = input;
    this.mediaPackageChannel = mediaPackageChannel;
    this.roleArn = roleArn;
  }

  async create() {
    const destinationId = nanoid(6);

    const channelParams = {
      Name: "CHANNEL_" + this.channelId,
      RoleArn: this.roleArn,
      ChannelClass: "SINGLE_PIPELINE",
      LogLevel: "INFO",
      Destinations: [ { 
        Id: destinationId,
        Settings: [],
        MediaPackageSettings: [ { ChannelId: this.mediaPackageChannel } ]
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
          OuputGroupSettings: {
            MediaPackageGroupSettings: {
              Destination: { DestinationRefId: destinationId }
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
        InputId: this.input.getInputId(),
        InputAttachmentName: this.input.getInputName(),
        InputSettings: InputSettings(),
      } ],
      InputSpecification: {
        Codec: "AVC",
        MaximumBitrate: "MAX_10_MBPS",
        Resolution: "HD"
      },
    };
    debug(channelParams);
    const data = await this.client.send(new CreateChannelCommand(channelParams));
    debug("Success", data);
    this.data = data;
  }

}

module.exports = Channel;