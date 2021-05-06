const DescribeChannel = (client, params) => {
  return new Promise((resolve, reject) => {
    client.describeChannel(params, (err, data) => {
      if (err) reject (err);
      else resolve(data);
    });
  });
}

const ListOriginEndpoints = (client, params) => {
  return new Promise((resolve, reject) => {
    client.listOriginEndpoints(params, (err, data) => {
      if (err) reject (err);
      else resolve(data);
    });
  });
}


class MediaPackageChannel {
  constructor(client, { channelId }) {
    this.channelId = channelId;
    this.client = client;
  }

  async create() {

  }

  async details() {
    const data = await DescribeChannel(this.client, { Id: this.channelId });
    return data;
  }

  async endpoints() {
    const data = await ListOriginEndpoints(this.client, { ChannelId: this.channelId });
    return data;
  }
}

module.exports = MediaPackageChannel;