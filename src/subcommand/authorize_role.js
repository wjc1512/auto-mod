const SubCommand = require('../util/sub_command')

class AuthorizeRole extends SubCommand {
    constructor(){
        super('setting', 'authorized_role', 'Specify the roles that have/not-have access to the bot')
    }

    async execute(interaction){
        const connection = await require('../database/db')
        const authorizedRole = interaction.options.getRole('value')
        const roleAction = interaction.options.getString('action')

        switch(roleAction) {
            case 'add':
                try {
                    await connection.query(`
                    INSERT INTO GUILD_AUTHORIZED_ROLE (guild_id, role_id, role_name) 
                    VALUES('${interaction.guild.id}', '${authorizedRole.id}', '${authorizedRole.name}')`)

                    await interaction.followUp({content: `${authorizedRole} is successfully authorized!`, ephemeral:true})
                } catch (err) {
                    if (err.errno === 1062) {
                        await interaction.followUp({content: `${authorizedRole} is already authorized!`, ephemeral:true})
                    } else {
                        await interaction.followUp({content: `error code: ${err.code}`, ephemeral:true})
                        console.log(err)
                    }
                }
                break;
            case 'remove':
                try {
                    await connection.query(`
                    DELETE FROM GUILD_AUTHORIZED_ROLE
                    WHERE role_id = ${authorizedRole.id}`)

                    await interaction.followUp({content: `${authorizedRole} is successfully unauthorized!`, ephemeral:true})
                } catch (err) {
                    await interaction.followUp({content: `error code: ${err.code}`, ephemeral:true})
                    console.log(err)
                }
                break;
            default:
                await interaction.followUp('Invalid chosen action!')
        }
    }

    addBaseCmd(base_cmd_ref){
        base_cmd_ref.addSubcommand(subcommand => 
            subcommand.setName(this.name)
                .setDescription(this.description)
                .addStringOption(option => option
                    .setName('action')
                    .setDescription('choose an action on whether to add a role or remove a role')
                    .addChoices(
                        { name: 'add-a-role', value: 'add' },
                        { name: 'remove-a-role', value: 'remove' })
                    .setRequired(true))
                .addRoleOption(role => role
                    .setName('value')
                    .setDescription('role to specify')
                    .setRequired(true)))
    }
}

module.exports = AuthorizeRole