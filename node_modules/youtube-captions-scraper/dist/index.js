'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSubtitles = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

let getSubtitles = exports.getSubtitles = (() => {
  var _ref = _asyncToGenerator(function* ({
    videoID,
    lang = 'en'
  }) {
    var _ref2 = yield _axios2.default.get(`https://youtube.com/watch?v=${videoID}`);

    const data = _ref2.data;

    // * ensure we have access to captions data

    if (!data.includes('captionTracks')) throw new Error(`Could not find captions for video: ${videoID}`);

    const regex = /({"captionTracks":.*isTranslatable":(true|false)}])/;

    var _regex$exec = regex.exec(data),
        _regex$exec2 = _slicedToArray(_regex$exec, 1);

    const match = _regex$exec2[0];

    var _JSON$parse = JSON.parse(`${match}}`);

    const captionTracks = _JSON$parse.captionTracks;


    const subtitle = (0, _lodash.find)(captionTracks, {
      vssId: `.${lang}`
    }) || (0, _lodash.find)(captionTracks, {
      vssId: `a.${lang}`
    }) || (0, _lodash.find)(captionTracks, function ({ vssId }) {
      return vssId && vssId.match(`.${lang}`);
    });

    // * ensure we have found the correct subtitle lang
    if (!subtitle || subtitle && !subtitle.baseUrl) throw new Error(`Could not find ${lang} captions for ${videoID}`);

    var _ref3 = yield _axios2.default.get(subtitle.baseUrl);

    const transcript = _ref3.data;

    const lines = transcript.replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '').replace('</transcript>', '').split('</text>').filter(function (line) {
      return line && line.trim();
    }).map(function (line) {
      const startRegex = /start="([\d.]+)"/;
      const durRegex = /dur="([\d.]+)"/;

      var _startRegex$exec = startRegex.exec(line),
          _startRegex$exec2 = _slicedToArray(_startRegex$exec, 2);

      const start = _startRegex$exec2[1];

      var _durRegex$exec = durRegex.exec(line),
          _durRegex$exec2 = _slicedToArray(_durRegex$exec, 2);

      const dur = _durRegex$exec2[1];


      const htmlText = line.replace(/<text.+>/, '').replace(/&amp;/gi, '&').replace(/<\/?[^>]+(>|$)/g, '');

      const decodedText = _he2.default.decode(htmlText);
      const text = (0, _striptags2.default)(decodedText);

      return {
        start,
        dur,
        text
      };
    });

    return lines;
  });

  return function getSubtitles(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _he = require('he');

var _he2 = _interopRequireDefault(_he);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _lodash = require('lodash');

var _striptags = require('striptags');

var _striptags2 = _interopRequireDefault(_striptags);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }