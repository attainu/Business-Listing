const [router, mongoose, path, fs] = [require('express').Router(), require('mongoose'), require('path'), require('fs')]

const business = require('../models/BusinessLists')
const bpath = path.join(__dirname, '..', 'data', 'business.json')

router.get('/', async (req, res)=> {
    let list = await business.find()

    res.json({data : list})
    fs.readFile(bpath, {encoding : 'utf-8'}, (err, data)=> {
        let d = JSON.parse[data]
        console.log(d)
        d.push(list.data)
        fs.writeFile(bpath, JSON.stringify(d))
    })
    
})

module.exports = router