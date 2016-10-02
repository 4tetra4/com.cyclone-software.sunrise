const SunCalc = require('suncalc');

var sunsetSchedules = {
            0 : {name:'sr_solarNoon', timer : null, offset:0},
            1 : {name:'sr_nadir', timer : null, offset:0},
            2 : {name:'sr_sunrise', timer : null, offset:0},
            3 : {name:'sr_sunset', timer : null, offset:0},
            4 : {name:'sr_sunrise_end', timer : null, offset:0},
            5 : {name:'sr_sunsetStart', timer : null, offset:0},
            6 : {name:'sr_dawn', timer : null, offset:0},
            7 : {name:'sr_dusk', timer : null, offset:0},
            8 : {name:'sr_nauticalDawn', timer : null, offset:0},
            9 : {name:'sr_nauticalDusk', timer : null, offset:0},
            10 : {name:'sr_nightEnd', timer : null, offset:0},
            11 : {name:'sr_night', timer : null, offset:0},
            12 : {name:'sr_goldenHourEnd', timer : null, offset:0},
            13 : {name:'sr_goldenHour', timer : null, offset:0}
};


/**
 * The SunSet object
 * Know issue cannot get a trigger when the card is change (my homey bug??)
 * Need to use enums 
 */
const SunSet = module.exports = function SunSet(config) {
	if (!(this instanceof SunSet)) {
		return new SunSet(config);
	}

	if (!config || !config.lat || !config.lon) {
		return new Error('Sunset should be initiated with lat and lon config');
	}

	this.lat = config.lat;
	this.lon = config.lon;
};

(function () {
    
    var selfie=this;
    
    this.init = function(){
        Homey.log('Initialize'); 
        var items = Object.keys(sunsetSchedules);
        items.forEach(function(item) {

            Homey.manager('flow').on('trigger.'+ sunsetSchedules[item].name, function (callback, args) {
                Homey.log('----Flow: ' + sunsetSchedules[item].name + ' --');
                callback(null, true); // true to make the flow continue, or false to abort
            });            
            selfie.startChecking(parseInt(item));
        });
    };
    
    
    /**
	 * Change the lat/lon the api uses.
	 * @param lat the latitude
	 * @param lon the longitude
	 */
	this.setLatLon = function (lat, lon) {
		if (isNaN(lat) || isNaN(lon)) {
			throw new Error('new location is incorrect!');
		}
		selfie.lat = lat;
		selfie.lon = lon;
	};
    
    /* get the current date */
    this.getNow = function() {
        return new Date();
    }
    
    /* get all the events based on the reference date  and return the one asked for */
    this.getEventTime = function(refDate, id, offset) {
     // console.log('(getEventTime) refdate:'+refDate+ ' offset:'+offset);
      this.eventTimes = SunCalc.getTimes(
        new Date(refDate.getFullYear(), refDate.getMonth(),refDate.getDate(), 12, 0, 0, 0, 0),
        this.lat,
        this.lon);
        //console.log(this.eventTimes);
        return new Date(this.getEvent(id).getTime()+offset);
    };
    
    /* get a specific event and return the date */
    this.getEvent = function(id) {
       var et = this.eventTimes;
      // console.log(et);
       var i=0;
       var d = new Date(0);
       for (var e in et) {
            if (i===id) {
               d=et[e];
//               Homey.log('eventname:'+ e);
//               Homey.log('eventdate:'+d);
               break;
            }
            i++;
        }
        return d;        
    }
    
    /* get the time until an event */
    this.getTimeTillEvent = function(id,offset) {
        var now = this.getNow();
        var refDate = new Date(now);
        if (offset!=0) {
             refDate = new Date(refDate.getTime()+offset);                      
        }
        return this.getNextEventDate(now,refDate,id,offset);
    }
    
    /* get the time until the next event */
    this.getNextEventDate = function(now,refDate,eventId,offset) {
        var timediff = this.getEventTime(refDate,eventId,offset).getTime() - now.getTime();
        while (timediff <= 10000) {
            if (!isValidDate(refDate)) {
               throw new Error('invalid reference date!');
            };
            refDate.setDate(now.getDate()+1);
            timediff = this.getEventTime(refDate,eventId,offset).getTime() - now.getTime();
            //console.log('(getNextEvenDate) new time diff:'+timediff);
        } 
        //console.log('(getNextEvenDate)time diff:' + timediff);
        return timediff;
    }
    
   
       /* put the thing in motion :) */
   this.setupEvent = function (id,result) {
       // check if result has property offset
       // and if valid otherwise offset = 0
        const factor = 60 * 1000;
        var offset = 0
        if (result[0]) {
                if(result[0].hasOwnProperty("offset")){
                    offset = -(result[0].offset * factor);
                    if (!isNumeric(offset))
                            offset=0;        
                }                           
        }
        var timeTillEvent = this.getTimeTillEvent(id,offset);
        //Homey.log('(startchecking) timetillevent:'+timeTillEvent);
        var d = this.getEvent(id)
        var timeS = d.toString()
        var fn = this.fireEvent.bind(this,id,timeS);
        console.log('Event:'+padding_right(sunsetSchedules[id].name,' ',17) + 
                    'Date:'+padding_right(getShortDate(d),' ',20) + 
                    'Offset(sec):' + 
                    padding_right(''+(offset/1000),' ',6) + 
                    'time(sec):' + 
                    padding_right(''+(timeTillEvent/1000),' ',12) + 
                    'Fire:' + 
                    getShortDate(new Date(this.getNow().getTime()+timeTillEvent)));
        sunsetSchedules[id].offset=offset;
        sunsetSchedules[id].timer=setTimeout(fn,timeTillEvent);        
   }

   /* put the thing in motion :) */
   this.startChecking = function (id) {  
        switch(id) {
          case 0 :  Homey.manager('flow').getTriggerArgs( 'sr_solarNoon', function( err, result){
                            selfie.setupEvent(id,result);
                    });   
                    break;
          case 1 :  Homey.manager('flow').getTriggerArgs( 'sr_nadir', function( err, result){
                            selfie.setupEvent(id,result);
                    });   
                    break;
          case 2 :  Homey.manager('flow').getTriggerArgs( 'sr_sunrise', function( err, result){
                            selfie.setupEvent(id,result);
                    });   
                    break;
          case 3 :  Homey.manager('flow').getTriggerArgs( 'sr_sunset', function( err, result){
                            selfie.setupEvent(id,result);
                    });   
                    break;
          case 4 :  Homey.manager('flow').getTriggerArgs( 'sr_sunrise_end', function( err, result){
                            selfie.setupEvent(id,result);
                    });   
                    break;
          case 5 :  Homey.manager('flow').getTriggerArgs( 'sr_sunsetStart', function( err, result){
                            selfie.setupEvent(id,result);
                    });   
                    break;
          case 6 :  Homey.manager('flow').getTriggerArgs( 'sr_dawn', function( err, result){
                            selfie.setupEvent(id,result);
                    });   
                    break;
          case 7 :  Homey.manager('flow').getTriggerArgs( 'sr_dusk', function( err, result){
                            selfie.setupEvent(id,result);
                    });   
                    break;
          case 8 :  Homey.manager('flow').getTriggerArgs( 'sr_nauticalDawn', function( err, result){
                            selfie.setupEvent(id,result);
                    });   
                    break;
          case 9 :  Homey.manager('flow').getTriggerArgs( 'sr_nauticalDusk', function( err, result){
                            selfie.setupEvent(id,result);
                    });   
                    break;
          case 10 : Homey.manager('flow').getTriggerArgs( 'sr_nightEnd', function( err, result){
                            selfie.setupEvent(id,result);
                    });   
                    break;
          case 11 : Homey.manager('flow').getTriggerArgs( 'sr_night', function( err, result){
                            selfie.setupEvent(id,result);
                    });   
                    break;
          case 12 : Homey.manager('flow').getTriggerArgs( 'sr_goldenHourEnd', function( err, result){
                            selfie.setupEvent(id,result);
                    });   
                    break;
          case 13 : Homey.manager('flow').getTriggerArgs( 'sr_goldenHour', function( err, result){
                            selfie.setupEvent(id,result);
                    });   
                    break;
        }      

    };
    

    
    
    /* fire an event to homey when a certain timeout expire */
    this.fireEvent = function(id,timeS) {
       // Homey.manager('flow').trigger('sr_solarNoon', {sr_time: timeS});

        Homey.manager('flow').trigger(sunsetSchedules[id].name,  {sr_time: timeS});
        console.log('**** fired ' + sunsetSchedules[id].name + ' (' + timeS + ') Time:'+this.getNow());
        var fn = this.startChecking.bind(this,id);
        setTimeout(fn, 2000);
    }
}).call(SunSet.prototype);

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isValidDate(d) {
        if ( isNaN( d.getTime() ) ) { 
            return false;
        }
        else {
            return true;
        }
}

function getShortDate(d) {
    year = "" + d.getFullYear();
    month = "" + (d.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
    day = "" + d.getDate(); if (day.length == 1) { day = "0" + day; }
    hour = "" + d.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    minute = "" + d.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    second = "" + d.getSeconds(); if (second.length == 1) { second = "0" + second; }
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}

// right padding s with c to a total of n chars
function padding_right(s, c, n) {
  if (! s || ! c || s.length >= n) {
    return s;
  }
  var max = (n - s.length)/c.length;
  for (var i = 0; i < max; i++) {
    s += c;
  }
  return s;
}