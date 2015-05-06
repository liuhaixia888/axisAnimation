define(['zepto', 'guid', 'listen'], function($, guid) {
	var listen, selected, _selected, AxisAnimation;

	selected = 'selected';
	_selected = '.selected';

	// api优化，缩减长度，公私区分
	// 事件优化，处理用户事件，开放自定义事件给消费者
	// 避免用标签选择器
	// this.defaultConfig的错误使用


	AxisAnimation = function(config){
		var self = this;

		this.defaultConfig = {
			handle:'.axis-handle',
			container: $('.container'),
			axisAnimation:'axis-animation',
			direction: 'x',
			size: '600'
		};

		this.allKeyframe = [];
		this.config = $.extend(this.defaultConfig, config || {});
		
		this.isX = this.config.direction === 'x';
		this.sizeName = this.isX ? 'width' : 'height';

		this.guid = guid();
		
		this.init.call(this);

		// by gavinning
		// 添加ui相关支持
		this.ui = {};

		this.ui.element = this.config.axisAnimation = this.isX ? 
			this.config.container.find('.axis-horizontal').find($('.' + this.config.axisAnimation)): 
			this.config.container.find('.axis-vertical').find($('.' + this.config.axisAnimation));

		this.ui.element.css( this.sizeName, this.config.size + 'px' );
		
	};

	AxisAnimation.prototype = AxisAnimation.fn = {
		init: function(){
			this.render();
		},

		// 时间轴事件交互支持
		events: {
			init: function(timeline){
				var that = this;
				var isX = timeline.isX;
				
				// 拖动关键帧
				timeline.drag();
				//双击新建关键帧
				timeline.ui.element.dblclick(function(e){
					var id = $(e.currentTarget).parents('.axis-wrapper').attr('id');

					if(id == timeline.guid && e.target.className == 'axis-animation'){
						timeline.create(e);
					}
				});

				//当前选中的关键帧
				timeline.ui.element.delegate('span', 'click', function(e){
					var current, prev, currentElement, prevElement;

					currentElement = $(this);
					prevElement = $(this).siblings(_selected);

					current = $(this).attr('data-id');

					// 不存在 _selected
					if(!currentElement.hasClass(selected) && prevElement.length === 0){
						prev = null;
					}

					// 当前选择的元素包含 _selected
					if(currentElement.hasClass(selected)){
						prev = current;
					}

					// 存在非当前元素 _selected
					if(prevElement.length){
						prev = prevElement.attr('data-id');
					}

					// 发射当前关键帧改变事件
					$(document).trigger('keyChange', {prev: prev, current: current});

					// 更新关键帧状态
					$(this).addClass(selected).siblings().removeClass(selected);
					$(this).focus();
				});

				//当前选中的关键帧绑定键盘事件
				timeline.ui.element.delegate('span.axis-handle.selected', 'keydown', function(event){
					var e = event || window.event;
					e.stopPropagation(); 
					e.preventDefault();

		            var which = e.which,
		                isTrigger = false,
		                value = parseInt($(this).attr('data-value')),
		                min = Math.round(20/timeline.config.size * 100),
		                max = Math.round((parseInt(timeline.config.size) - 40)/timeline.config.size * 100);

			            if( isX && which === 39 || !isX && which === 40 ){
			                isTrigger = true;
			                value = value + 10;
			                value = value > max ? max: value;
			            }
			            else if( isX && which === 37 || !isX && which === 38 ){
			                isTrigger = true;
			                value = value - 10;
			                value = value < min ? min: value;
			            }

				        if( value < min || value > max ){
			                isTrigger = false;
			            }

		                if(timeline.isX){
		                	if(isTrigger)$(this).css('left', value+'%');
		                }else{
		                	if(isTrigger)$(this).css('top', value+'%');
		                }

            			$(this).attr('data-value', value);
		                $(this).find('.percent').text(value + '%');	
		            
		            return false;		
					
				});
					
			}
		},

		//渲染到页面
		render: function(){
			switch(this.isX){
				case true: 
					this.initHtml({
						wrapper: 'axis-horizontal',
						position: ['left:0%','right:0%']
					});
				break;
				case false:
					this.initHtml({
						wrapper: 'axis-vertical',
						position: ['top:0%','bottom:0%']
					});	
				break;			
			};
		},

		initHtml: function(){
			var html, gid1 = guid(), gid2 = guid(), param = arguments[0];

			html =  '	<div class="axis-wrapper '+param.wrapper+'" id="'+this.guid+'">'+
					'		<div class="axis-animation">'+
					'			<span class="axis-handle-first selected" style="'+param.position[0]+'" data-id="' +gid1+ '" data-value="0%"><em class="percent">0%</em></span>'+
					'			<span class="axis-handle-last" style="'+param.position[1]+'" data-id="' +gid2+ '" data-value="100%"><em class="percent">100%</em></span>'+
					'		</div>'+
					'	</div>';
			this.config.container.append(html);	
		},

		//新建关键帧
		create: function(e){
			switch(this.isX){
				case true: 
					this._create(e, e.layerX, 'offsetWidth', 'width', 'left');
				break;
				case false:
					this._create(e, e.layerY, 'offsetHeight', 'height', 'top');
				break;			
			};
		},

		_create: function(e){
			var gid = guid();
			var axisAnimation = this.config.axisAnimation; 
			var axis = arguments[1];
			var a = arguments[2];
			var b = arguments[3];
			var c = arguments[4];
			var target =$(e.currentTarget), span = target.find('span');
			var percent;

			if(axis < 20){
				axis = 20;
			}else if(axis >= (axisAnimation[0][a] - 40)){
				axis = axisAnimation[0][a] - 40;
			}

			percent = Math.round((axis/axisAnimation[0][a]) * 100);
			var str = '<span class="axis-handle" style="'+c+':' +percent+ '%" data-id="'+gid+'" data-drag="0" data-value="'+percent+'" tabindex="0"><em class="percent">'+percent+'%</em></span>';
			target.append(str);

			// 选中新创建的关键帧
			this.ui.element.find('[data-id="'+gid+'"]').click();
		  
			var select = this.ui.element.find('span.axis-handle.selected');
			select.focus();

		},

		drag: function(){//拖动关键帧
			switch(this.isX){
				case true: 
				this._drag('.axis-horizontal', 'offsetLeft', 'offsetWidth', 'left');
				break;
				case false:
				this._drag('.axis-vertical', 'offsetTop', 'offsetHeight', 'top');
				break;			
			};
		},

		_drag: function(){
			var disX = 0, disY = 0;
			var that = this;
			var handle = this.config.handle;
			var axisAnimation = this.config.axisAnimation; 
			var a = arguments[0];
			var b = arguments[1];
			var c = arguments[2];
			var d = arguments[3];

			that.config.container.delegate(a + ' .axis-handle', 'mousedown', function(event){
				event.preventDefault();
				var e = event || window.event;
				var target = e.currentTarget;
					
				var id = $(target).attr('data-id'),
					startPosi = target[b];

				if(that.isX){
					disX = e.clientX - target[b]; 
				}else{
					disY = e.clientY - target[b];
				}

				if(target.setCapture){
					target.setCapture();
				}

				document.onmousemove = function(event){
					event.preventDefault();
					var e = event || window.event;
					var axis;


					if(that.isX){
						var axis = e.clientX - disX;
					}else{
						var axis = e.clientY - disY;
					}

					if(axis < 20){ 
						axis = 20;
					}
					else if(axis >= axisAnimation[0][c] - 40){
						axis = axisAnimation[0][c] - 40;
					}
					var percent = Math.round((axis/axisAnimation[0][c]) * 100);

					target.style[d] = percent + '%';
					$(target).find('.percent').text(percent + '%');	
		
					return false;	
				};	

				document.onmouseup = function(event){
					event.preventDefault();
					document.onmousemove = null;
					document.onmouseup = null;
	
					if(startPosi != endPosi){
						var endPosi = parseInt($(target).css(d));
						var obj = {};
						obj.id = that.guid;
						obj.param = {};
						obj.param.id = $(target).attr('data-id');
						obj.param[d] = endPosi;

						$(target).trigger('keyframeChange', obj);
					}

					if(target.releaseCapture){
						target.releaseCapture();
					}

				};				

				return false;				
			});
		},

		// 返回当前关键帧对象
		current: function(){
			return this.ui.element.find(_selected);
		},

		// 返回当前关键帧对象
		currentKeyframeValue: function(){
			return this.current().attr('data-value');
		},

		// 返回第一帧对象
		first: function(){
			return this.ui.element.find('.axis-handle-first');
		},

		// 返回最后一帧对象
		last: function(){
			return this.ui.element.find('.axis-handle-last');
		},

		// 返回当前关键帧的值
		keyframeValue: function(gid){
			return this.ui.element.find('[data-id="'+gid+'"]').attr('data-value');
		},

		// 获取所有关键帧
		getAllKey: function(){ 
			switch(this.isX){
				case true: 
					return this._getAllKey('left', 'right');
				break;
				case false:
					return this._getAllKey('top', 'bottom');
				break;			
			};

		},

		_getAllKey: function(){
			var allKeyframe = [], allKeyframeObj = {};
			var elem = this.ui.element.find('.axis-handle'),
				elemFirst = this.ui.element.find('.axis-handle-first'),
				elemLast = this.ui.element.find('.axis-handle-last');	
			var a = arguments[0], 
				b = arguments[1];		

			elem.each(function(i, item){
				var obj = {};
				obj.id = $(item).attr('data-id'), obj[a] = $(item).css(a);
				allKeyframe.push(obj);
			});

			var objFirst = {}, objLast = {};
			objFirst.id = elemFirst.attr('data-id'),
			objFirst[a] = elemFirst.css(a),
			objLast.id = elemLast.attr('data-id'),
			objLast[b] = elemLast.css(b);
			allKeyframe.unshift(objFirst);
			allKeyframe.push(objLast);

			allKeyframeObj.guid = this.guid;
			allKeyframeObj.param = allKeyframe;

			return allKeyframeObj;
		},

		delKeyframe: function(gid){//删除关键帧
			this.ui.element.find('[data-id="'+gid+'"]').remove();
		}

	}

	return AxisAnimation;

});