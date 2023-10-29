<p align="center">
  <img src="https://github.com/Zamiell/hanabi-live/raw/master/public/img/logos/2.png" height=200 alt="Logo" title="Logo">
</p>
<br />

## Description

- This is the source code for [Hanab Live](http://hanab.live/), which is a website that allows people to play a cooperative card game online. It is similar to the card game [Hanabi](https://boardgamegeek.com/boardgame/98778/hanabi).
- This project has no affiliation with the card game Hanabi, [Antoine Bauza](https://en.wikipedia.org/wiki/Antoine_Bauza) (the creator of Hanabi), or any of the the real-life publishers of the game (of which there are many).
- The client is programmed in [TypeScript](https://www.typescriptlang.org/). It is located in the `client` directory.
  - A lot of the code was originally taken from [Keldon Jones'](http://keldon.net/) implementation of the game. (His site no longer exists.)
- The server is programmed in [Go](https://golang.org/). It is located in the `server` subdirectory.
  - It uses a [PostgreSQL](https://www.postgresql.org/) database to store information about the users and games.

<br />

## Discord

Find teammates to play games with at [the Discord server](https://discord.gg/FADvkJp). We also discuss code changes here.

<br />

## List of Variants

Hanab Live is different from normal Hanabi in that it implements [many special variants](https://github.com/Zamiell/hanabi-live/tree/master/docs/VARIANTS.md), in which the rules are changed to make the game more difficult.

<br />

## List of Features

See the [features documentation](https://github.com/Zamiell/hanabi-live/tree/master/docs/FEATURES.md).

<br />

## Installation

See the [installation documentation](https://github.com/Zamiell/hanabi-live/tree/master/docs/INSTALL.md).

<br />

## Credits

- [Antoine Bauza](https://en.wikipedia.org/wiki/Antoine_Bauza) created Hanabi, which was the inspiration for this website. If you enjoy playing online, then you should purchase a physical copy of the game, since he will presumably receive a portion of the proceeds.
- [Keldon Jones](http://keldon.net/) was the original creator of the slick client-side user interface.
- [Hyphen-ated](https://github.com/Hyphen-ated/) coded many useful add-on features for Keldon's site that are integrated into Hanab Live.

## Issues I had


1. first tried `docker-compose up -d` didnt work (prebuilt docker images are down??) not sure why
2. forgot to copy .env.example into .env which resulting in docker trying to create a directory there - bad. rmdir it and do the cp
3. then `docker compose -f docker-development.yml up -d`, which brought up the postgres but not the server. the issue was that someone deleted .env.docker.exaample so the docker container couldn't connect to postgres
4. forgot to install/install_database_schema.sh
5. still was having issue, there's something wrong with the docker build -- we no longer ship the frontend packages in the same way it seems.
6. tried to run the server locally, so needed to set PORT in .env
7. server index.html came up but javascript bundle wouldn't load. Something to do with main.$VERSION.min.js. Setting VERSION env variable before bash run.sh didn't help. Gave up and ln -s main.$VERSION.min.js main.min.js after every run.sh or packages/client/build_client.sh
8. Came up on localhost
9. Tried to serve up localhost via socat - didn't cross the WSL boundary.
10. Tried to ngrok http 1313 -- worked but websocket check in client/src/websocketInit.ts failed the domain check. Setting partial DOMAIN=.ngrok-free.app didn't work either. have to start the ngrok server then copy the exact url
11. now it works, but every time you take down the ngrok server you have to grab the new url, export DOMAIN=<>, rerun bash run.sh, then again ln -s main.*.min.js main.min.js in paublic/js/bundles
12. also should fix the docker, why doesn't it build the client properly
