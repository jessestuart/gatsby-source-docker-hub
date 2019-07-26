// @ts-ignore
import axios from 'axios'
import { createContentDigest } from 'gatsby/utils'
import _ from 'lodash'
import fp from 'lodash/fp'

import DockerHubAPIRepo from './types/DockerHubAPIRepo'
import DockerHubRepo from './types/DockerHubRepo'

export const NODE_TYPE = 'DockerHubRepo'

export const sourceNodes = async ({ actions, createNodeId }, { username }) => {
  const { createNode } = actions
  const response = await axios.get(
    `https://hub.docker.com/v2/repositories/${username}/`,
    { params: { page: 1, page_size: 25 } },
  )
  const repos: DockerHubAPIRepo[] | undefined = _.get(response, 'data.results')
  if (!repos || _.isEmpty(repos)) {
    console.warn('No repos found.')
    return []
  }

  const createNodeFromRepo = (repo: DockerHubAPIRepo) => {
    // @ts-ignore
    const repoDetails: DockerHubRepo = _.flow(
      fp.pick([
        'description',
        'last_updated',
        'name',
        'pull_count',
        'star_count',
      ]),
      fp.mapKeys(fp.camelCase),
    )(repo)

    return createNode({
      ...repoDetails,
      id: createNodeId(repoDetails),
      internal: {
        contentDigest: createContentDigest(repoDetails),
        type: NODE_TYPE,
      },
    })
  }

  return repos.map(createNodeFromRepo)
}
