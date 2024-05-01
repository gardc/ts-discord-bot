import { TeamSpeak, QueryProtocol } from "ts3-nodejs-library";
import { Client, TextChannel, ActivityType } from "discord.js";
import process from "node:process";
import "dotenv/config";

// Configuration
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || "";
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || "";
// Initialize the TeamSpeak client
const tsClient = new TeamSpeak({
  protocol: QueryProtocol.RAW, // This could be RAW or SSH depending on your setup
  queryport: parseInt(process.env.TS_QUERY_PORT || ""),
  serverport: parseInt(process.env.TS_SERVER_PORT || ""),
  host: process.env.TS_SERVER_IP,
  username: process.env.TS_USERNAME,
  password: process.env.TS_PASSWORD,
  nickname: process.env.TS_NICKNAME,
});
const discordClient = new Client({
  intents: ["Guilds", "GuildMessages"],
  rest: {
    rejectOnRateLimit: () => true,
  },
});
const singularTerm = process.env.SINGULAR_TERM || "person";
const pluralTerm = process.env.PLURAL_TERM || "people";

// State
let lastPresenceUserCount = -1;
let lastChannelNameUserCount = -1;

// Functionality
discordClient.on("error", (error) => {
  console.error("Discord client error:", error);
});

discordClient.on("ready", () => {
  if (discordClient.user) {
    console.log(`Logged in as ${discordClient.user.tag}!`);
    // set the channel rename interval
    setInterval(() => updateChannelNamePeriodically(), 300_000);
    // set the presence update interval
    setInterval(() => updatePresencePeriodically(), 10_000);
  } else throw new Error("Failed to login to Discord");
});

async function updatePresencePeriodically() {
  const userCount = await getActiveUsersFromTeamSpeak();

  // check if precense is different from the current state before updating
  if (userCount === lastPresenceUserCount) return;

  let status: string;
  switch (userCount) {
    case 0:
      status = `❌ 0 ${pluralTerm} on TeamSpeak`;
      break;
    case 1:
      status = `✅ 1 ${singularTerm} on TeamSpeak`;
      break;
    default:
      status = `✅ ${userCount} ${pluralTerm} on TeamSpeak`;
  }

  discordClient.user?.setPresence({
    activities: [
      {
        name: "TeamSpeak",
        type: ActivityType.Custom,
        state: status,
      },
    ],
  });
  lastPresenceUserCount = userCount;
}

// Function to update Discord channel name
async function updateChannelNamePeriodically() {
  const userCount = await getActiveUsersFromTeamSpeak();

  // Make sure user count is different from last update
  if (userCount === lastChannelNameUserCount) return;

  // Fetch the channel and assert the type after checking if it's text-based
  const channel = await discordClient.channels.fetch(CHANNEL_ID);
  if (channel != null) {
    // Checking if setName method exists
    let newName: string;
    userCount === 0
      ? (newName = "❌-nobody-on-ts")
      : (newName = `✅-${userCount}-on-ts`);

    try {
      console.log(`⌛ Updating channel name to "${newName}"...`);
      await (channel as TextChannel).setName(newName);
      console.log(`✅ Updated channel name to "${newName}"`);
      lastChannelNameUserCount = userCount;
    } catch (error) {
      console.error("❌ Failed to update channel name:", error);
    }
  }
}

// Function to fetch the number of active users on TeamSpeak
async function getActiveUsersFromTeamSpeak() {
  try {
    const server = await tsClient.serverInfo();
    return (
      server.virtualserverClientsonline - server.virtualserverQueryclientsonline
    ); // Subtract query clients
  } catch (error) {
    console.error("Failed to retrieve TeamSpeak user count:", error);
    return 0; // Return 0 if the query fails
  }
}

// Start the bot by logging the bot in to Discord
discordClient.login(DISCORD_TOKEN);
