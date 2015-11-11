+(function($) {
    'use strict';

    /**
     * Constructor
     * @param {[HTMLElement]} element [dom element]
     * @param {[object]} options [options]
     */
    function EnvScrollSpy(element, options) {
        var _self = this,
            processProxy = $.proxy(this.process, this);

        this.$body = $('body');
        this.$element = $(element);
        this.$scrollElement = $(element).is('body') ? $(window) : $(element);
        this.options = $.extend({}, EnvScrollSpy.DEFAULTS, options);
        this.items = [];
        this.$activeItem = null;

        this.refresh();

        this.$scrollElement.scroll(processProxy);
    }

    EnvScrollSpy.VERSION = '0.1.0';

    /**
     * default options for EnvScrollSpy
     */
    EnvScrollSpy.DEFAULTS = {

    }

    /**
     * get the offset compared to element's parent
     * @param  {[jquery object]} $ele [target object]
     * @return {[number]}      [ negative number means the element is not in viewport]
     */
    EnvScrollSpy.prototype.getOffsetTop = function($ele) {
        if ($.isWindow(this.$scrollElement[0])) {
            return $ele.offset().top - $(window).scrollTop();
        } else {
            return $ele.offset().top - this.$element.offset().top;             
        }
    };

    /**
     * refresh item list
     * @return null
     */
    EnvScrollSpy.prototype.refresh = function () {
        var _self = this;

        //clear items
        this.items = [];

        //add items which has class 'env-scrollspy-item'
        this.$element.find('.env-scrollspy-item').each(function() {
            _self.items.push($(this));
        });

        //sort items by position
        this.items.sort(function ($a, $b) {
            return $a.position().top - $b.position().top;
        });

        this.process();
    };

    /**
     * triggered by scroll, process which item is the active one and trigger handler
     * @return null
     */
    EnvScrollSpy.prototype.process = function () {
        var i = 0, 
            $curItem = null;

        for (i = 0; i < this.items.length; i++) {
            if (this.getOffsetTop(this.items[i]) > 1) {
                break;
            }
        }
        $curItem = this.items[i === 0 ? 0 : i - 1];

        //trigger handler
        if (this.$activeItem !== $curItem) {
            this.$activeItem = $curItem;
            this.$element.triggerHandler({ 
                type:"env.scrollspy",   
                $activeItem: this.$activeItem
            });
        }
    };


    $.fn.envScrollspy = function (options) {
        return this.each(function () {
            var $this = $(this),
                instance = $this.data('env-scrollspy');

            if (!instance) {
                instance = new EnvScrollSpy(this, options);
                $this.data('env-scrollspy', instance);
            }

            if (typeof options == 'string') {
                instance[options]();
            }
        });
    };

    $.fn.envScrollspy.Constructor = EnvScrollSpy;
})(jQuery);