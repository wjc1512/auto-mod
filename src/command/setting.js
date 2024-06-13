const BaseCommand = require('../util/base_command')

class Setting extends BaseCommand {
    constructor() {
        super('setting', 'Configure various settings for the bot!', true)
    }

    async execute(interaction){
        await interaction.reply('Configuring settings...')
    }
}

module.exports = Setting


