var http = require('https');
var parseString = require('xml2js').parseString;
if (!process.argv[2]) {
  console.log('You must enter a place!');
  process.exit();
}
var place = process.argv[2];
var weatherFound = false;

console.log('Searching for ' + place + '...');
var request = {
  host: 'dd.weather.gc.ca',
  path: '/citypage_weather/xml/siteList.xml'
}
http.request(request, function(response) {
var xml = '';
response.on('data', function(chunk) {
xml += chunk;
});
response.on('end', function() {
parseString(xml, function(err, result) {
for (var site in result.siteList.site) {
  if (result.siteList.site[site].nameEn[0] == place) {
    weatherFound = true;
    var siteCode = result.siteList.site[site]['$'].code;
    console.log('Fetching weather for site ' + siteCode + '...');
    request.path = '/citypage_weather/xml/' + result.siteList.site[site].provinceCode[0] + '/' + siteCode + '_e.xml';
    http.request(request, function(response) {
    var xml = ''
    response.on('data', function(chunk) {
    xml += chunk;
    });
    response.on('end', function() {
    parseString(xml, function(err, result) {
      var conditions = result.siteData.currentConditions[0];
      if (!conditions.condition[0]) {
        conditions.condition[0] = 'Unavailable';
      }
      console.log('⛅ Condition: ' + conditions.condition[0]);
      console.log('🌡️ Temperature: ' + conditions.temperature[0]._ + '°C');
      console.log('💧 Dew Point: ' + conditions.dewpoint[0]._ + '°C');
      console.log('⌚ Pressure: ' + conditions.pressure[0]._ + 'kPa');
      if (!conditions.visibility[0]._) {
        conditions.visibility[0]._ = '-';
      }
      console.log('🌳 Visibility: ' + conditions.visibility[0]._ + 'km');
      console.log('💦 Relative Humidity: ' + conditions.relativeHumidity[0]._ + '%');
      if (!conditions.wind[0].gust[0]._) {
        conditions.wind[0].gust[0]._ = '-';
      }
      console.log('💨 Wind: ' + conditions.wind[0].speed[0]._ + 'km/h gusting ' + conditions.wind[0].gust[0]._ + 'km/h from ' + conditions.wind[0].direction[0]._ + ' (' + conditions.wind[0].bearing[0]._ + '°)');
    });
    });
    }).end();
  }
}
if (!weatherFound) {
console.log('No weather for ' + place + '.');
}
});
});
}).end();
