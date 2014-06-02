// subscriptions
Meteor.subscribe("categories");
Meteor.subscribe("transactions",
    function onComplete(){
        // $('.loader, .main').toggle();
        }
    );

Session.setDefault('isAdminMode', false);

isAuthenticated = function(){
    if (Meteor.user()){
        return true;
    }
    else{
        return false;
    }
}

showAdmin = function(){
    return (isAuthenticated() && Session.get('isAdminMode'));
}

Template.admin.isAuthenticated = isAuthenticated;
Template.admin.showAdmin = showAdmin;
Template.transactions.showAdmin = showAdmin;
Template.categories.showAdmin = showAdmin;


// Template.main.isAdminModeMode = function() {
//   return Session.get('isAdminModeMode');
// }

Template.categories.categories = function () {
  return Categories.find({}, {sort: {name: 1}});
}

Template.transactions.transactions = function() {
  return Transactions.find({}, {sort: {timestamp: -1}});
}

Template.transactions.moneyfy = function(i){
    var iAbs = Math.abs(i);
    return '$' + iAbs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function getDate(d){
    var parts = d.toString().split(' ');
    return parts.slice(0, 3).join(' ');
}

Template.transactions.dateify = function(timestamp){
    var d = new Date(timestamp);
    var time = getTime(d);
    var date = getDate(d);
    return [date, time].join(' ')
}

Template.transactions.classify = function(amount){
    if (amount < 0)
        return 'negative';
    else
        return 'positive';
}

Template.transactions.events({
    'click button.delete': function(e){
        var button = $(e.target);
        var txn = button.parents('.transaction');
        Meteor.call('deleteTransaction', txn.attr('dbid'));
        }
    });

function categoryTxn(e, multiplier){
    var button = $(e.target);
    var textbox = button.parents('.flex-row').find('input');
    var amount = textbox.val();
    if (!$.isNumeric(amount)){
        alert('Amount must be a number');
        textbox.val('');
        textbox.focus();
        return
        }
    var dbid = textbox.attr('dbid');
    var catName = textbox.attr('catName');
    Meteor.call('createTransaction', dbid, multiplier * amount, catName);
    textbox.val('');
}

function categorySpend(e){
    categoryTxn(e, -1);
}

function categoryFund(e){
    categoryTxn(e, 1);
}

Template.categories.total = function(catId){
    var total = 0;
    var txns = Transactions.find({catId: catId});
    txns.forEach(
        function(txn){
        total += parseFloat(txn.amount);
        });
    return total;
}

Template.categories.events({
    'submit': function(e){
        $(e.target).next('button.spend').click();
        e.preventDefault();
        },
    'click button.spend': categorySpend,
    'click button.fund': categoryFund,
    'click button.delete': function(e){
        var button = $(e.target);
        var textbox = button.parents('.flex-row').find('input');
        var dbid = textbox.attr('dbid');
        Meteor.call('deleteCategory', dbid);
        }
    })

Template.admin.events({
    'click button#toggle': function(e){
        Session.set('isAdminMode', !Session.get('isAdminMode'));
        },
    'click button#catAdd': function(e){
        var button = $(e.target);
        var textbox = button.prev('input');
        var category = textbox.val();
        Meteor.call('createCategory', category);
        textbox.val('');
        }
    });
