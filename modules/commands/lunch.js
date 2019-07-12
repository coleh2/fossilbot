var classPeriods = require("../nhs_resources/classperiods.json");
var schedules = require('../nhs_resources/nhs_sched_store.json');

module.exports = function(evt,args,_cfg,bot) {
    //process arguments
    var searchedBlock = -1;
    var searchedLunch = -1;
    var day = Date.now();
    var usingTodayAsSchedule = undefined;
    args.forEach(function (arg) {
        if(arg.length == 1 && parseInt(arg, 17) >= 10) {
            //assume it's a block letter
            searchedBlock = parseInt(arg, 17) - 10;
            usingTodayAsSchedule = false;
        } else if (parseInt(arg) <= 3 && parseInt(arg) >= 1) {
            //assume it's a lunch number
            searchedLunch = parseInt(arg) - 1;
        } else if (!Number.isNaN(new Date(arg).getDate())) {
            //assume it's a day
            day = (new Date(arg)).getTime();
        }
    });
    //fetch the schedule object for today and use it as the lunch block (if we don't have any specified)
    if(usingTodayAsSchedule === undefined) {
        var todayDate = (new Date(day)).setUTCHours(0,0,0,0);
        var scheduleObject = schedules.find(function(x) { return x.t == todayDate; });
        if(!scheduleObject) {
            return bot.sendMessage({to: evt.d.channel_id, message: "Oops! There was an error with getting today's schedule. Please contact <@297151429087592449>"});
        }
        searchedBlock = ([2,0,5,3,1,6,4])[scheduleObject.o];
        usingTodayAsSchedule = true;
    }
    //verify that we have the required arguments
    if(searchedBlock < 0 || searchedLunch < 0) {
        return bot.sendMessage({to: evt.d.channel_id, message: "Sorry; I don't understand what you mean. Please include both a block letter and a lunch number."});
    }


    //get a list of people who are actually in this lunch
    
    var peopleInThatLunch = classPeriods.filter(function(x) {
        var thisCourse = (x.c2[searchedBlock] || x.c1[searchedBlock] || {}).i;
        var lunchInThisCourse = -1;
        
        //assign the lunchInThisCourse value according to the 2018-2019 2nd semester rules
        if(thisCourse.substring(0,1) == "0" || thisCourse.substring(0,1) == "1" || thisCourse.substring(0,1) == "4") {
            //english, language, or history? second lunch.
            lunchInThisCourse = 1;
        } else if (thisCourse.substring(0,2) == "86" || thisCourse.substring(0,1) == "7" || thisCourse.substring(0,1) == "3") {
            //wellness, art, or science? first lunch.
            lunchInThisCourse = 0;
        } else if (thisCourse.substring(0,1) == "8" || thisCourse.substring(0,1) == "2" || thisCourse.substring(0,2) == "96") {
            //media(idk if i'm calculating that right), math, or skills (again, not sure abt the id) third lunch.
            lunchInThisCourse = 2;
        }
        return lunchInThisCourse == searchedLunch;
    });

    //format & send the data
    var stringToSend = "";

    for(var i = 0; i < peopleInThatLunch.length; i++) {
        stringToSend = stringToSend + (i==0?"":(i==peopleInThatLunch.length-1?", and ":", ")) + peopleInThatLunch[i].name.replace('_', ' ');
    }
    if(!stringToSend) {stringToSend = "Sorry, I don't know of anyone in that lunch."} else {stringToSend = stringToSend + " are in Lunch " + (searchedLunch+1) +  (usingTodayAsSchedule?" today.":" during " + ((['A','B','C','D','E','F','G'])[searchedBlock])+ " block.")}

    bot.sendMessage({
        to: evt.d.channel_id,
        message: stringToSend
    });
}
