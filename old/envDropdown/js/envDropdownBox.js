(function($) {
    var dftOptions = {
        boxMaxHeight : 'auto',
        boxMaxWidth : 'auto',
        effectSpeed : 300,
        change : null
    };

    var classNames = {
        wrapper: "edb-wrapper",
        cntr: "edb-cntr",
        input: "edb-input",
        icon: "edb-icon",
        box: "edb-box"
    };

    var templates = {
        wrapper: ["<div class='" + classNames.wrapper + "'>",
            "<div class='" + classNames.cntr + "'>",
            "<input readonly class='" + classNames.input + "'/>",
            "<span class='" + classNames.icon + "'></span>",
            "<div class='" + classNames.box + "'></div>",
            "</div>",
            "</div>"].join(" ")
    };

    function EnvDropdownBox(element, options) {
        if (element == null) {
            return;
        }

        var opt = $.extend(true, {}, dftOptions, options);
        this.getOptions = function() {
            return opt;
        };

        var $select = $(element);
        var $domObj = $(templates.wrapper).addClass($select.attr('class'));
        $domObj.find("." + classNames.box).hide();
        $domObj.insertAfter($select).append($select);
        $select.hide();
        this._$doms = {
            wrapper: $domObj,
            cntr: $domObj.find("." + classNames.cntr),
            input: $domObj.find("." + classNames.input),
            icon: $domObj.find("." + classNames.icon),
            box: $domObj.find("." + classNames.box),
            select: $select
        };

        // Set box max-height
        parseInt(opt.boxMaxHeight, 10) && this._$doms.box.css("max-height", parseInt(options.boxMaxHeight, 10) + "px");

        // Set box min-width and max-width
        this._setBoxWidth();

        var _this = this;
        this._$doms.cntr.on("click", function() {
            _this._showBox();
        });
    }

    EnvDropdownBox.prototype = {
        constructor: EnvDropdownBox,

        _setBoxWidth: function () {
            var minWidth = this._$doms.cntr.outerWidth() - (this._$doms.box.outerWidth() - this._$doms.box.innerWidth());
            var boxMaxWidth = parseInt(this.getOptions().boxMaxWidth);

            this._$doms.box.css("min-width", minWidth + "px");

            if (!isNaN(boxMaxWidth)) {
                boxMaxWidth = boxMaxWidth > minWidth ? boxMaxWidth : minWidth;
                this._$doms.box.css("max-width", boxMaxWidth + "px");
            }

        },

        _showBox: function () {
            var _this = this;
            if (this._$doms.cntr.hasClass("active")) {
                return;
            }
            this._$doms.cntr.unbind("click").addClass("active");
            this._setBoxWidth();
            $("html").bind("mousedown", function(event) {
                _this._closeBox(event);
            });

            this._$doms.box.slideDown(this.getOptions().effectSpeed);
        },

        _closeBox: function (event) {
            var _this = this;
            if (event != null &&
                (event.target == this._$doms.box[0] || this._$doms.box.find($(event.target)).length > 0)) {
                return;
            }

            $("html").unbind("mousedown", arguments.callee.callee);

            this._$doms.box.slideUp(this.getOptions().effectSpeed, function() {
                _this._$doms.cntr.removeClass("active").on("click", function() {
                    _this._showBox();
                });

                _this.triggerChange();
            });

        },

        append: function($item) {
            this._$doms.box.append($item);
        },

        closeBox: function() {
            this._closeBox();
        },

        setText: function(text) {
            this._$doms.input.val(text).attr("title", text);
        },

        setDisabled: function(b) {
            var _this = this;
            if (b == true) {
                this._$doms.cntr.addClass("disabled").unbind("click");
            } else {
                this._$doms.cntr.removeClass("disabled").on("click", function() {
                    _this._showBox();
                });
            }
        },

        triggerChange: function() {
            var change = this.getOptions().change;
            if (change != null && typeof change == "function") {
                change(this);
            }
        },

        destory: function() {
            this._$doms.select.insertAfter(this._$doms.wrapper).show();
            this._$doms.wrapper.remove();
            for (var i in this) {
                this[i] = null;
            }
        }
    };


    $.fn.envDropdownBox = function(arg) {
        if (this.length == 0) {
            return this;
        } else if (EnvDropdownBox.prototype[arg] != null) {
            var func = EnvDropdownBox.prototype[arg];
            var ins = $(this[0]).data("envDropdownBox");
            if (ins != null) {
                if (typeof func == "function") {
                    return func.apply(ins, Array.prototype.slice.call(arguments, 1));
                } else {
                    return ins[arg];
                }
            }
        } else if (arg == "getInstance") {
            return $(this[0]).data("envDropdownBox");
        } else {
            return this.each(function() {
                var instance = $(this).data("envDropdownBox");
                if (instance == null) {
                    instance = new EnvDropdownBox(this, arg);
                    $.data(this, "envDropdownBox", instance);
                }
            });
        }
    };

})(jQuery);