window.onload = function(){
	var wxConfig = document.getElementById('wrap').getAttribute('data-config');
	document.getElementById('content').innerHTML = document.getElementById('wrap').getAttribute('data-conetent');
	document.getElementById('config').innerHTML = wxConfig;
	wx.config(JSON.parse(wxConfig));
	var i = 0;
	var testDom = document.getElementById('test');
	wx.ready(function(){

		var click = function(){
			if(i%2==0){
				testDom.innerHTML = 'showOptionMenu';
				wx.hideOptionMenu();
			}else{
				testDom.innerHTML = 'hideOptionMenu';
				wx.showOptionMenu();
			}
			i++;
		}
		testDom.addEventListener('click',click,false);
		var shareData = {
			title: '自定义标题', // 分享标题
		    link: 'http://www.kaolalicai.cn/', // 分享链接
		    desc: "自定义描述", // 分享描述
		    imgUrl: 'http://wx.qlogo.cn/mmopen/FR21m6hiaUxGV4v9uiccQXCUgZ5dJ8gbBeghbeVgfX1iaQ5bgTDp8AqS9VcQy0B6ASmBZiaLZIibTs5Uaq9KqgtvTmM5ibIl4Rkatu/0' // 分享图标
		}
		wx.checkJsApi({
			jsApiList:['onMenuShareTimeline','onMenuShareAppMessage'],
			success:function(res){
				alert(JSON.stringify(res));
			}
		});
		//分享到朋友圈
		wx.onMenuShareTimeline({
		    title: shareData.title, // 分享标题
		    link: shareData.link || 'http://www.kaolalicai.cn/photo_wall_index', // 分享链接
		    imgUrl: shareData.imgUrl, // 分享图标
		    success: function () { 
		    	// alert('ok');
		        // 用户确认分享后执行的回调函数
		    },
		    cancel: function () { 
		    	// alert('cancel');
		        // 用户取消分享后执行的回调函数
		    }
		});
		//分享给朋友
		wx.onMenuShareAppMessage({
		    title: shareData.title, // 分享标题
		    desc: shareData.desc, // 分享描述
		    link: shareData.link || 'http://www.kaolalicai.cn/photo_wall_index', // 分享链接
		    imgUrl: shareData.imgUrl, // 分享图标
		    type: 'link', // 分享类型,music、video或link，不填默认为link
		    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
		    success: function () { 
		        // 用户确认分享后执行的回调函数
		    },
		    cancel: function () { 
		        // 用户取消分享后执行的回调函数
		    }
		});
	});
	wx.error(function (res) { 
		alert(res.errMsg); 
		//$('#testsignature').html(window.location.href);
		//$('#testUrl').html(wxConfig.signature);
	});
}

