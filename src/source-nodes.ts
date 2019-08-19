import { NodeInput } from 'gatsby'
import { createContentDigest } from 'gatsby/utils'
import _ from 'lodash'

import {
  DockerHubNodeType,
  fetchDockerHubAPIRepos,
  fetchManifestList,
  transformDockerHubAPIRepo,
} from './services/DockerHub'
import DockerHubAPIRepo from './types/DockerHubAPIRepo'

/**
 *
 */
export const sourceNodes = async ({ actions, createNodeId }, { username }) => {
  const { createNode } = actions

  const response = await fetchDockerHubAPIRepos({ username })

  const repos: DockerHubAPIRepo[] | undefined = _.get(response, 'data.results')
  if (!repos || _.isEmpty(repos)) {
    console.warn(`No Docker Hub repos found for user @${username}.`)
    return []
  }

  const createNodeFromRepo = async (repo: DockerHubAPIRepo) => {
    const repoDetails = transformDockerHubAPIRepo(repo)
    const architectures = await fetchManifestList({ repo: repo.name, username })
    const node: NodeInput = Object.assign(repoDetails, {
      architectures,
      id: createNodeId(repoDetails.name),
      internal: {
        contentDigest: createContentDigest(repoDetails.name),
        type: DockerHubNodeType,
      },
    })
    return createNode(node)
  }

  return Promise.all(repos.map(createNodeFromRepo))
}
