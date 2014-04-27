exports.action = function(data, callback, config, SARAH) {
  config = config.modules.Tydom350;
  if (!config.tydom_url){
    callback({'tts' : 'Paramètre tydom_url invalide'});
    return;
  }

  if (data.command == "LIGHT") {
    if (data.item>=0) {
      var tydomvalue="102";
      if (data.value=="on") { tydomvalue="101";}
      sendURL(config.tydom_url+"cgi-bin/Cmd_X2D.cgi?LIGHT="+data.item+"&V="+tydomvalue, callback, function(body){
        callback({'tts' : 'Ordre lumière envoyé.'}); 
      });
   } else {
    callback({'tts' : 'Paramètre manquant pour l\'ordre.'}); 
   }
  } else if (data.command == "HEAT") {
    if (data.area>=1) 
    {
      data.area=data.area-1;
      var tydomvalue=0;
      if (data.value=="on") { tydomvalue=3;}
      sendURL(config.tydom_url+"cgi-bin/Cmd_X2D.cgi?ZONE="+data.area+"&ALL="+tydomvalue, callback, function(body){
        callback({'tts' : 'Ordre chauffage envoyé.'}); 
      });
    } else {
      callback({'tts' : 'Paramètre manquant pour l\'ordre.'}); 
    }
   } else {
    callback({'tts' : 'Ordre absent ou inconnu.'}); 
  }



}



var sendURL = function(url, callback, cb){

  var request = require('request');
  request({ 'uri' : url,method: "GET" }, function (err, response, body){
    
    if (err || response.statusCode != 200) {
      console.log("Called URL :" +url);
      console.log("Status :" +response.statusCode);
      console.log("Error :" +err);
      callback({'tts': "L'action a échoué"});
      return;
    }

    cb(body);
  });

} 