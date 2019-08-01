// @ts-ignore
import { get } from 'axios'
import _ from 'lodash'

import md5 from 'md5'

import fixtures from './__tests__/fixtures.json'
import { sourceNodes } from './source-nodes'

jest.mock('axios', () => ({
  get: jest.fn(),
}))

console.warn = jest.fn()

describe('Source nodes.', () => {
  let nodes: any[] = []

  const sourceNodeArgs = {
    actions: {
      createNode: jest.fn(node => {
        nodes.push(node)
        return node
      }),
    },
    createContentDigest: jest.fn(node => md5(node)),
    createNodeId: jest.fn(node => md5(node)),
  }

  afterEach(() => {
    jest.clearAllMocks()
    nodes = []
  })

  test('Verify sourceNodes creates the correct # of nodes, given our fixtures.', async () => {
    get.mockImplementation(() => fixtures)
    await sourceNodes(sourceNodeArgs, {
      username: 'fake_docker_user',
    })
    expect(get).toHaveBeenCalledTimes(1)
    expect(nodes).toHaveLength(25)
  })

  test('Verify sourceNodes generates valid data.', async () => {
    get.mockImplementation(() => fixtures)
    await sourceNodes(sourceNodeArgs, {
      username: 'fake_docker_user',
    })
    // All nodes have names.
    expect(_.every(_.map(nodes, 'name')))
    // All nodes have pull_count.
    expect(_.every(_.map(nodes, 'pull_count')))
  })

  test('Verify sourceNodes fails gracefully when DH response is empty.', async () => {
    get.mockImplementation(() => [])

    await sourceNodes(sourceNodeArgs, {
      username: 'fake_docker_user',
    })
    expect(nodes).toHaveLength(0)
    expect(console.warn).toHaveBeenCalledTimes(1)
  })
})
