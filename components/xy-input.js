import './xy-tips.js';
import './xy-button.js';

export default class XyInput extends HTMLElement {

    static get observedAttributes() { return ['label','disabled','pattern','required'] }

    constructor({multi}={}) {
        super();
        this.multi = multi;
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <style>
        :host{
            box-sizing:border-box;
            display:inline-block;
            border:1px solid #d9d9d9;
            border-radius:3px;
            line-height: 30px;
            transition:border-color .3s,box-shadow .3s;
            padding: 4px 10px;
            color: #333;
            font-size: 14px;
        }
        :host(:focus-within){
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        :host([block]){
            display:block
        }
        :host([error]){
            --themeColor:#f5222d;
            border-color:#f5222d;
            color:#f5222d;
        }
        :host([error]) xy-icon{
            color:#f5222d;
        }
        :host(:focus-within:not([disabled])),:host(:not([disabled]):hover){
            border-color:var(--themeColor,#42b983);
        }
        :host([disabled]){ 
            opacity:.8;
            cursor:not-allowed; 
        }
        :host([disabled]) xy-tips{
            pointer-events:none;
        }
        :host([label]) .input::placeholder{
            color:transparent;
        }
        :host .input::placeholder{
            color:#999;
        }
        :host(xy-textarea){
            line-height:1.5;
            padding-right:4px;
        }
        xy-tips{  
            display:flex;
            align-items:center;
            margin:-4px -10px;
            padding:4px 10px;
        }
        :host(xy-textarea) xy-tips{
            margin-right:-4px;
            padding-right:4px;
            align-items:flex-start;
        }
        .input{
            padding:0;
            text-align: inherit;
            color:currentColor;
            border:0;
            outline:0;
            line-height: inherit;
            font-size:inherit;
            flex:1;
            min-width: 0;
            -webkit-appearance: none;
            -moz-appearance: textfield;
            background: none;
        }
        :host(xy-textarea) .input{
            margin:0;
        }
        input[type="number"]::-webkit-inner-spin-button{
            display:none;
        }
        ::-moz-focus-inner,::-moz-focus-outer{
            border:0;
            outline : 0;
        }
        :host([showtips]){
            pointer-events:all;
        }
        .input-label{
            pointer-events:none;
            margin-left:-2px;
            position:absolute;
            transition: transform .3s, color .3s, background-color .3s;
            transform-origin: left;
            padding:0 2px;
            color:#999;
        }
        .input:not(:placeholder-shown) ~ .input-label,
        .input:focus ~ .input-label{
            transform: translateY( calc( -50% - 6px ) ) scale(0.8);
            background:#fff;
        }
        .input:-moz-ui-invalid{
            box-shadow:none;
        }
        .icon-pre{
            display:flex;
            margin-right:4px;
            color:#999;
        }
        :host(xy-textarea) .icon-pre{
            height:1.5em;
        }
        .btn-right{
            width:2em;
            height:2em;
            margin-right:-5px;
            color:#999;
            font-size:inherit;
        }
        .btn-number{
            display:flex;
            flex-direction:column;
            width:1em;
            visibility:hidden;
            transition:0s;
        }
        .btn-number xy-button{
            display: flex;
            color: #999;
            border-radius:0;
            width:100%;
            flex:1;
            font-size:.8em;
            transition:.2s;
        }

        .btn-number xy-button:hover{
            flex:1.5;
        }

        xy-button:not([disabled]):hover,xy-button:not([disabled]):focus-within{
            color:var(--themeColor,#42b983);
        }

        :host(:focus-within:not([disabled])) .icon-pre,:host(:not([disabled]):hover) .icon-pre,:host(:not([disabled]):hover) .input-label,:host(:focus-within:not([disabled])) .input-label{
            color:var(--themeColor,#42b983);
        }

        :host(:focus-within:not([disabled])) .btn-number,:host(:not([disabled]):hover) .btn-number{
            visibility:visible;
        }

        </style>
        <xy-tips id="input-con" dir="${this.errordir}" type="error">
            ${
                this.icon?
                '<xy-icon class="icon-pre" name='+this.icon+'></xy-icon>'
                :
                ''
            }
            <${multi?'textarea':'input'} id="input" class="input" ${this.type === 'number'?'min="'+this.min+'" max="'+this.max+'" step="'+this.step+'"':""} value="${this.defaultvalue}" type="${this.typeMap(this.type)}" placeholder="${this.placeholder}" minlength="${this.minlength}" rows="${this.rows}" maxlength="${this.maxlength}">${multi?'</textarea>':''}
            ${
                this.label&&!this.icon?
                '<label class="input-label">'+this.label+'</label>'
                :
                ''
            }
            ${
                this.type === 'password'&&!multi?
                '<xy-button id="btn-pass" class="btn-right" icon="eye-close" type="flat" shape="circle"></xy-button>'
                :
                ''
            }
            ${
                this.type === 'search'&&!multi?
                '<xy-button id="btn-search" class="btn-right" icon="search" type="flat" shape="circle"></xy-button>'
                :
                ''
            }
            ${
                this.type === 'number'&&!multi?
                '<div class="btn-right btn-number"><xy-button id="btn-add" icon="up" type="flat"></xy-button><xy-button id="btn-sub" icon="down" type="flat"></xy-button></div>'
                :
                ''
            }
        </xy-tips>
        `
    }

    checkValidity(){
        this.input.focus();
        if(this.input.checkValidity()){
            this.inputCon.show = false;
            this.error = false;
        }else{
            this.inputCon.show = true;
            this.error = true;
            if(this.input.validity.valueMissing){
                this.inputCon.tips = this.input.validationMessage;
            }else{
                this.inputCon.tips = this.errortips||this.input.validationMessage;
            }
        }
    }
    
    connectedCallback() {
        this.input = this.shadowRoot.getElementById('input');
        this.inputCon = this.shadowRoot.getElementById('input-con');
        this.input.addEventListener('input',(ev)=>{
            ev.stopPropagation();
            this.checkValidity();
            if(this.debounce){
                this.timer && clearTimeout(this.timer);
                this.timer = setTimeout(()=>{
                    this.dispatchEvent(new CustomEvent('input',{
                        detail:{
                            value:this.value
                        }
                    }));
                },this.debounce)
            }else{
                this.dispatchEvent(new CustomEvent('input',{
                    detail:{
                        value:this.value
                    }
                }));
            }
        })
        this.input.addEventListener('change',()=>{
            this.dispatchEvent(new CustomEvent('change',{
                detail:{
                    value:this.value
                }
            }));
        })
        this.input.addEventListener('focus',(ev)=>{
            this.checkValidity();
        })
        this.input.addEventListener('keydown',(ev)=>{
            switch (ev.keyCode) {
                case 13://Enter
                    this.dispatchEvent(new CustomEvent('submit',{
                        detail:{
                            value:this.value
                        }
                    }));
                    break;
                default:
                    break;
            }
        })
        if(!this.multi){
            this.btnPass = this.shadowRoot.getElementById('btn-pass');
            this.btnAdd = this.shadowRoot.getElementById('btn-add');
            this.btnSub = this.shadowRoot.getElementById('btn-sub');
            this.btnSearch = this.shadowRoot.getElementById('btn-search');
            if(this.btnSearch){
                this.btnSearch.addEventListener('click',()=>{
                    this.dispatchEvent(new CustomEvent('submit',{
                        detail:{
                            value:this.value
                        }
                    }));
                })
            }
            if(this.btnPass){
                this.btnPass.addEventListener('click',()=>{
                    this.password = !this.password;
                    if(this.password){
                        this.input.setAttribute('type','text');
                        this.btnPass.icon = 'eye';
                    }else{
                        this.input.setAttribute('type','password');
                        this.btnPass.icon = 'eye-close';
                    }
                    this.input.focus();
                })
            }
            if(this.btnAdd){
                this.btnAdd.addEventListener('click',()=>{
                    if(this.value-this.max<0){
                        this.value = Number(this.value)+Number(this.step); 
                    }
                })
            }
            if(this.btnSub){
                this.btnSub.addEventListener('click',()=>{
                    if(this.value-this.min>0){
                        this.value = Number(this.value)-Number(this.step);
                    }
                })
            }
            this.pattern = this.pattern;
        }
        this.disabled = this.disabled;
        this.required = this.required;
    }

    typeMap(type) {
        switch (type) {
            case 'password':
            case 'number':
            case 'email':
            case 'tel':
                break;
            default:
                type = 'text'
                break;
        }
        return type;
    }

    focus() {
        this.input.focus();
    }

    get value() {
        return this.input.value;
    }

    get debounce() {
        return this.getAttribute('debounce');
    }

    get error() {
        return this.getAttribute('error')!==null;
    }

    get validity() {
        return this.input.checkValidity();
    }

    get errordir() {
        return this.getAttribute('errordir')||'top';
    }

    get defaultvalue() {
        return this.getAttribute('defaultvalue')||'';
    }
    get rows() {
        return this.getAttribute('rows')||3;
    }

    get icon() {
        return this.getAttribute('icon');
    }

    get type() {
        return this.getAttribute('type');
    }

    get disabled() {
        return this.getAttribute('disabled')!==null;
    }

    get label() {
        return this.getAttribute('label')||'';
    }

    get placeholder() {
        return this.getAttribute('placeholder')||this.label;
    }

    get min() {
        return this.getAttribute('min')||0;
    }

    get max() {
        return this.getAttribute('max')||Infinity;
    }

    get minlength() {
        return this.getAttribute('minlength')||'';
    }

    get maxlength() {
        return this.getAttribute('maxlength')||'';
    }

    get step() {
        return this.getAttribute('step')||1;
    }

    get required() {
        return this.getAttribute('required')!==null;
    }

    get pattern() {
        return this.getAttribute('pattern');
    }

    get errortips() {
        return this.getAttribute('errortips');
    }

    set disabled(value) {
        if(value===null||value===false){
            this.removeAttribute('disabled');
        }else{
            this.setAttribute('disabled', '');
        }
    }

    set required(value) {
        if(value===null||value===false){
            this.removeAttribute('required');
        }else{
            this.setAttribute('required', '');
        }
    }

    set error(value) {
        if(value===null||value===false){
            this.removeAttribute('error');
        }else{
            this.setAttribute('error', '');
        }
    }

    set pattern(value) {
        if(value===null||value===false){
            this.removeAttribute('pattern');
        }else{
            this.setAttribute('pattern', value);
        }
    }

    set label(value) {
        this.setAttribute('label', value);
    }

    set icon(value) {
        this.setAttribute('icon', value);
    }

    set placeholder(value) {
        this.setAttribute('placeholder', value);
    }

    set value(value) {
        this.input.value = value;
        this.checkValidity();
        this.dispatchEvent(new CustomEvent('change',{
            detail:{
                value:this.value
            }
        }));
    }

    attributeChangedCallback (name, oldValue, newValue) {
        if(name == 'disabled' && this.input){
            const btns = this.shadowRoot.querySelectorAll('xy-button');
            if(newValue!==null){
                this.input.setAttribute('disabled', 'disabled');
                btns.forEach(el=>el.disabled = true);
            }else{
                this.input.removeAttribute('disabled');
                btns.forEach(el=>el.disabled = false);
            }
        }
        if(name == 'pattern' && this.input){
            if(newValue!==null){
                this.input.setAttribute('pattern', newValue);
            }else{
                this.input.removeAttribute('pattern');
            }
        }
        if(name == 'required' && this.input){
            if(newValue!==null){
                this.input.setAttribute('required', 'required');
            }else{
                this.input.removeAttribute('required');
            }
        }
    }
    
}

class XyTextarea extends XyInput {
    constructor() {
        super({multi:true});
    }
}

if(!customElements.get('xy-input')){
    customElements.define('xy-input', XyInput);
}
if(!customElements.get('xy-textarea')){
    customElements.define('xy-textarea', XyTextarea);
}