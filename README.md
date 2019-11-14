# Archean : A Microservice Playground

Archean is a minimalistic working microservices demo application designed to provide a space to experiment and learn. 
It resolves initial setup and configuration pain, without being opinionated about your future stack and architecture.

Archean was an eon, when things were simple. 

This project also helps to learn Docker and Kubernetes basics. Pre-requisites are, you know a little bit about 
NodeJS and Express. Feel free to fork it with another language / stack, there is nothing specifc to Node.

## Setup

This demo is meant to run under Kubernetes using Skaffold and Kustomize. Note: do not run it in production - security 
was not a concern!

#### Docker-desktop
If you do not yet have [docker-desktop](https://www.docker.com/products/docker-desktop) installed, on MacOS, you can simply do
```
brew cask install docker
```
Find Docker in Applications and start it, then login (sign up if necessary). In Prefrences, enable Kubernetes.

#### Skaffold
Install [Skaffold](https://github.com/GoogleContainerTools/skaffold); on MacOS you can do
```
brew install skaffold
```
If you already have Skaffold installed, please, ensure version 1.0.0+.

#### Ready!
You are all set; switch to the root of this app and run 

```
skaffold dev
```

Open your browser to http://localhost:30000. In case this port is taken, you can change it 
in `api-gateway/k8s/service.yaml` (nodePort).

## Build and deployment workflow

Directories are organized with a microservice per directory. I.e. it is a flat monorepo.

Skaffold is a tool that takes care of building, packaging and deploying your microservices, while also syncing the code
in development mode so that you don't need to constantly restart containers. For each artifact, it follows the 
pipeline below.

1. Build

   Uses `<module>/Dockerfile`, and produces a Docker image
2. Tag

   Tags images according to skaffold.yaml/build.artifacts.image name
3. Deploy

   Deploys each artifact according to kustomization.yaml into pods and services, such that each micro gets its own IP 
   address and you can experiment with scaling and tuning.
4. File Sync

   Once you change anything in sub-directories, it syncs up, performing minimal number operations from steps 1-3 to bring
   it to the same state as if you rebuilt and redeployed everything. 
5. Cleanup

   Once you Ctrl+C your `skaffold dev`, everything is stopped and removed from the kube.
   
## Architecture

```
                          +--http--> [micro1]    ->---heartbeat---+
                          |                                       |
(internet)  -->  [api-gateway]                   <------------- [redis]
                          |                                       |
                          +--http--> [micro2]    ->---heartbeat---+

```
   
## Exercises

### Create your own microservice

1. Copy `/query` directory to a new directory of your choice, say `/foo`
2. Rename appname in package.json and k8s/deployment.yaml (there are 5 spots)
3. Add your `/foo` to `./kustomization.yaml|resources` as `- foo/k8s/deployment.yaml`
4. Copy-paste one of the `build.artifacts` in `skaffold.yaml` and change it to `/foo`
5. Adjust index.js to your liking

If not yet runnning, run `skaffold dev`

### Make redeployment faster with file sync and nodemon

1. Add `"nodemon": "^1.19.4"` to the micro's package.json
2. Add `"dev": "nodemon src/index.js"` to package.json scrips
3. Switch your micro to run under nodemon in respective Dockerfile by using `CMD npm run dev`
4. Add the following to `skaffold.yaml`'s build.artifact under `context`:

   ```
    - image: <micro>
      context: ./<micro>/
      sync:
        manual:
          - src: 'src/**/*.js'
            dest: .
   ```