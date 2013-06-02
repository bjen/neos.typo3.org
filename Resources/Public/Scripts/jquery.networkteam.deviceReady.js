/*
 * jQuery Plugin: deviceReady
 *
 * Copyright (c) 2012-2013 networkteam GmbH
 *
 * Date: 2013-03-01
 *
 * Version: 0.9
 *
 * Description:
 *      Adds classes to the <body> reflecting window.width mapped to certain devices
 *      Updates on $(window).resize()
 *      Triggers a 'devicechange' event on $(document) if width changes to another device while resizing
 *
 *
 *      Provides the following methods:
 *
 *      jQuery.deviceReady(collection,callback);
 *          collection: Array containing devices that must be available
 *          callback: Function executed by jQuery.ready()
 *
 *      jQuery.isDevice(deviceName);
 *          deviceName: String with name of device to test
 *          returns true or false;
 *
 *      jQuery.isDevice(collection);
 *          collection: Array containing devices to test
 *          returns true or false;
 */

;
(function($, window, document, undefined) {

	//  =================================
	//  = default devices and widths =
	//  =================================
	var defaultDevices = {
		mobile: {
			minWidth: '0',
			maxWidth: '480',
			classname: 'mobile'
		},
		tabletPortrait: {
			minWidth: '481',
			maxWidth: '767',
			classname: 'tablet-portrait'
		},
		tablet: {
			minWidth: '768',
			maxWidth: '979',
			classname: 'tablet'
		},
		desktop: {
			minWidth: '980',
			maxWidth: '1199',
			classname: 'desktop'
		},
		desktopLarge: {
			minWidth: '1200',
			maxWidth: '9999',
			classname: 'desktop-large'
		}
	}, deviceReadyDefaults = {
		fn: function() {
		}
	};

	//  =================================
	//  = deviceReady functionality =
	//  =================================
	function deviceReady(givenDevices, params) {
		var defaultDevices = defaultDevices,
			devices = false,
			options;

		// devices argument must be an array
		if (typeof (givenDevices) == 'object' && ( givenDevices instanceof Array)) {
			devices = givenDevices;
		}
		// options may be the callback function or an options object
		if (typeof (params) == 'function') {
			var fn = params;
			options = deviceReadyDefaults;
			options.fn = fn;
		} else {
			options = $.extend({}, deviceReadyDefaults, params);
		}

		function init() {
			check();
		}

		// check if width matches device (by comparing to the body's classes)
		function check() {
			var fn = options.fn;

			$(document).ready(function($) {
				var $body = $('body'),
					numDevices = devices.length,
					passedDevices = 0;

				$.each(devices, function(idx, classname) {
					if (!$body.hasClass(classname)) {
						return false;
					}
					passedDevices += 1;
				})

				// if all devices match, fire the callback function
				if (passedDevices == numDevices) {
					fn($);
				}
			})
		}

		init();
	}

	// check window.width and prepare appropriate classes
	function calculate() {
		// inconsistent width calculation could be fixed with Math.max($(window).innerWidth(), window.innerWidth)
		// but seems to return to high widths?! - so jQuery.width is used instead
		var width = $(window).width(),
			classes = [];

		$.each(defaultDevices, function(idx) {
			if (width >= this.minWidth && width <= this.maxWidth) {
				classes.push(this.classname);
			} else {
				classes.push('not-' + this.classname)
			}
		});
		setClasses(classes);
	};

	//check if a new calculation is required
	function reCalculate() {
		var $body = $('body'),
			width = $(window).width();

		//if a new class has to be set, do a complete new calculation (see calculate() )
		$.each(defaultDevices, function(idx) {
			if (width >= this.minWidth && width <= this.maxWidth) {
				if (!$body.hasClass(this.classname)) {
					calculate();
					$(document).trigger('devicechange')
				}
			}
		});
	}

	//assign classes to the body
	function setClasses(classes) {
		var $body = $('body');

		// 'reset' classes on body
		$body.removeClass('not-mobile not-tablet-portrait not-tablet not-desktop not-desktop-large mobile tablet-portrait tablet desktop desktop-large');

		$.each(classes, function(idx, val) {
			$body.addClass(val);
		});

		$body
			.removeClass('js-not-active')
			.addClass('device-ready js-active');
	};

	//  =================================
	//  = isDevice functionality =
	//  =================================
	function isDevice(devices, options) {
		var $body = $('body');

		//if given a string, check if body has appropriate class
		if (typeof devices == 'string' && $body.hasClass(devices)) {
			return true;
		}

		// if given an array, check for all classes
		if (typeof (devices) == 'object' && ( devices instanceof Array)) {
			var i = devices.length;

			while (i) {
				if (!$body.hasClass(devices[i - 1])) {
					return false;
				}
				i = i - 1;
			}
			// all classes passed, so return true
			return true;
		}

		// return false by default
		return false;
	}

	//  =================================
	//  = final assignments =
	//  =================================

	// extend the jQuery object with our deviceReady function
	// which may replace the default $.ready()-function
	$.deviceReady = function(devices, options) {
		return deviceReady(devices, options);
	};

	// extend the jQuery object with our isDevice function
	// which allows for explicit (and dynamic) device-detection
	$.isDevice = function(devices, options) {
		return isDevice(devices, options);
	};

	$(function() {
		var timeout = false;
		// always assign classes to body, so they might be used without $.deviceReady();
		calculate();

		$(window).on('resize', function() {
			if (timeout) {
				clearTimeout(timeout);
			}
			timeout = setTimeout(reCalculate, 300);
		})

		window.jq = $;
	});
})(jQuery, window, document);