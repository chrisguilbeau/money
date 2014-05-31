Meteor.startup(function () {
    // code to run on server at startup
});

function uid(){
    var user = Meteor.user();
    if (user)
        return user._id;
    }

Meteor.publish(
    "categories", function(){return Categories.find({userId: this.userId});});
Meteor.publish(
    "transactions", function(){return Transactions.find({userId: this.userId});});

Meteor.methods({
    createCategory: function(name){
        console.log(name);
        console.log('i got called');
        Categories.insert({
            userId: uid(),
            name: name
            });
        return 0;
        },
    createTransaction: function(catId, amount, catName){
        console.log('trans');
        var timestamp = Date.now();
        var d = new Date(timestamp);
        var parts = d.toDateString().split(' ');
        var date = [parts[0], parts[1], parts[2]].join(' ');
        Transactions.insert({
            userId: uid(),
            catId: catId,
            catName: catName,
            amount: amount,
            timestamp: timestamp
            });
        },
    deleteCategory: function(catId){
        Categories.remove({userId: uid(), _id: catId});
        Transactions.remove({userId: uid(), catId: catId})
        },
    deleteTransaction: function(dbid){
        Transactions.remove({userId: uid(), _id: dbid})
        }
    });
