const { SlashCommandBuilder } = require('discord.js')

class BaseCommand {
    constructor(name, description){
        this.name = name
        this.description = description
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