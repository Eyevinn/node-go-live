const debug = require("debug")("api-input");

const ListInputSecurityGroups = (client, params) => {
  return new Promise((resolve, reject) => {
    client.listInputSecurityGroups(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

const CreateInputSecurityGroup = (client, params) => {
  return new Promise((resolve, reject) => {
    client.createInputSecurityGroup(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

const CreateInput = (client, params) => {
  return new Promise((resolve, reject) => {
    client.createInput(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

const ListInputs = (client, params) => {
  return new Promise((resolve, reject) => {
    client.listInputs(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

const DescribeInput = (client, params) => {
  return new Promise((resolve, reject) => {
    client.describeInput(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

const DeleteInput = (client, params) => {
  return new Promise((resolve, reject) => {
    client.deleteInput(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

const WaitForInputToBeDetached = (client, id) => {
  return new Promise((resolve, reject) => {
    client.waitFor("inputDetached", { InputId: id }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

class Input {
  constructor(client, { channelId, inputId }) {
    this.client = client;
    this.channelId = channelId;
    this.inputId = inputId;
  }

  async create({ whiteListRules }) {
    // Create input security group for whitelist rules
    const inputSecurityGroups = await ListInputSecurityGroups(this.client, {});
    let inputSecurityGroup = inputSecurityGroups.InputSecurityGroups.find(sg => sg.WhitelistRules.map(wr => wr.Cidr).find(cidr => cidr === whiteListRules));
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
      Destinations: [ 
        { StreamName: this.channelId + "A" }, 
        { StreamName: this.channelId + "B" } 
      ],
      InputSecurityGroups: [
        inputSecurityGroup.Id
      ]
    };
    const data = await CreateInput(this.client, inputParams);
    debug("Success", data);
    this.data = data;
    this.inputId = data.Input.Id;
  }

  async exists() {
    const input = await this.details();
    return (input !== null);
  }

  async delete() {
    if ((await this.exists()) == true) {
      debug(`Removing input ${this.inputId}`);
      await WaitForInputToBeDetached(this.client, this.inputId);
      await DeleteInput(this.client, { InputId: this.inputId });
    }
  }

  async details() {
    let input;
    if (!this.inputId) {
      const data = await ListInputs(this.client, {});
      input = data.Inputs.find(input => input.Name === "RTMP_" + this.channelId);
    } else {
      input = await DescribeInput(this.client, { InputId: this.inputId });
    }
    if (input) {
      this.data = {
        Input: input
      }
      this.inputId = this.data.Input.Id;
      return this.data.Input;
    }
    return null;
  }

  getInputId() {
    return this.inputId;
  }

  getInputName() {
    return this.data.Input.Name;
  }

  getRtmpUrls() {
    return this.data.Input.Destinations.map(d => d.Url);
  }

}

module.exports = Input;