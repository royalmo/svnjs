/*
 * Copyright (C) 2023 Eric Roy
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see http://www.gnu.org/licenses/.
*/

if (typeof svnjs === "undefined")
    svnjs = {};

(function () {
    // Inner function. Opts is an object that must contain:
    // - auth : string, svn auth
    // - base : string, svn path
    // - msg : string, commit message
    // - background_ajax : bool, wether ajax is performed in a background script
    // - handlers : list, commit tasks
    // - success : func()
    // - error : func()
    // - progress : func(msg : string, percent : int)
    var auth, base, msg, handlers, success, error, progress, current_task, background_ajax;

    svnjs._commit = function (opts) {
        auth = 'Basic ' + opts.auth;
        base = opts.base;
        msg = opts.msg;
        handlers = opts.handlers;
        success = opts.success;
        error = opts.error;
        progress = opts.progress;
        background_ajax = opts.background_ajax;
        current_task = 0;

        OPTIONS
        PROPFIND
        MKACTIVITY
        CHECKOUT
        PROPPATCH


        MERGE
    };

})()

///////////////////////////////////////////////////////////////


commit: function (message, ok, err) {
    var self = this;
    var dav = self.dav;
    self.message = message;
    self.ok = ok;
    self.err = err;
    dav.log('================================================');
    dav.OPTIONS(function () {
        dav.PROPFIND(dav.base, function (stat) {
            if (stat == '207')
                self._mkAct();
            else
                self.err && self.err();
        });
    }, () => {
        console.error("SVNJS: Wrong repository ID or credentials (401 Unauthorized).");
        self.err && self.err();
    });
},
_mkAct: function () {
    var self = this;
    var dav = self.dav;
    dav.MKACTIVITY(function () {
        dav.CHECKOUT(dav.vcc, function () {
            self._patchLog();
        }, function () {
            self.err && self.err();
        });
    }, function () {
        self.err && self.err();
    });
},
_patchLog: function () {
    var self = this;
    var dav = self.dav;
    var message = self.message;
    dav.PROPPATCH(dav.cko, {
        set: {
            log: message
        }
    }, function () {
        self._process();
    }, function () {
        self.err && self.err();
    });
},
_process: function () {
    var self = this;
    var dav = self.dav;
    var handler = self.handlers.shift();
    var method = handler.method;
    var params = handler.params;
    params.push(function () {
        if (self.handlers.length)
            self._process();
        else
            self._merge();
    }, function () {
        self.err && self.err();
    });
    var url = self._getCheckoutUrl(method, params[0]);
    dav.CHECKOUT(url, function () {
        if (method == 'COPY')
            return self._prepareCopy(params);
        if (method == 'PROPPATCH')
            params[0] = dav.cko;
        else if (method == 'MKCOL')
            params[0] = dav.cko + '/' + params[0];
        dav[method].apply(dav, params);
    }, function () {
        self.err && self.err();
    });
},
_prepareCopy: function (params) {
    var self = this;
    var dav = self.dav;
    var path = params[1];
    var success = params[2];
    dav.PROPFIND(path, function () {
        dav.PROPFIND(dav.vcc, function (stat, statstr, cont) {
            var rbc = /:baseline-collection><D:href>([^<]+)<\/D/;
            var rbr = /:baseline-ralative-path>([^<]+)<\//;
            var topath = params[0];
            topath = dav.cko + '/' + (topath == './' ? '' : topath);
            path = cont.match(rbc)[1] +
                   cont.match(rbr)[1] + '/' + path;
            dav.COPY(path, topath, success);
        }//, ['<D:prop><D:baseline-collection xmlns="DAV:"/>',
          //  '<D:version-name xmlns="DAV:"/></D:prop>'
          // ].join('')
        );
    });
},
_getCheckoutUrl: function (method, path) {
    var dav = this.dav;
    var url = dav.cki;
    if (path == './' && method == 'COPY')
        return dav.cki;
    var pos = path.indexOf('/');
    if (method == 'PROPPATCH' || pos > -1)
        url += '/' + path;
    return url;
},
_merge: function () {
    var self = this;
    var dav = self.dav;
    dav.MERGE(function () {
        dav.log('ALL DONE!');
        dav.log('================================================');
        self.ok && self.ok();
    }, function () {
        self.err && self.err();
    });
}



