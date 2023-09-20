require('dotenv').config();

const Discord = require("discord.js");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");


initializeApp();

const db = getFirestore();
const guildID = "898657624223019028";
const memberRoleID = "899274065544626187";

const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING,
        Discord.Intents.FLAGS.GUILD_PRESENCES,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
    ],
    partials: ["CHANNEL"],
});

client.on('ready', () => {
    console.log('Logged in as ' + client.user.tag + "!");
});

client.on('guildMemberAdd', (member) => {
    // Make sure that it's not the bot.
    if (member.user.id === client.user.id) return;
    // Send an embed to the new member.
    member.send({
        embeds: [new Discord.MessageEmbed()
            .setColor('#cf2121')
            .setTitle('Welcome to the ATAST LPM Club')
            .setDescription('Can you please verify that you\'re a member by sending your ID and email in this DM.' +
                ' Please follow this format: ID = [YOUR_ID] / EMAIL = [YOUR_EMAIL]')
            .setFooter("This message is sent to you because you recently joined our discord server"),
        ]
    }).catch(console.error);
})

client.on("messageCreate", msg => {
    if (msg.author.bot) return;

    if (msg.channel.type === 'DM') {
        const guild = client.guilds.cache.get(guildID);
        if (guild.members.cache.get(msg.author.id) !== undefined) {
            if (msg.content.includes("ID = ") && msg.content.includes("EMAIL = ") && msg.content.includes(" / ")) {
                const strings = msg.content.split(" / ")
                if (strings[0].trim().includes("ID = ") && strings[1].trim().includes("EMAIL = ")) {
                    const id = strings[0].trim().replace("ID = ", "");
                    const email = strings[1].trim().replace("EMAIL = ", "");
                    checkUser(id, email, msg).then();
                } else {
                    msg.reply("This message is badly formatted! Please retry!").then()
                }
            } else {
                msg.reply("Sorry, I didn't understand that! The problem may be due to bad formatting.\n" +
                    "If you're having a problem, please don't hesitate " +
                    "to contact me on aminbadh@gmail.com (should be changed)").then()
            }
        } else {
            console.log("Not in server")
        }
    }
})

async function checkUser(id, email, msg) {
    id = id.toString();
    email = email.toString();
    const snapshot = await db.collection("members").where("ID", "==", id).where("email", "==", email).get();
    if (snapshot.empty) {
        msg.reply("Sorry, we can't find this ID in our database.\n" +
            "Please make sure the formatting and the ID are correct.");
    } else {
        const role = snapshot.docs[0].get("role");
        if (snapshot.docs[0].get("userID") === undefined) {
            db.doc(snapshot.docs[0].ref.path).update({userID: msg.author.id}).then(() => addRole(role, msg));
        } else {
            if (snapshot.docs[0].get("userID") === msg.author.id) {
                addRole(role, msg);
            } else {
                msg.reply("The user with this ID and email is already verified!").then();
            }
        }
    }
}

function addRole(roleName, msg) {
    const guild = client.guilds.cache.get(guildID);
    const member = guild.members.cache.get(msg.author.id);
    const memberRole = guild.roles.cache.find(r => r.id === memberRoleID);

    if (roleName === "member") {
        member.roles.add(memberRole).then(() => {
            msg.author.send("Thanks for verifying your account 🙂").then(() => sendWelcome(member));
        }).catch(console.error);
    }
}

function sendWelcome(member) {
    const guild = client.guilds.cache.get(guildID);
    const channel = guild.channels.cache.get("898657624223019035");
    channel.send(member.toString() + " joined the server!").then();
}

client.login(process.env.DISCORD_VERIFICATION_BOT_TOKEN).then();