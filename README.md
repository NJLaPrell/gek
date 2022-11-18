# Ytlist

**IMPORTANT -- ytlist is in development:** No, not like "Beta" or even early "Alpha" testing. More like a proof of concept that has not been vetted for security, user experience, or even sanity. Any experimenting should be done in the relative safety of private network.

- [Ytlist](#ytlist)
  - [So what is it?](#so-what-is-it)
  - [Once you try it out on a tablet...](#once-you-try-it-out-on-a-tablet)
  - [fin...?](#fin)
  - [Project Setup](#project-setup)
    - [Pre-requisites](#pre-requisites)
      - [Domain](#domain)
      - [Node.js](#nodejs)
      - [Docker](#docker)
    - [Environment](#environment)
    - [The Stack](#the-stack)
    - [Google Cloud Project Setup.](#google-cloud-project-setup)
  - [Deploy](#deploy)
    - [Steps:](#steps)



## So what is it?

ytlist is how watching YouTube should be. YouTube is great about discovering new content, but ytlist puts the spotlight on the content you know and love.

Your playlists are front and center and ytlist helps you to categorize new videos from your subscribed channels into them. New videos are sorted based on rules you set up based on the channel that created the video, the description, and the title. Any video that does not match a rule is put into an unsorted list where you can remove anything you aren't interested in watching, or manually sort it to a playlist.

## Once you try it out on a tablet...

You'll be thinking, "Gee, it sure would be nice if I could use the tablet to control the video on my computer/tv."

And that is the second main feature of ytlist. Toggle the viewer switch on a device where you want to watch the videos, and the remote switch on a tablet. Now, when you select a video on the tablet, it automatically plays on the viewer instead. The tablet will also navigate next/previous videos in your play list, like, dislike, and remove videos from a playlist, and control volume, mute, and seek functions.


## fin...?

Proper documentation will come later as the project starts to stabilize.


## Project Setup

---

### Pre-requisites

#### Domain
For accessibility outside of the localhost, you can add an entry to **/etc/hosts** to point to the IP and give it a domain name to use. This domain name will then be used when setting up the OAuth config with Google.

For a more production like environment, [Nginx Proxy Manager](https://nginxproxymanager.com/) can be used as a reverse proxy from the host to the UI and Server services. It can be added to the docker compose, or you can add it's network to the docker compose to join it.

#### Node.js

[Node Version Manager](https://github.com/nvm-sh/nvm) allows you to select/change version of Node/npm without effort. Once installed, `nvm install lts/gallium`.

#### Docker

[Docker](https://www.docker.com/) is used for a more production ready environment. Docker Desktop provides a GUI and includes Docker Compose, which is also used to create two services.

---

### Environment

ESLint is used for code styling. 

Dotenv is used to read in a **.env** file for sensative and envronment based settings. Keep a development version in the project root and one to deploy with docker in the **ytlist-docker/server** folders.

The UI is build with angular and uses the environments files for environment configuration. UI source is in the **/src** folder.

The backend is written with TypeScript and consists of an express server, a websockets server, and a service to keep the video lists up to date. 

Package scripts serve the UI with a watcher and use ts-node-dev to transpile the typescript for the server components. Building generates source and places it into the **ytlist-docker** folder and zips everything up as a portable package, requiring only `docker-compose up-d` to run.

Use `npm start` for an interactive menu to select dev and build tasks.

---

### The Stack
- Angular UI
- NgRx for UI state using actions and effects.
- Express for the backend APIs.
  - Passport with the Google Open Auth 2 strategy to handle user authentication and permissions for Google APIs.
  - Express sessions for session managemt (will need to change eventually)
  - Firestore for session store, because:
- Firebase for storing user rules and caching API data so you don't hit Google's quota restrictions.
- WebSockets for managing Viewer/Remote communication.
  
---

### Google Cloud Project Setup.

The project uses Google OAuth and the Firebase Firestore. Use the Cloud Console to setup a new project:

1.  Go to: https://console.cloud.google.com/
    * Add a new project.
1. Menu > APIs & Services > OAuth consent screen.
     * External User Type
     * Skip scopes for now (The sensative scope will require HTTPS to be setup)
     * Add test users (including yourself).
     * Create Credentials > OAuth Client ID
     * Web Application
     * Add origin URI (http://mydomain.com:4200)
     * Add authorized redirect URI (http://mydomain.com:4200/auth)
     * Create
     * Download JSON.
        * Copy the values of the JSON to the .env file, using .env-example as a guide. Be sure the .env file is not checked in. 
1. Menu > APIs & Services > Credentials.
   * Create Credentials > Service Account
   * Create App Engine Service Admin
   * Add Email
1. Menu > APIs & Services > Credentials.
   * Create Credentials > Service Account
   * Create Firebase Admin SDK Administrator Service
   * Add Email
1. Menu > APIs & Services > Enabled APIs and Services
   * Enable APIs and Services
     * Youtube Data API v3
     * Google Cloud Firestore API
1. Menu > Firestore
   * Select Native Mode
1. Go to the firebase console: https://console.firebase.google.com/
   * Add Project
   * Quickstart documentation is here: https://firebase.google.com/docs/firestore/quickstart
1. From the firebase console: https://console.firebase.google.com
   * Gear Icon > Project Settings > Service Accounts
   * Generate a new private key
     * Update the **.env** file with relevant values from the JSON file.
1. Install the Firebase Admin SDK and initialize the project.
   * `npm install -d firebase-admin`
   * Create a folder to use as a workspace and change directories to it.
   * `firebase login`
   * `firebase init`
   * Select **Realtime Database**.
   * Select your project.

## Deploy

Deployment is done by creating a deploy zip consisting of the required source along with a docker compose file. Docker compose builds two services and joins them to an existing [Nginx Proxy Manager](https://nginxproxymanager.com/) reverse proxy. Adjust the network config appropriately. 

### Steps:

1. Ensure there is a .env file in the **ytlist-docker/server** directory.
1. Run `npm run build:package`. This cleans and builds the project with production configurations and environment, copies everything required to the **ytlist-docker** directory, then creates **/dist/ytlist.tar.gz**.
1. Copy **ytlist.tar.gz** to the production server and unzip it (`tar -xf ytlist.tar.gz`).
1. Build the containers and start them:
   * `docker-compose build`
   * `docker-compose up -d`