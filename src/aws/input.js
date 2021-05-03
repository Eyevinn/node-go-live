const debug = require("debug")("api-input");

const { CreateInputCommand } = require("@aws-sdk/client-medialive");

class Input {
  constructor(client, { channelId }) {
    this.client = client;
    this.channelId = channelId;
  }

  async create() {
    const inputParams = {
      Name: "RTMP_" + this.channelId,
      Type: "RTMP_PUSH",
      Destinations: [ {
        StreamName: this.channelId
      }],
      InputSecurityGroups: [
        "9040418" // should be created if it doesn't exist and not hardcoded
      ]
    };
    const data = await this.client.send(new CreateInputCommand(inputParams));
    debug("Success", data);
    this.data = data;
  }

  getRtmpUrl() {
    return this.data.Input.Destinations[0].Url;
  }

}

module.exports = Input;