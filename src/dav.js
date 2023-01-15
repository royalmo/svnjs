Dav.prototype = {

    PROPPATCH : function (path, props, ok, err) {
        var self = this;
        var props = self._getProppatchXML(props.set, props.del);
        self.request({
            type: 'PROPPATCH',
            path: path,
            headers: {
                'Content-type': 'text/xml;charset=utf-8'
            },
            content: [
                '<?xml version="1.0" encoding="utf-8" ?>',
                '<D:propertyupdate xmlns:D="DAV:"',
                ' xmlns:V="http://subversion.tigris.org/xmlns/dav/"',
                ' xmlns:C="http://subversion.tigris.org/xmlns/custom/"', 
                ' xmlns:S="http://subversion.tigris.org/xmlns/svn/">',
                props,
                '</D:propertyupdate>'
            ].join(''),
            handler: function (stat, statstr, cont) {
                if (stat == '207') {
                    self.log('PROPPATCH success');
                    ok && ok(stat, statstr, cont);
                } else {
                    self.log('PROPPATCH fail', 1);
                    self.log(stat + ' ' + statstr, 1);
                    self.log('PROPPATCH INFO END', 1);
                    self.rmact();
                    err && err();
                }
            }
        });
    },

    PUT : function (file, content, ok, err) {
        var self = this;
        var path = self.cko.indexOf(file) != -1 ? self.cko :
                 self.cko + '/' + file;
        self.request({
            type: 'PUT',
            path: path,
            headers: {
                'Content-type': 'text/plain'
            },
            content: content,
            handler: function (stat, statstr, cont) {
                if (stat >= 200 && stat < 300) {
                    self.log('PUT ' + path + ' success');
                    ok && ok(stat, stat, statstr, cont);
                } else {
                    self.log('PUT ' + path + ' fail', 1);
                    self.log(stat + ' ' + statstr, 1);
                    self.log('PUT INFO END', 1);
                    self.rmact();
                    err && err();
                }
            }
        });
    },

    DELETE : function (file, ok, err) {
        var self = this;
        var path = typeof file == 'string' ? self.cko + '/' + file :
                                             file.join('');
        self.request({
            type: 'DELETE',
            path: path,
            handler: function (stat, statstr, cont) {
                if (stat >= 200 && stat < 300) {
                    self.log('DELETE ' + path + ' done');
                    ok && ok(stat, statstr, cont);
                } else {
                    self.log('DELETE ' + path + ' fail', 1);
                    self.log(stat + ' ' + statstr, 1);
                    self.log('DELETE INFO END', 1);
                    err && err();
                }
            }
        });
    },

    MOVE : function (path, topath, handler) {
        var self = this;
        self.request({
            type: 'MOVE',
            path: path,
            headers: {
                'Destination': topath,
                'Overwrite': 'F'
            },
            handler: function (stat, statstr, cont) {
                
            }
        });
    },

    COPY : function (path, topath, ok) {
        var self = this;
        self.request({
            type: 'COPY',
            path: path,
            headers: {
                'Destination': topath,
                'Overwrite': 'F'
            },
            handler: function (stat, statstr, cont) {
                if (stat >= 200 && stat < 300) {
                    self.log('COPY ' + path + ' done!');
                    ok && ok(stat, statstr, cont);
                } else {
                    self.log('COPY ' + path + ' fail', 1);
                    self.log(stat + ' ' + statstr, 1);
                    self.rmact();
                }
            }
        });
    },

    MKCOL : function (path, ok, err) {
        var self = this;
        self.request({
            type: 'MKCOL',
            path: path,
            handler: function (stat, statstr, cont) {
                if (stat >= 200 && stat < 300) {
                    self.log('MKCOL ' + path + ' done!');
                    ok && ok(stat, statstr, cont);
                } else {
                    self.log('MKCOL ' + path + ' fail.', 1);
                    self.rmact();
                    err && err();
                }
            }
        });
    },

    LOCK : function () {
        var self = this;
        self.request({
            type: 'LOCK',
            path: path,
            headers: {

            },
            handler: function (stat, statstr, cont) {

            }
        });
    },

    UNLOCK : function () {
        var self = this;
        self.request({
            type: 'UNLOCK',
            headers: {

            },
            handler: function (stat, statstr, cont) {

            }
        });
    },

    MERGE : function (ok, err) {
        var self = this;
        self.request({
            type: 'MERGE',
            path: self.act + self.uniqueKey,
            headers: {
                'X-SVN-Options': 'release-locks',
                'Content-type': 'text/xml;charset=utf-8'
            },
            content: [
                '<?xml version="1.0" encoding="utf-8"?>',
                '<D:merge xmlns:D="DAV:"><D:source>',
                '<D:href>', self.act, self.uniqueKey, '</D:href>',
                '</D:source><D:no-auto-merge/><D:no-checkout/>',
                '<D:prop><D:checked-in/><D:version-name/>',
                '<D:resourcetype/><D:creationdate/>',
                '<D:creator-displayname/></D:prop></D:merge>'
            ].join(''),
            handler: function (stat, statstr, cont) {
                if (stat == '200') {
                    self.log('MERGE done');
                    self.rmact(ok);
                } else {
                    self.log('MERGE fail',  1);
                    self.log(stat + ' ' + statstr, 1);
                    self.log('##### MERGE INFO END', 1);
                    err && err(stat, statstr, cont);
                    self.rmact();
                }
            }
        });
    },

    rmact : function (callback) {
        var self = this;
        self.DELETE([self.act, self.uniqueKey],
                    function (stat, statstr, cont) {
            callback && callback(stat, statstr, cont);
        });
    }
    
};
