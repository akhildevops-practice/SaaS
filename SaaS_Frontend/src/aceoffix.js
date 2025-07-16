/*! v6.1.0.1 | aceoffix.js | (c) 2017, 2021 Aceoffix Information Technology Inc. All rights reserved.*/
function ace_uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [],
        i;
    radix = radix || chars.length;
    if (len) {
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
    } else {
        var r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r]
            }
        }
    }
    return uuid.join('')
}

function ace_core_md5(x, len) {
    x[len >> 5] |= 0x80 << ((len) % 32);
    x[(((len + 64) >>> 9) << 4) + 14] = len;
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    for (var i = 0; i < x.length; i += 16) {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;
        a = ace_md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
        d = ace_md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
        c = ace_md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
        b = ace_md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
        a = ace_md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
        d = ace_md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
        c = ace_md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
        b = ace_md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
        a = ace_md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
        d = ace_md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
        c = ace_md5_ff(c, d, a, b, x[i + 10], 17, -42063);
        b = ace_md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = ace_md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
        d = ace_md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
        c = ace_md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
        b = ace_md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
        a = ace_md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
        d = ace_md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
        c = ace_md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
        b = ace_md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
        a = ace_md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
        d = ace_md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
        c = ace_md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
        b = ace_md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = ace_md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
        d = ace_md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
        c = ace_md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
        b = ace_md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
        a = ace_md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
        d = ace_md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
        c = ace_md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
        b = ace_md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
        a = ace_md5_hh(a, b, c, d, x[i + 5], 4, -378558);
        d = ace_md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
        c = ace_md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
        b = ace_md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = ace_md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
        d = ace_md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
        c = ace_md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
        b = ace_md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
        a = ace_md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
        d = ace_md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
        c = ace_md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
        b = ace_md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
        a = ace_md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
        d = ace_md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
        c = ace_md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
        b = ace_md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
        a = ace_md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
        d = ace_md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
        c = ace_md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
        b = ace_md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
        a = ace_md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
        d = ace_md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
        c = ace_md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
        b = ace_md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
        a = ace_md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
        d = ace_md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
        c = ace_md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
        b = ace_md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = ace_md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
        d = ace_md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
        c = ace_md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
        b = ace_md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
        a = ace_safe_add(a, olda);
        b = ace_safe_add(b, oldb);
        c = ace_safe_add(c, oldc);
        d = ace_safe_add(d, oldd)
    }
    return Array(a, b, c, d)
}

function ace_md5_cmn(q, a, b, x, s, t) {
    return ace_safe_add(ace_bit_rol(ace_safe_add(ace_safe_add(a, q), ace_safe_add(x, t)), s), b)
}

function ace_md5_ff(a, b, c, d, x, s, t) {
    return ace_md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
}

function ace_md5_gg(a, b, c, d, x, s, t) {
    return ace_md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
}

function ace_md5_hh(a, b, c, d, x, s, t) {
    return ace_md5_cmn(b ^ c ^ d, a, b, x, s, t)
}

function ace_md5_ii(a, b, c, d, x, s, t) {
    return ace_md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
}

function ace_safe_add(x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF)
}

function ace_bit_rol(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt))
}

function ace_str2binl(str) {
    var bin = Array();
    var mask = (1 << 8) - 1;
    for (var i = 0; i < str.length * 8; i += 8) bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32);
    return bin
}

function ace_binl2hex(binarray) {
    var hex_tab = "0123456789ABCDEF";
    var str = "";
    for (var i = 0; i < binarray.length * 4; i++) {
        str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) + hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF)
    }
    return str
}
if (!window.JSON) {
    window.JSON = {
        parse: function(sJSON) {
            return eval('(' + sJSON + ')')
        },
        stringify: (function() {
            var toString = Object.prototype.toString;
            var isArray = Array.isArray || function(a) {
                return toString.call(a) === '[object Array]'
            };
            var escMap = {
                '"': '\\"',
                '\\': '\\\\',
                '\b': '\\b',
                '\f': '\\f',
                '\n': '\\n',
                '\r': '\\r',
                '\t': '\\t'
            };
            var escFunc = function(m) {
                return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1)
            };
            var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
            return function stringify(value) {
                if (value == null) {
                    return 'null'
                } else if (typeof value === 'number') {
                    return isFinite(value) ? value.toString() : 'null'
                } else if (typeof value === 'boolean') {
                    return value.toString()
                } else if (typeof value === 'object') {
                    if (typeof value.toJSON === 'function') {
                        return stringify(value.toJSON())
                    } else if (isArray(value)) {
                        var res = '[';
                        for (var i = 0; i < value.length; i++) res += (i ? ', ' : '') + stringify(value[i]);
                        return res + ']'
                    } else if (toString.call(value) === '[object Object]') {
                        var tmp = [];
                        for (var k in value) {
                            if (value.hasOwnProperty(k)) tmp.push(stringify(k) + ': ' + stringify(value[k]))
                        }
                        return '{' + tmp.join(', ') + '}'
                    }
                }
                return '"' + value.toString().replace(escRE, escFunc) + '"'
            }
        })()
    }
}

function ace_hex_md5(s) {
    return ace_binl2hex(ace_core_md5(ace_str2binl(s), s.length * 8))
}
var bABIsInstalled = false;
var ACEParent = ace_hex_md5(window.location.pathname);
var ACEModalToken = "";
var ACE_code = "\150\164\164\160\72\57\57\61\62\67\56\60\56\60\56\61\72\65\61\60\61\60\57";
var ACE_code2 = "\150\164\164\160\163\72\57\57\61\62\67\56\60\56\60\56\61\72\65\61\60\61\61\57";
var ACE_datas;
var aceModalDlg;
var acelframe02;
var AceBrowser = {
    withCredentials: false,
    headerToken: "",
    isChromeAndGreaterThan42: function() {
        var e = "42";
        return this.getChromeVersion() >= e ? !0 : !1
    },
    getChromeVersion: function() {
        var e, t = navigator.userAgent.toLowerCase(),
            n = /chrome/,
            o = /safari\/\d{3}\.\d{2}$/,
            i = /chrome\/(\S+)/;
        return n.test(t) && o.test(t) && i.test(t) ? e = RegExp.$1 : 0
    },
    isChrome: function() {
        var e = navigator.userAgent.toLowerCase(),
            t = /chrome/;
        return t.test(e) ? !0 : !1
    },
    isEdge: function() {
        var e = navigator.userAgent.toLowerCase(),
            t = /edge/;
        return t.test(e) ? !0 : !1
    },
    isOldIE: function() {
        var e = navigator.userAgent.toLowerCase();
        return /msie/.test(e)
    },
    getBrowserVer: function() {
        var e = navigator.userAgent.toLowerCase();
        return (e.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1]
    },
    isXDR: function() {
        if (AceBrowser.isOldIE() && ((parseInt(AceBrowser.getBrowserVer(), 10) == 8) || (parseInt(AceBrowser.getBrowserVer(), 10) == 9)) && window.XDomainRequest) return true;
        else return false
    },
    checkAceBrowserSate: function() {},
    strToHexCharCode: function(str) {
        if (str === "") return "";
        var hexCharCode = [];
        for (var i = 0; i < str.length; i++) {
            hexCharCode.push((str.charCodeAt(i)).toString(16))
        }
        return hexCharCode.join("").toUpperCase()
    },
    checkSSL: function() {
        var strhref = window.location.href;
        strhref = strhref.toLowerCase();
        if (strhref.substr(0, 8) == "https://") {
            ACE_code = ACE_code2
        }
        return true
    },
    getRootPath: function() {
        var pathName = "";
        var ace_js_main = document.getElementById('ace_js_main');
        if (ace_js_main != null) {
            pathName = document.getElementById('ace_js_main').src
        } else {
            var aScript = document.getElementsByTagName("script");
            for (var i = 0; i < aScript.length; i++) {
                if (aScript[i].src.indexOf("aceoffix.js") > -1) {
                    pathName = aScript[i].src
                }
            }
        }
        var index = pathName.indexOf("/aceoffix.js");
        return pathName.substr(0, index)
    },
    getAceXmlHttp127: function() {
        var xhr = null;
        if (AceBrowser.isXDR()) {
            xhr = new XDomainRequest()
        } else {
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest()
            } else {
                xhr = new ActiveXObject("Microsoft.XMLHTTP")
            }
        }
        return xhr
    },
    showInstallDlg: function() {
        if (confirm("You need to install Aceoffix on your computer. Install it right now or cancel?\r\nAfter installation, please refresh the current page or re-access this website. ")) {
            window.location.href = this.getRootPath() + "/pluginsetup.exe"
        }
    },
    openWindow: function(strURL, strOptions, strArgument) {
        if ((strURL == null) || (strURL == "")) {
            alert("The parameter strURL of openWindow() cannot be null or empty.");
            return
        }
        if (strURL.charAt(0) != '/') {
            var strLower = strURL.toLowerCase();
            if ((strLower.substr(0, 7) == "http://") || (strLower.substr(0, 8) == "https://")) {} else {
                var pathName = window.location.href;
                if (pathName.indexOf("?") > 0) pathName = pathName.substr(0, pathName.indexOf("?"));
                var index = pathName.lastIndexOf("/");
                strURL = pathName.substr(0, index + 1) + strURL
            }
        } else {
            var pathName = window.location.href;
            var index = pathName.indexOf(window.location.pathname);
            strURL = pathName.substr(0, index) + strURL
        } if ((strOptions != null) && (strOptions[strOptions.length - 1] != ';')) strOptions = strOptions + ";";

        ace_ajax2({
            url: "json.htm",
            success: function (data) {
                if (data.indexOf('"name":"jsonx"') > 0) {
                    var strtemp = data.split(':');
                    strtemp = strtemp[1].split(',');
                    if (parseInt(strtemp[0]) < 6) {
                        AceBrowser.showInstallDlg();
                        return
                    }
                    bABIsInstalled = true;
                    ace_ajax({
                        url: AceBrowser.getRootPath() + "/server.ace",
                        type: "POST",
                        withCred: AceBrowser.withCredentials,
                        headerTok: AceBrowser.headerToken,
                        data: {
                            Info: "AceoffixLink",
                            pageurl: strURL,
                            options: strOptions + "IsModal=true;",
                            params: strArgument
                        },
                        success: function (data) {
                            ACE_datas = data.split("\r\n");
                            var strToken = ace_hex_md5(AceBrowser.strToHexCharCode(ACE_datas[0] + ACEParent));
                            ACEModalToken = strToken;
                            if (aceModalDlg != undefined) aceModalDlg.showacebDlg();
                            ace_ajax2({
                                url: "checkopened.htm",
                                data: {
                                    token: strToken,
                                    open: encodeURIComponent(ACE_datas[0] + ACEParent + "|" + strToken + "|"),
                                    parent: ACEParent,
                                    Info: ACE_datas[1] + "headerToken=" + AceBrowser.headerToken + ";"
                                },
                                success: function (data) {
                                    //if (data == "false") { }
                                    //	setTimeout("AceBrowser.callback2()", 300)
                                }
                            })
                        }
                    })
                }
            },
            error: function (e) {
                AceBrowser.showInstallDlg();
            }
        })
    },
    openWindowModeless: function(strURL, strOptions, strArgument) {
        if ((strURL == null) || (strURL == "")) {
            alert("The parameter strURL of openWindowModeless() cannot be null or empty.");
            return
        }
        if (strURL.charAt(0) != '/') {
            var strLower = strURL.toLowerCase();
            if ((strLower.substr(0, 7) == "http://") || (strLower.substr(0, 8) == "https://")) {} else {
                var pathName = window.location.href;
                if (pathName.indexOf("?") > 0) pathName = pathName.substr(0, pathName.indexOf("?"));
                var index = pathName.lastIndexOf("/");
                strURL = pathName.substr(0, index + 1) + strURL
            }
        } else {
            var pathName = window.location.href;
            var index = pathName.indexOf(window.location.pathname);
            strURL = pathName.substr(0, index) + strURL
        } if ((strOptions != null) && (strOptions[strOptions.length - 1] != ';')) strOptions = strOptions + ";";

        ace_ajax2({
            url: "json.htm",
            success: function (data) {
                if (data.indexOf('"name":"jsonx"') > 0) {
                    var strtemp = data.split(':');
                    strtemp = strtemp[1].split(',');
                    if (parseInt(strtemp[0]) < 6) {
                        AceBrowser.showInstallDlg();
                        return
                    }
                    bABIsInstalled = true;
                    ace_ajax({
                        url: AceBrowser.getRootPath() + "/server.ace",
                        type: "POST",
                        withCred: AceBrowser.withCredentials,
                        headerTok: AceBrowser.headerToken,
                        data: {
                            Info: "AceoffixLink",
                            pageurl: strURL,
                            options: strOptions + "IsModal=false;",
                            params: strArgument
                        },
                        success: function (data) {
                            ACE_datas = data.split("\r\n");
                            var strToken = ace_hex_md5(AceBrowser.strToHexCharCode(ACE_datas[0] + ACEParent));
                            ace_ajax2({
                                url: "checkopened.htm",
                                data: {
                                    token: strToken,
                                    open: encodeURIComponent(ACE_datas[0] + ACEParent + "|" + strToken + "|"),
                                    parent: ACEParent,
                                    Info: ACE_datas[1] + "headerToken=" + AceBrowser.headerToken + ";"
                                },
                                success: function (data) {
                                    //if (data == "false") { }
                                    //	setTimeout("AceBrowser.callback2()", 300)
                                }
                            })
                        }
                    })
                }
            },
            error: function (e) {
                AceBrowser.showInstallDlg();
            }
        })
        return
    },
    sendUserdata: function() {
        var acexmlhttp2 = AceBrowser.getAceXmlHttp127();
        acexmlhttp2.onload = function() {};
        acexmlhttp2.open("POST", ACE_code + "userdata.htm?x=" + ace_uuid(8, 16));
        acexmlhttp2.send("parent=" + ACEParent + "&Info=" + ACE_datas[1])
    },
    getArgument: function() {
        try {
            return window.external.UserParams
        } catch (e) {
            alert(e.message + ' Please ensure that you call it in AceBrowser.')
        }
    },
    closeWindow: function() {
        try {
            return window.external.Close()
        } catch (e) {
            alert(e.message + ' Please ensure that you call it in AceBrowser.')
        }
    },
    callback2: function() {
        var strRet = "error=unexpected.";
        var acexmlhttp = AceBrowser.getAceXmlHttp127();
        acexmlhttp.onload = function() {
            strRet = acexmlhttp.responseText;
            if ((strRet != "null") && (strRet != "abort")) {
                var parsedData = JSON.parse(strRet);
                if (parsedData[0].name == 'jQuery().hideacebDlg()') {
                    if (aceModalDlg == undefined) {
                        setTimeout("AceBrowser.callback2()", 300);
                        return
                    }
                    parsedData[0].name = 'aceModalDlg.hideacebDlg()'
                }
                var acexmlhttp2 = AceBrowser.getAceXmlHttp127();
                acexmlhttp2.onload = function() {
                    var vRet;
                    try {
                        vRet = eval(parsedData[0].name)
                    } catch (e) {
                        alert(e.message)
                    }
                    if (typeof(vRet) != "string") {
                        vRet = "undefined"
                    }
                    var acexmlhttp3 = AceBrowser.getAceXmlHttp127();
                    acexmlhttp3.onload = function() {};
                    acexmlhttp3.open("POST", ACE_code + "funcret.htm?x=" + ace_uuid(8, 16));
                    acexmlhttp3.send("id=" + parsedData[0].id + "&ret=" + vRet)
                };
                acexmlhttp2.open("POST", ACE_code + "funcret0.htm?x=" + ace_uuid(8, 16));
                acexmlhttp2.send("id=" + parsedData[0].id)
            }
            if (strRet != "abort") setTimeout("AceBrowser.callback2()", 300)
        };
        acexmlhttp.ontimeout = function(e) {
            setTimeout("AceBrowser.callback2()", 300)
        };
        acexmlhttp.open("POST", ACE_code + "func2.htm?x=" + ace_uuid(8, 16));
        acexmlhttp.send("parent=" + ACEParent)
    },
    addCssByLink: function (url) {
        var doc = document;
        var link = doc.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", url);

        var heads = doc.getElementsByTagName("head");
        if (heads.length)
            heads[0].appendChild(link);
        else
            doc.documentElement.appendChild(link);
    },
    includeJS: function (path) {
        var a = document.createElement("script");
        a.type = "text/javascript";
        a.src = path;
        var head = document.getElementsByTagName("head")[0];
        head.appendChild(a);
    },
    resumeAceb: function () {
        ace_ajax2({
            url: "resume.htm",
            data: {
                parent: ACEModalToken
            },
            success: function (data) {
            }
        })
    }
};

function obj2str(data) {
    data = data || {};
    var res = [];
    for (var key in data) {
        res.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    }
    return res.join("&")
}

function obj2str2(data) {
    data = data || {};
    var res = [];
    for (var key in data) {
        res.push(key + "=" + data[key])
    }
    return res.join("&")
}

function ace_ajax(option) {
    var params = obj2str(option.data);
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest()
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
    } if (option.type.toUpperCase() === "GET") {
        xmlhttp.open("GET", option.url + "?" + params);
        xmlhttp.withCredentials = option.withCred;
        xmlhttp.send()
    } else {
        xmlhttp.open("POST", option.url);
        xmlhttp.withCredentials = option.withCred;
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        var iPos = option.headerTok.indexOf(":");
        if (iPos > 0)
            xmlhttp.setRequestHeader(option.headerTok.substr(0, iPos), option.headerTok.substr(iPos + 1));
        xmlhttp.send(params)
    }
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status >= 200 && xmlhttp.status < 300 || xmlhttp.status === 304) {
                option.success(xmlhttp.responseText, "success")
            } else {
                option.error(xmlhttp, null, null)
            }
        }
    }
}
AceBrowser.addCssByLink(AceBrowser.getRootPath() + "/acebstyle.css");
AceBrowser.checkSSL();
var aceEvent = {};
aceEvent.addEvents = function(eventType, handle) {
    if (window.attachEvent) {
        aceEvent.addEvents = function(eventType, handle) {
            window.attachEvent('on' + eventType, function() {
                handle.call(window, arguments)
            })
        }
    } else {
        aceEvent.addEvents = function(eventType, handle) {
            window.addEventListener(eventType, handle, false)
        }
    }
    aceEvent.addEvents("load", handle)
};
function ace_initialize() {
    if (document.body != null) {
        acelframe02 = document.createElement('iframe');
        acelframe02.src = ACE_code + "parent.htm";
        acelframe02.style.display = 'none';
        acelframe02.id = "aceiframe1";
        acelframe02.name = "aceiframe1";
        document.body.appendChild(acelframe02);
        window.aceModalDlg = {
            dialogAceb: null,
            init: function() {
                this.dialogAceb = document.createElement('div');
                this.dialogAceb.className = "acebmodal-overlay";
                this.dialogAceb.style.display = "none";
                this.dialogAceb.innerHTML = "<div id=\"acebmodal-dialog\"><h2>Tip</h2>You have opened a document with Aceoffix on this page, please click <a style='color:red;' href=\"javascript:AceBrowser.resumeAceb();\" > here </a> to switch to the Aceoffix window. <div class=\"button-holder\"></br></br><a class=\"button blue\" href=\"javascript:AceBrowser.resumeAceb();\" > Switch to Aceoffix window now</a></div></div>";
                document.getElementsByTagName("body")[0].appendChild(this.dialogAceb)
            },
            showacebDlg: function() {
                this.dialogAceb.style.display = "block"
            },
            hideacebDlg: function() {
                this.dialogAceb.style.display = "none"
            }
        }
        aceModalDlg.init()
    }
}
ace_initialize();
aceEvent.addEvents("load", function () {
    if (acelframe02 == undefined) {
        ace_initialize();
    }
});
window._postMessage = function (_method, _params, _callback) {
    var messageBody = {
        method: _method,
        params: _params,
    }
    if (_callback != undefined) {
        var proxyMethod = "proxy" + parseInt(Math.random() * 1000);
        messageBody.returnMethod = proxyMethod;
        window[proxyMethod] = function (_p) {
            try {
                _callback(_p);
            } finally {
                delete window[proxyMethod];
            }
        }
    }
    acelframe02.contentWindow.postMessage(messageBody, '*');
}
window.addEventListener("message", function (event) {
    var data = event.data;
    if (null == data || data.method == undefined) {
        return;
    }
    if (data.returnMethod != undefined) {
        var vRet;
        try {
            vRet = eval(data.method)
        } catch (e) {
            alert(e.message)
        }
        if (typeof(vRet) != "string") {
            vRet = "undefined"
        }
        window._postMessage(data.returnMethod, vRet);
    } else {
        try {
            return window[data.method](data.params);
        } catch (e) {
            console.warn(e);
        }
    }
});
function ace_ajax2(option) {
    var params = obj2str2(option.data);
    window._postMessage(option.url, params, function (data) {
        clearTimeout(ace_timer1);
        option.success(data);
    });
    ace_timer1 = setTimeout(function() {
        option.error && option.error({
            message: 'timeout'
        });
    }, 1000);
}

