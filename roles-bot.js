require('dotenv').config();

const Discord = require("discord.js");
const {Intents} = require("discord.js");

const guildID = "898657624223019028"
const flutterRoleID = "899641088938221598";
const botCommandsChannelID = "899982478972960788";

const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
    partials: ['MESSAGE', 'REACTION'],
});

client.on('ready', async () => {
    console.log('Logged in as ' + client.user.tag + "!");
});

client.on('messageCreate', async (msg) => {
    if (msg.channel.id === botCommandsChannelID && msg.content.startsWith("!")) {
        const guild = client.guilds.cache.get(guildID);

        const items = msg.content.trim().split(" ");

        if (items[0] === "!react") {
            const channel = guild.channels.cache.get("899294474369384448");
            const message = await channel.messages.fetch("899738384640126976");

            if (items[1] === "add") {
                await message.react(items[2]);
            } else if (items[1] === "remove") {
                await message.reactions.resolve(items[2]).users.remove(client.user.id);
            } else if (items[1] === "remove-all") {
                await message.reactions.resolve(items[2]).remove();
            }
        }
    }
})

client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.id === "899738384640126976" && !user.bot) {
        const guild = client.guilds.cache.get(guildID);
        const member = guild.members.cache.get(user.id);
        const role = getRole(reaction.emoji.name);
        member.roles.add(role).then();
    }
});

client.on('messageReactionRemove', (reaction, user) => {
    if (reaction.message.id === "899738384640126976" && !user.bot) {
        const guild = client.guilds.cache.get(guildID);
        const member = guild.members.cache.get(user.id);
        const role = getRole(reaction.emoji.name);
        member.roles.remove(role).then();
    }
});

function getRole(emoji) {
    const guild = client.guilds.cache.get(guildID);

    switch (emoji) {
        case "🐦":
            return guild.roles.cache.get(flutterRoleID);
    }
}

client.login(process.env.DISCORD_ROLE_BOT_TOKEN).then();