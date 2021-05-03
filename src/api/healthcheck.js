module.exports = (fastify, opts, next) => {
  fastify.get('/', async (request, reply) => {
    reply.send({
      message: 'ok',
      component: 'eyevinn-golive',
      docs: '/api/docs'
    });
  });
  next();
};
