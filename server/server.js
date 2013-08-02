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
    createUserCategory: function(name){
        Categories.insert({
            userId: uid(),
            name: name
            });
        return 0;
        },
    createUserTransaction: function(catId, amount){
        Transactions.insert({
            userId: uid(),
            catId: catId,
            amount: amount,
            timestamp: (new Date).getTime()
            });
        },
    deleteUserCategory: function(catId){
        Categories.remove({userId: uid(), _id: catId});
        Transactions.remove({userId: uid(), catId: catId})
        }
    });
