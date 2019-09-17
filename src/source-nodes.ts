import { NodeInput } from 'gatsby'
import { createContentDigest } from 'gatsby/utils'
import _ from 'lodash'

import {
  DockerHubRepo,
  DockerManifestList,
  fetchManifestList,
  queryTags,
  queryTopRepos,
  Tag,
} from 'docker-hub-utils'

export const DockerHubNodeType = 'DockerHubRepo'

export type DockerHubRepoNode = DockerHubRepo & NodeInput

/**
 *
 */
export const sourceNodes = async ({ actions, createNodeId }, { username }) => {
  const { createNode } = actions

  const repos = await queryTopRepos({ user: username })
  if (!repos || _.isEmpty(repos)) {
    console.warn(`No Docker Hub repos found for user @${username}.`)
    return []
  }

  const createNodeFromRepo = async (
    repo: DockerHubRepo,
  ): Promise<DockerHubRepoNode> => {
    let manifestList: DockerManifestList | undefined
    try {
      manifestList = await fetchManifestList(repo)
    } catch (__) {}

    let tags: Tag[] | undefined
    try {
      tags = await queryTags(repo)
    } catch (__) {}

    const node: DockerHubRepoNode = {
      ...repo,
      id: createNodeId(repo.name),
      internal: {
        contentDigest: createContentDigest(repo.name),
        type: DockerHubNodeType,
      },
      manifestList,
      tags,
    }

    createNode(node)

    return node
  }

  return await Promise.all(repos.map(createNodeFromRepo))
}
