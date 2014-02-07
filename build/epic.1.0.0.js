var epic = (function() {
        if (window['console'] === undefined) {
            window['console'] = {log: function(){}}
        }
        function epic(){}
        epic.type = (function() {
            var core_types = {
                    '[object Boolean]': 'boolean', '[object Number]': 'number', '[object String]': 'string', '[object Function]': 'function', '[object Array]': 'array', '[object Date]': 'date', '[object RegExp]': 'regexp', '[object Object]': 'object', '[object Error]': 'error'
                };
            var to_string = core_types.toString;
            function type(object) {
                var typeof_object = typeof(object);
                if (object == null) {
                    return 'null'
                }
                if (typeof_object === 'object' || typeof_object === 'function') {
                    return core_types[to_string.call(object)] || 'object'
                }
                return typeof_object
            }
            type.is_window = function(object) {
                return object != null && object == object.window
            };
            type.is_numeric = function(object) {
                return !isNaN(parseFloat(object)) && isFinite(object)
            };
            type.is_undefined = function(object) {
                return typeof(object) == 'undefined'
            };
            type.is_array = function(object) {
                return type(object) === "array"
            };
            type.is_function = function(object) {
                return type(object) === "function"
            };
            type.is_string = function(object) {
                return type(object) === "string"
            };
            type.is_object = function(object) {
                return type(object) === "object"
            };
            type.is_boolean = function(object) {
                return type(object) == 'boolean'
            };
            type.is_regexp = function(object) {
                return type(object) == 'regexp'
            };
            type.is_element = function(object) {
                var html_element = typeof HTMLElement === "object";
                return html_element ? object instanceof HTMLElement : object && typeof object === "object" && object.nodeType === 1 && typeof object.nodeName === "string"
            };
            return type
        })();
        epic.parse = {
            currency: function(expression, symbol) {
                var numbers = expression + '';
                var array = numbers.split('.');
                var digits = array[0];
                var decimals = array.length ? '.' + array[1] : '';
                var pattern = /(\d+)(\d{3})/;
                while (pattern.test(digits)) {
                    digits = digits.replace(pattern, '$1' + ',' + '$2')
                }
                return (symbol ? symbol + ' ' : '') + digits + decimals
            }, url: function(url) {
                    var anchor = document.createElement("a");
                    var query = {};
                    anchor.href = url;
                    anchor.search.replace(/([^?=&]+)(=([^&]*))?/g, function($0, $1, $2, $3) {
                        query[$1] = $3;
                        return $0
                    });
                    var json = {
                            href: anchor.href, protocol: anchor.protocol, host: anchor.host, hostname: anchor.hostname, port: anchor.port, path: anchor.pathname, query: query, bookmark: anchor.hash
                        };
                    return json
                }
        };
        epic.log = epic.fail = function(message) {
            console.log(message)
        };
        epic.start = function(callback) {
            callback()
        };
        return epic
    })();
(function(epic) {
    epic.uid = (function() {
        function uid(){}
        uid.seed = (new Date).getTime();
        uid.next = function() {
            return ++uid.seed
        };
        return uid
    })()
})(epic);
(function(epic) {
    function _object(object) {
        return new dsl(object, to_array(arguments))
    }
    function dsl(object, arguments) {
        this.object = object;
        this.arguments = arguments
    }
    dsl.prototype = {extends_from: function(base_class) {
            var target = this.object;
            for (var property_name in base_class) {
                if (base_class.hasOwnProperty(property_name)) {
                    target[property_name] = base_class[property_name]
                }
            }
            function object() {
                this.constructor = target;
                this.base_class = base_class;
                this.base = function() {
                    this.base_class.apply(this, arguments)
                }
            }
            object.prototype = base_class.prototype;
            target.prototype = new object
        }};
    function __extends(d, b) {
        for (var p in b) {
            if (b.hasOwnProperty(p)) {
                d[p] = b[p]
            }
        }
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    }
    function copy(object, target) {
        var object_type = epic.type(object);
        var clone;
        switch (object_type) {
            case"object":
                clone = target || {};
                for (var attribute in object) {
                    if (object.hasOwnProperty(attribute)) {
                        clone[attribute] = copy(object[attribute])
                    }
                }
                break;
            case"array":
                clone = target || [];
                for (var i = 0, len = object.length; i < len; i++) {
                    clone[i] = copy(object[i])
                }
                break;
            case"date":
                clone = new Date;
                clone.setTime(object.getTime());
                break;
            default:
                clone = object
        }
        return clone
    }
    function merge() {
        var objects = arguments;
        var length = objects.length;
        var target = {};
        var i = 0;
        for (; i < length; i++) {
            copy(objects[i], target)
        }
        return target
    }
    function to_array(object) {
        if (object == null) {
            return null
        }
        var array = Array.prototype.slice.call(object);
        return array.length > 0 ? array : [object]
    }
    _object.merge = merge;
    _object.clone = copy;
    _object.to_array = to_array;
    epic.object = _object
})(epic);
(function(epic) {
    function string(input) {
        return new dsl(input, epic.object.to_array(arguments))
    }
    function dsl(input, arguments) {
        this.input = input;
        this.arguments = arguments
    }
    var B64KEY = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    string.encode_base64 = function(input) {
        var key = B64KEY;
        var str = string.encode_utf8(input);
        var length = str.length;
        var index = 0;
        var output = "";
        var chr1,
            chr2,
            chr3,
            enc1,
            enc2,
            enc3,
            enc4;
        while (index < length) {
            chr1 = str.charCodeAt(index++);
            chr2 = str.charCodeAt(index++);
            chr3 = str.charCodeAt(index++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64
            }
            else if (isNaN(chr3)) {
                enc4 = 64
            }
            output = output + key.charAt(enc1) + key.charAt(enc2) + key.charAt(enc3) + key.charAt(enc4)
        }
        return output
    };
    string.decode_base64 = function(input) {
        var key = B64KEY;
        var str = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        var length = str.length;
        var index = 0;
        var output = "";
        var chr1,
            chr2,
            chr3;
        var enc1,
            enc2,
            enc3,
            enc4;
        while (index < length) {
            enc1 = key.indexOf(str.charAt(index++));
            enc2 = key.indexOf(str.charAt(index++));
            enc3 = key.indexOf(str.charAt(index++));
            enc4 = key.indexOf(str.charAt(index++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2)
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3)
            }
        }
        output = string.decode_utf8(output);
        return output
    };
    string.encode_utf8 = function(input) {
        var str = input.replace(/\r\n/g, "\n");
        var length = str.length;
        var index = 0;
        var output = "";
        var charcode;
        while (length--) {
            charcode = str.charCodeAt(index++);
            if (charcode < 128) {
                output += String.fromCharCode(charcode)
            }
            else if ((charcode > 127) && (charcode < 2048)) {
                output += String.fromCharCode((charcode >> 6) | 192);
                output += String.fromCharCode((charcode & 63) | 128)
            }
            else {
                output += String.fromCharCode((charcode >> 12) | 224);
                output += String.fromCharCode(((charcode >> 6) & 63) | 128);
                output += String.fromCharCode((charcode & 63) | 128)
            }
        }
        return output
    };
    string.decode_utf8 = function(input) {
        var length = input.length;
        var index = 0;
        var output = "";
        var charcode;
        var c2;
        var c3;
        while (index < length) {
            charcode = input.charCodeAt(index);
            if (charcode < 128) {
                output += String.fromCharCode(charcode);
                index++
            }
            else if ((charcode > 191) && (charcode < 224)) {
                c2 = input.charCodeAt(index + 1);
                output += String.fromCharCode(((charcode & 31) << 6) | (c2 & 63));
                index += 2
            }
            else {
                c2 = input.charCodeAt(index + 1);
                c3 = input.charCodeAt(index + 2);
                output += String.fromCharCode(((charcode & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                index += 3
            }
        }
        return output
    };
    string.encode_url = function(input) {
        return encodeURIComponent(input)
    };
    string.decode_url = function(input) {
        return decodeURIComponent(input)
    };
    string.encode_html_entities = function(input, encode_reserved_chars) {
        return input.replace(/./g, encode_reserved_chars ? replace_all_html_entities : replace_default_html_entities)
    };
    string.decode_html_entities = function(input) {
        return input.replace(/&#(\d)+;/g, restore_html_entities)
    };
    string.uppercase = function(str) {
        return str.toUpperCase()
    };
    string.lowercase = function(str) {
        return str.toLowerCase()
    };
    string.trim = function(str, collapse_spaces) {
        str = str.replace(/^\s+|\s+$/gm, '');
        if (collapse_spaces) {
            str = str.replace(/\s+/g, ' ')
        }
        return str
    };
    string.is_html = function(str) {
        return /^<(\w)+(\b[^>]*)\/?>(.*?)(<\w+\/?>)?$/i.test(str)
    };
    string.to_dom = function(str) {
        var container = document.createElement("div");
        container.innerHTML = str;
        return new epic.html.selector(Array.prototype.slice.call(container.childNodes))
    };
    function replace_default_html_entities(str) {
        var i = str.charCodeAt(0);
        if ((i > 31 && i < 96) || (i > 96 && i < 127)) {
            return str
        }
        else {
            return '&#' + i + ';'
        }
    }
    function replace_all_html_entities(str) {
        var i = str.charCodeAt(0);
        if ((i != 34 && i != 39 && i != 38 && i != 60 && i != 62) && ((i > 31 && i < 96) || (i > 96 && i < 127))) {
            return str
        }
        else {
            return '&#' + i + ';'
        }
    }
    function restore_html_entities(str) {
        return String.fromCharCode(str.replace(/[#&;]/g, ''))
    }
    epic.string = string
})(epic);
(function(epic) {
    function array(){}
    array.flatten = function(items) {
        var a = [];
        return a.concat.apply(a, items)
    };
    array.each = Array.prototype.forEach || function(list, callback, self) {
        var i = 0;
        var length = list.length;
        self = self || list;
        for (; i < length; i++) {
            if (callback.call(self, list[i], i, list) === false) {
                break
            }
        }
    };
    epic.array = array
})(epic);
epic.collection = (function() {
    function collection() {
        this.collection = {}
    }
    collection.prototype = {
        get: get, set: set, remove: remove, to_string: to_string
    };
    function get(key) {
        var t = this;
        var key_str = t.to_string(key);
        var pair = t.collection[key_str];
        if ((typeof pair) === 'undefined') {
            return undefined
        }
        return pair.value
    }
    function set(key, value) {
        if (key === undefined || value === undefined) {
            return undefined
        }
        var previous_value = this.get(key);
        this.collection[this.to_string(key)] = {
            key: key, value: value
        };
        return previous_value
    }
    function remove(key) {
        var t = this;
        var k = t.to_string(key);
        var previous_element = t.collection[k];
        if (previous_element != undefined) {
            delete this.collection[k];
            return previous_element.value
        }
        return undefined
    }
    function to_string(key) {
        return String(key)
    }
    return collection
})();
(function(epic, window, document, navigator) {
    var agent = navigator.userAgent;
    var vendor = navigator.vendor;
    var platform = navigator.platform;
    var browser_agent = [[agent, "Chrome"], [agent, "OmniWeb", '', "OmniWeb/"], [vendor, "Safari", "Apple", "Version"], [window.opera, "Opera"], [vendor, "iCab"], [vendor, "Konqueror", "KDE"], [agent, "Firefox"], [vendor, "Camino"], [agent, "Netscape"], [agent, "Explorer", "MSIE"], [agent, "Gecko", "Mozilla", "rv"], [agent, "Netscape", "Mozilla"]];
    var browser_os = [[platform, "Windows", "Win"], [platform, "Mac"], [agent, "iPhone", "iPhone/iPod"], [platform, "Linux"]];
    var browser_info = search(browser_agent);
    var browser = epic.browser = {
            webkit: agent.indexOf('AppleWebKit/') > -1, gecko: agent.indexOf('Gecko') > -1 && agent.indexOf('KHTML') === -1, name: browser_info[0], os: search(browser_os)[0], version: browser_info[1], load: function(url, type, callback) {
                    setTimeout(function() {
                        request(url, type, callback)
                    }, 10)
                }
        };
    var loaded_documents = [];
    browser.ie = (browser.name == 'explorer');
    browser.get_current_url = get_current_url;
    if (browser.ie) {
        try {
            document.execCommand("BackgroundImageCache", false, true)
        }
        catch(er) {}
    }
    function search(array) {
        var len = array.length;
        var index = 0;
        var item;
        var user_agent;
        var identity;
        var identity_search;
        var version_search;
        while (len--) {
            item = array[index++];
            user_agent = item[0];
            identity = item[1];
            identity_search = item[2];
            version_search = item[3];
            if (user_agent) {
                if (user_agent.indexOf(identity_search || identity) > -1) {
                    new RegExp((version_search || identity_search || identity) + "[\\/\\s](\\d+\\.\\d+)").test(user_agent);
                    return [epic.string.lowercase(identity), parseFloat(RegExp.$1)]
                }
            }
        }
        return null
    }
    function get_current_url(relative) {
        var anchor = document.createElement("a");
        var port;
        var pathname = '';
        anchor.href = document.location;
        port = anchor.port;
        if (relative) {
            pathname = anchor.pathname.replace(/^[/]/, '');
            if (pathname) {
                pathname = pathname.substring(0, pathname.lastIndexOf("/")) + "/"
            }
        }
        return anchor.protocol + '//' + anchor.hostname + (port && port != 0 ? ':' + port : '') + '/' + pathname
    }
    function request(url, type, callback) {
        var tag;
        var src = 'src';
        var rel;
        var typeof_script = typeof(type);
        if (/^http/i.test(url) == false) {
            url = browser.url + url
        }
        if (loaded_documents[url] != null) {
            if (callback) {
                callback.free()
            }
            return loaded_documents[url].element
        }
        if (typeof_script == 'function') {
            callback = type
        }
        if (typeof_script != 'string') {
            type = url.split('?')[0].file_ext()
        }
        if (type == 'js') {
            tag = 'script';
            rel = type = 'javascript'
        }
        else {
            tag = 'link';
            src = 'href';
            rel = 'stylesheet'
        }
        var element = document.createElement(tag);
        element.setAttribute("type", "text/" + type);
        element.setAttribute('rel', rel);
        element.setAttribute(src, url);
        var data = {
                element: element, loaded: false, callback: callback
            };
        if (callback) {
            element.onreadystatechange = function() {
                var state = this.readyState;
                if ((state === 'loaded' || state === 'complete') && data.loaded == false) {
                    this.onreadystatechange = null;
                    data.loaded = true;
                    data.callback()
                }
            };
            element.onload = function() {
                if (data.loaded == false) {
                    data.loaded = true;
                    data.callback()
                }
            };
            if (type == 'css') {
                if (browser.name == "firefox") {
                    element.textContent = '@import "' + url + '"';
                    var foo = setInterval(function() {
                            try {
                                clearInterval(foo);
                                if (callback) {
                                    callback()
                                }
                            }
                            catch(e) {}
                        }, 50)
                }
            }
        }
        setTimeout(function() {
            document.getElementsByTagName('head')[0].insertBefore(element, null)
        }, 10);
        loaded_documents[url] = data;
        return element
    }
})(epic, window, document, navigator);
(function(epic, widnow, document) {
    var is_html = epic.string.is_html;
    var array = epic.array;
    function html(element) {
        this.element = element;
        this.elements = flatten(arguments)
    }
    function selector(query) {
        query = query != null ? query : [];
        this.elements = epic.type(query) == 'array' ? query : [query]
    }
    function create(element) {
        var params = Array.prototype.slice.call(arguments);
        var node;
        if (is_html(element)) {
            return epic.string.to_dom(element)
        }
        if (element == 'option') {
            return create.option(params[0], params[1], params[2])
        }
        if (element == "textnode") {
            node = document.createTextNode(element)
        }
        else {
            node = document.createElement(element)
        }
        return new epic.html.selector(node)
    }
    function flatten(list) {
        return array.flatten(array.each(list, html_element_parser))
    }
    function html_element_parser(element, index, list) {
        if (element instanceof selector) {
            list[index] = element.elements
        }
        else if (typeof element == "string") {
            list[index] = epic.html.create(element)
        }
    }
    selector.prototype = {
        empty: function() {
            var t = this;
            var elements = t.elements;
            var index = elements.length;
            var element;
            while (index--) {
                element = elements[index];
                while (element.firstChild) {
                    element.removeChild(element.firstChild)
                }
            }
            return t
        }, insert: function(elements, position) {
                elements = flatten(elements);
                var t = this;
                var i = elements.length;
                var target = t.elements[0];
                var reference = null;
                var element;
                var valid_nodes = [];
                if (position !== undefined) {
                    var child_nodes = target.childNodes;
                    var j = child_nodes.length;
                    var trim = epic.string.trim;
                    var index = 0;
                    var node;
                    while (j--) {
                        node = child_nodes[index++];
                        if (node.nodeType == 1 || (node.nodeType == 3 && trim(node.textContent) != '')) {
                            valid_nodes[valid_nodes.length] = node
                        }
                    }
                    if (position > -1 && position < valid_nodes.length) {
                        reference = valid_nodes[position]
                    }
                }
                while (i--) {
                    element = elements[i];
                    if (!element) {
                        continue
                    }
                    if (!element.nodeType) {
                        element = document.createTextNode(element)
                    }
                    target.insertBefore(element, reference)
                }
            }, append: function() {
                return this.insert(arguments, undefined)
            }, get: function(index) {
                var elements = this.elements;
                var upper_limit = elements.length - 1;
                if (index < 0) {
                    index = 0
                }
                else if (index > upper_limit) {
                    index = upper_limit
                }
                return elements[index]
            }
    };
    create.document_fragment = function(content, callback) {
        var document_fragment = document.createDocumentFragment();
        var content_holder;
        var index;
        var nodes;
        if (content) {
            content_holder = document.createElement('div');
            content_holder.innerHTML = content;
            if (callback) {
                (function() {
                    if (content_holder.firstChild) {
                        document_fragment.appendChild(content_holder.firstChild);
                        setTimeout(arguments.callee, 0)
                    }
                    else {
                        callback(document_fragment)
                    }
                })()
            }
            else {
                nodes = content_holder.childNodes;
                index = nodes.length;
                while (index--) {
                    document_fragment.insertBefore(nodes[index], document_fragment.firstChild)
                }
            }
        }
        return document_fragment
    };
    create.option = function(caption, value, selected) {
        var node = document.createElement("option");
        if (selected == undefined && value === true) {
            selected = true;
            value = null
        }
        value = value == null ? caption : value;
        node.insertBefore(document.createTextNode(caption), null);
        node.setAttribute('value', value);
        if (selected) {
            node.setAttribute('selected', 'selected')
        }
        return new epic.html.selector(node)
    };
    create.script = function(code) {
        var script = document.createElement("script");
        var property = ('innerText' in script) ? 'innerText' : 'textContent';
        script.setAttribute("type", "text/javascript");
        setTimeout(function() {
            document.getElementsByTagName('head')[0].insertBefore(script, null);
            script[property] = code
        }, 10);
        return new epic.html.selector(script)
    };
    create.style = function(css) {
        var style = document.createElement("style");
        style.setAttribute("type", "text/css");
        if (style.styleSheet) {
            style.styleSheet.cssText = css
        }
        else {
            style.insertBefore(document.createTextNode(css), null)
        }
        document.getElementsByTagName('head')[0].insertBefore(style, null);
        return new epic.html.selector(style)
    };
    html.select = function(query) {
        if (query instanceof query) {
            return query
        }
        return new query(query)
    };
    html.selector = selector;
    html.create = create;
    epic.html = html
})(epic, window, document);
(function(epic, window, document) {
    var REGISTRY = {};
    var REGISTRY_POLICE = {};
    var HANDLERS = {};
    var next_uid = epic.uid.next;
    var set_event_handler = document.addEventListener ? add_event_listener : attach_event;
    function event(){}
    function add(element, event_name, method, parameters) {
        if (typeof event_name != "string") {
            return epic.fail("[event_name] must be a valid event name.")
        }
        var element_uid = element.uid || (element.uid = next_uid());
        var element_events = REGISTRY[element_uid] || (REGISTRY[element_uid] = {});
        var method_uid = method.uid || (method.uid = next_uid());
        var police_key = element_uid + "_" + event_name + "_" + method_uid;
        if (REGISTRY_POLICE[police_key]) {
            return false
        }
        var handler = {
                method: method, parameters: parameters || {}
            };
        (element_events[event_name] || (element_events[event_name] = [])).push(handler);
        set_event_handler(element, event_name, element_uid);
        REGISTRY_POLICE[police_key] = true;
        return true
    }
    function remove(element, event_name, handler, data){}
    function trigger(element, event_name, handler, data){}
    function add_event_listener(element, event_name, element_uid) {
        var element_event = element_uid + "_" + event_name;
        if (!HANDLERS[element_event]) {
            HANDLERS[element_event] = true;
            element.addEventListener(event_name, epic_event_handler, false)
        }
    }
    function attach_event(element, event_name, element_uid) {
        var element_event = element_uid + "_" + event_name;
        if (!HANDLERS[element_event]) {
            HANDLERS[element_event] = true;
            element.attachEvent('on' + event_name, epic_event_handler)
        }
    }
    function epic_event_handler(e) {
        var evt = new epic_event(e);
        var element = evt.target;
        var events = REGISTRY[element.uid];
        var handlers;
        var handler;
        var len;
        var index = 0;
        if (events) {
            handlers = events[evt.type];
            len = handlers.length;
            while (len--) {
                handler = handlers[index++];
                handler.method.call(element, evt, handler.parameters)
            }
        }
        return this
    }
    function epic_event(e) {
        var target = (e.target || e.srcElement) || document;
        var which = e.which;
        var charcode = e.charCode;
        var keycode = e.keyCode;
        var event_name = e.type;
        var delta = 0;
        var page_x;
        var page_y;
        var key_map = {
                8: 'BACKSPACE', 9: 'TAB', 10: 'ENTER', 13: 'ENTER', 20: 'CAPSLOCK', 27: 'ESC', 33: 'PAGEUP', 34: 'PAGEDOWN', 35: 'END', 36: 'HOME', 37: 'LEFT', 38: 'UP', 39: 'RIGHT', 40: 'DOWN', 45: 'INSERT', 46: 'DELETE'
            };
        var capslock = false;
        var key_code = which ? which : keycode;
        var key_value = '';
        var meta_key;
        if (event_name == 'DOMMouseScroll') {
            event_name = 'mousewheel'
        }
        if (e.altKey) {
            meta_key = 'ALT'
        }
        else if (e.ctrlKey || e.metaKey) {
            meta_key = 'CTRL'
        }
        else if (e.shiftKey || charcode == 16) {
            meta_key = 'SHIFT'
        }
        else if (key_code == 20) {
            meta_key = 'CAPSLOCK'
        }
        if (which === undefined && charcode === undefined) {
            key_code = keycode
        }
        else {
            key_code = which != 0 && charcode != 0 ? which : keycode
        }
        key_value = key_code > 31 ? String.fromCharCode(key_code) : '';
        if (key_code > 96 && key_code < 123 && meta_key == 'SHIFT' || key_code > 64 && key_code < 91 && meta_key != 'SHIFT') {
            capslock = true
        }
        if (event_name == 'keydown' || event_name == 'keyup') {
            if (key_value == 'CAPSLOCK') {
                capslock = !capslock
            }
            if (key_code > 64 && key_code < 91 && meta_key != 'SHIFT') {
                key_code = key_code + 32;
                key_value = String.fromCharCode(key_code)
            }
        }
        if (key_map[key_code]) {
            key_value = key_map[key_code]
        }
        if (event_name == 'mousewheel') {
            delta = e.detail ? e.detail * -1 : e.wheelDelta / 40;
            ;
            delta = delta > 0 ? 1 : -1
        }
        if (e.pageX == null && e.clientX != null) {
            var document_element = document.documentElement;
            var body = document.body;
            page_x = e.clientX + (document_element && document_element.scrollLeft || body && body.scrollLeft || 0) - (document_element && document_element.clientLeft || body && body.clientLeft || 0);
            page_y = e.clientY + (document_element && document_element.scrollTop || body && body.scrollTop || 0) - (document_element && document_element.clientTop || body && body.clientTop || 0)
        }
        this.target = target.nodeType === 3 ? target.parentNode : target;
        ;
        this.from_element = (e.fromElement || e.originalTarget);
        this.to_element = e.toElement || target;
        this.type = event_name;
        this.page_x = page_x;
        this.page_y = page_y;
        this.key_code = key_code;
        this.key_value = key_value;
        this.metaKey = meta_key;
        this.delta = delta;
        this.capslock = capslock;
        this.button = e.button;
        this.relatedTarget = e.relatedTarget || event_name == 'mouseover' ? e.fromElement : event_name == 'mouseout' ? e.toElement : null
    }
    epic_event.prototype = {
        preventDefault: function() {
            this.original.preventDefault()
        }, stopPropagation: function() {
                var original_event = this.original;
                original_event.cancelBubble = true;
                original_event.stopPropagation();
                original_event.preventDefault();
                return false
            }
    };
    event.add = add;
    event.remove = remove;
    event.trigger = trigger;
    event.registry = REGISTRY;
    epic.event = event
})(epic, window, document);