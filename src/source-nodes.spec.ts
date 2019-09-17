import _ from 'lodash'
import fp from 'lodash/fp'
import md5 from 'md5'

import fixtures from './__tests__/fixtures.json'
import manifestFixtures from './__tests__/manifest_fixtures.json'
import tagFixtures from './__tests__/tag_fixtures.json'
import { DockerHubRepoNode, sourceNodes } from './source-nodes'

const { get } = require('axios')

jest.mock('axios', () => ({
  get: jest.fn().mockImplementation((url: string) => {
    if (_.includes(url, 'auth.docker.io/token')) {
      return { data: { token: 'FAKE/TOKEN' } }
    }
    if (_.includes(url, '/manifests/')) {
      return manifestFixtures
    }
    if (_.includes(url, '/tags')) {
      return tagFixtures
    }
    if (_.includes(url, '/repositories/')) {
      return fixtures
    }
    return null
  }),
}))

// eslint-disable-next-line
console.warn = jest.fn()

describe('Source nodes.', () => {
  const sourceNodeArgs = {
    actions: {
      createNode: jest.fn(),
    },
    createContentDigest: jest.fn(node => md5(node)),
    createNodeId: jest.fn(node => md5(node)),
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Verify sourceNodes creates the correct # of nodes, given our fixtures.', async () => {
    const nodes: DockerHubRepoNode[] = await sourceNodes(sourceNodeArgs, {
      username: 'fake_docker_user',
    })
    expect(nodes).toHaveLength(25)
  })

  test('Verify sourceNodes generates valid data.', async () => {
    const nodes = await sourceNodes(sourceNodeArgs, {
      username: 'fake_docker_user',
    })

    expect(nodes).toHaveLength(25)
    // All nodes have names.
    expect(_.every(_.map(nodes, 'name')))

    const topNode = _.last(_.sortBy(nodes, 'pullCount'))
    if (!topNode) {
      fail('topNode is undefined.')
      return
    }
    expect(topNode.name).toBe('owntracks')

    const architectures = _.flow(
      fp.get('manifestList.manifests'),
      fp.map('platform.architecture'),
    )(topNode)
    // const manifestList: DockerManifestList | undefined = topNode.manifestList
    // const architectures = _.map(
    //   _.get(manifestList, 'manifests'),
    //   'platform.architecture',
    // )
    expect(new Set(architectures)).toEqual(new Set(['arm', 'amd64', 'arm64']))
  })

  test('Verify sourceNodes fails gracefully when DH response is empty.', async () => {
    get.mockResolvedValueOnce([])

    const nodes = await sourceNodes(sourceNodeArgs, {
      username: 'fake_docker_user',
    })
    expect(nodes).toHaveLength(0)
    // eslint-disable-next-line
    expect(console.warn).toHaveBeenCalledTimes(1)
  })
})
