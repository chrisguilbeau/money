Categories = new Meteor.Collection("categories");
Transactions = new Meteor.Collection("transactions");

Session.setDefault('isAdminMode', false);

// Some helper functions
function getUserId(){
  userId = 'TEMP_FIX';
  // # FIXME
  // var userId = Meteor.user()._id;
  // console.log(userId);
  return userId;
}

function now(){
    return (new Date);
}

function thisMonth(){
    return now().getMonth();
}

function nextMonth(){
    var tm = thisMonth();
    if (tm == 11)
        return 0
    else
        return tm + 1;
}

function thisYear(){
    return now().getFullYear();
}

function monthStart(){
    return (new Date(thisYear(), thisMonth(), 0, 0, 0, 0, 0));
}

function monthEnd(){
    var y = thisYear();
    var nm = nextMonth();
    if (nm == 0)
        y = y + 1;
    return (new Date(y, nm, 0, 0, 0, 0, 0));
}

function secondsInMonth(){
    return monthEnd().getTime() - monthStart().getTime();
}

function secondsInPeriod(periods){
    return secondsInMonth() / periods;
}

function secondsElapsed(){
    return now().getTime() - monthStart().getTime();
}

function secondsElapsedInPeriod(periods){
    return secondsElapsed() % secondsInPeriod(periods);
}

function percentPeriodElapsed(periods){
    return Math.round((secondsElapsedInPeriod(periods) / secondsInPeriod(periods)) * 100);
}

function periodsElapsed(periods){
  return Math.floor(secondsElapsed() / secondsInPeriod(periods));
}

function startOfCurrentPeriod(periods){
  return monthStart().getTime() + secondsInPeriod(periods) * periodsElapsed(periods);
}

// Setup templates
Template.main.percentSpent = function(catId) {
  var socp = startOfCurrentPeriod(2);
  var balanceAtStart = 0;
  var depositsSinceStart = 0;
  var withdrawalsSinceStart = 0;
  var params = {userId: getUserId(), catId: catId};
  Transactions.find(params, {timestamp: {$ltw: socp}}).forEach(
    function(txn){
      balanceAtStart += parseFloat(txn.amount);
    }
    );
  Transactions.find(params, {timestamp: {$gt: socp}}).forEach(
    function(txn){
      var amount = parseFloat(txn.amount);
      if (amount <=0)
        withdrawalsSinceStart += amount;
      else
        depositsSinceStart += amount;
    }
    );
  var totalPositive = balanceAtStart + depositsSinceStart;
  if (totalPositive == 0)
    return 0
  else
    return Math.round((Math.abs(withdrawalsSinceStart) / totalPositive) * 100);
}

Template.main.percentPeriodElapsed = function() {
  return percentPeriodElapsed(2);
}

Template.main.daysLeftInPeriod = function() {
  var msInADay = 24 * 60 * 60 * 1000;
  return Math.round((secondsInPeriod(2) - secondsElapsedInPeriod(2)) / msInADay);
}

Template.main.authenticated = function () {
  return true;
  if (Meteor.user()) return true;
  else return false;
};

Template.main.isAdminMode = function() {
  return Session.get('isAdminMode');
}

Template.main.categories = function () {
  return Categories.find({userId: getUserId()}, {sort: {name: 1}});
};

Template.main.getCategory = function(catId){
  var cat = Categories.findOne({_id: catId});
  if (cat)
    return cat.name;
}

Template.main.transactions = function() {
  return Transactions.find({userId: getUserId()}, {sort: {timestamp: -1}});
}

Template.main.catTotal = function(catId){
  var total = 0;
  Transactions.find({userId: getUserId(), catId: catId}, "amount").forEach(
    function(txn){
      total += parseFloat(txn.amount);
    });
  return total;
}

Template.main.formatTime = function(timestamp){
  var d = new Date(timestamp);
  var parts = d.toDateString().split(" ");
  return parts[0];
}

// Handle the events
Template.main.events({
  'change input#toggle_admin': function(e){
    var el = $(e.target);
    Session.set('isAdminMode', el.is(':checked'));
  },
  'click button.delete': function(e){
    var dbid = $(e.target).attr('dbid');
    Categories.remove(dbid);
    Transactions.find({catId: dbid}).forEach(
      function(txn){
        Transactions.remove(txn._id);
      }
      );
  },
  'click button.add': function(e){
    var catId = $(e.target).attr('dbid');
    var el = $("input[dbid=" + catId + "]");
    var amount = el.val();
    if (!$.isNumeric(amount)){
      alert("it's gotta be a number!");
      return;
    }
    el.val("");
    Transactions.insert({
      userId: getUserId(),
      catId: catId,
      amount: amount,
      timestamp: now().getTime()
    });
  },
  'click button.spend': function(e){
    var catId = $(e.target).attr('dbid');
    var el = $("input[dbid=" + catId + "]");
    var amount = el.val();
    if (!$.isNumeric(amount)){
      alert("it's gotta be a number!");
      return;
    }
    el.val("");
    Transactions.insert({
      userId: getUserId(),
      catId: catId,
      amount: amount * -1,
      timestamp: now().getTime()
    });
  },
  'click button#add_new_category': function () {
    var el = $("#new_category");
    var name = el.val();
    if (!name){
      alert("you didn't type anything");
      return;
    }
    el.val("");
    Categories.insert({
      userId: getUserId(),
      name: name
    });
  },
});