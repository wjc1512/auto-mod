const SubCommand = require('../util/sub_command')

class IgnoreChannel extends SubCommand {
    constructor(){
        super('setting', 'ignore_channel', 'Specify the channels that the bot have access to')
    }

    async execute(interaction){
        const connection = await require('../database/db')
        const ignoredChannel = interaction.options.getChannel('value')
        const channelAction = interaction.options.getString('action')

        switch(channelAction) {
            case 'add':
                try {
                    await connection.query(`
                    INSERT INTO guild_ignored_channel (guild_id, channel_id, channel_name) 
                    VALUES('${interaction.guild.id}', '${ignoredChannel.id}', '${ignoredChannel.name}')`)

                    await interaction.followUp({content: `${ignoredChannel} is successfully ignored!`, ephemeral:true})
                } catch (err) {
                    if (err.errno === 1062) {
                        await interaction.followUp({content: `${ignoredChannel} is already ignored!`, ephemeral:true})
                    } else {
                        await interaction.followUp({content: `error code: ${err.code}`, ephemeral:true})
                        console.log(err)
                    }
                }
                break;
            case 'remove':
                try {
                    await connection.query(`
                    DELETE FROM guild_ignored_channel
                    WHERE channel_id = ${ignoredChannel.id}`)

                    await interaction.followUp({content: `${ignoredChannel} is successfully un-ignored!`, ephemeral:true})
                } catch (err) {
                    await interaction.followUp({content: `error code: ${err.code}`, ephemeral:true})
                    console.log(err)
                }
                break;
            default:
                await interaction.reply('invalid action chosen')
        }
    }

    addBaseCmd(base_cmd_ref){
        base_cmd_ref.addSubcommand(subcommand => 
            subcommand.setName(this.name)
                .setDescription(this.description)
                .addStringOption(option => option
                    .setName('action')
                    .setDescription('choose an action on whether to add-a-channel-to-be-ignored or remove-a-channel-to-be-ignored')
                    .addChoices(
                        { name: 'add-a-channel', value: 'add' },
                        { name: 'remove-a-channel', value: 'remove' })
                    .setRequired(true))
                .addChannelOption(role => role
                    .setName('value')
                    .setDescription('channel to specify')
                    .setRequired(true)))
    }
}

module.exports = IgnoreChannel