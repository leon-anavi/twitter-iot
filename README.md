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
* Install the twitter-iot using npm
```
sudo npm install twitter-iot -g
```
* Go to https://apps.twitter.com/ and get consumer_key, consumer_secret, access_token and access_token_secret for your new app
* Replace **{prefix}** with the corresponding path (usually /usr/local) and execute the following command to create config.json and after than edit the configurations in it:
```
cp {prefix}/lib/node_modules/twitter-iot/config-sample.json config.json
```
* Run twitter-iot
To run the application once edit config.json, set infinite to false and run:
```
twitter-iot --config config.json
```
To run the application forever edit config.json, set infinite to true, set duration to 5 seconds or more and run:
```
forever /usr/local/bin/twitter-iot --config config.json
```
For more information type:
```
twitter-iot --help
```

##License

The source code of twitter-iot is available under GPLv3 license. Please contribute changes to the project through GitHub pull requests.
