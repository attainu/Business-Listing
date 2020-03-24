const [router, path] = [require('express').Router(), require('path')]
const emailVerifyController = require(path.join(__dirname, '..','..', 'controllers','user', 'clientVerifyEmail'));

router.route('/:token').get(emailVerifyController.verifyEmail)

module.exports = router