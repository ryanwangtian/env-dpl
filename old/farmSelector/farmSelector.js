;(function($) {
	//========= private fields ==============
	var dftOptions = {
		width: 400,
		height: 'auto',
		keyNames: {
			groupId: "id",
			groupName: "name",
			groupTitle: "title",
			itemId: "id",
			parentId: "groupId",
			itemName: "name",
			itemTitle: "title"
		},
		data: [],
		onConfirm: function() {},
		onCancel: function() {}
	};

	var classNames = {
		wrapper: "fs-wrapper",
		content: "fs-content",
		group: "fs-group",
		groupHeader: "fs-group-header",
		itemCntr: "fs-item-cntr",
		item: "fs-item",
		selected: "selected",
		btnpanel: "fs-btnpanel",
		btn: "fs-btn",
		btnConfirm: "fs-btn-confirm",
		btnCancel: "fs-btn-cancel",
		btnImg: "fs-btn-img",
		btnText: "fs-btn-text"
	};

	var templates = {
		content: "<ul class='" + classNames.content + "'></ul>",
		btnpanel: ["<div class='" + classNames.btnpanel + "'>",
					"<button class='" + classNames.btnCancel + "'><span class='" + classNames.btnImg + "'></span><span class='" + classNames.btnText + "'>取消</span></button>",
					"<button class='" + classNames.btnConfirm + "'><span class='" + classNames.btnImg + "'></span><span class='" + classNames.btnText + "'>确定</span></button>",
					"</div>"].join(""),
		group: ["<li class='" + classNames.group + "'>",
				"<span class='" + classNames.groupHeader + "'></span>",
				"<ul class='" + classNames.itemCntr + "'></ul>",
				"</li>"].join(""),
		item: "<li class='" + classNames.item + "'></li>"
	};

	//========= private fields end ==============

	//========= private methods ==============
	function _isAllItemsSelected(groupObj) {
		for (var i in groupObj.items) {
			var item = groupObj.items[i];
			if (!item.selected) {
				return false;
			}
		}

		return true;
	}

	function _setItemSelected(itemObj, b) {
		b = b == true ? true : false;
		itemObj.selected = b;
		b ? itemObj.$object.addClass(classNames.selected) : itemObj.$object.removeClass(classNames.selected);
	}

	function _refreshSelectedStatus(b) {
		if (b) {
			for (var i in this.groups) {
				var g = this.groups[i];
				for (var j in g.items) {
					var item = g.items[j];
					item.perSelected = item.selected;
				}
			}
		} else {
			for (var i in this.groups) {
				var g = this.groups[i];
				for (var j in g.items) {
					var item = g.items[j];
					item.selected = item.perSelected;
					_setItemSelected(item, item.selected);
				}
			}
		}
	}

	function _triggerOnConfirm() {
		if (this.options.onConfirm != null && typeof this.options.onConfirm == "function") {
			this.options.onConfirm(this);
		}
	}

	function _triggerOnCancel() {
		if (this.options.onCancel != null && typeof this.options.onCancel == "function") {
			this.options.onCancel(this);
		}
	}
	//========= private methods end ==============

	//========= constructor ==============
	function FarmSelector(element, options) {
		var _this = this,
			$content = $(templates.content),
			$btnpanel = $(templates.btnpanel),
			$wrapper = $(element).addClass(classNames.wrapper).append($content).append($btnpanel)
		;

		options = $.extend(true, {}, dftOptions, options);
		this.options = options;
		this._$groupCntr = $content;
		this.groups = {};

		$wrapper.width(parseInt(options.width)).height(parseInt(options.height));
		$btnpanel.children("button." + classNames.btnConfirm).click(function() {
			_refreshSelectedStatus.call(_this, true);
			_triggerOnConfirm.call(_this);
		});
		$btnpanel.children("button." + classNames.btnCancel).click(function() {
			_refreshSelectedStatus.call(_this, false);
			_triggerOnCancel.call(_this);
		});
	}
	//========= constructor end ==============

	//========= public methods ==============
	FarmSelector.prototype = {
		constructor: FarmSelector,

		addGroup: function(groupData) {
			var _this = this,
				id = groupData[this.options.keyNames.groupId],
				name = groupData[this.options.keyNames.groupName],
				title = groupData[this.options.keyNames.groupTitle],
				$group = this.groups[id] == null ? $(templates.group) : this.groups[id].$object,
				$groupHeader = $group.children("." + classNames.groupHeader)
			;

			$groupHeader.text(name || id)
				.attr("title", title || name || id)
				.attr("data-id", id);

			if (this.groups[id] == null) {
				this._$groupCntr.append($group);
				this.groups[id] = {
					$object: $group,
					data: groupData,
					items: []
				};

				$groupHeader.click(function() {
					var b = _isAllItemsSelected(_this.groups[id]);
					for (var i in _this.groups[id].items) {
						var item = _this.groups[id].items[i];
						_setItemSelected(item, !b);
					}
				});
			} else {
				this.groups[id].data = groupData;
			}

			return this.groups[id];
		},

		addItem: function(data) {
			var _this = this,
				id = data[this.options.keyNames.itemId],
				name = data[this.options.keyNames.itemName],
				title = data[this.options.keyNames.itemTitle],
				groupId = data[this.options.keyNames.parentId],
				group = this.groups[groupId] != null ? this.groups[groupId] : this.addGroup((function(){
					var o = {};
					o[_this.options.keyNames.groupId] = groupId;
					return o;
				})()),
				$item = $(templates.item),
				itemObject = null
			;

			$item.text(name || id)
				.attr("title", title || name || id)
				.attr("data-id", id)
				.click(function() {
					_setItemSelected(itemObject, !itemObject.selected);
				});

			itemObject = {
				$object: $item,
				data: data
			};

			group.$object.children("." + classNames.itemCntr).append($item);
			group.items.push(itemObject);
		},

		getSelectedItems: function() {
			var selectedItems = [];
			for (var i in this.groups) {
				var group = this.groups[i];
				for (var j in group.items) {
					var item = group.items[j];
					if (item.selected) {
						selectedItems.push(item.data);
					}
				}
			}

			return selectedItems;
		},

		getSelectedItemsByGroup: function() {
			var groupedItems = {};
			for (var i in this.groups) {
				var group = this.groups[i];
				groupedItems[i] = [];
				for (var j in group.items) {
					var item = group.items[j];
					if (item.selected) {
						groupedItems[i].push(item.data);
					}
				}
			}

			return groupedItems;
		},

		getSelectedItemNames: function() {
			var selectedItems = this.getSelectedItems();
			var keyId = this.options.keyNames.itemId;
			var keyName = this.options.keyNames.itemName;
			var selectedItemNames = [];
			for(var i in selectedItems) {
				selectedItemNames.push(selectedItems[i][keyName] || selectedItems[i][keyId]);
			}

			return selectedItemNames;
		},

		getSelectedItemIds: function() {
			var selectedItems = this.getSelectedItems();
			var keyId = this.options.keyNames.itemId;
			var selectedItemIds = [];
			for(var i in selectedItems) {
				selectedItemIds.push(selectedItems[i][keyId]);
			}

			return selectedItemIds;
		},

		confirm: function(b) {
			_refreshSelectedStatus.call(this, true);
			b !== false && _triggerOnConfirm.call(this);
		},

		cancel: function(b) {
			_refreshSelectedStatus.call(this, false);
			b !== false && _triggerOnCancel.call(this);
		},

		getInstance: function() {
			return this;
		}
	};
	//========= public methods end ==============


	//========= jQuery plugin ==============
	$.fn.farmSelector = function(arg) {
        if (this.length == 0) {
            return this;
        } else if (FarmSelector.prototype[arg] != null) {
            var func = FarmSelector.prototype[arg];
            var ins = $(this[0]).data("farmSelector");
            if (ins == null) {
            	ins =  new FarmSelector(this);
            }

            if (typeof func == "function") {
                return func.apply(ins, Array.prototype.slice.call(arguments, 1));
            } else {
                return ins[arg];
            }
        } else {
            return this.each(function() {
                var instance = $(this).data("farmSelector");
                if (instance == null) {
                    instance = new FarmSelector(this, arg);
                    $.data(this, "farmSelector", instance);
                }
            });
        }
    };
    //========= jQuery widget end==============
})(jQuery);