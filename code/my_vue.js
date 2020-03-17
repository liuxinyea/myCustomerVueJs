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
            // console.log('获取data的'+key+'='+val);
            /*一旦调用获取该属性就会调用此get方法，添加到依赖
            * 或者说通过get方法收集依赖*/
            Dep.Target && dep.add(Dep.Target); //添加观察者
            return val;
        },
        set(newValue){
            // console.log('设置data的'+key+'='+val);
            val=newValue;
            /*向所有依赖该属性的观察者或者说订阅者发送通知，即调用所有观察者的update方法*/
            dep.notify();
        }
    })
}
function observeByProxy(data){
   if(typeof data == 'object'){
       let dep = new Dep();
      data=new Proxy(data,{
           get(target,key,receiver){
               Dep.Target && dep.add(Dep.Target); //添加观察者
               return target[key]
           },
           set(target,key,value,receiver){
               target[key]=value;
               console.log(key+"---"+value);
               dep.notify();
               return true;
           }
       })
       return data;
       Object.keys(data).forEach(key=>{
            observeByProxy(data[key])
       })
   }
}
/*响应式实例*/
class MVVM{
    constructor(options){
        this._options=options;
        this._data=options.data;
        options.data=observeByProxy(options.data);
        let dom=document.getElementById(options.el);
        new Compile(dom,options.data);
        this.$data=options.data;
        // console.log(this.$data);
    }
}
