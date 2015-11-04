;(function($) {
    var dftOptions = {
        keys: {
            id: "id",
            name: "name",
            children: "children",
            icon: "icon"
        },
        mini: false,
        data: [],
        onMenuItemClicked: function(itemData) {}
    };

    var classNames = {
        body: "env-left-menu",
        bodyMini: "env-left-menu-mini",
        menuItemIcon: "eln-item-icon",
        menuItemTitle: "eln-item-title",
        menuItemArrow: "eln-item-arrow",
        level: "level",
        hidden: "hidden",
        collapse: "collapse",
        active: "active",
        icon: "env-icon-16"
    };

    var templates = {
        menuItem: ['<li>',
            '<a>',
            '<span class="' + classNames.menuItemIcon + ' ' + classNames.icon + '"></span>',
            '<span class="' + classNames.menuItemTitle + '"></span>',
            '</a>',
            '</li>'].join(""),
        menuItemArrow: '<span class="' + classNames.menuItemArrow + '"></span>',
        subMenuCntr: '<ul></ul>'
    };

    //========= private methods ==============
    function _addMenuItem(itemData, parentMenuItem) {
        if (!(this instanceof EnvLeftMenu) || itemData == null || typeof itemData != 'object') {
            return;
        }

        var ins = this,
            keys = this.options.keys,
            curMenuItem = {
                data: itemData,
                id: itemData[keys.id],
                name: itemData[keys.name],
                icon: itemData[keys.icon],
                children: [],
                $element: $(templates.menuItem),
                $childrenCntr: null,
                level: null,
                parentMenuItem: null
            }
        ;

        curMenuItem.$element.children("a").click(function() {
            if (curMenuItem.children.length > 0) {
                if (curMenuItem.$element.hasClass(classNames.active)) {
                    curMenuItem.$childrenCntr.slideUp(function() {
                        curMenuItem.$element.removeClass(classNames.active);
                    });
                } else {
                    curMenuItem.$childrenCntr.slideDown();
                    curMenuItem.$element.addClass(classNames.active);
                    var siblings = curMenuItem.parentMenuItem == null ? ins.menuItems : curMenuItem.parentMenuItem.children;
                    for (var i in siblings) {
                        if (siblings[i].$element.hasClass(classNames.active) && siblings[i] != curMenuItem) {
                            siblings[i].$childrenCntr.slideUp(function() {
                                siblings[i].$element.removeClass(classNames.active);
                            });
                            break;
                        }
                    }
                }
            }
            _triggerOnMenuItemClicked.call(ins, curMenuItem);
        }).find("." + classNames.menuItemTitle)
            .text(curMenuItem.name)
            .attr("title", curMenuItem.name);
        curMenuItem.$element.find("." + classNames.menuItemIcon)
            .addClass(curMenuItem.icon || "")
            .attr("title", curMenuItem.name);

        if (parentMenuItem == null) {
            curMenuItem.level = 0;
            curMenuItem.$element.addClass(classNames.level + 0);
            this.menuItems.push(curMenuItem);
            $(this.element).append(curMenuItem.$element);
        } else {
            curMenuItem.level = parentMenuItem.level + 1;
            curMenuItem.$element.addClass(classNames.level + curMenuItem.level);
            curMenuItem.parentMenuItem = parentMenuItem;
            parentMenuItem.children.push(curMenuItem);
            parentMenuItem.$childrenCntr.append(curMenuItem.$element);
        }

        if (itemData[keys.children] != null && itemData[keys.children].length > 0) {
            //curMenuItem.$element.addClass(classNames.active);
            curMenuItem.$childrenCntr = $(templates.subMenuCntr);
            curMenuItem.$element.append(curMenuItem.$childrenCntr);
            curMenuItem.$element.children("a").append(templates.menuItemArrow);
            for (var i in itemData[keys.children]) {
                arguments.callee.call(this, itemData[keys.children][i], curMenuItem);
            }
        }
    }

    function _triggerOnMenuItemClicked(itemData) {
        if (!(this instanceof EnvLeftMenu) || typeof this.options.onMenuItemClicked != "function") {
            return;
        }

        this.options.onMenuItemClicked.call(this, itemData);
    }
    //========= private methods end ==============


    //========= constructor ==============
    function EnvLeftMenu(element, options) {
        // do nothing if element is null or element is not a 'ul'
        if (element == null || ! (element instanceof HTMLUListElement)) {
            return;
        }

        var _this = this,
            $element = $(element)
        ;

        //extend options
        options = $.extend(true, {}, dftOptions, options);

        this.options = options;
        this.element = element;
        this.menuItems = [];

        $element.addClass(!!options.mini ? classNames.bodyMini : classNames.body);
        for (var i in options.data) {
            _addMenuItem.call(this, options.data[i], null);
        }
    }
    //========= constructor end ==============

    //========= public methods ==============
    EnvLeftMenu.prototype = {
        constructor: EnvLeftMenu,

        setMini: function(b) {
            this.options.mini = !!b;
            if (!!b) {
                $(this.element).removeClass(classNames.body).addClass(classNames.bodyMini);
            } else {
                $(this.element).removeClass(classNames.bodyMini).addClass(classNames.body);
            }
        }
    };
    //========= public methods end ==============


    //========= jQuery widget ==============
    $.fn.envLeftMenu = function(arg) {
        if (this.length == 0) {
            return this;
        } else if (arg == null) {
            return $(this[0]).data("envLeftMenu");
        } else if (EnvLeftMenu.prototype[arg] != null) {
            var func = EnvLeftMenu.prototype[arg];
            var ins = $(this[0]).data("envLeftMenu");
            if (ins != null) {
                if (typeof func == "function") {
                    return func.apply(ins, Array.prototype.slice.call(arguments, 1));
                } else {
                    return ins[arg];
                }
            }
        } else {
            return this.each(function() {
                var instance = $(this).data("envLeftMenu");
                if (instance == null) {
                    instance = new EnvLeftMenu(this, arg);
                    $.data(this, "envLeftMenu", instance);
                }
            });
        }
    };
    //========= jQuery widget end==============

})(jQuery);
