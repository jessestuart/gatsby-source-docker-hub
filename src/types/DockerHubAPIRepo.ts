export default interface DockerHubAPIRepo {
  can_edit: boolean
  description: string
  is_automated: boolean
  is_migrated: boolean
  is_private: boolean
  last_updated: Date
  name: string
  namespace: string
  pull_count: number
  repository_type: string
  star_count: number
  status: number
  user: string
}
