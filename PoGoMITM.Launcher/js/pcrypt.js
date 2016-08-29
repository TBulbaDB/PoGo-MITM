window.p = (function () {

    !function (e) { if ("object" == typeof exports && "undefined" != typeof module) module.exports = e(); else if ("function" == typeof define && define.amd) define([], e); else { var f; "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), f.buffer = e() } }(function () {
        var define, module, exports; return (function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { var a = typeof require == "function" && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); var f = new Error("Cannot find module '" + o + "'"); throw f.code = "MODULE_NOT_FOUND", f } var l = n[o] = { exports: {} }; t[o][0].call(l.exports, function (e) { var n = t[o][1][e]; return s(n ? n : e) }, l, l.exports, e, t, n, r) } return n[o].exports } var i = typeof require == "function" && require; for (var o = 0; o < r.length; o++) s(r[o]); return s })({
            1: [function (require, module, exports) {
                var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

                ; (function (exports) {
                    'use strict';

                    var Arr = (typeof Uint8Array !== 'undefined')
                      ? Uint8Array
                      : Array

                    var PLUS = '+'.charCodeAt(0)
                    var SLASH = '/'.charCodeAt(0)
                    var NUMBER = '0'.charCodeAt(0)
                    var LOWER = 'a'.charCodeAt(0)
                    var UPPER = 'A'.charCodeAt(0)
                    var PLUS_URL_SAFE = '-'.charCodeAt(0)
                    var SLASH_URL_SAFE = '_'.charCodeAt(0)

                    function decode(elt) {
                        var code = elt.charCodeAt(0)
                        if (code === PLUS ||
                            code === PLUS_URL_SAFE)
                            return 62 // '+'
                        if (code === SLASH ||
                            code === SLASH_URL_SAFE)
                            return 63 // '/'
                        if (code < NUMBER)
                            return -1 //no match
                        if (code < NUMBER + 10)
                            return code - NUMBER + 26 + 26
                        if (code < UPPER + 26)
                            return code - UPPER
                        if (code < LOWER + 26)
                            return code - LOWER + 26
                    }

                    function b64ToByteArray(b64) {
                        var i, j, l, tmp, placeHolders, arr

                        if (b64.length % 4 > 0) {
                            throw new Error('Invalid string. Length must be a multiple of 4')
                        }

                        // the number of equal signs (place holders)
                        // if there are two placeholders, than the two characters before it
                        // represent one byte
                        // if there is only one, then the three characters before it represent 2 bytes
                        // this is just a cheap hack to not do indexOf twice
                        var len = b64.length
                        placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

                        // base64 is 4/3 + up to two characters of the original data
                        arr = new Arr(b64.length * 3 / 4 - placeHolders)

                        // if there are placeholders, only get up to the last complete 4 chars
                        l = placeHolders > 0 ? b64.length - 4 : b64.length

                        var L = 0

                        function push(v) {
                            arr[L++] = v
                        }

                        for (i = 0, j = 0; i < l; i += 4, j += 3) {
                            tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
                            push((tmp & 0xFF0000) >> 16)
                            push((tmp & 0xFF00) >> 8)
                            push(tmp & 0xFF)
                        }

                        if (placeHolders === 2) {
                            tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
                            push(tmp & 0xFF)
                        } else if (placeHolders === 1) {
                            tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
                            push((tmp >> 8) & 0xFF)
                            push(tmp & 0xFF)
                        }

                        return arr
                    }

                    function uint8ToBase64(uint8) {
                        var i,
                            extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
                            output = "",
                            temp, length

                        function encode(num) {
                            return lookup.charAt(num)
                        }

                        function tripletToBase64(num) {
                            return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
                        }

                        // go through the array every three bytes, we'll deal with trailing stuff later
                        for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
                            temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
                            output += tripletToBase64(temp)
                        }

                        // pad the end with zeros, but make sure to not forget the extra bytes
                        switch (extraBytes) {
                            case 1:
                                temp = uint8[uint8.length - 1]
                                output += encode(temp >> 2)
                                output += encode((temp << 4) & 0x3F)
                                output += '=='
                                break
                            case 2:
                                temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
                                output += encode(temp >> 10)
                                output += encode((temp >> 4) & 0x3F)
                                output += encode((temp << 2) & 0x3F)
                                output += '='
                                break
                        }

                        return output
                    }

                    exports.toByteArray = b64ToByteArray
                    exports.fromByteArray = uint8ToBase64
                }(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

            }, {}], 2: [function (require, module, exports) {
                exports.read = function (buffer, offset, isLE, mLen, nBytes) {
                    var e, m
                    var eLen = nBytes * 8 - mLen - 1
                    var eMax = (1 << eLen) - 1
                    var eBias = eMax >> 1
                    var nBits = -7
                    var i = isLE ? (nBytes - 1) : 0
                    var d = isLE ? -1 : 1
                    var s = buffer[offset + i]

                    i += d

                    e = s & ((1 << (-nBits)) - 1)
                    s >>= (-nBits)
                    nBits += eLen
                    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) { }

                    m = e & ((1 << (-nBits)) - 1)
                    e >>= (-nBits)
                    nBits += mLen
                    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) { }

                    if (e === 0) {
                        e = 1 - eBias
                    } else if (e === eMax) {
                        return m ? NaN : ((s ? -1 : 1) * Infinity)
                    } else {
                        m = m + Math.pow(2, mLen)
                        e = e - eBias
                    }
                    return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
                }

                exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
                    var e, m, c
                    var eLen = nBytes * 8 - mLen - 1
                    var eMax = (1 << eLen) - 1
                    var eBias = eMax >> 1
                    var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
                    var i = isLE ? 0 : (nBytes - 1)
                    var d = isLE ? 1 : -1
                    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

                    value = Math.abs(value)

                    if (isNaN(value) || value === Infinity) {
                        m = isNaN(value) ? 1 : 0
                        e = eMax
                    } else {
                        e = Math.floor(Math.log(value) / Math.LN2)
                        if (value * (c = Math.pow(2, -e)) < 1) {
                            e--
                            c *= 2
                        }
                        if (e + eBias >= 1) {
                            value += rt / c
                        } else {
                            value += rt * Math.pow(2, 1 - eBias)
                        }
                        if (value * c >= 2) {
                            e++
                            c /= 2
                        }

                        if (e + eBias >= eMax) {
                            m = 0
                            e = eMax
                        } else if (e + eBias >= 1) {
                            m = (value * c - 1) * Math.pow(2, mLen)
                            e = e + eBias
                        } else {
                            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
                            e = 0
                        }
                    }

                    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) { }

                    e = (e << mLen) | m
                    eLen += mLen
                    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) { }

                    buffer[offset + i - d] |= s * 128
                }

            }, {}], 3: [function (require, module, exports) {
                var toString = {}.toString;

                module.exports = Array.isArray || function (arr) {
                    return toString.call(arr) == '[object Array]';
                };

            }, {}], "buffer": [function (require, module, exports) {
                (function (global) {
                    /*!
                     * The buffer module from node.js, for the browser.
                     *
                     * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
                     * @license  MIT
                     */
                    /* eslint-disable no-proto */

                    'use strict'

                    var base64 = require('base64-js')
                    var ieee754 = require('ieee754')
                    var isArray = require('isarray')

                    exports.Buffer = Buffer
                    exports.SlowBuffer = SlowBuffer
                    exports.INSPECT_MAX_BYTES = 50
                    Buffer.poolSize = 8192 // not used by this implementation

                    var rootParent = {}

                    /**
                     * If `Buffer.TYPED_ARRAY_SUPPORT`:
                     *   === true    Use Uint8Array implementation (fastest)
                     *   === false   Use Object implementation (most compatible, even IE6)
                     *
                     * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
                     * Opera 11.6+, iOS 4.2+.
                     *
                     * Due to various browser bugs, sometimes the Object implementation will be used even
                     * when the browser supports typed arrays.
                     *
                     * Note:
                     *
                     *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
                     *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
                     *
                     *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
                     *     on objects.
                     *
                     *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
                     *
                     *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
                     *     incorrect length in some situations.
                    
                     * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
                     * get the Object implementation, which is slower but behaves correctly.
                     */
                    Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
                      ? global.TYPED_ARRAY_SUPPORT
                      : typedArraySupport()

                    function typedArraySupport() {
                        function Bar() { }
                        try {
                            var arr = new Uint8Array(1)
                            arr.foo = function () { return 42 }
                            arr.constructor = Bar
                            return arr.foo() === 42 && // typed array instances can be augmented
                                arr.constructor === Bar && // constructor can be set
                                typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
                                arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
                        } catch (e) {
                            return false
                        }
                    }

                    function kMaxLength() {
                        return Buffer.TYPED_ARRAY_SUPPORT
                          ? 0x7fffffff
                          : 0x3fffffff
                    }

                    /**
                     * Class: Buffer
                     * =============
                     *
                     * The Buffer constructor returns instances of `Uint8Array` that are augmented
                     * with function properties for all the node `Buffer` API functions. We use
                     * `Uint8Array` so that square bracket notation works as expected -- it returns
                     * a single octet.
                     *
                     * By augmenting the instances, we can avoid modifying the `Uint8Array`
                     * prototype.
                     */
                    function Buffer(arg) {
                        if (!(this instanceof Buffer)) {
                            // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
                            if (arguments.length > 1) return new Buffer(arg, arguments[1])
                            return new Buffer(arg)
                        }

                        if (!Buffer.TYPED_ARRAY_SUPPORT) {
                            this.length = 0
                            this.parent = undefined
                        }

                        // Common case.
                        if (typeof arg === 'number') {
                            return fromNumber(this, arg)
                        }

                        // Slightly less common case.
                        if (typeof arg === 'string') {
                            return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
                        }

                        // Unusual.
                        return fromObject(this, arg)
                    }

                    function fromNumber(that, length) {
                        that = allocate(that, length < 0 ? 0 : checked(length) | 0)
                        if (!Buffer.TYPED_ARRAY_SUPPORT) {
                            for (var i = 0; i < length; i++) {
                                that[i] = 0
                            }
                        }
                        return that
                    }

                    function fromString(that, string, encoding) {
                        if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

                        // Assumption: byteLength() return value is always < kMaxLength.
                        var length = byteLength(string, encoding) | 0
                        that = allocate(that, length)

                        that.write(string, encoding)
                        return that
                    }

                    function fromObject(that, object) {
                        if (Buffer.isBuffer(object)) return fromBuffer(that, object)

                        if (isArray(object)) return fromArray(that, object)

                        if (object == null) {
                            throw new TypeError('must start with number, buffer, array or string')
                        }

                        if (typeof ArrayBuffer !== 'undefined') {
                            if (object.buffer instanceof ArrayBuffer) {
                                return fromTypedArray(that, object)
                            }
                            if (object instanceof ArrayBuffer) {
                                return fromArrayBuffer(that, object)
                            }
                        }

                        if (object.length) return fromArrayLike(that, object)

                        return fromJsonObject(that, object)
                    }

                    function fromBuffer(that, buffer) {
                        var length = checked(buffer.length) | 0
                        that = allocate(that, length)
                        buffer.copy(that, 0, 0, length)
                        return that
                    }

                    function fromArray(that, array) {
                        var length = checked(array.length) | 0
                        that = allocate(that, length)
                        for (var i = 0; i < length; i += 1) {
                            that[i] = array[i] & 255
                        }
                        return that
                    }

                    // Duplicate of fromArray() to keep fromArray() monomorphic.
                    function fromTypedArray(that, array) {
                        var length = checked(array.length) | 0
                        that = allocate(that, length)
                        // Truncating the elements is probably not what people expect from typed
                        // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
                        // of the old Buffer constructor.
                        for (var i = 0; i < length; i += 1) {
                            that[i] = array[i] & 255
                        }
                        return that
                    }

                    function fromArrayBuffer(that, array) {
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            // Return an augmented `Uint8Array` instance, for best performance
                            array.byteLength
                            that = Buffer._augment(new Uint8Array(array))
                        } else {
                            // Fallback: Return an object instance of the Buffer class
                            that = fromTypedArray(that, new Uint8Array(array))
                        }
                        return that
                    }

                    function fromArrayLike(that, array) {
                        var length = checked(array.length) | 0
                        that = allocate(that, length)
                        for (var i = 0; i < length; i += 1) {
                            that[i] = array[i] & 255
                        }
                        return that
                    }

                    // Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
                    // Returns a zero-length buffer for inputs that don't conform to the spec.
                    function fromJsonObject(that, object) {
                        var array
                        var length = 0

                        if (object.type === 'Buffer' && isArray(object.data)) {
                            array = object.data
                            length = checked(array.length) | 0
                        }
                        that = allocate(that, length)

                        for (var i = 0; i < length; i += 1) {
                            that[i] = array[i] & 255
                        }
                        return that
                    }

                    if (Buffer.TYPED_ARRAY_SUPPORT) {
                        Buffer.prototype.__proto__ = Uint8Array.prototype
                        Buffer.__proto__ = Uint8Array
                    } else {
                        // pre-set for values that may exist in the future
                        Buffer.prototype.length = undefined
                        Buffer.prototype.parent = undefined
                    }

                    function allocate(that, length) {
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            // Return an augmented `Uint8Array` instance, for best performance
                            that = Buffer._augment(new Uint8Array(length))
                            that.__proto__ = Buffer.prototype
                        } else {
                            // Fallback: Return an object instance of the Buffer class
                            that.length = length
                            that._isBuffer = true
                        }

                        var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
                        if (fromPool) that.parent = rootParent

                        return that
                    }

                    function checked(length) {
                        // Note: cannot use `length < kMaxLength` here because that fails when
                        // length is NaN (which is otherwise coerced to zero.)
                        if (length >= kMaxLength()) {
                            throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                                                 'size: 0x' + kMaxLength().toString(16) + ' bytes')
                        }
                        return length | 0
                    }

                    function SlowBuffer(subject, encoding) {
                        if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

                        var buf = new Buffer(subject, encoding)
                        delete buf.parent
                        return buf
                    }

                    Buffer.isBuffer = function isBuffer(b) {
                        return !!(b != null && b._isBuffer)
                    }

                    Buffer.compare = function compare(a, b) {
                        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
                            throw new TypeError('Arguments must be Buffers')
                        }

                        if (a === b) return 0

                        var x = a.length
                        var y = b.length

                        var i = 0
                        var len = Math.min(x, y)
                        while (i < len) {
                            if (a[i] !== b[i]) break

                            ++i
                        }

                        if (i !== len) {
                            x = a[i]
                            y = b[i]
                        }

                        if (x < y) return -1
                        if (y < x) return 1
                        return 0
                    }

                    Buffer.isEncoding = function isEncoding(encoding) {
                        switch (String(encoding).toLowerCase()) {
                            case 'hex':
                            case 'utf8':
                            case 'utf-8':
                            case 'ascii':
                            case 'binary':
                            case 'base64':
                            case 'raw':
                            case 'ucs2':
                            case 'ucs-2':
                            case 'utf16le':
                            case 'utf-16le':
                                return true
                            default:
                                return false
                        }
                    }

                    Buffer.concat = function concat(list, length) {
                        if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

                        if (list.length === 0) {
                            return new Buffer(0)
                        }

                        var i
                        if (length === undefined) {
                            length = 0
                            for (i = 0; i < list.length; i++) {
                                length += list[i].length
                            }
                        }

                        var buf = new Buffer(length)
                        var pos = 0
                        for (i = 0; i < list.length; i++) {
                            var item = list[i]
                            item.copy(buf, pos)
                            pos += item.length
                        }
                        return buf
                    }

                    function byteLength(string, encoding) {
                        if (typeof string !== 'string') string = '' + string

                        var len = string.length
                        if (len === 0) return 0

                        // Use a for loop to avoid recursion
                        var loweredCase = false
                        for (; ;) {
                            switch (encoding) {
                                case 'ascii':
                                case 'binary':
                                    // Deprecated
                                case 'raw':
                                case 'raws':
                                    return len
                                case 'utf8':
                                case 'utf-8':
                                    return utf8ToBytes(string).length
                                case 'ucs2':
                                case 'ucs-2':
                                case 'utf16le':
                                case 'utf-16le':
                                    return len * 2
                                case 'hex':
                                    return len >>> 1
                                case 'base64':
                                    return base64ToBytes(string).length
                                default:
                                    if (loweredCase) return utf8ToBytes(string).length // assume utf8
                                    encoding = ('' + encoding).toLowerCase()
                                    loweredCase = true
                            }
                        }
                    }
                    Buffer.byteLength = byteLength

                    function slowToString(encoding, start, end) {
                        var loweredCase = false

                        start = start | 0
                        end = end === undefined || end === Infinity ? this.length : end | 0

                        if (!encoding) encoding = 'utf8'
                        if (start < 0) start = 0
                        if (end > this.length) end = this.length
                        if (end <= start) return ''

                        while (true) {
                            switch (encoding) {
                                case 'hex':
                                    return hexSlice(this, start, end)

                                case 'utf8':
                                case 'utf-8':
                                    return utf8Slice(this, start, end)

                                case 'ascii':
                                    return asciiSlice(this, start, end)

                                case 'binary':
                                    return binarySlice(this, start, end)

                                case 'base64':
                                    return base64Slice(this, start, end)

                                case 'ucs2':
                                case 'ucs-2':
                                case 'utf16le':
                                case 'utf-16le':
                                    return utf16leSlice(this, start, end)

                                default:
                                    if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                                    encoding = (encoding + '').toLowerCase()
                                    loweredCase = true
                            }
                        }
                    }

                    Buffer.prototype.toString = function toString() {
                        var length = this.length | 0
                        if (length === 0) return ''
                        if (arguments.length === 0) return utf8Slice(this, 0, length)
                        return slowToString.apply(this, arguments)
                    }

                    Buffer.prototype.equals = function equals(b) {
                        if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
                        if (this === b) return true
                        return Buffer.compare(this, b) === 0
                    }

                    Buffer.prototype.inspect = function inspect() {
                        var str = ''
                        var max = exports.INSPECT_MAX_BYTES
                        if (this.length > 0) {
                            str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
                            if (this.length > max) str += ' ... '
                        }
                        return '<Buffer ' + str + '>'
                    }

                    Buffer.prototype.compare = function compare(b) {
                        if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
                        if (this === b) return 0
                        return Buffer.compare(this, b)
                    }

                    Buffer.prototype.indexOf = function indexOf(val, byteOffset) {
                        if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
                        else if (byteOffset < -0x80000000) byteOffset = -0x80000000
                        byteOffset >>= 0

                        if (this.length === 0) return -1
                        if (byteOffset >= this.length) return -1

                        // Negative offsets start from the end of the buffer
                        if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

                        if (typeof val === 'string') {
                            if (val.length === 0) return -1 // special case: looking for empty string always fails
                            return String.prototype.indexOf.call(this, val, byteOffset)
                        }
                        if (Buffer.isBuffer(val)) {
                            return arrayIndexOf(this, val, byteOffset)
                        }
                        if (typeof val === 'number') {
                            if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
                                return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
                            }
                            return arrayIndexOf(this, [val], byteOffset)
                        }

                        function arrayIndexOf(arr, val, byteOffset) {
                            var foundIndex = -1
                            for (var i = 0; byteOffset + i < arr.length; i++) {
                                if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
                                    if (foundIndex === -1) foundIndex = i
                                    if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
                                } else {
                                    foundIndex = -1
                                }
                            }
                            return -1
                        }

                        throw new TypeError('val must be string, number or Buffer')
                    }

                    // `get` is deprecated
                    Buffer.prototype.get = function get(offset) {
                        console.log('.get() is deprecated. Access using array indexes instead.')
                        return this.readUInt8(offset)
                    }

                    // `set` is deprecated
                    Buffer.prototype.set = function set(v, offset) {
                        console.log('.set() is deprecated. Access using array indexes instead.')
                        return this.writeUInt8(v, offset)
                    }

                    function hexWrite(buf, string, offset, length) {
                        offset = Number(offset) || 0
                        var remaining = buf.length - offset
                        if (!length) {
                            length = remaining
                        } else {
                            length = Number(length)
                            if (length > remaining) {
                                length = remaining
                            }
                        }

                        // must be an even number of digits
                        var strLen = string.length
                        if (strLen % 2 !== 0) throw new Error('Invalid hex string')

                        if (length > strLen / 2) {
                            length = strLen / 2
                        }
                        for (var i = 0; i < length; i++) {
                            var parsed = parseInt(string.substr(i * 2, 2), 16)
                            if (isNaN(parsed)) throw new Error('Invalid hex string')
                            buf[offset + i] = parsed
                        }
                        return i
                    }

                    function utf8Write(buf, string, offset, length) {
                        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
                    }

                    function asciiWrite(buf, string, offset, length) {
                        return blitBuffer(asciiToBytes(string), buf, offset, length)
                    }

                    function binaryWrite(buf, string, offset, length) {
                        return asciiWrite(buf, string, offset, length)
                    }

                    function base64Write(buf, string, offset, length) {
                        return blitBuffer(base64ToBytes(string), buf, offset, length)
                    }

                    function ucs2Write(buf, string, offset, length) {
                        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
                    }

                    Buffer.prototype.write = function write(string, offset, length, encoding) {
                        // Buffer#write(string)
                        if (offset === undefined) {
                            encoding = 'utf8'
                            length = this.length
                            offset = 0
                            // Buffer#write(string, encoding)
                        } else if (length === undefined && typeof offset === 'string') {
                            encoding = offset
                            length = this.length
                            offset = 0
                            // Buffer#write(string, offset[, length][, encoding])
                        } else if (isFinite(offset)) {
                            offset = offset | 0
                            if (isFinite(length)) {
                                length = length | 0
                                if (encoding === undefined) encoding = 'utf8'
                            } else {
                                encoding = length
                                length = undefined
                            }
                            // legacy write(string, encoding, offset, length) - remove in v0.13
                        } else {
                            var swap = encoding
                            encoding = offset
                            offset = length | 0
                            length = swap
                        }

                        var remaining = this.length - offset
                        if (length === undefined || length > remaining) length = remaining

                        if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
                            throw new RangeError('attempt to write outside buffer bounds')
                        }

                        if (!encoding) encoding = 'utf8'

                        var loweredCase = false
                        for (; ;) {
                            switch (encoding) {
                                case 'hex':
                                    return hexWrite(this, string, offset, length)

                                case 'utf8':
                                case 'utf-8':
                                    return utf8Write(this, string, offset, length)

                                case 'ascii':
                                    return asciiWrite(this, string, offset, length)

                                case 'binary':
                                    return binaryWrite(this, string, offset, length)

                                case 'base64':
                                    // Warning: maxLength not taken into account in base64Write
                                    return base64Write(this, string, offset, length)

                                case 'ucs2':
                                case 'ucs-2':
                                case 'utf16le':
                                case 'utf-16le':
                                    return ucs2Write(this, string, offset, length)

                                default:
                                    if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                                    encoding = ('' + encoding).toLowerCase()
                                    loweredCase = true
                            }
                        }
                    }

                    Buffer.prototype.toJSON = function toJSON() {
                        return {
                            type: 'Buffer',
                            data: Array.prototype.slice.call(this._arr || this, 0)
                        }
                    }

                    function base64Slice(buf, start, end) {
                        if (start === 0 && end === buf.length) {
                            return base64.fromByteArray(buf)
                        } else {
                            return base64.fromByteArray(buf.slice(start, end))
                        }
                    }

                    function utf8Slice(buf, start, end) {
                        end = Math.min(buf.length, end)
                        var res = []

                        var i = start
                        while (i < end) {
                            var firstByte = buf[i]
                            var codePoint = null
                            var bytesPerSequence = (firstByte > 0xEF) ? 4
                              : (firstByte > 0xDF) ? 3
                              : (firstByte > 0xBF) ? 2
                              : 1

                            if (i + bytesPerSequence <= end) {
                                var secondByte, thirdByte, fourthByte, tempCodePoint

                                switch (bytesPerSequence) {
                                    case 1:
                                        if (firstByte < 0x80) {
                                            codePoint = firstByte
                                        }
                                        break
                                    case 2:
                                        secondByte = buf[i + 1]
                                        if ((secondByte & 0xC0) === 0x80) {
                                            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
                                            if (tempCodePoint > 0x7F) {
                                                codePoint = tempCodePoint
                                            }
                                        }
                                        break
                                    case 3:
                                        secondByte = buf[i + 1]
                                        thirdByte = buf[i + 2]
                                        if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                                            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
                                            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                                                codePoint = tempCodePoint
                                            }
                                        }
                                        break
                                    case 4:
                                        secondByte = buf[i + 1]
                                        thirdByte = buf[i + 2]
                                        fourthByte = buf[i + 3]
                                        if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                                            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
                                            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                                                codePoint = tempCodePoint
                                            }
                                        }
                                }
                            }

                            if (codePoint === null) {
                                // we did not generate a valid codePoint so insert a
                                // replacement char (U+FFFD) and advance only 1 byte
                                codePoint = 0xFFFD
                                bytesPerSequence = 1
                            } else if (codePoint > 0xFFFF) {
                                // encode to utf16 (surrogate pair dance)
                                codePoint -= 0x10000
                                res.push(codePoint >>> 10 & 0x3FF | 0xD800)
                                codePoint = 0xDC00 | codePoint & 0x3FF
                            }

                            res.push(codePoint)
                            i += bytesPerSequence
                        }

                        return decodeCodePointsArray(res)
                    }

                    // Based on http://stackoverflow.com/a/22747272/680742, the browser with
                    // the lowest limit is Chrome, with 0x10000 args.
                    // We go 1 magnitude less, for safety
                    var MAX_ARGUMENTS_LENGTH = 0x1000

                    function decodeCodePointsArray(codePoints) {
                        var len = codePoints.length
                        if (len <= MAX_ARGUMENTS_LENGTH) {
                            return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
                        }

                        // Decode in chunks to avoid "call stack size exceeded".
                        var res = ''
                        var i = 0
                        while (i < len) {
                            res += String.fromCharCode.apply(
                              String,
                              codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
                            )
                        }
                        return res
                    }

                    function asciiSlice(buf, start, end) {
                        var ret = ''
                        end = Math.min(buf.length, end)

                        for (var i = start; i < end; i++) {
                            ret += String.fromCharCode(buf[i] & 0x7F)
                        }
                        return ret
                    }

                    function binarySlice(buf, start, end) {
                        var ret = ''
                        end = Math.min(buf.length, end)

                        for (var i = start; i < end; i++) {
                            ret += String.fromCharCode(buf[i])
                        }
                        return ret
                    }

                    function hexSlice(buf, start, end) {
                        var len = buf.length

                        if (!start || start < 0) start = 0
                        if (!end || end < 0 || end > len) end = len

                        var out = ''
                        for (var i = start; i < end; i++) {
                            out += toHex(buf[i])
                        }
                        return out
                    }

                    function utf16leSlice(buf, start, end) {
                        var bytes = buf.slice(start, end)
                        var res = ''
                        for (var i = 0; i < bytes.length; i += 2) {
                            res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
                        }
                        return res
                    }

                    Buffer.prototype.slice = function slice(start, end) {
                        var len = this.length
                        start = ~~start
                        end = end === undefined ? len : ~~end

                        if (start < 0) {
                            start += len
                            if (start < 0) start = 0
                        } else if (start > len) {
                            start = len
                        }

                        if (end < 0) {
                            end += len
                            if (end < 0) end = 0
                        } else if (end > len) {
                            end = len
                        }

                        if (end < start) end = start

                        var newBuf
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            newBuf = Buffer._augment(this.subarray(start, end))
                        } else {
                            var sliceLen = end - start
                            newBuf = new Buffer(sliceLen, undefined)
                            for (var i = 0; i < sliceLen; i++) {
                                newBuf[i] = this[i + start]
                            }
                        }

                        if (newBuf.length) newBuf.parent = this.parent || this

                        return newBuf
                    }

                    /*
                     * Need to make sure that buffer isn't trying to write out of bounds.
                     */
                    function checkOffset(offset, ext, length) {
                        if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
                        if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
                    }

                    Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
                        offset = offset | 0
                        byteLength = byteLength | 0
                        if (!noAssert) checkOffset(offset, byteLength, this.length)

                        var val = this[offset]
                        var mul = 1
                        var i = 0
                        while (++i < byteLength && (mul *= 0x100)) {
                            val += this[offset + i] * mul
                        }

                        return val
                    }

                    Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
                        offset = offset | 0
                        byteLength = byteLength | 0
                        if (!noAssert) {
                            checkOffset(offset, byteLength, this.length)
                        }

                        var val = this[offset + --byteLength]
                        var mul = 1
                        while (byteLength > 0 && (mul *= 0x100)) {
                            val += this[offset + --byteLength] * mul
                        }

                        return val
                    }

                    Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 1, this.length)
                        return this[offset]
                    }

                    Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 2, this.length)
                        return this[offset] | (this[offset + 1] << 8)
                    }

                    Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 2, this.length)
                        return (this[offset] << 8) | this[offset + 1]
                    }

                    Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length)

                        return ((this[offset]) |
                            (this[offset + 1] << 8) |
                            (this[offset + 2] << 16)) +
                            (this[offset + 3] * 0x1000000)
                    }

                    Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length)

                        return (this[offset] * 0x1000000) +
                          ((this[offset + 1] << 16) |
                          (this[offset + 2] << 8) |
                          this[offset + 3])
                    }

                    Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
                        offset = offset | 0
                        byteLength = byteLength | 0
                        if (!noAssert) checkOffset(offset, byteLength, this.length)

                        var val = this[offset]
                        var mul = 1
                        var i = 0
                        while (++i < byteLength && (mul *= 0x100)) {
                            val += this[offset + i] * mul
                        }
                        mul *= 0x80

                        if (val >= mul) val -= Math.pow(2, 8 * byteLength)

                        return val
                    }

                    Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
                        offset = offset | 0
                        byteLength = byteLength | 0
                        if (!noAssert) checkOffset(offset, byteLength, this.length)

                        var i = byteLength
                        var mul = 1
                        var val = this[offset + --i]
                        while (i > 0 && (mul *= 0x100)) {
                            val += this[offset + --i] * mul
                        }
                        mul *= 0x80

                        if (val >= mul) val -= Math.pow(2, 8 * byteLength)

                        return val
                    }

                    Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 1, this.length)
                        if (!(this[offset] & 0x80)) return (this[offset])
                        return ((0xff - this[offset] + 1) * -1)
                    }

                    Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 2, this.length)
                        var val = this[offset] | (this[offset + 1] << 8)
                        return (val & 0x8000) ? val | 0xFFFF0000 : val
                    }

                    Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 2, this.length)
                        var val = this[offset + 1] | (this[offset] << 8)
                        return (val & 0x8000) ? val | 0xFFFF0000 : val
                    }

                    Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length)

                        return (this[offset]) |
                          (this[offset + 1] << 8) |
                          (this[offset + 2] << 16) |
                          (this[offset + 3] << 24)
                    }

                    Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length)

                        return (this[offset] << 24) |
                          (this[offset + 1] << 16) |
                          (this[offset + 2] << 8) |
                          (this[offset + 3])
                    }

                    Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length)
                        return ieee754.read(this, offset, true, 23, 4)
                    }

                    Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length)
                        return ieee754.read(this, offset, false, 23, 4)
                    }

                    Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 8, this.length)
                        return ieee754.read(this, offset, true, 52, 8)
                    }

                    Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 8, this.length)
                        return ieee754.read(this, offset, false, 52, 8)
                    }

                    function checkInt(buf, value, offset, ext, max, min) {
                        if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
                        if (value > max || value < min) throw new RangeError('value is out of bounds')
                        if (offset + ext > buf.length) throw new RangeError('index out of range')
                    }

                    Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
                        value = +value
                        offset = offset | 0
                        byteLength = byteLength | 0
                        if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

                        var mul = 1
                        var i = 0
                        this[offset] = value & 0xFF
                        while (++i < byteLength && (mul *= 0x100)) {
                            this[offset + i] = (value / mul) & 0xFF
                        }

                        return offset + byteLength
                    }

                    Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
                        value = +value
                        offset = offset | 0
                        byteLength = byteLength | 0
                        if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

                        var i = byteLength - 1
                        var mul = 1
                        this[offset + i] = value & 0xFF
                        while (--i >= 0 && (mul *= 0x100)) {
                            this[offset + i] = (value / mul) & 0xFF
                        }

                        return offset + byteLength
                    }

                    Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
                        value = +value
                        offset = offset | 0
                        if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
                        if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
                        this[offset] = (value & 0xff)
                        return offset + 1
                    }

                    function objectWriteUInt16(buf, value, offset, littleEndian) {
                        if (value < 0) value = 0xffff + value + 1
                        for (var i = 0, j = Math.min(buf.length - offset, 2) ; i < j; i++) {
                            buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
                              (littleEndian ? i : 1 - i) * 8
                        }
                    }

                    Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
                        value = +value
                        offset = offset | 0
                        if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = (value & 0xff)
                            this[offset + 1] = (value >>> 8)
                        } else {
                            objectWriteUInt16(this, value, offset, true)
                        }
                        return offset + 2
                    }

                    Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
                        value = +value
                        offset = offset | 0
                        if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = (value >>> 8)
                            this[offset + 1] = (value & 0xff)
                        } else {
                            objectWriteUInt16(this, value, offset, false)
                        }
                        return offset + 2
                    }

                    function objectWriteUInt32(buf, value, offset, littleEndian) {
                        if (value < 0) value = 0xffffffff + value + 1
                        for (var i = 0, j = Math.min(buf.length - offset, 4) ; i < j; i++) {
                            buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
                        }
                    }

                    Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
                        value = +value
                        offset = offset | 0
                        if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset + 3] = (value >>> 24)
                            this[offset + 2] = (value >>> 16)
                            this[offset + 1] = (value >>> 8)
                            this[offset] = (value & 0xff)
                        } else {
                            objectWriteUInt32(this, value, offset, true)
                        }
                        return offset + 4
                    }

                    Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
                        value = +value
                        offset = offset | 0
                        if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = (value >>> 24)
                            this[offset + 1] = (value >>> 16)
                            this[offset + 2] = (value >>> 8)
                            this[offset + 3] = (value & 0xff)
                        } else {
                            objectWriteUInt32(this, value, offset, false)
                        }
                        return offset + 4
                    }

                    Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
                        value = +value
                        offset = offset | 0
                        if (!noAssert) {
                            var limit = Math.pow(2, 8 * byteLength - 1)

                            checkInt(this, value, offset, byteLength, limit - 1, -limit)
                        }

                        var i = 0
                        var mul = 1
                        var sub = value < 0 ? 1 : 0
                        this[offset] = value & 0xFF
                        while (++i < byteLength && (mul *= 0x100)) {
                            this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
                        }

                        return offset + byteLength
                    }

                    Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
                        value = +value
                        offset = offset | 0
                        if (!noAssert) {
                            var limit = Math.pow(2, 8 * byteLength - 1)

                            checkInt(this, value, offset, byteLength, limit - 1, -limit)
                        }

                        var i = byteLength - 1
                        var mul = 1
                        var sub = value < 0 ? 1 : 0
                        this[offset + i] = value & 0xFF
                        while (--i >= 0 && (mul *= 0x100)) {
                            this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
                        }

                        return offset + byteLength
                    }

                    Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
                        value = +value
                        offset = offset | 0
                        if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
                        if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
                        if (value < 0) value = 0xff + value + 1
                        this[offset] = (value & 0xff)
                        return offset + 1
                    }

                    Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
                        value = +value
                        offset = offset | 0
                        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = (value & 0xff)
                            this[offset + 1] = (value >>> 8)
                        } else {
                            objectWriteUInt16(this, value, offset, true)
                        }
                        return offset + 2
                    }

                    Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
                        value = +value
                        offset = offset | 0
                        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = (value >>> 8)
                            this[offset + 1] = (value & 0xff)
                        } else {
                            objectWriteUInt16(this, value, offset, false)
                        }
                        return offset + 2
                    }

                    Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
                        value = +value
                        offset = offset | 0
                        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = (value & 0xff)
                            this[offset + 1] = (value >>> 8)
                            this[offset + 2] = (value >>> 16)
                            this[offset + 3] = (value >>> 24)
                        } else {
                            objectWriteUInt32(this, value, offset, true)
                        }
                        return offset + 4
                    }

                    Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
                        value = +value
                        offset = offset | 0
                        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
                        if (value < 0) value = 0xffffffff + value + 1
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = (value >>> 24)
                            this[offset + 1] = (value >>> 16)
                            this[offset + 2] = (value >>> 8)
                            this[offset + 3] = (value & 0xff)
                        } else {
                            objectWriteUInt32(this, value, offset, false)
                        }
                        return offset + 4
                    }

                    function checkIEEE754(buf, value, offset, ext, max, min) {
                        if (value > max || value < min) throw new RangeError('value is out of bounds')
                        if (offset + ext > buf.length) throw new RangeError('index out of range')
                        if (offset < 0) throw new RangeError('index out of range')
                    }

                    function writeFloat(buf, value, offset, littleEndian, noAssert) {
                        if (!noAssert) {
                            checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
                        }
                        ieee754.write(buf, value, offset, littleEndian, 23, 4)
                        return offset + 4
                    }

                    Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
                        return writeFloat(this, value, offset, true, noAssert)
                    }

                    Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
                        return writeFloat(this, value, offset, false, noAssert)
                    }

                    function writeDouble(buf, value, offset, littleEndian, noAssert) {
                        if (!noAssert) {
                            checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
                        }
                        ieee754.write(buf, value, offset, littleEndian, 52, 8)
                        return offset + 8
                    }

                    Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
                        return writeDouble(this, value, offset, true, noAssert)
                    }

                    Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
                        return writeDouble(this, value, offset, false, noAssert)
                    }

                    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
                    Buffer.prototype.copy = function copy(target, targetStart, start, end) {
                        if (!start) start = 0
                        if (!end && end !== 0) end = this.length
                        if (targetStart >= target.length) targetStart = target.length
                        if (!targetStart) targetStart = 0
                        if (end > 0 && end < start) end = start

                        // Copy 0 bytes; we're done
                        if (end === start) return 0
                        if (target.length === 0 || this.length === 0) return 0

                        // Fatal error conditions
                        if (targetStart < 0) {
                            throw new RangeError('targetStart out of bounds')
                        }
                        if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
                        if (end < 0) throw new RangeError('sourceEnd out of bounds')

                        // Are we oob?
                        if (end > this.length) end = this.length
                        if (target.length - targetStart < end - start) {
                            end = target.length - targetStart + start
                        }

                        var len = end - start
                        var i

                        if (this === target && start < targetStart && targetStart < end) {
                            // descending copy from end
                            for (i = len - 1; i >= 0; i--) {
                                target[i + targetStart] = this[i + start]
                            }
                        } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
                            // ascending copy from start
                            for (i = 0; i < len; i++) {
                                target[i + targetStart] = this[i + start]
                            }
                        } else {
                            target._set(this.subarray(start, start + len), targetStart)
                        }

                        return len
                    }

                    // fill(value, start=0, end=buffer.length)
                    Buffer.prototype.fill = function fill(value, start, end) {
                        if (!value) value = 0
                        if (!start) start = 0
                        if (!end) end = this.length

                        if (end < start) throw new RangeError('end < start')

                        // Fill 0 bytes; we're done
                        if (end === start) return
                        if (this.length === 0) return

                        if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
                        if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

                        var i
                        if (typeof value === 'number') {
                            for (i = start; i < end; i++) {
                                this[i] = value
                            }
                        } else {
                            var bytes = utf8ToBytes(value.toString())
                            var len = bytes.length
                            for (i = start; i < end; i++) {
                                this[i] = bytes[i % len]
                            }
                        }

                        return this
                    }

                    /**
                     * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
                     * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
                     */
                    Buffer.prototype.toArrayBuffer = function toArrayBuffer() {
                        if (typeof Uint8Array !== 'undefined') {
                            if (Buffer.TYPED_ARRAY_SUPPORT) {
                                return (new Buffer(this)).buffer
                            } else {
                                var buf = new Uint8Array(this.length)
                                for (var i = 0, len = buf.length; i < len; i += 1) {
                                    buf[i] = this[i]
                                }
                                return buf.buffer
                            }
                        } else {
                            throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
                        }
                    }

                    // HELPER FUNCTIONS
                    // ================

                    var BP = Buffer.prototype

                    /**
                     * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
                     */
                    Buffer._augment = function _augment(arr) {
                        arr.constructor = Buffer
                        arr._isBuffer = true

                        // save reference to original Uint8Array set method before overwriting
                        arr._set = arr.set

                        // deprecated
                        arr.get = BP.get
                        arr.set = BP.set

                        arr.write = BP.write
                        arr.toString = BP.toString
                        arr.toLocaleString = BP.toString
                        arr.toJSON = BP.toJSON
                        arr.equals = BP.equals
                        arr.compare = BP.compare
                        arr.indexOf = BP.indexOf
                        arr.copy = BP.copy
                        arr.slice = BP.slice
                        arr.readUIntLE = BP.readUIntLE
                        arr.readUIntBE = BP.readUIntBE
                        arr.readUInt8 = BP.readUInt8
                        arr.readUInt16LE = BP.readUInt16LE
                        arr.readUInt16BE = BP.readUInt16BE
                        arr.readUInt32LE = BP.readUInt32LE
                        arr.readUInt32BE = BP.readUInt32BE
                        arr.readIntLE = BP.readIntLE
                        arr.readIntBE = BP.readIntBE
                        arr.readInt8 = BP.readInt8
                        arr.readInt16LE = BP.readInt16LE
                        arr.readInt16BE = BP.readInt16BE
                        arr.readInt32LE = BP.readInt32LE
                        arr.readInt32BE = BP.readInt32BE
                        arr.readFloatLE = BP.readFloatLE
                        arr.readFloatBE = BP.readFloatBE
                        arr.readDoubleLE = BP.readDoubleLE
                        arr.readDoubleBE = BP.readDoubleBE
                        arr.writeUInt8 = BP.writeUInt8
                        arr.writeUIntLE = BP.writeUIntLE
                        arr.writeUIntBE = BP.writeUIntBE
                        arr.writeUInt16LE = BP.writeUInt16LE
                        arr.writeUInt16BE = BP.writeUInt16BE
                        arr.writeUInt32LE = BP.writeUInt32LE
                        arr.writeUInt32BE = BP.writeUInt32BE
                        arr.writeIntLE = BP.writeIntLE
                        arr.writeIntBE = BP.writeIntBE
                        arr.writeInt8 = BP.writeInt8
                        arr.writeInt16LE = BP.writeInt16LE
                        arr.writeInt16BE = BP.writeInt16BE
                        arr.writeInt32LE = BP.writeInt32LE
                        arr.writeInt32BE = BP.writeInt32BE
                        arr.writeFloatLE = BP.writeFloatLE
                        arr.writeFloatBE = BP.writeFloatBE
                        arr.writeDoubleLE = BP.writeDoubleLE
                        arr.writeDoubleBE = BP.writeDoubleBE
                        arr.fill = BP.fill
                        arr.inspect = BP.inspect
                        arr.toArrayBuffer = BP.toArrayBuffer

                        return arr
                    }

                    var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

                    function base64clean(str) {
                        // Node strips out invalid characters like \n and \t from the string, base64-js does not
                        str = stringtrim(str).replace(INVALID_BASE64_RE, '')
                        // Node converts strings with length < 2 to ''
                        if (str.length < 2) return ''
                        // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
                        while (str.length % 4 !== 0) {
                            str = str + '='
                        }
                        return str
                    }

                    function stringtrim(str) {
                        if (str.trim) return str.trim()
                        return str.replace(/^\s+|\s+$/g, '')
                    }

                    function toHex(n) {
                        if (n < 16) return '0' + n.toString(16)
                        return n.toString(16)
                    }

                    function utf8ToBytes(string, units) {
                        units = units || Infinity
                        var codePoint
                        var length = string.length
                        var leadSurrogate = null
                        var bytes = []

                        for (var i = 0; i < length; i++) {
                            codePoint = string.charCodeAt(i)

                            // is surrogate component
                            if (codePoint > 0xD7FF && codePoint < 0xE000) {
                                // last char was a lead
                                if (!leadSurrogate) {
                                    // no lead yet
                                    if (codePoint > 0xDBFF) {
                                        // unexpected trail
                                        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                                        continue
                                    } else if (i + 1 === length) {
                                        // unpaired lead
                                        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                                        continue
                                    }

                                    // valid lead
                                    leadSurrogate = codePoint

                                    continue
                                }

                                // 2 leads in a row
                                if (codePoint < 0xDC00) {
                                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                                    leadSurrogate = codePoint
                                    continue
                                }

                                // valid surrogate pair
                                codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
                            } else if (leadSurrogate) {
                                // valid bmp char, but last char was a lead
                                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                            }

                            leadSurrogate = null

                            // encode utf8
                            if (codePoint < 0x80) {
                                if ((units -= 1) < 0) break
                                bytes.push(codePoint)
                            } else if (codePoint < 0x800) {
                                if ((units -= 2) < 0) break
                                bytes.push(
                                  codePoint >> 0x6 | 0xC0,
                                  codePoint & 0x3F | 0x80
                                )
                            } else if (codePoint < 0x10000) {
                                if ((units -= 3) < 0) break
                                bytes.push(
                                  codePoint >> 0xC | 0xE0,
                                  codePoint >> 0x6 & 0x3F | 0x80,
                                  codePoint & 0x3F | 0x80
                                )
                            } else if (codePoint < 0x110000) {
                                if ((units -= 4) < 0) break
                                bytes.push(
                                  codePoint >> 0x12 | 0xF0,
                                  codePoint >> 0xC & 0x3F | 0x80,
                                  codePoint >> 0x6 & 0x3F | 0x80,
                                  codePoint & 0x3F | 0x80
                                )
                            } else {
                                throw new Error('Invalid code point')
                            }
                        }

                        return bytes
                    }

                    function asciiToBytes(str) {
                        var byteArray = []
                        for (var i = 0; i < str.length; i++) {
                            // Node's code seems to be doing this and not & 0x7F..
                            byteArray.push(str.charCodeAt(i) & 0xFF)
                        }
                        return byteArray
                    }

                    function utf16leToBytes(str, units) {
                        var c, hi, lo
                        var byteArray = []
                        for (var i = 0; i < str.length; i++) {
                            if ((units -= 2) < 0) break

                            c = str.charCodeAt(i)
                            hi = c >> 8
                            lo = c % 256
                            byteArray.push(lo)
                            byteArray.push(hi)
                        }

                        return byteArray
                    }

                    function base64ToBytes(str) {
                        return base64.toByteArray(base64clean(str))
                    }

                    function blitBuffer(src, dst, offset, length) {
                        for (var i = 0; i < length; i++) {
                            if ((i + offset >= dst.length) || (i >= src.length)) break
                            dst[i + offset] = src[i]
                        }
                        return i
                    }

                }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
            }, { "base64-js": 1, "ieee754": 2, "isarray": 3 }]
        }, {}, [])("buffer")
    });



    function unshuffle(vector) {
        var tmp = new Int32Array(205);
        tmp[0] = vector[3] & vector[19];
        tmp[1] = vector[9] | vector[25];
        tmp[2] = vector[7] & vector[31];
        tmp[3] = vector[7] | vector[31];
        tmp[4] = vector[25] & vector[33];
        tmp[5] = vector[21] | vector[37];
        tmp[6] = vector[13] & vector[37];
        tmp[7] = vector[13] | vector[37];
        tmp[8] = vector[29] & vector[61];
        tmp[9] = vector[37] & vector[61];
        tmp[10] = ~vector[1];
        tmp[11] = ~vector[3];
        tmp[12] = ~vector[5];
        tmp[13] = ~vector[7];
        tmp[14] = vector[7] ^ vector[31];
        tmp[15] = ~vector[9];
        tmp[16] = ~vector[11];
        tmp[17] = vector[13] ^ vector[37];
        tmp[18] = ~vector[15];
        tmp[19] = ~vector[17];
        tmp[20] = ~vector[19];
        tmp[21] = ~vector[21];
        tmp[22] = ~vector[25];
        tmp[23] = ~vector[27];
        tmp[24] = ~vector[29];
        tmp[25] = ~vector[31];
        tmp[26] = ~vector[33];
        tmp[27] = ~vector[35];
        tmp[28] = ~vector[37];
        tmp[29] = ~vector[39];
        tmp[30] = ~vector[41];
        tmp[31] = ~vector[45];
        tmp[32] = ~vector[47];
        tmp[33] = ~vector[49];
        tmp[34] = ~vector[51];
        tmp[35] = ~vector[55];
        tmp[36] = ~vector[57];
        tmp[37] = ~vector[59];
        tmp[38] = ~vector[61];
        tmp[39] = ~vector[63];
        tmp[40] = vector[33] & tmp[10];
        tmp[41] = tmp[4] & tmp[10];
        tmp[42] = vector[19] & tmp[11];
        tmp[43] = vector[19] | tmp[11];
        tmp[44] = vector[11] & tmp[11];
        tmp[45] = vector[41] & tmp[11];
        tmp[46] = tmp[3] & tmp[13];
        tmp[47] = vector[15] & vector[31] & tmp[13];
        tmp[48] = vector[15] & tmp[14];
        tmp[49] = vector[25] & tmp[15];
        tmp[50] = tmp[11] | tmp[16];
        tmp[51] = tmp[11] & tmp[20];
        tmp[52] = ~tmp[2];
        tmp[53] = vector[7] & tmp[25];
        tmp[54] = vector[25] & tmp[26];
        tmp[55] = vector[25] | tmp[26];
        tmp[56] = tmp[22] & tmp[26];
        tmp[57] = tmp[7] & tmp[28];
        tmp[58] = tmp[25] & tmp[29];
        tmp[59] = tmp[11] | tmp[30];
        tmp[60] = vector[27] & tmp[34];
        tmp[61] = tmp[23] | tmp[34];
        tmp[62] = tmp[23] & tmp[34];
        tmp[63] = tmp[29] & tmp[35];
        tmp[64] = vector[31] & tmp[35];
        tmp[65] = vector[31] | tmp[35];
        tmp[66] = vector[3] & tmp[36];
        tmp[67] = tmp[11] | tmp[36];
        tmp[68] = tmp[11] & tmp[36];
        tmp[69] = tmp[34] | tmp[37];
        tmp[70] = tmp[23] | tmp[37];
        tmp[71] = vector[29] & tmp[38];
        tmp[72] = vector[37] | tmp[38];
        tmp[73] = vector[37] & tmp[38];
        tmp[74] = ~tmp[10];
        tmp[75] = tmp[11] ^ tmp[36];
        tmp[76] = vector[19] ^ tmp[11];
        tmp[77] = ~tmp[12];
        tmp[78] = tmp[23] ^ tmp[34];
        tmp[79] = tmp[26] ^ tmp[40];
        tmp[80] = vector[25] ^ tmp[26];
        tmp[81] = ~tmp[27];
        tmp[82] = vector[31] ^ tmp[29];
        tmp[83] = tmp[34] ^ tmp[37];
        tmp[84] = ~tmp[36];
        tmp[85] = ~tmp[37];
        tmp[86] = ~tmp[38];
        tmp[87] = vector[37] ^ tmp[38];
        tmp[20] &= tmp[43];
        tmp[88] = vector[15] & tmp[53];
        tmp[89] = vector[33] & tmp[55];
        tmp[90] = vector[37] & ~tmp[6];
        tmp[91] = tmp[25] & tmp[65];
        tmp[92] = vector[41] & tmp[66];
        tmp[93] = vector[41] & tmp[67];
        tmp[94] = tmp[30] | tmp[67];
        tmp[95] = vector[41] & tmp[68];
        tmp[96] = vector[61] & tmp[72];
        tmp[97] = vector[29] & tmp[73];
        tmp[98] = tmp[42] ^ tmp[50];
        tmp[99] = vector[11] & tmp[76];
        tmp[100] = tmp[17] ^ vector[37] & tmp[21];
        tmp[101] = tmp[7] ^ tmp[6] & tmp[21];
        tmp[102] = tmp[10] & tmp[26] ^ tmp[80];
        tmp[80] &= tmp[10];
        tmp[103] = vector[29] & tmp[28] ^ tmp[87];
        tmp[104] = vector[21] ^ tmp[57];
        tmp[105] = vector[47] & tmp[82];
        tmp[106] = tmp[23] & ~tmp[34];
        tmp[107] = ~tmp[64];
        tmp[108] = tmp[64] ^ tmp[25] & tmp[63];
        tmp[109] = vector[31] & ~tmp[35];
        tmp[66] ^= tmp[92];
        tmp[110] = tmp[11] & tmp[84];
        tmp[111] = tmp[23] & tmp[85];
        tmp[112] = tmp[62] & tmp[85];
        tmp[85] &= tmp[61];
        tmp[113] = vector[29] & tmp[87];
        tmp[114] = tmp[75] ^ tmp[94];
        tmp[115] = vector[21] | tmp[90];
        tmp[116] = vector[19] & ~tmp[42];
        tmp[117] = tmp[27] & (tmp[44] ^ tmp[76]);
        tmp[118] = tmp[24] & tmp[101];
        tmp[119] = tmp[28] & (vector[13] & tmp[24]) ^ tmp[100];
        tmp[120] = tmp[10] & (tmp[54] | ~tmp[26]);
        tmp[121] = tmp[10] & ~tmp[55];
        tmp[122] = vector[37] & ~vector[13] ^ tmp[24] & (tmp[5] ^ tmp[7]);
        tmp[101] ^= tmp[24] & (vector[13] ^ tmp[5]);
        tmp[123] = vector[49] & (tmp[11] ^ tmp[59]);
        tmp[124] = vector[31] & tmp[107];
        tmp[107] &= tmp[29];
        tmp[125] = vector[29] & ~tmp[72];
        tmp[73] = tmp[38] & ~tmp[73];
        tmp[126] = tmp[67] ^ vector[41] & tmp[75];
        tmp[127] = vector[47] & ~tmp[82];
        tmp[128] = tmp[37] ^ tmp[106];
        tmp[129] = tmp[10] & ~tmp[89];
        tmp[130] = vector[21] ^ vector[37] ^ tmp[24] & ((vector[21] | tmp[6]) ^ tmp[57]);
        tmp[131] = tmp[29] & ~tmp[91];
        tmp[132] = tmp[27] & ((tmp[16] | tmp[76]) ^ tmp[116]);
        tmp[7] = tmp[17] ^ (vector[21] | tmp[7]) ^ tmp[24] & tmp[100];
        tmp[6] ^= (vector[21] | tmp[57]) ^ (vector[29] | vector[13] & tmp[21]);
        tmp[21] = tmp[5] ^ ((vector[29] | tmp[17] & tmp[21]) ^ tmp[90]);
        tmp[17] = tmp[54] ^ tmp[120];
        tmp[90] = tmp[23] & ~tmp[106];
        tmp[5] = tmp[81] & tmp[128];
        tmp[57] = tmp[81] & (tmp[70] ^ tmp[106]);
        tmp[100] = tmp[37] | tmp[90];
        tmp[24] = tmp[102] ^ (vector[9] | vector[25] ^ tmp[120]);
        tmp[133] = vector[31] ^ tmp[29] & ~tmp[124];
        tmp[134] = vector[47] & ~(tmp[58] ^ tmp[124]);
        tmp[135] = vector[37] ^ vector[53] & tmp[103] ^ vector[29] & ~tmp[73];
        tmp[18] = (tmp[38] | tmp[14] ^ tmp[48]) ^ (vector[7] ^ vector[15] & tmp[25]) ^ vector[23] & ~(vector[31] ^ (tmp[38] | vector[7] & tmp[18])) ^ (~vector[32] ^ tmp[29] & ~(tmp[38] & (tmp[2] & tmp[18]) ^ vector[23] & (tmp[2] & tmp[38])));
        tmp[46] = ~vector[50] ^ tmp[29] & (vector[23] & (vector[7] ^ (tmp[3] | tmp[38])) ^ (tmp[46] ^ (tmp[38] | tmp[46] ^ tmp[48]))) ^ (vector[23] & (vector[7] ^ tmp[38] & tmp[52]) ^ (tmp[2] ^ (vector[15] & tmp[52] ^ vector[61] & (tmp[3] ^ tmp[88]))));
        tmp[136] = ~tmp[18];
        tmp[137] = tmp[38] ^ (vector[53] & tmp[28] ^ (vector[29] ^ vector[37] & tmp[31])) ^ (~vector[22] ^ (vector[7] | vector[53] & tmp[9] ^ (tmp[96] ^ tmp[97]) ^ tmp[31] & (vector[53] & (tmp[38] ^ tmp[71]) ^ (tmp[8] ^ tmp[87]))));
        tmp[132] = vector[38] ^ (tmp[98] ^ tmp[27] & ~(tmp[11] ^ tmp[44]) ^ tmp[36] & ~(tmp[20] ^ vector[11] & tmp[51] ^ tmp[27] & (tmp[44] ^ tmp[51])) ^ tmp[23] & (tmp[0] ^ tmp[44] ^ tmp[132] ^ tmp[36] & (tmp[42] ^ tmp[44] ^ tmp[132])));
        tmp[138] = ~tmp[46];
        tmp[94] = vector[18] ^ (tmp[22] & (tmp[11] ^ (tmp[33] | tmp[114]) ^ (tmp[26] | tmp[33] & (tmp[59] ^ tmp[68]) ^ tmp[126])) ^ (vector[33] & (tmp[68] ^ tmp[95] ^ tmp[123]) ^ (tmp[67] ^ (tmp[30] | tmp[68]) ^ vector[49] & (tmp[94] ^ tmp[36] & ~tmp[68]))));
        tmp[79] = tmp[10] & tmp[54] ^ tmp[89] ^ ((tmp[39] | (vector[9] | tmp[26]) ^ tmp[79]) ^ (vector[40] ^ (vector[9] | tmp[10] & tmp[56]) ^ tmp[19] & ~(tmp[10] ^ tmp[54] ^ (tmp[39] | tmp[79] ^ vector[33] & tmp[49]))));
        tmp[117] = tmp[36] & (vector[35] | tmp[42] ^ (tmp[16] | tmp[42])) ^ (tmp[50] ^ (tmp[51] ^ tmp[27] & ~tmp[43])) ^ (~vector[42] ^ tmp[23] & ~(tmp[117] ^ tmp[36] & (vector[11] & vector[19] ^ tmp[117])));
        tmp[50] = tmp[27] & tmp[50] ^ (tmp[16] ^ tmp[116]) ^ tmp[36] & (tmp[20] ^ tmp[27] & ~tmp[98]) ^ (vector[44] ^ tmp[23] & (tmp[50] ^ tmp[27] & ~tmp[20] ^ tmp[36] & (tmp[43] ^ tmp[50] ^ tmp[27] & ~(tmp[0] ^ tmp[50]))));
        tmp[20] = tmp[130] ^ (vector[59] & tmp[6] ^ (~vector[52] ^ tmp[12] & (tmp[119] ^ (tmp[37] | tmp[7]))));
        tmp[88] = vector[23] & (vector[61] | tmp[25]) ^ ((vector[31] | tmp[38]) ^ tmp[3] & (vector[15] ^ tmp[13])) ^ (vector[28] ^ tmp[29] & ~(vector[23] & (vector[7] ^ tmp[14] & tmp[38]) ^ (tmp[3] ^ tmp[38] & (vector[31] ^ tmp[88]))));
        tmp[56] = ~vector[12] ^ (tmp[17] ^ tmp[15] & (tmp[55] ^ tmp[120]) ^ vector[63] & (tmp[26] ^ tmp[80] ^ (vector[9] | tmp[55] ^ tmp[10] & ~tmp[54])) ^ tmp[19] & (tmp[1] ^ tmp[102] ^ (tmp[39] | tmp[1] ^ (tmp[56] ^ tmp[121]))));
        tmp[55] = tmp[104] ^ tmp[118] ^ (vector[59] & tmp[21] ^ (~vector[34] ^ tmp[12] & ~(vector[59] & tmp[101] ^ (tmp[115] ^ tmp[122]))));
        tmp[1] = ~tmp[132];
        tmp[95] = tmp[114] ^ (vector[49] & (tmp[75] ^ tmp[95]) ^ ((tmp[26] | tmp[66] ^ tmp[123]) ^ (~vector[36] ^ tmp[22] & (vector[33] & (vector[49] & tmp[30] ^ tmp[66]) ^ (tmp[36] & (vector[49] & tmp[11]) ^ (tmp[67] ^ tmp[95]))))));
        tmp[66] = tmp[94] ^ tmp[55];
        tmp[99] = tmp[27] & (tmp[16] | tmp[43]) ^ (tmp[16] ^ tmp[76]) ^ tmp[36] & ~(vector[35] & tmp[98]) ^ (~vector[24] ^ tmp[23] & ~(tmp[36] & (tmp[27] & (tmp[43] ^ (vector[19] | tmp[16])) ^ (tmp[0] ^ tmp[99])) ^ (tmp[11] ^ (tmp[44] ^ vector[35] & (tmp[76] ^ tmp[99])))));
        tmp[76] = tmp[50] & tmp[88];
        tmp[43] = ~tmp[79];
        tmp[0] = tmp[94] & tmp[55];
        tmp[44] = tmp[94] | tmp[55];
        tmp[103] = (vector[45] | ~vector[53] & tmp[38] ^ tmp[113]) ^ (vector[53] & (tmp[87] ^ tmp[97]) ^ (vector[37] ^ vector[29] & ~tmp[87])) ^ (vector[4] ^ (vector[7] | vector[53] & tmp[31] & ~tmp[103] ^ vector[53] & ~(tmp[87] ^ vector[29] & ~tmp[96])));
        tmp[97] = ~tmp[117];
        tmp[98] = tmp[50] ^ tmp[88];
        tmp[7] = tmp[130] ^ (~vector[62] ^ tmp[37] & ~tmp[6] ^ tmp[12] & ~(tmp[119] ^ tmp[37] & ~tmp[7]));
        tmp[119] = ~tmp[55];
        tmp[92] = tmp[36] ^ tmp[93] ^ ((tmp[11] | tmp[33]) ^ ((tmp[26] | vector[49] & tmp[110] ^ (tmp[67] & tmp[84] ^ vector[41] & tmp[110])) ^ (~vector[0] ^ (vector[25] | vector[33] & (tmp[45] ^ tmp[123]) ^ (tmp[11] ^ vector[49] & (tmp[11] ^ tmp[92]))))));
        tmp[112] = ~vector[56] ^ (tmp[77] & (tmp[61] ^ tmp[81] & (tmp[60] ^ (tmp[37] | tmp[60]))) ^ (tmp[128] ^ (tmp[27] | tmp[60] ^ tmp[100])) ^ vector[43] & ~(tmp[23] ^ tmp[112] ^ tmp[5] ^ tmp[77] & (tmp[112] ^ tmp[57])));
        tmp[108] = vector[60] ^ (tmp[74] & (tmp[32] & (tmp[35] ^ tmp[63]) ^ tmp[108]) ^ (tmp[82] ^ vector[47] & ~(tmp[64] ^ tmp[29] & (vector[31] ^ tmp[35]))) ^ tmp[39] & ~(vector[47] & vector[55] ^ tmp[35] ^ (tmp[10] | tmp[108] ^ vector[47] & ~(tmp[29] ^ tmp[64]))));
        tmp[82] = tmp[55] & ~tmp[94];
        tmp[111] ^= ~vector[6] ^ ((tmp[12] | (tmp[27] | tmp[37] ^ tmp[62]) ^ tmp[100]) ^ (tmp[60] ^ (tmp[27] | tmp[85] ^ tmp[90])) ^ vector[43] & ~(tmp[23] ^ tmp[70] ^ tmp[5] ^ tmp[77] & (tmp[69] ^ tmp[78] ^ (tmp[27] | tmp[34] ^ tmp[111]))));
        tmp[70] = ~tmp[95];
        tmp[62] = tmp[56] & tmp[103];
        tmp[90] = tmp[95] | tmp[103];
        tmp[128] = ~tmp[99];
        tmp[84] = tmp[88] & ~tmp[50];
        tmp[6] = tmp[50] & ~tmp[88];
        tmp[49] = tmp[19] & (tmp[41] ^ (tmp[39] | tmp[26] ^ tmp[26] & tmp[49] ^ tmp[121])) ^ (tmp[24] ^ (~vector[30] ^ (tmp[39] | tmp[80] ^ tmp[15] & (tmp[26] ^ (vector[25] ^ tmp[129])))));
        tmp[4] = vector[26] ^ (tmp[24] ^ tmp[39] & ~((vector[9] | tmp[40] ^ tmp[89]) ^ tmp[17]) ^ tmp[19] & ~(tmp[41] ^ tmp[39] & (tmp[15] & (tmp[4] ^ tmp[10]) ^ (tmp[54] ^ tmp[129]))));
        tmp[129] = ~tmp[0];
        tmp[54] = tmp[44] & tmp[119];
        tmp[69] = vector[46] ^ (vector[43] & ~(tmp[83] ^ tmp[57] ^ tmp[77] & (tmp[34] ^ tmp[69] ^ tmp[5])) ^ (tmp[83] ^ tmp[27] & (tmp[23] ^ vector[59] & tmp[34]) ^ (tmp[12] | tmp[60] ^ tmp[69] ^ tmp[81] & (tmp[106] ^ tmp[100]))));
        tmp[78] = ~vector[20] ^ ((tmp[12] | tmp[27] & tmp[34]) ^ (tmp[34] ^ (tmp[23] ^ (tmp[27] ^ tmp[37]))) ^ vector[43] & ~((tmp[27] | tmp[61]) ^ tmp[85] ^ (tmp[12] | tmp[78] ^ (tmp[27] | tmp[78]) ^ tmp[100])));
        tmp[100] = tmp[132] | tmp[108];
        tmp[61] = tmp[132] & tmp[108];
        tmp[85] = tmp[1] & tmp[108];
        tmp[106] = tmp[108] | tmp[111];
        tmp[5] = tmp[98] | tmp[111];
        tmp[81] = tmp[50] & tmp[111];
        tmp[60] = ~tmp[7];
        tmp[2] = vector[23] & (vector[15] & tmp[13] ^ (vector[15] ^ vector[31] | tmp[38])) ^ (vector[15] ^ (tmp[14] ^ tmp[86] & (vector[31] ^ tmp[47])) ^ (vector[54] ^ tmp[29] & ~(tmp[86] & (tmp[47] ^ tmp[53]) ^ (tmp[48] ^ vector[7] & tmp[52]) ^ vector[23] & ~(vector[15] & ~tmp[14] ^ (tmp[2] ^ (tmp[38] | vector[15] ^ tmp[2]))))));
        tmp[101] = vector[48] ^ (tmp[104] ^ (tmp[118] ^ (tmp[37] & ~tmp[21] ^ tmp[12] & ~(tmp[122] ^ (tmp[115] ^ tmp[37] & tmp[101])))));
        tmp[115] = ~tmp[92];
        tmp[134] = ~vector[10] ^ (tmp[35] ^ tmp[105] ^ tmp[74] & (vector[47] & tmp[131] ^ tmp[133]) ^ tmp[39] & (tmp[91] ^ (tmp[63] ^ (tmp[134] ^ (tmp[10] | tmp[107] ^ vector[47] & (vector[31] & tmp[29] ^ tmp[109]))))));
        tmp[63] = ~tmp[108];
        tmp[122] = tmp[132] ^ tmp[108];
        tmp[21] = tmp[56] & tmp[70];
        tmp[118] = tmp[103] & tmp[70];
        tmp[104] = ~tmp[111];
        tmp[45] = tmp[68] ^ (tmp[93] ^ ((tmp[33] | tmp[59] ^ tmp[67]) ^ ((tmp[26] | tmp[123] ^ (tmp[67] ^ (tmp[30] | tmp[75]))) ^ (~vector[14] ^ (vector[25] | vector[33] & (vector[49] & (tmp[11] ^ tmp[45]) ^ tmp[126]) ^ (tmp[67] ^ tmp[93] ^ vector[49] & (tmp[45] ^ tmp[110])))))));
        tmp[110] = tmp[111] | tmp[6];
        tmp[93] = tmp[55] | tmp[4];
        tmp[67] = tmp[138] & tmp[4];
        tmp[126] = tmp[46] & tmp[4];
        tmp[75] = tmp[66] | tmp[4];
        tmp[123] = tmp[55] & tmp[129];
        tmp[59] = tmp[4] | tmp[54];
        tmp[68] = tmp[92] | tmp[69];
        tmp[14] = tmp[111] | tmp[100];
        tmp[52] = tmp[111] | tmp[85];
        tmp[53] = tmp[95] & ~tmp[103];
        tmp[47] = tmp[92] & tmp[2];
        tmp[48] = ~tmp[49];
        tmp[86] = ~tmp[4];
        tmp[77] = tmp[18] | tmp[101];
        tmp[57] = tmp[2] & tmp[115];
        tmp[115] &= tmp[69];
        tmp[83] = tmp[132] & tmp[63];
        tmp[15] = tmp[88] & tmp[104];
        tmp[89] = tmp[84] & tmp[104];
        tmp[40] = tmp[100] & tmp[104];
        tmp[17] = tmp[85] & tmp[104];
        tmp[41] = ~tmp[101];
        tmp[24] = tmp[18] ^ tmp[101];
        tmp[80] = tmp[2] & tmp[68];
        tmp[121] = ~tmp[134];
        tmp[130] = tmp[95] ^ tmp[21];
        tmp[22] = tmp[56] & tmp[53];
        tmp[114] = tmp[56] & ~tmp[90];
        tmp[113] = vector[53] ^ (tmp[125] ^ (tmp[73] ^ ((vector[45] | tmp[71] ^ tmp[96] ^ vector[53] & tmp[113]) ^ (~vector[16] ^ tmp[13] & (vector[53] & (vector[37] ^ tmp[8]) ^ (tmp[9] ^ tmp[113]) ^ tmp[31] & (tmp[72] ^ tmp[28] & tmp[71] ^ vector[53] & (vector[37] ^ tmp[113])))))));
        tmp[71] = tmp[50] & ~tmp[6];
        tmp[28] = tmp[76] ^ tmp[110];
        tmp[72] = tmp[55] & tmp[86];
        tmp[8] = tmp[46] ^ tmp[126];
        tmp[9] = tmp[82] & tmp[86];
        tmp[96] = tmp[92] & ~tmp[69];
        tmp[13] = tmp[111] | tmp[83];
        tmp[73] = tmp[104] & tmp[83];
        tmp[120] = ~tmp[53];
        tmp[102] = tmp[47] ^ tmp[115];
        tmp[3] = tmp[77] & tmp[41];
        tmp[25] = tmp[92] ^ tmp[57];
        tmp[58] = vector[31] ^ tmp[107] ^ (vector[47] & (tmp[65] | ~tmp[29]) ^ ((tmp[10] | vector[55] & tmp[29] ^ tmp[124] ^ vector[47] & (vector[31] ^ tmp[131])) ^ (vector[58] ^ tmp[39] & (tmp[91] ^ tmp[127] ^ (tmp[10] | vector[47] & ~(tmp[58] ^ tmp[64]) ^ tmp[133])))));
        tmp[124] = ~vector[8] ^ (tmp[35] ^ tmp[29] & tmp[64] ^ tmp[127] ^ (tmp[10] | tmp[32] & (tmp[64] ^ tmp[29] & tmp[109])) ^ tmp[39] & ~(tmp[105] ^ (vector[31] ^ tmp[29] & tmp[65]) ^ tmp[74] & (tmp[131] ^ (tmp[64] ^ vector[47] & ~(tmp[29] ^ tmp[124])))));
        tmp[64] = tmp[83] ^ tmp[40];
        tmp[65] = tmp[61] ^ tmp[17];
        tmp[131] = tmp[85] ^ tmp[17];
        tmp[135] = vector[29] ^ (tmp[87] ^ (vector[53] & (tmp[38] ^ tmp[125]) ^ ((vector[45] | tmp[135]) ^ (vector[2] ^ (vector[7] | tmp[125] ^ tmp[31] & tmp[135])))));
        tmp[31] = tmp[99] & tmp[113];
        tmp[125] = tmp[99] | tmp[113];
        tmp[87] = tmp[128] & tmp[113];
        tmp[109] = tmp[2] & ~tmp[68];
        tmp[74] = tmp[2] & tmp[96];
        tmp[105] = ~tmp[113];
        tmp[32] = tmp[113] ^ tmp[124];
        tmp[127] = tmp[99] ^ tmp[113];
        tmp[133] = tmp[5] ^ tmp[71];
        tmp[91] = tmp[69] & ~tmp[115];
        tmp[107] = tmp[96] ^ tmp[109];
        tmp[116] = tmp[57] ^ tmp[96];
        tmp[42] = tmp[46] & tmp[58];
        tmp[51] = tmp[46] | tmp[58];
        tmp[139] = tmp[99] | tmp[124];
        tmp[140] = tmp[132] & ~tmp[83];
        tmp[141] = tmp[63] & (tmp[88] ^ tmp[15]);
        tmp[142] = tmp[18] | tmp[135];
        tmp[143] = tmp[101] | tmp[135];
        tmp[144] = tmp[99] | tmp[101] | tmp[135];
        tmp[145] = ~(tmp[94] & tmp[119] ^ tmp[93]) & tmp[135];
        tmp[146] = tmp[124] | tmp[125];
        tmp[147] = ~tmp[58];
        tmp[148] = tmp[46] ^ tmp[58];
        tmp[149] = ~tmp[124];
        tmp[150] = ~tmp[135];
        tmp[151] = tmp[18] ^ tmp[135];
        tmp[152] = tmp[99] & tmp[105];
        tmp[153] = tmp[135] | tmp[101] & ~(tmp[18] & tmp[101]);
        tmp[154] = tmp[4] & (tmp[138] & tmp[58]);
        tmp[155] = tmp[4] & tmp[51];
        tmp[156] = tmp[138] & tmp[51];
        tmp[157] = ~tmp[42];
        tmp[158] = tmp[4] & tmp[147];
        tmp[159] = tmp[46] & tmp[147];
        tmp[160] = tmp[4] & tmp[148];
        tmp[161] = tmp[125] & tmp[149];
        tmp[162] = tmp[99] & tmp[149];
        tmp[163] = tmp[139] ^ tmp[152];
        tmp[164] = tmp[101] & tmp[150];
        tmp[165] = tmp[24] & tmp[150];
        tmp[166] = tmp[18] ^ (tmp[24] | tmp[135]);
        tmp[167] = tmp[18] ^ tmp[142];
        tmp[168] = tmp[18] ^ tmp[143];
        tmp[169] = tmp[113] & ~tmp[31];
        tmp[170] = tmp[4] ^ tmp[148];
        tmp[171] = tmp[69] ^ (tmp[92] ^ tmp[109]);
        tmp[172] = tmp[132] & ~tmp[116];
        tmp[173] = tmp[46] & tmp[157];
        tmp[174] = tmp[4] & tmp[159];
        tmp[14] = vector[29] ^ tmp[45] & (tmp[49] | tmp[85] ^ tmp[52]) ^ (tmp[48] & (tmp[85] ^ tmp[14]) ^ tmp[64] ^ (tmp[137] | tmp[122] ^ tmp[14] ^ tmp[61] & tmp[48]));
        tmp[85] = tmp[132] & ~(tmp[69] ^ tmp[25]);
        tmp[175] = tmp[58] ^ tmp[158];
        tmp[176] = tmp[51] ^ tmp[158];
        tmp[177] = tmp[4] & ~tmp[148];
        tmp[178] = tmp[113] ^ tmp[162];
        tmp[179] = tmp[125] ^ tmp[162];
        tmp[180] = tmp[101] ^ tmp[164];
        tmp[181] = tmp[101] ^ tmp[166];
        tmp[182] = tmp[94] & tmp[86] ^ (tmp[44] ^ ~tmp[54] & tmp[135]);
        tmp[51] ^= tmp[174];
        tmp[183] = ~tmp[14];
        tmp[184] = tmp[103] ^ tmp[56] & tmp[90] ^ tmp[78] & ~(tmp[90] ^ tmp[21]) ^ tmp[88] & ~(tmp[53] ^ tmp[22] ^ tmp[78] & tmp[130]);
        tmp[185] = tmp[156] ^ tmp[177];
        tmp[120] = tmp[130] ^ tmp[78] & (tmp[90] ^ tmp[56] & tmp[120]) ^ tmp[88] & ~(tmp[78] & ~(tmp[56] ^ tmp[118]) ^ (tmp[62] ^ tmp[95] & tmp[120]));
        tmp[21] = tmp[95] ^ tmp[62] ^ tmp[78] & (tmp[90] ^ tmp[114]) ^ tmp[88] & ~(tmp[22] ^ tmp[78] & ~(tmp[21] ^ tmp[53]));
        tmp[15] = (tmp[108] | tmp[15]) ^ (tmp[88] ^ (tmp[50] ^ (tmp[50] | (tmp[88] | tmp[111])))) ^ (tmp[95] | tmp[98] & tmp[104] ^ (tmp[50] ^ tmp[63] & tmp[15])) ^ (vector[23] ^ (tmp[20] | tmp[70] & tmp[106] ^ (tmp[111] ^ tmp[108] & ~tmp[110])));
        tmp[81] = tmp[81] & tmp[63] ^ (tmp[84] ^ tmp[110]) ^ ((tmp[95] | tmp[63] & (tmp[84] ^ tmp[89])) ^ (tmp[11] ^ ~tmp[20] & ((tmp[108] | tmp[81]) ^ tmp[70] & (tmp[111] & tmp[6] ^ tmp[88] & tmp[63]))));
        tmp[53] = tmp[78] & (tmp[103] ^ tmp[56] & ~tmp[118]) ^ (tmp[103] ^ tmp[114] ^ tmp[88] & ~(tmp[62] ^ tmp[78] & (tmp[56] ^ tmp[53])));
        tmp[62] = ~tmp[15];
        tmp[118] = ~tmp[81];
        tmp[40] = tmp[106] ^ (tmp[140] ^ (tmp[49] | tmp[100] ^ (tmp[111] | tmp[122]))) ^ (~tmp[137] & (tmp[122] & tmp[104] ^ (tmp[49] | tmp[108] ^ tmp[13])) ^ (tmp[34] ^ tmp[45] & ~(tmp[40] ^ (tmp[49] | tmp[83] ^ tmp[108] & tmp[104]))));
        tmp[89] = tmp[111] ^ (tmp[6] ^ (tmp[108] | tmp[50] ^ (tmp[111] | tmp[71]))) ^ (tmp[70] & (tmp[63] & (tmp[98] ^ tmp[110]) ^ tmp[133]) ^ (tmp[19] ^ (tmp[20] | (tmp[95] | tmp[28]) ^ ((tmp[50] | tmp[111]) ^ tmp[63] & (tmp[76] ^ tmp[89])))));
        tmp[27] ^= tmp[21] ^ (tmp[58] | tmp[53]);
        tmp[147] = tmp[184] ^ (vector[53] ^ tmp[147] & tmp[120]);
        tmp[76] = ~tmp[89];
        tmp[152] = (tmp[18] | tmp[60] & tmp[124]) ^ (tmp[127] ^ tmp[152] & (tmp[7] & tmp[149])) ^ (vector[13] ^ tmp[92] & (tmp[32] ^ tmp[7] & tmp[162] ^ (tmp[18] | (tmp[7] | tmp[163]) ^ tmp[178])));
        tmp[63] = ~tmp[27];
        tmp[98] = ~tmp[147];
        tmp[120] = tmp[184] ^ (tmp[39] ^ tmp[58] & ~tmp[120]);
        tmp[53] = tmp[33] ^ (tmp[21] ^ tmp[58] & tmp[53]);
        tmp[178] = tmp[7] ^ (tmp[31] ^ tmp[139]) ^ tmp[136] & (tmp[99] ^ tmp[146] ^ tmp[7] & (tmp[169] ^ (tmp[124] | tmp[169]))) ^ (tmp[30] ^ tmp[92] & ~(tmp[178] ^ tmp[136] & ((tmp[7] | tmp[113]) ^ tmp[162])));
        tmp[104] = tmp[131] ^ tmp[49] & ~tmp[73] ^ (tmp[45] & ~(tmp[48] & tmp[73] ^ (tmp[61] ^ tmp[13])) ^ (tmp[35] ^ (tmp[137] | tmp[64] ^ (tmp[48] & (tmp[83] ^ tmp[17]) ^ tmp[45] & ((tmp[132] | tmp[49]) ^ tmp[132] & tmp[104] ^ tmp[140])))));
        tmp[141] = tmp[111] ^ (tmp[6] ^ tmp[108] & tmp[133]) ^ ((tmp[95] | tmp[28] ^ tmp[141]) ^ (tmp[12] ^ (tmp[20] | tmp[108] & (tmp[88] ^ (tmp[50] ^ tmp[5])) ^ tmp[70] & (tmp[110] ^ (tmp[88] ^ tmp[141])))));
        tmp[131] = tmp[100] ^ (tmp[45] & ~(tmp[49] & tmp[65]) ^ (tmp[52] ^ (tmp[48] & tmp[131] ^ (tmp[26] ^ (tmp[137] | tmp[45] & (tmp[108] ^ tmp[106]) ^ (tmp[65] ^ (tmp[49] | tmp[131])))))));
        tmp[106] = tmp[81] | tmp[53];
        tmp[47] = (tmp[7] | tmp[1] & tmp[96] ^ tmp[107]) ^ (tmp[91] ^ tmp[132] & ~(tmp[69] ^ tmp[80])) ^ (vector[9] ^ tmp[49] & ~((tmp[132] | tmp[80]) ^ tmp[107] ^ (tmp[7] | (tmp[132] | tmp[92] ^ tmp[47]) ^ tmp[171])));
        tmp[107] = tmp[118] & tmp[178];
        tmp[65] = tmp[81] & tmp[178];
        tmp[26] = tmp[81] | tmp[178];
        tmp[48] = ~tmp[120];
        tmp[52] = ~tmp[53];
        tmp[100] = tmp[81] ^ tmp[178];
        tmp[139] = tmp[124] ^ tmp[127] ^ tmp[7] & ((tmp[113] | tmp[124]) ^ tmp[169]) ^ tmp[136] & (tmp[179] ^ tmp[7] & ~(tmp[125] ^ tmp[161])) ^ (tmp[23] ^ tmp[92] & ((tmp[18] | tmp[7] & (tmp[124] ^ tmp[125]) ^ tmp[179]) ^ (tmp[99] ^ tmp[139] ^ tmp[7] & ~(tmp[99] ^ tmp[113] & tmp[149]))));
        tmp[179] = ~tmp[141];
        tmp[118] &= tmp[131];
        tmp[127] = tmp[120] | tmp[131];
        tmp[151] ^= tmp[99] & ~tmp[181] ^ (tmp[112] & (tmp[43] & (tmp[99] & ~tmp[151]) ^ (tmp[166] ^ tmp[128] & tmp[181])) ^ (vector[15] ^ (tmp[79] | tmp[18] ^ (tmp[153] ^ (tmp[99] | tmp[77] ^ tmp[153])))));
        tmp[44] = tmp[4] ^ (tmp[0] ^ (tmp[66] & tmp[135] ^ ((tmp[134] | tmp[182]) ^ (vector[43] ^ tmp[112] & (tmp[121] & (tmp[44] ^ tmp[75] ^ tmp[145]) ^ ((tmp[44] | tmp[4]) ^ (tmp[54] ^ tmp[145])))))));
        tmp[145] = tmp[131] & tmp[47];
        tmp[181] = tmp[131] | tmp[47];
        tmp[166] = tmp[131] & tmp[107];
        tmp[23] = tmp[131] & tmp[65];
        tmp[5] = tmp[131] ^ tmp[47];
        tmp[110] = tmp[131] ^ tmp[127];
        tmp[70] = tmp[81] & tmp[52];
        tmp[42] = tmp[170] ^ tmp[119] & tmp[176] ^ (tmp[103] & ~(tmp[55] & (tmp[148] ^ tmp[155]) ^ tmp[185]) ^ (tmp[36] ^ (tmp[117] | tmp[4] ^ (tmp[55] | tmp[175]) ^ tmp[103] & (tmp[42] ^ tmp[154] ^ tmp[55] & (tmp[46] ^ tmp[160])))));
        tmp[36] = ~tmp[107];
        tmp[28] = tmp[26] ^ tmp[23];
        tmp[133] = tmp[81] & ~tmp[178];
        tmp[163] = tmp[125] & tmp[105] ^ tmp[161] ^ tmp[7] & ~(tmp[87] ^ tmp[146]) ^ (tmp[18] | tmp[87] & tmp[149] ^ tmp[169] ^ tmp[7] & ~(tmp[99] ^ tmp[161])) ^ (vector[31] ^ tmp[92] & ~(tmp[162] ^ tmp[7] & (tmp[99] ^ tmp[124]) ^ tmp[136] & (tmp[32] ^ tmp[7] & ~tmp[163])));
        tmp[32] = tmp[14] & tmp[179];
        tmp[77] = (tmp[99] | tmp[165]) ^ tmp[180] ^ ((tmp[79] | tmp[167] ^ tmp[99] & (tmp[18] & tmp[41] & tmp[150])) ^ (vector[19] ^ tmp[112] & ~(tmp[128] & (tmp[77] ^ (tmp[77] | tmp[135])) ^ tmp[43] & ((tmp[99] | tmp[168]) ^ (tmp[18] ^ tmp[165])))));
        tmp[41] = tmp[141] & tmp[44];
        tmp[161] = tmp[48] & tmp[181];
        tmp[177] = tmp[97] & (tmp[103] & (tmp[4] & tmp[58] ^ tmp[159] ^ tmp[55] & (tmp[148] ^ tmp[158])) ^ (tmp[138] & (tmp[4] ^ tmp[58]) ^ tmp[55] & ~tmp[160])) ^ (vector[7] ^ (tmp[170] ^ tmp[55] & (tmp[4] & tmp[157]) ^ tmp[103] & ~(tmp[46] ^ tmp[154] ^ tmp[55] & ~tmp[177])));
        tmp[154] = tmp[47] & ~tmp[131];
        tmp[167] = tmp[168] ^ (tmp[128] & (tmp[24] ^ tmp[142]) ^ (tmp[43] & (tmp[99] | tmp[18] ^ tmp[153]) ^ (tmp[10] ^ tmp[112] & ~(tmp[144] ^ (tmp[3] ^ (tmp[3] | tmp[135])) ^ tmp[43] & (tmp[144] ^ tmp[167])))));
        tmp[142] = tmp[168] ^ (tmp[99] & ~tmp[180] ^ (tmp[43] & (tmp[101] ^ (tmp[153] ^ tmp[128] & (tmp[3] ^ tmp[142]))) ^ (vector[37] ^ tmp[112] & ~(tmp[164] ^ (tmp[99] | tmp[101] ^ tmp[143]) ^ (tmp[79] | tmp[101] ^ (tmp[128] & tmp[142] ^ tmp[165]))))));
        tmp[128] = tmp[131] & ~tmp[47];
        tmp[165] = tmp[23] ^ tmp[133];
        tmp[143] = tmp[81] ^ tmp[23];
        tmp[164] = ~tmp[104] & tmp[163];
        tmp[3] = tmp[104] & tmp[163];
        tmp[153] = tmp[104] | tmp[163];
        tmp[43] = tmp[120] | tmp[163];
        tmp[180] = tmp[48] & tmp[163];
        tmp[168] = tmp[27] & tmp[77];
        tmp[144] = tmp[27] | tmp[77];
        tmp[9] ^= tmp[54] ^ ((tmp[129] | tmp[86]) & tmp[135] ^ (tmp[121] & (tmp[4] ^ tmp[135] & ~(tmp[54] ^ tmp[72])) ^ (vector[25] ^ tmp[112] & ~(tmp[123] ^ (tmp[135] & ~(tmp[0] ^ (tmp[4] | tmp[123])) ^ tmp[121] & (tmp[9] ^ ~(tmp[55] ^ tmp[4]) & tmp[135]))))));
        tmp[80] = tmp[116] ^ (tmp[1] & tmp[102] ^ (tmp[60] & (tmp[171] ^ tmp[85]) ^ (tmp[37] ^ tmp[49] & ((tmp[132] | tmp[115] ^ tmp[2] & ~tmp[91]) ^ (tmp[57] ^ (tmp[115] ^ tmp[60] & (tmp[132] & (tmp[57] ^ tmp[115]) ^ (tmp[69] ^ (tmp[92] ^ tmp[80])))))))));
        tmp[57] = ~tmp[42];
        tmp[91] = ~tmp[163];
        tmp[171] = tmp[163] ^ tmp[43];
        tmp[37] = tmp[120] ^ tmp[163];
        tmp[116] = tmp[104] ^ tmp[163];
        tmp[129] = tmp[120] | tmp[154];
        tmp[10] = tmp[48] & tmp[154];
        tmp[24] = tmp[27] ^ tmp[77];
        tmp[158] = tmp[14] | tmp[142];
        tmp[121] = (tmp[134] | ~tmp[93] & tmp[135]) ^ (tmp[123] ^ (tmp[59] ^ (tmp[135] & ~(tmp[54] ^ tmp[66] & tmp[86]) ^ (vector[45] ^ tmp[112] & ~((tmp[0] ^ (tmp[0] | tmp[4])) & tmp[135] ^ (tmp[0] ^ tmp[121] & tmp[135] & ~(tmp[55] ^ tmp[72])))))));
        tmp[25] ^= tmp[132] & (tmp[68] ^ tmp[2] & ~tmp[96]) ^ ((tmp[7] | tmp[1] & tmp[115] ^ tmp[74]) ^ (tmp[38] ^ tmp[49] & ~(tmp[85] ^ (tmp[69] & tmp[2] ^ tmp[60] & (tmp[115] & ~tmp[2] ^ tmp[132] & ~tmp[25])))));
        tmp[148] = tmp[155] ^ tmp[159] ^ (tmp[55] & ~(tmp[46] ^ tmp[4] & ~tmp[156]) ^ (tmp[103] & ~(tmp[8] ^ tmp[119] & (tmp[159] ^ tmp[174])) ^ (vector[47] ^ tmp[97] & (tmp[176] ^ tmp[55] & ~tmp[175] ^ tmp[103] & ~(tmp[67] ^ tmp[173] ^ tmp[55] & ~(tmp[67] ^ tmp[148]))))));
        tmp[67] = ~tmp[177];
        tmp[175] = tmp[120] | tmp[164];
        tmp[174] = tmp[48] & tmp[3];
        tmp[159] = tmp[48] & tmp[153];
        tmp[176] = tmp[120] | tmp[153];
        tmp[119] = tmp[131] ^ tmp[48] & tmp[5];
        tmp[156] = ~tmp[167];
        tmp[97] = tmp[63] & tmp[144];
        tmp[155] = ~tmp[142];
        tmp[85] = tmp[141] | tmp[80];
        tmp[1] = tmp[179] & tmp[80];
        tmp[38] = tmp[141] & tmp[80];
        tmp[68] = tmp[41] & tmp[80];
        tmp[66] = tmp[44] & tmp[80];
        tmp[54] = tmp[104] & tmp[91];
        tmp[93] = tmp[27] & ~tmp[77];
        tmp[72] = (tmp[134] | tmp[94] & tmp[150]) ^ (tmp[182] ^ (tmp[29] ^ tmp[112] & ~(tmp[75] ^ tmp[123] ^ tmp[135] & (tmp[82] ^ tmp[0] & tmp[86]) ^ (tmp[134] | tmp[55] ^ (tmp[94] ^ (tmp[59] ^ tmp[135] & (tmp[55] ^ (tmp[94] ^ tmp[72]))))))));
        tmp[59] = tmp[14] & tmp[121];
        tmp[86] = tmp[14] | tmp[121];
        tmp[0] = tmp[142] | tmp[121];
        tmp[82] = ~tmp[9];
        tmp[123] = ~tmp[80];
        tmp[75] = tmp[141] ^ tmp[80];
        tmp[51] = tmp[55] & ~tmp[126] ^ (tmp[185] ^ (tmp[103] & (tmp[55] & tmp[4] ^ tmp[51]) ^ (vector[21] ^ (tmp[117] | tmp[160] ^ (tmp[55] & tmp[8] ^ tmp[173]) ^ tmp[103] & ~(tmp[55] & (tmp[46] ^ tmp[4]) ^ tmp[51])))));
        tmp[8] = tmp[133] ^ tmp[131] & ~tmp[100];
        tmp[173] = tmp[14] ^ tmp[158];
        tmp[160] = tmp[14] ^ tmp[121];
        tmp[126] = ~tmp[25];
        tmp[185] = tmp[44] & tmp[85];
        tmp[29] = ~tmp[148];
        tmp[150] = tmp[27] & ~tmp[168];
        tmp[182] = tmp[25] | tmp[72];
        tmp[157] = tmp[177] | tmp[72];
        tmp[138] = tmp[67] & tmp[72];
        tmp[170] = tmp[177] & tmp[72];
        tmp[136] = tmp[142] | tmp[59];
        tmp[162] = tmp[142] | tmp[86];
        tmp[149] = tmp[85] & tmp[123];
        tmp[87] = ~tmp[38];
        tmp[146] = tmp[14] | tmp[51];
        tmp[169] = tmp[14] & tmp[51];
        tmp[105] = tmp[179] & tmp[51];
        tmp[125] = tmp[141] | tmp[51];
        tmp[12] = tmp[177] ^ tmp[72];
        tmp[6] = tmp[14] & ~tmp[121];
        tmp[140] = tmp[0] ^ tmp[183] & tmp[86];
        tmp[17] = tmp[51] ^ tmp[125];
        tmp[83] = tmp[14] ^ tmp[51];
        tmp[67] &= tmp[157];
        tmp[13] = tmp[126] & tmp[138];
        tmp[61] = tmp[126] & tmp[170];
        tmp[73] = tmp[25] | tmp[170];
        tmp[64] = tmp[44] & ~tmp[85];
        tmp[35] = tmp[44] & tmp[87];
        tmp[87] &= tmp[80];
        tmp[31] = tmp[183] & tmp[146];
        tmp[30] = tmp[179] & tmp[169];
        tmp[21] = tmp[104] & ~tmp[54];
        tmp[33] = tmp[14] & ~tmp[59];
        tmp[39] = tmp[41] ^ tmp[141] & tmp[123];
        tmp[184] = tmp[141] ^ tmp[146];
        tmp[71] = tmp[32] ^ tmp[146];
        tmp[125] ^= tmp[169];
        tmp[19] = (tmp[14] | tmp[141]) ^ tmp[183] & tmp[51];
        tmp[122] = tmp[25] | tmp[67];
        tmp[34] = tmp[14] & (tmp[121] ^ tmp[155]) ^ (tmp[147] | tmp[142] ^ tmp[59]);
        tmp[172] ^= tmp[102] ^ ((tmp[7] | tmp[96] ^ tmp[74] ^ tmp[132] & ~tmp[102]) ^ (tmp[16] ^ tmp[49] & ~(tmp[96] ^ (tmp[109] ^ (tmp[132] & (tmp[115] ^ tmp[109]) ^ tmp[60] & (tmp[96] ^ (tmp[74] ^ tmp[172])))))));
        tmp[74] = tmp[141] ^ tmp[83];
        tmp[96] = tmp[120] | tmp[21];
        tmp[109] = tmp[177] & ~tmp[170];
        tmp[115] = tmp[44] & ~tmp[149];
        tmp[60] = tmp[31] ^ (tmp[141] | tmp[83]);
        tmp[32] ^= tmp[31];
        tmp[102] = tmp[14] ^ tmp[30];
        tmp[16] = tmp[120] ^ tmp[21];
        tmp[114] = tmp[80] ^ tmp[44] & ~tmp[75];
        tmp[84] = tmp[27] | tmp[172];
        tmp[11] = tmp[146] ^ tmp[179] & tmp[83];
        tmp[22] = ~tmp[172];
        tmp[90] = tmp[27] ^ tmp[172];
        tmp[31] = tmp[83] ^ (tmp[141] | tmp[31]);
        tmp[83] = tmp[138] ^ tmp[177] & (tmp[126] & ~tmp[72]);
        tmp[169] = tmp[179] & tmp[146] ^ tmp[14] & ~tmp[169];
        tmp[130] = tmp[77] & tmp[22];
        tmp[186] = tmp[93] & tmp[22];
        tmp[187] = tmp[27] & tmp[22];
        tmp[188] = tmp[97] ^ tmp[84];
        tmp[189] = tmp[57] & tmp[188];
        tmp[190] = tmp[168] ^ tmp[130];
        tmp[191] = tmp[93] ^ tmp[186];
        tmp[192] = tmp[27] ^ tmp[187];
        tmp[92] ^= tmp[131] ^ tmp[100] ^ tmp[70] ^ tmp[42] & ~(tmp[52] & tmp[118] ^ (tmp[133] ^ tmp[131] & ~tmp[26])) ^ tmp[82] & (tmp[42] & (tmp[133] & ~tmp[52]) ^ (tmp[8] ^ (tmp[53] | tmp[23] ^ tmp[178] & tmp[36])));
        tmp[79] ^= (tmp[131] | tmp[9]) ^ (tmp[145] ^ tmp[156] & (tmp[127] ^ tmp[128] & tmp[82])) ^ (tmp[161] ^ (tmp[89] | tmp[9] & (tmp[181] ^ tmp[10]) ^ (tmp[131] ^ (tmp[127] ^ (tmp[110] | tmp[167])))));
        tmp[193] = tmp[57] & tmp[191];
        tmp[194] = tmp[57] & tmp[192];
        tmp[28] = tmp[131] ^ tmp[26] ^ (tmp[53] | tmp[107] ^ tmp[23]) ^ (tmp[42] & ~(tmp[53] & tmp[26] ^ tmp[165]) ^ (tmp[95] ^ tmp[82] & (tmp[42] & ~(tmp[106] ^ tmp[28]) ^ (tmp[28] ^ tmp[53] & ~(tmp[81] ^ tmp[178] & tmp[131])))));
        tmp[34] = tmp[147] ^ (tmp[142] ^ tmp[86]) ^ tmp[126] & tmp[34] ^ (tmp[137] ^ tmp[177] & ((tmp[147] | tmp[142]) ^ tmp[140] ^ (tmp[25] | tmp[34])));
        tmp[137] = ~tmp[92];
        tmp[38] = tmp[111] ^ tmp[27] & (tmp[40] & (tmp[41] ^ tmp[139] & (tmp[141] ^ tmp[44] ^ tmp[80])) ^ (tmp[141] ^ tmp[35]) ^ tmp[139] & ~(tmp[185] ^ tmp[149])) ^ (tmp[139] & ~(tmp[38] ^ tmp[35]) ^ (tmp[66] ^ tmp[75] ^ tmp[40] & ~(tmp[141] ^ tmp[185] ^ tmp[139] & (tmp[44] ^ tmp[38]))));
        tmp[185] = ~tmp[34];
        tmp[70] = (tmp[9] | tmp[8] ^ ((tmp[53] | tmp[26] ^ tmp[166]) ^ tmp[42] & (tmp[106] ^ tmp[8]))) ^ ((tmp[53] | tmp[165]) ^ (tmp[107] ^ tmp[131] & tmp[100] ^ (tmp[45] ^ tmp[42] & ~(tmp[70] ^ tmp[8]))));
        tmp[56] ^= tmp[47] ^ tmp[127] ^ (tmp[82] & (tmp[131] ^ tmp[10]) ^ (tmp[76] & (tmp[131] ^ (tmp[9] | tmp[119]) ^ tmp[156] & (tmp[127] ^ tmp[110] & tmp[9])) ^ (tmp[167] | (tmp[120] | tmp[181]) ^ tmp[128] ^ tmp[82] & (tmp[131] ^ (tmp[120] | tmp[47] & ~tmp[154])))));
        tmp[158] = tmp[140] ^ (tmp[25] | tmp[33]) ^ (tmp[147] & ~(tmp[6] ^ (tmp[142] | tmp[33])) ^ (tmp[103] ^ tmp[177] & ~(tmp[98] & ((tmp[158] ^ tmp[121]) & tmp[126] ^ tmp[142] & tmp[6]))));
        tmp[20] ^= tmp[152] & (tmp[184] ^ tmp[123] & tmp[71] ^ tmp[142] & ((tmp[80] | tmp[17]) ^ tmp[19])) ^ (tmp[125] ^ (tmp[80] | tmp[31]) ^ tmp[142] & ~(tmp[105] ^ tmp[123] & tmp[30]));
        tmp[133] = tmp[178] & (tmp[131] ^ tmp[36]) ^ ((tmp[53] | tmp[143]) ^ (tmp[42] & ~(tmp[65] & tmp[52] ^ (tmp[178] ^ tmp[166])) ^ (tmp[94] ^ (tmp[9] | tmp[131] & tmp[133] ^ tmp[52] & tmp[143] ^ tmp[42] & ((tmp[53] | tmp[118] ^ tmp[133]) ^ tmp[8])))));
        tmp[118] = tmp[38] ^ tmp[20];
        tmp[8] = ~tmp[38];
        tmp[170] = tmp[91] & tmp[157] ^ tmp[73] ^ (tmp[109] ^ ((tmp[15] | tmp[170] ^ (tmp[163] | tmp[182]) ^ tmp[122]) ^ (tmp[88] ^ tmp[151] & (tmp[163] | tmp[177] ^ tmp[61]))));
        tmp[88] = tmp[56] | tmp[158];
        tmp[143] = tmp[38] | tmp[20];
        tmp[52] = tmp[38] & tmp[20];
        tmp[108] ^= tmp[29] & (tmp[176] ^ tmp[167] & ~(tmp[153] ^ tmp[175])) ^ (tmp[164] & tmp[156] ^ (tmp[16] ^ tmp[72] & ~((tmp[37] ^ ~(tmp[120] ^ tmp[104]) & tmp[167]) & tmp[29] ^ (tmp[116] ^ tmp[159] ^ tmp[167] & ~tmp[159]))));
        tmp[166] = tmp[56] ^ tmp[158];
        tmp[65] = ~tmp[158];
        tmp[127] = tmp[181] ^ tmp[156] & (tmp[154] ^ (tmp[120] | tmp[128]) ^ tmp[82] & (tmp[47] ^ tmp[129])) ^ (tmp[129] ^ ((tmp[47] & tmp[48] | tmp[9]) ^ (tmp[49] ^ (tmp[89] | tmp[131] ^ (tmp[127] ^ tmp[120] & tmp[145] & tmp[9]) ^ tmp[156] & (tmp[131] ^ (tmp[127] ^ ~tmp[127] & tmp[9]))))));
        tmp[154] = tmp[20] & tmp[8];
        tmp[59] = tmp[126] & (tmp[173] ^ (tmp[147] | tmp[173])) ^ (tmp[98] & tmp[173] ^ (tmp[121] ^ tmp[14] & tmp[155])) ^ (tmp[135] ^ tmp[177] & ~(tmp[86] ^ (tmp[142] | tmp[160]) ^ (tmp[98] & (tmp[183] & tmp[121] ^ tmp[155] & tmp[59]) ^ tmp[126] & (tmp[98] & tmp[121] ^ (tmp[86] ^ tmp[162])))));
        tmp[183] = tmp[20] | tmp[108];
        tmp[173] = tmp[38] | tmp[108];
        tmp[135] = tmp[158] & ~tmp[56];
        tmp[49] = tmp[118] ^ tmp[108];
        tmp[181] = ~tmp[170];
        tmp[94] = tmp[56] & tmp[65];
        tmp[179] = tmp[78] ^ tmp[27] & ~(tmp[139] & (tmp[141] ^ tmp[41]) ^ tmp[40] & (tmp[179] & tmp[44] ^ tmp[139] & ~tmp[44])) ^ (tmp[139] & ~(tmp[80] ^ tmp[66]) ^ (tmp[87] ^ tmp[115]) ^ tmp[40] & (tmp[85] ^ tmp[64] ^ tmp[139] & ~(tmp[149] ^ tmp[115])));
        tmp[115] = tmp[38] & ~tmp[20];
        tmp[149] = ~tmp[108];
        tmp[66] = tmp[108] | tmp[154];
        tmp[182] = tmp[163] ^ (tmp[2] ^ tmp[177] ^ tmp[122]) ^ ((tmp[15] | tmp[72] ^ (tmp[13] ^ tmp[91] & tmp[73])) ^ tmp[151] & ~(tmp[91] & (tmp[157] ^ (tmp[25] | tmp[157])) ^ ((tmp[15] | tmp[157] ^ (tmp[182] ^ tmp[91] & tmp[72])) ^ tmp[83])));
        tmp[157] = tmp[91] & (tmp[25] ^ tmp[67]) ^ tmp[83] ^ ((tmp[15] | tmp[177] ^ (tmp[122] ^ tmp[163] & (tmp[138] ^ tmp[126] & tmp[157]))) ^ (tmp[46] ^ tmp[151] & ~(tmp[157] ^ tmp[13] ^ tmp[91] & (tmp[72] ^ tmp[126] & tmp[12]))));
        tmp[91] = tmp[133] & tmp[59];
        tmp[82] = tmp[131] ^ (tmp[48] & tmp[128] ^ ((tmp[9] | tmp[47] ^ tmp[161]) ^ ((tmp[167] | tmp[5] ^ tmp[129] ^ (tmp[145] ^ tmp[131] & tmp[48]) & tmp[82]) ^ (tmp[4] ^ tmp[76] & (tmp[161] & tmp[9] ^ (tmp[167] | tmp[119] ^ tmp[110] & tmp[82]))))));
        tmp[110] = ~tmp[127];
        tmp[119] = ~tmp[59];
        tmp[126] = tmp[25] ^ (tmp[163] | tmp[25]) ^ (tmp[12] ^ (tmp[62] & (tmp[177] ^ (tmp[163] | tmp[61]) ^ (tmp[25] | tmp[109])) ^ (tmp[18] ^ tmp[151] & ~(tmp[62] & (tmp[177] & ~tmp[126]) ^ tmp[163] & ~tmp[73]))));
        tmp[73] = tmp[56] | tmp[179];
        tmp[62] = tmp[158] | tmp[179];
        tmp[61] = tmp[166] | tmp[179];
        tmp[109] = tmp[52] & tmp[149];
        tmp[18] = tmp[38] & tmp[149];
        tmp[12] = tmp[154] & tmp[149];
        tmp[161] = tmp[135] ^ tmp[179];
        tmp[145] = tmp[65] & tmp[157];
        tmp[129] = tmp[158] | tmp[157];
        tmp[65] &= tmp[82];
        tmp[5] = tmp[157] & tmp[82];
        tmp[76] = tmp[158] & tmp[82];
        tmp[4] = tmp[108] & tmp[110];
        tmp[128] = ~tmp[179];
        tmp[13] = tmp[56] & tmp[158] ^ tmp[179];
        tmp[138] = tmp[88] ^ tmp[179];
        tmp[55] ^= tmp[74] ^ (tmp[80] | tmp[32]) ^ tmp[142] & (tmp[102] ^ (tmp[80] | tmp[169])) ^ tmp[152] & ~(tmp[142] & ~((tmp[80] | tmp[105]) ^ tmp[60]) ^ (tmp[146] ^ (tmp[105] ^ tmp[123] & tmp[11])));
        tmp[122] = ~tmp[157];
        tmp[67] = tmp[158] ^ tmp[157];
        tmp[46] = tmp[133] & tmp[119];
        tmp[83] = ~tmp[82];
        tmp[2] = tmp[137] & tmp[126];
        tmp[78] = tmp[59] | tmp[126];
        tmp[36] = tmp[92] | tmp[126];
        tmp[6] = tmp[92] & tmp[126];
        tmp[114] = tmp[141] ^ tmp[44] & tmp[75] ^ tmp[139] & tmp[114] ^ tmp[40] & ~(tmp[64] ^ tmp[87] ^ tmp[139] & ~(tmp[41] ^ tmp[87])) ^ (tmp[69] ^ tmp[27] & ~(tmp[40] & ~(tmp[139] & (tmp[41] ^ tmp[85]) ^ tmp[39]) ^ (tmp[64] ^ tmp[139] & ~tmp[114])));
        tmp[17] = tmp[125] ^ tmp[80] & tmp[31] ^ tmp[142] & ~(tmp[105] ^ tmp[80] & tmp[30]) ^ (tmp[7] ^ tmp[152] & (tmp[80] & tmp[71] ^ (tmp[184] ^ tmp[142] & ~(tmp[19] ^ tmp[80] & ~tmp[17]))));
        tmp[19] = ~tmp[126];
        tmp[30] = tmp[92] ^ tmp[126];
        tmp[184] = tmp[88] ^ tmp[73];
        tmp[73] ^= tmp[135];
        tmp[71] = tmp[158] & tmp[128];
        tmp[31] = tmp[135] ^ (tmp[94] | tmp[179]);
        tmp[125] = tmp[158] ^ tmp[62];
        tmp[62] ^= tmp[166];
        tmp[7] = tmp[88] ^ tmp[61];
        tmp[61] ^= tmp[135];
        tmp[135] = tmp[166] ^ (tmp[135] | tmp[179]);
        tmp[87] = tmp[123] & (tmp[44] ^ tmp[85]) ^ tmp[139] & (tmp[85] ^ tmp[44] & tmp[1]) ^ tmp[40] & (tmp[1] ^ tmp[68] ^ tmp[139] & (tmp[141] ^ tmp[68])) ^ (tmp[112] ^ tmp[27] & (tmp[40] & ~(tmp[41] ^ tmp[75] ^ tmp[139] & tmp[39]) ^ (tmp[1] ^ tmp[44] & tmp[123] ^ tmp[139] & ~(tmp[87] ^ tmp[44] & ~tmp[87]))));
        tmp[39] = tmp[38] & ~tmp[115];
        tmp[75] = tmp[158] & tmp[122];
        tmp[41] = tmp[92] | tmp[114];
        tmp[93] = tmp[77] ^ (tmp[187] ^ (tmp[50] ^ tmp[57] & (tmp[97] ^ tmp[172]))) ^ (tmp[81] & ((tmp[42] | tmp[172]) ^ (tmp[144] ^ tmp[84])) ^ tmp[139] & (tmp[90] ^ tmp[189] ^ tmp[81] & ~(tmp[93] ^ tmp[172] ^ tmp[189])));
        tmp[189] = ~tmp[55];
        tmp[169] = tmp[152] & ~(tmp[142] & (tmp[60] ^ tmp[80] & ~tmp[105]) ^ (tmp[146] ^ tmp[105] ^ tmp[80] & tmp[11])) ^ (tmp[101] ^ (tmp[74] ^ tmp[80] & tmp[32] ^ tmp[142] & ~(tmp[102] ^ tmp[80] & ~tmp[169])));
        tmp[105] = tmp[92] & tmp[17];
        tmp[102] = tmp[92] | tmp[17];
        tmp[11] = tmp[137] & tmp[17];
        tmp[48] = (tmp[148] | tmp[171] ^ tmp[156] & (tmp[175] ^ tmp[21])) ^ ((tmp[120] | tmp[104]) ^ (tmp[54] ^ (tmp[167] & ~(tmp[163] ^ tmp[174]) ^ (tmp[58] ^ tmp[72] & ~(tmp[116] ^ (tmp[175] ^ tmp[48] & (tmp[167] & tmp[164])) ^ tmp[29] & (tmp[180] ^ tmp[167] & (tmp[43] ^ tmp[54])))))));
        tmp[33] = tmp[142] ^ tmp[160] ^ ((tmp[147] | tmp[14] ^ tmp[0]) ^ ((tmp[25] | (tmp[14] | tmp[147]) ^ (tmp[121] ^ tmp[162])) ^ (tmp[113] ^ tmp[177] & ~(tmp[155] & tmp[160] ^ tmp[98] & (tmp[14] ^ tmp[136]) ^ (tmp[25] | (tmp[147] | tmp[86]) ^ (tmp[136] ^ tmp[33]))))));
        tmp[136] = tmp[59] ^ tmp[46];
        tmp[86] = tmp[92] & tmp[19];
        tmp[98] = tmp[2] ^ tmp[17];
        tmp[160] = tmp[17] | tmp[30];
        tmp[155] = ~tmp[114];
        tmp[57] = tmp[117] ^ (tmp[90] ^ (tmp[42] | tmp[168] ^ tmp[24] & tmp[22]) ^ tmp[81] & (tmp[188] ^ tmp[193]) ^ tmp[139] & ~(tmp[168] ^ tmp[57] & tmp[190] ^ tmp[81] & (tmp[192] ^ tmp[194])));
        tmp[90] = ~tmp[17];
        tmp[117] = tmp[92] ^ tmp[17];
        tmp[122] = tmp[82] & (tmp[145] | tmp[122]);
        tmp[162] = tmp[82] & tmp[75];
        tmp[113] = tmp[82] & ~tmp[129];
        tmp[0] = tmp[157] & tmp[76] ^ tmp[75];
        tmp[128] = tmp[166] ^ tmp[94] & tmp[128];
        tmp[88] ^= tmp[71];
        tmp[94] = ~tmp[87];
        tmp[166] = tmp[114] | tmp[102];
        tmp[16] = tmp[104] ^ (tmp[180] ^ (tmp[167] & ~tmp[171] ^ ((tmp[148] | tmp[163] ^ tmp[175] ^ tmp[167] & (tmp[163] ^ tmp[96])) ^ (tmp[124] ^ tmp[72] & (tmp[3] ^ tmp[43] ^ tmp[167] & (tmp[153] ^ tmp[176]) ^ (tmp[148] | tmp[21] ^ tmp[167] & tmp[16]))))));
        tmp[43] = tmp[82] & ~tmp[67];
        tmp[175] = tmp[102] & tmp[155];
        tmp[124] = tmp[92] & tmp[155];
        tmp[171] = ~tmp[169];
        tmp[116] = tmp[92] & tmp[90];
        tmp[58] = tmp[2] ^ (tmp[2] | tmp[17]);
        tmp[156] = tmp[126] & tmp[90];
        tmp[146] = tmp[36] & tmp[90];
        tmp[60] = tmp[2] & tmp[90];
        tmp[32] = tmp[6] & tmp[90];
        tmp[74] = tmp[155] & tmp[117];
        tmp[101] = ~tmp[48];
        tmp[130] = tmp[132] ^ (tmp[139] & (tmp[81] & (tmp[188] ^ (tmp[42] | tmp[188])) ^ (tmp[144] ^ tmp[186] ^ tmp[193])) ^ (tmp[97] ^ (tmp[150] | tmp[172]) ^ (tmp[42] | tmp[191]) ^ tmp[81] & ~(tmp[190] ^ tmp[42] & ~(tmp[27] ^ tmp[130]))));
        tmp[190] = ~tmp[57];
        tmp[137] = tmp[114] | tmp[137] & tmp[102];
        tmp[186] = tmp[145] ^ tmp[162];
        tmp[75] = tmp[82] & ~tmp[75];
        tmp[191] = tmp[67] ^ tmp[113];
        tmp[193] = tmp[92] & ~tmp[105];
        tmp[132] = tmp[155] & tmp[116];
        tmp[84] = tmp[33] & (tmp[126] ^ (tmp[126] | tmp[17]));
        tmp[54] = tmp[164] ^ (tmp[159] ^ (tmp[167] & (tmp[164] ^ tmp[96]) ^ (tmp[29] & (tmp[37] ^ tmp[167] & (tmp[3] ^ tmp[174])) ^ (tmp[134] ^ tmp[72] & ~(tmp[167] & ~(tmp[153] ^ tmp[96]) ^ (tmp[21] ^ (tmp[176] ^ (tmp[148] | tmp[120] ^ tmp[153] ^ tmp[167] & (tmp[180] ^ tmp[54])))))))));
        tmp[180] = ~tmp[16];
        tmp[153] = tmp[127] & tmp[130];
        tmp[96] = tmp[110] & tmp[130];
        tmp[176] = tmp[127] | tmp[130];
        tmp[21] = ~tmp[130];
        tmp[174] = tmp[127] ^ tmp[130];
        tmp[3] = tmp[114] | tmp[193];
        tmp[37] = tmp[119] & tmp[54];
        tmp[134] = tmp[59] & tmp[54];
        tmp[29] = tmp[59] | tmp[54];
        tmp[164] = tmp[108] & tmp[153];
        tmp[159] = tmp[108] & tmp[96];
        tmp[50] = tmp[33] & (tmp[126] ^ tmp[156]);
        tmp[187] = ~tmp[54];
        tmp[123] = tmp[59] ^ tmp[54];
        tmp[1] = ~tmp[153];
        tmp[68] = tmp[176] & tmp[21];
        tmp[85] = tmp[96] ^ tmp[159];
        tmp[112] = tmp[108] & tmp[174];
        tmp[64] = tmp[4] ^ tmp[174];
        tmp[69] = tmp[17] ^ tmp[3];
        tmp[103] = tmp[59] & tmp[187];
        tmp[187] &= tmp[133];
        tmp[140] = tmp[133] ^ tmp[29];
        tmp[10] = tmp[133] & tmp[123];
        tmp[106] = tmp[130] & tmp[1];
        tmp[26] = tmp[108] & ~tmp[176];
        tmp[100] = tmp[133] ^ tmp[123];
        tmp[45] = tmp[153] ^ tmp[108] & tmp[21];
        tmp[107] = tmp[54] & ~tmp[37];
        tmp[165] = tmp[133] & ~tmp[29];
        tmp[144] = (tmp[24] | tmp[172]) ^ (tmp[150] ^ ((tmp[42] | tmp[63] & tmp[77] ^ (tmp[97] | tmp[172])) ^ (tmp[81] & ~(tmp[27] ^ tmp[168] & tmp[22] ^ tmp[194]) ^ (tmp[99] ^ tmp[139] & ~(tmp[192] ^ tmp[42] & (tmp[144] & ~tmp[22]) ^ tmp[81] & ~(tmp[188] ^ tmp[42] & ~(tmp[144] ^ tmp[172])))))));
        tmp[22] = tmp[108] & ~tmp[68];
        tmp[188] = tmp[59] | tmp[144];
        tmp[192] = tmp[59] & tmp[144];
        tmp[168] = tmp[46] ^ tmp[107];
        tmp[194] = ~tmp[144];
        tmp[97] = tmp[59] ^ tmp[144];
        tmp[63] = tmp[119] & (tmp[19] & tmp[144]);
        tmp[99] = tmp[94] & tmp[188];
        tmp[150] = tmp[19] & tmp[188];
        tmp[24] = tmp[87] & tmp[168];
        tmp[53] ^= tmp[170] & ~(tmp[88] ^ tmp[48] & ~tmp[7]) ^ (tmp[62] ^ ~tmp[161] & tmp[48] ^ (tmp[28] | tmp[125] ^ (tmp[135] & tmp[101] ^ tmp[170] & (tmp[61] ^ tmp[125] & tmp[48]))));
        tmp[35] = tmp[59] & tmp[194];
        tmp[194] &= tmp[188];
        tmp[111] = ~tmp[192];
        tmp[23] = tmp[78] ^ tmp[192];
        tmp[95] = tmp[19] & tmp[97];
        tmp[141] ^= tmp[49] ^ (tmp[170] | tmp[109]) ^ ((tmp[170] & tmp[108] ^ tmp[109]) & tmp[93] ^ (tmp[28] | tmp[181] & tmp[109] ^ (tmp[20] ^ (tmp[154] | tmp[181]) & tmp[93])));
        tmp[58] = tmp[33] & tmp[58] ^ (tmp[126] ^ tmp[116]) ^ (tmp[16] | tmp[146] ^ (tmp[92] ^ tmp[33] & ~tmp[160])) ^ (tmp[139] ^ tmp[144] & (tmp[180] & (tmp[36] ^ tmp[33] & tmp[156]) ^ (tmp[92] ^ tmp[102] ^ tmp[33] & ~tmp[58])));
        tmp[116] = tmp[19] & tmp[35];
        tmp[148] ^= tmp[67] ^ tmp[82] & tmp[145] ^ tmp[48] & (tmp[129] ^ tmp[113]) ^ (tmp[55] | tmp[157] ^ tmp[76] ^ tmp[48] & tmp[191]) ^ tmp[190] & (tmp[0] ^ ((tmp[82] ^ tmp[129] | tmp[48]) ^ tmp[189] & (tmp[122] ^ (tmp[158] ^ tmp[82]) & tmp[48])));
        tmp[120] ^= tmp[13] ^ (tmp[48] & ~tmp[128] ^ tmp[170] & (tmp[138] ^ tmp[48] & ~tmp[184])) ^ (tmp[28] | tmp[71] ^ tmp[48] & ~tmp[31] ^ tmp[170] & ~(tmp[73] ^ tmp[71] & tmp[48]));
        tmp[125] = tmp[170] & (tmp[88] ^ (tmp[7] | tmp[48])) ^ (tmp[62] ^ tmp[161] & tmp[101]) ^ (tmp[27] ^ (tmp[28] | tmp[125] ^ tmp[135] & tmp[48] ^ tmp[170] & (tmp[61] ^ tmp[125] & tmp[101])));
        tmp[61] = ~tmp[141];
        tmp[135] = ~tmp[58];
        tmp[7] = tmp[144] & (tmp[19] ^ tmp[111]);
        tmp[161] = ~tmp[148];
        tmp[186] = tmp[42] ^ ((tmp[57] | tmp[48] & (tmp[158] ^ tmp[122]) ^ tmp[189] & ((tmp[158] ^ tmp[65]) & tmp[48] ^ tmp[75])) ^ (tmp[0] ^ tmp[48] & tmp[186] ^ tmp[189] & (tmp[157] ^ tmp[48] & ~tmp[186])));
        tmp[122] = ~tmp[120];
        tmp[101] = tmp[147] ^ (tmp[13] ^ tmp[128] & tmp[101] ^ tmp[170] & ~(tmp[138] ^ (tmp[184] | tmp[48]))) ^ ~tmp[28] & ((tmp[31] | tmp[48]) ^ (tmp[71] ^ tmp[170] & ~(tmp[73] ^ tmp[71] & tmp[101])));
        tmp[71] = ~tmp[125];
        tmp[65] = tmp[191] ^ (tmp[48] | tmp[157] ^ tmp[162]) ^ ((tmp[55] | tmp[67] ^ tmp[82] & tmp[129] ^ (tmp[5] ^ tmp[67]) & tmp[48]) ^ (tmp[177] ^ tmp[190] & (tmp[129] ^ tmp[5] ^ (tmp[145] ^ tmp[76]) & tmp[48] ^ tmp[189] & (~tmp[65] & tmp[48] ^ (tmp[145] ^ tmp[43])))));
        tmp[6] = (tmp[33] | tmp[86]) ^ tmp[156] ^ (tmp[180] & (tmp[36] ^ tmp[60]) ^ (tmp[152] ^ tmp[144] & ~(tmp[180] & (tmp[90] & (tmp[33] ^ tmp[86])) ^ tmp[33] & (tmp[6] ^ tmp[32]))));
        tmp[183] = tmp[115] ^ (tmp[8] & tmp[170] ^ (tmp[66] ^ (tmp[93] & ~(tmp[109] ^ (tmp[38] & tmp[170] ^ tmp[39])) ^ (tmp[81] ^ (tmp[28] | tmp[20] ^ tmp[183] ^ tmp[170] & (tmp[143] ^ tmp[183]) ^ tmp[93] & (tmp[38] ^ tmp[18] ^ tmp[170] & (tmp[52] ^ tmp[18])))))));
        tmp[81] = tmp[101] & tmp[65];
        tmp[8] = tmp[101] | tmp[65];
        tmp[2] = tmp[92] ^ tmp[160] ^ tmp[33] & ~tmp[98] ^ (tmp[163] ^ (tmp[16] | tmp[2] ^ (tmp[146] ^ tmp[84])) ^ tmp[144] & ~(tmp[180] & (tmp[84] ^ (tmp[30] ^ tmp[32])) ^ (tmp[126] ^ tmp[160] ^ tmp[33] & (tmp[126] ^ (tmp[17] | tmp[126] & ~tmp[2])))));
        tmp[25] ^= tmp[127] ^ tmp[69] ^ (tmp[182] & (tmp[127] & (tmp[92] ^ tmp[175]) ^ (tmp[92] ^ tmp[92] & (tmp[17] & tmp[155]))) ^ tmp[130] & ~(tmp[175] ^ (tmp[127] & tmp[114] ^ tmp[102]) ^ tmp[182] & ~(tmp[127] & tmp[11] ^ tmp[124])));
        tmp[32] = ~tmp[101];
        tmp[30] = tmp[101] ^ tmp[65];
        tmp[160] = ~tmp[65];
        tmp[143] = tmp[154] ^ (tmp[170] & (tmp[38] ^ tmp[12]) ^ (tmp[66] ^ (tmp[93] & ~(tmp[170] & (tmp[38] ^ (tmp[143] | tmp[108]))) ^ (tmp[15] ^ (tmp[28] | tmp[170] & ~tmp[173] ^ (tmp[12] ^ (tmp[39] ^ tmp[38] & tmp[93])))))));
        tmp[12] = tmp[71] & tmp[183];
        tmp[173] = tmp[38] ^ (tmp[20] & tmp[149] ^ (tmp[170] & (~tmp[118] | tmp[149]) ^ (tmp[93] & ~(tmp[118] ^ tmp[109] ^ tmp[170] & ~(tmp[52] ^ (tmp[108] | tmp[39]))) ^ (tmp[89] ^ (tmp[28] | tmp[181] & (tmp[115] ^ tmp[18]) ^ tmp[93] & ~(tmp[49] ^ tmp[170] & ~(tmp[52] ^ tmp[173])))))));
        tmp[52] = tmp[65] & tmp[32];
        tmp[39] = ~tmp[183];
        tmp[49] = tmp[183] ^ (tmp[125] | tmp[183]);
        tmp[75] = tmp[51] ^ (tmp[82] ^ tmp[67] ^ (tmp[48] ^ (tmp[129] & tmp[189] ^ (tmp[57] | tmp[189] & (tmp[158] & tmp[157] ^ tmp[43]) ^ (tmp[158] ^ tmp[113] ^ tmp[48] & (tmp[67] ^ tmp[75]))))));
        tmp[67] = tmp[101] & tmp[160];
        tmp[113] = tmp[8] & tmp[160];
        tmp[43] = ~tmp[2];
        tmp[124] = tmp[105] ^ tmp[137] ^ tmp[127] & ~(tmp[74] ^ tmp[193]) ^ (tmp[182] & ~(tmp[11] ^ tmp[166] ^ tmp[127] & (tmp[105] ^ tmp[166])) ^ (tmp[80] ^ tmp[130] & (tmp[17] ^ tmp[74] ^ tmp[127] & ~tmp[175] ^ tmp[182] & ~(tmp[124] ^ tmp[110] & (tmp[11] ^ tmp[124])))));
        tmp[74] = tmp[25] | tmp[143];
        tmp[166] = ~tmp[25];
        tmp[68] = tmp[174] ^ (tmp[70] & tmp[110] ^ (tmp[108] & tmp[176] ^ (tmp[34] & (tmp[176] ^ tmp[26]) ^ (tmp[14] ^ (tmp[38] | tmp[108] & (tmp[34] & tmp[130]) ^ tmp[68] ^ tmp[70] & (tmp[164] ^ tmp[127] & tmp[21]))))));
        tmp[176] = tmp[143] ^ tmp[74];
        tmp[14] = tmp[53] & tmp[39];
        tmp[80] = tmp[141] | tmp[75];
        tmp[129] = tmp[141] & tmp[75];
        tmp[51] = tmp[141] | tmp[124];
        tmp[18] = tmp[141] & tmp[124];
        tmp[110] = tmp[182] & ~(tmp[155] & (tmp[110] & tmp[11])) ^ ((tmp[114] | tmp[17]) ^ tmp[117] ^ tmp[127] & ~(tmp[102] ^ tmp[3]) ^ (tmp[47] ^ tmp[130] & ~(tmp[110] & (tmp[17] ^ tmp[41]) ^ tmp[69] ^ tmp[182] & (tmp[41] ^ tmp[127] & (tmp[41] ^ tmp[193])))));
        tmp[69] = tmp[141] ^ tmp[75];
        tmp[11] = ~tmp[124];
        tmp[155] = tmp[141] ^ tmp[124];
        tmp[32] &= tmp[68];
        tmp[47] = tmp[160] & tmp[68];
        tmp[115] = tmp[81] & tmp[68];
        tmp[181] = tmp[52] & tmp[68];
        tmp[109] = ~tmp[81] & tmp[68];
        tmp[118] = ~tmp[8] & tmp[68];
        tmp[102] = tmp[117] ^ tmp[175] ^ tmp[127] & ~(tmp[105] ^ tmp[3]) ^ (tmp[182] & ~(tmp[193] ^ tmp[132] ^ tmp[127] & ~(tmp[102] ^ tmp[132])) ^ (tmp[172] ^ tmp[130] & ~(tmp[182] & ~(tmp[105] ^ tmp[127] & (tmp[41] ^ tmp[102])) ^ (tmp[92] ^ tmp[137] ^ tmp[127] & ~(tmp[105] ^ tmp[132])))));
        tmp[156] = tmp[98] ^ (tmp[33] & (tmp[86] ^ tmp[60]) ^ ((tmp[16] | tmp[50]) ^ (tmp[178] ^ tmp[144] & (tmp[126] ^ (tmp[156] ^ tmp[33] & ~tmp[156]) ^ (tmp[16] | tmp[156] ^ (tmp[86] ^ tmp[50]))))));
        tmp[50] = ~tmp[68];
        tmp[123] = tmp[100] ^ (tmp[24] ^ ((tmp[55] | tmp[133] & tmp[134] ^ tmp[107] ^ tmp[87] & ~tmp[168]) ^ (tmp[9] ^ tmp[83] & ((tmp[55] | tmp[29] ^ tmp[187] ^ tmp[87] & (tmp[123] ^ tmp[10])) ^ (tmp[187] ^ tmp[87] & (tmp[37] ^ tmp[10]))))));
        tmp[187] = tmp[68] | tmp[69];
        tmp[9] = tmp[68] & ~tmp[113];
        tmp[86] = tmp[51] & tmp[11];
        tmp[96] = (tmp[34] | tmp[108] ^ tmp[127]) ^ tmp[64] ^ (tmp[70] & (tmp[127] ^ tmp[4]) ^ (tmp[131] ^ (tmp[38] | tmp[70] & (tmp[185] & tmp[108] ^ tmp[85]) ^ tmp[185] & (tmp[96] ^ tmp[108] & ~tmp[106]))));
        tmp[4] = tmp[183] | tmp[102];
        tmp[131] = tmp[39] & tmp[102];
        tmp[10] = tmp[168] ^ (tmp[87] & (tmp[29] ^ tmp[165]) ^ (tmp[189] & (tmp[29] ^ tmp[87] & ~(tmp[46] ^ tmp[29])) ^ (tmp[72] ^ (tmp[82] | tmp[87] & (tmp[46] ^ tmp[37]) ^ (tmp[91] ^ tmp[37] ^ (tmp[55] | tmp[87] | tmp[10] ^ tmp[107]))))));
        tmp[37] = tmp[81] ^ tmp[115];
        tmp[29] = tmp[81] ^ tmp[181];
        tmp[72] = tmp[125] ^ tmp[102];
        tmp[168] = tmp[183] ^ tmp[102];
        tmp[178] = ~tmp[156];
        tmp[60] = tmp[122] & tmp[123];
        tmp[98] = tmp[120] & tmp[123];
        tmp[41] = tmp[120] | tmp[123];
        tmp[132] = tmp[183] & tmp[123];
        tmp[105] = tmp[183] | tmp[123];
        tmp[137] = tmp[39] & tmp[123];
        tmp[193] = tmp[124] & ~tmp[18];
        tmp[3] = tmp[120] | tmp[96];
        tmp[172] = tmp[123] | tmp[96];
        tmp[21] = tmp[64] ^ (tmp[34] & ~tmp[112] ^ ((tmp[38] | tmp[153] ^ tmp[164] ^ tmp[34] & tmp[85] ^ tmp[70] & (tmp[26] ^ (tmp[130] ^ tmp[34] & tmp[21]))) ^ (tmp[104] ^ tmp[70] & ~(tmp[106] ^ tmp[26] ^ tmp[34] & ~tmp[45]))));
        tmp[26] = tmp[125] | tmp[4];
        tmp[106] = tmp[71] & tmp[4];
        tmp[85] = ~tmp[123];
        tmp[164] = tmp[120] ^ tmp[123];
        tmp[104] = tmp[183] ^ tmp[123];
        tmp[64] = ~tmp[96];
        tmp[175] = tmp[183] & ~tmp[102];
        tmp[117] = tmp[125] | tmp[168];
        tmp[89] = tmp[96] | tmp[41];
        tmp[149] = tmp[53] & tmp[132];
        tmp[15] = tmp[53] & tmp[105];
        tmp[66] = tmp[39] & tmp[105];
        tmp[134] = (tmp[87] | tmp[136]) ^ ((tmp[55] | tmp[107] ^ tmp[24]) ^ (tmp[100] ^ (tmp[121] ^ (tmp[82] | tmp[189] & (tmp[136] ^ tmp[87] & (tmp[91] ^ tmp[134])) ^ (tmp[59] ^ (tmp[91] ^ tmp[94] & (tmp[91] ^ tmp[103])))))));
        tmp[136] = ~tmp[10];
        tmp[121] = tmp[120] & tmp[85];
        tmp[24] = tmp[132] ^ tmp[149];
        tmp[107] = ~tmp[105];
        tmp[100] = tmp[183] & tmp[85];
        tmp[154] = tmp[53] & tmp[104];
        tmp[84] = tmp[120] & tmp[64];
        tmp[180] = tmp[125] | tmp[175];
        tmp[146] = tmp[71] & tmp[175];
        tmp[163] = tmp[53] & (tmp[39] | tmp[132]);
        tmp[140] = tmp[87] ^ (tmp[46] ^ (tmp[103] ^ (tmp[189] & (tmp[59] ^ tmp[91] ^ tmp[87] & (tmp[54] ^ tmp[165])) ^ (tmp[44] ^ tmp[83] & (tmp[133] & tmp[87] & tmp[54] ^ (tmp[55] | tmp[140] ^ tmp[87] & ~tmp[140]))))));
        tmp[165] = tmp[175] ^ tmp[146];
        tmp[91] = tmp[183] ^ tmp[117];
        tmp[83] = tmp[123] & ~tmp[60];
        tmp[44] = tmp[96] | tmp[121];
        tmp[189] = tmp[64] & tmp[121];
        tmp[103] = ~tmp[66];
        tmp[46] = tmp[53] & tmp[100];
        tmp[90] = tmp[25] ^ (tmp[143] ^ tmp[10]);
        tmp[22] ^= tmp[153] ^ (tmp[70] & ~tmp[159] ^ (tmp[34] & ~(tmp[130] ^ tmp[108] & tmp[1]) ^ (tmp[40] ^ (tmp[38] | tmp[70] & ~(tmp[127] ^ tmp[112]) ^ (tmp[45] ^ tmp[185] & (tmp[174] ^ tmp[22]))))));
        tmp[150] ^= tmp[97] ^ ((tmp[169] | tmp[99]) ^ (tmp[87] & ~(tmp[126] | tmp[188]) ^ (tmp[151] ^ tmp[79] & ~(tmp[171] & tmp[150] ^ tmp[94] & (tmp[188] ^ (tmp[126] | tmp[144]))))));
        tmp[151] = tmp[141] | tmp[140];
        tmp[174] = tmp[51] | tmp[140];
        tmp[112] = tmp[86] | tmp[140];
        tmp[185] = tmp[155] | tmp[140];
        tmp[45] = tmp[123] ^ tmp[164] & tmp[64];
        tmp[1] = tmp[96] | tmp[83];
        tmp[40] = ~tmp[140];
        tmp[159] = tmp[155] ^ tmp[140];
        tmp[153] = tmp[143] | tmp[150];
        tmp[36] = ~tmp[150];
        tmp[152] = tmp[143] & tmp[166] ^ tmp[150];
        tmp[145] = tmp[141] ^ tmp[151];
        tmp[76] = tmp[141] & tmp[40];
        tmp[5] = tmp[51] & tmp[40];
        tmp[40] &= tmp[18];
        tmp[190] = tmp[124] ^ tmp[185];
        tmp[162] = tmp[124] ^ (tmp[124] | tmp[140]);
        tmp[19] = tmp[59] ^ (tmp[126] | tmp[144] & tmp[111]) ^ (tmp[87] & ~tmp[23] ^ (tmp[171] & (tmp[97] ^ tmp[87] & (tmp[78] ^ tmp[194])) ^ (tmp[167] ^ tmp[79] & ~(tmp[87] & tmp[23] ^ (tmp[171] & ((tmp[19] ^ tmp[87]) & tmp[192]) ^ tmp[7])))));
        tmp[188] = (tmp[87] | tmp[63]) ^ (tmp[7] ^ ((tmp[169] | tmp[35] ^ tmp[87] & tmp[63]) ^ (tmp[77] ^ tmp[79] & (tmp[171] & (tmp[116] ^ tmp[94] & tmp[35]) ^ ((tmp[126] | tmp[192]) ^ tmp[194] ^ tmp[87] & ~(tmp[188] ^ (tmp[126] | tmp[97])))))));
        tmp[192] = tmp[143] & tmp[36];
        tmp[35] = tmp[120] & tmp[19];
        tmp[94] = tmp[45] | tmp[19];
        tmp[194] = tmp[148] & tmp[19];
        tmp[171] = tmp[148] | tmp[19];
        tmp[63] = tmp[166] & tmp[192];
        tmp[77] = ~tmp[19];
        tmp[7] = tmp[148] ^ tmp[19];
        tmp[23] = tmp[161] & tmp[35];
        tmp[78] = tmp[120] & tmp[194];
        tmp[116] = tmp[126] ^ (tmp[97] ^ (tmp[87] & tmp[111] ^ ((tmp[169] | tmp[59] ^ tmp[99]) ^ (tmp[142] ^ tmp[79] & ((tmp[169] | tmp[119] & tmp[87] ^ (tmp[144] ^ tmp[95])) ^ (tmp[144] ^ (tmp[95] ^ (tmp[87] | tmp[97] ^ tmp[116]))))))));
        tmp[97] = tmp[120] & tmp[77];
        tmp[95] = tmp[148] & tmp[77];
        tmp[119] = tmp[171] & tmp[77];
        tmp[99] = ~tmp[194];
        tmp[142] = ~tmp[171];
        tmp[69] &= tmp[116];
        tmp[111] = tmp[80] & tmp[116];
        tmp[167] = ~tmp[80] & tmp[116];
        tmp[177] = tmp[19] ^ tmp[23];
        tmp[191] = tmp[120] & tmp[95];
        tmp[73] = tmp[19] & tmp[99];
        tmp[184] = ~tmp[116];
        tmp[138] = tmp[119] ^ tmp[191];
        tmp[128] = ~tmp[119];
        tmp[119] ^= tmp[120];
        tmp[31] = tmp[141] ^ tmp[69];
        tmp[13] = tmp[65] & tmp[50] & tmp[184];
        tmp[147] = tmp[120] & tmp[128];
        tmp[0] = tmp[73] ^ tmp[120] & tmp[142];
        tmp[42] = tmp[78] ^ tmp[73];
        tmp[85] = tmp[28] ^ (tmp[186] & (tmp[132] ^ tmp[15] ^ (tmp[156] | tmp[14] ^ tmp[104] ^ tmp[96] & tmp[100])) ^ (tmp[96] ^ (tmp[104] ^ tmp[53] & tmp[103]) ^ (tmp[156] | tmp[183] ^ tmp[53] & tmp[85] ^ tmp[96] & (tmp[137] ^ tmp[154]))));
        tmp[28] = tmp[75] ^ tmp[31];
        tmp[117] = tmp[144] ^ (~(tmp[71] & tmp[131] ^ tmp[58] & (tmp[102] ^ (tmp[125] | tmp[102]))) & tmp[188] ^ (tmp[125] ^ tmp[168] ^ tmp[58] & ~(tmp[102] ^ tmp[26])) ^ (tmp[186] | tmp[4] ^ tmp[26] ^ tmp[58] & ~tmp[4] ^ (tmp[183] ^ tmp[12] ^ tmp[58] & (tmp[168] ^ tmp[117])) & tmp[188]));
        tmp[100] = tmp[104] ^ (tmp[96] & tmp[105] ^ tmp[53] & tmp[107]) ^ (tmp[178] & (tmp[105] ^ tmp[96] & ~(tmp[123] ^ tmp[15])) ^ (tmp[70] ^ tmp[186] & ~(tmp[15] ^ tmp[96] & tmp[107] ^ (tmp[156] | tmp[172] ^ tmp[100]))));
        tmp[26] = tmp[58] & (tmp[125] ^ tmp[131]) ^ (tmp[183] ^ (tmp[102] ^ (tmp[125] | tmp[131]))) ^ ~(tmp[183] ^ tmp[58] & tmp[12]) & tmp[188] ^ (tmp[93] ^ ~tmp[186] & (tmp[58] & ~(tmp[131] ^ tmp[26]) ^ (tmp[106] ^ (tmp[125] ^ tmp[135] & tmp[49]) & tmp[188])));
        tmp[146] = tmp[131] ^ (tmp[58] & tmp[180] ^ ~(tmp[58] & tmp[71] ^ tmp[49]) & tmp[188]) ^ (tmp[57] ^ (tmp[186] | tmp[58] & ~(tmp[102] ^ tmp[180]) ^ (tmp[106] ^ (tmp[146] ^ tmp[58] & ~tmp[72]) & tmp[188])));
        tmp[104] = tmp[133] ^ (tmp[96] & tmp[132] ^ (tmp[66] ^ tmp[163]) ^ (tmp[156] | tmp[183] ^ (tmp[96] | tmp[132] ^ tmp[46])) ^ tmp[186] & ~(tmp[96] & (~tmp[53] & tmp[137]) ^ tmp[178] & (tmp[105] ^ (tmp[46] ^ tmp[96] & ~tmp[104]))));
        tmp[80] = tmp[129] ^ tmp[50] & (tmp[80] ^ tmp[167]) ^ tmp[6] & (tmp[187] ^ (tmp[75] ^ ~tmp[129] & tmp[116]));
        tmp[45] = tmp[79] ^ (tmp[164] ^ tmp[94] ^ tmp[110] & (tmp[3] ^ tmp[123] & tmp[96] & tmp[19]) ^ tmp[173] & ~(tmp[110] & ~tmp[89] ^ (tmp[45] ^ tmp[3] & tmp[19])));
        tmp[41] = tmp[173] & (tmp[110] & (tmp[41] ^ tmp[89]) ^ (tmp[189] ^ (tmp[1] | tmp[19]))) ^ (tmp[127] ^ (tmp[3] ^ tmp[121] ^ (tmp[60] ^ tmp[84] | tmp[19]) ^ tmp[110] & ~(tmp[41] ^ tmp[98] & tmp[64] ^ (tmp[164] ^ tmp[44] | tmp[19]))));
        tmp[145] = tmp[125] & ~tmp[145] ^ (tmp[51] ^ tmp[40] ^ (tmp[22] & ~(tmp[125] & tmp[151] ^ tmp[162]) ^ (tmp[179] ^ (tmp[58] | tmp[162] ^ tmp[125] & tmp[145] ^ tmp[22] & ((tmp[193] | tmp[140]) ^ (tmp[193] ^ tmp[125] & tmp[140]))))));
        tmp[31] = tmp[6] & (tmp[69] ^ (tmp[68] | tmp[31])) ^ (tmp[141] ^ tmp[167] ^ (tmp[68] | tmp[28]));
        tmp[14] = (tmp[156] | tmp[24] ^ tmp[64] & (tmp[123] ^ tmp[149])) ^ (tmp[183] ^ tmp[154] ^ (tmp[96] & tmp[103] ^ (tmp[92] ^ tmp[186] & ~((tmp[156] | tmp[39] & tmp[96] ^ tmp[24]) ^ (tmp[96] & ~(tmp[183] ^ tmp[14]) ^ (tmp[132] ^ tmp[163]))))));
        tmp[39] = ~tmp[104];
        tmp[129] = tmp[75] ^ tmp[111] ^ tmp[50] & (tmp[75] ^ (tmp[141] ^ tmp[129] & tmp[116])) ^ tmp[6] & ~(tmp[187] ^ (tmp[141] & ~tmp[75] ^ tmp[111]));
        tmp[187] = ~tmp[45];
        tmp[163] = ~tmp[41];
        tmp[91] = tmp[72] ^ (tmp[58] | tmp[165]) ^ (tmp[188] & (tmp[183] ^ tmp[58] & tmp[91]) ^ (tmp[130] ^ (tmp[186] | tmp[12] ^ (tmp[175] ^ tmp[135] & tmp[165]) ^ tmp[188] & (tmp[12] ^ (tmp[175] ^ tmp[58] & ~tmp[91])))));
        tmp[69] = (tmp[75] | tmp[68]) ^ (tmp[61] & tmp[75] ^ tmp[111]) ^ tmp[6] & ~(tmp[50] & (tmp[75] ^ tmp[69]) ^ tmp[28]);
        tmp[50] = ~tmp[14];
        tmp[158] ^= tmp[65] ^ tmp[68] ^ ((tmp[113] ^ tmp[115] | tmp[116]) ^ ((tmp[25] | tmp[37] & tmp[184]) ^ tmp[134] & (tmp[9] ^ (tmp[81] ^ tmp[166] & (tmp[81] ^ tmp[68])) ^ (tmp[9] | tmp[116]))));
        tmp[113] = tmp[41] & tmp[91];
        tmp[28] = tmp[41] | tmp[91];
        tmp[190] = tmp[159] ^ (tmp[125] & (tmp[124] ^ tmp[174]) ^ (tmp[22] & ~(tmp[125] & tmp[124] ^ tmp[112]) ^ (tmp[114] ^ tmp[135] & (tmp[190] ^ tmp[125] & ~tmp[190] ^ tmp[22] & (tmp[151] ^ (tmp[86] ^ tmp[125] & (tmp[18] ^ tmp[151])))))));
        tmp[114] = ~tmp[91];
        tmp[111] = tmp[41] ^ tmp[91];
        tmp[175] = tmp[163] & tmp[28];
        tmp[165] = tmp[163] & tmp[190];
        tmp[12] = tmp[41] & tmp[190];
        tmp[130] = ~tmp[158];
        tmp[72] = tmp[41] & tmp[114];
        tmp[61] = tmp[124] ^ (tmp[5] ^ (tmp[125] & tmp[174] ^ (tmp[22] & ~(tmp[18] ^ tmp[125] & ~tmp[86]) ^ (tmp[87] ^ (tmp[58] | tmp[125] & (tmp[86] ^ tmp[112]) ^ (tmp[18] ^ tmp[11] & tmp[76]) ^ tmp[22] & (tmp[141] ^ tmp[174] ^ tmp[125] & ~(tmp[61] & tmp[124] ^ tmp[151])))))));
        tmp[18] ^= tmp[112] ^ (tmp[125] & ~(tmp[51] ^ tmp[185]) ^ (tmp[38] ^ tmp[135] & (tmp[125] & (tmp[193] ^ (tmp[18] | tmp[140])) ^ (tmp[51] ^ tmp[5]) ^ tmp[22] & (tmp[18] ^ (tmp[125] | tmp[159]))) ^ tmp[22] & ~(tmp[40] ^ (tmp[193] ^ tmp[125] & (tmp[155] ^ tmp[76])))));
        tmp[44] = tmp[60] ^ (tmp[96] ^ (((tmp[96] | tmp[164]) ^ tmp[83]) & tmp[77] ^ (tmp[173] & ~(~tmp[110] & tmp[98] ^ (tmp[96] | tmp[60]) & tmp[77]) ^ (tmp[56] ^ tmp[110] & ~(tmp[98] ^ tmp[3] ^ (tmp[83] ^ tmp[44]) & tmp[77])))));
        tmp[89] = tmp[123] ^ (tmp[84] ^ ((tmp[121] ^ tmp[1]) & tmp[77] ^ (tmp[110] & (tmp[120] ^ tmp[60] & tmp[64] ^ tmp[94]) ^ (tmp[82] ^ tmp[173] & ~(tmp[172] ^ tmp[83] ^ (tmp[120] ^ tmp[89] | tmp[19]) ^ tmp[110] & (tmp[189] ^ tmp[35]))))));
        tmp[169] ^= tmp[11] & tmp[80] ^ tmp[69];
        tmp[11] = tmp[31] ^ (tmp[20] ^ tmp[11] & tmp[129]);
        tmp[80] = tmp[69] ^ (tmp[55] ^ tmp[124] & ~tmp[80]);
        tmp[29] = (tmp[37] | tmp[116]) ^ (tmp[109] ^ (tmp[8] ^ tmp[166] & (tmp[30] ^ tmp[101] & tmp[68] ^ tmp[13]))) ^ (tmp[33] ^ tmp[134] & ~((tmp[30] ^ (tmp[81] | tmp[160]) & tmp[68] | tmp[116]) ^ (tmp[29] ^ tmp[166] & (tmp[29] ^ (tmp[47] | tmp[116])))));
        tmp[8] = tmp[41] & ~tmp[113];
        tmp[37] = tmp[39] & tmp[61];
        tmp[33] = tmp[45] & tmp[61];
        tmp[67] = tmp[9] ^ (tmp[101] ^ (tmp[101] ^ tmp[47] | tmp[116])) ^ ((tmp[25] | tmp[118] ^ (tmp[67] ^ tmp[47]) & tmp[184]) ^ (tmp[34] ^ tmp[134] & ~(tmp[166] & tmp[118] ^ (tmp[65] ^ tmp[67] & tmp[68] ^ tmp[65] & tmp[184]))));
        tmp[118] = tmp[158] | tmp[44];
        tmp[47] = tmp[158] & tmp[44];
        tmp[142] = tmp[16] ^ (tmp[21] & tmp[138] ^ (tmp[7] ^ tmp[147]) ^ tmp[2] & ~(tmp[177] ^ tmp[21] & (tmp[120] | tmp[142])) ^ tmp[10] & ~(tmp[78] ^ tmp[21] & tmp[128] ^ tmp[2] & ~(tmp[119] ^ tmp[21] & ~(tmp[35] ^ tmp[171]))));
        tmp[128] = ~tmp[61];
        tmp[16] = tmp[61] ^ tmp[80];
        tmp[34] = ~tmp[18];
        tmp[9] = tmp[18] & tmp[11];
        tmp[55] = tmp[39] & tmp[80];
        tmp[69] = tmp[104] | tmp[80];
        tmp[20] = tmp[61] & tmp[80];
        tmp[189] = tmp[61] | tmp[80];
        tmp[83] = tmp[117] & tmp[29];
        tmp[172] = tmp[158] ^ tmp[44];
        tmp[64] = ~tmp[89];
        tmp[60] = ~tmp[169];
        tmp[129] = tmp[31] ^ (tmp[17] ^ tmp[124] & ~tmp[129]);
        tmp[17] = ~tmp[80];
        tmp[31] = ~tmp[29];
        tmp[94] = tmp[29] ^ tmp[142];
        tmp[82] = tmp[130] & tmp[118];
        tmp[1] = tmp[29] | tmp[142];
        tmp[121] = tmp[29] & tmp[142];
        tmp[77] = tmp[80] & tmp[128];
        tmp[84] = tmp[11] & tmp[34];
        tmp[3] = tmp[39] & tmp[20];
        tmp[98] = ~tmp[67];
        tmp[164] = tmp[158] & ~tmp[44];
        tmp[56] = tmp[104] ^ tmp[16];
        tmp[76] = tmp[61] & tmp[17];
        tmp[155] = tmp[142] & tmp[31];
        tmp[159] = tmp[117] & tmp[94];
        tmp[193] = tmp[117] & tmp[31];
        tmp[5] = tmp[83] ^ tmp[94];
        tmp[51] = tmp[117] & tmp[1];
        tmp[40] = tmp[104] & tmp[77];
        tmp[135] = tmp[104] | tmp[77];
        tmp[185] = ~tmp[129];
        tmp[171] = tmp[21] & tmp[42] ^ tmp[2] & ~(tmp[148] ^ tmp[21] & (tmp[148] ^ tmp[78])) ^ (tmp[119] ^ (tmp[54] ^ tmp[10] & (tmp[191] ^ (tmp[7] ^ tmp[21] & ~tmp[35]) ^ tmp[2] & ~(tmp[194] ^ tmp[23] ^ tmp[21] & ~(tmp[171] ^ tmp[97])))));
        tmp[23] = tmp[158] & ~tmp[47];
        tmp[194] = tmp[21] & ~tmp[138] ^ (tmp[95] ^ tmp[120] & ~tmp[73] ^ (tmp[10] & (tmp[120] & tmp[161] ^ (tmp[194] ^ tmp[21] & ~tmp[97]) ^ tmp[2] & ~(tmp[21] & (tmp[194] ^ tmp[97]) ^ (tmp[194] ^ tmp[191]))) ^ (tmp[48] ^ tmp[2] & (tmp[177] ^ tmp[21] & ~(tmp[148] ^ tmp[147])))));
        tmp[147] = ~tmp[121];
        tmp[191] = tmp[29] ^ tmp[159];
        tmp[161] = tmp[117] & ~tmp[94];
        tmp[94] ^= tmp[193];
        tmp[177] = tmp[17] & tmp[194];
        tmp[73] = tmp[80] | tmp[194];
        tmp[48] = tmp[29] & tmp[147];
        tmp[97] = tmp[122] & tmp[7] ^ (tmp[21] & ~tmp[42] ^ (tmp[2] & (tmp[148] ^ tmp[21] & tmp[0]) ^ (tmp[108] ^ tmp[10] & ~(tmp[0] ^ (tmp[21] & tmp[99] ^ tmp[2] & ~(tmp[148] ^ tmp[21] & tmp[97]))))));
        tmp[99] = ~tmp[194];
        tmp[0] = tmp[80] ^ tmp[194];
        tmp[108] = tmp[61] & ~tmp[76];
        tmp[42] = tmp[121] ^ tmp[117] & tmp[155];
        tmp[159] = tmp[14] | tmp[142] ^ tmp[159];
        tmp[155] ^= tmp[117] & tmp[121] ^ (tmp[14] | tmp[29]);
        tmp[121] = tmp[34] & tmp[97];
        tmp[7] = tmp[18] | tmp[97];
        tmp[122] = tmp[8] | tmp[97];
        tmp[95] = tmp[28] | tmp[97];
        tmp[138] = tmp[91] | tmp[97];
        tmp[35] = ~tmp[177];
        tmp[78] = tmp[80] & tmp[99];
        tmp[54] = ~tmp[97];
        tmp[119] = tmp[18] ^ tmp[97];
        tmp[38] = tmp[11] & tmp[121];
        tmp[112] = tmp[194] & tmp[35];
        tmp[151] = tmp[18] & tmp[54];
        tmp[174] = tmp[28] & tmp[54];
        tmp[86] = tmp[72] & tmp[54];
        tmp[87] = tmp[113] & tmp[54];
        tmp[132] = tmp[72] ^ tmp[122];
        tmp[13] = tmp[30] ^ (tmp[109] ^ ((tmp[25] | tmp[81] ^ (tmp[32] ^ (tmp[101] ^ tmp[32] | tmp[116]))) ^ ((tmp[181] | tmp[116]) ^ (tmp[59] ^ tmp[134] & ~(tmp[115] ^ (tmp[181] & tmp[184] ^ tmp[166] & (tmp[52] ^ (tmp[65] & tmp[68] ^ tmp[13]))))))));
        tmp[52] = tmp[9] ^ tmp[119];
        tmp[184] = tmp[11] & tmp[151];
        tmp[181] = tmp[11] & (tmp[121] | tmp[54]);
        tmp[115] = tmp[11] & ~tmp[7];
        tmp[32] = tmp[91] & (tmp[163] & tmp[54]);
        tmp[59] = tmp[100] & (tmp[41] ^ tmp[95]);
        tmp[8] ^= tmp[174];
        tmp[81] = tmp[113] ^ tmp[87];
        tmp[109] = tmp[111] ^ tmp[138] ^ (tmp[67] | tmp[41] ^ (tmp[41] | tmp[97]));
        tmp[30] = ~tmp[13];
        tmp[24] = tmp[175] ^ tmp[32];
        tmp[149] = tmp[77] & tmp[30];
        tmp[111] = tmp[22] ^ (tmp[109] ^ (tmp[59] ^ tmp[18] & ((tmp[67] | tmp[111] ^ tmp[174]) ^ (tmp[132] ^ tmp[100] & ~(tmp[41] ^ (tmp[111] | tmp[97]))))));
        tmp[138] = tmp[98] & (tmp[113] ^ tmp[95]) ^ tmp[8] ^ (tmp[100] & (tmp[175] ^ (tmp[67] | tmp[113] ^ tmp[138])) ^ (tmp[21] ^ tmp[18] & ~(tmp[24] ^ tmp[98] & tmp[81] ^ tmp[100] & ~(tmp[91] ^ (tmp[91] | tmp[67]) ^ tmp[86]))));
        tmp[81] = tmp[175] ^ tmp[86] ^ tmp[98] & (tmp[72] ^ tmp[87]) ^ (tmp[100] & ~((tmp[67] | tmp[97]) ^ tmp[132]) ^ (tmp[96] ^ tmp[18] & ~(tmp[67] & ~(tmp[113] ^ (tmp[113] | tmp[97])) ^ tmp[100] & (tmp[67] & tmp[54] ^ tmp[81]))));
        tmp[132] = ~tmp[111];
        tmp[40] = tmp[56] ^ ~(tmp[80] ^ tmp[69]) & tmp[13] ^ (tmp[171] & (tmp[40] ^ ~(tmp[69] ^ tmp[76]) & tmp[13]) ^ (tmp[123] ^ tmp[89] & ~((tmp[20] ^ tmp[3]) & tmp[30] ^ tmp[171] & ~(tmp[40] ^ ~tmp[16] & tmp[13]))));
        tmp[108] = tmp[80] ^ ((tmp[61] ^ tmp[55] | tmp[13]) ^ ((tmp[104] | tmp[108]) ^ (tmp[171] & ~(tmp[16] & tmp[13]) ^ (tmp[134] ^ tmp[89] & (tmp[189] ^ (tmp[3] ^ ((tmp[189] ^ tmp[135] | tmp[13]) ^ ~tmp[108] & (tmp[171] & tmp[13]))))))));
        tmp[134] = ~tmp[40];
        tmp[76] = (tmp[80] ^ tmp[55] | tmp[13]) ^ (tmp[77] ^ (tmp[3] ^ (tmp[171] & ~(tmp[61] & (tmp[39] ^ tmp[17]) ^ (tmp[189] ^ tmp[39] & tmp[76]) & tmp[30]) ^ (tmp[140] ^ tmp[89] & (tmp[135] ^ tmp[171] & ~(tmp[37] ^ (tmp[189] | tmp[13])))))));
        tmp[39] = tmp[111] | tmp[76];
        tmp[32] = tmp[100] & ~tmp[24] ^ (tmp[122] ^ (tmp[113] ^ ((tmp[67] | tmp[8]) ^ (tmp[68] ^ tmp[18] & (tmp[28] ^ (tmp[91] & (tmp[98] & tmp[54]) ^ tmp[100] & ~(tmp[28] ^ tmp[32])))))));
        tmp[189] = tmp[56] ^ ((tmp[77] ^ (tmp[104] | tmp[16])) & tmp[30] ^ (tmp[171] & ~(tmp[189] ^ (tmp[135] ^ tmp[37] & tmp[13])) ^ (tmp[10] ^ tmp[89] & ~(tmp[104] ^ (tmp[104] & tmp[149] ^ tmp[171] & (tmp[189] ^ (tmp[104] | tmp[189]) ^ tmp[149]))))));
        tmp[149] = ~tmp[76];
        tmp[37] = tmp[111] & tmp[149];
        tmp[135] = ~tmp[32];
        tmp[16] = ~tmp[189];
        tmp[77] = tmp[90] ^ tmp[152];
        tmp[56] = tmp[10] ^ (tmp[74] ^ tmp[77]);
        tmp[28] = tmp[25] | tmp[56];
        tmp[54] = tmp[166] & tmp[56];
        tmp[56] ^= tmp[28];
        tmp[153] = (tmp[65] | tmp[153] ^ (tmp[25] | tmp[153])) ^ tmp[77] ^ (tmp[126] ^ tmp[43] & (tmp[143] ^ (tmp[25] | tmp[150]) ^ tmp[160] & (tmp[28] ^ (tmp[10] | tmp[28]))));
        tmp[126] = tmp[45] & tmp[153];
        tmp[77] = tmp[45] | tmp[153];
        tmp[98] = ~tmp[153];
        tmp[68] = tmp[45] ^ tmp[153];
        tmp[36] = tmp[90] ^ (tmp[170] ^ tmp[43] & (tmp[74] & tmp[136] ^ tmp[150] ^ (tmp[65] | tmp[150] ^ tmp[10] & (tmp[25] | tmp[36]))) ^ tmp[160] & (tmp[150] ^ tmp[10] & ~(tmp[143] ^ tmp[54])));
        tmp[43] = tmp[61] & tmp[126];
        tmp[170] = tmp[187] & tmp[77];
        tmp[90] = ~tmp[126];
        tmp[8] = tmp[61] ^ tmp[126];
        tmp[113] = tmp[45] & tmp[98];
        tmp[191] = tmp[50] & tmp[5] ^ (tmp[142] ^ tmp[161]) ^ (tmp[191] ^ (tmp[14] | tmp[191]) | tmp[153]);
        tmp[24] = tmp[61] & tmp[68];
        tmp[122] = tmp[172] | tmp[36];
        tmp[140] = tmp[158] | tmp[36];
        tmp[3] = ~tmp[36];
        tmp[55] = tmp[45] & tmp[90];
        tmp[176] = ~tmp[74] & tmp[10] ^ tmp[152] ^ (tmp[160] & (tmp[176] ^ tmp[136] & (tmp[150] ^ tmp[54])) ^ (tmp[157] ^ (tmp[2] | (tmp[65] | ~tmp[176] & tmp[10] ^ tmp[28]) ^ (tmp[25] ^ tmp[10] & ~tmp[56]))));
        tmp[28] = tmp[150] ^ tmp[63] ^ tmp[10] & ~(tmp[143] ^ tmp[63]) ^ ((tmp[65] | tmp[143] & ~tmp[192] ^ tmp[10] & ~(tmp[25] ^ ~tmp[143] & tmp[150])) ^ (tmp[182] ^ (tmp[2] | tmp[10] & ((tmp[143] ^ tmp[166]) & tmp[150]) ^ tmp[56] ^ tmp[160] & (tmp[74] ^ (tmp[10] | tmp[150] ^ tmp[28])))));
        tmp[166] = tmp[158] & tmp[3];
        tmp[10] = tmp[118] & tmp[3];
        tmp[74] = tmp[99] & tmp[176];
        tmp[17] &= tmp[176];
        tmp[160] = tmp[35] & tmp[176];
        tmp[56] = tmp[0] & tmp[176];
        tmp[192] = ~tmp[0] & tmp[176];
        tmp[63] = tmp[80] & tmp[176];
        tmp[187] = tmp[187] & tmp[61] ^ tmp[55];
        tmp[182] = tmp[41] & tmp[28];
        tmp[54] = tmp[41] | tmp[28];
        tmp[136] = ~tmp[28];
        tmp[157] = tmp[41] ^ tmp[28];
        tmp[152] = tmp[158] & tmp[56];
        tmp[55] = tmp[61] & ~tmp[55];
        tmp[20] = tmp[169] | tmp[187];
        tmp[69] = tmp[190] & tmp[182];
        tmp[123] = tmp[190] & tmp[54];
        tmp[163] &= tmp[54];
        tmp[87] = tmp[112] ^ tmp[17];
        tmp[72] = tmp[182] ^ tmp[69];
        tmp[96] = tmp[190] & tmp[136];
        tmp[136] &= tmp[12];
        tmp[86] = tmp[33] ^ tmp[153] ^ tmp[20];
        tmp[175] = tmp[41] & ~tmp[182];
        tmp[95] = tmp[190] ^ tmp[163];
        tmp[21] = tmp[165] ^ tmp[163];
        tmp[193] = tmp[5] ^ tmp[14] & tmp[193] ^ ((tmp[142] ^ (tmp[14] | tmp[94])) & tmp[98] ^ (tmp[6] ^ tmp[185] & ((tmp[14] | tmp[142] ^ tmp[193]) ^ (tmp[142] ^ tmp[117] & ~tmp[1]) ^ (tmp[142] ^ tmp[159] | tmp[153]))));
        tmp[31] = tmp[191] ^ (tmp[58] ^ (tmp[129] | tmp[42] ^ (tmp[14] & ~(tmp[83] ^ tmp[31] & tmp[1]) ^ (tmp[42] ^ tmp[50] & tmp[94] | tmp[153]))));
        tmp[83] = tmp[28] ^ tmp[96];
        tmp[42] = tmp[32] | tmp[193];
        tmp[140] = tmp[10] ^ (tmp[23] ^ tmp[145] & tmp[122]) ^ tmp[85] & (tmp[172] ^ tmp[140] ^ tmp[145] & (tmp[23] ^ tmp[140]));
        tmp[58] = ~tmp[193];
        tmp[6] = tmp[32] ^ tmp[193];
        tmp[5] = ~tmp[31];
        tmp[155] = tmp[14] ^ tmp[48] ^ (tmp[117] & tmp[147] ^ ((tmp[1] ^ tmp[51] ^ tmp[50] & (tmp[29] ^ tmp[117] & ~tmp[142])) & tmp[98] ^ (tmp[156] ^ (tmp[129] | tmp[155] ^ (tmp[155] | tmp[153])))));
        tmp[50] = tmp[117] | tmp[43] ^ tmp[30] & (tmp[126] ^ (tmp[60] & tmp[8] ^ tmp[61] & ~tmp[68]));
        tmp[1] = tmp[190] & ~tmp[175];
        tmp[116] ^= (tmp[117] | tmp[60] & tmp[113] ^ (tmp[13] | tmp[61] & tmp[60] ^ tmp[43]) ^ tmp[55]) ^ (tmp[86] ^ tmp[13] & (tmp[45] ^ tmp[61] ^ (tmp[169] | tmp[45] & (tmp[61] ^ tmp[90]))));
        tmp[156] = tmp[32] & tmp[58];
        tmp[48] = tmp[2] ^ (tmp[191] ^ tmp[129] & ~(tmp[94] ^ ((tmp[14] | tmp[161]) ^ (tmp[159] ^ (tmp[51] ^ tmp[48])) & tmp[98])));
        tmp[51] = ~tmp[155];
        tmp[184] = tmp[143] ^ (tmp[52] ^ (tmp[18] ^ tmp[184] | tmp[36]) ^ tmp[26] & ~((tmp[18] & tmp[97] ^ tmp[184]) & tmp[36]) ^ tmp[85] & ~(tmp[26] & tmp[34] ^ (tmp[181] ^ tmp[151] & tmp[36])));
        tmp[143] = tmp[32] & tmp[116];
        tmp[159] = ~tmp[116];
        tmp[170] ^= (tmp[13] | tmp[153] ^ (tmp[43] ^ tmp[60] & (tmp[128] & tmp[153]))) ^ (tmp[169] ^ tmp[55]) ^ (tmp[188] ^ (tmp[117] | (tmp[169] | tmp[33] ^ tmp[126]) ^ (tmp[77] ^ tmp[61] & tmp[113]) ^ (tmp[13] | tmp[153] ^ (tmp[169] | tmp[170] ^ tmp[24]))));
        tmp[130] = tmp[172] ^ tmp[10] ^ tmp[145] & ~(tmp[130] & tmp[44] ^ (tmp[44] | tmp[36])) ^ tmp[85] & (tmp[164] ^ tmp[145] & ~(tmp[82] ^ tmp[166]));
        tmp[164] = tmp[118] ^ tmp[36] ^ tmp[145] & ~(tmp[82] ^ tmp[44] & tmp[3]) ^ tmp[85] & ~(tmp[23] ^ (tmp[164] & tmp[3] ^ tmp[145] & (tmp[118] ^ tmp[122])));
        tmp[82] = tmp[48] & tmp[184];
        tmp[10] = tmp[48] | tmp[184];
        tmp[113] = ~tmp[48];
        tmp[126] = tmp[48] ^ tmp[184];
        tmp[166] = tmp[85] & (tmp[44] ^ (tmp[23] | tmp[36]) ^ tmp[145] & ~(tmp[47] ^ tmp[122])) ^ ((tmp[118] | tmp[36]) ^ (tmp[172] ^ tmp[145] & ~(tmp[158] ^ tmp[166])));
        tmp[8] = (tmp[169] | tmp[8]) ^ (tmp[13] ^ (tmp[61] ^ tmp[77])) ^ (tmp[150] ^ tmp[50]);
        tmp[50] = tmp[31] & tmp[170];
        tmp[150] = tmp[5] & tmp[170];
        tmp[122] = tmp[31] | tmp[170];
        tmp[120] ^= tmp[99] & tmp[140] ^ tmp[166];
        tmp[47] = ~tmp[170];
        tmp[23] = tmp[31] ^ tmp[170];
        tmp[172] = tmp[10] & tmp[113];
        tmp[151] = tmp[11] ^ tmp[7] ^ ((tmp[11] ^ tmp[34]) & tmp[97] | tmp[36]) ^ tmp[26] & (tmp[52] ^ (tmp[97] ^ tmp[38] | tmp[36])) ^ (tmp[173] ^ tmp[85] & ~(tmp[34] & (tmp[11] ^ tmp[97]) & tmp[3] ^ tmp[26] & (tmp[9] ^ tmp[121] ^ (tmp[84] ^ tmp[151]) & tmp[3])));
        tmp[121] = tmp[48] & ~tmp[184];
        tmp[9] = tmp[18] ^ tmp[11] ^ tmp[97] ^ (tmp[115] | tmp[36]) ^ (tmp[26] & (tmp[115] ^ tmp[97] & tmp[36]) ^ (tmp[141] ^ tmp[85] & ~(tmp[26] & ~(~tmp[9] & tmp[36]) ^ (tmp[11] ^ tmp[115] & tmp[3]))));
        tmp[20] = tmp[86] ^ tmp[30] & (tmp[68] ^ tmp[61] & tmp[90] ^ (tmp[169] | tmp[77] ^ tmp[24])) ^ (tmp[19] ^ ~tmp[117] & (tmp[60] & tmp[187] ^ (tmp[13] | tmp[77] ^ tmp[20])));
        tmp[77] = tmp[48] | tmp[8];
        tmp[24] = tmp[184] | tmp[8];
        tmp[90] = tmp[5] & tmp[122];
        tmp[140] = tmp[166] ^ (tmp[101] ^ tmp[194] & ~tmp[140]);
        tmp[101] = tmp[81] & tmp[120];
        tmp[119] = tmp[181] ^ (tmp[97] ^ tmp[18] & tmp[3]) ^ (tmp[26] & ~(tmp[38] ^ (tmp[18] ^ (tmp[18] | tmp[36]))) ^ (tmp[183] ^ tmp[85] & ~(tmp[18] ^ (tmp[84] ^ (tmp[97] ^ (tmp[18] ^ tmp[11] & ~tmp[119]) | tmp[36])) ^ tmp[26] & (tmp[18] ^ (tmp[84] ^ (tmp[84] ^ tmp[7] | tmp[36]))))));
        tmp[7] = ~tmp[8];
        tmp[84] = tmp[48] & ~tmp[82];
        tmp[38] = ~tmp[120];
        tmp[3] = tmp[120] ^ tmp[20];
        tmp[183] = tmp[120] ^ tmp[101];
        tmp[181] = ~tmp[6] & tmp[9];
        tmp[166] = tmp[42] & tmp[9];
        tmp[187] = ~tmp[42] & tmp[9];
        tmp[60] = tmp[32] & tmp[9];
        tmp[68] = tmp[113] & tmp[20];
        tmp[30] = tmp[48] & tmp[20];
        tmp[19] = tmp[120] & tmp[20];
        tmp[86] = tmp[120] | tmp[20];
        tmp[115] = tmp[81] & tmp[20];
        tmp[141] = tmp[51] & tmp[119];
        tmp[34] = tmp[155] & tmp[119];
        tmp[52] = tmp[155] | tmp[119];
        tmp[173] = ~tmp[20];
        tmp[118] = tmp[48] & tmp[7];
        tmp[7] &= tmp[184];
        tmp[33] = tmp[77] ^ tmp[84];
        tmp[128] = ~tmp[140];
        tmp[43] = tmp[20] & tmp[38];
        tmp[55] = tmp[81] & tmp[38];
        tmp[188] = ~tmp[119];
        tmp[98] = tmp[155] ^ tmp[119];
        tmp[75] ^= tmp[158] & ~tmp[63] ^ (tmp[80] ^ (tmp[194] ^ tmp[17])) ^ (tmp[146] & ~(tmp[192] ^ tmp[158] & ~(tmp[194] ^ tmp[192])) ^ (tmp[89] | tmp[146] & (tmp[194] ^ (tmp[17] ^ tmp[158] & (tmp[80] ^ tmp[74])))));
        tmp[99] = tmp[164] ^ (tmp[125] ^ tmp[99] & tmp[130]);
        tmp[125] = tmp[48] ^ tmp[68];
        tmp[161] = ~tmp[19];
        tmp[94] = tmp[120] & tmp[173];
        tmp[191] = tmp[81] & tmp[43];
        tmp[2] = tmp[52] & tmp[188];
        tmp[147] = tmp[155] & tmp[188];
        tmp[174] = ~tmp[52];
        tmp[35] = tmp[80] ^ (tmp[194] ^ (tmp[158] & tmp[35] ^ tmp[73] & tmp[176])) ^ (tmp[146] & ~(tmp[73] ^ tmp[152]) ^ (tmp[186] ^ tmp[64] & (tmp[160] ^ (tmp[158] | tmp[160]) ^ tmp[146] & (tmp[73] ^ tmp[158] & (tmp[177] ^ tmp[56])))));
        tmp[186] = tmp[121] ^ tmp[118];
        tmp[59] = tmp[149] & tmp[99];
        tmp[109] = tmp[76] | tmp[99];
        tmp[22] = tmp[111] & tmp[99];
        tmp[92] = tmp[111] | tmp[99];
        tmp[103] = tmp[81] & ~tmp[3];
        tmp[87] ^= (tmp[158] | tmp[78] ^ tmp[56]) ^ (tmp[146] & (tmp[0] ^ tmp[194] & tmp[176] ^ tmp[158] & (tmp[80] & tmp[194] ^ tmp[192])) ^ (tmp[65] ^ tmp[64] & (tmp[78] ^ (~tmp[78] & tmp[176] ^ tmp[152]) ^ tmp[146] & ~(tmp[158] & tmp[73] ^ tmp[87]))));
        tmp[152] = tmp[120] & tmp[161];
        tmp[161] &= tmp[81];
        tmp[0] = tmp[81] & ~tmp[86];
        tmp[64] = tmp[99] ^ tmp[109];
        tmp[56] = ~tmp[99];
        tmp[65] = tmp[111] ^ tmp[99];
        tmp[130] = tmp[164] ^ (tmp[53] ^ tmp[194] & ~tmp[130]);
        tmp[53] = tmp[119] & ~tmp[34];
        tmp[164] = tmp[188] & tmp[35];
        tmp[154] = tmp[34] & tmp[35];
        tmp[167] = tmp[155] & tmp[35];
        tmp[162] = tmp[147] & tmp[35];
        tmp[179] = tmp[94] ^ tmp[191];
        tmp[127] = tmp[189] | tmp[186];
        tmp[79] = tmp[16] & tmp[186];
        tmp[46] = tmp[149] & tmp[22];
        tmp[105] = tmp[132] & tmp[59];
        tmp[137] = tmp[35] & ~tmp[98];
        tmp[17] = tmp[148] ^ tmp[146] & (tmp[73] ^ tmp[74] ^ tmp[158] & ~(tmp[78] ^ tmp[192])) ^ (tmp[177] ^ tmp[63] ^ tmp[158] & (tmp[78] ^ ~tmp[112] & tmp[176]) ^ (tmp[89] | tmp[160] ^ tmp[158] & ~(tmp[80] ^ tmp[160]) ^ tmp[146] & ~(tmp[73] ^ tmp[158] & ~(tmp[80] ^ tmp[17]))));
        tmp[160] = tmp[32] & tmp[87];
        tmp[73] = tmp[32] | tmp[87];
        tmp[112] = tmp[135] & tmp[87];
        tmp[192] = ~tmp[35];
        tmp[12] = tmp[163] ^ tmp[1] ^ tmp[14] & ~(tmp[96] ^ tmp[114] & (tmp[41] ^ tmp[190] & ~tmp[54])) ^ (tmp[114] & (tmp[12] ^ tmp[28]) ^ (tmp[102] ^ (tmp[129] | tmp[72] ^ tmp[114] & (tmp[165] ^ tmp[28]) ^ tmp[14] & ~(tmp[72] ^ (tmp[91] | tmp[12] ^ tmp[182])))));
        tmp[59] ^= tmp[22];
        tmp[72] = tmp[111] & tmp[56];
        tmp[102] = tmp[76] ^ tmp[92];
        tmp[163] = tmp[149] & tmp[65];
        tmp[78] = tmp[86] ^ tmp[103];
        tmp[74] = tmp[156] ^ tmp[166] ^ tmp[75] & ~tmp[60];
        tmp[63] = tmp[135] & tmp[193] ^ tmp[156] & tmp[9] ^ tmp[75] & (tmp[42] ^ tmp[135] & tmp[9]);
        tmp[60] ^= tmp[6] ^ tmp[75] & (tmp[32] ^ tmp[6] & tmp[9]);
        tmp[177] = ~tmp[87];
        tmp[148] = tmp[38] & tmp[86] ^ tmp[161];
        tmp[178] = tmp[65] ^ (tmp[76] | tmp[92]);
        tmp[66] = tmp[187] ^ tmp[75] & ~(tmp[42] ^ tmp[9]);
        tmp[133] = tmp[48] | tmp[17];
        tmp[180] = tmp[113] & tmp[17];
        tmp[71] = tmp[48] & tmp[17];
        tmp[49] = tmp[116] & tmp[112];
        tmp[106] = tmp[119] ^ tmp[164];
        tmp[57] = tmp[122] & tmp[12];
        tmp[131] = tmp[5] & tmp[12];
        tmp[93] = tmp[23] & tmp[12];
        tmp[107] = tmp[149] & tmp[72];
        tmp[15] = tmp[111] & ~tmp[22];
        tmp[70] = tmp[48] ^ tmp[17];
        tmp[168] = tmp[116] & tmp[177];
        tmp[4] = tmp[32] & tmp[177];
        tmp[144] = tmp[155] ^ (tmp[119] ^ tmp[35]);
        tmp[88] = ~tmp[156] & tmp[9] ^ (tmp[42] ^ tmp[32] & tmp[75]);
        tmp[62] = tmp[170] ^ tmp[12];
        tmp[27] = tmp[122] ^ tmp[12];
        tmp[156] = tmp[32] & tmp[193] ^ tmp[166] ^ tmp[75] & ~(tmp[156] ^ tmp[193] & tmp[9]);
        tmp[58] = tmp[58] & tmp[9] ^ tmp[75] & ~(tmp[193] ^ tmp[181]);
        tmp[181] = tmp[6] ^ tmp[187] ^ tmp[75] & ~(tmp[42] ^ tmp[181]);
        tmp[113] &= tmp[133];
        tmp[42] = tmp[20] & tmp[133];
        tmp[187] = tmp[20] & tmp[180];
        tmp[6] = tmp[32] ^ (tmp[116] ^ tmp[87]);
        tmp[166] = ~tmp[71];
        tmp[139] = tmp[48] & ~tmp[17];
        tmp[195] = tmp[20] & tmp[70];
        tmp[196] = tmp[87] & ~tmp[160];
        tmp[197] = tmp[116] & tmp[4];
        tmp[198] = tmp[50] ^ tmp[31] & tmp[12];
        tmp[83] = tmp[157] ^ tmp[136] ^ ((tmp[91] | tmp[190] & tmp[157]) ^ (tmp[14] & ~(tmp[69] ^ tmp[114] & tmp[83]) ^ (tmp[25] ^ tmp[185] & (tmp[83] ^ tmp[14] & ~(tmp[28] ^ tmp[69] ^ tmp[114] & tmp[95])))));
        tmp[185] = tmp[87] ^ tmp[168];
        tmp[25] = tmp[20] & ~tmp[133];
        tmp[199] = tmp[133] ^ tmp[187];
        tmp[200] = tmp[20] & tmp[166];
        tmp[166] &= tmp[48];
        tmp[201] = tmp[20] & tmp[139];
        tmp[202] = tmp[119] | tmp[198];
        tmp[203] = tmp[188] & (tmp[170] ^ tmp[47] & tmp[12]);
        tmp[177] &= tmp[83];
        tmp[204] = tmp[20] & ~tmp[70];
        tmp[1] = tmp[190] ^ (tmp[114] & tmp[157] ^ (tmp[110] ^ (tmp[129] | tmp[21] ^ tmp[114] & (tmp[190] ^ tmp[54]) ^ tmp[14] & (tmp[28] ^ tmp[136] ^ (tmp[91] | tmp[95]))) ^ tmp[14] & ~(tmp[28] ^ (tmp[41] ^ tmp[69]) ^ (tmp[91] | tmp[28] ^ (tmp[41] ^ tmp[1])))));
        tmp[175] = tmp[165] & tmp[28] ^ tmp[157] ^ ((tmp[91] | tmp[182] ^ tmp[123]) ^ (tmp[14] & (tmp[157] ^ tmp[96] ^ tmp[114] & (tmp[54] ^ tmp[123])) ^ (tmp[124] ^ (tmp[129] | tmp[91] & tmp[190] ^ tmp[21] ^ tmp[14] & ~(tmp[182] ^ tmp[136] ^ (tmp[91] | tmp[165] ^ tmp[175]))))));
        tmp[165] = ~tmp[83];
        tmp[136] = tmp[20] & ~tmp[113];
        tmp[182] = tmp[116] & ~tmp[196];
        tmp[21] = ~tmp[1];
        tmp[123] = ~tmp[175];
        tmp[79] = tmp[82] ^ tmp[77] ^ tmp[127] ^ tmp[87] & (tmp[189] | ~tmp[186]) ^ (tmp[153] ^ (tmp[48] ^ (tmp[126] | tmp[8]) ^ tmp[79] ^ tmp[87] & (tmp[184] ^ tmp[24] ^ tmp[79]) | tmp[83]));
        tmp[173] = tmp[40] & ~tmp[115] ^ tmp[179] ^ tmp[151] & ~(tmp[81] & tmp[40] ^ tmp[148]) ^ (tmp[45] ^ (tmp[151] & (tmp[134] & tmp[183]) ^ (tmp[183] ^ tmp[81] & (tmp[40] & tmp[173])) | tmp[1]));
        tmp[183] = ~tmp[79];
        tmp[176] ^= tmp[189] ^ tmp[33] ^ tmp[87] & (tmp[16] & tmp[126] ^ (tmp[10] ^ tmp[118])) ^ (tmp[172] ^ tmp[189] & tmp[77] ^ tmp[87] & ~((tmp[189] | tmp[10] ^ tmp[8]) ^ tmp[33])) & tmp[165];
        tmp[77] = (tmp[189] | tmp[33]) ^ (tmp[8] ^ tmp[172] ^ tmp[87] & ~(tmp[189] & (tmp[48] ^ tmp[77]))) ^ (tmp[36] ^ (tmp[87] & ~(tmp[189] | tmp[184] ^ tmp[77]) ^ (tmp[184] ^ (tmp[77] ^ tmp[189] & ~(tmp[10] ^ tmp[77])))) & tmp[165]);
        tmp[172] = ~tmp[173];
        tmp[127] = tmp[126] ^ tmp[8] ^ (tmp[189] | tmp[121] ^ (tmp[8] | tmp[84])) ^ tmp[87] & ~(tmp[7] ^ tmp[16] & (tmp[24] ^ tmp[84])) ^ (tmp[28] ^ (tmp[83] | tmp[189] & ~(tmp[10] ^ tmp[7]) ^ tmp[87] & ~(tmp[118] ^ tmp[127])));
        tmp[118] = ~tmp[127];
        tmp[91] ^= tmp[27] ^ tmp[203] ^ ((tmp[35] | tmp[188] & (tmp[150] ^ ~tmp[23] & tmp[12])) ^ (tmp[99] | (tmp[170] | tmp[119]) ^ (tmp[35] | tmp[150] & tmp[12] ^ tmp[202])));
        tmp[14] ^= tmp[81] & ~(tmp[40] & tmp[174] ^ tmp[162]) ^ (tmp[40] & ~tmp[2] ^ (tmp[155] ^ tmp[137]) ^ tmp[130] & (tmp[81] & (tmp[40] & tmp[34] ^ tmp[164]) ^ (tmp[119] ^ (tmp[164] ^ tmp[40] & ~(tmp[141] & tmp[35])))));
        tmp[80] ^= tmp[74] ^ (~tmp[63] & tmp[175] ^ tmp[159] & (tmp[181] ^ tmp[60] & tmp[175]));
        tmp[11] ^= tmp[88] ^ (tmp[156] & tmp[175] ^ (tmp[116] | tmp[66] ^ tmp[58] & tmp[175]));
        tmp[27] = tmp[150] ^ tmp[57] ^ tmp[192] & (tmp[122] ^ ~tmp[122] & tmp[12]) ^ ((tmp[119] | tmp[62]) ^ (tmp[146] ^ (tmp[99] | tmp[62] ^ (tmp[203] ^ tmp[192] & (tmp[27] ^ tmp[188] & tmp[93])))));
        tmp[135] = tmp[6] ^ tmp[83] ^ ((tmp[140] | tmp[116] ^ tmp[83] & (tmp[4] ^ tmp[197])) ^ (tmp[158] ^ (tmp[108] | tmp[32] ^ tmp[143] ^ tmp[135] & tmp[83] ^ tmp[128] & (tmp[49] ^ tmp[177]))));
        tmp[112] = tmp[116] ^ tmp[73] ^ (tmp[128] & (tmp[185] ^ (tmp[116] & tmp[87] ^ tmp[160]) & tmp[83]) ^ (~tmp[49] & tmp[83] ^ (tmp[67] ^ (tmp[108] | tmp[168] ^ tmp[196] ^ tmp[140] & (tmp[112] & tmp[83])))));
        tmp[38] = tmp[148] ^ (tmp[40] & (tmp[115] ^ tmp[94]) ^ (tmp[151] & ~(tmp[179] ^ (tmp[40] | tmp[81] & tmp[19] ^ tmp[152])) ^ (tmp[44] ^ (tmp[81] & tmp[94] ^ (tmp[86] ^ tmp[151] & (tmp[40] & tmp[38])) ^ tmp[40] & ~(tmp[120] ^ tmp[191])) & tmp[21])));
        tmp[141] = tmp[144] ^ tmp[40] & ~tmp[167] ^ (tmp[81] & (tmp[162] ^ (tmp[147] ^ tmp[40] & (tmp[119] ^ tmp[167]))) ^ (tmp[104] ^ tmp[130] & ~(tmp[134] & (tmp[141] ^ tmp[154]) ^ tmp[81] & (tmp[164] ^ tmp[134] & (tmp[34] ^ tmp[164])))));
        tmp[0] = tmp[19] ^ (tmp[40] & ~tmp[152] ^ (tmp[81] & tmp[86] ^ (tmp[41] ^ (tmp[1] | tmp[151] & (tmp[134] & tmp[101]) ^ (tmp[78] ^ (tmp[40] | tmp[19] ^ tmp[0]))) ^ tmp[151] & (tmp[3] ^ (tmp[103] ^ tmp[40] & ~(tmp[86] ^ tmp[0]))))));
        tmp[86] = ~tmp[91];
        tmp[19] = tmp[80] | tmp[27];
        tmp[101] = tmp[80] & tmp[27];
        tmp[174] = tmp[81] & (tmp[155] ^ (tmp[40] | tmp[53] ^ tmp[137])) ^ (tmp[144] ^ tmp[134] & (tmp[52] ^ tmp[174] & tmp[35]) ^ (tmp[100] ^ tmp[130] & ~(tmp[81] & (tmp[155] ^ tmp[134] & tmp[2]) ^ (tmp[119] & tmp[192] ^ tmp[40] & ~tmp[106]))));
        tmp[137] = ~tmp[14];
        tmp[58] = tmp[88] ^ ((tmp[156] | tmp[175]) ^ (tmp[129] ^ (tmp[116] | tmp[66] ^ tmp[58] & tmp[123])));
        tmp[60] = tmp[74] ^ (tmp[63] & tmp[123] ^ (tmp[169] ^ tmp[159] & (tmp[181] ^ tmp[60] & tmp[123])));
        tmp[181] = ~tmp[80];
        tmp[169] = tmp[80] ^ tmp[27];
        tmp[63] = ~tmp[27];
        tmp[188] = tmp[23] ^ (tmp[202] ^ ((tmp[35] | tmp[57] ^ tmp[188] & tmp[198]) ^ (tmp[117] ^ (tmp[99] | tmp[170] ^ tmp[93] ^ tmp[188] & (tmp[150] ^ tmp[93]) ^ tmp[192] & (~tmp[90] & tmp[12] ^ tmp[188] & (tmp[50] ^ tmp[12]))))));
        tmp[93] = ~tmp[135];
        tmp[46] = tmp[102] ^ ((tmp[31] | tmp[111] ^ tmp[105]) ^ (tmp[175] | tmp[64] ^ tmp[5] & (tmp[37] ^ tmp[72]))) ^ (tmp[61] ^ tmp[9] & (tmp[46] ^ tmp[31] & ~(tmp[111] ^ tmp[46]) ^ (tmp[175] | tmp[99] ^ (tmp[37] ^ tmp[31] & ~(tmp[72] ^ (tmp[76] | tmp[65]))))));
        tmp[55] = tmp[78] ^ (tmp[40] & ~tmp[191] ^ (tmp[151] & (tmp[20] ^ tmp[161] ^ tmp[40] & (tmp[94] ^ tmp[161])) ^ (tmp[89] ^ tmp[21] & (tmp[179] ^ tmp[40] & (tmp[120] ^ tmp[81] & tmp[3]) ^ tmp[151] & (tmp[43] ^ (tmp[55] ^ tmp[40] & ~(tmp[120] ^ tmp[55])))))));
        tmp[180] = tmp[17] ^ (tmp[48] ^ (tmp[42] ^ tmp[120] & ~(tmp[71] ^ tmp[204]))) ^ (tmp[138] & (tmp[133] ^ (tmp[25] ^ tmp[120] & ~(tmp[133] ^ tmp[25]))) ^ (tmp[142] ^ (tmp[189] | tmp[138] & (tmp[120] & tmp[30] ^ tmp[180] ^ tmp[25]) ^ (tmp[70] ^ tmp[120] & (tmp[48] ^ tmp[204])))));
        tmp[142] = tmp[118] & tmp[0];
        tmp[3] = ~tmp[38];
        tmp[43] = tmp[112] & tmp[86];
        tmp[200] = tmp[138] & ~(tmp[125] ^ tmp[120] & tmp[199]) ^ (tmp[166] ^ (tmp[136] ^ tmp[120] & ~tmp[201])) ^ (tmp[194] ^ tmp[16] & (tmp[138] & (tmp[120] & ~tmp[125] ^ (tmp[48] ^ tmp[200])) ^ (tmp[199] ^ tmp[120] & ~(tmp[113] ^ tmp[200]))));
        tmp[199] = tmp[0] & tmp[58];
        tmp[194] = tmp[127] | tmp[58];
        tmp[179] = tmp[127] & tmp[58];
        tmp[161] = tmp[118] & tmp[58];
        tmp[94] = tmp[19] & tmp[181];
        tmp[50] = (tmp[90] | tmp[119]) ^ (tmp[12] ^ (tmp[31] & tmp[47] ^ (tmp[56] & (tmp[122] ^ tmp[131] ^ (tmp[119] | tmp[170] ^ tmp[131]) ^ (tmp[35] | tmp[170] ^ tmp[119] & tmp[198])) ^ (tmp[26] ^ tmp[192] & (tmp[170] ^ tmp[119] & ~(tmp[31] & ~tmp[50] ^ tmp[131]))))));
        tmp[131] = tmp[80] & tmp[63];
        tmp[198] = tmp[172] & tmp[188];
        tmp[122] = tmp[173] | tmp[188];
        tmp[192] = tmp[80] | tmp[55];
        tmp[26] = tmp[19] | tmp[55];
        tmp[56] = tmp[27] | tmp[55];
        tmp[47] = tmp[141] | tmp[55];
        tmp[90] = tmp[79] | tmp[180];
        tmp[106] = tmp[164] ^ (tmp[53] ^ tmp[40] & (tmp[98] ^ tmp[51] & tmp[35])) ^ (tmp[81] & ~(tmp[134] & (tmp[34] ^ tmp[154])) ^ (tmp[85] ^ tmp[130] & ~(tmp[81] & (tmp[134] & tmp[155] ^ tmp[2]) ^ (tmp[155] ^ tmp[52] & tmp[35] ^ tmp[40] & ~(tmp[155] ^ tmp[106])))));
        tmp[52] = ~tmp[58];
        tmp[134] = tmp[127] ^ tmp[58];
        tmp[2] = ~tmp[60];
        tmp[39] = tmp[65] ^ (tmp[31] & ~tmp[105] ^ ((tmp[37] ^ (tmp[39] | tmp[31])) & tmp[123] ^ (tmp[145] ^ tmp[9] & ~((tmp[76] | tmp[15]) ^ (tmp[22] ^ tmp[31] & tmp[163]) ^ (tmp[39] ^ tmp[149] & (tmp[111] & tmp[31]) | tmp[175])))));
        tmp[37] = ~tmp[188];
        tmp[145] = tmp[173] ^ tmp[188];
        tmp[105] = ~tmp[55];
        tmp[154] = ~tmp[180];
        tmp[34] = tmp[0] & tmp[179];
        tmp[51] = tmp[55] | tmp[94];
        tmp[98] = tmp[91] ^ tmp[43];
        tmp[125] = tmp[68] ^ tmp[133] ^ tmp[120] & (tmp[20] ^ tmp[70]) ^ (tmp[138] & ~(tmp[120] & (tmp[48] ^ tmp[187])) ^ (tmp[171] ^ (tmp[189] | tmp[71] ^ tmp[136] ^ tmp[120] & ~(tmp[17] ^ (tmp[48] ^ tmp[42])) ^ tmp[138] & ~(tmp[120] & tmp[125] ^ tmp[166] ^ tmp[20] & ~tmp[166]))));
        tmp[42] = ~tmp[200];
        tmp[4] = tmp[6] ^ ((tmp[83] | tmp[73] ^ tmp[197]) ^ (tmp[140] | tmp[197] ^ tmp[32] & tmp[165]) ^ (tmp[29] ^ ~tmp[108] & (tmp[185] ^ tmp[128] & (tmp[159] & tmp[73] ^ tmp[4] & tmp[83]) ^ tmp[83] & ~(tmp[32] ^ tmp[182]))));
        tmp[159] = tmp[38] | tmp[106];
        tmp[128] = ~tmp[77] & tmp[106];
        tmp[185] = tmp[77] | tmp[106];
        tmp[165] = tmp[77] & tmp[106];
        tmp[29] = tmp[127] & tmp[52];
        tmp[6] = ~tmp[50];
        tmp[136] = tmp[173] & tmp[37];
        tmp[73] = ~tmp[143] & tmp[83] ^ (tmp[49] ^ (tmp[160] ^ ((tmp[140] | (tmp[143] ^ tmp[87]) & tmp[83] ^ (tmp[87] ^ tmp[182])) ^ (tmp[13] ^ (tmp[108] | tmp[73] ^ tmp[168] ^ tmp[197] & tmp[83] ^ (tmp[140] | tmp[177] ^ (tmp[87] ^ tmp[116] & ~tmp[73])))))));
        tmp[177] = tmp[169] & tmp[105];
        tmp[197] = tmp[141] & tmp[105];
        tmp[168] = tmp[27] ^ tmp[56];
        tmp[30] = tmp[113] ^ tmp[195] ^ tmp[120] & ~(tmp[166] ^ tmp[201]) ^ (tmp[138] & (tmp[139] ^ tmp[195] ^ tmp[120] & (tmp[139] ^ tmp[25])) ^ (tmp[97] ^ tmp[16] & (tmp[120] & (tmp[70] ^ tmp[195]) ^ (tmp[133] ^ tmp[204]) ^ tmp[138] & ~(tmp[48] ^ (tmp[120] & (tmp[48] ^ tmp[30]) ^ tmp[204])))));
        tmp[204] = tmp[79] & tmp[154];
        tmp[195] = ~tmp[106];
        tmp[70] = tmp[77] ^ tmp[106];
        tmp[133] = ~tmp[134];
        tmp[25] = tmp[127] & tmp[0] ^ tmp[134];
        tmp[139] = tmp[183] & tmp[4];
        tmp[201] = tmp[79] | tmp[4];
        tmp[166] = tmp[90] | tmp[4];
        tmp[16] = tmp[38] | tmp[185];
        tmp[118] = ~(tmp[118] & tmp[194]);
        tmp[179] = tmp[0] & ~tmp[179];
        tmp[97] = tmp[0] & tmp[29];
        tmp[113] = tmp[141] & tmp[73];
        tmp[143] = tmp[188] & tmp[73];
        tmp[182] = tmp[141] | tmp[73];
        tmp[13] = tmp[37] & tmp[73];
        tmp[160] = tmp[55] | tmp[73];
        tmp[49] = tmp[105] & tmp[73];
        tmp[71] = tmp[173] & tmp[73];
        tmp[187] = ~tmp[141] & tmp[73];
        tmp[171] = tmp[198] & tmp[73];
        tmp[68] = tmp[136] & tmp[73];
        tmp[85] = ~tmp[122] & tmp[73];
        tmp[53] = tmp[145] & tmp[73];
        tmp[164] = tmp[79] ^ tmp[4];
        tmp[21] = tmp[77] & tmp[195];
        tmp[89] = tmp[0] & tmp[133];
        tmp[191] = ~tmp[136];
        tmp[78] = tmp[141] ^ tmp[73];
        tmp[61] = ~tmp[30];
        tmp[150] = tmp[204] ^ tmp[139];
        tmp[57] = tmp[154] & tmp[139];
        tmp[117] = tmp[188] | tmp[139];
        tmp[202] = tmp[180] | tmp[139];
        tmp[72] = tmp[92] ^ ((tmp[76] | tmp[22]) ^ (tmp[31] & (tmp[99] ^ tmp[107]) ^ (((tmp[76] | (tmp[31] | tmp[99])) ^ tmp[59]) & tmp[123] ^ (tmp[190] ^ tmp[9] & ~(tmp[5] & tmp[178] ^ (tmp[65] ^ tmp[163] ^ tmp[5] & tmp[72]) & tmp[123])))));
        tmp[5] = tmp[105] & tmp[113];
        tmp[190] = tmp[55] | tmp[187];
        tmp[109] = tmp[149] & tmp[92] ^ (tmp[15] ^ (tmp[31] & ~tmp[178] ^ ((tmp[175] | tmp[64] ^ tmp[31] & ~tmp[102]) ^ (tmp[18] ^ tmp[9] & ~(tmp[31] & tmp[59] ^ (tmp[132] & tmp[92] ^ tmp[107]) ^ tmp[123] & (tmp[65] ^ (tmp[163] ^ tmp[31] & ~(tmp[111] ^ tmp[109]))))))));
        tmp[163] = tmp[79] & ~tmp[4];
        tmp[92] = tmp[127] ^ tmp[179];
        tmp[132] = tmp[194] ^ tmp[179];
        tmp[65] = tmp[173] & tmp[191];
        tmp[107] = tmp[141] & ~tmp[73];
        tmp[59] = tmp[198] ^ tmp[143];
        tmp[123] = tmp[198] ^ tmp[171];
        tmp[102] = tmp[105] & tmp[78];
        tmp[64] = tmp[77] & tmp[3] ^ tmp[21];
        tmp[18] = tmp[50] | tmp[109];
        tmp[178] = tmp[6] & tmp[109];
        tmp[86] &= tmp[109];
        tmp[15] = tmp[91] | tmp[109];
        tmp[149] = ~tmp[72];
        tmp[22] = tmp[188] & tmp[71] ^ tmp[65];
        tmp[23] = tmp[182] ^ tmp[105] & tmp[187];
        tmp[74] = ~tmp[109];
        tmp[66] = tmp[91] ^ tmp[109];
        tmp[129] = tmp[50] ^ tmp[109];
        tmp[154] = tmp[139] ^ tmp[154] & tmp[164];
        tmp[156] = tmp[77] & ~tmp[21];
        tmp[113] ^= tmp[102];
        tmp[88] = tmp[106] & tmp[18];
        tmp[100] = tmp[30] & tmp[18];
        tmp[144] = tmp[18] ^ tmp[88];
        tmp[103] = ~tmp[178];
        tmp[41] = tmp[106] & tmp[74];
        tmp[152] = tmp[50] & tmp[74];
        tmp[167] = tmp[91] & tmp[74];
        tmp[74] &= tmp[112];
        tmp[147] = tmp[106] & tmp[129];
        tmp[162] = tmp[106] & tmp[152];
        tmp[104] = tmp[112] & tmp[167];
        tmp[44] = tmp[61] & tmp[167];
        tmp[115] = tmp[112] & ~tmp[86];
        tmp[148] = tmp[46] & ~tmp[23];
        tmp[196] = tmp[152] ^ tmp[162];
        tmp[67] = ~tmp[167];
        tmp[158] = tmp[159] ^ tmp[70] ^ tmp[39] & ((tmp[77] | tmp[38]) ^ tmp[21]) ^ tmp[135] & ~((tmp[39] | tmp[159] ^ tmp[128]) ^ tmp[64]);
        tmp[203] = tmp[112] & tmp[67];
        tmp[128] = tmp[135] & ~(tmp[106] ^ ((tmp[38] | tmp[128]) ^ tmp[39] & tmp[195])) ^ (tmp[70] ^ tmp[3] & tmp[128] ^ tmp[39] & ~(tmp[77] ^ tmp[16]));
        tmp[62] = tmp[106] & ~(tmp[109] & tmp[103]);
        tmp[146] = (tmp[188] | tmp[180]) ^ tmp[164] ^ tmp[137] & (tmp[90] ^ tmp[188] & ~tmp[150]);
        tmp[56] = tmp[169] ^ tmp[55] ^ (tmp[135] | tmp[80] ^ tmp[131] & tmp[105]) ^ (tmp[42] & (tmp[56] ^ tmp[135] & tmp[168]) ^ (tmp[75] ^ tmp[176] & (tmp[19] ^ (tmp[101] & tmp[93] ^ tmp[26]) ^ (tmp[200] | (tmp[135] | tmp[56]) ^ tmp[168]))));
        tmp[21] = tmp[77] ^ (tmp[159] ^ tmp[39] & (tmp[38] | tmp[70])) ^ tmp[135] & (tmp[64] ^ tmp[39] & ~(tmp[3] & tmp[106] ^ tmp[21]));
        tmp[131] = tmp[94] ^ (tmp[169] | tmp[55]) ^ tmp[93] & (tmp[27] ^ tmp[177]) ^ (tmp[200] | tmp[101] ^ tmp[27] & tmp[105] ^ tmp[93] & (tmp[80] ^ tmp[19] & tmp[105])) ^ (tmp[87] ^ tmp[176] & ~(tmp[51] ^ (tmp[135] | tmp[131] ^ tmp[192]) ^ tmp[42] & (tmp[80] ^ tmp[192] ^ tmp[93] & (tmp[27] ^ tmp[55]))));
        tmp[31] ^= tmp[52] & (tmp[4] ^ tmp[202] ^ tmp[37] & (tmp[4] ^ tmp[57]) ^ tmp[137] & (tmp[117] ^ tmp[154])) ^ tmp[146];
        tmp[165] = tmp[39] & tmp[16] ^ (tmp[185] ^ tmp[3] & tmp[165]) ^ tmp[135] & (tmp[156] ^ (tmp[39] & ~(tmp[159] ^ tmp[165]) ^ (tmp[38] | tmp[156])));
        tmp[133] = tmp[91] & (tmp[14] | ~(tmp[34] ^ tmp[29])) ^ (tmp[0] ^ (tmp[134] ^ tmp[14] & tmp[118])) ^ (tmp[83] ^ tmp[149] & (tmp[161] ^ (tmp[179] ^ tmp[14] & tmp[97]) ^ tmp[91] & ~(tmp[0] ^ tmp[58] ^ tmp[14] & tmp[133])));
        tmp[177] ^= tmp[35] ^ ((tmp[135] | tmp[19] ^ tmp[192]) ^ tmp[101] ^ (tmp[200] | tmp[93] & (tmp[19] ^ (tmp[101] | tmp[55])) ^ (tmp[94] ^ tmp[177])) ^ tmp[176] & (tmp[51] ^ (tmp[80] ^ (tmp[135] | tmp[80] ^ tmp[51])) ^ (tmp[200] | tmp[177] ^ (tmp[135] | tmp[80] ^ tmp[177]))));
        tmp[192] = (tmp[200] | tmp[101] ^ tmp[26] ^ (tmp[135] | tmp[27] & tmp[181] ^ tmp[192])) ^ (tmp[93] & (tmp[55] ^ tmp[94]) ^ tmp[80] & (tmp[63] ^ tmp[105])) ^ (tmp[17] ^ tmp[176] & ~(tmp[27] ^ tmp[26] ^ (tmp[135] | tmp[27] ^ tmp[51]) ^ (tmp[200] | tmp[80] ^ (tmp[135] | tmp[27] ^ tmp[192]))));
        tmp[120] ^= tmp[200] & tmp[158] ^ tmp[165];
        tmp[158] = tmp[140] ^ (tmp[200] | tmp[158]) ^ tmp[165];
        tmp[166] = tmp[79] & tmp[4] ^ (tmp[202] ^ ((tmp[188] | tmp[166] ^ tmp[164]) ^ (tmp[155] ^ (tmp[14] | tmp[204] ^ tmp[188] & tmp[204] ^ tmp[163]) ^ (tmp[58] | tmp[57] ^ tmp[137] & tmp[139] ^ tmp[37] & (tmp[201] ^ tmp[166])))));
        tmp[57] = ~tmp[133];
        tmp[161] = tmp[132] ^ tmp[137] & tmp[92] ^ tmp[91] & ~(tmp[134] ^ tmp[0] & tmp[118] ^ tmp[14] & (tmp[134] ^ tmp[0] & ~tmp[194])) ^ (tmp[175] ^ (tmp[72] | tmp[97] ^ tmp[14] & ~(tmp[127] ^ tmp[0] & tmp[161]) ^ tmp[91] & (tmp[199] ^ tmp[14] & (tmp[134] ^ tmp[89]))));
        tmp[134] = ~tmp[177];
        tmp[59] = (tmp[60] | tmp[143] ^ (tmp[79] | tmp[173] ^ tmp[171])) ^ (tmp[79] & ~tmp[59] ^ (tmp[136] ^ tmp[73] & ~tmp[65])) ^ (tmp[8] ^ tmp[46] & ~(tmp[188] & (tmp[172] ^ tmp[71]) ^ ((tmp[60] | tmp[143]) ^ tmp[79] & tmp[59])));
        tmp[143] = ~tmp[158];
        tmp[49] = tmp[108] ^ (tmp[125] & (tmp[46] | ~tmp[49]) ^ (tmp[55] ^ tmp[187] ^ tmp[46] & (tmp[5] ^ tmp[107])) ^ tmp[80] & (tmp[125] & (tmp[73] ^ tmp[46] & (tmp[73] ^ tmp[49])) ^ ((tmp[55] | tmp[107]) ^ tmp[148])));
        tmp[187] = ~tmp[166];
        tmp[108] = tmp[133] & tmp[143];
        tmp[42] = tmp[99] ^ (tmp[128] ^ tmp[42] & tmp[21]);
        tmp[132] = tmp[1] ^ ((tmp[72] | tmp[58] ^ (tmp[14] & tmp[0] & tmp[194] ^ tmp[97]) ^ tmp[91] & ~(tmp[142] ^ tmp[14] & ~(tmp[58] ^ tmp[142]))) ^ (tmp[14] & (tmp[0] ^ tmp[194]) ^ tmp[92] ^ tmp[91] & ~(tmp[58] ^ tmp[199] ^ tmp[14] & ~tmp[132])));
        tmp[199] = ~tmp[161];
        tmp[116] ^= tmp[188] ^ ~tmp[198] & tmp[73] ^ (tmp[79] & ~tmp[85] ^ ((tmp[60] | tmp[53] ^ tmp[79] & (tmp[172] & (tmp[188] ^ tmp[73]))) ^ tmp[46] & ((tmp[60] | tmp[73] & ~tmp[145]) ^ (tmp[79] & tmp[123] ^ (tmp[173] ^ (tmp[188] ^ tmp[68]))))));
        tmp[136] = tmp[79] & (tmp[122] ^ tmp[13]) ^ (tmp[198] ^ tmp[73] & tmp[191]) ^ (tmp[60] | tmp[136] ^ tmp[122] & tmp[73] ^ tmp[79] & ~(tmp[122] ^ tmp[85])) ^ (tmp[20] ^ tmp[46] & ~(tmp[22] ^ (tmp[79] & tmp[71] ^ tmp[2] & (tmp[79] & tmp[73] ^ (tmp[136] ^ tmp[68])))));
        tmp[53] = (tmp[60] | tmp[22] ^ tmp[183] & tmp[123]) ^ (tmp[145] ^ tmp[172] & tmp[73] ^ tmp[79] & ~(tmp[68] ^ tmp[65])) ^ (tmp[170] ^ tmp[46] & ~(tmp[2] & (tmp[183] & tmp[13] ^ tmp[123]) ^ (tmp[198] ^ tmp[68] ^ tmp[79] & ~(tmp[122] ^ tmp[53]))));
        tmp[197] ^= tmp[78] ^ tmp[148] ^ tmp[125] & (tmp[47] ^ tmp[46] & (tmp[73] ^ tmp[102])) ^ (tmp[40] ^ tmp[80] & ~(tmp[102] ^ tmp[46] & (tmp[182] ^ tmp[5]) ^ tmp[125] & (tmp[46] & (tmp[73] ^ tmp[197]) ^ tmp[113])));
        tmp[5] = tmp[177] | tmp[53];
        tmp[148] = tmp[134] & tmp[53];
        tmp[40] = tmp[177] & tmp[53];
        tmp[146] ^= tmp[48] ^ tmp[58] & ~((tmp[14] | tmp[204] ^ tmp[37] & (tmp[90] ^ tmp[139])) ^ (tmp[139] ^ (tmp[204] ^ tmp[188] & (tmp[163] ^ (tmp[180] | tmp[163])))));
        tmp[21] = tmp[128] ^ (tmp[130] ^ tmp[200] & ~tmp[21]);
        tmp[89] = tmp[25] ^ tmp[14] & ~tmp[34] ^ tmp[91] & (tmp[194] ^ (tmp[179] ^ tmp[14] & (tmp[58] ^ tmp[179]))) ^ (tmp[12] ^ tmp[149] & (tmp[127] ^ tmp[142] ^ tmp[14] & ~(tmp[127] ^ tmp[34]) ^ tmp[91] & ~(tmp[25] ^ tmp[14] & ~(tmp[127] ^ tmp[89]))));
        tmp[34] = ~tmp[116];
        tmp[25] = ~tmp[136];
        tmp[179] = ~tmp[53];
        tmp[142] = tmp[177] ^ tmp[53];
        tmp[194] = ~tmp[197];
        tmp[102] = tmp[46] ^ (tmp[55] ^ tmp[107]) ^ (tmp[125] & (tmp[73] ^ tmp[46] & ~tmp[47]) ^ (tmp[76] ^ tmp[80] & (tmp[113] ^ tmp[46] & ~(tmp[182] ^ tmp[102]) ^ tmp[125] & ~(tmp[160] ^ tmp[46] & ~(tmp[182] ^ tmp[160])))));
        tmp[113] = ~tmp[131] & tmp[146];
        tmp[47] = tmp[131] | tmp[146];
        tmp[76] = tmp[134] & tmp[89];
        tmp[149] = tmp[148] & tmp[89];
        tmp[12] = ~tmp[40];
        tmp[130] = tmp[42] & tmp[102];
        tmp[128] = tmp[161] & tmp[102];
        tmp[100] = tmp[30] & (tmp[129] ^ tmp[147]) ^ (tmp[109] ^ tmp[106] & tmp[103]) ^ (tmp[151] ^ (tmp[11] | tmp[100] ^ (tmp[152] ^ tmp[147]) ^ tmp[77] & (tmp[100] ^ tmp[196])) ^ tmp[77] & (tmp[41] ^ (tmp[30] | tmp[18] ^ tmp[62])));
        tmp[184] ^= tmp[30] ^ (tmp[178] ^ (tmp[88] ^ (tmp[77] & ~(tmp[50] & tmp[109] ^ tmp[109] & ((tmp[50] ^ tmp[106]) & tmp[61])) ^ (tmp[11] | tmp[106] ^ (tmp[106] & tmp[30] & tmp[109] ^ tmp[50] & (tmp[109] & (tmp[77] & tmp[61])))))));
        tmp[88] = ~tmp[146];
        tmp[147] = tmp[131] ^ tmp[146];
        tmp[150] = tmp[201] ^ (tmp[180] ^ (tmp[117] ^ (tmp[137] & (tmp[37] & tmp[139] ^ (tmp[204] ^ tmp[163])) ^ (tmp[193] ^ tmp[52] & ((tmp[14] | tmp[90] ^ tmp[37] & tmp[150]) ^ (tmp[79] ^ tmp[37] & tmp[154]))))));
        tmp[37] = tmp[89] ^ tmp[142];
        tmp[154] = ~tmp[102];
        tmp[195] = tmp[129] ^ tmp[30] & ~tmp[144] ^ (tmp[106] ^ (tmp[77] & ~(tmp[30] & tmp[144] ^ tmp[162]) ^ (tmp[119] ^ (tmp[11] | tmp[30] & (tmp[106] ^ tmp[152]) ^ tmp[77] & (tmp[30] & tmp[195] ^ tmp[196])))));
        tmp[32] ^= tmp[66] ^ (tmp[203] ^ ((tmp[30] | tmp[104]) ^ (tmp[0] & ~(tmp[98] ^ tmp[30] & (tmp[43] ^ tmp[167])) ^ tmp[174] & (tmp[0] | ~(tmp[109] ^ tmp[44])))));
        tmp[196] = ~tmp[113];
        tmp[152] = tmp[131] & tmp[88];
        tmp[144] = tmp[116] & tmp[150];
        tmp[162] = tmp[34] & tmp[150];
        tmp[119] = tmp[116] | tmp[150];
        tmp[107] = tmp[23] ^ (tmp[46] & ((tmp[55] | tmp[182]) ^ tmp[107]) ^ (tmp[125] & ~(tmp[73] ^ tmp[160] ^ tmp[46] & ~(tmp[160] ^ tmp[107])) ^ (tmp[189] ^ tmp[80] & ~(tmp[125] & (~tmp[46] & (tmp[73] ^ (tmp[55] | tmp[78]))) ^ (tmp[73] ^ tmp[190] ^ tmp[46] & ~(tmp[190] ^ tmp[107]))))));
        tmp[190] = tmp[89] & ~tmp[142];
        tmp[78] = ~tmp[184];
        tmp[160] = ~tmp[150];
        tmp[182] = tmp[116] ^ tmp[150];
        tmp[189] = tmp[76] & tmp[195];
        tmp[23] = tmp[194] & tmp[195];
        tmp[90] = tmp[197] | tmp[195];
        tmp[163] = tmp[197] & tmp[195];
        tmp[104] = tmp[81] ^ (tmp[66] ^ (tmp[112] ^ tmp[112] & tmp[61]) ^ tmp[0] & (tmp[112] ^ tmp[61] & (tmp[167] ^ tmp[104])) ^ tmp[174] & ~(tmp[30] & tmp[74] ^ tmp[0] & ~(tmp[167] ^ tmp[30] & tmp[67])));
        tmp[81] = tmp[49] & tmp[32];
        tmp[204] = tmp[49] | tmp[32];
        tmp[139] = ~tmp[49] & tmp[32];
        tmp[52] = tmp[133] & tmp[32];
        tmp[88] &= tmp[107];
        tmp[193] = tmp[146] | tmp[107];
        tmp[137] = tmp[113] & tmp[107];
        tmp[117] = tmp[196] & tmp[107];
        tmp[201] = tmp[146] & tmp[107];
        tmp[103] = ~tmp[47] & tmp[107];
        tmp[151] = tmp[47] & tmp[107];
        tmp[48] = tmp[53] ^ tmp[89] & tmp[12];
        tmp[41] = tmp[50] & tmp[106] ^ (tmp[30] ^ (tmp[77] & (tmp[6] & tmp[30] ^ (tmp[50] ^ tmp[106] & tmp[6])) ^ (tmp[129] ^ (tmp[9] ^ (tmp[11] | tmp[106] ^ (tmp[30] | tmp[18] ^ tmp[41]) ^ tmp[77] & (tmp[178] ^ tmp[30] & tmp[41] ^ tmp[62]))))));
        tmp[178] = ~tmp[195];
        tmp[18] = tmp[197] ^ tmp[195];
        tmp[62] = tmp[49] ^ tmp[32];
        tmp[6] = tmp[107] & ~tmp[147];
        tmp[9] = ~tmp[144];
        tmp[129] = tmp[116] & tmp[160];
        tmp[122] = ~tmp[107];
        tmp[13] = tmp[146] ^ tmp[107];
        tmp[183] = tmp[53] ^ tmp[190];
        tmp[68] = tmp[132] | tmp[104];
        tmp[198] = tmp[136] | tmp[104];
        tmp[123] = ~tmp[132] & tmp[104];
        tmp[2] = tmp[25] & tmp[104];
        tmp[65] = tmp[132] & tmp[104];
        tmp[172] = tmp[163] & tmp[104];
        tmp[145] = tmp[133] & tmp[139];
        tmp[22] = tmp[197] & tmp[178];
        tmp[170] = tmp[104] & tmp[178];
        tmp[71] = ~tmp[23];
        tmp[85] = tmp[104] & tmp[18];
        tmp[203] = tmp[174] & ~(tmp[112] & ~tmp[15] ^ ((tmp[98] | tmp[30]) ^ (tmp[109] ^ tmp[0] & (tmp[91] & tmp[112] ^ tmp[86] & ~tmp[61])))) ^ (tmp[44] ^ (tmp[115] ^ (tmp[138] ^ tmp[0] & ~(tmp[43] ^ tmp[86] ^ tmp[61] & (tmp[86] ^ tmp[203])))));
        tmp[86] = ~tmp[104];
        tmp[43] = tmp[132] ^ tmp[104];
        tmp[98] = ~tmp[204];
        tmp[138] = tmp[133] & ~tmp[32];
        tmp[66] = tmp[15] ^ (tmp[74] ^ ((tmp[30] | tmp[112] & ~(tmp[91] & tmp[67])) ^ (tmp[111] ^ tmp[0] & ~(tmp[112] & (tmp[91] & tmp[109]) ^ tmp[167] ^ tmp[61] & (tmp[66] ^ tmp[115])) ^ tmp[174] & ~(tmp[15] ^ (tmp[30] | tmp[15]) ^ tmp[0] & ~(tmp[109] ^ tmp[30] & ~tmp[66])))));
        tmp[115] = tmp[131] & ~tmp[152];
        tmp[15] = tmp[146] ^ tmp[137];
        tmp[61] = tmp[146] ^ tmp[201];
        tmp[167] = tmp[146] & tmp[122];
        tmp[67] = ~tmp[41];
        tmp[111] = tmp[25] & tmp[68];
        tmp[74] = tmp[25] & tmp[65];
        tmp[44] = tmp[32] & ~tmp[182];
        tmp[191] = tmp[195] & tmp[71];
        tmp[20] = tmp[193] | tmp[203];
        tmp[97] = tmp[13] | tmp[203];
        tmp[92] = tmp[68] & tmp[86];
        tmp[1] = tmp[132] & tmp[86];
        tmp[99] = ~tmp[65];
        tmp[171] = tmp[136] | tmp[43];
        tmp[8] = tmp[133] & ~tmp[81];
        tmp[118] = tmp[49] | tmp[98];
        tmp[98] &= tmp[133];
        tmp[175] = tmp[42] & tmp[66];
        tmp[155] = tmp[102] & tmp[66];
        tmp[164] = tmp[154] & tmp[66];
        tmp[202] = tmp[102] | tmp[66];
        tmp[140] = tmp[107] & ~tmp[88];
        tmp[165] = ~tmp[22];
        tmp[51] = tmp[104] & ~tmp[18];
        tmp[26] = ~tmp[203];
        tmp[181] = ~tmp[66];
        tmp[105] = tmp[102] ^ tmp[66];
        tmp[63] = tmp[130] ^ tmp[66];
        tmp[94] = tmp[167] ^ tmp[20];
        tmp[101] = tmp[158] | tmp[8];
        tmp[93] = tmp[133] & tmp[118];
        tmp[17] = tmp[42] & tmp[155];
        tmp[19] = tmp[42] & tmp[202];
        tmp[35] = tmp[116] ^ tmp[44];
        tmp[29] = tmp[104] & tmp[165];
        tmp[83] = tmp[146] & tmp[26];
        tmp[159] = tmp[88] ^ (tmp[107] | tmp[203]);
        tmp[156] = tmp[201] & tmp[26];
        tmp[3] = tmp[107] & tmp[26];
        tmp[185] = tmp[198] ^ tmp[92];
        tmp[16] = tmp[42] & tmp[181];
        tmp[169] = ~tmp[164];
        tmp[181] &= tmp[102];
        tmp[87] = tmp[42] & tmp[105];
        tmp[70] = tmp[107] & ~tmp[115];
        tmp[64] = tmp[104] & ~tmp[191];
        tmp[168] = tmp[197] ^ (tmp[195] ^ tmp[104] & ~tmp[90]);
        tmp[75] = tmp[13] ^ tmp[83];
        tmp[7] = ~tmp[181];
        tmp[10] = tmp[42] & ~tmp[105];
        tmp[84] = tmp[42] & tmp[7];
        tmp[24] = tmp[56] & (tmp[41] & (tmp[162] ^ tmp[116] & tmp[32]) ^ tmp[35]) ^ (tmp[119] ^ (tmp[32] ^ tmp[41] & ~(tmp[160] & (tmp[32] ^ tmp[119]))));
        tmp[121] = tmp[159] ^ tmp[120] & ~(tmp[107] ^ (tmp[146] | tmp[203]));
        tmp[126] = tmp[136] | tmp[140] ^ tmp[156] ^ tmp[120] & (tmp[167] ^ tmp[156]);
        tmp[44] = tmp[56] & ~((tmp[34] & tmp[32] ^ tmp[129]) & tmp[67] ^ tmp[35]) ^ (tmp[32] ^ tmp[162] ^ tmp[41] & ~(tmp[182] ^ tmp[44]));
        tmp[160] = tmp[182] ^ tmp[32] & tmp[129] ^ tmp[41] & (tmp[150] ^ tmp[32] & ~tmp[119]) ^ tmp[56] & ~(tmp[116] & tmp[67] ^ tmp[32] & ~(tmp[119] & tmp[160]));
        tmp[9] = tmp[41] & (tmp[182] ^ tmp[32] & tmp[144]) ^ (tmp[116] ^ tmp[32] & tmp[9]) ^ tmp[56] & ~(tmp[34] & tmp[41] ^ tmp[32] & ~(tmp[150] & tmp[9]));
        tmp[60] ^= tmp[160] ^ tmp[199] & tmp[24];
        tmp[11] ^= tmp[9] ^ tmp[199] & tmp[44];
        tmp[37] ^= (tmp[134] | tmp[89]) & tmp[195] ^ (tmp[31] & (tmp[53] ^ tmp[195] & ~tmp[37]) ^ (tmp[50] ^ tmp[42] & (tmp[5] ^ tmp[195] & ~(tmp[53] ^ tmp[89]) ^ tmp[31] & ~(tmp[53] ^ tmp[195] & (tmp[148] ^ tmp[177] & tmp[89])))));
        tmp[15] = tmp[131] ^ (tmp[117] ^ (tmp[78] & tmp[15] ^ (tmp[59] & ~tmp[15] ^ (tmp[79] ^ tmp[57] & (tmp[78] & ((tmp[131] | tmp[59]) ^ tmp[137]) ^ (tmp[59] | tmp[147] ^ tmp[137]))))));
        tmp[24] = tmp[160] ^ (tmp[80] ^ tmp[161] & ~tmp[24]);
        tmp[183] = tmp[142] ^ (tmp[195] & ~tmp[183] ^ (tmp[31] & ~(tmp[89] ^ tmp[189]) ^ (tmp[188] ^ tmp[42] & ~(tmp[31] & (tmp[40] ^ tmp[149] ^ (tmp[40] ^ tmp[89]) & tmp[195]) ^ (tmp[149] ^ tmp[195] & tmp[183])))));
        tmp[8] = tmp[4] ^ (tmp[62] ^ tmp[145] ^ (tmp[158] | tmp[62] ^ tmp[138]) ^ tmp[34] & ((tmp[158] | tmp[49]) ^ tmp[98]) ^ tmp[131] & ~((tmp[116] | tmp[62] ^ (tmp[158] | tmp[81]) ^ tmp[8]) ^ (tmp[52] ^ tmp[62] ^ tmp[143] & (tmp[139] ^ tmp[98]))));
        tmp[44] = tmp[9] ^ (tmp[58] ^ tmp[161] & ~tmp[44]);
        tmp[148] = tmp[40] ^ (tmp[190] ^ (tmp[195] & (tmp[5] ^ tmp[89] & (tmp[177] & tmp[179])) ^ (tmp[31] & ~(tmp[53] ^ tmp[149]) ^ (tmp[91] ^ tmp[42] & ~(tmp[31] & (tmp[195] & (tmp[148] ^ tmp[76]) ^ (tmp[148] ^ tmp[89] & ~tmp[5])) ^ (tmp[149] ^ tmp[142] & tmp[178]))))));
        tmp[142] = ~tmp[37];
        tmp[149] = ~tmp[15];
        tmp[179] = tmp[89] ^ (tmp[195] & ~(tmp[40] & tmp[89]) ^ (tmp[31] & (tmp[189] ^ tmp[48]) ^ (tmp[27] ^ tmp[42] & ~(tmp[31] & ~(tmp[5] ^ tmp[76] ^ tmp[189]) ^ (tmp[53] & tmp[12] ^ (tmp[89] & ~(tmp[5] & tmp[179]) ^ tmp[195] & tmp[48]))))));
        tmp[5] = tmp[183] | tmp[8];
        tmp[98] = tmp[133] ^ (tmp[108] ^ (tmp[62] ^ ((tmp[116] | tmp[158] & ~(tmp[32] ^ tmp[138])) ^ (tmp[73] ^ tmp[131] & (tmp[143] & (tmp[57] & tmp[49]) ^ tmp[81] ^ (tmp[116] | tmp[62] ^ tmp[143] & tmp[81] ^ tmp[98]))))));
        tmp[128] = tmp[16] ^ (tmp[102] ^ (tmp[161] & tmp[7] ^ ((tmp[31] | tmp[128] ^ tmp[17] ^ tmp[41] & (tmp[102] ^ tmp[130] ^ tmp[199] & tmp[155])) ^ (tmp[39] ^ tmp[41] & ~(tmp[19] ^ (tmp[128] ^ tmp[164]))))));
        tmp[154] = tmp[175] ^ tmp[181] ^ tmp[161] & (tmp[155] ^ tmp[16]) ^ (tmp[72] ^ tmp[41] & (tmp[199] | tmp[42] & tmp[154] ^ tmp[202]) ^ (tmp[31] | tmp[63] ^ tmp[161] & tmp[87] ^ tmp[41] & (tmp[66] ^ tmp[161] & tmp[175] ^ tmp[84])));
        tmp[61] = tmp[115] ^ (tmp[151] ^ ((tmp[184] | tmp[61]) ^ (tmp[59] & ~(tmp[152] ^ tmp[103]) ^ (tmp[77] ^ (tmp[133] | tmp[59] & tmp[103] ^ (tmp[61] ^ tmp[78] & (tmp[146] ^ tmp[6])))))));
        tmp[77] = ~tmp[183];
        tmp[180] ^= tmp[120] & tmp[20] ^ (tmp[88] ^ (tmp[203] | tmp[167])) ^ (tmp[136] | tmp[120] & ~(tmp[88] ^ tmp[20])) ^ tmp[192] & (tmp[13] ^ (tmp[120] & ~tmp[13] ^ tmp[25] & (tmp[146] ^ tmp[156] ^ tmp[120] & (tmp[107] ^ tmp[83]))));
        tmp[173] ^= tmp[136] ^ (tmp[123] ^ (tmp[100] & (tmp[68] ^ tmp[2]) ^ (tmp[120] & (tmp[194] & tmp[100] & ~tmp[68] ^ (tmp[100] | tmp[185])) ^ (tmp[197] | tmp[104] ^ tmp[74] ^ tmp[100] & ~tmp[92]))));
        tmp[115] = ~tmp[8];
        tmp[202] = tmp[8] ^ tmp[5];
        tmp[199] = ~tmp[44];
        tmp[138] = tmp[158] ^ (tmp[81] ^ (tmp[93] ^ ((tmp[116] | tmp[49] ^ tmp[158] & tmp[118]) ^ (tmp[135] ^ tmp[131] & ~(tmp[143] & (tmp[133] & tmp[62]) ^ tmp[143] & tmp[34] & (tmp[139] ^ tmp[138]))))));
        tmp[139] = ~tmp[60] & tmp[98];
        tmp[143] = tmp[60] | tmp[98];
        tmp[62] = tmp[15] & tmp[98];
        tmp[152] = tmp[59] & tmp[196] ^ (tmp[78] & (tmp[47] ^ tmp[131] & tmp[107]) ^ (tmp[113] ^ tmp[70] ^ (tmp[176] ^ tmp[57] & (tmp[59] & ~(tmp[47] ^ tmp[6]) ^ ((tmp[184] | tmp[113] ^ tmp[152] & tmp[107]) ^ (tmp[152] ^ tmp[70]))))));
        tmp[113] = tmp[37] | tmp[61];
        tmp[47] = tmp[128] & tmp[61];
        tmp[70] = tmp[128] | tmp[61];
        tmp[57] = ~tmp[148];
        tmp[176] = tmp[8] & tmp[77];
        tmp[78] = tmp[8] | tmp[180];
        tmp[196] = tmp[77] & tmp[180];
        tmp[0] ^= tmp[111] ^ tmp[1] ^ (tmp[100] & ~(tmp[198] ^ tmp[65]) ^ ((tmp[197] | tmp[132] & tmp[25] ^ tmp[100] & tmp[123]) ^ tmp[120] & (tmp[68] ^ (tmp[136] | tmp[65]) ^ tmp[100] & tmp[99] ^ (tmp[197] | tmp[132] ^ tmp[111] ^ tmp[100] & ~(tmp[198] ^ tmp[123])))));
        tmp[118] = ~tmp[98];
        tmp[135] = tmp[128] ^ tmp[61];
        tmp[72] = ~tmp[154];
        tmp[39] = tmp[61] ^ tmp[113];
        tmp[7] = ~tmp[61];
        tmp[73] = tmp[61] ^ tmp[142] & tmp[61];
        tmp[165] = tmp[166] ^ (tmp[104] ^ (tmp[195] ^ (tmp[197] ^ (tmp[177] & (tmp[21] & tmp[165] ^ (tmp[197] ^ tmp[172] ^ tmp[187] & tmp[197] & (tmp[195] ^ tmp[104]))) ^ (tmp[174] ^ tmp[21] & (tmp[187] | tmp[22] ^ tmp[29]))))));
        tmp[170] = tmp[18] ^ (tmp[104] & tmp[71] ^ ((tmp[166] | tmp[195] ^ tmp[85]) ^ (tmp[177] & ~(tmp[21] & (tmp[187] & tmp[23] ^ tmp[170]) ^ tmp[187] & (tmp[163] ^ tmp[170])) ^ (tmp[14] ^ tmp[21] & ~(tmp[22] ^ tmp[23] & (tmp[187] & tmp[104]) ^ tmp[64])))));
        tmp[14] = tmp[179] & tmp[138];
        tmp[71] = tmp[138] & tmp[152];
        tmp[18] = tmp[138] | tmp[152];
        tmp[174] = tmp[115] & tmp[78];
        tmp[76] = tmp[148] | tmp[0];
        tmp[48] = tmp[148] & tmp[0];
        tmp[189] = tmp[57] & tmp[0];
        tmp[12] = ~tmp[138];
        tmp[40] = tmp[138] ^ tmp[152];
        tmp[52] = tmp[204] ^ ((tmp[116] | tmp[108] ^ tmp[52]) ^ (tmp[93] ^ (tmp[101] ^ (tmp[112] ^ tmp[131] & ~(tmp[101] ^ (tmp[81] ^ tmp[145] ^ tmp[34] & (tmp[49] ^ ((tmp[133] | tmp[158]) ^ tmp[52]))))))));
        tmp[34] = tmp[60] & tmp[118];
        tmp[145] = tmp[15] & tmp[118];
        tmp[81] = ~tmp[143];
        tmp[101] = tmp[15] & (tmp[60] ^ tmp[98]);
        tmp[112] = ~tmp[152];
        tmp[108] = tmp[128] & tmp[7];
        tmp[93] = tmp[70] & tmp[7];
        tmp[122] = tmp[147] ^ (tmp[151] ^ (tmp[59] & ~tmp[6] ^ ((tmp[184] | tmp[137] ^ tmp[59] & (tmp[131] ^ tmp[147] & tmp[107])) ^ (tmp[127] ^ (tmp[133] | tmp[59] & (tmp[131] & tmp[146] & tmp[122]) ^ (tmp[146] ^ (tmp[103] ^ (tmp[184] | tmp[146] ^ tmp[117] ^ tmp[59] & tmp[122]))))))));
        tmp[117] = tmp[180] & tmp[115] & ~tmp[77];
        tmp[103] = tmp[44] & tmp[170];
        tmp[20] = tmp[200] ^ (tmp[121] ^ (tmp[126] ^ tmp[192] & ~(tmp[120] & tmp[13] ^ tmp[20] ^ (tmp[136] | tmp[201] ^ tmp[20] ^ tmp[120] & (tmp[88] ^ tmp[83])))));
        tmp[83] = tmp[13] ^ tmp[203] ^ (tmp[120] & ~(tmp[140] ^ tmp[3]) ^ (tmp[25] & (tmp[159] ^ tmp[120] & (tmp[107] ^ tmp[156])) ^ (tmp[125] ^ tmp[192] & (tmp[13] ^ tmp[120] & (tmp[193] ^ tmp[83]) ^ (tmp[136] | tmp[94] ^ tmp[120] & (tmp[167] ^ tmp[83]))))));
        tmp[193] = tmp[8] ^ tmp[196];
        tmp[13] = tmp[149] & (tmp[180] ^ tmp[202]);
        tmp[156] = tmp[149] & (tmp[180] ^ tmp[196]);
        tmp[159] = tmp[148] ^ tmp[0];
        tmp[185] = tmp[104] ^ (tmp[100] & tmp[198] ^ (tmp[171] ^ (tmp[194] & (tmp[100] & ~tmp[198] ^ (tmp[132] ^ tmp[25] & tmp[123])) ^ (tmp[55] ^ tmp[120] & ~(tmp[65] ^ tmp[111] ^ tmp[100] & (tmp[92] ^ tmp[171]) ^ (tmp[197] | tmp[2] ^ tmp[92] ^ tmp[100] & tmp[185]))))));
        tmp[92] = tmp[57] & tmp[76];
        tmp[90] ^= tmp[85] ^ (tmp[187] & (tmp[195] ^ tmp[51]) ^ (tmp[21] & ~(tmp[195] ^ tmp[166] & tmp[51]) ^ (tmp[106] ^ tmp[177] & ~(tmp[21] & ~(tmp[22] ^ tmp[166] & tmp[178]) ^ (tmp[197] ^ (tmp[172] ^ tmp[187] & (tmp[90] ^ tmp[172])))))));
        tmp[178] = tmp[152] & tmp[12];
        tmp[12] &= tmp[179];
        tmp[22] = tmp[15] & tmp[34];
        tmp[51] = tmp[15] & ~tmp[139];
        tmp[106] = tmp[15] & tmp[81];
        tmp[63] = tmp[66] ^ tmp[19] ^ (tmp[41] & (tmp[102] ^ tmp[84] ^ tmp[161] & ~(tmp[42] ^ tmp[181])) ^ (tmp[161] & ~(tmp[66] & tmp[169] ^ tmp[10]) ^ (tmp[109] ^ (tmp[31] | tmp[102] ^ tmp[42] & tmp[169] ^ tmp[41] & (tmp[161] & tmp[63] ^ (tmp[105] ^ tmp[87])) ^ tmp[161] & ~(tmp[105] ^ tmp[10])))));
        tmp[169] = tmp[179] ^ tmp[71];
        tmp[181] = tmp[18] & tmp[112];
        tmp[84] = tmp[44] & tmp[122];
        tmp[109] = tmp[44] | tmp[122];
        tmp[19] = tmp[199] & tmp[122];
        tmp[2] = tmp[170] & tmp[122];
        tmp[171] = tmp[15] | tmp[193];
        tmp[111] = tmp[148] & ~tmp[0];
        tmp[43] = tmp[132] ^ ((tmp[197] | ~tmp[100] & (tmp[104] ^ tmp[198])) ^ (tmp[74] ^ (tmp[100] & (tmp[25] | tmp[86]) ^ (tmp[38] ^ tmp[120] & ~(tmp[104] ^ tmp[25] & tmp[1] ^ tmp[194] & ((tmp[136] | tmp[104] & tmp[99]) ^ (tmp[68] ^ tmp[100] & (tmp[198] ^ tmp[43]))))))));
        tmp[198] = ~tmp[52];
        tmp[99] = ~tmp[34];
        tmp[68] = tmp[173] & ~(tmp[15] ^ tmp[98]);
        tmp[1] = ~tmp[122];
        tmp[194] = tmp[122] ^ tmp[2];
        tmp[86] = tmp[44] ^ tmp[122];
        tmp[38] = tmp[180] ^ (tmp[8] ^ tmp[176]);
        tmp[74] = ~tmp[83];
        tmp[65] = tmp[148] | tmp[63];
        tmp[123] = tmp[48] | tmp[63];
        tmp[55] = tmp[179] & ~tmp[18];
        tmp[140] = tmp[179] & (tmp[71] | tmp[112]);
        tmp[163] = tmp[195] ^ (tmp[172] ^ ((tmp[166] | tmp[191] ^ tmp[29]) ^ (tmp[21] & (tmp[166] & (tmp[163] ^ tmp[172]) ^ tmp[168]) ^ (tmp[141] ^ tmp[177] & (tmp[64] ^ (tmp[197] ^ (tmp[166] | tmp[23] ^ tmp[85])) ^ tmp[21] & ~(tmp[187] & tmp[163] ^ tmp[168]))))));
        tmp[75] = tmp[120] ^ (tmp[97] ^ (tmp[167] ^ (tmp[25] & ((tmp[120] | tmp[94]) ^ tmp[75]) ^ (tmp[30] ^ tmp[192] & ~(tmp[97] ^ (tmp[88] ^ tmp[120] & tmp[26]) ^ tmp[25] & (tmp[107] ^ tmp[3] ^ tmp[120] & tmp[75]))))));
        tmp[3] = tmp[148] & ~tmp[48];
        tmp[26] = tmp[61] | tmp[43];
        tmp[88] = ~tmp[90];
        tmp[25] = tmp[179] & ~tmp[40];
        tmp[97] = tmp[60] & tmp[99];
        tmp[99] &= tmp[15];
        tmp[94] = ~tmp[63];
        tmp[30] = ~tmp[84];
        tmp[167] = tmp[44] & tmp[1];
        tmp[77] = tmp[174] ^ tmp[8] & (tmp[77] & ~tmp[180]);
        tmp[187] = ~tmp[43];
        tmp[85] = ~tmp[86];
        tmp[23] = tmp[61] | tmp[75];
        tmp[168] = tmp[37] | tmp[75];
        tmp[87] = tmp[16] ^ tmp[161] & ~tmp[175] ^ (tmp[105] ^ (tmp[41] & (tmp[66] ^ tmp[161] & tmp[10]) ^ (tmp[46] ^ ~tmp[31] & (tmp[102] ^ (tmp[130] ^ tmp[161] & tmp[130]) ^ tmp[41] & ~(tmp[17] ^ (tmp[164] ^ tmp[161] & (tmp[155] ^ tmp[87])))))));
        tmp[155] = tmp[48] & tmp[94];
        tmp[164] = tmp[76] & tmp[94];
        tmp[17] = tmp[111] & tmp[94];
        tmp[130] = tmp[148] & tmp[94];
        tmp[10] = tmp[65] ^ tmp[3];
        tmp[46] = tmp[179] & ~tmp[181];
        tmp[175] = tmp[170] & tmp[30];
        tmp[105] = tmp[170] & tmp[167];
        tmp[16] = tmp[170] & ~tmp[109];
        tmp[64] = ~tmp[75];
        tmp[172] = tmp[61] ^ tmp[75];
        tmp[141] = tmp[61] & tmp[187];
        tmp[29] = tmp[135] & tmp[187];
        tmp[191] = tmp[128] & tmp[187];
        tmp[125] = tmp[47] ^ tmp[26];
        tmp[201] = tmp[70] & tmp[187];
        tmp[126] = tmp[145] ^ tmp[97];
        tmp[121] = tmp[143] ^ tmp[99];
        tmp[200] = tmp[109] & tmp[1] ^ tmp[175];
        tmp[147] = tmp[170] & tmp[85];
        tmp[137] = tmp[61] & (tmp[142] & tmp[75]);
        tmp[127] = tmp[185] | tmp[87];
        tmp[6] = tmp[185] & tmp[87];
        tmp[151] = ~tmp[185] & tmp[87];
        tmp[204] = tmp[61] & tmp[64];
        tmp[27] = tmp[37] | tmp[172];
        tmp[91] = tmp[142] & tmp[172];
        tmp[190] = ~tmp[87];
        tmp[58] = tmp[185] ^ tmp[87];
        tmp[9] = tmp[189] ^ tmp[155];
        tmp[4] = tmp[76] ^ tmp[130];
        tmp[188] = tmp[18] ^ tmp[46];
        tmp[80] = tmp[109] ^ tmp[105];
        tmp[160] = tmp[172] ^ tmp[27];
        tmp[79] = tmp[44] ^ tmp[147];
        tmp[50] = tmp[109] ^ tmp[147];
        tmp[134] = tmp[142] & tmp[204];
        tmp[144] = tmp[127] & tmp[190];
        tmp[190] &= tmp[24];
        tmp[182] = ~tmp[6];
        tmp[119] = tmp[24] & tmp[58];
        tmp[109] = tmp[148] & (tmp[109] ^ tmp[16]);
        tmp[113] ^= tmp[204];
        tmp[58] ^= tmp[24];
        tmp[67] = tmp[24] & tmp[182];
        tmp[115] = tmp[166] ^ (tmp[170] | tmp[115] & (tmp[15] & tmp[199]) ^ (tmp[193] ^ tmp[15] & ~tmp[196])) ^ (tmp[15] & tmp[202] ^ tmp[38] ^ (tmp[44] | tmp[15] & tmp[77]));
        tmp[166] = tmp[125] ^ (tmp[138] | tmp[61] ^ tmp[141]);
        tmp[129] = tmp[97] ^ (tmp[145] ^ ~tmp[173] & tmp[121]);
        tmp[35] = tmp[24] & ~tmp[144];
        tmp[162] = tmp[91] ^ (tmp[90] | tmp[113]);
        tmp[26] = tmp[90] & (tmp[47] ^ tmp[108] & tmp[187] ^ tmp[138] & ~(tmp[135] ^ tmp[26]));
        tmp[182] = tmp[24] & ~(tmp[87] & tmp[182]);
        tmp[28] = tmp[93] ^ tmp[201] ^ tmp[138] & (tmp[61] ^ tmp[29]) ^ tmp[90] & (tmp[61] & ~tmp[47] ^ tmp[43] ^ tmp[138] & (tmp[70] ^ tmp[191]));
        tmp[141] = tmp[90] & (tmp[191] ^ tmp[138] & ~(tmp[47] ^ (tmp[128] | tmp[43]))) ^ (tmp[135] ^ tmp[201] ^ tmp[138] & ~(tmp[93] ^ tmp[141]));
        tmp[29] = tmp[70] ^ (tmp[43] ^ tmp[138] & ~tmp[125]) ^ tmp[90] & ~(tmp[47] & tmp[187] ^ tmp[138] & (tmp[108] ^ tmp[29]));
        tmp[108] = tmp[185] ^ (tmp[87] ^ tmp[35]);
        tmp[81] = tmp[87] & ~(tmp[60] & tmp[15] & tmp[98] ^ (tmp[173] & ~(tmp[98] ^ tmp[62]) ^ tmp[173] & (tmp[183] & tmp[81]))) ^ tmp[129] ^ (tmp[136] ^ (tmp[183] | tmp[106] ^ tmp[97] ^ tmp[173] & ~tmp[121]));
        tmp[55] = (tmp[20] | tmp[179] & tmp[40]) ^ (tmp[188] ^ (tmp[24] & ~(tmp[185] & tmp[25] ^ (tmp[71] ^ tmp[55])) ^ (tmp[56] ^ tmp[185] & ~(tmp[55] ^ tmp[20] & tmp[140]))));
        tmp[56] = ~tmp[81];
        tmp[137] = (tmp[90] | tmp[137]) ^ (tmp[75] ^ tmp[142] & tmp[23]) ^ tmp[11] & ~(tmp[204] ^ tmp[27] ^ tmp[88] & tmp[113]) ^ (tmp[195] ^ tmp[63] & ~(tmp[90] & tmp[137] ^ tmp[160] ^ tmp[11] & (tmp[39] & tmp[88] ^ tmp[160])));
        tmp[158] ^= tmp[166] ^ tmp[26] ^ (tmp[20] | tmp[28]);
        tmp[42] ^= tmp[29] ^ ~tmp[20] & tmp[141];
        tmp[65] = tmp[48] ^ (tmp[76] | tmp[63]) ^ (tmp[64] & (tmp[76] ^ tmp[159] & tmp[94]) ^ (tmp[165] & ((tmp[52] | (tmp[148] | tmp[75]) ^ tmp[10]) ^ (tmp[3] ^ tmp[164] ^ tmp[94] & (tmp[189] & tmp[64]))) ^ (tmp[203] ^ tmp[198] & (tmp[92] ^ tmp[65] ^ tmp[64] & tmp[9]))));
        tmp[130] = tmp[165] & ((tmp[0] | tmp[63]) ^ tmp[64] & (tmp[111] ^ tmp[17])) ^ (tmp[32] ^ ((tmp[63] | tmp[3]) ^ (tmp[0] ^ (tmp[75] | tmp[159] ^ tmp[17])) ^ (tmp[52] | tmp[148] ^ (tmp[130] ^ tmp[64] & tmp[4]))));
        tmp[76] = tmp[4] ^ (tmp[64] & (tmp[189] ^ tmp[17]) ^ ((tmp[52] | tmp[123] ^ (tmp[75] | tmp[0] ^ tmp[164])) ^ (tmp[66] ^ tmp[165] & ~(tmp[10] ^ (tmp[76] ^ (tmp[159] | tmp[63])) & tmp[64]))));
        tmp[10] = ~tmp[137];
        tmp[28] = tmp[166] ^ (tmp[26] ^ (tmp[120] ^ tmp[20] & tmp[28]));
        tmp[120] = ~tmp[158];
        tmp[141] = tmp[29] ^ (tmp[21] ^ tmp[20] & ~tmp[141]);
        tmp[181] = tmp[20] ^ (tmp[169] ^ (tmp[185] & ~(tmp[140] ^ (tmp[18] ^ tmp[178] & (tmp[179] & tmp[20]))) ^ (tmp[177] ^ tmp[24] & ~(tmp[185] & (tmp[140] ^ tmp[20] & (tmp[14] ^ tmp[178])) ^ (tmp[152] ^ tmp[20] & ~(tmp[12] ^ tmp[181]))))));
        tmp[140] = ~tmp[130];
        tmp[18] = tmp[179] & tmp[112] ^ (tmp[138] ^ (tmp[185] & ~tmp[71] ^ (tmp[20] & ~tmp[188] ^ (tmp[192] ^ tmp[24] & (tmp[185] & ~(tmp[20] & tmp[169] ^ (tmp[138] ^ tmp[179] & tmp[18])) ^ (tmp[152] ^ tmp[20] & (tmp[152] ^ (tmp[138] ^ tmp[12]))))))));
        tmp[188] = ~tmp[76];
        tmp[145] = tmp[34] ^ (tmp[99] ^ (tmp[116] ^ tmp[183] & ~(tmp[139] ^ tmp[101] ^ tmp[173] & (tmp[98] ^ tmp[101])) ^ (tmp[173] & (tmp[139] ^ tmp[22]) ^ tmp[87] & (tmp[60] ^ tmp[145] ^ tmp[173] & ~tmp[126] ^ tmp[183] & ~(tmp[173] & (tmp[98] ^ tmp[145]) ^ tmp[126])))));
        tmp[126] = tmp[129] ^ (tmp[183] & (tmp[51] ^ tmp[173] & ~(tmp[139] ^ tmp[15] & ~tmp[97])) ^ (tmp[59] ^ tmp[87] & ~((tmp[60] ^ tmp[15]) & tmp[118] ^ tmp[68] ^ tmp[183] & ~(tmp[68] ^ tmp[126]))));
        tmp[107] ^= tmp[83] ^ tmp[58] ^ tmp[118] & (tmp[182] ^ tmp[83] & ~(tmp[87] ^ tmp[24] & tmp[6])) ^ tmp[163] & (tmp[185] ^ tmp[74] & (~tmp[24] & tmp[151]) ^ (tmp[98] | tmp[87] ^ ((tmp[83] | tmp[87]) ^ tmp[67])));
        tmp[68] = tmp[137] | tmp[181];
        tmp[97] = ~tmp[28];
        tmp[59] = tmp[181] ^ tmp[68];
        tmp[129] = ~tmp[181];
        tmp[155] = tmp[165] & ~(tmp[63] & (tmp[198] & tmp[75]) ^ (tmp[75] & (tmp[92] ^ tmp[123]) ^ tmp[9])) ^ (tmp[104] ^ (tmp[63] ^ (tmp[159] ^ (tmp[75] ^ tmp[198] & (tmp[9] ^ tmp[75] & ~(tmp[48] ^ tmp[155]))))));
        tmp[80] = tmp[44] ^ ((tmp[148] | tmp[84] ^ tmp[170] & ~(tmp[122] & tmp[30])) ^ (tmp[72] & (tmp[50] ^ tmp[57] & tmp[79]) ^ (tmp[133] ^ tmp[0] & ~(tmp[72] & (tmp[148] ^ tmp[80]) ^ (tmp[80] ^ tmp[109])))));
        tmp[79] = tmp[19] ^ tmp[148] & tmp[85] ^ (tmp[154] | tmp[2] ^ tmp[170] & (tmp[148] & tmp[86])) ^ (tmp[170] ^ (tmp[161] ^ tmp[0] & (tmp[103] ^ tmp[167] ^ tmp[109] ^ tmp[72] & (tmp[170] & tmp[19] ^ tmp[167] ^ tmp[148] & ~tmp[79]))));
        tmp[19] = ~tmp[145];
        tmp[167] = ~tmp[126];
        tmp[143] = tmp[139] ^ (tmp[99] ^ (tmp[173] & ~(tmp[98] ^ tmp[99]) ^ (tmp[183] & ~(tmp[34] ^ tmp[22] ^ tmp[173] & tmp[106]) ^ (tmp[53] ^ tmp[87] & (tmp[62] ^ (tmp[34] ^ tmp[173] & ~(tmp[62] ^ tmp[34])) ^ tmp[183] & ~(tmp[60] ^ (tmp[51] ^ tmp[173] & ~(tmp[15] ^ tmp[143]))))))));
        tmp[190] = tmp[67] ^ ((tmp[83] | tmp[144] ^ tmp[190]) ^ (tmp[98] | tmp[74] & (tmp[6] ^ tmp[67]))) ^ (tmp[102] ^ tmp[163] & ((tmp[98] | tmp[24] ^ (tmp[83] | tmp[87] ^ tmp[190])) ^ ((tmp[83] | tmp[127]) ^ (tmp[185] ^ tmp[182]))));
        tmp[67] = tmp[49] ^ (tmp[163] & ~(tmp[24] & ~tmp[127] ^ tmp[118] & (tmp[185] ^ tmp[67])) ^ (tmp[6] ^ tmp[119] ^ tmp[74] & tmp[108] ^ (tmp[98] | tmp[24] ^ tmp[151] ^ (tmp[83] | tmp[108]))));
        tmp[23] = tmp[172] ^ ((tmp[37] | tmp[90]) ^ (tmp[11] & tmp[90] ^ (tmp[184] ^ tmp[63] & ~(tmp[11] & (tmp[75] & tmp[88] ^ (tmp[23] ^ (tmp[37] | tmp[23]))) ^ (tmp[73] ^ tmp[88] & (tmp[37] ^ tmp[204]))))));
        tmp[182] = (tmp[98] | tmp[74] & (tmp[151] ^ tmp[119])) ^ (tmp[58] ^ tmp[74] & (tmp[127] ^ tmp[119])) ^ (tmp[197] ^ tmp[163] & ~(tmp[118] & ((tmp[24] | tmp[83]) ^ tmp[35]) ^ (tmp[24] ^ (tmp[83] | tmp[182]))));
        tmp[35] = tmp[79] | tmp[190];
        tmp[118] = ~tmp[155];
        tmp[119] = ~tmp[80];
        tmp[105] = tmp[175] ^ (tmp[86] ^ (tmp[148] & ~(tmp[44] ^ tmp[105]) ^ (tmp[72] & (tmp[44] ^ tmp[148] & ~tmp[103]) ^ (tmp[132] ^ tmp[0] & (tmp[72] & (tmp[148] & tmp[194] ^ tmp[200]) ^ (tmp[122] ^ tmp[170] & tmp[84] ^ tmp[148] & ~(tmp[86] ^ tmp[105])))))));
        tmp[84] = ~tmp[79];
        tmp[14] = tmp[152] ^ (tmp[12] ^ (tmp[20] & (tmp[138] ^ tmp[46]) ^ (tmp[185] & ~(tmp[14] ^ (tmp[178] ^ tmp[20] & ~tmp[169])) ^ (tmp[131] ^ tmp[24] & ~(tmp[20] & (tmp[179] ^ tmp[40]) ^ (tmp[152] ^ (tmp[138] ^ tmp[14] & tmp[112])) ^ tmp[185] & ~(tmp[20] & ~(tmp[152] ^ tmp[14]) ^ (tmp[71] ^ tmp[25])))))));
        tmp[25] = ~tmp[190];
        tmp[134] = tmp[100] ^ (tmp[160] ^ tmp[90] & ~(tmp[204] ^ tmp[91]) ^ tmp[11] & ~(tmp[73] & tmp[88] ^ (tmp[204] ^ tmp[134])) ^ tmp[63] & ~(tmp[168] ^ tmp[172] ^ ((tmp[90] | (tmp[37] | tmp[7] & tmp[75]) ^ tmp[204]) ^ tmp[11] & ~((tmp[39] | tmp[90]) ^ (tmp[61] ^ tmp[134])))));
        tmp[39] = tmp[107] & tmp[23];
        tmp[162] = tmp[172] ^ (tmp[37] | tmp[204]) ^ (tmp[88] & (tmp[61] & (tmp[142] ^ tmp[64])) ^ (tmp[11] & (tmp[168] ^ (tmp[90] | tmp[204])) ^ (tmp[41] ^ tmp[63] & (tmp[162] ^ tmp[11] & ~tmp[162]))));
        tmp[204] = ~tmp[67];
        tmp[168] = tmp[129] & tmp[182];
        tmp[64] = tmp[181] | tmp[182];
        tmp[142] = tmp[137] | tmp[182];
        tmp[41] = tmp[10] & tmp[182];
        tmp[88] = tmp[115] & tmp[118];
        tmp[172] = ~tmp[23];
        tmp[7] = tmp[130] & tmp[14];
        tmp[73] = tmp[130] | tmp[14];
        tmp[91] = tmp[140] & tmp[14];
        tmp[160] = tmp[158] | tmp[14];
        tmp[100] = tmp[120] & tmp[14];
        tmp[71] = tmp[182] ^ tmp[134];
        tmp[112] = ~tmp[182];
        tmp[40] = tmp[181] ^ tmp[182];
        tmp[169] = ~tmp[105];
        tmp[178] = tmp[182] & tmp[134];
        tmp[131] = tmp[182] | tmp[134];
        tmp[46] = tmp[140] & tmp[162];
        tmp[12] = tmp[130] & tmp[162];
        tmp[103] = tmp[190] | tmp[162];
        tmp[132] = ~tmp[14];
        tmp[175] = tmp[130] ^ tmp[14];
        tmp[127] = tmp[10] & tmp[168];
        tmp[151] = ~tmp[162];
        tmp[74] = tmp[120] & tmp[91];
        tmp[58] = ~tmp[168];
        tmp[197] = tmp[181] & tmp[112];
        tmp[184] = tmp[134] & tmp[112];
        tmp[108] = tmp[182] & tmp[169];
        tmp[6] = (tmp[182] | tmp[105]) ^ tmp[178];
        tmp[49] = tmp[112] & tmp[131];
        tmp[144] = tmp[73] & tmp[132];
        tmp[102] = tmp[105] ^ tmp[71];
        tmp[34] = tmp[40] ^ (tmp[137] | tmp[40]);
        tmp[68] ^= tmp[40];
        tmp[147] = tmp[44] ^ (tmp[170] & tmp[1] ^ (tmp[148] & tmp[50] ^ ((tmp[154] | tmp[194] ^ tmp[148] & ~(tmp[2] ^ tmp[86])) ^ (tmp[89] ^ tmp[0] & ~(tmp[148] & ~tmp[200] ^ tmp[72] & (tmp[122] ^ tmp[16] ^ tmp[148] & ~(tmp[122] ^ tmp[147])))))));
        tmp[16] = (tmp[105] | tmp[134]) ^ tmp[178];
        tmp[200] = tmp[182] & ~tmp[134];
        tmp[72] = tmp[182] & tmp[58];
        tmp[86] = tmp[10] & tmp[197];
        tmp[2] = tmp[137] | tmp[197];
        tmp[194] = tmp[105] | tmp[49];
        tmp[89] = tmp[14] & ~tmp[7];
        tmp[50] = tmp[120] & (tmp[130] & tmp[132]);
        tmp[1] = tmp[158] | tmp[144];
        tmp[197] ^= tmp[86];
        tmp[62] = tmp[184] ^ tmp[108];
        tmp[51] = tmp[182] ^ tmp[108];
        tmp[178] = tmp[182] & ~tmp[178];
        tmp[106] = tmp[115] & tmp[86];
        tmp[22] = ~tmp[147];
        tmp[99] = (tmp[158] | tmp[7]) ^ tmp[89];
        tmp[184] = tmp[102] ^ tmp[155] & tmp[62] ^ tmp[81] & (tmp[105] ^ tmp[184] ^ (tmp[155] | tmp[62]));
        tmp[86] = (tmp[155] | tmp[197] ^ tmp[115] & ~(tmp[64] ^ tmp[142])) ^ (tmp[168] ^ tmp[2] ^ tmp[115] & ~tmp[197]) ^ (tmp[165] ^ tmp[141] & ~(tmp[88] & ~(tmp[182] ^ tmp[142]) ^ (tmp[72] ^ tmp[86])));
        tmp[59] = tmp[68] ^ tmp[115] & (tmp[41] ^ tmp[40]) ^ (tmp[155] | tmp[59] ^ ~tmp[115] & tmp[34]) ^ (tmp[170] ^ tmp[141] & ~(tmp[115] & tmp[127] ^ (tmp[40] ^ tmp[10] & tmp[64]) ^ tmp[118] & (tmp[59] ^ tmp[115] & tmp[41])));
        tmp[142] = tmp[137] ^ tmp[40] ^ tmp[115] & tmp[58] ^ tmp[118] & (tmp[41] ^ tmp[115] & (tmp[10] & tmp[181] ^ tmp[64])) ^ (tmp[163] ^ tmp[141] & (tmp[118] & (tmp[168] ^ tmp[127] ^ tmp[115] & ~tmp[142]) ^ (tmp[142] ^ tmp[106])));
        tmp[194] = tmp[173] ^ tmp[28] & ~(tmp[81] & (tmp[134] ^ (tmp[155] | tmp[134])) ^ tmp[194] ^ (tmp[155] | tmp[194])) ^ (tmp[102] ^ tmp[118] & tmp[62] ^ tmp[81] & ~(tmp[134] ^ (tmp[155] | tmp[51])));
        tmp[68] = tmp[90] ^ (tmp[34] ^ (tmp[115] | tmp[137] ^ tmp[181] & tmp[182]) ^ (tmp[155] | tmp[106]) ^ tmp[141] & (tmp[88] & ~(tmp[137] ^ tmp[182]) ^ (tmp[72] ^ tmp[2] ^ tmp[115] & ~tmp[68])));
        tmp[2] = ~tmp[59];
        tmp[72] = ~tmp[194];
        tmp[88] = ~tmp[68];
        tmp[16] = tmp[185] ^ (tmp[184] ^ (tmp[28] | tmp[16] ^ tmp[155] & ~(tmp[169] & tmp[131]) ^ tmp[81] & ~(tmp[16] ^ (tmp[155] | tmp[105] ^ tmp[131]))));
        tmp[138] ^= tmp[14] ^ (tmp[130] & tmp[204] ^ (tmp[158] ^ ((tmp[145] | tmp[7] ^ tmp[1] ^ (tmp[67] | tmp[7] ^ tmp[50])) ^ (tmp[80] | tmp[145] & (tmp[91] ^ tmp[74]) ^ tmp[67] & (tmp[100] ^ tmp[175])))));
        tmp[50] = tmp[67] & ~tmp[144] ^ (tmp[160] ^ (tmp[91] ^ ((tmp[145] | tmp[100] ^ tmp[14] & tmp[204]) ^ (tmp[52] ^ (tmp[80] | tmp[145] & (tmp[73] ^ tmp[160]) ^ tmp[204] & tmp[50])))));
        tmp[144] = tmp[8] ^ (tmp[1] ^ (tmp[67] | tmp[99]) ^ (tmp[145] | tmp[91] ^ tmp[160] ^ tmp[204] & tmp[99]) ^ tmp[119] & (tmp[204] & (tmp[73] ^ tmp[74]) ^ ((tmp[158] | tmp[73]) ^ (tmp[14] ^ tmp[19] & (tmp[175] ^ (tmp[67] | tmp[144]))))));
        tmp[73] = tmp[16] | tmp[138];
        tmp[74] = tmp[16] & tmp[138];
        tmp[91] = tmp[175] ^ ((tmp[67] | tmp[100] ^ tmp[89]) ^ (tmp[19] & (tmp[1] ^ tmp[67] & (tmp[91] ^ tmp[120] & tmp[7])) ^ (tmp[98] ^ tmp[119] & (tmp[204] & (tmp[14] ^ tmp[100]) ^ (tmp[158] ^ (tmp[145] | tmp[204] & tmp[91] ^ ((tmp[158] | tmp[130]) ^ tmp[91])))))));
        tmp[204] = ~tmp[16];
        tmp[100] = tmp[16] ^ tmp[138];
        tmp[7] = ~tmp[50];
        tmp[120] = tmp[16] & tmp[91];
        tmp[1] = tmp[16] | tmp[91];
        tmp[98] = tmp[72] & tmp[91];
        tmp[19] = tmp[194] & tmp[91];
        tmp[200] = tmp[43] ^ (tmp[81] & (tmp[105] ^ tmp[118] & (tmp[71] ^ tmp[108])) ^ (tmp[155] ^ (tmp[169] & tmp[200] ^ (tmp[49] ^ tmp[28] & (tmp[81] & (tmp[155] & tmp[6] ^ tmp[51]) ^ ((tmp[155] | tmp[105]) ^ tmp[200] ^ (tmp[105] | tmp[178])))))));
        tmp[51] = tmp[138] & tmp[204];
        tmp[204] &= tmp[91];
        tmp[71] = ~tmp[144];
        tmp[49] = tmp[16] & ~tmp[138];
        tmp[43] = tmp[16] ^ tmp[91];
        tmp[89] = tmp[88] & tmp[200];
        tmp[175] = tmp[68] & tmp[200];
        tmp[99] = tmp[68] | tmp[200];
        tmp[160] = tmp[16] & ~tmp[91];
        tmp[52] = tmp[194] ^ tmp[98];
        tmp[185] = tmp[68] ^ tmp[200];
        tmp[178] = tmp[184] ^ (tmp[0] ^ tmp[28] & (tmp[105] ^ (tmp[131] ^ ((tmp[155] | tmp[131] & (tmp[112] ^ tmp[169])) ^ tmp[81] & ~(tmp[118] & tmp[6] ^ (tmp[108] ^ tmp[178]))))));
        tmp[108] = tmp[68] & ~tmp[200];
        tmp[6] = tmp[91] & ~tmp[204];
        tmp[118] = tmp[16] & ~tmp[49];
        tmp[169] = tmp[200] & ~tmp[89];
        tmp[112] = ~tmp[178];
        tmp[196] ^= tmp[8] ^ tmp[202];
        tmp[202] = tmp[180] ^ tmp[196];
        tmp[149] = tmp[150] ^ ((tmp[183] | tmp[174]) ^ (tmp[180] ^ (tmp[8] ^ tmp[171])) ^ tmp[199] & ((tmp[183] | tmp[78]) ^ tmp[149] & tmp[196]) ^ ~tmp[170] & (tmp[180] ^ tmp[149] & tmp[193] ^ tmp[199] & (tmp[5] ^ tmp[180] ^ (tmp[15] | tmp[202]))));
        tmp[140] &= tmp[149];
        tmp[174] = tmp[12] & tmp[149];
        tmp[150] = tmp[130] | tmp[149];
        tmp[131] = ~tmp[149];
        tmp[0] = tmp[130] ^ tmp[149];
        tmp[184] = tmp[130] & tmp[131];
        tmp[106] = tmp[162] & ~tmp[0];
        tmp[34] = tmp[130] & ~tmp[184];
        tmp[90] = tmp[145] & ~(tmp[46] ^ tmp[149]) ^ (tmp[149] ^ (tmp[130] ^ tmp[162] & tmp[140]));
        tmp[62] = tmp[162] & ~tmp[34];
        tmp[0] = tmp[12] ^ tmp[184] ^ tmp[145] & ~(tmp[149] ^ tmp[162] & tmp[0]);
        tmp[131] = tmp[130] & tmp[149] ^ tmp[162] & tmp[131] ^ tmp[145] & ~(tmp[130] ^ tmp[106]);
        tmp[106] = tmp[130] ^ tmp[46] ^ tmp[145] & ~(tmp[150] ^ tmp[106]);
        tmp[150] = tmp[145] & (tmp[174] ^ tmp[150]) ^ (tmp[149] ^ tmp[62]);
        tmp[46] = tmp[130] ^ tmp[145] & ~(tmp[162] ^ tmp[34]);
        tmp[34] = tmp[149] ^ tmp[162] & ~tmp[140] ^ tmp[145] & ~(tmp[174] ^ tmp[34]);
        tmp[62] ^= tmp[145] & (tmp[151] & tmp[149]) ^ (tmp[149] ^ tmp[130]);
        tmp[24] ^= tmp[34] ^ tmp[79] & tmp[62] ^ tmp[55] & ~(tmp[46] ^ tmp[79] & tmp[131]);
        tmp[131] = tmp[34] ^ (tmp[79] | tmp[62]) ^ (tmp[60] ^ tmp[55] & ~(tmp[46] ^ tmp[84] & tmp[131]));
        tmp[11] ^= tmp[150] ^ (tmp[79] & ~tmp[90] ^ tmp[55] & (tmp[106] ^ tmp[79] & ~tmp[0]));
        tmp[0] = tmp[150] ^ (tmp[84] & tmp[90] ^ (tmp[44] ^ tmp[55] & ~((tmp[79] | tmp[0]) ^ tmp[106])));
        tmp[106] = tmp[204] | tmp[24];
        tmp[90] = tmp[1] | tmp[24];
        tmp[150] = tmp[2] & tmp[0];
        tmp[46] = tmp[59] | tmp[0];
        tmp[62] = tmp[59] & tmp[0];
        tmp[60] = ~tmp[24];
        tmp[34] = tmp[0] ^ tmp[150];
        tmp[174] = ~tmp[0];
        tmp[140] = tmp[0] ^ tmp[46];
        tmp[184] = tmp[91] & tmp[60];
        tmp[12] = tmp[204] & tmp[60];
        tmp[102] = tmp[16] & tmp[60];
        tmp[173] = tmp[1] & tmp[60];
        tmp[127] = tmp[204] ^ tmp[106];
        tmp[168] = tmp[16] ^ (tmp[91] | tmp[24]);
        tmp[64] = tmp[71] & tmp[34];
        tmp[41] = tmp[43] ^ tmp[184];
        tmp[58] = tmp[16] ^ tmp[102];
        tmp[117] = tmp[31] ^ (tmp[170] | tmp[8] & tmp[180] ^ tmp[156] ^ tmp[199] & (tmp[176] ^ tmp[78] ^ tmp[13])) ^ (tmp[15] & ~tmp[117] ^ ((tmp[44] | tmp[180] ^ (tmp[8] ^ (tmp[5] ^ tmp[15] & tmp[117]))) ^ tmp[202]));
        tmp[5] = tmp[162] & tmp[117];
        tmp[78] = tmp[10] & tmp[117];
        tmp[176] = tmp[137] | tmp[117];
        tmp[44] = tmp[162] | tmp[117];
        tmp[202] = tmp[151] & tmp[117];
        tmp[31] = tmp[143] & tmp[117];
        tmp[40] = ~tmp[143] & tmp[117];
        tmp[163] = tmp[143] | tmp[117];
        tmp[197] = tmp[190] | tmp[117];
        tmp[165] = ~tmp[117];
        tmp[53] = tmp[117] ^ tmp[176];
        tmp[139] = tmp[117] ^ tmp[78];
        tmp[109] = tmp[143] ^ tmp[117];
        tmp[85] = tmp[162] ^ tmp[117];
        tmp[161] = tmp[25] & tmp[5];
        tmp[151] &= tmp[44];
        tmp[30] = tmp[10] & tmp[163];
        tmp[57] = tmp[176] ^ tmp[40];
        tmp[133] = tmp[163] & tmp[165];
        tmp[48] = tmp[162] & tmp[165];
        tmp[9] = tmp[10] & tmp[109];
        tmp[109] |= tmp[137];
        tmp[123] = tmp[190] | tmp[85];
        tmp[92] = tmp[25] & tmp[85];
        tmp[198] = tmp[162] & ~tmp[5];
        tmp[159] = tmp[117] & ~tmp[31];
        tmp[104] = tmp[25] & tmp[48];
        tmp[101] = tmp[133] ^ tmp[109];
        tmp[116] = tmp[31] ^ tmp[9];
        tmp[192] = tmp[162] ^ tmp[123];
        tmp[177] = tmp[162] ^ (tmp[190] | tmp[151]);
        tmp[21] = tmp[5] ^ tmp[104];
        tmp[29] = tmp[181] | tmp[116];
        tmp[9] = tmp[78] ^ tmp[163] ^ tmp[29] ^ (tmp[147] | tmp[176] ^ tmp[29]) ^ (tmp[179] ^ (tmp[42] | (tmp[147] | tmp[78] ^ (tmp[181] | tmp[9])) ^ (tmp[101] ^ tmp[129] & tmp[116])));
        tmp[101] = (tmp[181] | tmp[139]) ^ (tmp[143] ^ tmp[53]) ^ (tmp[147] | tmp[129] & tmp[139] ^ (tmp[143] ^ tmp[109])) ^ (tmp[183] ^ ~tmp[42] & (tmp[78] ^ tmp[31] ^ (tmp[181] | tmp[30] ^ tmp[159]) ^ tmp[22] & (tmp[101] ^ tmp[129] & (tmp[137] ^ tmp[159]))));
        tmp[133] = (tmp[137] | tmp[143]) ^ tmp[117] ^ (tmp[181] | tmp[159]) ^ (tmp[147] | tmp[159] ^ tmp[129] & (tmp[10] & tmp[143] ^ tmp[40])) ^ (tmp[148] ^ (tmp[42] | tmp[22] & (tmp[57] ^ (tmp[181] | tmp[57])) ^ ((tmp[137] | tmp[31]) ^ tmp[159] ^ (tmp[181] | tmp[40] ^ (tmp[137] | tmp[133])))));
        tmp[165] = (tmp[181] | tmp[53]) ^ (tmp[143] ^ tmp[30]) ^ (tmp[147] | tmp[137] & tmp[129] ^ tmp[53]) ^ (tmp[37] ^ (tmp[42] | tmp[22] & (tmp[137] ^ tmp[129] & tmp[53]) ^ (tmp[117] ^ tmp[10] & tmp[40] ^ tmp[129] & (tmp[31] ^ tmp[10] & (tmp[143] & tmp[165])))));
        tmp[48] = (tmp[35] | tmp[5]) ^ tmp[177] ^ (tmp[42] & (tmp[123] ^ tmp[84] & (tmp[117] ^ (tmp[162] ^ tmp[25] & tmp[44]))) ^ (tmp[63] ^ (tmp[76] | tmp[42] & (tmp[92] ^ (tmp[84] & tmp[117] ^ tmp[48])) ^ (tmp[44] ^ tmp[197] ^ tmp[84] & (tmp[103] ^ tmp[198])))));
        tmp[35] = tmp[197] ^ tmp[85] ^ ((tmp[79] | tmp[92]) ^ (tmp[42] & ~tmp[161] ^ (tmp[128] ^ tmp[188] & (tmp[42] & tmp[192] ^ (tmp[25] & tmp[117] ^ (tmp[35] | tmp[198]))))));
        tmp[128] = tmp[7] & tmp[133];
        tmp[92] = tmp[50] | tmp[133];
        tmp[85] = ~tmp[101];
        tmp[123] = ~tmp[133];
        tmp[63] = tmp[133] ^ tmp[48];
        tmp[10] = tmp[50] ^ tmp[133];
        tmp[44] = tmp[84] & tmp[197] ^ (tmp[151] ^ (tmp[190] | tmp[198])) ^ (tmp[42] & ~(~tmp[25] & tmp[5] ^ tmp[84] & tmp[192]) ^ (tmp[154] ^ (tmp[76] | tmp[162] ^ tmp[161] ^ (tmp[79] | tmp[103] ^ tmp[202]) ^ tmp[42] & ~(tmp[79] & tmp[44] ^ tmp[104]))));
        tmp[104] = tmp[133] & tmp[48];
        tmp[7] &= tmp[48];
        tmp[103] = tmp[165] & tmp[48];
        tmp[161] = tmp[88] & tmp[35];
        tmp[192] = tmp[68] & tmp[35];
        tmp[198] = ~tmp[169] & tmp[35];
        tmp[154] = tmp[48] & tmp[128];
        tmp[151] = ~tmp[48];
        tmp[31] = tmp[91] & tmp[85];
        tmp[40] = tmp[50] & tmp[123];
        tmp[53] = tmp[48] & tmp[123];
        tmp[129] = tmp[178] | tmp[154];
        tmp[5] ^= tmp[25] & tmp[202] ^ tmp[84] & tmp[177] ^ (tmp[42] & (tmp[197] ^ tmp[79] & ~tmp[177]) ^ (tmp[87] ^ tmp[188] & (tmp[5] ^ tmp[79] & ~tmp[21] ^ tmp[42] & ~((tmp[79] | tmp[5]) ^ tmp[21]))));
        tmp[21] = tmp[165] & tmp[151];
        tmp[177] = tmp[108] ^ tmp[89] & tmp[35];
        tmp[154] ^= tmp[50];
        tmp[188] = ~tmp[5];
        tmp[196] = tmp[15] ^ tmp[193] ^ tmp[199] & (tmp[180] ^ (tmp[8] ^ (tmp[183] | tmp[180])) ^ (tmp[15] | tmp[77])) ^ (tmp[146] ^ (tmp[170] | tmp[38] ^ (tmp[13] ^ tmp[156] ^ tmp[199] & (tmp[13] ^ tmp[171] ^ (tmp[183] ^ tmp[196])))));
        tmp[183] = tmp[18] | tmp[196];
        tmp[171] = tmp[18] & tmp[196];
        tmp[13] = tmp[23] & tmp[196];
        tmp[199] = tmp[172] & tmp[196];
        tmp[156] = tmp[23] | tmp[196];
        tmp[8] = tmp[107] & tmp[196];
        tmp[77] = ~tmp[196];
        tmp[38] = tmp[18] ^ tmp[196];
        tmp[170] = tmp[23] ^ tmp[196];
        tmp[193] = tmp[107] & tmp[183];
        tmp[146] = tmp[107] & tmp[13];
        tmp[197] = tmp[107] & tmp[199];
        tmp[202] = tmp[183] & tmp[77];
        tmp[25] = tmp[18] & tmp[77];
        tmp[87] = ~tmp[171];
        tmp[77] &= tmp[107];
        tmp[84] = tmp[107] & tmp[25];
        tmp[22] = tmp[196] & tmp[87];
        tmp[87] &= tmp[107];
        tmp[30] = tmp[196] ^ tmp[146];
        tmp[37] = tmp[25] ^ tmp[107] & tmp[38];
        tmp[57] = tmp[171] ^ tmp[77];
        tmp[159] = tmp[107] & ~tmp[38];
        tmp[148] = tmp[107] & ~tmp[170];
        tmp[78] = tmp[107] & ~tmp[202];
        tmp[109] = tmp[28] | tmp[8] ^ tmp[202];
        tmp[139] = ~tmp[18] & tmp[196] ^ tmp[87];
        tmp[116] = tmp[28] | tmp[183] ^ tmp[77];
        tmp[29] = tmp[65] & (tmp[196] ^ ((tmp[28] | tmp[183]) ^ tmp[84]) ^ (tmp[81] | tmp[107] & ~tmp[183] ^ tmp[109]));
        tmp[29] ^= tmp[180];
        tmp[146] = (tmp[126] | ~tmp[119] & tmp[8]) ^ (tmp[30] ^ tmp[119] & (tmp[170] ^ tmp[107] & ~tmp[156])) ^ (tmp[152] ^ tmp[132] & (tmp[167] & (tmp[107] ^ (tmp[80] | tmp[107] ^ tmp[196])) ^ (tmp[23] ^ tmp[146] ^ (tmp[80] | tmp[199] ^ tmp[107] & tmp[156]))));
        tmp[132] = ~tmp[146];
        tmp[152] = tmp[74] & tmp[132];
        tmp[29] ^= tmp[159] ^ (tmp[28] | tmp[8] ^ tmp[22]) ^ tmp[56] & (tmp[183] ^ tmp[97] & tmp[159]);
        tmp[180] = tmp[174] & tmp[29];
        tmp[176] = tmp[0] & tmp[29];
        tmp[163] = tmp[0] | tmp[29];
        tmp[15] ^= tmp[107] ^ ((tmp[126] | tmp[119] & tmp[196]) ^ (tmp[156] ^ (tmp[80] | tmp[170]))) ^ (tmp[14] | tmp[23] ^ ((tmp[80] | tmp[23] ^ tmp[197]) ^ tmp[167] & (tmp[8] ^ tmp[80] & ~(tmp[23] ^ tmp[8]))));
        tmp[179] = tmp[0] ^ tmp[29];
        tmp[171] = tmp[196] ^ tmp[193] ^ (tmp[28] | tmp[37]) ^ ((tmp[81] | tmp[159] ^ tmp[97] & tmp[37]) ^ (tmp[75] ^ tmp[65] & ~(tmp[97] & (tmp[171] ^ tmp[8]) ^ tmp[57] ^ tmp[56] & (tmp[159] ^ tmp[109]))));
        tmp[109] = tmp[2] & tmp[180];
        tmp[97] = tmp[59] | tmp[180];
        tmp[22] = tmp[38] ^ tmp[87] ^ (tmp[28] | tmp[159]) ^ (tmp[81] | tmp[183] ^ ((tmp[28] | tmp[183] ^ tmp[193]) ^ tmp[78])) ^ (tmp[83] ^ tmp[65] & (tmp[28] & tmp[8] ^ tmp[139] ^ tmp[56] & (tmp[116] ^ (tmp[22] ^ tmp[107] & ~tmp[22]))));
        tmp[193] = tmp[194] & tmp[15];
        tmp[183] = tmp[194] | tmp[15];
        tmp[159] = tmp[0] & ~tmp[29];
        tmp[38] = tmp[150] ^ tmp[180];
        tmp[83] = tmp[59] | tmp[179];
        tmp[202] = tmp[57] ^ tmp[28] & (tmp[25] ^ tmp[78]) ^ (tmp[56] & (tmp[84] ^ (tmp[28] | tmp[196] ^ tmp[87])) ^ (tmp[20] ^ tmp[65] & ~(tmp[8] ^ (tmp[28] | tmp[202] ^ tmp[77]) ^ (tmp[81] | tmp[139] ^ tmp[116]))));
        tmp[116] = tmp[194] ^ tmp[15];
        tmp[139] = tmp[48] | tmp[171];
        tmp[87] = tmp[48] & tmp[171];
        tmp[84] = ~tmp[168] & tmp[22];
        tmp[78] = tmp[91] & tmp[193];
        tmp[25] = ~tmp[171];
        tmp[20] = tmp[48] ^ tmp[171];
        tmp[56] = tmp[2] & tmp[159];
        tmp[57] = tmp[71] & tmp[38];
        tmp[37] = ~tmp[22];
        tmp[75] = tmp[118] | tmp[202];
        tmp[26] = tmp[49] | tmp[202];
        tmp[166] = tmp[138] | tmp[202];
        tmp[164] = tmp[16] | tmp[202];
        tmp[66] = tmp[51] | tmp[202];
        tmp[17] = tmp[194] & ~tmp[15];
        tmp[189] = tmp[91] & tmp[116];
        tmp[4] = tmp[151] & tmp[139];
        tmp[3] = tmp[165] & tmp[87];
        tmp[77] ^= tmp[23] ^ (tmp[167] & tmp[196] ^ ((tmp[80] | tmp[199] ^ tmp[197]) ^ (tmp[61] ^ (tmp[14] | (tmp[126] | tmp[196] ^ tmp[119] & tmp[77]) ^ (tmp[119] & tmp[39] ^ (tmp[196] ^ tmp[148]))))));
        tmp[197] = tmp[163] ^ tmp[83];
        tmp[61] = ~tmp[202];
        tmp[111] = tmp[48] & tmp[25];
        tmp[32] = tmp[87] ^ tmp[3];
        tmp[94] = tmp[165] & tmp[20];
        tmp[203] = tmp[91] & tmp[17];
        tmp[8] = tmp[13] ^ (tmp[107] & tmp[172] ^ (tmp[119] & (tmp[39] ^ tmp[156]) ^ ((tmp[126] | tmp[30] ^ tmp[119] & (~tmp[107] & tmp[170])) ^ (tmp[122] ^ (tmp[14] | tmp[107] & (tmp[119] & ~tmp[199]) ^ tmp[167] & (tmp[119] & (tmp[196] ^ tmp[8]) ^ (tmp[170] ^ tmp[148])))))));
        tmp[148] = tmp[0] & ~tmp[159];
        tmp[170] = tmp[73] & tmp[61];
        tmp[119] = tmp[138] & tmp[61];
        tmp[199] = tmp[74] & tmp[61];
        tmp[167] = ~tmp[17];
        tmp[30] = tmp[194] ^ tmp[189];
        tmp[189] ^= tmp[193];
        tmp[122] = tmp[165] & tmp[111];
        tmp[156] = tmp[48] & ~tmp[87];
        tmp[39] = tmp[59] & tmp[8];
        tmp[172] = tmp[59] | tmp[8];
        tmp[13] = tmp[2] & tmp[8];
        tmp[113] = tmp[0] & tmp[8];
        tmp[27] = tmp[194] & tmp[167];
        tmp[195] = tmp[85] & tmp[189];
        tmp[121] = ~tmp[8];
        tmp[136] = tmp[59] ^ tmp[8];
        tmp[116] = tmp[183] ^ tmp[91] & ~tmp[116];
        tmp[151] = tmp[151] & tmp[171] ^ tmp[122];
        tmp[187] = tmp[2] & tmp[172];
        tmp[47] = ~tmp[39];
        tmp[125] = tmp[150] ^ tmp[39];
        tmp[70] = tmp[59] & tmp[121];
        tmp[167] = tmp[17] ^ tmp[91] & tmp[167];
        tmp[89] ^= tmp[198] ^ ~(tmp[200] & tmp[35]) & tmp[77] ^ (tmp[138] | tmp[185] ^ tmp[108] & tmp[35] ^ ~(tmp[185] ^ tmp[161]) & tmp[77]);
        tmp[161] = tmp[99] ^ tmp[175] & tmp[35] ^ (tmp[175] ^ tmp[198]) & tmp[77] ^ (tmp[138] | tmp[198] ^ ~(tmp[99] ^ tmp[161]) & tmp[77]);
        tmp[185] = tmp[99] ^ tmp[192] ^ (tmp[185] | ~tmp[35]) & tmp[77] ^ (tmp[138] | tmp[177] ^ ~(tmp[200] ^ tmp[192]) & tmp[77]);
        tmp[198] = tmp[59] & tmp[47];
        tmp[175] = tmp[0] & tmp[47];
        tmp[93] = tmp[0] & ~tmp[172];
        tmp[201] = tmp[0] & tmp[70];
        tmp[135] = tmp[91] & ~tmp[27];
        tmp[177] = (tmp[138] | tmp[99] ^ tmp[99] & tmp[35] ^ (tmp[108] ^ tmp[192]) & tmp[77]) ^ (tmp[169] ^ (tmp[35] ^ ~tmp[177] & tmp[77]));
        tmp[192] = tmp[0] & ~tmp[187];
        tmp[193] ^= tmp[135];
        tmp[130] ^= tmp[10] ^ (tmp[104] ^ ((tmp[178] | tmp[40] ^ tmp[53]) ^ (tmp[86] & (tmp[112] | tmp[53]) ^ (tmp[86] & tmp[178] & tmp[104] ^ ((tmp[178] | tmp[92]) ^ tmp[48] & (tmp[50] & tmp[133]))) & tmp[25])));
        tmp[7] = tmp[63] ^ (tmp[112] & tmp[154] ^ (tmp[86] & (tmp[104] ^ tmp[178] & ~tmp[104]) ^ (tmp[155] ^ (tmp[129] ^ (tmp[50] ^ tmp[7]) ^ tmp[86] & ~(tmp[7] ^ (tmp[178] | tmp[104]))) & tmp[25])));
        tmp[154] = tmp[10] ^ (tmp[53] ^ (tmp[129] ^ (tmp[86] & ~(tmp[48] & tmp[92] ^ (tmp[112] & tmp[128] ^ tmp[40])) ^ (tmp[65] ^ (tmp[104] ^ tmp[40] ^ (tmp[178] | tmp[154]) ^ tmp[86] & ~(tmp[40] ^ (tmp[178] | tmp[133] ^ tmp[53])) | tmp[171])))));
        tmp[40] = tmp[92] ^ (tmp[48] & tmp[40] ^ (tmp[112] & (tmp[133] ^ tmp[48] & ~tmp[10]) ^ (tmp[86] & ~(tmp[112] & tmp[48]) ^ (tmp[76] ^ (tmp[86] & (tmp[53] ^ tmp[112] & tmp[63]) ^ ((tmp[178] | tmp[128] ^ tmp[48] & ~tmp[92]) ^ (tmp[92] ^ tmp[48] & ~(tmp[50] & ~tmp[40]))) | tmp[171])))));
        tmp[92] = tmp[172] ^ tmp[192];
        tmp[102] = tmp[188] & (tmp[160] & ~tmp[60] ^ (tmp[160] ^ tmp[90] | tmp[22])) ^ (tmp[41] ^ tmp[91] & tmp[37]) ^ (tmp[107] ^ (tmp[142] | tmp[168] ^ (tmp[91] | tmp[22]) ^ (tmp[5] | tmp[1] ^ tmp[106] ^ (tmp[91] ^ tmp[102] | tmp[22]))));
        tmp[120] = tmp[43] ^ (tmp[173] ^ (tmp[120] & tmp[60] | tmp[22])) ^ (~tmp[142] & (tmp[6] ^ (tmp[43] | tmp[24]) ^ tmp[127] & tmp[188]) ^ (tmp[67] ^ (tmp[5] | tmp[106] ^ (tmp[120] ^ tmp[12]) & tmp[37])));
        tmp[55] ^= tmp[24] & ~(tmp[138] ^ (tmp[138] | tmp[146]) ^ tmp[9] & (tmp[49] ^ tmp[100] & tmp[132])) ^ (tmp[16] ^ tmp[138] & tmp[132] ^ tmp[202] ^ tmp[9] & ((tmp[146] | tmp[51] ^ tmp[75]) ^ (tmp[138] ^ tmp[170])));
        tmp[43] = ~tmp[130];
        tmp[60] = ~tmp[7];
        tmp[158] ^= tmp[161] ^ (tmp[202] | tmp[89]);
        tmp[89] = tmp[161] ^ (tmp[28] ^ tmp[202] & tmp[89]);
        tmp[141] ^= (tmp[202] | tmp[185]) ^ tmp[177];
        tmp[185] = tmp[177] ^ (tmp[42] ^ tmp[202] & tmp[185]);
        tmp[127] = tmp[182] ^ (tmp[5] | (tmp[204] ^ tmp[184]) & tmp[22]) ^ (tmp[6] ^ tmp[106] ^ (tmp[1] ^ tmp[12] | tmp[22]) ^ (tmp[142] | tmp[1] ^ tmp[90] ^ tmp[184] & tmp[37] ^ tmp[188] & (tmp[127] ^ tmp[58] & tmp[37])));
        tmp[184] = ~tmp[102];
        tmp[90] = ~tmp[120];
        tmp[1] = ~tmp[55];
        tmp[12] = ~tmp[158];
        tmp[204] = ~tmp[89];
        tmp[6] = ~tmp[185];
        tmp[32] = tmp[165] ^ ((tmp[68] | tmp[32]) ^ tmp[156]) ^ (tmp[11] & ~(tmp[88] & tmp[171] ^ tmp[3]) ^ (tmp[137] ^ tmp[77] & ~(tmp[68] & tmp[32] ^ (tmp[103] ^ tmp[68] & tmp[11] & (tmp[103] ^ tmp[171])))));
        tmp[3] = ~tmp[127];
        tmp[84] = tmp[168] ^ tmp[41] & tmp[37] ^ (tmp[188] & (tmp[106] ^ (tmp[16] ^ tmp[173]) & tmp[37]) ^ (tmp[190] ^ (tmp[142] | tmp[41] ^ (tmp[84] ^ tmp[188] & (tmp[58] ^ tmp[84])))));
        tmp[58] = tmp[130] & tmp[1];
        tmp[126] ^= tmp[188] & (tmp[189] ^ tmp[195]) ^ ((tmp[101] | tmp[189]) ^ tmp[116]) ^ (tmp[131] | tmp[193] ^ ((tmp[5] | tmp[91] ^ tmp[31]) ^ tmp[85] & tmp[135]));
        tmp[173] = tmp[185] | tmp[32];
        tmp[41] = tmp[6] & tmp[32];
        tmp[37] = tmp[185] & tmp[32];
        tmp[106] = tmp[127] | tmp[32];
        tmp[190] = tmp[32] & tmp[3];
        tmp[23] ^= tmp[20] ^ (tmp[21] ^ (tmp[88] & (tmp[103] ^ tmp[139]) ^ (tmp[11] & (tmp[68] | tmp[4]) ^ tmp[77] & (tmp[21] ^ (tmp[68] | tmp[139]) ^ tmp[11] & tmp[165] & ~tmp[139]))));
        tmp[168] = ~tmp[32];
        tmp[137] = tmp[185] ^ tmp[32];
        tmp[182] = tmp[127] ^ tmp[32];
        tmp[42] = ~tmp[126];
        tmp[18] ^= tmp[51] ^ (tmp[132] & (tmp[49] ^ tmp[119]) ^ tmp[9] & ~(tmp[202] ^ tmp[132] & tmp[166])) ^ tmp[24] & ~(tmp[132] & tmp[26] ^ (tmp[118] ^ tmp[170]) ^ tmp[9] & (tmp[16] ^ (tmp[152] ^ tmp[100] & tmp[61])));
        tmp[100] = tmp[49] ^ (tmp[66] ^ (tmp[146] | tmp[118] ^ tmp[49] & tmp[61])) ^ (tmp[9] & (tmp[164] ^ (tmp[73] ^ (tmp[146] | tmp[166]))) ^ (tmp[14] ^ tmp[24] & ~(tmp[9] & (tmp[49] ^ ((tmp[100] | tmp[146]) ^ tmp[26])) ^ (tmp[132] & (tmp[49] ^ tmp[164]) ^ (tmp[51] ^ tmp[119])))));
        tmp[164] = tmp[185] & tmp[168];
        tmp[26] = tmp[127] & tmp[168];
        tmp[119] = tmp[141] | tmp[182];
        tmp[166] = ~tmp[190];
        tmp[97] ^= tmp[159] ^ (tmp[57] ^ (tmp[101] & ~(tmp[38] ^ (tmp[144] | tmp[38])) ^ (tmp[149] ^ tmp[15] & ~(tmp[71] & tmp[140] ^ tmp[197] ^ tmp[101] & (tmp[180] ^ (tmp[64] ^ tmp[97]))))));
        tmp[149] = tmp[158] | tmp[100];
        tmp[61] = tmp[12] & tmp[100];
        tmp[52] = tmp[81] ^ (tmp[5] | (tmp[52] | tmp[101]) ^ (tmp[194] ^ tmp[91] & (tmp[72] & tmp[15]))) ^ (tmp[101] & tmp[189] ^ tmp[116] ^ (tmp[131] | (tmp[5] | ~tmp[52] & tmp[101] ^ tmp[30]) ^ (tmp[193] ^ tmp[101] & ~(tmp[78] ^ tmp[27]))));
        tmp[30] = tmp[85] & (tmp[183] ^ tmp[91] & ~tmp[183]) ^ (tmp[19] ^ tmp[27]) ^ ((tmp[5] | tmp[194] ^ tmp[203] ^ tmp[195]) ^ (tmp[143] ^ (tmp[131] | tmp[167] ^ ((tmp[101] | tmp[167]) ^ tmp[188] & (tmp[194] ^ tmp[19] ^ tmp[85] & tmp[30])))));
        tmp[46] = tmp[179] ^ (tmp[109] ^ ((tmp[144] | tmp[34]) ^ (tmp[101] & ((tmp[144] | tmp[46]) ^ tmp[180] ^ tmp[56]) ^ (tmp[196] ^ tmp[15] & (tmp[101] & ~(tmp[109] ^ (tmp[144] | tmp[46] ^ tmp[176])) ^ (tmp[83] ^ (tmp[64] ^ tmp[148])))))));
        tmp[163] = tmp[176] ^ ((tmp[59] | tmp[159]) ^ (tmp[71] & (tmp[59] | tmp[163]) ^ tmp[101] & ~(tmp[57] ^ tmp[148]) ^ (tmp[117] ^ tmp[15] & ~(tmp[56] ^ tmp[101] & ~((tmp[144] | tmp[150] ^ tmp[163]) ^ tmp[197])))));
        tmp[197] = tmp[141] & tmp[166];
        tmp[199] = tmp[181] ^ tmp[24] & ~(tmp[75] ^ tmp[132] & tmp[66] ^ tmp[9] & (tmp[152] ^ (tmp[49] ^ tmp[170]))) ^ (tmp[138] ^ tmp[202] ^ ((tmp[51] | tmp[146]) ^ tmp[9] & ~(tmp[49] ^ (tmp[199] ^ tmp[132] & (tmp[74] ^ tmp[199])))));
        tmp[74] = ~tmp[164];
        tmp[132] = ~tmp[26];
        tmp[170] = tmp[127] | tmp[52];
        tmp[135] = tmp[145] ^ (~tmp[131] & ((tmp[5] | tmp[98] ^ tmp[31]) ^ (tmp[78] ^ tmp[17] ^ tmp[85] & (tmp[91] ^ tmp[17]))) ^ (tmp[98] ^ tmp[15] ^ (tmp[101] | tmp[78]) ^ tmp[188] & (tmp[203] ^ tmp[27] ^ (tmp[101] | tmp[17] ^ tmp[135]))));
        tmp[148] = (tmp[144] | tmp[140]) ^ tmp[38] ^ (tmp[101] & (tmp[144] | ~tmp[148]) ^ (tmp[115] ^ tmp[15] & (tmp[64] ^ (tmp[159] ^ tmp[2] & tmp[179] ^ tmp[101] & ~((tmp[59] | tmp[29]) ^ (tmp[144] | tmp[148]))))));
        tmp[179] = tmp[126] & tmp[46];
        tmp[2] = tmp[184] & tmp[46];
        tmp[159] = tmp[102] | tmp[46];
        tmp[64] = tmp[102] & tmp[46];
        tmp[115] = tmp[18] & tmp[46];
        tmp[140] = tmp[23] & tmp[46];
        tmp[38] = tmp[126] | tmp[46];
        tmp[17] = tmp[185] & tmp[163];
        tmp[27] = tmp[6] & tmp[163];
        tmp[203] = tmp[164] & tmp[163];
        tmp[85] = tmp[37] & tmp[163];
        tmp[78] = tmp[41] & tmp[163];
        tmp[31] = tmp[32] & tmp[199];
        tmp[98] = ~tmp[106] & tmp[199];
        tmp[166] &= tmp[199];
        tmp[188] = tmp[190] & tmp[199];
        tmp[145] = ~tmp[52];
        tmp[49] = ~tmp[30];
        tmp[152] = tmp[185] & tmp[74];
        tmp[74] &= tmp[163];
        tmp[187] = tmp[147] ^ (tmp[0] ^ tmp[136] ^ tmp[44] & ~tmp[13] ^ (tmp[178] | ~tmp[44] & (tmp[8] ^ tmp[201])) ^ tmp[123] & (tmp[44] & (tmp[0] ^ tmp[13]) ^ (tmp[8] ^ tmp[0] & tmp[136]) ^ (tmp[178] | (tmp[44] | tmp[62] ^ tmp[187]) ^ tmp[92])));
        tmp[147] = ~tmp[46];
        tmp[66] = tmp[102] ^ tmp[46];
        tmp[75] = tmp[126] ^ tmp[46];
        tmp[51] = ~tmp[199];
        tmp[181] = tmp[55] | tmp[135];
        tmp[56] = tmp[130] & tmp[135];
        tmp[57] = tmp[43] & tmp[135];
        tmp[71] = tmp[130] | tmp[135];
        tmp[87] = tmp[4] ^ ((tmp[68] | tmp[165] ^ tmp[156]) ^ (tmp[165] & ~tmp[156] ^ (tmp[11] & ~(tmp[111] ^ tmp[122] ^ (tmp[68] | tmp[156])) ^ (tmp[162] ^ tmp[77] & ~(tmp[20] ^ tmp[94] ^ tmp[88] & (tmp[103] ^ tmp[87]) ^ tmp[11] & (tmp[48] ^ tmp[21] ^ (tmp[68] | tmp[21] ^ tmp[87])))))));
        tmp[21] = tmp[184] & tmp[159];
        tmp[156] = tmp[18] & tmp[64];
        tmp[122] = ~tmp[135];
        tmp[111] = tmp[130] ^ tmp[135];
        tmp[162] = tmp[58] ^ tmp[135];
        tmp[117] = tmp[102] & tmp[147];
        tmp[176] = tmp[18] & tmp[147];
        tmp[109] = tmp[23] & tmp[147];
        tmp[83] = tmp[23] ^ tmp[42] & tmp[46];
        tmp[180] = tmp[23] & tmp[75];
        tmp[196] = tmp[37] ^ tmp[203];
        tmp[34] = tmp[32] ^ tmp[78];
        tmp[19] = tmp[182] ^ tmp[31];
        tmp[182] = tmp[127] ^ tmp[182] & tmp[199];
        tmp[167] = ~tmp[145];
        tmp[37] ^= tmp[74];
        tmp[6] &= tmp[87];
        tmp[183] = tmp[185] | tmp[87];
        tmp[195] = tmp[185] & tmp[87];
        tmp[70] = tmp[113] ^ tmp[198] ^ (tmp[44] & tmp[47] ^ (tmp[79] ^ (tmp[133] | (tmp[178] | tmp[44] & tmp[125] ^ (tmp[39] ^ tmp[0] & tmp[13])) ^ (tmp[150] ^ tmp[172] ^ tmp[44] & (tmp[62] ^ tmp[70]))) ^ tmp[112] & (tmp[59] ^ tmp[201] ^ tmp[44] & ~(tmp[8] ^ tmp[192]))));
        tmp[192] = ~tmp[187];
        tmp[150] = ~tmp[56];
        tmp[103] = tmp[48] ^ (tmp[165] & tmp[139] ^ ((tmp[68] | tmp[4] ^ tmp[94]) ^ (tmp[11] & ((tmp[68] | tmp[165] ^ tmp[48]) ^ tmp[151]) ^ (tmp[134] ^ tmp[77] & ((tmp[68] | tmp[20] ^ tmp[165] & ~tmp[4]) ^ (tmp[20] ^ tmp[11] & (tmp[88] & tmp[103] ^ tmp[151])))))));
        tmp[88] = tmp[185] ^ tmp[87];
        tmp[125] = tmp[136] ^ (tmp[175] ^ (tmp[44] & tmp[113] ^ ((tmp[178] | tmp[44] & ~(tmp[198] ^ tmp[93])) ^ (tmp[80] ^ tmp[123] & (tmp[112] & (tmp[44] ^ tmp[93]) ^ (tmp[44] & ~tmp[125] ^ (tmp[172] ^ tmp[93])))))));
        tmp[93] = tmp[126] & ~tmp[179];
        tmp[123] = tmp[18] & ~tmp[159];
        tmp[184] &= tmp[18] ^ tmp[159];
        tmp[80] = tmp[102] & ~tmp[64];
        tmp[113] = tmp[102] ^ tmp[156];
        tmp[136] = tmp[18] & tmp[117];
        tmp[4] = tmp[87] | tmp[70];
        tmp[151] = tmp[109] ^ tmp[93];
        tmp[20] = tmp[23] & ~tmp[75];
        tmp[134] = tmp[185] & ~tmp[87];
        tmp[198] = tmp[174] & tmp[44] ^ (tmp[172] ^ tmp[0] & tmp[39]) ^ ((tmp[178] | tmp[59] ^ tmp[0] & tmp[121] ^ tmp[44] & ~tmp[92]) ^ (tmp[105] ^ (tmp[133] | ~(tmp[59] ^ tmp[62]) & tmp[44] ^ (tmp[39] ^ tmp[175]) ^ tmp[112] & (tmp[44] & tmp[13] ^ (tmp[59] ^ tmp[0] & ~tmp[198])))));
        tmp[62] = ~tmp[100] & tmp[125];
        tmp[13] = tmp[100] & tmp[125];
        tmp[175] = tmp[100] | tmp[125];
        tmp[39] = tmp[12] & tmp[125];
        tmp[112] = ~tmp[70];
        tmp[92] = tmp[52] | tmp[184];
        tmp[121] = ~tmp[103];
        tmp[105] = ~tmp[125];
        tmp[172] = tmp[100] ^ tmp[125];
        tmp[174] = tmp[52] | tmp[159] ^ tmp[176];
        tmp[94] = tmp[145] & (tmp[64] ^ tmp[176]);
        tmp[139] = tmp[55] | tmp[135] & tmp[150];
        tmp[201] = tmp[87] & ~tmp[6];
        tmp[79] = tmp[70] | tmp[134];
        tmp[47] = tmp[145] & tmp[198];
        tmp[143] = tmp[127] | tmp[198];
        tmp[72] = tmp[3] & tmp[198];
        tmp[193] = tmp[185] & tmp[112];
        tmp[189] = tmp[87] & tmp[112];
        tmp[116] = tmp[195] & tmp[112];
        tmp[81] = tmp[134] & tmp[112];
        tmp[73] = tmp[6] ^ tmp[4];
        tmp[118] = tmp[87] & ~(tmp[181] ^ tmp[56]);
        tmp[181] = tmp[87] & (tmp[130] ^ tmp[181]) ^ (tmp[135] ^ (tmp[55] | tmp[111]));
        tmp[56] = tmp[162] ^ tmp[87] & (tmp[56] ^ (tmp[55] | tmp[56]));
        tmp[150] = tmp[87] & tmp[150] ^ tmp[122] & (tmp[58] ^ tmp[71]);
        tmp[14] = tmp[52] ^ tmp[198];
        tmp[177] = tmp[100] & tmp[105];
        tmp[28] = tmp[12] & tmp[172];
        tmp[161] = tmp[3] & tmp[47];
        tmp[67] = tmp[52] & tmp[72];
        tmp[160] = tmp[84] & (tmp[183] ^ tmp[4]);
        tmp[107] = tmp[201] ^ tmp[189];
        tmp[128] = tmp[52] & ~tmp[198];
        tmp[63] = tmp[127] ^ tmp[47];
        tmp[12] &= tmp[177];
        tmp[53] = tmp[100] ^ (tmp[100] | (tmp[158] | tmp[125]));
        tmp[10] = tmp[71] ^ tmp[1] & tmp[57] ^ tmp[118];
        tmp[71] ^= (tmp[55] | tmp[71]) ^ tmp[118];
        tmp[1] = tmp[162] ^ tmp[87] & ~(tmp[1] & tmp[135] ^ tmp[111]);
        tmp[162] = tmp[177] ^ tmp[12];
        tmp[118] = tmp[61] ^ tmp[177];
        tmp[76] = tmp[84] & tmp[107];
        tmp[58] = tmp[87] & (tmp[111] ^ tmp[58] & tmp[122]) ^ (tmp[111] ^ tmp[139]);
        tmp[197] = tmp[86] ^ ((tmp[7] | tmp[197] ^ tmp[98] ^ tmp[148] & (tmp[197] ^ tmp[3] & tmp[199])) ^ (tmp[141] & ~tmp[166] ^ (tmp[148] & ~tmp[188] ^ (tmp[127] ^ (tmp[32] ^ tmp[188])))));
        tmp[86] = tmp[127] | tmp[52] & ~tmp[128];
        tmp[31] = tmp[190] ^ tmp[199] ^ (tmp[141] & ~(tmp[127] ^ tmp[31]) ^ tmp[148] & (tmp[127] ^ tmp[199] & tmp[132] ^ tmp[141] & (tmp[26] & tmp[51]))) ^ (tmp[59] ^ (tmp[7] | tmp[26] ^ tmp[141] & (tmp[106] ^ tmp[31]) ^ tmp[148] & (tmp[141] & tmp[26] ^ tmp[19])));
        tmp[139] = tmp[130] ^ tmp[55] ^ tmp[87] & ~(tmp[57] ^ tmp[139]);
        tmp[57] = ~tmp[31];
        tmp[22] ^= tmp[204] & (tmp[184] ^ (tmp[52] | tmp[102] ^ tmp[136])) ^ (tmp[80] ^ (tmp[18] & ~tmp[21] ^ (tmp[52] | tmp[21] ^ tmp[136]))) ^ tmp[154] & (tmp[167] & tmp[113] ^ (tmp[89] | tmp[2] ^ tmp[174]));
        tmp[0] ^= tmp[112] & tmp[139] ^ (tmp[56] ^ tmp[97] & ((tmp[70] | tmp[181]) ^ tmp[71]));
        tmp[203] = tmp[41] ^ (tmp[74] ^ ((tmp[30] | tmp[34]) ^ ((tmp[173] ^ tmp[168] & tmp[163]) & tmp[192] ^ (tmp[165] ^ tmp[199] & (tmp[49] & tmp[196] ^ (tmp[164] ^ ~tmp[173] & tmp[163] ^ (tmp[187] | tmp[173] ^ tmp[203])))))));
        tmp[132] = tmp[68] ^ tmp[60] & (tmp[119] ^ (tmp[98] ^ tmp[148] & ~(tmp[119] ^ tmp[98]))) ^ (tmp[148] & (tmp[182] ^ tmp[141] & ~tmp[19]) ^ (tmp[106] ^ (tmp[166] ^ tmp[141] & ~(tmp[127] ^ tmp[199] & ~(tmp[127] & tmp[132])))));
        tmp[92] ^= tmp[66] ^ tmp[123] ^ (tmp[89] | tmp[167] & (tmp[117] ^ tmp[18] & tmp[66])) ^ (tmp[171] ^ tmp[154] & ~(tmp[117] ^ (tmp[115] ^ tmp[92]) ^ tmp[204] & (tmp[46] & (tmp[102] ^ tmp[18]) ^ tmp[94])));
        tmp[66] = ~tmp[22];
        tmp[156] = (tmp[89] | tmp[145] & (tmp[18] & tmp[2] ^ tmp[117]) ^ (tmp[64] ^ tmp[136])) ^ (tmp[102] ^ tmp[18] & tmp[159] ^ tmp[145] & (tmp[159] ^ tmp[123])) ^ (tmp[202] ^ tmp[154] & (tmp[113] ^ (tmp[52] & ~(tmp[159] ^ tmp[156]) ^ tmp[204] & (tmp[176] ^ tmp[80] ^ tmp[174]))));
        tmp[106] = tmp[26] ^ tmp[188] ^ tmp[141] & (tmp[106] ^ tmp[98]) ^ tmp[148] & ~(tmp[141] & tmp[98] ^ (tmp[127] ^ tmp[166])) ^ (tmp[142] ^ (tmp[7] | tmp[148] & ~((tmp[141] | tmp[106]) ^ tmp[182]) ^ (tmp[106] & tmp[51] ^ tmp[141] & ~(tmp[127] ^ (tmp[32] ^ tmp[32] & (tmp[127] & tmp[199]))))));
        tmp[182] = ~tmp[0];
        tmp[189] = tmp[35] ^ tmp[84] & ~(tmp[183] ^ tmp[70]) ^ (tmp[195] ^ tmp[70] ^ tmp[40] & (tmp[183] ^ tmp[160]) ^ tmp[163] & ~(tmp[160] ^ tmp[40] & tmp[84] & (tmp[185] ^ tmp[189])));
        tmp[160] = ~tmp[203];
        tmp[35] = tmp[132] ^ tmp[92];
        tmp[51] = ~tmp[132];
        tmp[166] = tmp[132] & tmp[92];
        tmp[98] = tmp[132] | tmp[92];
        tmp[194] ^= ~(tmp[127] ^ tmp[52]) & tmp[103] ^ (tmp[198] ^ (tmp[127] | tmp[47])) ^ ((tmp[7] | tmp[127] & tmp[103] ^ (tmp[52] ^ tmp[161])) ^ tmp[204] & (tmp[7] | tmp[143] ^ tmp[103] & (tmp[143] ^ tmp[14])));
        tmp[188] = ~tmp[92];
        tmp[26] = ~tmp[156];
        tmp[142] = ~tmp[106];
        tmp[181] = tmp[56] ^ (tmp[70] & ~tmp[139] ^ (tmp[11] ^ tmp[97] & ~(tmp[71] ^ tmp[70] & ~tmp[181])));
        tmp[71] = tmp[92] & tmp[51];
        tmp[134] = tmp[163] & (tmp[84] & tmp[193] ^ (tmp[88] ^ tmp[81]) ^ tmp[40] & ~(tmp[183] ^ tmp[84] & tmp[195] ^ tmp[81])) ^ (tmp[44] ^ (tmp[201] ^ tmp[193] ^ tmp[84] & (tmp[201] ^ tmp[79]) ^ tmp[40] & ~(tmp[134] ^ tmp[6] & tmp[112] ^ tmp[84] & ~tmp[73])));
        tmp[196] = tmp[163] ^ ((tmp[173] ^ tmp[78]) & tmp[192] ^ (tmp[152] ^ ((tmp[30] | tmp[17] ^ tmp[187] & ~(tmp[173] ^ tmp[17])) ^ (tmp[101] ^ tmp[199] & ~(tmp[49] & (tmp[17] & tmp[187] ^ tmp[196]) ^ (tmp[85] ^ tmp[152] ^ (tmp[164] ^ ~tmp[137] & tmp[163]) & tmp[192]))))));
        tmp[15] ^= tmp[102] & (tmp[100] | ~(tmp[125] & tmp[151])) ^ (tmp[75] ^ (tmp[125] | tmp[126] ^ tmp[180]) ^ tmp[100] & ~(tmp[93] ^ (tmp[109] ^ tmp[105] & (tmp[179] ^ tmp[20]))));
        tmp[24] ^= tmp[10] ^ (tmp[70] & ~tmp[58] ^ tmp[97] & ~(tmp[150] ^ tmp[70] & tmp[1]));
        tmp[1] = tmp[10] ^ (tmp[112] & tmp[58] ^ (tmp[131] ^ tmp[97] & ~(tmp[150] ^ tmp[112] & tmp[1])));
        tmp[149] = tmp[130] ^ tmp[172] ^ ((tmp[120] | tmp[162] ^ tmp[130] & ~(tmp[149] ^ tmp[172])) ^ (tmp[138] ^ tmp[122] & (tmp[130] & tmp[162] ^ (tmp[177] ^ ((tmp[120] | tmp[130] & ~(tmp[100] ^ tmp[149])) ^ (tmp[158] | tmp[177]))))));
        tmp[42] = tmp[179] ^ tmp[109] ^ tmp[140] & tmp[105] ^ (tmp[100] & ~(tmp[38] ^ (tmp[109] ^ (tmp[23] ^ tmp[38]) & tmp[105])) ^ (tmp[146] ^ tmp[102] & ((tmp[42] & tmp[38] | tmp[125]) ^ tmp[100] & ~(tmp[23] ^ tmp[46] ^ (tmp[140] ^ tmp[75]) & tmp[105]))));
        tmp[53] = tmp[158] ^ (tmp[125] ^ (tmp[130] & ~tmp[53] ^ ((tmp[135] | tmp[90] & tmp[100] ^ (tmp[62] ^ (tmp[158] | tmp[62]) ^ tmp[130] & ~tmp[175])) ^ (tmp[50] ^ (tmp[120] | tmp[100] ^ tmp[130] & tmp[53])))));
        tmp[50] = tmp[132] & tmp[188];
        tmp[146] = tmp[98] & tmp[188];
        tmp[162] = tmp[132] & tmp[181];
        tmp[138] = tmp[51] & tmp[181];
        tmp[150] = tmp[92] & tmp[181];
        tmp[131] = tmp[194] ^ tmp[196];
        tmp[121] = (tmp[7] | tmp[52] & tmp[121] ^ tmp[67]) ^ tmp[103] & ~(tmp[52] ^ tmp[72]) ^ (tmp[128] ^ tmp[86] ^ (tmp[200] ^ (tmp[89] | tmp[161] ^ tmp[121] & tmp[72] ^ (tmp[7] | tmp[3] & tmp[52] & tmp[103] ^ (tmp[47] ^ tmp[67])))));
        tmp[140] = tmp[93] ^ (tmp[23] ^ ((tmp[83] | tmp[125]) ^ (tmp[100] & (tmp[125] | ~tmp[83]) ^ (tmp[77] ^ tmp[102] & (tmp[179] ^ (tmp[109] ^ (tmp[179] ^ tmp[140] | tmp[125])) ^ tmp[100] & (tmp[179] ^ tmp[83] & tmp[105]))))));
        tmp[83] = tmp[194] | tmp[196];
        tmp[77] = tmp[194] & tmp[196];
        tmp[200] = ~tmp[181];
        tmp[58] = tmp[106] | tmp[24];
        tmp[10] = tmp[22] | tmp[24];
        tmp[101] = tmp[66] & tmp[24];
        tmp[81] = tmp[22] & tmp[24];
        tmp[44] = tmp[142] & tmp[24];
        tmp[139] = tmp[196] | tmp[1];
        tmp[11] = tmp[194] | tmp[1];
        tmp[56] = tmp[181] & ~tmp[35];
        tmp[159] = tmp[92] & tmp[53];
        tmp[174] = tmp[92] | tmp[53];
        tmp[112] = tmp[84] & (tmp[195] ^ tmp[88] & tmp[112]) ^ (tmp[183] ^ tmp[79] ^ (tmp[40] & ~(tmp[193] ^ tmp[76]) ^ (tmp[5] ^ tmp[163] & (tmp[40] & (tmp[6] ^ tmp[116] ^ tmp[76]) ^ (tmp[195] ^ tmp[116] ^ tmp[84] & ~(tmp[183] & tmp[112]))))));
        tmp[6] = ~tmp[134];
        tmp[78] = tmp[163] ^ (tmp[173] ^ ((tmp[30] | tmp[164] ^ tmp[27]) ^ ((tmp[187] | tmp[34]) ^ (tmp[9] ^ tmp[199] & ~(tmp[185] ^ (tmp[187] | tmp[185] ^ tmp[78]) ^ tmp[49] & (tmp[17] ^ (tmp[41] ^ tmp[163]) & tmp[192]))))));
        tmp[17] = ~tmp[196];
        tmp[9] = ~tmp[24];
        tmp[34] = tmp[22] ^ tmp[24];
        tmp[164] = ~tmp[1];
        tmp[173] = tmp[1] ^ tmp[131];
        tmp[76] = tmp[196] & ~tmp[194];
        tmp[193] = tmp[189] & tmp[121];
        tmp[5] = ~tmp[149];
        tmp[2] = ~tmp[42];
        tmp[117] = ~tmp[53];
        tmp[136] = tmp[121] | tmp[140];
        tmp[64] = tmp[189] | tmp[140];
        tmp[13] = tmp[177] ^ ((tmp[158] | tmp[125] & ~tmp[62]) ^ (tmp[130] & ~(tmp[100] ^ tmp[28]) ^ ((tmp[120] | tmp[100] & tmp[39] ^ tmp[130] & tmp[118]) ^ (tmp[91] ^ (tmp[135] | tmp[39] ^ tmp[130] & tmp[28] ^ tmp[90] & (tmp[13] ^ tmp[130] & (tmp[61] ^ tmp[13])))))));
        tmp[39] = tmp[1] | tmp[77];
        tmp[91] = tmp[35] ^ tmp[162];
        tmp[177] = tmp[132] ^ tmp[150];
        tmp[113] = tmp[35] & tmp[200];
        tmp[202] = tmp[142] & tmp[101];
        tmp[171] = tmp[142] & tmp[81];
        tmp[119] = tmp[131] ^ tmp[139];
        tmp[19] = tmp[189] ^ tmp[121];
        tmp[68] = ~tmp[140];
        tmp[168] = tmp[194] & tmp[17];
        tmp[94] = tmp[29] ^ ((tmp[89] | tmp[115] ^ tmp[21] ^ tmp[145] & tmp[184]) ^ (tmp[184] ^ ((tmp[52] | tmp[176]) ^ tmp[154] & ~(tmp[80] ^ (tmp[167] & tmp[123] ^ tmp[204] & (tmp[176] ^ tmp[94]))))));
        tmp[147] = tmp[38] ^ (tmp[125] ^ (tmp[23] & ~tmp[93] ^ (tmp[100] & (tmp[75] ^ tmp[109] ^ (tmp[46] ^ tmp[109]) & tmp[105]) ^ (tmp[8] ^ tmp[102] & ~(tmp[100] & (tmp[75] ^ tmp[180] ^ (tmp[125] | tmp[151])) ^ (tmp[179] ^ tmp[23] & (tmp[126] & tmp[147]) ^ tmp[105] & (tmp[46] ^ tmp[20])))))));
        tmp[20] = tmp[58] ^ tmp[10];
        tmp[151] = tmp[22] & tmp[9];
        tmp[180] = tmp[22] ^ tmp[44];
        tmp[75] = tmp[196] & tmp[164];
        tmp[105] = tmp[92] ^ tmp[56];
        tmp[63] = tmp[14] ^ tmp[67] ^ (tmp[103] & ~tmp[63] ^ ((tmp[7] | tmp[47] ^ (tmp[161] ^ tmp[103] & (tmp[198] ^ tmp[72]))) ^ (tmp[16] ^ (tmp[89] | tmp[170] ^ (tmp[128] ^ tmp[103] & tmp[63]) ^ tmp[60] & (tmp[47] ^ tmp[103] & (tmp[14] ^ (tmp[127] | tmp[14])))))));
        tmp[72] = tmp[164] & tmp[76];
        tmp[16] = tmp[24] & tmp[2];
        tmp[67] = ~tmp[159];
        tmp[101] &= tmp[13];
        tmp[179] = ~tmp[112];
        tmp[27] = tmp[137] ^ (tmp[85] ^ ((tmp[187] | tmp[37]) ^ (tmp[49] & (tmp[163] & ~tmp[152] ^ (tmp[32] ^ tmp[27] & tmp[192])) ^ (tmp[133] ^ tmp[199] & ~(tmp[85] ^ (tmp[37] & tmp[192] ^ tmp[49] & (tmp[41] ^ tmp[85] ^ (tmp[32] ^ tmp[27]) & tmp[192])))))));
        tmp[192] = tmp[189] & ~tmp[121];
        tmp[85] = (tmp[189] | tmp[121]) & tmp[68];
        tmp[41] = tmp[121] ^ tmp[64];
        tmp[49] = ~tmp[13];
        tmp[37] = tmp[39] ^ tmp[168];
        tmp[152] = tmp[31] & tmp[94];
        tmp[133] = tmp[57] & tmp[94];
        tmp[137] = tmp[31] | tmp[94];
        tmp[109] = tmp[0] | tmp[147];
        tmp[8] = (tmp[106] | tmp[10]) ^ tmp[101];
        tmp[93] = tmp[142] & tmp[151];
        tmp[139] = tmp[83] ^ (tmp[194] | tmp[139]);
        tmp[38] = tmp[2] & tmp[63];
        tmp[176] = tmp[9] & tmp[63];
        tmp[123] = tmp[24] | tmp[63];
        tmp[167] = tmp[24] & tmp[63];
        tmp[80] = tmp[53] & tmp[67];
        tmp[184] = tmp[147] | tmp[27];
        tmp[145] = tmp[147] & tmp[27];
        tmp[21] = tmp[0] | tmp[27];
        tmp[115] = ~tmp[94];
        tmp[29] = tmp[31] ^ tmp[94];
        tmp[165] = tmp[147] ^ tmp[27];
        tmp[74] = ~tmp[147];
        tmp[190] = tmp[147] ^ tmp[109];
        tmp[88] = tmp[183] ^ ((tmp[70] | tmp[201]) ^ (tmp[84] & ~(tmp[185] ^ tmp[116]) ^ (tmp[40] & ~(tmp[4] ^ (tmp[195] ^ tmp[84] & tmp[73])) ^ (tmp[48] ^ tmp[163] & ~(tmp[107] ^ tmp[40] & (tmp[201] ^ (tmp[185] & tmp[84] ^ (tmp[70] | tmp[88]))) ^ tmp[84] & ~(tmp[87] ^ tmp[79]))))));
        tmp[79] = ~tmp[63];
        tmp[201] = tmp[24] ^ tmp[63];
        tmp[107] = tmp[42] ^ tmp[63];
        tmp[73] = tmp[121] & ~tmp[193];
        tmp[62] ^= (tmp[158] | tmp[172]) ^ (tmp[130] & ~(tmp[100] ^ (tmp[125] ^ tmp[28])) ^ (tmp[90] & (tmp[175] ^ tmp[43] & tmp[12]) ^ (tmp[144] ^ tmp[122] & (tmp[43] & tmp[118] ^ (tmp[120] | tmp[158] ^ tmp[172] ^ tmp[130] & ~(tmp[61] ^ tmp[62]))))));
        tmp[61] = tmp[2] & tmp[176];
        tmp[9] &= tmp[123];
        tmp[172] = tmp[2] & tmp[123];
        tmp[118] = tmp[0] | tmp[184];
        tmp[43] = tmp[0] | tmp[145];
        tmp[12] = tmp[184] & tmp[74];
        tmp[28] = tmp[182] & tmp[147] ^ tmp[145];
        tmp[122] = tmp[42] ^ tmp[176];
        tmp[175] = tmp[24] & tmp[79];
        tmp[144] = tmp[29] & tmp[62];
        tmp[90] = tmp[31] & tmp[62];
        tmp[195] = tmp[57] & tmp[62];
        tmp[4] = tmp[115] & tmp[62];
        tmp[116] = tmp[0] ^ tmp[145];
        tmp[48] = tmp[147] & ~tmp[27];
        tmp[183] = tmp[194] ^ (tmp[196] ^ tmp[83] & tmp[164]);
        tmp[59] = ~tmp[88];
        tmp[111] = tmp[94] & ~tmp[133];
        tmp[14] = tmp[103] ^ (tmp[47] ^ (tmp[127] | tmp[128]) ^ ((tmp[7] | (tmp[52] ^ tmp[170]) & tmp[103] ^ tmp[161]) ^ (tmp[178] ^ tmp[204] & (tmp[103] & (tmp[198] ^ tmp[143]) ^ (tmp[170] ^ tmp[128]) ^ tmp[60] & (tmp[103] & (tmp[198] ^ tmp[3] & tmp[14]) ^ (tmp[47] ^ tmp[86]))))));
        tmp[3] = tmp[156] & ~tmp[38];
        tmp[86] = tmp[24] & ~tmp[167];
        tmp[47] = tmp[27] ^ tmp[43];
        tmp[143] = tmp[21] ^ tmp[12];
        tmp[2] = tmp[167] ^ tmp[2] & tmp[201];
        tmp[167] = tmp[94] ^ tmp[195];
        tmp[128] = tmp[94] & (tmp[57] ^ tmp[62]);
        tmp[170] = tmp[188] & tmp[14];
        tmp[60] = tmp[92] & tmp[14];
        tmp[204] = tmp[159] & tmp[14];
        tmp[161] = tmp[117] & tmp[14];
        tmp[178] = tmp[42] | tmp[86];
        tmp[12] = tmp[184] ^ (tmp[0] | tmp[12]);
        tmp[104] = ~tmp[14];
        tmp[65] = tmp[92] & (tmp[197] & tmp[14]);
        tmp[129] = tmp[92] ^ tmp[170];
        tmp[25] = tmp[174] ^ tmp[170];
        tmp[155] = tmp[92] ^ tmp[60];
        tmp[108] = tmp[149] & ~tmp[19] ^ (tmp[85] ^ tmp[73]) ^ (tmp[132] | tmp[193] & ~tmp[68] ^ tmp[149] & (tmp[19] ^ tmp[121] & tmp[68]));
        tmp[180] ^= (tmp[63] | tmp[179] & (tmp[20] ^ (tmp[13] | tmp[20])) ^ (tmp[24] ^ tmp[44] ^ tmp[13] & tmp[180])) ^ (tmp[120] ^ (tmp[112] | tmp[24] ^ tmp[58] ^ tmp[22] & tmp[13]) ^ tmp[13] & (tmp[58] ^ tmp[22] & ~tmp[81]));
        tmp[120] = tmp[197] & tmp[155];
        tmp[73] = tmp[192] ^ (tmp[140] | tmp[73]) ^ tmp[149] & ~(tmp[189] ^ tmp[19] & tmp[68]) ^ tmp[51] & (tmp[193] ^ tmp[149] & (~tmp[189] & tmp[121] ^ tmp[189] & tmp[68]));
        tmp[19] = tmp[149] & tmp[136] ^ tmp[41] ^ tmp[51] & (tmp[193] ^ tmp[68] & tmp[192] ^ tmp[149] & ~(tmp[136] ^ tmp[19]));
        tmp[68] = ~tmp[180];
        tmp[66] = tmp[24] ^ tmp[142] & tmp[10] ^ tmp[179] & tmp[8] ^ tmp[13] & ~(tmp[66] & tmp[10] ^ tmp[171]) ^ (tmp[127] ^ (tmp[63] | tmp[22] ^ tmp[8] ^ tmp[179] & (tmp[13] & (tmp[22] ^ tmp[58]) ^ tmp[93])));
        tmp[192] ^= tmp[85] ^ tmp[149] & ~(tmp[193] ^ tmp[136]) ^ tmp[51] & (tmp[41] ^ tmp[149] & ~(tmp[64] ^ tmp[192]));
        tmp[64] = ~tmp[66];
        tmp[151] = tmp[84] ^ tmp[58] ^ (tmp[81] ^ tmp[13] & ~tmp[20] ^ (tmp[112] | tmp[10] ^ (tmp[13] & tmp[202] ^ tmp[93])) ^ (tmp[63] | tmp[24] & (tmp[22] ^ tmp[142]) ^ tmp[101] ^ tmp[179] & (tmp[101] ^ (tmp[151] ^ tmp[142] & tmp[34]))));
        tmp[20] = tmp[44] & tmp[13] ^ (tmp[22] ^ (tmp[24] ^ (tmp[106] | tmp[81]))) ^ tmp[179] & (tmp[202] ^ (tmp[13] | tmp[22] & tmp[142] ^ tmp[34])) ^ (tmp[102] ^ tmp[79] & (tmp[13] & tmp[20] ^ (tmp[10] ^ tmp[171]) ^ tmp[179] & (tmp[202] ^ tmp[20] & tmp[49])));
        tmp[142] = tmp[15] & ~tmp[111] ^ (tmp[29] ^ tmp[62] ^ tmp[17] & (tmp[137] ^ tmp[15] & (tmp[152] ^ tmp[90])));
        tmp[202] = ~tmp[64];
        tmp[173] = tmp[194] ^ (tmp[173] & tmp[49] ^ (tmp[15] & ~(tmp[13] & (tmp[194] ^ tmp[11]) ^ (tmp[139] ^ tmp[13] & (tmp[112] & tmp[76]))) ^ (tmp[135] ^ tmp[112] & ~(tmp[173] ^ (tmp[13] | (tmp[1] | tmp[131]) ^ tmp[168])))));
        tmp[158] ^= tmp[108] ^ (tmp[156] | tmp[73]);
        tmp[73] = tmp[108] ^ (tmp[89] ^ tmp[156] & tmp[73]);
        tmp[89] = ~tmp[20];
        tmp[168] = tmp[119] ^ (tmp[13] & ~(tmp[194] ^ tmp[75]) ^ (tmp[52] ^ tmp[112] & ~(tmp[13] & (tmp[77] ^ tmp[164] & tmp[168])) ^ tmp[15] & (tmp[139] ^ (tmp[112] & ~(tmp[194] ^ tmp[1] | tmp[13]) ^ (tmp[13] | tmp[183])))));
        tmp[56] = tmp[103] ^ (tmp[160] & (tmp[98] ^ (tmp[166] ^ tmp[138]) & tmp[88]) ^ (tmp[166] ^ (tmp[181] ^ (tmp[71] ^ tmp[138]) & tmp[88])) ^ tmp[140] & ~(tmp[50] ^ (tmp[132] ^ tmp[188] & tmp[181]) & tmp[88] ^ (tmp[203] | tmp[71] ^ (tmp[98] ^ tmp[56] | tmp[88]))));
        tmp[35] = tmp[105] ^ ~tmp[113] & tmp[88] ^ (tmp[203] | tmp[91] ^ tmp[113] & tmp[59]) ^ (tmp[87] ^ tmp[140] & ~(tmp[50] ^ tmp[181] & tmp[71] ^ tmp[98] & tmp[200] & tmp[88] ^ (tmp[203] | tmp[35] ^ (tmp[132] ^ tmp[162]) & tmp[88])));
        tmp[111] = tmp[142] ^ (tmp[163] ^ tmp[0] & ~(tmp[17] & (tmp[31] ^ tmp[62] ^ tmp[15] & tmp[144]) ^ (tmp[15] & tmp[111] ^ (tmp[133] ^ tmp[94] & tmp[90]))));
        tmp[163] = ~tmp[173];
        tmp[75] = tmp[183] ^ (tmp[13] & ~tmp[72] ^ (tmp[15] & (tmp[11] ^ tmp[72] & tmp[49] ^ tmp[112] & (tmp[76] ^ tmp[196] & tmp[49])) ^ (tmp[126] ^ tmp[112] & ~(tmp[1] ^ tmp[76] ^ tmp[49] & (tmp[77] ^ tmp[75])))));
        tmp[160] = tmp[91] ^ ((tmp[98] | tmp[200]) & tmp[88] ^ ((tmp[203] | tmp[150] ^ (tmp[177] | tmp[88])) ^ (tmp[23] ^ tmp[140] & ~(tmp[71] & tmp[88] ^ ~tmp[150] & (tmp[160] & tmp[88])))));
        tmp[18] ^= tmp[2] ^ ((tmp[156] | tmp[123] ^ tmp[172]) ^ (tmp[149] | tmp[38] ^ tmp[156] & tmp[61]) ^ tmp[78] & (tmp[156] & ~tmp[122] ^ (tmp[149] | tmp[156] & ~(tmp[24] ^ tmp[42]) ^ (tmp[123] ^ (tmp[42] | tmp[9])))));
        tmp[150] = ~tmp[73];
        tmp[71] = tmp[66] ^ tmp[73];
        tmp[141] ^= tmp[19] ^ tmp[26] & tmp[192];
        tmp[23] = tmp[64] & tmp[168];
        tmp[200] = tmp[73] | tmp[56];
        tmp[98] = tmp[151] | tmp[35];
        tmp[91] = ~tmp[168];
        tmp[11] = tmp[168] ^ tmp[18];
        tmp[126] = ~tmp[56];
        tmp[183] = ~tmp[35];
        tmp[117] = tmp[40] ^ (tmp[204] ^ (tmp[188] & tmp[53] ^ tmp[197] & tmp[104]) ^ (tmp[88] | (tmp[92] ^ tmp[53]) & tmp[14] ^ (tmp[174] ^ tmp[65])) ^ tmp[27] & (tmp[92] ^ (tmp[197] | tmp[129]) ^ (tmp[88] | tmp[197] & tmp[188] ^ tmp[174] & (tmp[117] ^ tmp[14]))));
        tmp[188] = tmp[168] | tmp[18];
        tmp[40] = tmp[168] & tmp[18];
        tmp[113] = tmp[56] & tmp[150];
        tmp[87] = ~tmp[111];
        tmp[195] = tmp[97] ^ (tmp[182] & (tmp[17] & (tmp[128] ^ tmp[15] & (tmp[133] ^ tmp[195])) ^ (tmp[128] ^ tmp[15] & ~tmp[167])) ^ (tmp[144] ^ (tmp[31] ^ (tmp[15] & (tmp[137] ^ tmp[195]) ^ (tmp[196] | tmp[15] & tmp[133] ^ tmp[128])))));
        tmp[152] = tmp[148] ^ (tmp[31] & (tmp[15] & tmp[115]) ^ (tmp[90] ^ (tmp[133] ^ (tmp[196] | ~tmp[15] & (tmp[152] ^ tmp[62])))) ^ (tmp[0] | (tmp[15] | tmp[167]) ^ (tmp[167] ^ tmp[15] & tmp[17] & ~(tmp[94] ^ tmp[4]))));
        tmp[50] = (tmp[203] | tmp[105] & tmp[59]) ^ (tmp[88] ^ (tmp[177] ^ (tmp[32] ^ tmp[140] & ((tmp[146] ^ tmp[162] | (tmp[203] | tmp[88])) ^ (tmp[146] ^ (tmp[181] & tmp[50] ^ tmp[50] & tmp[88]))))));
        tmp[162] = tmp[66] | tmp[200];
        tmp[146] = ~tmp[160];
        tmp[65] = ~tmp[197] & tmp[174] ^ ~tmp[80] & tmp[14] ^ ((tmp[88] | tmp[204] ^ tmp[197] & ~(tmp[174] ^ tmp[60])) ^ (tmp[7] ^ tmp[27] & (tmp[59] | ~(tmp[204] ^ tmp[65]))));
        tmp[60] = ~tmp[141];
        tmp[192] = tmp[19] ^ (tmp[185] ^ tmp[156] & ~tmp[192]);
        tmp[185] = tmp[18] & tmp[91];
        tmp[19] = tmp[73] & tmp[126];
        tmp[7] = tmp[151] & tmp[183];
        tmp[32] = tmp[151] | tmp[117];
        tmp[177] = ~tmp[151] & tmp[117];
        tmp[105] = tmp[35] | tmp[117];
        tmp[3] = (tmp[149] | tmp[3] ^ tmp[86]) ^ (tmp[172] ^ (tmp[24] ^ tmp[156] & ~tmp[107])) ^ (tmp[55] ^ tmp[78] & ~(tmp[61] ^ tmp[26] & tmp[107] ^ tmp[5] & (tmp[175] ^ (tmp[16] ^ tmp[3]))));
        tmp[39] = tmp[37] ^ (tmp[49] & (tmp[77] ^ (tmp[1] | tmp[196] & ~tmp[77])) ^ (tmp[112] & (tmp[119] ^ tmp[13] & ~tmp[37]) ^ (tmp[30] ^ tmp[15] & ~(tmp[112] & (tmp[83] ^ (tmp[13] | tmp[119])) ^ (tmp[131] ^ (tmp[72] ^ (tmp[13] | tmp[76] ^ tmp[39])))))));
        tmp[76] = tmp[66] | tmp[113];
        tmp[150] = tmp[168] & (tmp[64] | tmp[150]);
        tmp[119] = tmp[163] & tmp[195];
        tmp[72] = tmp[173] | tmp[195];
        tmp[125] ^= tmp[165] ^ tmp[14] ^ (tmp[109] ^ ((tmp[134] | tmp[28] ^ (tmp[165] | tmp[14])) ^ tmp[57] & (tmp[14] & ~tmp[118] ^ tmp[12] ^ (tmp[134] | tmp[21] ^ tmp[48] ^ tmp[190] & tmp[14]))));
        tmp[83] = tmp[75] & tmp[146];
        tmp[131] = tmp[151] ^ tmp[117];
        tmp[37] = tmp[168] & ~tmp[18];
        tmp[113] ^= tmp[64] & tmp[200];
        tmp[77] = tmp[173] ^ tmp[195];
        tmp[30] = ~tmp[152];
        tmp[49] = tmp[152] ^ tmp[50];
        tmp[107] = tmp[64] & tmp[19];
        tmp[26] = tmp[35] | tmp[32];
        tmp[55] = tmp[35] | tmp[177];
        tmp[115] = tmp[192] | tmp[39];
        tmp[90] = ~tmp[192];
        tmp[148] = tmp[163] & tmp[125];
        tmp[29] = tmp[142] ^ (tmp[46] ^ tmp[182] & (tmp[133] ^ tmp[15] & tmp[167] ^ tmp[17] & (tmp[31] ^ tmp[4] ^ tmp[15] & ~(tmp[133] ^ tmp[62] & ~tmp[29]))));
        tmp[74] = tmp[12] ^ tmp[6] & (tmp[21] ^ tmp[14] & (tmp[182] | ~tmp[165])) ^ (tmp[190] & tmp[104] ^ (tmp[187] ^ tmp[57] & (tmp[47] ^ ((tmp[14] | tmp[27] ^ tmp[182] & (tmp[27] & tmp[74])) ^ tmp[6] & (tmp[145] ^ tmp[14] & (tmp[182] & tmp[165] ^ tmp[48]))))));
        tmp[118] = (tmp[134] | tmp[182] & (tmp[27] ^ tmp[14])) ^ (tmp[12] ^ (tmp[14] & tmp[47] ^ (tmp[198] ^ (tmp[31] | tmp[6] & (tmp[27] ^ tmp[21] ^ tmp[14] & ~tmp[28]) ^ (tmp[0] & tmp[145] ^ tmp[14] & ~(tmp[27] ^ tmp[118]))))));
        tmp[28] = tmp[151] & ~tmp[117];
        tmp[21] = tmp[105] ^ tmp[131];
        tmp[198] = tmp[183] & tmp[131];
        tmp[47] = ~tmp[3];
        tmp[182] = tmp[173] & ~tmp[195];
        tmp[12] = tmp[50] & tmp[30];
        tmp[57] = tmp[39] & tmp[90];
        tmp[187] = tmp[37] | tmp[29];
        tmp[104] = tmp[39] & tmp[74];
        tmp[190] = tmp[90] & tmp[74];
        tmp[133] = tmp[73] & ~tmp[19];
        tmp[38] = tmp[42] ^ tmp[78] & (tmp[63] ^ tmp[156] & tmp[176] ^ (tmp[149] | tmp[123] ^ tmp[61] ^ tmp[156] & ~(tmp[38] ^ tmp[123]))) ^ (tmp[201] ^ (tmp[156] & ((tmp[24] | tmp[42]) ^ tmp[9]) ^ (tmp[199] ^ tmp[5] & (tmp[2] ^ tmp[156] & ~(tmp[176] ^ tmp[178])))));
        tmp[61] = tmp[74] & ~tmp[39];
        tmp[2] = ~tmp[29];
        tmp[9] = tmp[192] ^ tmp[74];
        tmp[199] = tmp[39] ^ tmp[74];
        tmp[165] = tmp[116] ^ ((tmp[109] ^ tmp[184] | tmp[14]) ^ ((tmp[134] | tmp[143] ^ tmp[116] & tmp[14]) ^ (tmp[70] ^ (tmp[31] | tmp[143] ^ tmp[14] & (tmp[43] ^ tmp[147] & ~tmp[145]) ^ tmp[6] & (tmp[143] ^ tmp[14] & ~((tmp[0] | tmp[165]) ^ tmp[48]))))));
        tmp[48] = tmp[151] ^ tmp[198];
        tmp[122] = tmp[123] ^ tmp[178] ^ (tmp[5] & (tmp[201] ^ (tmp[172] ^ tmp[156] & (tmp[123] ^ (tmp[42] | tmp[63])))) ^ (tmp[156] & (tmp[42] | ~tmp[175]) ^ (tmp[100] ^ tmp[78] & ~((tmp[149] | tmp[16] ^ (tmp[201] ^ tmp[156] & tmp[122])) ^ (tmp[176] ^ tmp[172] ^ tmp[156] & (tmp[42] ^ tmp[86]))))));
        tmp[86] = tmp[168] & ~tmp[37];
        tmp[201] = tmp[152] ^ tmp[12];
        tmp[172] = tmp[90] & tmp[104];
        tmp[176] = tmp[87] & tmp[190];
        tmp[16] = tmp[66] | tmp[133];
        tmp[120] = tmp[170] ^ (tmp[159] ^ tmp[197] & ~tmp[155]) ^ (tmp[59] & (tmp[25] ^ tmp[197] & ~tmp[129]) ^ (tmp[130] ^ tmp[27] & ~((tmp[88] | tmp[25] ^ tmp[120]) ^ (tmp[204] ^ (tmp[174] ^ tmp[120])))));
        tmp[25] = tmp[111] & (tmp[151] ^ tmp[26]);
        tmp[204] = tmp[50] & tmp[38];
        tmp[129] = tmp[152] | tmp[38];
        tmp[30] &= tmp[38];
        tmp[155] = tmp[90] & tmp[61];
        tmp[130] = tmp[168] & tmp[2];
        tmp[159] = tmp[37] & tmp[2];
        tmp[123] = tmp[185] & tmp[2];
        tmp[175] = tmp[37] ^ (tmp[185] | tmp[29]);
        tmp[100] = tmp[39] & ~tmp[74];
        tmp[5] = tmp[192] | tmp[199];
        tmp[178] = tmp[90] & tmp[199];
        tmp[145] = tmp[151] ^ (tmp[35] | tmp[28]);
        tmp[43] = tmp[160] | tmp[122];
        tmp[143] = tmp[160] & tmp[122];
        tmp[6] = tmp[75] & tmp[122];
        tmp[116] = ~tmp[38];
        tmp[70] = tmp[152] ^ tmp[38];
        tmp[184] = tmp[173] & ~tmp[182];
        tmp[109] = tmp[199] ^ tmp[5];
        tmp[4] = tmp[115] ^ tmp[199];
        tmp[167] = tmp[163] & tmp[120];
        tmp[17] = tmp[173] | tmp[120];
        tmp[46] = tmp[173] & tmp[120];
        tmp[142] = tmp[77] | tmp[120];
        tmp[128] = tmp[125] & tmp[120];
        tmp[137] = ~tmp[122];
        tmp[144] = tmp[160] ^ tmp[122];
        tmp[97] = tmp[50] & tmp[30];
        tmp[138] = ~tmp[120];
        tmp[166] = tmp[173] ^ tmp[120];
        tmp[103] = tmp[152] & tmp[116];
        tmp[164] = tmp[129] & tmp[116];
        tmp[139] = ~(tmp[152] & tmp[38]);
        tmp[52] = tmp[168] ^ tmp[40] & tmp[2];
        tmp[108] = tmp[168] ^ tmp[130];
        tmp[135] = tmp[185] ^ tmp[130];
        tmp[171] = tmp[111] | tmp[109];
        tmp[109] &= tmp[87];
        tmp[10] = tmp[125] & tmp[46];
        tmp[34] = tmp[160] & tmp[137];
        tmp[81] = tmp[43] & tmp[137];
        tmp[137] &= tmp[75];
        tmp[179] = tmp[160] ^ tmp[6];
        tmp[44] = tmp[40] ^ (tmp[29] | tmp[86]);
        tmp[79] = ~tmp[167];
        tmp[102] = tmp[167] ^ tmp[128];
        tmp[101] = tmp[173] & tmp[138];
        tmp[93] = tmp[50] & tmp[103];
        tmp[58] = tmp[50] & ~tmp[129];
        tmp[84] = tmp[38] & tmp[139];
        tmp[136] = tmp[75] & tmp[34];
        tmp[193] = tmp[122] & ~tmp[143];
        tmp[41] = tmp[152] ^ tmp[50] & tmp[70];
        tmp[85] = tmp[120] & tmp[79];
        tmp[79] &= tmp[125];
        tmp[51] = tmp[195] & tmp[101];
        tmp[8] = tmp[6] ^ tmp[34];
        tmp[127] = ~tmp[81];
        tmp[99] = tmp[160] ^ tmp[137];
        tmp[169] = tmp[125] ^ tmp[101];
        tmp[170] = tmp[14] ^ (tmp[92] ^ (tmp[53] ^ tmp[197] & tmp[161])) ^ (tmp[59] & (tmp[197] ^ tmp[92] ^ tmp[92] & tmp[161]) ^ (tmp[154] ^ tmp[27] & ~(tmp[92] ^ ~tmp[174] & tmp[14] ^ tmp[197] & ~(tmp[80] ^ tmp[161]) ^ (tmp[88] | tmp[92] ^ (tmp[53] ^ (tmp[67] & tmp[14] ^ tmp[197] & ~(tmp[53] ^ tmp[170])))))));
        tmp[67] = tmp[50] & ~tmp[84];
        tmp[161] = tmp[125] & ~tmp[85];
        tmp[80] = tmp[101] ^ tmp[79] ^ tmp[68] & tmp[169];
        tmp[189] ^= tmp[165] & (tmp[98] ^ tmp[177] ^ tmp[25]) ^ (tmp[111] & ~(tmp[183] & tmp[177]) ^ tmp[145] ^ (tmp[192] | tmp[117] ^ tmp[111] & (tmp[98] ^ tmp[32]) ^ (tmp[35] | tmp[151] & ~tmp[28])));
        tmp[174] = tmp[167] ^ tmp[161];
        tmp[161] ^= tmp[46];
        tmp[98] = tmp[88] ^ tmp[165] & ~(tmp[32] ^ tmp[55] ^ tmp[111] & tmp[21]) ^ (tmp[21] ^ tmp[87] & tmp[48] ^ tmp[90] & (tmp[145] ^ (tmp[111] | tmp[28] ^ tmp[198]) ^ tmp[165] & (tmp[35] ^ tmp[131] ^ tmp[111] & (tmp[98] ^ tmp[131]))));
        tmp[121] ^= tmp[66] ^ tmp[56] & tmp[91] ^ (tmp[118] & (tmp[168] & ~(tmp[64] & tmp[73]) ^ tmp[107]) ^ tmp[65] & (tmp[118] & ~(tmp[73] ^ tmp[150]) ^ (tmp[73] ^ tmp[168] & ~(tmp[56] ^ tmp[162]))));
        tmp[107] = tmp[76] ^ tmp[150] ^ tmp[133] ^ (tmp[14] ^ tmp[118] & ~((tmp[168] | tmp[71]) ^ tmp[113])) ^ tmp[65] & ~(tmp[118] & (tmp[150] ^ tmp[113]) ^ (tmp[202] & (tmp[73] ^ tmp[56]) ^ tmp[168] & ~(tmp[56] ^ tmp[107])));
        tmp[113] = ~tmp[121];
        tmp[150] = tmp[98] & tmp[107];
        tmp[14] = (tmp[3] | tmp[195] ^ tmp[142] ^ tmp[35] & (tmp[184] ^ tmp[17])) ^ (tmp[120] ^ tmp[184] ^ tmp[35] & ~(tmp[184] ^ tmp[195] & tmp[138]));
        tmp[104] = tmp[196] ^ ((tmp[38] | tmp[61] ^ tmp[172] ^ tmp[87] & (tmp[104] ^ tmp[155]) ^ tmp[50] & (tmp[190] ^ tmp[87] & tmp[4])) ^ (tmp[50] & (tmp[176] ^ (tmp[192] | tmp[100])) ^ ((tmp[39] | tmp[74]) ^ tmp[178] ^ (tmp[111] | tmp[172] ^ tmp[74] & ~tmp[61]))));
        tmp[23] = tmp[168] & tmp[126] ^ (tmp[73] ^ tmp[64] & tmp[56]) ^ ((tmp[66] ^ tmp[23]) & tmp[118] ^ (tmp[194] ^ tmp[65] & ((tmp[23] ^ tmp[200] ^ tmp[76]) & tmp[118] ^ (tmp[168] & tmp[200] ^ (tmp[19] ^ tmp[16])))));
        tmp[76] = ~tmp[107];
        tmp[7] = tmp[35] ^ tmp[177] ^ tmp[111] & ~(tmp[117] ^ tmp[105]) ^ (tmp[165] & ~(tmp[32] ^ tmp[117] & tmp[7]) ^ (tmp[134] ^ (tmp[192] | tmp[117] ^ tmp[111] & (tmp[151] ^ tmp[55]) ^ tmp[165] & (tmp[117] ^ tmp[7] ^ tmp[111] & ~tmp[21]))));
        tmp[163] = tmp[47] & (tmp[35] & tmp[163] ^ tmp[72] ^ (tmp[119] | tmp[120])) ^ (tmp[182] ^ tmp[119] & tmp[138] ^ tmp[35] & ~(tmp[119] ^ tmp[51]));
        tmp[183] = tmp[182] ^ tmp[120] ^ tmp[35] & ~tmp[142] ^ tmp[47] & (tmp[195] ^ (tmp[142] ^ tmp[183] & (tmp[72] ^ tmp[101])));
        tmp[142] = tmp[107] & tmp[7];
        tmp[202] = tmp[49] ^ (tmp[66] & ~tmp[97] ^ (tmp[65] & (tmp[64] | ~(tmp[204] ^ tmp[30])) ^ (tmp[197] ^ (tmp[141] | tmp[38] ^ tmp[202] & tmp[204] ^ tmp[65] & ~(tmp[152] ^ tmp[66] & tmp[12])))));
        tmp[30] = ~tmp[104];
        tmp[19] = tmp[200] ^ tmp[168] & ~(tmp[73] ^ (tmp[66] | tmp[73])) ^ tmp[16] ^ (tmp[118] & ~(tmp[71] ^ tmp[91] & (tmp[66] ^ tmp[133])) ^ (tmp[63] ^ tmp[65] & ~(tmp[91] & (tmp[200] ^ tmp[162]) ^ tmp[118] & ~(tmp[168] & ~tmp[71] ^ (tmp[73] & tmp[56] ^ (tmp[66] | tmp[19]))))));
        tmp[71] = tmp[107] ^ tmp[7];
        tmp[48] = tmp[21] ^ tmp[111] & tmp[145] ^ (tmp[165] & ~(tmp[111] & ~tmp[26]) ^ (tmp[112] ^ tmp[90] & (tmp[117] ^ tmp[25] ^ tmp[165] & (tmp[117] ^ (tmp[35] | tmp[131]) ^ tmp[111] & ~tmp[48]))));
        tmp[51] = (tmp[3] | tmp[72] & tmp[138] ^ tmp[35] & (tmp[119] ^ tmp[101])) ^ (tmp[77] ^ ((tmp[72] | tmp[120]) ^ tmp[35] & ~(tmp[184] ^ tmp[51])));
        tmp[5] = (tmp[111] | tmp[57]) ^ (tmp[9] ^ (tmp[50] & ~(tmp[111] & tmp[190] ^ tmp[4]) ^ (tmp[78] ^ tmp[116] & (tmp[50] & (tmp[176] ^ tmp[155]) ^ (tmp[100] ^ tmp[5] ^ tmp[87] & (tmp[57] ^ tmp[100]))))));
        tmp[176] = ~tmp[19];
        tmp[171] = tmp[39] ^ ((tmp[192] | tmp[74]) ^ ((tmp[111] | tmp[9]) ^ (tmp[50] & ~(tmp[199] ^ (tmp[87] & (tmp[115] ^ tmp[74]) ^ tmp[178])) ^ (tmp[203] ^ (tmp[38] | tmp[57] ^ tmp[199] ^ tmp[171] ^ tmp[50] & (tmp[74] ^ tmp[171]))))));
        tmp[1] ^= tmp[163] ^ ~tmp[165] & tmp[14];
        tmp[81] = (tmp[29] | tmp[20] & (tmp[75] ^ tmp[146] & tmp[122])) ^ (tmp[20] & tmp[137] ^ tmp[8]) ^ (tmp[42] ^ tmp[125] & ~((tmp[29] | tmp[179] ^ tmp[89] & (tmp[75] ^ tmp[143])) ^ (tmp[81] ^ (tmp[20] | tmp[137] ^ tmp[193]))));
        tmp[100] = tmp[199] ^ ((tmp[192] | tmp[61]) ^ (tmp[87] & (tmp[39] ^ tmp[155]) ^ (tmp[50] & ~(tmp[115] ^ tmp[109]) ^ (tmp[27] ^ (tmp[38] | ~tmp[87] & tmp[155] ^ tmp[50] & (tmp[192] ^ tmp[100] ^ tmp[109]))))));
        tmp[109] = ~tmp[5];
        tmp[181] ^= tmp[51] ^ tmp[165] & tmp[183];
        tmp[34] = tmp[75] & tmp[127] ^ (tmp[20] ^ tmp[193]) ^ (tmp[160] & tmp[2] ^ (tmp[15] ^ tmp[125] & ~(tmp[143] ^ tmp[136] ^ (tmp[29] | tmp[8] ^ tmp[89] & (tmp[34] ^ tmp[137])))));
        tmp[99] ^= tmp[20] & tmp[127] ^ ((tmp[29] | tmp[6] ^ tmp[89] & tmp[122]) ^ (tmp[140] ^ tmp[125] & ~(tmp[20] & ~(tmp[43] ^ tmp[137]) ^ tmp[2] & (tmp[160] ^ tmp[20] & tmp[99]))));
        tmp[130] = tmp[168] ^ tmp[29] ^ ~(tmp[168] ^ (tmp[18] | tmp[29])) & tmp[170] ^ (tmp[20] & (~tmp[135] & tmp[170] ^ ((tmp[11] | tmp[29]) ^ tmp[86] ^ tmp[73] & (tmp[37] ^ tmp[130] ^ tmp[130] & tmp[170]))) ^ (tmp[92] ^ tmp[73] & ~(tmp[11] ^ (tmp[185] ^ tmp[159]) & ~tmp[170])));
        tmp[52] = tmp[73] & (~(tmp[185] ^ tmp[123]) | tmp[170]) ^ (tmp[175] ^ ~tmp[52] & tmp[170]) ^ (tmp[22] ^ tmp[20] & ~(tmp[73] & (tmp[175] ^ ~tmp[108] & tmp[170]) ^ (tmp[185] ^ (tmp[159] ^ tmp[52] & tmp[170]))));
        tmp[51] ^= (tmp[165] | tmp[183]) ^ tmp[0];
        tmp[14] = tmp[163] ^ (tmp[24] ^ tmp[165] & ~tmp[14]);
        tmp[129] = tmp[38] ^ ((tmp[66] | tmp[50] & tmp[116] ^ tmp[164]) ^ (tmp[67] ^ (tmp[132] ^ tmp[65] & ~((tmp[66] | tmp[129] ^ tmp[97]) ^ (tmp[129] ^ tmp[58])) ^ tmp[60] & (tmp[65] & ((tmp[66] | tmp[152]) ^ tmp[201]) ^ (tmp[38] ^ (tmp[152] ^ ((tmp[66] | tmp[152] ^ tmp[204]) ^ tmp[93])))))));
        tmp[135] = tmp[188] ^ (tmp[123] ^ tmp[2] & tmp[170]) ^ (tmp[73] & ~(tmp[18] & tmp[2] ^ ~(tmp[40] ^ tmp[187]) & tmp[170]) ^ (tmp[94] ^ tmp[20] & ~(tmp[18] ^ tmp[29] ^ tmp[44] & tmp[170] ^ tmp[73] & (tmp[135] ^ ~(tmp[168] | tmp[29]) & tmp[170]))));
        tmp[40] = tmp[171] | tmp[181];
        tmp[8] = tmp[122] ^ tmp[75] & tmp[43] ^ tmp[20] & (tmp[160] ^ tmp[136]) ^ ((tmp[29] | tmp[179] ^ tmp[20] & tmp[75] & tmp[144]) ^ (tmp[147] ^ tmp[125] & ~(tmp[160] ^ tmp[83] ^ tmp[20] & (tmp[83] ^ tmp[144]) ^ tmp[2] & (tmp[179] ^ tmp[20] & tmp[8]))));
        tmp[144] = tmp[76] & tmp[130];
        tmp[83] = tmp[107] | tmp[130];
        tmp[179] = tmp[98] & tmp[130];
        tmp[136] = ~tmp[181];
        tmp[43] = ~tmp[34];
        tmp[147] = ~tmp[99];
        tmp[94] = tmp[181] | tmp[129];
        tmp[132] = ~tmp[171] & tmp[129];
        tmp[116] = tmp[171] | tmp[129];
        tmp[24] = ~tmp[130];
        tmp[163] = tmp[107] ^ tmp[130];
        tmp[0] = tmp[30] & tmp[135];
        tmp[183] = ~tmp[51];
        tmp[175] = ~tmp[14];
        tmp[185] = ~tmp[129];
        tmp[22] = tmp[171] ^ tmp[129];
        tmp[86] = ~tmp[135];
        tmp[92] = tmp[171] & tmp[136];
        tmp[137] = tmp[136] & tmp[132];
        tmp[89] = tmp[98] & tmp[24];
        tmp[6] = tmp[107] & tmp[24];
        tmp[138] = (tmp[180] | tmp[173]) ^ tmp[166] ^ (tmp[125] ^ (tmp[122] & (tmp[125] & tmp[167] ^ (tmp[180] | tmp[166])) ^ (tmp[53] ^ tmp[158] & (tmp[173] ^ tmp[122] & ~(tmp[173] ^ (tmp[148] ^ tmp[125] & (tmp[68] & tmp[138])))))));
        tmp[53] = tmp[171] & tmp[185];
        tmp[201] = tmp[50] ^ (tmp[84] ^ (tmp[65] & ((tmp[66] | tmp[49]) ^ tmp[93]) ^ (tmp[64] & (tmp[103] ^ tmp[50] & tmp[139]) ^ (tmp[31] ^ tmp[60] & ((tmp[66] | tmp[164] ^ tmp[93]) ^ (tmp[204] ^ tmp[65] & ~(tmp[66] & ~tmp[201] ^ tmp[41])))))));
        tmp[93] = tmp[98] ^ tmp[163];
        tmp[2] = tmp[11] ^ ~tmp[123] & tmp[170] ^ (tmp[73] & (tmp[11] & tmp[29] ^ ~tmp[44] & tmp[170]) ^ (tmp[156] ^ tmp[20] & ~(tmp[37] ^ tmp[187] ^ ~(tmp[168] ^ tmp[188] & tmp[2]) & tmp[170] ^ tmp[73] & ~(tmp[11] ^ tmp[159] ^ tmp[108] & tmp[170]))));
        tmp[188] = tmp[22] ^ tmp[92];
        tmp[108] = tmp[98] & tmp[6];
        tmp[159] = tmp[129] & tmp[136] ^ tmp[53];
        tmp[11] = tmp[136] & tmp[53];
        tmp[187] = tmp[107] & tmp[201];
        tmp[37] = tmp[76] & tmp[201];
        tmp[44] = tmp[107] | tmp[201];
        tmp[123] = tmp[142] & tmp[201];
        tmp[128] = tmp[46] ^ (tmp[125] & tmp[101] ^ (tmp[68] & (tmp[148] ^ tmp[17]) ^ (tmp[122] & (tmp[46] ^ (tmp[148] ^ tmp[68] & (tmp[167] ^ tmp[125] & tmp[17]))) ^ (tmp[62] ^ tmp[158] & ~(tmp[68] & tmp[102] ^ tmp[122] & (tmp[166] ^ (tmp[128] ^ (tmp[180] | tmp[17] ^ tmp[128]))))))));
        tmp[80] = tmp[161] ^ ((tmp[180] | tmp[102]) ^ (tmp[122] & ~tmp[80] ^ (tmp[149] ^ tmp[158] & ~(tmp[173] ^ (tmp[68] & tmp[125] ^ tmp[79] ^ tmp[122] & tmp[80])))));
        tmp[79] = ~tmp[138];
        tmp[149] = ~tmp[201];
        tmp[102] = tmp[107] ^ tmp[201];
        tmp[41] = tmp[97] ^ tmp[164] ^ ((tmp[66] | tmp[152] ^ tmp[67]) ^ (tmp[65] & (tmp[152] ^ tmp[58] ^ (tmp[66] | tmp[84] ^ tmp[50] & ~tmp[70])) ^ (tmp[106] ^ (tmp[141] | (tmp[66] | tmp[84] ^ tmp[67]) ^ (tmp[84] ^ (tmp[67] ^ tmp[65] & (tmp[152] ^ (tmp[12] ^ (tmp[66] | tmp[41])))))))));
        tmp[12] = tmp[8] & tmp[187];
        tmp[70] = tmp[30] & tmp[128];
        tmp[67] = tmp[135] | tmp[128];
        tmp[84] = tmp[135] & tmp[128];
        tmp[58] = tmp[104] | tmp[128];
        tmp[106] = ~tmp[189] & tmp[80];
        tmp[164] = tmp[109] & tmp[80];
        tmp[97] = tmp[5] & tmp[80];
        tmp[166] = tmp[81] & tmp[80];
        tmp[167] = tmp[171] & ~tmp[53];
        tmp[148] = tmp[107] & tmp[149];
        tmp[46] = tmp[7] & tmp[149];
        tmp[62] = tmp[187] ^ tmp[123];
        tmp[101] = tmp[107] ^ tmp[98] & ~tmp[163];
        tmp[156] = tmp[135] ^ tmp[128];
        tmp[204] = tmp[0] ^ tmp[128];
        tmp[139] = ~tmp[80];
        tmp[60] = tmp[189] ^ tmp[80];
        tmp[103] = tmp[5] ^ tmp[80];
        tmp[49] = tmp[19] & tmp[41];
        tmp[31] = tmp[185] & tmp[106];
        tmp[64] = tmp[81] & tmp[164];
        tmp[140] = tmp[81] & tmp[97];
        tmp[127] = tmp[84] ^ (tmp[104] | tmp[67]);
        tmp[143] = tmp[30] & tmp[156];
        tmp[15] = tmp[189] & tmp[139];
        tmp[193] = tmp[5] & tmp[139];
        tmp[87] = tmp[81] & tmp[139];
        tmp[155] = tmp[113] & tmp[60];
        tmp[115] = tmp[129] | tmp[60];
        tmp[27] = ~tmp[148];
        tmp[61] = tmp[187] ^ tmp[46];
        tmp[199] = tmp[7] & ~tmp[102];
        tmp[146] = tmp[34] ^ tmp[204];
        tmp[169] = tmp[17] ^ (tmp[10] ^ ((tmp[180] | tmp[174]) ^ (tmp[122] & ~(tmp[10] ^ tmp[85] ^ tmp[68] & tmp[174]) ^ (tmp[13] ^ tmp[158] & ~((tmp[180] | tmp[169]) ^ tmp[161] ^ tmp[122] & ~(tmp[169] ^ tmp[180] & ~tmp[169]))))));
        tmp[161] = tmp[19] ^ tmp[49];
        tmp[174] = tmp[129] | tmp[15];
        tmp[68] = tmp[81] & tmp[193];
        tmp[85] = tmp[81] & ~tmp[164];
        tmp[10] = tmp[164] ^ tmp[81] & (tmp[5] | tmp[80]);
        tmp[13] = tmp[107] & tmp[27];
        tmp[17] = tmp[19] | tmp[169];
        tmp[42] = tmp[19] & tmp[169];
        tmp[57] = tmp[176] & tmp[169];
        tmp[178] = tmp[43] & tmp[169];
        tmp[203] = tmp[1] & tmp[169];
        tmp[9] = tmp[34] | tmp[169];
        tmp[190] = ~tmp[193];
        tmp[4] = tmp[5] ^ tmp[87];
        tmp[78] = ~tmp[169];
        tmp[184] = tmp[19] ^ tmp[169];
        tmp[119] = tmp[34] ^ tmp[169];
        tmp[72] = tmp[43] & (tmp[135] ^ tmp[143]);
        tmp[77] = tmp[1] & (tmp[34] & tmp[169]);
        tmp[131] = tmp[1] & tmp[178];
        tmp[113] &= tmp[189] ^ tmp[115];
        tmp[27] = tmp[201] ^ tmp[7] & tmp[27];
        tmp[25] = tmp[41] & tmp[78];
        tmp[26] = tmp[19] & tmp[78];
        tmp[90] = tmp[34] & tmp[78];
        tmp[112] = tmp[203] ^ tmp[9];
        tmp[145] = tmp[203] ^ tmp[119];
        tmp[21] = tmp[178] | tmp[78];
        tmp[162] = tmp[7] & ~tmp[13];
        tmp[200] = tmp[58] ^ tmp[156] ^ tmp[34] & (tmp[128] ^ tmp[143]);
        tmp[91] = tmp[169] & ~tmp[42];
        tmp[133] = tmp[1] & tmp[21];
        tmp[63] = tmp[1] & ~tmp[9];
        tmp[16] = tmp[42] ^ tmp[41] & tmp[184];
        tmp[185] = tmp[106] ^ (tmp[121] | tmp[189] ^ (tmp[129] | tmp[106])) ^ tmp[99] & ~(tmp[155] ^ ~tmp[185] & tmp[15]);
        tmp[155] = tmp[99] & ~(tmp[31] ^ (tmp[60] ^ tmp[155])) ^ (tmp[189] ^ tmp[174] ^ (tmp[121] | tmp[189] & tmp[80] ^ tmp[174]));
        tmp[106] = tmp[41] & ~tmp[91];
        tmp[115] = (tmp[121] | tmp[60] ^ tmp[115]) ^ ((tmp[189] | tmp[80]) ^ tmp[174]) ^ tmp[99] & (tmp[189] ^ tmp[113]);
        tmp[197] = tmp[48] & ~(tmp[178] ^ tmp[1] & tmp[78]);
        tmp[182] = tmp[91] ^ tmp[106];
        tmp[15] = (tmp[121] | tmp[31] ^ tmp[189] & ~tmp[15]) ^ (tmp[129] ^ tmp[60] ^ tmp[99] & (tmp[174] ^ tmp[113]));
        tmp[113] = tmp[48] & ~tmp[182];
        vector[0] = tmp[145] ^ (tmp[48] & ~tmp[63] ^ (tmp[168] ^ tmp[104] & ~(tmp[178] ^ tmp[133]) ^ (tmp[23] | tmp[48] & ~tmp[90] ^ tmp[104] & ~(tmp[48] & (tmp[169] ^ tmp[203]) ^ (tmp[119] ^ tmp[77])))));
        vector[1] = tmp[201];
        vector[2] = tmp[132] ^ (tmp[11] ^ (tmp[99] & ~(tmp[171] ^ tmp[137]) ^ (tmp[24] & (tmp[40] ^ tmp[99] & tmp[129] & (tmp[171] ^ tmp[136])) ^ (tmp[50] ^ tmp[98] & ~(tmp[24] & (tmp[92] ^ tmp[99] & tmp[132]) ^ (tmp[53] ^ tmp[11] ^ tmp[99] & (tmp[22] ^ tmp[136] & (tmp[171] & tmp[129]))))))));
        vector[3] = tmp[169];
        vector[4] = tmp[94] ^ tmp[22] ^ (tmp[99] & tmp[116] ^ ((tmp[130] | tmp[171] ^ tmp[40] ^ tmp[99] & (tmp[171] ^ tmp[94])) ^ (tmp[35] ^ tmp[98] & (tmp[147] & tmp[137] ^ (tmp[130] | tmp[40] ^ tmp[99] & ~tmp[94])))));
        vector[5] = tmp[80];
        vector[6] = tmp[176] & (tmp[81] ^ tmp[97]) ^ (tmp[68] ^ (tmp[164] ^ (tmp[2] & ~(tmp[164] ^ (tmp[68] ^ tmp[19] & ~tmp[4])) ^ (tmp[122] ^ (tmp[14] | tmp[193] ^ (tmp[64] ^ tmp[176] & (tmp[5] ^ tmp[81] & tmp[103])) ^ tmp[2] & ~(tmp[164] ^ (tmp[19] | tmp[81] ^ tmp[193])))))));
        vector[7] = tmp[98];
        vector[8] = (tmp[51] | tmp[8] & tmp[62] ^ (tmp[107] ^ tmp[7] & tmp[44])) ^ (tmp[76] & tmp[7] ^ tmp[201] ^ tmp[8] & ~tmp[62]) ^ (tmp[118] ^ tmp[100] & (tmp[71] ^ ~tmp[8] & (tmp[123] ^ tmp[148]) ^ tmp[183] & ((tmp[8] | tmp[44]) ^ tmp[61])));
        vector[9] = tmp[135];
        vector[10] = tmp[8] ^ (tmp[142] ^ tmp[187]) ^ (tmp[51] | tmp[27] ^ tmp[8] & ~(tmp[107] ^ tmp[7] & tmp[148])) ^ (tmp[74] ^ tmp[100] & (tmp[37] ^ tmp[46] ^ tmp[8] & (tmp[187] ^ tmp[7] & tmp[37]) ^ tmp[183] & (tmp[8] & ~tmp[187] ^ tmp[27])));
        vector[11] = tmp[52];
        vector[12] = (tmp[104] | tmp[84]) ^ (tmp[156] ^ tmp[34] & tmp[204]) ^ ((tmp[51] | tmp[30] & tmp[86] & tmp[128] ^ tmp[34] & ~tmp[143]) ^ (tmp[195] ^ tmp[149] & (tmp[135] ^ tmp[34] & ~tmp[204] ^ tmp[183] & (tmp[0] ^ tmp[72]))));
        vector[13] = tmp[121];
        vector[14] = (tmp[48] | (tmp[1] ^ tmp[43]) & tmp[169]) ^ (tmp[104] & (tmp[178] ^ tmp[63] ^ tmp[197]) ^ (tmp[133] ^ (tmp[119] ^ (tmp[75] ^ ~tmp[23] & (tmp[77] ^ (tmp[48] | tmp[119]) ^ tmp[104] & ~(tmp[119] ^ (tmp[1] & tmp[90] ^ tmp[48] & ~tmp[119])))))));
        vector[15] = tmp[202];
        vector[16] = tmp[181] ^ (tmp[167] ^ (tmp[99] & (tmp[129] ^ tmp[11]) ^ tmp[24] & (tmp[116] ^ tmp[99] & tmp[188]) ^ (tmp[56] ^ tmp[98] & ~(tmp[159] ^ tmp[147] & (tmp[129] ^ (tmp[181] | tmp[53])) ^ (tmp[130] | tmp[132] ^ tmp[99] & (tmp[40] ^ tmp[167]))))));
        vector[17] = tmp[128];
        vector[18] = tmp[48] & ~tmp[112] ^ (tmp[133] ^ (tmp[119] ^ (tmp[104] & ~(tmp[77] ^ tmp[48] & ~(tmp[178] ^ tmp[1] & tmp[9])) ^ (tmp[39] ^ (tmp[23] | tmp[119] ^ (tmp[131] ^ tmp[48] & tmp[112]) ^ tmp[104] & (tmp[131] ^ (tmp[178] ^ tmp[48] & ~tmp[145])))))));
        vector[19] = tmp[41];
        vector[20] = tmp[10] ^ (tmp[19] & tmp[190] ^ ((tmp[14] | tmp[19] & (tmp[5] & tmp[81] ^ tmp[97]) ^ (tmp[85] ^ tmp[5] & tmp[190])) ^ (tmp[3] ^ tmp[2] & ~(tmp[5] & (tmp[81] ^ tmp[139]) ^ tmp[19] & (tmp[5] ^ tmp[140])))));
        vector[21] = tmp[189];
        vector[22] = tmp[99] ^ (tmp[130] ^ (tmp[159] ^ (tmp[160] ^ tmp[98] & ~(tmp[94] ^ (tmp[171] & tmp[99] ^ tmp[116]) ^ tmp[24] & (tmp[94] ^ (tmp[99] | tmp[188]))))));
        vector[23] = tmp[138];
        vector[24] = tmp[176] & tmp[41] ^ tmp[169] ^ ((tmp[52] | tmp[161] ^ tmp[48] & (tmp[49] ^ tmp[57]) ^ tmp[175] & (tmp[48] & (tmp[49] ^ tmp[169]) ^ tmp[16])) ^ (tmp[113] ^ (tmp[66] ^ (tmp[14] | tmp[19] & (tmp[41] ^ tmp[169]) ^ tmp[48] & (tmp[169] ^ tmp[106])))));
        vector[25] = tmp[104];
        vector[26] = tmp[111] ^ ((tmp[201] | tmp[51] & (tmp[58] ^ tmp[86] & tmp[67] ^ tmp[34] & (tmp[70] ^ tmp[156])) ^ tmp[200]) ^ (tmp[146] ^ tmp[51] & ~(tmp[156] ^ (tmp[70] ^ tmp[43] & (tmp[104] & tmp[84])))));
        vector[27] = tmp[19];
        vector[28] = tmp[130] ^ (tmp[150] ^ ((tmp[6] | tmp[138]) ^ (tmp[202] & (tmp[107] ^ tmp[98] & tmp[76] ^ tmp[98] & tmp[100] & ~tmp[83]) ^ (tmp[120] ^ tmp[100] & ~((tmp[179] ^ tmp[6]) & tmp[79] ^ tmp[101])))));
        vector[29] = tmp[99];
        vector[30] = tmp[146] ^ (tmp[183] & ((tmp[104] | tmp[135]) ^ tmp[156] ^ tmp[34] & tmp[127]) ^ (tmp[29] ^ (tmp[201] | tmp[200] ^ tmp[183] & (tmp[135] ^ (tmp[104] ^ tmp[72])))));
        vector[31] = tmp[107];
        vector[32] = tmp[98] ^ (tmp[6] ^ ((tmp[179] ^ tmp[163]) & tmp[79] ^ (tmp[100] & (tmp[138] | ~tmp[108]) ^ (tmp[65] ^ tmp[202] & ~(tmp[100] & tmp[108] ^ (tmp[6] ^ tmp[179] & tmp[79]))))));
        vector[33] = tmp[34];
        vector[34] = tmp[15] ^ (tmp[192] ^ tmp[2] & ~tmp[155]);
        vector[35] = tmp[14];
        vector[36] = tmp[34] ^ (tmp[77] ^ (tmp[48] & (tmp[1] ^ tmp[178]) ^ (tmp[104] & ~(tmp[90] ^ tmp[1] & tmp[119] ^ tmp[197]) ^ (tmp[173] ^ (tmp[23] | tmp[104] & (tmp[48] & tmp[21] ^ (tmp[1] & tmp[43] ^ tmp[90])) ^ (tmp[133] ^ (tmp[169] ^ tmp[197])))))));
        vector[37] = tmp[129];
        vector[38] = tmp[48] & ~(tmp[17] & tmp[78] ^ tmp[41] & ~tmp[17]) ^ tmp[182] ^ ((tmp[52] | tmp[17] ^ (tmp[48] & ((tmp[19] ^ tmp[41]) & tmp[78]) ^ (tmp[48] | tmp[14] | tmp[49] ^ tmp[17]))) ^ (tmp[20] ^ tmp[175] & (tmp[17] ^ tmp[41] & tmp[42] ^ tmp[48] & (tmp[26] ^ tmp[106]))));
        vector[39] = tmp[100];
        vector[40] = tmp[152] ^ (tmp[135] ^ (tmp[104] ^ tmp[34] & (tmp[128] ^ tmp[70]))) ^ ((tmp[201] | tmp[34] & ~tmp[0] ^ tmp[128] ^ tmp[183] & (tmp[43] & tmp[128])) ^ tmp[183] & (tmp[127] ^ tmp[34] & ~tmp[127]));
        vector[41] = tmp[23];
        vector[42] = tmp[19] ^ (tmp[48] ^ (tmp[25] ^ (~tmp[52] & (tmp[169] ^ tmp[48] & tmp[161] ^ tmp[175] & (tmp[26] ^ tmp[48] & (tmp[17] ^ tmp[25]))) ^ (tmp[151] ^ tmp[175] & (tmp[16] ^ tmp[48] & ~(tmp[91] ^ tmp[41] & ~tmp[184]))))));
        vector[43] = tmp[5];
        vector[44] = tmp[41] & tmp[169] ^ tmp[184] ^ (tmp[48] & tmp[106] ^ ((tmp[52] | ~tmp[48] & tmp[42] ^ tmp[175] & (tmp[169] ^ tmp[48] & tmp[57])) ^ (tmp[180] ^ (tmp[14] | tmp[19] ^ tmp[41] & tmp[26] ^ tmp[113]))));
        vector[45] = tmp[171];
        vector[46] = tmp[64] ^ tmp[193] ^ tmp[19] & ~tmp[87] ^ (tmp[2] & tmp[10] ^ (tmp[18] ^ (tmp[14] | tmp[164] ^ tmp[19] & (tmp[164] ^ tmp[85]) ^ tmp[2] & ~(tmp[81] ^ tmp[164] ^ tmp[19] & tmp[4]))));
        vector[47] = tmp[7];
        vector[48] = tmp[141] ^ (~tmp[2] & tmp[155] ^ tmp[15]);
        vector[49] = tmp[1];
        vector[50] = tmp[144] ^ tmp[89] ^ (tmp[202] & ~(tmp[98] & tmp[83] ^ (tmp[98] ^ tmp[107]) & (tmp[100] & tmp[130])) ^ ((tmp[138] | tmp[130] ^ tmp[98] & ~tmp[6]) ^ (tmp[117] ^ tmp[100] & ~(tmp[101] ^ (tmp[138] | tmp[144] ^ tmp[98] & ~tmp[144])))));
        vector[51] = tmp[81];
        vector[52] = tmp[115] ^ (tmp[158] ^ tmp[2] & tmp[185]);
        vector[53] = tmp[181];
        vector[54] = tmp[93] ^ ((tmp[144] | tmp[138]) ^ (tmp[100] & ~(tmp[130] ^ tmp[89] ^ tmp[79] & (tmp[130] ^ tmp[108])) ^ (tmp[170] ^ tmp[202] & ~(tmp[100] & ((tmp[150] ^ tmp[76]) & tmp[130] ^ (tmp[138] | tmp[93])) ^ (tmp[144] ^ ((tmp[98] ^ tmp[130] | tmp[138]) ^ tmp[98] & (tmp[76] | tmp[6])))))));
        vector[55] = tmp[8];
        vector[56] = tmp[2] & ~(tmp[19] & tmp[140]) ^ (tmp[19] & (tmp[166] ^ tmp[103]) ^ tmp[4] ^ (tmp[38] ^ (tmp[14] | (tmp[81] ^ tmp[109]) & tmp[80] ^ tmp[19] & (tmp[97] ^ tmp[64]) ^ tmp[2] & (tmp[164] ^ (tmp[87] ^ tmp[19] & (tmp[166] ^ tmp[193]))))));
        vector[57] = tmp[48];
        vector[58] = tmp[12] ^ (tmp[44] ^ tmp[162]) ^ ((tmp[51] | tmp[8] & ~(tmp[107] ^ tmp[123]) ^ (tmp[37] ^ tmp[199])) ^ (tmp[165] ^ tmp[100] & ~(tmp[183] & (tmp[37] ^ tmp[12] ^ tmp[7] & ~tmp[37]) ^ (tmp[201] ^ tmp[199] ^ tmp[8] & (tmp[201] ^ (tmp[107] ^ tmp[7] & ~tmp[44]))))));
        vector[59] = tmp[2];
        vector[60] = tmp[125] ^ tmp[100] & ~(tmp[183] & (tmp[7] & tmp[201] ^ tmp[8] & tmp[37]) ^ (tmp[142] ^ tmp[8] & tmp[61])) ^ (tmp[71] ^ tmp[8] & (tmp[37] ^ tmp[7] & tmp[102]) ^ tmp[183] & (tmp[201] ^ (tmp[46] ^ tmp[8] & ~(tmp[13] ^ tmp[162]))));
        vector[61] = tmp[130];
        vector[62] = tmp[115] ^ (tmp[73] ^ (tmp[2] | tmp[185]));
        vector[63] = tmp[51];
    }

    var Buffer = buffer.Buffer;

    function rotl8(val, bits) {
        return ((val << bits) | (val >> (8 - bits))) & 0xff;
    }

    function cipher8FromIV(iv) {
        let cipher8 = new Uint8Array(256);
        for (let ii = 0; ii < 8; ++ii) {
            for (let jj = 0; jj < 32; ++jj) {
                cipher8[32 * ii + jj] = rotl8(iv[jj], ii);
            }
        }
        return cipher8;
    }



    /**
	 * input:    encrypted Buffer
	 * returns:  cleartext Buffer
	 */
    function decrypt(input) {

        if (input.length < 288 || (input.length - 32) % 256 !== 0) {
            throw new Error('Invalid input length');
        }

        // Allocate space for decrypted payload
        let output8 = new Uint8Array(input.slice(32));
        let outputBuffer = output8.buffer;
        let output32 = new Int32Array(outputBuffer);

        // Initialize cipher
        var slice = input.slice(0, 32);
        var cipher8 = cipher8FromIV(input.slice(0, 32));
        var cipher32temp = new Int32Array(cipher8FromIV(input.slice(0, 32)));
        let cipher32 = new Int32Array(cipher8FromIV(input.slice(0, 32)).buffer);

        // Decrypt in chunks of 256 bytes
        for (let offset = 0; offset < output8.length; offset += 256) {
            let tmp = output8.slice(offset, offset + 256);
            var shuffle32 = new Int32Array(outputBuffer, offset, 64);
            unshuffle(shuffle32);
            for (let ii = 0; ii < 64; ++ii) {
                output32[offset / 4 + ii] ^= cipher32[ii];
            }
            cipher32 = new Int32Array(tmp.buffer);
        }
        return new Buffer(outputBuffer).slice(0, output8.length - output8[output8.length - 1]);
    }

    return {
        d: function (b) {
            return decrypt(b);
        }
    };
})();