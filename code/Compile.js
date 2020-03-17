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
                let keys=key.split('.');  
                // node.textContent =  this._vm[key];
                node.textContent =this.getValue(this._vm,keys);                
                new Watcher(this._vm,key[0],val=>{
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
    getValue(vm,keys){
        if(keys.length==1){
            return vm[keys[0]];
        }
        vm=vm[keys[0]];
        keys.shift();
        return this.getValue(vm,keys);
    }
}