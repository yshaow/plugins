/**
 *input事件补丁插件
 *调用方式：
 *		jquery on绑定textchange事件
 */

(function($) {
	var testNode = document.createElement("input");
	var isInputSupported = "oninput" in testNode 
		&& (!("documentMode" in document) || document.documentMode > 9);//documentMode ie专有属性  判断当前ie的文档模式
	var hasInputCapabilities = function(elem) {
    //该插件是用于 input标签的 type:text password
    return elem.nodeName === "INPUT" &&
        (elem.type === "text" || elem.type === "password");
	};
	var activeElement = null;
	var activeElementValue = null;
	var activeElementValueProp = null;
	//重写value的get set函数
	var newValueProp =  {
		get: function() {
			return activeElementValueProp.get.call(this);
		},
		set: function(val) {
			activeElementValue = val;
			activeElementValueProp.set.call(this, val);
		}
	};
	//开始监听事件
	var startWatching = function(target) {
		activeElement = target;
		activeElementValue = target.value;
		activeElementValueProp = Object.getOwnPropertyDescriptor(
				target.constructor.prototype, "value");

		Object.defineProperty(activeElement, "value", newValueProp);
		activeElement.attachEvent("onpropertychange", handlePropertyChange);
	};
	//停止监听事件
	var stopWatching = function() {
	  if (!activeElement) return;
	  delete activeElement.value;
	  activeElement.detachEvent("onpropertychange", handlePropertyChange);
	  activeElement = null;
	  activeElementValue = null;
	  activeElementValueProp = null;
	};
	//为当前元素 绑定textchange事件
	var handlePropertyChange = function(nativeEvent) {
		if (nativeEvent.propertyName !== "value") return;
		var value = nativeEvent.srcElement.value;
		if (value === activeElementValue) return;
		activeElementValue = value;
		$(activeElement).trigger("textchange");
	};
	if (isInputSupported) {
		$(document).on("input", function(e) {
				if (e.target.nodeName !== "TEXTAREA") {
					$(e.target).trigger("textchange");
				}
			});
	} else {
		$(document).on("focusin", function(e) {
				if (hasInputCapabilities(e.target)) {
					stopWatching();
					startWatching(e.target);
				}
			})
			.on("focusout", function() {
				stopWatching();
			})
			.on("selectionchange keyup keydown", function() {
				if (activeElement && activeElement.value !== activeElementValue) {
					activeElementValue = activeElement.value;
					$(activeElement).trigger("textchange");
				}
			});
	}
})(jQuery);
