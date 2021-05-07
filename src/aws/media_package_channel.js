const debug = require("debug")("api-mediapackage");

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

const CreateChannel = (client, params) => {
  return new Promise((resolve, reject) => {
    client.createChannel(params, (err, data) => {
      if (err) reject (err);
      else resolve(data);
    });
  });
}

const DeleteChannel = (client, params) => {
  return new Promise((resolve, reject) => {
    client.deleteChannel(params, (err, data) => {
      if (err) reject (err);
      else resolve(data);
    });
  });
}

const CreateOriginEndpoint = (client, params) => {
  return new Promise((resolve, reject) => {
    client.createOriginEndpoint(params, (err, data) => {
      if (err) reject (err);
      else resolve(data);
    });
  });
}

const DeleteOriginEndpoint = (client, params) => {
  return new Promise((resolve, reject) => {
    client.deleteOriginEndpoint(params, (err, data) => {
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
    const channelParams = {
      Id: this.channelId
    };
    const data = await CreateChannel(this.client, channelParams);
    debug("Success", data);
    this.data = data;

    // Create origin endpoints
    const originEndpointParams = {
      Id: this.channelId + "_hls",
      ChannelId: this.channelId,
      ManifestName: "index",
      StartoverWindowSeconds: 60*10,
      HlsPackage: {
        PlaylistType: "EVENT",
        SegmentDurationSeconds: 6,
        PlaylistWindowSeconds: 300,
      }
    };
    const originEndpoint = await CreateOriginEndpoint(this.client, originEndpointParams);
    debug("Success", originEndpoint);
  }

  async delete() {
    if ((await this.exists()) == true) {
      debug(`Removing media package channel ${this.channelId}`);
      await DeleteOriginEndpoint(this.client, { Id: this.channelId + "_hls" });
      await DeleteChannel(this.client, { Id: this.channelId });
    }
  }

  async exists() {
    const channel = await this.details();
    return (channel !== null);
  }

  async details() {
    try {
      const data = await DescribeChannel(this.client, { Id: this.channelId });
      return data;
    } catch (exc) {
      return null;
    }
  }

  async endpoints() {
    const data = await ListOriginEndpoints(this.client, { ChannelId: this.channelId });
    return data;
  }
}

module.exports = MediaPackageChannel;