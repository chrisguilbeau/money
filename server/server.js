Meteor.startup(function () {
    // code to run on server at startup
});

var deving = false;
deving = true;

function uid(){
    if (deving) return "TEMP_FIX";
    var user = Meteor.user();
    if (user)
        return user._id;
    }

Meteor.publish(
    "categories", function(){return Categories.find({userId: uid()});});
Meteor.publish(
    "transactions", function(){return Transactions.find({userId: uid()});});

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
