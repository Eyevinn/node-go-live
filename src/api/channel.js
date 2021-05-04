const debug = require("debug")("api-channel");
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
      reply.code(500).send({ message: exc.message });
    }
  });
  next();
};