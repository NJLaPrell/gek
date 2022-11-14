# Ytlist


**IMPORTANT -- ytlist is in development:** No, not like "Beta" or even early "Alpha" testing. More like a proof of concept that has not been vetted for security, user experience, or even sanity. Any experimenting should be done in the relative safety of private network.

## So what is it?

ytlist is how watching YouTube should be. YouTube is great about discovering new content, but ytlist puts the spotlight on the content you know and love.

Your playlists are front and center and ytlist helps you to categorize new videos from your subscribed channels into them. New videos are sorted based on rules you set up based on the channel that created the video, the description, and the title. Any video that does not match a rule is put into an unsorted list where you can remove anything you aren't interested in watching, or manually sort it to a playlist.

## Once you try it out on a tablet, you'll be thinking, "Gee, it sure would be nice if I could use the tablet to control the video on my computer/tv."

And that is the second main feature of ytlist. Toggle the viewer switch on a device where you want to watch the videos, and the remote switch on a tablet. Now, when you select a video on the tablet, it automatically plays on the viewer instead. The tablet will also navigate next/previous videos in your play list, like, dislike, and remove videos from a playlist, and control volume, mute, and seek functions.

## Brief (and I mean brief) run down of the stack:

- Angular UI
- NgRx for UI state using actions and effects.
- Express for the backend APIs.
  - Passport with the Google Open Auth 2 strategy to handle user authentication and permissions for Google APIs.
  - Express sessions for session managemt (will need to change eventually)
  - Firestore for session store, because:
- Firebase for storing user rules and caching API data so you don't hit Google's quota restrictions.
- WebSockets for managing Viewer/Remote communication.

## fin...

Proper documentation will come later as the project starts to stabilize.


## Deploy

Deployment is done by creating a deploy zip consisting of the required source along with a docker compose file. Docker compose builds two services and joins them to an existing [Nginx Proxy Manager](https://nginxproxymanager.com/) reverse proxy. Adjust the network config appropriately. 

### Steps:

1. Ensure there is a .env file in the **ytlist-docker/server** directory.
1. Run `npm run build:package`. This cleans and builds the project with production configurations and environment, copies everything required to the **ytlist-docker** directory, then creates **/dist/ytlist.tar.gz**.
1. Copy **ytlist.tar.gz** to the production server and unzip it (`tar -xf ytlist.tar.gz`).
1. Build the containers and start them:
   * `docker-compose build`
   * `docker-compose up -d`
