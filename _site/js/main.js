(function(){
// 获取页面元素
var myElement = document.querySelector("header");
// 创建 Headroom 对象，将页面元素传递进去
var headroom  = new Headroom(myElement, {
    "offset": 55,
    "tolerance": 5
});
// 初始化
headroom.init(); 

})();