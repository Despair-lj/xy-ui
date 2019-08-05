import './xy-button.js';
import './xy-popover.js';
import { rgbToHsv,hslToHsv,parseToHSVA } from '../utils/color.js';
import { HSVaColor } from '../utils/hsvacolor.js';

class XyColorPane extends HTMLElement {
    static get observedAttributes() { return ["value", "selected"]; }
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <style>
            :host{
                display: block;
                width:300px;
            }
            .color-pane{
                padding:10px;
                --h:300;
                --s:100;
                --v:100;
                --a:1;
            }
            .color-palette{
                position:relative;
                height:150px;
                background:linear-gradient(to top, hsla(0,0%,0%,calc(var(--a))), transparent), linear-gradient(to left, hsla(calc(var(--h)),100%,50%,calc(var(--a))),hsla(0,0%,100%,calc(var(--a)))),linear-gradient( 45deg, #ddd 25%,transparent 0,transparent 75%,#ddd 0 ),linear-gradient( 45deg, #ddd 25%,transparent 0,transparent 75%,#ddd 0 );
                background-position:0 0, 0 0,0 0,5px 5px;
                background-size:100% 100%, 100% 100%, 10px 10px, 10px 10px;
            }
            .color-palette::after{
                pointer-events:none;
                position:absolute;
                content:'';
                box-sizing:border-box;
                width:10px;
                height:10px;
                border-radius:50%;
                border:2px solid #fff;
                left:calc(var(--s) * 1%);
                top:calc((100 - var(--v)) * 1%);
                transform:translate(-50%,-50%)
            }
            .color-chooser{
                display:flex;
                padding:10px 0;
                position: relative;
                z-index: 2;
            }
            .color-show{
                width:32px;
                height:32px;
                background:linear-gradient(var(--c),var(--c)),linear-gradient( 45deg, #ddd 25%,transparent 0,transparent 75%,#ddd 0 ),linear-gradient( 45deg, #ddd 25%,transparent 0,transparent 75%,#ddd 0 );
                background-position:0 0,0 0,5px 5px;
                background-size:100% 100%,10px 10px,10px 10px;
            }
            .color-range{
                flex:1;
                margin-left:10px;
            }
            input[type="range"]{
                display: block;
                pointer-events:all;
                width:100%;
                -webkit-appearance: none;
                outline : 0;
                height: 10px;
                border-radius:5px;
                margin:0;
            }
            input[type="range"]::-webkit-slider-runnable-track{
                display: flex;
                align-items: center;
                position: relative;
            }
            input[type="range"]::-webkit-slider-thumb{
                -webkit-appearance: none;
                position: relative;
                width:10px;
                height:10px;
                transform:scale(1.2);
                border-radius: 50%;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                background:#fff;
                transition:.2s cubic-bezier(.12, .4, .29, 1.46);
            }
            input[type="range"]::-moz-range-thumb{
                box-sizing:border-box;
                pointer-events:none;
                position: relative;
                width:10px;
                height:10px;
                transform:scale(1.2);
                border-radius: 50%;
                border:0;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                background:#fff;
                transition:.2s cubic-bezier(.12, .4, .29, 1.46);
            }
            input[type="range"]::-webkit-slider-thumb:active,
            input[type="range"]:focus::-webkit-slider-thumb{
                transform:scale(1.5);
            }
            input[type="range"]::-moz-range-thumb:active,
            input[type="range"]:focus::-moz-range-thumb{
                transform:scale(1.5);
            }
            input[type="range"]+input[type="range"]{
                margin-top:10px;
            }
            .color-hue{
                background:linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)
            }
            .color-opacity{
                background:linear-gradient(to right, hsla(calc(var(--h)),100%,50%,0), hsla(calc(var(--h)),100%,50%,1)),linear-gradient( 45deg, #ddd 25%,transparent 0,transparent 75%,#ddd 0 ),linear-gradient( 45deg, #ddd 25%,transparent 0,transparent 75%,#ddd 0 );
                background-position:0 0,0 0,5px 5px;
                background-size:100% 100%,10px 10px,10px 10px;
            }
            .color-label{
                position:absolute;
                display:flex;
                visibility:hidden;
                opacity:0;
                left:0;
                right:0;
                top:0;
                bottom:0;
                transition: .3s;
            }
            .color-label input{
                flex:1;
                margin-right:10px;
                outline:0;
                min-width:0;
                width: 0;
                border-radius:3px;
                border:1px solid #ddd;
                padding:0 5px;
                line-height:28px;
                text-align:center;
                -moz-appearance: textfield;
                transition:.3s;
            }
            input[type="number"]::-webkit-inner-spin-button{
                display:none;
            }
            ::-moz-focus-inner,::-moz-focus-outer{
                border:0;
                outline : 0;
            }
            .color-label input:focus{
                border-color:var(--themeColor,#42b983);
            }
            .color-footer{
                display:flex
            }
            .color-footer xy-button{
                height:30px;
                width: 60px;
            }
            .color-input{
                position:relative;
                flex:1;
                height:30px;
                overflow:hidden;
            }
            .color-footer[type="HEXA"] .color-label:nth-child(1),.color-footer[type="RGBA"] .color-label:nth-child(2),.color-footer[type="HSLA"] .color-label:nth-child(3){
                opacity:1;
                visibility:visible;
                z-index:2;
            }
        </style>
        <div class="color-pane" id="color-pane">
            <div class="color-palette" id="color-palette"></div>
            <div class="color-chooser">
                <xy-button class="color-show" type="primary" shape="circle"></xy-button>
                <div class="color-range">
                    <input class="color-hue" value="0" min="0" max="360" type="range" id="range-hue">
                    <input class="color-opacity" value="1" min="0" max="1" step="0.01" type="range" id="range-opacity">
                </div>
            </div>
            <div class="color-footer" type="HEXA">
                <div class="color-input">
                    <div class="color-label" id="color-hexa">
                        <input spellcheck="false" />
                    </div>
                    <div class="color-label" id="color-rgba">
                        <input type="number" min="0" max="255" spellcheck="false" />
                        <input type="number" min="0" max="255" spellcheck="false" />
                        <input type="number" min="0" max="255" spellcheck="false" />
                        <input type="number" min="0" max="1" step="0.01" spellcheck="false" />
                    </div>
                    <div class="color-label" id="color-hlsa">
                        <input type="number" min="0" max="360" spellcheck="false" />
                        <input type="number" min="0" max="100" spellcheck="false" />
                        <input type="number" min="0" max="100" spellcheck="false" />
                        <input type="number" min="0" max="1" step="0.01" spellcheck="false" />
                    </div>
                </div>
                <xy-button id="btn-switch" type="primary">HEXA</xy-button>
            </div>
        </div>
        `
    }

    connectedCallback() {
        this.type = ['HEXA','RGBA','HSLA'];
        this.typeindex = 0;
        this.palette = this.shadowRoot.getElementById('color-palette');
        this.pane = this.shadowRoot.getElementById('color-pane');
        this.rangeHue = this.shadowRoot.getElementById('range-hue');
        this.rangeOpacity = this.shadowRoot.getElementById('range-opacity');
        this.switch = this.shadowRoot.getElementById('btn-switch');
        this.colorHexa = this.shadowRoot.getElementById('color-hexa').querySelectorAll('input');
        this.colorRgba = this.shadowRoot.getElementById('color-rgba').querySelectorAll('input');
        this.colorHlsa = this.shadowRoot.getElementById('color-hlsa').querySelectorAll('input');
        this.rangeHue.addEventListener('input',()=>{
            const value = HSVaColor(...this.$value).toHSLA();
            value[0] = Number(this.rangeHue.value);
            this.value = value.toString();
        })
        this.palette.addEventListener('mousedown',(ev)=>{
            const {width:w,height:h} = this.palette.getBoundingClientRect();
            const value = HSVaColor(...this.$value).toHSVA();
            value[1] = ev.offsetX/w*100;
            value[2] = 100-ev.offsetY/h*100;
            this.value = value.toString();
        })
        this.rangeOpacity.addEventListener('input',()=>{
            const value = HSVaColor(...this.$value).toHSLA();
            value[3] = Number(this.rangeOpacity.value);
            this.value = value.toString();
        })
        this.switch.addEventListener('click',()=>{
            this.typeindex ++;
            this.typeindex %= 3;
            this.switch.innerText = this.type[this.typeindex];
            this.switch.parentNode.setAttribute('type',this.type[this.typeindex]);
        })
        this.colorHexa.forEach(el=>{
            el.addEventListener('change',()=>{
                this.value = el.value;
            })
        })
        this.colorRgba.forEach((el,i)=>{
            el.addEventListener('change',()=>{
                const value = HSVaColor(...this.$value).toRGBA();
                value[i] = Number(el.value);
                this.value = value.toString();
            })
        })
        this.colorHlsa.forEach((el,i)=>{
            el.addEventListener('change',()=>{
                const value = HSVaColor(...this.$value).toHSLA();
                value[i] = Number(el.value);
                this.value = value.toString();
            })
        })
        this.value = this.defaultvalue;
    }

    focus() {
        this.option.focus();
    }

    get value() {
        return HSVaColor(...this.$value)['to'+this.type[this.typeindex]]().toString();
    }

    get defaultvalue() {
        return this.getAttribute('defaultvalue')||'#ff0000ff';
    }

    set value(value) {
        this.$value = parseToHSVA(value).values;
        console.log(value)
        //[h,s,v,a]
        const [h,s,v,a=1] = this.$value;
        this.pane.style.setProperty('--h',h);
        this.pane.style.setProperty('--s',s);
        this.pane.style.setProperty('--v',v);
        this.pane.style.setProperty('--a',a);
        this.pane.style.setProperty('--c',this.value);
        this.rangeHue.value = h;
        this.rangeOpacity.value = a;
        this.colorHexa[0].value = HSVaColor(...this.$value).toHEXA().toString();
        const RGBA = HSVaColor(...this.$value).toRGBA();
        this.colorRgba[0].value = RGBA[0].toFixed(0);
        this.colorRgba[1].value = RGBA[1].toFixed(0);
        this.colorRgba[2].value = RGBA[2].toFixed(0);
        this.colorRgba[3].value = RGBA[3];
        const HSLA = HSVaColor(...this.$value).toHSLA();
        this.colorHlsa[0].value = HSLA[0].toFixed(0);
        this.colorHlsa[1].value = HSLA[1].toFixed(0);
        this.colorHlsa[2].value = HSLA[2].toFixed(0);
        this.colorHlsa[3].value = HSLA[3];
    }

}

customElements.define('xy-color-pane', XyColorPane);

export default class XyColorPicker extends HTMLElement {

    static get observedAttributes() { return ['disabled'] }

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });

        shadowRoot.innerHTML = `
        <style>
        :host{
            display:inline-block;
            width:30px;
            height:30px;
        }
        :host([block]){
            display:block;
        }
 
        :host(:not([disabled]):not([type="primary"]):focus-within) xy-button{
            border-color:var(--themeColor,#42b983);
            color:var(--themeColor,#42b983);
        }
        
        :host(:focus-within) xy-popover,:host(:hover) xy-popover{ 
            z-index: 2;
        }
        xy-popover{
            width:100%;
            height:100%;
        }
        xy-button{
            width:100%;
            height:100%;
            padding:5px;
            background-clip: content-box;
            background-color:var(--themeColor,#42b983);
        }
        xy-popover{
            display:block;
        }
        xy-popcon{
            min-width:100%;
        }
        </style>
        <xy-popover id="root">
            <xy-button id="select" ${this.disabled? "disabled" : ""}></xy-button>
            <xy-popcon>
                <xy-color-pane></xy-color-pane>
            </xy-popcon>
        </xy-popover>
        `
    }

    focus() {
        this.select.focus();
    }

    connectedCallback() {
        this.root = this.shadowRoot.getElementById('root');
        
    }

    

    get defaultvalue() {
        return this.getAttribute('defaultvalue');
    }

    get value() {
        return this.select.value;
    }

    get text() {
        return this.select.textContent;
    }

    get name() {
        return this.getAttribute('name');
    }

    get type() {
        return this.getAttribute('type');
    }

    get disabled() {
        return this.getAttribute('disabled')!==null;
    }

    set disabled(value) {
        if (value === null || value === false) {
            this.removeAttribute('disabled');
        } else {
            this.setAttribute('disabled', '');
        }
    }

    set defaultvalue(value){
        this.setAttribute('defaultvalue', value);
    }

    set value(value) {
        
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == 'disabled' && this.select) {
            if (newValue != null) {
                this.select.setAttribute('disabled', 'disabled');
            } else {
                this.select.removeAttribute('disabled');
            }
        }
    }
}

if (!customElements.get('xy-color-picker')) {
    customElements.define('xy-color-picker', XyColorPicker);
}