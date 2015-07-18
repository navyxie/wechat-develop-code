# 微信开放平台接入Demo

需要注意的:

+ 公众帐号升级为服务号能使用更多的微信js api

+ 需要在微信公众帐号后台进行:服务器配置

+ 需要在微信公众帐号后台->公众号设置->公众号设置(tab):设置JS接口安全域名

+ 网页授权获取用户基本信息,需在网页账号那里设置回掉域名


**如果对接入的原理不了解，可以先去看这篇文章[如何接入微信公众平台](https://github.com/navyxie/wechat-develop)**，有详细的讲解。

> 本例子主要用到模块：wechat-wrap
> 模块安装： npm install wechat-wrap

示例代码使用[Nodejs](http://nodejs.org/)的[sails](http://sailsjs.org/)框架，模版引擎[jade](http://jade-lang.com/)，关键代码：

## nodejs

```js
var wechatWrap = require('wechat-wrap');
var OAuth = wechatWrap.OAuth;
var API = wechatWrap.API;
var wechat = new wechatWrap();
var config = {
  token: "navy_test",//请换成自己的token
  appid: 'wx9392a361ff7b9716',//请换成自己的公众账号的appid
  encodingAESKey: 'CGe8ueo9LB88YJqVk8yMTV5tuhJQkfnrE2U6lasdefd',//请换成自己的encodingAESKey
  secret:'fasfafsafsafsafsafsafsa'//请换成自己的公众账号的app secret
};
var client = new OAuth(config.appid, config.secret);
var api = new API(config.appid, config.secret);
var WeiXin = {
	checkSignature:function(signature,timestamp,nonce,token){
		return wechat.checkSignature(signature,timestamp,nonce,token);
	}
}
module.exports = {
	weixin:function(req,res) {
		//认证数据是否从微信服务发送过来
		var signature = req.param('signature');
		var timestamp = req.param('timestamp');
		var nonce = req.param('nonce');
		var echostr = req.param('echostr');
		if(WeiXin.checkSignature(signature,timestamp,nonce,echostr)){
			//若是微信服务器发送过来的认证信息，则响应返回echostr
			res.send(echostr);
		}else{
			console.warn('not weixin server!');
			res.json(200,{code:-1,msg:'not weixin server!'});
		}
	},
	chat:function(req,res){
		//获取授权跳转链接
		var redirectUrl = "http://test.kaolalicai.cn/activity";
		var url = client.getAuthorizeURL(redirectUrl, 'ok', 'snsapi_userinfo');
		res.redirect(url);
	},
	activity:function(req,res){
		var code = req.param('code');
		client.getAccessToken(code, function (err, result) {
		  console.log("result:"+JSON.stringify(result));
		  var accessToken = result.data.access_token;
		  var openid = result.data.openid;
		  console.log("accessToken:"+accessToken);
		  console.log("openid:"+openid);
		  //根据openid 获取用户授权信息
		  client.getUser(openid, function (err, result) {
			  var userInfo = result;		  
			  var param = {
				debug: false,
				jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage','hideOptionMenu','showOptionMenu'],
				url: "http://test.kaolalicai.cn" + req.url
			  };
			  //设置js api 参数
			  api.getJsConfig(param,function(err,result){
			  	userInfo['jsconfig'] = result;
			  	console.log("userInfo:"+JSON.stringify(userInfo));
			  	res.view('weixin',{title:"test weixin api",data:userInfo});
			  })			  
			});
		});
	}
}
```

代码说明

1. 假如我们配置（微信开发者中心 / 填写服务器配置）中的服务器地址为：http://www.navy.com/weixin,使用上面代码的weixin方法来验证消息来自微信服务器
2. 
2. 引导用户到微信授权页，获取授权认证吗code。使用上面代码的chat方法
3. 用户同意授权后的跳转页面。使用上面代码的activity方法，我们就可以在这个页面进行js-sdk方法的调用了。

## jade

```
extends m_layout
block stylesheets

block scripts
	script(src="/js/weixin.js?t=2015041501",type="text/javascript",charset="utf-8")
block body
	#wrap(data-config="#{JSON.stringify(data.jsconfig)}",data-conetent="#{JSON.stringify(data)}")
		#test hideOptionMenu
		#content
		#config
```
## js(前端)
```js
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
```

示例代码结束。
