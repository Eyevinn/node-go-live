const debug = require("debug")("api-channel");
const schemas = {
  "POST": {
    description: "Create a channel",
    body: {
      type: "object",
      properties: {
        channel_id: { type: "string", description: "Channel Id" }
      },
      example: {
        channel_id: "example1"
      }
    }
  }
};

module.exports = (fastify, opts, next) => {
  const controller = opts.controller;

  fastify.post("/", { schema: schemas["POST"] }, async (request, reply) => {
    try {
      if (!request.body.channel_id) {
        reply.code(400).send({ message: "Missing channel_id in request body" });      
      } else {
        const channel = await controller.createChannel({
          channelId: request.body.channel_id
        });
        debug(channel);
        reply.send(channel);
      }
    } catch (exc) {
      debug(exc.message);
      reply.code(500).send({ message: exc.message });
    }
  });
  next();
};