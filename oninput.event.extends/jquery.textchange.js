/**
 *input�¼��������
 *���÷�ʽ��
 *		jquery on��textchange�¼�
 */

(function($) {
	var testNode = document.createElement("input");
	var isInputSupported = "oninput" in testNode 
		&& (!("documentMode" in document) || document.documentMode > 9);//documentMode ieר������  �жϵ�ǰie���ĵ�ģʽ
	var hasInputCapabilities = function(elem) {
    //�ò�������� input��ǩ�� type:text password
    return elem.nodeName === "INPUT" &&
        (elem.type === "text" || elem.type === "password");
	};
	var activeElement = null;
	var activeElementValue = null;
	var activeElementValueProp = null;
	//��дvalue��get set����
	var newValueProp =  {
		get: function() {
			return activeElementValueProp.get.call(this);
		},
		set: function(val) {
			activeElementValue = val;
			activeElementValueProp.set.call(this, val);
		}
	};
	//��ʼ�����¼�
	var startWatching = function(target) {
		activeElement = target;
		activeElementValue = target.value;
		activeElementValueProp = Object.getOwnPropertyDescriptor(
				target.constructor.prototype, "value");

		Object.defineProperty(activeElement, "value", newValueProp);
		activeElement.attachEvent("onpropertychange", handlePropertyChange);
	};
	//ֹͣ�����¼�
	var stopWatching = function() {
	  if (!activeElement) return;
	  delete activeElement.value;
	  activeElement.detachEvent("onpropertychange", handlePropertyChange);
	  activeElement = null;
	  activeElementValue = null;
	  activeElementValueProp = null;
	};
	//Ϊ��ǰԪ�� ��textchange�¼�
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
