class SubCommand {
    constructor(base_command, name, description){
        this.base_command = base_command
        this.name = name
        this.description = description
    }

    async execute(interaction){
        await interaction.followUp('Pls Implement!')
    }

    addBaseCmd(base_cmd_ref){
        base_cmd_ref.addSubcommand(subcommand => 
            subcommand.setName(this.name)
                .setDescription(this.description)
        )
    }
}

module.exports = SubCommand