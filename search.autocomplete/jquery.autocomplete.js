/**
*	搜索自动补全
*	调用方式：new Autocomplete().init(...args);
*	init参数：
*		@param url  模糊查询地址
*		@param selector 选择器 默认值className:'autocomplete'
*		@param getUrl  关联信息查询接口
*		@param sucFun  关联信息数据处理函数
*/
var autocomplete={
	targetDom:null,
	width:0,
	height:0,
	countNum:null,
	border:null,
	container:null,
	targetParent:null,
	getUrl:null,
	sucFun:null,
	url:null,
	selector:null,
	selectPrevVal:null,//表示模糊查询的上一个值
	dataOneState:true,//表示可修改
	init:function(selector,url,getUrl,sucFun){
			this.selector=selector;
			this.url=url;
			this.getUrl=getUrl;
			this.sucFun=sucFun;
			//添加相关样式
			$('head').append('<style>ins input{vertical-align:top}ins li{height:24px;line-height:24px;box-sizing:border-box;padding:0 10px;font-size:14px;width:100%;overflow:hidden;cursor:pointer;}ins li.active{background-color:#ddd;}ins{position:relative;display:inline-block;}ins ul{position:absolute;list-style:none;left:0;margin:0;padding:0;background-color:#fff;z-index:9999;box-sizing:border-box;overflow-x:hidden;display:none}</style>');
			this.targetDom=$(this.selector).css({backgroundColor:'transparent',outline:'none'}).attr('autocomplete','off');
			this.width=this.targetDom.outerWidth();
			this.height=this.targetDom.outerHeight();
			this.border=this.targetDom.css('border');
			this.border=this.border == ''?"2px solid #ddd":this.border;
			//添加父元素
			this.container=this.targetDom.wrap('<ins style="height:'+this.height+'px;width:'+this.width+'px"></ins>')
			//添加查询容器
			.after('<ul style="top:'+this.height+'px;width:'+this.width+'px;border:'+this.border+';"></ul>');
			this.targetParent=this.targetDom.parent('ins');
			var me=this;
			//添加事件
			if('oninput' in this.targetDom[0]){
				this.targetDom.on('input',function(){
					var val=$.trim(this.value);
					if(val != ''){
						if(val !== me.selectPrevVal){
							me.countNum=null;
							me.selectPrevVal=val;
							$.ajax({
								url:me.url,
								data:{keywords:val},
								type:"POST",
								success:function(data){
									for(var i=0,str='';i<data.length;i++){
										str +='<li data-hide="'+data[i].hideContent+'">'+data[i].showContent+'</li>';
									}
									if(str != ''){
										me.targetParent.find('ul').html(str).css('display','block');
										if(data.length >1){
											if(!me.dataOneState){
												me.dataOneState=true;
											}
										}else if(data.length == 1){
											if(me.dataOneState){
												me.targetDom.val(data[0].showContent);
												me.targetParent.find('ul').html('').css('display','none');
												me.getData(data[0].hideContent);
												me.selectPrevVal=null;
												me.dataOneState=false;
											}
										}
									}else{
										me.targetParent.find('ul').html('').css('display','none');
									}
								}
							})
						}
					}else{
						me.targetParent.find('ul').html('').css('display','none');
					}
				});
			}else{
				console.log('您当前浏览器不支持onInput事件！');
			}
			//添加 向上 向下箭头
			$(document).keydown(function(event){
				var liNum=0,targetUl=me.targetParent.find('ul');
				if(targetUl.css('display') !== 'none'){
					liNum=targetUl.find('li').length;
				}
				if(liNum > 0){
					switch(event.keyCode){
						case 38:
							if(me.countNum != null){
								me.countNum == 1?me.countNum=liNum:me.countNum--;
							}else{
								me.countNum=liNum;
							}
							if(me.countNum != null){
								var currentLi=targetUl.find('li:nth-child('+me.countNum+')').addClass('active');
								currentLi.siblings('.active').removeClass('active');
								me.targetDom.val(currentLi.html());
							}
							break;
						case 40:
							if(me.countNum != null){
								me.countNum == liNum?me.countNum=1:me.countNum++;
							}else{
								me.countNum=1;
							}
							if(me.countNum != null){
								var currentLi=targetUl.find('li:nth-child('+me.countNum+')').addClass('active');
								currentLi.siblings('.active').removeClass('active');
								me.targetDom.val(currentLi.html());
							}
							break;
						case 13:
							var liActive=targetUl.find('li.active');
							if(liActive.length>0){
								me.targetDom.val(liActive.html());
								me.targetParent.find('ul').html('').css('display','none');
								me.getData(liActive.attr('data-hide'));
							}
					}
					
				}
			});
			//添加鼠标移入移出事件
			me.targetParent.on('mouseover','li',function(){
				$(this).addClass('active').siblings('.active').removeClass('active');
				me.targetDom.val($(this).html());
			})
			me.targetParent.on('mouseout','li',function(){
				$(this).removeClass('active');
				me.countNum=null;
			})
			me.targetParent.find('ul').on('click','li',function(){
				me.targetDom.val($(this).html());
				$(this).parent('ul').html('').css('display','none');
				me.getData($(this).attr('data-hide'));
			});
			me.targetParent.find('input').blur(function(){
				me.selectPrevVal=null;
			});
	},
	getData:function(id){
			if(this.getUrl != undefined && id !== undefined){
				this.selectPrevVal=null;
				$.ajax({
					url:this.getUrl,
					data:{id:id},
					type:"POST",
					success:this.sucFun
				});
			}
	}
}
function Autocomplete(){}
Autocomplete.prototype=autocomplete;