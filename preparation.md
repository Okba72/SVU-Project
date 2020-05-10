# Environment Setup
## Pre-requisits
- Install nodejs (version >= 14.*)
- Install expo-cli
```bash
 sudo npm install expo-cli --global 
```
- install redis from this [link](http://redis.io)
- install mongodb from this [link](http://mongodb.com/download-center/community)

## Dependencies Documentation
| Dependency | Links |
| ----------- | ----------- |
| redis | [Documentation list](https://redis.io/documentation) |
| mongodb driver | [Quick start](https://mongodb.github.io/node-mongodb-native/3.5/quick-start/quick-start/) |


## Running the SVU project
To start the SVU project, navigate to the directory and run one of the following npm commands.

```bash
cd SVU
npm start # you can open iOS, Android, or web from here, or run them directly with the commands below.
npm run android
npm run ios
npm run web
```

The expo framework will automatically re-package your app as you develp.  When you save a modified file, expo will repackage and redeploy the app, you will see the change instantly in the browser/mobile app.
