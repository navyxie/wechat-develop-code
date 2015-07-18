//weixin api docs:https://mp.weixin.qq.com/advanced/advanced?action=dev&t=advanced/dev&token=1241494982&lang=zh_CNhttps://mp.weixin.qq.com/advanced/advanced?action=dev&t=advanced/dev&token=1241494982&lang=zh_CN
var wechatWrap = require('wechat-wrap');
var OAuth = wechatWrap.OAuth;
var API = wechatWrap.API;
var wechat = new wechatWrap();
var config = {
  ttoken: "navy_test",//请换成自己的token
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