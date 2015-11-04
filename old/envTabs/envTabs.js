;(function($) {
    var dftOptions = {
        maxCount: 8,
        heightStyle: "auto",  //"auto" or "fill",
        showDropdownArrow: "auto", //"auto", "always", "never"
        onTabActived: function(tab) {},
        beforeTabActived: function() {},
        onTabRemoved:  function() {},
        beforeTabRemoved: function() {},
        onDblClickTab: function(tab) {}
    };

    var classNames = {
        body: "env-tabs",
        header: "env-tabs-header",
        nav: "env-tabs-nav",
        tabTitle: "env-tabs-title",
        tabClose: "env-tabs-close",
        dropdown: "env-tabs-arrow",
        panel: "env-tabs-panel",
        active: "active",
        fill: "fill",
        tabList: "env-tabs-list",
        tabListItem: "env-tabs-list-item"
    };

    var templates = {
        header: ['<div class="' + classNames.header + '">',
            '<ul class="' + classNames.nav + '"></ul>',
            '<a class="' + classNames.dropdown + '"></a>',
            '<ul class="' + classNames.tabList + '"></ul>',
            '</div>'].join(""),
        tabItem: ['<li>',
            '<a class="' + classNames.tabTitle + '"></a>',
            '<a class="' + classNames.tabClose + '"></a>',
            '</li>'].join(""),
        tabPanel: '<div class="' + classNames.panel + '"></div>',
        //tabList: '<ul class="' + classNames.tabList + '"></ul>',
        tabListItem: ['<li class="' + classNames.tabListItem + '">',
            '<a class="' + classNames.tabTitle + '"></a>',
            '<a class="' + classNames.tabClose + '"></a>',
            '</li>'].join("")
    };


    //========= private methods ==============
    function _refreshDropdownArrow() {
        if (!(this instanceof EnvTabs)) {
            return;
        }

        switch (this.options.showDropdownArrow) {
            case  "always":
                this.$dropdownArrow.show();
                break;
            case "never":
                this.$dropdownArrow.hide();
                break;
            case "auto":
            default :
                if (this.tabs.length > this.options.maxCount) {
                    this.$dropdownArrow.show();
                } else {
                    this.$dropdownArrow.hide();
                }
                break;
        }
    }

    function _findTabByName(name) {
        if (!(this instanceof EnvTabs)) {
            return;
        }

        for (var i in this.tabs) {
            var tab = this.tabs[i];
            if (tab.options.name == name) {
                return tab;
            }
        }

        return null;
    }

    function _findTabById(id) {
        if (!(this instanceof EnvTabs)) {
            return;
        }

        for (var i in this.tabs) {
            var tab = this.tabs[i];
            if (tab.options.id == id) {
                return tab;
            }
        }

        return null;
    }
    //========= private methods end ==============

    //========= constructor ==============
    function EnvTabs(element, options) {
        // do nothing if element is null or element is not a html element
        if (element == null || ! (element instanceof HTMLElement)) {
            return;
        }

        var _this = this,
            $element = $(element).addClass(classNames.body)
        ;

        //extend options
        options = $.extend(true, {}, dftOptions, options);

        $element.append(templates.header);
        if (options.heightStyle == "fill") {
            $element.addClass(classNames.fill);
        }

        this.options = options;
        this.$element = $(element);
        this.tabs = [];
        this.$header = $element.find("." + classNames.header);
        this.$nav = $element.find("." + classNames.nav);
        this.$tabList = $element.find("." + classNames.tabList).hide();
        this.$dropdownArrow = $element.find("." + classNames.dropdown).click(function() {
            if (_this.tabs.length > 0) {
                _this.$tabList.slideDown(function () {
                    $("body").bind("click", function () {
                        _this.$tabList.slideUp();
                        _refreshDropdownArrow.call(_this);
                        $("body").unbind("click");
                    });
                });
            }
        });
        _refreshDropdownArrow.call(this);
    }
    //========= constructor end ==============

    //========= public methods ==============
    EnvTabs.prototype = {
        constructor: EnvTabs,

        addTab: function(tabOptions) {
            var _this = this;
            var options = this.options;

            //find tab in this.tabs, active it and return if found
            var newTab = _findTabById.call(this, tabOptions.id);
            if (newTab != null) {
                this.activeTab(newTab);
                return newTab;
            }

            //create a new tab object
            newTab = {
                options: tabOptions,
                $tabItem: $(templates.tabItem).width(100 / options.maxCount + "%"),
                $tabPanel: $(templates.tabPanel),
                $tabListItem: $(templates.tabListItem)
            };
            //init tab item in the nav
            newTab.$tabItem.click(function() {
                _this.activeTab(newTab);
            }).children("." + classNames.tabTitle).text(tabOptions.name).attr("title", tabOptions.name);
            if (typeof this.options.onDblClickTab == "function") {
                newTab.$tabItem.dblclick(function() {
                    _this.options.onDblClickTab.call(_this, newTab);
                })
            }
            //init tab item in the tab list
            newTab.$tabListItem.click(function() {
                _this.activeTab(newTab);
            }).children("." + classNames.tabTitle).text(tabOptions.name);
            //bind enevt to the close button in nav
            newTab.$tabItem.children("." + classNames.tabClose).click(function() {
                _this.removeTab(newTab);
                //refresh dropdown arrow
                _refreshDropdownArrow.call(_this);
                return false; //block event bubbling
            });
            //bind enevt to the close button in tab list
            newTab.$tabListItem.children("." + classNames.tabClose).click(function() {
                _this.removeTab(newTab);
                return false; //block event bubbling
            });

            //add new tab to this.tabs
            this.tabs.unshift(newTab);
            //insert doms
            this.$nav.prepend(newTab.$tabItem);
            this.$tabList.prepend(newTab.$tabListItem);
            this.$element.append(newTab.$tabPanel);

            this.activeTab(newTab);
            _refreshDropdownArrow.call(this);

            return newTab;
        },

        removeTab: function(tab) {
            var canRemove = typeof this.options.beforeTabRemoved == "function" ? this.options.beforeTabRemoved.call(this) : true;
            if (canRemove === false) {
                return;
            }

            //remove doms
            tab.$tabItem.remove();
            tab.$tabItem = null;
            tab.$tabPanel.remove();
            tab.$tabPanel = null;
            tab.$tabListItem.remove();
            tab.$tabListItem = null;
            //get index in the tab array
            var index = this.tabs.indexOf(tab);
            //remove tab object from this.tabs
            this.tabs.splice(index, 1);
            //if the tab is active, active the previous tab
            if (tab.active && this.tabs.length > 0) {
                this.activeTab(this.tabs[index == 0 ? 0 : index - 1]);
            }
            if (this.tabs.length == 0) {
                this.$tabList.hide();
            }
            //refresh dropdown arrow
            //_refreshDropdownArrow.call(this);
            typeof this.options.onTabRemoved == "function" && this.options.onTabRemoved.call(this);
        },

        activeTab: function(tab) {
            var maxCount = this.options.maxCount,
                index = this.tabs.indexOf(tab)
            ;

            //unactive all tabs
            for (var i in this.tabs) {
                this.tabs[i].active = false;
                this.tabs[i].$tabItem.removeClass(classNames.active);
                this.tabs[i].$tabListItem.removeClass(classNames.active);
                this.tabs[i].$tabPanel.hide();
            }

            //active current tab
            tab.active = true;
            tab.$tabItem.addClass(classNames.active);
            tab.$tabListItem.addClass(classNames.active);
            tab.$tabPanel.show();

            //if the current tab is hidden, move it to top
            if (index >= maxCount) {
                this.tabs.splice(index, 1);
                this.tabs.unshift(tab);
                this.$nav.prepend(tab.$tabItem);
                this.$tabList.prepend(tab.$tabListItem);
            }
            
            typeof this.options.onTabActived == "function" && this.options.onTabActived.call(this, tab);
        }
    };
    //========= public methods end ==============

    //========= jQuery widget ==============
    $.fn.envTabs = function(arg) {
        if (this.length == 0) {
            return this;
        } else if (arg == null) {
            return $(this[0]).data("envTabs");
        } else if (EnvTabs.prototype[arg] != null) {
            var func = EnvTabs.prototype[arg];
            var ins = $(this[0]).data("envTabs");
            if (ins != null) {
                if (typeof func == "function") {
                    return func.apply(ins, Array.prototype.slice.call(arguments, 1));
                } else {
                    return ins[arg];
                }
            }
        } else {
            return this.each(function() {
                var instance = $(this).data("envTabs");
                if (instance == null) {
                    instance = new EnvTabs(this, arg);
                    $.data(this, "envTabs", instance);
                }
            });
        }
    };
    //========= jQuery widget end==============
})(jQuery);
