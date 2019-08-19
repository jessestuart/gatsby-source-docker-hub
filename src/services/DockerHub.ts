import axios from 'axios'
import _ from 'lodash'
import fp from 'lodash/fp'

export const DockerHubNodeType = 'DockerHubRepo'

interface FetchManifestListOptions {
  repo: string
  username: string
}

/**
 *
 */
export const getDockerHubAPIForUsername = (username: string) =>
  `https://hub.docker.com/v2/repositories/${username}`

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
export const transformDockerHubAPIRepo = _.flow(
  fp.pick(['description', 'last_updated', 'name', 'pull_count', 'star_count']),
  fp.mapKeys(fp.camelCase),
)

/**
 *
 */
export const fetchDockerHubAPIRepos = async ({ username }) => {
  const queryParams = { params: { page: 1, page_size: 25 } }
  // TODO: Make num repos returned configurable.
  return await axios.get(getDockerHubAPIForUsername(username), queryParams)
}
