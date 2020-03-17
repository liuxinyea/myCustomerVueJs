/*被订阅者，被观察者，被观察的目标，依赖收集器，收集被订阅（被观察）的属性对应的Watcher对象*/
class Dep{
    static Target=null;
    constructor(){
        this.subs = [];
    }
    add(watcher){
        this.subs.push(watcher)
        // console.log(this.subs);
    }

    notify(){
        this.subs.forEach(sub => {
            sub.update();
        })
    }
}