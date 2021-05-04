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


module.exports = {
  ListInputSecurityGroups,
  CreateInputSecurityGroup,
  CreateInput,
  ListInputs,
  CreateChannel,
  StartChannel,
  StopChannel,
  ListChannels
}