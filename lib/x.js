var Entities        = require("html-entities").AllHtmlEntities,
    entities        = new Entities(),
    xml2js          = require('xml2js').parseString,
    htmlparser      = require("htmlparser2"),
    stripAnsi       = require('strip-ansi'),
    ytInfo          = require('youtube-info'),
    request         = require('request'),
    dateWithOffset  = require("date-with-offset"),
    jsonfile        = require("jsonfile");


module.exports = class X{

    /* -------------- LANGUAGE STUFF --------------------- */

    techno(ing, adj_count, noun_count){
    	var _this = this;
    	adj_count = adj_count !== undefined ? adj_count : 1;
    	noun_count = noun_count !== undefined ? noun_count : 1;

    	var tech_arr = [];

    	if(ing){
    		tech_arr.push(this.cap_first_letter(_this.ing(words.techverb[_this.rand_number_between(0, words.techverb.length - 1)])));
    	} else {
    		tech_arr.push(words.techverb[_this.rand_number_between(0, words.techverb.length - 1)]);
    	}

    	tech_arr.push('the');

    	for(var i = 0; i < adj_count; i++){
    		tech_arr.push(words.techadj[_this.rand_number_between(0, words.techadj.length - 1)]);
    	}

    	for(var i = 0; i < noun_count; i++){
    		tech_arr.push(words.technoun[_this.rand_number_between(0, words.technoun.length - 1)]);
    	}

    	return tech_arr.join(' ');
    }

    join_and(arr){
        if(arr.length === 0) return ''; 
        if(arr.length === 1) return arr[0];
        if(arr.length === 2) return arr[0] + ' and ' + arr[1]; // x and x

        var pre_and = arr.splice(0, arr.length - 1);
        return pre_and.join(', ') + ', and ' + arr;//x, x, and x
    }

    //verb -> verbing
    ing(adj){
    	adj = adj.toLowerCase();
    	var special = {
    		'hell': 'hella'
    	};

    	if(special[adj]) return special[adj];

    	//ends in s, remove the s
    	var ends_in_s = adj.match(/(\w+)s$/i);
    	if(ends_in_s !== null) adj = ends_in_s[1];

    	//ends in ie, remove the ie and add ying
    	var ends_in_ie = adj.match(/(\w+)ie$/i);
    	if(ends_in_ie !== null) return ends_in_ie[1] + 'ying'

    	//ends in e, remove the e and add ing
    	var ends_in_e = adj.match(/(\w+)e$/i);
    	if(ends_in_e !== null) return ends_in_e[1] + 'ing';

    	//consonant + vowel + consonant (except w, x, y), double the final consonant and add ing
    	var c_v_c = adj.match(/\w*[bcdfghjklmnpqrstvwxyz][aeiou]([bcdfghjklmnpqrstvz])$/i); 
    	if(c_v_c !== null) return adj + c_v_c[1] + 'ing';

    	//consonant + vowel + consonant + s, remove the s and double the final consonant and add ing
    	var c_v_c_s = adj.match(/(\w*[bcdfghjklmnpqrstvwxyz][aeiou])([bcdfghjklmnpqrstvwxyz])s$/i); 
    	if(c_v_c_s !== null) return c_v_c_s[1] + c_v_c_s[2] + c_v_c_s[2] + 'ing';

    	return adj + 'ing';
    }

    article_adj(adj, info){
        if(adj !== ''){
            var article = info.match(/^(one|a|an|your|you|he|his|she|her|them|their|the|that|those|it|its)\s(.*)/i);
            if(article !== null){
                return article[1] + ' ' + adj + article[2];
            } else {
                return adj + info;
            }
        } else {
            return info;
        }
    }

    vars(CHAN, str){
        var _this = this;
        var users = ['nobody', 'somebody'];
        CHAN.get_all_users_in_chan_data(null, function(data){
            users = data;
        });

        str = str.replace(/([\w\d]+\|)+([\w\d]+)/ig, function(xx){
            var or_vars = xx.split('|');
            return or_vars[_this.rand_number_between(0,or_vars.length - 1)];
        });

        for(var word in words)
        {
            var w = word.split('|');
            var var_reg = new RegExp('\\$' + w.join('[s]*|\\$') + '[s]*', 'ig');

            str = str.replace(var_reg, function(xx){
                var new_word = words[word][_this.rand_number_between(0,words[word].length - 1)];
                if(xx[xx.length - 1] === 's' && new_word[new_word.length - 1] !== 's') return new_word + 's';
                return new_word;
            });
        }

        str = str.replace(/\$user/ig, function(xx){
            return users[_this.rand_number_between(0, users.length - 1)]
        });

        return str;
    }

    cap_first_letter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    rand_number_between(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;;
    };

    //formats a string or array with a random color (excludes white, black, bold, italic, underline, reset)
    rand_color(data, disable_colors) {
        var _this = this;
        if(data === undefined){
            b.log.error('data undefined could not color');
            return;
        }

        if(disable_colors){
            return data;
        } else {
            var col_arr = [3,4,6,7,8,9,10,11,13,15];
            var c = '\u0003' + col_arr[_this.rand_number_between(0, col_arr.length - 1)];

            if(typeof data === 'string'){
                return c + data + '\u000f';
            } else {
                for(var i = 0; i < data.length; i++){
                    data[i] = c + data[i] + '\u000f';
                }
                return data;
            }
        }
    };

    //generate unique id
    guid(){
      var s4 = function() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    };

    //strip ANSI escape codes
    strip_ansi(str){
        return stripAnsi(str);
    }

    //converts offset -0600 -> -360 min
    convert_offset_to_min(gmt_offset){
        return (parseInt(gmt_offset, 10) / 100) * 60;
    }

    //input milliseconds, returns hh:mm:ss
    //ms if false, ignore milliseconds
    //short if true 00:15:01.9 = 15m1s9ms
    ms_to_time(duration, ms, short) {
        ms = ms === false ? false : true;
        var milliseconds    = parseInt((duration%1000)/100), 
            seconds         = parseInt((duration/1000)%60), 
            minutes         = parseInt((duration/(1000*60))%60), 
            hours           = parseInt((duration/(1000*60*60))%24);

        if(short){
            return  (hours > 0 ? hours + 'h' : '') + 
                    (minutes > 0 ? minutes + 'm' : '') + 
                    (seconds > 0 ? seconds + 's' : '') +
                    (ms && milliseconds > 0 ? milliseconds + 'ms' : ''); 
        } else {
            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            return hours + ":" + minutes + ":" + seconds + (ms ? "." + milliseconds : '');
        }
    }

    //input epoc, returns hh:mm:ss
    //ms if false, ignore milliseconds
    epoc_to_date(epoc, offset, type){
        var date = new dateWithOffset(epoc, offset);
        return date.toString();
    }

    //date string to mm/dd/yy
    date_string_to_mdy(date_str){
        var date    = new dateWithOffset(date_str, 0);
        var month   = (date.getMonth() + 1),
            day     = date.getDate(),
            year    = (date.getFullYear() - 2000);

        return (month < 9 ? '0' + month : month) + '/' + (day < 9 ? '0' + day : day) + '/' + year;
    }

    get_url(url, type, callback, options){
        options = Object.assign({}, {
            only_return_text: false, //if true and type = html, instead of returning an array of dom object, returns an array of text only.
            only_return_nodes: null, //{attr: {'class': 'zoom'}} {tag: ['tag_name']} searched for only these values and returns them
            return_err: false
        }, options);

        var _this = this;

        if (type === 'youtube') {
            ytInfo(url, function (err, videoInfo) {
                if (err) return;
                callback(videoInfo);
            });
        } else {

            request({url: url, maxRedirects: 3}, function (error, response, body) {

                //Check for error
                if(error){
                    if(options.return_err) callback({err: error})
                    return b.log.error('Error:', error);
                }

                //Check for right status code
                if(response.statusCode !== 200){
                    if(options.return_err) callback({err: response.statusCode})
                    return b.log.error('Invalid Status Code Returned:', response.statusCode);
                }

                if(type === 'json'){
                    callback(JSON.parse(body));
                } else if(type === 'xml'){
                    xml2js(body, function(err, result) {
                        callback(result);
                    });
                } else  if(type === 'html' || type === 'sup') {
                    var parsed = [];

                    var push_tag = null;
                    var parser = new htmlparser.Parser({
                        onopentag: function(name, attribs){
                            if(type === 'sup' && name !== 'title') return;
                            if(name === 'br' || name == 'hr' || options.only_return_text) return;

                            if(options.only_return_nodes){
                                if(options.only_return_nodes.attr){
                                    for(var attr in options.only_return_nodes.attr){
                                        if(attribs[attr] === undefined || attribs[attr] !== options.only_return_nodes.attr[attr]) return;
                                    }
                                }

                                if(options.only_return_nodes.tag){
                                    if(options.only_return_nodes.tag.indexOf(name) < 0) return;
                                }
                            }

                            push_tag = {
                                tag: name
                            };

                            if(attribs){
                                push_tag.attr = attribs;
                            }
                        },
                        ontext: function(text){
                            text = text.trim();

                            if(push_tag && type === 'sup' && push_tag.tag === 'title' && text.length > 0){
                                callback(text);
                                parser.parseComplete();
                            }

                            if(text.length > 0){
                                if(options.only_return_text === true){
                                    parsed.push(text);
                                } else if(options.only_return_nodes !== undefined) {
                                    if(push_tag === null){
                                        return;
                                    } else {
                                        push_tag.text = text;
                                    }
                                } else {
                                    push_tag ? push_tag.text = text : push_tag = {text: text};
                                }
                            } else {
                                return;
                            }
                        },
                        onclosetag: function(tagname){
                           if(push_tag && !options.only_return_text) {
                                parsed.push(push_tag);
                                push_tag = null;
                           }
                        },
                        onend: function() {
                            if(type !== 'sup'){
                                callback(parsed);
                            }
                        }
                    }, {decodeEntities: false});
                    body = entities.decode(body);
                    parser.write(body);
                    parser.end();
                } else {
                    callback(body);
                }
            });
        }
    }

    //update speak array with now, rotate if max count is reached
    update_speak_time(path, count, case_insensitive){
        var _this = this;
        var now = (new dateWithOffset(0)).getTime();

        db.get_data('/speak/' + path, function(time_arr){
            if(time_arr !== null){
                time_arr.push(now);
                if(time_arr.length > count){
                    time_arr.shift();
                } 

                db.update('/speak/' + path, time_arr, true, undefined, case_insensitive);
            } else {
                time_arr = [now];
                db.update('/speak/' + path, time_arr, true, undefined, case_insensitive);
            }
        }, true, case_insensitive);
    }

    //check last time speak happened
    //return false if no speak, or now > last spoke + wait time, or return ms until can speak again
    check_speak_timeout(path, wait_time, callback, case_insensitive){
        var _this = this;
        db.get_data('/speak/' + path, function(time_arr){
            if(time_arr !== null && time_arr.length > 0){
                var now = (new dateWithOffset(0)).getTime();
                var timeout = time_arr[time_arr.length - 1] + wait_time;

                if(now < timeout){
                    b.log.debug('check_speak_timeout 1', path, _this.ms_to_time(timeout - now))
                    callback(timeout - now);
                } else {
                    b.log.debug('check_speak_timeout 2', path, false);
                    callback(false);
                }
            } else {
                b.log.debug('check_speak_timeout 3', path, false, time_arr);
                callback(false);
            }
        }, true, case_insensitive);
    }

    //verifies and strips strings before speaking them
    verify_string(str) {
     if(typeof str !== 'string'){
            //b.log.error('verify_string: str is a', typeof str, str);
            if(typeof str === 'object'){
                var tmp_str = '';
                for(var key in str){
                    tmp_str += key + ': ' + str[key] + '\n';
                }
                str = tmp_str;
            } else {
                str = JSON.stringify(str);
            } 
        } 

        //strip tags
        str = str.replace(/<\/?[^>]+(>|$)/g, "");
        str = str.trim();

        var breaks = str.match(/\r?\n|\r/g) || [];

        //if there are more than 3 new line breaks, remove them.
        if(breaks.length > 3){
            str = str.replace(/\r?\n|\r/g, ' ');
        }

        return str; 
    };


    /* -------------- PONG TIMERS --------------------- */
    // functions that need timers, runs off server ping/pong

    get_pong_time_left(cb_name, callback){
        var _this = this;
        var pong_epoc = (new dateWithOffset(0)).getTime(); //now

        db.get_data('/pong/cbs/' + cb_name, function(cb_last){
            if(cb_last !== null){
                var time_left = (cb_last + b.cbs[cb_name].ms) - pong_epoc;
                callback(time_left > 0 ? _this.ms_to_time(time_left, true, true) : 0);
            } else {
                callback(null);
            }
        });
    }

    pong_exists(cb_name, callback){
        db.get_data('/pong/cbs/' + cb_name, function(cb_last){
            callback(cb_last !== null)
        });
    }

    //timers that run on intervals based off ping/pong on server
    add_pong(cb_name, ms, cb_func, run_once){
        var _this = this;
        var pong_epoc = (new dateWithOffset(0)).getTime(); //now

        b.log.debug('PONG ADD', cb_name, 'time:', _this.ms_to_time(ms, true, true));
        b.cbs[cb_name] = {
            ms: ms,
            func: cb_func,
            run_once: run_once
        };

        db.update('/pong/cbs/' + cb_name, pong_epoc, true);
    }

    remove_pong(cb_name){
        b.log.debug('PONG DELETE', cb_name);
        delete b.cbs[cb_name];
        db.delete('/pong/cbs/' + cb_name)
    }

    //update pong time, run any pong timers in queue
    pong(){
        var _this = this;
        var pong_epoc = (new dateWithOffset(0)).getTime(); //now
        db.update('/pong/now', pong_epoc, true); //set now

        for(var cb_func in b.cbs){ //loop thru open pong cbs
            db.get_data('/pong/cbs/' + cb_func, function(cb_last){
                if(cb_last !== null){ //if last loop time is not null...
                    b.log.trace(cb_func, _this.ms_to_time(b.cbs[cb_func].ms, true, true), _this.ms_to_time(pong_epoc - cb_last, true, true))
                    if(pong_epoc >= (cb_last + b.cbs[cb_func].ms)){ //if now >= last loop time + pong cb time length, run function
                        b.cbs[cb_func].func(cb_func);
                        b.log.debug('PONG RUN:', (b.cbs[cb_func].run_once ? 'once' : 'loop') , cb_func);

                        if(b.cbs[cb_func].run_once){
                            _this.remove_pong(cb_func);
                        } else {
                            b.log.debug('PONG SET:NOW', cb_func);
                            db.update('/pong/cbs/' + cb_func, pong_epoc, true);
                        }
                    } else {
                        //b.log.debug('PONG SKIP', cb_func, 'wait:', _this.ms_to_time((cb_last + b.cbs[cb_func].ms) - pong_epoc, true, true));
                    }
                } else { //if pong cb last loop time has never been updated, set to now
                    b.log.debug('PONG SET:NOW (was null)', cb_func);
                    db.update('/pong/cbs/' + cb_func, pong_epoc, true);
                }
            });
        }
    }

    /* -------------- CACHE DATA --------------------- */
    // for saving data to pull later, good for API calls that have limits on them

    add_cache(path, data, timer, case_insensitive){
        var cache_data = {
            date: (new dateWithOffset(0)).getTime(),
            timer: timer,
            data: data
        };

        db.update(path, cache_data, true, undefined, case_insensitive);
    }

    get_cache(path, succ, fail, case_insensitive){
        db.get_data(path, function(d){
            if(d !== null){
                var now = (new dateWithOffset(0)).getTime();
                if(now >= (d.timer + d.date)){
                    db.delete(path, function(act){
                        b.log.debug('get_cache fail 1', path);
                        fail();
                    });
                } else {
                    b.log.debug('get_cache succ', path);
                    succ(d.data);
                }
            } else {
                b.log.debug('get_cache fail 2', path);
                fail();
            }
        }, true, case_insensitive);
    }

    delete_cache(path){
        db.delete(path, function(act){});
    }

    /* -------------- Formatting bot output --------------------- */
    //colors, scores, monospace, etc

    //generate color coded 'score'
    //red <= 25%, brown <= 50%, orange <= 75%, green <= 95%, teal > 95%
    score(score, options){
        options = Object.assign({}, {
            config: config.chan_default,
            max: 100, //max score amount
            min: 0, //min score amount
            end: '', //what comes after score number. default none, if % used, score should be a decimal value, like .0563 will convert to 5.6%
            ignore_perc: false, //don't * 100 if end === %
            score_str: null,
            colors: [ //what colors to parse, must start with 100
                {'%':100, c:'teal'}, 
                {'%':95, c:'green'}, 
                {'%':75, c:'olive'}, 
                {'%':50, c:'brown'}, 
                {'%':25, c:'red'}
            ]
        }, options);
        
        if(options.end === '%' && options.ignore_perc === false){
            score = Number((parseFloat(score) * 100).toFixed(1));
        } else {
            score = parseInt(score, 10);
        }
        
        if(options.config.disable_colors){
            
            return (options.score_str === null ? score : options.score_str) + options.end;
        
        } else {

            options.max = parseInt(options.max, 10); 
            options.min = parseInt(options.min, 10);

            var colors = JSON.parse(JSON.stringify(options.colors));
            var first_color = colors[0].c;
            var score_perc = (((score - options.min) / (options.max - options.min)) * 100).toFixed(2);

            colors.push({'%': score_perc});

            colors.sort(function(a, b){
                return b['%'] - a['%'];
            });

            var index = 0;
            for(var i = 0; i < colors.length; i++){
                if(!colors[i].c){
                    index = i;
                    break;
                }
            }

            var color = colors[i - 1] ? colors[i - 1].c : first_color;

            return c[color]((options.score_str === null ? score : options.score_str) + options.end);
        }
    };

    //inserts zero width no-break space character in irc nick so it doesn't ping users
    no_highlight(nick){
        if(nick === undefined) return '';
        return nick.slice(0,1) + "\uFEFF" + nick.slice(1, nick.length);
    };


    /* returns string formatted with color codes. 
    if plugin has colors:true, then command_str will be formatted.

        &b &bold 
        &i &italic
        &u &underline
        &r &reset

        -colors can use color id, or any of the array values below
        &0 &white
        &11 &cyan &aqua
        etc.

        typing: &lime>green text here 
        returns: \u00039>green text here
        displays: >green text here (in green in irc window)
    */
    format(str, CHAN){
        var cobj = {
            '\u00030':  [ '0', 'white'],
            '\u00031':  [ '1', 'black'],
            '\u00032':  [ '2', 'navy', 'darkblue'],
            '\u00033':  [ '3', 'green', 'darkgreen', 'forest'],
            '\u00034':  [ '4', 'red'],
            '\u00035':  [ '5', 'brown', 'maroon', 'darkred'],
            '\u00036':  [ '6', 'purple', 'violet'],
            '\u00037':  [ '7', 'olive', 'orange'],
            '\u00038':  [ '8', 'yellow'],
            '\u00039':  [ '9', 'lightgreen', 'lime'],
            '\u000310': [ '10', 'teal'],
            '\u000311': [ '11', 'cyan', 'aqua'],
            '\u000312': [ '12', 'blue', 'royal'],
            '\u000313': [ '13', 'pink', 'lightpurple', 'fuchsia'],
            '\u000314': [ '14', 'gray', 'grey'],
            '\u000315': [ '15', 'lightgray', 'lightgrey', 'silver'],
            '\u001f':   ['underline', 'u'],
            '\u0016':   ['italic', 'i'],
            '\u0002':   ['bold', 'b'],
            '\u000f':   ['reset', 'r']
        };


        if(CHAN.config.disable_colors){
            for(var cid in cobj){
                for(var i = 0; i < cobj[cid].length; i++){
                    str = str.replace(new RegExp('&' + cobj[cid][i], 'g'), '');
                }
            }

            return str;

        } else {
            var col_count = 0;
            for(var cid in cobj){
                for(var i = 0; i < cobj[cid].length; i++){
                    var reg_col = new RegExp('&' + cobj[cid][i], 'g');
                    if(str.match(reg_col) !== null) col_count++;
                    str = str.replace(reg_col, cid);
                }
            }

            return str + (col_count > 0 ? '\u000f' : '');
        }
    }

    //convert text to unicode monospace
    to_monospace(text){
        var monospace = {
            a: '𝚊', b: '𝚋', c: '𝚌', d: '𝚍', e: '𝚎', f: '𝚏', g: '𝚐', h: '𝚑', i: '𝚒', j: '𝚓', k: '𝚔', l: '𝚕', m: '𝚖',
            n: '𝚗', o: '𝚘', p: '𝚙', q: '𝚚', r: '𝚛', s: '𝚜', t: '𝚝', u: '𝚞', v: '𝚟', w: '𝚠', x: '𝚡', y: '𝚢', z: '𝚣',
            A: '𝙰', B: '𝙱', C: '𝙲', D: '𝙳', E: '𝙴', F: '𝙵', G: '𝙶', H: '𝙷', I: '𝙸', J: '𝙹', K: '𝙺', L: '𝙻', M: '𝙼',
            N: '𝙽', O: '𝙾', P: '𝙿', Q: '𝚀', R: '𝚁', S: '𝚂', T: '𝚃', U: '𝚄', V: '𝚅', W: '𝚆', X: '𝚇', Y: '𝚈', Z: '𝚉',
            0: '𝟶', 1: '𝟷', 2: '𝟸', 3: '𝟹', 4: '𝟺', 5: '𝟻', 6: '𝟼', 7: '𝟽', 8: '𝟾', 9: '𝟿', ' ': ' ', '．': '﹒', '-': '—'
        }

        var mono_txt = [...text].map(function(letter){
            return monospace[letter] ? monospace[letter] : letter;
        });
        return mono_txt.join('');
    }



    /* -------------- Interacting with Obj/Arr --------------------- */

    //speak object
    input_object(obj, key_arr, new_val, callback, options){
        var _this = this;
        options = Object.assign({}, {
            ignore: [], //keys to ignore
            skip_keys: false //skip key label
        }, options);

        var response = [];
        var last_key = key_arr && key_arr.length > 0 ? key_arr[key_arr.length - 1] : '';

        function search_obj(objj, keys, i, callback){
            if(keys[i] !== undefined && objj[keys[i]] !== undefined && options.ignore.indexOf(key_arr[i]) < 0){
                b.log.debug(keys[i], i, objj[keys[i]]);
                if(keys[i + 1] !== undefined){
                    search_obj(objj[keys[i]], key_arr, i + 1);
                } else {
                    if(typeof objj[keys[i]] === 'object'){
                        for(var key in objj[keys[i]]){
                            if(options.ignore.indexOf(key) > -1) continue;
                            parse_val(key, objj[keys[i]][key], typeof objj[keys[i]][key], 1);
                        }
                        return true;
                    } else {
                        parse_val(last_key, objj[keys[i]], typeof objj[keys[i]], 2);
                        return true;
                    }
                }
            } else if (keys.length === 0){
                if(typeof objj === 'object'){
                    for(var key in objj){
                        if(options.ignore.indexOf(key) > -1) continue;
                        parse_val(key, objj[key], typeof objj[key], 3);
                    }
                    return true;
                } else {
                    parse_val(last_key, objj, typeof objj, 4);
                    return true;
                }
            } else {
                return false;
            }

            return true;
        }

        function validate(old_val, new_val){
            if(typeof old_val === 'number'){
                return +new_val;
            } else if(typeof old_val === 'boolean'){
                if(new_val.toLowerCase() === 't' || new_val.toLowerCase() === 'true') return true;
                if(new_val.toLowerCase() === 'f' || new_val.toLowerCase() === 'false') return false;
            } else if(typeof old_val === 'string' && new_val !== null){
                return new_val + '';
            } else if(typeof old_val === 'object' && Array.isArray(old_val)){
                return new_val.split(/,\s*/g);
            }
            return null;
        }

        function parse_val(key, val, type, n){
            b.log.debug(key, val, type, n)
            switch(type){
                case 'object': 
                    if(Array.isArray(val)){
                        var sub = (_this.input_object(val, [], {skip_keys: true})).join(', ');
                        if(sub.length > 50) sub = sub.slice(0, 100) + '\u000f...';
                        response.push(c.red('(arr) ' + (options.skip_keys ? '' : key + ': ')) + '[' + sub + ']');
                    } else {
                        var sub = (_this.input_object(val, [], {ignore: options.ignore})).join(', ');
                        if(sub.length > 50) sub = sub.slice(0, 100) + '\u000f...';
                        response.push(c.olive('(obj) ' + (options.skip_keys ? '' : key + ': ')) + '{' + sub + '}');
                    }

                    break;
                case 'string':
                    response.push(c.teal('(str) ' + (options.skip_keys ? '' : key + ': ')) + '\'' + val + '\'');
                    break;
                case 'boolean':
                    response.push(c.green('(bool) ' + (options.skip_keys ? '' : key + ': ')) + val);
                    break;
                case 'number':
                    response.push(c.yellow('(int) ' + (options.skip_keys ? '' : key + ': ')) + '\u000f' + val);
                    break;
                default:
                    response.push(c.purple('(' + typeof val + ') ' + (options.skip_keys ? '' : key + ': ')) + val);
                    break;
            }
        }


        var rtn = search_obj(obj, key_arr || [], 0);
        return rtn === false ? {err: key_arr[0] + ' not found in object'} : response;
    }


    update_config(conf_data, chan){
        if(chan){
            var file = __botdir + '/chan_config/config_' + chan + '.json';
        } else {
            var file = __botdir + '/config.json';
        }

        jsonfile.writeFile(file, conf_data, {spaces: 4}, function(err) {
          b.log.error(err);
        });
    }

    /* -------------- POLLING (for !poll and !vote) --------------------- */

    say_poll(CHAN, poll, callback){
        var _this = this;
        var say_arr = [];
        var results = poll.answers.map(function(answer, i){
            return {
                id: i,
                answer: answer,
                score: 0
            }
        });
        var total_votes = 0;

        if(poll.votes){
            for(var user in poll.votes){
                results[poll.votes[user]].score++;
                total_votes++;
            }
        }

        if(poll.status === 'open'){
            _this.get_pong_time_left('polls' + CHAN.chan, function(time_left){
                say_arr.push(CHAN.t.highlight('To vote, please type ' + config.command_prefix + 'vote <id of answer> (in PM to bot or chan)'));
                say_arr.push(CHAN.t.warn(poll.question) + ' ' + CHAN.t.fail('Time left: ' + time_left));

                for(var i = 0; i < poll.answers.length; i++){
                   say_arr.push(CHAN.t.highlight2('[' + (i+1) + ']' ) + ' ' + poll.answers[i] + ' ' + (total_votes > 0 ? x.score(results[i].score, {max: total_votes, config: CHAN.config, score_str: '(' + results[i].score + ')'}) : '')); 
                }

                callback(say_arr);
            });
        } else if (poll.status === 'closed'){

            results.sort(function(a, b) { return a.score - b.score; });
            var score_arrs = {};

            say_arr.push(CHAN.t.highlight('Poll results for: ') + CHAN.t.warn(poll.question));

            for(var i = 0; i < results.length; i++){
                score_arrs[results[i].score] = score_arrs[results[i].score] || [];
                score_arrs[results[i].score].push(results[i].answer);
            }

            var scores = (Object.keys(score_arrs)).sort(function(a, b){return b-a});

            if(total_votes === 0){
                say_arr.push(CHAN.t.null('No Votes :( ' + score_arrs[0].join('/')));
            } else {
                for(var i = 0; i < scores.length; i++){
                    if(i === 0){
                        say_arr.push(CHAN.t.success('WINNER: (' + scores[i] + '/' + total_votes + ') ' + score_arrs[scores[i]].join('/')));
                    } else {
                        say_arr.push(CHAN.t.null('(' + scores[i] + '/' + total_votes + ') ' + score_arrs[scores[i]].join('/')));
                    }
                }
            }

            callback(say_arr);
            
        }
    } 

    add_poll(CHAN, args, callback){
        var _this = this;
        var answers = args.answers.split(/\s*-\d\s*/g);
        answers = answers.filter(function(x){ return x !== '' });

        var poll = {
            question: args.question,
            answers: answers,
            status: 'open',
            time: (new dateWithOffset(0)).getTime(),
            votes: { }
        };

        db.update('/polls/' + CHAN.chan + '[]', poll, true, function(act){
            _this.add_pong('polls' + CHAN.chan, 600000, function(cb_func){
                var chan = (cb_func.split('polls'))[1];
                _this.close_current_poll(b.channels[chan], function(result){
                    b.channels[chan].say(result, 1, {to: chan, skip_verify: true, ignore_bot_speak: true, skip_buffer: true, join: '\n'});
                });
            }, true);

            _this.say_poll(CHAN, poll, callback);
        });
    }

    vote(CHAN, USER, args, poll, callback){
        var answer_id = args.answer_id - 1;

        if(poll.answers[answer_id] === undefined){
            callback({err: 'No answer with id ' + args.answer_id});
            return;
        }

        var nick = USER.nick_org ? USER.nick_org : USER.nick;
        var key_search_regex = '^' + nick.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$';
        var case_insensitive_regex = new RegExp(key_search_regex, 'i');

        if(!poll.votes){
            poll.votes = {};
            poll.votes[nick] = (args.answer_id - 1)
        } else {
            var match_key = false;
            for(var key in poll.votes){
                if(key.match(case_insensitive_regex)){
                    poll.votes[key] = answer_id;
                    match_key = true;
                    break;
                }
            }

            if(match_key === false) poll.votes[nick] = (args.answer_id - 1);
        }

        db.update('/polls/' + CHAN.chan + '[-1]', poll, true, function(){
            callback({succ: 'voted for ' + args.answer_id + ': ' + poll.answers[answer_id]});
        });
    }

    get_poll(CHAN, USER, args, callback){
        var _this = this;
        db.get_data('/polls/' + CHAN.chan + '[-1]', function(poll){
            if(poll !== null){
                if(Object.keys(args).length === 0){
                    _this.say_poll(CHAN, poll, callback);
                } else if (args.question !== undefined && args.answers !== undefined){
                    if(poll.status === 'open'){
                        callback({err: 'There is currently an open poll, please type ' + config.command_prefix + 'poll -close before creating a new poll'});
                    } else {
                        _this.add_poll(CHAN, args, callback);
                    }
                } else if(args.answer_id !== undefined){
                    _this.vote(CHAN, USER, args, poll, callback)
                }
            } else {
                if(Object.keys(args).length === 0 || args.answer_id !== undefined){
                    callback({err: 'There are currently no polls'});
                } else if (args.question !== undefined && args.answers !== undefined){
                    _this.add_poll(CHAN, args, callback);
                } 
            }
        }, true);
    }

    close_current_poll(CHAN, callback){
        var _this = this;
        db.get_data('/polls/' + CHAN.chan + '[-1]', function(poll){
            if(poll !== null && poll.status !== 'closed'){
                poll.status = 'closed';
                db.update('/polls/' + CHAN.chan + '[-1]/status', 'closed', true, function(){
                    _this.say_poll(CHAN, poll, callback);
                });
            } else {
                callback({err: 'no poll to close'});
            }
        });
    }

}