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

  //console.log("TYDOM 350 CALLED: "+data);

  if (data.command == "LIGHT") {
    setLight(data,callback,config);
  } else if (data.command == "HEAT") {
    setHeat(data,callback,config);  
  }  else if (data.command == "TEMP") {
    getTemp(data,callback,config);  
  }  else if (data.command == "ELEC") {
    getElec(data,callback,config);  
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
    //console.log(temp);
    var res = temp.split(" ");
    indoortemp=res[0];
    if (data.format=="json") {
      var outjson='{"indoortemp" : "'+indoortemp+'"}';
      callback({'tts' : outjson,'indoortemp': indoortemp });
    } else {
      callback({'tts' : 'La température intérieure est de '+indoortemp+' °C.','indoortemp': indoortemp });
    }
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


var changeX2DPage = function(data,callback,config) {
  sendURL(config.tydom_url +"cgi-bin/Cmd_X2D.cgi?PAGE_X2D=1", null, function(body){ 
    getElec(data,callback,config);
  }); 
}

var getElec = function(data,callback,config) {
 sendURL(config.tydom_url +"P/X2D.shtml", null, function(body){  
    var $ = require('cheerio').load(body, { xmlMode: true, ignoreWhitespace: false, lowerCaseTags: false });
    var checkpage =$('#liste').children().slice(6,7).children().slice(0,1).text();
    if (checkpage=="Base") {
      console.log("Check:"+checkpage);
      var elec =$('#liste').children().slice(7,8).children();
      var total=elec.slice(1,2).text();
      var heat=elec.slice(2,3).text();
      var hotwater=elec.slice(3,4).text();
      var other=elec.slice(4,5).text();
      callback({'tts': 'Consommation électrique : Total : ' +total +'kwh, Chauffage : '+heat+'kwh, Eau Chaude : '+hotwater+'kwh , Autre: '+other+'kwh', 
       'total': total,'heat':heat, 'hotwater':hotwater, 'other':other  });
      return heatmode;
    } else {
      //Turn X2D page until getting teh one with consumption info
      changeX2DPage(data,callback,config);
    }
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
  //console.log("Tydom350 CRON executed.");
  config = SARAH.ConfigManager.getConfig().modules.Tydom350;
  var d=new Object();
  d.format="cron";
  getTemp(d,function(body){  },config);
}