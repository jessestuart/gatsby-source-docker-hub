// @ts-ignore
import axios from 'axios'
import { NodeInput } from 'gatsby'
import { createContentDigest } from 'gatsby/utils'
import _ from 'lodash'
import fp from 'lodash/fp'

import DockerHubAPIRepo from './types/DockerHubAPIRepo'
import DockerHubRepo from './types/DockerHubRepo'

export const NODE_TYPE = 'DockerHubRepo'

const DH_API_ROOT = 'https://hub.docker.com/v2/repositories/'

export const sourceNodes = async ({ actions, createNodeId }, { username }) => {
  const { createNode } = actions

  // TODO: Make num repos returned configurable.
  const response = await axios.get(`${DH_API_ROOT}${username}/`, {
    params: { page: 1, page_size: 25 },
  })

  const repos: DockerHubAPIRepo[] | undefined = _.get(response, 'data.results')
  if (!repos || _.isEmpty(repos)) {
    console.warn(`No Docker Hub repos found for user @${username}.`)
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

    const node: NodeInput = Object.assign(repoDetails, {
      id: createNodeId(repoDetails.name),
      internal: {
        contentDigest: createContentDigest(repoDetails.name),
        type: NODE_TYPE,
      },
    })

    return createNode(node)
  }

  return repos.map(createNodeFromRepo)
}
