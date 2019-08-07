let uId = 0;
/*观察者缓存*/
let Target=null;
/*观察者，订阅者*/
class Watcher{
    constructor(vm,key,callback){
        this._cb = callback;
        this._vm = vm;
        this._key = key;   //保存键值
        this._uid = uId;
        uId++; //每个观察者配个ID，防止重复添加
        Target=this;
        //vm[exp] 就会触发get，将当前Watcher对象添加到dep的依赖集合中
        this._value = vm[key];
        Target = null; //用完就删
    }
    update(){
        let value = this._vm[this._key];
        if(value !== this._value){
            this._value = value;
            this._cb.call(this._vm,value);
        }
    }
}
/*被订阅者，被观察者，被观察的目标*/
class Dep{
    constructor(){
        this.subs = [];
    }

    add(watcher){
        this.subs.push(watcher)
    }

    notify(){
        this.subs.forEach(sub => {
            sub.update();
        })
    }
}
/*编译要是用响应式框架的根节点，将节点内元素与数据关联*/
class Compile {
    constructor(el, vm) {
        this._el=el;
        this._vm=vm;
        this._compileElement(el);
    }
    _compileElement(el){//遍历节点
        let childs=el.childNodes;
        //类数组对象转换为数组
        Array.from(childs).forEach(node=>{
            if(node.childNodes&&node.childNodes.length){
                this._compileElement(node);
            }else{
                this._compile(node);
            }
        })
    }
    _compile(node){
        if(node.nodeType===3){//文本节点
            let reg = /\{\{(.*)\}\}/;
            let text = node.textContent;
            if(reg.test(text)){
                //如果这个元素是{{}}这种格式
                let key = RegExp.$1;
                node.textContent =  this._vm[key];
                new Watcher(this._vm,key,val=>{
                    node.textContent =  val;
                })
            }
        }else if(node.nodeType===1){//元素节点
            let nodeAttr=node.attributes;
            Array.from(nodeAttr).forEach(attr=>{
                if(attr.nodeName=='v-model'){
                    let key=attr.nodeValue;
                    node.value = this._vm[attr.nodeValue]; //初始化赋值
                    //如果这个元素有v-model属性，那么得做点事情了
                    node.addEventListener('input',()=>{
                        this._vm[key] = node.value;
                    });
                    new Watcher(this._vm,attr.nodeValue,val =>{
                        node.value =  val;
                    })
                }
            })
        }
    }

}
/*对象数据代理*/
function observe(data) {
    if(typeof data!=='object'){
        return;
    }
    Object.keys(data).forEach(key=>{
        defineReactive(data,key,data[key])
    });
}
/*定义响应式属性代理,响应式触发器*/
function defineReactive(data, key, val) {
    //继续监听或者观察val
    observe(val);
    let dep = new Dep();
    //通过get、set方法实现属性拦截（代理）
    Object.defineProperty(data,key,{
        enumerable:true,
        configurable:true,
        get(){
            console.log('获取data的'+key+'='+val);
            /*一旦调用获取该属性就会调用此get方法，添加到依赖
            * 或者说通过get方法收集依赖*/
            Target && dep.add(Target); //添加观察者
            return val;
        },
        set(newValue){
            console.log('设置data的'+key+'='+val);
            val=newValue;
            /*向所有依赖该属性的观察者或者说订阅者发送通知，即调用所有观察者的update方法*/
            dep.notify();
        }
    })
}
/*响应式实例*/
class MVVM{
    constructor(options){
        this._options=options;
        let data=this._data=options.data;
        observe(data);
        let dom=document.getElementById(options.el);
        new Compile(dom,options.data);
    }
}
