class PhoneMask {
    /**
     * @type {{
     *   selector: string,
     *   hideBlurMask: boolean,
     *   showAllMask: boolean,
     *   mask: string,
     *   maskSoftCaret: string,
     *   maskUserCaret: string,
     *   maskMinLength: int,
     *   unmaskMaxLength: int,
     * }}
     * @private
     */
    _options = {
        selector: undefined,
        showAllMask: true,
        hideBlurMask: true,
        focus: true,
        mask: '+7 (___) ___-__-__',
        maskSoftCaret: '_',
        maskUserCaret: '_',
        get maskMinLength() {
            return Array.from(this.mask.matchAll(new RegExp(this.maskSoftCaret, 'g')))[0].index
        },
        get unmaskMaxLength() {
            return this.mask.match(new RegExp(this.maskSoftCaret, 'g')).length
        },
    }
    _fillingOptions = [
        'selector',
        'showAllMask',
        'hideBlurMask',
        'focus',
        'mask',
        'maskSoftCaret',
        'maskUserCaret',
    ]
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
     * @param {string} selector
     * @param {{
     *   hideBlurMask: boolean,
     *   showAllMask: boolean,
     *   mask: string,
     *   maskSoftCaret: string,
     *   maskUserCaret: string,
     * }} options
     */
    constructor(selector, options = {}) {
        this._initOptions(Object.assign(options, {selector}));
        this._initInput();

        this.unmask = this._trimUnmask(this.unmask);
    }

    _initOptions(options) {
        const
            interestOptionsEntries = Object.entries(options)
                .filter(([key]) => this._fillingOptions.includes(key)),
            interestOptions = Object.fromEntries(interestOptionsEntries);

        this._options = Object.assign(this._options, interestOptions);

        // Validate soft caret
        this._checkCaret(this._options.maskSoftCaret);
        this._checkCaret(this._options.maskUserCaret);

        // Validate phone mask
        if ((new RegExp(`${this._options.maskSoftCaret}.*\\d`)).test(this._options.mask)) {
            throw new Error('Mask not support numbers after carets');
        }
        if (!(new RegExp(`${this._options.maskSoftCaret}`)).test(this._options.mask)) {
            throw new Error('Soft caret not found in mask');
        }
    }

    _checkCaret(caret) {
        if (/\d/.test(caret)) {
            throw new Error('Caret not support number format');
        }
        if (caret.length !== 1) {
            throw new Error('Caret support only one symbol');
        }
        try {
            (new RegExp(`${caret}`)).test(caret);
        } catch (e) {
            throw new Error(`Not supported caret "${caret}" in regex, please change`);
        }
    }

    _initInput() {
        this._el.type = 'tel';

        this._el.addEventListener('focus', this._onFocus);
        this._el.addEventListener('blur', this._onBlur);
        this._el.addEventListener('input', this._onInput);
    }

    _onFocus = () => {
        if (!this._options.hideBlurMask) return;

        if (!this.unmask) {
            this.unmask = '';
        }
    }

    _onBlur = () => {
        if (!this._options.hideBlurMask) return;

        if (!this.unmask) {
            this._el.value = '';
        }
    }

    _onInput = () => {
        const selectionNumberEnd = this._unmaskPos;

        this.unmask = this._trimUnmask(this.unmask);

        this._unmaskPos = selectionNumberEnd;
    }

    _trimUnmask(unmask) {
        return unmask.length <= this._options.unmaskMaxLength ? unmask
            : unmask.replace(/^[87]/, '').slice(0, this._options.unmaskMaxLength);
    }

    get _unmaskPos() {
        const maskPos = this._el.selectionEnd;
        return this._el.value.slice(0, maskPos).replace(/\D/g, '').length - 1;
    }

    set _unmaskPos(unmaskPos) {
        const minMaskPos = this._options.maskMinLength;
        const maskPosMap = Array.from(this._el.value.matchAll(/\d/g))
            .map(({index}) => index);
        const maskPosition = maskPosMap[Math.min(unmaskPos, maskPosMap.length - 1)] + 1 || 0;

        this._el.selectionStart = this._el.selectionEnd = Math.max(minMaskPos, maskPosition);
    }

    get unmask() {
        const value = this._el.value;
        const clearPatternSearch = '^' + this._options.mask
                .replace(new RegExp(`([^${this._options.maskSoftCaret}\\d])`, 'g'), '')
                .replace(/(\d)/g, '$1?')
                .replace(new RegExp(`${this._options.maskSoftCaret}+`, 'g'), '(\\d*?)') + '$',
            clearPattern = new RegExp(clearPatternSearch);

        const matches = clearPattern.exec(value.replace(/\D/g, ''));

        return matches && matches.slice(1)
            .map(val => val.replace(/\D/g, ''))
            .join('');
    }

    set unmask(unmask) {
        const patternSearch = unmask.replace(/\d/g, '(\\d)'),
            pattern = new RegExp(patternSearch);

        const count = Math.min(unmask.length, this._options.unmaskMaxLength);

        let replaceValue = this._options.mask;

        for (let i = 1; i <= count; i++) {
            replaceValue = replaceValue.replace(new RegExp(this._options.maskSoftCaret), '$' + i)
        }

        let maskedValue = unmask.replace(pattern, replaceValue);

        if (!this._options.showAllMask) {
            const minMaskLen = this._options.maskMinLength;
            const lastNumber = Array.from(maskedValue.matchAll(/\d/g)).reverse()[0].index + 1;
            maskedValue = maskedValue.slice(0, Math.max(minMaskLen, lastNumber));
        } else if (this._options.maskSoftCaret !== this._options.maskUserCaret) {
            maskedValue = maskedValue.replace(new RegExp(this._options.maskSoftCaret, 'g'), this._options.maskUserCaret);
        }

        this._el.value = maskedValue;
    }
}
