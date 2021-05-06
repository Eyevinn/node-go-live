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

const DeleteInput = (client, params) => {
  return new Promise((resolve, reject) => {
    client.deleteInput(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

const CreateChannel = (client, params) => {
  return new Promise((resolve, reject) => {
    client.createChannel(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
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

const ListChannels = (client, params) => {
  return new Promise((resolve, reject) => {
    client.listChannels(params, (err, data) => {
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

const GetInputById = async (client, id) => {
  const data = await ListInputs(client, {});
  console.log(data);
  const input = data.Inputs.find(input => input.Id === id);
  return input;
}

module.exports = {
  ListInputSecurityGroups,
  CreateInputSecurityGroup,
  CreateInput,
  ListInputs,
  DeleteInput,
  GetInputById,
  CreateChannel,
  StartChannel,
  StopChannel,
  ListChannels,
  DeleteChannel,
  GetChannelByName
}