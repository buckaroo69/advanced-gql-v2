const gql = require('graphql-tag');

module.exports = gql`
  enum Theme {
    DARK
    LIGHT
  }

  enum Role {
    ADMIN
    MEMBER
    GUEST
  }

  directive @formatDate(format: String = "yyyy/MM/dd") on FIELD_DEFINITION
  directive @authenticate on FIELD_DEFINITION
  directive @authorize(role: Role = MEMBER) on FIELD_DEFINITION
  type User {
    id: ID!
    email: String!
    avatar: String!
    verified: Boolean!
    createdAt: String! @formatDate(format: "dd/MM/yyyy")
    posts: [Post]!
    role: Role!
    settings: Settings!
  }

  type AuthUser {
    token: String!
    user: User!
  }

  type Post {
    id: ID!
    message: String!
    author: User!
    createdAt: String! @formatDate
    likes: Int!
    views: Int!
  }

  type Settings {
    id: ID!
    user: User!
    theme: Theme!
    emailNotifications: Boolean!
    pushNotifications: Boolean!
  }

  type Invite {
    email: String!
    from: User!
    createdAt: String! @formatDate
    role: Role!
  }

  input NewPostInput {
    message: String!
  }

  input UpdateSettingsInput {
    theme: Theme
    emailNotifications: Boolean
    pushNotifications: Boolean
  }

  input UpdateUserInput {
    email: String
    avatar: String
    verified: Boolean
  }

  input InviteInput {
    email: String!
    role: Role!
  }

  input SignupInput {
    email: String!
    password: String!
    role: Role!
  }

  input SigninInput {
    email: String!
    password: String!
  }

  type Query {
    me: User! @authenticate
    posts: [Post]! @authenticate
    post(id: ID!): Post! @authenticate
    userSettings: Settings! @authenticate
    feed: [Post]!
  }

  type Mutation {
    updateSettings(input: UpdateSettingsInput!): Settings! @authenticate
    createPost(input: NewPostInput!): Post! @authenticate
    updateMe(input: UpdateUserInput!): User @authenticate
    invite(input: InviteInput!): Invite! @authorize(role: ADMIN)
    signup(input: SignupInput!): AuthUser!
    signin(input: SigninInput!): AuthUser!
  }

  type Subscription {
    newPost: Post! @authenticate
  }
`;
