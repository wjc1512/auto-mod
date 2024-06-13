const { SlashCommandBuilder } = require('discord.js')

class BaseCommand {
    constructor(name, description, have_subcommand=false){
        this.name = name
        this.description = description
        this.have_subcommand = have_subcommand
    }

    async execute(interaction){
        await interaction.reply('Pls Implement!')
    }

    getData(){
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
    }
}

module.exports = BaseCommand