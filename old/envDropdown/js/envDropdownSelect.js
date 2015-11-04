(function($) {
	var dftOptions = {
		/* //for envDropdownBox
		 boxMaxHeight : 300,
		 boxMaxWidth : 0,
		 effectSpeed : 300,
		 change : null,*/
		multiSelect: false,
		useGroup: false,
		showGroupHeader: false, // valid only when 'useGroup' is true
		mutexGroup: false,  // valid only when 'useGroup' is true. when setted to true, you can only select item(s) from the same group
		showSelectAll: true, // valid when multiSelect && (!useGroup || !mutexGroup)
		data: null,
		nameKey: "name",
		valueKey: "value",
		groupKey: "group",
		maxDisplayCount: 5,
		text:{
			selected: " items selected", //to be edited
			selectAll: "Select All",
			defaultText: ""
		}
	};

	var classNames = {
		listCntr: "eds-list-cntr",
		groupCntr: "eds-group-cntr",
		groupHeader: "eds-group-header",
		groupHeaderText: "eds-group-header-text",
		itemCntr: "eds-item-cntr",
		item: "eds-item",
		itemIcon: "eds-item-icon",
		itemContent: "eds-item-content",
		selectAll: "eds-select-all",
		selected: "selected",
		single: "single"
	};

	var templates = {
		listContainer: '<ul class="' + classNames.listCntr + '"></ul>',
		groupContainer: ['<li class="' + classNames.groupCntr + '" groupid=":groupId">',
			'<ul>',
			'<li class="' + classNames.groupHeader + '"><span class="' + classNames.groupHeaderText + '">:groupName</span></li>',
			'<ul class="' + classNames.itemCntr + '"></ul>',
			'</ul>',
			'</li>'].join(""),
		listItem: ['<li class="' + classNames.item + '">',
			'<span class="' + classNames.itemIcon + '"></span>',
			'<span class="' + classNames.itemContent + '"></span>',
			'</li>'].join(""),
		selectAll: ['<li class="' + classNames.item + " " + classNames.selectAll + '">',
			//'<i class="fa fa-fw"></i>',
			'<span class="' + classNames.itemIcon + '"></span>',
			'<span class="' + classNames.itemContent + '"></span>',
			'</li>'].join("")
	};

	//constructor
	function EnvDropdownSelect(element, options) {
		var _this = this;
		// do nothing if element is null or element is not a HTMLElement
		if (element == null || ! (element instanceof HTMLElement)) {
			return;
		}

		var opt = $.extend(true, {}, dftOptions, options);
		opt.change = function() {
			if (options != null && options.change != null && typeof options.change == "function") {
				options.change(_this);
			}
		};
		this.getOptions = function() {
			return opt;
		};

		// the current <select> element
		var $select = $(element);
		// save all of the <option> elements
		var $selectOptions = $select.children("option");

		// build envDropdownBox
		$select.envDropdownBox(opt);
		this.dropdownBox = $select.envDropdownBox("getInstance");

		// Build the select list HTML and append to envDropdownBox
		var $listCntr = $(templates.listContainer);
		this.dropdownBox.append($listCntr);

		// append "select all"
		if (opt.showSelectAll && opt.multiSelect && (!opt.useGroup || !opt.mutexGroup)) {
			$selectAll = $(templates.selectAll);
			this._setItemName($selectAll, opt.text.selectAll);

			$listCntr.append($selectAll);
			$selectAll.bind("click", function() {
				_this._onSelectAllClicked();
			});
		}

		this._$doms = {
			select: $select,
			listCntr: $listCntr
		};
	}

	EnvDropdownSelect.prototype = {
		constructor: EnvDropdownSelect,

		_selectItem: function ($item, bool) {
			var selected = $item.hasClass(classNames.selected);
			if (bool != null) {
				selected = !bool;
			}
			if (selected) {
				if (this.getOptions().multiSelect) {
					$item.removeClass(classNames.selected);
					this._$doms.listCntr.children("." + classNames.selectAll).removeClass(classNames.selected);
				} else {
					if (bool != null) {
						$item.removeClass(classNames.selected);
					}
				}
			} else {
				$item.addClass(classNames.selected);
				if (this.getOptions().useGroup && this.getOptions().mutexGroup) {
					$item.closest("." + classNames.groupCntr).siblings().find("." + classNames.item).removeClass(classNames.selected);
				}
				if (!this.getOptions().multiSelect) {
					$item.siblings().removeClass(classNames.selected);
				}
				if (this.getOptions().multiSelect && (!this.getOptions().useGroup || !this.getOptions().mutexGroup)) {
					if (this._$doms.listCntr.find("." + classNames.item + ":not(." + classNames.selectAll + "):not(." + classNames.selected + ")").length <= 0) {
						this._$doms.listCntr.children("." + classNames.selectAll).addClass(classNames.selected);
					}
				}
				if (!this.getOptions().multiSelect && (!this.getOptions().useGroup || this.getOptions().mutexGroup)) {
					this.dropdownBox.closeBox();
				}
			}
			this._setText();
		},

		_setText: function () {
			var selectedNames = this.getSelectedItemName();
			var max = this.getOptions().maxDisplayCount;
			if (selectedNames.length <= 0) {
				this.dropdownBox.setText(this.getOptions().text.defaultText);
			} else if (!this.getOptions().multiSelect || max <= 0 || selectedNames.length <= max) {
				this.dropdownBox.setText(selectedNames.join(","));
			} else {
				this.dropdownBox.setText(selectedNames.length + this.getOptions().text.selected);
			}

		},

		_getItemName: function ($item) {
			return $item.children("span." + classNames.itemContent).first().text();
		},

		_setItemName: function ($item, name) {
			$item.children("span." + classNames.itemContent).first().text(name);
		},

		_getItemValue: function ($item) {
			return $item.attr("item-value");
		},

		_setItemValue: function ($item, value) {
			$item.attr("item-value", value);
		},

		_setAllItemsSelected: function (b) {
			if (b) {
				this._$doms.listCntr.find("." + classNames.item).addClass(classNames.selected);
			} else {
				this._$doms.listCntr.find("." + classNames.item).removeClass(classNames.selected);
			}
			this._setText();
		},

		_onSelectAllClicked: function () {
			var $selectAll = this._$doms.listCntr.children("." + classNames.selectAll);
			var selected = $selectAll.hasClass(classNames.selected);
			if (selected) {
				$selectAll.removeClass(classNames.selected);
				this._setAllItemsSelected(false);
			} else {
				$selectAll.addClass(classNames.selected);
				this._setAllItemsSelected(true);
			}
		},

		addGroup: function(data) {
			var options = this.getOptions();
			var id = data[options.valueKey];
			var name = (data[options.nameKey] == null || data[options.nameKey] == "" ? id : data[options.nameKey]);
			if (options.useGroup) {
				var gc = this._$doms.listCntr.children("." + classNames.groupCntr + "[groupId=" + id + "]");
				if (gc.length > 0) {
					gc.find("." + classNames.groupHeaderText).text(name);
				} else {
					var gcTemplate = templates.groupContainer.replace(/:groupId/, id).replace(/:groupName/, name);
					gc = $(gcTemplate);
					if (!options.showGroupHeader) {
						gc.find("." + classNames.groupHeader).empty();
					}
					this._$doms.listCntr.append(gc);
				}
			}
		},

		addItem: function(data) {
			var _this = this;
			var options = this.getOptions();
			var container = this._$doms.listCntr;
			if (options.useGroup) {
				var ic = container.children("." + classNames.groupCntr + "[groupId=" + data[options.groupKey] + "]").find("." + classNames.itemCntr);
				if (ic.length <= 0) {
					this.addGroup((function(){
						var tempdata = {};
						tempdata[options.valueKey] = data[options.groupKey];
						return tempdata;
					})());
					ic = container.children("." + classNames.groupCntr + "[groupId=" + data[options.groupKey] + "]").find("." + classNames.itemCntr);
				}
				container = ic;
			}
			var item = $(templates.listItem);
			item.bind("click", function() {
				_this._selectItem(item);
			}).data("data", data);
			item.attr("item-value", data[options.valueKey]).find("span." + classNames.itemContent).first().text(data[options.nameKey]);
			if (!options.multiSelect){
				item.find("span." + classNames.itemIcon).first().addClass(classNames.single);
			}

			container.append(item);
		},

		removeItem: function(value, groupId) {
			var options = this.getOptions();
			var $container = this._$doms.listCntr;
			if (options.useGroup && groupId) {
				var $gc = $container.children("." + classNames.groupCntr + "[groupId=" + groupId + "]");
				if ($gc.length <= 0) {
					$container = $gc;
				}
			}

			$container.find("." + classNames.item + "[item-value=" + value + "]").data("data", null).remove();
			this._setText();
		},

		hideItem: function(value, groupId, bool) {
			var options = this.getOptions();
			var $container = this._$doms.listCntr;
			if (options.useGroup && groupId) {
				var $gc = $container.children("." + classNames.groupCntr + "[groupId=" + groupId + "]");
				if ($gc.length <= 0) {
					$container = $gc;
				}
			}

			var $item = $container.find("." + classNames.item + "[item-value=" + value + "]");
			if (bool) {
				$item.hide();
				this._selectItem($item, false);
			} else {
				$item.show();
				this._selectItem($item, false);
			}
			this._setText();
		},

		removeGroup: function(groupId) {
			var options = this.getOptions();
			var $container = this._$doms.listCntr;
			if (options.useGroup && groupId) {
				$container.children("." + classNames.groupCntr + "[groupId=" + groupId + "]").remove();
			}

			this._setText();
		},

		getSelectedItem: function() {
			var selectedItems = [];
			this._$doms.listCntr.find("." + classNames.item + "." + classNames.selected).each(function() {
				selectedItems.push($(this).data("data"));
			});
			return selectedItems;
		},

		setItemSelected: function(value) {
			var _this = this;
			var $item = this._$doms.listCntr.find("." + classNames.item + "[item-value=" + value + "]");
			$item.each(function(){
				_this._selectItem($(this));
			});
		},

		getSelectedItemName: function() {
			var _this = this;
			var names = [];
			this._$doms.listCntr.find("." + classNames.item + "." + classNames.selected + ":not(." + classNames.selectAll + ")").each(function() {
				names.push(_this._getItemName($(this)));
			});
			return names;
		},

		getSelectedItemByGroup: function() {
			var options = this.getOptions();
			var result = {};
			if (!options.useGroup) {
				return result;
			}

			this._$doms.listCntr.find("." + classNames.groupCntr).each(function(){
				var temp = [];
				$(this).find("." + classNames.item + "." + classNames.selected).each(function() {
					temp.push($(this).data("data"));
				});
				result[$(this).attr('groupid')] = temp;
			});
			return result;
		},

		setDisabled: function(b) {
			this.dropdownBox.setDisabled(b);
		},

		destory: function() {
			this.dropdownBox.destory();
			for (var i in this) {
				this[i] = null;
			}
		}
	};

	$.fn.envDropdownSelect = function(arg) {
		if (this.length == 0) {
			return this;
		} else if (EnvDropdownSelect.prototype[arg] != null) {
			var func = EnvDropdownSelect.prototype[arg];
			var ins = $(this[0]).data("envDropdownSelect");
			if (ins != null) {
				if (typeof func == "function") {
					return func.apply(ins, Array.prototype.slice.call(arguments, 1));
				} else {
					return ins[arg];
				}
			}
		} else if (arg == "getInstance") {
			return $(this[0]).data("envDropdownSelect");
		} else {
			return this.each(function() {
				var instance = $(this).data("envDropdownSelect");
				if (instance == null) {
					instance = new EnvDropdownSelect(this, arg);
					$.data(this, "envDropdownSelect", instance);
				}
			});
		}
	};
})(jQuery);