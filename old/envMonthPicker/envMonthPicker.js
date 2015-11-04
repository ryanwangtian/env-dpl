;(function($) {
    var dftOptions = {
            format: "yy/mm",
            lan: {
                confirm: "OK",
                monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }
        },
        templates = {
            body: ['<div class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all">', 
                    '<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all">',
                    '<a class="ui-datepicker-prev ui-corner-all" data-handler="prev" data-event="click" title="Prev">',
                    '<span class="ui-icon ui-icon-circle-triangle-w">Prev</span>',
                    '</a>',
                    '<a class="ui-datepicker-next ui-corner-all" data-handler="next" data-event="click" title="Next">',
                    '<span class="ui-icon ui-icon-circle-triangle-e">Next</span>',
                    '</a>',
                    '<div class="ui-datepicker-title">',
                    '<select class="ui-datepicker-year"></select>',
                    '<select class="ui-datepicker-month"></select>',
                    '</div>',
                    '</div>', 
                    '<ul class="ui-menu" style="padding-top: 5px"></ul>',
                    '<div class="ui-datepicker-buttonpane ui-widget-content">',
                    '<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" data-handler="hide" data-event="click"></button>',
                    '</div>',
                    '</div>',
                    '</div>'].join(""),
            listItem: '<li class="ui-menu-item ui-corner-all ui-state-default" style="margin: 2px auto;"></li>'
        }

    //========= private methods ==============
    function _addMonth(date, num) {
        if (date instanceof Date) {
            date.setMonth(date.getMonth() + num);
        }
    }
    //========= private methods end ==============

    //========= constructor ==============
    function EnvMonthPicker(element, options) {
        var _this = this;
        this.options = $.extend({}, dftOptions, options);
        this.$element = $(element);
        this.$picker = $(templates.body).css("position", "absolute").appendTo("body");
        this.$yearSelect = this.$picker.find("select.ui-datepicker-year");
        this.$monthSelect = this.$picker.find("select.ui-datepicker-month");
        this.$listCntr = this.$picker.find("ul.ui-menu");
        this.active = false;

        //bind click event for the input
        this.$element.click(function() {
            if (!_this.active) {
                _this.showPicker();
            }
        });

        //bind click event for the confirm button
        this.$picker.find(".ui-datepicker-close").text(this.options.lan.confirm).bind({
            click: function() {
                _this.hidePicker();
            },
            mouseenter: function() {
                $(this).addClass("ui-state-hover ui-datepicker-next-hover");
            },
            mouseleave: function() {
                $(this).removeClass("ui-state-hover");
            }
        });

        //bind events for the prev month button
        this.$picker.find(".ui-datepicker-prev").bind({
            click: function() {
                _addMonth(_this.selectedDate, -1);
                _this.setNewMonth(_this.selectedDate);
            },
            mouseenter: function() {
                $(this).addClass("ui-state-hover ui-datepicker-prev-hover");
            },
            mouseleave: function() {
                $(this).removeClass("ui-state-hover");
            }
        });

        //bind events for the next month button
        this.$picker.find(".ui-datepicker-next").bind({
            click: function() {
                _addMonth(_this.selectedDate, 1);
                _this.setNewMonth(_this.selectedDate);
            },
            mouseenter: function() {
                $(this).addClass("ui-state-hover ui-datepicker-next-hover");
            },
            mouseleave: function() {
                $(this).removeClass("ui-state-hover");
            }
        });

        //init the month select
        for(var i = 0; i < 12; i++) {
            this.$monthSelect.append("<option value='" + i + "'>" + this.options.lan.monthNames[i] + "</option>");
        }

        //bind change event for the month select
        this.$monthSelect.change(function() {
            _this.selectedDate.setMonth($(this).val());
            _this.setNewMonth(_this.selectedDate);
        });

        //bind change event for the year select
        this.$yearSelect.change(function() {
            _this.selectedDate.setFullYear($(this).val());
            _this.setNewMonth(_this.selectedDate);
        });

        this.$element.data("envMonthPicker", this);
    }
    //========= constructor end ==============

    //========= public methods ==============
    EnvMonthPicker.prototype = {
        constructor: EnvMonthPicker,

        showPicker: function() {
            //position of bottom-left of the input
            var pos = {
                top: this.$element.offset().top + this.$element.outerHeight(),
                left: this.$element.offset().left
            };

            if (this.selectedDate instanceof Date) {
                this.setNewMonth($.datepicker.parseDate(this.options.format + "-dd", this.$element.val() + "-01"));
            } else {
                this.setNewMonth(new Date((new Date()).setDate(1)));
            }
            
            this.$picker.css({
                top: pos.top,
                left: pos.left
            }).show();
            this.active = true;
        },

        hidePicker: function() {
            this.setNewMonth(this.selectedDate);
            this.$picker.hide();
            this.active = false;
        },

        setNewMonth: function(month) {
            var _this = this,
                i = 0,
                curYear,
                $tempListItem;

            if (!(month instanceof Date)) {
                month = $.datepicker.parseDate(this.options.format + "-dd", month + "-01");
            }
            if (month != null) {
                this.selectedDate = new Date(month);
                //refresh the input
                this.$element.val($.datepicker.formatDate(this.options.format, this.selectedDate));

                //refresh the year and month select
                this.$yearSelect.empty();
                curYear = this.selectedDate.getFullYear();
                for (i = -10; i <= 10; i++) {
                    this.$yearSelect.append("<option value='" + (curYear + i) + "'>" + (curYear + i) + "</option>");
                }
                this.$yearSelect.val(curYear);
                this.$monthSelect.val(this.selectedDate.getMonth());

                //refresh the list
                this.$listCntr.empty();
                _addMonth(month, -2);
                for (i = -2; i <= 2; i++) {
                    $tempListItem = $(templates.listItem).text($.datepicker.formatDate(this.options.format, month))
                            .bind({
                                mouseenter: function() {
                                    $(this).addClass("ui-state-focus");
                                },
                                mouseleave: function() {
                                    $(this).removeClass("ui-state-focus");
                                },
                                click: function() {
                                    _this.setNewMonth($(this).text());
                                    _this.hidePicker();
                                }
                            });
                    if (i == 0) {
                        $tempListItem.addClass("ui-state-active");
                    }
                    this.$listCntr.append($tempListItem);
                    _addMonth(month, 1);
                }
            }
        },

        destory: function() {
            this.$picker.remove();
            this.$element.unbind("click");
            this.$element.data("envMonthPicker", null);

            for(var i in this) {
                this[i] = null;
            }
        }
    };
    //========= public methods end ==============

    //========= jQuery widget ==============
    $.fn.envMonthPicker = function(arg) {
        if (this.length == 0) {
            return this;
        } else if (EnvMonthPicker.prototype[arg] != null) {
            var func = EnvMonthPicker.prototype[arg];
            var ins = $(this[0]).data("envMonthPicker");
            if (ins != null) {
                if (typeof func == "function") {
                    return func.apply(ins, Array.prototype.slice.call(arguments, 1));
                } else {
                    return ins[arg];
                }
            }
        } else {
            this.each(function() {
                var instance = $(this).data("envMonthPicker");
                if (instance == null) {
                    instance = new EnvMonthPicker(this, arg);
                }
            });

            if (arg == null) {
                return $(this[0]).data("envMonthPicker");
            } else {
                return this;
            }
        }
    };
    //========= jQuery widget end==============
})(jQuery);
