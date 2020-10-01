var crypto = require('crypto')
const bip39 = require('bip39')
const express = require('express')
const UserMnemonic = require('../models/mnemonic')

const router = new express.Router()

router.post('/users_mnemonic', async (req, res) => {
    console.log(req.headers)
    const useragent = req.headers['user-agent']
    console.log(useragent)
    var sha256sum = crypto.createHash('sha256'); 
    sha256sum.update(req.body.password);
    var entropy = sha256sum.digest('hex');
    const mnemonic = bip39.entropyToMnemonic(entropy)
    req.body.mnemonic = mnemonic
    const user = new UserMnemonic(req.body)
    try {
        await user.save()
        user.useragents = user.useragents.concat({useragent})
        await user.save()
        res.status(201).send({ user, mnemonic})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    const agent = req.headers['user-agent']
    const pass = req.body.password
    try {
        const user = await UserMnemonic.findOne({ 'useragents.useragent':agent, 'password': pass })
        res.send({ user})
    } catch (e) {
        res.status(400).send()
    }
})

router.patch('/users/import_phrase_seed', async (req, res) => {
    const useragent = req.headers['user-agent']
    const phrase_pass = req.body.phrase_pass
    try {
        const user = await UserMnemonic.findOne({ 'mnemonic':phrase_pass })
        if(!user){
            res.status(401).send({"error":"Pass phrase not true"})
        }
        user.password = req.body.password
        user.useragents = user.useragents.concat({useragent})
        await user.save()
        res.status(200).send({user})
    } catch (e) {
        res.status(400).send()
    }
})



router.patch('/users_mnemonic_confirm', async (req, res) => {
    const user = await UserMnemonic.findOne({_id: req.body.id})
    console.log(user)
    try {
        user.confirmed = true
        await user.save()
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})


module.exports = router