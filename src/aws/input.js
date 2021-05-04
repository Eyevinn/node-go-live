const debug = require("debug")("api-input");

const { ListInputSecurityGroups, CreateInputSecurityGroup, CreateInput, ListInputs } = require("./wrapper.js");

class Input {
  constructor(client, { channelId, whiteListRules }) {
    this.client = client;
    this.channelId = channelId;
    this.whiteListRules = whiteListRules;
  }

  async create() {
    // Create input security group for whitelist rules
    const inputSecurityGroups = await ListInputSecurityGroups(this.client, {});
    let inputSecurityGroup = inputSecurityGroups.InputSecurityGroups.find(sg => sg.WhitelistRules.map(wr => wr.Cidr).find(cidr => cidr === this.whiteListRules));
    if (!inputSecurityGroup) {
      const result = await CreateInputSecurityGroup(this.client, {
        WhitelistRules: [ { Cidr: this.whiteListRules } ]
      });
      inputSecurityGroup = result.SecurityGroup;
      debug("No input security group found for whitelist rules, created", inputSecurityGroup);
    }

    // Create RTMP input
    const inputParams = {
      Name: "RTMP_" + this.channelId,
      Type: "RTMP_PUSH",
      Destinations: [ {
        StreamName: this.channelId
      }],
      InputSecurityGroups: [
        inputSecurityGroup.Id
      ]
    };
    const data = await CreateInput(this.client, inputParams);
    debug("Success", data);
    this.data = data;
  }

  async exists() {
    const data = await ListInputs(this.client, {});
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