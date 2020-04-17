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
4. Connect repo to travis
