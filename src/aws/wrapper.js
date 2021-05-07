const ListChannels = (client, params) => {
  return new Promise((resolve, reject) => {
    client.listChannels(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

module.exports = {
  ListChannels,
}