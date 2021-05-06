const debug = require("debug")("api-channel");

const { ChannelNotFoundError } = require("../errors.js");

const schemas = {
  "POST": {
    description: "Create a channel",
    body: {
      type: "object",
      properties: {
        channel_id: { type: "string", description: "Channel Id" },
        whitelist: { type: "string", description: "Whitelist rules, CIDR-formatted string" },
        media_package_channel: { type: "string", description: "Media Package channel ID" }
      },
      example: {
        channel_id: "example1",
        whitelist: "0.0.0.0/0",
        media_package_channel: "eyevinn",
      }
    },
    response: {
      200: {
        description: "On success returns details of the created channel",
        type: "object",
        properties: {
          channel_id: { type: "string", description: "Channel Id" },
          rtmp_urls: {
            description: "An array of RTMP URLs to push video to",
            type: "array",
            items: {
              type: "string", description: "RTMP URL"
            }
          }
        }
      }
    }
  },
  "GET": {
    description: "List all channels",
    response: {
      200: {
        description: "On success returns an array of channels",
        type: "array",
        items: {
          type: "object",
          properties: {
            channel_id: { type: "string", description: "Channel Id" },
          }
        }
      }
    }
  },
  "GET:channelId": {
    description: "Get details of a channel",
    params: {
      channelId: { type: "string", description: "Channel Id" }
    },
    response: {
      200: {
        description: "On success returns details of a channel",
        type: "object",
        properties: {
          channel_id: { type: "string", description: "Channel Id" },
          rtmp_urls: {
            description: "An array of RTMP URLs to push video to",
            type: "array",
            items: {
              type: "string", description: "RTMP URL"
            }
          }
        }
      }
    }
  },
  "DELETE:channelId": {
    description: "Remove a channel and its inputs",
    params: {
      channelId: { type: "string", description: "Channel Id" }      
    }
  },
  "PUT:channelId/status": {
    description: "Start or stop a channel",
    params: {
      channelId: { type: "string", description: "Channel Id" }
    },
    body: {
      type: "object",
      properties: {
        status: { type: "string" , description: "[started|stopped]"}
      },
      example: {
        status: "started"
      }
    }
  }
};

module.exports = (fastify, opts, next) => {
  const controller = opts.controller;

  fastify.post("/", { schema: schemas["POST"] }, async (request, reply) => {
    try {
      debug(request.body);
      if (!request.body.channel_id) {
        reply.code(400).send({ message: "Missing channel_id in request body" });      
      } else {
        const channel = await controller.createChannel({
          channelId: request.body.channel_id,
          whiteListRules: request.body.whitelist,
          mediaPackageChannel: request.body.media_package_channel,
        });
        debug(channel);
        reply.send(channel);
      }
    } catch (exc) {
      debug(exc);
      reply.code(500).send({ message: exc.message });
    }
  });

  fastify.get("/", { schema: schemas["GET"] }, async (request, reply) => {
    try {
      const channels = await controller.listChannels();
      debug(channels);
      reply.send(channels);
    } catch (exc) {
      debug(exc);
      reply.code(500).send({ message: exc.message });
    }
  });

  fastify.get("/:channelId", { schema: schemas["GET:channelId"] }, async (request, reply) => {
    try {
      debug(request.params);
      const channel = await controller.getChannelDetails({ channelId: request.params.channelId });
      debug(channel);
      reply.send(channel);
    } catch (exc) {
      debug(exc);
      if (exc instanceof ChannelNotFoundError) {
        reply.code(404).send({ message: exc.message });
      } else {
        reply.code(500).send({ message: exc.message });
      }
    }
  });

  fastify.delete("/:channelId", { schema: schemas["DELETE:channelId"] }, async (request, reply) => {
    try {
      debug(request.params);
      await controller.removeChannel({ channelId: request.params.channelId });
      reply.send({});
    } catch (exc) {
      debug(exc);
      if (exc instanceof ChannelNotFoundError) {
        reply.code(404).send({ message: exc.message });
      } else {
        reply.code(500).send({ message: exc.message });
      }
    }
  });

  fastify.put("/:channelId/status", { schema: schemas["PUT:channelId/status"] }, async (request, reply) => {
    try {
      debug(request.params);
      debug(request.body);
      if (request.body.status === "started") {
        const status = await controller.startChannel({ channelId: request.params.channelId });
        reply.send(status);
      } else if (request.body.status === "stopped") {
        const status = await controller.stopChannel({ channelId: request.params.channelId });
        reply.send(status);
      }
    } catch (exc) {
      debug(exc);
      if (exc instanceof ChannelNotFoundError) {
        reply.code(404).send({ message: exc.message });
      } else {
        reply.code(500).send({ message: exc.message });
      }
    }
  });
  next();
};