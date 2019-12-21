// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var postSchema = new Schema({
    date: Date,
    location: String,
    description: String,
    urls: Array,
    date_display: String,
    day: String,
    created_at: Date,
    updated_at: Date
});


function find_diff(day) {

    let day_we_met = new Date("05/12/2019");
    // 

    // To calculate the time difference of two dates 
    let Difference_In_Time = day.getTime() - day_we_met.getTime();

    // To calculate the no. of days between two dates 
    let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    return parseInt(Difference_In_Days)


}


// on every save, add the date
postSchema.pre('save', function(next) {

    var date = this.date;
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    if (dd < 10) { dd = '0' + dd; }
    if (mm < 10) { mm = '0' + mm; } 
    date = dd + '/' + mm + '/' + yyyy;

    this.date_display = date

    this.day = "#" + find_diff(this.date)
    // get the current date
    var currentDate = new Date();

    // change the updated_at field to current date
    this.updated_at = currentDate;

    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        this.created_at = currentDate;

    next();
});




// the schema is useless so far
// we need to create a model using it
var Post = mongoose.model('Post', postSchema);

// make this available to our users in our Node applications
module.exports = Post;