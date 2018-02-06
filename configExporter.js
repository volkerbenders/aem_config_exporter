var http = require('http')
var fs = require('fs')
var emp = []
const datetime_delimiter = '_'
const newline = '\n'

var options = {
  host: '127.0.0.1',
  port: '4502',
  path: '/system/console/status-Configurations.json',
  method: 'GET',
  auth: 'admin:admin'
};

var sanitize = function(input){
  if (input){
  var output = input.trim()
  if (output.startsWith('"')){
    output = output.substring(1)
  }
  if (output.endsWith('",')){
    output = output.substring(0, output.indexOf('",'))
  }
  }else{
    output = ''
  }
  return output
}

//
// inspired by
// https://stackoverflow.com/questions/10645994/node-js-how-to-format-a-date-string-in-utc
//
var buildFileName = function(){
  var now = new Date()
  var date = now.getFullYear()
  date += datetime_delimiter
  date += now.getMonth()+1
  date += datetime_delimiter
  date += now.getDate()
  date += datetime_delimiter
  date += now.getHours()
  date += datetime_delimiter
  date += now.getMinutes()
  date += '_aem_osgi_configurations.csv'

  return date
}

var export_to_file = function(data){
  data = data.split("\n")
  for (entry in data){
    //console.log('entry: ' + data[entry]);
  }
  var pid = ''

  var filename = buildFileName()
  var headline = 'pid, key, value' + newline
  fs.writeFileSync(filename, headline, 'ascii', (err) => {
    console.log('problem writing to file1: ' + err)
  })

  for (pairIndex in data){
    var temp = data[pairIndex];
    var kv = temp.split('=')
    var value = sanitize(kv[1])
    var key = sanitize(kv[0])
    if (key.startsWith('PID')){
      pid = value.substring(value)
    }
    var line = pid + ','+key + ','+ value + newline
    fs.appendFileSync(filename, line, 'ascii', (err) => {
      console.log('problem writing line >'+line+'< to file2: ' + err)
    })

  }

}
function read_and_export() {
    http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
          export_to_file(data)
        });
        res.on('error', function(error){
	  console.log('an error occured: ' + error)
 	})
    }).end();
};

const handleArgs = function(){
  const args = process.argv.slice(2)
  for (i in args){
    const arg = args[i]
    if (arg === '--host'){
      i++
      options.host = args[i]
    }
  }
  console.log('Effiective Parameters: : ' + JSON.stringify(options, null, 4))
}
handleArgs()
read_and_export()
// EOF
