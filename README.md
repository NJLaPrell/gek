# Gek

**IMPORTANT -- Gek is in development:** No, not like "Beta" or even early "Alpha" testing. More like a proof of concept that has not been vetted for security, user experience, or even sanity. Any experimenting should be done in the relative safety of a private network.

- [Gek](#gek)
  - [So what is it?](#so-what-is-it)
  - [What do I do with it?](#what-do-i-do-with-it)
    - [Setup Rules](#setup-rules)
    - [Sort Videos](#sort-videos)
    - [Unsorted Videos](#unsorted-videos)
    - [Profit](#profit)
    - [Tablet Remote?](#tablet-remote)
- [Project Setup](#project-setup)
  - [Pre-requisites](#pre-requisites)
    - [Domain](#domain)
    - [Node.js](#nodejs)
    - [Docker](#docker)
  - [Environment](#environment)
  - [The Stack](#the-stack)
  - [SSL Certificates](#ssl-certificates)
  - [Google Cloud Project Setup.](#google-cloud-project-setup)
- [Deploy](#deploy)
  - [Steps:](#steps)



## So what is it?

Gek is how watching YouTube should be. YouTube is great about discovering new content, but Gek puts the spotlight on the content you know and love.

![gek](/Screen%20Shots/1.png)

Your **playlists** are front and center and gek helps you to categorize new videos from your **subscribed channels** into them. New videos are sorted based on rules you set up based on the channel that created the video, the description, and the title. Any video that does not match a rule is put into an unsorted list where you can remove anything you aren't interested in watching, or manually sort it to a playlist.

## What do I do with it?

Log in with your Google YouTube account to grant access to your subscriptions, playlists, and the ability to like or dislike videos from within the app. Once signed in, you will see your playlists on the left.

### Setup Rules

When one of your subscribed channels creates a new video, your rules will determine which playlist the video is added to.

![gek](/Screen%20Shots/2.png)

* **Type** - Set type to *and* if you want to match on everything (such as the channel and the title). Set to *or* if you want to match on anything.
* **Channel Match** - Select a channel from your list. Often, this may be the only match you want to set if you want to sort all videos from a particular channel to a specific playlist.
* **Title Match** - Text to match the title of a video. This can be a regular expression for more complicated matching.
* **Description Match** - Text to match the description of a video. This can be a regular expression for more complicated matching.
* **Playlist** - This is where the real magic happens! 🪄 Select a playlist for matching videos to be saved to and click the green check to save the rule.

Lather, rinse, repeat! Create as many rules as you like. They are currently run in the order they appear, which means that once a rule matches a video to a playlist, no other rules are applied to that video. Additional abilities will be added to the rules at a later time.

### Sort Videos
Once you have rules setup, you don't have to do anything else. Once an hour, **Gek** will check your subscriptions for new videos and sort them to your playlist. Can't wait that long? You can set how frequently videos are sorted in the **Preferences** or even click on the **Sort Videos** button if you want to sort NOW!.

### Unsorted Videos

Any video that is not automatically sorted is added to the **Unsorted** videos queue. This makes it easy to manually sort things yourself without missing any new videos. 

![gek](/Screen%20Shots/3.png)

For each unsorted video, you can select a playlist to sort it or just click delete to remove it from the list. Click **Purge Unsorted Videos** to remove everything from the unsorted list.

### Profit

Select a playlist from the left to list the videos. Click the refresh button at the top if new videos have been added recently. Select a video to watch and rate it or remove it from your list at any time.

![gek](/Screen%20Shots/4.png)

### Tablet Remote?

Once you try it out on a tablet, you'll be thinking, *"Gee, it sure would be nice if I could use the tablet to control the video on my computer/tv."*

Then you will be excited to find out that you can do just that. Load **Gek** up in a browser on the TV and log in, then toggle the **Viewer** control in the upper right to turn it into a video viewer.

On your tablet (or any other browser, really), log in and toggle the **Remote** control. The two devices will pair and any videos you select on the remote will play on the viewer. The tablet will also navigate next/previous videos in your play list, like, dislike, and remove videos from a playlist, and control volume, mute, and seek functions.

![gek](/Screen%20Shots/5.png)


# Project Setup

---

## Pre-requisites

### Domain
For accessibility outside of the localhost, you can add an entry to **/etc/hosts** to point to the IP and give it a domain name to use. This domain name will then be used when setting up the OAuth config with Google.

For a more production like environment, [Nginx Proxy Manager](https://nginxproxymanager.com/) can be used as a reverse proxy from the host to the UI and Server services. It can be added to the docker compose, or you can add it's network to the docker compose to join it.

### Node.js

[Node Version Manager](https://github.com/nvm-sh/nvm) allows you to select/change version of Node/npm without effort. Once installed, `nvm install lts/gallium`.

### Docker

[Docker](https://www.docker.com/) is used for a more production ready environment. Docker Desktop provides a GUI and includes Docker Compose, which is also used to create two services.

---

## Environment

ESLint is used for code styling. 

Dotenv is used to read in a **.env** file for sensative and envronment based settings. Keep a development version in the project root and one to deploy with docker in the **gek-docker/server** folders.

The UI is build with angular and uses the environments files for environment configuration. UI source is in the **/src** folder.

The backend is written with TypeScript and consists of an express server, a websockets server, and a service to keep the video lists up to date. 

Package scripts serve the UI with a watcher and use ts-node-dev to transpile the typescript for the server components. Building generates source and places it into the **gek-docker** folder and zips everything up as a portable package, requiring only `docker-compose up-d` to run.

Use `npm start` for an interactive menu to select dev and build tasks.

---

## The Stack
- Angular UI
- NgRx for UI state using actions and effects.
- Express for the backend APIs.
  - Passport with the Google Open Auth 2 strategy to handle user authentication and permissions for Google APIs.
  - Express sessions for session managemt (will need to change eventually)
  - Firestore for session store, because:
- Firebase for storing user rules and caching API data so you don't hit Google's quota restrictions.
- WebSockets for managing Viewer/Remote communication.
  
---

## SSL Certificates

SSL Certificates are stored in the **certs** directory, but not checked into version control. Update **angular.json** to point to the correct SSL certificate in order to use https with the angular UI during development. If you need to create a self signed certificate, run the following from the **certs** directory:

  `./ssl.sh my.domain.com`

Be sure to add the certificate to your browser/OS and set trust settings.
(Thanks to: https://devopscube.com/create-self-signed-certificates-openssl)

In order to use the **.env** file for your certs, first, base64 encode them and save the base64 result as a string for the SSL_CERT, SSL_KEY, and SSL_CA values.

---

## Google Cloud Project Setup.

The project uses Google OAuth and the Firebase Firestore. Use the Cloud Console to setup a new project:

1.  Go to: https://console.cloud.google.com/
    * Add a new project.
1. Menu > APIs & Services > OAuth consent screen.
     * External User Type
     * Skip scopes for now (The sensative scope will require HTTPS to be setup)
     * Add test users (including yourself).
     * Create Credentials > OAuth Client ID
     * Web Application
     * Add origin URI (https://mydomain.com:4200)
     * Add authorized redirect URI (https://mydomain.com:4200/auth)
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

# Deploy

Deployment is done by creating a deploy zip consisting of the required source along with a docker compose file. Docker compose builds two services and joins them to an existing [Nginx Proxy Manager](https://nginxproxymanager.com/) reverse proxy. Adjust the network config appropriately. 

## Steps:

1. Ensure there is a .env file in the **gek-docker/server** directory.
1. Run `npm run build:package`. This cleans and builds the project with production configurations and environment, copies everything required to the **gek-docker** directory, then creates **/dist/gek.tar.gz**.
1. Copy **gek.tar.gz** to the production server and unzip it (`tar -xf gek.tar.gz`).
1. Build the containers and start them:
   * `docker-compose build`
   * `docker-compose up -d`