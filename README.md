# TeamSpeak Discord Bot

## What?
Keeps track of how many people are in a TeamSpeak server, on your Discord server. The bot does this through

1) renaming a channel name (twice per 10 minutes, as per Discord's rate limits for channel renames)
2) updating the bot's presence (every 10 seconds)

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

