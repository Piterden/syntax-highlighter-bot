var hl = require("highlight.js");
var webshot = require('webshot');
var path = require('path');
var fs = require('fs');
var http = require("http");
var md5 = require('md5');
var rimraf = require('rimraf');
var sizeOf = require('image-size');
var TelegramBot = require('node-telegram-bot-api');
var token = 'YOUR_BOT_TOKEN';
var SERVER = 'DOMAIN_OR_IP'; // Server domain or IP
var SERVER_URL = 'http://' + SERVER + '/SyntaxHighlightBot/images/';

http.createServer(function (request, response) {
  console.log(JSON.stringify(request.headers));
  if (request.method == 'POST') {
    var body = '';
    request.on('data', function (data) {
      body += data;
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6) {
        // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
        request.connection.destroy();
      }
    });
    request.on('end', function () {

      if (request.headers.recent == undefined) {
        request.headers.recent = "";
      }

      if (body == "" && request.headers.inline != undefined) {
        console.log("INLINE VACIO");
        var bot = new TelegramBot(token);
        var results = [];
        var recents = request.headers.recent;
        recents = recents.split(",");

        for (var i = 0; i < recents.length; i++) {
          var recent = recents[i];
          var recent_path = path.join(__dirname, 'images/' + recent);
          if (fs.existsSync(recent_path)) {
            var dimensions = sizeOf(recent_path);
            var InlineQueryResultPhoto = {
              'type': 'photo',
              'photo_url': SERVER_URL + recent,
              'thumb_url': SERVER_URL + recent,
              'photo_width': dimensions.width,
              'photo_height': dimensions.height,
              'id': recent + '' + i
            };
            results.push(InlineQueryResultPhoto);
          }
        }
        bot.answerInlineQuery(request.headers.inline, results, { 'is_personal': true, 'cache_time': 0 });

      }

      var file_name = md5(body);
      var file_name_theme = file_name + '_' + request.headers.theme + '.jpg';
      var file_path = path.join(__dirname, 'images/' + file_name + '_' + request.headers.theme + '.jpg');
      var file_url = SERVER_URL + file_name + '_' + request.headers.theme + '.jpg'; //http://projectcao.org/HightlightNode/images/046621d55f0a11f7f0213aa639b62058_paraiso-dark.jpg
      var htmlhighlight;


      if (request.headers.lang != undefined) {
        htmlhighlight = hl.highlight(request.headers.lang, body)
      } else {
        htmlhighlight = hl.highlightAuto(body)
      }

      if (request.headers.inline == undefined) {
        var sendPhotoOptions;
        if (request.headers.demo == 1) {
          sendPhotoOptions = {
            reply_to_message_id: request.headers.messageid,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Apply theme',
                    callback_data: request.headers.theme
                  }
                ]
              ]
            }
          };
        } else {
          sendPhotoOptions = {
            reply_to_message_id: request.headers.messageid,
          };
        }
      }




      if (fs.existsSync(file_path)) {
        var bot = new TelegramBot(token);

        if (request.headers.inline == undefined) {
          bot.sendChatAction(request.headers.chatid, 'upload_photo');
          bot.sendPhoto(request.headers.chatid, file_path, sendPhotoOptions);
        } else {


          var results = [];
          var recents = request.headers.recent;
          recents = recents.split(",");

          var dimensions = sizeOf(file_path);
          var InlineQueryResultPhoto = {
            'type': 'photo',
            'photo_url': file_url,
            'thumb_url': file_url,
            'photo_width': dimensions.width,
            'photo_height': dimensions.height,
            'id': file_name
          };
          results.push(InlineQueryResultPhoto);


          for (var i = 0; i < recents.length; i++) {
            var recent = recents[i];
            var recent_path = path.join(__dirname, 'images/' + recent);
            if (fs.existsSync(recent_path)) {
              var dimensions = sizeOf(recent_path);
              var InlineQueryResultPhoto = {
                'type': 'photo',
                'photo_url': SERVER_URL + recent,
                'thumb_url': SERVER_URL + recent,
                'photo_width': dimensions.width,
                'photo_height': dimensions.height,
                'id': recent + '' + i
              };
              results.push(InlineQueryResultPhoto);
            }

          }


          bot.answerInlineQuery(request.headers.inline, results, { 'is_personal': true, 'cache_time': 0 });

        }

        response.writeHead(200, { "Content-Type": "text/plain" });
        response.write(file_name_theme);
        console.log(file_name_theme);
        response.end();
        return;
      }


      if (htmlhighlight.relevance > 7 || request.headers.lang != "") {
        fs.readFile(path.join(__dirname, 'node_modules/highlight.js/styles/' + request.headers.theme + '.css'), 'utf8', function (err, data) {
          if (err) {
            response.writeHead(404, { "Content-Type": "text/plain" });
            response.write("ERROR al leer estilo\n");
            response.end();
          }

          var html = '<html lang="en"><head><style>::-webkit-scrollbar { display: none; }' + data + ' </style></head><body style="display: inline-block;"><pre style="max-width:1400px"><code class="hljs" id="code" style="white-space: pre-wrap;font-size:12pt;font-family: Inconsolata">' + htmlhighlight.value + '</code></pre></body></html>';
          //var filePath = 'images/'+file_name+'_'+request.headers.theme+'.jpg';
          webshot(html, file_path, { siteType: 'html', captureSelector: '#code', quality: 100, shotSize: { width: 'all', height: 'all' } }, function (err) {

            if (err) {
              response.writeHead(404, { "Content-Type": "text/plain" });
              response.write("ERROR al generar imagen\n");
              response.end();
            } else {
              var bot = new TelegramBot(token);

              if (request.headers.inline == undefined) {
                bot.sendChatAction(request.headers.chatid, 'upload_photo');
                bot.sendPhoto(request.headers.chatid, file_path, sendPhotoOptions);
              } else {
                var recents = request.headers.recent;
                recents = (recents == '') ? [] : recents.split(",");

                var dimensions = sizeOf(file_path);
                var results = [];
                var InlineQueryResultPhoto = {
                  'type': 'photo',
                  'photo_url': file_url,
                  'thumb_url': file_url,
                  'photo_width': dimensions.width,
                  'photo_height': dimensions.height,
                  'id': file_name
                };
                results.push(InlineQueryResultPhoto);

                for (var i = 0; i < recents.length; i++) {
                  var recent = recents[i];
                  var recent_path = path.join(__dirname, 'images/' + recent);
                  if (fs.existsSync(recent_path)) {
                    var dimensions = sizeOf(recent_path);
                    var InlineQueryResultPhoto = {
                      'type': 'photo',
                      'photo_url': SERVER_URL + recent,
                      'thumb_url': SERVER_URL + recent,
                      'photo_width': dimensions.width,
                      'photo_height': dimensions.height,
                      'id': recent + '' + i
                    };
                    results.push(InlineQueryResultPhoto);
                  }
                }

                bot.answerInlineQuery(request.headers.inline, results, { 'is_personal': true, 'cache_time': 0 });
              }

              response.writeHead(200, { "Content-Type": "text/plain" });
              response.write(file_name_theme);
              console.log(file_name_theme);
              response.end();
            }


            return;

          });




        });
      } else {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.write("ERROR Sin relevancia\n");
        response.end();

        var uploadsDir = __dirname + '/images';

        fs.readdir(uploadsDir, function (err, files) {
          files.forEach(function (file, index) {
            fs.stat(path.join(uploadsDir, file), function (err, stat) {
              var endTime, now;
              if (err) {
                return console.error(err);
              }
              now = new Date().getTime();
              endTime = new Date(stat.ctime).getTime() + 3600000;
              if (now > endTime) {
                return rimraf(path.join(uploadsDir, file), function (err) {
                  if (err) {
                    return console.error(err);
                  }
                  console.log('successfully deleted');
                });
              }
            });
          });
        });

      }

    });
  } else {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.write("ERROR Petición no válida\n");
    response.end();
  }





}).listen(parseInt(8888, 10));

console.log("HightlightNode server running at\n  => http://localhost:8888/\nCtrl + C to shutdown");