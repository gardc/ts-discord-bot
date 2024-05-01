# TeamSpeak Discord Bot

## What?

Keeps track of how many people are in a TeamSpeak server, on your Discord server. The bot does this through

1. renaming a channel name (twice per 10 minutes, as per Discord's rate limits for channel renames)
2. updating the bot's presence (every 10 seconds)

## How?

Through these environment variables:

```ini
DISCORD_TOKEN=yourToken
DISCORD_CHANNEL_ID=yourChannelID
TS_SERVER_IP=yourTeamSpeakServerIp
TS_USERNAME=yourTeamSpeakUsername
TS_PASSWORD=yourTeamSpeakPassword
TS_NICKNAME=yourTeamSpeakNickname
TS_QUERY_PORT=10011 # 10011 by default
TS_SERVER_PORT=9987 # 9987 by default

# Will result in e.g. "❌ no gamers on TS" or "✅ 1 gamer on TS" or "✅ 3 gamers on TS" status text
SINGULAR_TERM=gamer
PLURAL_TERM=gamers
```

Use it with `bun run ./index.ts` and create your `.env` file beforehand, or build a docker image with `docker build -t ts-discord-bot .`

The built docker image can for instance then be used like this:
```yaml
version: '3.1'
services:
  teamspeak:
    image: teamspeak
    restart: always
    ports:
      - 9987:9987/udp
      - 10011:10011
      - 30033:30033
    environment:
      TS3SERVER_DB_PLUGIN: ts3db_mariadb
      TS3SERVER_DB_SQLCREATEPATH: create_mariadb
      TS3SERVER_DB_HOST: teamspeak-db
      TS3SERVER_DB_USER: root
      TS3SERVER_DB_PASSWORD: password
      TS3SERVER_DB_NAME: teamspeak
      TS3SERVER_DB_WAITUNTILREADY: 30
      TS3SERVER_LICENSE: accept
  teamspeak-db:
    image: mariadb
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: teamspeak
    volumes:
      - ./db-data:/var/lib/mysql
  discord-bot:
    depends_on:
      - teamspeak
    image: ts-discord-bot:latest
    restart: 'no'
    environment:
      DISCORD_TOKEN: "token"
      DISCORD_CHANNEL_ID: "channel id"
      TS_SERVER_IP: teamspeak
      TS_USERNAME: username
      TS_PASSWORD: password
      TS_NICKNAME: nickname
      TS_QUERY_PORT: "10011"
      TS_SERVER_PORT: "9987"
      SINGULAR_TERM: gamer
      PLURAL_TERM: gamers
```
