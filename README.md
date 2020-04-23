In progress...

# Goal

- Create development and production workflow for an app running in multiple docker containers

# Development Workflow

- Make changes on FEATURE branch
- Push to github
- Create pull request to merge with master

# CLIENT:

1. Create Dockerfile.dev in client
2. Create Docker Compose
   - Client (web):
     - Setup container port mapping
     - Setup volumes
3. Create .travis.yml
4. Connect repo to travis

# SERVER:

### Initial Configuration

- Create tsconfig file
  - outdir: build -> Where typescript saves our compiled code (.js and .map files)
  - rootdir: Where typescript looks for our code
  - sourcemap: true -> Create sourcemap files which allow tools to map between the emitted Javascript code and hte typescript source files taht created it. Debuggers can consume these files so you can debug the typescript file instead of the Javascript file.
- Install tslint and create tslint file
- Install prettier and create a prettierrc file
  - Use --save-exact option when installing prettier - don't update dependency
- Install tslint-config-prettier
  - Prettier and tslint collide since they both take care of formatting. This package disables all TSLint formatting related rules, so prettier only takes care of formatting.
- Install ts-node to run typescript directly without having to wait for it to be compiled (for use in development)
- Install nodemon to watch for changes to our code and automatically restart when a file is changed
  - Create nodemon.json file -> tell it to run "ts-node ./lib/src/index.ts"
- Add package.json scripts
  - pretty: script to package.json so developers can run prettier on the entire project
  - lint: developers can run tslint on the entire project
  - dev: runs nodemon
  - build: rimraf to delete old build folder, and then recompile typescript
- Install husky to add git hooks
  - Precommit hook:
    - Lint -> Run lint on the project, don't allow commit if tslint errors
    - Prettier -> Install pretty-quick. Pretty quick is used to run Prettier on only changed and staged files. This is much faster than formatting the whole prject each time, and would allow us to apply changed gradually across project.

### Docker

#### For Development

- Create Dockerfile.dev
  - Copy package.json first. We don't want to reinstall dependencies each time we build, even though we didn't change dependencies.
- Add postgres container, redis container
- Add server container
  - Setup volumes
  - Use depends_on flag to ensure postgres and redis are started before server
  - Add port mapping so developers can hit the routes locally (example: using postman)
