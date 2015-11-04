;(function($) {
    var dftOptions = {
        size: null,
        enableAnimation: true,
        animationStep: 1.33
    };

    var classNames = {
        wrapper: "ecf-wrapper",
        border: "ecf-border",
        cntr: "ecf-cntr",
        up: "ecf-up",
        down: "ecf-down",
        text: "efc-text"
    };

    var templates = ['<div class="' + classNames.border+ '">',
                    '<div class="' + classNames.cntr+ '">',
                    '<div class="' + classNames.up+ '"></div>',
                    '<div class="' + classNames.down+ '"></div>',
                    '<div class="' + classNames.text+ '"></div>',
                    '</div>',
                    '</div>'].join("");


    //========= constructor ==============
    function EnvCircleFill(element, options) {
        // do nothing if element is null or element is not a HTMLElement
        if (element == null || ! (element instanceof HTMLElement)) {
            return;
        }

        var _this = this,
            $element = $(element)
        ;

        //extend options
        options = $.extend(true, {}, dftOptions, options);

        this.options = options;
        this.$element = $element;
        this.curValue = -1;

        $element.addClass(classNames.wrapper).append(templates);
        this.setValue(0);
    }

    //========= public methods ==============
    EnvCircleFill.prototype = {
        constructor: EnvCircleFill,

        setValue: function(value) {
            value = parseFloat(value);
            if (isNaN(value)) {
                return;
            }

            var _this = this;
            var enableAnimation = this.options.enableAnimation;
            if (enableAnimation) {
                this.timer != null && clearInterval(this.timer);  //if the timer is not null, stop it
                this.timer = setInterval(function() {
                    if (_this.curValue == value) {
                        clearInterval(_this.timer);
                        return;
                    } else if (_this.curValue < value) {
                        _this.curValue += _this.options.animationStep || 1;
                        _this.curValue > value && (_this.curValue = value);
                    } else {
                        _this.curValue -= _this.options.animationStep || 1;
                        _this.curValue < value && (_this.curValue = value);
                    }

                    var v = _this.curValue;
                    v > 100 && (v = 100);
                    v < 0 && (v = 0);
                    _this.$element.find("." + classNames.up).height((100 - v) + "%");
                    _this.$element.find("." + classNames.text).text(_this.curValue.toFixed(2) + "%");
                }, 10);
            } else {
                _this.curValue = value;
                var v = _this.curValue;
                v > 100 && (v = 100);
                v < 0 && (v = 0);
                _this.$element.find("." + classNames.up).height((100 - v) + "%");
                _this.$element.find("." + classNames.text).text(_this.curValue.toFixed(2) + "%");
            }
        },

        setColor: function(color) {
            this.$element.find("." + classNames.down).css("background-color", color);
            this.$element.find("." + classNames.border).css("border-color", color);
        }
    };


    //========= jQuery widget ==============
    $.fn.envCircleFill = function(arg) {
        if (this.length == 0) {
            return this;
        } else if (arg == null) {
            return $(this[0]).data("envCircleFill");
        } else if (EnvCircleFill.prototype[arg] != null) {
            var func = EnvCircleFill.prototype[arg];
            var ins = $(this[0]).data("envCircleFill");
            if (ins != null) {
                if (typeof func == "function") {
                    return func.apply(ins, Array.prototype.slice.call(arguments, 1));
                } else {
                    return ins[arg];
                }
            }
        } else {
            return this.each(function() {
                var instance = $(this).data("envCircleFill");
                if (instance == null) {
                    instance = new EnvCircleFill(this, arg);
                    $.data(this, "envCircleFill", instance);
                }
            });
        }
    };
    //========= jQuery widget end==============

})(jQuery);
