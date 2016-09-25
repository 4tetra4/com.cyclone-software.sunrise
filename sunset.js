const SunCalc = require('suncalc');


/**
 * The SunSet object
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
    

	/**
	 * Change the lat/lon the api uses.
	 * @param lat the latitude
	 * @param lon the longitude
	 */
	this.setLatLon = function (lat, lon) {
		if (!lon && lat && lat.lat) {
			lon = lat.lon;
			lat = lat.lat;
		}
		if (isNaN(lat) || isNaN(lon)) {
			throw new Error('new location is incorrect!');
		}
		this.lat = lat;
		this.lon = lon;
	};
    
    this.getNow = function() {
        return new Date();
    }
    
    this.getEventTime = function(refDate, id) {
     // Homey.log(refDate);
      this.eventTimes = SunCalc.getTimes(
        new Date(refDate.getFullYear(), refDate.getMonth(),refDate.getDate(), 12, 0, 0, 0, 0),
        this.lat,
        this.lon); 

        return new Date(this.getEvent(id).getTime());
    };
    
    this.getEvent = function(id) {
       var et = this.eventTimes;
       var i=0;
       var d = new Date(0);
       for (var e in et) {
            if (i===id) {
               d=et[e];
               //Homey.log(e);
               //Homey.log(d);
               break;
            }
            i++;
        }
        // d = new Date(new Date().getTime() + 120000); // test
        return d;        
    }
    
    
    this.getTimeTillEvent = function(id) {
        var now = this.getNow();
        var refDate = new Date(now);
        return this.getNextEventDate(now,refDate,id);
    }
    
    this.getNextEventDate = function(now,refDate,eventId) {
        var timediff = this.getEventTime(refDate,eventId).getTime() - now.getTime();
       // console.log('nextevent time diff:' + timediff);
        while (timediff < 0) {
            refDate.setDate(now.getDate()+1);
            timediff = this.getEventTime(refDate,eventId).getTime() - now.getTime();
        } 
        //console.log('time diff:' + timediff);
        return timediff;
    }

   this.startChecking = function (id) {      
         var timeTillEvent = this.getTimeTillEvent(id)
       //  Homey.log(timeTillEvent);
         var timeS = this.getEvent(id).toString()
         var fn = this.fireEvent.bind(this,id,timeS);
         setTimeout(fn,timeTillEvent);
    };
    
    this.fireEvent = function(id,timeS) {
        Homey.log('fired ' + id);
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
