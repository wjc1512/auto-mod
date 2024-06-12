const BaseCommand = require('../util/BaseCommand')

module.exports = class Test extends BaseCommand {
    constructor(){
        super('test', 'Replies with success!')
    }

    async execute(interaction){
        await interaction.reply('Success!')
    }
}