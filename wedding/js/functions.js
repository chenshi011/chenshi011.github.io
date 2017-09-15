
var $window = $(window), gardenCtx, gardenCanvas, $garden, garden;
var clientWidth = $(window).width();
var clientHeight = $(window).height();

$(function () {
	pageResponse({
        selectors : '.page',     //模块选择器，使用querySelectorAll的方法
        mode : 'contain',     // auto || contain || cover ，默认模式为auto 
        width : '340',      //输入页面的宽度，只支持输入数值，默认宽度为320px
        height : '504'      //输入页面的高度，只支持输入数值，默认高度为504px
    })
	pageResponse({
        selectors : '#loveHeart',     
        mode : 'contain',     
        width : '670',      
        height : '625'      
    })
    
});

$(window).resize(function() {
    var newWidth = $(window).width();
    var newHeight = $(window).height();
    if (newWidth != clientWidth && newHeight != clientHeight) {
        location.replace(location);
		
    }
});

function pageResponse(opt) {
    var ua = navigator.userAgent,
        wp = ua.match(/Windows Phone ([\d.]+)/),
        android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),

        // 设备宽高初始比例
        dw = document.documentElement.clientWidth,
        dh = document.documentElement.clientHeight,
        ds = dw / dh,

        // 页面宽高初始比例
        pw = opt.width || 320,
        ph = opt.height || 504,
        ps = pw / ph,

        // 调用的选择器
        pd = document.querySelectorAll(opt.selectors),
        i = pd.length,

        // 核心代码：页面缩放比例
        sm = opt.mode || "auto",
        or = opt.origin || "left top 0",
        sn = (sm == "contain") ? (ds > ps ? dh / ph : dw / pw) : (sm == "cover") ? (ds < ps ? dh / ph : dw / pw) : dw / pw; 

    //样式模板 auto || contain || cover
    function template(mode, obj, num) {
        var _o = obj.style;
        _o.width = pw + "px";
        _o.height = ph + "px";
        _o.webkitTransformOrigin = or;
        _o.transformOrigin = or;
        _o.webkitTransform = "scale(" + num + ")";
        _o.transform = "scale(" + num + ")";
        // 兼容android 2.3.5系统下body高度不自动刷新的bug
        if (mode == "auto" && android) {
            document.body.style.height = ph * num + "px";
        } else
        if (mode == "contain" || mode == "cover") {
            _o.position = "absolute";
            _o.left = (dw - pw) / 2 + "px";
            _o.top = (dh - ph) / 2 + "px";
            _o.webkitTransformOrigin = "center center 0";
            _o.transformOrigin = "center center 0";
            // 阻止默认滑屏事件
            if (wp) {
                document.body.style.msTouchAction = "none";
            } else {
                document.ontouchmove = function(e) {
                    e.preventDefault()
                }
            }
        }
		
		if (obj.id == "loveHeart") {
			initGarden(pw,ph, num);
			adjustCodePosition(pw * num / 20, num);
		}
    }

    //运行
    while (--i >= 0) {
        template(sm, pd[i], sn);
    }
	
}
/*  使用方法
 *  window.onload = window.onresize = function(){
 *      pageResponse({
 *          selectors : '输入类名', //模块的类名
 *          mode : 'contain',    // auto || contain || cover 
 *          width : '320',     //默认宽320px 
 *          height : '504',     //默认高504px
 *          origin : 'center center 0'     //缩放中心点，可选，在contain和cover模式下无效，默认为"left top 0"
 *      })
 *   }
 */


function initGarden(w,h,scale){
	// setup garden
    $garden = $("#garden");
    gardenCanvas = $garden[0];
	gardenCanvas.width = w * scale;
    gardenCanvas.height = h * scale;
    gardenCtx = gardenCanvas.getContext("2d");
    gardenCtx.globalCompositeOperation = "lighter";
    garden = new Garden(gardenCtx, gardenCanvas);
	offsetX = w * scale / 2;
	offsetY = h * scale / 2 - 55 * scale;
	mGardenScale = scale;
    // renderLoop
    setInterval(function () {
        garden.render();
    }, Garden.options.growSpeed);

}

function getHeartPoint(angle) {
	var t = angle / Math.PI;
	var x = 19.5 * (16 * Math.pow(Math.sin(t), 3)) * mGardenScale;
	var y = - 20 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * mGardenScale;
	return new Array(offsetX + x, offsetY + y);
}

function startHeartAnimation() {
	var interval = 50;
	var angle = 10;
	var heart = new Array();
	var animationTimer = setInterval(function () {
		var bloom = getHeartPoint(angle);
		var draw = true;
		for (var i = 0; i < heart.length; i++) {
			var p = heart[i];
			var distance = Math.sqrt(Math.pow(p[0] - bloom[0], 2) + Math.pow(p[1] - bloom[1], 2));
			if (distance < Garden.options.bloomRadius.max * 1.3) {
				draw = false;
				break;
			}
		}
		if (draw) {
			heart.push(bloom);
			garden.createRandomBloom(bloom[0], bloom[1]);
		}
		if (angle >= 30) {
			clearInterval(animationTimer);
			showMessages();
		} else {
			angle += 0.2;
		}
	}, interval);
}

(function($) {
	$.fn.typewriter = function() {
		this.each(function() {
			var $ele = $(this), str = $ele.html(), progress = 0;
			$ele.html('');
			var timer = setInterval(function() {
				var current = str.substr(progress, 1);
				if (current == '<') {
					progress = str.indexOf('>', progress) + 1;
				} else {
					progress++;
				}
				$ele.html(str.substring(0, progress) + (progress & 1 ? '_' : ''));
				if (progress >= str.length) {
					clearInterval(timer);
				}
			}, 75);
		});
		return this;
	};
})(jQuery);

function adjustCodePosition(offsetX, scale) {
	//$('#code').css("margin-top", ($("#garden").height() - $("#code").height()) / 2);
	$('#code').css("top", $("#content").position().top + $("#content").height() / 2 - scale * 20);
	$('#code').css("left", offsetX + scale * 10);
}
