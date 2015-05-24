# Twitter-iot
Twitter bot connected to Internet of Things (IoT). The bot has the following capabilities:
* Retieve tweets depending on configured text (with or without hashtags)
* Retweet found tweets (can be disabled through the configurations)
* Favorite found tweets (can be disabled through the configurations)
* Publish message to MQTT broker (can be disabled through the configurations)

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
```
* Go to https://apps.twitter.com/ and get consumer_key, consumer_secret, access_token and access_token_secret for your new app
* Create config.json and edit the configurations in it
```
cp config-sample.json config.json
```
* Run twitter-iot (it is recommended to add it to crontab and run it automatically)
```
node app
```
