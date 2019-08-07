
class Watcher{
    constructor(vm,key,callback){
        this._cb = callback;
        this._vm = vm;
        this._key = key;   //保存键值
        this._uid = uId;
        uId++; //每个观察者配个ID，防止重复添加
        Dep.Target=this;
        //vm[exp] 就会触发get，将当前Watcher对象添加到dep的依赖集合中
        this._value = vm[key];
        Dep.Target = null; //用完就删
    }
    update(){
        let value = this._vm[this._key];
        if(value !== this._value){
            this._value = value;
            this._cb.call(this._vm,value);
        }
    }
}