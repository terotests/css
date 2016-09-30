
    // later, a class for generic timing functions
    var later_prototype = function later_prototype() {
      // Then create the traits and subclasses for this class here...

      (function (_myTrait_) {
        var _initDone;
        var _callers;
        var _oneTimers;
        var _everies;
        var _framers;
        var _localCnt;
        var _easings;
        var _easeFns;

        // Initialize static variables here...

        /**
         * @param float t
         */
        _myTrait_._easeFns = function (t) {
          _easings = {
            easeIn: function easeIn(t) {
              return t * t;
            },
            easeOut: function easeOut(t) {
              return -1 * t * (t - 2);
            },
            easeInOut: function easeInOut(t) {
              if (t < 0.5) return t * t;
              return -1 * t * (t - 2);
            },
            easeInCubic: function easeInCubic(t) {
              return t * t * t;
            },
            easeOutCubic: function easeOutCubic(t) {
              return (1 - t) * (1 - t) * (1 - t) + 1;
            },
            pow: function pow(t) {
              return Math.pow(t, parseFloat(1.5 - t));
            },
            linear: function linear(t) {
              return t;
            }
          };
        };

        /**
         * @param function fn
         * @param float thisObj
         * @param float args
         */
        _myTrait_.add = function (fn, thisObj, args) {
          if (thisObj || args) {
            var tArgs;
            if (Object.prototype.toString.call(args) === "[object Array]") {
              tArgs = args;
            } else {
              tArgs = Array.prototype.slice.call(arguments, 2);
              if (!tArgs) tArgs = [];
            }
            _callers.push([thisObj, fn, tArgs]);
          } else {
            _callers.push(fn);
          }
        };

        /**
         * @param float name
         * @param float fn
         */
        _myTrait_.addEasingFn = function (name, fn) {
          _easings[name] = fn;
        };

        /**
         * @param float seconds
         * @param float fn
         * @param float name
         */
        _myTrait_.after = function (seconds, fn, name) {

          if (!name) {
            name = "aft_" + _localCnt++;
          }

          _everies[name] = {
            step: Math.floor(seconds * 1000),
            fn: fn,
            nextTime: 0,
            remove: true
          };
        };

        /**
         * @param function fn
         */
        _myTrait_.asap = function (fn) {
          this.add(fn);
        };

        /**
         * @param String name  - Name of the easing to use
         * @param int delay  - Delay of the transformation in ms
         * @param function callback  - Callback to set the values
         * @param function over  - When animation is over
         */
        _myTrait_.ease = function (name, delay, callback, over) {

          var fn = _easings[name];
          if (!fn) fn = _easings.pow;
          var id_name = "e_" + _localCnt++;
          _easeFns[id_name] = {
            easeFn: fn,
            duration: delay,
            cb: callback,
            over: over
          };
        };

        /**
         * @param float seconds
         * @param float fn
         * @param float name
         */
        _myTrait_.every = function (seconds, fn, name) {

          if (!name) {
            name = "t7491_" + _localCnt++;
          }

          _everies[name] = {
            step: Math.floor(seconds * 1000),
            fn: fn,
            nextTime: 0
          };
        };

        if (_myTrait_.__traitInit && !_myTrait_.hasOwnProperty("__traitInit")) _myTrait_.__traitInit = _myTrait_.__traitInit.slice();
        if (!_myTrait_.__traitInit) _myTrait_.__traitInit = [];
        _myTrait_.__traitInit.push(function (interval, fn) {
          if (!_initDone) {
            this._easeFns();
            _localCnt = 1;

            var frame, cancelFrame;
            if (typeof window != "undefined") {
              var frame = window["requestAnimationFrame"],
                  cancelFrame = window["cancelRequestAnimationFrame"];
              ["", "ms", "moz", "webkit", "o"].forEach(function (x) {
                if (!frame) {
                  frame = window[x + "RequestAnimationFrame"];
                  cancelFrame = window[x + "CancelAnimationFrame"] || window[x + "CancelRequestAnimationFrame"];
                }
              });
            }

            var is_node_js = new Function("try { return this == global; } catch(e) { return false; }")();

            if (is_node_js) {
              frame = function (cb) {
                return setImmediate(cb); // (cb,1);
              };
            } else {
              if (!frame) {
                frame = function (cb) {
                  return setTimeout(cb, 16);
                };
              }
            }

            if (!cancelFrame) cancelFrame = function (id) {
              clearTimeout(id);
            };

            _callers = [];
            _oneTimers = {};
            _everies = {};
            _framers = [];
            _easeFns = {};
            var lastMs = 0;

            var _callQueQue = function _callQueQue() {
              var ms = new Date().getTime(),
                  elapsed = lastMs - ms;

              if (lastMs == 0) elapsed = 0;
              var fn;
              while (fn = _callers.shift()) {
                if (Object.prototype.toString.call(fn) === "[object Array]") {
                  fn[1].apply(fn[0], fn[2]);
                } else {
                  fn();
                }
              }

              for (var i = 0; i < _framers.length; i++) {
                var fFn = _framers[i];
                fFn();
              }
              /*
              _easeFns.push({
              easeFn : fn,
              duration : delay,
              cb : callback
              });
               */
              for (var n in _easeFns) {
                if (_easeFns.hasOwnProperty(n)) {
                  var v = _easeFns[n];
                  if (!v.start) v.start = ms;
                  var delta = ms - v.start,
                      dt = delta / v.duration;
                  if (dt >= 1) {
                    dt = 1;
                    delete _easeFns[n];
                  }
                  v.cb(v.easeFn(dt));
                  if (dt == 1 && v.over) v.over();
                }
              }

              for (var n in _oneTimers) {
                if (_oneTimers.hasOwnProperty(n)) {
                  var v = _oneTimers[n];
                  v[0](v[1]);
                  delete _oneTimers[n];
                }
              }

              for (var n in _everies) {
                if (_everies.hasOwnProperty(n)) {
                  var v = _everies[n];
                  if (v.nextTime < ms) {
                    if (v.remove) {
                      if (v.nextTime > 0) {
                        v.fn();
                        delete _everies[n];
                      } else {
                        v.nextTime = ms + v.step;
                      }
                    } else {
                      v.fn();
                      v.nextTime = ms + v.step;
                    }
                  }
                  if (v.until) {
                    if (v.until < ms) {
                      delete _everies[n];
                    }
                  }
                }
              }

              frame(_callQueQue);
              lastMs = ms;
            };
            _callQueQue();
            _initDone = true;
          }
        });

        /**
         * @param  key
         * @param float fn
         * @param float value
         */
        _myTrait_.once = function (key, fn, value) {
          // _oneTimers

          _oneTimers[key] = [fn, value];
        };

        /**
         * @param function fn
         */
        _myTrait_.onFrame = function (fn) {

          _framers.push(fn);
        };

        /**
         * @param float fn
         */
        _myTrait_.removeFrameFn = function (fn) {

          var i = _framers.indexOf(fn);
          if (i >= 0) {
            if (fn._onRemove) {
              fn._onRemove();
            }
            _framers.splice(i, 1);
            return true;
          } else {
            return false;
          }
        };
      })(this);
    };

    var later = function later(a, b, c, d, e, f, g, h) {
      var m = this,
          res;
      if (m instanceof later) {
        var args = [a, b, c, d, e, f, g, h];
        if (m.__factoryClass) {
          m.__factoryClass.forEach(function (initF) {
            res = initF.apply(m, args);
          });
          if (typeof res == "function") {
            if (res._classInfo.name != later._classInfo.name) return new res(a, b, c, d, e, f, g, h);
          } else {
            if (res) return res;
          }
        }
        if (m.__traitInit) {
          m.__traitInit.forEach(function (initF) {
            initF.apply(m, args);
          });
        } else {
          if (typeof m.init == "function") m.init.apply(m, args);
        }
      } else return new later(a, b, c, d, e, f, g, h);
    };
    // inheritance is here

    later._classInfo = {
      name: "later"
    };
    later.prototype = new later_prototype();

    (function () {
      if (typeof define !== "undefined" && define !== null && define.amd != null) {
        __amdDefs__["later"] = later;
        this.later = later;
      } else if (typeof module !== "undefined" && module !== null && module.exports != null) {
        module.exports["later"] = later;
      } else {
        this.later = later;
      }
    }).call(new Function("return this")());


   // The class definition is here...
    var css_prototype = function css_prototype() {
      // Then create the traits and subclasses for this class here...

      // trait comes here...

      (function (_myTrait_) {

        // Initialize static variables here...

        /**
         * @param float t
         */
        _myTrait_.guid = function (t) {

          return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        };

        /**
         * @param float t
         */
        _myTrait_.isArray = function (t) {
          return Object.prototype.toString.call(t) === "[object Array]";
        };

        /**
         * @param float fn
         */
        _myTrait_.isFunction = function (fn) {
          return Object.prototype.toString.call(fn) == "[object Function]";
        };

        /**
         * @param float t
         */
        _myTrait_.isObject = function (t) {
          return t === Object(t);
        };
      })(this);

      (function (_myTrait_) {
        var head;
        var styleTag;
        var bexp;
        var bexp2;
        var _conversions;
        var _instances;
        var _insInit;
        var _someDirty;
        var _virtualTags;
        var _virtualSize;
        var _IE9Limits;
        var _IE9Tag;

        // Initialize static variables here...

        /**
         * @param Object objectList
         */
        _myTrait_._assign = function (objectList) {
          var o = {},
              args;
          if (this.isArray(objectList)) {
            args = objectList;
          } else {
            args = Array.prototype.slice.call(arguments);
          }
          args.forEach(function (rules) {
            for (var n in rules) {
              if (rules.hasOwnProperty(n)) {
                var value = rules[n];
                if (value === null || value === false) {
                  delete o[n];
                } else {
                  o[n] = rules[n];
                }
              }
            }
          });
          return o;
        };

        if (!_myTrait_.hasOwnProperty("__factoryClass")) _myTrait_.__factoryClass = [];
        _myTrait_.__factoryClass.push(function (id, mediaRule) {

          if (!id) id = "_global_";

          if (mediaRule) id += "/" + mediaRule;

          if (!_instances) {
            _instances = {};
            _instances[id] = this;
          } else {
            if (_instances[id]) return _instances[id];
            _instances[id] = this;
          }
        });

        /**
         * @param float animName
         * @param float settings
         */
        _myTrait_.animation = function (animName, settings) {

          var args = Array.prototype.slice.call(arguments),
              animName = args.shift(),
              settings = args.shift(),
              animKeyName = animName + "-keyframes",
              parts = args,
              t = 0,
              me = this,
              animStr = "",
              postFix = this._cssScope || "";

          args.forEach(function (cssRuleObj) {
            if (me.isObject(cssRuleObj)) {
              var pros;
              if (typeof cssRuleObj.time != "undefined") {
                pros = parseInt(100 * parseFloat(cssRuleObj.time));
              } else {
                pros = parseInt(t * 100);
              }
              if (pros < 0) pros = 0;
              if (pros > 100) pros = 100;
              animStr += pros + "% " + me.ruleToCss(cssRuleObj) + " \n";
              t = 1;
            } else {
              t = cssRuleObj;
            }
          });
          var fullStr = "";
          var exp = ["", "-o-", "-moz-", "-webkit-"];
          exp.forEach(function (r) {
            fullStr += "@" + r + "keyframes " + animKeyName + postFix + " { " + animStr + " } \n";
          });
          this._animations[animKeyName + postFix] = fullStr;

          var animDef = {};
          if (this.isObject(settings)) {
            var so = this.animSettings(settings);
            so["animation-name"] = animKeyName + postFix;
            this.bind("." + animName, so);
          } else {
            this.bind("." + animName, {
              animation: animKeyName + postFix + " " + settings
            });
          }
        };

        /**
         * @param float obj
         */
        _myTrait_.animSettings = function (obj) {

          if (this.isObject(obj)) {
            var res = {};
            for (var n in obj) {
              if (obj.hasOwnProperty(n)) {
                if (n == "duration" || n == "iteration-count") {
                  res["animation-" + n] = obj[n];
                } else {
                  res[n] = obj[n];
                }
              }
            }
            return res;
          } else {
            return {};
          }
        };

        /**
         * @param String cssRule  - The rule to modify
         */
        _myTrait_.assign = function (cssRule) {
          // my rulesets...
          var args = Array.prototype.slice.call(arguments);
          var rule = args[0];

          if (!this._data[rule]) this._data[rule] = [];

          var i = 1;
          var max = 3; // maximum number, until we just merge rest to the last...

          while (args[i]) {
            if (this._data[rule].length >= max) {
              var new_obj = args[i];
              var rule_obj = this._data[rule][this._data[rule].length - 1];
              for (var n in new_obj) {
                if (new_obj.hasOwnProperty(n)) {
                  rule_obj[n] = new_obj[n];
                }
              }
              i++;
              continue;
            }
            this._data[rule].push(args[i]);
            i++;
          }
          this._dirty = true;
          _someDirty = true;
          return this;
        };

        /**
         * @param String className
         * @param Object obj  - one or more objects to combine
         */
        _myTrait_.bind = function (className, obj) {
          // my rulesets...
          var args = Array.prototype.slice.call(arguments),
              rule = args.shift();

          this._data[rule] = args;
          this._dirty = true;
          _someDirty = true;

          return this;
        };

        /**
         * @param float mediaRule
         */
        _myTrait_.buildCss = function (mediaRule) {

          if (this._data) {
            if (!mediaRule) mediaRule = this._mediaRule;
            var o = {};
            for (var rule in this._data) {
              if (this._data.hasOwnProperty(rule)) {
                var ruleData = this._data[rule];
                if (this._composedData[rule]) {
                  ruleData = [this._composedData[rule]].concat(ruleData);
                }
                o[rule] = this._assign(ruleData);
              }
            }
            this._composedData = o;
            this.updateStyleTag(this.makeCss(o, mediaRule));
          }
        };

        /**
         * @param float t
         */
        _myTrait_.collectAnimationCss = function (t) {

          var anims = this._animations,
              str = "";

          for (var n in anims) {
            if (anims.hasOwnProperty(n)) str += anims[n];
          }
          return str;
        };

        /**
         * @param float n
         * @param float v
         */
        _myTrait_.convert = function (n, v) {
          var str = "",
              gPos;

          if (v && v.indexOf && (gPos = v.indexOf("-gradient")) >= 0) {

            var start = gPos - 1,
                end = gPos + 8,
                bError = false;
            var legals = "lineardg-wbktmozp"; // repeating
            while (legals.indexOf(v.charAt(start)) >= 0) {
              start--;
              if (start <= 0) {
                start = 0;
                break;
              }
            }

            var pCnt = 1;

            while (v.charAt(end++) != "(");

            while (pCnt > 0) {
              if (v.charAt(end) == "(") pCnt++;
              if (v.charAt(end) == ")") pCnt--;
              end++;
              if (v.length < end) {
                bError = true;
                break;
              }
            }
            if (!bError) {
              var gradString = v.substring(start, end),
                  s = v.substring(0, start),
                  e = v.substring(end);
              var str = "";
              ["-webkit-", "", "-moz-", "-o-"].forEach(function (p) {
                str += n + " : " + s + " " + p + gradString + e + ";\n";
              });
            }
          }

          if (_conversions[n]) {
            str = _conversions[n](n, v);
          } else {
            str += n + " : " + v + ";\n";
          }
          return str;
        };

        /**
         * @param float mediaRule
         */
        _myTrait_.forMedia = function (mediaRule) {

          var mediaObj = css(this._cssScope, mediaRule);

          if (!this._mediaHash) this._mediaHash = {};
          if (!this._mediaHash[mediaRule]) this._mediaHash[mediaRule] = mediaObj;

          return mediaObj;
        };

        /**
         * @param function fn
         */
        _myTrait_.forRules = function (fn) {
          // TODO: consider how the if media rules need to be given using this function
          for (var n in this._data) {
            if (this._data.hasOwnProperty(n)) {
              fn.apply(this, [n, this._assign(this._data[n])]);
            }
          }
        };

        if (_myTrait_.__traitInit && !_myTrait_.hasOwnProperty("__traitInit")) _myTrait_.__traitInit = _myTrait_.__traitInit.slice();
        if (!_myTrait_.__traitInit) _myTrait_.__traitInit = [];
        _myTrait_.__traitInit.push(function (cssScope, mediaRule) {
          // my rulesets...
          this._data = this._data || {};
          this._animations = {};
          this._composedData = this._composedData || {};

          this._mediaRule = mediaRule;

          // this used to be cssPostFix;
          this._cssScope = cssScope || "";
          // this._postFix = cssPostFix || "";

          if (!head) {
            _virtualTags = [];
            var me = this;
            later().every(1 / 10, function () {
              if (!_someDirty) return;
              _someDirty = false;

              for (var id in _instances) {
                if (_instances.hasOwnProperty(id)) {
                  var ins = _instances[id];
                  if (ins._dirty) {
                    ins.buildCss();
                    ins._dirty = false;
                    if (ins._firstUpdate) {
                      ins._firstUpdate();
                      delete ins._firstUpdate;
                    }
                  }
                }
              }
              if (_IE9Limits && _IE9Tag) {
                _IE9Tag.styleSheet.cssText = _virtualTags.join(" ");
              };
            });
          }
          if (!_insInit) _insInit = {};
          var id = cssScope || "_global_";
          if (mediaRule) id += "/" + mediaRule;
          if (!_insInit[id]) {
            _insInit[id] = true;
            this.initConversions();
          }
        });

        /**
         * @param float t
         */
        _myTrait_.initConversions = function (t) {

          // -- moving this to virtual tags for IE9 ----
          // _virtualTags

          if (!_virtualSize) _virtualSize = 0;

          if (!window.atob && document.all) {
            _IE9Limits = true;
          }

          this._virtualTagId = _virtualSize++;
          _virtualTags[this._virtualTagId] = ""; // make it string to support array join

          bexp = function (p, v) {
            var str = "";
            str += "-o-" + p + ":" + v + ";\n";
            str += "-moz-" + p + ":" + v + ";\n";
            str += "-webkit-" + p + ":" + v + ";\n";
            str += p + ":" + v + ";\n";
            return str;
          };

          bexp2 = function (p, v) {
            var str = "";
            str += "-o-" + p + ":" + "-o-" + v + ";\n";
            str += "-moz-" + p + ":" + "-moz-" + v + ";\n";
            str += "-webkit-" + p + ":" + "-webkit-" + v + ";\n";
            str += p + ":" + v + ";\n";
            return str;
          };

          _conversions = {
            "border-radius": function borderRadius(n, v) {
              return bexp(n, v);
            },
            "box-shadow": function boxShadow(n, v) {
              return bexp(n, v);
            },
            "rotate": function rotate(n, v) {
              n = "transform";
              v = "rotate(" + parseInt(v) + "deg)";
              return bexp(n, v);
            },
            "transition": function transition(n, v) {
              return bexp2(n, v);
            },
            "filter": function filter(n, v) {
              return bexp(n, v);
            },
            "animation": function animation(n, v) {
              return bexp(n, v);
            },
            "animation-iteration-count": function animationIterationCount(n, v) {
              return bexp(n, v);
            },
            "animation-fill-mode": function animationFillMode(n, v) {
              return bexp(n, v);
            },
            "transition-timing-function": function transitionTimingFunction(n, v) {
              return bexp(n, v);
            },
            "animation-name": function animationName(n, v) {
              return bexp(n, v);
            },
            "animation-timing-function": function animationTimingFunction(n, v) {
              return bexp(n, v);
            },
            "animation-duration": function animationDuration(n, v) {
              return bexp(n, v);
            },
            "transform": function transform(n, v) {
              return bexp(n, v);
            },
            "transform-style": function transformStyle(n, v) {
              return bexp(n, v);
            },
            "transform-origin": function transformOrigin(n, v) {
              return bexp(n, v);
            },
            "perspective": function perspective(n, v) {
              return bexp(n, v);
            },
            "text-shadow": function textShadow(n, v) {
              return bexp(n, v);
            },
            "opacity": function opacity(n, v) {
              v = parseFloat(v);
              var str = "-ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=" + parseInt(v * 100) + ")\";";
              str += "filter: alpha(opacity=" + parseInt(v * 100) + ");";
              str += bexp(n, v);
              return str;
            }
          };
        };

        /**
         * @param float o
         * @param float mediaRule
         */
        _myTrait_.makeCss = function (o, mediaRule) {
          var str = mediaRule ? mediaRule + "{" : "";

          for (var rule in o) {
            if (o.hasOwnProperty(rule)) {
              var cssRules = o[rule];
              if (this._cssScope) {
                var cssString = this.ruleToCss(cssRules);
                str += "." + this._cssScope + " " + rule + cssString + " ";
                str += rule + "." + this._cssScope + " " + cssString;
              } else {
                str += rule + this.ruleToCss(cssRules);
              }
            }
          }

          // add the animation css also into this mediarule...
          str += this.collectAnimationCss();

          str += mediaRule ? "}\n" : "";
          return str;
        };

        /**
         * @param String mediaRule
         */
        _myTrait_.mediaFork = function (mediaRule) {

          return css(this._cssScope, mediaRule);
        };

        /**
         * @param float cssRulesObj
         */
        _myTrait_.ruleToCss = function (cssRulesObj) {
          var str = "{";
          for (var n in cssRulesObj) {
            if (n == "time") continue;
            str += this.convert(n, cssRulesObj[n]);
          }
          str += "}\n";
          return str;
        };

        /**
         * @param float cssText
         */
        _myTrait_.updateStyleTag = function (cssText) {

          try {
            if (_IE9Limits) {
              // if the styletag does not exist create it for IE9
              if (!_IE9Tag) {
                head = document.getElementsByTagName("head")[0];
                var styleTag = document.createElement("style");
                styleTag.setAttribute("type", "text/css");
                styleTag.styleSheet.cssText = "";
                _IE9Tag = styleTag;
                head.appendChild(styleTag);
              }
              // for IE9 build CSS into virtual tags first
              _virtualTags[this._virtualTagId] = cssText;
            } else {

              var styleTag;

              if (!this._styleTag) {
                head = document.getElementsByTagName("head")[0];
                var styleTag = document.createElement("style");
                styleTag.setAttribute("type", "text/css");
                if (styleTag.styleSheet) {
                  // IE
                  styleTag.styleSheet.cssText = "";
                } else {
                  // the world
                  styleTag.appendChild(document.createTextNode(""));
                }
                head.appendChild(styleTag);
                this._styleTag = styleTag;
              }

              styleTag = this._styleTag;
              var old = styleTag.firstChild;
              styleTag.appendChild(document.createTextNode(cssText));
              if (typeof old != "undefined") {
                styleTag.removeChild(old);
              }
            }
          } catch (e) {
            if (console && console.log) console.log(e.message, cssText);
          }
        };
      })(this);
    };

    var css = function css(a, b, c, d, e, f, g, h) {
      var m = this,
          res;
      if (m instanceof css) {
        var args = [a, b, c, d, e, f, g, h];
        if (m.__factoryClass) {
          m.__factoryClass.forEach(function (initF) {
            res = initF.apply(m, args);
          });
          if (typeof res == "function") {
            if (res._classInfo.name != css._classInfo.name) return new res(a, b, c, d, e, f, g, h);
          } else {
            if (res) return res;
          }
        }
        if (m.__traitInit) {
          m.__traitInit.forEach(function (initF) {
            initF.apply(m, args);
          });
        } else {
          if (typeof m.init == "function") m.init.apply(m, args);
        }
      } else return new css(a, b, c, d, e, f, g, h);
    };
    // inheritance is here

    css._classInfo = {
      name: "css"
    };
    css.prototype = new css_prototype();

    (function () {
      if (typeof define !== "undefined" && define !== null && define.amd != null) {
        __amdDefs__["css"] = css;
        this.css = css;
      } else if (typeof module !== "undefined" && module !== null && module.exports != null) {
        module.exports["css"] = css;
      } else {
        this.css = css;
      }
    }).call(new Function("return this")());
