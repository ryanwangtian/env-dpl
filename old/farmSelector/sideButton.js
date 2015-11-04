;(function($) {
	//========= private fields ==============
	var dftOptions = {
		height: 'auto',
		width: 400,
		top: 50,
		animateDuration: 300,
		onShown: function() {},
		onHidden: function() {},
		beforeShow: function() {},
		beforeHide: function() {}
	};

	var classNames = {
		cntr: "sb-cntr",
		button: "sb-btn",
		box: "sb-box"
	};

	var templates = {
		button: "<div class='" + classNames.button + "'></div>",
		box: "<div class='" + classNames.box + "'></div>"
	};

	//========= private fields end ==============

	//========= private methods ==============
	function _triggerOnShown() {
		if (this.options.onShown != null && typeof this.options.onShown == "function") {
			return this.options.onShown(this);
		}
	}

	function _triggerOnHidden() {
		if (this.options.onHidden != null && typeof this.options.onHidden == "function") {
			return this.options.onHidden(this);
		}
	}

	function _triggerBeforeShow() {
		if (this.options.beforeShow != null && typeof this.options.beforeShow == "function") {
			return this.options.beforeShow(this);
		}
	}

	function _triggerBeforeHide() {
		if (this.options.beforeHide != null && typeof this.options.beforeHide == "function") {
			return this.options.beforeHide(this);
		}
	}
	//========= private methods end ==============

	//========= constructor ==============
	function SideBox(element, options) {
		var _this = this,
			$cntr = $(element),
			$button = $(templates.button),
			$box = $(templates.box)
		;

		options = $.extend(true, {}, dftOptions, options);

		$cntr.addClass(classNames.cntr)
			.css("top", parseInt(options.top));
		$box.append($cntr.children());
		$cntr.append($button);
		$cntr.append($box);
		$box.width(parseInt(options.width)).height(parseInt(options.height)).hide();		
		$button.click(function() {
			_this.toggleBox();
		});

		this.options = options;
		this.isOpen = false;
		this.$button = $button;
		this.$box = $box;
	}
	//========= constructor end ==============

	//========= public methods ==============
	SideBox.prototype = {
		constructor: SideBox,

		toggleBox: function() {
			var _this = this;
			var $box = this.$box;
			var $button = this.$button;
			var width = parseInt(this.options.width);
			var animateDuration = this.options.animateDuration;
			if (this.isOpen) {
				if (_triggerBeforeHide.call(this) !== false) {
					this.isOpen = false;
					$box.animate({width: '0px'}, {
						duration: animateDuration, 
						complete: function() {
							$box.width(width);
							$box.hide();
							_triggerOnHidden.call(_this);
						}
					});
				}
			} else {
				if (_triggerBeforeShow.call(this) !== false) {
					this.isOpen = true;
					$box.width(0);
					$box.show().animate({width: width + "px"}, {
						duration: animateDuration, 
						complete: function() {
							_triggerOnShown.call(_this);
						}
					});
				}
			}
		},

		getInstance: function() {
			return this;
		}
	};
	//========= public methods end ==============


	//========= jQuery plugin ==============
	$.fn.sideBox = function(arg) {
        if (this.length == 0) {
            return this;
        } else if (SideBox.prototype[arg] != null) {
            var func = SideBox.prototype[arg];
            var ins = $(this[0]).data("sideBox");
            if (ins == null) {
            	ins =  new SideBox(this);
            }

            if (typeof func == "function") {
                return func.apply(ins, Array.prototype.slice.call(arguments, 1));
            } else {
                return ins[arg];
            }
        } else {
            return this.each(function() {
                var instance = $(this).data("sideBox");
                if (instance == null) {
                    instance = new SideBox(this, arg);
                    $.data(this, "sideBox", instance);
                }
            });
        }
    };
    //========= jQuery plugin end==============
})(jQuery);