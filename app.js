'use strict';

require('dotenv').config();

var Storage = require('node-storage');
var ComfyJS = require("comfy.js");
var store = new Storage('celebration.db');

ComfyJS.onCommand = ( user, command, message, flags ) => {
  // !bday [month] [day] - saves the user's birthday
  // !bday - prints all the birthdays of the month / week
  // !bday [month] [day] [username] - saves the user's birthday
  // !bday [month] - print all the birthdays of the month
  if( command == "bday" ) {
    if( message ) {
      // figure out month/day/username
      try {
        var parts = message.split( " " );
        var month = parts[ 0 ].toLowerCase();
        var day = parts[ 1 ];
        var username = parts[ 2 ] || user;
        var months = [ "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec" ];
        var monthNum = months.indexOf( month.substring( 0, 3 ) );
        var userData = store.get( "birthdays" ) || {};
        if( parts[ 2 ] && !flags.broadcaster && !flags.mod ) {
          return;
        }
        if( month && day && username ) {
          var dayNum = parseInt( day );
          if( monthNum >= 0 ) {
            userData[ username.toLowerCase() ] = {
              name: username,
              month: monthNum,
              day: dayNum
            };
            store.put( "birthdays", userData );
            ComfyJS.Say( "Saved Birthday: " + monthToString(monthNum) + " " + dayNum );
          }
        }
        else {
          if( monthNum >= 0 ) {
            // Print out the birthdays of the month
            var birthdayPeeps = getBirthdays( monthNum );
            ComfyJS.Say( monthToString(monthNum) + " birthdays are: " + birthdayPeeps.map( x => `${x.name} (${monthToString(x.month)} ${x.day})` ).join( ", " ) );
          }
          else {
            // Check it as a username
            if( userData[ month ] ) {
              var birthday = userData[ month ];
              console.log( birthday );
              ComfyJS.Say( birthday.name + "'s birthday is: " + monthToString( birthday.month ) + " " + birthday.day );
            }
          }
        }
      }
      catch( err ) {
        console.error( err );
      }
    }
    else {
      // if( flags.broadcaster || flags.mod ) {
        // Print out the birthdays of the month
        var birthdayPeeps = getBirthdays( new Date().getMonth() );
        ComfyJS.Say( "This month's birthdays are: " + birthdayPeeps.map( x => `${x.name} (${monthToString(x.month)} ${x.day})` ).join( ", " ) );
      // }
    }
  }
}
ComfyJS.Init( process.env.TWITCHUSER, process.env.OAUTH );

function monthToString( monthNum ) {
  var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
  return months[ monthNum ];
}

function getBirthdays( monthNum ) {
  var birthdays = store.get( "birthdays" ) || {};
  var birthdayPeeps = Object.keys( birthdays ).filter( x => birthdays[ x ].month == monthNum );
  var birthdayResults = birthdayPeeps.map( x => birthdays[ x ] );
  birthdayResults.sort( ( a, b ) => a.day - b.day );
  return birthdayResults;
}
