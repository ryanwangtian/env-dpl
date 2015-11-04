(function($) {
    var dftOptions = {
        color: {
            info: "rgba(144,195,31,.7)",
            warn: "rgba(200,200,0,.7)",
            error: "rgba(255,0,0,.7)"
        }
    };

    function _show(msg) {
        var _this = this;

        this.$text.text(msg);
        $(window).unbind("click", _this.hide);
        this.$cntr.show().animate({
            "top": "0"
        }, "normal", function() {
            $(window).bind("click", _this.hide);
        });
    }

    function PopupMessage(options) {
        var _this = this,
            $cntr = $("<div></div>"),
            $text = $("<span></span>");

        options = $.extend({}, dftOptions, options);

        $cntr.css({
            "display": "none",
            "position": "fixed",
            "top": "-30px",
            "left": "0",
            "width": "100%",
            "height": "30px",
            "line-height": "30px",
            "text-align": "center",
            "z-index": "99999"
        });
        $text.css({
            "display": "inline-block",
            "height":  "100%",
            "margin": "auto",
            "padding": "0 10px",
            "border-radius": "5px",
            "color": "#fff",
            "box-shadow": "0px 0px 10px rgba(0, 0, 0, 0.7) "
        });

        $("body").append($cntr.append($text));

        this.options = options;
        this.$cntr = $cntr;
        this.$text = $text;
        this.hide = function() {
            _this.$cntr.animate({
                "top": "-30px"
            }, "normal", function() {
                _this.$cntr.hide();
            });

            $(window).unbind("click", _this.hide);
        };
    }

    PopupMessage.prototype = {
        constructor: PopupMessage,

        info: function(msg) {
            this.$text.css("background", this.options.color.info);
            _show.call(this, msg);
        },

        warn: function(msg) {
            this.$text.css("background", this.options.color.warn);
            _show.call(this, msg);
        },

        error: function(msg) {
            this.$text.css("background", this.options.color.error);
            _show.call(this, msg);
        }
    };

    $.PopupMessage = PopupMessage;
})(jQuery)