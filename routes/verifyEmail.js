const [router, path] = [require('express').Router(), require('path')]

const {verifyEmail} = require(path.join(__dirname, '..', 'middlewares', 'emailVerify'));


router.route('/:token').get(verifyEmail)

module.exports = router