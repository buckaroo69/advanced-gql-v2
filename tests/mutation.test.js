const gql = require('graphql-tag');
const createTestServer = require('./helper');
const NEW_POST = gql`
  mutation {
    createPost(input: { message: "Sample Text" }) {
      message
    }
  }
`;

describe('mutation', () => {
  test('createPost', async () => {
    const { mutate } = createTestServer({
      pubSub: { publish: jest.fn() },
      user: { id: 1 },
      models: {
        Post: {
          createOne: jest.fn(() => ({
            id: 1,
            message: 'hello',
            createdAt: 12345839,
            likes: 20,
            views: 300,
          })),
        },
      },
    });

    const res = await mutate({ query: NEW_POST });
    expect(res.data.createPost.message).toEqual('hello');
  });
});
