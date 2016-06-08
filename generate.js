
// blog - My personal blog
// Written in 2016 by Jesper Oskarsson jesosk@gmail.com
//
// To the extent possible under law, the author(s) have dedicated all copyright
// and related and neighboring rights to this software to the public domain worldwide.
// This software is distributed without any warranty.
//
// You should have received a copy of the CC0 Public Domain Dedication along with this software.
// If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

var markdown = require('./markdown/renderer');
var path = require('path');
var fs = require('fs');
var dir = require('node-dir');
var shell = require('shelljs');

var sourcePath = path.join(__dirname, 'posts');
var destinationPath = path.join(__dirname, 'generated');
var postDestinationPath = path.join(destinationPath, 'posts');

shell.mkdir('-p', destinationPath);
shell.mkdir('-p', postDestinationPath);

var renderFile = function (path) {
    var source = fs.readFileSync(path).toString();
    var html = markdown.render(source);
    return {
        path: path,
        html: html
    };
};

dir.files(sourcePath, function (error, files) {
    if (error) {
        throw error;
    }

    var renderedFiles = files.map(renderFile);

    renderedFiles.forEach(function (file) {
        var postId = path.basename(file.path, '.md');
        var destination = path.join(postDestinationPath, postId + '.json');

        fs.writeFileSync(destination, JSON.stringify({
            postId: postId,
            html: file.html
        }));
    });
});
