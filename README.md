# Sunrise

Sunrise is an app the has several triggers to certain positions of the sun. It make use of suncalc from 'Vladimir Agafonkin'. The following triggers are possible:

- sunrise (top edge of the sun appears on the horizon)
- sunrise ends (bottom edge of the sun touches the horizon)
- morning golden hour (soft light, best time for photography) ends
- solar noon (sun is in the highest position)
- goldenHour (evening golden hour starts)
- sunset starts (bottom edge of the sun touches the horizon)
- sunset (sun disappears below the horizon, evening civil twilight starts)
- dusk (evening nautical twilight starts)
- nautical dusk (evening astronomical twilight starts)
- night starts (dark enough for astronomical observations)
- nadir (darkest moment of the night, sun is in the lowest position)
- night ends (morning astronomical twilight starts)
- nautical dawn (morning nautical twilight starts)
- dawn (morning nautical twilight ends, morning civil twilight starts)

## Change Log:
### v 0.0.3
Added trigger options XX minutes before/after sunset/sunrise etc
Know issue, when you change the offset, the old offset will be affective after the first trigger... Then the new one will be applied.
-10 is 10 minutes earlier, +10 is 10 minutes later then the sunset trigger (f.e.)
default = 0 range -60..60

### v 0.0.2
Fix for possible duplicate triggers.


### v 0.0.1
First release and first app :)




