webpackJsonp([8],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	var log = __webpack_require__(12);
	log.init();

	var source_trigger = __webpack_require__(13);
	source_trigger.init();

	var last_select = __webpack_require__(14);
	last_select.init();

/***/ },

/***/ 12:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($, _) {/* global _ */
	var dialog = __webpack_require__(21);
	var Delegator = __webpack_require__(20);

	var logTable = __webpack_require__(127);
	var keyword = __webpack_require__(128);
	var debar = __webpack_require__(129);

	__webpack_require__(19);

	var logConfig = {
	        id: 0,
	        startDate: 0,
	        endDate: 0,
	        include: [],
	        exclude: [],
	        index: 0,
	        level: [1, 2, 4]
	    },

	    encodeHtml = function(str) {
	        return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
	    },

	    formatMsg = function (str){
	        return str.replace(/@/gi , '<br/><b style="color:#A78830">@</b> ')
	    };

	var maxDate = 60 * 60 * 1000 * 24 * 2;

	var currentSelectId = -1,
	    currentIndex = 0,
	    noData = false,
	    MAX_LIMIT = 500,
	    loading = false;

	function addKeyword() {
	    var value = $.trim($('#keyword-ipt').val());
	    if (value !== '') {
	        if (!removeValue(value, logConfig.include)) {
	            $('#keyword-group').append(keyword({
	                it: {
	                    value: value
	                },
	                opt: {
	                    encodeHtml: encodeHtml,
	                    set: Delegator.set
	                }
	            }));
	        }
	        logConfig.include.push(value);
	        $('#keyword-ipt').val('');
	    }
	}

	function addDebar() {
	    var value = $.trim($('#debar-ipt').val());
	    if (value !== '') {
	        if (!removeValue(value, logConfig.exclude)) {
	            $('#debar-group').append(debar({
	                it: {
	                    value: value
	                },
	                opt: {
	                    encodeHtml: encodeHtml,
	                    set: Delegator.set
	                }
	            }));
	        }
	        logConfig.exclude.push(value);
	        $('#debar-ipt').val('');
	    }
	}

	function bindEvent() {
	    new Delegator(document.body)
	        .on('click', 'searchBusiness', function() {
	            // search business
	        }).on('click', 'addKeyword', addKeyword)
	        .on('keyup', 'addKeyword', function(e) {
	            if (e.which === 13) addKeyword();
	        }).on('click', 'removeKeywords', function() {
	            logConfig.include.length = 0;
	            $('#keyword-group').empty();
	        }).on('click', 'removeKeyword', function(e, value) {
	            $(this).closest('.keyword-tag').remove();
	            removeValue(value, logConfig.include);
	        }).on('click', 'addDebar', addDebar)
	        .on('keyup', 'addDebar', function(e) {
	            if (e.which === 13) addDebar();
	        }).on('click', 'removeDebars', function() {
	            logConfig.exclude.length = 0;
	            $('#debar-group').empty();
	        }).on('click', 'removeDebar', function(e, value) {
	            $(this).closest('.keyword-tag').remove();
	            removeValue(value, logConfig.exclude);
	        }).on('click', 'showLogs', function() {
	            var startTime = ($('#startTime').val() || '').replace(/-/g, '/'),
	                endTime = ($('#endTime').val() || '').replace(/-/g, '/');
	            logConfig.startDate = startTime === '' ?
	                new Date().getTime() - maxDate :
	                new Date(startTime).getTime();
	            logConfig.endDate = endTime === '' ?
	                new Date().getTime() :
	                new Date(endTime).getTime();
	            //测试时间是否符合
	            if (isTimeRight(logConfig.startDate, logConfig.endDate)) {
	                showLogs(logConfig, false);
	            }
	        })
	        .on('click', 'alertModal', function(e) {
	            var $target=$(e.currentTarget);
	            $("#detailModal .id").text("#"+$target.text());
	            $("#detailModal .time").text($target.siblings('.td-2').text());
	            $("#detailModal .info").html($target.siblings('.td-3').html());
	            $("#detailModal .uin").text($target.siblings('.td-4').text());
	            $("#detailModal .ip").text($target.siblings('.td-5').text());
	            $("#detailModal .agent").text($target.siblings('.td-6').children("span:first-of-type").attr("title"));
	            $("#detailModal .source").html($target.siblings('.td-7').html());
	            $("#detailModal").show();
	            console.log(document.documentElement.style.overflow);
	            document.documentElement.style.overflow='hidden';
	            document.body.style.overflow='hidden';
	        }).on('click', 'closeModal', function(e){
	            if($(e.target).hasClass('click')){
	                $("#detailModal").hide();
	                document.documentElement.style.overflow='';
	                document.body.style.overflow='';
	            }
	            e.stopPropagation();
	            e.preventDefault();
	        }).on('change', 'selectBusiness', function() {
	            var val = $(this).val() - 0;
	            currentSelectId = val;
	            $('#log-table').html('');
	            currentIndex = 0;
	            noData = false;
	            logConfig.id = val;
	        }).on('click', 'showTd', function(e) {
	            var $target=$(e.currentTarget).toggleClass('active');
	            $('.main-table .'+$target.data('td')).toggleClass('active');
	            //保存用户偏好，隐藏为true
	            //console.log($target.data('td'));
	            localStorage.setItem($target.data('td'),!$target.hasClass('active'));
	            //console.log(localStorage);
	            window.classes[$target.data('td')]=$target.hasClass('active')?'active':'';
	        }).on('click', 'errorTypeClick', function() {
	            if ($(this).hasClass('msg-dis')) {
	                logConfig.level.push(4);
	                $(this).removeClass('msg-dis');
	            } else {
	                logConfig.level.splice($.inArray(4, logConfig.level), 1);
	                $(this).addClass('msg-dis');
	            }
	        }).on('click', 'logTypeClick', function() {
	            if ($(this).hasClass('msg-dis')) {
	                logConfig.level.push(2);
	                $(this).removeClass('msg-dis');
	            } else {
	                logConfig.level.splice($.inArray(2, logConfig.level), 1);
	                $(this).addClass('msg-dis');
	            }
	        }).on('click', 'debugTypeClick', function() {
	            if ($(this).hasClass('msg-dis')) {
	                logConfig.level.push(1);
	                $(this).removeClass('msg-dis');
	            } else {
	                logConfig.level.splice($.inArray(1, logConfig.level), 1);
	                $(this).addClass('msg-dis');
	            }
	        });

	    var throttled = _.throttle(function(e) {
	        var $this = $(this);
	        var top = $this.scrollTop();
	        var height = $this.height();
	        var scrollHeight = $this.prop('scrollHeight');

	        if (scrollHeight - height - top <= 200 && !noData) {
	            logConfig.id = currentSelectId;
	            showLogs(logConfig, true);
	        }
	    }, 100);

	    $('.main-mid').scroll(throttled);
	}

	function isTimeRight(begin, end) {
	    if (begin > end) {
	        dialog({
	            header: '时间范围错误',
	            body: '结束时间必须在开始时间之后！'
	        });
	        return false;
	    } else if (end - maxDate > begin) {
	        dialog({
	            header: '时间范围错误',
	            body: '结束时间和开始时间间隔需在三天之内！'
	        });
	        return false;
	    }
	    return true;

	}

	function removeValue(value, arr) {
	    for (var l = arr.length; l--;) {
	        if (arr[l] === value) {
	            return arr.splice(l, 1);
	        }
	    }
	}

	function showLogs(opts, isAdd) {
	    opts.id = $('#select-business').val() >> 0; // jshint ignore:line
	    if (opts.id <= 0 || loading) {
	        !loading && dialog({
	            header: '警告',
	            body: '请选择一个项目'
	        });
	        return;
	    }

	    loading = true;

	    $(".setting-search").text("正在加载...")


	    if (!isAdd) {
	        currentIndex = 0;
	        noData = false;
	    }

	    var url = '/controller/logAction/queryLogList.do';
	    $.ajax({
	        url: url,
	        data: {
	            id: opts.id,
	            startDate: opts.startDate,
	            endDate: opts.endDate,
	            include: opts.include,
	            exclude: opts.exclude,
	            index: currentIndex,
	            _t: new Date() - 0,
	            level: opts.level
	        },
	        success: function(data) {
	            $(".setting-search").text("查询日志")
	            var ret = data.ret;
	            if (ret === 0) {
	                var param = {
	                    encodeHtml: encodeHtml,
	                    set: Delegator.set,
	                    startIndex: currentIndex * MAX_LIMIT,
	                    formatMsg : formatMsg
	                };

	                if (isAdd) {
	                    $('#log-table').append(logTable({
	                        it: data.data,
	                        opt: param,
	                        classes: window.classes
	                    }));
	                } else {
	                    $('#log-table').html(logTable({
	                        it: data.data,
	                        opt: param,
	                        classes: window.classes
	                    }));
	                }

	                currentIndex++;
	                if (data.data.length === 0) {
	                    noData = true;
	                }
	            }else {
	                dialog({
	                    header: '查询失败',
	                    body: JSON.stringify(data.msg)
	                });
	            }
	            loading = false;
	        },
	        error: function() {
	            $(".setting-search").text("查询日志")
	            loading = false;
	        }
	    });
	}

	function init() {
	    bindEvent();
	    //读取用户偏好
	    var items=$("#content .right-side .setting-show .item");
	    window.classes={};
	    //console.log(localStorage);
	    for(var i=0;i<items.length;i++){
	        var item=$(items[i]);
	        if(localStorage.getItem(item.data("td"))==='true'){
	            item.removeClass('active');
	            $('.main-table .'+item.data('td')).removeClass('active');
	            window.classes[item.data('td')]='';
	        }else{
	            window.classes[item.data('td')]='active';
	        }
	    }
	    $('#content .mid-side .main-table thead tr').show();
	    $('#content .right-side .setting-show').show();

	    $(".datetimepicker").datetimepicker({
	        format: 'YYYY-MM-DD HH:mm'
	    }).data("DateTimePicker").setMaxDate(new Date());

	    $('#startTime').data("DateTimePicker").setDate(new Date(new Date() - maxDate));
	    $('#endTime').data("DateTimePicker").setDate(new Date());
	}

	exports.init = init;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4), __webpack_require__(5)))

/***/ },

/***/ 13:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {exports.init = function() {
		var not_show_source_page = false;
		var hideform_class_name = 'main-table-hidefrom';

		try {
			not_show_source_page = !!localStorage.not_show_source_page;
			$('.main-table')[not_show_source_page ? 'addClass' : 'removeClass'](hideform_class_name);
		} catch (ex) {}

		var update_source = function(show_source_page) {
			if (show_source_page) {
				$('.main-table').removeClass(hideform_class_name);
				$('#log-table .source_page_link').each(function() {
					var $this = $(this);
					$this.text($this.data('viewlink'));
				});
			} else {
				$('.main-table').addClass(hideform_class_name);
				$('#log-table .source_page_link').each(function() {
					var $this = $(this);
					$this.text($this.data('viewtext'));
				});
			}
		};

		var $ssp = $('#show_source_page');
		$ssp.prop('checked', !not_show_source_page).on('change', function() {
			try {
				var show_source_page = $ssp.prop('checked');
				localStorage.not_show_source_page = show_source_page ? '' : '1';
				update_source(show_source_page);
			} catch (ex) {}
		});
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },

/***/ 14:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {exports.init = function(){
		var last_select = -1;
		
		try {

		    last_select = localStorage.last_select >> 0; // jshint ignore:line
			
			var $sb = $('#select-business');
			
			last_select > 0 && $sb.find('[value=' + last_select + ']').length && $sb.val(last_select);

			$sb.on('change', function(){
				localStorage.last_select = $sb.val();
			});

		} catch (ex) {}

	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },

/***/ 19:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(jQuery) {/**
	 * @preserve jQuery DateTimePicker plugin v2.4.1
	 * @homepage http://xdsoft.net/jqplugins/datetimepicker/
	 * (c) 2014, Chupurnov Valeriy.
	 */
	/*global document,window,jQuery,setTimeout,clearTimeout*/
	(function ($) {
		'use strict';
		var default_options  = {
			i18n: {
				ar: { // Arabic
					months: [
						"كانون الثاني", "شباط", "آذار", "نيسان", "مايو", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"
					],
					dayOfWeek: [
						"ن", "ث", "ع", "خ", "ج", "س", "ح"
					]
				},
				ro: { // Romanian
					months: [
						"ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"
					],
					dayOfWeek: [
						"l", "ma", "mi", "j", "v", "s", "d"
					]
				},
				id: { // Indonesian
					months: [
						"Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"
					],
					dayOfWeek: [
						"Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"
					]
				},
				bg: { // Bulgarian
					months: [
						"Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
					],
					dayOfWeek: [
						"Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"
					]
				},
				fa: { // Persian/Farsi
					months: [
						'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
					],
					dayOfWeek: [
						'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'
					]
				},
				ru: { // Russian
					months: [
						'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
					],
					dayOfWeek: [
						"Вск", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"
					]
				},
				uk: { // Ukrainian
					months: [
						'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
					],
					dayOfWeek: [
						"Ндл", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Сбт"
					]
				},
				en: { // English
					months: [
						"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
					],
					dayOfWeek: [
						"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
					]
				},
				el: { // Ελληνικά
					months: [
						"Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"
					],
					dayOfWeek: [
						"Κυρ", "Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ"
					]
				},
				de: { // German
					months: [
						'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
					],
					dayOfWeek: [
						"So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"
					]
				},
				nl: { // Dutch
					months: [
						"januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"
					],
					dayOfWeek: [
						"zo", "ma", "di", "wo", "do", "vr", "za"
					]
				},
				tr: { // Turkish
					months: [
						"Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
					],
					dayOfWeek: [
						"Paz", "Pts", "Sal", "Çar", "Per", "Cum", "Cts"
					]
				},
				fr: { //French
					months: [
						"Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
					],
					dayOfWeek: [
						"Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"
					]
				},
				es: { // Spanish
					months: [
						"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
					],
					dayOfWeek: [
						"Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"
					]
				},
				th: { // Thai
					months: [
						'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
					],
					dayOfWeek: [
						'อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'
					]
				},
				pl: { // Polish
					months: [
						"styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"
					],
					dayOfWeek: [
						"nd", "pn", "wt", "śr", "cz", "pt", "sb"
					]
				},
				pt: { // Portuguese
					months: [
						"Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
					],
					dayOfWeek: [
						"Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"
					]
				},
				ch: { // Simplified Chinese
					months: [
						"一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
					],
					dayOfWeek: [
						"日", "一", "二", "三", "四", "五", "六"
					]
				},
				se: { // Swedish
					months: [
						"Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September",  "Oktober", "November", "December"
					],
					dayOfWeek: [
						"Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"
					]
				},
				kr: { // Korean
					months: [
						"1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"
					],
					dayOfWeek: [
						"일", "월", "화", "수", "목", "금", "토"
					]
				},
				it: { // Italian
					months: [
						"Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
					],
					dayOfWeek: [
						"Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"
					]
				},
				da: { // Dansk
					months: [
						"January", "Februar", "Marts", "April", "Maj", "Juni", "July", "August", "September", "Oktober", "November", "December"
					],
					dayOfWeek: [
						"Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"
					]
				},
				no: { // Norwegian
					months: [
						"Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"
					],
					dayOfWeek: [
						"Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"
					]
				},
				ja: { // Japanese
					months: [
						"1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"
					],
					dayOfWeek: [
						"日", "月", "火", "水", "木", "金", "土"
					]
				},
				vi: { // Vietnamese
					months: [
						"Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
					],
					dayOfWeek: [
						"CN", "T2", "T3", "T4", "T5", "T6", "T7"
					]
				},
				sl: { // Slovenščina
					months: [
						"Januar", "Februar", "Marec", "April", "Maj", "Junij", "Julij", "Avgust", "September", "Oktober", "November", "December"
					],
					dayOfWeek: [
						"Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"
					]
				},
				cs: { // Čeština
					months: [
						"Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
					],
					dayOfWeek: [
						"Ne", "Po", "Út", "St", "Čt", "Pá", "So"
					]
				},
				hu: { // Hungarian
					months: [
						"Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"
					],
					dayOfWeek: [
						"Va", "Hé", "Ke", "Sze", "Cs", "Pé", "Szo"
					]
				},
				az: { //Azerbaijanian (Azeri)
					months: [
						"Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
					],
					dayOfWeek: [
						"B", "Be", "Ça", "Ç", "Ca", "C", "Ş"
					]
				},
				bs: { //Bosanski
					months: [
						"Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
					],
					dayOfWeek: [
						"Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"
					]
				},
				ca: { //Català
					months: [
						"Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
					],
					dayOfWeek: [
						"Dg", "Dl", "Dt", "Dc", "Dj", "Dv", "Ds"
					]
				},
				'en-GB': { //English (British)
					months: [
						"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
					],
					dayOfWeek: [
						"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
					]
				},
				et: { //"Eesti"
					months: [
						"Jaanuar", "Veebruar", "Märts", "Aprill", "Mai", "Juuni", "Juuli", "August", "September", "Oktoober", "November", "Detsember"
					],
					dayOfWeek: [
						"P", "E", "T", "K", "N", "R", "L"
					]
				},
				eu: { //Euskara
					months: [
						"Urtarrila", "Otsaila", "Martxoa", "Apirila", "Maiatza", "Ekaina", "Uztaila", "Abuztua", "Iraila", "Urria", "Azaroa", "Abendua"
					],
					dayOfWeek: [
						"Ig.", "Al.", "Ar.", "Az.", "Og.", "Or.", "La."
					]
				},
				fi: { //Finnish (Suomi)
					months: [
						"Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"
					],
					dayOfWeek: [
						"Su", "Ma", "Ti", "Ke", "To", "Pe", "La"
					]
				},
				gl: { //Galego
					months: [
						"Xan", "Feb", "Maz", "Abr", "Mai", "Xun", "Xul", "Ago", "Set", "Out", "Nov", "Dec"
					],
					dayOfWeek: [
						"Dom", "Lun", "Mar", "Mer", "Xov", "Ven", "Sab"
					]
				},
				hr: { //Hrvatski
					months: [
						"Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"
					],
					dayOfWeek: [
						"Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"
					]
				},
				ko: { //Korean (한국어)
					months: [
						"1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"
					],
					dayOfWeek: [
						"일", "월", "화", "수", "목", "금", "토"
					]
				},
				lt: { //Lithuanian (lietuvių)
					months: [
						"Sausio", "Vasario", "Kovo", "Balandžio", "Gegužės", "Birželio", "Liepos", "Rugpjūčio", "Rugsėjo", "Spalio", "Lapkričio", "Gruodžio"
					],
					dayOfWeek: [
						"Sek", "Pir", "Ant", "Tre", "Ket", "Pen", "Šeš"
					]
				},
				lv: { //Latvian (Latviešu)
					months: [
						"Janvāris", "Februāris", "Marts", "Aprīlis ", "Maijs", "Jūnijs", "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris"
					],
					dayOfWeek: [
						"Sv", "Pr", "Ot", "Tr", "Ct", "Pk", "St"
					]
				},
				mk: { //Macedonian (Македонски)
					months: [
						"јануари", "февруари", "март", "април", "мај", "јуни", "јули", "август", "септември", "октомври", "ноември", "декември"
					],
					dayOfWeek: [
						"нед", "пон", "вто", "сре", "чет", "пет", "саб"
					]
				},
				mn: { //Mongolian (Монгол)
					months: [
						"1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар", "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар"
					],
					dayOfWeek: [
						"Дав", "Мяг", "Лха", "Пүр", "Бсн", "Бям", "Ням"
					]
				},
				'pt-BR': { //Português(Brasil)
					months: [
						"Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
					],
					dayOfWeek: [
						"Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"
					]
				},
				sk: { //Slovenčina
					months: [
						"Január", "Február", "Marec", "Apríl", "Máj", "Jún", "Júl", "August", "September", "Október", "November", "December"
					],
					dayOfWeek: [
						"Ne", "Po", "Ut", "St", "Št", "Pi", "So"
					]
				},
				sq: { //Albanian (Shqip)
					months: [
						"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
					],
					dayOfWeek: [
						"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
					]
				},
				'sr-YU': { //Serbian (Srpski)
					months: [
						"Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
					],
					dayOfWeek: [
						"Ned", "Pon", "Uto", "Sre", "čet", "Pet", "Sub"
					]
				},
				sr: { //Serbian Cyrillic (Српски)
					months: [
						"јануар", "фебруар", "март", "април", "мај", "јун", "јул", "август", "септембар", "октобар", "новембар", "децембар"
					],
					dayOfWeek: [
						"нед", "пон", "уто", "сре", "чет", "пет", "суб"
					]
				},
				sv: { //Svenska
					months: [
						"Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"
					],
					dayOfWeek: [
						"Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"
					]
				},
				'zh-TW': { //Traditional Chinese (繁體中文)
					months: [
						"一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
					],
					dayOfWeek: [
						"日", "一", "二", "三", "四", "五", "六"
					]
				},
				zh: { //Simplified Chinese (简体中文)
					months: [
						"一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
					],
					dayOfWeek: [
						"日", "一", "二", "三", "四", "五", "六"
					]
				},
				he: { //Hebrew (עברית)
					months: [
						'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
					],
					dayOfWeek: [
						'א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'שבת'
					]
				}
			},
			value: '',
			lang: 'en',

			format:	'Y/m/d H:i',
			formatTime:	'H:i',
			formatDate:	'Y/m/d',

			startDate:	false, // new Date(), '1986/12/08', '-1970/01/05','-1970/01/05',
			step: 60,
			monthChangeSpinner: true,

			closeOnDateSelect: false,
			closeOnWithoutClick: true,
			closeOnInputClick: true,

			timepicker: true,
			datepicker: true,
			weeks: false,

			defaultTime: false,	// use formatTime format (ex. '10:00' for formatTime:	'H:i')
			defaultDate: false,	// use formatDate format (ex new Date() or '1986/12/08' or '-1970/01/05' or '-1970/01/05')

			minDate: false,
			maxDate: false,
			minTime: false,
			maxTime: false,

			allowTimes: [],
			opened: false,
			initTime: true,
			inline: false,
			theme: '',

			onSelectDate: function () {},
			onSelectTime: function () {},
			onChangeMonth: function () {},
			onChangeYear: function () {},
			onChangeDateTime: function () {},
			onShow: function () {},
			onClose: function () {},
			onGenerate: function () {},

			withoutCopyright: true,
			inverseButton: false,
			hours12: false,
			next:	'xdsoft_next',
			prev : 'xdsoft_prev',
			dayOfWeekStart: 0,
			parentID: 'body',
			timeHeightInTimePicker: 25,
			timepickerScrollbar: true,
			todayButton: true,
			defaultSelect: true,

			scrollMonth: true,
			scrollTime: true,
			scrollInput: true,

			lazyInit: false,
			mask: false,
			validateOnBlur: true,
			allowBlank: true,
			yearStart: 1950,
			yearEnd: 2050,
			style: '',
			id: '',
			fixed: false,
			roundTime: 'round', // ceil, floor
			className: '',
			weekends: [],
			disabledDates : [],
			yearOffset: 0,
			beforeShowDay: null,

			enterLikeTab: true
		};
		// fix for ie8
		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function (obj, start) {
				var i, j;
				for (i = (start || 0), j = this.length; i < j; i += 1) {
					if (this[i] === obj) { return i; }
				}
				return -1;
			};
		}
		Date.prototype.countDaysInMonth = function () {
			return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();
		};
		$.fn.extend ( "xdsoftScroller"   ,  function (percent) {
			return this.each(function () {
				var timeboxparent = $(this),
					pointerEventToXY = function (e) {
						var out = {x: 0, y: 0},
							touch;
						if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
							touch  = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
							out.x = touch.clientX;
							out.y = touch.clientY;
						} else if (e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'mousemove' || e.type === 'mouseover' || e.type === 'mouseout' || e.type === 'mouseenter' || e.type === 'mouseleave') {
							out.x = e.clientX;
							out.y = e.clientY;
						}
						return out;
					},
					move = 0,
					timebox,
					parentHeight,
					height,
					scrollbar,
					scroller,
					maximumOffset = 100,
					start = false,
					startY = 0,
					startTop = 0,
					h1 = 0,
					touchStart = false,
					startTopScroll = 0,
					calcOffset = function () {};
				if (percent === 'hide') {
					timeboxparent.find('.xdsoft_scrollbar').hide();
					return;
				}
				if (!$(this).hasClass('xdsoft_scroller_box')) {
					timebox = timeboxparent.children().eq(0);
					parentHeight = timeboxparent[0].clientHeight;
					height = timebox[0].offsetHeight;
					scrollbar = $('<div class="xdsoft_scrollbar"></div>');
					scroller = $('<div class="xdsoft_scroller"></div>');
					scrollbar.append(scroller);

					timeboxparent.addClass('xdsoft_scroller_box').append(scrollbar);
					calcOffset = function calcOffset(event) {
						var offset = pointerEventToXY(event).y - startY + startTopScroll;
						if (offset < 0) {
							offset = 0;
						}
						if (offset + scroller[0].offsetHeight > h1) {
							offset = h1 - scroller[0].offsetHeight;
						}
						timeboxparent.trigger('scroll_element.xdsoft_scroller', [maximumOffset ? offset / maximumOffset : 0]);
					};

					scroller
						.on('touchstart.xdsoft_scroller mousedown.xdsoft_scroller', function (event) {
							if (!parentHeight) {
								timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percent]);
							}

							startY = pointerEventToXY(event).y;
							startTopScroll = parseInt(scroller.css('margin-top'), 10);
							h1 = scrollbar[0].offsetHeight;

							if (event.type === 'mousedown') {
								if (document) {
									$(document.body).addClass('xdsoft_noselect');
								}
								$([document.body, window]).on('mouseup.xdsoft_scroller', function arguments_callee() {
									$([document.body, window]).off('mouseup.xdsoft_scroller', arguments_callee)
										.off('mousemove.xdsoft_scroller', calcOffset)
										.removeClass('xdsoft_noselect');
								});
								$(document.body).on('mousemove.xdsoft_scroller', calcOffset);
							} else {
								touchStart = true;
								event.stopPropagation();
								event.preventDefault();
							}
						})
						.on('touchmove', function (event) {
							if (touchStart) {
								event.preventDefault();
								calcOffset(event);
							}
						})
						.on('touchend touchcancel', function (event) {
							touchStart =  false;
							startTopScroll = 0;
						});

					timeboxparent
						.on('scroll_element.xdsoft_scroller', function (event, percentage) {
							if (!parentHeight) {
								timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percentage, true]);
							}
							percentage = percentage > 1 ? 1 : (percentage < 0 || isNaN(percentage)) ? 0 : percentage;

							scroller.css('margin-top', maximumOffset * percentage);

							setTimeout(function () {
								timebox.css('marginTop', -parseInt((timebox[0].offsetHeight - parentHeight) * percentage, 10));
							}, 10);
						})
						.on('resize_scroll.xdsoft_scroller', function (event, percentage, noTriggerScroll) {
							var percent, sh;
							parentHeight = timeboxparent[0].clientHeight;
							height = timebox[0].offsetHeight;
							percent = parentHeight / height;
							sh = percent * scrollbar[0].offsetHeight;
							if (percent > 1) {
								scroller.hide();
							} else {
								scroller.show();
								scroller.css('height', parseInt(sh > 10 ? sh : 10, 10));
								maximumOffset = scrollbar[0].offsetHeight - scroller[0].offsetHeight;
								if (noTriggerScroll !== true) {
									timeboxparent.trigger('scroll_element.xdsoft_scroller', [percentage || Math.abs(parseInt(timebox.css('marginTop'), 10)) / (height - parentHeight)]);
								}
							}
						});

					timeboxparent.on('mousewheel', function (event) {
						var top = Math.abs(parseInt(timebox.css('marginTop'), 10));

						top = top - (event.deltaY * 20);
						if (top < 0) {
							top = 0;
						}

						timeboxparent.trigger('scroll_element.xdsoft_scroller', [top / (height - parentHeight)]);
						event.stopPropagation();
						return false;
					});

					timeboxparent.on('touchstart', function (event) {
						start = pointerEventToXY(event);
						startTop = Math.abs(parseInt(timebox.css('marginTop'), 10));
					});

					timeboxparent.on('touchmove', function (event) {
						if (start) {
							event.preventDefault();
							var coord = pointerEventToXY(event);
							timeboxparent.trigger('scroll_element.xdsoft_scroller', [(startTop - (coord.y - start.y)) / (height - parentHeight)]);
						}
					});

					timeboxparent.on('touchend touchcancel', function (event) {
						start = false;
						startTop = 0;
					});
				}
				timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percent]);
			});
		});

		$.fn.extend ( "datetimepicker" , function (opt) {
			var KEY0 = 48,
				KEY9 = 57,
				_KEY0 = 96,
				_KEY9 = 105,
				CTRLKEY = 17,
				DEL = 46,
				ENTER = 13,
				ESC = 27,
				BACKSPACE = 8,
				ARROWLEFT = 37,
				ARROWUP = 38,
				ARROWRIGHT = 39,
				ARROWDOWN = 40,
				TAB = 9,
				F5 = 116,
				AKEY = 65,
				CKEY = 67,
				VKEY = 86,
				ZKEY = 90,
				YKEY = 89,
				ctrlDown	=	false,
				options = ($.isPlainObject(opt) || !opt) ? $.extend(true, {}, default_options, opt) : $.extend(true, {}, default_options),

				lazyInitTimer = 0,
				createDateTimePicker,
				destroyDateTimePicker,
				_xdsoft_datetime,

				lazyInit = function (input) {
					input
						.on('open.xdsoft focusin.xdsoft mousedown.xdsoft', function initOnActionCallback(event) {
							if (input.is(':disabled') || input.is(':hidden') || !input.is(':visible') || input.data('xdsoft_datetimepicker')) {
								return;
							}
							clearTimeout(lazyInitTimer);
							lazyInitTimer = setTimeout(function () {

								if (!input.data('xdsoft_datetimepicker')) {
									createDateTimePicker(input);
								}
								input
									.off('open.xdsoft focusin.xdsoft mousedown.xdsoft', initOnActionCallback)
									.trigger('open.xdsoft');
							}, 100);
						});
				};

			createDateTimePicker = function (input) {
				var datetimepicker = $('<div ' + (options.id ? 'id="' + options.id + '"' : '') + ' ' + (options.style ? 'style="' + options.style + '"' : '') + ' class="xdsoft_datetimepicker xdsoft_' + options.theme + ' xdsoft_noselect ' + (options.weeks ? ' xdsoft_showweeks' : '') + options.className + '"></div>'),
					xdsoft_copyright = $('<div class="xdsoft_copyright"><a target="_blank" href="http://xdsoft.net/jqplugins/datetimepicker/">xdsoft.net</a></div>'),
					datepicker = $('<div class="xdsoft_datepicker active"></div>'),
					mounth_picker = $('<div class="xdsoft_mounthpicker"><button type="button" class="xdsoft_prev"></button><button type="button" class="xdsoft_today_button"></button>' +
						'<div class="xdsoft_label xdsoft_month"><span></span><i></i></div>' +
						'<div class="xdsoft_label xdsoft_year"><span></span><i></i></div>' +
						'<button type="button" class="xdsoft_next"></button></div>'),
					calendar = $('<div class="xdsoft_calendar"></div>'),
					timepicker = $('<div class="xdsoft_timepicker active"><button type="button" class="xdsoft_prev"></button><div class="xdsoft_time_box"></div><button type="button" class="xdsoft_next"></button></div>'),
					timeboxparent = timepicker.find('.xdsoft_time_box').eq(0),
					timebox = $('<div class="xdsoft_time_variant"></div>'),
					/*scrollbar = $('<div class="xdsoft_scrollbar"></div>'),
					scroller = $('<div class="xdsoft_scroller"></div>'),*/
					monthselect = $('<div class="xdsoft_select xdsoft_monthselect"><div></div></div>'),
					yearselect = $('<div class="xdsoft_select xdsoft_yearselect"><div></div></div>'),
					triggerAfterOpen = false,
					XDSoft_datetime,
					//scroll_element,
					xchangeTimer,
					timerclick,
					current_time_index,
					setPos,
					timer = 0,
					timer1 = 0;

				mounth_picker
					.find('.xdsoft_month span')
						.after(monthselect);
				mounth_picker
					.find('.xdsoft_year span')
						.after(yearselect);

				mounth_picker
					.find('.xdsoft_month,.xdsoft_year')
						.on('mousedown.xdsoft', function (event) {
						var select = $(this).find('.xdsoft_select').eq(0),
							val = 0,
							top = 0,
							visible = select.is(':visible'),
							items,
							i;

						mounth_picker
							.find('.xdsoft_select')
								.hide();
						if (_xdsoft_datetime.currentTime) {
							val = _xdsoft_datetime.currentTime[$(this).hasClass('xdsoft_month') ? 'getMonth' : 'getFullYear']();
						}

						select[visible ? 'hide' : 'show']();
						for (items = select.find('div.xdsoft_option'), i = 0; i < items.length; i += 1) {
							if (items.eq(i).data('value') === val) {
								break;
							} else {
								top += items[0].offsetHeight;
							}
						}

						select.xdsoftScroller(top / (select.children()[0].offsetHeight - (select[0].clientHeight)));
						event.stopPropagation();
						return false;
					});

				mounth_picker
					.find('.xdsoft_select')
						.xdsoftScroller()
					.on('mousedown.xdsoft', function (event) {
						event.stopPropagation();
						event.preventDefault();
					})
					.on('mousedown.xdsoft', '.xdsoft_option', function (event) {
						var year = _xdsoft_datetime.currentTime.getFullYear();
						if (_xdsoft_datetime && _xdsoft_datetime.currentTime) {
							_xdsoft_datetime.currentTime[$(this).parent().parent().hasClass('xdsoft_monthselect') ? 'setMonth' : 'setFullYear']($(this).data('value'));
						}

						$(this).parent().parent().hide();

						datetimepicker.trigger('xchange.xdsoft');
						if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
							options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
						}

						if (year !== _xdsoft_datetime.currentTime.getFullYear() && $.isFunction(options.onChangeYear)) {
							options.onChangeYear.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
						}
					});

				datetimepicker.setOptions = function (_options) {
					options = $.extend(true, {}, options, _options);

					if (_options.allowTimes && $.isArray(_options.allowTimes) && _options.allowTimes.length) {
						options.allowTimes = $.extend(true, [], _options.allowTimes);
					}

					if (_options.weekends && $.isArray(_options.weekends) && _options.weekends.length) {
						options.weekends = $.extend(true, [], _options.weekends);
					}

					if (_options.disabledDates && $.isArray(_options.disabledDates) && _options.disabledDates.length) {
	                    options.disabledDates = $.extend(true, [], _options.disabledDates);
	                }

					if ((options.open || options.opened) && (!options.inline)) {
						input.trigger('open.xdsoft');
					}

					if (options.inline) {
						triggerAfterOpen = true;
						datetimepicker.addClass('xdsoft_inline');
						input.after(datetimepicker).hide();
					}

					if (options.inverseButton) {
						options.next = 'xdsoft_prev';
						options.prev = 'xdsoft_next';
					}

					if (options.datepicker) {
						datepicker.addClass('active');
					} else {
						datepicker.removeClass('active');
					}

					if (options.timepicker) {
						timepicker.addClass('active');
					} else {
						timepicker.removeClass('active');
					}

					if (options.value) {
						if (input && input.val) {
							input.val(options.value);
						}
						_xdsoft_datetime.setCurrentTime(options.value);
					}

					if (isNaN(options.dayOfWeekStart)) {
						options.dayOfWeekStart = 0;
					} else {
						options.dayOfWeekStart = parseInt(options.dayOfWeekStart, 10) % 7;
					}

					if (!options.timepickerScrollbar) {
						timeboxparent.xdsoftScroller('hide');
					}

					if (options.minDate && /^-(.*)$/.test(options.minDate)) {
						options.minDate = _xdsoft_datetime.strToDateTime(options.minDate).dateFormat(options.formatDate);
					}

					if (options.maxDate &&  /^\+(.*)$/.test(options.maxDate)) {
						options.maxDate = _xdsoft_datetime.strToDateTime(options.maxDate).dateFormat(options.formatDate);
					}

					mounth_picker
						.find('.xdsoft_today_button')
							.css('visibility', !options.todayButton ? 'hidden' : 'visible');

					if (options.mask) {
						var e,
							getCaretPos = function (input) {
								try {
									if (document.selection && document.selection.createRange) {
										var range = document.selection.createRange();
										return range.getBookmark().charCodeAt(2) - 2;
									}
									if (input.setSelectionRange) {
										return input.selectionStart;
									}
								} catch (e) {
									return 0;
								}
							},
							setCaretPos = function (node, pos) {
								node = (typeof node === "string" || node instanceof String) ? document.getElementById(node) : node;
								if (!node) {
									return false;
								}
								if (node.createTextRange) {
									var textRange = node.createTextRange();
									textRange.collapse(true);
									textRange.moveEnd('character', pos);
									textRange.moveStart('character', pos);
									textRange.select();
									return true;
								}
								if (node.setSelectionRange) {
									node.setSelectionRange(pos, pos);
									return true;
								}
								return false;
							},
							isValidValue = function (mask, value) {
								var reg = mask
									.replace(/([\[\]\/\{\}\(\)\-\.\+]{1})/g, '\\$1')
									.replace(/_/g, '{digit+}')
									.replace(/([0-9]{1})/g, '{digit$1}')
									.replace(/\{digit([0-9]{1})\}/g, '[0-$1_]{1}')
									.replace(/\{digit[\+]\}/g, '[0-9_]{1}');
								return (new RegExp(reg)).test(value);
							};
						input.off('keydown.xdsoft');

						if (options.mask === true) {
							options.mask = options.format
								.replace(/Y/g, '9999')
								.replace(/F/g, '9999')
								.replace(/m/g, '19')
								.replace(/d/g, '39')
								.replace(/H/g, '29')
								.replace(/i/g, '59')
								.replace(/s/g, '59');
						}

						if ($.type(options.mask) === 'string') {
							if (!isValidValue(options.mask, input.val())) {
								input.val(options.mask.replace(/[0-9]/g, '_'));
							}

							input.on('keydown.xdsoft', function (event) {
								var val = this.value,
									key = event.which,
									pos,
									digit;

								if (((key >= KEY0 && key <= KEY9) || (key >= _KEY0 && key <= _KEY9)) || (key === BACKSPACE || key === DEL)) {
									pos = getCaretPos(this);
									digit = (key !== BACKSPACE && key !== DEL) ? String.fromCharCode((_KEY0 <= key && key <= _KEY9) ? key - KEY0 : key) : '_';

									if ((key === BACKSPACE || key === DEL) && pos) {
										pos -= 1;
										digit = '_';
									}

									while (/[^0-9_]/.test(options.mask.substr(pos, 1)) && pos < options.mask.length && pos > 0) {
										pos += (key === BACKSPACE || key === DEL) ? -1 : 1;
									}

									val = val.substr(0, pos) + digit + val.substr(pos + 1);
									if ($.trim(val) === '') {
										val = options.mask.replace(/[0-9]/g, '_');
									} else {
										if (pos === options.mask.length) {
											event.preventDefault();
											return false;
										}
									}

									pos += (key === BACKSPACE || key === DEL) ? 0 : 1;
									while (/[^0-9_]/.test(options.mask.substr(pos, 1)) && pos < options.mask.length && pos > 0) {
										pos += (key === BACKSPACE || key === DEL) ? -1 : 1;
									}

									if (isValidValue(options.mask, val)) {
										this.value = val;
										setCaretPos(this, pos);
									} else if ($.trim(val) === '') {
										this.value = options.mask.replace(/[0-9]/g, '_');
									} else {
										input.trigger('error_input.xdsoft');
									}
								} else {
									if (([AKEY, CKEY, VKEY, ZKEY, YKEY].indexOf(key) !== -1 && ctrlDown) || [ESC, ARROWUP, ARROWDOWN, ARROWLEFT, ARROWRIGHT, F5, CTRLKEY, TAB, ENTER].indexOf(key) !== -1) {
										return true;
									}
								}

								event.preventDefault();
								return false;
							});
						}
					}
					if (options.validateOnBlur) {
						input
							.off('blur.xdsoft')
							.on('blur.xdsoft', function () {
								if (options.allowBlank && !$.trim($(this).val()).length) {
									$(this).val(null);
									datetimepicker.data('xdsoft_datetime').empty();
								} else if (!Date.parseDate($(this).val(), options.format)) {
									$(this).val((_xdsoft_datetime.now()).dateFormat(options.format));
									datetimepicker.data('xdsoft_datetime').setCurrentTime($(this).val());
								} else {
									datetimepicker.data('xdsoft_datetime').setCurrentTime($(this).val());
								}
								datetimepicker.trigger('changedatetime.xdsoft');
							});
					}
					options.dayOfWeekStartPrev = (options.dayOfWeekStart === 0) ? 6 : options.dayOfWeekStart - 1;

					datetimepicker
						.trigger('xchange.xdsoft')
						.trigger('afterOpen.xdsoft');
				};

				datetimepicker
					.data('options', options)
					.on('mousedown.xdsoft', function (event) {
						event.stopPropagation();
						event.preventDefault();
						yearselect.hide();
						monthselect.hide();
						return false;
					});

				//scroll_element = timepicker.find('.xdsoft_time_box');
				timeboxparent.append(timebox);
				timeboxparent.xdsoftScroller();

				datetimepicker.on('afterOpen.xdsoft', function () {
					timeboxparent.xdsoftScroller();
				});

				datetimepicker
					.append(datepicker)
					.append(timepicker);

				if (options.withoutCopyright !== true) {
					datetimepicker
						.append(xdsoft_copyright);
				}

				datepicker
					.append(mounth_picker)
					.append(calendar);

				$(options.parentID)
					.append(datetimepicker);

				XDSoft_datetime = function () {
					var _this = this;
					_this.now = function (norecursion) {
						var d = new Date(),
							date,
							time;

						if (!norecursion && options.defaultDate) {
							date = _this.strToDate(options.defaultDate);
							d.setFullYear(date.getFullYear());
							d.setMonth(date.getMonth());
							d.setDate(date.getDate());
						}

						if (options.yearOffset) {
							d.setFullYear(d.getFullYear() + options.yearOffset);
						}

						if (!norecursion && options.defaultTime) {
							time = _this.strtotime(options.defaultTime);
							d.setHours(time.getHours());
							d.setMinutes(time.getMinutes());
						}

						return d;
					};

					_this.isValidDate = function (d) {
						if (Object.prototype.toString.call(d) !== "[object Date]") {
							return false;
						}
						return !isNaN(d.getTime());
					};

					_this.setCurrentTime = function (dTime) {
						_this.currentTime = (typeof dTime === 'string') ? _this.strToDateTime(dTime) : _this.isValidDate(dTime) ? dTime : _this.now();
						datetimepicker.trigger('xchange.xdsoft');
					};

					_this.empty = function () {
						_this.currentTime = null;
					};

					_this.getCurrentTime = function (dTime) {
						return _this.currentTime;
					};

					_this.nextMonth = function () {
						var month = _this.currentTime.getMonth() + 1,
							year;
						if (month === 12) {
							_this.currentTime.setFullYear(_this.currentTime.getFullYear() + 1);
							month = 0;
						}

						year = _this.currentTime.getFullYear();

						_this.currentTime.setDate(
							Math.min(
								new Date(_this.currentTime.getFullYear(), month + 1, 0).getDate(),
								_this.currentTime.getDate()
							)
						);
						_this.currentTime.setMonth(month);

						if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
							options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
						}

						if (year !== _this.currentTime.getFullYear() && $.isFunction(options.onChangeYear)) {
							options.onChangeYear.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
						}

						datetimepicker.trigger('xchange.xdsoft');
						return month;
					};

					_this.prevMonth = function () {
						var month = _this.currentTime.getMonth() - 1;
						if (month === -1) {
							_this.currentTime.setFullYear(_this.currentTime.getFullYear() - 1);
							month = 11;
						}
						_this.currentTime.setDate(
							Math.min(
								new Date(_this.currentTime.getFullYear(), month + 1, 0).getDate(),
								_this.currentTime.getDate()
							)
						);
						_this.currentTime.setMonth(month);
						if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
							options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
						}
						datetimepicker.trigger('xchange.xdsoft');
						return month;
					};

					_this.getWeekOfYear = function (datetime) {
						var onejan = new Date(datetime.getFullYear(), 0, 1);
						return Math.ceil((((datetime - onejan) / 86400000) + onejan.getDay() + 1) / 7);
					};

					_this.strToDateTime = function (sDateTime) {
						var tmpDate = [], timeOffset, currentTime;

						if (sDateTime && sDateTime instanceof Date && _this.isValidDate(sDateTime)) {
							return sDateTime;
						}

						tmpDate = /^(\+|\-)(.*)$/.exec(sDateTime);
						if (tmpDate) {
							tmpDate[2] = Date.parseDate(tmpDate[2], options.formatDate);
						}
						if (tmpDate  && tmpDate[2]) {
							timeOffset = tmpDate[2].getTime() - (tmpDate[2].getTimezoneOffset()) * 60000;
							currentTime = new Date((_xdsoft_datetime.now()).getTime() + parseInt(tmpDate[1] + '1', 10) * timeOffset);
						} else {
							currentTime = sDateTime ? Date.parseDate(sDateTime, options.format) : _this.now();
						}

						if (!_this.isValidDate(currentTime)) {
							currentTime = _this.now();
						}

						return currentTime;
					};

					_this.strToDate = function (sDate) {
						if (sDate && sDate instanceof Date && _this.isValidDate(sDate)) {
							return sDate;
						}

						var currentTime = sDate ? Date.parseDate(sDate, options.formatDate) : _this.now(true);
						if (!_this.isValidDate(currentTime)) {
							currentTime = _this.now(true);
						}
						return currentTime;
					};

					_this.strtotime = function (sTime) {
						if (sTime && sTime instanceof Date && _this.isValidDate(sTime)) {
							return sTime;
						}
						var currentTime = sTime ? Date.parseDate(sTime, options.formatTime) : _this.now(true);
						if (!_this.isValidDate(currentTime)) {
							currentTime = _this.now(true);
						}
						return currentTime;
					};

					_this.str = function () {
						return _this.currentTime.dateFormat(options.format);
					};
					_this.currentTime = this.now();
				};

				_xdsoft_datetime = new XDSoft_datetime();

				mounth_picker
					.find('.xdsoft_today_button')
					.on('mousedown.xdsoft', function () {
						datetimepicker.data('changed', true);
						_xdsoft_datetime.setCurrentTime(0);
						datetimepicker.trigger('afterOpen.xdsoft');
					}).on('dblclick.xdsoft', function () {
						input.val(_xdsoft_datetime.str());
						datetimepicker.trigger('close.xdsoft');
					});
				mounth_picker
					.find('.xdsoft_prev,.xdsoft_next')
					.on('mousedown.xdsoft', function () {
						var $this = $(this),
							timer = 0,
							stop = false;

						(function arguments_callee1(v) {
							var month =  _xdsoft_datetime.currentTime.getMonth();
							if ($this.hasClass(options.next)) {
								_xdsoft_datetime.nextMonth();
							} else if ($this.hasClass(options.prev)) {
								_xdsoft_datetime.prevMonth();
							}
							if (options.monthChangeSpinner) {
								if (!stop) {
									timer = setTimeout(arguments_callee1, v || 100);
								}
							}
						}(500));

						$([document.body, window]).on('mouseup.xdsoft', function arguments_callee2() {
							clearTimeout(timer);
							stop = true;
							$([document.body, window]).off('mouseup.xdsoft', arguments_callee2);
						});
					});

				timepicker
					.find('.xdsoft_prev,.xdsoft_next')
					.on('mousedown.xdsoft', function () {
						var $this = $(this),
							timer = 0,
							stop = false,
							period = 110;
						(function arguments_callee4(v) {
							var pheight = timeboxparent[0].clientHeight,
								height = timebox[0].offsetHeight,
								top = Math.abs(parseInt(timebox.css('marginTop'), 10));
							if ($this.hasClass(options.next) && (height - pheight) - options.timeHeightInTimePicker >= top) {
								timebox.css('marginTop', '-' + (top + options.timeHeightInTimePicker) + 'px');
							} else if ($this.hasClass(options.prev) && top - options.timeHeightInTimePicker >= 0) {
								timebox.css('marginTop', '-' + (top - options.timeHeightInTimePicker) + 'px');
							}
							timeboxparent.trigger('scroll_element.xdsoft_scroller', [Math.abs(parseInt(timebox.css('marginTop'), 10) / (height - pheight))]);
							period = (period > 10) ? 10 : period - 10;
							if (!stop) {
								timer = setTimeout(arguments_callee4, v || period);
							}
						}(500));
						$([document.body, window]).on('mouseup.xdsoft', function arguments_callee5() {
							clearTimeout(timer);
							stop = true;
							$([document.body, window])
								.off('mouseup.xdsoft', arguments_callee5);
						});
					});

				xchangeTimer = 0;
				// base handler - generating a calendar and timepicker
				datetimepicker
					.on('xchange.xdsoft', function (event) {
						clearTimeout(xchangeTimer);
						xchangeTimer = setTimeout(function () {
							var table =	'',
								start = new Date(_xdsoft_datetime.currentTime.getFullYear(), _xdsoft_datetime.currentTime.getMonth(), 1, 12, 0, 0),
								i = 0,
								j,
								today = _xdsoft_datetime.now(),
								maxDate = false,
								minDate = false,
								d,
								y,
								m,
								w,
								classes = [],
								customDateSettings,
								newRow = true,
								time = '',
								h = '',
								line_time;

							while (start.getDay() !== options.dayOfWeekStart) {
								start.setDate(start.getDate() - 1);
							}

							table += '<table><thead><tr>';

							if (options.weeks) {
								table += '<th></th>';
							}

							for (j = 0; j < 7; j += 1) {
								table += '<th>' + options.i18n[options.lang].dayOfWeek[(j + options.dayOfWeekStart) % 7] + '</th>';
							}

							table += '</tr></thead>';
							table += '<tbody>';

							if (options.maxDate !== false) {
								maxDate = _xdsoft_datetime.strToDate(options.maxDate);
								maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59, 999);
							}

							if (options.minDate !== false) {
								minDate = _xdsoft_datetime.strToDate(options.minDate);
								minDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
							}

							while (i < _xdsoft_datetime.currentTime.countDaysInMonth() || start.getDay() !== options.dayOfWeekStart || _xdsoft_datetime.currentTime.getMonth() === start.getMonth()) {
								classes = [];
								i += 1;

								d = start.getDate();
								y = start.getFullYear();
								m = start.getMonth();
								w = _xdsoft_datetime.getWeekOfYear(start);

								classes.push('xdsoft_date');

								if (options.beforeShowDay && $.isFunction(options.beforeShowDay.call)) {
									customDateSettings = options.beforeShowDay.call(datetimepicker, start);
								} else {
									customDateSettings = null;
								}

								if ((maxDate !== false && start > maxDate) || (minDate !== false && start < minDate) || (customDateSettings && customDateSettings[0] === false)) {
									classes.push('xdsoft_disabled');
								} else if (options.disabledDates.indexOf(start.dateFormat(options.formatDate)) !== -1) {
									classes.push('xdsoft_disabled');
								}

								if (customDateSettings && customDateSettings[1] !== "") {
									classes.push(customDateSettings[1]);
								}

								if (_xdsoft_datetime.currentTime.getMonth() !== m) {
									classes.push('xdsoft_other_month');
								}

								if ((options.defaultSelect || datetimepicker.data('changed')) && _xdsoft_datetime.currentTime.dateFormat(options.formatDate) === start.dateFormat(options.formatDate)) {
									classes.push('xdsoft_current');
								}

								if (today.dateFormat(options.formatDate) === start.dateFormat(options.formatDate)) {
									classes.push('xdsoft_today');
								}

								if (start.getDay() === 0 || start.getDay() === 6 || options.weekends.indexOf(start.dateFormat(options.formatDate)) === -1) {
									classes.push('xdsoft_weekend');
								}

								if (options.beforeShowDay && $.isFunction(options.beforeShowDay)) {
									classes.push(options.beforeShowDay(start));
								}

								if (newRow) {
									table += '<tr>';
									newRow = false;
									if (options.weeks) {
										table += '<th>' + w + '</th>';
									}
								}

								table += '<td data-date="' + d + '" data-month="' + m + '" data-year="' + y + '"' + ' class="xdsoft_date xdsoft_day_of_week' + start.getDay() + ' ' + classes.join(' ') + '">' +
											'<div>' + d + '</div>' +
										'</td>';

								if (start.getDay() === options.dayOfWeekStartPrev) {
									table += '</tr>';
									newRow = true;
								}

								start.setDate(d + 1);
							}
							table += '</tbody></table>';

							calendar.html(table);

							mounth_picker.find('.xdsoft_label span').eq(0).text(options.i18n[options.lang].months[_xdsoft_datetime.currentTime.getMonth()]);
							mounth_picker.find('.xdsoft_label span').eq(1).text(_xdsoft_datetime.currentTime.getFullYear());

							// generate timebox
							time = '';
							h = '';
							m = '';
							line_time = function line_time(h, m) {
								var now = _xdsoft_datetime.now();
								now.setHours(h);
								h = parseInt(now.getHours(), 10);
								now.setMinutes(m);
								m = parseInt(now.getMinutes(), 10);
								var optionDateTime = new Date(_xdsoft_datetime.currentTime)
								optionDateTime.setHours(h);
								optionDateTime.setMinutes(m);
								classes = [];
								if((options.minDateTime !== false && options.minDateTime > optionDateTime) || (options.maxTime !== false && _xdsoft_datetime.strtotime(options.maxTime).getTime() < now.getTime()) || (options.minTime !== false && _xdsoft_datetime.strtotime(options.minTime).getTime() > now.getTime())) {
									classes.push('xdsoft_disabled');
								}
								if ((options.initTime || options.defaultSelect || datetimepicker.data('changed')) && parseInt(_xdsoft_datetime.currentTime.getHours(), 10) === parseInt(h, 10) && (options.step > 59 || Math[options.roundTime](_xdsoft_datetime.currentTime.getMinutes() / options.step) * options.step === parseInt(m, 10))) {
									if (options.defaultSelect || datetimepicker.data('changed')) {
										classes.push('xdsoft_current');
									} else if (options.initTime) {
										classes.push('xdsoft_init_time');
									}
								}
								if (parseInt(today.getHours(), 10) === parseInt(h, 10) && parseInt(today.getMinutes(), 10) === parseInt(m, 10)) {
									classes.push('xdsoft_today');
								}
								time += '<div class="xdsoft_time ' + classes.join(' ') + '" data-hour="' + h + '" data-minute="' + m + '">' + now.dateFormat(options.formatTime) + '</div>';
							};

							if (!options.allowTimes || !$.isArray(options.allowTimes) || !options.allowTimes.length) {
								for (i = 0, j = 0; i < (options.hours12 ? 12 : 24); i += 1) {
									for (j = 0; j < 60; j += options.step) {
										h = (i < 10 ? '0' : '') + i;
										m = (j < 10 ? '0' : '') + j;
										line_time(h, m);
									}
								}
							} else {
								for (i = 0; i < options.allowTimes.length; i += 1) {
									h = _xdsoft_datetime.strtotime(options.allowTimes[i]).getHours();
									m = _xdsoft_datetime.strtotime(options.allowTimes[i]).getMinutes();
									line_time(h, m);
								}
							}

							timebox.html(time);

							opt = '';
							i = 0;

							for (i = parseInt(options.yearStart, 10) + options.yearOffset; i <= parseInt(options.yearEnd, 10) + options.yearOffset; i += 1) {
								opt += '<div class="xdsoft_option ' + (_xdsoft_datetime.currentTime.getFullYear() === i ? 'xdsoft_current' : '') + '" data-value="' + i + '">' + i + '</div>';
							}
							yearselect.children().eq(0)
													.html(opt);

							for (i = 0, opt = ''; i <= 11; i += 1) {
								opt += '<div class="xdsoft_option ' + (_xdsoft_datetime.currentTime.getMonth() === i ? 'xdsoft_current' : '') + '" data-value="' + i + '">' + options.i18n[options.lang].months[i] + '</div>';
							}
							monthselect.children().eq(0).html(opt);
							$(datetimepicker)
								.trigger('generate.xdsoft');
						}, 10);
						event.stopPropagation();
					})
					.on('afterOpen.xdsoft', function () {
						if (options.timepicker) {
							var classType, pheight, height, top;
							if (timebox.find('.xdsoft_current').length) {
								classType = '.xdsoft_current';
							} else if (timebox.find('.xdsoft_init_time').length) {
								classType = '.xdsoft_init_time';
							}
							if (classType) {
								pheight = timeboxparent[0].clientHeight;
								height = timebox[0].offsetHeight;
								top = timebox.find(classType).index() * options.timeHeightInTimePicker + 1;
								if ((height - pheight) < top) {
									top = height - pheight;
								}
								timeboxparent.trigger('scroll_element.xdsoft_scroller', [parseInt(top, 10) / (height - pheight)]);
							} else {
								timeboxparent.trigger('scroll_element.xdsoft_scroller', [0]);
							}
						}
					});

				timerclick = 0;
				calendar
					.on('click.xdsoft', 'td', function (xdevent) {
						xdevent.stopPropagation();  // Prevents closing of Pop-ups, Modals and Flyouts in Bootstrap
						timerclick += 1;
						var $this = $(this),
							currentTime = _xdsoft_datetime.currentTime;

						if (currentTime === undefined || currentTime === null) {
							_xdsoft_datetime.currentTime = _xdsoft_datetime.now();
							currentTime = _xdsoft_datetime.currentTime;
						}

						if ($this.hasClass('xdsoft_disabled')) {
							return false;
						}

						currentTime.setDate(1);
						currentTime.setFullYear($this.data('year'));
						currentTime.setMonth($this.data('month'));
						currentTime.setDate($this.data('date'));

						datetimepicker.trigger('select.xdsoft', [currentTime]);

						input.val(_xdsoft_datetime.str());
						if ((timerclick > 1 || (options.closeOnDateSelect === true || (options.closeOnDateSelect === 0 && !options.timepicker))) && !options.inline) {
							datetimepicker.trigger('close.xdsoft');
						}

						if (options.onSelectDate &&	$.isFunction(options.onSelectDate)) {
							options.onSelectDate.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), xdevent);
						}

						datetimepicker.data('changed', true);
						datetimepicker.trigger('xchange.xdsoft');
						datetimepicker.trigger('changedatetime.xdsoft');
						setTimeout(function () {
							timerclick = 0;
						}, 200);
					});

				timebox
					.on('click.xdsoft', 'div', function (xdevent) {
						xdevent.stopPropagation();
						var $this = $(this),
							currentTime = _xdsoft_datetime.currentTime;

						if (currentTime === undefined || currentTime === null) {
							_xdsoft_datetime.currentTime = _xdsoft_datetime.now();
							currentTime = _xdsoft_datetime.currentTime;
						}

						if ($this.hasClass('xdsoft_disabled')) {
							return false;
						}
						currentTime.setHours($this.data('hour'));
						currentTime.setMinutes($this.data('minute'));
						datetimepicker.trigger('select.xdsoft', [currentTime]);

						datetimepicker.data('input').val(_xdsoft_datetime.str());
						if (!options.inline) {
							datetimepicker.trigger('close.xdsoft');
						}

						if (options.onSelectTime && $.isFunction(options.onSelectTime)) {
							options.onSelectTime.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), xdevent);
						}
						datetimepicker.data('changed', true);
						datetimepicker.trigger('xchange.xdsoft');
						datetimepicker.trigger('changedatetime.xdsoft');
					});


				datepicker
					.on('mousewheel.xdsoft', function (event) {
						if (!options.scrollMonth) {
							return true;
						}
						if (event.deltaY < 0) {
							_xdsoft_datetime.nextMonth();
						} else {
							_xdsoft_datetime.prevMonth();
						}
						return false;
					});

				input
					.on('mousewheel.xdsoft', function (event) {
						if (!options.scrollInput) {
							return true;
						}
						if (!options.datepicker && options.timepicker) {
							current_time_index = timebox.find('.xdsoft_current').length ? timebox.find('.xdsoft_current').eq(0).index() : 0;
							if (current_time_index + event.deltaY >= 0 && current_time_index + event.deltaY < timebox.children().length) {
								current_time_index += event.deltaY;
							}
							if (timebox.children().eq(current_time_index).length) {
								timebox.children().eq(current_time_index).trigger('mousedown');
							}
							return false;
						}
						if (options.datepicker && !options.timepicker) {
							datepicker.trigger(event, [event.deltaY, event.deltaX, event.deltaY]);
							if (input.val) {
								input.val(_xdsoft_datetime.str());
							}
							datetimepicker.trigger('changedatetime.xdsoft');
							return false;
						}
					});

				datetimepicker
					.on('changedatetime.xdsoft', function (event) {
						if (options.onChangeDateTime && $.isFunction(options.onChangeDateTime)) {
							var $input = datetimepicker.data('input');
							options.onChangeDateTime.call(datetimepicker, _xdsoft_datetime.currentTime, $input, event);
							delete options.value;
							$input.trigger('change');
						}
					})
					.on('generate.xdsoft', function () {
						if (options.onGenerate && $.isFunction(options.onGenerate)) {
							options.onGenerate.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
						}
						if (triggerAfterOpen) {
							datetimepicker.trigger('afterOpen.xdsoft');
							triggerAfterOpen = false;
						}
					})
					.on('click.xdsoft', function (xdevent) {
						xdevent.stopPropagation();
					});

				current_time_index = 0;

				setPos = function () {
					var offset = datetimepicker.data('input').offset(), top = offset.top + datetimepicker.data('input')[0].offsetHeight - 1, left = offset.left, position = "position";
					if (options.fixed) {
						top -= $(window).scrollTop();
						left -= $(window).scrollLeft();
						position = "fixed";
					} else {
						if (top + datetimepicker[0].offsetHeight > $(window).height() + $(window).scrollTop()) {
							top = offset.top - datetimepicker[0].offsetHeight + 1;
						}
						if (top < 0) {
							top = 0;
						}
						if (left + datetimepicker[0].offsetWidth > $(window).width()) {
							left = $(window).width() - datetimepicker[0].offsetWidth;
						}
					}
					datetimepicker.css({
						left: left,
						top: top,
						position: position
					});
				};
				datetimepicker
					.on('open.xdsoft', function (event) {
						var onShow = true;
						if (options.onShow && $.isFunction(options.onShow)) {
							onShow = options.onShow.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), event);
						}
						if (onShow !== false) {
							datetimepicker.show();
							setPos();
							$(window)
								.off('resize.xdsoft', setPos)
								.on('resize.xdsoft', setPos);

							if (options.closeOnWithoutClick) {
								$([document.body, window]).on('mousedown.xdsoft', function arguments_callee6() {
									datetimepicker.trigger('close.xdsoft');
									$([document.body, window]).off('mousedown.xdsoft', arguments_callee6);
								});
							}
						}
					})
					.on('close.xdsoft', function (event) {
						var onClose = true;
						mounth_picker
							.find('.xdsoft_month,.xdsoft_year')
								.find('.xdsoft_select')
									.hide();
						if (options.onClose && $.isFunction(options.onClose)) {
							onClose = options.onClose.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), event);
						}
						if (onClose !== false && !options.opened && !options.inline) {
							datetimepicker.hide();
						}
						event.stopPropagation();
					})
					.on('toggle.xdsoft', function (event) {
						if (datetimepicker.is(':visible')) {
							datetimepicker.trigger('close.xdsoft');
						} else {
							datetimepicker.trigger('open.xdsoft');
						}
					})
					.data('input', input);

				timer = 0;
				timer1 = 0;

				datetimepicker.data('xdsoft_datetime', _xdsoft_datetime);
				datetimepicker.setOptions(options);

				function getCurrentValue() {

					var ct = false, time;

					if (options.startDate) {
						ct = _xdsoft_datetime.strToDate(options.startDate);
					} else {
						ct = options.value || ((input && input.val && input.val()) ? input.val() : '');
						if (ct) {
							ct = _xdsoft_datetime.strToDateTime(ct);
						} else if (options.defaultDate) {
							ct = _xdsoft_datetime.strToDate(options.defaultDate);
							if (options.defaultTime) {
								time = _xdsoft_datetime.strtotime(options.defaultTime);
								ct.setHours(time.getHours());
								ct.setMinutes(time.getMinutes());
							}
						}
					}

					if (ct && _xdsoft_datetime.isValidDate(ct)) {
						datetimepicker.data('changed', true);
					} else {
						ct = '';
					}

					return ct || 0;
				}

				_xdsoft_datetime.setCurrentTime(getCurrentValue());

				input
					.data('xdsoft_datetimepicker', datetimepicker)
					.on('open.xdsoft focusin.xdsoft mousedown.xdsoft', function (event) {
						if (input.is(':disabled') || input.is(':hidden') || !input.is(':visible') || (input.data('xdsoft_datetimepicker').is(':visible') && options.closeOnInputClick)) {
							return;
						}
						clearTimeout(timer);
						timer = setTimeout(function () {
							if (input.is(':disabled') || input.is(':hidden') || !input.is(':visible')) {
								return;
							}

							triggerAfterOpen = true;
							_xdsoft_datetime.setCurrentTime(getCurrentValue());

							datetimepicker.trigger('open.xdsoft');
						}, 100);
					})
					.on('keydown.xdsoft', function (event) {
						var val = this.value, elementSelector,
							key = event.which;
						if ([ENTER].indexOf(key) !== -1 && options.enterLikeTab) {
							elementSelector = $("input:visible,textarea:visible");
							datetimepicker.trigger('close.xdsoft');
							elementSelector.eq(elementSelector.index(this) + 1).focus();
							return false;
						}
						if ([TAB].indexOf(key) !== -1) {
							datetimepicker.trigger('close.xdsoft');
							return true;
						}
					});
			};
			destroyDateTimePicker = function (input) {
				var datetimepicker = input.data('xdsoft_datetimepicker');
				if (datetimepicker) {
					datetimepicker.data('xdsoft_datetime', null);
					datetimepicker.remove();
					input
						.data('xdsoft_datetimepicker', null)
						.off('.xdsoft');
					$(window).off('resize.xdsoft');
					$([window, document.body]).off('mousedown.xdsoft');
					if (input.unmousewheel) {
						input.unmousewheel();
					}
				}
			};
			$(document)
				.off('keydown.xdsoftctrl keyup.xdsoftctrl')
				.on('keydown.xdsoftctrl', function (e) {
					if (e.keyCode === CTRLKEY) {
						ctrlDown = true;
					}
				})
				.on('keyup.xdsoftctrl', function (e) {
					if (e.keyCode === CTRLKEY) {
						ctrlDown = false;
					}
				});
			return this.each(function () {
				var datetimepicker = $(this).data('xdsoft_datetimepicker');
				if (datetimepicker) {
					if ($.type(opt) === 'string') {
						switch (opt) {
						case 'show':
							$(this).select().focus();
							datetimepicker.trigger('open.xdsoft');
							break;
						case 'hide':
							datetimepicker.trigger('close.xdsoft');
							break;
						case 'toggle':
							datetimepicker.trigger('toggle.xdsoft');
							break;
						case 'destroy':
							destroyDateTimePicker($(this));
							break;
						case 'reset':
							this.value = this.defaultValue;
							if (!this.value || !datetimepicker.data('xdsoft_datetime').isValidDate(Date.parseDate(this.value, options.format))) {
								datetimepicker.data('changed', false);
							}
							datetimepicker.data('xdsoft_datetime').setCurrentTime(this.value);
							break;
						}
					} else {
						datetimepicker
							.setOptions(opt);
					}
					return 0;
				}
				if ($.type(opt) !== 'string') {
					if (!options.lazyInit || options.open || options.inline) {
						createDateTimePicker($(this));
					} else {
						lazyInit($(this));
					}
				}
			});
		});
		$.fn.extend ( "datetimepicker.defaults" , default_options);
	}(jQuery));
	(function () {

	/*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
	 * Licensed under the MIT License (LICENSE.txt).
	 *
	 * Version: 3.1.12
	 *
	 * Requires: jQuery 1.2.2+
	 */
	!function(a){true?!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(4)], __WEBPACK_AMD_DEFINE_FACTORY__ = (a), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"object"==typeof exports?module.exports=a:a(jQuery)}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||f>n)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks)for(var j=g.length;j;)a.event.fixHooks[g[--j]]=a.event.mouseHooks;var k=a.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var c=h.length;c;)this.addEventListener(h[--c],b,!1);else this.onmousewheel=b;a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var c=h.length;c;)this.removeEventListener(h[--c],b,!1);else this.onmousewheel=null;a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height")},getLineHeight:function(b){var c=a(b),d=c["offsetParent"in a.fn?"offsetParent":"parent"]();return d.length||(d=a("body")),parseInt(d.css("fontSize"),10)||parseInt(c.css("fontSize"),10)||16},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})});

	// Parse and Format Library
	//http://www.xaprb.com/blog/2005/12/12/javascript-closures-for-runtime-efficiency/
	/*
	 * Copyright (C) 2004 Baron Schwartz <baron at sequent dot org>
	 *
	 * This program is free software; you can redistribute it and/or modify it
	 * under the terms of the GNU Lesser General Public License as published by the
	 * Free Software Foundation, version 2.1.
	 *
	 * This program is distributed in the hope that it will be useful, but WITHOUT
	 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
	 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
	 * details.
	 */
	Date.parseFunctions={count:0};Date.parseRegexes=[];Date.formatFunctions={count:0};Date.prototype.dateFormat=function(b){if(b=="unixtime"){return parseInt(this.getTime()/1000);}if(Date.formatFunctions[b]==null){Date.createNewFormat(b);}var a=Date.formatFunctions[b];return this[a]();};Date.createNewFormat=function(format){var funcName="format"+Date.formatFunctions.count++;Date.formatFunctions[format]=funcName;var code="Date.prototype."+funcName+" = function() {return ";var special=false;var ch="";for(var i=0;i<format.length;++i){ch=format.charAt(i);if(!special&&ch=="\\"){special=true;}else{if(special){special=false;code+="'"+String.escape(ch)+"' + ";}else{code+=Date.getFormatCode(ch);}}}eval(code.substring(0,code.length-3)+";}");};Date.getFormatCode=function(a){switch(a){case"d":return"String.leftPad(this.getDate(), 2, '0') + ";case"D":return"Date.dayNames[this.getDay()].substring(0, 3) + ";case"j":return"this.getDate() + ";case"l":return"Date.dayNames[this.getDay()] + ";case"S":return"this.getSuffix() + ";case"w":return"this.getDay() + ";case"z":return"this.getDayOfYear() + ";case"W":return"this.getWeekOfYear() + ";case"F":return"Date.monthNames[this.getMonth()] + ";case"m":return"String.leftPad(this.getMonth() + 1, 2, '0') + ";case"M":return"Date.monthNames[this.getMonth()].substring(0, 3) + ";case"n":return"(this.getMonth() + 1) + ";case"t":return"this.getDaysInMonth() + ";case"L":return"(this.isLeapYear() ? 1 : 0) + ";case"Y":return"this.getFullYear() + ";case"y":return"('' + this.getFullYear()).substring(2, 4) + ";case"a":return"(this.getHours() < 12 ? 'am' : 'pm') + ";case"A":return"(this.getHours() < 12 ? 'AM' : 'PM') + ";case"g":return"((this.getHours() %12) ? this.getHours() % 12 : 12) + ";case"G":return"this.getHours() + ";case"h":return"String.leftPad((this.getHours() %12) ? this.getHours() % 12 : 12, 2, '0') + ";case"H":return"String.leftPad(this.getHours(), 2, '0') + ";case"i":return"String.leftPad(this.getMinutes(), 2, '0') + ";case"s":return"String.leftPad(this.getSeconds(), 2, '0') + ";case"O":return"this.getGMTOffset() + ";case"T":return"this.getTimezone() + ";case"Z":return"(this.getTimezoneOffset() * -60) + ";default:return"'"+String.escape(a)+"' + ";}};Date.parseDate=function(a,c){if(c=="unixtime"){return new Date(!isNaN(parseInt(a))?parseInt(a)*1000:0);}if(Date.parseFunctions[c]==null){Date.createParser(c);}var b=Date.parseFunctions[c];return Date[b](a);};Date.createParser=function(format){var funcName="parse"+Date.parseFunctions.count++;var regexNum=Date.parseRegexes.length;var currentGroup=1;Date.parseFunctions[format]=funcName;var code="Date."+funcName+" = function(input) {\nvar y = -1, m = -1, d = -1, h = -1, i = -1, s = -1, z = -1;\nvar d = new Date();\ny = d.getFullYear();\nm = d.getMonth();\nd = d.getDate();\nvar results = input.match(Date.parseRegexes["+regexNum+"]);\nif (results && results.length > 0) {";var regex="";var special=false;var ch="";for(var i=0;i<format.length;++i){ch=format.charAt(i);if(!special&&ch=="\\"){special=true;}else{if(special){special=false;regex+=String.escape(ch);}else{obj=Date.formatCodeToRegex(ch,currentGroup);currentGroup+=obj.g;regex+=obj.s;if(obj.g&&obj.c){code+=obj.c;}}}}code+="if (y > 0 && z > 0){\nvar doyDate = new Date(y,0);\ndoyDate.setDate(z);\nm = doyDate.getMonth();\nd = doyDate.getDate();\n}";code+="if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0)\n{return new Date(y, m, d, h, i, s);}\nelse if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0)\n{return new Date(y, m, d, h, i);}\nelse if (y > 0 && m >= 0 && d > 0 && h >= 0)\n{return new Date(y, m, d, h);}\nelse if (y > 0 && m >= 0 && d > 0)\n{return new Date(y, m, d);}\nelse if (y > 0 && m >= 0)\n{return new Date(y, m);}\nelse if (y > 0)\n{return new Date(y);}\n}return null;}";Date.parseRegexes[regexNum]=new RegExp("^"+regex+"$");eval(code);};Date.formatCodeToRegex=function(b,a){switch(b){case"D":return{g:0,c:null,s:"(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)"};case"j":case"d":return{g:1,c:"d = parseInt(results["+a+"], 10);\n",s:"(\\d{1,2})"};case"l":return{g:0,c:null,s:"(?:"+Date.dayNames.join("|")+")"};case"S":return{g:0,c:null,s:"(?:st|nd|rd|th)"};case"w":return{g:0,c:null,s:"\\d"};case"z":return{g:1,c:"z = parseInt(results["+a+"], 10);\n",s:"(\\d{1,3})"};case"W":return{g:0,c:null,s:"(?:\\d{2})"};case"F":return{g:1,c:"m = parseInt(Date.monthNumbers[results["+a+"].substring(0, 3)], 10);\n",s:"("+Date.monthNames.join("|")+")"};case"M":return{g:1,c:"m = parseInt(Date.monthNumbers[results["+a+"]], 10);\n",s:"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"};case"n":case"m":return{g:1,c:"m = parseInt(results["+a+"], 10) - 1;\n",s:"(\\d{1,2})"};case"t":return{g:0,c:null,s:"\\d{1,2}"};case"L":return{g:0,c:null,s:"(?:1|0)"};case"Y":return{g:1,c:"y = parseInt(results["+a+"], 10);\n",s:"(\\d{4})"};case"y":return{g:1,c:"var ty = parseInt(results["+a+"], 10);\ny = ty > Date.y2kYear ? 1900 + ty : 2000 + ty;\n",s:"(\\d{1,2})"};case"a":return{g:1,c:"if (results["+a+"] == 'am') {\nif (h == 12) { h = 0; }\n} else { if (h < 12) { h += 12; }}",s:"(am|pm)"};case"A":return{g:1,c:"if (results["+a+"] == 'AM') {\nif (h == 12) { h = 0; }\n} else { if (h < 12) { h += 12; }}",s:"(AM|PM)"};case"g":case"G":case"h":case"H":return{g:1,c:"h = parseInt(results["+a+"], 10);\n",s:"(\\d{1,2})"};case"i":return{g:1,c:"i = parseInt(results["+a+"], 10);\n",s:"(\\d{2})"};case"s":return{g:1,c:"s = parseInt(results["+a+"], 10);\n",s:"(\\d{2})"};case"O":return{g:0,c:null,s:"[+-]\\d{4}"};case"T":return{g:0,c:null,s:"[A-Z]{3}"};case"Z":return{g:0,c:null,s:"[+-]\\d{1,5}"};default:return{g:0,c:null,s:String.escape(b)};}};Date.prototype.getTimezone=function(){return this.toString().replace(/^.*? ([A-Z]{3}) [0-9]{4}.*$/,"$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/,"$1$2$3");};Date.prototype.getGMTOffset=function(){return(this.getTimezoneOffset()>0?"-":"+")+String.leftPad(Math.floor(Math.abs(this.getTimezoneOffset())/60),2,"0")+String.leftPad(Math.abs(this.getTimezoneOffset())%60,2,"0");};Date.prototype.getDayOfYear=function(){var a=0;Date.daysInMonth[1]=this.isLeapYear()?29:28;for(var b=0;b<this.getMonth();++b){a+=Date.daysInMonth[b];}return a+this.getDate();};Date.prototype.getWeekOfYear=function(){var b=this.getDayOfYear()+(4-this.getDay());var a=new Date(this.getFullYear(),0,1);var c=(7-a.getDay()+4);return String.leftPad(Math.ceil((b-c)/7)+1,2,"0");};Date.prototype.isLeapYear=function(){var a=this.getFullYear();return((a&3)==0&&(a%100||(a%400==0&&a)));};Date.prototype.getFirstDayOfMonth=function(){var a=(this.getDay()-(this.getDate()-1))%7;return(a<0)?(a+7):a;};Date.prototype.getLastDayOfMonth=function(){var a=(this.getDay()+(Date.daysInMonth[this.getMonth()]-this.getDate()))%7;return(a<0)?(a+7):a;};Date.prototype.getDaysInMonth=function(){Date.daysInMonth[1]=this.isLeapYear()?29:28;return Date.daysInMonth[this.getMonth()];};Date.prototype.getSuffix=function(){switch(this.getDate()){case 1:case 21:case 31:return"st";case 2:case 22:return"nd";case 3:case 23:return"rd";default:return"th";}};String.escape=function(a){return a.replace(/('|\\)/g,"\\$1");};String.leftPad=function(d,b,c){var a=new String(d);if(c==null){c=" ";}while(a.length<b){a=c+a;}return a;};Date.daysInMonth=[31,28,31,30,31,30,31,31,30,31,30,31];Date.monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];Date.dayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];Date.y2kYear=50;Date.monthNumbers={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};Date.patterns={ISO8601LongPattern:"Y-m-d H:i:s",ISO8601ShortPattern:"Y-m-d",ShortDatePattern:"n/j/Y",LongDatePattern:"l, F d, Y",FullDateTimePattern:"l, F d, Y g:i:s A",MonthDayPattern:"F d",ShortTimePattern:"g:i A",LongTimePattern:"g:i:s A",SortableDateTimePattern:"Y-m-d\\TH:i:s",UniversalSortableDateTimePattern:"Y-m-d H:i:sO",YearMonthPattern:"F, Y"};
	}());

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },

/***/ 20:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/**
	 * Map
	 * @class
	 */
	function Map() {
	    this.map = {};
	    this.length = 0;
	}
	Map.prototype = {
	    constructor: Map,
	    /**
	     * has
	     * @param {String} key
	     * @returns {Boolean}
	     */
	    has: function (key) {
	        return (key in this.map);
	    },
	    /**
	     * get
	     * @param {String} key
	     * @returns {Any}
	     */
	    get: function (key) {
	        return this.map[key];
	    },
	    /**
	     * set
	     * @param {String} key
	     * @param {Any} value
	     */
	    set: function (key, value) {
	        !this.has(key) && this.length++;
	        return (this.map[key] = value);
	    },
	    /**
	     * count
	     * @returns {Number}
	     */
	    count: function () {
	        return this.length;
	    },
	    /**
	     * remove
	     * @param {String} key
	     */
	    remove: function (key) {
	        if (this.has(key)) {
	            this.map[key] = null;
	            delete this.map[key];
	            this.length--;
	        }
	    }
	};

	var cache = new Map(), set = cache.set, uid = 0;
	cache.set = function (node, value) {
	    if (!value) {
	        value = node;
	        set.call(cache, ++uid + '', value);
	        return uid;
	    } else {
	        typeof node === 'string' &&
	        (node = $(node)[0]);
	        $.data(node, 'event-data', value);
	        return this;
	    }
	};

	function _key(arr) {
	    if (!arr) return {};
	    arr = arr.split(' ');
	    var obj = {};
	    for (var i = 0, l = arr.length; i < l; i++) {
	        obj[arr[i]] = true;
	    }
	    return obj;
	}

	/**
	 * Delegator
	 * @class
	 * @param {Selector} container
	 */
	function Delegator(container) {
	    this.container = $(container);
	    this.listenerMap = new Map();
	}

	/**
	 * getKey
	 * @param {Any} value
	 * @returns {Number}
	 */
	Delegator.set = cache.set;
	/**
	 * cache
	 * @class
	 * @static
	 */
	Delegator.cache = cache;

	Delegator.prototype = {
	    constructor: Delegator,
	    _getListener: function (type) {
	        if (this.listenerMap.has(type)) {
	            return this.listenerMap.get(type);
	        }
	        function listener(e) {
	            var data = $.data(this),
	                routes = data['event-' + type + '-routes'],
	                eventData = data['event-data'], handle, dataKey;

	            // preprocessing
	            if (!routes && (routes = this.getAttribute('data-event-' + type))) {
	                (routes = routes.split(' ')) &&
	                (data['event-' + type + '-routes'] = routes);
	                !eventData &&
	                (dataKey = this.getAttribute('data-event-data')) &&
	                (eventData = cache.get(dataKey)) &&
	                (data['event-data'] = eventData) &&
	                (cache.remove(dataKey));
	                !data['event-stop-propagation'] &&
	                (data['event-stop-propagation'] = _key(this.getAttribute('data-event-stop-propagation')));
	            }

	            if (routes) {
	                for (var i = 0, l = routes.length; i < l; i++) {
	                    handle = listener.handleMap.get(routes[i]);

	                    if (handle) {
	                        handle.call(this, e, eventData);
	                    }
	                    data['event-stop-propagation'][type] &&
	                    e.stopPropagation();
	                }
	            }
	        }

	        listener.handleMap = new Map();
	        this.listenerMap.set(type, listener);
	        this.container.on(type, '[data-event-' + type + ']', listener);
	        return listener;
	    },
	    /**
	     * on
	     * @param {String} type
	     * @param {String} name
	     * @param {Function} handle
	     */
	    on: function (type, name, handle) {
	        var listener = this._getListener(type);
	        listener.handleMap.set(name, handle);
	        return this;
	    },
	    /**
	     * off
	     * @param {String} type
	     * @param {String} name
	     */
	    off: function (type, name) {
	        var listener = this._getListener(type),
	            handleMap = listener.handleMap;
	        handleMap.remove(name);
	        if (!handleMap.count()) {
	            this.container.off(type, '[data-event-' + type + ']', listener);
	            this.listenerMap.remove(type);
	        }
	    }
	};

	module.exports = Delegator;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },

/***/ 21:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {var Delegator = __webpack_require__(20);
	var modal = __webpack_require__(134);

	    var container;

	    function hide() {
	        container.removeClass('in');
	        container.find('.modal-backdrop').removeClass('in');
	        setTimeout(function () {
	            container.remove();
	            container = undefined;
	        }, 300);
	    }

	    function Dialog (param) {
	        if (container) {
	            container.remove();
	            container = undefined;
	        }
	        container = $(modal({it :param}))
	            .appendTo(document.body)
	            .show();

	        var key,
	            action,
	            delegator,
	            on = param.on || {};

	        delegator = (new Delegator(container))
	            .on('click', 'close', hide);

	        for (key in on) {
	            action = key.split('/');
	            delegator.on(action[0], action[1], on[key]);
	        }

	        setTimeout(function () {
	            container.addClass('in');
	            container.find('.modal-backdrop').addClass('in');
	        }, 0);
	    }

	    Dialog.hide = hide;

	module.exports =  Dialog;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },

/***/ 127:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(_) {module.exports = function (obj) {
	obj || (obj = {});
	var __t, __p = '', __j = Array.prototype.join;
	function print() { __p += __j.call(arguments, '') }
	with (obj) {


	var urls;
	var not_show_source_page = true;
	try {
	    not_show_source_page = !!localStorage.not_show_source_page;
	} catch (ex) {}

	// 手Q
	var RE_MQQ = /(ipad|iphone|ipod).*? (ipad)?qq\/([\d.]+)|\bv1_and_sqi?_([\d.]+)(.*? qq\/([\d.]+))?/;

	function getBrowserType(ua) {
	    if (!ua) {
	        return '';
	    }
	    ua = ua.toLowerCase();

	    var osIcon = '', browserIcon = '';

	    // os
	    if (ua.indexOf('android') > -1)
	        osIcon = 'ico-android';
	    else if (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1)
	        osIcon = 'ico-ios';
	    else if (ua.indexOf('windows') > -1)
	        osIcon = 'ico-windows';


	    // 手Q
	    if (RE_MQQ.test(ua)) {
	        browserIcon = 'ico-qq';
	    } else if (ua.indexOf('qqbrowser') > -1) {
	        browserIcon = 'ico-qb';
	    } else if (ua.indexOf('metasr') > -1) {
	        browserIcon = 'ico-sougou';
	    } else if (ua.indexOf('maxthon') > -1) {
	        browserIcon = 'ico-maxthon';
	    } else if (ua.indexOf('360se') > -1) {
	        browserIcon = 'ico-360';
	    } else if (ua.indexOf('qq/') > -1) {
	        browserIcon = 'ico-qq';
	    } else if (ua.indexOf('micromessenger') > -1) {
	        browserIcon = 'ico-wx';
	    } else if (ua.indexOf('edge') > -1) {
	        browserIcon = 'ico-edge';
	    } else if (ua.indexOf('chrome') > -1) {
	        browserIcon = 'ico-chrome';
	    } else if (ua.indexOf('msie') > -1 || ua.indexOf('trident') > -1) {
	        browserIcon = 'ico-ie';
	    } else if (ua.indexOf('firefox') > -1) {
	        browserIcon = 'ico-ff';
	    } else if (ua.indexOf('safari') > -1) {
	        browserIcon = 'ico-safari';
	    }

	    return [osIcon, browserIcon];
	}

	function sourcePage(data, type, opt) {
	    var from = data.from || ''
	    if (/view/.test(type)) {
	        var view = ['页面查看', opt.encodeHtml(from)];
	        return 'viewtext' === type ? view[0] :
	            'viewlink' === type ? view[1] :
	            not_show_source_page ? view[0] : view[1];
	    } else {
	        var href = opt.encodeHtml(from);
	        var msg = [data._target, data.rowNum, data.colNum].join(':') + ' ' + data.msg;
	        if (href.indexOf('#') === -1) {
	            href += '#BJ_ERROR=' + encodeURIComponent(msg);
	        } else {
	            href += '&BJ_ERROR=' + encodeURIComponent(msg);
	        }
	        return href;
	    }
	}

	for (var i = 0 , l = it.length, type = ''; i < l; i++) {
	    switch(it[i].level.toString()) {
	        case '8':
	            type = 'warning';
	            break;
	        case '4':
	            type = 'err';
	            break;
	        case '2':
	            type = 'info';
	            break;
	        case '1':
	            type = 'debug';
	            break;
	    }

	    if (_.isArray(it[i].target)) {
	        it[i].target = it[i].target[0];
	    }

	    var isHtml = /^.+?\.html\??/.test(it[i].target);
	    var _target = it[i]._target = (it[i].target || it[i].url || '').replace(/\)/g, '');
	;
	__p += '\r\n<tr id="tr-' +
	((__t = (i + 1 + opt.startIndex)) == null ? '' : __t) +
	'">\r\n    <td  class="td-1 active info-type-' +
	((__t = (type)) == null ? '' : __t) +
	'" data-event-click="alertModal" title="点击查看#' +
	((__t = (i + 1 + opt.startIndex)) == null ? '' : __t) +
	'详情">\r\n        ' +
	((__t = (i + 1 + opt.startIndex)) == null ? '' : __t) +
	'\r\n    </td>\r\n    <td  class="td-2 ' +
	((__t = (classes['td-2'] )) == null ? '' : __t) +
	'">\r\n        ' +
	((__t = ( _.formatDate(new Date(it[i].date) , 'YYYY-MM-DD hh:mm:ss') )) == null ? '' : __t) +
	'\r\n    </td>\r\n    <td  style="" class="td-3 ' +
	((__t = (classes['td-3'] )) == null ? '' : __t) +
	'">\r\n        ' +
	((__t = ( opt.formatMsg(opt.encodeHtml(it[i].msg)) )) == null ? '' : __t) +
	'\r\n    </td>\r\n    <td  class="td-4 ' +
	((__t = (classes['td-4'] )) == null ? '' : __t) +
	'" title="' +
	((__t = (  opt.encodeHtml(it[i].uin == 'NaN' ? '-' : it[i].uin ))) == null ? '' : __t) +
	'" style="text-overflow: ellipsis;overflow: hidden;" >\r\n        ' +
	((__t = (  opt.encodeHtml(it[i].uin == 'NaN' ? '-' : it[i].uin ))) == null ? '' : __t) +
	'\r\n    </td>\r\n    <td  class="td-5 ' +
	((__t = (classes['td-5'] )) == null ? '' : __t) +
	'">\r\n        ' +
	((__t = (it[i].ip )) == null ? '' : __t) +
	'\r\n    </td>\r\n    <td class="td-6 ' +
	((__t = ( classes['td-6'] )) == null ? '' : __t) +
	'" title="' +
	((__t = ( it[i].userAgent )) == null ? '' : __t) +
	'">  \r\n            ';

	            var browserTypes = getBrowserType(it[i].userAgent);      
	            for(var x = 0; x < browserTypes.length; x++) {
	             ;
	__p += '\r\n             <span class="ico-browser ' +
	((__t = ( browserTypes[x] )) == null ? '' : __t) +
	'"></span>\r\n             ';
	};
	__p += '\r\n     </td>\r\n    <td class="td-7 ' +
	((__t = (classes['td-7'] )) == null ? '' : __t) +
	'">\r\n        <a\r\n            style="word-break:break-all;display:block"\r\n            href="' +
	((__t = ( opt.encodeHtml(_target))) == null ? '' : __t) +
	'"\r\n            target="_blank"\r\n            data-event-click="showSource"\r\n            data-event-data="' +
	((__t = (opt.set(it[i]))) == null ? '' : __t) +
	'"\r\n        >\r\n            ' +
	((__t = (opt.encodeHtml(_target))) == null ? '' : __t) +
	'\r\n            <span\r\n                class="err-where"\r\n                style="height:24px;line-height:24px;border-radius:3px"\r\n            >\r\n                ' +
	((__t = (opt.encodeHtml(it[i].rowNum || 0))) == null ? '' : __t) +
	'行\r\n                ' +
	((__t = (opt.encodeHtml(it[i].colNum || 0))) == null ? '' : __t) +
	'列\r\n            </span>\r\n        </a>\r\n        <a\r\n            class="source_page_link"\r\n            style="font-size:12px"\r\n            target="_blank"\r\n            href="' +
	((__t = (sourcePage(it[i], 'href', opt))) == null ? '' : __t) +
	'"\r\n            data-viewtext="' +
	((__t = (sourcePage(it[i], 'viewtext', opt))) == null ? '' : __t) +
	'"\r\n            data-viewlink="' +
	((__t = (sourcePage(it[i], 'viewlink', opt))) == null ? '' : __t) +
	'"\r\n        >' +
	((__t = (sourcePage(it[i], 'view', opt))) == null ? '' : __t) +
	'</a>\r\n    </td>\r\n</tr>\r\n';
	 } ;
	__p += '\r\n\r\n';
	 if(it.length === 0 ){;
	__p += '\r\n<td colspan="7" style="\r\n    text-align: center;\r\n    background: rgb(221, 221, 221);\r\n">无更多数据</td>\r\n';
	};
	__p += '\r\n';

	}
	return __p
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },

/***/ 128:
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (obj) {
	obj || (obj = {});
	var __t, __p = '';
	with (obj) {
	__p += '<a class="keyword-tag">' +
	((__t = (it.value)) == null ? '' : __t) +
	'<span class="keyword-del" data-event-click="removeKeyword" data-event-data="' +
	((__t = (opt.set(it.value))) == null ? '' : __t) +
	'">x</span></a>';

	}
	return __p
	}

/***/ },

/***/ 129:
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (obj) {
	obj || (obj = {});
	var __t, __p = '';
	with (obj) {
	__p += '<a class="keyword-tag">' +
	((__t = (it.value)) == null ? '' : __t) +
	'<span class="keyword-del" data-event-click="removeDebar" data-event-data="' +
	((__t = (opt.set(it.value))) == null ? '' : __t) +
	'">x</span></a>';

	}
	return __p
	}

/***/ },

/***/ 134:
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (obj) {
	obj || (obj = {});
	var __t, __p = '';
	with (obj) {
	__p += '<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" id="' +
	((__t = (it.id || '' )) == null ? '' : __t) +
	'">\r\n  <div class="modal-backdrop fade"></div>\r\n  <div class="modal-dialog">\r\n    <div class="modal-content">\r\n\r\n      <div class="modal-header">\r\n        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true" data-event-click="close">×</span><span class="sr-only">Close</span></button>\r\n        <h4 class="modal-title">' +
	((__t = (it.header)) == null ? '' : __t) +
	'</h4>\r\n      </div>\r\n      <div class="modal-body">\r\n        ' +
	((__t = (it.body)) == null ? '' : __t) +
	'\r\n      </div>\r\n      <div class="modal-footer">\r\n        <button type="button" class="btn btn-default" data-event-click="close">Close</button>\r\n      </div>\r\n\r\n    </div>\r\n  </div>\r\n</div>';

	}
	return __p
	}

/***/ }

});