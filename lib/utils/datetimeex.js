var moment = require( 'moment' );

var localDate = new Date();
var localMoment = moment();
var utcMoment = moment.utc();
var utcDate = new Date( utcMoment.format() );

//These are all the same
console.log( 'localData unix = ' + localDate.valueOf() );
console.log( 'localMoment unix = ' + localMoment.valueOf() );
console.log( 'utcMoment unix = ' + utcMoment.valueOf() );

//These formats are different
console.log( 'localDate = ' + localDate );
console.log( 'localMoment string = ' + localMoment.format() );
console.log( 'utcMoment string = ' + utcMoment.format() );
console.log( 'utcDate  = ' + utcDate );

//One to show conversion
console.log( 'localDate as UTC format = ' + moment.utc( localDate ).format() );
console.log( 'localDate as UTC unix = ' + moment.utc( localDate ).valueOf() );