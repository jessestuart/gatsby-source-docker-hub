import axios from 'axios'
import { NodeInput } from 'gatsby'
import { createContentDigest } from 'gatsby/utils'
import _ from 'lodash'
import fp from 'lodash/fp'

import DockerHubAPIRepo from 'types/DockerHubAPIRepo'
import DockerHubRepo from 'types/DockerHubRepo'

export const DockerHubNodeType = 'DockerHubRepo'

const DH_API_ROOT = 'https://hub.docker.com/v2/repositories/'

interface FetchManifestListOptions {
  repo: string
  username: string
}

/**
 *
 */
export const fetchManifestList = async ({
  repo,
  username,
}: FetchManifestListOptions) => {
  const tokenRequest = await axios.get('https://auth.docker.io/token', {
    params: {
      scope: `repository:${username}/${repo}:pull`,
      service: 'registry.docker.io',
    },
  })
  const token = _.get(tokenRequest, 'data.token')

  const manifestList = await axios.get(
    `https://registry-1.docker.io/v2/${username}/${repo}/manifests/latest`,
    {
      headers: {
        Accept: 'application/vnd.docker.distribution.manifest.list.v2+json',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  const architectures: string[] = _.flow(
    fp.get('data.manifests'),
    fp.map('platform.architecture'),
  )(manifestList)

  return architectures
}

/**
 *
 */
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

  const createNodeFromRepo = async (repo: DockerHubAPIRepo) => {
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
