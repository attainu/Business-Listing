const [mongoose, slugify] = [require('mongoose'), require('slugify')]

const servieSchema = new mongoose.Schema({
    name : {
        type : String,
        minlength : [5, `Enter minimum 5 characters`],
        maxlength : [20, `max 20 characters`],
        required : [true, `service fieid can't be empty`],
    },description : {
        type : String,
        required : [true, `Description field can't be empty`],
        minlength : [50, `Enter minimum 50 characters`],
        maxlength : [500, `max 500 characters`],
    },offers : {
        type : Boolean,
        default : false
    },rating : {
        type : [Number],
        min : [1, `rating should be atleast 1`],
        max : [5, `rating can't exceeds 5`],
        default : 0
    },businesslists : {
        type : mongoose.Types.ObjectId,
        ref : 'Businesslist',
        required : true
    }

},{
    timestamps : true
})

module.exports = mongoose.model('Service', servieSchema)