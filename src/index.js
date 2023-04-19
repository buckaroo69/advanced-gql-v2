const { ApolloServer, PubSub } = require('apollo-server');
const typeDefs = require('./typedefs');
const resolvers = require('./resolvers');
const { createToken, getUserFromToken } = require('./auth');
const db = require('./db');
const {
  TimeFormatDirective,
  AuthenticationDirective,
  AuthorizationDirective,
} = require('./directives');

const pubSub = new PubSub();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    formatDate: TimeFormatDirective,
    authorize: AuthorizationDirective,
    authenticate: AuthenticationDirective,
  },
  context({ req, connection }) {
    const data = { ...db, createToken, pubSub };
    if (connection) return { ...data, ...connection.context };
    const token = req.headers.authorization;
    const user = getUserFromToken(token);
    return { ...data, user };
  },
  subscriptions: {
    onConnect(params) {
      const token = params.Authorization;
      const user = getUserFromToken(token);
      return { user };
    },
  },
});

server.listen(4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
