/*
* @pivsemdmi/phone-mask-js | v1.2.6
* by Semen Pivovarkin.
*/

class PhoneMaskOptions {
    trimMask = false
    trimUnmask = true
    blurMask = true
    mask = '+7 (___) ___-__-__'
    softCaret = '_'
    caret = '_'
}

/**
 * @extends {PhoneMaskOptions}
 */
class _PhoneMaskMagicOptions {
    /**
     * @type {PhoneMaskOptions}
     * @private
     */
    static _baseOptions = new PhoneMaskOptions();

    /**
     * @return {number}
     */
    get maskMinLength() {
        return this.mask.indexOf(this.softCaret);
    }

    /**
     * @return {number}
     */
    get unmaskMaxLength() {
        return this.mask.match(new RegExp(this.softCaret, 'g')).length
    }

    /**
     * @return {array}
     */
    get maskPosMap() {
        return Array.from(this.mask.matchAll(new RegExp(this.softCaret, 'g')))
            .map(({index}) => index);
    }

    /**
     * @param {PhoneMaskOptions|{}} options
     */
    constructor(options = {}) {
        this._options = _PhoneMaskMagicOptions._initOptions(options);

        this._initOptionAccess();
    }

    /**
     * @private
     */
    _initOptionAccess() {
        _PhoneMaskMagicOptions._fillingOptions.forEach(optionName => {
            Object.defineProperty(this, optionName, {
                get: () => this._options[optionName],
            });
        });
    }

    /**
     * @param {PhoneMaskOptions|{}} options
     */
    static override(options) {
        Object.assign(
            _PhoneMaskMagicOptions._baseOptions,
            _PhoneMaskMagicOptions._initOptions(options)
        );
    }

    static flush() {
        _PhoneMaskMagicOptions.override(new PhoneMaskOptions());
    }

    /**
     * @return {array}
     * @private
     */
    static get _fillingOptions() {
        return Object.keys(_PhoneMaskMagicOptions._baseOptions);
    }

    /**
     * @param {object} options
     * @return {object} merged options
     * @private
     */
    static _initOptions(options) {
        return _PhoneMaskMagicOptions._fillOptions(options)
    }

    /**
     * @param {object} options
     * @return {object} merged options
     * @private
     */
    static _fillOptions(options) {
        const
            interestOptionsEntries = Object.entries(options)
                .filter(([key]) => _PhoneMaskMagicOptions._fillingOptions.includes(key)),
            interestOptions = Object.fromEntries(interestOptionsEntries);

        const newOptions = Object.assign({},
            _PhoneMaskMagicOptions._baseOptions,
            interestOptions
        );

        _PhoneMaskMagicOptions._validate(newOptions);

        return newOptions;
    }

    /**
     * @param {object} options
     * @throws {Error}
     * @private
     */
    static _validate(options) {

        // Validate soft caret
        this._checkNumberCaret(options.softCaret);
        this._checkOneCharCaret(options.softCaret);
        this._checkRegexCaret(options.softCaret);

        // Validate user caret
        this._checkNumberCaret(options.caret);

        // Validate phone mask
        if ((new RegExp(`${options.softCaret}.*\\d`)).test(options.mask)) {
            throw new Error('Mask not support numbers after carets');
        }
        if (!(new RegExp(`${options.softCaret}`)).test(options.mask)) {
            throw new Error('Soft caret not found in mask');
        }
    }

    /**
     * @param {string} caret
     * @private
     */
    static _checkNumberCaret(caret) {
        if (/\d/.test(caret)) {
            throw new Error('Caret not support number format');
        }
    }

    /**
     * @param {string} caret
     * @private
     */
    static _checkOneCharCaret(caret) {
        if (caret.length !== 1) {
            throw new Error('Caret support only one symbol');
        }
    }

    /**
     * @param {string} caret
     * @private
     */
    static _checkRegexCaret(caret) {
        try {
            (new RegExp(`${caret}`)).test(caret);
        } catch (e) {
            throw new Error(`Not supported caret "${caret}" in regex, please change`);
        }
    }
}

class PhoneMask {
    /**
     * @extends {_PhoneMaskMagicOptions}
     */
    static Options = _PhoneMaskMagicOptions;

    /**
     * @type {PhoneMask.Options}
     */
    options;
    /**
     * @type {HTMLInputElement|Element}
     * @private
     */
    _el;

    /**
     * @return {HTMLInputElement|Element}
     */
    get input() {
        return this._el;
    }

    /**
     * @param {HTMLInputElement|string} selector
     * @param {PhoneMaskOptions|{}} options
     */
    constructor(selector, options = {}) {
        this._init(selector);

        this.options = new PhoneMask.Options(options);

        this.update();
    }

    /**
     * @private
     */
    _init(selector) {
        this._el = selector instanceof HTMLInputElement
            ? selector : document.querySelector(selector);

        this._el.type = 'tel';

        this._bind();
    }

    destroy() {
        this._unbind();

        this._el = undefined;
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
        if (this.isBlur()) {
            if (this.options.blurMask && !this.unmask) {
                this._el.value = '';
            }
        } else {
            this.unmask = this._trimUnmask(this.unmask);
        }
    }

    /**
     * @return {boolean}
     */
    isFocus() {
        return document.activeElement === this._el;
    }

    /**
     * @return {boolean}
     */
    isBlur() {
        return !this.isFocus();
    }

    /**
     * @private
     */
    _bind() {
        this._el.addEventListener('focus', this._onFocus);
        this._el.addEventListener('blur', this._onBlur);
        this._el.addEventListener('input', this._onInput);
        this._el.addEventListener('mouseup', this._onMouseUp);
        this._el.addEventListener('touchend', this._onMouseUp);
    }

    /**
     * @private
     */
    _unbind() {
        this._el.removeEventListener('focus', this._onFocus);
        this._el.removeEventListener('blur', this._onBlur);
        this._el.removeEventListener('input', this._onInput);
        this._el.removeEventListener('mouseup', this._onMouseUp);
        this._el.removeEventListener('touchend', this._onMouseUp);
    }

    /**
     * @private
     */
    _onFocus = () => {
        this.updateBlur();
        this._correctPos();
    }

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
     * @private
     */
    _onMouseUp = () => {
        this._correctPos();
    }

    /**
     * @private
     */
    _correctPos() {
        const {
            selectionStart,
            selectionEnd,
        } = this._el;

        if (selectionStart !== selectionEnd) {
            return;
        }

        const
            allowRightPos = Array.from(this._el.value.matchAll(/\d/g)).at(-1)?.index + 1 || 0,
            allowLeftPos = Math.max(this.options.mask.indexOf('_') || 0, 0),
            newPos = Math.max(Math.min(selectionStart, allowRightPos), allowLeftPos);

        if (selectionStart !== newPos) {
            this._el.selectionStart = this._el.selectionEnd = newPos;
        }
    }

    /**
     * @param {string} unmask
     * @return {string}
     * @private
     */
    _trimUnmask(unmask) {
        if (unmask.length <= this.options.unmaskMaxLength) {
            return unmask;
        }

        let newUnmask = unmask;

        if (this.options.trimUnmask) {
            newUnmask = unmask.replace(/^[87]/, '');
        }

        return newUnmask.slice(0, this.options.unmaskMaxLength);
    }

    /**
     * @return {string} value without mask
     * @private
     */
    _cleanMask(maskValue) {
        const
            value = maskValue,
            clearPatternSearch = '^' + this.options.mask
                .replace(new RegExp(`([^${this.options.softCaret}\\d])`, 'g'), '')
                .replace(/(\d)/g, '$1?')
                .replace(new RegExp(`${this.options.softCaret}+`, 'g'), '(\\d*?)') + '$',
            clearPattern = new RegExp(clearPatternSearch),
            matches = clearPattern.exec(value.replace(/\D/g, ''))

        return matches && matches.slice(1)
            .map(val => val.replace(/\D/g, ''))
            .join('');
    }

    /**
     * @param {string} unmask value without mask
     * @private
     */
    _applyMask(unmask) {
        const
            patternSearch = unmask.replace(/\d/g, '(\\d)'),
            pattern = new RegExp(patternSearch),
            count = Math.min(unmask.length, this.options.unmaskMaxLength);

        let replaceValue = this.options.mask;

        for (let i = 1; i <= count; i++) {
            replaceValue = replaceValue.replace(new RegExp(this.options.softCaret), '$' + i)
        }

        let maskedValue = unmask.replace(pattern, replaceValue);

        if (this.options.trimMask) {
            const
                minMaskLen = this.options.maskMinLength,
                lastNumber = Array.from(maskedValue.matchAll(/\d/g)).reverse()[0].index + 1;
            maskedValue = maskedValue.slice(0, Math.max(minMaskLen, lastNumber));
        } else if (this.options.softCaret !== this.options.caret) {
            maskedValue = maskedValue.replace(new RegExp(this.options.softCaret, 'g'), this.options.caret);
        }

        return maskedValue;
    }

    /**
     * @return {number}
     * @private
     */
    get _unmaskPos() {
        const
            maskValueToCaret = this._el.value.slice(0, this._el.selectionEnd),
            unmaskValueToCaret = this._cleanMask(maskValueToCaret);

        return unmaskValueToCaret.length;
    }

    /**
     * @param {number} unmaskPos
     * @private
     */
    set _unmaskPos(unmaskPos) {
        const
            {maskPosMap} = this.options,
            maskMaxAllowedPos = this.unmask.length,
            unmaskPosInMap = Math.min(Math.max(0, Math.min(unmaskPos, maskMaxAllowedPos) - 1)),
            unmaskPosMapCorrect = Math.max(0, Math.min(1, unmaskPos)),
            maskPosition = maskPosMap[unmaskPosInMap] + unmaskPosMapCorrect;

        this._el.selectionStart = this._el.selectionEnd = maskPosition;
    }

    /**
     * @return {string} value without mask
     */
    get unmask() {
        return this._cleanMask(this._el.value);
    }

    /**
     * @param {string} unmask value without mask
     */
    set unmask(unmask) {
        this._el.value = this._applyMask(unmask);
    }
}

// For webpack
if (typeof module === 'object' && module.exports) {
    module.exports = PhoneMask;
}
