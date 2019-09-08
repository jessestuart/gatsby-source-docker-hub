import { NodeInput } from 'gatsby'
import { createContentDigest } from 'gatsby/utils'
import _ from 'lodash'

import {
  DockerHubRepo,
  fetchManifestList,
  queryTopRepos,
} from 'docker-hub-utils'

export const DockerHubNodeType = 'DockerHubRepo'

export type DockerHubRepoNode = DockerHubRepo & NodeInput

/**
 *
 */
export const sourceNodes = async ({ actions, createNodeId }, { username }) => {
  const { createNode } = actions

  const repos: DockerHubRepo[] | undefined = await queryTopRepos(username)
  if (!repos || _.isEmpty(repos)) {
    console.warn(`No Docker Hub repos found for user @${username}.`)
    return []
  }

  const createNodeFromRepo = async (
    repo: DockerHubRepo,
  ): Promise<DockerHubRepoNode> => {
    const manifestList = await fetchManifestList(repo)
    const node: DockerHubRepoNode = {
      ...repo,
      id: createNodeId(repo.name),
      internal: {
        contentDigest: createContentDigest(repo.name),
        type: DockerHubNodeType,
      },
      manifestList,
    }
    createNode(node)
    return node
  }

  return await Promise.all(repos.map(createNodeFromRepo))
}
