<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

define('BOT_USER', '@SyntaxHighlightBot');
define('BOT_TOKEN', 'YOUR_BOT_TOKEN');
define('BOT_ID', 346649960);
define('MAX_CHARS', 4000);
define('MAX_LINES', 1500);
define('MIN_INLINE', 10);
define('IMAGE_API_URL', 'http://IP:PORT'); // Node APP
define('DEFAULT_THEME', 'vs2015');

$loader = require __DIR__ . '/vendor/autoload.php';

use Telegram\Bot\Api;

require_once 'db.class.php';
DB::$user     = '';
DB::$password = '';
DB::$dbName   = '';
DB::$host     = '';
DB::$port     = '3306';
DB::$encoding = 'utf8';

$telegram = new Api(BOT_TOKEN);
$updates  = $telegram->getWebhookUpdates();

$request = json_decode($updates);

/* STRINGS */
$isDemo        = 0;
$welcome_group = "Hello! If you send pieces of programming code with `fixed-width code` format in this group, I'll send a picture with syntax highlighting for easy reading. You can also send me in private any code without the need of the `fixed-width code` format, try it: " . BOT_USER . ".\n\n_If I am not working, try it privately, I don't like sending error messages in groups._";

//https://highlightjs.org/static/demo/styles/.css
$themes = [
    'agate',
    'androidstudio',
    'arduino-light',
    'arta',
    'ascetic',
    'atelier-cave-dark',
    'atelier-cave-light',
    'atelier-dune-dark',
    'atelier-dune-light',
    'atelier-estuary-dark',
    'atelier-estuary-light',
    'atelier-forest-dark',
    'atelier-forest-light',
    'atelier-heath-dark',
    'atelier-heath-light',
    'atelier-lakeside-dark',
    'atelier-lakeside-light',
    'atelier-plateau-dark',
    'atelier-plateau-light',
    'atelier-savanna-dark',
    'atelier-savanna-light',
    'atelier-seaside-dark',
    'atelier-seaside-light',
    'atelier-sulphurpool-dark',
    'atelier-sulphurpool-light',
    'atom-one-dark',
    'atom-one-light',
    'brown-paper',
    'codepen-embed',
    'color-brewer',
    'darcula',
    'dark',
    'docco',
    'dracula',
    'far',
    'foundation',
    'github',
    'github-gist',
    'googlecode',
    'grayscale',
    'gruvbox-dark',
    'gruvbox-light',
    'hopscotch',
    'hybrid',
    'idea',
    'ir-black',
    'kimbie.dark',
    'kimbie.light',
    'magula',
    'mono-blue',
    'monokai',
    'monokai-sublime',
    'obsidian',
    'ocean',
    'paraiso-dark',
    'paraiso-light',
    'pojoaque',
    'purebasic',
    'qtcreator_dark',
    'qtcreator_light',
    'railscasts',
    'rainbow',
    'school-book',
    'solarized-dark',
    'solarized-light',
    'sunburst',
    'tomorrow',
    'tomorrow-night',
    'tomorrow-night-blue',
    'tomorrow-night-bright',
    'tomorrow-night-eighties',
    'vs',
    'vs2015',
    'xcode',
    'xt256',
    'zenburn',
];

$langs = [
    '1c',
    'abnf',
    'accesslog',
    'actionscript',
    'ada',
    'apache',
    'applescript',
    'arduino',
    'armasm',
    'asciidoc',
    'aspectj',
    'autohotkey',
    'autoit',
    'avrasm',
    'awk',
    'axapta',
    'bash',
    'basic',
    'bnf',
    'brainfuck',
    'cal',
    'capnproto',
    'ceylon',
    'clean',
    'clojure-repl',
    'clojure',
    'cmake',
    'coffeescript',
    'coq',
    'cos',
    'cpp',
    'crmsh',
    'crystal',
    'cs',
    'csp',
    'css',
    'd',
    'dart',
    'delphi',
    'diff',
    'django',
    'dns',
    'dockerfile',
    'dos',
    'dsconfig',
    'dts',
    'dust',
    'ebnf',
    'elixir',
    'elm',
    'erb',
    'erlang-repl',
    'erlang',
    'excel',
    'fix',
    'flix',
    'fortran',
    'fsharp',
    'gams',
    'gauss',
    'gcode',
    'gherkin',
    'glsl',
    'go',
    'golo',
    'gradle',
    'groovy',
    'haml',
    'handlebars',
    'haskell',
    'haxe',
    'hsp',
    'htmlbars',
    'http',
    'inform7',
    'ini',
    'irpf90',
    'java',
    'javascript',
    'json',
    'julia',
    'kotlin',
    'lasso',
    'ldif',
    'less',
    'lisp',
    'livecodeserver',
    'livescript',
    'llvm',
    'lsl',
    'lua',
    'makefile',
    'markdown',
    'mathematica',
    'matlab',
    'maxima',
    'mel',
    'mercury',
    'mipsasm',
    'mizar',
    'mojolicious',
    'monkey',
    'moonscript',
    'nginx',
    'nimrod',
    'nix',
    'nsis',
    'objectivec',
    'ocaml',
    'openscad',
    'oxygene',
    'parser3',
    'perl',
    'pf',
    'php',
    'pony',
    'powershell',
    'processing',
    'profile',
    'prolog',
    'protobuf',
    'puppet',
    'purebasic',
    'python',
    'q',
    'qml',
    'r',
    'rib',
    'roboconf',
    'rsl',
    'ruby',
    'ruleslanguage',
    'rust',
    'scala',
    'scheme',
    'scilab',
    'scss',
    'smali',
    'smalltalk',
    'sml',
    'sqf',
    'sql',
    'stan',
    'stata',
    'step21',
    'stylus',
    'subunit',
    'swift',
    'taggerscript',
    'tap',
    'tcl',
    'tex',
    'thrift',
    'tp',
    'twig',
    'typescript',
    'vala',
    'vbnet',
    'vbscript-html',
    'vbscript',
    'verilog',
    'vhdl',
    'vim',
    'x86asm',
    'xl',
    'xml',
    'xquery',
    'yaml',
    'zephir',
];

/* DATABASE FUNCTIONS */
/**
 * @param $userId
 * @param $name
 * @return mixed
 */
function getUser($userId, $name) {
    DB::insertUpdate('users', [
        'id'   => $userId,
        'name' => $name,
    ]);

    $checkUser = DB::queryFirstRow('SELECT * FROM users WHERE id=%i', $userId);

    return $checkUser;
}

/**
 * @param $userId
 * @param $theme
 */
function setTheme($userId, $theme) {
    DB::update('users', [
        'theme' => $theme,
    ], 'id=%i', $userId);
}

/**
 * @param $chat
 * @param $active
 * @return mixed
 */
function getChat($chat, $active) {
    DB::insertUpdate('chats', [
        'id'       => $chat->id,
        'name'     => $chat->title,
        'username' => (isset($chat->username) ? $chat->username : ''),
        'active'   => $active,
    ]);

    $checkChat = DB::queryFirstRow('SELECT * FROM chats WHERE id=%i', $chat->id);

    return $checkChat;
}

/**
 * @param $chat_id
 * @param $user_id
 * @param $text
 * @param $result
 */
function setUse($chat_id, $user_id, $text, $result) {
    DB::insert('uses', ['chat_id' => $chat_id,
        'lenght'                           => strlen($text),
        'lines'                            => substr_count($text, "\n") + 1,
        'user_id'                          => $user_id,
        'result'                           => $result,
    ]);
}

/**
 * @param $user_id
 * @param $limit
 * @return mixed
 */
function getRecents($user_id, $limit = 5) {
    $recents_q = DB::query('SELECT result FROM uses WHERE user_id = ' . $user_id . ' ORDER BY time DESC LIMIT ' . $limit);

    $recents = [];
    for ($i = 0; $i < sizeof($recents_q); ++$i) {
        $recents[] = $recents_q[$i]['result'];
    }

    return $recents;
}

/**
 * @param $list
 */
function orderThemes(&$list) {
    $ranking = DB::query('SELECT COUNT(id) as cuenta, theme FROM users WHERE theme != "" GROUP BY theme ORDER BY cuenta DESC');

    $themes = [];
    for ($i = 0; $i < sizeof($ranking); ++$i) {
        $themes[] = $ranking[$i]['theme'];
    }
    $list = array_values(array_unique(array_merge($themes, $list), SORT_REGULAR));

}

/* ADDED TO A GROUP */
if (isset($request->message->new_chat_member) && $request->message->new_chat_member->id == BOT_ID) {
    $telegram->sendMessage(['text' => $welcome_group,
        'parse_mode'                   => 'markdown',
        'chat_id'                      => $request->message->chat->id,
        'disable_web_page_preview'     => true,
    ]);
    getChat($request->message->chat, 1);
    echo 'ok';
    exit;
}

/* KICKED FROM GROUP */
if (isset($request->message->left_chat_member) && $request->message->left_chat_member->id == BOT_ID) {
    getChat($request->message->chat, 0);
    echo 'ok';
    exit;
}

/* INLINE CALLBACK */
if (isset($request->callback_query)) {
    if (in_array($request->callback_query->data, $themes)) {
        setTheme($request->callback_query->from->id, $request->callback_query->data);
        $telegram->answerCallbackQuery([
            'callback_query_id' => $request->callback_query->id,
            'text'              => 'Your selection has been saved!',
            //'show_alert' => true
        ]);
        $reply_markup = json_encode([
            'remove_keyboard' => true,
        ]);
        $telegram->sendMessage([
            'text'         => "Great! Your selection has been saved!\nYou can use your new theme right now, even in groups and inline mode. Do you want to change it? Press again /theme",
            'chat_id'      => $request->callback_query->from->id,
            'reply_markup' => $reply_markup,
        ]);
    }
    echo 'ok';exit;
}

/* INLINE QUERY */
if (isset($request->inline_query)) {

    $inline_query_id = $request->inline_query->id;
    $text            = $request->inline_query->query;
    $user_id         = $request->inline_query->from->id;
    $name            = (isset($request->inline_query->from->username)) ? '@' . $request->inline_query->from->username : $request->inline_query->from->first_name;
    $user            = getUser($user_id, $name);
    $theme           = ($user['theme'] == '') ? DEFAULT_THEME : $user['theme'];

    if (strlen($text) > MAX_CHARS || substr_count($text, "\n") > MAX_LINES || (strlen($request->inline_query->query) <= MIN_INLINE && $text != '')) {
        $results             = [];
        $cache_time          = 259200;
        $switch_pm_text      = 'Must be more than ' . MIN_INLINE . ' chars';
        $switch_pm_parameter = 'error';
        $is_personal         = false;
        $params              = compact('inline_query_id', 'results', 'cache_time', 'switch_pm_text', 'switch_pm_parameter', 'is_personal');
        $response            = $telegram->answerInlineQuery($params);
        die('ok');
    }

    /*GET_LANG*/
    $lang        = '';
    $extractLang = explode(':', $text, 2);
    $p_lang      = $extractLang[0];
    if (strlen($p_lang) < 20) {
        if (in_array($p_lang, $langs)) {
            $lang = $p_lang;
            $text = $extractLang[1];
        }
    }

    $recents = getRecents($user_id, 7);
    $recents = implode(',', $recents);

    if (sizeof($recents) == 0 && $text == '') {
        $results             = [];
        $cache_time          = 0;
        $switch_pm_text      = 'Must be more than ' . MIN_INLINE . ' chars';
        $switch_pm_parameter = 'error';
        $is_personal         = true;
        $params              = compact('inline_query_id', 'results', 'cache_time', 'switch_pm_text', 'switch_pm_parameter', 'is_personal');
        $response            = $telegram->answerInlineQuery($params);
    }

    /* SEND REQUEST NODE API */
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, IMAGE_API_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $text);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: text/plain', 'Theme: ' . $theme, 'Lang: ' . $lang, 'Inline: ' . $inline_query_id, 'Recent: ' . $recents]);
    $result = curl_exec($ch);

    if (strpos($result, 'ERROR') !== false || $result == '') {
        /* IF API ERROR */
        $results             = [];
        $cache_time          = 0;
        $switch_pm_text      = 'Error :(';
        $switch_pm_parameter = 'error';
        $params              = compact('inline_query_id', 'results', 'cache_time', 'switch_pm_text', 'switch_pm_parameter');
        $response            = $telegram->answerInlineQuery($params);
    } else {
        /* REGISTER USE */
        if ($isDemo == 0 && $text != '') {
            setUse(0, $user_id, $text, $result);
        }

    }
    die('ok');

}

/* CONTINUE IF NORMAL MESSAGE */
if (!isset($request->message) || !isset($request->message->text)) {
    echo 'ok';
    exit;
}

$msg  = $request->message;
$name = (isset($msg->from->username)) ? '@' . $msg->from->username : $msg->from->first_name;

/* CHECK IF IT'S THEME SELECTION */
if (strpos($msg->text, '🎨') !== false && $msg->chat->type == 'private') {

    $theme_str = str_replace('🎨', '', $msg->text);
    $theme     = strtolower(str_replace(' ', '-', $theme_str));
    if (in_array($theme, $themes)) {
        $isDemo    = 1;
        $msg->text = "function syntaxHighlightBot(block, cls) {\n  // Preview theme: $theme_str\n  // http://t.me/SyntaxHighlightBot\n  try {\n    if (cls.search(/\bno\-highlight\b/) != -1)\n      return process(block, true, 0x0F) +\n             ` class=\"\${cls}\"`;\n  } catch (e) {\n    /* handle exception */\n  }\n  for (var i = 0 / 2; i < classes.length; i++) {\n    if (checkCondition(classes[i]) === undefined)\n      console.log('undefined');\n  }\n}\n\nexport  syntaxHighlightBot;";
    } else {
        echo 'ok';exit;
    }
}

/* START */
$command = (isset($msg->entities)) ? substr($msg->text, $msg->entities[0]->offset, $msg->entities[0]->length) : '';
if (str_replace(BOT_USER, '', $command) == '/start') {

    $user = getUser($msg->from->id, $name);

    if ($msg->chat->type == 'private') {
        $text     = 'Welcome, ' . $name . "! Send me chunks of programming code and I'll show you the highlighted syntax in an image for easy reading.\n\n*Features*\n- *Groups:* add me to a group, I'll help everyone to understand those pieces of code.\n- *Languages:* I detect the language automatically, but if it does not work for some code, you can always specify the language, learn how: /langs\n- *Themes:* To each his own. Select your preferred theme, the one you select will be used when you generate codes here, in groups and in inline mode. Start now: /theme\n- *Inline mode:* just type my username in any chat to check your recent codes or keep typing code to create a new one quickly (similar to the use of @gif etc.)";
        $response = $telegram->sendMessage([
            'chat_id'                  => $msg->chat->id,
            'text'                     => $text,
            'parse_mode'               => 'markdown',
            'disable_web_page_preview' => true,
        ]);
    } else {
        $telegram->sendMessage([
            'text' => $welcome_group,
            'parse_mode'                   => 'markdown',
            'chat_id'                      => $request->message->chat->id,
            'reply_to_message_id'          => $msg->message_id,
            'disable_web_page_preview'     => true,
        ]);
    }

    if (str_replace('/start ', '', $msg->text) == 'error') {
        $telegram->sendMessage([
            'text' => "Looks like your query had a problem, try sending me the code here to know more.\n\n*Limitations of inline mode:*\n- Must have more than " . MIN_INLINE . " chars.\n- Code can be up to 512 chars.\n- On some Telegram clients it only detects up to the first line break (in TDesktop it works fine).\n- Avoid long lines.\n\n_If you still have problems, write to_ @CristianOspina",
            'parse_mode'                   => 'markdown',
            'chat_id'                      => $request->message->chat->id,
            'reply_to_message_id'          => $msg->message_id,
            'disable_web_page_preview'     => true,
        ]);
    }

    exit;
} else if (str_replace(BOT_USER, '', $command) == '/theme') {
    orderThemes($themes);

    if ($msg->chat->type != 'private') {
        $response = $telegram->sendMessage([
            'chat_id'                  => $msg->chat->id,
            'text'                     => 'To configure the theme of your code send me the command in private: ' . BOT_USER,
            'reply_to_message_id'      => $msg->message_id,
            'parse_mode'               => 'markdown',
            'disable_web_page_preview' => true,
        ]);
        echo 'ok';exit;
    }

    $text     = 'Select the theme for all your codes, even those that you send in groups, they are sorted by popularity:';
    $keyboard = [];

    for ($i = 0, $k = 0; $i < sizeof($themes); $i += 2, $k++) {
        if (isset($themes[$i + 1])) {
            $keyboard[$k] = ['🎨' . ucwords(str_replace('-', ' ', $themes[$i])), '🎨' . ucwords(str_replace('-', ' ', $themes[$i + 1]))];
        } else {
            $keyboard[$k][] = '🎨' . ucwords(str_replace('-', ' ', $themes[$i]));
        }
    }

    $reply_markup = $telegram->replyKeyboardMarkup([
        'keyboard'          => $keyboard,
        'resize_keyboard'   => true,
        'one_time_keyboard' => false,
    ]);

    $response = $telegram->sendMessage([
        'chat_id'                  => $msg->chat->id,
        'text'                     => $text,
        'reply_markup'             => $reply_markup,
        'parse_mode'               => 'markdown',
        'disable_web_page_preview' => true,
    ]);

    echo 'ok';exit;

} else if (str_replace(BOT_USER, '', $command) == '/langs') {
    orderThemes($themes);

    if ($msg->chat->type != 'private') {
        $response = $telegram->sendMessage([
            'chat_id'                  => $msg->chat->id,
            'text'                     => 'To show the suported langs send me the command in a private chat: ' . BOT_USER,
            'reply_to_message_id'      => $msg->message_id,
            'parse_mode'               => 'markdown',
            'disable_web_page_preview' => true,
        ]);
        echo 'ok';exit;
    }

    $text = "If the language detector does not work, you can always add to the beginning of the code the desired language followed by a colon, for example:\n`bash:yourcode`\n\n*Supported languages:* _(you must write them as it is)_\n";
    for ($i = 0; $i < sizeof($langs); ++$i) {
        $text .= $langs[$i] . "\n";
    }

    $response = $telegram->sendMessage([
        'chat_id'                  => $msg->chat->id,
        'text'                     => $text,
        'parse_mode'               => 'markdown',
        'disable_web_page_preview' => true,
    ]);

    echo 'ok';exit;

}

/* IF MESSAGE OR CODE*/
if ($msg->chat->type == 'private' || (isset($msg->entities) && ($msg->entities[0]->type == 'pre' || $msg->entities[0]->type == 'code') && $msg->entities[0]->offset == 0 && $msg->entities[0]->length == strlen($msg->text))) {

    $user = getUser($msg->from->id, $name);
    if (!$isDemo) {
        $theme = ($user['theme'] == '') ? DEFAULT_THEME : $user['theme'];
    }

    /* SAVE CHAT INFO */
    if ($msg->chat->type != 'private') {
        getChat($msg->chat, 1);
    }

    /* MAX_CHARS */
    if (strlen($msg->text) > MAX_CHARS) {
        if ($msg->chat->type == 'private') {
            $text     = 'For now I only support a maximum of ' . MAX_CHARS . ' chars, sorry.';
            $response = $telegram->sendMessage([
                'chat_id'                  => $msg->chat->id,
                'text'                     => $text,
                'reply_to_message_id'      => $msg->message_id,
                'parse_mode'               => 'markdown',
                'disable_web_page_preview' => true,
            ]);
        }
        echo 'ok';
        exit;
    }
    ;

    /* MAX_LINES */
    if (substr_count($msg->text, "\n") > MAX_LINES) {
        if ($msg->chat->type == 'private') {
            $text     = 'For now I only support a maximum of ' . MAX_LINES . ' lines, sorry.';
            $response = $telegram->sendMessage([
                'chat_id'                  => $msg->chat->id,
                'text'                     => $text,
                'reply_to_message_id'      => $msg->message_id,
                'parse_mode'               => 'markdown',
                'disable_web_page_preview' => true,
            ]);
        }
        echo 'ok';
        exit;
    }
    ;

    /*GET_LANG*/
    $lang        = '';
    $extractLang = explode(':', $msg->text, 2);
    $p_lang      = $extractLang[0];
    if (strlen($p_lang) < 20) {
        if (in_array($p_lang, $langs)) {
            $lang      = $p_lang;
            $msg->text = $extractLang[1];
        }
    }

    /* SEND REQUEST */
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, IMAGE_API_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $msg->text);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: text/plain', 'ChatId: ' . $msg->chat->id, 'MessageId: ' . $msg->message_id, 'Theme: ' . $theme, 'Demo: ' . $isDemo, 'Lang: ' . $lang]);
    $result = curl_exec($ch);

    if (strpos($result, 'ERROR') !== false || $result == '') {
        /* SI HAY ERROR */
        if ($msg->chat->type == 'private') {
            $text     = ($result == '') ? "Oops! It looks like an error has occurred or I'm in maintenance. The problem has been reported, please try again later." : 'Sorry, I could not identify the type of language. Try to send a little more code or specify the language, see /langs for more info.';
            $response = $telegram->sendMessage([
                'chat_id'                  => $msg->chat->id,
                'text'                     => $text,
                'reply_to_message_id'      => $msg->message_id,
                'parse_mode'               => 'markdown',
                'disable_web_page_preview' => true,
            ]);
        }

        if ($result == '') {
            $response = $telegram->sendMessage([
                'chat_id' => 10537271,
                'text'    => 'Error detectado: ' . $result,
            ]);
        }

        echo 'ok';
        exit;
    } else {
        /* REGISTRAR USO */
        if ($isDemo == 0) {
            setUse($msg->chat->id, $msg->from->id, $msg->text, $result);
        }

    }
} else {
    echo 'ok';
    exit;
}

?>

