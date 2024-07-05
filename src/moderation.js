const aposToLexForm = require('apos-to-lex-form')
const natural = require('natural')
const SpellCorrector = require('spelling-corrector')
const stopWord = require('stopword')
const SuffixTree = require('./util/suffix_tree')
const math = require('mathjs')
const cfg = require('../config.json')

const get_ascii_index = (c) => { return c.charCodeAt(0) }

function get_bwt(msg){
    const bwt_msg = msg + '$'
    const suffix_arr = new SuffixTree(bwt_msg).get_suffix_array()
    return [suffix_arr.map(id => bwt_msg[math.mod((id-1), bwt_msg.length)]).join(''), suffix_arr]
}

function get_rank_arr(bwt){
    const rank_arr = Array(cfg.ascii_ubound - cfg.ascii_lbound + 1).fill(0)
    Array.from(bwt).forEach(char => rank_arr[get_ascii_index(char)] += 1)
    let counter = 1
    for (let i = 0; i < rank_arr.length; i++){
        if (rank_arr[i] > 0){
            const prev = rank_arr[i]
            rank_arr[i] = counter
            counter += prev
        }
    }
    return rank_arr
}

function get_occurrence_arr(bwt){
    const occ_arr = Array(bwt.length+1).fill().map(() => Array(cfg.ascii_ubound - cfg.ascii_lbound + 1).fill(0))
    for (let i = 1; i < bwt.length+1; i++){
        for (let j = 0; j < cfg.ascii_ubound - cfg.ascii_lbound + 1; j++){
            occ_arr[i][j] = occ_arr[i-1][j]
        }
        occ_arr[i][get_ascii_index(bwt[i-1])] += 1
    }
    return occ_arr
}

async function restricted_keyword_match(msg, gid){ 
    const connection = await require('./database/db')
    const [bwt, suffix_arr] = get_bwt(msg)
    const rank_arr = get_rank_arr(bwt)
    const occ_arr = get_occurrence_arr(bwt)
    const result = new Map()
    await connection.query(`SELECT keyword FROM guild_restricted_keyword WHERE guild_id = '${gid}'`).then(([keywords]) => {
        keywords.forEach(keyword => {
            const pattern = keyword.keyword
            let sp = 1
            let ep = bwt.length 
            let i = pattern.length
            while (i >= 1 && sp <= ep){
                const rank = rank_arr[get_ascii_index(pattern[i-1])]
                sp = rank + occ_arr[sp-1][get_ascii_index(pattern[i-1])]
                ep = rank + occ_arr[ep][get_ascii_index(pattern[i-1])] - 1
                i -= 1
            }
            const position = suffix_arr.slice(sp-1, ep)
            if (position.length > 0) result.set(pattern, position)
        })
        return result
    })
}

async function update_user_sentiment(conversation){
    const connection = await require('./database/db')
    const authors = new Set()
    Array.from(conversation.data)
        .forEach(msg => authors.add(msg.data.id))   
    authors.forEach(async author => {
        const author_msg = Array.from(conversation.data).filter(msg => msg.data.id == author).map(msg => msg.data.msg).join('\n')
        const sentiment_score = sentiment_analysis(author_msg)
        const user_st_score = await connection.query(`SELECT st_score
            FROM user
            WHERE user_id = '${author}'
            AND guild_id = '${conversation.gid}'`)
        await connection.query(`UPDATE user
            SET st_score = ${user_st_score[0][0].st_score + sentiment_score}
            WHERE user_id = '${author}'
            AND guild_id ='${conversation.gid}'`)
    })
}

function sentiment_analysis(msg){
    const sentimentAnalyzer = new natural.SentimentAnalyzer("English", natural.PorterStemmer, "afinn")
    const spellCorrector = new SpellCorrector()
    spellCorrector.loadDictionary()
    const lexed_msg = aposToLexForm(msg)
        .toLowerCase()
        .replace(/[^a-zA-Z\s]+/g, ""); 
    const tokenized = stopWord.removeStopwords(
        new natural.WordTokenizer()
            .tokenize(lexed_msg)
            .map(token => spellCorrector.correct(token)))
    return sentimentAnalyzer.getSentiment(tokenized)
}

module.exports = update_user_sentiment

