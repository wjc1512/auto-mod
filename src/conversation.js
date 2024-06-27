const cfg = require('../config.json')
const Queue = require('./util/queue')
const LinkedList = require('./util/linked_list')
const queue = Queue.getInstance()

module.exports = class Conversation {
    constructor(guildId, channelId){
        this.gid = guildId
        this.cid = channelId
        this.initData()
    }

    getMsg(msgId){
        return this.data.search(msgId)
    }

    addMsg(userId, msgId, msgContent){
        this.data.add(msgId, { id: userId, msg: msgContent })
        this.resetTimeout()
    }

    deleteMsg(msgId){
        this.data.delete(msgId)
        this.resetTimeout()
    }

    editMsg(msgId, msgContent){
        const { id } = this.getMsg(msgId)
        this.data.update(msgId, { id: id, msg: msgContent })
        this.resetTimeout()
    }

    resetTimeout(){
        clearTimeout(this.timeout)
        this.timeout = setTimeout(async () => await this.pushToQueue(), cfg.timeoutDuration)
    }

    initData(){
        this.data = new LinkedList()
        this.timeout = null
    }
    
    async pushToQueue(){
        if (queue.isFull()){
            const deqAll = () => {
                const node = queue.dequeue()
                return [node].concat(deqAll())}
            await Promise.all(deqAll().map(moderateUser))
        }
        queue.enqueue(this)
        this.initData()
    }
}