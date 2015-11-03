;(function($) {
	'use strict';
	var dftOptions = {
		title: '',
		buttons: [{
			text: 'Cancel',
			click: function() {this.hide();}
		}, {
			text: 'OK',
			click: function() {this.hide();}
		}]
	}, 
	templates = {
		body: ['<div class="env-modal-mask">', 
					'<div class="env-modal-dialog">', 
						'<div class="env-modal-content">', 
							'<button class="env-modal-btn-close"></button>', 
							'<header class="env-modal-header">', 
								'<p class="env-modal-title"></p>', 
							'</header>', 
							'<div class="env-modal-body"></div>', 
							'<footer class="env-modal-footer"></footer>', 
						'</div>', 
					'</div>', 
				'</div>'].join(''),
		btn: '<button></button>'
	};


	//========= private methods ==============
	function _addButton(options) {
		var _self = this,
			$btn = $(templates.btn)
					.text(options.text)
					.click(function() {
						options.click.call(_self);
					});

		this.$dialog.find('.env-modal-footer').append($btn);
	}
	//========= private methods end ==============

	//========= constructor ==============
	function Plugins(element, options) {
		// do nothing if element is null or element is not a html element
        if (element == null || ! (element instanceof HTMLElement)) {
            return;
        }

        var _self = this,
            $element = $(element)
        ;

        //extend options
        this.options = $.extend(true, {}, dftOptions, {
        	title: $element.attr('data-title')
        }, options);

        this.element = element;
        //init DOM and append to body
        this.$mask = $(templates.body).appendTo('body').hide();
        this.$dialog = this.$mask.children('.env-modal-dialog');
        this.$dialog.find('div.env-modal-body').append(this.element);

        //set title
        this.$dialog.find('.env-modal-title').text(this.options.title);
        //bind to close button
        this.$dialog.find('button.env-modal-btn-close').click(function() {
        	_self.hide();
        });
        //create buttons
        if (this.options.buttons instanceof Array) {
        	for (var i = 0; i < this.options.buttons.length; i++) {
        		_addButton.call(this, this.options.buttons[i]);
        	}
        }
	} 
	//========= constructor end ==============

	//========= public methods ==============
	Plugins.prototype.constructor = Plugins;

	Plugins.prototype.show = function() {
		var _self = this;

		this.$mask.show();

	};

	Plugins.prototype.hide = function() {
		this.$mask.hide();
	}
	//========= public methods end ==============

	//========= jQuery widget ==============
    $.fn.envModal = function(arg) {
        if (this.length == 0) {
            return this;
        } else if (Plugins.prototype[arg] != null) {
            var func = Plugins.prototype[arg];
            var ins = $(this[0]).data("envModal");
            if (ins != null) {
                if (typeof func == "function") {
                    return func.apply(ins, Array.prototype.slice.call(arguments, 1));
                } else {
                    return ins[arg];
                }
            }
        } else {
            this.each(function() {
                var instance = $(this).data("envModal");
                if (instance == null) {
                    instance = new Plugins(this, arg);
                    $.data(this, "envModal", instance);
                }
            });

            if (arg == null) {
	            return $(this[0]).data("envModal");
	        } else {
	        	return this;
	        }
        }
    };
    //========= jQuery widget end==============

})(jQuery);