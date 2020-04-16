# Goal

- Create development and production workflow for an app running in multiple docker containers

# Development Workflow

- Make changes on FEATURE branch
- Push to github
- Create pull request to merge with master
- Code on Feature branch pushed to Travis CI

# Process

1. Create Dockerfile.dev in client
2. Create Docker Compose
   - Setup container port mapping
   - Setup volumes
