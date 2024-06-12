const cfg = require('../config.json')
const Queue = require('./util/queue')
const queue = Queue.getInstance()

module.exports = class Conversation {
    constructor(guildId, channelId){
        this.gid = guildId
        this.cid = channelId
        this.timeout = setTimeout(async () => await this.pushToQueue(), cfg.timeoutDuration)
    }

    addMessage(userId, msgContent){
        
    }

    resetTimeout(){
        clearTimeout(this.timeout)
        this.timeout = setTimeout(async () => await this.pushToQueue(), cfg.timeoutDuration)
    }
    
    async pushToQueue(){
        if (queue.isFull()){
            const deqAll = () => {
                const node = queue.dequeue()
                return [node].concat(deqAll())}
            await Promise.all(deqAll().map(moderateUser))
        }
        queue.enqueue(this)
    }
}