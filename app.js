"use strict";

const SunSet = require('./sunset');

const api = new SunSet({ lat: 52, lon: 5.1, requestCacheTimeout: 60000 });


function init() {
	
	Homey.log("Sunrise start");
	setLocation();
	
	api.init();
	
	       Homey.manager('flow').on('trigger.sr_sunset', function( callback, args,state) {
           Homey.log(callback);
           Homey.log(args); 
           Homey.log(state); 
           callback( null, true ); // If true, this flow should run. The callback is (err, result)-style.
        });
        
        Homey.manager('flow').on('trigger.sr_sunset.added', function( callback, newArgs ) {
            console.log('added');
            console.log( newArgs );

            callback( null, true ); // always fire this callback, it's reserved for future argument validation

        });

        // when a trigger is removed, or a flow is deleted
        Homey.manager('flow').on('trigger.sr_sunset.removed', function( callback, oldArgs ) {
            console.log('removed');
            console.log( oldArgs );

            callback( null, true ); // always fire this callback, it's reserved for future argument validation

        });


	/* switch them on one by one. Need to find out how enums are working in javascript node.js */
	api.startChecking(0);
	api.startChecking(1);
	api.startChecking(2);
	api.startChecking(3);
	api.startChecking(4);
	api.startChecking(5);
	api.startChecking(6);
	api.startChecking(7);
	api.startChecking(8);
	api.startChecking(9);
	api.startChecking(10);
	api.startChecking(11);
	api.startChecking(12);
	api.startChecking(13);
}

/* Get the current location of homey and put this into the Sunset object. Based on this the calculations are made */
function setLocation(callback) {
//   Homey.log('Call GeoLocation');

	Homey.manager('geolocation').getLocation((err, location) => {
		if (!err) {
			//Homey.log(location);
			api.setLatLon(location.latitude, location.longitude);
		}
		if (callback) {
			callback(err || (!location || location.latitude === false || location.longitude === false), location);
		}
	});
}

module.exports.init = init;