const BaseCommand = require('../util/base_command')

class RestrictKeyword extends BaseCommand{
    constructor(){
        super('restrict_keyword', 'Specify the keyword to be restricted from the guild.')
    }

    async execute(interaction){
        const connection = await require('../database/db')
        const restricted_keyword = interaction.options.getString('keyword')

        try{
            await connection.query(`INSERT INTO guild_restricted_keyword (guild_id, keyword) VALUES ('${interaction.guild.id}', '${restricted_keyword}')`)
            await interaction.reply(`Restricted keyword: "${restricted_keyword}" successfully added.`)
        } catch (err) {
            if (err.errno === 1062) {
                await connection.query(`DELETE FROM guild_restricted_keyword WHERE guild_id = '${interaction.guild.id}' AND keyword = '${restricted_keyword}'`)
                await interaction.reply(`Restricted keyword: "${restricted_keyword}" successfully removed.`)
            } else {
                await interaction.reply({content: `error code: ${err.code}`, ephemeral:true})
                console.log(err)
            }
        }
    }

    getData(){
        return super.getData()
            .addStringOption(option => option
                .setName('keyword')
                .setDescription('keyword to specify.')
                .setRequired(true))
    }
}

module.exports = RestrictKeyword