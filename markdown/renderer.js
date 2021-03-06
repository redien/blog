// blog - My personal blog
// Written in 2016 by Jesper Oskarsson jesosk@gmail.com
//
// To the extent possible under law, the author(s) have dedicated all copyright
// and related and neighboring rights to this software to the public domain worldwide.
// This software is distributed without any warranty.
//
// You should have received a copy of the CC0 Public Domain Dedication along with this software.
// If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

var highlight = require('highlight.js');

var md = require('markdown-it')({
    highlight: function (str, language) {
        if (language && highlight.getLanguage(language)) {
            try {
                return highlight.highlight(language, str).value;
            } catch (error) {}
        }

        return '';
    },
    html: true
});

module.exports.render = function (markdown) {
    return md.render(markdown);
};
