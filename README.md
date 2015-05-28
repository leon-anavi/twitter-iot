# Twitter-IoT
Twitter bot connected to Internet of Things (IoT). The bot offer the following features:
* Retrieve tweets depending on configured text (with or without hashtags)
* Retweet found tweets
* Favorite found tweets
* Reply to found tweets
* Publish message to MQTT broker

All features are optional and can be easily enabled or disabled through a configuration file.

##Installation

Twitter-iot is developed using node.js and mongodb. It has been tested on Ubuntu 15.04.

Follow the steps below to install twitter-iot on Ubuntu (the procedure is similar for other GNU/Linux distributions):
* Install node.js, npm and mongodb
```
sudo apt-get install nodejs
sudo apt-get install npm
sudo apt-get install mongodb
```
* Install the following npm packages: twit, mongojs, promise
```
sudo npm install twit
sudo npm install mongojs
sudo npm install promise
sudo npm install mqtt
sudo npm install forever
```
* Go to https://apps.twitter.com/ and get consumer_key, consumer_secret, access_token and access_token_secret for your new app
* Create config.json and edit the configurations in it
```
cp config-sample.json config.json
```
* Run twitter-iot
To run the application once edit config.json, set infinite to false and run:
```
node app.js
```
To run the application forever edit config.json, set infinite to true, set duration to 5 seconds or more and run:
```
forever app.js
```
