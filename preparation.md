# Environment Setup
## Pre-requisit Dependencies
- Install nodejs (version >= 14.*)
- Install expo-cli with the following command:
```bash
 sudo npm install expo-cli --global 
```
- install [redis](http://redis.io) [redis on mac](https://medium.com/@petehouston/install-and-config-redis-on-mac-os-x-via-homebrew-eb8df9a4f298)
- install [mongodb](http://mongodb.com/download-center/community)

## Dependencies Documentation
| Dependency | Links |
| ----------- | ----------- |
| redis | [Documentation list](https://redis.io/documentation) |
| redis client | [NodeJs client](https://www.npmjs.com/package/redis) |
| mongodb driver | [Quick start](https://mongodb.github.io/node-mongodb-native/3.5/quick-start/quick-start/) |


## Running the SVU Project
To start the SVU project, navigate to the directory and run one of the following npm commands.

```bash
cd SVU
npm start # you can open iOS, Android, or web from here, or run them directly with the commands below.
npm run android
npm run ios
npm run web
```

The expo framework will automatically re-package your app as you develp.  When you save a modified file, expo will repackage and redeploy the app, you will see the change instantly in the browser/mobile app.
