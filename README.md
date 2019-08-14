<p align="center">
  <a href="https://github.com/jessestuart/gatsby-source-docker-hub">
    <img src="https://github.com/jessestuart/gatsby-source-docker-hub/blob/master/assets/logo.png" width="50%" />
  </a>
</p>
<h1 align="center">
  gatsby-source-docker-hub
</h1>

[![CircleCI][circleci-badge]][circleci-link] [![npm][npm-badge]][npm-link]
[![codecov][codecov]][codecov 2]

### What is this?

A simple GatsbyJS source plugin allowing you to easily integrate stats from your
Docker Hub profile in your Gatsby site. Just pass in a Docker Hub username, and
get back your top 30 repos, sorted by pull count. It's as simple as:

```graphql
{
  allDockerHubRepo(sort: { order: DESC, fields: pullCount }) {
    edges {
      node {
        architectures
        description
        lastUpdated
        name
        pullCount
        starCount
      }
    }
  }
}
```

And get back something like the below:

```json
{
  "data": {
    "allDockerHubRepo": {
      "edges": [
        {
          "node": {
            "architectures": [
              "amd64",
              "arm",
              "arm64"
            ],
            "description": "OwnTracks. Multiarch. 👌",
            "lastUpdated": "2019-08-13T00:27:34.154761Z",
            "name": "owntracks",
            "pullCount": 491351,
            "starCount": 3
          }
        },
        {
          "node": {
            "architectures": [
              "arm",
              "arm64",
              "amd64"
            ],
            "description": "Nightly multi-architecture (amd64, arm64, armv7) builds for the Kubernetes Helm tiller service.",
            "lastUpdated": "2019-08-13T00:27:56.305902Z",
            "name": "tiller",
            "pullCount": 376722,
            "starCount": 11
          }
      },
      { "//": "etc." }
    ]
  }
}
```

Note that this includes an array of architectures, for Docker images with
multiarch support (i.e., containing a valid [V2 Manifest, Schema 2][docker]).

Check out a simple proof-of-concept at [`multiar.ch`][multiar] (source code
available [here][github]) 🎉

[circleci-badge]:
  https://circleci.com/gh/jessestuart/gatsby-source-docker-hub.svg?style=shield
[codecov]:
  https://codecov.io/gh/jessestuart/gatsby-source-docker-hub/branch/master/graph/badge.svg
[circleci-link]: https://circleci.com/gh/jessestuart/gatsby-source-docker-hub
[codecov 2]: https://codecov.io/gh/jessestuart/gatsby-source-docker-hub
[docker]: https://docs.docker.com/registry/spec/manifest-v2-2/
[github]: https://github.com/jessestuart/multiar.ch
[multiar]: https://multiar.ch
[npm-badge]: https://img.shields.io/npm/v/gatsby-source-docker-hub.svg
[npm-link]: https://www.npmjs.com/package/gatsby-source-docker-hub
