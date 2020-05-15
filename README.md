Note: I took this app down to avoid paying for AWS.

# GOAL

The purpose of this project to get familiar with docker. Basically, I create a development and
production workflow for an app running in multiple docker containers. I.e, this project is a learning
exercise and the notes here are for my own refernece when I build things in the future.

**This project is completely inspired by Stephen Grider's Docker and Kubernetees course offered on udemy. All diagrams
included in this readme are from his course.**
https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/

# APP DESCRIPTION

**The app is purposefully "overcomplicated" - there is absolutely no need to use both redis and postgres. I'm just doing this
to demonstrate using multiple containers.**

Basically this app is a Factorial Calculator.

![app](https://i.imgur.com/3igbdKR.png)

![desc](https://i.imgur.com/BkJk0vu.png)

App Quirk: You need to refresh everytime you submit an index. Could fix by polling, other, but not the purpose of this exercise.

# SERVER - CONFIGURATION

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

# DEVELOPMENT WORKFLOW

- Make changes on FEATURE branch
- Push to github
- Create pull request to merge with master
- Travis runs tests
  - Runs tests on feature branch
  - Runs tests on feature merged with master
- If tests pass, merge pull request

To Access: Navigate to localhost:3050

## Client:

#### DOCKER

1. Create Dockerfile.dev in client
2. Create Docker Compose
   - Client (web):
     - Setup container port mapping [ REMOVED -- see 'Nginx Development - The case for Nginx']
     - Setup volumes --> Easier for development
3. Create .travis.yml
4. Connect repo to travis

## Server:

#### DOCKER

- Create Dockerfile.dev
  - Copy package.json first. We don't want to reinstall dependencies each time we build, even though we didn't change dependencies.
- Add postgres container, redis container
- Add server container
  - Setup volumes
  - Use depends_on flag to ensure postgres and redis are started before server
  - Add port mapping so developers can hit the routes locally (example: using postman)

## WORKER:

#### Docker

Same as Server.

## NGINX

#### The Case for NGINX

At some point, the browser is going to

- request index.html, main.js (need to go to react server)
- make api calls (need to go to express server)

We can achieve this easily by making api calls to localhost:8000/values/current in our react code.

Whats the problem is? The ports could change.

Cleaner Solution:

We can get the nginx to look at each request, and decide whether to send it to the
express server to react server. More specifically, it'll check if the request path has /api, if so,
it'll route it to the express server; otherwise, it'll direct it to the react server.

![nginxdev](https://i.imgur.com/5PS5nY1.png)

Note: In docker-compose.yml, for the nginx server, we mapped port 3050:80. I.e, the developer has to
navigate to localhost:3050 not localhost:3000. To avoid confusion, I removed port mapping from the client
service (If developer navigates to locahost:3000, they'll see the react app, but all api requests will fail,
confusing the developer. It's simpler to just remove port mapping).

# PRODUCTION WORKFLOW

![proddiagram](https://i.imgur.com/hK1H9En.png)

- Create pull request to merge with master
- Travis runs tests
  - Runs tests on feature branch
  - Runs tests on feature merged with master
- If tests pass:
  - Travis Builds Production Images
  - Travis pushes images to Docker Hub
  - Travis Pushes Project to Elastic Beanstalk
  - Elastic Beanstalk pulls images from Docker Hub and Deploys

## Client

#### Nginx

**Why Nginx**

We need a server whose sole purpose is to respond to browser requests with the index.html file and js file that contains all the code.

#### Docker

We're using a multi-step build process.
We basically copy over whatever is in app/build into new nginx container.

By adding EXPOSE 3000, Elastic Beanstalk knows to use 3000 as a port for incoming traffic.

## Deploying to AWS

Our Elastic beanstalk (EB) instance will contain our four containers. We will use AWS Elastic cache (EC) for redis, and AWS Relation Database Services (RDS) for postgres. By default, Elastic Beanstalk doesn't talk to RDS or EC, but we need the containers in EB to communicate with Redis and Postgres. We get them to communicate by creating a new security group that says 'Let any traffic access this instance if it belongs to this security group'. We'll add EB, RDS, EC to this security group.

1. Create Dockerrun.aws.json -> Tell Elastic Beanstalk where to pull our images from (Docker Hub), what resources to allocate to each one, how to set up port mappings and some associated information.
2. Create EB Environment (Sign in to AWS, choose Elastic Beanstalk Service, Create Application)
3. Create RDS instance
4. Create EC instance
5. Create security group with rule 'Let any traffic access this instance if it belongs to this security group'.
6. Apply new security group to EB, RDS, EC
7. Add AWS_ACCESS_KEY, AWS_SECRET_KEY to travis
8. Add deploy script to travis.yml
