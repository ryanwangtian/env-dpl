(function($) {
	var dftOptions = {
		//itemsPerPage: 10,
		itemsPerPageList: [10, 30, 50],
		totalItems: 0,
		displayPages: 10,
		edgePages:1,
		curPage: 1,
		text: {
			prev: "Prev",
			next: "Next",
			ellipse: "...",
			totalPagesPrefix: "Page",
			totalPagesInfix: "of",
			totalPagesSufix: ""
		},
		showPrev: true,
		showNext: true,
		showTotalPages: true,
		showItemsPerPage: true,
		showChangePage: true,
		callback: function(page, epg){return false;}
	};

	var classNames = {
		cntr: "epg-cntr",
		prevBtn: "prev-btn",
		nextBtn: "next-btn",
		pageBtn: "pg-btn",
		ellipse: "ellipse",
		current: "cur",
		changePage: "epg-pg-input",
		totalPages: "epg-tp",
		itemsPerPage: "epg-ipp"
	};

	var templates = {
		prev: "<a class='" + classNames.prevBtn + "'></a>",
		next: "<a class='" + classNames.nextBtn + "'></a>",
		pageBtn: "<a class='" + classNames.pageBtn + "'></a>",
		ellipse: "<span class='" + classNames.ellipse + "'></span>",
		changePage: "<input class='" + classNames.changePage + "'/>",
		totalPages: "<span class='" + classNames.totalPages + "'><span></span><span></span><span></span></span>",
		itemsPerPage: "<select class='" + classNames.itemsPerPage + "'></select>"
	};

	function EnvPagination(element, options) {
		if (element == null) {
			return;
		}
		
		this._options = $.extend({}, dftOptions, options);
		this._itemsPerPage = this._options.itemsPerPageList[0];
		this._$container = $(element).addClass(classNames.cntr);

		this.init();
	}

	EnvPagination.prototype = {
		constructor: EnvPagination,
		_getPageCount: function() {
			return Math.ceil(this._options.totalItems / this._itemsPerPage);
		},
		_drawPrevBtn: function() {
			if (this._options.showPrev) {
				var $prev = $(templates.prev).text(this._options.text.prev);
				this._$container.prepend($prev);
			}
		},
		_drawNextBtn: function () {
			if (this._options.showNext) {
				var $next = $(templates.next).text(this._options.text.next);
				this._$container.append($next);
			}
		},
		_drawPageBtns: function() {
			var count = this._getPageCount();
			var displayPages = this._options.displayPages;
			var edgePages = this._options.edgePages;
			var leftDisplayPages = Math.ceil(displayPages / 2); //include current Page
			var rightDisplayPages = displayPages - leftDisplayPages;
			var curPage = this._options.curPage;

			if (count <= displayPages + edgePages) {
				//never display ellipse
				this._appendPageBtns(1, count);
			} else if (count > displayPages + edgePages && count <= displayPages + 2 * edgePages) {
				//only display one ellipse
				if (curPage <= edgePages){
					this._appendPageBtns(1, curPage + displayPages);
					this._appendEllipse();
					this._appendPageBtns(count - edgePages + 1, count);
				} else if (curPage >= count - edgePages + 1) {
					this._appendPageBtns(1, edgePages);
					this._appendEllipse();
					this._appendPageBtns(curPage - displayPages + 1, count);
				} else {
					this._appendPageBtns(1, count);
				}
			} else {
				if (curPage <= edgePages){
					this._appendPageBtns(1, curPage + displayPages);
					this._appendEllipse();
					this._appendPageBtns(count - edgePages + 1, count);
				} else if (curPage >= count - edgePages + 1) {
					this._appendPageBtns(1, edgePages);
					this._appendEllipse();
					this._appendPageBtns(curPage - displayPages + 1, count);
				} else {
					this._appendPageBtns(1, edgePages);

					if (curPage - leftDisplayPages <= edgePages) {
						this._appendPageBtns(edgePages + 1, edgePages + displayPages);
						this._appendEllipse();
					} else if (curPage + rightDisplayPages + edgePages >= count) {
						this._appendEllipse();
						this._appendPageBtns(count - edgePages - displayPages + 1, count - edgePages);
					} else {
						this._appendEllipse();
						this._appendPageBtns(curPage - leftDisplayPages + 1, curPage + rightDisplayPages);
						this._appendEllipse();
					}
					this._appendPageBtns(count - edgePages + 1, count);
				}
			}
		},
		_drawChangePage: function() {
			if (this._options.showChangePage) {
				var _this = this;
				var $changePage = $(templates.changePage).val(this._options.curPage);

				$changePage.keydown(function(e) {
					if(e.keyCode == 13){
						var page = parseInt($changePage.val());
						if (!isNaN(page)) {
							_this.setCurPage(page, true);
						}
					}
				});

				if (this._options.showTotalPages) {
					var $totalPages = $(templates.totalPages);
					var spans = $totalPages.children("span");
					$(spans[0]).text(this._options.text.totalPagesPrefix).after($changePage);
					$(spans[1]).text(this._options.text.totalPagesInfix).after("<span>" + this._getPageCount() + "</span>");
					$(spans[2]).text(this._options.text.totalPagesSufix);
					this._$container.append($totalPages);
				} else {
					this._$container.append($changePage);
				}
			}
		},
		_drawItemsPerPage: function() {
			if (this._options.showItemsPerPage) {
				var _this = this;
				var $ipp = $(templates.itemsPerPage);
				for (var i in this._options.itemsPerPageList) {
					var n = parseInt(this._options.itemsPerPageList[i]);
					$ipp[0].options.add( new Option(n, n));
				}
				$ipp.val(this._itemsPerPage).change(function() {
					_this._itemsPerPage = $(this).val();
					_this.setCurPage(_this.getCurPage(), true);
					_this.init();
				});

				this._$container.append($ipp);
			}
		},
		_appendAPageBtn: function(pageNum) {
			var btn = $(templates.pageBtn).text(pageNum);
			this._$container.append(btn);
			if (this._options.curPage == pageNum) {
				btn.addClass(classNames.current);
			}
		},
		_appendPageBtns: function(startNum, endNum) {
			for(var i = startNum; i <= endNum; i++) {
				this._appendAPageBtn(i);
			}
		},
		_appendEllipse: function() {
			this._$container.append($(templates.ellipse).text(this._options.text.ellipse));
		},
		_bindClickedCallback: function() {
			var _this = this;
			this._$container.children("a").click(function() {
				var $this = $(this);
				var curPage;
				if ($this.hasClass(classNames.prevBtn)) {
					curPage = _this.getCurPage();
					if (curPage > 1) {
						_this.setCurPage(curPage - 1);
						_this._callback();
					}
				} else if ($this.hasClass(classNames.nextBtn)) {
					curPage = _this.getCurPage();
					var pageCount = _this._getPageCount();
					if (curPage < pageCount) {
						_this.setCurPage(curPage + 1);
						_this._callback();
					}
				} else {
					curPage = parseInt($this.text());
					if (curPage != _this._options.curPage) {
						_this.setCurPage(curPage);
						_this._callback();
					}
				}
			});
		},
		_pageChanged: function() {
			this.init();
			this._callback();
		},
		_callback: function() {
			if (this._options.callback != null && typeof this._options.callback == "function") {
				this._options.callback(this._options.curPage, this);
			}
		},
		init: function() {
			this._$container.children().remove();
			this._drawPrevBtn();
			this._drawPageBtns();
			this._drawNextBtn();
			this._drawChangePage();
			this._drawItemsPerPage();
			this._bindClickedCallback();
		},
		getCurPage: function() {
			return this._options.curPage;
		},
		setCurPage: function(pageNum, bool) {
			var count = this._getPageCount();
			if (pageNum > count) {
				pageNum = count;
			} else if (pageNum < 1) {
				pageNum = 1;
			}
			if (this._options.curPage != pageNum) {
				this._options.curPage = pageNum;
				this.init();
			}

			if (bool) {
				this._callback();
			}
		},
		setOptions: function(opts, bool) {
			$.extend(true, this._options, opts);
			var count = this._getPageCount();
			var cur = this.getCurPage();
			if (cur > count) {
				this.setCurPage(count);
			}

			this.init();

			if (bool) {
				this._callback();
			}
		}
	};

	$.fn.envPagination = function(arg) {
		if (this.length == 0) {
			return this;
		} else if (EnvPagination.prototype[arg] != null) {
			var func = EnvPagination.prototype[arg];
			var ins = $(this[0]).data("envPagination");
			if (ins != null) {
				if (typeof func == "function") {
					return func.apply(ins, Array.prototype.slice.call(arguments, 1));
				} else {
					return ins[arg];
				}
			}
		} else if (arg == "getInstance") {
			return $(this[0]).data("envPagination");
		} else {
			return this.each(function() {
				var instance = $(this).data("envPagination");
				if (instance == null) {
					instance = new EnvPagination(this, arg);
					$.data(this, "envPagination", instance);
				} else {
					instance.setOptions(arg);
				}
			});
		}
	};
})(jQuery);