# Goal

- Create development and production workflow for an app running in multiple docker containers

# Development Workflow

- Make changes on FEATURE branch
- Push to github
- Create pull request to merge with master

# Development Setup

1. Create Dockerfile.dev in client
2. Create Docker Compose
   - Client (web):
     - Setup container port mapping
     - Setup volumes
3. Create .travis.yml
4. Connect repo to travis. Now whenever a pull request is made to master, the tests run on travis. If the tests pass, we are able to merge. Otherwise, we can't merge.
