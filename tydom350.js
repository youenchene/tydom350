var config_plugin;
var indoortemp="N/A";
var heatmode="N/A";

exports.init = function (SARAH){
  config_plugin=SARAH.ConfigManager.getConfig();
}


exports.action = function(data, callback, config, SARAH) {
  config = config.modules.Tydom350;
  if (!config.tydom_url){
    callback({'tts' : 'Paramètre tydom_url invalide'});
    return;
  }

  if (data.command == "LIGHT") {
    setLight(data,callback,config);
  } else if (data.command == "HEAT") {
    setHeat(data,callback,config);  
  }  else if (data.command == "TEMP") {
    getTemp(data,callback,config);  
  } else {
    callback({'tts' : 'Ordre absent ou inconnu.'}); 
  }
}



var setLight = function(data,callback,config) {
  if (data.item>=0) {
      var tydomvalue="102";
      if (data.value=="on") { tydomvalue="101";}
      sendURL(config.tydom_url+"cgi-bin/Cmd_X2D.cgi?LIGHT="+data.item+"&V="+tydomvalue, callback, function(body){
        callback({'tts' : 'Ordre lumière envoyé.'}); 
        return;
      });
   } else {
    callback({'tts' : 'Paramètre manquant pour l\'ordre.'}); 
    return;
   }
}

var setHeat = function(data,callback,config) {
  if (data.area>=1) 
    {
      data.area=data.area-1;
      var tydomvalue=0;
      if (data.value=="on") { tydomvalue=3;} else if (data.value==="fp") {tydomvalue=5;}
      sendURL(config.tydom_url+"cgi-bin/Cmd_X2D.cgi?ZONE="+data.area+"&ALL="+tydomvalue, callback, function(body){
        callback({'tts' : 'Ordre chauffage envoyé.'});
        return; 
      });
    } else if (data.mode) {
      var mode=-1;
      if (data.mode=="auto") {
        mode=7;
      } else if (data.mode=="away") {
        mode=5;
      } else if (data.mode=="off") {
        mode=4;
      } else {
        callback({'tts' : 'Mode inconnu.'}); 
        return;
      }
      sendURL(config.tydom_url+"cgi-bin/Cmd_X2D.cgi?MODE="+mode, callback, function(body){
        callback({'tts' : 'Mode chauffage réglé.'});
        return; 
      });
    } else if (data.getmode) {
        getHeatMode(data,callback,config);
    }  else {
      callback({'tts' : 'Paramètre manquant pour l\'ordre.'}); 
      return;
    }
}

var getTemp = function(data,callback,config) {
 sendURL(config.tydom_url +"P/index.shtml", null, function(body){  
   var $ = require('cheerio').load(body, { xmlMode: true, ignoreWhitespace: false, lowerCaseTags: false });
    var temp =$('#top').children().children(".texte").text();
    console.log(temp);
    var res = temp.split(" ");
    indoortemp=res[0];
    callback({'tts' : 'La température intérieure est de '+indoortemp+' °C.','indoortemp': indoortemp });
    return indoortemp;
   });

}


var getHeatMode = function(data,callback,config) {
 sendURL(config.tydom_url +"P/therm.shtml", null, function(body){  
   var $ = require('cheerio').load(body, { xmlMode: true, ignoreWhitespace: false, lowerCaseTags: false });
    var hm =$('#top').children().children().children().last().attr('src');
    if (hm.indexOf("auto")>-1) { heatmode="Auto"; }
    callback({'tts' : 'Le mode de chauffage est : '+heatmode+'.','heatmode': heatmode });
    return heatmode;
   });

}

var sendURL = function(url, callback, cb){
  var request = require('request');
  request({ 'uri' : url,method: "GET" }, function (err, response, body){
    
    if (err || response.statusCode != 200) {
      console.log("Called URL :" +url);
      console.log("Status :" +response.statusCode);
      console.log("Error :" +err);
      callback({'tts': "L'action a échouée"});
      return;
    }
    cb(body);
    return;
  });
} 


exports.getIndoorTemp = function(SARAH){ 
 return indoortemp+"°C";
}

exports.getIndoorTempAjax = function(SARAH){ 
   config = config_plugin.modules.Tydom350;
  sendURL(config.tydom_url +"P/index.shtml", null, function(body){
   
   var $ = require('cheerio').load(body, { xmlMode: true, ignoreWhitespace: false, lowerCaseTags: false });
    var temp =$('#top').children().children(".texte").text();
    console.log(temp);
    var res = temp.split(" ");
    indoortemp=res[0];
    return indoortemp;
   });
}

exports.cron = function(callback, task, SARAH){
  console.log("Tydom350 CRON executed.")
  config = config_plugin.modules.Tydom350;
  getTemp(function(body){ },config,function(body){ })
}