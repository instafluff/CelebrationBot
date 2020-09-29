'use strict';

require('dotenv').config();

var fetch = require( "node-fetch" );
var Storage = require('node-storage');
var ComfyJS = require("comfy.js");
var store = new Storage('celebration.db');

ComfyJS.onChat = () => {};
ComfyJS.onCommand = async ( user, command, message, flags ) => {
  // !bday [month] [day] - saves the user's birthday
  // !bday - prints all the birthdays of the month / week
  // !bday [month] [day] [username] - saves the user's birthday
  // !bday [month] - print all the birthdays of the month
  if( command === "bday" ) {
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
  else if( command === "horoscope" ) {
    var userData = store.get( "birthdays" ) || {};
    var username = user.toLowerCase();
    if( message ) {
      // Check it as a username
      username = message.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
    }

    if( userData[ username ] ) {
      var birthday = userData[ username ];
      console.log( birthday );
      let zodiac = await fetch( `http://localhost:1111/zodiac?month=${birthday.month + 1}&date=${birthday.day}` ).then( r => r.json() );
      if( zodiac.sign ) {
        fetch( `http://localhost:1111/horoscope?fast=true&user=${username}&sign=${zodiac.sign}` );
      }
    }
    else {
      // Show username not found
      ComfyJS.Say( `${username} was not found. Type !bday [month] [date] to add your birthday!` );
    }
  }
  else if( command === "horrorscope" ) {
    var userData = store.get( "birthdays" ) || {};
    var username = user.toLowerCase();
    if( message ) {
      // Check it as a username
      username = message.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
    }

    if( userData[ username ] ) {
      var birthday = userData[ username ];
      console.log( birthday );
      let zodiac = await fetch( `http://localhost:1111/zodiac?month=${birthday.month + 1}&date=${birthday.day}` ).then( r => r.json() );
      if( zodiac.sign ) {
        fetch( `http://localhost:1111/horrorscope?fast=true&user=${username}&sign=${zodiac.sign}` );
      }
    }
    else {
      // Show username not found
      ComfyJS.Say( `${username} was not found. Type !bday [month] [date] to add your birthday!` );
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
