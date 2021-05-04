const debug = require("debug")("api-input");

const CreateInputCommand = (client, params) => {
  return new Promise((resolve, reject) => {
    client.createInput(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

const ListInputsCommand = (client, params) => {
  return new Promise((resolve, reject) => {
    client.listInputs(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

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
    const data = await CreateInputCommand(this.client, inputParams);
    debug("Success", data);
    this.data = data;
  }

  async exists() {
    const data = await ListInputsCommand(this.client, {});
    const input = data.Inputs.find(input => input.Name === "RTMP_" + this.channelId);
    if (!input) {
      return false;
    } {
      debug("Input exists", input);
      this.data = {
        Input: input
      };
      return true;
    }
  }

  getInputId() {
    return this.data.Input.Id;
  }

  getInputName() {
    return this.data.Input.Name;
  }

  getRtmpUrl() {
    return this.data.Input.Destinations[0].Url;
  }

}

module.exports = Input;