require('dotenv').config()
const { Events } = require('discord.js')
const GuildMap = require('./conversation_map.js')
const client = require('./client.js')

let connection
const guildMap = GuildMap.getInstance()

client.on('ready', async () => {
    connection = await require('./database/db')
    await connection.query(`SELECT * FROM GUILD;`).then(([guildRec]) => {
        //initialize guild map
        guildRec.forEach((guild) => {
            guildMap.addGuild(guild.guild_id)
            //register command
            require('./register_command')(guild.guild_id)
        })
        //initialize channel map
        Array.from(guildMap.getKeys()).forEach(async (guildID) => {
            const guild = client.guilds.cache.get(guildID)
            if (guild){
                guild.channels.cache.forEach((channel) => {
                    guildMap.getValue(guild.id).addChannel(channel.id)
                })
            } else {
                console.error(`Guild ID ${guildID} cannot be found.`)
            }
        })
    }).catch((err) => {
        console.error(err)
    })
})

client.on('guildMemberAdd', async (member) => {
    if (member.user.bot) return;
    await connection.query(
        `INSERT INTO USER (user_id, user_name, guild_id) 
        VALUES ('${member.user.id}', '${member.user.username}', '${member.guild.id}');`
    )
})

client.on('guildMemberRemove', async (member) => {
    if (member.user.bot) return;
    await connection.query(
        `DELETE FROM USER 
        WHERE guild_id = '${member.guild.id}'
        AND member_id = '${member.user.id}';`
    )
})

client.on('guildCreate', async (guild) => {
    try{
        await connection.query(
            `INSERT INTO GUILD (guild_id, guild_name, join_date)
            VALUES ('${guild.id}', '${guild.name}', '${new Date()}');`
        )

        await guild.members.fetch();

        guild.members.cache.filter(m => !m.user.bot).forEach(async (m) => {
            await connection.query(
                `INSERT INTO USER (guild_id, user_id, user_name)
                VALUES('${m.guild.id}', '${m.user.id}', '${m.user.username}');`
            )
        })
    } catch(err) {
        console.error(err)
    }
    guildMap.addGuild(guild.id)

    await guild.channels.fetch();

    guild.channels.cache.forEach((channel) => {
        guildMap.getValue(guild.id).addChannel(channel.id)
    })
    require('./register_command')(guild.id)
})

client.on('guildDelete', async (guild) => {
    try{
        await connection.query(
            `DELETE FROM USER
            WHERE guild_id = ${guild.id};`
        )
        await connection.query(
            `DELETE FROM GUILD
            WHERE guild_id = ${guild.id};`
        )
    } catch (err) {
        console.error(err)
    }
    guildMap.removeGuild(guild.id)
})

client.on('channelCreate', (channel) => {
    guildMap.getValue(channel.guild.id).addChannel(channel.id)
})

client.on('channelRemove', (channel) => {   
    guildMap.getValue(channel.guild.id).removeChannel(channel.id)
})

client.on('messageCreate', (msg) => {
    if (msg.author.bot) return;
    
    guildMap.getValue(msg.guildId).getValue(msg.channelId).addMsg(msg.author.id, msg.id, msg.content)
})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    
    const command = client.base_command.get(interaction.commandName);
    const subcommand = client.sub_command.get(interaction.commandName)?.get(interaction.options.getSubcommand());

    try {
        await command.execute(interaction);
        if (subcommand) await subcommand.execute(interaction);
    } catch (e) {
        console.error(e);
        if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
})

client.login(process.env.TOKEN);