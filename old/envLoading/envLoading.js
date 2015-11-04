;(function($, document) {
	var classNames = {
			wrapper: "env-loading-wrapper",
			img: "env-loading-img",
			rotate: "env-loading-rotate",
			closeable: "closeable",
			closeBtn: "env-loading-close-btn"
		}, 
		templates = ["<div class='" + classNames.wrapper + "'>",
				"<div class='" + classNames.img + "'>",
				"<div class='" + classNames.rotate + "'></div>",
				"</div>",
				"<div class='" + classNames.closeBtn + "'></div>",
				"</div>"].join(""),
		defaultOptions = {
			state: 0,
			onClosed: null,
		};

	//whether support css3 transition
	var CSS_TRANSITION = (function() {
			var prefixes = ["", "O", "ms", "Webkit", "Moz"],
				tempStyle = document.createElement('div').style;

			for (var i = 0, len = prefixes.length; i < len; i++) {
		        if (prefixes[i] + "Transition" in tempStyle) {
		            return prefixes[i] + "Transition";
		        }
		    }

		    return null;
		})(),
		//whether support css3 transform, return prefix if support
		CSS_TRANSFORM = (function() {
			var prefixes = ["", "O", "ms", "Webkit", "Moz"],
				tempStyle = document.createElement('div').style;

			for (var i = 0, len = prefixes.length; i < len; i++) {
		        if (prefixes[i] + "Transform" in tempStyle) {
		            return prefixes[i] + "Transform";
		        }
		    }

		    return null;
		})();

	function _rotate(element, deg) {
		var curDeg = $(element).data("deg") || 0;
		curDeg += deg;
		if (curDeg >= 360) {
			curDeg = curDeg - 360;
		}
		element.style[CSS_TRANSFORM] = "rotate(" + curDeg + "deg)";
		$(element).data("deg", curDeg);
	}

	function EnvLoading(element, options) {
		var _this = this,
			$element = $(element),
			options = $.extend({}, defaultOptions, options),
			computedStyle = document.defaultView.getComputedStyle(element, null),
			positionInStyle = element.style.position,
			isStaticPosition = computedStyle.position == "static";
		
		if (isStaticPosition) {
			element.style.position = "relative";
		}
		
		this.element = element;
		this.options = options;
		this.loadingElement = $(templates)[0];
		this.isStaticPosition = isStaticPosition;
		this.positionInStyle = positionInStyle;
		this.state = this.options.state;

		if (typeof this.options.onClosed === "function") {
			$(this.loadingElement).addClass(classNames.closeable)
				.find("." + classNames.closeBtn).click(function() {
					var onClosed = _this.options.onClosed;
					_this.destory();
					onClosed();
				});
		}

		$element.append(this.loadingElement);

		if (CSS_TRANSITION === null) {
			var rotateElement = $(this.loadingElement).find("." + classNames.rotate)[0];
			this.timer = setInterval(function() {
				_rotate(rotateElement, 9);
			}, 50);
		}

		$(this.element).data("envLoading", this);
	}
	
	EnvLoading.prototype = {
			destory: function() {
				$(this.element).data("envLoading", null);
				$(this.loadingElement).find("." + classNames.closeBtn).unbind("click");
				$(this.loadingElement).remove();
				if (this.isStaticPosition) {
					this.element.style.position = this.positionInStyle;
				}
				!!this.timer && clearInterval(this.timer);
				this.timer = null;
				this.element = null;
				this.loadingElement = null;
			}
	};
	
	$.fn.showEnvLoading = function(opt) {
        if (this.length == 0) {
            return this;
        } else {
            return this.each(function() {
                var instance = $(this).data("envLoading");
                if (!(instance instanceof EnvLoading)) {
                    instance = new EnvLoading(this, opt);
                } else {
					instance.state += 1;
				}
            });
        }
    };
    
    $.fn.hideEnvLoading = function(num) {
    	if (this.length == 0) {
            return this;
        } else {
        	return this.each(function() {
        		var instance = $(this).data("envLoading");
        		if (instance instanceof EnvLoading) {
        			instance.state -= (typeof num === "number" && !isNaN(num) ? num : 1);
					if (instance.state < 0 ) {
	        			instance.destory();
	        		}
        		}
        	});
        }
    };

	$.showPageLoading = function(opt) {
		var $body = $("body");
		if ($body != null && $body.length >= 0) {
			var instance = $body.data("envLoading");
			if (!(instance instanceof EnvLoading)) {
				instance = new EnvLoading($body[0], opt);
			} else {
				instance.state += 1;
			}
		}
	};


	$.hidePageLoading = function(num) {
		var $body = $("body");
		if ($body != null && $body.length >= 0) {
			var instance = $body.data("envLoading");
			if (instance instanceof EnvLoading) {
				instance.state -= (typeof num === "number" && !isNaN(num) ? num : 1);
				if (instance.state < 0 ) {
					instance.destory();
				}
			}
		}
	};
    
})(jQuery, document);