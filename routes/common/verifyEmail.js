const [router, path] = [require('express').Router(), require('path')]

const EmailVerifyController = require(path.join(__dirname, '..','..', 'controllers','common', 'emailVerify'));


router.route('/client/:token').get(EmailVerifyController.verifyEmail)

module.exports = router