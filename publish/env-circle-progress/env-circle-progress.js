/* envCircleProgress - v1.2.0_beta (2015-03-17)
* Author: Ryan
* Version history:
* 1.0.0_beta - (2015-01-16) Initial version
* 1.1.0_beta - (2015-03-16) Add new functions - target line
* 1.2.0_beta - (2015-03-17) Modify the DOM structure and CSS, make it simpler 
*/

(function($) {
	//========= private fields ==============
	var SVG = "http://www.w3.org/2000/svg";

	var dftOptions = {
		size: null,
		decimalPlaces: 1,
		circles: [],
		texts: [],
		showTooltip: true,
		tooltipFormatter: _dftTooltipFormatter
	};

	var dftCircleOpt = {
		id: "",  //setCircleValue时可根据这个id设置指定环的值
		angleRange: 300, //总的角度, 0-360
		startAngle: 120, //开始角度
		width: "5%",  //圆环的宽度，可以为数字（10）、像素值（"10px"）或百分比，当为前两者时宽为指定的定值，为百分比时宽根据svg大小计算
		margin: "5%",  //圆环离svg边缘的距离,值同上
		anticlockwise: false, //是否逆时针
		enableAnimation: true, //是否启用动画效果，
		animationStep: 1, //动画效果的步进
		initValue: 50, //初始值
		text: { //环对应的文本，用来显示环的当前值
			show: true, //是否显示
			size: "14px",  //字体大小
			prefix: "", //文本前缀
			suffix: "%", //文本后缀
			top: "50%" //下边沿离svg顶部的距离
		},
		target: {//目标值刻度
			show: false, //是否显示
			value: "100%", //值，必须为百分比
			width: "2px"
		},
		className: {
			bg: "", //环的背景（轨道）对应的class名，用于通过css定义样式（css定义的颜色优先级高于配置项中color定义的颜色）
			fill: "",
			text: "",
			target: "",
		},
		color: {
			bg: "#23252b", //环的背景颜色（轨道颜色）
			fill: "#21a1c1",  //环的颜色
			text: "#21a1c1", //文字的颜色
			target: "#d50000" //目标值刻度线颜色
		}
	};

	var dftTextOpt = {
		id: "", //setText时可根据这个id设置指定文本的值
		value: "",  //显示内容
		size: "14px",  //字体大小
		prefix: "", //文本前缀
		suffix: "", //文本后缀
		top: "50%", //下边沿离svg顶部的距离
		className: "",
		color: "#fff"
	};

	var classNames = {
		wrapper: "ecp-wrapper",
		background: "ecp-bg",
		border: "ecp-border",
		svgCntr: "ecp-svg-cntr",
		circleBg: "ecp-cc-bg",
		circleFill: "ecp-cc-bg",
		circleText: "ecp-cc-text",
		text: "ecp-cc-text",
		tooltip: "ecp-tooltip"
	};

	var templates = ["<div class='" + classNames.wrapper + "'>",
					"<div class='" + classNames.background + "'>",
					"<div class='" + classNames.border + "'>",
					"<div class='" + classNames.svgCntr + "'></div>", 
					"</div>", 
					"</div>", 
					"</div>"].join("");

	var tooltipTemplate = "<div class='" + classNames.tooltip + "'></div>";

	//========= private fields end ==============

	//========= private methods ==============

	// get coordinate of a point in the circle
	function _getCoordinate(origin, radius, angle) {
		return {
			x: origin.x + radius * Math.cos(Math.PI * angle / 180),
			y: origin.y + radius * Math.sin(Math.PI * angle / 180)
		}
	}

	// get modulus
	function _getModulus(dividend, divisor) {
		return dividend - Math.floor(dividend/divisor) * divisor;
	}

	// calculate angle range
	function _getAngleRange(startAngle, endAngle, anticlockwise) {
		startAngle = _getModulus(startAngle, 360);
		endAngle = _getModulus(endAngle, 360);

		if (!anticlockwise) {
			if (endAngle > startAngle) {
				return endAngle -startAngle;
			} else {
				return 360 - (startAngle - endAngle);
			}
		} else {
			if (startAngle > endAngle) {
				return startAngle - endAngle;
			} else {
				return 360 - (endAngle - startAngle);
			}
		}
	}

	//calculate path value for a circle 
	function _getPathString(origin, outerRadius, innerRadius, startAngle, endAngle, anticlockwise) {
		if (startAngle == endAngle) {
			return "M0 0";
		}
		var path = "";
		startAngle = _getModulus(startAngle, 360);
		endAngle = _getModulus(endAngle, 360);
		anticlockwise = (anticlockwise == true);

		if (startAngle != endAngle) {
			var outerStart = _getCoordinate(origin, outerRadius, startAngle);
			var innerStart = _getCoordinate(origin, innerRadius, startAngle);
			var outerEnd = _getCoordinate(origin, outerRadius, endAngle);
			var innerEnd = _getCoordinate(origin, innerRadius, endAngle);
			var angleRange = _getAngleRange(startAngle, endAngle, anticlockwise);
			var largeArcFlag = angleRange >= 180 ? 1 : 0;

			path = "M" + outerStart.x + " " + outerStart.y
					+ " A" + outerRadius + " " + outerRadius + " " + 0 + " " + largeArcFlag + " " + (anticlockwise ? 0 : 1) 
					+ " " + outerEnd.x + " " + outerEnd.y
					+ " L" + innerEnd.x + " " + innerEnd.y
					+ " A" + innerRadius + " " + innerRadius + " " + 0 + " " + largeArcFlag + " " + (anticlockwise ? 1 : 0)
					+ " " + innerStart.x + " " + innerStart.y
					+ " Z";
		} else {
			var path1 = arguments.callee(origin, outerRadius, innerRadius, startAngle, startAngle + 180, anticlockwise);
			var path2 = arguments.callee(origin, outerRadius, innerRadius, startAngle, startAngle + 180, !anticlockwise);
			path = path1 + " " + path2;
		}

		return path;
	}

	//create SVG element
	function _createSVG(size) {
		var svg = document.createElementNS(SVG, "svg");
		svg.setAttribute("version", "1.2");
		svg.setAttribute("width", size);
		svg.setAttribute("height", size);
		svg.setAttribute("contentScriptType", "text/ecmascript");
		svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
		svg.setAttribute("baseProfile", "tiny");
		svg.setAttribute("zoomAndPan", "magnify");
		svg.setAttribute("contentStyleType", "text/css");
		svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
		svg.setAttribute("xmlns", SVG);
		svg.setAttribute("stroke", "none");
		return svg;
	}

	//add elements to an empty svg
	function _drawSVG() {
		//size of svg
		this._svgSize = Math.min(this._$svgCntr.height(), this._$svgCntr.width());
		//origin of svg
		this._svgOrigin = {
			x: this._svgSize / 2,
			y: this._svgSize / 2
		};

		//create an empty svg
		var svg = this._svg =  _createSVG(this._svgSize);

		//create circles
		var circles = this.circles;
		for (var i in circles) {
			var c = circles[i];
			c.bg = document.createElementNS(SVG, "path");
			c.element = document.createElementNS(SVG, "path");			

			//background of the circle
			if (c.options.className != null && c.options.className.bg != null) {
				c.bg.setAttribute('class', classNames.circleBg + " " + c.options.className.bg);
			} else {
				c.bg.setAttribute('class', classNames.circleBg);
			}
			c.bg.setAttribute('fill', c.options.color.bg || "");
			c.bg.setAttribute("d", _getPathString(
				this._svgOrigin, 
				this._svgSize / 2 - _getRealSize(c.options.margin, this._svgSize), 
				this._svgSize / 2 - _getRealSize(c.options.margin, this._svgSize) - _getRealSize(c.options.width, this._svgSize), 
				c.options.startAngle, 
				(c.options.anticlockwise == true ? c.options.startAngle - c.options.angleRange : c.options.startAngle + c.options.angleRange),
				c.options.anticlockwise
				));

			// value element of the circle
			if (c.options.className != null && c.options.className.fill != null) {
				c.element.setAttribute('class', classNames.circleFill + " " + c.options.className.fill);
			} else {
				c.element.setAttribute('class', classNames.circleFill);
			}
			c.element.setAttribute('fill', c.options.color.fill || "");
			// c.element.setAttribute("d", _getPathString(
			// 	this._svgOrigin, 
			// 	this._svgSize / 2 - _getRealSize(c.options.margin, this._svgSize), 
			// 	this._svgSize / 2 - _getRealSize(c.options.margin, this._svgSize) - _getRealSize(c.options.width, this._svgSize), 
			// 	c.options.startAngle, 
			// 	c.options.anticlockwise == true ? c.options.startAngle - c.options.angleRange * c.curValue / 100 : c.options.startAngle + c.options.angleRange * c.curValue / 100,
			// 	c.options.anticlockwise
			// 	));

			svg.appendChild(c.bg);
			svg.appendChild(c.element);			
			
			//if show target line, create it
			if (c.options.target != null && c.options.target.show) {
				c.targetLine = document.createElementNS(SVG, "line");
				var targetValue = parseFloat(c.options.target.value) / 100;
				var targetAngle = c.options.anticlockwise == true ? c.options.startAngle - c.options.angleRange * targetValue : c.options.startAngle + c.options.angleRange * targetValue;
				var p1 = _getCoordinate(this._svgOrigin, this._svgSize / 2 - _getRealSize(c.options.margin, this._svgSize), targetAngle);
				var p2 = _getCoordinate(this._svgOrigin, this._svgSize / 2 - _getRealSize(c.options.margin, this._svgSize) - _getRealSize(c.options.width, this._svgSize), targetAngle);
				c.targetLine.setAttribute("x1", p1.x);
				c.targetLine.setAttribute("y1", p1.y);
				c.targetLine.setAttribute("x2", p2.x);
				c.targetLine.setAttribute("y2", p2.y);
				c.targetLine.style.stroke = c.options.color.target || "#d50000";
				c.targetLine.style.strokeWidth = c.options.target.width;
				svg.appendChild(c.targetLine);
			}
		}

		//create circle text
		for (var i in this.circles) {
			//text of the circle
			var c = circles[i];
			if (c.options.text != null && c.options.text.show) {
				c.text = document.createElementNS(SVG,'text');
				if (c.options.className != null && c.options.className.text != null) {
					c.text.setAttribute('class', classNames.circleText + " " + c.options.className.text);
				} else {
					c.text.setAttribute('class', classNames.circleText);
				}
				c.text.setAttribute('fill', c.options.color.text || c.options.color.fill || "");
				c.text.setAttribute('x', this._svgSize / 2);
				c.text.setAttribute('y', c.options.text.top || this._svgSize / 2);
				c.text.setAttribute('font-size', c.options.text.size || "");
				// c.text.textContent = (c.options.text.prefix || "") + c.curValue.toFixed(this.getOptions().decimalPlaces || 2) + (c.options.text.suffix || "");
				svg.appendChild(c.text);
			}

			_setCircle.call(this, c);
		}

		//create texts
		var texts = this.texts;
		for (var i in texts) {
			var t = texts[i];
			t.element = document.createElementNS(SVG,'text');
			t.element.setAttribute('class', classNames.text + " " + (t.options.className || ""));
			t.element.setAttribute('fill', t.options.color || "");
			t.element.setAttribute('x', this._svgSize / 2);
			t.element.setAttribute('y', t.options.top || this._svgSize / 2);
			t.element.setAttribute('font-size', t.options.size || "");
			t.element.textContent = t.options.value || "";

			svg.appendChild(t.element);
		}

		this._$svgCntr.append(svg);
	}

	//get an object from object list or a parent object by id or serial number
	function _getObject(list, id) {
		if (typeof id == "number") {
			return list[id];
		} else {
			for (var i in list) {
				if (list[i].id == id) {
					return list[i];
				}
			}
		}
	}

	//calculate the real size based on the setted value and svg's size
	function _getRealSize(value, baseSize) {
		//if 'value' is a percent value, calculate the real size
		if ((/^\d+(\.\d+)?\%$/).test(value)) {
			var percent = parseFloat(value);
			return baseSize * percent / 100;
		} else {
			return parseFloat(value);
		}
	}

	//refresh circle element based on curValue
	function _setCircle(circle) {
		var formatValue = circle.curValue > 100 ? 100 : circle.curValue;
		formatValue = formatValue < 0 ? 0 : formatValue;
		circle.element.setAttribute("d", _getPathString(
			this._svgOrigin, 
			this._svgSize / 2 - _getRealSize(circle.options.margin, this._svgSize), 
			this._svgSize / 2 - _getRealSize(circle.options.margin, this._svgSize) - _getRealSize(circle.options.width, this._svgSize), 
			circle.options.startAngle, 
			(circle.options.anticlockwise == true ? circle.options.startAngle - circle.options.angleRange * formatValue / 100 : circle.options.startAngle + circle.options.angleRange * formatValue / 100),
			circle.options.anticlockwise
			));

		if (circle.options.text != null && circle.options.text.show) {
			circle.text.textContent = (circle.options.text.prefix || "") + circle.curValue.toFixed(this.getOptions().decimalPlaces || 2) + (circle.options.text.suffix || "");
		}
	}

	//default tooltip formatter
	function _dftTooltipFormatter() {
		var result = "";
		for (var i in this.circles) {
			var c = this.circles[i];
			if (c.options.text != null) {
				result += "<span>" + (c.options.text.prefix || "") + c.curValue.toFixed(this.getOptions().decimalPlaces || 2) + (c.options.text.suffix || "") + "</span><br>";
			} else {
				result += "<span>" + c.curValue.toFixed(this.getOptions().decimalPlaces || 2) + "</span><br>"
			}		
		}

		return result;
	}

	//init tooltip element
	function _initTooltip() {
		var _this = this;
		var opt = this.getOptions();
		if (opt.showTooltip) {
			this._$tooltip = $(tooltipTemplate).hide();
			this._$base.find("." + classNames.background).append(this._$tooltip);
			this._$base.mouseenter(function(e) {
				_refreshTooltip.call(_this);
				_this._$tooltip.fadeIn();
			}).mouseleave(function() {
				setTimeout(function() {_this._$tooltip.fadeOut();}, 500);
			});
		}
	}

	//refresh tooltip content
	function _refreshTooltip() {
		var opt = this.getOptions();
		if (opt.showTooltip && this._$tooltip != null) {
			this._$tooltip.empty();
			var formatter = opt.tooltipFormatter;
			if (formatter != null && typeof formatter == "function") {
				this._$tooltip.append(formatter.call(this));
			}			
		}
	}

	//========= private methods end ==============

	//========= constructor ==============
	function EnvCircleProgress(element, options) {
		// do nothing if element is null or element is not a HTMLElement
		if (element == null || ! (element instanceof HTMLElement)) {
			return;
		}

		//container element for the widget
		var $element = $(element);
		//extend options
		options = $.extend(true, {}, dftOptions, options);

		//if 'size' is not setted, set the smaller one of container's height and width as the size
		if (isNaN(parseInt(options.size))) {
			options.size = $element.width() > $element.height() ? $element.height() : $element.width();
		} else {
			options.size = parseInt(options.size);
		}

		//extend default options to every circle, and create a circle object and to this.circles
		this.circles = {};
		for (var i in options.circles) {
			options.circles[i] = $.extend(true, {}, dftCircleOpt, options.circles[i]);
			this.circles[i] = {
				id: options.circles[i].id,
				options: options.circles[i],
				curValue: options.circles[i].initValue < 100 ? options.circles[i].initValue : 100
			}
		} 

		//extend default options to every text, and create a text object and to this.texts
		this.texts = {};
		for (var i in options.texts) {
			options.texts[i] = $.extend(true, {}, dftTextOpt, options.texts[i]);
			this.texts[i] = {
				id: options.texts[i].id,
				options: options.texts[i]
			};
		}

		var $base = $(templates).width(options.size).height(options.size);
		$(element).append($base);

		this.getOptions = function() {return options};
		this._$cntr = $element;
		this._$base = $base;
		this._$svgCntr = $base.find("." + classNames.svgCntr);

		_initTooltip.call(this);

		_drawSVG.call(this);
	}
	//========= constructor end ==============

	//========= public methods ==============
	EnvCircleProgress.prototype = {
		constructor: EnvCircleProgress,

		setCircleValue: function(id, value) {
			var _this = this;
			var c = _getObject(this.circles, id);
			if (c != null) {
				var enableAnimation = c.options.enableAnimation;
				if (c.curValue == value) {
					return;
				}

				if (enableAnimation) {
					c.timer != null && clearInterval(c.timer);  //if the timer is not null, stop it
					c.timer = setInterval(function() {
						if (c.curValue == value) {
							clearInterval(c.timer);
							return;
						} else if (c.curValue < value) {
							c.curValue += c.options.animationStep || 1;
							c.curValue > value && (c.curValue = value);
						} else {
							c.curValue -= c.options.animationStep || 1;
							c.curValue < value && (c.curValue = value);
						}

						_setCircle.call(_this, c);
						// c.element.setAttribute("d", _getPathString(
						// 	_this._svgOrigin, 
						// 	_this._svgSize / 2 - _getRealSize(c.options.margin, _this._svgSize), 
						// 	_this._svgSize / 2 - _getRealSize(c.options.margin, _this._svgSize) - _getRealSize(c.options.width, _this._svgSize), 
						// 	c.options.startAngle, 
						// 	(c.options.anticlockwise == true ? c.options.startAngle - c.options.angleRange * c.curValue / 100 : c.options.startAngle + c.options.angleRange * c.curValue / 100),
						// 	c.options.anticlockwise
						// 	));

						// if (c.options.text != null && c.options.text.show) {
						// 	c.text.textContent = (c.options.text.prefix || "") + c.curValue.toFixed(_this.getOptions().decimalPlaces || 2) + (c.options.text.suffix || "");
						// }
					}, 10);
				} else {
					c.curValue = value;
					_setCircle.call(_this, c);
					// c.element.setAttribute("d", _getPathString(
					// 	this._svgOrigin, 
					// 	this._svgSize / 2 - _getRealSize(c.options.margin, _this._svgSize), 
					// 	this._svgSize / 2 - _getRealSize(c.options.margin, _this._svgSize) - _getRealSize(c.options.width, _this._svgSize), 
					// 	c.options.startAngle, 
					// 	(c.options.anticlockwise == true ? c.options.startAngle - c.options.angleRange * c.curValue / 100 : c.options.startAngle + c.options.angleRange * c.curValue / 100),
					// 	c.options.anticlockwise
					// 	));
					// if (c.options.text != null && c.options.text.show) {
					// 	c.text.textContent = (c.options.text.prefix || "") + c.curValue.toFixed(_this.getOptions().decimalPlaces || 2) + (c.options.text.suffix || "");
					// }
				}
			}

		},

		setText: function(id, text) {
			var t = _getObject(this.texts, id);
			if (t != null) {
				t.element.textContent = t.options.value = text || "";
			}
		},

		resize: function(size) {
			size = parseInt(size) || Math.min(this._$cntr.height(), this._$cntr.width());
			this._$base.width(size).height(size);
			$(this._svg).remove();
			_drawSVG.call(this);
		},

		destory: function() {
			this._$cntr.children().remove();
			this._$cntr.removeData("envCircleProgress");
			this.prototype = {};

			for (var i in this.circles) {
				var c = this.circles[i];
				for (var j in c) {
					c[j] = null
				}
			}

			for (var i in this.texts) {
				var t = this.texts[i];
				for (var j in t) {
					t[j] = null
				}
			}

			for(var p in this) {
				if (this.hasOwnProperty(p)) {
					this[p] = null;
				}
			}
		}
	};
	//========= public methods end ==============


	//========= jQuery plugin ==============
	$.fn.envCircleProgress = function(arg) {
        if (this.length == 0) {
            return this;
        } else if (arg == null) {
        	return $(this[0]).data("envCircleProgress");
        } else if (EnvCircleProgress.prototype[arg] != null) {
            var func = EnvCircleProgress.prototype[arg];
            var ins = $(this[0]).data("envCircleProgress");
            if (ins != null) {
                if (typeof func == "function") {
                    return func.apply(ins, Array.prototype.slice.call(arguments, 1));
                } else {
                    return ins[arg];
                }
            }
        } else {
            return this.each(function() {
                var instance = $(this).data("envCircleProgress");
                if (instance == null) {
                    instance = new EnvCircleProgress(this, arg);
                    $.data(this, "envCircleProgress", instance);
                }
            });
        }
    };
    //========= jQuery widget end==============
})(jQuery);