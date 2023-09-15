/*
* @pivsemdmi/phone-mask-js | v1.2.0
* by Semen Pivovarkin.
*/
class PhoneMask {
    /**
     * @type {{
     *   selector: string,
     *   blurMask: boolean,
     *   trimMask: boolean,
     *   mask: string,
     *   softCaret: string,
     *   caret: string,
     *   maskMinLength: int,
     *   unmaskMaxLength: int,
     * }}
     * @private
     */
    _options = {
        selector: undefined,
        trimMask: false,
        blurMask: true,
        mask: '+7 (___) ___-__-__',
        softCaret: '_',
        caret: '_',
        get maskMinLength() {
            return Array.from(this.mask.matchAll(new RegExp(this.softCaret, 'g')))[0].index
        },
        get unmaskMaxLength() {
            return this.mask.match(new RegExp(this.softCaret, 'g')).length
        },
    }
    /**
     * @type {array}
     * @private
     */
    _fillingOptions = [
        'selector',
        'trimMask',
        'blurMask',
        'mask',
        'softCaret',
        'caret',
    ]
    /**
     * @type {object}
     * @private
     */
    _cache = {}

    /**
     * @return {HTMLInputElement|Element}
     * @private
     */
    get _el() {
        return this._cache.el
            || (this._cache.el = document.querySelector(this._options.selector));
    }

    /**
     * @return {HTMLInputElement|Element}
     */
    get input() {
        return this._el;
    }

    /**
     * @param {string} selector
     * @param {{
     *   blurMask: boolean,
     *   trimMask: boolean,
     *   mask: string,
     *   softCaret: string,
     *   caret: string,
     * }} options
     */
    constructor(selector, options = {}) {
        this._initOptions(Object.assign(options, {selector}));
        this._initInput();

        this.update();
    }

    /**
     * @param {object} options
     * @private
     */
    _initOptions(options) {
        const
            interestOptionsEntries = Object.entries(options)
                .filter(([key]) => this._fillingOptions.includes(key)),
            interestOptions = Object.fromEntries(interestOptionsEntries);

        this._options = Object.assign(this._options, interestOptions);

        // Validate soft caret
        this._checkNumberCaret(this._options.softCaret);
        this._checkOneCharCaret(this._options.softCaret);
        this._checkRegexCaret(this._options.softCaret);

        // Validate user caret
        this._checkNumberCaret(this._options.caret);

        // Validate phone mask
        if ((new RegExp(`${this._options.softCaret}.*\\d`)).test(this._options.mask)) {
            throw new Error('Mask not support numbers after carets');
        }
        if (!(new RegExp(`${this._options.softCaret}`)).test(this._options.mask)) {
            throw new Error('Soft caret not found in mask');
        }
    }

    /**
     * @param {string} caret
     * @private
     */
    _checkNumberCaret(caret) {
        if (/\d/.test(caret)) {
            throw new Error('Caret not support number format');
        }
    }

    /**
     * @param {string} caret
     * @private
     */
    _checkOneCharCaret(caret) {
        if (caret.length !== 1) {
            throw new Error('Caret support only one symbol');
        }
    }

    /**
     * @param {string} caret
     * @private
     */
    _checkRegexCaret(caret) {
        try {
            (new RegExp(`${caret}`)).test(caret);
        } catch (e) {
            throw new Error(`Not supported caret "${caret}" in regex, please change`);
        }
    }

    /**
     * Updating mask and blur status
     */
    update() {
        this.updateMask();
        this.updateBlur();
    }

    /**
     * Updating mask
     */
    updateMask() {
        this.unmask = this._trimUnmask(this.unmask);
    }

    /**
     * Updating blur
     */
    updateBlur() {
        if (document.activeElement !== this._el) {
            if (this._options.blurMask && !this.unmask) {
                this._el.value = '';
            }
        } else {
            this.unmask = this._trimUnmask(this.unmask);
        }
    }

    /**
     * @private
     */
    _initInput() {
        this._el.type = 'tel';

        this._el.addEventListener('focus', this._onFocus);
        this._el.addEventListener('blur', this._onBlur);
        this._el.addEventListener('input', this._onInput);
    }

    /**
     * @private
     */
    _onFocus = () => this.updateBlur()

    /**
     * @private
     */
    _onBlur = () => this.updateBlur()

    /**
     * @private
     */
    _onInput = () => {
        const selectionNumberEnd = this._unmaskPos;

        this.updateMask();

        this._unmaskPos = selectionNumberEnd;
    }

    /**
     * @param {string} unmask
     * @return {string}
     * @private
     */
    _trimUnmask(unmask) {
        return unmask.length <= this._options.unmaskMaxLength ? unmask
            : unmask.replace(/^[87]/, '').slice(0, this._options.unmaskMaxLength);
    }

    /**
     * @return {int}
     * @private
     */
    get _unmaskPos() {
        const maskPos = this._el.selectionEnd;
        return this._el.value.slice(0, maskPos).replace(/\D/g, '').length - 1;
    }

    /**
     * @param {int} unmaskPos
     * @private
     */
    set _unmaskPos(unmaskPos) {
        const minMaskPos = this._options.maskMinLength;
        const maskPosMap = Array.from(this._el.value.matchAll(/\d/g))
            .map(({index}) => index);
        const maskPosition = maskPosMap[Math.min(unmaskPos, maskPosMap.length - 1)] + 1 || 0;

        this._el.selectionStart = this._el.selectionEnd = Math.max(minMaskPos, maskPosition);
    }

    /**
     * @return {string} value without mask
     */
    get unmask() {
        const value = this._el.value;
        const clearPatternSearch = '^' + this._options.mask
                .replace(new RegExp(`([^${this._options.softCaret}\\d])`, 'g'), '')
                .replace(/(\d)/g, '$1?')
                .replace(new RegExp(`${this._options.softCaret}+`, 'g'), '(\\d*?)') + '$',
            clearPattern = new RegExp(clearPatternSearch);

        const matches = clearPattern.exec(value.replace(/\D/g, ''));

        return matches && matches.slice(1)
            .map(val => val.replace(/\D/g, ''))
            .join('');
    }

    /**
     * @param {string} unmask value without mask
     */
    set unmask(unmask) {
        const patternSearch = unmask.replace(/\d/g, '(\\d)'),
            pattern = new RegExp(patternSearch);

        const count = Math.min(unmask.length, this._options.unmaskMaxLength);

        let replaceValue = this._options.mask;

        for (let i = 1; i <= count; i++) {
            replaceValue = replaceValue.replace(new RegExp(this._options.softCaret), '$' + i)
        }

        let maskedValue = unmask.replace(pattern, replaceValue);

        if (this._options.trimMask) {
            const minMaskLen = this._options.maskMinLength;
            const lastNumber = Array.from(maskedValue.matchAll(/\d/g)).reverse()[0].index + 1;
            maskedValue = maskedValue.slice(0, Math.max(minMaskLen, lastNumber));
        } else if (this._options.softCaret !== this._options.caret) {
            maskedValue = maskedValue.replace(new RegExp(this._options.softCaret, 'g'), this._options.caret);
        }

        this._el.value = maskedValue;
    }
}

// For webpack
if (typeof module === 'object' && module.exports) {
    module.exports = PhoneMask;
}
