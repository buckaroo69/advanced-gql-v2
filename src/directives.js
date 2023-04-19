const { SchemaDirectiveVisitor } = require('apollo-server');
const { defaultFieldResolver, GraphQLString } = require('graphql');
const { formatDate } = require('./utils');
const { AuthenticationError, ForbiddenError } = require('apollo-server');

class TimeFormatDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    const ogFormat = this.args['format'];

    field.args.push({
      type: GraphQLString,
      name: 'format',
    });

    field.resolve = async (root, { format, ...args }, ctx, info) => {
      const date = await resolver.call(this, root, args, ctx, info);
      return formatDate(new Date(date), format || ogFormat);
    };

    field.type = GraphQLString;
  }
}

class AuthenticationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    field.resolve = async (root, args, ctx, info) => {
      if (!ctx.user) throw new AuthenticationError('User is null');
      return resolver.call(this, root, args, ctx, info);
    };
  }
}

class AuthorizationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    const { role } = this.args;
    field.resolve = async (root, args, ctx, info) => {
      if (!ctx.user) throw new AuthenticationError('User is null');
      if (ctx.user.role !== role)
        throw new ForbiddenError(`User does not have role ${role}`);
      return resolver.call(this, root, args, ctx, info);
    };
  }
}

module.exports = {
  TimeFormatDirective,
  AuthenticationDirective,
  AuthorizationDirective,
};
