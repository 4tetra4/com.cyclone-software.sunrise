const SunCalc = require('suncalc');


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
        var timeS = this.getEvent(id).toString()
        var fn = this.fireEvent.bind(this,id,timeS);
        setTimeout(fn,timeTillEvent);        
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
        console.log('**** fired ' + id + ' at ' + timeS);
        switch(id) {
          case 0 :  Homey.manager('flow').trigger('sr_solarNoon', {sr_time: timeS});
                    break;
          case 1 :  Homey.manager('flow').trigger('sr_nadir', {sr_time:timeS});
                    break;
          case 2 :  Homey.manager('flow').trigger('sr_sunrise', {sr_time: timeS});
                    break;
          case 3 :  Homey.manager('flow').trigger('sr_sunset', {sr_time: timeS});
                    break;
          case 4 :  Homey.manager('flow').trigger('sr_sunrise_end', {sr_time: timeS});
                    break;
          case 5 :  Homey.manager('flow').trigger('sr_sunsetStart', {sr_time: timeS});
                    break;
          case 6 :  Homey.manager('flow').trigger('sr_dawn', {sr_time: timeS});
                    break;
          case 7 :  Homey.manager('flow').trigger('sr_dusk', {sr_time: timeS});
                    break;
          case 8 :  Homey.manager('flow').trigger('sr_nauticalDawn', {sr_time: timeS});
                    break;
          case 9 :  Homey.manager('flow').trigger('sr_nauticalDusk', {sr_time: timeS});
                    break;
          case 10 :  Homey.manager('flow').trigger('sr_nightEnd', {sr_time: timeS});
                    break;
          case 11 :  Homey.manager('flow').trigger('sr_night', {sr_time: timeS});
                    break;
          case 12 :  Homey.manager('flow').trigger('sr_goldenHourEnd', {sr_time: timeS});
                    break;
          case 13 :  Homey.manager('flow').trigger('sr_goldenHour', {sr_time: timeS});    
                    break;
       }
       this.startChecking(id);
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