

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
  GetInputById,
  CreateChannel,
  StartChannel,
  StopChannel,
  ListChannels,
  DeleteChannel,
  GetChannelByName
}