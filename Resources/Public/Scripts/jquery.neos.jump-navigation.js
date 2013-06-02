/*
 * jQuery Plugin: neosJumpNavigation
 *
 * Copyright (c) 2013 - networkteam GmbH
 *
 * Date: 2013-02-22
 * Description:
 *   Manages affix- and scrollspy-functionality
 */

(function($) {
	var defaults = {
		scrollSpeed: 700,       //offset for both scrollspy and scrollTo
		scrollOffset: 40,       //speed of scroll-to
		showToTop: true,        // whether to render a 'to-top' link inside the navigation
		templates: {
			toTop: '<a href="#top" title="To Top" class="to-top"><span class="icon-arrow-up"></span></a>'
		}
	}
	$.fn.neosJumpNavigation = function(options) {

		// vars ----------------------------------------------
		var $that = $(this),
			$items = $that.find('li a'),
			options = $.extend( defaults, options),
			offsetTop = $that.parent().offset().top,
			navigationCloned = false,
			resizeTimer = false;


		// Functions -----------------------------------------
		function toggleAffix(scrollTop){
			var scrollTop = $(window).scrollTop();

			if(scrollTop > offsetTop){
				$that.addClass('affix')
			}else{
				$that.removeClass('affix')
			}
		}

		function restyleNavigation(target) {
			var $target = $(target),
				$section = $target.find('> .section');

			$that.removeClass('over-green over-white over-grey over-orange')

			if($section.hasClass('green')){
				$that.addClass('over-green')
			} else if($section.hasClass('orange')){
				$that.addClass('over-orange')
            } else if($section.hasClass('grey')){
                $that.addClass('over-grey')
			} else if($section.hasClass('white')){
				$that.addClass('over-white')
			}
		}

		function scrollIntoView(el) {
			var target = '#' + $(el).attr('href').split('#')[1],
				targetTop = $(target).offset().top - options.scrollOffset + 2;

			$('html,body').stop().animate({
				scrollTop: targetTop
			},options.scrollSpeed)
		}

		function copyNavigationIntoEachSection() {
			//var $sections = $that.parent().siblings().find('.section');

			var links = $items.map(function(){
				return '#' + $(this).attr('href').split('#')[1]
			})

			links.each(function(idx,val){
				var $nav = $that.clone();

				$nav
					.addClass('cloned')
					.removeClass('affix over-green over-grey over-white over-orange')
					.attr('id','')
					.find('.active')
						.removeClass('active')
					.end()
					.find('li')
						.eq(idx)
							.addClass('active')
						.end()
					.end()
					.find('script')
						.remove()

				$nav
					.find('li').eq(idx).addClass('active');

				if(options.showToTop && $nav.find('.to-top').length === 0) {
					$(options.templates.toTop).appendTo($nav.find('.navbar'));
				}

				$nav.insertBefore($(val));

			})

			$that.parent().addClass('cloned-hidden');
			navigationCloned = true;

			$('.menu.cloned a').on('click', function() {
				if($(this).hasClass('to-top')) {
					scrollToTop();
					return false;
				}
				scrollIntoView(this);
				return false;
			})
		}

		function renderToTop() {
			var $toTop = $(options.templates.toTop);

			$toTop
				.appendTo($that.find('.navbar'))

			$toTop.on('click', function() {
				scrollToTop();
				return false;
			})
		}

		function scrollToTop() {
			$('html, body').animate({
				scrollTop: 0
			}, options.scrollSpeed);
		}

		// Initialisation ------------------------------------
		function init() {
			// render showTop first to have it copied if needed
			if(options.showToTop) {
				renderToTop();
			}

			$that.parent().css('minHeight',$that.outerHeight())
			$('body')//.attr('data-target','#jump-navigation')
				.css('height','auto') //needed to make scrollspy work in firefox :(
				.scrollspy({
					offset: options.scrollOffset,
					target: '#jump-navigation'
				});
			offsetTop = $that.parent().offset().top;
			toggleAffix()

			$(window).on('scroll',function(e){
				toggleAffix();
			})
		}

		// Events --------------------------------------------
		$items.on('click',function(e){
			scrollIntoView(this);

			return false;
		})

		$items.parent().on('activate',function(){
			var href = '#' + $(this).find('a').attr('href').split('#')[1];

			restyleNavigation(href);
		})

		$(window).on('resize',function(){
			if(resizeTimer) {
				clearTimeout(resizeTimer);
			}
			resizeTimer = setTimeout(function(){
				offsetTop = $that.parent().offset().top;
				$('body').scrollspy('refresh');
			}, 300)
		})

		$(document).on('devicechange',function(){
			if(($.isDevice('tablet') || $.isDevice('tablet-portrait')) && !navigationCloned){
				copyNavigationIntoEachSection();
			}
		})

		// Execution -----------------------------------------

		//wait for all layout to be ready
		$(window).load(function(){
			if($.isDevice('tablet') || $.isDevice('tablet-portrait')) {
				copyNavigationIntoEachSection();
			}
			init();
		});

		// enable chaining
		return $that;
	};
})(jQuery);