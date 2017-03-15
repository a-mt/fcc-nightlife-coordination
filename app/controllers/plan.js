'use strict';
var Plan = require('../models/plan');

var PlanHandler = {
  
   // Get the list of people going
    search : function(data, userId, cb) {
      
      // Get ids of places
      var ids = [];
      for(let i=0; i<data.businesses.length; i++) {
        ids.push(data.businesses[i].id);
      }
      
      // Search plans for these places in databse
      var today = (new Date()).setHours(0,0,0,0);
      Plan.find({
        date: today,
        place: { $in: ids }
      }, function(err, docs){

        var going = {};
        if(!err) {
          for(let i=0; i<docs.length; i++) {
              var doc = docs[i];

              going[doc.place] = {
                  total: doc.totalgoing,
                  user : (userId && doc.going.indexOf(userId) > -1)
              };
          }
        }
        for(let i=0; i<data.businesses.length; i++) {
            data.businesses[i].going = going[data.businesses[i].id] || {total:0, user: false};
        }
        cb(data);
      });
    },

    // Update whether the current user is going or not
    go: function(req, res) {
        var id = req.body.id;

        Plan.findOne({
            place: id
        }, function(err, plan){
            if(err) {
                res.status(500).json(err);

            } else if(!req.user) {
                res.json({
                    total: plan.totalgoing,
                    user: false
                });

            } else if(!plan) {
                
                plan = new Plan();
                plan.place      = id;
                plan.date       = (new Date).setHours(0,0,0,0);
                plan.totalgoing = 1;
                plan.going      = [ req.user.id ];
                plan.save(function(err, data){
                    if(err) {
                        res.status(500).json(err);
                        return;
                    }
                    res.json({
                        total: data.totalgoing,
                        user : true
                    });
                });
            } else {
                var user_going = plan.going.indexOf(req.user.id);

                if(user_going > -1) {
                    plan.totalgoing--;
                    plan.going.splice(user_going, 1);
                } else {
                    plan.totalgoing++;
                    plan.going.push(req.user.id);
                }
                plan.save(function(err, data){
                    if(err) {
                        res.status(500).send(err);
                    }

                    res.json({
                       total: data.totalgoing,
                       user : (user_going == -1)
                    });
                });
            }
        });
    }
}

module.exports = PlanHandler;