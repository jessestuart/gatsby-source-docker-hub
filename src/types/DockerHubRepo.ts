export type Architecture = 'amd64' | 'arm64' | 'arm'

export default interface DockerHubRepo {
  architectures?: Architecture[]
  description?: string
  lastUpdated: Date
  name: string
  pullCount: number
  starCount: number
}
