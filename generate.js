
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
var moment = require('moment');
var lodash = require('lodash');

var templatePath = path.join(__dirname, 'templates');
var indexTemplate = lodash.template(fs.readFileSync(path.join(templatePath, 'index.html')));
var postSectionTemplate = lodash.template(fs.readFileSync(path.join(templatePath, 'post-section.html')));
var postTemplate = lodash.template(fs.readFileSync(path.join(templatePath, 'post.html')));

var sourcePath = path.join(__dirname, 'posts');
var destinationPath = path.join(__dirname, 'public');
var postDestinationPath = path.join(destinationPath, 'posts');

shell.mkdir('-p', destinationPath);
shell.mkdir('-p', postDestinationPath);

var parseMetadata = function (path, json) {
    var meta = JSON.parse(json);

    if (meta.title === undefined) {
        throw new Error('title not found in ' + path);
    }

    var date = moment(meta.date, "DD-MM-YYYY");
    meta.moment = date;
    meta.date = date.format();
    meta.readableDate = date.format('dddd, MMMM Do YYYY');

    return meta;
};

var readMetadata = function (path, source) {
    var regex = /<!--\s*meta-data:\s*(.*)\s*-->/g;
    var match = regex.exec(source);
    if (match) {
        var json = match[1];
        return parseMetadata(path, json);
    } else {
        throw new Error("No meta-data entry found in " + path);
    }
};

var removeComments = function (source) {
    return source.replace(/<!--[^]*?-->/g, '');
};

var postIdFromPath = function (filePath) {
    return path.basename(filePath, '.md');
};

var renderFile = function (path) {
    var source = fs.readFileSync(path).toString();
    var meta = readMetadata(path, source);
    source = removeComments(source);
    var markdownHtml = markdown.render(source);
    return {
        postId: postIdFromPath(path),
        path: path,
        html: markdownHtml,
        meta: meta
    };
};

dir.files(sourcePath, function (error, files) {
    if (error) {
        throw error;
    }

    var dataMaps = files.map(renderFile);
    var renderedPosts = dataMaps.map(postSectionTemplate);
    var renderedPostPages = dataMaps.map(postTemplate);

    var publishedPosts = renderedPosts.filter((post, index) => {
        return dataMaps[index].meta.moment.isBefore();
    });
    var indexPage = indexTemplate({
        html: publishedPosts.join('\n')
    });

    var postIds = dataMaps.map((file) => postIdFromPath(file.path));
    var destinationPaths = postIds.map((id) => path.join(postDestinationPath, id + '.html'));

    renderedPostPages.forEach(function (renderedPage, index) {
        fs.writeFileSync(destinationPaths[index], renderedPage);
    });
    fs.writeFileSync(path.join(destinationPath, 'index.html'), indexPage);
});
