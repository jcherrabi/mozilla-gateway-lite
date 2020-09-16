require("source-map-support").install();
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/app.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/csv-parse/lib/ResizeableBuffer.js":
/*!********************************************************!*\
  !*** ./node_modules/csv-parse/lib/ResizeableBuffer.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



class ResizeableBuffer{
  constructor(size=100){
    this.size = size
    this.length = 0
    this.buf = Buffer.alloc(size)
  }
  prepend(val){
    const length = this.length++
    if(length === this.size){
      this.resize()
    }
    const buf = this.clone()
    this.buf[0] = val
    buf.copy(this.buf,1, 0, length)
  }
  append(val){
    const length = this.length++
    if(length === this.size){
      this.resize()
    }
    this.buf[length] = val
  }
  clone(){
    return Buffer.from(this.buf.slice(0, this.length))
  }
  resize(){
    const length = this.length
    this.size = this.size * 2
    const buf = Buffer.alloc(this.size)
    this.buf.copy(buf,0, 0, length)
    this.buf = buf
  }
  toString(){
    return this.buf.slice(0, this.length).toString()
  }
  toJSON(){
    return this.toString()
  }
  reset(){
    this.length = 0
  }
}

module.exports = ResizeableBuffer


/***/ }),

/***/ "./node_modules/csv-parse/lib/index.js":
/*!*********************************************!*\
  !*** ./node_modules/csv-parse/lib/index.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


/*
CSV Parse

Please look at the [project documentation](https://csv.js.org/parse/) for
additional information.
*/

const { Transform } = __webpack_require__(/*! stream */ "stream")
const ResizeableBuffer = __webpack_require__(/*! ./ResizeableBuffer */ "./node_modules/csv-parse/lib/ResizeableBuffer.js")

const tab = 9
const nl = 10
const np = 12
const cr = 13
const space = 32
const bom_utf8 = Buffer.from([239, 187, 191])

class Parser extends Transform {
  constructor(opts = {}){
    super({...{readableObjectMode: true}, ...opts})
    const options = {}
    // Merge with user options
    for(let opt in opts){
      options[underscore(opt)] = opts[opt]
    }
    // Normalize option `bom`
    if(options.bom === undefined || options.bom === null || options.bom === false){
      options.bom = false
    }else if(options.bom !== true){
      throw new CsvError('CSV_INVALID_OPTION_BOM', [
        'Invalid option bom:', 'bom must be true,',
        `got ${JSON.stringify(options.bom)}`
      ])
    }
    // Normalize option `cast`
    let fnCastField = null
    if(options.cast === undefined || options.cast === null || options.cast === false || options.cast === ''){
      options.cast = undefined
    }else if(typeof options.cast === 'function'){
      fnCastField = options.cast
      options.cast = true
    }else if(options.cast !== true){
      throw new CsvError('CSV_INVALID_OPTION_CAST', [
        'Invalid option cast:', 'cast must be true or a function,',
        `got ${JSON.stringify(options.cast)}`
      ])
    }
    // Normalize option `cast_date`
    if(options.cast_date === undefined || options.cast_date === null || options.cast_date === false || options.cast_date === ''){
      options.cast_date = false
    }else if(options.cast_date === true){
      options.cast_date = function(value){
        const date = Date.parse(value)
        return !isNaN(date) ? new Date(date) : value
      }
    }else if(typeof options.cast_date !== 'function'){
      throw new CsvError('CSV_INVALID_OPTION_CAST_DATE', [
        'Invalid option cast_date:', 'cast_date must be true or a function,',
        `got ${JSON.stringify(options.cast_date)}`
      ])
    }
    // Normalize option `columns`
    let fnFirstLineToHeaders = null
    if(options.columns === true){
      // Fields in the first line are converted as-is to columns
      fnFirstLineToHeaders = undefined
    }else if(typeof options.columns === 'function'){
      fnFirstLineToHeaders = options.columns
      options.columns = true
    }else if(Array.isArray(options.columns)){
      options.columns = normalizeColumnsArray(options.columns)
    }else if(options.columns === undefined || options.columns === null || options.columns === false){
      options.columns = false
    }else{
      throw new CsvError('CSV_INVALID_OPTION_COLUMNS', [
        'Invalid option columns:',
        'expect an object, a function or true,',
        `got ${JSON.stringify(options.columns)}`
      ])
    }
    // Normalize option `columns_duplicates_to_array`
    if(options.columns_duplicates_to_array === undefined || options.columns_duplicates_to_array === null || options.columns_duplicates_to_array === false){
      options.columns_duplicates_to_array = false
    }else if(options.columns_duplicates_to_array !== true){
      throw new CsvError('CSV_INVALID_OPTION_COLUMNS_DUPLICATES_TO_ARRAY', [
        'Invalid option columns_duplicates_to_array:',
        'expect an boolean,',
        `got ${JSON.stringify(options.columns_duplicates_to_array)}`
      ])
    }
    // Normalize option `comment`
    if(options.comment === undefined || options.comment === null || options.comment === false || options.comment === ''){
      options.comment = null
    }else{
      if(typeof options.comment === 'string'){
        options.comment = Buffer.from(options.comment)
      }
      if(!Buffer.isBuffer(options.comment)){
        throw new CsvError('CSV_INVALID_OPTION_COMMENT', [
          'Invalid option comment:',
          'comment must be a buffer or a string,',
          `got ${JSON.stringify(options.comment)}`
        ])
      }
    }
    // Normalize option `delimiter`
    const delimiter_json = JSON.stringify(options.delimiter)
    if(!Array.isArray(options.delimiter)) options.delimiter = [options.delimiter]
    if(options.delimiter.length === 0){
      throw new CsvError('CSV_INVALID_OPTION_DELIMITER', [
        'Invalid option delimiter:',
        'delimiter must be a non empty string or buffer or array of string|buffer,',
        `got ${delimiter_json}`
      ])
    }
    options.delimiter = options.delimiter.map(function(delimiter){
      if(delimiter === undefined || delimiter === null || delimiter === false){
        return Buffer.from(',')
      }
      if(typeof delimiter === 'string'){
        delimiter = Buffer.from(delimiter)
      }
      if( !Buffer.isBuffer(delimiter) || delimiter.length === 0){
        throw new CsvError('CSV_INVALID_OPTION_DELIMITER', [
          'Invalid option delimiter:',
          'delimiter must be a non empty string or buffer or array of string|buffer,',
          `got ${delimiter_json}`
        ])
      }
      return delimiter
    })
    // Normalize option `escape`
    if(options.escape === undefined || options.escape === true){
      options.escape = Buffer.from('"')
    }else if(typeof options.escape === 'string'){
      options.escape = Buffer.from(options.escape)
    }else if (options.escape === null || options.escape === false){
      options.escape = null
    }
    if(options.escape !== null){
      if(!Buffer.isBuffer(options.escape)){
        throw new Error(`Invalid Option: escape must be a buffer, a string or a boolean, got ${JSON.stringify(options.escape)}`)
      }else if(options.escape.length !== 1){
        throw new Error(`Invalid Option Length: escape must be one character, got ${options.escape.length}`)
      }else{
        options.escape = options.escape[0]
      }
    }
    // Normalize option `from`
    if(options.from === undefined || options.from === null){
      options.from = 1
    }else{
      if(typeof options.from === 'string' && /\d+/.test(options.from)){
        options.from = parseInt(options.from)
      }
      if(Number.isInteger(options.from)){
        if(options.from < 0){
          throw new Error(`Invalid Option: from must be a positive integer, got ${JSON.stringify(opts.from)}`)
        }
      }else{
        throw new Error(`Invalid Option: from must be an integer, got ${JSON.stringify(options.from)}`)
      }
    }
    // Normalize option `from_line`
    if(options.from_line === undefined || options.from_line === null){
      options.from_line = 1
    }else{
      if(typeof options.from_line === 'string' && /\d+/.test(options.from_line)){
        options.from_line = parseInt(options.from_line)
      }
      if(Number.isInteger(options.from_line)){
        if(options.from_line <= 0){
          throw new Error(`Invalid Option: from_line must be a positive integer greater than 0, got ${JSON.stringify(opts.from_line)}`)
        }
      }else{
        throw new Error(`Invalid Option: from_line must be an integer, got ${JSON.stringify(opts.from_line)}`)
      }
    }
    // Normalize option `info`
    if(options.info === undefined || options.info === null || options.info === false){
      options.info = false
    }else if(options.info !== true){
      throw new Error(`Invalid Option: info must be true, got ${JSON.stringify(options.info)}`)
    }
    // Normalize option `max_record_size`
    if(options.max_record_size === undefined || options.max_record_size === null || options.max_record_size === false){
      options.max_record_size = 0
    }else if(Number.isInteger(options.max_record_size) && options.max_record_size >= 0){
      // Great, nothing to do
    }else if(typeof options.max_record_size === 'string' && /\d+/.test(options.max_record_size)){
      options.max_record_size = parseInt(options.max_record_size)
    }else{
      throw new Error(`Invalid Option: max_record_size must be a positive integer, got ${JSON.stringify(options.max_record_size)}`)
    }
    // Normalize option `objname`
    if(options.objname === undefined || options.objname === null || options.objname === false){
      options.objname = undefined
    }else if(Buffer.isBuffer(options.objname)){
      if(options.objname.length === 0){
        throw new Error(`Invalid Option: objname must be a non empty buffer`)
      }
      options.objname = options.objname.toString()
    }else if(typeof options.objname === 'string'){
      if(options.objname.length === 0){
        throw new Error(`Invalid Option: objname must be a non empty string`)
      }
      // Great, nothing to do
    }else{
      throw new Error(`Invalid Option: objname must be a string or a buffer, got ${options.objname}`)
    }
    // Normalize option `on_record`
    if(options.on_record === undefined || options.on_record === null){
      options.on_record = undefined
    }else if(typeof options.on_record !== 'function'){
      throw new CsvError('CSV_INVALID_OPTION_ON_RECORD', [
        'Invalid option `on_record`:',
        'expect a function,',
        `got ${JSON.stringify(options.on_record)}`
      ])
    }
    // Normalize option `quote`
    if(options.quote === null || options.quote === false || options.quote === ''){
      options.quote = null
    }else{
      if(options.quote === undefined || options.quote === true){
        options.quote = Buffer.from('"')
      }else if(typeof options.quote === 'string'){
        options.quote = Buffer.from(options.quote)
      }
      if(!Buffer.isBuffer(options.quote)){
        throw new Error(`Invalid Option: quote must be a buffer or a string, got ${JSON.stringify(options.quote)}`)
      }else if(options.quote.length !== 1){
        throw new Error(`Invalid Option Length: quote must be one character, got ${options.quote.length}`)
      }else{
        options.quote = options.quote[0]
      }
    }
    // Normalize option `raw`
    if(options.raw === undefined || options.raw === null || options.raw === false){
      options.raw = false
    }else if(options.raw !== true){
      throw new Error(`Invalid Option: raw must be true, got ${JSON.stringify(options.raw)}`)
    }
    // Normalize option `record_delimiter`
    if(!options.record_delimiter){
      options.record_delimiter = []
    }else if(!Array.isArray(options.record_delimiter)){
      options.record_delimiter = [options.record_delimiter]
    }
    options.record_delimiter = options.record_delimiter.map( function(rd){
      if(typeof rd === 'string'){
        rd = Buffer.from(rd)
      }
      return rd
    })
    // Normalize option `relax`
    if(typeof options.relax === 'boolean'){
      // Great, nothing to do
    }else if(options.relax === undefined || options.relax === null){
      options.relax = false
    }else{
      throw new Error(`Invalid Option: relax must be a boolean, got ${JSON.stringify(options.relax)}`)
    }
    // Normalize option `relax_column_count`
    if(typeof options.relax_column_count === 'boolean'){
      // Great, nothing to do
    }else if(options.relax_column_count === undefined || options.relax_column_count === null){
      options.relax_column_count = false
    }else{
      throw new Error(`Invalid Option: relax_column_count must be a boolean, got ${JSON.stringify(options.relax_column_count)}`)
    }
    if(typeof options.relax_column_count_less === 'boolean'){
      // Great, nothing to do
    }else if(options.relax_column_count_less === undefined || options.relax_column_count_less === null){
      options.relax_column_count_less = false
    }else{
      throw new Error(`Invalid Option: relax_column_count_less must be a boolean, got ${JSON.stringify(options.relax_column_count_less)}`)
    }
    if(typeof options.relax_column_count_more === 'boolean'){
      // Great, nothing to do
    }else if(options.relax_column_count_more === undefined || options.relax_column_count_more === null){
      options.relax_column_count_more = false
    }else{
      throw new Error(`Invalid Option: relax_column_count_more must be a boolean, got ${JSON.stringify(options.relax_column_count_more)}`)
    }
    // Normalize option `skip_empty_lines`
    if(typeof options.skip_empty_lines === 'boolean'){
      // Great, nothing to do
    }else if(options.skip_empty_lines === undefined || options.skip_empty_lines === null){
      options.skip_empty_lines = false
    }else{
      throw new Error(`Invalid Option: skip_empty_lines must be a boolean, got ${JSON.stringify(options.skip_empty_lines)}`)
    }
    // Normalize option `skip_lines_with_empty_values`
    if(typeof options.skip_lines_with_empty_values === 'boolean'){
      // Great, nothing to do
    }else if(options.skip_lines_with_empty_values === undefined || options.skip_lines_with_empty_values === null){
      options.skip_lines_with_empty_values = false
    }else{
      throw new Error(`Invalid Option: skip_lines_with_empty_values must be a boolean, got ${JSON.stringify(options.skip_lines_with_empty_values)}`)
    }
    // Normalize option `skip_lines_with_error`
    if(typeof options.skip_lines_with_error === 'boolean'){
      // Great, nothing to do
    }else if(options.skip_lines_with_error === undefined || options.skip_lines_with_error === null){
      options.skip_lines_with_error = false
    }else{
      throw new Error(`Invalid Option: skip_lines_with_error must be a boolean, got ${JSON.stringify(options.skip_lines_with_error)}`)
    }
    // Normalize option `rtrim`
    if(options.rtrim === undefined || options.rtrim === null || options.rtrim === false){
      options.rtrim = false
    }else if(options.rtrim !== true){
      throw new Error(`Invalid Option: rtrim must be a boolean, got ${JSON.stringify(options.rtrim)}`)
    }
    // Normalize option `ltrim`
    if(options.ltrim === undefined || options.ltrim === null || options.ltrim === false){
      options.ltrim = false
    }else if(options.ltrim !== true){
      throw new Error(`Invalid Option: ltrim must be a boolean, got ${JSON.stringify(options.ltrim)}`)
    }
    // Normalize option `trim`
    if(options.trim === undefined || options.trim === null || options.trim === false){
      options.trim = false
    }else if(options.trim !== true){
      throw new Error(`Invalid Option: trim must be a boolean, got ${JSON.stringify(options.trim)}`)
    }
    // Normalize options `trim`, `ltrim` and `rtrim`
    if(options.trim === true && opts.ltrim !== false){
      options.ltrim = true
    }else if(options.ltrim !== true){
      options.ltrim = false
    }
    if(options.trim === true && opts.rtrim !== false){
      options.rtrim = true
    }else if(options.rtrim !== true){
      options.rtrim = false
    }
    // Normalize option `to`
    if(options.to === undefined || options.to === null){
      options.to = -1
    }else{
      if(typeof options.to === 'string' && /\d+/.test(options.to)){
        options.to = parseInt(options.to)
      }
      if(Number.isInteger(options.to)){
        if(options.to <= 0){
          throw new Error(`Invalid Option: to must be a positive integer greater than 0, got ${JSON.stringify(opts.to)}`)
        }
      }else{
        throw new Error(`Invalid Option: to must be an integer, got ${JSON.stringify(opts.to)}`)
      }
    }
    // Normalize option `to_line`
    if(options.to_line === undefined || options.to_line === null){
      options.to_line = -1
    }else{
      if(typeof options.to_line === 'string' && /\d+/.test(options.to_line)){
        options.to_line = parseInt(options.to_line)
      }
      if(Number.isInteger(options.to_line)){
        if(options.to_line <= 0){
          throw new Error(`Invalid Option: to_line must be a positive integer greater than 0, got ${JSON.stringify(opts.to_line)}`)
        }
      }else{
        throw new Error(`Invalid Option: to_line must be an integer, got ${JSON.stringify(opts.to_line)}`)
      }
    }
    this.info = {
      comment_lines: 0,
      empty_lines: 0,
      invalid_field_length: 0,
      lines: 1,
      records: 0
    }
    this.options = options
    this.state = {
      bomSkipped: false,
      castField: fnCastField,
      commenting: false,
      enabled: options.from_line === 1,
      escaping: false,
      escapeIsQuote: options.escape === options.quote,
      expectedRecordLength: options.columns === null ? 0 : options.columns.length,
      field: new ResizeableBuffer(20),
      firstLineToHeaders: fnFirstLineToHeaders,
      info: Object.assign({}, this.info),
      previousBuf: undefined,
      quoting: false,
      stop: false,
      rawBuffer: new ResizeableBuffer(100),
      record: [],
      recordHasError: false,
      record_length: 0,
      recordDelimiterMaxLength: options.record_delimiter.length === 0 ? 2 : Math.max(...options.record_delimiter.map( (v) => v.length)),
      trimChars: [Buffer.from(' ')[0], Buffer.from('\t')[0]],
      wasQuoting: false,
      wasRowDelimiter: false
    }
  }
  // Implementation of `Transform._transform`
  _transform(buf, encoding, callback){
    if(this.state.stop === true){
      return
    }
    const err = this.__parse(buf, false)
    if(err !== undefined){
      this.state.stop = true
    }
    callback(err)
  }
  // Implementation of `Transform._flush`
  _flush(callback){
    if(this.state.stop === true){
      return
    }
    const err = this.__parse(undefined, true)
    callback(err)
  }
  // Central parser implementation
  __parse(nextBuf, end){
    const {bom, comment, escape, from_line, info, ltrim, max_record_size, quote, raw, relax, rtrim, skip_empty_lines, to, to_line} = this.options
    let {record_delimiter} = this.options
    const {bomSkipped, previousBuf, rawBuffer, escapeIsQuote} = this.state
    let buf
    if(previousBuf === undefined){
      if(nextBuf === undefined){
        // Handle empty string
        this.push(null)
        return
      }else{
        buf = nextBuf
      }
    }else if(previousBuf !== undefined && nextBuf === undefined){
      buf = previousBuf
    }else{
      buf = Buffer.concat([previousBuf, nextBuf])
    }
    // Handle UTF BOM
    if(bomSkipped === false){
      if(bom === false){
        this.state.bomSkipped = true
      }else if(buf.length < 3){
        // No enough data
        if(end === false){
          // Wait for more data
          this.state.previousBuf = buf
          return
        }
        // skip BOM detect because data length < 3
      }else{
        if(bom_utf8.compare(buf, 0, 3) === 0){
          // Skip BOM
          buf = buf.slice(3)
        }
        this.state.bomSkipped = true
      }
    }
    const bufLen = buf.length
    let pos
    for(pos = 0; pos < bufLen; pos++){
      // Ensure we get enough space to look ahead
      // There should be a way to move this out of the loop
      if(this.__needMoreData(pos, bufLen, end)){
        break
      }
      if(this.state.wasRowDelimiter === true){
        this.info.lines++
        if(info === true && this.state.record.length === 0 && this.state.field.length === 0 && this.state.wasQuoting === false){
          this.state.info = Object.assign({}, this.info)
        }
        this.state.wasRowDelimiter = false
      }
      if(to_line !== -1 && this.info.lines > to_line){
        this.state.stop = true
        this.push(null)
        return
      }
      // Auto discovery of record_delimiter, unix, mac and windows supported
      if(this.state.quoting === false && record_delimiter.length === 0){
        const record_delimiterCount = this.__autoDiscoverRowDelimiter(buf, pos)
        if(record_delimiterCount){
          record_delimiter = this.options.record_delimiter
        }
      }
      const chr = buf[pos]
      if(raw === true){
        rawBuffer.append(chr)
      }
      if((chr === cr || chr === nl) && this.state.wasRowDelimiter === false ){
        this.state.wasRowDelimiter = true
      }
      // Previous char was a valid escape char
      // treat the current char as a regular char
      if(this.state.escaping === true){
        this.state.escaping = false
      }else{
        // Escape is only active inside quoted fields
        // We are quoting, the char is an escape chr and there is a chr to escape
        if(escape !== null && this.state.quoting === true && chr === escape && pos + 1 < bufLen){
          if(escapeIsQuote){
            if(buf[pos+1] === quote){
              this.state.escaping = true
              continue
            }
          }else{
            this.state.escaping = true
            continue
          }
        }
        // Not currently escaping and chr is a quote
        // TODO: need to compare bytes instead of single char
        if(this.state.commenting === false && chr === quote){
          if(this.state.quoting === true){
            const nextChr = buf[pos+1]
            const isNextChrTrimable = rtrim && this.__isCharTrimable(nextChr)
            // const isNextChrComment = nextChr === comment
            const isNextChrComment = comment !== null && this.__compareBytes(comment, buf, pos+1, nextChr)
            const isNextChrDelimiter = this.__isDelimiter(nextChr, buf, pos+1)
            const isNextChrRowDelimiter = record_delimiter.length === 0 ? this.__autoDiscoverRowDelimiter(buf, pos+1) : this.__isRecordDelimiter(nextChr, buf, pos+1)
            // Escape a quote
            // Treat next char as a regular character
            // TODO: need to compare bytes instead of single char
            if(escape !== null && chr === escape && nextChr === quote){
              pos++
            }else if(!nextChr || isNextChrDelimiter || isNextChrRowDelimiter || isNextChrComment || isNextChrTrimable){
              this.state.quoting = false
              this.state.wasQuoting = true
              continue
            }else if(relax === false){
              const err = this.__error(
                new CsvError('CSV_INVALID_CLOSING_QUOTE', [
                  'Invalid Closing Quote:',
                  `got "${String.fromCharCode(nextChr)}"`,
                  `at line ${this.info.lines}`,
                  'instead of delimiter, row delimiter, trimable character',
                  '(if activated) or comment',
                ], this.__context())
              )
              if(err !== undefined) return err
            }else{
              this.state.quoting = false
              this.state.wasQuoting = true
              // continue
              this.state.field.prepend(quote)
            }
          }else{
            if(this.state.field.length !== 0){
              // In relax mode, treat opening quote preceded by chrs as regular
              if( relax === false ){
                const err = this.__error(
                  new CsvError('INVALID_OPENING_QUOTE', [
                    'Invalid Opening Quote:',
                    `a quote is found inside a field at line ${this.info.lines}`,
                  ], this.__context(), {
                    field: this.state.field,
                  })
                )
                if(err !== undefined) return err
              }
            }else{
              this.state.quoting = true
              continue
            }
          }
        }
        if(this.state.quoting === false){
          let recordDelimiterLength = this.__isRecordDelimiter(chr, buf, pos)
          if(recordDelimiterLength !== 0){
            // Do not emit comments which take a full line
            const skipCommentLine = this.state.commenting && (this.state.wasQuoting === false && this.state.record.length === 0 && this.state.field.length === 0)
            if(skipCommentLine){
              this.info.comment_lines++
              // Skip full comment line
            }else{
              // Skip if line is empty and skip_empty_lines activated
              if(skip_empty_lines === true && this.state.wasQuoting === false && this.state.record.length === 0 && this.state.field.length === 0){
                this.info.empty_lines++
                pos += recordDelimiterLength - 1
                continue
              }
              // Activate records emition if above from_line
              if(this.state.enabled === false && this.info.lines + (this.state.wasRowDelimiter === true ? 1: 0 ) >= from_line){
                this.state.enabled = true
                this.__resetField()
                this.__resetRow()
                pos += recordDelimiterLength - 1
                continue
              }else{
                const errField = this.__onField()
                if(errField !== undefined) return errField
                const errRecord = this.__onRow()
                if(errRecord !== undefined) return errRecord
              }
              if(to !== -1 && this.info.records >= to){
                this.state.stop = true
                this.push(null)
                return
              }
            }
            this.state.commenting = false
            pos += recordDelimiterLength - 1
            continue
          }
          if(this.state.commenting){
            continue
          }
          const commentCount = comment === null ? 0 : this.__compareBytes(comment, buf, pos, chr)
          if(commentCount !== 0){
            this.state.commenting = true
            continue
          }
          let delimiterLength = this.__isDelimiter(chr, buf, pos)
          if(delimiterLength !== 0){
            const errField = this.__onField()
            if(errField !== undefined) return errField
            pos += delimiterLength - 1
            continue
          }
        }
      }
      if(this.state.commenting === false){
        if(max_record_size !== 0 && this.state.record_length + this.state.field.length > max_record_size){
          const err = this.__error(
            new CsvError('CSV_MAX_RECORD_SIZE', [
              'Max Record Size:',
              'record exceed the maximum number of tolerated bytes',
              `of ${max_record_size}`,
              `at line ${this.info.lines}`,
            ], this.__context())
          )
          if(err !== undefined) return err
        }
      }

      const lappend = ltrim === false || this.state.quoting === true || this.state.field.length !== 0 || !this.__isCharTrimable(chr)
      // rtrim in non quoting is handle in __onField
      const rappend = rtrim === false || this.state.wasQuoting === false
      if( lappend === true && rappend === true ){
        this.state.field.append(chr)
      }else if(rtrim === true && !this.__isCharTrimable(chr)){
        const err = this.__error(
          new CsvError('CSV_NON_TRIMABLE_CHAR_AFTER_CLOSING_QUOTE', [
            'Invalid Closing Quote:',
            'found non trimable byte after quote',
            `at line ${this.info.lines}`,
          ], this.__context())
        )
        if(err !== undefined) return err
      }
    }
    if(end === true){
      // Ensure we are not ending in a quoting state
      if(this.state.quoting === true){
        const err = this.__error(
          new CsvError('CSV_QUOTE_NOT_CLOSED', [
            'Quote Not Closed:',
            `the parsing is finished with an opening quote at line ${this.info.lines}`,
          ], this.__context())
        )
        if(err !== undefined) return err
      }else{
        // Skip last line if it has no characters
        if(this.state.wasQuoting === true || this.state.record.length !== 0 || this.state.field.length !== 0){
          const errField = this.__onField()
          if(errField !== undefined) return errField
          const errRecord = this.__onRow()
          if(errRecord !== undefined) return errRecord
        }else if(this.state.wasRowDelimiter === true){
          this.info.empty_lines++
        }else if(this.state.commenting === true){
          this.info.comment_lines++
        }
      }
    }else{
      this.state.previousBuf = buf.slice(pos)
    }
    if(this.state.wasRowDelimiter === true){
      this.info.lines++
      this.state.wasRowDelimiter = false
    }
  }
  // Helper to test if a character is a space or a line delimiter
  __isCharTrimable(chr){
    return chr === space || chr === tab || chr === cr || chr === nl || chr === np
  }
  __onRow(){
    const {columns, columns_duplicates_to_array, info, from, relax_column_count, relax_column_count_less, relax_column_count_more, raw, skip_lines_with_empty_values} = this.options
    const {enabled, record} = this.state
    if(enabled === false){
      return this.__resetRow()
    }
    // Convert the first line into column names
    const recordLength = record.length
    if(columns === true){
      if(isRecordEmpty(record)){
        this.__resetRow()
        return
      }
      return this.__firstLineToColumns(record)
    }
    if(columns === false && this.info.records === 0){
      this.state.expectedRecordLength = recordLength
    }
    if(recordLength !== this.state.expectedRecordLength){
      if(relax_column_count === true || 
        (relax_column_count_less === true && recordLength < this.state.expectedRecordLength) ||
        (relax_column_count_more === true && recordLength > this.state.expectedRecordLength) ){
        this.info.invalid_field_length++
      }else{
        if(columns === false){
          const err = this.__error(
            new CsvError('CSV_INCONSISTENT_RECORD_LENGTH', [
              'Invalid Record Length:',
              `expect ${this.state.expectedRecordLength},`,
              `got ${recordLength} on line ${this.info.lines}`,
            ], this.__context(), {
              record: record,
            })
          )
          if(err !== undefined) return err
        }else{
          const err = this.__error(
            // CSV_INVALID_RECORD_LENGTH_DONT_MATCH_COLUMNS
            new CsvError('CSV_RECORD_DONT_MATCH_COLUMNS_LENGTH', [
              'Invalid Record Length:',
              `columns length is ${columns.length},`, // rename columns
              `got ${recordLength} on line ${this.info.lines}`,
            ], this.__context(), {
              record: record,
            })
          )
          if(err !== undefined) return err
        }
      }
    }
    if(skip_lines_with_empty_values === true){
      if(isRecordEmpty(record)){
        this.__resetRow()
        return
      }
    }
    if(this.state.recordHasError === true){
      this.__resetRow()
      this.state.recordHasError = false
      return
    }
    this.info.records++
    if(from === 1 || this.info.records >= from){
      if(columns !== false){
        const obj = {}
        // Transform record array to an object
        for(let i = 0, l = record.length; i < l; i++){
          if(columns[i] === undefined || columns[i].disabled) continue
          // obj[columns[i].name] = record[i]
          // Turn duplicate columns into an array
          if (columns_duplicates_to_array === true && obj[columns[i].name]) {
            if (Array.isArray(obj[columns[i].name])) {
              obj[columns[i].name] = obj[columns[i].name].concat(record[i])
            } else {
              obj[columns[i].name] = [obj[columns[i].name], record[i]]
            }
          } else {
            obj[columns[i].name] = record[i]
          }
        }
        const {objname} = this.options
        if(objname === undefined){
          if(raw === true || info === true){
            const err = this.__push(Object.assign(
              {record: obj},
              (raw === true ? {raw: this.state.rawBuffer.toString()}: {}),
              (info === true ? {info: this.state.info}: {})
            ))
            if(err){
              return err
            }
          }else{
            const err = this.__push(obj)
            if(err){
              return err
            }
          }
        }else{
          if(raw === true || info === true){
            const err = this.__push(Object.assign(
              {record: [obj[objname], obj]},
              raw === true ? {raw: this.state.rawBuffer.toString()}: {},
              info === true ? {info: this.state.info}: {}
            ))
            if(err){
              return err
            }
          }else{
            const err = this.__push([obj[objname], obj])
            if(err){
              return err
            }
          }
        }
      }else{
        if(raw === true || info === true){
          const err = this.__push(Object.assign(
            {record: record},
            raw === true ? {raw: this.state.rawBuffer.toString()}: {},
            info === true ? {info: this.state.info}: {}
          ))
          if(err){
            return err
          }
        }else{
          const err = this.__push(record)
          if(err){
            return err
          }
        }
      }
    }
    this.__resetRow()
  }
  __firstLineToColumns(record){
    const {firstLineToHeaders} = this.state
    try{
      const headers = firstLineToHeaders === undefined ? record : firstLineToHeaders.call(null, record)
      if(!Array.isArray(headers)){
        return this.__error(
          new CsvError('CSV_INVALID_COLUMN_MAPPING', [
            'Invalid Column Mapping:',
            'expect an array from column function,',
            `got ${JSON.stringify(headers)}`
          ], this.__context(), {
            headers: headers,
          })
        )
      }
      const normalizedHeaders = normalizeColumnsArray(headers)
      this.state.expectedRecordLength = normalizedHeaders.length
      this.options.columns = normalizedHeaders
      this.__resetRow()
      return
    }catch(err){
      return err
    }
  }
  __resetRow(){
    if(this.options.raw === true){
      this.state.rawBuffer.reset()
    }
    this.state.record = []
    this.state.record_length = 0
  }
  __onField(){
    const {cast, rtrim, max_record_size} = this.options
    const {enabled, wasQuoting} = this.state
    // Short circuit for the from_line options
    if(enabled === false){ /* this.options.columns !== true && */
      return this.__resetField()
    }
    let field = this.state.field.toString()
    if(rtrim === true && wasQuoting === false){
      field = field.trimRight()
    }
    if(cast === true){
      const [err, f] = this.__cast(field)
      if(err !== undefined) return err
      field = f
    }
    this.state.record.push(field)
    // Increment record length if record size must not exceed a limit
    if(max_record_size !== 0 && typeof field === 'string'){
      this.state.record_length += field.length
    }
    this.__resetField()
  }
  __resetField(){
    this.state.field.reset()
    this.state.wasQuoting = false
  }
  __push(record){
    const {on_record} = this.options
    if(on_record !== undefined){
      const context = this.__context()
      try{
        record = on_record.call(null, record, context)
      }catch(err){
        return err
      }
      if(record === undefined || record === null){ return }
    }
    this.push(record)
  }
  // Return a tuple with the error and the casted value
  __cast(field){
    const {columns, relax_column_count} = this.options
    const isColumns = Array.isArray(columns)
    // Dont loose time calling cast
    // because the final record is an object
    // and this field can't be associated to a key present in columns
    if( isColumns === true && relax_column_count && this.options.columns.length <= this.state.record.length ){
      return [undefined, undefined]
    }
    const context = this.__context()
    if(this.state.castField !== null){
      try{
        return [undefined, this.state.castField.call(null, field, context)]
      }catch(err){
        return [err]
      }
    }
    if(this.__isFloat(field)){
      return [undefined, parseFloat(field)]
    }else if(this.options.cast_date !== false){
      return [undefined, this.options.cast_date.call(null, field, context)]
    }
    return [undefined, field]
  }
  // Keep it in case we implement the `cast_int` option
  // __isInt(value){
  //   // return Number.isInteger(parseInt(value))
  //   // return !isNaN( parseInt( obj ) );
  //   return /^(\-|\+)?[1-9][0-9]*$/.test(value)
  // }
  __isFloat(value){
    return (value - parseFloat( value ) + 1) >= 0 // Borrowed from jquery
  }
  __compareBytes(sourceBuf, targetBuf, pos, firtByte){
    if(sourceBuf[0] !== firtByte) return 0
    const sourceLength = sourceBuf.length
    for(let i = 1; i < sourceLength; i++){
      if(sourceBuf[i] !== targetBuf[pos+i]) return 0
    }
    return sourceLength
  }
  __needMoreData(i, bufLen, end){
    if(end){
      return false
    }
    const {comment, delimiter} = this.options
    const {quoting, recordDelimiterMaxLength} = this.state
    const numOfCharLeft = bufLen - i - 1
    const requiredLength = Math.max(
      // Skip if the remaining buffer smaller than comment
      comment ? comment.length : 0,
      // Skip if the remaining buffer smaller than row delimiter
      recordDelimiterMaxLength,
      // Skip if the remaining buffer can be row delimiter following the closing quote
      // 1 is for quote.length
      quoting ? (1 + recordDelimiterMaxLength) : 0,
      // Skip if the remaining buffer can be delimiter
      delimiter.length,
      // Skip if the remaining buffer can be escape sequence
      // 1 is for escape.length
      1
    )
    return numOfCharLeft < requiredLength
  }
  __isDelimiter(chr, buf, pos){
    const {delimiter} = this.options
    loop1: for(let i = 0; i < delimiter.length; i++){
      const del = delimiter[i]
      if(del[0] === chr){
        for(let j = 1; j < del.length; j++){
          if(del[j] !== buf[pos+j]) continue loop1
        }
        return del.length
      }
    }
    return 0
  }
  __isRecordDelimiter(chr, buf, pos){
    const {record_delimiter} = this.options
    const recordDelimiterLength = record_delimiter.length
    loop1: for(let i = 0; i < recordDelimiterLength; i++){
      const rd = record_delimiter[i]
      const rdLength = rd.length
      if(rd[0] !== chr){
        continue
      }
      for(let j = 1; j < rdLength; j++){
        if(rd[j] !== buf[pos+j]){
          continue loop1
        }
      }
      return rd.length
    }
    return 0
  }
  __autoDiscoverRowDelimiter(buf, pos){
    const chr = buf[pos]
    if(chr === cr){
      if(buf[pos+1] === nl){
        this.options.record_delimiter.push(Buffer.from('\r\n'))
        this.state.recordDelimiterMaxLength = 2
        return 2
      }else{
        this.options.record_delimiter.push(Buffer.from('\r'))
        this.state.recordDelimiterMaxLength = 1
        return 1
      }
    }else if(chr === nl){
      this.options.record_delimiter.push(Buffer.from('\n'))
      this.state.recordDelimiterMaxLength = 1
      return 1
    }
    return 0
  }
  __error(msg){
    const {skip_lines_with_error} = this.options
    const err = typeof msg === 'string' ? new Error(msg) : msg
    if(skip_lines_with_error){
      this.state.recordHasError = true
      this.emit('skip', err)
      return undefined
    }else{
      return err
    }
  }
  __context(){
    const {columns} = this.options
    const isColumns = Array.isArray(columns)
    return {
      column: isColumns === true ?
        ( columns.length > this.state.record.length ?
          columns[this.state.record.length].name :
          null
        ) :
        this.state.record.length,
      empty_lines: this.info.empty_lines,
      header: columns === true,
      index: this.state.record.length,
      invalid_field_length: this.info.invalid_field_length,
      quoting: this.state.wasQuoting,
      lines: this.info.lines,
      records: this.info.records
    }
  }
}

const parse = function(){
  let data, options, callback
  for(let i in arguments){
    const argument = arguments[i]
    const type = typeof argument
    if(data === undefined && (typeof argument === 'string' || Buffer.isBuffer(argument))){
      data = argument
    }else if(options === undefined && isObject(argument)){
      options = argument
    }else if(callback === undefined && type === 'function'){
      callback = argument
    }else{
      throw new CsvError('CSV_INVALID_ARGUMENT', [
        'Invalid argument:',
        `got ${JSON.stringify(argument)} at index ${i}`
      ])
    }
  }
  const parser = new Parser(options)
  if(callback){
    const records = options === undefined || options.objname === undefined ? [] : {}
    parser.on('readable', function(){
      let record
      while((record = this.read()) !== null){
        if(options === undefined || options.objname === undefined){
          records.push(record)
        }else{
          records[record[0]] = record[1]
        }
      }
    })
    parser.on('error', function(err){
      callback(err, undefined, parser.info)
    })
    parser.on('end', function(){
      callback(undefined, records, parser.info)
    })
  }
  if(data !== undefined){
    // Give a chance for events to be registered later
    if(typeof setImmediate === 'function'){
      setImmediate(function(){
        parser.write(data)
        parser.end()
      })
    }else{
      parser.write(data)
      parser.end()
    }
  }
  return parser
}

class CsvError extends Error {
  constructor(code, message, ...contexts) {
    if(Array.isArray(message)) message = message.join(' ')
    super(message)
    if(Error.captureStackTrace !== undefined){
      Error.captureStackTrace(this, CsvError)
    }
    this.code = code
    for(const context of contexts){
      for(const key in context){
        const value = context[key]
        this[key] = Buffer.isBuffer(value) ? value.toString() : value == null ? value : JSON.parse(JSON.stringify(value))
      }
    }
  }
}

parse.Parser = Parser

parse.CsvError = CsvError

module.exports = parse

const underscore = function(str){
  return str.replace(/([A-Z])/g, function(_, match){
    return '_' + match.toLowerCase()
  })
}

const isObject = function(obj){
  return (typeof obj === 'object' && obj !== null && !Array.isArray(obj))
}

const isRecordEmpty = function(record){
  return record.every( (field) => field == null || field.toString && field.toString().trim() === '' )
}

const normalizeColumnsArray = function(columns){
  const normalizedColumns = [];
  for(let i = 0, l = columns.length; i < l; i++){
    const column = columns[i]
    if(column === undefined || column === null || column === false){
      normalizedColumns[i] = { disabled: true }
    }else if(typeof column === 'string'){
      normalizedColumns[i] = { name: column }
    }else if(isObject(column)){
      if(typeof column.name !== 'string'){
        throw new CsvError('CSV_OPTION_COLUMNS_MISSING_NAME', [
          'Option columns missing name:',
          `property "name" is required at position ${i}`,
          'when column is an object literal'
        ])
      }
      normalizedColumns[i] = column
    }else{
      throw new CsvError('CSV_INVALID_COLUMN_DEFINITION', [
        'Invalid column definition:',
        'expect a string or a literal object,',
        `got ${JSON.stringify(column)} at position ${i}`
      ])
    }
  }
  return normalizedColumns;
}


/***/ }),

/***/ "./node_modules/csv-parse/lib/sync.js":
/*!********************************************!*\
  !*** ./node_modules/csv-parse/lib/sync.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const parse = __webpack_require__(/*! . */ "./node_modules/csv-parse/lib/index.js")

module.exports = function(data, options={}){
  if(typeof data === 'string'){
    data = Buffer.from(data)
  }
  const records = options && options.objname ? {} : []
  const parser = new parse.Parser(options)
  parser.push = function(record){
    if(record === null){
      return
    }
    if(options.objname === undefined)
      records.push(record)
    else{
      records[record[0]] = record[1]
    }
  }
  const err1 = parser.__parse(data, false)
  if(err1 !== undefined) throw err1
  const err2 = parser.__parse(undefined, true)
  if(err2 !== undefined) throw err2
  return records
}


/***/ }),

/***/ "./package.json":
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
/*! exports provided: name, version, description, main, scripts, repository, author, license, bugs, homepage, dependencies, devDependencies, default */
/***/ (function(module) {

module.exports = JSON.parse("{\"name\":\"webthings-gateway\",\"version\":\"0.12.0\",\"description\":\"Web of Things gateway\",\"main\":\"src/app.js\",\"scripts\":{\"test\":\"webpack && npm run lint && npm run mocha\",\"lint\":\"eslint . && stylelint static/**/*.css\",\"screenshots\":\"./src/test/take-prev-screenshots.sh\",\"mocha\":\"./src/test/run-tests.sh\",\"jest\":\"./src/test/run-tests.sh\",\"npm-check\":\"./src/test/npm-test.sh\",\"dependencies-check\":\"./src/test/dependencies-test.sh\",\"cov\":\"NODE_TLS_REJECT_UNAUTHORIZED=0 jest --coverage\",\"start\":\"webpack --display errors-only && node build/gateway.js\",\"watch\":\"npm-run-all --parallel start watch:build\",\"watch:build\":\"webpack --watch\",\"debug-ide\":\"webpack && node --inspect=5858 build/gateway.js\",\"debug\":\"webpack && node --inspect build/gateway.js\",\"run-only\":\"node build/gateway.js\"},\"repository\":{\"type\":\"git\",\"url\":\"git+https://github.com/mozilla-iot/gateway.git\"},\"author\":\"Mozilla IoT\",\"license\":\"MPL-2.0\",\"bugs\":{\"url\":\"https://github.com/mozilla-iot/gateway/issues\"},\"homepage\":\"https://iot.mozilla.org\",\"dependencies\":{\"@fluent/bundle\":\"^0.16.0\",\"@fluent/dom\":\"^0.7.0\",\"acme-client\":\"^4.0.0\",\"ajv\":\"^6.12.2\",\"archiver\":\"^4.0.1\",\"asn1.js\":\"^5.4.1\",\"bcryptjs\":\"^2.4.3\",\"bluebird\":\"^3.7.2\",\"body-parser\":\"^1.19.0\",\"callsites\":\"^3.1.0\",\"compression\":\"^1.7.4\",\"config\":\"^3.3.1\",\"country-list\":\"^2.2.0\",\"csv-parse\":\"^4.10.1\",\"express\":\"^4.17.1\",\"express-fileupload\":\"^1.1.9\",\"express-handlebars\":\"^4.0.4\",\"express-promise-router\":\"^4.0.1\",\"express-rate-limit\":\"^5.1.3\",\"express-ws\":\"^4.0.0\",\"find\":\"^0.3.0\",\"gateway-addon\":\"github:mozilla-iot/gateway-addon-node\",\"glob-to-regexp\":\"^0.4.1\",\"http-proxy\":\"^1.18.1\",\"ip-regex\":\"^4.1.0\",\"jsonwebtoken\":\"^8.5.1\",\"mkdirp\":\"^1.0.4\",\"ncp\":\"^2.0.0\",\"nocache\":\"^2.1.0\",\"node-fetch\":\"^2.6.1\",\"node-getopt\":\"^0.3.2\",\"promisepipe\":\"^3.0.0\",\"rimraf\":\"^3.0.2\",\"segfault-handler\":\"^1.3.0\",\"source-map-support\":\"^0.5.19\",\"speakeasy\":\"^2.0.0\",\"sqlite3\":\"^4.2.0\",\"string-format\":\"^2.0.0\",\"tar\":\"^6.0.2\",\"tmp\":\"^0.2.1\",\"uuid\":\"^8.2.0\",\"web-push\":\"^3.4.4\",\"winston\":\"^3.3.3\",\"winston-daily-rotate-file\":\"^4.5.0\",\"ws\":\"^7.3.0\"},\"devDependencies\":{\"@babel/core\":\"^7.10.4\",\"@babel/plugin-proposal-object-rest-spread\":\"^7.10.4\",\"@babel/polyfill\":\"^7.10.4\",\"@babel/preset-env\":\"^7.10.4\",\"@types/asn1js\":\"^0.0.2\",\"@types/express\":\"^4.17.6\",\"@types/node\":\"^14.0.14\",\"@webcomponents/webcomponentsjs\":\"^2.4.3\",\"awesome-typescript-loader\":\"^5.2.1\",\"babel-eslint\":\"^10.1.0\",\"babel-loader\":\"^8.1.0\",\"chai\":\"^4.2.0\",\"chai-http\":\"^4.3.0\",\"clean-webpack-plugin\":\"^3.0.0\",\"codecov\":\"^3.7.1\",\"copy-webpack-plugin\":\"^6.0.3\",\"core-js\":\"^3.6.5\",\"css-loader\":\"^3.6.0\",\"eslint\":\"^7.4.0\",\"eslint-plugin-html\":\"^6.0.2\",\"event-to-promise\":\"^0.8.0\",\"extract-text-webpack-plugin\":\"^4.0.0-beta.0\",\"file-loader\":\"^6.0.0\",\"highlight.js\":\"^10.1.1\",\"html-loader\":\"^0.5.5\",\"html-webpack-plugin\":\"^3.2.0\",\"imagemin-gifsicle\":\"^7.0.0\",\"imagemin-jpegtran\":\"^7.0.0\",\"imagemin-optipng\":\"^8.0.0\",\"imagemin-svgo\":\"^8.0.0\",\"imagemin-webpack\":\"^5.1.1\",\"intl-pluralrules\":\"^1.2.0\",\"jest\":\"^26.1.0\",\"jsdom\":\"^16.2.2\",\"jsonfile\":\"^6.0.1\",\"jszip\":\"^3.5.0\",\"mini-css-extract-plugin\":\"^0.9.0\",\"mobile-drag-drop\":\"^2.3.0-rc.2\",\"nock\":\"^13.0.2\",\"npm-run-all\":\"^4.1.5\",\"page\":\"^1.11.6\",\"pixelmatch\":\"^5.2.1\",\"pngjs\":\"^5.0.0\",\"qrcode-svg\":\"^1.1.0\",\"raw-loader\":\"^4.0.1\",\"selenium-standalone\":\"^6.20.0\",\"shaka-player\":\"^3.0.1\",\"simple-oauth2\":\"^3.4.0\",\"sinon\":\"^9.0.2\",\"style-loader\":\"^1.2.1\",\"stylelint\":\"^13.6.1\",\"stylelint-config-standard\":\"^20.0.0\",\"ts-jest\":\"^26.1.1\",\"typescript\":\"^3.9.6\",\"url-loader\":\"^4.1.0\",\"webdriverio\":\"^5.23.0\",\"webpack\":\"^4.43.0\",\"webpack-cli\":\"^3.3.12\"}}");

/***/ }),

/***/ "./src sync recursive":
/*!******************!*\
  !*** ./src sync ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = "./src sync recursive";

/***/ }),

/***/ "./src/addon-manager.js":
/*!******************************!*\
  !*** ./src/addon-manager.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Manages all of the add-ons used in the system.
 *
 * @module AddonManager
 */
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const AddonUtils = __webpack_require__(/*! ./addon-utils */ "./src/addon-utils.js");
const config = __webpack_require__(/*! config */ "config");
const Constants = __webpack_require__(/*! ./constants */ "./src/constants.js");
const Deferred = __webpack_require__(/*! ./deferred */ "./src/deferred.js");
const EventEmitter = __webpack_require__(/*! events */ "events").EventEmitter;
const Platform = __webpack_require__(/*! ./platform */ "./src/platform.js");
const Settings = __webpack_require__(/*! ./models/settings */ "./src/models/settings.js");
const UserProfile = __webpack_require__(/*! ./user-profile */ "./src/user-profile.js");
const Utils = __webpack_require__(/*! ./utils */ "./src/utils.js");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const rimraf = __webpack_require__(/*! rimraf */ "rimraf");
const semver = __webpack_require__(/*! semver */ "semver");
const tar = __webpack_require__(/*! tar */ "tar");
const os = __webpack_require__(/*! os */ "os");
const promisePipe = __webpack_require__(/*! promisepipe */ "promisepipe");
const fetch = __webpack_require__(/*! node-fetch */ "node-fetch");
const find = __webpack_require__(/*! find */ "find");
const {URLSearchParams} = __webpack_require__(/*! url */ "url");
const {ncp} = __webpack_require__(/*! ncp */ "ncp");

const pkg = __webpack_require__(/*! ../package.json */ "./package.json");

let PluginServer;

/**
 * @class AddonManager
 * @classdesc The AddonManager will load any add-ons from the 'addons'
 * directory. See loadAddons() for details.
 */
class AddonManager extends EventEmitter {

  constructor() {
    super();
    this.adapters = new Map();
    this.notifiers = new Map();
    this.apiHandlers = new Map();
    this.devices = {};
    this.outlets = {};
    this.extensions = {};
    this.deferredAdd = null;
    this.deferredRemovals = new Map();
    this.removalTimeouts = new Map();
    this.addonsLoaded = false;
    this.installedAddons = new Map();
    this.deferredWaitForAdapter = new Map();
    this.pluginServer = null;
    this.updateTimeout = null;
    this.updateInterval = null;
  }

  /**
   * Adds an adapter to the collection of adapters managed by AddonManager.
   * This function is typically called when loading add-ons.
   */
  addAdapter(adapter) {
    if (!adapter.name) {
      adapter.name = adapter.constructor.name;
    }
    this.adapters.set(adapter.id, adapter);

    /**
     * Adapter added event.
     *
     * This is event is emitted whenever a new adapter is loaded.
     *
     * @event adapterAdded
     * @type  {Adapter}
     */
    this.emit(Constants.ADAPTER_ADDED, adapter);

    const deferredWait = this.deferredWaitForAdapter.get(adapter.id);
    if (deferredWait) {
      this.deferredWaitForAdapter.delete(adapter.id);
      deferredWait.resolve(adapter);
    }
  }

  addNotifier(notifier) {
    if (!notifier.name) {
      notifier.name = notifier.constructor.name;
    }

    this.notifiers.set(notifier.id, notifier);

    /**
     * Notifier added event.
     *
     * This is event is emitted whenever a new notifier is loaded.
     *
     * @event notifierAdded
     * @type {Notifier}
     */
    this.emit(Constants.NOTIFIER_ADDED, notifier);
  }

  addAPIHandler(handler) {
    this.apiHandlers.set(handler.packageName, handler);

    /**
     * API Handler added event.
     *
     * This is event is emitted whenever a new API handler is loaded.
     *
     * @event apiHandlerAdded
     * @type {APIHandler}
     */
    this.emit(Constants.API_HANDLER_ADDED, handler);
  }

  /**
   * @method addNewThing
   *
   * Initiates pairing on all of the adapters that support it.
   *
   * @returns A promise when the pairing process is complete.
   */
  addNewThing(pairingTimeout) {
    const deferredAdd = new Deferred();

    if (this.deferredAdd) {
      deferredAdd.reject('Add already in progress');
    } else {
      this.deferredAdd = deferredAdd;
      this.adapters.forEach((adapter) => {
        console.log('About to call startPairing on', adapter.name);
        adapter.startPairing(pairingTimeout);
      });
      this.pairingTimeout = setTimeout(() => {
        console.log('Pairing timeout');
        this.emit(Constants.PAIRING_TIMEOUT);
        this.cancelAddNewThing();
      }, pairingTimeout * 1000);
    }

    return deferredAdd.promise;
  }

  /**
   * @method cancelAddNewThing
   *
   * Cancels a previous addNewThing request.
   */
  cancelAddNewThing() {
    const deferredAdd = this.deferredAdd;

    if (this.pairingTimeout) {
      clearTimeout(this.pairingTimeout);
      this.pairingTimeout = null;
    }

    if (deferredAdd) {
      this.adapters.forEach((adapter) => {
        adapter.cancelPairing();
      });
      this.deferredAdd = null;
      deferredAdd.resolve();
    }
  }

  /**
   * @method cancelRemoveThing
   *
   * Cancels a previous removeThing request.
   */
  cancelRemoveThing(thingId) {
    const timeout = this.removalTimeouts.get(thingId);
    if (timeout) {
      clearTimeout(timeout);
      this.removalTimeouts.delete(thingId);
    }

    const deferredRemove = this.deferredRemovals.get(thingId);
    if (deferredRemove) {
      const device = this.getDevice(thingId);
      if (device) {
        const adapter = device.adapter;
        if (adapter) {
          adapter.cancelRemoveThing(device);
        }
      }
      this.deferredRemovals.delete(thingId);
      deferredRemove.reject('removeThing cancelled');
    }
  }

  /**
   * @method getAdapter
   * @returns Returns the adapter with the indicated id.
   */
  getAdapter(adapterId) {
    return this.adapters.get(adapterId);
  }

  /**
   * @method getAdaptersByPackageId
   * @returns Returns a list of loaded adapters with the given package ID.
   */
  getAdaptersByPackageId(packageId) {
    return Array.from(this.adapters.values()).filter(
      (a) => a.getPackageName() === packageId);
  }

  /**
   * @method getAdapters
   * @returns Returns a Map of the loaded adapters. The dictionary
   *          key corresponds to the adapter id.
   */
  getAdapters() {
    return this.adapters;
  }

  /**
   * @method getNotifiers
   * @returns Returns a Map of the loaded notifiers. The dictionary
   *          key corresponds to the notifier id.
   */
  getNotifiers() {
    return this.notifiers;
  }

  /**
   * @method getNotifier
   * @returns Returns the notifier with the indicated id.
   */
  getNotifier(notifierId) {
    return this.notifiers.get(notifierId);
  }

  /**
   * @method getNotifiersByPackageId
   * @returns Returns a list of loaded notifiers with the given package ID.
   */
  getNotifiersByPackageId(packageId) {
    return Array.from(this.notifiers.values()).filter(
      (n) => n.getPackageName() === packageId);
  }

  /**
   * @method getAPIHandlers
   * @returns Returns a Map of the loaded API handlers. The dictionary
   *          key corresponds to the package ID.
   */
  getAPIHandlers() {
    return this.apiHandlers;
  }

  /**
   * @method getAPIHandler
   * @returns Returns the API handler with the given package ID.
   */
  getAPIHandler(packageId) {
    return this.apiHandlers.get(packageId);
  }

  /**
   * @method getExtensions
   * @returns Returns a Map of the loaded extensions. The dictionary
   *          key corresponds to the extension ID.
   */
  getExtensions() {
    return this.extensions;
  }

  /**
   * @method getExtensionsByPackageId
   * @returns Returns a Map of loaded extensions with the given package ID.
   */
  getExtensionsByPackageId(packageId) {
    if (this.extensions.hasOwnProperty(packageId)) {
      return this.extensions[packageId];
    }

    return {};
  }

  /**
   * @method getDevice
   * @returns Returns the device with the indicated id.
   */
  getDevice(id) {
    return this.devices[id];
  }

  /**
   * @method getDevices
   * @returns Returns an dictionary of all of the known devices.
   *          The dictionary key corresponds to the device id.
   */
  getDevices() {
    return this.devices;
  }

  /**
   * @method getOutlet
   * @returns Returns the outlet with the indicated id.
   */
  getOutlet(id) {
    return this.outlets[id];
  }

  /**
   * @method getOutlets
   * @returns Returns an dictionary of all of the known outlets.
   *          The dictionary key corresponds to the outlet id.
   */
  getOutlets() {
    return this.outlets;
  }

  /**
   * @method getPlugin
   *
   * Returns a previously registered plugin.
   */
  getPlugin(pluginId) {
    if (this.pluginServer) {
      return this.pluginServer.getPlugin(pluginId);
    }
  }

  /**
   * @method getThings
   * @returns Returns a dictionary of all of the known things.
   *          The dictionary key corresponds to the device id.
   */
  getThings() {
    const things = [];
    for (const thingId in this.devices) {
      things.push(this.getThing(thingId));
    }
    return things;
  }

  /**
   * @method getThing
   * @returns Returns the thing with the indicated id.
   */
  getThing(thingId) {
    const device = this.getDevice(thingId);
    if (device) {
      return device.asThing();
    }
  }

  /**
   * @method getPropertyDescriptions
   * @returns Retrieves all of the properties associated with the thing
   *          identified by `thingId`.
   */
  getPropertyDescriptions(thingId) {
    const device = this.getDevice(thingId);
    if (device) {
      return device.getPropertyDescriptions();
    }
  }

  /**
   * @method getPropertyDescription
   * @returns Retrieves the property named `propertyName` from the thing
   *          identified by `thingId`.
   */
  getPropertyDescription(thingId, propertyName) {
    const device = this.getDevice(thingId);
    if (device) {
      return device.getPropertyDescription(propertyName);
    }
  }

  /**
   * @method getProperty
   * @returns a promise which resolves to the retrieved value of `propertyName`
   *          from the thing identified by `thingId`.
   */
  getProperty(thingId, propertyName) {
    const device = this.getDevice(thingId);
    if (device) {
      return device.getProperty(propertyName);
    }

    return Promise.reject(`getProperty: device: ${thingId} not found.`);
  }

  /**
   * @method setProperty
   * @returns a promise which resolves to the updated value of `propertyName`
   *          for the thing identified by `thingId`.
   */
  setProperty(thingId, propertyName, value) {
    const device = this.getDevice(thingId);
    if (device) {
      return device.setProperty(propertyName, value);
    }

    return Promise.reject(`setProperty: device: ${thingId} not found.`);
  }

  /**
   * @method notify
   * @returns a promise which resolves when the outlet has been notified.
   */
  notify(outletId, title, message, level) {
    const outlet = this.getOutlet(outletId);
    if (outlet) {
      return outlet.notify(title, message, level);
    }

    return Promise.reject(`notify: outlet: ${outletId} not found.`);
  }

  /**
   * @method setPin
   * @returns a promise which resolves when the PIN has been set.
   */
  setPin(thingId, pin) {
    const device = this.getDevice(thingId);
    if (device) {
      return device.adapter.setPin(thingId, pin);
    }

    return Promise.reject(`setPin: device ${thingId} not found.`);
  }

  /**
   * @method setCredentials
   * @returns a promise which resolves when the credentials have been set.
   */
  setCredentials(thingId, username, password) {
    const device = this.getDevice(thingId);
    if (device) {
      return device.adapter.setCredentials(thingId, username, password);
    }

    return Promise.reject(`setCredentials: device ${thingId} not found.`);
  }

  /**
   * @method requestAction
   * @returns a promise which resolves when the action has been requested.
   */
  requestAction(thingId, actionId, actionName, input) {
    const device = this.getDevice(thingId);
    if (device) {
      return device.requestAction(actionId, actionName, input);
    }

    return Promise.reject(`requestAction: device: ${thingId} not found.`);
  }

  /**
   * @method removeAction
   * @returns a promise which resolves when the action has been removed.
   */
  removeAction(thingId, actionId, actionName) {
    const device = this.getDevice(thingId);
    if (device) {
      return device.removeAction(actionId, actionName);
    }

    return Promise.reject(`removeAction: device: ${thingId} not found.`);
  }

  /**
   * @method handleDeviceAdded
   *
   * Called when the indicated device has been added to an adapter.
   */
  handleDeviceAdded(device) {
    this.devices[device.id] = device;
    const thing = device.asThing();

    /**
     * Thing added event.
     *
     * This event is emitted whenever a new thing is added.
     *
     * @event thingAdded
     * @type  {Thing}
     */
    this.emit(Constants.THING_ADDED, thing);
  }

  /**
   * @method handleDeviceRemoved
   * Called when the indicated device has been removed by an adapter.
   */
  handleDeviceRemoved(device) {
    delete this.devices[device.id];
    const thing = device.asThing();

    /**
     * Thing removed event.
     *
     * This event is emitted whenever a thing is removed.
     *
     * @event thingRemoved
     * @type  {Thing}
     */
    this.emit(Constants.THING_REMOVED, thing);

    const timeout = this.removalTimeouts.get(device.id);
    if (timeout) {
      clearTimeout(timeout);
      this.removalTimeouts.delete(device.id);
    }

    const deferredRemove = this.deferredRemovals.get(device.id);
    if (deferredRemove && deferredRemove.adapter == device.adapter) {
      this.deferredRemovals.delete(device.id);
      deferredRemove.resolve(device.id);
    }
  }

  /**
   * @method handleOutletAdded
   *
   * Called when the indicated outlet has been added to a notifier.
   */
  handleOutletAdded(outlet) {
    this.outlets[outlet.id] = outlet;

    /**
     * Outlet added event.
     *
     * This event is emitted whenever a new outlet is added.
     *
     * @event outletAdded
     * @type {Outlet}
     */
    this.emit(Constants.OUTLET_ADDED, outlet.asDict());
  }

  /**
   * @method handleOutletRemoved
   * Called when the indicated outlet has been removed by a notifier.
   */
  handleOutletRemoved(outlet) {
    delete this.outlets[outlet.id];

    /**
     * Outlet removed event.
     *
     * This event is emitted whenever an outlet is removed.
     *
     * @event outletRemoved
     * @type {Outlet}
     */
    this.emit(Constants.OUTLET_REMOVED, outlet.asDict());
  }

  /**
   * @method addonEnabled
   *
   * Determine whether the add-on with the given package name is enabled.
   *
   * @param {string} packageId The package ID of the add-on
   * @returns {boolean} Boolean indicating enabled status.
   */
  async addonEnabled(packageId) {
    if (this.installedAddons.has(packageId)) {
      return this.installedAddons.get(packageId).enabled;
    }

    return false;
  }

  async enableAddon(packageId) {
    if (!this.installedAddons.has(packageId)) {
      throw new Error('Package not installed.');
    }

    const obj = this.installedAddons.get(packageId);
    obj.enabled = true;
    await Settings.set(`addons.${packageId}`, obj);
    await this.loadAddon(packageId);
  }

  async disableAddon(packageId, wait = false) {
    if (!this.installedAddons.has(packageId)) {
      throw new Error('Package not installed.');
    }

    const obj = this.installedAddons.get(packageId);
    obj.enabled = false;
    await Settings.set(`addons.${packageId}`, obj);
    await this.unloadAddon(packageId, wait);
  }

  /**
   * @method loadAddon
   *
   * Loads add-on with the given package ID.
   *
   * @param {String} packageId The package ID of the add-on to load.
   * @returns A promise which is resolved when the add-on is loaded.
   */
  async loadAddon(packageId) {
    const addonPath = path.join(UserProfile.addonsDir, packageId);

    // Let errors from loading the manifest bubble up.
    const [manifest, cfg] = AddonUtils.loadManifest(packageId);

    // Get any saved settings for this add-on.
    const key = `addons.${packageId}`;
    const configKey = `addons.config.${packageId}`;
    try {
      const savedSettings = await Settings.get(key);

      // If the old-style data is stored in the database, we need to transition
      // to the new format.
      if (savedSettings.hasOwnProperty('moziot') &&
          savedSettings.moziot.hasOwnProperty('enabled')) {
        manifest.enabled = savedSettings.moziot.enabled;
      } else if (savedSettings.hasOwnProperty('enabled')) {
        manifest.enabled = savedSettings.enabled;
      }

      if (savedSettings.hasOwnProperty('moziot') &&
          savedSettings.moziot.hasOwnProperty('config')) {
        await Settings.set(configKey, savedSettings.moziot.config);
      }
    } catch (_e) {
      // pass
    }

    await Settings.set(key, manifest);
    this.installedAddons.set(packageId, manifest);

    // Get the saved config. If there is none, populate the database with the
    // defaults.
    let savedConfig = await Settings.get(configKey);
    if (!savedConfig) {
      await Settings.set(configKey, cfg);
      savedConfig = cfg;
    }

    // If this add-on is not explicitly enabled, move on.
    if (!manifest.enabled) {
      throw new Error(`Add-on not enabled: ${manifest.id}`);
    }

    if (manifest.content_scripts && manifest.web_accessible_resources) {
      this.extensions[manifest.id] = {
        extensions: manifest.content_scripts,
        resources: manifest.web_accessible_resources,
      };
    }

    if (!manifest.exec) {
      return;
    }

    const dataPath = path.join(UserProfile.dataDir, manifest.id);
    try {
      // Create the add-on data directory, if necessary
      if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath);
      }
    } catch (e) {
      console.error(`Failed to create add-on data directory ${dataPath}:`, e);
    }

    // Now, we need to build an object so that add-ons which rely on things
    // being passed in can function properly.
    const newSettings = {
      name: manifest.id,
      display_name: manifest.name,
      moziot: {
        exec: manifest.exec,
      },
    };

    if (manifest.schema) {
      newSettings.moziot.schema = manifest.schema;
    }

    if (savedConfig) {
      newSettings.moziot.config = savedConfig;
    }

    // Load the add-on
    console.log(`Loading add-on: ${manifest.id}`);
    this.pluginServer.loadPlugin(addonPath, newSettings);
  }

  /**
   * @method loadAddons
   * Loads all of the configured add-ons from the addons directory.
   */
  loadAddons() {
    if (this.addonsLoaded) {
      // This is kind of a hack, but it allows the gateway to restart properly
      // when switching between http and https modes.
      return;
    }
    this.addonsLoaded = true;

    // Load the Plugin Server
    PluginServer = __webpack_require__(/*! ./plugin/plugin-server */ "./src/plugin/plugin-server.js");

    this.pluginServer = new PluginServer(this, {verbose: false});

    // Load the add-ons

    const addonManager = this;
    const addonPath = UserProfile.addonsDir;

    // Search add-ons directory
    fs.readdir(addonPath, async (err, files) => {
      if (err) {
        // This should probably never happen.
        console.error('Failed to search add-ons directory');
        console.error(err);
        return;
      }

      for (const addonId of files) {
        // Skip if not a directory. Use stat rather than lstat such that we
        // also load through symlinks.
        if (!fs.statSync(path.join(addonPath, addonId)).isDirectory()) {
          continue;
        }

        addonManager.loadAddon(addonId).catch((err) => {
          console.error(`Failed to load add-on ${addonId}:`, err);
        });
      }
    });

    if (true) {
      // Check for add-ons in 10 seconds (allow add-ons to load first).
      this.updateTimeout = setTimeout(() => {
        this.updateAddons();
        this.updateTimeout = null;

        // Check every day.
        const delay = 24 * 60 * 60 * 1000;
        this.updateInterval = setInterval(this.updateAddons.bind(this), delay);
      }, 10000);
    }
  }

  /**
   * @method removeThing
   *
   * Initiates removing a particular device.
   *
   * @returns A promise that resolves to the device which was actually removed.
   */
  removeThing(thingId) {
    const deferredRemove = new Deferred();

    if (this.deferredRemovals.has(thingId)) {
      deferredRemove.reject('Remove already in progress');
    } else {
      const device = this.getDevice(thingId);
      if (device) {
        deferredRemove.adapter = device.adapter;
        this.deferredRemovals.set(thingId, deferredRemove);
        this.removalTimeouts.set(thingId, setTimeout(() => {
          this.cancelRemoveThing(thingId);
        }, Constants.DEVICE_REMOVAL_TIMEOUT));
        device.adapter.removeThing(device);
      } else {
        deferredRemove.resolve(thingId);
      }
    }

    return deferredRemove.promise;
  }

  /**
   * @method unloadAddons
   * Unloads all of the loaded add-ons.
   *
   * @returns a promise which is resolved when all of the add-ons
   *          are unloaded.
   */
  unloadAddons() {
    if (!this.addonsLoaded) {
      // The add-ons are not currently loaded, no need to unload.
      return Promise.resolve();
    }

    const unloadPromises = [];

    // unload the adapters in the reverse of the order that they were loaded.
    for (const adapterId of Array.from(this.adapters.keys()).reverse()) {
      unloadPromises.push(this.unloadAdapter(adapterId));
    }

    // unload the notifiers in the reverse of the order that they were loaded.
    for (const notifierId of Array.from(this.notifiers.keys()).reverse()) {
      unloadPromises.push(this.unloadNotifier(notifierId));
    }

    // unload the API handlers in the reverse of the order that they were
    // loaded.
    for (const packageName of Array.from(this.apiHandlers.keys()).reverse()) {
      unloadPromises.push(this.unloadAPIHandler(packageName));
    }

    this.addonsLoaded = false;

    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    return Promise.all(unloadPromises).then(() => {
      if (this.pluginServer) {
        this.pluginServer.shutdown();
      }
    });
  }

  /**
   * @method unloadAdapter
   * Unload the given adapter.
   *
   * @param {String} id The ID of the adapter to unload.
   * @returns A promise which is resolved when the adapter is unloaded.
   */
  unloadAdapter(id) {
    if (!this.addonsLoaded) {
      // The add-ons are not currently loaded, no need to unload.
      return Promise.resolve();
    }

    const adapter = this.getAdapter(id);
    if (typeof adapter === 'undefined') {
      // This adapter wasn't loaded.
      return Promise.resolve();
    }

    console.log('Unloading', adapter.name);
    this.adapters.delete(adapter.id);
    return adapter.unload();
  }

  /**
   * @method unloadNotifier
   * Unload the given notifier.
   *
   * @param {String} id The ID of the notifier to unload.
   * @returns A promise which is resolved when the notifier is unloaded.
   */
  unloadNotifier(id) {
    if (!this.addonsLoaded) {
      // The add-ons are not currently loaded, no need to unload.
      return Promise.resolve();
    }

    const notifier = this.getNotifier(id);
    if (typeof notifier === 'undefined') {
      // This notifier wasn't loaded.
      return Promise.resolve();
    }

    console.log('Unloading', notifier.name);
    this.notifiers.delete(notifier.id);
    return notifier.unload();
  }

  /**
   * @method unloadAPIHandler
   * Unload the given API handler.
   *
   * @param {string} packageId The ID of the package the handler belongs to.
   * @returns A promise which is resolved when the handler is unloaded.
   */
  unloadAPIHandler(packageId) {
    if (!this.addonsLoaded) {
      // The add-ons are not currently loaded, no need to unload.
      return Promise.resolve();
    }

    const handler = this.getAPIHandler(packageId);
    if (typeof handler === 'undefined') {
      // This handler wasn't loaded.
      return Promise.resolve();
    }

    console.log('Unloading', handler.packageName);
    this.apiHandlers.delete(packageId);
    return handler.unload();
  }

  /**
   * @method unloadAddon
   * Unload add-on with the given package ID.
   *
   * @param {String} packageId The package ID of the add-on to unload.
   * @param {Boolean} wait Whether or not to wait for unloading to finish
   * @returns A promise which is resolved when the add-on is unloaded.
   */
  unloadAddon(packageId, wait) {
    if (!this.addonsLoaded) {
      // The add-ons are not currently loaded, no need to unload.
      return Promise.resolve();
    }

    if (this.extensions.hasOwnProperty(packageId)) {
      delete this.extensions[packageId];
    }

    const plugin = this.getPlugin(packageId);
    let pluginProcess = {};
    if (plugin) {
      pluginProcess = plugin.process;
    }

    const adapters = this.getAdaptersByPackageId(packageId);
    const adapterIds = adapters.map((a) => a.id);
    const notifiers = this.getNotifiersByPackageId(packageId);
    const notifierIds = notifiers.map((n) => n.id);
    const apiHandler = this.getAPIHandler(packageId);

    const unloadPromises = [];
    if (adapters.length > 0) {
      for (const a of adapters) {
        console.log('Unloading', a.name);
        unloadPromises.push(a.unload());
        this.adapters.delete(a.id);
      }
    }

    if (notifiers.length > 0) {
      for (const n of notifiers) {
        console.log('Unloading', n.name);
        unloadPromises.push(n.unload());
        this.notifiers.delete(n.id);
      }
    }

    if (apiHandler) {
      console.log('Unloading API handler', packageId);
      unloadPromises.push(apiHandler.unload());
      this.apiHandlers.delete(packageId);
    }

    if (adapters.length === 0 && notifiers.length === 0 && !apiHandler &&
        plugin) {
      // If there are no adapters, notifiers, or API handlers, manually unload
      // the plugin, otherwise it will just restart. Note that if the addon is
      // disabled, then there might not be a plugin either.
      plugin.unload();
    }

    // Give the process 3 seconds to exit before killing it.
    const cleanup = () => {
      setTimeout(() => {
        if (pluginProcess.p) {
          console.log(`Killing ${packageId} plugin.`);
          pluginProcess.p.kill();
        }

        // Remove devices owned by this add-on.
        for (const deviceId of Object.keys(this.devices)) {
          if (adapterIds.includes(this.devices[deviceId].adapter.id)) {
            this.handleDeviceRemoved(this.devices[deviceId]);
          }
        }

        // Remove outlets owned by this add-on.
        for (const outletId of Object.keys(this.outlets)) {
          if (notifierIds.includes(this.outlets[outletId].notifier.id)) {
            this.handleOutletRemoved(this.outlets[outletId]);
          }
        }

        if (this.extensions.hasOwnProperty(packageId)) {
          delete this.extensions[packageId];
        }
      }, Constants.UNLOAD_PLUGIN_KILL_DELAY);
    };

    const all =
      Promise.all(unloadPromises).then(() => cleanup(), () => cleanup());

    if (wait) {
      // If wait was set, wait 3 seconds + a little for the process to die.
      // 3 seconds, because that's what is used in unloadAddon().
      return all.then(() => {
        return new Promise((resolve) => {
          setTimeout(resolve, Constants.UNLOAD_PLUGIN_KILL_DELAY + 500);
        });
      });
    }

    return all;
  }

  /**
   * @method isAddonInstalled
   *
   * @param {String} packageId The package ID to check
   * @returns Boolean indicating whether or not the package is installed
   *          on the system.
   */
  isAddonInstalled(packageId) {
    return this.installedAddons.has(packageId);
  }

  /**
   * Install an add-on.
   *
   * @param {String} id The package ID
   * @param {String} url The package URL
   * @param {String} checksum SHA-256 checksum of the package
   * @param {Boolean} enable Whether or not to enable the add-on after install
   * @param {object} options Set of options, primarily used by external scripts
   * @returns A Promise that resolves when the add-on is installed.
   */
  async installAddonFromUrl(id, url, checksum, enable, options = {}) {
    const tempPath = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
    const destPath = path.join(tempPath, `${id}.tar.gz`);

    console.log(`Fetching add-on ${url} as ${destPath}`);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error status: ${res.status}`);
      }

      const dest = fs.createWriteStream(destPath);
      await promisePipe(res.body, dest);
    } catch (e) {
      rimraf(tempPath, {glob: false}, (e) => {
        if (e) {
          console.error(`Error removing temp directory: ${tempPath}\n${e}`);
        }
      });
      throw new Error(`Failed to download add-on: ${id}\n${e}`);
    }

    if (Utils.hashFile(destPath) !== checksum.toLowerCase()) {
      rimraf(tempPath, {glob: false}, (e) => {
        if (e) {
          console.error(`Error removing temp directory: ${tempPath}\n${e}`);
        }
      });
      throw new Error(`Checksum did not match for add-on: ${id}`);
    }

    let success = false, err;
    try {
      await this.installAddon(id, destPath, enable, options);
      success = true;
    } catch (e) {
      err = e;
    }

    rimraf(tempPath, {glob: false}, (e) => {
      if (e) {
        console.error(`Error removing temp directory: ${tempPath}\n${e}`);
      }
    });

    if (!success) {
      throw err;
    }
  }

  /**
   * @method installAddon
   *
   * @param {String} packageId The package ID to install
   * @param {String} packagePath Path to the package tarball
   * @param {Boolean} enable Whether or not to enable the add-on after install
   * @param {object} options Set of options, primarily used by external scripts
   * @returns A promise that resolves when the package is installed.
   */
  async installAddon(packageId, packagePath, enable, options = {}) {
    if (!this.addonsLoaded && !options.skipLoad) {
      throw new Error(
        'Cannot install add-on before other add-ons have been loaded.'
      );
    }

    if (!fs.lstatSync(packagePath).isFile()) {
      throw new Error(`Cannot extract invalid path: ${packagePath}`);
    }

    console.log(`Expanding add-on ${packagePath}`);

    try {
      // Try to extract the tarball
      await tar.x({
        file: packagePath,
        cwd: path.dirname(packagePath),
      }, ['package']);
    } catch (e) {
      throw new Error(`Failed to extract package: ${e}`);
    }

    // In case we're updating, go ahead and uninstall the existing add-on now
    await this.uninstallAddon(packageId, true, false);

    const addonPath = path.join(UserProfile.addonsDir, packageId);

    // Copy the package into the proper place
    await new Promise((resolve, reject) => {
      ncp(
        path.join(path.dirname(packagePath), 'package'),
        addonPath,
        {stopOnErr: true},
        (err) => {
          if (err) {
            reject(`Failed to move package: ${err}`);
          } else {
            resolve();
          }
        }
      );
    });

    // Update the saved settings (if any) and enable the add-on
    const key = `addons.${packageId}`;
    let obj = await Settings.get(key);
    if (obj) {
      // Only enable if we're supposed to. Otherwise, keep whatever the current
      // setting is.
      if (enable) {
        obj.enabled = true;
      }
    } else {
      // If this add-on is brand new, use the passed-in enable flag.
      obj = {
        enabled: enable,
      };
    }
    await Settings.set(key, obj);

    // If the add-on was previously enabled, load the add-on
    if (obj.enabled && !options.skipLoad) {
      // Now, load the add-on
      try {
        await this.loadAddon(packageId);
      } catch (e) {
        throw new Error(`Failed to load add-on ${packageId}: ${e}`);
      }
    }
  }

  /**
   * @method uninstallAddon
   *
   * @param {String} packageId The package ID to uninstall
   * @param {Boolean} wait Whether or not to wait for unloading to finish
   * @param {Boolean} disable Whether or not to disable the add-on
   * @returns A promise that resolves when the package is uninstalled.
   */
  async uninstallAddon(packageId, wait, disable) {
    try {
      // Try to gracefully unload
      await this.unloadAddon(packageId, wait);
    } catch (e) {
      console.error(`Failed to unload ${packageId} properly: ${e}`);
      // keep going
    }

    const addonPath = path.join(UserProfile.addonsDir, packageId);

    // Unload this module from the require cache
    Object.keys(__webpack_require__.c).map((x) => {
      if (x.startsWith(addonPath)) {
        delete __webpack_require__.c[x];
      }
    });

    // Remove the package from the file system
    if (fs.existsSync(addonPath) && fs.lstatSync(addonPath).isDirectory()) {
      await new Promise((resolve, reject) => {
        rimraf(addonPath, {glob: false}, (e) => {
          if (e) {
            reject(`Error removing ${packageId}: ${e}`);
          } else {
            resolve();
          }
        });
      });
    }

    // Update the saved settings and disable the add-on
    if (disable) {
      const key = `addons.${packageId}`;
      const obj = await Settings.get(key);
      if (obj) {
        obj.enabled = false;
        await Settings.set(key, obj);
      }
    }

    // Remove from our list of installed add-ons
    this.installedAddons.delete(packageId);
  }

  /**
   * @method waitForAdapter
   *
   * Returns a promise which resolves to the adapter with the indicated id.
   * This function is really only used to support testing and
   * ensure that tests don't proceed until
   */
  waitForAdapter(adapterId) {
    const adapter = this.getAdapter(adapterId);
    if (adapter) {
      // The adapter already exists, just create a Promise
      // that resolves to that.
      return Promise.resolve(adapter);
    }

    let deferredWait = this.deferredWaitForAdapter.get(adapterId);
    if (!deferredWait) {
      // No deferred wait currently setup. Set a new one up.
      deferredWait = new Deferred();
      this.deferredWaitForAdapter.set(adapterId, deferredWait);
    }

    return deferredWait.promise;
  }

  /**
   * @method updateAddons
   *
   * Attempt to update all installed add-ons.
   *
   * @param {object} options Set of options, primarily used by external scripts
   * @returns A promise which is resolved when updating is complete.
   */
  async updateAddons(options = {}) {
    const urls = config.get('addonManager.listUrls');
    const architecture = Platform.getArchitecture();
    const version = pkg.version;
    const nodeVersion = Platform.getNodeVersion();
    const pythonVersions = Platform.getPythonVersions();
    const addonPath = UserProfile.addonsDir;
    const available = {};

    console.log('Checking for add-on updates...');

    try {
      const params = new URLSearchParams();
      params.set('arch', architecture);
      params.set('version', version);
      params.set('node', nodeVersion);

      if (pythonVersions && pythonVersions.length > 0) {
        params.set('python', pythonVersions.join(','));
      }

      const map = new Map();

      for (const url of urls) {
        const response = await fetch(`${url}?${params.toString()}`, {
          headers: {
            Accept: 'application/json',
            'User-Agent': Utils.getGatewayUserAgent(),
          },
        });

        const addons = await response.json();
        for (const addon of addons) {
          // Check for duplicates, keep newest.
          if (map.has(addon.id) &&
              semver.gte(map.get(addon.id).version, addon.version)) {
            continue;
          }

          map.set(addon.id, addon);
        }
      }

      for (const addon of map.values()) {
        available[addon.id] = {
          version: addon.version,
          url: addon.url,
          checksum: addon.checksum,
        };
      }
    } catch (e) {
      console.error('Failed to parse add-on list:', e);
      return;
    }

    // Try to update what we can. Don't use the installedAddons set because it
    // doesn't contain add-ons that failed to load properly.
    fs.readdir(addonPath, async (err, files) => {
      if (err) {
        console.error('Failed to search add-on directory');
        console.error(err);
        return;
      }

      for (const addonId of files) {
        // Skip if not a directory. Use stat rather than lstat such that we
        // also load through symlinks.
        if (!fs.statSync(path.join(addonPath, addonId)).isDirectory()) {
          continue;
        }

        // Skip if .git directory is present.
        if (fs.existsSync(path.join(addonPath, addonId, '.git'))) {
          console.log(
            `Not updating ${addonId} since a .git directory was detected`);
          continue;
        }

        if (options.forceUpdateBinary) {
          // If the add-on has binary node extensions, it needs to be updated.
          const addonIdPath = path.join(addonPath, addonId);
          const binFiles = find.fileSync(/\.node$/, addonIdPath);
          if (binFiles.length > 0 && available.hasOwnProperty(addonId)) {
            try {
              await this.installAddonFromUrl(
                addonId,
                available[addonId].url,
                available[addonId].checksum,
                false,
                options
              );
            } catch (e) {
              console.error(`Failed to update ${addonId}: ${e}`);
            }

            continue;
          }
        }

        // Try to load package.json.
        const packageJson = path.join(addonPath, addonId, 'package.json');
        const manifestJson = path.join(addonPath, addonId, 'manifest.json');
        let manifest;
        if (fs.existsSync(packageJson)) {
          try {
            const data = fs.readFileSync(packageJson);
            manifest = JSON.parse(data);
          } catch (e) {
            console.error(`Failed to read package.json: ${packageJson}\n${e}`);
            continue;
          }
        } else if (fs.existsSync(manifestJson)) {
          try {
            const data = fs.readFileSync(manifestJson);
            manifest = JSON.parse(data);
          } catch (e) {
            console.error(
              `Failed to read manifest.json: ${manifestJson}\n${e}`
            );
            continue;
          }
        } else {
          continue;
        }

        // Check if an update is available.
        if (available.hasOwnProperty(addonId) &&
            semver.lt(manifest.version, available[addonId].version)) {
          try {
            await this.installAddonFromUrl(
              addonId,
              available[addonId].url,
              available[addonId].checksum,
              false,
              options
            );
          } catch (e) {
            console.error(`Failed to update ${addonId}: ${e}`);
          }
        }
      }

      console.log('Finished updating add-ons');
    });
  }
}

module.exports = new AddonManager();


/***/ }),

/***/ "./src/addon-utils.js":
/*!****************************!*\
  !*** ./src/addon-utils.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const find = __webpack_require__(/*! find */ "find");
const fs = __webpack_require__(/*! fs */ "fs");
const pkg = __webpack_require__(/*! ../package.json */ "./package.json");
const path = __webpack_require__(/*! path */ "path");
const semver = __webpack_require__(/*! semver */ "semver");
const UserProfile = __webpack_require__(/*! ./user-profile */ "./src/user-profile.js");
const Utils = __webpack_require__(/*! ./utils */ "./src/utils.js");

const MANIFEST_VERSION = 1;

// Setting this flag will force every file present in an add-on's directory to
// have a checksum in the SHA256SUMS file. However, several add-ons currently
// write files directly into their directories. When we resolve all of those
// issues, this flag can be flipped.
const ENFORCE_STRICT_SHA_CHECK = false;

/**
 * Verify one level of an object, recursing as required.
 *
 * @param {string} prefix - Prefix to use for keys, e.g. level1.level2.
 * @param {object} object - Object to validate
 * @param {object} template - Template to validate against
 *
 * @returns {string?} Error string, or undefined if no error.
 */
function validateObject(prefix, object, template) {
  for (const key in template) {
    if (key in object) {
      const objectVal = object[key];
      const templateVal = template[key];

      if (typeof objectVal !== typeof templateVal) {
        return `Expecting ${prefix}${key} to have type: ${
          typeof templateVal}, found: ${typeof objectVal}`;
      }

      if (typeof objectVal === 'object') {
        if (Array.isArray(objectVal)) {
          if (templateVal.length > 0) {
            const expectedType = typeof templateVal[0];
            for (const val of objectVal) {
              if (typeof val !== expectedType) {
                return `Expecting all values in ${prefix}${key} to be of ` +
                  `type ${expectedType}`;
              }
            }
          }
        } else {
          const err = validateObject(
            `${prefix + key}.`,
            objectVal,
            templateVal
          );
          if (err) {
            return err;
          }
        }
      }
    } else {
      return `Manifest is missing: ${prefix}${key}`;
    }
  }
}

/**
 * Verify that a manifest.json looks valid. We only need to validate fields
 * which we actually use.
 *
 * @param {object} manifest - The parsed manifest.json manifest
 *
 * @returns {string?} Error string, or undefined if no error.
 */
function validateManifestJson(manifest) {
  const manifestTemplate = {
    author: '',
    description: '',
    gateway_specific_settings: {
      webthings: {
        primary_type: '',
      },
    },
    homepage_url: '',
    id: '',
    license: '',
    manifest_version: 0,
    name: '',
    version: '',
  };

  // Since we're trying to use a field before full validation, make sure it
  // exists first.
  if (!manifest.gateway_specific_settings ||
      !manifest.gateway_specific_settings.webthings ||
      !manifest.gateway_specific_settings.webthings.primary_type) {
    return '' +
      'Expecting manifest.gateway_specific_settings.webthings.primary_type ' +
      'to have type: string, found: undefined';
  }

  // eslint-disable-next-line max-len
  if (manifest.gateway_specific_settings.webthings.primary_type !== 'extension') {
    // If we're not using in-process plugins, and this is not an extension,
    // then we also need the exec keyword to exist.
    manifestTemplate.gateway_specific_settings.webthings.exec = '';
  }

  return validateObject('', manifest, manifestTemplate);
}

/**
 * Load an add-on manifest from a manifest.json file.
 *
 * @param {string} packageId - The ID of the package, e.g. example-adapter
 *
 * @returns {object[]} 2-value array containing a parsed manifest and a default
 *                     config object.
 */
function loadManifestJson(packageId) {
  const addonPath = path.join(UserProfile.addonsDir, packageId);

  // Read the package.json file.
  let data;
  try {
    data = fs.readFileSync(path.join(addonPath, 'manifest.json'));
  } catch (e) {
    throw new Error(
      `Failed to read manifest.json for add-on ${packageId}: ${e}`
    );
  }

  // Parse as JSON
  let manifest;
  try {
    manifest = JSON.parse(data);
  } catch (e) {
    throw new Error(
      `Failed to parse manifest.json for add-on: ${packageId}: ${e}`
    );
  }

  // First, verify manifest version.
  if (manifest.manifest_version !== MANIFEST_VERSION) {
    throw new Error(
      `Manifest version ${manifest.manifest_version} for add-on ${packageId
      } does not match expected version ${MANIFEST_VERSION}`
    );
  }

  // Verify that the id in the package matches the packageId
  if (manifest.id != packageId) {
    const err = `ID from manifest .json "${manifest.id}" doesn't ` +
                `match the ID from list.json "${packageId}"`;
    throw new Error(err);
  }

  // If the add-on is not a git repository, check the SHA256SUMS file.
  if (!fs.existsSync(path.join(addonPath, '.git'))) {
    const sumsFile = path.resolve(path.join(addonPath, 'SHA256SUMS'));

    if (fs.existsSync(sumsFile)) {
      const sums = new Map();

      try {
        const data = fs.readFileSync(sumsFile, 'utf8');
        const lines = data.trim().split(/\r?\n/);
        for (const line of lines) {
          const checksum = line.slice(0, 64);
          let filename = line.slice(64).trimLeft();

          if (filename.startsWith('*')) {
            filename = filename.substring(1);
          }

          filename = path.resolve(path.join(addonPath, filename));
          if (!fs.existsSync(filename)) {
            throw new Error(
              `File ${filename} missing for add-on ${packageId}`
            );
          }

          sums.set(filename, checksum);
        }
      } catch (e) {
        throw new Error(
          `Failed to read SHA256SUMS for add-on ${packageId}: ${e}`
        );
      }

      find.fileSync(addonPath).forEach((fname) => {
        fname = path.resolve(fname);

        if (fname === sumsFile) {
          return;
        }

        if (!sums.has(fname)) {
          if (ENFORCE_STRICT_SHA_CHECK) {
            throw new Error(
              `No checksum found for file ${fname} in add-on ${packageId}`
            );
          } else {
            return;
          }
        }

        if (Utils.hashFile(fname) !== sums.get(fname)) {
          throw new Error(
            `Checksum failed for file ${fname} in add-on ${packageId}`
          );
        }
      });
    } else if (true) {
      throw new Error(`SHA256SUMS file missing for add-on ${packageId}`);
    }
  }

  // Verify that important fields exist in the manifest
  const err = validateManifestJson(manifest);
  if (err) {
    throw new Error(
      `Error found in manifest for add-on ${packageId}: ${err}`
    );
  }

  // Verify gateway version.
  let min = manifest.gateway_specific_settings.webthings.strict_min_version;
  let max = manifest.gateway_specific_settings.webthings.strict_max_version;

  if (typeof min === 'string' && min !== '*') {
    min = semver.coerce(min);
    if (semver.lt(pkg.version, min)) {
      throw new Error(
        `Gateway version ${pkg.version} is lower than minimum version ${min
        } supported by add-on ${packageId}`
      );
    }
  }
  if (typeof max === 'string' && max !== '*') {
    max = semver.coerce(max);
    if (semver.gt(pkg.version, max)) {
      throw new Error(
        `Gateway version ${pkg.version} is higher than maximum version ${max
        } supported by add-on ${packageId}`
      );
    }
  }

  const obj = {
    id: manifest.id,
    author: manifest.author,
    name: manifest.name,
    description: manifest.description,
    homepage_url: manifest.homepage_url,
    version: manifest.version,
    primary_type: manifest.gateway_specific_settings.webthings.primary_type,
    exec: manifest.gateway_specific_settings.webthings.exec,
    content_scripts: manifest.content_scripts,
    web_accessible_resources: manifest.web_accessible_resources,
    enabled: false,
  };

  let cfg = {};
  if (manifest.hasOwnProperty('options')) {
    if (manifest.options.hasOwnProperty('default')) {
      cfg = manifest.options.default;
    }

    if (manifest.options.hasOwnProperty('schema')) {
      obj.schema = manifest.options.schema;
    }
  }

  if (manifest.gateway_specific_settings.webthings.enabled) {
    obj.enabled = true;
  }

  return [
    obj,
    cfg,
  ];
}

/**
 * Load the manifest for a given package.
 *
 * @param {string} packageId - The ID of the package, e.g. example-adapter
 *
 * @returns {object[]} 2-value array containing a parsed manifest and a default
 *                     config object.
 */
function loadManifest(packageId) {
  const addonPath = path.join(UserProfile.addonsDir, packageId);

  if (fs.existsSync(path.join(addonPath, 'manifest.json'))) {
    return loadManifestJson(packageId);
  }

  throw new Error(`No manifest found for add-on ${packageId}`);
}

module.exports = {
  loadManifest,
};


/***/ }),

/***/ "./src/app.js":
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 * WebThings Gateway App.
 *
 * Back end main script.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



// Set up the user profile.
const UserProfile = __webpack_require__(/*! ./user-profile */ "./src/user-profile.js");
UserProfile.init();
const migration = UserProfile.migrate();

// Causes a timestamp to be prepended to console log lines.
__webpack_require__(/*! ./log-timestamps */ "./src/log-timestamps.js");

// External Dependencies
const https = __webpack_require__(/*! https */ "https");
const http = __webpack_require__(/*! http */ "http");
const fs = __webpack_require__(/*! fs */ "fs");
const express = __webpack_require__(/*! express */ "express");
const expressWs = __webpack_require__(/*! express-ws */ "express-ws");
const fileUpload = __webpack_require__(/*! express-fileupload */ "express-fileupload");
const bodyParser = __webpack_require__(/*! body-parser */ "body-parser");
const GetOpt = __webpack_require__(/*! node-getopt */ "node-getopt");
const config = __webpack_require__(/*! config */ "config");
const path = __webpack_require__(/*! path */ "path");
const expressHandlebars = __webpack_require__(/*! express-handlebars */ "express-handlebars");
const ipRegex = __webpack_require__(/*! ip-regex */ "ip-regex");
const SegfaultHandler = __webpack_require__(/*! segfault-handler */ "segfault-handler");

// Internal Dependencies
const addonManager = __webpack_require__(/*! ./addon-manager */ "./src/addon-manager.js");
const Constants = __webpack_require__(/*! ./constants */ "./src/constants.js");
const db = __webpack_require__(/*! ./db */ "./src/db.js");
const mDNSserver = __webpack_require__(/*! ./mdns-server */ "./src/mdns-server.js");
const Logs = __webpack_require__(/*! ./models/logs */ "./src/models/logs.js");
const platform = __webpack_require__(/*! ./platform */ "./src/platform.js");
const Router = __webpack_require__(/*! ./router */ "./src/router.js");
const sleep = __webpack_require__(/*! ./sleep */ "./src/sleep.js");
const Things = __webpack_require__(/*! ./models/things */ "./src/models/things.js");
const TunnelService = __webpack_require__(/*! ./ssltunnel */ "./src/ssltunnel.js");
const {RouterSetupApp, isRouterConfigured} = __webpack_require__(/*! ./router-setup */ "./src/router-setup.js");
const {WiFiSetupApp, isWiFiConfigured} = __webpack_require__(/*! ./wifi-setup */ "./src/wifi-setup.js");

SegfaultHandler.registerHandler(path.join(UserProfile.logDir, 'crash.log'));

// Open the databases
db.open();
Logs.open();

const servers = {};
servers.http = http.createServer();
const httpApp = createGatewayApp(servers.http, false);

servers.https = createHttpsServer();
let httpsApp = null;

/**
 * Creates an HTTPS server object, if successful. If there are no public and
 * private keys stored for the tunnel service, null is returned.
 *
 * @param {}
 * @return {Object|null} https server object if successful, else NULL
 */
function createHttpsServer() {
  if (!TunnelService.hasCertificates()) {
    return null;
  }

  // HTTPS server configuration
  const options = {
    key: fs.readFileSync(path.join(UserProfile.sslDir, 'privatekey.pem')),
    cert: fs.readFileSync(path.join(UserProfile.sslDir, 'certificate.pem')),
  };
  if (fs.existsSync(path.join(UserProfile.sslDir, 'chain.pem'))) {
    options.ca = fs.readFileSync(path.join(UserProfile.sslDir, 'chain.pem'));
  }
  return https.createServer(options);
}

let httpsAttempts = 5;
function startHttpsGateway() {
  const port = config.get('ports.https');

  if (!servers.https) {
    servers.https = createHttpsServer();
    if (!servers.https) {
      httpsAttempts -= 1;
      if (httpsAttempts < 0) {
        console.error('Unable to create HTTPS server after several tries');
        gracefulExit();
        process.exit(0);
      }

      return sleep(4000).then(startHttpsGateway);
    }
  }

  httpsApp = createGatewayApp(servers.https, true);
  servers.https.on('request', httpsApp);

  const promises = [];

  // Start the HTTPS server
  promises.push(new Promise((resolve) => {
    servers.https.listen(port, () => {
      migration.then(() => {
        // load existing things from the database
        return Things.getThings();
      }).then(() => {
        addonManager.loadAddons();
      });
      rulesEngineConfigure();
      console.log('HTTPS server listening on port',
                  servers.https.address().port);
      resolve();
    });
  }));

  // Redirect HTTP to HTTPS
  servers.http.on('request', httpsApp);
  const httpPort = config.get('ports.http');

  promises.push(new Promise((resolve) => {
    servers.http.listen(httpPort, () => {
      console.log('Redirector listening on port', servers.http.address().port);
      resolve();
    });
  }));

  return Promise.all(promises).then(() => servers.https);
}

function startHttpGateway() {
  servers.http.on('request', httpApp);

  const port = config.get('ports.http');

  return new Promise((resolve) => {
    servers.http.listen(port, () => {
      migration.then(() => {
        // load existing things from the database
        return Things.getThings();
      }).then(() => {
        addonManager.loadAddons();
      });
      rulesEngineConfigure();
      console.log('HTTP server listening on port', servers.http.address().port);
      resolve();
    });
  });
}

function stopHttpGateway() {
  servers.http.removeListener('request', httpApp);
  servers.http.close();
}

function startWiFiSetup() {
  console.log('Starting WiFi setup');
  servers.http.on('request', WiFiSetupApp.onRequest);

  const port = config.get('ports.http');

  servers.http.listen(port);
}

function stopWiFiSetup() {
  console.log('Stopping WiFi Setup');
  servers.http.removeListener('request', WiFiSetupApp.onRequest);
  servers.http.close();
}

function startRouterSetup() {
  console.log('Starting Router Setup');
  servers.http.on('request', RouterSetupApp.onRequest);

  const port = config.get('ports.http');

  servers.http.listen(port);
}

function stopRouterSetup() {
  console.log('Stopping Router Setup');
  servers.http.removeListener('request', RouterSetupApp.onRequest);
  servers.http.close();
}

function getOptions() {
  if (!config.get('cli')) {
    return {
      debug: false,
      port: null,
    };
  }

  // Command line arguments
  const getopt = new GetOpt([
    ['d', 'debug', 'Enable debug features'],
    ['h', 'help', 'Display help'],
    ['v', 'verbose', 'Show verbose output'],
  ]);

  const opt = getopt.parseSystem();
  const options = {
    debug: !!opt.options.debug, // cast to bool
    verbose: opt.options.verbose,
  };

  if (opt.options.verbose) {
    console.log(opt);
  }

  if (opt.options.help) {
    getopt.showHelp();
    process.exit(1);
  }

  if (opt.options.port) {
    options.port = parseInt(opt.options.port);
  }

  return options;
}

/**
 * Set up the rules engine.
 */
function rulesEngineConfigure() {
  const rulesEngine = __webpack_require__(/*! ./rules-engine/index */ "./src/rules-engine/index.js");
  rulesEngine.configure();
}

function createApp(isSecure) {
  const port = isSecure ? config.get('ports.https') : config.get('ports.http');
  const app = express();
  app.engine(
    'handlebars',
    expressHandlebars({
      defaultLayout: undefined, // eslint-disable-line no-undefined
      layoutsDir: Constants.VIEWS_PATH,
    })
  );
  app.set('view engine', 'handlebars');
  app.set('views', Constants.VIEWS_PATH);

  // Redirect based on https://https.cio.gov/apis/
  app.use((request, response, next) => {
    // If the server is in non-HTTPS mode, or the request is already HTTPS,
    // just carry on.
    if (!isSecure || request.secure) {
      next();
      return;
    }

    // If the Host header was not set, disallow this request.
    if (!request.hostname) {
      response.sendStatus(403);
      return;
    }

    // If the request is for a bare hostname, a .local address, or an IP
    // address, allow it.
    if (request.hostname.indexOf('.') < 0 ||
        request.hostname.endsWith('.local') ||
        ipRegex({exact: true}).test(request.hostname)) {
      next();
      return;
    }

    if (request.method !== 'GET') {
      response.sendStatus(403);
      return;
    }

    if (request.headers.authorization) {
      response.sendStatus(403);
      return;
    }

    let httpsUrl = `https://${request.hostname}`;

    // If we're behind forwarding we can redirect to the port-free https url
    if (port !== 443 && !config.get('behindForwarding')) {
      httpsUrl += `:${port}`;
    }

    httpsUrl += request.url;
    response.redirect(301, httpsUrl);
  });

  // Use bodyParser to access the body of requests
  app.use(bodyParser.urlencoded({
    extended: false,
  }));
  app.use(bodyParser.json({limit: '1mb'}));

  // Use fileUpload to handle multi-part uploads
  app.use(fileUpload());

  return app;
}

/**
 * @param {http.Server|https.Server} server
 * @return {express.Router}
 */
function createGatewayApp(server, isSecure) {
  const app = createApp(isSecure);
  const opt = getOptions();

  // Inject WebSocket support
  expressWs(app, server);

  // Configure router with configured app and command line options.
  Router.configure(app, opt);
  return app;
}

const serverStartup = {
  promise: Promise.resolve(),
};

switch (platform.getOS()) {
  case 'linux-raspbian':
    migration.then(() => {
      return isWiFiConfigured();
    }).then((configured) => {
      if (!configured) {
        WiFiSetupApp.onConnection = () => {
          stopWiFiSetup();
          startGateway();
        };
        startWiFiSetup();
      } else {
        startGateway();
      }
    });
    break;
  case 'linux-openwrt':
    migration.then(() => {
      return isRouterConfigured();
    }).then((configured) => {
      if (!configured) {
        RouterSetupApp.onConnection = () => {
          stopRouterSetup();
          startGateway();
        };
        startRouterSetup();
      } else {
        startGateway();
      }
    });
    break;
  default:
    startGateway();
    break;
}

function startGateway() {
  // if we have the certificates installed, we start https
  if (TunnelService.hasCertificates()) {
    serverStartup.promise = TunnelService.userSkipped().then((skipped) => {
      const promise = startHttpsGateway();

      // if the user opted to skip the tunnel, but still has certificates, go
      // ahead and start up the https server.
      if (skipped) {
        return promise;
      }

      // if they did not opt to skip, check if they have a tunnel token. if so,
      // start the tunnel.
      return promise.then((server) => {
        TunnelService.hasTunnelToken().then((result) => {
          if (result) {
            TunnelService.setServerHandle(server);
            TunnelService.start();
          }
        });
      });
    });
  } else {
    serverStartup.promise = startHttpGateway();
  }
}

function gracefulExit() {
  addonManager.unloadAddons();
  TunnelService.stop();
}

if (config.get('cli')) {
  // Get some decent error messages for unhandled rejections. This is
  // often just errors in the code.
  process.on('unhandledRejection', (reason) => {
    console.log('Unhandled Rejection');
    console.error(reason);
  });

  // Do graceful shutdown when Control-C is pressed.
  process.on('SIGINT', () => {
    console.log('Control-C: Exiting gracefully');
    gracefulExit();
    process.exit(0);
  });
}

// function to stop running server and start https
TunnelService.switchToHttps = () => {
  stopHttpGateway();
  startHttpsGateway().then((server) => {
    TunnelService.setServerHandle(server);
  });
};

// This part starts our Service Discovery process.
// We check to see if mDNS should be setup in default mode, or has a previous
// user setup a unique domain. Then we start it.
mDNSserver.getmDNSstate().then((state) => {
  if (platform.implemented('setMdnsServerStatus')) {
    platform.setMdnsServerStatus(state);
  }
});

// for testing
module.exports = {
  servers,
  serverStartup,
};


/***/ }),

/***/ "./src/certificate-manager.js":
/*!************************************!*\
  !*** ./src/certificate-manager.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Certificate Manager.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const acme = __webpack_require__(/*! acme-client */ "acme-client");
const config = __webpack_require__(/*! config */ "config");
const fetch = __webpack_require__(/*! node-fetch */ "node-fetch");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const Settings = __webpack_require__(/*! ./models/settings */ "./src/models/settings.js");
const sleep = __webpack_require__(/*! ./sleep */ "./src/sleep.js");
const {URLSearchParams} = __webpack_require__(/*! url */ "url");
const UserProfile = __webpack_require__(/*! ./user-profile */ "./src/user-profile.js");

const DEBUG =  false || ("development" === 'test');

const DIRECTORY_URL = acme.directory.letsencrypt.production;

// For test purposes, uncomment the following:
// const DIRECTORY_URL = acme.directory.letsencrypt.staging;
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Write certificates generated by registration/renewal to disk.
 *
 * @param {string} certificate - The generated certificate
 * @param {string} privateKey - The generated private key
 * @param {string} chain - The generated certificate chain
 */
function writeCertificates(certificate, privateKey, chain) {
  fs.writeFileSync(
    path.join(UserProfile.sslDir, 'certificate.pem'),
    certificate
  );
  fs.writeFileSync(
    path.join(UserProfile.sslDir, 'privatekey.pem'),
    privateKey
  );
  fs.writeFileSync(
    path.join(UserProfile.sslDir, 'chain.pem'),
    chain
  );
}

/**
 * Register domain with Let's Encrypt and get certificates.
 *
 * @param {string} email - User's email address
 * @param {string?} reclamationToken - Reclamation token, if applicable
 * @param {string} subdomain - The subdomain being registered
 * @param {string} fulldomain - The full domain being registered
 * @param {boolean} optout - Whether or not the user opted out of emails
 * @param {function} callback - Callback function
 */
async function register(email, reclamationToken, subdomain, fulldomain,
                        optout, callback) {
  if (DEBUG) {
    console.debug('Starting registration:', email, reclamationToken, subdomain,
                  fulldomain, optout);
  } else {
    console.log('Starting registration');
  }

  const endpoint = config.get('ssltunnel.registration_endpoint');
  let token;

  // First, try to register the subdomain with the registration server.
  try {
    const params = new URLSearchParams();
    params.set('name', subdomain);
    params.set('email', email);

    if (reclamationToken) {
      params.set('reclamationToken', reclamationToken.trim());
    }

    const subscribeUrl = `${endpoint}/subscribe?${params.toString()}`;
    const res = await fetch(subscribeUrl);
    const jsonToken = await res.json();

    if (DEBUG) {
      console.debug('Sent subscription to registration server:', jsonToken);
    } else {
      console.log('Sent subscription to registration server');
    }

    if (jsonToken.error) {
      console.log('Error received from registration server:', jsonToken.error);
      callback(jsonToken.error);
      return;
    }

    token = jsonToken.token;

    // Store the token in the db
    await Settings.set('tunneltoken', jsonToken);
  } catch (e) {
    console.error('Failed to subscribe:', e);
    callback(e);
    return;
  }

  // Now we associate user's email with the subdomain, unless it was reclaimed
  if (!reclamationToken) {
    const params = new URLSearchParams();
    params.set('token', token);
    params.set('email', email);
    params.set('optout', optout);

    try {
      await fetch(`${endpoint}/setemail?${params.toString()}`);
      console.log('Set email on server.');
    } catch (e) {
      console.error('Failed to set email on server:', e);

      // https://github.com/mozilla-iot/gateway/issues/358
      // we should store this error and display to the user on
      // settings page to allow him to retry
      callback(e);
      return;
    }
  }

  /**
   * Function used to satisfy an ACME challenge
   *
   * @param {object} authz Authorization object
   * @param {object} challenge Selected challenge
   * @param {string} keyAuthorization Authorization key
   * @returns {Promise}
   */
  const challengeCreateFn = async (_authz, _challenge, keyAuthorization) => {
    const params = new URLSearchParams();
    params.set('token', token);
    params.set('challenge', keyAuthorization);

    // Now that we have a challenge, we call our registration server to
    // setup the TXT record
    const response = await fetch(`${endpoint}/dnsconfig?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to set DNS token on server: ${response.status}`);
    }

    console.log('Set DNS token on registration server');

    // Let's wait a few seconds for changes to propagate on the registration
    // server and its database.
    await sleep(2500);
  };

  /**
   * Function used to remove an ACME challenge response
   *
   * @param {object} authz Authorization object
   * @param {object} challenge Selected challenge
   * @param {string} keyAuthorization Authorization key
   * @returns {Promise}
   */
  const challengeRemoveFn = async (_authz, _challenge, _keyAuthorization) => {
    // do nothing for now
  };

  try {
    // create an ACME client
    const client = new acme.Client({
      directoryUrl: DIRECTORY_URL,
      accountKey: await acme.forge.createPrivateKey(),
    });

    // create a CSR
    const [key, csr] = await acme.forge.createCsr({
      commonName: fulldomain,
    });

    // run the ACME registration
    const cert = await client.auto({
      csr,
      email: config.get('ssltunnel.certemail'),
      termsOfServiceAgreed: true,
      skipChallengeVerification: true,
      challengePriority: ['dns-01'],
      challengeCreateFn,
      challengeRemoveFn,
    });

    if (DEBUG) {
      console.debug('Private Key:', key.toString());
      console.debug('CSR:', csr.toString());
      console.debug('Certificate(s):', cert.toString());
    } else {
      console.log('Received certificate from Let\'s Encrypt');
    }

    const chain = cert
      .toString()
      .trim()
      .split(/[\r\n]{2,}/g)
      .map((s) => `${s}\n`);

    writeCertificates(chain[0], key.toString(), chain.join('\n'));
    console.log('Wrote certificates to file system');
  } catch (e) {
    console.error('Failed to generate certificate:', e);
    callback(e);
    return;
  }

  console.log('Registration success!');
  callback();
}

/**
 * Try to renew the certificates associated with this domain.
 *
 * @param {Object} server - HTTPS server handle
 */
async function renew(server) {
  console.log('Starting certificate renewal.');

  // Check if we need to renew yet
  try {
    const oldCert = fs.readFileSync(
      path.join(UserProfile.sslDir, 'certificate.pem')
    );
    const info = await acme.forge.readCertificateInfo(oldCert);
    const now = new Date();

    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    if (info.notAfter - now >= oneWeek) {
      console.log('Certificate not yet due for renewal.');
      return;
    }
  } catch (_e) {
    // pass. move on to renewal.
  }

  let tunnelToken;
  try {
    tunnelToken = await Settings.get('tunneltoken');
  } catch (e) {
    console.error('Tunnel token not set!');
    return;
  }

  /**
   * Function used to satisfy an ACME challenge
   *
   * @param {object} authz Authorization object
   * @param {object} challenge Selected challenge
   * @param {string} keyAuthorization Authorization key
   * @returns {Promise}
   */
  const challengeCreateFn = async (_authz, challenge, keyAuthorization) => {
    const params = new URLSearchParams();
    params.set('token', tunnelToken.token);
    params.set('challenge', keyAuthorization);

    // Now that we have a challenge, we call our registration server to
    // setup the TXT record
    const endpoint = config.get('ssltunnel.registration_endpoint');
    const response = await fetch(`${endpoint}/dnsconfig?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to set DNS token on server: ${response.status}`);
    }

    console.log('Set DNS token on registration server');

    // Let's wait a few seconds for changes to propagate on the registration
    // server and its database.
    await sleep(2500);
  };

  /**
   * Function used to remove an ACME challenge response
   *
   * @param {object} authz Authorization object
   * @param {object} challenge Selected challenge
   * @param {string} keyAuthorization Authorization key
   * @returns {Promise}
   */
  const challengeRemoveFn = async (_authz, _challenge, _keyAuthorization) => {
    // do nothing for now
  };

  const domain = `${tunnelToken.name}.${config.get('ssltunnel.domain')}`;

  try {
    // create an ACME client
    const client = new acme.Client({
      directoryUrl: DIRECTORY_URL,
      accountKey: await acme.forge.createPrivateKey(),
    });

    // create a CSR
    const [key, csr] = await acme.forge.createCsr({
      commonName: domain,
    });

    // run the ACME registration
    const cert = await client.auto({
      csr,
      email: config.get('ssltunnel.certemail'),
      termsOfServiceAgreed: true,
      skipChallengeVerification: true,
      challengePriority: ['dns-01'],
      challengeCreateFn,
      challengeRemoveFn,
    });

    if (DEBUG) {
      console.debug('Private Key:', key.toString());
      console.debug('CSR:', csr.toString());
      console.debug('Certificate(s):', cert.toString());
    } else {
      console.log('Received certificate from Let\'s Encrypt');
    }

    const chain = cert
      .toString()
      .trim()
      .split(/[\r\n]{2,}/g)
      .map((s) => `${s}\n`);

    writeCertificates(chain[0], key.toString(), chain.join('\n'));
    console.log('Wrote certificates to file system');

    if (server) {
      const ctx = server._sharedCreds.context;
      ctx.setCert(chain[0]);
      ctx.setKey(key.toString());
      ctx.addCACert(chain.join('\n'));
    }
  } catch (e) {
    console.error('Failed to renew certificate:', e);
    return;
  }

  console.log('Renewal success!');
}

module.exports = {
  register,
  renew,
};


/***/ }),

/***/ "./src/constants.js":
/*!**************************!*\
  !*** ./src/constants.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {/*
 * WebThings Gateway Constants.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const path = __webpack_require__(/*! path */ "path");

// Web server routes
exports.USERS_PATH = '/users';
exports.THINGS_PATH = '/things';
exports.PROPERTIES_PATH = '/properties';
exports.NEW_THINGS_PATH = '/new_things';
exports.ADAPTERS_PATH = '/adapters';
exports.ADDONS_PATH = '/addons';
exports.NOTIFIERS_PATH = '/notifiers';
exports.ACTIONS_PATH = '/actions';
exports.EVENTS_PATH = '/events';
exports.LOGIN_PATH = '/login';
exports.LOG_OUT_PATH = '/log-out';
exports.SETTINGS_PATH = '/settings';
exports.UPDATES_PATH = '/updates';
exports.UPLOADS_PATH = '/uploads';
exports.MEDIA_PATH = '/media';
exports.DEBUG_PATH = '/debug';
exports.RULES_PATH = '/rules';
exports.OAUTH_PATH = '/oauth';
exports.OAUTHCLIENTS_PATH = '/authorizations';
exports.INTERNAL_LOGS_PATH = '/internal-logs';
exports.LOGS_PATH = '/logs';
exports.PUSH_PATH = '/push';
exports.PING_PATH = '/ping';
exports.PROXY_PATH = '/proxy';
exports.EXTENSIONS_PATH = '/extensions';
// Remember we end up in the build/* directory so these paths looks slightly
// different than you might expect.
exports.STATIC_PATH = path.join(__dirname, '../static');
exports.BUILD_STATIC_PATH = path.join(__dirname, '../build/static');
exports.VIEWS_PATH = path.join(__dirname, '../build/views');

// Plugin and REST/websocket API things
exports.ACTION_STATUS = 'actionStatus';
exports.ADAPTER_ADDED = 'adapterAdded';
exports.ADD_EVENT_SUBSCRIPTION = 'addEventSubscription';
exports.API_HANDLER_ADDED = 'apiHandlerAdded';
exports.CONNECTED = 'connected';
exports.ERROR = 'error';
exports.EVENT = 'event';
exports.MODIFIED = 'modified';
exports.NOTIFIER_ADDED = 'notifierAdded';
exports.OUTLET_ADDED = 'outletAdded';
exports.OUTLET_REMOVED = 'outletRemoved';
exports.PAIRING_TIMEOUT = 'pairingTimeout';
exports.PROPERTY_CHANGED = 'propertyChanged';
exports.PROPERTY_STATUS = 'propertyStatus';
exports.REMOVED = 'removed';
exports.REQUEST_ACTION = 'requestAction';
exports.SET_PROPERTY = 'setProperty';
exports.THING_ADDED = 'thingAdded';
exports.THING_MODIFIED = 'thingModified';
exports.THING_REMOVED = 'thingRemoved';

// OAuth things
exports.ACCESS_TOKEN = 'access_token';
exports.AUTHORIZATION_CODE = 'authorization_code';
exports.USER_TOKEN = 'user_token';
exports.READWRITE = 'readwrite';
exports.READ = 'read';

// Logging
exports.LogSeverity = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
  PROMPT: 4,
};

exports.UNLOAD_PLUGIN_KILL_DELAY = 3000;
exports.DEVICE_REMOVAL_TIMEOUT = 30000;

/* WEBPACK VAR INJECTION */}.call(this, "src"))

/***/ }),

/***/ "./src/controllers/actions_controller.js":
/*!***********************************************!*\
  !*** ./src/controllers/actions_controller.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Actions Controller.
 *
 * Manages the top level actions queue for the gateway and things.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const PromiseRouter = __webpack_require__(/*! express-promise-router */ "express-promise-router");
const Action = __webpack_require__(/*! ../models/action */ "./src/models/action.js");
const Actions = __webpack_require__(/*! ../models/actions */ "./src/models/actions.js");
const AddonManager = __webpack_require__(/*! ../addon-manager */ "./src/addon-manager.js");
const Things = __webpack_require__(/*! ../models/things */ "./src/models/things.js");

const ActionsController = PromiseRouter({mergeParams: true});

/**
 * Handle creating a new action.
 */
ActionsController.post('/', async (request, response) => {
  const keys = Object.keys(request.body);
  if (keys.length != 1) {
    const err = 'Incorrect number of parameters.';
    console.log(err, request.body);
    response.status(400).send(err);
    return;
  }

  const actionName = keys[0];

  if (!Object.prototype.hasOwnProperty.call(request.body[actionName],
                                            'input')) {
    response.status(400).send('Missing input');
    return;
  }

  const actionParams = request.body[actionName].input;
  const thingId = request.params.thingId;
  let action = null;

  if (thingId) {
    try {
      const thing = await Things.getThing(thingId);
      action = new Action(actionName, actionParams, thing);
    } catch (e) {
      console.error('Thing does not exist', thingId, e);
      response.status(404).send(e);
      return;
    }
  } else {
    action = new Action(actionName, actionParams);
  }

  try {
    if (thingId) {
      await AddonManager.requestAction(
        thingId, action.id, actionName, actionParams);
    }
    await Actions.add(action);

    response.status(201).json({[actionName]: action.getDescription()});
  } catch (e) {
    console.error('Creating action', actionName, 'failed');
    console.error(e);
    response.status(400).send(e);
  }
});

/**
 * Handle getting a list of actions.
 */
ActionsController.get('/', (request, response) => {
  if (request.params.thingId) {
    response.status(200).json(Actions.getByThing(request.params.thingId));
  } else {
    response.status(200).json(Actions.getGatewayActions());
  }
});

/**
 * Handle getting a list of actions.
 */
ActionsController.get('/:actionName', (request, response) => {
  const actionName = request.params.actionName;
  if (request.params.thingId) {
    response.status(200).json(Actions.getByThing(request.params.thingId,
                                                 actionName));
  } else {
    response.status(200).json(Actions.getGatewayActions(actionName));
  }
});

/**
 * Handle creating a new action.
 */
ActionsController.post('/:actionName', async (request, response) => {
  const actionName = request.params.actionName;

  const keys = Object.keys(request.body);
  if (keys.length != 1) {
    const err = 'Incorrect number of parameters.';
    console.log(err, request.body);
    response.status(400).send(err);
    return;
  }

  if (actionName !== keys[0]) {
    const err = `Action name must be ${actionName}`;
    console.log(err, request.body);
    response.status(400).send(err);
    return;
  }

  if (!Object.prototype.hasOwnProperty.call(request.body[actionName],
                                            'input')) {
    response.status(400).send('Missing input');
    return;
  }

  const actionParams = request.body[actionName].input;
  const thingId = request.params.thingId;
  let action = null;

  if (thingId) {
    try {
      const thing = await Things.getThing(thingId);
      action = new Action(actionName, actionParams, thing);
    } catch (e) {
      console.error('Thing does not exist', thingId, e);
      response.status(404).send(e);
      return;
    }
  } else {
    action = new Action(actionName, actionParams);
  }

  try {
    if (thingId) {
      await AddonManager.requestAction(
        thingId, action.id, actionName, actionParams);
    }
    await Actions.add(action);

    response.status(201).json({[actionName]: action.getDescription()});
  } catch (e) {
    console.error('Creating action', actionName, 'failed');
    console.error(e);
    response.status(400).send(e);
  }
});

/**
 * Handle getting a particular action.
 */
ActionsController.get('/:actionName/:actionId', (request, response) => {
  const actionId = request.params.actionId;
  const action = Actions.get(actionId);
  if (action) {
    response.status(200).json({[action.name]: action.getDescription()});
  } else {
    const error = `Action "${actionId}" not found`;
    console.error(error);
    response.status(404).send(error);
  }
});

/**
 * Handle cancelling an action.
 */
ActionsController.delete(
  '/:actionName/:actionId',
  async (request, response) => {
    const actionName = request.params.actionName;
    const actionId = request.params.actionId;
    const thingId = request.params.thingId;

    if (thingId) {
      try {
        await AddonManager.removeAction(thingId, actionId, actionName);
      } catch (e) {
        console.error('Removing action', actionId, 'failed');
        console.error(e);
        response.status(400).send(e);
        return;
      }
    }

    try {
      Actions.remove(actionId);
    } catch (e) {
      console.error('Removing action', actionId, 'failed');
      console.error(e);
      response.status(404).send(e);
      return;
    }

    response.sendStatus(204);
  });

module.exports = ActionsController;


/***/ }),

/***/ "./src/controllers/adapters_controller.js":
/*!************************************************!*\
  !*** ./src/controllers/adapters_controller.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Adapter Controller.
 *
 * Manages HTTP requests to /adapters.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const express = __webpack_require__(/*! express */ "express");
const addonManager = __webpack_require__(/*! ../addon-manager */ "./src/addon-manager.js");

const adaptersController = express.Router();

/**
 * Return a list of adapters
 */
adaptersController.get('/', (request, response) => {
  const adapters = addonManager.getAdapters();
  const adapterList = Array.from(adapters.values()).map((adapter) => {
    return adapter.asDict();
  });
  response.json(adapterList);
});

/**
 * Get a particular adapter.
 */
adaptersController.get('/:adapterId/', (request, response) => {
  const adapterId = request.params.adapterId;
  const adapter = addonManager.getAdapter(adapterId);
  if (adapter) {
    response.json(adapter.asDict());
  } else {
    response.status(404).send(`Adapter "${adapterId}" not found.`);
  }
});

module.exports = adaptersController;


/***/ }),

/***/ "./src/controllers/addons_controller.js":
/*!**********************************************!*\
  !*** ./src/controllers/addons_controller.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const PromiseRouter = __webpack_require__(/*! express-promise-router */ "express-promise-router");
const AddonManager = __webpack_require__(/*! ../addon-manager */ "./src/addon-manager.js");
const Settings = __webpack_require__(/*! ../models/settings */ "./src/models/settings.js");
const UserProfile = __webpack_require__(/*! ../user-profile */ "./src/user-profile.js");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");

const AddonsController = PromiseRouter();

AddonsController.get('/', async (request, response) => {
  response.status(200).json(Array.from(AddonManager.installedAddons.values()));
});

AddonsController.get('/:addonId/license', async (request, response) => {
  const addonId = request.params.addonId;
  const addonDir = path.join(UserProfile.addonsDir, addonId);

  fs.readdir(addonDir, (err, files) => {
    if (err) {
      response.status(404).send(err);
      return;
    }

    const licenses = files.filter((f) => {
      return /^LICENSE(\..*)?$/.test(f) &&
        fs.lstatSync(path.join(addonDir, f)).isFile();
    });

    if (licenses.length === 0) {
      response.status(404).send('License not found');
      return;
    }

    fs.readFile(
      path.join(addonDir, licenses[0]),
      {encoding: 'utf8'},
      (err, data) => {
        if (err) {
          response.status(404).send(err);
          return;
        }

        response.status(200).type('text/plain').send(data);
      }
    );
  });
});

AddonsController.put('/:addonId', async (request, response) => {
  const addonId = request.params.addonId;

  if (!request.body || !request.body.hasOwnProperty('enabled')) {
    response.status(400).send('Enabled property not defined');
    return;
  }

  const enabled = request.body.enabled;

  try {
    if (enabled) {
      await AddonManager.enableAddon(addonId);
    } else {
      await AddonManager.disableAddon(addonId, true);
    }

    response.status(200).json({enabled});
  } catch (e) {
    console.error(`Failed to toggle add-on ${addonId}`);
    console.error(e);
    response.status(400).send(e);
  }
});

AddonsController.get('/:addonId/config', async (request, response) => {
  const addonId = request.params.addonId;
  const key = `addons.config.${addonId}`;

  try {
    const config = await Settings.get(key);
    response.status(200).json(config || {});
  } catch (e) {
    console.error(`Failed to get config for add-on ${addonId}`);
    console.error(e);
    response.status(400).send(e);
  }
});

AddonsController.put('/:addonId/config', async (request, response) => {
  const addonId = request.params.addonId;

  if (!request.body || !request.body.hasOwnProperty('config')) {
    response.status(400).send('Config property not defined');
    return;
  }

  const config = request.body.config;
  const key = `addons.config.${addonId}`;

  try {
    await Settings.set(key, config);
  } catch (e) {
    console.error(`Failed to set config for add-on ${addonId}`);
    console.error(e);
    response.status(400).send(e);
    return;
  }

  try {
    await AddonManager.unloadAddon(addonId, true);

    if (await AddonManager.addonEnabled(addonId)) {
      await AddonManager.loadAddon(addonId);
    }

    response.status(200).json({config});
  } catch (e) {
    console.error(`Failed to restart add-on ${addonId}`);
    console.error(e);
    response.status(400).send(e);
  }
});

AddonsController.post('/', async (request, response) => {
  if (!request.body ||
      !request.body.hasOwnProperty('id') ||
      !request.body.hasOwnProperty('url') ||
      !request.body.hasOwnProperty('checksum')) {
    response.status(400).send('Missing required parameter(s).');
    return;
  }

  const id = request.body.id;
  const url = request.body.url;
  const checksum = request.body.checksum;

  try {
    await AddonManager.installAddonFromUrl(id, url, checksum, true);
    const key = `addons.${id}`;
    const obj = await Settings.get(key);
    response.status(200).json(obj);
  } catch (e) {
    response.status(400).send(e);
  }
});

AddonsController.patch('/:addonId', async (request, response) => {
  const id = request.params.addonId;

  if (!request.body ||
      !request.body.hasOwnProperty('url') ||
      !request.body.hasOwnProperty('checksum')) {
    response.status(400).send('Missing required parameter(s).');
    return;
  }

  const url = request.body.url;
  const checksum = request.body.checksum;

  try {
    await AddonManager.installAddonFromUrl(id, url, checksum, false);
    const key = `addons.${id}`;
    const obj = await Settings.get(key);
    response.status(200).json(obj);
  } catch (e) {
    console.error(`Failed to update add-on: ${id}\n${e}`);
    response.status(400).send(e);
  }
});

AddonsController.delete('/:addonId', async (request, response) => {
  const addonId = request.params.addonId;

  try {
    await AddonManager.uninstallAddon(addonId, false, true);
    response.sendStatus(204);
  } catch (e) {
    console.error(`Failed to uninstall add-on: ${addonId}\n${e}`);
    response.status(400).send(e);
  }
});

module.exports = AddonsController;


/***/ }),

/***/ "./src/controllers/debug_controller.js":
/*!*********************************************!*\
  !*** ./src/controllers/debug_controller.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Debug Controller.
 *
 * Manages HTTP requests to /debug/adapters.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Constants = __webpack_require__(/*! ../constants */ "./src/constants.js");
const express = __webpack_require__(/*! express */ "express");
const addonManager = __webpack_require__(/*! ../addon-manager */ "./src/addon-manager.js");

const debugController = express.Router();

addonManager.on(Constants.ADAPTER_ADDED, (adapter) => {
  console.log('debug: Got:', Constants.ADAPTER_ADDED,
              'notification for', adapter.id, adapter.name);
});

addonManager.on(Constants.THING_ADDED, (thing) => {
  console.log('debug: Got:', Constants.THING_ADDED,
              'notification for', thing.title);
});

addonManager.on(Constants.THING_REMOVED, (thing) => {
  console.log('debug: Got:', Constants.THING_REMOVED,
              'notification for', thing.title);
});

addonManager.on(Constants.PROPERTY_CHANGED, (property) => {
  console.log('debug: Got:', Constants.PROPERTY_CHANGED,
              'notification for:', property.device.title,
              'property:', property.name,
              'value:', property.value);
});

addonManager.on(Constants.PAIRING_TIMEOUT, () => {
  console.log('debug: Got:', Constants.PAIRING_TIMEOUT,
              'notification');
});

/**
 * List all known adapters
 */
debugController.get('/adapters', (request, response) => {
  const adapters = addonManager.getAdapters();
  response.status(200).json(Array.from(adapters.values()).map((adapter) => {
    return adapter.asDict();
  }));
});

/**
 * Add a new device
 */
debugController.get('/addNewThing', (request, response) => {
  addonManager.addNewThing(60).then(() => {
    console.log('debugController: addNewThing added thing');
  }, () => {
    console.log('debugController: addNewThing cancelled');
  });
  response.sendStatus(204);
});

/**
 * Cancel adding a new device
 */
debugController.get('/cancelAddNewThing', (request, response) => {
  addonManager.cancelAddNewThing();
  response.sendStatus(204);
});

/**
 * Cancel removing a device;
 */
debugController.get('/cancelRemoveThing/:thingId', (request, response) => {
  const thingId = request.params.thingId;
  addonManager.cancelRemoveThing(thingId);
  response.sendStatus(204);
});

/**
 * Get a list of devices ids registered with the add-on manager.
 */
debugController.get('/deviceIds', (request, response) => {
  const devices = addonManager.getDevices();
  const deviceList = [];
  for (const deviceId in devices) {
    const device = addonManager.devices[deviceId];
    deviceList.push(device.id);
  }
  response.status(200).json(deviceList);
});

/**
 * Get a list of the devices registered with the add-on manager.
 */
debugController.get('/devices', (request, response) => {
  const devices = addonManager.getDevices();
  const deviceList = [];
  for (const deviceId in devices) {
    const device = addonManager.devices[deviceId];
    deviceList.push(device.asDict());
  }
  response.status(200).json(deviceList);
});

/**
 * Get a particular device registered with the add-on manager.
 */
debugController.get('/device/:deviceId', (request, response) => {
  const deviceId = request.params.deviceId;
  const device = addonManager.getDevice(deviceId);
  if (device) {
    response.status(200).json(device.asDict());
  } else {
    response.status(404).send(`Device "${deviceId}" not found.`);
  }
});

/**
 * Gets an property from a device.
 */
debugController.get('/device/:deviceId/:propertyName', (request, response) => {
  const deviceId = request.params.deviceId;
  const propertyName = request.params.propertyName;
  const device = addonManager.getDevice(deviceId);
  if (device) {
    device.getProperty(propertyName).then((value) => {
      const valueDict = {};
      valueDict[propertyName] = value;
      response.status(200).json(valueDict);
    }).catch((error) => {
      console.log(`Device "${deviceId}"`);
      console.log(error);
      response.status(404).send(`Device "${deviceId}${error}`);
    });
  } else {
    response.status(404).send(`Device "${deviceId}" not found.`);
  }
});

/**
 * Sends a debug command to a particular device.
 */
debugController.put('/device/:deviceId/cmd/:cmd', (request, response) => {
  const deviceId = request.params.deviceId;
  const device = addonManager.getDevice(deviceId);
  if (device) {
    device.debugCmd(request.params.cmd, request.body);
    response.status(200).json(request.body);
  } else {
    response.status(404).send(`Device "${deviceId}" not found.`);
  }
});

/**
 * Sets an property associated with a device.
 */
debugController.put('/device/:deviceId/:propertyName', (request, response) => {
  const deviceId = request.params.deviceId;
  const propertyName = request.params.propertyName;
  const device = addonManager.getDevice(deviceId);
  if (device) {
    const propertyValue = request.body[propertyName];
    if (typeof propertyValue !== 'undefined') {
      device.setProperty(propertyName, propertyValue).then((updatedValue) => {
        const valueDict = {};
        valueDict[propertyName] = updatedValue;
        response.status(200).json(valueDict);
      }).catch((error) => {
        console.log(`Device "${deviceId}"`);
        console.log(error);
        response.status(404).send(`Device "${deviceId}" ${error}`);
      });
    } else {
      response.status(404).send(`Device "${deviceId
      }" property "${propertyName
      }" not found in request.`);
    }
  } else {
    response.status(404).send(`Device "${deviceId}" not found.`);
  }
});

/**
 * Get a list of plugins
 */
debugController.get('/plugins', (request, response) => {
  const plugins = Array.from(addonManager.pluginServer.plugins.values());
  response.status(200).json(plugins.map((plugin) => {
    return plugin.asDict();
  }));
});

/**
 * Get a list of the things registered with the add-on manager.
 */
debugController.get('/things', (request, response) => {
  response.status(200).json(addonManager.getThings());
});

/**
 * Get a particular thing registered with the add-on manager.
 */
debugController.get('/thing/:thingId', (request, response) => {
  const thingId = request.params.thingId;
  const thing = addonManager.getThing(thingId);
  if (thing) {
    response.status(200).json(thing);
  } else {
    response.status(404).send(`Thing "${thingId}" not found.`);
  }
});

/**
 * Gets a property associated with a thing.
 */
debugController.get('/thing/:thingId/:propertyName', (request, response) => {
  const thingId = request.params.thingId;
  const propertyName = request.params.propertyName;
  const thing = addonManager.getThing(thingId);
  if (thing) {
    addonManager.getProperty(thing.id, propertyName).then((value) => {
      const valueDict = {};
      valueDict[propertyName] = value;
      response.status(200).json(valueDict);
    }).catch((error) => {
      response.status(404).send(`Thing "${thingId} ${error}`);
    });
  } else {
    response.status(404).send(`Thing "${thingId}" not found.`);
  }
});

/**
 * Sets a property associated with a thing.
 */
debugController.put('/thing/:thingId/:propertyName', (request, response) => {
  const thingId = request.params.thingId;
  const propertyName = request.params.propertyName;
  const thing = addonManager.getThing(thingId);
  if (thing) {
    const propertyValue = request.body[propertyName];
    if (typeof propertyValue !== 'undefined') {
      addonManager.setProperty(propertyName, propertyValue).then((value) => {
        const valueDict = {};
        valueDict[propertyName] = value;
        response.status(200).json(valueDict);
      }).catch((error) => {
        console.log(`Thing "${thingId}`);
        console.log(error);
        response.status(404).send(`Thing "${thingId} ${error}`);
      });
    } else {
      response.status(404).send(`Thing "${thingId
      }" property "${propertyName
      }" not found in request.`);
    }
  } else {
    response.status(404).send(`Thing "${thingId}" not found.`);
  }
});

/**
 * Remove an existing Thing.
 */
debugController.get('/removeThing/:thingId', (request, response) => {
  const thingId = request.params.thingId;
  addonManager.removeThing(thingId).then((thingIdRemoved) => {
    console.log('debugController: removed', thingIdRemoved);
    if (thingId != thingIdRemoved) {
      console.log('debugController: Actually removed', thingIdRemoved,
                  'even though request was for:', thingId);
    }
    response.status(200).json({removed: thingIdRemoved});
  }, (str) => {
    console.log('debugController: remove failed:', str);
    response.status(500).send(`remove of ${thingId} failed: ${str}`);
  });
});

/**
 * Unload add-ons
 */
debugController.get('/unloadAddons', (request, response) => {
  console.log('debugController: Unloading Add-ons');
  addonManager.unloadAddons();
  response.status(200).send('');
});

module.exports = debugController;


/***/ }),

/***/ "./src/controllers/events_controller.js":
/*!**********************************************!*\
  !*** ./src/controllers/events_controller.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Events Controller.
 *
 * Manages the top level events queue for the gateway and things.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const express = __webpack_require__(/*! express */ "express");
const Events = __webpack_require__(/*! ../models/events */ "./src/models/events.js");

const EventsController = express.Router({mergeParams: true});

/**
 * Handle getting a list of events.
 */
EventsController.get('/', (request, response) => {
  if (request.params.thingId) {
    response.status(200).json(Events.getByThing(request.params.thingId));
  } else {
    response.status(200).json(Events.getGatewayEvents());
  }
});

/**
 * Handle getting a list of events.
 */
EventsController.get('/:eventName', (request, response) => {
  const eventName = request.params.eventName;

  if (request.params.thingId) {
    response.status(200).json(Events.getByThing(request.params.thingId,
                                                eventName));
  } else {
    response.status(200).json(Events.getGatewayEvents(eventName));
  }
});

module.exports = EventsController;


/***/ }),

/***/ "./src/controllers/extensions_controller.js":
/*!**************************************************!*\
  !*** ./src/controllers/extensions_controller.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const AddonManager = __webpack_require__(/*! ../addon-manager */ "./src/addon-manager.js");
const {APIRequest} = __webpack_require__(/*! gateway-addon */ "gateway-addon");
const UserProfile = __webpack_require__(/*! ../user-profile */ "./src/user-profile.js");
const express = __webpack_require__(/*! express */ "express");
const fs = __webpack_require__(/*! fs */ "fs");
const globToRegExp = __webpack_require__(/*! glob-to-regexp */ "glob-to-regexp");
const jwtMiddleware = __webpack_require__(/*! ../jwt-middleware */ "./src/jwt-middleware.js");
const path = __webpack_require__(/*! path */ "path");

const auth = jwtMiddleware.middleware();
const ExtensionsController = express.Router();

ExtensionsController.get('/', auth, (request, response) => {
  const map = {};
  for (const [key, value] of Object.entries(AddonManager.getExtensions())) {
    map[key] = value.extensions;
  }
  response.status(200).json(map);
});

/**
 * Extension API handler.
 */
ExtensionsController.all(
  '/:extensionId/api/*',
  auth,
  async (request, response) => {
    const extensionId = request.params.extensionId;
    const apiHandler = AddonManager.getAPIHandler(extensionId);
    if (!apiHandler) {
      response.status(404).send(`Extension "${extensionId}" not found.`);
      return;
    }

    const req = new APIRequest({
      method: request.method,
      path: `/${request.path.split('/').slice(3).join('/')}`,
      query: request.query || {},
      body: request.body || {},
    });

    try {
      const rsp = await apiHandler.handleRequest(req);
      response.status(rsp.status);

      if (rsp.contentType && rsp.content !== null) {
        response.type(rsp.contentType);
        response.send(rsp.content);
      } else {
        response.end();
      }
    } catch (e) {
      console.error('Error calling API handler:', e);
      response.status(500).send(e);
    }
  }
);

/**
 * Static resource handler for extensions. This is intentionally
 * unauthenticated, since we're just loading static content.
 */
ExtensionsController.get('/:extensionId/*', (request, response) => {
  const extensionId = request.params.extensionId;
  const relPath = request.path.split('/').slice(2).join('/');

  // make sure the extension is installed and enabled
  const extensions = AddonManager.getExtensions();
  if (!extensions.hasOwnProperty(extensionId)) {
    response.status(404).send();
    return;
  }

  // make sure the requested resource is listed in the extension's
  // web_accessible_resources array
  let matched = false;
  const resources = extensions[extensionId].resources;
  for (let resource of resources) {
    resource = globToRegExp(resource);
    if (resource.test(relPath)) {
      matched = true;
      break;
    }
  }

  if (!matched) {
    response.status(404).send();
    return;
  }

  // make sure the file actually exists
  const fullPath = path.join(UserProfile.addonsDir, extensionId, relPath);
  if (!fs.existsSync(fullPath)) {
    response.status(404).send();
    return;
  }

  // finally, send the file
  response.sendFile(fullPath);
});

module.exports = ExtensionsController;


/***/ }),

/***/ "./src/controllers/internal_logs_controller.js":
/*!*****************************************************!*\
  !*** ./src/controllers/internal_logs_controller.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Internal logs Controller.
 *
 * Allows user to download current set of internal log files.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const archiver = __webpack_require__(/*! archiver */ "archiver");
const express = __webpack_require__(/*! express */ "express");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const PromiseRouter = __webpack_require__(/*! express-promise-router */ "express-promise-router");
const WebSocket = __webpack_require__(/*! ws */ "ws");

const AddonManager = __webpack_require__(/*! ../addon-manager */ "./src/addon-manager.js");
const Constants = __webpack_require__(/*! ../constants */ "./src/constants.js");
const jwtMiddleware = __webpack_require__(/*! ../jwt-middleware */ "./src/jwt-middleware.js");
const UserProfile = __webpack_require__(/*! ../user-profile */ "./src/user-profile.js");
const Utils = __webpack_require__(/*! ../utils */ "./src/utils.js");

const InternalLogsController = PromiseRouter();

/**
 * Generate an index of log files.
 */
InternalLogsController.get('/', async (request, response) => {
  const jwt = jwtMiddleware.extractJWTHeader(request) ||
    jwtMiddleware.extractJWTQS(request);
  const files = fs.readdirSync(UserProfile.logDir)
    .filter((f) => !f.startsWith('.') && f !== 'logs.sqlite3');
  files.sort();

  let content =
    '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
    '<meta charset="utf-8">' +
    '<title>Logs - WebThings Gateway</title>' +
    '</head>' +
    '<body>' +
    '<ul>';

  for (const name of files) {
    if (fs.lstatSync(path.join(UserProfile.logDir, name)).isFile()) {
      content +=
        `${'<li>' +
        `<a href="${Constants.INTERNAL_LOGS_PATH}/files/${encodeURIComponent(name)}?jwt=${jwt}">`}${
          Utils.escapeHtml(name)
        }</a>` +
        `</li>`;
    }
  }

  content +=
    '</ul>' +
    '</body>' +
    '</html>';

  response.send(content);
});

/**
 * Static handler for log files.
 */
InternalLogsController.use(
  '/files',
  express.static(
    UserProfile.logDir,
    {
      setHeaders: (res, filepath) => {
        const base = path.basename(filepath);
        if (base.startsWith('run-app.log')) {
          res.set('Content-Type', 'text/plain');
        }
      },
    }
  )
);

/**
 * Handle request for logs.zip.
 */
InternalLogsController.get('/zip', async (request, response) => {
  const archive = archiver('zip');

  archive.on('error', (err) => {
    response.status(500).send(err.message);
  });

  response.attachment('logs.zip');

  archive.pipe(response);
  fs.readdirSync(
    UserProfile.logDir
  ).map((f) => {
    const fullPath = path.join(UserProfile.logDir, f);
    if (!f.startsWith('.') && fs.lstatSync(fullPath).isFile() &&
        f !== 'logs.sqlite3') {
      archive.file(fullPath, {name: path.join('logs', f)});
    }
  });
  archive.finalize();
});

InternalLogsController.ws('/', (websocket) => {
  if (websocket.readyState !== WebSocket.OPEN) {
    return;
  }

  const heartbeat = setInterval(() => {
    try {
      websocket.ping();
    } catch (e) {
      websocket.terminate();
    }
  }, 30 * 1000);

  function onLog(message) {
    websocket.send(JSON.stringify(message), (err) => {
      if (err) {
        console.error('WebSocket sendMessage failed:', err);
      }
    });
  }

  AddonManager.pluginServer.on('log', onLog);

  const cleanup = () => {
    AddonManager.pluginServer.removeListener('log', onLog);
    clearInterval(heartbeat);
  };

  websocket.on('error', cleanup);
  websocket.on('close', cleanup);
});

module.exports = InternalLogsController;


/***/ }),

/***/ "./src/controllers/log_out_controller.js":
/*!***********************************************!*\
  !*** ./src/controllers/log_out_controller.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * LogOut Controller.
 *
 * Handles logging out the user.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Router = __webpack_require__(/*! express-promise-router */ "express-promise-router");

const JSONWebToken = __webpack_require__(/*! ../models/jsonwebtoken */ "./src/models/jsonwebtoken.js");

const LogOutController = new Router();

/**
 * Log out the user
 */
LogOutController.post('/', async (request, response) => {
  const {jwt} = request;
  await JSONWebToken.revokeToken(jwt.keyId);
  response.status(200).json({});
});

module.exports = LogOutController;


/***/ }),

/***/ "./src/controllers/login_controller.js":
/*!*********************************************!*\
  !*** ./src/controllers/login_controller.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Login Controller.
 *
 * Handles user login.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const path = __webpack_require__(/*! path */ "path");

const Router = __webpack_require__(/*! express-promise-router */ "express-promise-router");
const Users = __webpack_require__(/*! ../models/users */ "./src/models/users.js");
const JSONWebToken = __webpack_require__(/*! ../models/jsonwebtoken */ "./src/models/jsonwebtoken.js");
const Passwords = __webpack_require__(/*! ../passwords */ "./src/passwords.js");
const Constants = __webpack_require__(/*! ../constants */ "./src/constants.js");
const rateLimit = __webpack_require__(/*! express-rate-limit */ "express-rate-limit");

const LoginController = Router();

const loginRoot = path.join(Constants.BUILD_STATIC_PATH, 'login');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // 10 failed requests per windowMs
  skipSuccessfulRequests: true,
});

/**
 * Serve the static login page
 */
LoginController.get('/', async (request, response) => {
  response.sendFile('index.html', {root: loginRoot});
});

/**
 * Handle login request.
 */
LoginController.post('/', limiter, async (request, response) => {
  const {body} = request;
  if (!body || !body.email || !body.password) {
    response.status(400).send('User requires email and password');
    return;
  }

  const user = await Users.getUser(body.email.toLowerCase());
  if (!user) {
    response.sendStatus(401);
    return;
  }

  const passwordMatch = await Passwords.compare(
    body.password,
    user.password
  );

  if (!passwordMatch) {
    response.sendStatus(401);
    return;
  }

  if (user.mfaEnrolled) {
    if (!body.mfa) {
      response.status(401).json({mfaRequired: true});
      return;
    }

    if (!Passwords.verifyMfaToken(user.mfaSharedSecret, body.mfa)) {
      let backupMatch = false;

      if (body.mfa.totp.length === 12) {
        let index = 0;
        for (const backup of user.mfaBackupCodes) {
          backupMatch = await Passwords.compare(body.mfa.totp, backup);
          if (backupMatch) {
            break;
          }

          ++index;
        }

        if (backupMatch) {
          user.mfaBackupCodes.splice(index, 1);
          await Users.editUser(user);
        }
      }

      if (!backupMatch) {
        response.status(401).json({mfaRequired: true});
        return;
      }
    }
  }

  // Issue a new JWT for this user.
  const jwt = await JSONWebToken.issueToken(user.id);
  limiter.resetKey(request.ip);
  response.status(200).json({jwt});
});

module.exports = LoginController;


/***/ }),

/***/ "./src/controllers/logs_controller.js":
/*!********************************************!*\
  !*** ./src/controllers/logs_controller.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Logs Controller.
 *
 * Manages HTTP requests to /logs.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const PromiseRouter = __webpack_require__(/*! express-promise-router */ "express-promise-router");
const WebSocket = __webpack_require__(/*! ws */ "ws");

const Constants = __webpack_require__(/*! ../constants */ "./src/constants.js");
const Logs = __webpack_require__(/*! ../models/logs */ "./src/models/logs.js");

const LogsController = PromiseRouter();

/**
 * Get a list of all currently logged properties
 */
LogsController.get('/.schema', async (request, response) => {
  const schema = await Logs.getSchema();
  response.status(200).json(schema);
});

/**
 * Register a new metric
 */
LogsController.post('/', async (request, response) => {
  const descr = request.body.descr;
  const maxAge = request.body.maxAge;
  if (!descr || typeof maxAge !== 'number') {
    response.status(400).send('Invalid descr or maxAge property');
    return;
  }
  let normalizedDescr = '';
  switch (descr.type) {
    case 'property':
      normalizedDescr = Logs.propertyDescr(descr.thing, descr.property);
      break;
    case 'action':
      normalizedDescr = Logs.actionDescr(descr.thing, descr.action);
      break;
    case 'event':
      normalizedDescr = Logs.eventDescr(descr.thing, descr.event);
      break;
    default:
      response.status(400).send('Invalid descr type');
      return;
  }

  try {
    const id = await Logs.registerMetric(normalizedDescr, maxAge);
    if (typeof id === 'undefined') {
      response.status(400).send('Log already exists');
      return;
    }
    response.status(200).send({
      descr: normalizedDescr,
    });
  } catch (e) {
    console.error('Failed to register log:', e);
    response.status(500).send(`Error registering: ${e.message}`);
  }
});

/**
 * Get all the values of the currently logged properties
 */
LogsController.get('/', async (request, response) => {
  // if (request.jwt.payload.role !== Constants.USER_TOKEN) {
  //   if (!request.jwt.payload.scope) {
  //     response.status(400).send('Token must contain scope');
  //   } else {
  //     const scope = request.jwt.payload.scope;
  //     if (scope.indexOf(' ') === -1 && scope.indexOf('/') == 0 &&
  //       scope.split('/').length == 2 &&
  //       scope.split(':')[0] === Constants.THINGS_PATH) {
  //       Things.getThingDescriptions(request.get('Host'), request.secure)
  //         .then((things) => {
  //           response.status(200).json(things);
  //         });
  //     } else {
  //       // Get hrefs of things in scope
  //       const paths = scope.split(' ');
  //       const hrefs = new Array(0);
  //       for (const path of paths) {
  //         const parts = path.split(':');
  //         hrefs.push(parts[0]);
  //       }
  //       Things.getListThingDescriptions(hrefs,
  //                                       request.get('Host'),
  //                                       request.secure)
  //         .then((things) => {
  //           response.status(200).json(things);
  //         });
  //     }
  //   }
  // } else
  try {
    const logs = await Logs.getAll(request.query.start, request.query.end);
    response.status(200).json(logs);
  } catch (e) {
    console.error('Failed to get logs:', e);
    response.status(500).send(`Internal error: ${e}`);
  }
});

/**
 * Get a historical list of the values of all a Thing's properties
 */
LogsController.get(`${Constants.THINGS_PATH}/:thingId`, async (request, response) => {
  const id = request.params.thingId;
  try {
    const logs = await Logs.get(id, request.query.start, request.query.end);
    response.status(200).json(logs);
  } catch (error) {
    console.error(`Error getting logs for thing with id ${id}`);
    console.error(`Error: ${error}`);
    response.status(404).send(error);
  }
});

const missingPropertyPath =
  `${Constants.THINGS_PATH}/:thingId${Constants.PROPERTIES_PATH}`;
const singlePropertyPath =
  `${Constants.THINGS_PATH}/:thingId${Constants.PROPERTIES_PATH}/:propertyName`;

/**
 * Get a historical list of the values of a Thing's property
 */
LogsController.get(
  [missingPropertyPath, singlePropertyPath],
  async (request, response) => {
    const thingId = request.params.thingId;
    const propertyName = request.params.propertyName || '';
    try {
      const values = await Logs.getProperty(thingId, propertyName,
                                            request.query.start,
                                            request.query.end);
      response.status(200).json(values || []);
    } catch (err) {
      response.status(404).send(err);
    }
  }
);

LogsController.delete(
  [missingPropertyPath, singlePropertyPath],
  async (request, response) => {
    const thingId = request.params.thingId;
    const propertyName = request.params.propertyName || '';
    const normalizedDescr = Logs.propertyDescr(thingId, propertyName);

    try {
      await Logs.unregisterMetric(normalizedDescr);
      response.status(200).send({
        descr: normalizedDescr,
      });
    } catch (e) {
      console.error('Failed to delete log:', e);
      response.status(500).send(`Internal error: ${e}`);
    }
  }
);

LogsController.ws('/', (websocket) => {
  if (websocket.readyState !== WebSocket.OPEN) {
    return;
  }

  const heartbeat = setInterval(() => {
    try {
      websocket.ping();
    } catch (e) {
      websocket.terminate();
    }
  }, 30 * 1000);

  function streamMetric(metrics) {
    if (!metrics || metrics.length === 0) {
      return;
    }
    try {
      websocket.send(JSON.stringify(metrics), (_err) => {});
    } catch (_e) {
      // Just don't let it crash anything
    }
  }

  const cleanup = () => {
    clearInterval(heartbeat);
  };

  Logs.streamAll(streamMetric).then(() => {
    cleanup();
    // Eventually send dynamic property value updates for the graphs to update
    // in real time
    websocket.close();
  });

  websocket.on('error', cleanup);
  websocket.on('close', cleanup);
});
module.exports = LogsController;


/***/ }),

/***/ "./src/controllers/new_things_controller.js":
/*!**************************************************!*\
  !*** ./src/controllers/new_things_controller.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * New Things Controller.
 *
 * /new_things returns a list of Things connected/paired with the gateway which
 * haven't yet been added to the gateway database.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const PromiseRouter = __webpack_require__(/*! express-promise-router */ "express-promise-router");
const fetch = __webpack_require__(/*! node-fetch */ "node-fetch");
const WebSocket = __webpack_require__(/*! ws */ "ws");
const Things = __webpack_require__(/*! ../models/things */ "./src/models/things.js");

const NewThingsController = PromiseRouter();

/**
 * Handle GET requests to /new_things
 */
NewThingsController.get('/', (request, response) => {
  Things.getNewThings().then((newThings) => {
    response.json(newThings);
  }).catch((error) => {
    console.error(`Error getting a list of new things from adapters ${error}`);
    response.status(500).send(error);
  });
});

/**
 * Handle a WebSocket request on /new_things
 */
NewThingsController.ws('/', (websocket) => {
  // Since the Gateway have the asynchronous express middlewares, there is a
  // possibility that the WebSocket have been closed.
  if (websocket.readyState !== WebSocket.OPEN) {
    return;
  }
  console.log('Opened a new things socket');
  // Register the WebSocket with the Things model so new devices can be pushed
  // to the client as they are added.
  Things.registerWebsocket(websocket);
  // Send a list of things the adapter manager already knows about
  Things.getNewThings().then(function(newThings) {
    newThings.forEach((newThing) => {
      websocket.send(JSON.stringify(newThing));
    }, this);
  }).catch((error) => {
    console.error(`Error getting a list of new things from adapters ${error}`);
  });
});

/**
 * Handle POST requests to /new_things
 */
NewThingsController.post('/', async (request, response) => {
  if (!request.body || !request.body.hasOwnProperty('url')) {
    response.status(400).send('No URL in thing description');
    return;
  }

  const url = request.body.url;
  try {
    const res = await fetch(url, {headers: {Accept: 'application/json'}});

    if (!res.ok) {
      response.status(400).send('Web thing not found');
      return;
    }

    const description = await res.json();

    // Verify some high level thing description properties.
    if ((description.hasOwnProperty('title') ||
         description.hasOwnProperty('name')) &&  // backwards compat
        (description.hasOwnProperty('properties') ||
         description.hasOwnProperty('actions') ||
         description.hasOwnProperty('events'))) {
      response.json(description);
    } else if (Array.isArray(description)) {
      response.status(400).send('Web things must be added individually');
    } else {
      response.status(400).send('Invalid thing description');
    }
  } catch (e) {
    response.status(400).send('Web thing not found');
  }
});

module.exports = NewThingsController;


/***/ }),

/***/ "./src/controllers/notifiers_controller.js":
/*!*************************************************!*\
  !*** ./src/controllers/notifiers_controller.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const AddonManager = __webpack_require__(/*! ../addon-manager */ "./src/addon-manager.js");
const {NotificationLevel} = __webpack_require__(/*! gateway-addon */ "gateway-addon").Constants;
const PromiseRouter = __webpack_require__(/*! express-promise-router */ "express-promise-router");

const NotifiersController = PromiseRouter();

/**
 * Helper function to cut down on unnecessary API round trips
 * @param {Notifier} notifier
 * @return {Object}
 */
function notifierAsDictWithOutlets(notifier) {
  const notifierDict = notifier.asDict();
  const outlets = notifier.getOutlets();
  notifierDict.outlets = Array.from(Object.values(outlets)).map((outlet) => {
    return outlet.asDict();
  });
  return notifierDict;
}

NotifiersController.get('/', async (request, response) => {
  const notifiers = AddonManager.getNotifiers();
  const notifierList = Array.from(notifiers.values())
    .map(notifierAsDictWithOutlets);
  response.status(200).json(notifierList);
});

NotifiersController.get('/:notifierId', async (request, response) => {
  const notifierId = request.params.notifierId;
  const notifier = AddonManager.getNotifier(notifierId);
  if (notifier) {
    response.status(200).send(notifierAsDictWithOutlets(notifier));
  } else {
    response.status(404).send(`Notifier "${notifierId}" not found.`);
  }
});

NotifiersController.get('/:notifierId/outlets', async (request, response) => {
  const notifierId = request.params.notifierId;
  const notifier = AddonManager.getNotifier(notifierId);
  if (!notifier) {
    response.status(404).send(`Notifier "${notifierId}" not found.`);
    return;
  }
  const outlets = notifier.getOutlets();
  const outletList = Array.from(Object.values(outlets)).map((outlet) => {
    return outlet.asDict();
  });
  response.status(200).json(outletList);
});

/**
 * Create a new notification with the title, message, and level contained in
 * the request body
 */
NotifiersController.post(`/:notifierId/outlets/:outletId/notification`, async (request, response) => {
  const notifierId = request.params.notifierId;
  const outletId = request.params.outletId;
  const notifier = AddonManager.getNotifier(notifierId);
  if (!notifier) {
    response.status(404).send(`Notifier "${notifierId}" not found.`);
    return;
  }
  const outlet = notifier.getOutlet(outletId);
  if (!outlet) {
    response.status(404).send(`Outlet "${outletId}" of notifier "${notifierId}" not found.`);
    return;
  }
  const {title, message, level} = request.body;
  if (typeof title !== 'string' || typeof message !== 'string') {
    response.status(400).send(`Title and message must be strings`);
    return;
  }
  const levels = Object.values(NotificationLevel);
  if (!levels.includes(level)) {
    response.status(400).send(`Level must be one of ${JSON.stringify(levels)}`);
    return;
  }
  try {
    await outlet.notify(title, message, level);
    response.status(201);
  } catch (e) {
    response.status(500).send(e);
  }
});

module.exports = NotifiersController;



/***/ }),

/***/ "./src/controllers/oauth_controller.ts":
/*!*********************************************!*\
  !*** ./src/controllers/oauth_controller.ts ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! url */ "url");
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(url__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _oauth_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../oauth-types */ "./src/oauth-types.ts");
/* harmony import */ var _models_oauthclients__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../models/oauthclients */ "./src/models/oauthclients.ts");
/* harmony import */ var _jwt_middleware__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../jwt-middleware */ "./src/jwt-middleware.js");
/* harmony import */ var _jwt_middleware__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_jwt_middleware__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../constants */ "./src/constants.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_constants__WEBPACK_IMPORTED_MODULE_5__);


const JSONWebToken = __webpack_require__(/*! ../models/jsonwebtoken */ "./src/models/jsonwebtoken.js");
const config = __webpack_require__(/*! config */ "config");




const auth = _jwt_middleware__WEBPACK_IMPORTED_MODULE_4__["middleware"]();
const OAuthController = express__WEBPACK_IMPORTED_MODULE_0__["Router"]();
function redirect(response, baseURL, params) {
    let url = new url__WEBPACK_IMPORTED_MODULE_1__["URL"](baseURL.toString());
    for (let key in params) {
        if (!params.hasOwnProperty(key)) {
            continue;
        }
        if (typeof params[key] !== 'undefined') {
            url.searchParams.set(key, params[key].toString());
        }
    }
    if (url.hostname === 'gateway.localhost') {
        response.redirect(url.toString().replace(/^https:\/\/gateway\.localhost/, ''));
        return;
    }
    response.redirect(url.toString());
}
function verifyClient(request, response) {
    let client = _models_oauthclients__WEBPACK_IMPORTED_MODULE_3__["default"].get(request.client_id, request.redirect_uri);
    if (!client) {
        let err = {
            error: 'unauthorized_client',
            error_description: 'client id unknown',
            state: request.state
        };
        response.status(400).json(err);
        return null;
    }
    if (!request.redirect_uri) {
        request.redirect_uri = client.redirect_uri;
    }
    if (request.redirect_uri.toString() !== client.redirect_uri.toString()) {
        let err = {
            error: 'invalid_request',
            error_description: 'mismatched redirect_uri',
            state: request.state
        };
        response.status(400).json(err);
        return null;
    }
    return client;
}
function extractClientInfo(request, response) {
    let authorization = request.headers.authorization;
    if (!authorization) {
        if (!request.body.client_id) {
            return;
        }
        return {
            clientId: request.body.client_id,
            clientSecret: request.body.client_secret,
        };
    }
    if (typeof authorization !== 'string' || !authorization.startsWith('Basic ')) {
        let err = {
            error: 'unauthorized_client',
            error_description: 'authorization header missing or malformed',
        };
        response.status(400).json(err);
        return;
    }
    let userPassB64 = authorization.substring('Basic '.length);
    let userPass = Buffer.from(userPassB64, 'base64').toString();
    let parts = userPass.split(':');
    if (parts.length !== 2) {
        let err = {
            error: 'unauthorized_client',
            error_description: 'authorization header missing or malformed',
        };
        response.status(400).json(err);
        return;
    }
    return {
        clientId: decodeURIComponent(parts[0].replace(/\+/g, '%20')),
        clientSecret: decodeURIComponent(parts[1].replace(/\+/g, '%20')),
    };
}
function verifyAuthorizationRequest(authRequest, response) {
    let client = verifyClient(authRequest, response);
    if (!client) {
        return;
    }
    if (authRequest.response_type !== 'code') {
        let err = {
            error: 'unsupported_response_type',
            state: authRequest.state
        };
        redirect(response, client.redirect_uri, err);
        return;
    }
    if (!Object(_oauth_types__WEBPACK_IMPORTED_MODULE_2__["scopeValidSubset"])(client.scope, authRequest.scope)) {
        let err = {
            error: 'invalid_scope',
            error_description: 'client scope does not cover requested scope',
            state: authRequest.state
        };
        redirect(response, client.redirect_uri, err);
        return;
    }
    return client;
}
OAuthController.get('/authorize', async (request, response) => {
    let redirect_uri;
    if (request.query.redirect_uri) {
        redirect_uri = new url__WEBPACK_IMPORTED_MODULE_1__["URL"](`${request.query.redirect_uri}`);
    }
    let authRequest = {
        response_type: `${request.query.response_type}`,
        client_id: `${request.query.client_id}`,
        redirect_uri: redirect_uri,
        scope: `${request.query.scope}`,
        state: `${request.query.state}`
    };
    let client = verifyAuthorizationRequest(authRequest, response);
    if (!client) {
        return;
    }
    response.render('authorize', {
        name: client.name,
        domain: client.redirect_uri.host,
        request: authRequest
    });
});
OAuthController.get('/local-token-service', async (request, response) => {
    let localClient = _models_oauthclients__WEBPACK_IMPORTED_MODULE_3__["default"].get('local-token', undefined);
    let tokenRequest = {
        grant_type: 'authorization_code',
        code: `${request.query.code}`,
        redirect_uri: localClient.redirect_uri,
        client_id: localClient.id
    };
    request.body = tokenRequest;
    request.headers.authorization = 'Basic ' +
        Buffer.from(localClient.id + ':' + localClient.secret).toString('base64');
    let token = await handleAccessTokenRequest(request, response);
    if (token) {
        response.render('local-token-service', {
            oauthPostToken: config.get('oauthPostToken'),
            token: token.access_token
        });
    }
});
OAuthController.get('/allow', auth, async (request, response) => {
    let redirect_uri;
    if (request.query.redirect_uri) {
        redirect_uri = new url__WEBPACK_IMPORTED_MODULE_1__["URL"](`${request.query.redirect_uri}`);
    }
    let authRequest = {
        response_type: `${request.query.response_type}`,
        client_id: `${request.query.client_id}`,
        redirect_uri: redirect_uri,
        scope: `${request.query.scope}`,
        state: `${request.query.state}`
    };
    let client = verifyAuthorizationRequest(authRequest, response);
    if (!client) {
        return;
    }
    let jwt = request.jwt;
    if (!jwt) {
        return;
    }
    if (!jwt.payload || jwt.payload.role !== 'user_token') {
        response.status(401).send('Authorization must come from user');
        return;
    }
    let code = await JSONWebToken.issueOAuthToken(client, jwt.user, {
        role: 'authorization_code',
        scope: authRequest.scope
    });
    let success = {
        code: code,
        state: authRequest.state
    };
    redirect(response, client.redirect_uri, success);
});
OAuthController.post('/token', async (request, response) => {
    const requestData = request.body;
    if (requestData.grant_type === 'authorization_code') {
        let token = await handleAccessTokenRequest(request, response);
        if (token) {
            response.json(token);
        }
        return;
    }
    let err = {
        error: 'unsupported_grant_type',
        state: requestData.state
    };
    response.status(400).json(err);
});
async function handleAccessTokenRequest(request, response) {
    const requestData = request.body;
    let reqClientInfo = extractClientInfo(request, response);
    if (!reqClientInfo) {
        let err = {
            error: 'unauthorized_client',
            error_description: 'client info missing or malformed',
        };
        response.status(400).json(err);
        return;
    }
    let tokenRequest = {
        grant_type: requestData.grant_type,
        code: requestData.code,
        redirect_uri: requestData.redirect_uri && new url__WEBPACK_IMPORTED_MODULE_1__["URL"](requestData.redirect_uri),
        client_id: reqClientInfo.clientId,
    };
    let client = verifyClient(tokenRequest, response);
    if (!client) {
        return;
    }
    if (client.id !== reqClientInfo.clientId ||
        client.secret !== reqClientInfo.clientSecret) {
        let err = {
            error: 'unauthorized_client',
            error_description: 'client info mismatch',
        };
        response.status(400).json(err);
        return;
    }
    let tokenData = await JSONWebToken.verifyJWT(tokenRequest.code);
    if (!tokenData) {
        let err = {
            error: 'invalid_grant',
            error_description: 'included JWT is invalid',
            state: request.body.state
        };
        response.status(400).json(err);
        return;
    }
    let payload = tokenData.payload;
    if (!payload || payload.role !== 'authorization_code' || payload.client_id !== client.id) {
        let err = {
            error: 'invalid_grant',
            state: request.body.state
        };
        response.status(400).json(err);
        return;
    }
    let accessToken = await JSONWebToken.issueOAuthToken(client, tokenData.user, {
        role: _constants__WEBPACK_IMPORTED_MODULE_5__["ACCESS_TOKEN"],
        scope: tokenData.payload.scope
    });
    let res = {
        access_token: accessToken,
        token_type: 'bearer',
        scope: client.scope
    };
    return res;
}
/* harmony default export */ __webpack_exports__["default"] = (OAuthController);


/***/ }),

/***/ "./src/controllers/oauthclients_controller.ts":
/*!****************************************************!*\
  !*** ./src/controllers/oauthclients_controller.ts ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _models_oauthclients__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../models/oauthclients */ "./src/models/oauthclients.ts");

const PromiseRouter = __webpack_require__(/*! express-promise-router */ "express-promise-router");

const OAuthClientsController = PromiseRouter();
OAuthClientsController.get('/', async (request, response) => {
    let user = request.jwt.user;
    let clients = await _models_oauthclients__WEBPACK_IMPORTED_MODULE_0__["default"].getAuthorized(user);
    response.json(clients.map((client) => {
        return client.getDescription();
    }));
});
OAuthClientsController.delete('/:clientId', async (request, response) => {
    let clientId = request.params.clientId;
    if (!_models_oauthclients__WEBPACK_IMPORTED_MODULE_0__["default"].get(clientId, undefined)) {
        response.status(404).send('Client not found');
        return;
    }
    let user = request.jwt.user;
    await _models_oauthclients__WEBPACK_IMPORTED_MODULE_0__["default"].revokeClientAuthorization(user, clientId);
    response.sendStatus(204);
});
/* harmony default export */ __webpack_exports__["default"] = (OAuthClientsController);


/***/ }),

/***/ "./src/controllers/ping_controller.js":
/*!********************************************!*\
  !*** ./src/controllers/ping_controller.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Ping Controller.
 *
 * Handles requests to /ping, used for connectivity checks.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const express = __webpack_require__(/*! express */ "express");

const PingController = express.Router();

PingController.get('/', (request, response) => {
  response.sendStatus(204);
});

module.exports = PingController;


/***/ }),

/***/ "./src/controllers/proxy_controller.js":
/*!*********************************************!*\
  !*** ./src/controllers/proxy_controller.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Proxy Controller.
 *
 * Handles proxied resources.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const httpProxy = __webpack_require__(/*! http-proxy */ "http-proxy");
const Router = __webpack_require__(/*! express-promise-router */ "express-promise-router");

const ProxyController = new Router();

const proxies = new Map();
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
});

proxy.on('error', (e) => {
  console.debug('Proxy error:', e);
});

ProxyController.addProxyServer = (thingId, server) => {
  proxies.set(thingId, server);
};

ProxyController.removeProxyServer = (thingId) => {
  proxies.delete(thingId);
};

/**
 * Proxy the request, if configured.
 */
ProxyController.all('/:thingId/*', (request, response) => {
  const thingId = request.params.thingId;

  if (!proxies.has(thingId)) {
    response.sendStatus(404);
    return;
  }

  request.url = request.url.substring(thingId.length + 1);
  proxy.web(request, response, {target: proxies.get(thingId)});
});

module.exports = ProxyController;


/***/ }),

/***/ "./src/controllers/push_controller.js":
/*!********************************************!*\
  !*** ./src/controllers/push_controller.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Push API Controller.
 *
 * Implements the Push API for notifications to use
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const PromiseRouter = __webpack_require__(/*! express-promise-router */ "express-promise-router");
const PushService = __webpack_require__(/*! ../push-service */ "./src/push-service.js");

const PushController = PromiseRouter();

/**
 * Handle requests for the public key
 */
PushController.get('/vapid-public-key', async (request, response) => {
  // const vapid = await PushService.getVAPIDKeys();
  const vapid = false;
  if (!vapid) {
    // response.status(500).json({error: 'vapid not configured'});
    return;
  }
  response.status(200).json({publicKey: vapid.publicKey});
});

PushController.post('/register', async (request, response) => {
  const subscription = request.body.subscription;
  try {
    await PushService.createPushSubscription(subscription);
  } catch (err) {
    console.error(`PushController: Failed to register ${subscription}`, err);
    response.status(500).json({error: 'register failed'});
    return;
  }
  response.status(200).json({});
});

module.exports = PushController;


/***/ }),

/***/ "./src/controllers/root_controller.js":
/*!********************************************!*\
  !*** ./src/controllers/root_controller.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Root Controller.
 *
 * Handles requests to /.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const express = __webpack_require__(/*! express */ "express");
const Constants = __webpack_require__(/*! ../constants */ "./src/constants.js");
const TunnelService = __webpack_require__(/*! ../ssltunnel */ "./src/ssltunnel.js");

const RootController = express.Router();

/**
 * Get the home page.
 */
RootController.get('/', TunnelService.isTunnelSet, (request, response) => {
  response.sendFile('index.html', {
    root: Constants.BUILD_STATIC_PATH,
  });
});

module.exports = RootController;


/***/ }),

/***/ "./src/controllers/settings_controller.js":
/*!************************************************!*\
  !*** ./src/controllers/settings_controller.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Settings Controller.
 *
 * Manages gateway settings.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



/* jshint unused:false */

const CertificateManager = __webpack_require__(/*! ../certificate-manager */ "./src/certificate-manager.js");
const config = __webpack_require__(/*! config */ "config");
const Constants = __webpack_require__(/*! ../constants */ "./src/constants.js");
const fetch = __webpack_require__(/*! node-fetch */ "node-fetch");
const fs = __webpack_require__(/*! fs */ "fs");
const isoLookup = __webpack_require__(/*! ../iso-639/index */ "./src/iso-639/index.js");
const jwtMiddleware = __webpack_require__(/*! ../jwt-middleware */ "./src/jwt-middleware.js");
const mDNSserver = __webpack_require__(/*! ../mdns-server */ "./src/mdns-server.js");
const path = __webpack_require__(/*! path */ "path");
const pkg = __webpack_require__(/*! ../../package.json */ "./package.json");
const Platform = __webpack_require__(/*! ../platform */ "./src/platform.js");
const PromiseRouter = __webpack_require__(/*! express-promise-router */ "express-promise-router");
const Settings = __webpack_require__(/*! ../models/settings */ "./src/models/settings.js");
const TunnelService = __webpack_require__(/*! ../ssltunnel */ "./src/ssltunnel.js");

const auth = jwtMiddleware.middleware();
const SettingsController = PromiseRouter();

/**
 * Set an experiment setting.
 */
SettingsController.put(
  '/experiments/:experimentName',
  auth,
  async (request, response) => {
    const experimentName = request.params.experimentName;

    if (!request.body || !request.body.hasOwnProperty('enabled')) {
      response.status(400).send('Enabled property not defined');
      return;
    }

    const enabled = request.body.enabled;

    try {
      const result =
        await Settings.set(`experiments.${experimentName}.enabled`,
                           enabled);
      response.status(200).json({enabled: result});
    } catch (e) {
      console.error(`Failed to set setting experiments.${experimentName}`);
      console.error(e);
      response.status(400).send(e);
    }
  });

/**
 * Get an experiment setting.
 */
SettingsController.get(
  '/experiments/:experimentName',
  auth,
  async (request, response) => {
    const experimentName = request.params.experimentName;

    try {
      const result =
        await Settings.get(`experiments.${experimentName}.enabled`);
      if (typeof result === 'undefined') {
        response.status(404).send('Setting not found');
      } else {
        response.status(200).json({enabled: result});
      }
    } catch (e) {
      console.error(`Failed to get setting experiments.${experimentName}`);
      console.error(e);
      response.status(400).send(e);
    }
  }
);

SettingsController.post('/reclaim', async (request, response) => {
  if (!request.body || !request.body.hasOwnProperty('subdomain')) {
    response.statusMessage = 'Subdomain missing from request';
    response.status(400).end();
    return;
  }

  const subdomain = request.body.subdomain;

  try {
    await fetch(`${config.get('ssltunnel.registration_endpoint')
    }/reclaim?name=${subdomain}`);
    response.status(200).json({});
  } catch (e) {
    console.error(e);
    response.statusMessage = `Error reclaiming domain - ${e}`;
    response.status(400).end();
  }
});

SettingsController.post('/subscribe', async (request, response, next) => {
  if (!request.body ||
      !request.body.hasOwnProperty('email') ||
      !request.body.hasOwnProperty('subdomain') ||
      !request.body.hasOwnProperty('optout')) {
    response.statusMessage = 'Invalid request';
    response.status(400).end();
    return;
  }

  // increase the timeout for this request, as registration can take a while
  request.setTimeout(5 * 60 * 1000, () => {
    const err = new Error('Request Timeout');
    err.status = 408;
    next(err);
  });

  const email = request.body.email.trim().toLowerCase();
  const reclamationToken = request.body.reclamationToken.trim().toLowerCase();
  const subdomain = request.body.subdomain.trim().toLowerCase();
  const fulldomain = `${subdomain}.${config.get('ssltunnel.domain')}`;
  const optout = request.body.optout ? 1 : 0;

  function cb(err) {
    if (err) {
      response.statusMessage = `Error issuing certificate - ${err}`;
      response.status(400).end();
    } else {
      const endpoint = {
        url: `https://${subdomain}.${config.get('ssltunnel.domain')}`,
      };
      TunnelService.start(response, endpoint);
      TunnelService.switchToHttps();
    }
  }

  await CertificateManager.register(
    email,
    reclamationToken,
    subdomain,
    fulldomain,
    optout,
    cb
  );
});

SettingsController.post('/skiptunnel', async (request, response) => {
  try {
    await Settings.set('notunnel', true);
    response.status(200).json({});
  } catch (e) {
    console.error('Failed to set notunnel setting.');
    console.error(e);
    response.status(400).send(e);
  }
});

SettingsController.get('/tunnelinfo', auth, async (request, response) => {
  try {
    const localDomainSettings = await Settings.getTunnelInfo();
    response.status(200).json(localDomainSettings);
  } catch (e) {
    console.error('Failed to retrieve default settings for ' +
      'tunneltoken or local service discovery setting');
    console.error(e);
    response.status(400).send(e);
  }
});

/* This is responsible for controlling dynamically the local domain name
 * settings (via mDNS) and changing or updating mozilla tunnel endpoints.
 * The /domain endpoint is invoked from:
 *   MainMenu -> Settings -> Doamin
 *
 * JSON data: {
 *              local: {
 *                multicastDNSstate: boolean,
 *                localDNSname: string, - e.g. MyHome
 *              },
 *              mozillaTunnel: {
 *                tunnel: boolean,
 *                tunnelName: string, - e.g. MyName
 *                tunnelEmail: string
 *              }
 *            }
 */
SettingsController.put('/domain', auth, async (request, response) => {
  if (!request.body || !request.body.hasOwnProperty('local')) {
    response.statusMessage = 'Invalid request.';
    response.status(400).end();
    return;
  }

  try {
    if (request.body.local.hasOwnProperty('localDNSname')) {
      if (!Platform.implemented('setHostname') ||
          !Platform.setHostname(request.body.local.localDNSname)) {
        response.sendStatus(500);
        return;
      }
    } else if (request.body.local.hasOwnProperty('multicastDNSstate')) {
      if (!Platform.implemented('setMdnsServerStatus') ||
          !Platform.setMdnsServerStatus(request.body.local.multicastDNSstate)) {
        response.sendStatus(500);
        return;
      }
    } else {
      response.statusMessage = 'Invalid request.';
      response.status(400).end();
      return;
    }

    let protocol, port;
    if (request.secure) {
      protocol = 'https';
      port = config.get('ports.https');
    } else {
      protocol = 'http';
      port = config.get('ports.http');
    }

    const domain = await mDNSserver.getmDNSdomain();
    const state = await mDNSserver.getmDNSstate();
    const url = `${protocol}://${domain}.local:${port}`;
    const localDomainSettings = {
      localDomain: url,
      update: true,
      mDNSstate: state,
    };
    response.status(200).json(localDomainSettings);
  } catch (err) {
    console.error(`Failed setting domain with: ${err} `);
    const domain = await mDNSserver.getmDNSdomain();
    const state = await mDNSserver.getmDNSstate();
    const localDomainSettings = {
      localDomain: domain,
      update: false,
      mDNSstate: state,
      error: err.message,
    };
    response.status(400).json(localDomainSettings);
  }
});

SettingsController.get('/addonsInfo', auth, (request, response) => {
  response.json({
    urls: config.get('addonManager.listUrls'),
    architecture: Platform.getArchitecture(),
    version: pkg.version,
    nodeVersion: Platform.getNodeVersion(),
    pythonVersions: Platform.getPythonVersions(),
    testAddons: config.get('addonManager.testAddons'),
  });
});

SettingsController.get('/system/platform', auth, (request, response) => {
  response.json({
    architecture: Platform.getArchitecture(),
    os: Platform.getOS(),
  });
});

SettingsController.get('/system/ssh', auth, (request, response) => {
  const toggleImplemented = Platform.implemented('setSshServerStatus');
  let enabled = false;
  if (Platform.implemented('getSshServerStatus')) {
    enabled = Platform.getSshServerStatus();
  }

  response.json({
    toggleImplemented,
    enabled,
  });
});

SettingsController.put('/system/ssh', auth, (request, response) => {
  if (!request.body || !request.body.hasOwnProperty('enabled')) {
    response.status(400).send('Enabled property not defined');
    return;
  }

  const toggleImplemented = Platform.implemented('setSshServerStatus');
  if (toggleImplemented) {
    const enabled = request.body.enabled;
    if (Platform.setSshServerStatus(enabled)) {
      response.status(200).json({enabled});
    } else {
      response.status(400).send('Failed to toggle SSH');
    }
  } else {
    response.status(500).send('Toggle SSH not implemented');
  }
});

SettingsController.post('/system/actions', auth, (request, response) => {
  if (!request.body || !request.body.hasOwnProperty('action')) {
    response.status(400).send('Action property not defined');
    return;
  }

  const action = request.body.action;
  switch (action) {
    case 'restartGateway':
      if (Platform.implemented('restartGateway')) {
        if (Platform.restartGateway()) {
          response.status(200).json({});
        } else {
          response.status(500).send('Failed to restart gateway');
        }
      } else {
        response.status(500).send('Restart gateway not implemented');
      }
      break;
    case 'restartSystem':
      if (Platform.implemented('restartSystem')) {
        if (Platform.restartSystem()) {
          response.status(200).json({});
        } else {
          response.status(500).send('Failed to restart system');
        }
      } else {
        response.status(500).send('Restart system not implemented');
      }
      break;
    default:
      response.status(400).send('Unsupported action');
      break;
  }
});

SettingsController.get('/system/ntp', (request, response) => {
  const statusImplemented = Platform.implemented('getNtpStatus');

  let synchronized = false;
  if (statusImplemented) {
    synchronized = Platform.getNtpStatus();
  }

  response.json({
    statusImplemented,
    synchronized,
  });
});

SettingsController.post('/system/ntp', (request, response) => {
  if (Platform.implemented('restartNtpSync')) {
    if (Platform.restartNtpSync()) {
      response.status(200).json({});
    } else {
      response.status(500).send('Failed to restart NTP sync');
    }
  } else {
    response.status(500).send('Restart NTP sync not implemented');
  }
});

SettingsController.get('/network/dhcp', auth, (request, response) => {
  if (Platform.implemented('getDhcpServerStatus')) {
    response.json({enabled: Platform.getDhcpServerStatus()});
  } else {
    response.status(500).send('DHCP status not implemented');
  }
});

SettingsController.put('/network/dhcp', auth, (request, response) => {
  if (!request.body || !request.body.hasOwnProperty('enabled')) {
    response.status(400).send('Missing enabled property');
    return;
  }

  const enabled = request.body.enabled;

  if (Platform.implemented('setDhcpServerStatus')) {
    if (Platform.setDhcpServerStatus(enabled)) {
      response.status(200).json({});
    } else {
      response.status(500).send('Failed to toggle DHCP');
    }
  } else {
    response.status(500).send('Toggle DHCP not implemented');
  }
});

SettingsController.get('/network/lan', auth, (request, response) => {
  if (Platform.implemented('getLanMode')) {
    response.json(Platform.getLanMode());
  } else {
    response.status(500).send('LAN mode not implemented');
  }
});

SettingsController.put('/network/lan', auth, (request, response) => {
  if (!request.body || !request.body.hasOwnProperty('mode')) {
    response.status(400).send('Missing mode property');
    return;
  }

  const mode = request.body.mode;
  const options = request.body.options;

  if (Platform.implemented('setLanMode')) {
    if (Platform.setLanMode(mode, options)) {
      response.status(200).json({});
    } else {
      response.status(500).send('Failed to update LAN configuration');
    }
  } else {
    response.status(500).send('Setting LAN mode not implemented');
  }
});

SettingsController.get('/network/wan', auth, (request, response) => {
  if (Platform.implemented('getWanMode')) {
    response.json(Platform.getWanMode());
  } else {
    response.status(500).send('WAN mode not implemented');
  }
});

SettingsController.put('/network/wan', auth, (request, response) => {
  if (!request.body || !request.body.hasOwnProperty('mode')) {
    response.status(400).send('Missing mode property');
    return;
  }

  const mode = request.body.mode;
  const options = request.body.options;

  if (Platform.implemented('setWanMode')) {
    if (Platform.setWanMode(mode, options)) {
      response.status(200).json({});
    } else {
      response.status(500).send('Failed to update WAN configuration');
    }
  } else {
    response.status(500).send('Setting WAN mode not implemented');
  }
});

SettingsController.get('/network/wireless', auth, (request, response) => {
  if (Platform.implemented('getWirelessMode')) {
    response.json(Platform.getWirelessMode());
  } else {
    response.status(500).send('Wireless mode not implemented');
  }
});

SettingsController.get(
  '/network/wireless/networks',
  auth,
  (request, response) => {
    if (Platform.implemented('scanWirelessNetworks')) {
      response.json(Platform.scanWirelessNetworks());
    } else {
      response.status(500).send('Wireless scanning not implemented');
    }
  }
);

SettingsController.put('/network/wireless', auth, (request, response) => {
  if (!request.body || !request.body.hasOwnProperty('enabled')) {
    response.status(400).send('Missing enabled property');
    return;
  }

  const enabled = request.body.enabled;
  const mode = request.body.mode;
  const options = request.body.options;

  if (Platform.implemented('setWirelessMode')) {
    if (Platform.setWirelessMode(enabled, mode, options)) {
      response.status(200).json({});
    } else {
      response.status(500).send('Failed to update wireless configuration');
    }
  } else {
    response.status(500).send('Setting wireless mode not implemented');
  }
});

SettingsController.get('/network/addresses', auth, (request, response) => {
  if (Platform.implemented('getNetworkAddresses')) {
    response.json(Platform.getNetworkAddresses());
  } else {
    response.status(500).send('Network addresses not implemented');
  }
});

SettingsController.get('/localization/country', auth, (request, response) => {
  let valid = [];
  if (Platform.implemented('getValidWirelessCountries')) {
    valid = Platform.getValidWirelessCountries();
  }

  let current = '';
  if (Platform.implemented('getWirelessCountry')) {
    current = Platform.getWirelessCountry();
  }

  const setImplemented = Platform.implemented('setWirelessCountry');
  response.json({valid, current, setImplemented});
});

SettingsController.put('/localization/country', auth, (request, response) => {
  if (!request.body || !request.body.hasOwnProperty('country')) {
    response.status(400).send('Missing country property');
    return;
  }

  if (Platform.implemented('setWirelessCountry')) {
    if (Platform.setWirelessCountry(request.body.country)) {
      response.status(200).json({});
    } else {
      response.status(500).send('Failed to update country');
    }
  } else {
    response.status(500).send('Setting country not implemented');
  }
});

SettingsController.get('/localization/timezone', auth, (request, response) => {
  let valid = [];
  if (Platform.implemented('getValidTimezones')) {
    valid = Platform.getValidTimezones();
  }

  let current = '';
  if (Platform.implemented('getTimezone')) {
    current = Platform.getTimezone();
  }

  const setImplemented = Platform.implemented('setTimezone');
  response.json({valid, current, setImplemented});
});

SettingsController.put('/localization/timezone', auth, (request, response) => {
  if (!request.body || !request.body.hasOwnProperty('zone')) {
    response.status(400).send('Missing zone property');
    return;
  }

  if (Platform.implemented('setTimezone')) {
    if (Platform.setTimezone(request.body.zone)) {
      response.status(200).json({});
    } else {
      response.status(500).send('Failed to update timezone');
    }
  } else {
    response.status(500).send('Setting timezone not implemented');
  }
});

SettingsController.get(
  '/localization/language',
  auth,
  async (request, response) => {
    const fluentDir = path.join(Constants.BUILD_STATIC_PATH, 'fluent');
    const valid = [];
    try {
      for (const dirname of fs.readdirSync(fluentDir)) {
        const name = isoLookup(dirname);

        if (!name) {
          console.error('Unknown language code:', dirname);
          continue;
        }

        valid.push({
          code: dirname,
          name,
        });
      }

      valid.sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
      console.log(e);
      response.status(500).send('Failed to retrieve list of languages');
      return;
    }

    try {
      const current = await Settings.get('localization.language');
      response.json({valid, current});
    } catch (_) {
      response.status(500).send('Failed to get current language');
    }
  }
);

SettingsController.put(
  '/localization/language',
  auth,
  async (request, response) => {
    if (!request.body || !request.body.hasOwnProperty('language')) {
      response.status(400).send('Missing language property');
      return;
    }

    try {
      await Settings.set('localization.language', request.body.language);
      response.json({});
    } catch (_) {
      response.status(500).send('Failed to set language');
    }
  }
);

SettingsController.get(
  '/localization/units',
  auth,
  async (request, response) => {
    let temperature;

    try {
      temperature = await Settings.get('localization.units.temperature');
    } catch (e) {
      // pass
    }

    response.json({
      temperature: temperature || 'degree celsius',
    });
  }
);

SettingsController.put(
  '/localization/units',
  auth,
  async (request, response) => {
    for (const [key, value] of Object.entries(request.body)) {
      try {
        await Settings.set(`localization.units.${key}`, value);
      } catch (_) {
        response.status(500).send('Failed to set unit');
        return;
      }
    }

    response.json({});
  }
);

module.exports = SettingsController;


/***/ }),

/***/ "./src/controllers/things_controller.js":
/*!**********************************************!*\
  !*** ./src/controllers/things_controller.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Things Controller.
 *
 * Manages HTTP requests to /things.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Action = __webpack_require__(/*! ../models/action */ "./src/models/action.js");
const Actions = __webpack_require__(/*! ../models/actions */ "./src/models/actions.js");
const ActionsController = __webpack_require__(/*! ./actions_controller */ "./src/controllers/actions_controller.js");
const AddonManager = __webpack_require__(/*! ../addon-manager */ "./src/addon-manager.js");
const Constants = __webpack_require__(/*! ../constants */ "./src/constants.js");
const EventsController = __webpack_require__(/*! ./events_controller */ "./src/controllers/events_controller.js");
const PromiseRouter = __webpack_require__(/*! express-promise-router */ "express-promise-router");
const Settings = __webpack_require__(/*! ../models/settings */ "./src/models/settings.js");
const Things = __webpack_require__(/*! ../models/things */ "./src/models/things.js");
const WebSocket = __webpack_require__(/*! ws */ "ws");

const ThingsController = PromiseRouter();

/**
 * Connect to receive messages from a Thing or all Things
 *
 * Note that these must precede the normal routes to allow express-ws to work
 */
ThingsController.ws('/:thingId/', websocketHandler);
ThingsController.ws('/', websocketHandler);

/**
 * Get a list of Things.
 */
ThingsController.get('/', (request, response) => {
  if (request.jwt.payload.role !== Constants.USER_TOKEN) {
    if (!request.jwt.payload.scope) {
      response.status(400).send('Token must contain scope');
    } else {
      const scope = request.jwt.payload.scope;
      if (!scope.includes(' ') && scope.indexOf('/') == 0 &&
        scope.split('/').length == 2 &&
        scope.split(':')[0] === Constants.THINGS_PATH) {
        Things.getThingDescriptions(request.get('Host'), request.secure)
          .then((things) => {
            response.status(200).json(things);
          });
      } else {
        // Get hrefs of things in scope
        const paths = scope.split(' ');
        const hrefs = new Array(0);
        for (const path of paths) {
          const parts = path.split(':');
          hrefs.push(parts[0]);
        }
        Things.getListThingDescriptions(hrefs,
                                        request.get('Host'),
                                        request.secure)
          .then((things) => {
            response.status(200).json(things);
          });
      }
    }
  } else {
    Things.getThingDescriptions(request.get('Host'), request.secure)
      .then((things) => {
        response.status(200).json(things);
      });
  }
});

ThingsController.patch('/', async (request, response) => {
  if (!request.body ||
      !request.body.hasOwnProperty('thingId') ||
      !request.body.thingId) {
    response.status(400).send('Invalid request');
    return;
  }

  const thingId = request.body.thingId;

  if (request.body.hasOwnProperty('pin') &&
      request.body.pin.length > 0) {
    const pin = request.body.pin;

    try {
      const device = await AddonManager.setPin(thingId, pin);
      response.status(200).json(device);
    } catch (e) {
      console.error(`Failed to set PIN for ${thingId}: ${e}`);
      response.status(400).send(e);
    }
  } else if (request.body.hasOwnProperty('username') &&
             request.body.username.length > 0 &&
             request.body.hasOwnProperty('password') &&
             request.body.password.length > 0) {
    const username = request.body.username;
    const password = request.body.password;

    try {
      const device = await AddonManager.setCredentials(
        thingId,
        username,
        password
      );
      response.status(200).json(device);
    } catch (e) {
      console.error(`Failed to set credentials for ${thingId}: ${e}`);
      response.status(400).send(e);
    }
  } else {
    response.status(400).send('Invalid request');
  }
});

/**
 * Handle creating a new thing.
 */
ThingsController.post('/', async (request, response) => {
  if (!request.body || !request.body.hasOwnProperty('id')) {
    response.status(400).send('No id in thing description');
    return;
  }
  const description = request.body;
  const id = description.id;
  delete description.id;

  try {
    // If the thing already exists, bail out.
    await Things.getThing(id);
    const err = 'Web thing already added';
    console.log(err, id);
    response.status(400).send(err);
    return;
  } catch (_e) {
    // Do nothing, this is what we want.
  }

  // If we're adding a native webthing, we need to update the config for
  // thing-url-adapter so that it knows about it.
  let webthing = false;
  if (description.hasOwnProperty('webthingUrl')) {
    webthing = true;

    const key = 'addons.config.thing-url-adapter';
    try {
      const config = await Settings.get(key);
      if (typeof config === 'undefined') {
        throw new Error('Setting is undefined.');
      }

      config.urls.push(description.webthingUrl);
      await Settings.set(key, config);
    } catch (e) {
      console.error('Failed to update settings for thing-url-adapter');
      console.error(e);
      response.status(400).send(e);
      return;
    }

    delete description.webthingUrl;
  }

  try {
    const thing = await Things.createThing(id, description, webthing);
    console.log(`Successfully created new thing ${thing.title}`);
    response.status(201).send(thing);
  } catch (error) {
    console.error('Error saving new thing', id, description);
    console.error(error);
    response.status(500).send(error);
  }

  // If this is a web thing, we need to restart thing-url-adapter.
  if (webthing) {
    try {
      await AddonManager.unloadAddon('thing-url-adapter', true);
      await AddonManager.loadAddon('thing-url-adapter');
    } catch (e) {
      console.error('Failed to restart thing-url-adapter');
      console.error(e);
    }
  }
});

/**
 * Get a Thing.
 */
ThingsController.get('/:thingId', (request, response) => {
  const id = request.params.thingId;
  Things.getThingDescription(id, request.get('Host'), request.secure)
    .then((thing) => {
      response.status(200).json(thing);
    })
    .catch((error) => {
      console.error(
        `Error getting thing description for thing with id ${id}:`,
        error
      );
      response.status(404).send(error);
    });
});

/**
 * Get the properties of a Thing.
 */
ThingsController.get('/:thingId/properties', async (request, response) => {
  const thingId = request.params.thingId;

  let thing;
  try {
    thing = await Things.getThing(thingId);
  } catch (e) {
    console.error('Failed to get thing:', e);
    response.status(404).send(e);
    return;
  }

  const result = {};
  for (const name in thing.properties) {
    try {
      const value = await AddonManager.getProperty(thingId, name);
      result[name] = value;
    } catch (e) {
      console.error(`Failed to get property ${name}:`, e);
    }
  }

  response.status(200).json(result);
});

/**
 * Get a property of a Thing.
 */
ThingsController.get(
  '/:thingId/properties/:propertyName',
  async (request, response) => {
    const thingId = request.params.thingId;
    const propertyName = request.params.propertyName;
    try {
      const value = await Things.getThingProperty(thingId, propertyName);
      const result = {};
      result[propertyName] = value;
      response.status(200).json(result);
    } catch (err) {
      response.status(err.code).send(err.message);
    }
  });

/**
 * Set a property of a Thing.
 */
ThingsController.put(
  '/:thingId/properties/:propertyName',
  async (request, response) => {
    const thingId = request.params.thingId;
    const propertyName = request.params.propertyName;
    if (!request.body || typeof request.body[propertyName] === 'undefined') {
      response.status(400).send('Invalid property name');
      return;
    }
    const value = request.body[propertyName];
    try {
      const updatedValue = await Things.setThingProperty(thingId, propertyName,
                                                         value);
      const result = {
        [propertyName]: updatedValue,
      };
      response.status(200).json(result);
    } catch (e) {
      response.status(e.code).send(e.message);
    }
  });

/**
 * Use an ActionsController to handle each thing's actions.
 */
ThingsController.use(`/:thingId${Constants.ACTIONS_PATH}`, ActionsController);

/**
 * Use an EventsController to handle each thing's events.
 */
ThingsController.use(`/:thingId${Constants.EVENTS_PATH}`, EventsController);

/**
 * Modify a Thing's floorplan position or layout index.
 */
ThingsController.patch('/:thingId', async (request, response) => {
  const thingId = request.params.thingId;
  if (!request.body) {
    response.status(400).send('request body missing');
    return;
  }

  let thing;
  try {
    thing = await Things.getThing(thingId);
  } catch (e) {
    response.status(404).send('thing not found');
    return;
  }

  let description;
  try {
    if (request.body.hasOwnProperty('floorplanX') &&
        request.body.hasOwnProperty('floorplanY')) {
      description = await thing.setCoordinates(
        request.body.floorplanX,
        request.body.floorplanY
      );
    } else if (request.body.hasOwnProperty('layoutIndex')) {
      description = await thing.setLayoutIndex(request.body.layoutIndex);
    } else {
      response.status(400).send('request body missing required parameters');
      return;
    }

    response.status(200).json(description);
  } catch (e) {
    response.status(500).send(`Failed to update thing ${thingId}: ${e}`);
  }
});

/**
 * Modify a Thing.
 */
ThingsController.put('/:thingId', async (request, response) => {
  const thingId = request.params.thingId;
  if (!request.body || !request.body.hasOwnProperty('title')) {
    response.status(400).send('title parameter required');
    return;
  }

  const title = request.body.title.trim();
  if (title.length === 0) {
    response.status(400).send('Invalid title');
    return;
  }

  let thing;
  try {
    thing = await Things.getThing(thingId);
  } catch (e) {
    response.status(500).send(`Failed to retrieve thing ${thingId}: ${e}`);
    return;
  }

  if (request.body.selectedCapability) {
    try {
      await thing.setSelectedCapability(request.body.selectedCapability);
    } catch (e) {
      response.status(500).send(`Failed to update thing ${thingId}: ${e}`);
      return;
    }
  }

  if (request.body.iconData) {
    try {
      await thing.setIcon(request.body.iconData, true);
    } catch (e) {
      response.status(500).send(`Failed to update thing ${thingId}: ${e}`);
      return;
    }
  }

  let description;
  try {
    description = await thing.setTitle(title);
  } catch (e) {
    response.status(500).send(`Failed to update thing ${thingId}: ${e}`);
    return;
  }

  response.status(200).json(description);
});

/**
 * Remove a Thing.
 */
ThingsController.delete('/:thingId', (request, response) => {
  const thingId = request.params.thingId;

  const _finally = () => {
    Things.removeThing(thingId).then(() => {
      console.log(`Successfully deleted ${thingId} from database.`);
      response.sendStatus(204);
    }).catch((e) => {
      response.status(500).send(`Failed to remove thing ${thingId}: ${e}`);
    });
  };

  AddonManager.removeThing(thingId).then(_finally, _finally);
});

function websocketHandler(websocket, request) {
  // Since the Gateway have the asynchronous express middlewares, there is a
  // possibility that the WebSocket have been closed.
  if (websocket.readyState !== WebSocket.OPEN) {
    return;
  }

  const thingId = request.params.thingId;
  const subscribedEventNames = {};

  async function sendMessage(message) {
    websocket.send(JSON.stringify(message), (err) => {
      if (err) {
        console.error(`WebSocket sendMessage failed: ${err}`);
      }
    });
  }

  function onPropertyChanged(property) {
    if (typeof thingId !== 'undefined' && property.device.id !== thingId) {
      return;
    }

    sendMessage({
      id: property.device.id,
      messageType: Constants.PROPERTY_STATUS,
      data: {
        [property.name]: property.value,
      },
    });
  }

  function onActionStatus(action) {
    if (action.hasOwnProperty('thingId') &&
        typeof thingId !== 'undefined' &&
        action.thingId !== thingId) {
      return;
    }

    const message = {
      messageType: Constants.ACTION_STATUS,
      data: {
        [action.name]: action.getDescription(),
      },
    };

    if (action.hasOwnProperty('thingId')) {
      message.id = action.thingId;
    }

    sendMessage(message);
  }

  function onEvent(event) {
    if (typeof thingId !== 'undefined' && event.thingId !== thingId) {
      return;
    }

    if (!subscribedEventNames[event.name]) {
      return;
    }

    sendMessage({
      id: event.thingId,
      messageType: Constants.EVENT,
      data: {
        [event.name]: event.getDescription(),
      },
    });
  }

  let thingCleanups = {};
  function addThing(thing) {
    thing.addEventSubscription(onEvent);

    function onConnected(connected) {
      sendMessage({
        id: thing.id,
        messageType: Constants.CONNECTED,
        data: connected,
      });
    }
    thing.addConnectedSubscription(onConnected);

    const onRemoved = () => {
      if (thingCleanups[thing.id]) {
        thingCleanups[thing.id]();
        delete thingCleanups[thing.id];
      }

      if (typeof thingId !== 'undefined' &&
          (websocket.readyState === WebSocket.OPEN ||
           websocket.readyState === WebSocket.CONNECTING)) {
        websocket.close();
      } else {
        sendMessage({
          id: thing.id,
          messageType: Constants.THING_REMOVED,
          data: {},
        });
      }
    };
    thing.addRemovedSubscription(onRemoved);

    const onModified = () => {
      sendMessage({
        id: thing.id,
        messageType: Constants.THING_MODIFIED,
        data: {},
      });
    };
    thing.addModifiedSubscription(onModified);

    const thingCleanup = () => {
      thing.removeEventSubscription(onEvent);
      thing.removeConnectedSubscription(onConnected);
      thing.removeRemovedSubscription(onRemoved);
      thing.removeModifiedSubscription(onModified);
    };
    thingCleanups[thing.id] = thingCleanup;

    // send initial property values
    for (const name in thing.properties) {
      AddonManager.getProperty(thing.id, name).then((value) => {
        sendMessage({
          id: thing.id,
          messageType: Constants.PROPERTY_STATUS,
          data: {
            [name]: value,
          },
        });
      }).catch((e) => {
        console.error(`Failed to get property ${name}:`, e);
      });
    }
  }

  function onThingAdded(thing) {
    sendMessage({
      id: thing.id,
      messageType: Constants.THING_ADDED,
      data: {},
    });

    addThing(thing);
  }

  if (typeof thingId !== 'undefined') {
    Things.getThing(thingId).then((thing) => {
      addThing(thing);
    }).catch(() => {
      console.error('WebSocket opened on nonexistent thing', thingId);
      sendMessage({
        messageType: Constants.ERROR,
        data: {
          code: 404,
          status: '404 Not Found',
          message: `Thing ${thingId} not found`,
        },
      });
      websocket.close();
    });
  } else {
    Things.getThings().then((things) => {
      things.forEach(addThing);
    });
    Things.on(Constants.THING_ADDED, onThingAdded);
  }

  AddonManager.on(Constants.PROPERTY_CHANGED, onPropertyChanged);
  Actions.on(Constants.ACTION_STATUS, onActionStatus);

  const heartbeatInterval = setInterval(() => {
    try {
      websocket.ping();
    } catch (e) {
      // Do nothing. Let cleanup() handle things if necessary.
      websocket.terminate();
    }
  }, 30 * 1000);

  const cleanup = () => {
    Things.removeListener(Constants.THING_ADDED, onThingAdded);
    AddonManager.removeListener(Constants.PROPERTY_CHANGED, onPropertyChanged);
    Actions.removeListener(Constants.ACTION_STATUS, onActionStatus);
    for (const id in thingCleanups) {
      thingCleanups[id]();
    }
    thingCleanups = {};
    clearInterval(heartbeatInterval);
  };

  websocket.on('error', cleanup);
  websocket.on('close', cleanup);

  websocket.on('message', (requestText) => {
    let request = null;
    try {
      request = JSON.parse(requestText);
    } catch (e) {
      sendMessage({
        messageType: Constants.ERROR,
        data: {
          code: 400,
          status: '400 Bad Request',
          message: 'Parsing request failed',
        },
      });
      return;
    }

    const id = request.id || thingId;
    if (typeof id === 'undefined') {
      sendMessage({
        messageType: Constants.ERROR,
        data: {
          code: 400,
          status: '400 Bad Request',
          message: 'Missing thing id',
          request,
        },
      });
      return;
    }

    const device = AddonManager.getDevice(id);
    if (!device) {
      sendMessage({
        messageType: Constants.ERROR,
        data: {
          code: 400,
          status: '400 Bad Request',
          message: `Thing ${id} not found`,
          request,
        },
      });
      return;
    }

    switch (request.messageType) {
      case Constants.SET_PROPERTY: {
        const setRequests = Object.keys(request.data).map((property) => {
          const value = request.data[property];
          return device.setProperty(property, value);
        });
        Promise.all(setRequests).catch((err) => {
          // If any set fails, send an error
          sendMessage({
            messageType: Constants.ERROR,
            data: {
              code: 400,
              status: '400 Bad Request',
              message: err,
              request,
            },
          });
        });
        break;
      }

      case Constants.ADD_EVENT_SUBSCRIPTION: {
        for (const eventName in request.data) {
          subscribedEventNames[eventName] = true;
        }
        break;
      }

      case Constants.REQUEST_ACTION: {
        for (const actionName in request.data) {
          const actionParams = request.data[actionName].input;
          Things.getThing(id).then((thing) => {
            const action = new Action(actionName, actionParams, thing);
            return Actions.add(action).then(() => {
              return AddonManager.requestAction(
                id, action.id, actionName, actionParams);
            });
          }).catch((err) => {
            sendMessage({
              messageType: Constants.ERROR,
              data: {
                code: 400,
                status: '400 Bad Request',
                message: err.message,
                request,
              },
            });
          });
        }
        break;
      }

      default: {
        sendMessage({
          messageType: Constants.ERROR,
          data: {
            code: 400,
            status: '400 Bad Request',
            message: `Unknown messageType: ${request.messageType}`,
            request,
          },
        });
        break;
      }
    }
  });
}

module.exports = ThingsController;


/***/ }),

/***/ "./src/controllers/updates_controller.js":
/*!***********************************************!*\
  !*** ./src/controllers/updates_controller.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const childProcess = __webpack_require__(/*! child_process */ "child_process");
const config = __webpack_require__(/*! config */ "config");
const fs = __webpack_require__(/*! fs */ "fs");
const fetch = __webpack_require__(/*! node-fetch */ "node-fetch");
const semver = __webpack_require__(/*! semver */ "semver");
const Platform = __webpack_require__(/*! ../platform */ "./src/platform.js");
const PromiseRouter = __webpack_require__(/*! express-promise-router */ "express-promise-router");
const Utils = __webpack_require__(/*! ../utils */ "./src/utils.js");

const pkg = __webpack_require__(/*! ../../package.json */ "./package.json");

const UpdatesController = PromiseRouter();

function readVersion(packagePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(packagePath, {encoding: 'utf8'}, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const pkgJson = JSON.parse(data);

        if (!semver.valid(pkgJson.version)) {
          reject(new Error(`Invalid gateway semver: ${pkgJson.version}`));
          return;
        }

        resolve(pkgJson.version);
      } catch (e) {
        reject(e);
      }
    });
  });
}

function stat(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        if (err.code === 'ENOENT') {
          resolve(null);
        } else {
          reject(err);
        }
      } else {
        resolve(stats);
      }
    });
  });
}

const cacheLatest = {
  tag: null,
  time: 0,
  value: {version: null},
};
const cacheDuration = 60 * 1000;

function cacheLatestInsert(response, value) {
  cacheLatest.tag = response.get('etag');
  cacheLatest.time = Date.now();
  cacheLatest.value = value;
}

/**
 * Send the client an object describing the latest release
 */
UpdatesController.get('/latest', async (request, response) => {
  const etag = request.get('If-None-Match');
  if (etag) {
    if (cacheLatest.tag === etag &&
        Date.now() - cacheLatest.time < cacheDuration) {
      response.sendStatus(304);
      return;
    }
  }

  const res = await fetch(
    config.get('updateUrl'),
    {headers: {'User-Agent': Utils.getGatewayUserAgent()}}
  );

  const releases = await res.json();
  if (!releases || !releases.filter) {
    console.warn('API returned invalid releases, rate limit likely exceeded');
    const value = {version: null};
    response.send(value);
    cacheLatestInsert(response, value);
    return;
  }
  const latestRelease = releases.filter((release) => {
    return !release.prerelease && !release.draft;
  })[0];
  if (!latestRelease) {
    console.warn('No releases found');
    const value = {version: null};
    response.send(value);
    cacheLatestInsert(response, value);
    return;
  }
  const releaseVer = latestRelease.tag_name;
  const value = {version: releaseVer};
  response.send(value);
  cacheLatestInsert(response, value);
});

/**
 * Send an object describing the update status of the gateway
 */
UpdatesController.get('/status', async (request, response) => {
  // gateway, gateway_failed, gateway_old
  // oldVersion -> gateway_old's package.json version
  // if (gateway_failed.version > thisversion) {
  //  update failed, last attempt was ctime of gateway_failed
  // }
  const currentVersion = pkg.version;

  const oldStats = await stat('../gateway_old/package.json');
  let oldVersion = null;
  if (oldStats) {
    try {
      oldVersion = await readVersion('../gateway_old/package.json');
    } catch (e) {
      console.error('Failed to read ../gateway_old/package.json:', e);
    }
  }

  const failedStats = await stat('../gateway_failed/package.json');
  let failedVersion = null;
  if (failedStats) {
    try {
      failedVersion = await readVersion('../gateway_failed/package.json');
    } catch (e) {
      console.error('Failed to read ../gateway_failed/package.json:', e);
    }
  }

  if (failedVersion && semver.gt(failedVersion, currentVersion)) {
    response.send({
      success: false,
      version: currentVersion,
      failedVersion,
      timestamp: failedStats.ctime,
    });
  } else {
    let timestamp = null;
    if (oldStats) {
      timestamp = oldStats.ctime;
    }
    response.send({
      success: true,
      version: currentVersion,
      oldVersion,
      timestamp,
    });
  }
});

UpdatesController.post('/update', async (request, response) => {
  childProcess.exec('sudo systemctl start ' +
    'mozilla-iot-gateway.check-for-update.service');

  response.json({});
});

UpdatesController.get('/self-update', async (request, response) => {
  if (!Platform.implemented('getSelfUpdateStatus')) {
    response.json({
      available: false,
      enabled: false,
    });
  } else {
    response.json(Platform.getSelfUpdateStatus());
  }
});

UpdatesController.put('/self-update', async (request, response) => {
  if (!request.body || !request.body.hasOwnProperty('enabled')) {
    response.status(400).send('Enabled property not defined');
    return;
  }

  if (!Platform.implemented('setSelfUpdateStatus')) {
    response.status(500).send('Cannot toggle auto updates');
    return;
  }

  if (Platform.setSelfUpdateStatus(request.body.enabled)) {
    response.status(200).json({enabled: request.body.enabled});
  } else {
    response.status(500).send('Failed to toggle auto updates');
  }
});

module.exports = UpdatesController;


/***/ }),

/***/ "./src/controllers/uploads_controller.js":
/*!***********************************************!*\
  !*** ./src/controllers/uploads_controller.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Uploads Controller.
 *
 * Manages file uploads.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const express = __webpack_require__(/*! express */ "express");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const Constants = __webpack_require__(/*! ../constants */ "./src/constants.js");
const UserProfile = __webpack_require__(/*! ../user-profile */ "./src/user-profile.js");

const UPLOADS_PATH = UserProfile.uploadsDir;
const FLOORPLAN_PATH = path.join(UPLOADS_PATH, 'floorplan.svg');
const FALLBACK_FLOORPLAN_PATH = path.join(Constants.STATIC_PATH,
                                          'images',
                                          'floorplan.svg');

// On startup, copy the default floorplan, if necessary.
if (!fs.existsSync(FLOORPLAN_PATH)) {
  try {
    fs.copyFileSync(FALLBACK_FLOORPLAN_PATH, FLOORPLAN_PATH);
  } catch (err) {
    console.error(`Failed to copy floorplan: ${err}`);
  }
}

const UploadsController = express.Router();

/**
 * Upload a file.
 */
UploadsController.post('/', (request, response) => {
  if (!request.files || !request.files.file) {
    return response.status(500).send('No file provided for upload');
  }

  try {
    if (fs.existsSync(FLOORPLAN_PATH)) {
      fs.unlinkSync(FLOORPLAN_PATH);
    }
  } catch (err) {
    return response.status(500).send(`Failed to unlink old floorplan: ${err}`);
  }

  const file = request.files.file;
  file.mv(FLOORPLAN_PATH, (error) => {
    if (error) {
      // On error, try to copy the fallback.
      try {
        fs.copyFileSync(FALLBACK_FLOORPLAN_PATH, FLOORPLAN_PATH);
      } catch (err) {
        console.error(`Failed to copy floorplan: ${err}`);
      }

      return response.status(500).send(
        `Failed to save uploaded file: ${error}`);
    }

    response.status(201).send('Successfully uploaded file');
  });
});

module.exports = UploadsController;


/***/ }),

/***/ "./src/controllers/users_controller.js":
/*!*********************************************!*\
  !*** ./src/controllers/users_controller.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Users Controller.
 *
 * Manages HTTP requests to /users.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const PromiseRouter = __webpack_require__(/*! express-promise-router */ "express-promise-router");
const Passwords = __webpack_require__(/*! ../passwords */ "./src/passwords.js");
const Users = __webpack_require__(/*! ../models/users */ "./src/models/users.js");
const JSONWebToken = __webpack_require__(/*! ../models/jsonwebtoken */ "./src/models/jsonwebtoken.js");
const jwtMiddleware = __webpack_require__(/*! ../jwt-middleware */ "./src/jwt-middleware.js");
const auth = jwtMiddleware.middleware();

const UsersController = PromiseRouter();

/**
 * Get the count of users.
 *
 * NOTE: This is temporary while we figure out mutli user UI.
 */
UsersController.get('/count', async (request, response) => {
  const count = await Users.getCount();
  return response.status(200).send({count});
});

/**
 * Get info about all users.
 */
UsersController.get('/info', auth, async (request, response) => {
  const users = await Users.getUsers();
  const descriptions = users.map((user) => {
    const loggedIn = user.id === request.jwt.user;
    return Object.assign(user.getDescription(), {loggedIn});
  });
  return response.status(200).send(descriptions);
});

/**
 * Get a user.
 */
UsersController.get('/:userId', auth, async (request, response) => {
  const user = await Users.getUserById(request.params.userId);

  if (!user) {
    response.sendStatus(404);
    return;
  }

  response.status(200).json(user.getDescription());
});

/**
 * Create a user
 */
UsersController.post('/', async (request, response) => {
  const body = request.body;

  if (!body || !body.email || !body.password) {
    response.status(400).send('User requires email and password.');
    return;
  }

  // If a user has already been created, this path must be authenticated.
  const count = await Users.getCount();
  if (count > 0) {
    const jwt = await jwtMiddleware.authenticate(request);
    if (!jwt) {
      response.sendStatus(401);
      return;
    }
  }

  // See if this user already exists.
  const found = await Users.getUser(body.email);
  if (found) {
    response.status(400).send('User already exists.');
    return;
  }

  // TODO: user facing errors...
  const hash = await Passwords.hash(body.password);
  const user = await Users.createUser(body.email, hash, body.name);
  const jwt = await JSONWebToken.issueToken(user.id);

  response.send({
    jwt,
  });
});

UsersController.post('/:userId/mfa', auth, async (request, response) => {
  const user = await Users.getUserById(request.params.userId);

  if (!user) {
    response.sendStatus(404);
    return;
  }

  const body = request.body;
  if (body.enable) {
    if (!body.mfa) {
      // Initial MFA enablement, generate params
      const params = await user.generateMfaParams();
      response.status(200).json(params);
    } else if (Passwords.verifyMfaToken(user.mfaSharedSecret, body.mfa)) {
      // Stage 2, verify MFA token
      user.mfaEnrolled = true;
      const backupCodes = await user.generateMfaBackupCodes();
      await Users.editUser(user);
      response.status(200).json({backupCodes});
    } else {
      response.sendStatus(401);
    }
  } else {
    // Disable MFA
    user.mfaEnrolled = false;
    await Users.editUser(user);
    response.sendStatus(204);
  }
});

UsersController.put('/:userId/mfa/codes', auth, async (request, response) => {
  const user = await Users.getUserById(request.params.userId);

  if (!user) {
    response.sendStatus(404);
    return;
  }

  const body = request.body;
  if (body.generate) {
    const backupCodes = await user.generateMfaBackupCodes();
    await Users.editUser(user);
    response.status(200).json({backupCodes});
    return;
  }

  response.status(400).send('Request missing generate parameter');
});

/**
 * Edit a user
 */
UsersController.put('/:userId', auth, async (request, response) => {
  const user = await Users.getUserById(request.params.userId);

  if (!user) {
    response.sendStatus(404);
    return;
  }

  const body = request.body;
  if (!body || !body.email || !body.password) {
    response.status(400).send('User requires email and password.');
    return;
  }

  const passwordMatch = await Passwords.compare(body.password, user.password);
  if (!passwordMatch) {
    response.status(400).send('Passwords do not match.');
    return;
  }

  if (body.newPassword) {
    user.password = await Passwords.hash(body.newPassword);
  }

  user.email = body.email;
  user.name = body.name;

  await Users.editUser(user);
  response.status(200).json({});
});

/**
 * Delete a user
 */
UsersController.delete('/:userId', auth, async (request, response) => {
  const userId = request.params.userId;

  await Users.deleteUser(userId);
  response.sendStatus(204);
});

module.exports = UsersController;


/***/ }),

/***/ "./src/db.js":
/*!*******************!*\
  !*** ./src/db.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * WebThings Gateway Database.
 *
 * Stores a list of Things connected to the gateway.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const config = __webpack_require__(/*! config */ "config");
const sqlite3 = __webpack_require__(/*! sqlite3 */ "sqlite3").verbose();
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const assert = __webpack_require__(/*! assert */ "assert");
const UserProfile = __webpack_require__(/*! ./user-profile */ "./src/user-profile.js");

const TABLES = [
  'users',
  'jsonwebtokens',
  'things',
  'settings',
  'pushSubscriptions',
];

const DEBUG =  false || ("development" === 'test');

const Database = {
  /**
   * SQLite3 Database object.
   */
  db: null,

  /**
   * Open the database.
   */
  open: function() {
    // If the database is already open, just return.
    if (this.db) {
      return;
    }

    // Don't pull this from user-profile.js, because that would cause a
    // circular dependency.
    const filename = path.join(UserProfile.configDir, 'db.sqlite3');

    // Check if database already exists
    let exists = fs.existsSync(filename);
    const removeBeforeOpen = config.get('database.removeBeforeOpen');
    if (exists && removeBeforeOpen) {
      fs.unlinkSync(filename);
      exists = false;
    }

    console.log(exists ? 'Opening' : 'Creating', 'database:', filename);
    // Open database or create it if it doesn't exist
    this.db = new sqlite3.Database(filename);

    // Set a timeout in case the database is locked. 10 seconds is a bit long,
    // but it's better than crashing.
    this.db.configure('busyTimeout', 10000);

    this.db.serialize(() => {
      this.createTables();
      this.migrate();
      // If database newly created, populate with default data
      if (!exists) {
        this.populate();
      }
    });
  },

  createTables: function() {
    // Create Things table
    this.db.run('CREATE TABLE IF NOT EXISTS things (' +
      'id TEXT PRIMARY KEY,' +
      'description TEXT' +
    ');');

    // Create Users table
    this.db.run('CREATE TABLE IF NOT EXISTS users (' +
      'id INTEGER PRIMARY KEY ASC,' +
      'email TEXT UNIQUE,' +
      'password TEXT,' +
      'name TEXT,' +
      'mfaSharedSecret TEXT,' +
      'mfaEnrolled BOOLEAN DEFAULT 0,' +
      'mfaBackupCodes TEXT' +
    ');');

    /**
     * This really should have a foreign key constraint but it does not work
     * with our version of node-sqlite / sqlite.
     *
     * https://github.com/mapbox/node-sqlite3/pull/660
     *
     * Instead, the INTEGER user is either the id of the user or -1 if NULL
     */
    this.db.run('CREATE TABLE IF NOT EXISTS jsonwebtokens (' +
      'id INTEGER PRIMARY KEY ASC,' +
      'keyId TEXT UNIQUE,' + // public id (kid in JWT terms).
      'user INTEGER,' +
      'issuedAt DATE,' +
      'publicKey TEXT,' +
      'payload TEXT' +
    ');');

    // Create Settings table
    this.db.run('CREATE TABLE IF NOT EXISTS settings (' +
      'key TEXT PRIMARY KEY,' +
      'value TEXT' +
    ');');

    this.db.run(`CREATE TABLE IF NOT EXISTS pushSubscriptions (
      id INTEGER PRIMARY KEY,
      subscription TEXT UNIQUE
    );`);
  },

  /**
   * Do anything necessary to migrate from old database schemas.
   */
  migrate: function() {
    this.db.run('DROP TABLE IF EXISTS jsonwebtoken_to_user');
    this.db.run('ALTER TABLE users ADD COLUMN mfaSharedSecret TEXT', () => {});
    this.db.run(
      'ALTER TABLE users ADD COLUMN mfaEnrolled BOOLEAN DEFAULT 0',
      () => {}
    );
    this.db.run('ALTER TABLE users ADD COLUMN mfaBackupCodes TEXT', () => {});
  },

  /**
   * Populate the database with default data.
   */
  populate: function() {
    // Add any settings provided.
    const generateSettings = (obj, baseKey) => {
      const settings = [];

      for (const key in obj) {
        let newKey;
        if (baseKey !== '') {
          newKey = `${baseKey}.${key}`;
        } else {
          newKey = key;
        }

        if (typeof obj[key] === 'object') {
          settings.push(...generateSettings(obj[key], newKey));
        } else {
          settings.push([newKey, obj[key]]);
        }
      }
      return settings;
    };

    const settings = generateSettings(config.get('settings.defaults'), '');
    for (const setting of settings) {
      this.db.run(
        'INSERT INTO settings (key, value) VALUES (?, ?)',
        [setting[0], setting[1]],
        (error) => {
          if (error) {
            console.error(`Failed to insert setting ${
              setting[0]}`);
          } else if (DEBUG) {
            console.log(`Saved setting ${setting[0]} = ${
              setting[1]}`);
          }
        }
      );
    }
  },

  /**
   * Get all Things stored in the database.
   *
   * @return Promise which resolves with a list of Thing objects.
   */
  getThings: function() {
    return new Promise((function(resolve, reject) {
      this.db.all(
        'SELECT id, description FROM things',
        ((err, rows) => {
          if (err) {
            reject(err);
          } else {
            const things = [];
            for (const row of rows) {
              const thing = JSON.parse(row.description);
              thing.id = row.id;
              things.push(thing);
            }
            resolve(things);
          }
        }));
    }).bind(this));
  },

  /**
   * Add a new Thing to the Database.
   *
   * @param String id The ID to give the new Thing.
   * @param String description A serialised Thing description.
   */
  createThing: function(id, description) {
    return new Promise((function(resolve, reject) {
      const db = this.db;
      db.run(
        'INSERT INTO things (id, description) VALUES (?, ?)',
        [id, JSON.stringify(description)],
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(description);
          }
        });
    }).bind(this));
  },

  /**
   * Update a Thing in the Database.
   *
   * @param String id ID of the thing to update.
   * @param String description A serialised Thing description.
   */
  updateThing: function(id, description) {
    return new Promise((function(resolve, reject) {
      const db = this.db;
      db.run(
        'UPDATE things SET description=? WHERE id=?',
        [JSON.stringify(description), id],
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(description);
          }
        });
    }).bind(this));
  },

  /**
   * Remove a Thing from the Database.
   *
   * @param String id The ID of the Thing to remove.
   */
  removeThing: function(id) {
    return new Promise((function(resolve, reject) {
      const db = this.db;
      db.run('DELETE FROM things WHERE id = ?', id, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    }).bind(this));
  },

  /**
   * Get a user by their email address.
   */
  getUser: function(email) {
    return new Promise((function(resolve, reject) {
      const db = this.db;
      db.get(
        'SELECT * FROM users WHERE email = ?',
        email,
        (error, row) => {
          if (error) {
            reject(error);
          } else {
            resolve(row);
          }
        });
    }).bind(this));
  },

  /**
   * Get a user by it's primary key (id).
   */
  getUserById: async function(id) {
    assert(typeof id === 'number');
    return await this.get(
      'SELECT * FROM users WHERE id = ?',
      id
    );
  },

  /**
   * Get all Users stored in the database.
   *
   * @return {Promise<Array<User>>} resolves with a list of User objects
   */
  getUsers: function() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM users', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  getUserCount: async function() {
    const {count} = await this.get('SELECT count(*) as count FROM users');
    return count;
  },

  /**
   * Get a setting or return undefined
   * @param {String} key
   * @return {Promise<Object?>} value
   */
  getSetting: async function(key) {
    const res = await this.get('SELECT value FROM settings WHERE key=?', key);
    if (DEBUG) {
      console.log('getSetting', key, res);
    }

    if (!res) {
      return;
    }

    const {value} = res;
    if (typeof value === 'undefined') {
      return value;
    } else {
      return JSON.parse(value);
    }
  },

  /**
   * Set a setting. Assumes that the only access to the database is
   * single-threaded.
   *
   * @param {String} key
   * @param {Object} value
   * @return {Promise}
   */
  setSetting: async function(key, value) {
    value = JSON.stringify(value);
    const currentValue = await this.getSetting(key);
    if (typeof currentValue === 'undefined') {
      return this.run('INSERT INTO settings (key, value) VALUES (?, ?)',
                      [key, value]);
    } else {
      return this.run('UPDATE settings SET value=? WHERE key=?', [value, key]);
    }
  },

  /**
   * Remove a setting. Assumes that the only access to the database is
   * single-threaded.
   *
   * @param {String} key
   * @return {Promise}
   */
  deleteSetting: async function(key) {
    this.run('DELETE FROM settings WHERE key = ?', [key]);
  },

  /**
   * Create a user
   * @param {User} user
   * @return {Promise<User>}
   */
  createUser: async function(user) {
    const result = await this.run(
      'INSERT INTO users ' +
      '(email, password, name, mfaSharedSecret, mfaEnrolled, mfaBackupCodes) ' +
      'VALUES (?, ?, ?, ?, ?, ?)',
      [
        user.email,
        user.password,
        user.name,
        user.mfaSharedSecret,
        user.mfaEnrolled,
        JSON.stringify(user.mfaBackupCodes || '[]'),
      ]
    );
    assert(typeof result.lastID === 'number');
    return result.lastID;
  },

  /**
   * Edit a user.
   * @param {User} user
   * @return Promise that resolves when operation is complete.
   */
  editUser: async function(user) {
    assert(typeof user.id === 'number');
    return this.run(
      'UPDATE users SET ' +
      'email=?, password=?, name=?, mfaSharedSecret=?, mfaEnrolled=?, ' +
      'mfaBackupCodes=? WHERE id=?',
      [
        user.email,
        user.password,
        user.name,
        user.mfaSharedSecret,
        user.mfaEnrolled,
        JSON.stringify(user.mfaBackupCodes || '[]'),
        user.id,
      ]
    );
  },

  /**
   * Delete a user.
   * @param {Number} userId
   * @return Promise that resolves when operation is complete.
   */
  deleteUser: function(userId) {
    assert(typeof userId === 'number');
    const deleteUser = this.run(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    const deleteTokens = this.deleteJSONWebTokensForUser(userId);
    /**
     * XXX: This is a terrible hack until we get foreign key constraint support
     * turned on with node-sqlite. As is this could leave junk around in the db.
     */
    return Promise.all([deleteTokens, deleteUser]);
  },

  /**
   * Delete all jsonwebtoken's for a given user.
   */
  deleteJSONWebTokensForUser: function(userId) {
    assert(typeof userId === 'number');
    return this.run(
      'DELETE FROM jsonwebtokens WHERE user = ?',
      [userId]
    );
  },

  /**
   * Insert a JSONWebToken into the database
   * @param {JSONWebToken} token
   * @return {Promise<number>} resolved to JWT's primary key
   */
  createJSONWebToken: async function(token) {
    const {keyId, user, publicKey, issuedAt, payload} = token;
    const result = await this.run(
      'INSERT INTO jsonwebtokens (keyId, user, issuedAt, publicKey, payload) ' +
      'VALUES (?, ?, ?, ?, ?)',
      [keyId, user, issuedAt, publicKey, JSON.stringify(payload)]
    );
    assert(typeof result.lastID === 'number');
    return result.lastID;
  },

  /**
   * Get a JWT by its key id.
   * @param {string} keyId
   * @return {Promise<Object>} jwt data
   */
  getJSONWebTokenByKeyId: function(keyId) {
    assert(typeof keyId === 'string');
    return this.get(
      'SELECT * FROM jsonwebtokens WHERE keyId = ?',
      keyId
    );
  },

  /**
   * Get all known JWTs of a user
   * @param {number} userId
   * @return {Promise<Array<Object>>}
   */
  getJSONWebTokensByUser: function(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM jsonwebtokens WHERE user = ?',
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
    });
  },

  /**
   * Delete a JWT by it's key id.
   * @param {string} keyId
   * @return {Promise<boolean>} whether deleted
   */
  deleteJSONWebTokenByKeyId: async function(keyId) {
    assert(typeof keyId === 'string');
    const result = await this.run(
      'DELETE FROM jsonwebtokens WHERE keyId = ?',
      keyId
    );
    return result.changes !== 0;
  },

  /**
   * Store a new Push subscription
   * @param {Object} subscription
   * @return {Promise<number>} resolves to sub id
   */
  createPushSubscription: function(desc) {
    const description = JSON.stringify(desc);

    const insert = () => {
      return this.run(
        'INSERT INTO pushSubscriptions (subscription) VALUES (?)',
        [description]
      ).then((res) => {
        return parseInt(res.lastID);
      });
    };

    return this.get(
      'SELECT id FROM pushSubscriptions WHERE subscription = ?',
      description
    ).then((res) => {
      if (typeof res === 'undefined') {
        return insert();
      }

      return res.id;
    }).catch(() => {
      return insert();
    });
  },

  /**
   * Get all push subscriptions
   * @return {Promise<Array<PushSubscription>>}
   */
  getPushSubscriptions: function() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT id, subscription FROM pushSubscriptions',
        [],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          const subs = [];
          for (const row of rows) {
            const sub = JSON.parse(row.subscription);
            sub.id = row.id;
            subs.push(sub);
          }
          resolve(subs);
        }
      );
    });
  },

  /**
   * Delete a single subscription
   * @param {number} id
   */
  deletePushSubscription: function(id) {
    return this.run('DELETE FROM pushSubscriptions WHERE id = ?', [id]);
  },

  /**
   * ONLY for tests (clears all tables).
   */
  deleteEverything: async function() {
    return Promise.all(TABLES.map((t) => {
      return this.run(`DELETE FROM ${t}`);
    }));
  },

  get: function(sql, ...params) {
    return new Promise((accept, reject) => {
      params.push((err, row) => {
        if (err) {
          reject(err);
          return;
        }
        accept(row);
      });

      try {
        this.db.get(sql, ...params);
      } catch (err) {
        reject(err);
      }
    });
  },

  /**
   * Run a SQL statement
   * @param {String} sql
   * @param {Array<any>} values
   * @return {Promise<Object>} promise resolved to `this` of statement result
   */
  run: function(sql, values) {
    return new Promise((accept, reject) => {
      try {
        this.db.run(sql, values, function(err) {
          if (err) {
            reject(err);
            return;
          }
          // node-sqlite puts results on "this" so avoid arrrow fn.
          accept(this);
        });
      } catch (err) {
        reject(err);
      }
    });
  },
};

module.exports = Database;


/***/ }),

/***/ "./src/deferred.js":
/*!*************************!*\
  !*** ./src/deferred.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Wraps up a promise in a slightly more convenient manner for passing
 * around, or saving.
 *
 * @module Deferred
 */



const DEBUG = false;

let id = 0;

class Deferred {
  constructor() {
    this.id = ++id;
    this.promise = new Promise((resolve, reject) => {
      this.resolveFunc = resolve;
      this.rejectFunc = reject;
    });
    if (DEBUG) {
      console.log('Deferred: Created deferred promise id:', this.id);
    }
  }

  resolve(arg) {
    if (DEBUG) {
      console.log('Deferred: Resolving deferred promise id:', this.id,
                  'arg:', arg);
    }
    return this.resolveFunc(arg);
  }

  reject(arg) {
    if (DEBUG) {
      console.log('Deferred: Rejecting deferred promise id:', this.id,
                  'arg:', arg);
    }
    return this.rejectFunc(arg);
  }
}

module.exports = Deferred;


/***/ }),

/***/ "./src/dynamic-require.js":
/*!********************************!*\
  !*** ./src/dynamic-require.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



// Use webpack provided require for dynamic includes from the bundle.
module.exports = (() => {
  if (typeof require !== 'undefined') {
    // eslint-disable-next-line no-undef
    return require;
  }
  return __webpack_require__("./src sync recursive");
})();


/***/ }),

/***/ "./src/ec-crypto.ts":
/*!**************************!*\
  !*** ./src/ec-crypto.ts ***!
  \**************************/
/*! exports provided: generateKeyPair, JWT_ALGORITHM */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "generateKeyPair", function() { return generateKeyPair; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "JWT_ALGORITHM", function() { return JWT_ALGORITHM; });
/* harmony import */ var asn1_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! asn1.js */ "asn1.js");
/* harmony import */ var asn1_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(asn1_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! crypto */ "crypto");
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_1__);



const CURVE = 'prime256v1';
const ECPrivateKeyASN = asn1_js__WEBPACK_IMPORTED_MODULE_0__["define"]('ECPrivateKey', function () {
    this.seq().obj(this.key('version').int(), this.key('privateKey').octstr(), this.key('parameters').explicit(0).objid().optional(), this.key('publicKey').explicit(1).bitstr().optional());
});
const SubjectPublicKeyInfoASN = asn1_js__WEBPACK_IMPORTED_MODULE_0__["define"]('SubjectPublicKeyInfo', function () {
    this.seq().obj(this.key('algorithm').seq().obj(this.key('id').objid(), this.key('namedCurve').objid()), this.key('pub').bitstr());
});
const UNRESTRICTED_ALGORITHM_ID = [1, 2, 840, 10045, 2, 1];
const SECP256R1_CURVE = [1, 2, 840, 10045, 3, 1, 7];
function generateKeyPair() {
    const key = crypto__WEBPACK_IMPORTED_MODULE_1__["createECDH"](CURVE);
    key.generateKeys();
    const priv = ECPrivateKeyASN.encode({
        version: 1,
        privateKey: key.getPrivateKey(),
        parameters: SECP256R1_CURVE,
    }, 'pem', {
        label: 'EC PRIVATE KEY',
    });
    const pub = SubjectPublicKeyInfoASN.encode({
        pub: {
            unused: 0,
            data: key.getPublicKey(),
        },
        algorithm: {
            id: UNRESTRICTED_ALGORITHM_ID,
            namedCurve: SECP256R1_CURVE,
        },
    }, 'pem', {
        label: 'PUBLIC KEY',
    });
    return { public: pub, private: priv };
}
const JWT_ALGORITHM = 'ES256';


/***/ }),

/***/ "./src/iso-639/index.js":
/*!******************************!*\
  !*** ./src/iso-639/index.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {/**
 * Read data from the official ISO 639-3 table.
 */



const fs = __webpack_require__(/*! fs */ "fs");
const {getName} = __webpack_require__(/*! country-list */ "country-list");
const parse = __webpack_require__(/*! csv-parse/lib/sync */ "./node_modules/csv-parse/lib/sync.js");
const path = __webpack_require__(/*! path */ "path");

let parsed = false;
const by1 = new Map();
const by3 = new Map();

/**
 * Parse the table in this directory.
 */
function readFile() {
  let fname;
  try {
    for (const name of fs.readdirSync(__dirname)) {
      if (name.endsWith('.tab')) {
        fname = name;
        break;
      }
    }
  } catch (e) {
    console.error('Failed to list directory:', e);
    return false;
  }

  if (!fname) {
    return false;
  }

  let data;
  try {
    data = fs.readFileSync(path.join(__dirname, fname), 'utf8');
  } catch (e) {
    console.error('Failed to read ISO-639 table:', e);
    return false;
  }

  if (!data) {
    return false;
  }

  const records = parse(data, {delimiter: '\t', columns: true, trim: true});
  if (records.length === 0) {
    return false;
  }

  for (const record of records) {
    // Id is the 639-3 code
    if (record.Id) {
      by3.set(record.Id, record.Ref_Name);
    }

    // Part1 is the 639-1 code
    if (record.Part1) {
      by1.set(record.Part1, record.Ref_Name);
    }
  }

  return true;
}

/**
 * Look up the provided code.
 *
 * @param {string} code - Code to look up
 * @returns {string?} Language name or undefined if not found.
 */
function lookup(code) {
  if (!parsed) {
    if (!readFile()) {
      return;
    }

    parsed = true;
  }

  const [language, country] = code.split('-');
  let name;
  if (language.length === 2) {
    name = by1.get(language);
  } else if (language.length === 3) {
    name = by3.get(language);
  } else {
    return;
  }

  if (name && country) {
    const countryName = getName(country) || country;
    name = `${name} (${countryName})`;
  }

  return name;
}

module.exports = lookup;

/* WEBPACK VAR INJECTION */}.call(this, "src/iso-639"))

/***/ }),

/***/ "./src/jwt-middleware.js":
/*!*******************************!*\
  !*** ./src/jwt-middleware.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * JWT authorization middleware.
 *
 * Contains logic to create a middleware which validates the presence of a JWT
 * token in either the header or query parameters (for websockets).
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Constants = __webpack_require__(/*! ./constants */ "./src/constants.js");
const JSONWebToken = __webpack_require__(/*! ./models/jsonwebtoken */ "./src/models/jsonwebtoken.js");

const AUTH_TYPE = 'Bearer';

/**
 * Attempt to find the JWT in query parameters.
 *
 * @param {Request} req incoming http request.
 * @return {string|false} JWT string or false.
 */
function extractJWTQS(req) {
  if (typeof req.query === 'object' && req.query.jwt) {
    return req.query.jwt;
  }
  return false;
}

/**
 *  Attempt to find the JWT in the Authorization header.
 *
 * @param {Request} req incoming http request.
 * @return {string|false} JWT string or false.
 */
function extractJWTHeader(req) {
  const {authorization} = req.headers;
  if (!authorization) {
    return false;
  }
  const [type, sig] = authorization.split(' ');
  if (type !== AUTH_TYPE) {
    console.warn('JWT header extraction failed: invalid auth type');
    return false;
  }
  return sig;
}

/**
 * Authenticate the incoming call by checking it's JWT.
 *
 * TODO: User error messages.
 */
async function authenticate(req) {
  const sig = extractJWTHeader(req) || extractJWTQS(req);
  if (!sig) {
    return false;
  }
  return await JSONWebToken.verifyJWT(sig);
}

function scopeAllowsRequest(scope, request) {
  const requestPath = request.originalUrl;
  if (!scope) {
    return true;
  }
  const paths = scope.split(' ');
  for (let path of paths) {
    const parts = path.split(':');
    if (parts.length !== 2) {
      console.warn('Invalid scope', scope);
      return false;
    }
    const access = parts[1];
    const readwrite = access === Constants.READWRITE;
    path = parts[0];
    const allowedDirect = requestPath.startsWith(path);
    const allowedThings = requestPath === Constants.THINGS_PATH &&
      path.startsWith(Constants.THINGS_PATH);
    // Allow access to media only if scope covers all things
    const allowedMedia = requestPath.startsWith(Constants.MEDIA_PATH) &&
      path === Constants.THINGS_PATH;

    if (allowedDirect || allowedThings || allowedMedia) {
      if (!readwrite && request.method !== 'GET' &&
          request.method !== 'OPTIONS') {
        return false;
      }
      return true;
    }
  }
  return false;
}

function middleware() {
  return (req, res, next) => {
    authenticate(req, res).
      then((jwt) => {
        if (!jwt) {
          res.status(401).end();
          return;
        }
        let scope = jwt.payload.scope;
        if (jwt.payload.role === Constants.AUTHORIZATION_CODE) {
          scope = `${Constants.OAUTH_PATH}:${Constants.READWRITE}`;
        }
        if (!scopeAllowsRequest(scope, req)) {
          res.status(401).send(
            `Token of role ${jwt.payload.role} used out of scope: ${scope}`);
          return;
        }
        if (jwt.payload.role !== Constants.USER_TOKEN) {
          if (!jwt.payload.scope) {
            res.status(400)
              .send('Token must contain scope');
            return;
          }
        }

        req.jwt = jwt;
        next();
      }).
      catch((err) => {
        console.error('error running jwt middleware', err.stack);
        next(err);
      });
  };
}

module.exports = {
  middleware,
  authenticate,
  extractJWTQS,
  extractJWTHeader,
};


/***/ }),

/***/ "./src/log-timestamps.js":
/*!*******************************!*\
  !*** ./src/log-timestamps.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * @module log-timestamps
 *
 * Modifies console.log and friends to prepend a timestamp to log lines.
 */
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const winston = __webpack_require__(/*! winston */ "winston");
const DailyRotateFile = __webpack_require__(/*! winston-daily-rotate-file */ "winston-daily-rotate-file");
const UserProfile = __webpack_require__(/*! ./user-profile */ "./src/user-profile.js");
const format = __webpack_require__(/*! util */ "util").format;

class CustomFormatter {
  transform(info) {
    const level = info.level.toUpperCase().padEnd(7, ' ');
    info.message = `${info.timestamp} ${level}: ${info.message}`;
    return info;
  }
}

const timestampFormat = winston.format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss.SSS',
});

const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        timestampFormat,
        new CustomFormatter(),
        winston.format.colorize({
          all: true,
          colors: {
            debug: 'white',
            info: 'dim white',
            warn: 'yellow',
            error: 'red',
          },
        }),
        winston.format.printf((info) => info.message)
      ),
    }),
    new DailyRotateFile({
      dirname: UserProfile.logDir,
      filename: 'run-app.log.%DATE%',
      symlinkName: 'run-app.log',
      createSymlink: true,
      zippedArchive: false,
      maxSize: '10m',
      maxFiles: 10,
      format: winston.format.combine(
        timestampFormat,
        new CustomFormatter(),
        winston.format.printf((info) => info.message)
      ),
    }),
  ],
  exitOnError: false,
});

function logPrefix() {
  const currTime = new Date();
  return `${currTime.getFullYear()}-${
    (`0${currTime.getMonth() + 1}`).slice(-2)}-${
    (`0${currTime.getDate()}`).slice(-2)} ${
    (`0${currTime.getHours()}`).slice(-2)}:${
    (`0${currTime.getMinutes()}`).slice(-2)}:${
    (`0${currTime.getSeconds()}`).slice(-2)}.${
    (`00${currTime.getMilliseconds()}`).slice(-3)} `;
}

if (!console.constructor.hooked) {
  console.constructor.hooked = true;

  // BufferedConsole is used (under jest) when running multiple tests
  // CustomConsole is used (under jest) when running a single test

  if (console.constructor.name === 'BufferedConsole') {
    // The code for the write function comes from the jest source code:
    // https://github.com/facebook/jest/blob/master/packages/jest-util/
    //    src/buffered_console.js

    const callsites = __webpack_require__(/*! callsites */ "callsites");

    console.constructor.write = function write(buffer, type, message, level) {
      const call = callsites()[level != null ? level : 2];
      const origin = `${call.getFileName()}:${call.getLineNumber()}`;
      buffer.push({message: logPrefix() + message, origin, type});
      return buffer;
    };

    console.log = function log() {
      console.constructor.write(
        this._buffer, 'log', format.apply(null, arguments));
    };
    console.info = function info() {
      console.constructor.write(
        this._buffer, 'info', format.apply(null, arguments));
    };
    console.warn = function warn() {
      console.constructor.write(
        this._buffer, 'warn', format.apply(null, arguments));
    };
    console.error = function error() {
      console.constructor.write(
        this._buffer, 'error', format.apply(null, arguments));
    };
    // jest's BufferedConsole doesn't provide a debug, so we skip it as well.
  } else if (console.constructor.name === 'CustomConsole') {
    // See: https://github.com/facebook/jest/blob/master/packages/jest-util/
    //        src/Console.js
    //      for the implementation of _log

    console.log = function log() {
      console._log('log', logPrefix() + format.apply(null, arguments));
    };

    console.info = function info() {
      console._log('info', logPrefix() + format.apply(null, arguments));
    };

    console.warn = function warn() {
      console._log('warn', logPrefix() + format.apply(null, arguments));
    };

    console.error = function error() {
      console._log('error', logPrefix() + format.apply(null, arguments));
    };
    // jest's CustomConsole doesn't provide a debug, so we skip it as well.
  } else {
    // This path is for the normal non-jest output
    const FUNCS = ['info', 'debug', 'error', 'warn', 'verbose', 'silly'];

    for (const func of FUNCS) {
      console[func] = function() {
        logger[func](format.apply(null, arguments));
      };
    }

    console.log = console.info;
  }
}


/***/ }),

/***/ "./src/mdns-server.js":
/*!****************************!*\
  !*** ./src/mdns-server.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 * mDNS service handler.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const config = __webpack_require__(/*! config */ "config");
const Settings = __webpack_require__(/*! ./models/settings */ "./src/models/settings.js");

/**
 * Get the current domain of the mDNS service.
 */
async function getmDNSdomain() {
  let mDNSserviceDomain = config.get('settings.defaults.mdns.domain');

  try {
    const domain = await Settings.get('localDNSname');
    if (mDNSserviceDomain) {
      mDNSserviceDomain = domain;
    }
  } catch (_) {
    // pass
  }

  return mDNSserviceDomain;
}

/**
 * Get the current enablement state of the mDNS service.
 */
async function getmDNSstate() {
  let mDNSstate = config.get('settings.defaults.mdns.enabled');
  try {
    const state = await Settings.get('multicastDNSstate');
    if (typeof state !== 'undefined') {
      mDNSstate = state;
    }
  } catch (_) {
    // pass
  }

  return mDNSstate;
}

module.exports = {
  getmDNSdomain,
  getmDNSstate,
};


/***/ }),

/***/ "./src/models/action.js":
/*!******************************!*\
  !*** ./src/models/action.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Action Model.
 *
 * Manages Action data model and business logic.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Actions = __webpack_require__(/*! ../models/actions */ "./src/models/actions.js");
const Constants = __webpack_require__(/*! ../constants */ "./src/constants.js");
const EventEmitter = __webpack_require__(/*! events */ "events");
const {Utils} = __webpack_require__(/*! gateway-addon */ "gateway-addon");

class Action extends EventEmitter {
  /**
   * Create a new Action
   * @param {String} name
   * @param {Object} input
   * @param {Thing?} thing
   */
  constructor(name, input, thing) {
    super();

    this.id = Actions.generateId();
    this.name = name;
    this.input = input || {};
    if (thing) {
      this.href = `${thing.href}${Constants.ACTIONS_PATH}/${name}/${this.id}`;
      this.thingId = thing.id;
    } else {
      this.href = `${Constants.ACTIONS_PATH}/${name}/${this.id}`;
    }
    this.status = 'created';
    this.timeRequested = Utils.timestamp();
    this.timeCompleted = null;
    this.error = '';
  }

  getDescription() {
    const description = {
      input: this.input,
      href: this.href,
      status: this.status,
      timeRequested: this.timeRequested,
    };

    if (this.timeCompleted) {
      description.timeCompleted = this.timeCompleted;
    }

    if (this.error) {
      description.error = this.error;
    }

    return description;
  }

  /**
   * Update status and notify listeners
   * @param {String} newStatus
   */
  updateStatus(newStatus) {
    if (this.status === newStatus) {
      return;
    }

    if (newStatus === 'completed') {
      this.timeCompleted = Utils.timestamp();
    }

    this.status = newStatus;
    this.emit(Constants.ACTION_STATUS, this);
  }

  /**
   * Update from another action.
   */
  update(action) {
    this.timeRequested = action.timeRequested;
    this.timeCompleted = action.timeCompleted;

    if (this.status !== action.status) {
      this.status = action.status;
      this.emit(Constants.ACTION_STATUS, this);
    }
  }
}

module.exports = Action;


/***/ }),

/***/ "./src/models/actions.js":
/*!*******************************!*\
  !*** ./src/models/actions.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Actions.
 *
 * Manages a collection of Actions.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Things = __webpack_require__(/*! ../models/things */ "./src/models/things.js");
const AddonManager = __webpack_require__(/*! ../addon-manager */ "./src/addon-manager.js");
const Constants = __webpack_require__(/*! ../constants */ "./src/constants.js");
const EventEmitter = __webpack_require__(/*! events */ "events");

class Actions extends EventEmitter {

  constructor() {
    super();

    /**
     * A map of action requests.
     */
    this.actions = {};

    /**
     * A counter to generate action IDs.
     */
    this.nextId = 0;

    this.onActionStatus = this.onActionStatus.bind(this);
  }

  /**
   * Reset actions state.
   */
  clearState() {
    this.nextId = 0;
    for (const id in this.actions) {
      this.remove(id);
    }
  }

  /**
   * Generate an ID for a new action.
   *
   * @returns {integer} An id.
   */
  generateId() {
    return `${++this.nextId}`;
  }

  /**
   * Get a particular action.
   *
   * @returns {Object} The specified action, or undefined if the action
   * doesn't exist.
   */
  get(id) {
    return this.actions[id];
  }

  /**
   * Get a list of all current actions.
   *
   * @returns {Array} A list of current actions.
   */
  getAll() {
    return Object.keys(this.actions).map((id) => {
      return this.actions[id];
    });
  }

  /**
   * Get only the actions which are not associated with a specific thing and
   * therefore belong to the root Gateway
   */
  getGatewayActions(actionName) {
    return this.getAll().filter((action) => {
      return !action.thingId;
    }).filter((action) => {
      if (actionName) {
        return actionName === action.name;
      }

      return true;
    }).map((action) => {
      return {[action.name]: action.getDescription()};
    });
  }


  /**
   * Get only the actions which are associated with a specific thing
   */
  getByThing(thingId, actionName) {
    return this.getAll().filter((action) => {
      return action.thingId === thingId;
    }).filter((action) => {
      if (actionName) {
        return actionName === action.name;
      }

      return true;
    }).map((action) => {
      return {[action.name]: action.getDescription()};
    });
  }

  /**
   * Add a new action.
   *
   * @param {Action} action An Action object.
   * @return {Promise} resolved when action added or rejected if failed
   */
  add(action) {
    const id = action.id;
    this.actions[id] = action;

    // Call this initially for the 'created' status.
    this.onActionStatus(action);

    action.on(Constants.ACTION_STATUS, this.onActionStatus);

    if (action.thingId) {
      return Things.getThing(action.thingId).then((thing) => {
        const success = thing.addAction(action);
        if (!success) {
          delete this.actions[id];
          throw new Error(`Invalid thing action name: "${action.name}"`);
        }
      });
    }

    // Only update the action status if it's being handled internally
    action.updateStatus('pending');

    switch (action.name) {
      case 'pair':
        AddonManager.addNewThing(action.input.timeout).then(() => {
          action.updateStatus('completed');
        }).catch((error) => {
          action.error = error;
          action.updateStatus('error');
          console.error('Thing was not added');
          console.error(error);
        });
        break;
      case 'unpair':
        if (action.input.id) {
          const _finally = () => {
            console.log('unpair: thing:', action.input.id, 'was unpaired');
            Things.removeThing(action.input.id).then(() => {
              action.updateStatus('completed');
            }).catch((error) => {
              action.error = error;
              action.updateStatus('error');
              console.error('unpair of thing:',
                            action.input.id, 'failed.');
              console.error(error);
            });
          };

          AddonManager.removeThing(action.input.id).then(_finally, _finally);
        } else {
          const msg = 'unpair missing "id" parameter.';
          action.error = msg;
          action.updateStatus('error');
          console.error(msg);
        }
        break;
      default:
        delete this.actions[id];
        return Promise.reject(
          new Error(`Invalid action name: "${action.name}"`)
        );
    }
    return Promise.resolve();
  }

  /**
   * Forward the actionStatus event
   */
  onActionStatus(action) {
    this.emit(Constants.ACTION_STATUS, action);
  }

  /**
   * Remove an action from the action list.
   *
   * @param integer id Action ID.
   *
   * If the action has not yet been completed, it is cancelled.
   */
  remove(id) {
    const action = this.actions[id];
    if (!action) {
      throw `Invalid action id: ${id}`;
    }

    if (action.status === 'pending') {
      if (action.thingId) {
        Things.getThing(action.thingId).then((thing) => {
          if (!thing.removeAction(action)) {
            throw `Invalid thing action name: "${action.name}"`;
          }
        }).catch((err) => {
          console.error('Error removing thing action:', err);
        });
      } else {
        switch (action.name) {
          case 'pair':
            AddonManager.cancelAddNewThing();
            break;
          case 'unpair':
            AddonManager.cancelRemoveThing(action.input.id);
            break;
          default:
            throw `Invalid action name: "${action.name}"`;
        }
      }
    }

    action.updateStatus('deleted');
    action.removeListener(Constants.ACTION_STATUS, this.onActionStatus);
    delete this.actions[id];
  }
}

module.exports = new Actions();


/***/ }),

/***/ "./src/models/event.js":
/*!*****************************!*\
  !*** ./src/models/event.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Event Model.
 *
 * Manages Event data model
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const {Utils} = __webpack_require__(/*! gateway-addon */ "gateway-addon");

class Event {
  /**
   * Create a new Event
   * @param {String} name
   * @param {*} data
   * @param {String?} thingId
   * @param {String?} timestamp
   */
  constructor(name, data, thingId, timestamp) {
    this.name = name;
    this.data = typeof data === 'undefined' ? null : data;
    this.thingId = thingId;
    this.timestamp = timestamp || Utils.timestamp();
  }

  getDescription() {
    return {
      data: this.data,
      timestamp: this.timestamp,
    };
  }
}

module.exports = Event;


/***/ }),

/***/ "./src/models/events.js":
/*!******************************!*\
  !*** ./src/models/events.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Events.
 *
 * Manages a collection of Events.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Things = __webpack_require__(/*! ../models/things */ "./src/models/things.js");

class Events {

  constructor() {
    this.events = [];
  }

  /**
   * Reset events state.
   */
  clearState() {
    this.events = [];
  }

  /**
   * Get only the events which are not associated with a specific thing and
   * therefore belong to the root Gateway.
   */
  getGatewayEvents(eventName) {
    return this.events.filter((event) => {
      return !event.thingId;
    }).filter((event) => {
      if (eventName) {
        return eventName === event.name;
      }

      return true;
    }).map((event) => {
      return {[event.name]: event.getDescription()};
    });
  }


  /**
   * Get only the events which are associated with a specific thing.
   */
  getByThing(thingId, eventName) {
    return this.events.filter((event) => {
      return event.thingId === thingId;
    }).filter((event) => {
      if (eventName) {
        return eventName === event.name;
      }

      return true;
    }).map((event) => {
      return {[event.name]: event.getDescription()};
    });
  }

  /**
   * Add a new event.
   *
   * @param {Object} event An Event object.
   * @returns {Promise} Promise which resolves when the event has been added.
   */
  add(event) {
    this.events.push(event);

    if (event.thingId) {
      return Things.getThing(event.thingId).then((thing) => {
        thing.dispatchEvent(event);
      }).catch(() => {
        console.warn('Received event for unknown thing:', event.thingId);
      });
    }

    return Promise.resolve();
  }
}

module.exports = new Events();


/***/ }),

/***/ "./src/models/jsonwebtoken.js":
/*!************************************!*\
  !*** ./src/models/jsonwebtoken.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * JSONWebToken Model.
 *
 * Contains logic to create and verify JWT tokens.
 *
 * This file contains the logic to generate public/private key pairs and return
 * them in the format openssl/crypto expects.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const {v4: uuidv4} = __webpack_require__(/*! uuid */ "uuid");
const jwt = __webpack_require__(/*! jsonwebtoken */ "jsonwebtoken");
const assert = __webpack_require__(/*! assert */ "assert");

const ec = __webpack_require__(/*! ../ec-crypto */ "./src/ec-crypto.ts");
const Database = __webpack_require__(/*! ../db */ "./src/db.js");
const Settings = __webpack_require__(/*! ./settings */ "./src/models/settings.js");

const ROLE_USER_TOKEN = 'user_token';

class JSONWebToken {

  /**
   * Verify a JWT by it's signature.
   *
   * @return {JSONWebToken|bool} false when invalid JSONWebToken when valid.
   */
  static async verifyJWT(sig) {
    const decoded = jwt.decode(sig, {
      complete: true,
    });

    if (!decoded || !decoded.header || !decoded.header.kid) {
      return false;
    }

    const {kid} = decoded.header;

    const tokenData = await Database.getJSONWebTokenByKeyId(kid);
    if (!tokenData) {
      return false;
    }

    const token = new JSONWebToken(tokenData);
    token.payload = token.verify(sig);
    if (token.payload) {
      return token;
    }

    return false;
  }

  /**
   * Issue a JWT token and store it in the database.
   *
   * @param {User} user to issue token for.
   * @return {string} the JWT token signature.
   */
  static async issueToken(user) {
    const {sig, token} = await this.create(user);
    await Database.createJSONWebToken(token);
    return sig;
  }

  /**
   * Issue a JWT token for an OAuth2 client and store it in the
   * database.
   *
   * @param {ClientRegistry} client to issue token for.
   * @param {number} user user id associated with token
   * @param {{role: String, scope: String}} payload of token
   * @return {string} the JWT token signature.
   */
  static async issueOAuthToken(client, user, payload) {
    const {sig, token} = await this.create(user, Object.assign({
      client_id: client.id,
    }, payload));
    await Database.createJSONWebToken(token);
    return sig;
  }

  /**
   * Remove a JWT token from the database by it's key id.
   *
   * @param {string} keyId of the record to remove.
   * @return bool true when a record was deleted.
   */
  static async revokeToken(keyId) {
    assert(typeof keyId === 'string');
    return Database.deleteJSONWebTokenByKeyId(keyId);
  }

  /**
   * @param number user id of the user to create a token for.
   * @return {Object} containing .sig (the jwt signature) and .token
   *  for storage in the database.
   */
  static async create(user, payload = {role: ROLE_USER_TOKEN}) {
    const pair = ec.generateKeyPair();

    const keyId = uuidv4();
    const tunnelInfo = await Settings.getTunnelInfo();
    const issuer = tunnelInfo.tunnelDomain;
    const options = {
      algorithm: ec.JWT_ALGORITHM,
      keyid: keyId,
    };
    if (issuer) {
      options.issuer = issuer;
    }

    const sig = jwt.sign(payload, pair.private, options);

    const token = {
      user,
      issuedAt: new Date(),
      publicKey: pair.public,
      keyId,
      payload,
    };

    return {sig, token};
  }

  constructor(obj) {
    const {user, issuedAt, publicKey, keyId} = obj;
    assert(typeof user === 'number');
    assert(issuedAt);
    assert(typeof publicKey === 'string');
    assert(typeof keyId === 'string');
    this.user = user;
    this.issuedAt = issuedAt;
    this.publicKey = publicKey;
    this.keyId = keyId;
    this.payload = {};
  }

  /**
   * Verify that the given JWT matches this token.
   *
   * @param string sig jwt token.
   * @returns {Object|false} jwt payload if signature matches.
   */
  verify(sig) {
    try {
      return jwt.verify(sig, this.publicKey, {
        algorithms: [ec.JWT_ALGORITHM],
      });
    } catch (err) {
      // If this error is thrown we know the token is invalid.
      if (err.name === 'JsonWebTokenError') {
        return false;
      }
      throw err;
    }
  }

}

module.exports = JSONWebToken;


/***/ }),

/***/ "./src/models/logs.js":
/*!****************************!*\
  !*** ./src/models/logs.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const config = __webpack_require__(/*! config */ "config");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const sqlite3 = __webpack_require__(/*! sqlite3 */ "sqlite3").verbose();

const AddonManager = __webpack_require__(/*! ../addon-manager */ "./src/addon-manager.js");
const Constants = __webpack_require__(/*! ../constants */ "./src/constants.js");
const UserProfile = __webpack_require__(/*! ../user-profile */ "./src/user-profile.js");

const METRICS_NUMBER = 'metricsNumber';
const METRICS_BOOLEAN = 'metricsBoolean';
const METRICS_OTHER = 'metricsOther';

class Logs {
  constructor() {
    this.db = null;
    this.idToDescr = {};
    this.descrToId = {};
    this.onPropertyChanged = this.onPropertyChanged.bind(this);
    this.clearOldMetrics = this.clearOldMetrics.bind(this);

    AddonManager.on(Constants.PROPERTY_CHANGED, this.onPropertyChanged);

    // Clear out old metrics every hour
    this.clearOldMetricsInterval =
      setInterval(this.clearOldMetrics, 60 * 60 * 1000);
  }

  clear() {
    this.idToDescr = {};
    this.descrToId = {};
    return Promise.all([
      METRICS_NUMBER,
      METRICS_BOOLEAN,
      METRICS_OTHER,
      'metricIds',
    ].map((table) => {
      return this.run(`DELETE FROM ${table}`);
    }));
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }

    AddonManager.removeListener(Constants.PROPERTY_CHANGED,
                                this.onPropertyChanged);
    clearInterval(this.clearOldMetricsInterval);
  }

  open() {
    // Get all things, create table if not exists
    // If the database is already open, just return.
    if (this.db) {
      return;
    }

    const filename = path.join(UserProfile.logDir, 'logs.sqlite3');

    let exists = fs.existsSync(filename);
    const removeBeforeOpen = config.get('database.removeBeforeOpen');
    if (exists && removeBeforeOpen) {
      fs.unlinkSync(filename);
      exists = false;
    }

    console.log(exists ? 'Opening' : 'Creating', 'database:', filename);
    // Open database or create it if it doesn't exist
    this.db = new sqlite3.Database(filename);

    // Set a timeout in case the database is locked. 10 seconds is a bit long,
    // but it's better than crashing.
    this.db.configure('busyTimeout', 10000);

    this.createTables().then(() => {
      this.loadKnownMetrics();
    });
  }

  createTables() {
    return Promise.all([
      this.createMetricTable(METRICS_NUMBER, typeof 0),
      this.createMetricTable(METRICS_BOOLEAN, typeof false),
      this.createMetricTable(METRICS_OTHER, typeof {}),
      this.createIdTable(),
    ]);
  }

  createIdTable() {
    // We use a version of sqlite which doesn't support foreign keys so id is
    // an integer referenced by the metric tables
    return this.run(`CREATE TABLE IF NOT EXISTS metricIds (
      id INTEGER PRIMARY KEY ASC,
      descr TEXT,
      maxAge INTEGER
    );`, []);
  }

  createMetricTable(id, type) {
    const table = id;
    let sqlType = 'TEXT';

    switch (type) {
      case 'number':
        sqlType = 'REAL';
        break;
      case 'boolean':
        sqlType = 'INTEGER';
        break;
    }

    return this.run(`CREATE TABLE IF NOT EXISTS ${table} (
      id INTEGER,
      date DATE,
      value ${sqlType}
    );`, []);
  }

  async loadKnownMetrics() {
    const rows = await this.all('SELECT id, descr, maxAge FROM metricIds');
    for (const row of rows) {
      this.idToDescr[row.id] = JSON.parse(row.descr);
      this.idToDescr[row.id].maxAge = row.maxAge;
      this.descrToId[row.descr] = row.id;
    }
  }

  propertyDescr(thingId, propId) {
    return {
      type: 'property',
      thing: thingId,
      property: propId,
    };
  }

  actionDescr(thingId, actionId) {
    return {
      type: 'action',
      thing: thingId,
      action: actionId,
    };
  }

  eventDescr(thingId, eventId) {
    return {
      type: 'event',
      thing: thingId,
      event: eventId,
    };
  }

  /**
   * @param {Object} rawDescr
   * @param {number} maxAge
   */
  async registerMetric(rawDescr, maxAge) {
    const descr = JSON.stringify(rawDescr);
    if (this.descrToId.hasOwnProperty(descr)) {
      return;
    }
    const result = await this.run(
      'INSERT INTO metricIds (descr, maxAge) VALUES (?, ?)',
      [descr, maxAge]
    );
    const id = result.lastID;
    this.idToDescr[id] = Object.assign({maxAge}, rawDescr);
    this.descrToId[descr] = id;
    return id;
  }

  /**
   * @param {Object} rawDescr
   * @param {any} rawValue
   * @param {Date} date
   */
  async insertMetric(rawDescr, rawValue, date) {
    const descr = JSON.stringify(rawDescr);
    if (!this.descrToId.hasOwnProperty(descr)) {
      return;
    }
    const id = this.descrToId[descr];

    let table = METRICS_OTHER;
    let value = rawValue;

    switch (typeof rawValue) {
      case 'boolean':
        table = METRICS_BOOLEAN;
        break;
      case 'number':
        table = METRICS_NUMBER;
        break;
      default:
        value = JSON.stringify(rawValue);
        break;
    }

    await this.run(
      `INSERT INTO ${table} (id, date, value) VALUES (?, ?, ?)`,
      [id, date, value]
    );
  }

  /**
   * Remove a metric with all its associated data
   * @param {Object} rawDescr
   */
  async unregisterMetric(rawDescr) {
    const descr = JSON.stringify(rawDescr);
    const id = this.descrToId[descr];
    await Promise.all([
      'metricIds',
      METRICS_NUMBER,
      METRICS_BOOLEAN,
      METRICS_OTHER,
    ].map((table) => {
      return this.run(`DELETE FROM ${table} WHERE id = ?`,
                      [id]);
    }));
    delete this.descrToId[descr];
    delete this.idToDescr[id];
  }

  onPropertyChanged(property) {
    const thingId = property.device.id;
    const descr = this.propertyDescr(thingId, property.name);
    this.insertMetric(descr, property.value, new Date());
  }

  onEvent() {
  }

  onAction() {
  }

  buildQuery(table, id, start, end, limit) {
    const conditions = [];
    const params = [];
    if (typeof id === 'number') {
      conditions.push('id = ?');
      params.push(id);
    }
    if (start || start === 0) {
      conditions.push('date > ?');
      params.push(start);
    }
    if (end) {
      conditions.push('date < ?');
      params.push(end);
    }

    let query = `SELECT id, value, date FROM ${table}`;
    if (conditions.length > 0) {
      query += ' WHERE ';
      query += conditions.join(' AND ');
    }
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    return {
      query,
      params,
    };
  }

  async loadMetrics(out, table, transformer, id, start, end) {
    const {query, params} = this.buildQuery(table, id, start, end);
    const rows = await this.all(query, params);

    for (const row of rows) {
      const descr = this.idToDescr[row.id];
      if (!descr) {
        console.error('Failed to load row:', row);
        continue;
      }
      if (!out.hasOwnProperty(descr.thing)) {
        out[descr.thing] = {};
      }
      if (!out[descr.thing].hasOwnProperty(descr.property)) {
        out[descr.thing][descr.property] = [];
      }
      const value = transformer ? transformer(row.value) : row.value;
      out[descr.thing][descr.property].push({
        value: value,
        date: row.date,
      });
    }
  }

  async getAll(start, end) {
    const out = {};
    await this.loadMetrics(out, METRICS_NUMBER, null, null, start, end);
    await this.loadMetrics(out, METRICS_BOOLEAN, (value) => !!value, null,
                           start, end);
    await this.loadMetrics(out, METRICS_OTHER, (value) => JSON.parse(value),
                           null, start, end);
    return out;
  }

  async get(thingId, start, end) {
    const all = await this.getAll(start, end);
    return all[thingId];
  }

  async getProperty(thingId, propertyName, start, end) {
    const descr = this.propertyDescr(thingId, propertyName);
    const out = {};
    const id = this.descrToId[descr];
    // TODO determine property type to only do one of these
    await this.loadMetrics(out, METRICS_NUMBER, null, id, start, end);
    await this.loadMetrics(out, METRICS_BOOLEAN, (value) => !!value, id, start,
                           end);
    await this.loadMetrics(out, METRICS_OTHER, (value) => JSON.parse(value),
                           id, start, end);
    return out[thingId][propertyName];
  }

  async getSchema() {
    await this.loadKnownMetrics();
    const schema = [];
    for (const id in this.idToDescr) {
      const descr = this.idToDescr[id];
      schema.push({
        id,
        thing: descr.thing,
        property: descr.property,
      });
    }
    return schema;
  }

  async streamMetrics(callback, table, transformer, id, start, end) {
    const MAX_ROWS = 10000;
    start = start || 0;
    end = end || Date.now();

    let queryCompleted = false;
    while (!queryCompleted) {
      const {query, params} = this.buildQuery(table, id, start, end, MAX_ROWS);
      const rows = await this.all(query, params);
      if (rows.length < MAX_ROWS) {
        queryCompleted = true;
      }
      callback(rows.map((row) => {
        const value = transformer ? transformer(row.value) : row.value;
        return {
          id: row.id,
          value: value,
          date: row.date,
        };
      }));
      if (!queryCompleted) {
        const lastRow = rows[rows.length - 1];
        start = lastRow.date;
        if (start >= end) {
          queryCompleted = true;
        }
      }
    }
  }

  async streamAll(callback, start, end) {
    // Stream all three in parallel, which should look cool
    await Promise.all([
      this.streamMetrics(callback, METRICS_NUMBER, null, null, start, end),
      this.streamMetrics(callback, METRICS_BOOLEAN,
                         (value) => !!value, null, start, end),
      this.streamMetrics(callback, METRICS_OTHER,
                         (value) => JSON.parse(value), null, start, end),
    ]);
  }

  async clearOldMetrics() {
    await this.loadKnownMetrics();
    for (const id in this.idToDescr) {
      const descr = this.idToDescr[id];
      if (descr.maxAge <= 0) {
        continue;
      }
      const date = new Date(Date.now() - descr.maxAge);
      await Promise.all([
        METRICS_NUMBER,
        METRICS_BOOLEAN,
        METRICS_OTHER,
      ].map((table) => {
        return this.run(`DELETE FROM ${table} WHERE id = ? AND date < ?`,
                        [id, date]);
      }));
    }
  }

  all(sql, ...params) {
    return new Promise((accept, reject) => {
      params.push(function(err, rows) {
        if (err) {
          reject(err);
          return;
        }
        accept(rows);
      });

      try {
        this.db.all(sql, ...params);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Run a SQL statement
   * @param {String} sql
   * @param {Array<any>} values
   * @return {Promise<Object>} promise resolved to `this` of statement result
   */
  run(sql, values) {
    return new Promise((accept, reject) => {
      try {
        this.db.run(sql, values, function(err) {
          if (err) {
            reject(err);
            return;
          }
          // node-sqlite puts results on "this" so avoid arrrow fn.
          accept(this);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new Logs();



/***/ }),

/***/ "./src/models/oauthclients.ts":
/*!************************************!*\
  !*** ./src/models/oauthclients.ts ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! url */ "url");
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(url__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _oauth_types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../oauth-types */ "./src/oauth-types.ts");



const config = __webpack_require__(/*! config */ "config");
const Database = __webpack_require__(/*! ../db */ "./src/db.js");
class OAuthClients {
    constructor() {
        this.clients = new Map();
    }
    register(client) {
        if (this.clients.get(client.id)) {
            this.clients.get(client.id).push(client);
        }
        else {
            this.clients.set(client.id, [client]);
        }
    }
    get(id, redirectUri) {
        const clients = this.clients.get(id);
        if (!clients) {
            return;
        }
        if (!redirectUri) {
            return clients[0];
        }
        for (let client of clients) {
            if (client.redirect_uri.href === redirectUri.href) {
                return client;
            }
        }
        return clients[0];
    }
    async getAuthorized(userId) {
        let jwts = await Database.getJSONWebTokensByUser(userId);
        let authorized = new Map();
        for (let jwt of jwts) {
            let payload = JSON.parse(jwt.payload);
            if (payload.role !== 'access_token') {
                continue;
            }
            if (!this.clients.has(payload.client_id)) {
                console.warn('Orphaned access_token', jwt);
                await Database.deleteJSONWebTokenByKeyId(jwt.keyId);
                continue;
            }
            const defaultClient = this.clients.get(payload.client_id)[0];
            if (!defaultClient) {
                continue;
            }
            authorized.set(payload.client_id, defaultClient);
        }
        return Array.from(authorized.values());
    }
    async revokeClientAuthorization(userId, clientId) {
        let jwts = await Database.getJSONWebTokensByUser(userId);
        for (let jwt of jwts) {
            let payload = JSON.parse(jwt.payload);
            if (payload.client_id === clientId) {
                await Database.deleteJSONWebTokenByKeyId(jwt.keyId);
            }
        }
    }
}
let oauthClients = new OAuthClients();
if (config.get('oauthTestClients')) {
    oauthClients.register(new _oauth_types__WEBPACK_IMPORTED_MODULE_1__["ClientRegistry"](new url__WEBPACK_IMPORTED_MODULE_0__["URL"]('http://127.0.0.1:31338/callback'), 'test', 'Test OAuth Client', 'super secret', '/things:readwrite'));
    oauthClients.register(new _oauth_types__WEBPACK_IMPORTED_MODULE_1__["ClientRegistry"](new url__WEBPACK_IMPORTED_MODULE_0__["URL"]('http://127.0.0.1:31338/bonus-entry'), 'test', 'Test OAuth Client', 'other secret', '/things:readwrite'));
    oauthClients.register(new _oauth_types__WEBPACK_IMPORTED_MODULE_1__["ClientRegistry"](new url__WEBPACK_IMPORTED_MODULE_0__["URL"]('http://localhost:8888/callback'), 'mycroft', 'Mycroft', 'bDaQN6yDgI0GlvJL2UVcIAb4M8c', '/things:readwrite'));
}
oauthClients.register(new _oauth_types__WEBPACK_IMPORTED_MODULE_1__["ClientRegistry"](new url__WEBPACK_IMPORTED_MODULE_0__["URL"]('https://gateway.localhost/oauth/local-token-service'), 'local-token', 'Local Token Service', 'super secret', '/things:readwrite'));
oauthClients.register(new _oauth_types__WEBPACK_IMPORTED_MODULE_1__["ClientRegistry"](new url__WEBPACK_IMPORTED_MODULE_0__["URL"]('https://api.mycroft.ai/v1/auth/callback'), 'mycroft', 'Mycroft', 'bDaQN6yDgI0GlvJL2UVcIAb4M8c', '/things:readwrite'));
oauthClients.register(new _oauth_types__WEBPACK_IMPORTED_MODULE_1__["ClientRegistry"](new url__WEBPACK_IMPORTED_MODULE_0__["URL"]('https://api-test.mycroft.ai/v1/auth/callback'), 'mycroft', 'Mycroft', 'bDaQN6yDgI0GlvJL2UVcIAb4M8c', '/things:readwrite'));
/* harmony default export */ __webpack_exports__["default"] = (oauthClients);


/***/ }),

/***/ "./src/models/settings.js":
/*!********************************!*\
  !*** ./src/models/settings.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Settings Model.
 *
 * Manages the getting and setting of settings
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const config = __webpack_require__(/*! config */ "config");
const Database = __webpack_require__(/*! ../db */ "./src/db.js");
const util = __webpack_require__(/*! util */ "util");

const DEBUG =  false || ("development" === 'test');

const Settings = {

  /**
   * Get a setting.
   *
   * @param {String} key Key of setting to get.
   */
  get: (key) => Database.getSetting(key).catch((e) => {
    console.error('Failed to get', key);
    throw e;
  }),

  /**
   * Set a setting.
   *
   * @param {String} key Key of setting to set.
   * @param value Value to set key to.
   */
  set: (key, value) => Database.setSetting(key, value).then(() => {
    if (DEBUG) {
      console.log('Set', key, 'to',
                  util.inspect(value, {breakLength: Infinity}));
    }
    return value;
  }).catch((e) => {
    console.error('Failed to set', key, 'to',
                  util.inspect(value, {breakLength: Infinity}));
    throw e;
  }),

  /**
   * Delete a setting.
   *
   * @param {String} key Key of setting to delete.
   */
  delete: (key) => Database.deleteSetting(key).catch((e) => {
    console.error('Failed to delete', key);
    throw e;
  }),

  /**
   * Get an object of all tunnel settings
   * @return {localDomain, mDNSstate, tunnelDomain}
   */
  getTunnelInfo: async () => {
    // Check to see if we have a tunnel endpoint first
    const result = await Settings.get('tunneltoken');
    let localDomain;
    let mDNSstate;
    let tunnelEndpoint;

    if (typeof result === 'object') {
      console.log(`Tunnel domain found. Tunnel name is: ${result.name} and`,
                  `tunnel domain is: ${config.get('ssltunnel.domain')}`);
      tunnelEndpoint =
        `https://${result.name}.${config.get('ssltunnel.domain')}`;
    } else {
      tunnelEndpoint = 'Not set.';
    }

    // Find out our default local DNS name Check for a previous name in the
    // DB, if that does not exist use the default.
    try {
      mDNSstate = await Settings.get('multicastDNSstate');
      localDomain = await Settings.get('localDNSname');
      // If our DB is empty use defaults
      if (typeof mDNSstate === 'undefined') {
        mDNSstate = config.get('settings.defaults.mdns.enabled');
      }
      if (typeof localDomain === 'undefined') {
        localDomain = config.get('settings.defaults.mdns.domain');
      }
    } catch (err) {
      // Catch this DB error. Since we don't know what state the mDNS process
      // should be in make sure it's off
      console.error(`Error getting DB entry for multicast from the DB: ${err}`);
      localDomain = config.get('settings.defaults.mdns.domain');
    }

    console.log(`Tunnel name is set to: ${tunnelEndpoint}`);
    console.log(`Local mDNS Service Domain Name is: ${localDomain}`);
    return {
      localDomain,
      mDNSstate,
      tunnelDomain: tunnelEndpoint,
    };
  },
};

module.exports = Settings;


/***/ }),

/***/ "./src/models/thing.js":
/*!*****************************!*\
  !*** ./src/models/thing.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Thing Model.
 *
 * Represents a Web Thing.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Constants = __webpack_require__(/*! ../constants */ "./src/constants.js");
const Database = __webpack_require__(/*! ../db */ "./src/db.js");
const EventEmitter = __webpack_require__(/*! events */ "events");
const Router = __webpack_require__(/*! ../router */ "./src/router.js");
const UserProfile = __webpack_require__(/*! ../user-profile */ "./src/user-profile.js");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const tmp = __webpack_require__(/*! tmp */ "tmp");

class Thing {
  /**
   * Thing constructor.
   *
   * Create a Thing object from an id and a valid Thing description.
   *
   * @param {String} id Unique ID.
   * @param {Object} description Thing description.
   */
  constructor(id, description) {
    if (!id || !description) {
      console.error('id and description needed to create new Thing');
      return;
    }
    // Parse the Thing Description
    this.id = id;
    this.title = description.title || description.name || '';
    this['@context'] =
      description['@context'] || 'https://iot.mozilla.org/schemas';
    this['@type'] = description['@type'] || [];
    this.description = description.description || '';
    this.href = `${Constants.THINGS_PATH}/${encodeURIComponent(this.id)}`;
    this.properties = {};
    this.actions = description.actions || {};
    this.events = description.events || {};
    this.connected = false;
    this.eventsDispatched = [];
    this.emitter = new EventEmitter();
    if (description.properties) {
      for (const propertyName in description.properties) {
        const property = description.properties[propertyName];

        if (property.hasOwnProperty('href')) {
          delete property.href;
        }

        if (property.hasOwnProperty('links')) {
          property.links = property.links.filter((link) => {
            return link.rel && link.rel !== 'property';
          }).map((link) => {
            if (link.proxy) {
              delete link.proxy;
              link.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${link.href}`;
            }

            return link;
          });
        } else {
          property.links = [];
        }

        // Give the property a URL
        property.links.push({
          rel: 'property',
          href: `${this.href}${Constants.PROPERTIES_PATH}/${encodeURIComponent(propertyName)}`,
        });

        this.properties[propertyName] = property;
      }
    }
    this.floorplanX = description.floorplanX;
    this.floorplanY = description.floorplanY;
    this.layoutIndex = description.layoutIndex;
    this.selectedCapability = description.selectedCapability;
    this.links = [
      {
        rel: 'properties',
        href: `${this.href}/properties`,
      },
      {
        rel: 'actions',
        href: `${this.href}/actions`,
      },
      {
        rel: 'events',
        href: `${this.href}/events`,
      },
    ];

    const uiLink = {
      rel: 'alternate',
      mediaType: 'text/html',
      href: this.href,
    };

    if (description.hasOwnProperty('baseHref') && description.baseHref) {
      Router.addProxyServer(this.id, description.baseHref);
    }

    if (description.hasOwnProperty('links')) {
      for (const link of description.links) {
        if (['properties', 'actions', 'events'].includes(link.rel)) {
          continue;
        }

        if (link.rel === 'alternate' && link.mediaType === 'text/html') {
          if (link.proxy) {
            delete link.proxy;
            uiLink.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${link.href}`;
          } else {
            uiLink.href = link.href;
          }
        } else {
          if (link.proxy) {
            delete link.proxy;
            link.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${link.href}`;
          }

          this.links.push(link);
        }
      }
    }

    this.links.push(uiLink);

    for (const actionName in this.actions) {
      const action = this.actions[actionName];

      if (action.hasOwnProperty('href')) {
        delete action.href;
      }

      if (action.hasOwnProperty('links')) {
        action.links = action.links.filter((link) => {
          return link.rel && link.rel !== 'action';
        }).map((link) => {
          if (link.proxy) {
            delete link.proxy;
            link.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${link.href}`;
          }

          return link;
        });
      } else {
        action.links = [];
      }

      // Give the action a URL
      action.links.push({
        rel: 'action',
        href: `${this.href}${Constants.ACTIONS_PATH}/${encodeURIComponent(actionName)}`,
      });
    }

    for (const eventName in this.events) {
      const event = this.events[eventName];

      if (event.hasOwnProperty('href')) {
        delete event.href;
      }

      if (event.hasOwnProperty('links')) {
        event.links = event.links.filter((link) => {
          return link.rel && link.rel !== 'event';
        }).map((link) => {
          if (link.proxy) {
            delete link.proxy;
            link.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${link.href}`;
          }

          return link;
        });
      } else {
        event.links = [];
      }

      // Give the event a URL
      event.links.push({
        rel: 'event',
        href: `${this.href}${Constants.EVENTS_PATH}/${encodeURIComponent(eventName)}`,
      });
    }

    this.iconHref = null;
    if (description.iconHref) {
      this.iconHref = description.iconHref;
    } else if (description.iconData) {
      this.setIcon(description.iconData, false);
    }
  }

  /**
   * Set the x and y co-ordinates for a Thing on the floorplan.
   *
   * @param {number} x The x co-ordinate on floorplan (0-100).
   * @param {number} y The y co-ordinate on floorplan (0-100).
   * @return {Promise} A promise which resolves with the description set.
   */
  setCoordinates(x, y) {
    this.floorplanX = x;
    this.floorplanY = y;
    return Database.updateThing(this.id, this.getDescription())
      .then((descr) => {
        this.emitter.emit(Constants.MODIFIED);
        return descr;
      });
  }

  /**
   * Set the layout index for a Thing.
   *
   * @param {number} index The new layout index.
   * @return {Promise} A promise which resolves with the description set.
   */
  setLayoutIndex(index) {
    this.layoutIndex = index;
    return Database.updateThing(this.id, this.getDescription())
      .then((descr) => {
        this.emitter.emit(Constants.MODIFIED);
        return descr;
      });
  }

  /**
   * Set the title of this Thing.
   *
   * @param {String} title The new title
   * @return {Promise} A promise which resolves with the description set.
   */
  setTitle(title) {
    this.title = title;
    return Database.updateThing(this.id, this.getDescription())
      .then((descr) => {
        this.emitter.emit(Constants.MODIFIED);
        return descr;
      });
  }

  /**
   * Set the custom icon for this Thing.
   *
   * @param {Object} iconData Base64-encoded icon and its mime-type.
   * @param {Boolean} updateDatabase Whether or not to update the database after
   *                                 setting.
   */
  setIcon(iconData, updateDatabase) {
    if (!iconData.data ||
        !['image/jpeg', 'image/png', 'image/svg+xml'].includes(iconData.mime)) {
      console.error('Invalid icon data:', iconData);
      return;
    }

    if (this.iconHref) {
      try {
        fs.unlinkSync(path.join(UserProfile.baseDir, this.iconHref));
      } catch (e) {
        console.error('Failed to remove old icon:', e);
        // continue
      }

      this.iconHref = null;
    }

    let extension;
    switch (iconData.mime) {
      case 'image/jpeg':
        extension = '.jpg';
        break;
      case 'image/png':
        extension = '.png';
        break;
      case 'image/svg+xml':
        extension = '.svg';
        break;
    }

    let tempfile;
    try {
      tempfile = tmp.fileSync({
        mode: parseInt('0644', 8),
        template: path.join(UserProfile.uploadsDir, `XXXXXX${extension}`),
        detachDescriptor: true,
        keep: true,
      });

      const data = Buffer.from(iconData.data, 'base64');
      fs.writeFileSync(tempfile.fd, data);
    } catch (e) {
      console.error('Failed to write icon:', e);
      if (tempfile) {
        try {
          fs.unlinkSync(tempfile.fd);
        } catch (e) {
          // pass
        }
      }

      return;
    }

    this.iconHref = path.join('/uploads', path.basename(tempfile.name));

    if (updateDatabase) {
      return Database.updateThing(this.id, this.getDescription())
        .then((descr) => {
          this.emitter.emit(Constants.MODIFIED);
          return descr;
        });
    }
  }

  /**
   * Set the selected capability of this Thing.
   *
   * @param {String} capability The selected capability
   * @return {Promise} A promise which resolves with the description set.
   */
  setSelectedCapability(capability) {
    this.selectedCapability = capability;
    return Database.updateThing(this.id, this.getDescription())
      .then((descr) => {
        this.emitter.emit(Constants.MODIFIED);
        return descr;
      });
  }

  /**
   * Dispatch an event to all listeners subscribed to the Thing
   * @param {Event} event
   */
  dispatchEvent(event) {
    if (!event.thingId) {
      event.thingId = this.id;
    }
    this.eventsDispatched.push(event);
    this.emitter.emit(Constants.EVENT, event);
  }

  /**
   * Add a subscription to the Thing's events
   * @param {Function} callback
   */
  addEventSubscription(callback) {
    this.emitter.on(Constants.EVENT, callback);
  }

  /**
   * Remove a subscription to the Thing's events
   * @param {Function} callback
   */
  removeEventSubscription(callback) {
    this.emitter.removeListener(Constants.EVENT, callback);
  }

  /**
   * Add a subscription to the Thing's connected state
   * @param {Function} callback
   */
  addConnectedSubscription(callback) {
    this.emitter.on(Constants.CONNECTED, callback);
    callback(this.connected);
  }

  /**
   * Remove a subscription to the Thing's connected state
   * @param {Function} callback
   */
  removeConnectedSubscription(callback) {
    this.emitter.removeListener(Constants.CONNECTED, callback);
  }

  /**
   * Add a subscription to the Thing's modified state
   * @param {Function} callback
   */
  addModifiedSubscription(callback) {
    this.emitter.on(Constants.MODIFIED, callback);
  }

  /**
   * Remove a subscription to the Thing's modified state
   * @param {Function} callback
   */
  removeModifiedSubscription(callback) {
    this.emitter.removeListener(Constants.MODIFIED, callback);
  }

  /**
   * Add a subscription to the Thing's removed state
   * @param {Function} callback
   */
  addRemovedSubscription(callback) {
    this.emitter.on(Constants.REMOVED, callback);
  }

  /**
   * Remove a subscription to the Thing's removed state
   * @param {Function} callback
   */
  removeRemovedSubscription(callback) {
    this.emitter.removeListener(Constants.REMOVED, callback);
  }


  /**
   * Get a JSON Thing Description for this Thing.
   *
   * @param {String} reqHost request host, if coming via HTTP
   * @param {Boolean} reqSecure whether or not the request is secure, i.e. TLS
   */
  getDescription(reqHost, reqSecure) {
    const desc = {
      title: this.title,
      '@context': this['@context'],
      '@type': this['@type'],
      description: this.description,
      href: this.href,
      properties: this.properties,
      actions: this.actions,
      events: this.events,
      links: JSON.parse(JSON.stringify(this.links)),
      floorplanX: this.floorplanX,
      floorplanY: this.floorplanY,
      layoutIndex: this.layoutIndex,
      selectedCapability: this.selectedCapability,
      iconHref: this.iconHref,
    };

    if (typeof reqHost !== 'undefined') {
      const wsLink = {
        rel: 'alternate',
        href: `${reqSecure ? 'wss' : 'ws'}://${reqHost}${this.href}`,
      };

      desc.links.push(wsLink);

      desc.id = `${reqSecure ? 'https' : 'http'}://${reqHost}${this.href}`;
      desc.base = `${reqSecure ? 'https' : 'http'}://${reqHost}/`;
      desc.securityDefinitions = {
        oauth2_sc: {
          scheme: 'oauth2',
          flow: 'code',
          authorization: `${reqSecure ? 'https' : 'http'}://${reqHost}${Constants.OAUTH_PATH}/authorize`,
          token: `${reqSecure ? 'https' : 'http'}://${reqHost}${Constants.OAUTH_PATH}/token`,
          scopes: [
            `${this.href}:readwrite`,
            this.href,
            `${Constants.THINGS_PATH}:readwrite`,
            Constants.THINGS_PATH,
          ],
        },
      };
      desc.security = 'oauth2_sc';
    }

    return desc;
  }

  /**
   * Remove and clean up the Thing
   */
  remove() {
    if (this.iconHref) {
      try {
        fs.unlinkSync(path.join(UserProfile.baseDir, this.iconHref));
      } catch (e) {
        console.error('Failed to remove old icon:', e);
        // continue
      }

      this.iconHref = null;
    }

    this.emitter.emit(Constants.REMOVED, true);
  }

  /**
   * Add an action
   * @param {Action} action
   * @return {boolean} Whether a known action
   */
  addAction(action) {
    return this.actions.hasOwnProperty(action.name);
  }

  /**
   * Remove an action
   * @param {Action} action
   * @return {boolean} Whether a known action
   */
  removeAction(action) {
    return this.actions.hasOwnProperty(action.name);
  }

  /**
   * Update a thing from a description.
   *
   * Thing descriptions can change as new capabilities are developed, so this
   * method allows us to update the stored thing description.
   *
   * @param {Object} description Thing description.
   * @return {Promise} A promise which resolves with the description set.
   */
  updateFromDescription(description) {
    const oldDescription = JSON.stringify(this.getDescription());

    // Update @context
    this['@context'] =
      description['@context'] || 'https://iot.mozilla.org/schemas';

    // Update @type
    this['@type'] = description['@type'] || [];

    // Update description
    this.description = description.description || '';

    // Update properties
    this.properties = {};
    if (description.properties) {
      for (const propertyName in description.properties) {
        const property = description.properties[propertyName];

        if (property.hasOwnProperty('href')) {
          delete property.href;
        }

        if (property.hasOwnProperty('links')) {
          property.links = property.links.filter((link) => {
            return link.rel && link.rel !== 'property';
          }).map((link) => {
            if (link.proxy) {
              delete link.proxy;
              link.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${link.href}`;
            }

            return link;
          });
        } else {
          property.links = [];
        }

        // Give the property a URL
        property.links.push({
          rel: 'property',
          href: `${this.href}${Constants.PROPERTIES_PATH}/${encodeURIComponent(propertyName)}`,
        });
        this.properties[propertyName] = property;
      }
    }

    // Update actions
    this.actions = description.actions || {};
    for (const actionName in this.actions) {
      const action = this.actions[actionName];

      if (action.hasOwnProperty('href')) {
        delete action.href;
      }

      if (action.hasOwnProperty('links')) {
        action.links = action.links.filter((link) => {
          return link.rel && link.rel !== 'action';
        }).map((link) => {
          if (link.proxy) {
            delete link.proxy;
            link.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${link.href}`;
          }

          return link;
        });
      } else {
        action.links = [];
      }

      // Give the action a URL
      action.links.push({
        rel: 'action',
        href: `${this.href}${Constants.ACTIONS_PATH}/${encodeURIComponent(actionName)}`,
      });
    }

    // Update events
    this.events = description.events || {};
    for (const eventName in this.events) {
      const event = this.events[eventName];

      if (event.hasOwnProperty('href')) {
        delete event.href;
      }

      if (event.hasOwnProperty('links')) {
        event.links = event.links.filter((link) => {
          return link.rel && link.rel !== 'event';
        }).map((link) => {
          if (link.proxy) {
            delete link.proxy;
            link.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${link.href}`;
          }

          return link;
        });
      } else {
        event.links = [];
      }

      // Give the event a URL
      event.links.push({
        rel: 'event',
        href: `${this.href}${Constants.EVENTS_PATH}/${encodeURIComponent(eventName)}`,
      });
    }

    let uiLink = {
      rel: 'alternate',
      mediaType: 'text/html',
      href: this.href,
    };
    for (const link of this.links) {
      if (link.rel === 'alternate' && link.mediaType === 'text/html') {
        uiLink = link;
        break;
      }
    }

    if (description.hasOwnProperty('baseHref') && description.baseHref) {
      Router.addProxyServer(this.id, description.baseHref);
    }

    // Update the UI href
    if (description.hasOwnProperty('links')) {
      for (const link of description.links) {
        if (['properties', 'actions', 'events'].includes(link.rel)) {
          continue;
        }

        if (link.rel === 'alternate' && link.mediaType === 'text/html') {
          if (link.proxy) {
            delete link.proxy;
            uiLink.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${link.href}`;
          } else {
            uiLink.href = link.href;
          }
        } else {
          if (link.proxy) {
            delete link.proxy;
            link.href = `${Constants.PROXY_PATH}/${encodeURIComponent(this.id)}${link.href}`;
          }

          this.links.push(link);
        }
      }
    }

    // If the previously selected capability is no longer present, reset it.
    if (this.selectedCapability &&
        !this['@type'].includes(this.selectedCapability)) {
      this.selectedCapability = '';
    }

    return Database.updateThing(this.id, this.getDescription())
      .then((descr) => {
        const newDescription = JSON.stringify(this.getDescription());
        if (newDescription !== oldDescription) {
          this.emitter.emit(Constants.MODIFIED);
        }

        return descr;
      });
  }

  /**
   * Set the connected state of this thing.
   *
   * @param {boolean} connected - Whether or not the thing is connected
   */
  setConnected(connected) {
    this.connected = connected;
    this.emitter.emit(Constants.CONNECTED, connected);
  }
}

module.exports = Thing;


/***/ }),

/***/ "./src/models/things.js":
/*!******************************!*\
  !*** ./src/models/things.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Things Model.
 *
 * Manages the data model and business logic for a collection of Things.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Ajv = __webpack_require__(/*! ajv */ "ajv");
const EventEmitter = __webpack_require__(/*! events */ "events");

const AddonManager = __webpack_require__(/*! ../addon-manager */ "./src/addon-manager.js");
const Database = __webpack_require__(/*! ../db */ "./src/db.js");
const Router = __webpack_require__(/*! ../router */ "./src/router.js");
const Thing = __webpack_require__(/*! ./thing */ "./src/models/thing.js");
const Constants = __webpack_require__(/*! ../constants */ "./src/constants.js");

const ajv = new Ajv();

const Things = {

  /**
   * A Map of Things in the Things database.
   */
  things: new Map(),

  /**
   * A collection of open websockets listening for new things.
   */
  websockets: [],

  /**
   * The promise object returned by Database.getThings()
   */
  getThingsPromise: null,

  /**
   * An EventEmitter used to bubble up added things
   *
   * Note that this differs from AddonManager's THING_ADDED because that thing
   * added is when the addon discovers a thing, not when the model is
   * instantiated
   */
  emitter: new EventEmitter(),

  /**
   * Get all Things known to the Gateway, initially loading them from the
   * database,
   *
   * @return {Promise} which resolves with a Map of Thing objects.
   */
  getThings: function() {
    if (this.things.size > 0) {
      return Promise.resolve(this.things);
    }

    if (this.getThingsPromise) {
      // We're still waiting for the database request.
      return this.getThingsPromise;
    }

    this.getThingsPromise = Database.getThings().then((things) => {
      this.getThingsPromise = null;

      // Update the map of Things
      this.things = new Map();
      things.forEach((thing, index) => {
        // This should only happen on the first migration.
        if (!thing.hasOwnProperty('layoutIndex')) {
          thing.layoutIndex = index;
        }

        this.things.set(thing.id, new Thing(thing.id, thing));
      });

      return this.things;
    });

    return this.getThingsPromise;
  },

  /**
   * Get the titles of all things.
   *
   * @return {Promise<Array>} which resolves with a list of all thing titles.
   */
  getThingTitles: function() {
    return this.getThings().then(function(things) {
      return Array.from(things.values()).map((t) => t.title);
    });
  },

  /**
   * Get Thing Descriptions for all Things stored in the database.
   *
   * @param {String} reqHost request host, if coming via HTTP
   * @param {Boolean} reqSecure whether or not the request is secure, i.e. TLS
   * @return {Promise} which resolves with a list of Thing Descriptions.
   */
  getThingDescriptions: function(reqHost, reqSecure) {
    return this.getThings().then(function(things) {
      const descriptions = [];
      for (const thing of things.values()) {
        descriptions.push(thing.getDescription(reqHost, reqSecure));
      }
      return descriptions;
    });
  },

  /**
   * Get a list of Things by their hrefs.
   *
   * {Array} hrefs hrefs of the list of Things to get.
   * @return {Promise} A promise which resolves with a list of Things.
   */
  getListThings: function(hrefs) {
    return this.getThings().then(function(things) {
      const listThings = [];
      for (const href of hrefs) {
        things.forEach(function(thing) {
          if (thing.href === href) {
            listThings.push(thing);
          }
        });
      }
      return listThings;
    });
  },

  /**
   * Get Thing Descriptions for a list of Things by their hrefs.
   *
   * @param {Array} hrefs The hrefs of the list of Things to get
   *                      descriptions of.
   * @param {String} reqHost request host, if coming via HTTP.
   * @param {Boolean} reqSecure whether or not the request is secure, i.e. TLS.
   * @return {Promise} which resolves with a list of Thing Descriptions.
   */
  getListThingDescriptions: function(hrefs, reqHost, reqSecure) {
    return this.getListThings(hrefs).then(function(listThings) {
      const descriptions = [];
      for (const thing of listThings) {
        descriptions.push(thing.getDescription(reqHost, reqSecure));
      }
      return descriptions;
    });
  },

  /**
   * Get a list of things which are connected to adapters but not yet saved
   * in the gateway database.
   *
   * @returns Promise A promise which resolves with a list of Things.
   */
  getNewThings: function() {
    // Get a map of things in the database
    return this.getThings().then((function(storedThings) {
      // Get a list of things connected to adapters
      const connectedThings = AddonManager.getThings();
      const newThings = [];
      connectedThings.forEach(function(connectedThing) {
        if (!storedThings.has(connectedThing.id)) {
          connectedThing.href =
           `${Constants.THINGS_PATH}/${encodeURIComponent(connectedThing.id)}`;
          if (connectedThing.properties) {
            for (const propertyName in connectedThing.properties) {
              const property = connectedThing.properties[propertyName];
              property.href = `${Constants.THINGS_PATH}/${
                encodeURIComponent(connectedThing.id)}${
                Constants.PROPERTIES_PATH}/${
                encodeURIComponent(propertyName)}`;
            }
          }
          newThings.push(connectedThing);
        }
      });
      return newThings;
    }));
  },

  /**
   * Create a new Thing with the given ID and description.
   *
   * @param String id ID to give Thing.
   * @param Object description Thing description.
   */
  createThing: function(id, description) {
    const thing = new Thing(id, description);
    thing.connected = true;
    thing.layoutIndex = this.things.size;

    return Database.createThing(thing.id, thing.getDescription())
      .then((thingDesc) => {
        this.things.set(thing.id, thing);
        this.emitter.emit(Constants.THING_ADDED, thing);
        return thingDesc;
      });
  },

  /**
   * Handle a new Thing having been discovered.
   *
   * @param {Object} newThing - New Thing description
   */
  handleNewThing: function(newThing) {
    this.getThing(newThing.id).then((thing) => {
      thing.setConnected(true);
      return thing.updateFromDescription(newThing);
    }).catch(() => {
      // If we don't already know about this thing, notify each open websocket
      this.websockets.forEach(function(socket) {
        socket.send(JSON.stringify(newThing));
      });
    });
  },

  /**
   * Handle a thing being removed by an adapter.
   *
   * @param {Object} thing - Thing which was removed
   */
  handleThingRemoved: function(thing) {
    this.getThing(thing.id).then((thing) => {
      thing.setConnected(false);
    }).catch(() => {});
  },

  /**
   * Handle a thing's connectivity state change.
   *
   * @param {string} thingId - ID of thing
   * @param {boolean} connected - New connectivity state
   */
  handleConnected: function(thingId, connected) {
    this.getThing(thingId).then((thing) => {
      thing.setConnected(connected);
    }).catch(() => {});
  },

  /**
   * Add a websocket to the list of new Thing subscribers.
   *
   * @param {Websocket} websocket A websocket instance.
   */
  registerWebsocket: function(websocket) {
    this.websockets.push(websocket);
    websocket.on('close', () => {
      const index = this.websockets.indexOf(websocket);
      this.websockets.splice(index, 1);
    });
  },

  /**
   * Get a Thing by its ID.
   *
   * @param {String} id The ID of the Thing to get.
   * @return {Promise<Thing>} A Thing object.
   */
  getThing: function(id) {
    return this.getThings().then(function(things) {
      if (things.has(id)) {
        return things.get(id);
      } else {
        throw new Error(`Unable to find thing with id: ${id}`);
      }
    });
  },

  /**
   * Get a Thing by its title.
   *
   * @param {String} title The title of the Thing to get.
   * @return {Promise<Thing>} A Thing object.
   */
  getThingByTitle: function(title) {
    title = title.toLowerCase();

    return this.getThings().then(function(things) {
      for (const thing of things.values()) {
        if (thing.title.toLowerCase() === title) {
          return thing;
        }
      }

      throw new Error(`Unable to find thing with title: ${title}`);
    }).catch((e) => {
      console.warn('Unexpected thing retrieval error', e);
      return null;
    });
  },

  /**
   * Get a Thing description for a thing by its ID.
   *
   * @param {String} id The ID of the Thing to get a description of.
   * @param {String} reqHost request host, if coming via HTTP
   * @param {Boolean} reqSecure whether or not the request is secure, i.e. TLS
   * @return {Promise<ThingDescription>} A Thing description object.
   */
  getThingDescription: function(id, reqHost, reqSecure) {
    return this.getThing(id).then((thing) => {
      return thing.getDescription(reqHost, reqSecure);
    });
  },

  /**
   * Remove a Thing.
   *
   * @param String id ID to give Thing.
   */
  removeThing: function(id) {
    Router.removeProxyServer(id);
    return Database.removeThing(id).then(() => {
      const thing = this.things.get(id);
      if (!thing) {
        return;
      }

      const index = thing.layoutIndex;

      thing.remove();
      this.things.delete(id);

      this.things.forEach((t) => {
        if (t.layoutIndex > index) {
          t.setLayoutIndex(t.layoutIndex - 1);
        }
      });
    });
  },

  /**
   * @param {String} thingId
   * @param {String} propertyName
   * @return {Promise<any>} resolves to value of property
   */
  getThingProperty: async function(thingId, propertyName) {
    try {
      return await AddonManager.getProperty(thingId, propertyName);
    } catch (error) {
      console.error('Error getting value for thingId:', thingId,
                    'property:', propertyName);
      console.error(error);
      throw {
        code: 500,
        message: error,
      };
    }
  },

  /**
   * @param {String} thingId
   * @param {String} propertyName
   * @param {any} value
   * @return {Promise<any>} resolves to new value
   */
  setThingProperty: async function(thingId, propertyName, value) {
    let thing;
    try {
      thing = await Things.getThingDescription(thingId, 'localhost', true);
    } catch (e) {
      throw {
        code: 404,
        message: 'Thing not found',
      };
    }

    if (!thing.properties.hasOwnProperty(propertyName)) {
      throw {
        code: 404,
        message: 'Property not found',
      };
    }

    if (thing.properties[propertyName].readOnly) {
      throw {
        code: 400,
        message: 'Read-only property',
      };
    }

    const valid = ajv.validate(thing.properties[propertyName], value);
    if (!valid) {
      throw {
        code: 400,
        message: 'Invalid property value',
      };
    }

    try {
      const updatedValue = await AddonManager.setProperty(thingId,
                                                          propertyName, value);
      // Note: it's possible that updatedValue doesn't match value.
      return updatedValue;
    } catch (e) {
      console.error('Error setting value for thingId:', thingId,
                    'property:', propertyName,
                    'value:', value);
      throw {
        code: 500,
        message: e,
      };
    }
  },

  on: function(name, listener) {
    this.emitter.on(name, listener);
  },

  removeListener: function(name, listener) {
    this.emitter.removeListener(name, listener);
  },

  clearState: function() {
    this.websockets = [];
    this.things = new Map();
    this.emitter.removeAllListeners();
  },
};

AddonManager.on(Constants.THING_ADDED, (thing) => {
  Things.handleNewThing(thing);
});

AddonManager.on(Constants.THING_REMOVED, (thing) => {
  Things.handleThingRemoved(thing);
});

AddonManager.on(Constants.CONNECTED, ({device, connected}) => {
  Things.handleConnected(device.id, connected);
});

module.exports = Things;


/***/ }),

/***/ "./src/models/user.js":
/*!****************************!*\
  !*** ./src/models/user.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * User Model.
 *
 * Represents a user.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const crypto = __webpack_require__(/*! crypto */ "crypto");
const Database = __webpack_require__(/*! ../db */ "./src/db.js");
const Passwords = __webpack_require__(/*! ../passwords */ "./src/passwords.js");
const speakeasy = __webpack_require__(/*! speakeasy */ "speakeasy");

class User {
  constructor(id, email, password, name, mfaSharedSecret, mfaEnrolled,
              mfaBackupCodes) {
    this.id = id;
    this.email = email;
    this.password = password; // Hashed
    this.mfaSharedSecret = mfaSharedSecret;
    this.mfaEnrolled =
      typeof mfaEnrolled === 'number' ? mfaEnrolled === 1 : mfaEnrolled;
    this.mfaBackupCodes = mfaBackupCodes ? JSON.parse(mfaBackupCodes) : [];
    this.name = name;
  }

  static async generate(email, rawPassword, name) {
    const hash = await Passwords.hash(rawPassword);
    return new User(null, email, hash, name, '', false, '');
  }

  /**
   * Get a JSON description for this user.
   *
   * @return {Object} JSON description of user.
   */
  getDescription() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      mfaEnrolled: this.mfaEnrolled,
    };
  }

  async generateMfaParams() {
    const secret = speakeasy.generateSecret({
      issuer: 'WebThings Gateway',
      name: `WebThings:${this.email}`,
      length: 64,
    });

    this.mfaSharedSecret = secret.base32;
    await Database.editUser(this);

    return {
      secret: this.mfaSharedSecret,
      url: secret.otpauth_url,
    };
  }

  async generateMfaBackupCodes() {
    const codes = new Set();
    while (codes.size !== 10) {
      codes.add(crypto.randomBytes(6).toString('hex'));
    }

    this.mfaBackupCodes = [];
    for (const code of codes) {
      this.mfaBackupCodes.push(await Passwords.hash(code));
    }

    await Database.editUser(this);

    return Array.from(codes);
  }
}

module.exports = User;


/***/ }),

/***/ "./src/models/users.js":
/*!*****************************!*\
  !*** ./src/models/users.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * User Manager.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const User = __webpack_require__(/*! ./user */ "./src/models/user.js");
const Database = __webpack_require__(/*! ../db */ "./src/db.js");

const Users = {
  /**
   * Get a user from the database.
   *
   * @param {String} email Email address of user to look up.
   * @return {Promise} Promise which resolves to user object
   *   or false if user doesn't exist.
   */
  getUser: (email) => Database.getUser(email).then((result) => {
    if (!result) {
      return false;
    }
    return new User(
      result.id,
      result.email,
      result.password,
      result.name,
      result.mfaSharedSecret,
      result.mfaEnrolled,
      result.mfaBackupCodes
    );
  }),

  getCount: () => Database.getUserCount(),

  /**
   * Get a user from the database.
   *
   * @param {number} id primary key.
   * @return {Promise} Promise which resolves to user object
   *   or false if user doesn't exist.
   */
  getUserById: async (id) => {
    if (typeof id !== 'number') {
      id = parseInt(id, 10);
      if (isNaN(id)) {
        return Promise.reject('Invalid user ID');
      }
    }

    const row = await Database.getUserById(id);
    if (!row) {
      return row;
    }
    return new User(
      row.id,
      row.email,
      row.password,
      row.name,
      row.mfaSharedSecret,
      row.mfaEnrolled,
      row.mfaBackupCodes
    );
  },

  /**
   * Get all Users stored in the database
   * @return {Promise<Array<User>>}
   */
  getUsers: () => Database.getUsers().then((userRows) => {
    return userRows.map((row) => {
      return new User(
        row.id,
        row.email,
        row.password,
        row.name,
        row.mfaSharedSecret,
        row.mfaEnrolled,
        row.mfaBackupCodes
      );
    });
  }),

  /**
   * Create a new User
   * @param {String} email
   * @param {String} password
   * @param {String?} name - optional name of user
   * @return {User} user object.
   */
  createUser: async (email, password, name) => {
    const user =
      new User(null, email.toLowerCase(), password, name, '', false, '');
    user.id = await Database.createUser(user);
    return user;
  },

  /**
   * Edit an existing User
   * @param {User} user to edit
   * @return {Promise} Promise which resolves when operation is complete.
   */
  editUser: async (user) => {
    user.email = user.email.toLowerCase();
    await Database.editUser(user);
  },

  /**
   * Delete an existing User
   * @param {Number} userId
   * @return {Promise} Promise which resolves when operation is complete.
   */
  deleteUser: async (userId) => {
    if (typeof userId !== 'number') {
      userId = parseInt(userId, 10);
      if (isNaN(userId)) {
        return Promise.reject('Invalid user ID');
      }
    }

    await Database.deleteUser(userId);
  },
};

module.exports = Users;


/***/ }),

/***/ "./src/oauth-types.ts":
/*!****************************!*\
  !*** ./src/oauth-types.ts ***!
  \****************************/
/*! exports provided: ClientRegistry, scopeValidSubset */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ClientRegistry", function() { return ClientRegistry; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scopeValidSubset", function() { return scopeValidSubset; });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/constants.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_constants__WEBPACK_IMPORTED_MODULE_0__);


class ClientRegistry {
    constructor(redirect_uri, id, name, secret, scope) {
        this.redirect_uri = redirect_uri;
        this.id = id;
        this.name = name;
        this.secret = secret;
        this.scope = scope;
    }
    getDescription() {
        return {
            id: this.id,
            name: this.name,
            redirect_uri: this.redirect_uri,
            scope: this.scope
        };
    }
}
function stringToScope(scopeRaw) {
    let scope = {};
    let scopeParts = scopeRaw.split(' ');
    for (let scopePart of scopeParts) {
        let parts = scopePart.split(':');
        let path = parts[0];
        let readwrite = parts[1];
        if (readwrite !== 'read' && readwrite !== 'readwrite') {
            readwrite = 'read';
        }
        scope[path] = readwrite;
    }
    return scope;
}
function scopeValidSubset(clientScopeRaw, requestScopeRaw) {
    if (clientScopeRaw === requestScopeRaw) {
        return true;
    }
    let clientScope = stringToScope(clientScopeRaw);
    let requestScope = stringToScope(requestScopeRaw);
    if (!clientScope || !requestScope) {
        return false;
    }
    for (let requestPath in requestScope) {
        if (!requestPath.startsWith(_constants__WEBPACK_IMPORTED_MODULE_0__["THINGS_PATH"])) {
            console.warn('Invalid request for out-of-bounds scope', requestScopeRaw);
            return false;
        }
        let requestAccess = requestScope[requestPath];
        let access;
        if (clientScope[requestPath]) {
            access = clientScope[requestPath];
        }
        else {
            access = clientScope[_constants__WEBPACK_IMPORTED_MODULE_0__["THINGS_PATH"]];
        }
        if (!access) {
            return false;
        }
        if (requestAccess === 'readwrite') {
            if (access !== 'readwrite') {
                return false;
            }
        }
    }
    return true;
}


/***/ }),

/***/ "./src/passwords.js":
/*!**************************!*\
  !*** ./src/passwords.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Password utilities.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const bcrypt = __webpack_require__(/*! bcryptjs */ "bcryptjs");
const config = __webpack_require__(/*! config */ "config");
const speakeasy = __webpack_require__(/*! speakeasy */ "speakeasy");

let rounds;
if (config.has('bcryptRounds')) {
  rounds = config.get('bcryptRounds');
}

module.exports = {
  /**
   * Hash a password asynchronously
   * @param {String} password
   * @return {Promise<String>} hashed password
   */
  hash: (password) => bcrypt.hash(password, rounds),

  /**
   * Hash a password synchronously.
   * WARNING: This will block for a very long time
   *
   * @param {String} password
   * @return {String} hashed password
   */
  hashSync: (password) => bcrypt.hashSync(password, rounds),

  /**
   * Compare two password hashes asynchronously
   * @param {String} passwordText - a plain text password
   * @param {String} passwordHash - the expected hash
   * @return {Promise<boolean>} If the hashes are equal
   */
  // eslint-disable-next-line max-len
  compare: (passwordText, passwordHash) => bcrypt.compare(passwordText, passwordHash),

  /**
   * Compare two password hashes
   * @param {String} passwordText - a plain text password
   * @param {String} passwordHash - the expected hash
   * @return {boolean} If the hashes are equal
   */
  // eslint-disable-next-line max-len
  compareSync: (passwordText, passwordHash) => bcrypt.compareSync(passwordText, passwordHash),

  /**
   * Verify a TOTP token
   * @param {string} sharedSecret - the MFA shared secret
   * @param {object} token - an MFA token, must contain a totp member
   * @return {boolean} If the token has been verified
   */
  verifyMfaToken: (sharedSecret, token) => {
    // only supporting TOTP for now
    if (token.totp) {
      return speakeasy.totp.verify({
        secret: sharedSecret,
        encoding: 'base32',
        window: 1,
        token: token.totp,
      });
    }

    return false;
  },
};


/***/ }),

/***/ "./src/platform.js":
/*!*************************!*\
  !*** ./src/platform.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {/**
 * Platform-specific utilities.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const child_process = __webpack_require__(/*! child_process */ "child_process");
const dynamicRequire = __webpack_require__(/*! ./dynamic-require */ "./src/dynamic-require.js");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const process = __webpack_require__(/*! process */ "process");

/**
 * Error to indicate that a method was not implemented for a platform.
 */
class NotImplementedError extends Error {
  constructor(fn) {
    super(`Method not implemented for platform: ${fn}`);
  }
}

/**
 * Get the OS the gateway is running on.
 *
 * @returns {string|null} String describing OS. Currently, one of:
 *                        * aix
 *                        * android
 *                        * darwin
 *                        * freebsd
 *                        * openbsd
 *                        * sunos
 *                        * win32
 *                        * linux-arch
 *                        * linux-debian
 *                        * linux-openwrt
 *                        * linux-raspbian
 *                        * linux-ubuntu
 *                        * linux-unknown
 */
function getOS() {
  const platform = process.platform;
  if (platform !== 'linux') {
    return platform;
  }

  const proc = child_process.spawnSync('lsb_release', ['-i', '-s']);
  if (proc.status === 0) {
    const lsb_release = proc.stdout.toString().trim();
    switch (lsb_release) {
      case 'Arch':
        return 'linux-arch';
      case 'Debian':
        return 'linux-debian';
      case 'Raspbian':
        return 'linux-raspbian';
      case 'Ubuntu':
        return 'linux-ubuntu';
      default:
        break;
    }
  }

  if (fs.existsSync('/etc/openwrt_release')) {
    return 'linux-openwrt';
  }

  return 'linux-unknown';
}

/**
 * Get the current architecture as "os-machine", i.e. darwin-x64.
 */
function getArchitecture() {
  const defaultArchitecture = `${process.platform}-${process.arch}`;
  try {
    return platform.getPlatformArchitecture(defaultArchitecture);
  } catch (e) {
    return defaultArchitecture;
  }
}

/**
 * Determine whether or not we're running inside Docker.
 */
function isDocker() {
  return fs.existsSync('/.dockerenv') ||
    (fs.existsSync('/proc/1/cgroup') &&
     fs.readFileSync('/proc/1/cgroup').indexOf(':/docker/') >= 0) ||
    fs.existsSync('/pantavisor');
}

/**
 * Get the current node version.
 */
function getNodeVersion() {
  return process.config.variables.node_module_version;
}

/**
 * Get a list of installed Python versions.
 */
function getPythonVersions() {
  const versions = new Set();
  const parse = (output) => {
    const parts = output.split(' ');
    if (parts.length === 2) {
      const match = parts[1].match(/^\d+\.\d+/);
      if (match) {
        versions.add(match[0]);
      }
    }
  };

  for (const bin of ['python', 'python2', 'python3']) {
    const proc = child_process.spawnSync(
      bin,
      ['--version'],
      {encoding: 'utf8'}
    );

    if (proc.status === 0) {
      const output = proc.stdout || proc.stderr;
      parse(output);
    }
  }

  return Array.from(versions).sort();
}

// Basic exports
module.exports = {
  getArchitecture,
  getNodeVersion,
  getOS,
  getPythonVersions,
  isDocker,
  NotImplementedError,
};

// Wrap platform-specific methods
function wrapPlatform(platform, fn) {
  return (...params) => {
    if (platform === null) {
      throw new NotImplementedError(fn);
    }

    if (!platform.hasOwnProperty(fn)) {
      throw new NotImplementedError(fn);
    }

    return platform[fn](...params);
  };
}

let platform;
try {
  platform = dynamicRequire(path.resolve(path.join(__dirname,
                                                   'platforms',
                                                   getOS())));
} catch (_) {
  console.log(
    `Failed to import platform utilities for ${getOS()}.`,
    'Network and system configuration features will be disabled.'
  );
  platform = null;
}

const wrappedMethods = [
  'getPlatformArchitecture',
  'getCaptivePortalStatus',
  'setCaptivePortalStatus',
  'getDhcpServerStatus',
  'setDhcpServerStatus',
  'getHostname',
  'setHostname',
  'getLanMode',
  'setLanMode',
  'getMacAddress',
  'getMdnsServerStatus',
  'setMdnsServerStatus',
  'getNetworkAddresses',
  'getSshServerStatus',
  'setSshServerStatus',
  'getWanMode',
  'setWanMode',
  'getWirelessMode',
  'setWirelessMode',
  'checkConnection',
  'restartGateway',
  'restartSystem',
  'scanWirelessNetworks',
  'getSelfUpdateStatus',
  'setSelfUpdateStatus',
  'getValidTimezones',
  'getTimezone',
  'setTimezone',
  'getValidWirelessCountries',
  'getWirelessCountry',
  'setWirelessCountry',
  'getNtpStatus',
  'restartNtpSync',
];

for (const method of wrappedMethods) {
  module.exports[method] = wrapPlatform(platform, method);
}

module.exports.implemented = (fn) => platform && platform.hasOwnProperty(fn);

/* WEBPACK VAR INJECTION */}.call(this, "src"))

/***/ }),

/***/ "./src/plugin/adapter-proxy.js":
/*!*************************************!*\
  !*** ./src/plugin/adapter-proxy.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * @module AdapterProxy base class.
 *
 * Manages Adapter data model and business logic.
 */
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const {Adapter} = __webpack_require__(/*! gateway-addon */ "gateway-addon");
const Deferred = __webpack_require__(/*! ../deferred */ "./src/deferred.js");
const DeviceProxy = __webpack_require__(/*! ./device-proxy */ "./src/plugin/device-proxy.js");
const {MessageType} = __webpack_require__(/*! gateway-addon */ "gateway-addon").Constants;

const DEBUG = false;

/**
 * Class used to describe an adapter from the perspective
 * of the gateway.
 */
class AdapterProxy extends Adapter {

  constructor(addonManager, adapterId, name, packageName, plugin) {
    super(addonManager, adapterId, packageName);
    this.name = name;
    this.plugin = plugin;
    this.deferredMock = null;
    this.unloadCompletedPromise = null;
    this.eventHandlers = {};
  }

  startPairing(timeoutSeconds) {
    DEBUG && console.log('AdapterProxy: startPairing',
                         this.name, 'id', this.id);
    this.sendMsg(
      MessageType.ADAPTER_START_PAIRING_COMMAND,
      {
        timeout: timeoutSeconds,
      }
    );
  }

  cancelPairing() {
    DEBUG && console.log('AdapterProxy: cancelPairing',
                         this.name, 'id', this.id);
    this.sendMsg(MessageType.ADAPTER_CANCEL_PAIRING_COMMAND, {});
  }

  removeThing(device) {
    DEBUG && console.log('AdapterProxy:', this.name, 'id', this.id,
                         'removeThing:', device.id);
    this.sendMsg(
      MessageType.ADAPTER_REMOVE_DEVICE_REQUEST,
      {
        deviceId: device.id,
      }
    );
  }

  cancelRemoveThing(device) {
    DEBUG && console.log('AdapterProxy:', this.name, 'id', this.id,
                         'cancelRemoveThing:', device.id);
    this.sendMsg(
      MessageType.ADAPTER_CANCEL_REMOVE_DEVICE_COMMAND,
      {
        deviceId: device.id,
      }
    );
  }

  sendMsg(methodType, data, deferred) {
    data.adapterId = this.id;
    return this.plugin.sendMsg(methodType, data, deferred);
  }

  /**
   * Unloads an adapter.
   *
   * @returns a promise which resolves when the adapter has
   *          finished unloading.
   */
  unload() {
    if (this.unloadCompletedPromise) {
      console.error('AdapterProxy: unload already in progress');
      return Promise.reject();
    }
    this.unloadCompletedPromise = new Deferred();
    this.sendMsg(
      MessageType.ADAPTER_UNLOAD_REQUEST,
      {
        adapterId: this.id,
      }
    );
    return this.unloadCompletedPromise.promise;
  }

  /**
   * Set the PIN for the given device.
   *
   * @param {String} deviceId ID of the device
   * @param {String} pin PIN to set
   *
   * @returns a promise which resolves when the PIN has been set.
   */
  setPin(deviceId, pin) {
    return new Promise((resolve, reject) => {
      console.log('AdapterProxy: setPin:', pin, 'for:', deviceId);

      const device = this.getDevice(deviceId);
      if (!device) {
        reject('Device not found');
        return;
      }

      const deferredSet = new Deferred();

      deferredSet.promise.then((device) => {
        resolve(device);
      }).catch(() => {
        reject();
      });

      this.sendMsg(
        MessageType.DEVICE_SET_PIN_REQUEST,
        {
          deviceId,
          pin,
        },
        deferredSet
      );
    });
  }

  /**
   * Set the credentials for the given device.
   *
   * @param {String} deviceId ID of the device
   * @param {String} username Username to set
   * @param {String} password Password to set
   *
   * @returns a promise which resolves when the credentials have been set.
   */
  setCredentials(deviceId, username, password) {
    return new Promise((resolve, reject) => {
      console.log('AdapterProxy: setCredentials:', username, password, 'for:',
                  deviceId);

      const device = this.getDevice(deviceId);
      if (!device) {
        reject('Device not found');
        return;
      }

      const deferredSet = new Deferred();

      deferredSet.promise.then((device) => {
        resolve(device);
      }).catch(() => {
        reject();
      });

      this.sendMsg(
        MessageType.DEVICE_SET_CREDENTIALS_REQUEST,
        {
          deviceId,
          username,
          password,
        },
        deferredSet
      );
    });
  }

  // The following methods are added to support using the
  // MockAdapter as a plugin.

  clearState() {
    if (this.deferredMock) {
      const err = 'clearState: deferredMock already in progress';
      console.error(err);
      return Promise.reject(err);
    }
    this.deferredMock = new Deferred();
    this.sendMsg(
      MessageType.MOCK_ADAPTER_CLEAR_STATE_REQUEST,
      {
        adapterId: this.id,
      }
    );
    return this.deferredMock.promise;
  }

  addDevice(deviceId, deviceDescription) {
    if (this.deferredMock) {
      const err = 'addDevice: deferredMock already in progress';
      console.error(err);
      return Promise.reject(err);
    }

    // For the MockDevice we create the device now, so that we can
    // deliver the propertyChanged notifications that show up before
    // the handleDeviceAdded notification comes in. The device we
    // create now will be replaced when the handleDeviceAdded
    // notification shows up.

    this.devices[deviceId] = new DeviceProxy(this, deviceDescription);

    this.deferredMock = new Deferred();
    this.sendMsg(
      MessageType.MOCK_ADAPTER_ADD_DEVICE_REQUEST,
      {
        deviceId: deviceId,
        deviceDescr: deviceDescription,
      }
    );
    return this.deferredMock.promise;
  }

  removeDevice(deviceId) {
    if (this.deferredMock) {
      const err = 'removeDevice: deferredMock already in progress';
      console.error(err);
      return Promise.reject(err);
    }
    this.deferredMock = new Deferred();

    // We need the actual device object when we resolve the promise
    // so we stash it here since it gets removed under our feet.
    this.deferredMock.device = this.getDevice(deviceId);
    this.sendMsg(
      MessageType.MOCK_ADAPTER_REMOVE_DEVICE_REQUEST,
      {
        deviceId: deviceId,
      }
    );
    return this.deferredMock.promise;
  }

  pairDevice(deviceId, deviceDescription) {
    this.sendMsg(
      MessageType.MOCK_ADAPTER_PAIR_DEVICE_COMMAND,
      {
        deviceId: deviceId,
        deviceDescr: deviceDescription,
      }
    );
  }

  unpairDevice(deviceId) {
    this.sendMsg(
      MessageType.MOCK_ADAPTER_UNPAIR_DEVICE_COMMAND,
      {
        deviceId: deviceId,
      }
    );
  }
}

module.exports = AdapterProxy;


/***/ }),

/***/ "./src/plugin/api-handler-proxy.js":
/*!*****************************************!*\
  !*** ./src/plugin/api-handler-proxy.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * @module APIHandlerProxy base class.
 *
 * Manages API handler data model and business logic.
 */
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const {APIHandler} = __webpack_require__(/*! gateway-addon */ "gateway-addon");
const Deferred = __webpack_require__(/*! ../deferred */ "./src/deferred.js");
const {MessageType} = __webpack_require__(/*! gateway-addon */ "gateway-addon").Constants;

/**
 * Class used to describe an API handler from the perspective of the gateway.
 */
class APIHandlerProxy extends APIHandler {

  constructor(addonManager, packageName, plugin) {
    super(addonManager, packageName);
    this.plugin = plugin;
    this.unloadCompletedPromise = null;
  }

  sendMsg(methodType, data, deferred) {
    data.packageName = this.packageName;
    return this.plugin.sendMsg(methodType, data, deferred);
  }

  handleRequest(request) {
    return new Promise((resolve, reject) => {
      const deferred = new Deferred();
      deferred.promise.then((response) => {
        resolve(response);
      }).catch(() => {
        reject();
      });

      this.sendMsg(
        MessageType.API_HANDLER_API_REQUEST,
        {
          packageName: this.packageName,
          request,
        },
        deferred
      );
    });
  }

  /**
   * Unloads the handler.
   *
   * @returns a promise which resolves when the handler has finished unloading.
   */
  unload() {
    if (this.unloadCompletedPromise) {
      console.error('APIHandlerProxy: unload already in progress');
      return Promise.reject();
    }
    this.unloadCompletedPromise = new Deferred();
    this.sendMsg(MessageType.API_HANDLER_UNLOAD_REQUEST, {});
    return this.unloadCompletedPromise.promise;
  }
}

module.exports = APIHandlerProxy;


/***/ }),

/***/ "./src/plugin/device-proxy.js":
/*!************************************!*\
  !*** ./src/plugin/device-proxy.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * DeviceProxy - Gateway side representation of a device when using
 *               an adapter plugin.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Actions = __webpack_require__(/*! ../models/actions */ "./src/models/actions.js");
const Constants = __webpack_require__(/*! ../constants */ "./src/constants.js");
const {Device, Deferred} = __webpack_require__(/*! gateway-addon */ "gateway-addon");
const Event = __webpack_require__(/*! ../models/event */ "./src/models/event.js");
const Events = __webpack_require__(/*! ../models/events */ "./src/models/events.js");
const {MessageType} = __webpack_require__(/*! gateway-addon */ "gateway-addon").Constants;
const PropertyProxy = __webpack_require__(/*! ./property-proxy */ "./src/plugin/property-proxy.js");

class DeviceProxy extends Device {

  constructor(adapter, deviceDict) {
    super(adapter, deviceDict.id);

    this.title = deviceDict.title;
    this['@context'] =
      deviceDict['@context'] || 'https://iot.mozilla.org/schemas';
    this['@type'] = deviceDict['@type'] || [];
    this.description = deviceDict.description || '';
    this.links = deviceDict.links || [];
    this.baseHref = deviceDict.baseHref || null;

    if (deviceDict.hasOwnProperty('pin')) {
      this.pinRequired = deviceDict.pin.required;
      this.pinPattern = deviceDict.pin.pattern;
    } else {
      this.pinRequired = false;
      this.pinPattern = null;
    }

    this.credentialsRequired = !!deviceDict.credentialsRequired;

    for (const propertyName in deviceDict.properties) {
      const propertyDict = deviceDict.properties[propertyName];
      const propertyProxy =
        new PropertyProxy(this, propertyName, propertyDict);
      this.properties.set(propertyName, propertyProxy);
    }

    // Copy over any extra device fields which might be useful for debugging.
    this.deviceDict = {};
    for (const field in deviceDict) {
      if (['id', 'title', 'description', 'properties', 'actions',
           'events', '@type', '@context', 'links'].includes(field)) {
        continue;
      }
      this.deviceDict[field] = deviceDict[field];
    }

    if (deviceDict.actions) {
      for (const actionName in deviceDict.actions) {
        const dict = deviceDict.actions[actionName];
        this.actions.set(actionName, dict);
      }
    }

    if (deviceDict.events) {
      for (const eventName in deviceDict.events) {
        const dict = deviceDict.events[eventName];
        this.events.set(eventName, dict);
      }
    }
  }

  asDict() {
    return Object.assign({}, this.deviceDict, super.asDict());
  }

  debugCmd(cmd, params) {
    this.adapter.sendMsg(
      MessageType.DEVICE_DEBUG_COMMAND,
      {
        deviceId: this.id,
        cmd: cmd,
        params: params,
      }
    );
  }

  /**
   * @method requestAction
   */
  requestAction(actionId, actionName, input) {
    return new Promise((resolve, reject) => {
      if (!this.actions.has(actionName)) {
        reject(`Action "${actionName}" not found`);
        return;
      }

      console.log('DeviceProxy: requestAction:', actionName,
                  'for:', this.id);

      const deferredSet = new Deferred();

      deferredSet.promise.then(() => {
        resolve();
      }).catch(() => {
        reject();
      });

      this.adapter.sendMsg(
        MessageType.DEVICE_REQUEST_ACTION_REQUEST,
        {
          deviceId: this.id,
          actionName,
          actionId,
          input,
        },
        deferredSet
      );
    });
  }

  /**
   * @method removeAction
   */
  removeAction(actionId, actionName) {
    return new Promise((resolve, reject) => {
      if (!this.actions.has(actionName)) {
        reject(`Action "${actionName}" not found`);
        return;
      }

      console.log('DeviceProxy: removeAction:', actionName,
                  'for:', this.id);

      const deferredSet = new Deferred();

      deferredSet.promise.then(() => {
        resolve();
      }).catch(() => {
        reject();
      });

      this.adapter.sendMsg(
        MessageType.DEVICE_REMOVE_ACTION_REQUEST,
        {
          deviceId: this.id,
          actionName,
          actionId,
        },
        deferredSet
      );
    });
  }

  notifyPropertyChanged(property) {
    this.adapter.manager.emit(Constants.PROPERTY_CHANGED, property);
  }

  actionNotify(action) {
    const a = Actions.get(action.id);
    if (a) {
      a.update(action);
    }
    this.adapter.manager.emit(Constants.ACTION_STATUS, action);
  }

  eventNotify(event) {
    Events.add(new Event(event.name, event.data, this.id, event.timestamp));
    this.adapter.manager.emit(Constants.EVENT, event);
  }

  connectedNotify(connected) {
    this.adapter.manager.emit(Constants.CONNECTED, {device: this, connected});
  }
}

module.exports = DeviceProxy;


/***/ }),

/***/ "./src/plugin/notifier-proxy.js":
/*!**************************************!*\
  !*** ./src/plugin/notifier-proxy.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * @module NotifierProxy base class.
 *
 * Manages Notifier data model and business logic.
 */
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Deferred = __webpack_require__(/*! ../deferred */ "./src/deferred.js");
const {MessageType} = __webpack_require__(/*! gateway-addon */ "gateway-addon").Constants;
const {Notifier} = __webpack_require__(/*! gateway-addon */ "gateway-addon");
const OutletProxy = __webpack_require__(/*! ./outlet-proxy */ "./src/plugin/outlet-proxy.js");

/**
 * Class used to describe a notifier from the perspective of the gateway.
 */
class NotifierProxy extends Notifier {

  constructor(addonManager, notifierId, name, packageName, plugin) {
    super(addonManager, notifierId, packageName);
    this.name = name;
    this.plugin = plugin;
    this.unloadCompletedPromise = null;
  }

  sendMsg(methodType, data, deferred) {
    data.notifierId = this.id;
    return this.plugin.sendMsg(methodType, data, deferred);
  }

  /**
   * Unloads a notifier.
   *
   * @returns a promise which resolves when the notifier has finished unloading.
   */
  unload() {
    if (this.unloadCompletedPromise) {
      console.error('NotifierProxy: unload already in progress');
      return Promise.reject();
    }
    this.unloadCompletedPromise = new Deferred();
    this.sendMsg(MessageType.NOTIFIER_UNLOAD_REQUEST, {});
    return this.unloadCompletedPromise.promise;
  }

  addOutlet(outletId, outletDescription) {
    this.outlets[outletId] = new OutletProxy(this, outletDescription);
  }
}

module.exports = NotifierProxy;


/***/ }),

/***/ "./src/plugin/outlet-proxy.js":
/*!************************************!*\
  !*** ./src/plugin/outlet-proxy.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * OutletProxy - Gateway side representation of an outlet when using
 *               a notifier plugin.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const {MessageType} = __webpack_require__(/*! gateway-addon */ "gateway-addon").Constants;
const {Outlet, Deferred} = __webpack_require__(/*! gateway-addon */ "gateway-addon");

class OutletProxy extends Outlet {
  constructor(notifier, outletDict) {
    super(notifier, outletDict.id);

    this.name = outletDict.name;
  }

  notify(title, message, level) {
    return new Promise((resolve, reject) => {
      console.log('OutletProxy: notify title:', title, 'message:', message,
                  'level:', level, 'for:', this.id);

      const deferredSet = new Deferred();

      deferredSet.promise.then(() => {
        resolve();
      }).catch(() => {
        reject();
      });

      this.notifier.sendMsg(
        MessageType.OUTLET_NOTIFY_REQUEST,
        {
          outletId: this.id,
          title,
          message,
          level,
        },
        deferredSet
      );
    });
  }
}

module.exports = OutletProxy;


/***/ }),

/***/ "./src/plugin/plugin-server.js":
/*!*************************************!*\
  !*** ./src/plugin/plugin-server.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * @module PluginServer
 *
 * Takes care of the gateway side of adapter plugins. There is
 * only a single instance of the PluginServer for the entire gateway.
 * There will be an AdapterProxy instance for each adapter plugin.
 */
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const config = __webpack_require__(/*! config */ "config");
const EventEmitter = __webpack_require__(/*! events */ "events");
const {IpcSocket} = __webpack_require__(/*! gateway-addon */ "gateway-addon");
const {MessageType} = __webpack_require__(/*! gateway-addon */ "gateway-addon").Constants;
const Plugin = __webpack_require__(/*! ./plugin */ "./src/plugin/plugin.js");
const pkg = __webpack_require__(/*! ../../package.json */ "./package.json");
const Settings = __webpack_require__(/*! ../models/settings */ "./src/models/settings.js");
const UserProfile = __webpack_require__(/*! ../user-profile */ "./src/user-profile.js");

class PluginServer extends EventEmitter {
  constructor(addonManager, {verbose} = {}) {
    super();
    this.manager = addonManager;

    this.verbose = verbose;
    this.plugins = new Map();

    this.ipcSocket = new IpcSocket(
      true,
      config.get('ports.ipc'),
      this.onMsg.bind(this),
      'IpcSocket(plugin-server)',
      {verbose: this.verbose}
    );
    this.verbose &&
      console.log('Server bound to', this.ipcSocket.ipcAddr);
  }

  /**
   * @method addAdapter
   *
   * Tells the add-on manager about new adapters added via a plugin.
   */
  addAdapter(adapter) {
    this.manager.addAdapter(adapter);
  }

  /**
   * @method addNotifier
   *
   * Tells the add-on manager about new notifiers added via a plugin.
   */
  addNotifier(notifier) {
    this.manager.addNotifier(notifier);
  }

  /**
   * @method addAPIHandler
   *
   * Tells the add-on manager about new API handlers added via a plugin.
   */
  addAPIHandler(handler) {
    this.manager.addAPIHandler(handler);
  }

  /**
   * @method onMsg
   *
   * Called when the plugin server receives an adapter manager IPC message
   * from a plugin. This particular IPC channel is only used to register
   * plugins. Each plugin will get its own IPC channel once its registered.
   */
  onMsg(msg, ws) {
    this.verbose &&
      console.log('PluginServer: Rcvd:', msg);

    if (msg.messageType === MessageType.PLUGIN_REGISTER_REQUEST) {
      const plugin = this.registerPlugin(msg.data.pluginId);
      plugin.ws = ws;
      let language = 'en-US';
      const units = {
        temperature: 'degree celsius',
      };
      Settings.get('localization.language').then((lang) => {
        if (lang) {
          language = lang;
        }

        return Settings.get('localization.units.temperature');
      }).then((temp) => {
        if (temp) {
          units.temperature = temp;
        }

        return Promise.resolve();
      }).catch(() => {
        return Promise.resolve();
      }).then(() => {
        ws.send(JSON.stringify({
          messageType: MessageType.PLUGIN_REGISTER_RESPONSE,
          data: {
            pluginId: msg.data.pluginId,
            gatewayVersion: pkg.version,
            userProfile: {
              addonsDir: UserProfile.addonsDir,
              baseDir: UserProfile.baseDir,
              configDir: UserProfile.configDir,
              dataDir: UserProfile.dataDir,
              mediaDir: UserProfile.mediaDir,
              logDir: UserProfile.logDir,
              gatewayDir: UserProfile.gatewayDir,
            },
            preferences: {
              language,
              units,
            },
          },
        }));
      });
    } else if (msg.data.pluginId) {
      const plugin = this.getPlugin(msg.data.pluginId);
      if (plugin) {
        plugin.onMsg(msg);
      }
    }
  }

  /**
   * @method getPlugin
   *
   * Returns a previously loaded plugin instance.
   */
  getPlugin(pluginId) {
    return this.plugins.get(pluginId);
  }

  /**
   * @method loadPlugin
   *
   * Loads a plugin by launching a separate process.
   */
  loadPlugin(pluginPath, manifest) {
    const plugin = this.registerPlugin(manifest.name);
    plugin.exec = manifest.moziot.exec;
    plugin.execPath = pluginPath;
    plugin.start();
  }

  /**
   * @method registerPlugin
   *
   * Called when the plugin server receives a register plugin message
   * via IPC.
   */
  registerPlugin(pluginId) {
    let plugin = this.plugins.get(pluginId);
    if (plugin) {
      // This is a plugin that we already know about.
    } else {
      // We haven't seen this plugin before.
      plugin = new Plugin(pluginId, this);
      this.plugins.set(pluginId, plugin);
    }
    return plugin;
  }

  /**
   * @method unregisterPlugin
   *
   * Called when the plugin sends a plugin-unloaded message.
   */
  unregisterPlugin(pluginId) {
    this.plugins.delete(pluginId);
  }

  shutdown() {
    this.ipcSocket.close();
  }
}

module.exports = PluginServer;


/***/ }),

/***/ "./src/plugin/plugin.js":
/*!******************************!*\
  !*** ./src/plugin/plugin.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * @module Plugin
 *
 * Object created for each plugin that the gateway talks to.
 */
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const AdapterProxy = __webpack_require__(/*! ./adapter-proxy */ "./src/plugin/adapter-proxy.js");
const APIHandlerProxy = __webpack_require__(/*! ./api-handler-proxy */ "./src/plugin/api-handler-proxy.js");
const Constants = __webpack_require__(/*! ../constants */ "./src/constants.js");
const db = __webpack_require__(/*! ../db */ "./src/db.js");
const Deferred = __webpack_require__(/*! ../deferred */ "./src/deferred.js");
const DeviceProxy = __webpack_require__(/*! ./device-proxy */ "./src/plugin/device-proxy.js");
const format = __webpack_require__(/*! string-format */ "string-format");
const {LogSeverity} = __webpack_require__(/*! ../constants */ "./src/constants.js");
const NotifierProxy = __webpack_require__(/*! ./notifier-proxy */ "./src/plugin/notifier-proxy.js");
const OutletProxy = __webpack_require__(/*! ./outlet-proxy */ "./src/plugin/outlet-proxy.js");
const path = __webpack_require__(/*! path */ "path");
const readline = __webpack_require__(/*! readline */ "readline");
const Settings = __webpack_require__(/*! ../models/settings */ "./src/models/settings.js");
const spawn = __webpack_require__(/*! child_process */ "child_process").spawn;
const Things = __webpack_require__(/*! ../models/things */ "./src/models/things.js");
const UserProfile = __webpack_require__(/*! ../user-profile */ "./src/user-profile.js");
const {
  DONT_RESTART_EXIT_CODE,
  MessageType,
} = __webpack_require__(/*! gateway-addon */ "gateway-addon").Constants;

const DEBUG = false;

db.open();

class Plugin {

  constructor(pluginId, pluginServer, forceEnable = false) {
    this.pluginId = pluginId;
    this.pluginServer = pluginServer;
    this.logPrefix = pluginId;

    this.adapters = new Map();
    this.notifiers = new Map();
    this.apiHandlers = new Map();

    this.exec = '';
    this.execPath = '.';
    this.forceEnable = forceEnable;
    this.startPromise = null;

    // Make this a nested object such that if the Plugin object is reused,
    // i.e. the plugin is disabled and quickly re-enabled, the gateway process
    // can maintain a proper reference to the process object.
    this.process = {p: null};

    this.restart = true;
    this.restartDelay = 0;
    this.lastRestart = 0;
    this.pendingRestart = null;
    this.unloadCompletedPromise = null;
    this.unloadedRcvdPromise = null;

    this.nextId = 0;
    this.requestActionPromises = new Map();
    this.removeActionPromises = new Map();
    this.setPinPromises = new Map();
    this.setCredentialsPromises = new Map();
    this.notifyPromises = new Map();
    this.apiRequestPromises = new Map();
  }

  asDict() {
    let pid = 'not running';
    if (this.process.p) {
      pid = this.process.p.pid;
    }
    return {
      pluginId: this.pluginId,
      adapters: Array.from(this.adapters.values()).map((adapter) => {
        return adapter.asDict();
      }),
      notifiers: Array.from(this.notifiers.values()).map((notifier) => {
        return notifier.asDict();
      }),
      exec: this.exec,
      pid,
    };
  }

  onMsg(msg) {
    DEBUG && console.log('Plugin: Rcvd Msg', msg);

    // The first switch manages action method resolved or rejected messages.
    switch (msg.messageType) {
      case MessageType.DEVICE_REQUEST_ACTION_RESPONSE: {
        const actionId = msg.data.actionId;
        const deferred = this.requestActionPromises.get(actionId);
        if (typeof actionId === 'undefined' ||
            typeof deferred === 'undefined') {
          console.error('Plugin:', this.pluginId,
                        'Unrecognized action id:', actionId,
                        'Ignoring msg:', msg);
          return;
        }

        if (msg.data.success) {
          deferred.resolve();
        } else {
          deferred.reject();
        }

        this.requestActionPromises.delete(actionId);
        return;
      }
      case MessageType.DEVICE_REMOVE_ACTION_RESPONSE: {
        const messageId = msg.data.messageId;
        const deferred = this.removeActionPromises.get(messageId);
        if (typeof messageId === 'undefined' ||
            typeof deferred === 'undefined') {
          console.error('Plugin:', this.pluginId,
                        'Unrecognized message id:', messageId,
                        'Ignoring msg:', msg);
          return;
        }

        if (msg.data.success) {
          deferred.resolve();
        } else {
          deferred.reject();
        }

        this.removeActionPromises.delete(messageId);
        return;
      }
      case MessageType.OUTLET_NOTIFY_RESPONSE: {
        const messageId = msg.data.messageId;
        const deferred = this.notifyPromises.get(messageId);
        if (typeof messageId === 'undefined' ||
            typeof deferred === 'undefined') {
          console.error('Plugin:', this.pluginId,
                        'Unrecognized message id:', messageId,
                        'Ignoring msg:', msg);
          return;
        }

        if (msg.data.success) {
          deferred.resolve();
        } else {
          deferred.reject();
        }

        this.notifyPromises.delete(messageId);
        return;
      }
      case MessageType.DEVICE_SET_PIN_RESPONSE: {
        const messageId = msg.data.messageId;
        const deferred = this.setPinPromises.get(messageId);
        if (typeof messageId === 'undefined' ||
            typeof deferred === 'undefined') {
          console.error('Plugin:', this.pluginId,
                        'Unrecognized message id:', messageId,
                        'Ignoring msg:', msg);
          return;
        }

        if (msg.data.success) {
          const adapter = this.adapters.get(msg.data.adapterId);
          const deviceId = msg.data.device.id;
          const device = new DeviceProxy(adapter, msg.data.device);
          adapter.devices[deviceId] = device;
          adapter.manager.devices[deviceId] = device;
          deferred.resolve(msg.data.device);
        } else {
          deferred.reject();
        }

        this.setPinPromises.delete(messageId);
        return;
      }
      case MessageType.DEVICE_SET_CREDENTIALS_RESPONSE: {
        const messageId = msg.data.messageId;
        const deferred = this.setCredentialsPromises.get(messageId);
        if (typeof messageId === 'undefined' ||
            typeof deferred === 'undefined') {
          console.error('Plugin:', this.pluginId,
                        'Unrecognized message id:', messageId,
                        'Ignoring msg:', msg);
          return;
        }

        if (msg.data.success) {
          const adapter = this.adapters.get(msg.data.adapterId);
          const deviceId = msg.data.device.id;
          const device = new DeviceProxy(adapter, msg.data.device);
          adapter.devices[deviceId] = device;
          adapter.manager.devices[deviceId] = device;
          deferred.resolve(msg.data.device);
        } else {
          deferred.reject();
        }

        this.setCredentialsPromises.delete(messageId);
        return;
      }
      case MessageType.API_HANDLER_API_RESPONSE: {
        const messageId = msg.data.messageId;
        const deferred = this.apiRequestPromises.get(messageId);
        if (typeof messageId === 'undefined' ||
            typeof deferred === 'undefined') {
          console.error('Plugin:', this.pluginId,
                        'Unrecognized message id:', messageId,
                        'Ignoring msg:', msg);
          return;
        }
        deferred.resolve(msg.data.response);
        this.apiRequestPromises.delete(messageId);
        return;
      }
    }

    const adapterId = msg.data.adapterId;
    const notifierId = msg.data.notifierId;
    let adapter, notifier, apiHandler;

    // The second switch manages plugin level messages.
    switch (msg.messageType) {
      case MessageType.ADAPTER_ADDED_NOTIFICATION: {
        adapter = new AdapterProxy(this.pluginServer.manager,
                                   adapterId,
                                   msg.data.name,
                                   msg.data.packageName,
                                   this);
        this.adapters.set(adapterId, adapter);
        this.pluginServer.addAdapter(adapter);

        // Tell the adapter about all saved things
        const send = (thing) => {
          adapter.sendMsg(
            MessageType.DEVICE_SAVED_NOTIFICATION,
            {
              deviceId: thing.id,
              device: thing.getDescription(),
            }
          );
        };

        adapter.eventHandlers[Constants.THING_ADDED] = send;

        Things.getThings().then((things) => {
          things.forEach(send);
        });
        Things.on(Constants.THING_ADDED, send);
        return;
      }
      case MessageType.NOTIFIER_ADDED_NOTIFICATION:
        notifier = new NotifierProxy(this.pluginServer.manager,
                                     notifierId,
                                     msg.data.name,
                                     msg.data.packageName,
                                     this);
        this.notifiers.set(notifierId, notifier);
        this.pluginServer.addNotifier(notifier);
        return;

      case MessageType.API_HANDLER_ADDED_NOTIFICATION:
        apiHandler = new APIHandlerProxy(this.pluginServer.manager,
                                         msg.data.packageName,
                                         this);
        this.apiHandlers.set(msg.data.packageName, apiHandler);
        this.pluginServer.addAPIHandler(apiHandler);
        return;

      case MessageType.API_HANDLER_UNLOAD_RESPONSE: {
        const packageName = msg.data.packageName;
        const handler = this.apiHandlers.get(packageName);

        if (!handler) {
          console.error('Plugin:', this.pluginId,
                        'Unrecognized API handler:', packageName,
                        'Ignoring msg:', msg);
          return;
        }

        this.apiHandlers.delete(packageName);
        if (this.adapters.size === 0 &&
            this.notifiers.size === 0 &&
            this.apiHandlers.size === 0) {
          // We've unloaded everything for the plugin, now unload the plugin.
          this.unload();
          this.unloadCompletedPromise = handler.unloadCompletedPromise;
          handler.unloadCompletedPromise = null;
        } else if (handler.unloadCompletedPromise) {
          handler.unloadCompletedPromise.resolve();
          handler.unloadCompletedPromise = null;
        }

        return;
      }
      case MessageType.PLUGIN_UNLOAD_RESPONSE:
        this.shutdown();
        this.pluginServer.unregisterPlugin(msg.data.pluginId);
        if (this.unloadedRcvdPromise) {
          if (this.unloadCompletedPromise) {
            this.unloadCompletedPromise.resolve();
            this.unloadCompletedPromise = null;
          }
        }
        return;

      case MessageType.PLUGIN_ERROR_NOTIFICATION:
        this.pluginServer.emit('log', {
          severity: LogSeverity.ERROR,
          message: msg.data.message,
        });
        return;
    }

    // The next switch deals with adapter level messages

    adapter = this.adapters.get(adapterId);
    if (adapterId && !adapter) {
      console.error('Plugin:', this.pluginId,
                    'Unrecognized adapter:', adapterId,
                    'Ignoring msg:', msg);
      return;
    }

    notifier = this.notifiers.get(notifierId);
    if (notifierId && !notifier) {
      console.error('Plugin:', this.pluginId,
                    'Unrecognized notifier:', notifierId,
                    'Ignoring msg:', msg);
      return;
    }

    let device;
    let outlet;
    let property;
    let deferredMock;

    switch (msg.messageType) {

      case MessageType.ADAPTER_UNLOAD_RESPONSE: {
        const handler = adapter.eventHandlers[Constants.THING_ADDED];
        if (handler) {
          Things.removeListener(Constants.THING_ADDED, handler);
        }

        this.adapters.delete(adapterId);
        if (this.adapters.size === 0 &&
            this.notifiers.size === 0 &&
            this.apiHandlers.size === 0) {
          // We've unloaded everything for the plugin, now unload the plugin.

          // We may need to reevaluate this, and only auto-unload
          // the plugin for the MockAdapter. For plugins which
          // support hot-swappable dongles (like zwave/zigbee) it makes
          // sense to have a plugin loaded with no adapters present.
          this.unload();
          this.unloadCompletedPromise = adapter.unloadCompletedPromise;
          adapter.unloadCompletedPromise = null;
        } else if (adapter.unloadCompletedPromise) {
          adapter.unloadCompletedPromise.resolve();
          adapter.unloadCompletedPromise = null;
        }
        break;
      }
      case MessageType.NOTIFIER_UNLOAD_RESPONSE:
        this.notifiers.delete(notifierId);
        if (this.adapters.size === 0 &&
            this.notifiers.size === 0 &&
            this.apiHandlers.size === 0) {
          // We've unloaded everything for the plugin, now unload the plugin.
          this.unload();
          this.unloadCompletedPromise = notifier.unloadCompletedPromise;
          notifier.unloadCompletedPromise = null;
        } else if (notifier.unloadCompletedPromise) {
          notifier.unloadCompletedPromise.resolve();
          notifier.unloadCompletedPromise = null;
        }
        break;

      case MessageType.DEVICE_ADDED_NOTIFICATION:
        device = new DeviceProxy(adapter, msg.data.device);
        adapter.handleDeviceAdded(device);
        break;

      case MessageType.ADAPTER_REMOVE_DEVICE_RESPONSE:
        device = adapter.getDevice(msg.data.deviceId);
        if (device) {
          adapter.handleDeviceRemoved(device);
        }
        break;

      case MessageType.OUTLET_ADDED_NOTIFICATION:
        outlet = new OutletProxy(notifier, msg.data.outlet);
        notifier.handleOutletAdded(outlet);
        break;

      case MessageType.OUTLET_REMOVED_NOTIFICATION:
        outlet = notifier.getOutlet(msg.data.outletId);
        if (outlet) {
          notifier.handleOutletRemoved(outlet);
        }
        break;

      case MessageType.DEVICE_PROPERTY_CHANGED_NOTIFICATION:
        device = adapter.getDevice(msg.data.deviceId);
        if (device) {
          property = device.findProperty(msg.data.property.name);
          if (property) {
            property.doPropertyChanged(msg.data.property);
            if (property.isVisible()) {
              device.notifyPropertyChanged(property);
            }
          }
        }
        break;

      case MessageType.DEVICE_ACTION_STATUS_NOTIFICATION:
        device = adapter.getDevice(msg.data.deviceId);
        if (device) {
          device.actionNotify(msg.data.action);
        }
        break;

      case MessageType.DEVICE_EVENT_NOTIFICATION:
        device = adapter.getDevice(msg.data.deviceId);
        if (device) {
          device.eventNotify(msg.data.event);
        }
        break;

      case MessageType.DEVICE_CONNECTED_STATE_NOTIFICATION:
        device = adapter.getDevice(msg.data.deviceId);
        if (device) {
          device.connectedNotify(msg.data.connected);
        }
        break;

      case MessageType.ADAPTER_PAIRING_PROMPT_NOTIFICATION: {
        let message = `${adapter.name}: `;
        if (msg.data.hasOwnProperty('deviceId')) {
          device = adapter.getDevice(msg.data.deviceId);
          message += `(${device.title}): `;
        }

        message += msg.data.prompt;

        const data = {
          severity: LogSeverity.PROMPT,
          message,
        };

        if (msg.data.hasOwnProperty('url')) {
          data.url = msg.data.url;
        }

        this.pluginServer.emit('log', data);
        return;
      }
      case MessageType.ADAPTER_UNPAIRING_PROMPT_NOTIFICATION: {
        let message = `${adapter.name}`;
        if (msg.data.hasOwnProperty('deviceId')) {
          device = adapter.getDevice(msg.data.deviceId);
          message += ` (${device.title})`;
        }

        message += `: ${msg.data.prompt}`;

        const data = {
          severity: LogSeverity.PROMPT,
          message,
        };

        if (msg.data.hasOwnProperty('url')) {
          data.url = msg.data.url;
        }

        this.pluginServer.emit('log', data);
        return;
      }
      case MessageType.MOCK_ADAPTER_CLEAR_STATE_RESPONSE:
        deferredMock = adapter.deferredMock;
        if (!deferredMock) {
          console.error('mockAdapterStateCleared: No deferredMock');
        } else {
          adapter.deferredMock = null;
          deferredMock.resolve();
        }
        break;

      case MessageType.MOCK_ADAPTER_ADD_DEVICE_RESPONSE:
      case MessageType.MOCK_ADAPTER_REMOVE_DEVICE_RESPONSE:
        deferredMock = adapter.deferredMock;
        if (!deferredMock) {
          console.error('mockDeviceAddedRemoved: No deferredMock');
        } else if (msg.data.success) {
          device = deferredMock.device;
          adapter.deferredMock = null;
          deferredMock.device = null;
          deferredMock.resolve(device);
        } else {
          adapter.deferredMock = null;
          deferredMock.reject(msg.data.error);
        }
        break;

      default:
        console.error('Plugin: unrecognized msg:', msg);
        break;
    }
  }

  /**
   * Generate an ID for a message.
   *
   * @returns {integer} An id.
   */
  generateMsgId() {
    return ++this.nextId;
  }

  sendMsg(methodType, data, deferred) {
    data.pluginId = this.pluginId;

    // Methods which could fail should await result.
    if (typeof deferred !== 'undefined') {
      switch (methodType) {
        case MessageType.DEVICE_REQUEST_ACTION_REQUEST: {
          this.requestActionPromises.set(data.actionId, deferred);
          break;
        }
        case MessageType.DEVICE_REMOVE_ACTION_REQUEST: {
          // removeAction needs ID which is per message, because it
          // can be called while waiting rejected or resolved.
          data.messageId = this.generateMsgId();
          this.removeActionPromises.set(data.messageId, deferred);
          break;
        }
        case MessageType.OUTLET_NOTIFY_REQUEST: {
          data.messageId = this.generateMsgId();
          this.notifyPromises.set(data.messageId, deferred);
          break;
        }
        case MessageType.DEVICE_SET_PIN_REQUEST: {
          // removeAction needs ID which is per message, because it
          // can be called while waiting rejected or resolved.
          data.messageId = this.generateMsgId();
          this.setPinPromises.set(data.messageId, deferred);
          break;
        }
        case MessageType.DEVICE_SET_CREDENTIALS_REQUEST: {
          // removeAction needs ID which is per message, because it
          // can be called while waiting rejected or resolved.
          data.messageId = this.generateMsgId();
          this.setCredentialsPromises.set(data.messageId, deferred);
          break;
        }
        case MessageType.API_HANDLER_API_REQUEST: {
          data.messageId = this.generateMsgId();
          this.apiRequestPromises.set(data.messageId, deferred);
          break;
        }
        default:
          break;
      }
    }

    const msg = {
      messageType: methodType,
      data: data,
    };
    DEBUG && console.log('Plugin: sendMsg:', msg);

    return this.ws.send(JSON.stringify(msg));
  }

  /**
   * Does cleanup required to allow the test suite to complete cleanly.
   */
  shutdown() {
    if (this.pendingRestart) {
      clearTimeout(this.pendingRestart);
    }
    this.restart = false;
    this.requestActionPromises.forEach((promise, key) => {
      promise.reject();
      this.requestActionPromises.delete(key);
    });
    this.removeActionPromises.forEach((promise, key) => {
      promise.reject();
      this.removeActionPromises.delete(key);
    });
    this.setPinPromises.forEach((promise, key) => {
      promise.reject();
      this.setPinPromises.delete(key);
    });
    this.setCredentialsPromises.forEach((promise, key) => {
      promise.reject();
      this.setCredentialsPromises.delete(key);
    });
    this.notifyPromises.forEach((promise, key) => {
      promise.reject();
      this.notifyPromises.delete(key);
    });
    this.apiRequestPromises.forEach((promise, key) => {
      promise.reject();
      this.apiRequestPromises.delete(key);
    });
  }

  start() {
    const key = `addons.${this.pluginId}`;

    this.startPromise = Settings.get(key).then((savedSettings) => {
      if (!this.forceEnable &&
          (!savedSettings || !savedSettings.enabled)) {
        console.error(`Plugin ${this.pluginId} not enabled, so not starting.`);
        this.restart = false;
        this.process.p = null;
        return;
      }

      const execArgs = {
        nodeLoader: `node ${path.join(UserProfile.gatewayDir,
                                      'src',
                                      'addon-loader.js')}`,
        name: this.pluginId,
        path: this.execPath,
      };
      const execCmd = format(this.exec, execArgs);

      DEBUG && console.log('  Launching:', execCmd);

      // If we need embedded spaces, then consider changing to use the npm
      // module called splitargs
      this.restart = true;
      const args = execCmd.split(' ');
      this.process.p = spawn(
        args[0],
        args.slice(1),
        {
          env: Object.assign(process.env,
                             {
                               MOZIOT_HOME: UserProfile.baseDir,
                               NODE_PATH: path.join(UserProfile.gatewayDir,
                                                    'node_modules'),
                             }),
        }
      );

      this.process.p.on('error', (err) => {
        // We failed to spawn the process. This most likely means that the
        // exec string is malformed somehow. Report the error but don't try
        // restarting.
        this.restart = false;
        console.error('Failed to start plugin', this.pluginId);
        console.error('Command:', this.exec);
        console.error(err);
      });

      this.stdoutReadline = readline.createInterface({
        input: this.process.p.stdout,
      });
      this.stdoutReadline.on('line', (line) => {
        console.log(`${this.logPrefix}: ${line}`);
      });

      this.stderrReadline = readline.createInterface({
        input: this.process.p.stderr,
      });
      this.stderrReadline.on('line', (line) => {
        console.error(`${this.logPrefix}: ${line}`);
      });

      this.process.p.on('exit', (code) => {
        if (this.restart) {
          if (code == DONT_RESTART_EXIT_CODE) {
            console.log('Plugin:', this.pluginId, 'died, code =', code,
                        'NOT restarting...');
            this.restart = false;
            this.process.p = null;
          } else {
            if (this.pendingRestart) {
              return;
            }
            if (this.restartDelay < 30 * 1000) {
              this.restartDelay += 1000;
            }
            if (this.lastRestart + 60 * 1000 < Date.now()) {
              this.restartDelay = 0;
            }
            if (this.restartDelay > 30000) {
              // If we've restarted 30 times in a row, this is probably just
              // not going to work, so bail out.
              console.log(`Giving up on restarting plugin ${this.pluginId}`);
              this.restart = false;
              this.process.p = null;
              return;
            }
            console.log('Plugin:', this.pluginId, 'died, code =', code,
                        'restarting after', this.restartDelay);
            const doRestart = () => {
              if (this.restart) {
                this.lastRestart = Date.now();
                this.pendingRestart = null;
                this.start();
              } else {
                this.process.p = null;
              }
            };
            if (this.restartDelay > 0) {
              this.pendingRestart = setTimeout(doRestart, this.restartDelay);
            } else {
              // Restart immediately so that test code can access
              // process.p
              doRestart();
            }
          }
        } else {
          this.process.p = null;
        }
      });
    });

    return this.startPromise;
  }

  unload() {
    this.restart = false;
    this.unloadedRcvdPromise = new Deferred();
    this.sendMsg(MessageType.PLUGIN_UNLOAD_REQUEST, {});
  }
}

module.exports = Plugin;


/***/ }),

/***/ "./src/plugin/property-proxy.js":
/*!**************************************!*\
  !*** ./src/plugin/property-proxy.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * PropertyProxy - Gateway side representation of a property
 *                 when using an adapter plugin.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Deferred = __webpack_require__(/*! ../deferred */ "./src/deferred.js");
const {Property} = __webpack_require__(/*! gateway-addon */ "gateway-addon");
const {MessageType} = __webpack_require__(/*! gateway-addon */ "gateway-addon").Constants;

class PropertyProxy extends Property {
  constructor(device, propertyName, propertyDict) {
    super(device, propertyName, propertyDict);

    this.value = propertyDict.value;

    this.propertyChangedPromises = [];
    this.propertyDict = Object.assign({}, propertyDict);
  }

  asDict() {
    return Object.assign({}, this.propertyDict, super.asDict());
  }

  /**
   * @method onPropertyChanged
   * @returns a promise which is resoved when the next
   * propertyChanged notification is received.
   */
  onPropertyChanged() {
    const deferredChange = new Deferred();
    this.propertyChangedPromises.push(deferredChange);
    return deferredChange.promise;
  }

  /**
   * @method doPropertyChanged
   * Called whenever a property changed notification is received
   * from the adapter.
   */
  doPropertyChanged(propertyDict) {
    this.propertyDict = Object.assign({}, propertyDict);
    this.setCachedValue(propertyDict.value);
    if (propertyDict.hasOwnProperty('title')) {
      this.title = propertyDict.title;
    }
    if (propertyDict.hasOwnProperty('type')) {
      this.type = propertyDict.type;
    }
    if (propertyDict.hasOwnProperty('@type')) {
      this['@type'] = propertyDict['@type'];
    }
    if (propertyDict.hasOwnProperty('unit')) {
      this.unit = propertyDict.unit;
    }
    if (propertyDict.hasOwnProperty('description')) {
      this.description = propertyDict.description;
    }
    if (propertyDict.hasOwnProperty('minimum')) {
      this.minimum = propertyDict.minimum;
    }
    if (propertyDict.hasOwnProperty('maximum')) {
      this.maximum = propertyDict.maximum;
    }
    if (propertyDict.hasOwnProperty('multipleOf')) {
      this.multipleOf = propertyDict.multipleOf;
    }
    if (propertyDict.hasOwnProperty('enum')) {
      this.enum = propertyDict.enum;
    }
    if (propertyDict.hasOwnProperty('links')) {
      this.links = propertyDict.links;
    }
    while (this.propertyChangedPromises.length > 0) {
      const deferredChange = this.propertyChangedPromises.pop();
      deferredChange.resolve(propertyDict.value);
    }
  }

  /**
   * @returns a promise which resolves to the updated value.
   *
   * @note it is possible that the updated value doesn't match
   * the value passed in.
   */
  setValue(value) {
    return new Promise((resolve, reject) => {
      this.device.adapter.sendMsg(
        MessageType.DEVICE_SET_PROPERTY_COMMAND,
        {
          deviceId: this.device.id,
          propertyName: this.name,
          propertyValue: value,
        }
      );

      // TODO: Add a timeout

      this.onPropertyChanged().then((updatedValue) => {
        resolve(updatedValue);
      }).catch((error) => {
        console.error('PropertyProxy: Failed to setProperty',
                      this.name, 'to', value,
                      'for device:', this.device.id);
        console.error(error);
        reject(error);
      });
    });
  }
}

module.exports = PropertyProxy;


/***/ }),

/***/ "./src/push-service.js":
/*!*****************************!*\
  !*** ./src/push-service.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Push Service.
 *
 * Manage the Push Service for notifications
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const WebPush = __webpack_require__(/*! web-push */ "web-push");
const Settings = __webpack_require__(/*! ./models/settings */ "./src/models/settings.js");
const Database = __webpack_require__(/*! ./db */ "./src/db.js");

const PushService = {

  enabled: false,
  /**
   * Initialize the Push Service, generating and storing a VAPID keypair
   * if necessary.
   */
  init: async (tunnelDomain) => {
    let vapid = await Settings.get('push.vapid');
    if (!vapid) {
      vapid = WebPush.generateVAPIDKeys();
      await Settings.set('push.vapid', vapid);
    }
    const {publicKey, privateKey} = vapid;

    WebPush.setVapidDetails(tunnelDomain, publicKey, privateKey);

    this.enabled = true;
  },

  getVAPIDKeys: async () => {
    try {
      const vapid = await Settings.get('push.vapid');
      return vapid;
    } catch (err) {
      // do nothing
      console.error('vapid still not generated');
    }
  },

  createPushSubscription: async (subscription) => {
    return await Database.createPushSubscription(subscription);
  },

  broadcastNotification: async (message) => {
    if (!this.enabled) {
      return;
    }
    const subscriptions = await Database.getPushSubscriptions();
    for (const subscription of subscriptions) {
      WebPush.sendNotification(subscription, message).catch((err) => {
        console.warn('Push API error', err);
        Database.deletePushSubscription(subscription.id);
      });
    }
  },
};

module.exports = PushService;


/***/ }),

/***/ "./src/router-setup.js":
/*!*****************************!*\
  !*** ./src/router-setup.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const bodyParser = __webpack_require__(/*! body-parser */ "body-parser");
const config = __webpack_require__(/*! config */ "config");
const Constants = __webpack_require__(/*! ./constants */ "./src/constants.js");
const express = __webpack_require__(/*! express */ "express");
const expressHandlebars = __webpack_require__(/*! express-handlebars */ "express-handlebars");
const mDNSserver = __webpack_require__(/*! ./mdns-server */ "./src/mdns-server.js");
const platform = __webpack_require__(/*! ./platform */ "./src/platform.js");
const Settings = __webpack_require__(/*! ./models/settings */ "./src/models/settings.js");
const sleep = __webpack_require__(/*! ./sleep */ "./src/sleep.js");

const DEBUG = false;

const hbs = expressHandlebars.create({
  helpers: {
    escapeQuotes: (str) => `${str}`.replace(/'/, '\\\''),
  },
  defaultLayout: undefined, // eslint-disable-line no-undefined
  layoutsDir: Constants.VIEWS_PATH,
});

// The express server
const app = express();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', Constants.VIEWS_PATH);

// When we get POSTs, handle the body like this
app.use(bodyParser.urlencoded({extended: false}));

// Define the handler methods for the various URLs we handle
app.get('/*', handleCaptive);
app.get('/', handleRoot);
app.get('/router-setup', handleRouterSetup);
app.post('/creating', handleCreating);
app.use(express.static(Constants.BUILD_STATIC_PATH));

const RouterSetupApp = {
  onRequest: app,
};

/**
 * Handle captive portal requests.
 */
function handleCaptive(request, response, next) {
  console.log('router-setup: handleCaptive:', request.path);

  switch (request.path) {
    case '/hotspot.html': {
      // WISPr XML response
      const ssid = getHotspotSsid();
      response.render(
        'hotspot',
        {
          ap_ssid: ssid,
          ap_ip: config.get('wifi.ap.ipaddr'),
        }
      );
      break;
    }
    case '/hotspot-detect.html':        // iOS/macOS
    case '/library/test/success.html':  // iOS/macOS
    case '/connecttest.txt': {          // Windows
      const ua = request.get('User-Agent');

      // These 2 user-agents expect a WISPr XML response
      if (ua.includes('CaptiveNetworkSupport') ||
          ua.includes('Microsoft NCSI')) {
        response.redirect(
          302,
          `http://${config.get('wifi.ap.ipaddr')}/hotspot.html`
        );
        break;
      }

      // otherwise, fall through
    }
    // eslint-disable-next-line no-fallthrough
    case '/kindle-wifi/wifistub.html':  // Kindle
    case '/generate_204':               // Android, Chrome
    case '/fwlink/':                    // Windows
    case '/redirect':                   // Windows
    case '/success.txt':                // Firefox
      // Redirect to the router setup page
      response.redirect(
        302,
        `http://${config.get('wifi.ap.ipaddr')}/router-setup`
      );
      break;
    default:
      console.log('router-setup: handleCaptive: unknown path, skipping.');
      next();
      break;
  }
}

/**
 * Handle requests to the root URL. We display a different page depending on
 * what stage of setup we're at.
 */
function handleRoot(request, response) {
  // We don't have the router configured yet, display the router setup page
  console.log(
    'router-setup: handleRoot: router unconfigured; redirecting to ' +
    'router-setup'
  );
  response.redirect('/router-setup');
}

/**
 * Handle requests to /router-setup.
 */
function handleRouterSetup(request, response) {
  DEBUG && console.log('router-setup: handleRouterSetup:', request.path);
  const ssid = getHotspotSsid();
  response.render('router-setup', {ssid});
}

/**
 * Handle requests to /creating.
 */
function handleCreating(request, response) {
  DEBUG && console.log('router-setup: handleCreating:', request.path);
  mDNSserver.getmDNSdomain().then((domain) => {
    const ssid = request.body.ssid.trim();
    const password = request.body.password.trim();

    if (ssid.length < 1 || ssid.length > 32 || password.length < 8) {
      response.status(400).send('Invalid parameters.');
      return;
    }

    response.render(
      'creating',
      {
        domain,
        ap_ip: config.get('wifi.ap.ipaddr'),
        ap_ssid: ssid,
      }
    );

    // Wait before switching networks to make sure the response gets through.
    // And also wait to be sure that the access point is fully down before
    // defining the new network.
    sleep(2000)
      .then(() => {
        stopCaptivePortal();
        return sleep(5000);
      })
      .then(() => {
        return defineNetwork(ssid, password);
      })
      .then((success) => {
        if (!success) {
          console.error(
            'router-setup: handleCreating: failed to define network'
          );
        } else {
          return waitForWiFi(20, 3000).then(() => {
            DEBUG && console.log('router-setup: setup complete');
            RouterSetupApp.onConnection();
          });
        }
      })
      .catch((error) => {
        if (error) {
          console.error('router-setup: handleCreating: general error:', error);
        }
      });
  });
}

/**
 * Get the SSID of the hotspot.
 *
 * @returns {string} SSID
 */
function getHotspotSsid() {
  const base = config.get('wifi.ap.ssid_base');
  const mac = platform.getMacAddress('wlan0');
  if (!mac) {
    DEBUG && console.log('router-setup: getHotSpotSsid: returning', base);
    return base;
  }

  // Get the last 2 octets of the MAC and create a simple string, e.g. 9E28
  const id = mac.split(':').slice(4).join('').toUpperCase();

  DEBUG && console.log('router-setup: getHotSpotSsid: returning', `${base} ${id}`);
  return `${base} ${id}`;
}

/**
 * Enable an access point that users can connect to to configure the device.
 *
 * This requires that hostapd and udhcpd are installed on the system but not
 * enabled, so that they do not automatically run when the device boots up.
 * This also requires that hostapd and udhcpd have appropriate config files
 * that define the SSID for the wifi network to be created, for example.
 * Also, the udhcpd config file should be set up to work with the IP address
 * of the device.
 *
 * @param {string} ipaddr - IP address of AP
 * @returns {boolean} Boolean indicating success of the command.
 */
function startCaptivePortal(ipaddr) {
  console.log('router-setup: startCaptivePortal: ipaddr:', ipaddr);
  const ssid = getHotspotSsid();

  // Set the WAN mode to be DHCP. By doing this here, it allows us to get
  // an IP address and allows NTP to set the time by the time we get to
  // registering the tunnel.

  const wanMode = platform.getWanMode();
  if (wanMode.mode != 'dhcp') {
    platform.setWanMode('dhcp');
  }

  // We need the LAN to be configured to have a static IP address,
  // and run dnsmasq (DHCP server and DNS server).

  const ifname = null;
  const netmask = '255.255.255.0';

  if (!platform.setLanMode('static', {ipaddr, ifname, netmask})) {
    console.error('router-setup: startCaptivePortal: setLanMode failed');
    return false;
  }
  if (!platform.setCaptivePortalStatus(true, {ipaddr, restart: false})) {
    console.error('router-setup: startCaptivePortal:',
                  'setCaptivePortalStatus failed');
    return false;
  }
  if (!platform.setDhcpServerStatus(true, {ipaddr})) {
    console.error('router-setup: startCaptivePortal:',
                  'setDhcpServerStatus failed');
    return false;
  }
  const encryption = 'none';
  if (!platform.setWirelessMode(true, 'ap', {ssid, encryption})) {
    console.error('router-setup: startCaptivePortal: setWirelessMode failed');
    return false;
  }
  return true;
}

/**
 * Stop the running access point.
 *
 * @returns {boolean} Boolean indicating success of the command.
 */
function stopCaptivePortal() {
  console.log('router-setup: stopCaptivePortal');
  let result = platform.setCaptivePortalStatus(false, {restart: true});
  result &= platform.setWirelessMode(false, 'ap');
  return result;
}

/**
 * Define a new network.
 *
 * @param {string} ssid - SSID to configure
 * @param {string?} password - PSK to configure
 * @returns {Promise} Promise which resolves to a boolean indicating success of
 *                    the command.
 */
function defineNetwork(ssid, password) {
  console.log('router-setup: defineNetwork: ssid:', ssid);

  const wanMode = platform.getWanMode();
  if (wanMode.mode != 'dhcp') {
    platform.setWanMode('dhcp');
  }

  return Settings.set('router.configured', true).then(() => {
    return platform.setWirelessMode(
      true,
      'ap',
      {
        ssid,
        key: password,
        encryption: 'psk2',
      }
    );
  }).catch((e) => {
    console.error('router-setup: Error defining network:', e);
    return false;
  });
}

/**
 * Determine whether or not we already have a connection.
 *
 * @returns {Promise} Promise which resolves to true/false, indicating whether
 *                    or not we have a connection.
 */
function checkConnection() {
  return Settings.get('router.configured')
    .catch(() => false)
    .then((configured) => {
      if (configured) {
        return platform.checkConnection();
      }

      if (!startCaptivePortal(config.get('wifi.ap.ipaddr'))) {
        console.error('router-setup: checkConnection:',
                      'failed to start Captive Portal');
      }
      return false;
    });
}

/**
 * Wait for a wifi connection.
 *
 * @param {number} maxAttempts - Maximum number of attempts
 * @param {number} interval - Interval at which to check, in milliseconds
 * @returns {Promise} Promise which resolves when we're connected. If we
 *                    aren't connected after maxAttempts attempts, then the
 *                    promise is rejected.
 */
function waitForWiFi(maxAttempts, interval) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    check();

    function check() {
      attempts++;
      const status = platform.getWirelessMode();
      if (status.enabled && status.mode === 'ap') {
        console.log('router-setup: waitForWifi: connection found');

        // For the traditional router setup, we have a statically assigned
        // address so we can skip checking for the address.
        // checkForAddress();
        resolve();
      } else {
        console.log(
          'router-setup: waitForWifi: No wifi connection on attempt', attempts
        );
        retryOrGiveUp();
      }
    }

    /*
     * We'll eventually want this function back for supporting DHCP client
     *
    function checkForAddress() {
      const ifaces = os.networkInterfaces();

      if (ifaces.hasOwnProperty('wlan0')) {
        for (const addr of ifaces.wlan0) {
          if (addr.family !== 'IPv4' || addr.internal) {
            continue;
          }

          resolve();
          return;
        }
      }

      retryOrGiveUp();
    }
    */

    function retryOrGiveUp() {
      if (attempts >= maxAttempts) {
        console.error(
          'router-setup: waitForWiFi: No wifi available, giving up.'
        );
        reject();
      } else {
        setTimeout(check, interval);
      }
    }
  });
}

module.exports = {
  RouterSetupApp,
  isRouterConfigured: checkConnection,
};


/***/ }),

/***/ "./src/router.js":
/*!***********************!*\
  !*** ./src/router.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Router.
 *
 * Configure web app routes.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const config = __webpack_require__(/*! config */ "config");
const compression = __webpack_require__(/*! compression */ "compression");
const Constants = __webpack_require__(/*! ./constants */ "./src/constants.js");
const express = __webpack_require__(/*! express */ "express");
const jwtMiddleware = __webpack_require__(/*! ./jwt-middleware */ "./src/jwt-middleware.js");
const nocache = __webpack_require__(/*! nocache */ "nocache")();
const UserProfile = __webpack_require__(/*! ./user-profile */ "./src/user-profile.js");

const auth = jwtMiddleware.middleware();

const API_PREFIX = '/api'; // A pseudo path to use for API requests
const APP_PREFIX = '/app'; // A pseudo path to use for front end requests

/**
 * Router.
 */
const Router = {
  /**
   * Configure web app routes.
   */
  configure: function(app, options) {
    this.proxyController = __webpack_require__(/*! ./controllers/proxy_controller */ "./src/controllers/proxy_controller.js");

    // Compress all responses larger than 1kb
    app.use(compression());

    app.use((request, response, next) => {
      // Enable HSTS
      if (request.protocol === 'https') {
        response.set('Strict-Transport-Security',
                     'max-age=31536000; includeSubDomains');
      }

      // Disable embedding
      /*
      response.set('Content-Security-Policy',
                   config.get('oauthPostToken') ?
                     'frame-ancestors filesystem:' :
                     'frame-ancestors \'none\''
      );
       */

      next();
    });

    // First look for a static file
    const staticHandler = express.static(Constants.BUILD_STATIC_PATH);
    app.use(Constants.UPLOADS_PATH, express.static(UserProfile.uploadsDir));
    app.use(Constants.EXTENSIONS_PATH, nocache,
            __webpack_require__(/*! ./controllers/extensions_controller */ "./src/controllers/extensions_controller.js"));
    app.use((request, response, next) => {
      if (request.path === '/' && request.accepts('html')) {
        // We need this to hit RootController.
        next();
      } else {
        staticHandler(request, response, next);
      }
    });

    // Content negotiation middleware
    app.use((request, response, next) => {
      // Inform the browser that content negotiation is taking place
      response.setHeader('Vary', 'Accept');

      // Enable CORS for all requests
      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      response.setHeader('Access-Control-Allow-Methods',
                         'GET,HEAD,PUT,PATCH,POST,DELETE');

      // If this is a proxy request, skip everything and go straight there.
      if (request.path.startsWith(Constants.PROXY_PATH)) {
        request.url = APP_PREFIX + request.url;
        next();

      // If request won't accept HTML but will accept JSON,
      // or is a WebSocket request, or is multipart/form-data
      // treat it as an API request
      } else if (!request.accepts('html') && request.accepts('json') ||
                 request.headers['content-type'] === 'application/json' ||
                 request.get('Upgrade') === 'websocket' ||
                 request.is('multipart/form-data') ||
                 request.path.startsWith(Constants.ADDONS_PATH) ||
                 request.path.startsWith(Constants.INTERNAL_LOGS_PATH)) {
        request.url = API_PREFIX + request.url;
        next();

      // Otherwise treat it as an app request
      } else {
        request.url = APP_PREFIX + request.url;
        next();
      }
    });

    // Handle proxied resources
    app.use(APP_PREFIX + Constants.PROXY_PATH, nocache, auth,
            this.proxyController);

    // Let OAuth handle its own rendering
    app.use(APP_PREFIX + Constants.OAUTH_PATH, nocache,
            __webpack_require__(/*! ./controllers/oauth_controller */ "./src/controllers/oauth_controller.ts").default);

    // Handle static media files before other static content. These must be
    // authenticated.
    app.use(APP_PREFIX + Constants.MEDIA_PATH, nocache, auth,
            express.static(UserProfile.mediaDir));

    // Web app routes - send index.html and fall back to client side URL router
    app.use(`${APP_PREFIX}/*`, __webpack_require__(/*! ./controllers/root_controller */ "./src/controllers/root_controller.js"));

    // Unauthenticated API routes
    app.use(API_PREFIX + Constants.LOGIN_PATH, nocache,
            __webpack_require__(/*! ./controllers/login_controller */ "./src/controllers/login_controller.js"));
    app.use(API_PREFIX + Constants.SETTINGS_PATH, nocache,
            __webpack_require__(/*! ./controllers/settings_controller */ "./src/controllers/settings_controller.js"));
    app.use(API_PREFIX + Constants.USERS_PATH, nocache,
            __webpack_require__(/*! ./controllers/users_controller */ "./src/controllers/users_controller.js"));
    app.use(API_PREFIX + Constants.PING_PATH, nocache,
            __webpack_require__(/*! ./controllers/ping_controller */ "./src/controllers/ping_controller.js"));
    if (options.debug) {
      app.use(API_PREFIX + Constants.DEBUG_PATH, nocache,
              __webpack_require__(/*! ./controllers/debug_controller */ "./src/controllers/debug_controller.js"));
    }

    // Authenticated API routes
    app.use(API_PREFIX + Constants.THINGS_PATH, nocache, auth,
            __webpack_require__(/*! ./controllers/things_controller */ "./src/controllers/things_controller.js"));
    app.use(API_PREFIX + Constants.NEW_THINGS_PATH, nocache, auth,
            __webpack_require__(/*! ./controllers/new_things_controller */ "./src/controllers/new_things_controller.js"));
    app.use(API_PREFIX + Constants.ADAPTERS_PATH, nocache, auth,
            __webpack_require__(/*! ./controllers/adapters_controller */ "./src/controllers/adapters_controller.js"));
    app.use(API_PREFIX + Constants.ACTIONS_PATH, nocache, auth,
            __webpack_require__(/*! ./controllers/actions_controller */ "./src/controllers/actions_controller.js"));
    app.use(API_PREFIX + Constants.EVENTS_PATH, nocache, auth,
            __webpack_require__(/*! ./controllers/events_controller */ "./src/controllers/events_controller.js"));
    app.use(API_PREFIX + Constants.LOG_OUT_PATH, nocache, auth,
            __webpack_require__(/*! ./controllers/log_out_controller */ "./src/controllers/log_out_controller.js"));
    app.use(API_PREFIX + Constants.UPLOADS_PATH, nocache, auth,
            __webpack_require__(/*! ./controllers/uploads_controller */ "./src/controllers/uploads_controller.js"));
    app.use(API_PREFIX + Constants.UPDATES_PATH, nocache, auth,
            __webpack_require__(/*! ./controllers/updates_controller */ "./src/controllers/updates_controller.js"));
    app.use(API_PREFIX + Constants.ADDONS_PATH, nocache, auth,
            __webpack_require__(/*! ./controllers/addons_controller */ "./src/controllers/addons_controller.js"));
    app.use(API_PREFIX + Constants.RULES_PATH, nocache, auth,
            __webpack_require__(/*! ./rules-engine/index */ "./src/rules-engine/index.js"));
    app.use(API_PREFIX + Constants.INTERNAL_LOGS_PATH, nocache, auth,
            __webpack_require__(/*! ./controllers/internal_logs_controller */ "./src/controllers/internal_logs_controller.js"));
    app.use(API_PREFIX + Constants.PUSH_PATH, nocache, auth,
            __webpack_require__(/*! ./controllers/push_controller */ "./src/controllers/push_controller.js"));
    app.use(API_PREFIX + Constants.LOGS_PATH, nocache, auth,
            __webpack_require__(/*! ./controllers/logs_controller */ "./src/controllers/logs_controller.js"));
    app.use(API_PREFIX + Constants.NOTIFIERS_PATH, nocache, auth,
            __webpack_require__(/*! ./controllers/notifiers_controller */ "./src/controllers/notifiers_controller.js"));

    app.use(API_PREFIX + Constants.OAUTH_PATH, nocache,
            __webpack_require__(/*! ./controllers/oauth_controller */ "./src/controllers/oauth_controller.ts").default);
    app.use(API_PREFIX + Constants.OAUTHCLIENTS_PATH, nocache, auth,
            __webpack_require__(/*! ./controllers/oauthclients_controller */ "./src/controllers/oauthclients_controller.ts").default);
  },

  addProxyServer(thingId, server) {
    this.proxyController.addProxyServer(thingId, server);
  },

  removeProxyServer(thingId) {
    this.proxyController.removeProxyServer(thingId);
  },
};

module.exports = Router;


/***/ }),

/***/ "./src/rules-engine/APIError.js":
/*!**************************************!*\
  !*** ./src/rules-engine/APIError.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



/**
 * A simple helper class for sending JSON-formatted errors to clients
 */
class APIError extends Error {
  constructor(message, originalError) {
    super(message);
    if (originalError) {
      this.message += `: ${originalError.message}`;
    }
    console.error(`new API Error: ${this.message}`);
  }

  toString() {
    return JSON.stringify({error: true, message: this.message});
  }
}

module.exports = APIError;


/***/ }),

/***/ "./src/rules-engine/Database.js":
/*!**************************************!*\
  !*** ./src/rules-engine/Database.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const db = __webpack_require__(/*! ../db */ "./src/db.js");
const DatabaseMigrate = __webpack_require__(/*! ./DatabaseMigrate */ "./src/rules-engine/DatabaseMigrate.js");

class Database {
  constructor() {
    if (!db.db) {
      db.open();
    }
    this.open();
  }

  /**
   * Open the database
   */
  open() {
    const rulesTableSQL = `CREATE TABLE IF NOT EXISTS rules (
      id INTEGER PRIMARY KEY,
      description TEXT
    );`;
    return db.run(rulesTableSQL, []);
  }

  /**
   * Get all rules
   * @return {Promise<Map<number, RuleDescription>>} resolves to a map of rule
   * id to rule
   */
  getRules() {
    return new Promise((resolve, reject) => {
      db.db.all(
        'SELECT id, description FROM rules',
        [],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          const rules = {};
          const updatePromises = [];
          for (const row of rows) {
            let desc = JSON.parse(row.description);
            const updatedDesc = DatabaseMigrate.migrate(desc);
            if (updatedDesc) {
              desc = updatedDesc;
              updatePromises.push(this.updateRule(row.id, desc));
            }
            rules[row.id] = desc;
          }
          Promise.all(updatePromises).then(() => {
            resolve(rules);
          });
        }
      );
    });
  }

  /**
   * Create a new rule
   * @param {RuleDescription} desc
   * @return {Promise<number>} resolves to rule id
   */
  createRule(desc) {
    return db.run(
      'INSERT INTO rules (description) VALUES (?)',
      [JSON.stringify(desc)]
    ).then((res) => {
      return parseInt(res.lastID);
    });
  }

  /**
   * Update an existing rule
   * @param {number} id
   * @param {RuleDescription} desc
   * @return {Promise}
   */
  updateRule(id, desc) {
    return db.run(
      'UPDATE rules SET description = ? WHERE id = ?',
      [JSON.stringify(desc), id]
    );
  }

  /**
   * Delete an existing rule
   * @param {number} id
   * @return {Promise}
   */
  deleteRule(id) {
    return db.run('DELETE FROM rules WHERE id = ?', [id]);
  }
}

module.exports = new Database();


/***/ }),

/***/ "./src/rules-engine/DatabaseMigrate.js":
/*!*********************************************!*\
  !*** ./src/rules-engine/DatabaseMigrate.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function extractProperty(href) {
  return href.match(/properties\/([^/]+)/)[1];
}

function extractThing(href) {
  return href.match(/things\/([^/]+)/)[1];
}

function migrateTimeTrigger(trigger) {
  if (trigger.localized) {
    return;
  }

  // If the time trigger has not been localized, it's still in UTC time
  const parts = trigger.time.split(':');
  let hours = parseInt(parts[0], 10);
  let minutes = parseInt(parts[1], 10);

  // Convert from UTC to local
  const oldTime = new Date();
  const offset = oldTime.getTimezoneOffset();
  oldTime.setUTCHours(hours, minutes, 0, 0);
  const newTime = new Date(oldTime + (offset * 60 * 1000));

  hours = newTime.getHours().toString().padStart(2, '0');
  minutes = newTime.getMinutes().toString().padStart(2, '0');

  return {
    type: 'TimeTrigger',
    time: `${hours}:${minutes}`,
    localized: true,
  };
}

function migrateProperty(prop) {
  if (!prop.href) {
    return;
  }
  const base = Object.assign({}, prop);
  delete base.href;
  return Object.assign(base, {
    id: extractProperty(prop.href),
    thing: extractThing(prop.href),
  });
}

function migrateThing(thing) {
  console.log('migrateThing', thing);
  if (typeof thing !== 'object') {
    return;
  }
  if (!thing.href) {
    return;
  }
  return extractThing(thing.href);
}

function migratePart(part) {
  let changed = false;
  const newPart = Object.assign({}, part);
  if (part.triggers) {
    newPart.triggers = part.triggers.map((child) => {
      const newChild = migratePart(child);
      if (newChild) {
        changed = true;
      }
      return newChild || child;
    });
  }

  if (part.effects) {
    newPart.effects = part.effects.map((child) => {
      const newChild = migratePart(child);
      if (newChild) {
        changed = true;
      }
      return newChild || child;
    });
  }

  if (part.type === 'TimeTrigger') {
    const newTrigger = migrateTimeTrigger(part);
    if (newTrigger) {
      changed = true;
      Object.assign(newPart, newTrigger);
    }
  } else if (part.property) {
    const newProp = migrateProperty(part.property);
    if (newProp) {
      changed = true;
    }
    newPart.property = newProp || part.property;
  } else if (part.thing) {
    const newThing = migrateThing(part.thing);
    if (newThing) {
      changed = true;
    }
    newPart.thing = newThing || part.thing;
  }

  if (!changed) {
    return;
  }

  return newPart;
}

function migrate(oldRule) {
  const newRule = Object.assign({}, oldRule);
  const newTrigger = migratePart(oldRule.trigger);
  let changed = false;
  if (newTrigger) {
    changed = true;
    newRule.trigger = newTrigger;
  }
  const newEffect = migratePart(oldRule.effect);
  if (newEffect) {
    changed = true;
    newRule.effect = newEffect;
  }

  if (!changed) {
    return;
  }
  return newRule;
}

module.exports = {
  migrate,
};


/***/ }),

/***/ "./src/rules-engine/Engine.js":
/*!************************************!*\
  !*** ./src/rules-engine/Engine.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Database = __webpack_require__(/*! ./Database */ "./src/rules-engine/Database.js");
const Rule = __webpack_require__(/*! ./Rule */ "./src/rules-engine/Rule.js");

/**
 * An engine for running and managing list of rules
 */
class Engine {
  /**
   * Get a list of all current rules
   * @return {Promise<Array<Rule>>} rules
   */
  getRules() {
    let rulesPromise = Promise.resolve(this.rules);

    if (!this.rules) {
      rulesPromise = Database.getRules().then(async (ruleDescs) => {
        this.rules = {};
        for (const ruleId in ruleDescs) {
          ruleDescs[ruleId].id = parseInt(ruleId);
          this.rules[ruleId] = Rule.fromDescription(ruleDescs[ruleId]);
          await this.rules[ruleId].start();
        }
        return this.rules;
      });
    }

    return rulesPromise.then((rules) => {
      return Object.keys(rules).map((ruleId) => {
        return rules[ruleId];
      });
    });
  }

  /**
   * Get a rule by id
   * @param {number} id
   * @return {Promise<Rule>}
   */
  getRule(id) {
    const rule = this.rules[id];
    if (!rule) {
      return Promise.reject(new Error(`Rule ${id} does not exist`));
    }
    return Promise.resolve(rule);
  }

  /**
   * Add a new rule to the engine's list
   * @param {Rule} rule
   * @return {Promise<number>} rule id
   */
  async addRule(rule) {
    const id = await Database.createRule(rule.toDescription());
    // eslint-disable-next-line require-atomic-updates
    rule.id = id;
    this.rules[id] = rule;
    await rule.start();
    return id;
  }

  /**
   * Update an existing rule
   * @param {number} rule id
   * @param {Rule} rule
   * @return {Promise}
   */
  async updateRule(ruleId, rule) {
    if (!this.rules[ruleId]) {
      return Promise.reject(new Error(`Rule ${ruleId} does not exist`));
    }
    rule.id = ruleId;
    await Database.updateRule(ruleId, rule.toDescription());

    this.rules[ruleId].stop();
    this.rules[ruleId] = rule;
    await rule.start();
  }

  /**
   * Delete an existing rule
   * @param {number} rule id
   * @return {Promise}
   */
  deleteRule(ruleId) {
    if (!this.rules[ruleId]) {
      return Promise.reject(
        new Error(`Rule ${ruleId} does not exist`));
    }
    return Database.deleteRule(ruleId).then(() => {
      this.rules[ruleId].stop();
      delete this.rules[ruleId];
    });
  }
}

module.exports = Engine;


/***/ }),

/***/ "./src/rules-engine/Events.js":
/*!************************************!*\
  !*** ./src/rules-engine/Events.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * List of event types
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



module.exports = {
  // Sent by a trigger to a rule to notify effects
  STATE_CHANGED: 'state-changed',
  // Sent by a property to a trigger to potentially change state
  VALUE_CHANGED: 'value-changed',
};


/***/ }),

/***/ "./src/rules-engine/Property.js":
/*!**************************************!*\
  !*** ./src/rules-engine/Property.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const assert = __webpack_require__(/*! assert */ "assert");
const AddonManager = __webpack_require__(/*! ../addon-manager */ "./src/addon-manager.js");
const Constants = __webpack_require__(/*! ../constants */ "./src/constants.js");
const Things = __webpack_require__(/*! ../models/things */ "./src/models/things.js");
const EventEmitter = __webpack_require__(/*! events */ "events").EventEmitter;
const Events = __webpack_require__(/*! ./Events */ "./src/rules-engine/Events.js");

/**
 * Utility to support operations on Thing's properties
 */
class Property extends EventEmitter {
  /**
   * Create a Property from a descriptor returned by the WoT API
   * @param {PropertyDescription} desc
   */
  constructor(desc) {
    super();

    assert(desc.type);
    assert(desc.thing);
    assert(desc.id);

    this.type = desc.type;
    this.thing = desc.thing;
    this.id = desc.id;

    if (desc.unit) {
      this.unit = desc.unit;
    }
    if (desc.description) {
      this.description = desc.description;
    }

    this.onPropertyChanged = this.onPropertyChanged.bind(this);
    this.onThingAdded = this.onThingAdded.bind(this);
  }

  /**
   * @return {PropertyDescription}
   */
  toDescription() {
    const desc = {
      type: this.type,
      thing: this.thing,
      id: this.id,
    };
    if (this.unit) {
      desc.unit = this.unit;
    }
    if (this.description) {
      desc.description = this.description;
    }
    return desc;
  }

  /**
   * @return {Promise} resolves to property's value or undefined if not found
   */
  async get() {
    try {
      return await Things.getThingProperty(this.thing, this.id);
    } catch (e) {
      console.warn('Rule get failed', e);
    }
  }

  /**
   * @param {any} value
   * @return {Promise} resolves when set is done
   */
  set(value) {
    return Things.setThingProperty(this.thing, this.id, value).catch((e) => {
      console.warn('Rule set failed, retrying once', e);
      return Things.setThingProperty(this.thing, this.id, value);
    }).catch((e) => {
      console.warn('Rule set failed completely', e);
    });
  }

  async start() {
    AddonManager.on(Constants.PROPERTY_CHANGED, this.onPropertyChanged);

    try {
      await this.getInitialValue();
    } catch (_e) {
      AddonManager.on(Constants.THING_ADDED, this.onThingAdded);
    }
  }

  async getInitialValue() {
    const initialValue = await this.get();
    if (typeof initialValue === 'undefined') {
      throw new Error('Did not get a real value');
    }
    this.emit(Events.VALUE_CHANGED, initialValue);
  }

  /**
   * Listener for AddonManager's THING_ADDED event
   * @param {String} thing - thing id
   */
  onThingAdded(thing) {
    if (thing.id !== this.thing) {
      return;
    }
    this.getInitialValue().catch((e) => {
      console.warn('Rule property unable to get initial value:', e.message);
    });
  }

  onPropertyChanged(property) {
    if (property.device.id !== this.thing) {
      return;
    }
    if (property.name !== this.id) {
      return;
    }
    this.emit(Events.VALUE_CHANGED, property.value);
  }

  stop() {
    AddonManager.removeListener(Constants.PROPERTY_CHANGED,
                                this.onPropertyChanged);
    AddonManager.removeListener(Constants.THING_ADDED,
                                this.onThingAdded);
  }
}

module.exports = Property;


/***/ }),

/***/ "./src/rules-engine/Rule.js":
/*!**********************************!*\
  !*** ./src/rules-engine/Rule.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const effects = __webpack_require__(/*! ./effects */ "./src/rules-engine/effects/index.js");
const triggers = __webpack_require__(/*! ./triggers */ "./src/rules-engine/triggers/index.js");
const Events = __webpack_require__(/*! ./Events */ "./src/rules-engine/Events.js");

const DEBUG =  false || ("development" === 'test');

class Rule {
  /**
   * @param {boolean} enabled
   * @param {Trigger} trigger
   * @param {Effect} effect
   */
  constructor(enabled, trigger, effect) {
    this.enabled = enabled;
    this.trigger = trigger;
    this.effect = effect;

    this.onTriggerStateChanged = this.onTriggerStateChanged.bind(this);
  }

  /**
   * Begin executing the rule
   */
  async start() {
    this.trigger.on(Events.STATE_CHANGED, this.onTriggerStateChanged);
    await this.trigger.start();
    if (DEBUG) {
      console.debug('Rule.start', this.name);
    }
  }

  /**
   * On a state changed event, pass the state forward to the rule's effect
   * @param {State} state
   */
  onTriggerStateChanged(state) {
    if (!this.enabled) {
      return;
    }
    if (DEBUG) {
      console.debug('Rule.onTriggerStateChanged', this.name, state);
    }
    this.effect.setState(state);
  }

  /**
   * @return {RuleDescription}
   */
  toDescription() {
    const desc = {
      enabled: this.enabled,
      trigger: this.trigger.toDescription(),
      effect: this.effect.toDescription(),
    };
    if (this.hasOwnProperty('id')) {
      desc.id = this.id;
    }
    if (this.hasOwnProperty('name')) {
      desc.name = this.name;
    }
    return desc;
  }

  /**
   * Stop executing the rule
   */
  stop() {
    this.trigger.removeListener(Events.STATE_CHANGED,
                                this.onTriggerStateChanged);
    this.trigger.stop();
    if (DEBUG) {
      console.debug('Rule.stop', this.name);
    }
  }
}

/**
 * Create a rule from a serialized description
 * @param {RuleDescription} desc
 * @return {Rule}
 */
Rule.fromDescription = (desc) => {
  const trigger = triggers.fromDescription(desc.trigger);
  const effect = effects.fromDescription(desc.effect);
  const rule = new Rule(desc.enabled, trigger, effect);
  if (desc.hasOwnProperty('id')) {
    rule.id = desc.id;
  }
  if (desc.hasOwnProperty('name')) {
    rule.name = desc.name;
  }
  return rule;
};

module.exports = Rule;


/***/ }),

/***/ "./src/rules-engine/effects/ActionEffect.js":
/*!**************************************************!*\
  !*** ./src/rules-engine/effects/ActionEffect.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const assert = __webpack_require__(/*! assert */ "assert");

const Action = __webpack_require__(/*! ../../models/action */ "./src/models/action.js");
const Actions = __webpack_require__(/*! ../../models/actions */ "./src/models/actions.js");
const AddonManager = __webpack_require__(/*! ../../addon-manager */ "./src/addon-manager.js");
const Effect = __webpack_require__(/*! ./Effect */ "./src/rules-engine/effects/Effect.js");
const Things = __webpack_require__(/*! ../../models/things */ "./src/models/things.js");

/**
 * An Effect which creates an action
 */
class ActionEffect extends Effect {
  /**
   * @param {EffectDescription} desc
   */
  constructor(desc) {
    super(desc);

    assert(desc.thing);
    assert(desc.action);

    this.thing = desc.thing;
    this.action = desc.action;
    this.parameters = desc.parameters || {};
  }

  /**
   * @return {EffectDescription}
   */
  toDescription() {
    return Object.assign(
      super.toDescription(),
      {
        thing: this.thing,
        action: this.action,
        parameters: this.parameters,
      }
    );
  }

  /**
   * @param {State} state
   */
  setState(state) {
    if (!state.on) {
      return;
    }

    this.createAction();
  }

  async createAction() {
    try {
      const thing = await Things.getThing(this.thing);

      const action = new Action(this.action, this.parameters, thing);
      await Actions.add(action);
      await AddonManager.requestAction(this.thing, action.id, this.action,
                                       this.parameters);
    } catch (e) {
      console.warn('Unable to dispatch action', e);
    }
  }
}

module.exports = ActionEffect;



/***/ }),

/***/ "./src/rules-engine/effects/Effect.js":
/*!********************************************!*\
  !*** ./src/rules-engine/effects/Effect.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



/**
 * Effect - The outcome of a Rule once triggered
 */
class Effect {
  /**
   * Create an Effect based on a wire-format description with a property
   * @param {EffectDescription} desc
   */
  constructor(desc) {
    this.type = this.constructor.name;
    this.label = desc.label;
  }

  /**
   * @return {EffectDescription}
   */
  toDescription() {
    return {
      type: this.type,
      label: this.label,
    };
  }

  /**
   * Set the state of Effect based on a trigger
   * @param {State} _state
   */
  setState(_state) {
    throw new Error('Unimplemented');
  }
}

module.exports = Effect;


/***/ }),

/***/ "./src/rules-engine/effects/MultiEffect.js":
/*!*************************************************!*\
  !*** ./src/rules-engine/effects/MultiEffect.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Effect = __webpack_require__(/*! ./Effect */ "./src/rules-engine/effects/Effect.js");

/**
 * MultiEffect - The outcome of a Rule involving multiple effects
 */
class MultiEffect extends Effect {
  /**
   * @param {MultiEffectDescription} desc
   */
  constructor(desc) {
    super(desc);
    const fromDescription = __webpack_require__(/*! ./index */ "./src/rules-engine/effects/index.js").fromDescription;

    this.effects = desc.effects.map(function(effect) {
      return fromDescription(effect);
    });
  }

  /**
   * @return {EffectDescription}
   */
  toDescription() {
    return Object.assign(super.toDescription(), {
      effects: this.effects.map((effect) => effect.toDescription()),
    });
  }

  /**
   * @param {State} state
   */
  setState(state) {
    for (const effect of this.effects) {
      effect.setState(state);
    }
  }
}

module.exports = MultiEffect;



/***/ }),

/***/ "./src/rules-engine/effects/NotificationEffect.js":
/*!********************************************************!*\
  !*** ./src/rules-engine/effects/NotificationEffect.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const assert = __webpack_require__(/*! assert */ "assert");
const Effect = __webpack_require__(/*! ./Effect */ "./src/rules-engine/effects/Effect.js");
const PushService = __webpack_require__(/*! ../../push-service */ "./src/push-service.js");

/**
 * An Effect which creates a notification
 */
class NotificationEffect extends Effect {
  /**
   * @param {EffectDescription} desc
   */
  constructor(desc) {
    super(desc);

    assert(desc.hasOwnProperty('message'));

    this.message = desc.message;
  }

  /**
   * @return {EffectDescription}
   */
  toDescription() {
    return Object.assign(
      super.toDescription(),
      {
        message: this.message,
      }
    );
  }

  /**
   * @param {State} state
   */
  setState(state) {
    if (!state.on) {
      return;
    }

    PushService.broadcastNotification(this.message);
  }
}

module.exports = NotificationEffect;



/***/ }),

/***/ "./src/rules-engine/effects/NotifierOutletEffect.js":
/*!**********************************************************!*\
  !*** ./src/rules-engine/effects/NotifierOutletEffect.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const assert = __webpack_require__(/*! assert */ "assert");
const Effect = __webpack_require__(/*! ./Effect */ "./src/rules-engine/effects/Effect.js");
const AddonManager = __webpack_require__(/*! ../../addon-manager */ "./src/addon-manager.js");

/**
 * An Effect which calls notify on a notifier's outlet
 */
class NotifierOutletEffect extends Effect {
  /**
   * @param {EffectDescription} desc
   */
  constructor(desc) {
    super(desc);

    assert(desc.hasOwnProperty('notifier'));
    assert(desc.hasOwnProperty('outlet'));
    assert(desc.hasOwnProperty('title'));
    assert(desc.hasOwnProperty('message'));
    assert(desc.hasOwnProperty('level'));

    this.notifier = desc.notifier;
    this.outlet = desc.outlet;
    this.title = desc.title;
    this.message = desc.message;
    this.level = desc.level;
  }

  /**
   * @return {EffectDescription}
   */
  toDescription() {
    return Object.assign(
      super.toDescription(),
      {
        notifier: this.notifier,
        outlet: this.outlet,
        title: this.title,
        message: this.message,
        level: this.level,
      }
    );
  }

  /**
   * @param {State} state
   */
  setState(state) {
    if (!state.on) {
      return;
    }

    const notifier = AddonManager.getNotifier(this.notifier);
    if (!notifier) {
      console.warn(`Notifier "${this.notifier}" not found, unable to notify`);
      return;
    }
    const outlet = notifier.getOutlet(this.outlet);
    if (!outlet) {
      console.warn(`Outlet "${this.outlet}" of notifier "${this.notifier}" not found, unable to notify`);
      return;
    }

    outlet.notify(this.title, this.message, this.level).catch((e) => {
      console.warn(`Outlet "${this.outlet}" of notifier "${this.notifier}" unable to notify`, e);
    });
  }
}

module.exports = NotifierOutletEffect;


/***/ }),

/***/ "./src/rules-engine/effects/PropertyEffect.js":
/*!****************************************************!*\
  !*** ./src/rules-engine/effects/PropertyEffect.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Property = __webpack_require__(/*! ../Property */ "./src/rules-engine/Property.js");
const Effect = __webpack_require__(/*! ./Effect */ "./src/rules-engine/effects/Effect.js");

/**
 * PropertyEffect - The outcome of a Rule involving a property
 */
class PropertyEffect extends Effect {
  /**
   * Create an Effect based on a wire-format description with a property
   * @param {PropertyEffectDescription} desc
   */
  constructor(desc) {
    super(desc);
    this.property = new Property(desc.property);
  }

  /**
   * @return {EffectDescription}
   */
  toDescription() {
    return Object.assign(super.toDescription(), {
      property: this.property.toDescription(),
    });
  }
}

module.exports = PropertyEffect;


/***/ }),

/***/ "./src/rules-engine/effects/PulseEffect.js":
/*!*************************************************!*\
  !*** ./src/rules-engine/effects/PulseEffect.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const assert = __webpack_require__(/*! assert */ "assert");
const PropertyEffect = __webpack_require__(/*! ./PropertyEffect */ "./src/rules-engine/effects/PropertyEffect.js");

/**
 * An Effect which temporarily sets the target property to
 * a value before restoring its original value
 */
class PulseEffect extends PropertyEffect {
  /**
   * @param {EffectDescription} desc
   */
  constructor(desc) {
    super(desc);
    this.value = desc.value;
    if (typeof this.value === 'number') {
      assert(this.property.type === 'number' ||
             this.property.type === 'integer',
             'setpoint and property must be compatible types');
    } else {
      assert(typeof this.value === this.property.type,
             'setpoint and property must be same type');
    }

    this.on = false;
    this.oldValue = null;
  }

  /**
   * @return {EffectDescription}
   */
  toDescription() {
    return Object.assign(
      super.toDescription(),
      {value: this.value}
    );
  }

  /**
   * @param {State} state
   */
  setState(state) {
    if (state.on) {
      // If we're already active, just perform the effect again
      if (this.on) {
        return this.property.set(this.value);
      }
      // Activate the effect and save our current state to revert to upon
      // deactivation
      this.property.get().then((value) => {
        this.oldValue = value;
        // Always set to the opposite (always toggle)
        if (typeof value === 'boolean') {
          this.oldValue = !this.value;
        }
        this.on = true;
        return this.property.set(this.value);
      });
    } else if (this.on) {
      // Revert to our original value if we pulsed to a new value
      this.on = false;
      if (this.oldValue !== null) {
        return this.property.set(this.oldValue);
      }
    }
  }
}

module.exports = PulseEffect;


/***/ }),

/***/ "./src/rules-engine/effects/SetEffect.js":
/*!***********************************************!*\
  !*** ./src/rules-engine/effects/SetEffect.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const assert = __webpack_require__(/*! assert */ "assert");
const PropertyEffect = __webpack_require__(/*! ./PropertyEffect */ "./src/rules-engine/effects/PropertyEffect.js");

/**
 * An Effect which permanently sets the target property to
 * a value when triggered
 */
class SetEffect extends PropertyEffect {
  /**
   * @param {EffectDescription} desc
   */
  constructor(desc) {
    super(desc);
    this.value = desc.value;
    if (typeof this.value === 'number') {
      assert(this.property.type === 'number' ||
             this.property.type === 'integer',
             'setpoint and property must be compatible types');
    } else {
      assert(typeof this.value === this.property.type,
             'setpoint and property must be same type');
    }
    this.on = false;
  }

  /**
   * @return {EffectDescription}
   */
  toDescription() {
    return Object.assign(
      super.toDescription(),
      {value: this.value}
    );
  }

  /**
   * @return {State}
   */
  setState(state) {
    if (!this.on && state.on) {
      this.on = true;
      return this.property.set(this.value);
    }
    if (this.on && !state.on) {
      this.on = false;
      return Promise.resolve();
    }
  }
}

module.exports = SetEffect;


/***/ }),

/***/ "./src/rules-engine/effects/index.js":
/*!*******************************************!*\
  !*** ./src/rules-engine/effects/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const effects = {
  Effect: __webpack_require__(/*! ./Effect */ "./src/rules-engine/effects/Effect.js"),
  ActionEffect: __webpack_require__(/*! ./ActionEffect */ "./src/rules-engine/effects/ActionEffect.js"),
  MultiEffect: __webpack_require__(/*! ./MultiEffect */ "./src/rules-engine/effects/MultiEffect.js"),
  NotificationEffect: __webpack_require__(/*! ./NotificationEffect */ "./src/rules-engine/effects/NotificationEffect.js"),
  NotifierOutletEffect: __webpack_require__(/*! ./NotifierOutletEffect */ "./src/rules-engine/effects/NotifierOutletEffect.js"),
  SetEffect: __webpack_require__(/*! ./SetEffect */ "./src/rules-engine/effects/SetEffect.js"),
  PulseEffect: __webpack_require__(/*! ./PulseEffect */ "./src/rules-engine/effects/PulseEffect.js"),
};

/**
 * Produce an effect from a serialized effect description. Throws if `desc` is
 * invalid
 * @param {EffectDescription} desc
 * @return {Effect}
 */
function fromDescription(desc) {
  const EffectClass = effects[desc.type];
  if (!EffectClass) {
    throw new Error(`Unsupported or invalid effect type:${desc.type}`);
  }
  return new EffectClass(desc);
}

module.exports = {
  effects: effects,
  fromDescription: fromDescription,
};


/***/ }),

/***/ "./src/rules-engine/index.js":
/*!***********************************!*\
  !*** ./src/rules-engine/index.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const PromiseRouter = __webpack_require__(/*! express-promise-router */ "express-promise-router");

const APIError = __webpack_require__(/*! ./APIError */ "./src/rules-engine/APIError.js");
const Database = __webpack_require__(/*! ./Database */ "./src/rules-engine/Database.js");
const Engine = __webpack_require__(/*! ./Engine */ "./src/rules-engine/Engine.js");
const Rule = __webpack_require__(/*! ./Rule */ "./src/rules-engine/Rule.js");

const index = PromiseRouter();
const engine = new Engine();

/**
 * Express middleware for extracting rules from the bodies of requests
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
function parseRuleFromBody(req, res, next) {
  if (!req.body.trigger) {
    res.status(400).send(new APIError('No trigger provided').toString());
    return;
  }
  if (!req.body.effect) {
    res.status(400).send(new APIError('No effect provided').toString());
    return;
  }

  let rule = null;
  try {
    rule = Rule.fromDescription(req.body);
  } catch (e) {
    res.status(400).send(new APIError('Invalid rule', e).toString());
    return;
  }
  req.rule = rule;
  next();
}

index.get('/', async (req, res) => {
  const rules = await engine.getRules();
  res.send(rules.map((rule) => {
    return rule.toDescription();
  }));
});


index.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rule = await engine.getRule(id);
    res.send(rule.toDescription());
  } catch (e) {
    res.status(404).send(
      new APIError('Engine failed to get rule', e).toString());
  }
});

index.post('/', parseRuleFromBody, async (req, res) => {
  const ruleId = await engine.addRule(req.rule);
  res.send({id: ruleId});
});

index.put('/:id', parseRuleFromBody, async (req, res) => {
  try {
    await engine.updateRule(parseInt(req.params.id), req.rule);
    res.send({});
  } catch (e) {
    res.status(404).send(
      new APIError('Engine failed to update rule', e).toString());
  }
});

index.delete('/:id', async (req, res) => {
  try {
    await engine.deleteRule(req.params.id);
    res.send({});
  } catch (e) {
    res.status(404).send(
      new APIError('Engine failed to delete rule', e).toString());
  }
});

index.configure = async () => {
  await Database.open();
  await engine.getRules();
};

module.exports = index;


/***/ }),

/***/ "./src/rules-engine/triggers/BooleanTrigger.js":
/*!*****************************************************!*\
  !*** ./src/rules-engine/triggers/BooleanTrigger.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const assert = __webpack_require__(/*! assert */ "assert");
const Events = __webpack_require__(/*! ../Events */ "./src/rules-engine/Events.js");
const PropertyTrigger = __webpack_require__(/*! ./PropertyTrigger */ "./src/rules-engine/triggers/PropertyTrigger.js");

/**
 * A Trigger which activates when a boolean property is
 * equal to a given value, `onValue`
 */
class BooleanTrigger extends PropertyTrigger {
  /**
   * @param {TriggerDescription} desc
   */
  constructor(desc) {
    super(desc);
    assert(this.property.type === 'boolean');
    assert(typeof desc.onValue === 'boolean');
    this.onValue = desc.onValue;
  }

  /**
   * @return {TriggerDescription}
   */
  toDescription() {
    return Object.assign(
      super.toDescription(),
      {onValue: this.onValue}
    );
  }

  /**
   * @param {boolean} propValue
   * @return {State}
   */
  onValueChanged(propValue) {
    if (propValue === this.onValue) {
      this.emit(Events.STATE_CHANGED, {on: true, value: propValue});
    } else {
      this.emit(Events.STATE_CHANGED, {on: false, value: propValue});
    }
  }
}

module.exports = BooleanTrigger;


/***/ }),

/***/ "./src/rules-engine/triggers/EqualityTrigger.js":
/*!******************************************************!*\
  !*** ./src/rules-engine/triggers/EqualityTrigger.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Events = __webpack_require__(/*! ../Events */ "./src/rules-engine/Events.js");
const PropertyTrigger = __webpack_require__(/*! ./PropertyTrigger */ "./src/rules-engine/triggers/PropertyTrigger.js");

/**
 * A trigger which activates when a property is equal to a given value
 */
class EqualityTrigger extends PropertyTrigger {
  /**
   * @param {TriggerDescription} desc
   */
  constructor(desc) {
    super(desc);

    this.value = desc.value;
  }

  /**
   * @return {TriggerDescription}
   */
  toDescription() {
    return Object.assign(
      super.toDescription(),
      {
        value: this.value,
      }
    );
  }

  /**
   * @param {number} propValue
   * @return {State}
   */
  onValueChanged(propValue) {
    const on = propValue === this.value;

    this.emit(Events.STATE_CHANGED, {on: on, value: propValue});
  }
}

module.exports = EqualityTrigger;


/***/ }),

/***/ "./src/rules-engine/triggers/EventTrigger.js":
/*!***************************************************!*\
  !*** ./src/rules-engine/triggers/EventTrigger.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const assert = __webpack_require__(/*! assert */ "assert");
const Events = __webpack_require__(/*! ../Events */ "./src/rules-engine/Events.js");
const Things = __webpack_require__(/*! ../../models/things */ "./src/models/things.js");
const Trigger = __webpack_require__(/*! ./Trigger */ "./src/rules-engine/triggers/Trigger.js");

/**
 * A trigger activated when an event occurs
 */
class EventTrigger extends Trigger {
  constructor(desc) {
    super(desc);
    assert(desc.thing);
    this.thing = desc.thing;
    this.event = desc.event;
    this.stopped = true;
    this.onEvent = this.onEvent.bind(this);
  }

  /**
   * @return {TriggerDescription}
   */
  toDescription() {
    return Object.assign(
      super.toDescription(),
      {
        thing: this.thing,
        event: this.event,
      }
    );
  }

  async start() {
    this.stopped = false;
    const thing = await Things.getThing(this.thing);
    if (this.stopped) {
      return;
    }
    thing.addEventSubscription(this.onEvent);
  }

  onEvent(event) {
    if (this.event !== event.name) {
      return;
    }

    this.emit(Events.STATE_CHANGED, {on: true, value: Date.now()});
    this.emit(Events.STATE_CHANGED, {on: false, value: Date.now()});
  }

  stop() {
    this.stopped = true;
    Things.getThing(this.thing).then((thing) => {
      thing.removeEventSubscription(this.onEvent);
    });
  }
}

module.exports = EventTrigger;



/***/ }),

/***/ "./src/rules-engine/triggers/LevelTrigger.js":
/*!***************************************************!*\
  !*** ./src/rules-engine/triggers/LevelTrigger.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const assert = __webpack_require__(/*! assert */ "assert");
const Events = __webpack_require__(/*! ../Events */ "./src/rules-engine/Events.js");
const PropertyTrigger = __webpack_require__(/*! ./PropertyTrigger */ "./src/rules-engine/triggers/PropertyTrigger.js");

const LevelTriggerTypes = {
  LESS: 'LESS',
  EQUAL: 'EQUAL',
  GREATER: 'GREATER',
};

/**
 * A trigger which activates when a numerical property is less or greater than
 * a given level
 */
class LevelTrigger extends PropertyTrigger {
  /**
   * @param {TriggerDescription} desc
   */
  constructor(desc) {
    super(desc);
    assert(this.property.type === 'number' || this.property.type === 'integer');
    assert(typeof desc.value === 'number');
    assert(LevelTriggerTypes[desc.levelType]);
    if (desc.levelType === 'EQUAL') {
      assert(this.property.type === 'integer');
    }

    this.value = desc.value;
    this.levelType = desc.levelType;
  }

  /**
   * @return {TriggerDescription}
   */
  toDescription() {
    return Object.assign(
      super.toDescription(),
      {
        value: this.value,
        levelType: this.levelType,
      }
    );
  }

  /**
   * @param {number} propValue
   * @return {State}
   */
  onValueChanged(propValue) {
    let on = false;

    switch (this.levelType) {
      case LevelTriggerTypes.LESS:
        if (propValue < this.value) {
          on = true;
        }
        break;
      case LevelTriggerTypes.EQUAL:
        if (propValue === this.value) {
          on = true;
        }
        break;
      case LevelTriggerTypes.GREATER:
        if (propValue > this.value) {
          on = true;
        }
        break;
    }

    this.emit(Events.STATE_CHANGED, {on: on, value: propValue});
  }
}

LevelTrigger.types = LevelTriggerTypes;

module.exports = LevelTrigger;


/***/ }),

/***/ "./src/rules-engine/triggers/MultiTrigger.js":
/*!***************************************************!*\
  !*** ./src/rules-engine/triggers/MultiTrigger.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const assert = __webpack_require__(/*! assert */ "assert");
const Events = __webpack_require__(/*! ../Events */ "./src/rules-engine/Events.js");
const Trigger = __webpack_require__(/*! ./Trigger */ "./src/rules-engine/triggers/Trigger.js");

const DEBUG =  false || ("development" === 'test');

const ops = {
  AND: 'AND',
  OR: 'OR',
};

/**
 * A Trigger which activates only when a set of triggers are activated
 */
class MultiTrigger extends Trigger {
  /**
   * @param {TriggerDescription} desc
   */
  constructor(desc) {
    super(desc);
    assert(desc.op in ops);
    this.op = desc.op;
    const fromDescription = __webpack_require__(/*! ./index */ "./src/rules-engine/triggers/index.js").fromDescription;

    if (DEBUG) {
      this.id = Math.floor(Math.random() * 1000);
    }
    this.triggers = desc.triggers.map((trigger) => {
      return fromDescription(trigger);
    });

    this.states = new Array(this.triggers.length);
    for (let i = 0; i < this.states.length; i++) {
      this.states[i] = false;
    }
    this.state = false;
  }

  /**
   * @return {TriggerDescription}
   */
  toDescription() {
    return Object.assign(super.toDescription(), {
      op: this.op,
      triggers: this.triggers.map((trigger) => trigger.toDescription()),
    });
  }

  async start() {
    const starts = this.triggers.map((trigger, triggerIndex) => {
      trigger.on(Events.STATE_CHANGED,
                 this.onStateChanged.bind(this, triggerIndex));
      return trigger.start();
    });
    await Promise.all(starts);
  }

  stop() {
    this.triggers.forEach((trigger) => {
      trigger.removeAllListeners(Events.STATE_CHANGED);
      trigger.stop();
    });
  }

  onStateChanged(triggerIndex, state) {
    this.states[triggerIndex] = state.on;

    let value = this.states[0];
    for (let i = 1; i < this.states.length; i++) {
      if (this.op === ops.AND) {
        value = value && this.states[i];
      } else if (this.op === ops.OR) {
        value = value || this.states[i];
      }
    }
    if (DEBUG) {
      console.debug(
        `MultiTrigger(${this.id}).onStateChanged(${triggerIndex}, ${state}) -> ${this.states}`);
    }
    if (value !== this.state) {
      this.state = value;
      this.emit(Events.STATE_CHANGED, {on: this.state});
    }
  }
}

module.exports = MultiTrigger;


/***/ }),

/***/ "./src/rules-engine/triggers/PropertyTrigger.js":
/*!******************************************************!*\
  !*** ./src/rules-engine/triggers/PropertyTrigger.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Events = __webpack_require__(/*! ../Events */ "./src/rules-engine/Events.js");
const Trigger = __webpack_require__(/*! ./Trigger */ "./src/rules-engine/triggers/Trigger.js");
const Property = __webpack_require__(/*! ../Property */ "./src/rules-engine/Property.js");

/**
 * An abstract class for triggers whose input is a single property
 */
class PropertyTrigger extends Trigger {
  constructor(desc) {
    super(desc);
    this.property = new Property(desc.property);
    this.onValueChanged = this.onValueChanged.bind(this);
  }

  /**
   * @return {TriggerDescription}
   */
  toDescription() {
    return Object.assign(
      super.toDescription(),
      {property: this.property.toDescription()}
    );
  }

  async start() {
    this.property.on(Events.VALUE_CHANGED, this.onValueChanged);
    await this.property.start();
  }

  onValueChanged(_value) {
  }

  stop() {
    this.property.removeListener(Events.VALUE_CHANGED, this.onValueChanged);
    this.property.stop();
  }
}

module.exports = PropertyTrigger;


/***/ }),

/***/ "./src/rules-engine/triggers/TimeTrigger.js":
/*!**************************************************!*\
  !*** ./src/rules-engine/triggers/TimeTrigger.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const Events = __webpack_require__(/*! ../Events */ "./src/rules-engine/Events.js");
const Trigger = __webpack_require__(/*! ./Trigger */ "./src/rules-engine/triggers/Trigger.js");

/**
 * An abstract class for triggers whose input is a single property
 */
class TimeTrigger extends Trigger {
  constructor(desc) {
    super(desc);
    this.time = desc.time;
    this.localized = !!desc.localized;
    this.sendOn = this.sendOn.bind(this);
    this.sendOff = this.sendOff.bind(this);
  }

  /**
   * @return {TriggerDescription}
   */
  toDescription() {
    return Object.assign(
      super.toDescription(),
      {time: this.time, localized: this.localized}
    );
  }

  async start() {
    this.scheduleNext();
  }

  scheduleNext() {
    const parts = this.time.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    // Time is specified in local time
    const nextTime = new Date();
    nextTime.setHours(hours, minutes, 0, 0);

    if (nextTime.getTime() < Date.now()) {
      // NB: this will wrap properly into the next month/year
      nextTime.setDate(nextTime.getDate() + 1);
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(this.sendOn, nextTime.getTime() - Date.now());
  }

  sendOn() {
    this.emit(Events.STATE_CHANGED, {on: true, value: Date.now()});
    this.timeout = setTimeout(this.sendOff, 60 * 1000);
  }

  sendOff() {
    this.emit(Events.STATE_CHANGED, {on: false, value: Date.now()});
    this.scheduleNext();
  }

  stop() {
    clearTimeout(this.timeout);
    this.timeout = null;
  }
}

module.exports = TimeTrigger;



/***/ }),

/***/ "./src/rules-engine/triggers/Trigger.js":
/*!**********************************************!*\
  !*** ./src/rules-engine/triggers/Trigger.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const EventEmitter = __webpack_require__(/*! events */ "events").EventEmitter;

/**
 * The trigger component of a Rule which monitors some state and passes on
 * whether to be active to the Rule's effect
 */
class Trigger extends EventEmitter {
  /**
   * Create a Trigger based on a wire-format description with a property
   * @param {TriggerDescription} desc
   */
  constructor(desc) {
    super();
    this.type = this.constructor.name;
    this.label = desc.label;
  }

  /**
   * @return {TriggerDescription}
   */
  toDescription() {
    return {
      type: this.type,
      label: this.label,
    };
  }
}

module.exports = Trigger;


/***/ }),

/***/ "./src/rules-engine/triggers/index.js":
/*!********************************************!*\
  !*** ./src/rules-engine/triggers/index.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const triggers = {
  BooleanTrigger: __webpack_require__(/*! ./BooleanTrigger */ "./src/rules-engine/triggers/BooleanTrigger.js"),
  EqualityTrigger: __webpack_require__(/*! ./EqualityTrigger */ "./src/rules-engine/triggers/EqualityTrigger.js"),
  EventTrigger: __webpack_require__(/*! ./EventTrigger */ "./src/rules-engine/triggers/EventTrigger.js"),
  LevelTrigger: __webpack_require__(/*! ./LevelTrigger */ "./src/rules-engine/triggers/LevelTrigger.js"),
  MultiTrigger: __webpack_require__(/*! ./MultiTrigger */ "./src/rules-engine/triggers/MultiTrigger.js"),
  PropertyTrigger: __webpack_require__(/*! ./PropertyTrigger */ "./src/rules-engine/triggers/PropertyTrigger.js"),
  TimeTrigger: __webpack_require__(/*! ./TimeTrigger */ "./src/rules-engine/triggers/TimeTrigger.js"),
  Trigger: __webpack_require__(/*! ./Trigger */ "./src/rules-engine/triggers/Trigger.js"),
};

/**
 * Produce an trigger from a serialized trigger description. Throws if `desc`
 * is invalid
 * @param {TriggerDescription} desc
 * @return {Trigger}
 */
function fromDescription(desc) {
  const TriggerClass = triggers[desc.type];
  if (!TriggerClass) {
    throw new Error(`Unsupported or invalid trigger type:${desc.type}`);
  }
  return new TriggerClass(desc);
}

module.exports = {
  triggers: triggers,
  fromDescription: fromDescription,
};


/***/ }),

/***/ "./src/sleep.js":
/*!**********************!*\
  !*** ./src/sleep.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};


/***/ }),

/***/ "./src/ssltunnel.js":
/*!**************************!*\
  !*** ./src/ssltunnel.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Gateway tunnel service.
 *
 * Manages the tunnel service.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const fs = __webpack_require__(/*! fs */ "fs");
const CertificateManager = __webpack_require__(/*! ./certificate-manager */ "./src/certificate-manager.js");
const config = __webpack_require__(/*! config */ "config");
const Deferred = __webpack_require__(/*! ./deferred */ "./src/deferred.js");
const path = __webpack_require__(/*! path */ "path");
const fetch = __webpack_require__(/*! node-fetch */ "node-fetch");
const spawnSync = __webpack_require__(/*! child_process */ "child_process").spawn;
const Settings = __webpack_require__(/*! ./models/settings */ "./src/models/settings.js");
const UserProfile = __webpack_require__(/*! ./user-profile */ "./src/user-profile.js");
const PushService = __webpack_require__(/*! ./push-service */ "./src/push-service.js");

const DEBUG =  false || ("development" === 'test');

const TunnelService = {

  pagekiteProcess: null,
  tunneltoken: null,
  switchToHttps: null,
  connected: new Deferred(),
  pingInterval: null,
  renewInterval: null,
  server: null,

  /*
   * Router middleware to check if we have a ssl tunnel set.
   *
   * @param {Object} request Express request object.
   * @param {Object} response Express response object.
   * @param {Object} next Next middleware.
   */
  isTunnelSet: async function(request, response, next) {
    // If ssl tunnel is disabled, continue
    if (!config.get('ssltunnel.enabled')) {
      return next();
    } else {
      let notunnel = await Settings.get('notunnel');
      if (typeof notunnel !== 'boolean') {
        notunnel = false;
      }

      // then we check if we have certificates installed
      if ((fs.existsSync(path.join(UserProfile.sslDir,
                                   'certificate.pem')) &&
           fs.existsSync(path.join(UserProfile.sslDir,
                                   'privatekey.pem'))) ||
          notunnel) {
        // if certs are installed,
        // then we don't need to do anything and return
        return next();
      }

      // if there are no certs installed,
      // we display the cert setup page to the user
      response.render('tunnel-setup',
                      {domain: config.get('ssltunnel.domain')});
    }
  },

  // Set a handle for the running https server, used when renewing certificates
  setServerHandle: function(server) {
    this.server = server;
  },

  // method that starts the client if the box has a registered tunnel
  start: function(response, urlredirect) {
    Settings.get('tunneltoken').then((result) => {
      if (typeof result === 'object') {
        let responseSent = false;
        this.tunneltoken = result;
        const endpoint = `${result.name}.${
          config.get('ssltunnel.domain')}`;
        this.pagekiteProcess =
          spawnSync(config.get('ssltunnel.pagekite_cmd'),
                    ['--clean', `--frontend=${endpoint}:${
                      config.get('ssltunnel.port')}`,
                     `--service_on=https:${endpoint
                     }:localhost:${
                       config.get('ports.https')}:${
                       this.tunneltoken.token}`],
                    {shell: true});

        this.pagekiteProcess.stdout.on('data', (data) => {
          if (DEBUG) {
            console.log(`[pagekite] stdout: ${data}`);
          }

          const needToSend = response && !responseSent;

          if (data.indexOf('err=Error in connect') > -1) {
            console.error('PageKite failed to connect');
            this.connected.reject();
            if (needToSend) {
              responseSent = true;
              response.sendStatus(400);
            }
          } else if (data.indexOf('connect=') > -1) {
            console.log('PageKite connected!');
            this.connected.resolve();
            if (needToSend) {
              responseSent = true;
              response.status(200).json(urlredirect);
            }
          }
        });
        this.pagekiteProcess.stderr.on('data', (data) => {
          console.log(`[pagekite] stderr: ${data}`);
        });
        this.pagekiteProcess.on('close', (code) => {
          console.log(`[pagekite] process exited with code ${code}`);
        });

        this.connected.promise.then(() => {
          // Ping the registration server every hour.
          this.pingInterval =
            setInterval(() => this.pingRegistrationServer(), 60 * 60 * 1000);

          // Enable push service
          PushService.init(`https://${endpoint}`);

          const renew = () => {
            return CertificateManager.renew(this.server).catch(() => {});
          };

          // Try to renew certificates immediately, then daily.
          renew().then(() => {
            this.renewInterval = setInterval(renew, 24 * 60 * 60 * 1000);
          });
        }).catch(() => {});
      } else {
        console.error('tunneltoken not set');
        if (response) {
          response.status(400).end();
        }
      }
    }).catch((e) => {
      console.error('Failed to get tunneltoken setting:', e);

      if (response) {
        response.status(400).send(e);
      }
    });
  },

  // method to stop pagekite process
  stop: function() {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
    }

    if (this.renewInterval !== null) {
      clearInterval(this.renewInterval);
    }

    if (this.pagekiteProcess) {
      this.pagekiteProcess.kill('SIGHUP');
    }
  },

  // method to check if the box has certificates
  hasCertificates: function() {
    return fs.existsSync(path.join(UserProfile.sslDir, 'certificate.pem')) &&
      fs.existsSync(path.join(UserProfile.sslDir, 'privatekey.pem'));
  },

  // method to check if the box has a registered tunnel
  hasTunnelToken: async function() {
    const tunneltoken = await Settings.get('tunneltoken');
    return typeof tunneltoken === 'object';
  },

  // method to check if user skipped the ssl tunnel setup
  userSkipped: async function() {
    const notunnel = await Settings.get('notunnel');
    if (typeof notunnel === 'boolean' && notunnel) {
      return true;
    }

    return false;
  },

  // method to ping the registration server to track active domains
  pingRegistrationServer: function() {
    const url = `${config.get('ssltunnel.registration_endpoint')}` +
      `/ping?token=${this.tunneltoken.token}`;
    fetch(url).catch((e) => {
      console.log('Failed to ping registration server:', e);
    });
  },
};

module.exports = TunnelService;


/***/ }),

/***/ "./src/user-profile.js":
/*!*****************************!*\
  !*** ./src/user-profile.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {/**
 * WebThings Gateway user profile.
 *
 * The user profile lives outside of the source tree to allow for things like
 * data persistence with Docker, as well as the ability to easily switch
 * profiles, if desired.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



process.env.ALLOW_CONFIG_MUTATIONS = 'true';
const config = __webpack_require__(/*! config */ "config");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const os = __webpack_require__(/*! os */ "os");
const mkdirp = __webpack_require__(/*! mkdirp */ "mkdirp");
const {ncp} = __webpack_require__(/*! ncp */ "ncp");
const rimraf = __webpack_require__(/*! rimraf */ "rimraf");

const Profile = {
  init: function() {
    this.baseDir = path.resolve(
      process.env.MOZIOT_HOME || config.get('profileDir')
    );
    this.configDir = path.join(this.baseDir, 'config');
    this.dataDir = path.join(this.baseDir, 'data');
    this.sslDir = path.join(this.baseDir, 'ssl');
    this.uploadsDir = path.join(this.baseDir, 'uploads');
    this.mediaDir = path.join(this.baseDir, 'media');
    this.logDir = path.join(this.baseDir, 'log');
    this.gatewayDir = path.resolve(path.join(__dirname, '..'));

    if (false) {} else {
      this.addonsDir = path.join(this.baseDir, 'addons');
    }
  },

  /**
   * Manually copy, then unlink, to prevent issues with cross-device renames.
   */
  renameFile: (src, dst) => {
    fs.copyFileSync(src, dst);
    fs.unlinkSync(src);
  },

  /**
   * Manually copy, then remove, to prevent issues with cross-device renames.
   */
  renameDir: (src, dst) => new Promise((resolve, reject) => {
    ncp(src, dst, (e) => {
      if (e) {
        reject(e);
        return;
      }

      rimraf(src, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }),

  /**
   * Migrate from old locations to new ones
   * @return {Promise} resolved when migration is complete
   */
  migrate: function() {
    const pending = [];
    // Create all required profile directories.
    if (!fs.existsSync(this.configDir)) {
      mkdirp.sync(this.configDir);
    }
    if (!fs.existsSync(this.dataDir)) {
      mkdirp.sync(this.dataDir);
    }
    if (!fs.existsSync(this.sslDir)) {
      mkdirp.sync(this.sslDir);
    }
    if (!fs.existsSync(this.uploadsDir)) {
      mkdirp.sync(this.uploadsDir);
    }
    if (!fs.existsSync(this.logDir)) {
      mkdirp.sync(this.logDir);
    }
    if (!fs.existsSync(this.addonsDir)) {
      mkdirp.sync(this.addonsDir);
    }

    // Relocate the database, if necessary, before opening it.
    const dbPath = path.join(this.configDir, 'db.sqlite3');
    const oldDbPath = path.join(this.gatewayDir, 'db.sqlite3');
    if (fs.existsSync(oldDbPath)) {
      this.renameFile(oldDbPath, dbPath);
    }

    const db = __webpack_require__(/*! ./db */ "./src/db.js");
    const Settings = __webpack_require__(/*! ./models/settings */ "./src/models/settings.js");
    const Users = __webpack_require__(/*! ./models/users */ "./src/models/users.js");

    // Open the database.
    db.open();

    // Normalize user email addresses
    pending.push(
      Users.getUsers().then((users) => {
        users.forEach((user) => {
          // Call editUser with the same user, as it will normalize the email
          // for us and save it.
          Users.editUser(user);
        });
      })
    );

    // Move the tunneltoken into the database.
    const ttPath = path.join(this.gatewayDir, 'tunneltoken');
    if (fs.existsSync(ttPath)) {
      const token = JSON.parse(fs.readFileSync(ttPath));
      pending.push(
        Settings.set('tunneltoken', token).then(() => {
          fs.unlinkSync(ttPath);
        }).catch((e) => {
          throw e;
        })
      );
    }

    // Move the notunnel setting into the database.
    const ntPath = path.join(this.gatewayDir, 'notunnel');
    if (fs.existsSync(ntPath)) {
      pending.push(
        Settings.set('notunnel', true).then(() => {
          fs.unlinkSync(ntPath);
        }).catch((e) => {
          throw e;
        })
      );
    }

    // Move the wifiskip setting into the database.
    const wsPath = path.join(this.configDir, 'wifiskip');
    if (fs.existsSync(wsPath)) {
      pending.push(
        Settings.set('wifiskip', true).then(() => {
          fs.unlinkSync(wsPath);
        }).catch((e) => {
          throw e;
        })
      );
    }

    // Move certificates, if necessary.
    const pkPath1 = path.join(this.gatewayDir, 'privatekey.pem');
    const pkPath2 = path.join(this.gatewayDir, 'ssl', 'privatekey.pem');
    if (fs.existsSync(pkPath1)) {
      this.renameFile(pkPath1, path.join(this.sslDir, 'privatekey.pem'));
    } else if (fs.existsSync(pkPath2)) {
      this.renameFile(pkPath2, path.join(this.sslDir, 'privatekey.pem'));
    }

    const certPath1 = path.join(this.gatewayDir, 'certificate.pem');
    const certPath2 = path.join(this.gatewayDir, 'ssl', 'certificate.pem');
    if (fs.existsSync(certPath1)) {
      this.renameFile(certPath1, path.join(this.sslDir, 'certificate.pem'));
    } else if (fs.existsSync(certPath2)) {
      this.renameFile(certPath2, path.join(this.sslDir, 'certificate.pem'));
    }

    const chainPath1 = path.join(this.gatewayDir, 'chain.pem');
    const chainPath2 = path.join(this.gatewayDir, 'ssl', 'chain.pem');
    if (fs.existsSync(chainPath1)) {
      this.renameFile(chainPath1, path.join(this.sslDir, 'chain.pem'));
    } else if (fs.existsSync(chainPath2)) {
      this.renameFile(chainPath2, path.join(this.sslDir, 'chain.pem'));
    }

    const csrPath1 = path.join(this.gatewayDir, 'csr.pem');
    const csrPath2 = path.join(this.gatewayDir, 'ssl', 'csr.pem');
    if (fs.existsSync(csrPath1)) {
      this.renameFile(csrPath1, path.join(this.sslDir, 'csr.pem'));
    } else if (fs.existsSync(csrPath2)) {
      this.renameFile(csrPath2, path.join(this.sslDir, 'csr.pem'));
    }

    const oldSslDir = path.join(this.gatewayDir, 'ssl');
    if (fs.existsSync(oldSslDir)) {
      rimraf.sync(oldSslDir, (err) => {
        if (err) {
          throw err;
        }
      });
    }

    // Move old uploads, if necessary.
    const oldUploadsDir = path.join(this.gatewayDir, 'static', 'uploads');
    if (fs.existsSync(oldUploadsDir) &&
      fs.lstatSync(oldUploadsDir).isDirectory()) {
      const fnames = fs.readdirSync(oldUploadsDir);
      for (const fname of fnames) {
        this.renameFile(
          path.join(oldUploadsDir, fname), path.join(this.uploadsDir, fname));
      }

      fs.rmdirSync(oldUploadsDir);
    }

    // Create a user config if one doesn't exist.
    const oldUserConfigPath = path.join(this.configDir, 'local.js');
    const oldLocalConfigPath = path.join(this.gatewayDir, 'config', 'local.js');
    const userConfigPath = path.join(this.configDir, 'local.json');

    if (!fs.existsSync(userConfigPath)) {
      if (fs.existsSync(oldUserConfigPath)) {
        const oldConfig = config.util.parseFile(oldUserConfigPath);
        fs.writeFileSync(userConfigPath, JSON.stringify(oldConfig, null, 2));
      } else {
        fs.writeFileSync(userConfigPath, '{\n}');
      }
    }

    if (fs.existsSync(oldUserConfigPath)) {
      fs.unlinkSync(oldUserConfigPath);
    }

    if (fs.existsSync(oldLocalConfigPath)) {
      fs.unlinkSync(oldLocalConfigPath);
    }

    // Handle any config migrations
    if (fs.existsSync(userConfigPath)) {
      const cfg = JSON.parse(fs.readFileSync(userConfigPath));
      let changed = false;

      // addonManager.listUrl -> addonManager.listUrls
      if (cfg.hasOwnProperty('addonManager') &&
          cfg.addonManager.hasOwnProperty('listUrl')) {
        if (cfg.addonManager.hasOwnProperty('listUrls')) {
          cfg.addonManager.listUrls.push(cfg.addonManager.listUrl);
          cfg.addonManager.listUrls =
            Array.from(new Set(cfg.addonManager.listUrls));
        } else {
          cfg.addonManager.listUrls = [cfg.addonManager.listUrl];
        }

        delete cfg.addonManager.listUrl;
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(userConfigPath, JSON.stringify(cfg, null, 2));
      }
    }

    const localConfig = config.util.parseFile(userConfigPath);
    if (localConfig) {
      config.util.extendDeep(config, localConfig);
    }

    // Move anything that exists in ~/mozilla-iot, such as certbot configs.
    const oldProfileDir = path.join(os.homedir(), 'mozilla-iot');
    const oldEtcDir = path.join(oldProfileDir, 'etc');
    if (fs.existsSync(oldEtcDir) && fs.lstatSync(oldEtcDir).isDirectory()) {
      pending.push(this.renameDir(oldEtcDir, path.join(this.baseDir, 'etc')));
    }
    const oldVarDir = path.join(oldProfileDir, 'var');
    if (fs.existsSync(oldVarDir) && fs.lstatSync(oldVarDir).isDirectory()) {
      pending.push(this.renameDir(oldVarDir, path.join(this.baseDir, 'var')));
    }

    // Move add-ons.
    if (true) {
      const oldAddonsDir = path.join(this.gatewayDir, 'build', 'addons');
      if (fs.existsSync(oldAddonsDir) &&
        fs.lstatSync(oldAddonsDir).isDirectory()) {
        const fnames = fs.readdirSync(oldAddonsDir);
        for (const fname of fnames) {
          const oldFname = path.join(oldAddonsDir, fname);
          const newFname = path.join(this.addonsDir, fname);
          const lstat = fs.lstatSync(oldFname);

          if (fname !== 'plugin' && lstat.isDirectory()) {
            // Move existing add-ons.
            pending.push(this.renameDir(oldFname, newFname));
          }
        }
      }
    }
    return Promise.all(pending);
  },
};

module.exports = Profile;

/* WEBPACK VAR INJECTION */}.call(this, "src"))

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Various utilities.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */



const crypto = __webpack_require__(/*! crypto */ "crypto");
const fs = __webpack_require__(/*! fs */ "fs");
const platform = __webpack_require__(/*! ./platform */ "./src/platform.js");
const pkg = __webpack_require__(/*! ../package.json */ "./package.json");

module.exports = {
  /**
   * Compute a SHA-256 checksum of a file.
   *
   * @param {String} fname File path
   * @returns A checksum as a lower case hex string.
   */
  hashFile: (fname) => {
    const hash = crypto.createHash('sha256');

    let fd;
    try {
      fd = fs.openSync(fname, 'r');
      const buffer = new Uint8Array(4096);

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const bytes = fs.readSync(fd, buffer, 0, 4096);
        if (bytes <= 0) {
          break;
        }
        hash.update(buffer.slice(0, bytes));
      }
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      if (fd) {
        fs.closeSync(fd);
      }
    }

    return hash.digest('hex').toLowerCase();
  },

  /**
   * Escape text such that it's safe to be placed in HTML.
   */
  escapeHtml: (text) => {
    if (typeof text !== 'string') {
      text = `${text}`;
    }

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  getGatewayUserAgent: () => {
    const primary = `mozilla-iot-gateway/${pkg.version}`;
    const secondary = `(${platform.getArchitecture()}; ${platform.getOS()})`;
    const tertiary = platform.isDocker() ? ' (docker)' : '';

    return `${primary} ${secondary}${tertiary}`;
  },
};


/***/ }),

/***/ "./src/wifi-setup.js":
/*!***************************!*\
  !*** ./src/wifi-setup.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const bodyParser = __webpack_require__(/*! body-parser */ "body-parser");
const config = __webpack_require__(/*! config */ "config");
const Constants = __webpack_require__(/*! ./constants */ "./src/constants.js");
const express = __webpack_require__(/*! express */ "express");
const expressHandlebars = __webpack_require__(/*! express-handlebars */ "express-handlebars");
const mDNSserver = __webpack_require__(/*! ./mdns-server */ "./src/mdns-server.js");
const os = __webpack_require__(/*! os */ "os");
const platform = __webpack_require__(/*! ./platform */ "./src/platform.js");
const Settings = __webpack_require__(/*! ./models/settings */ "./src/models/settings.js");
const sleep = __webpack_require__(/*! ./sleep */ "./src/sleep.js");

const hbs = expressHandlebars.create({
  helpers: {
    escapeQuotes: (str) => `${str}`.replace(/'/, '\\\''),
  },
  defaultLayout: undefined, // eslint-disable-line no-undefined
  layoutsDir: Constants.VIEWS_PATH,
});

// The express server
const app = express();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', Constants.VIEWS_PATH);

// When we get POSTs, handle the body like this
app.use(bodyParser.urlencoded({extended: false}));

// Define the handler methods for the various URLs we handle
app.get('/*', handleCaptive);
app.get('/', handleRoot);
app.get('/wifi-setup', handleWiFiSetup);
app.post('/connecting', handleConnecting);
app.use(express.static(Constants.BUILD_STATIC_PATH));

const WiFiSetupApp = {
  onRequest: app,
};

/**
 * Handle captive portal requests.
 */
function handleCaptive(request, response, next) {
  console.log('wifi-setup: handleCaptive:', request.path);

  switch (request.path) {
    case '/hotspot.html': {
      // WISPr XML response
      const ssid = getHotspotSsid();
      response.render(
        'hotspot',
        {
          ap_ssid: ssid,
          ap_ip: config.get('wifi.ap.ipaddr'),
        }
      );
      break;
    }
    case '/hotspot-detect.html':        // iOS/macOS
    case '/library/test/success.html':  // iOS/macOS
    case '/connecttest.txt': {          // Windows
      const ua = request.get('User-Agent');

      // These 2 user-agents expect a WISPr XML response
      if (ua.includes('CaptiveNetworkSupport') ||
          ua.includes('Microsoft NCSI')) {
        response.redirect(
          302,
          `http://${config.get('wifi.ap.ipaddr')}/hotspot.html`
        );
        break;
      }

      // otherwise, fall through
    }
    // eslint-disable-next-line no-fallthrough
    case '/kindle-wifi/wifistub.html':  // Kindle
    case '/generate_204':               // Android, Chrome
    case '/fwlink/':                    // Windows
    case '/redirect':                   // Windows
    case '/success.txt':                // Firefox
      // Redirect to the wifi setup page
      response.redirect(
        302,
        `http://${config.get('wifi.ap.ipaddr')}/wifi-setup`
      );
      break;
    default:
      console.log('wifi-setup: handleCaptive: unknown path, skipping.');
      next();
      break;
  }
}

/**
 * Handle requests to the root URL. We display a different page depending on
 * what stage of setup we're at.
 */
function handleRoot(request, response) {
  const status = platform.getWirelessMode();

  if (!(status.enabled && status.mode === 'sta')) {
    // If we don't have a wifi connection yet, display the wifi setup page
    console.log(
      'wifi-setup: handleRoot: no wifi connection; redirecting to wifiSetup'
    );
    response.redirect('/wifi-setup');
  } else {
    // Otherwise, look to see if we have an oauth token yet
    console.log(
      'wifi-setup: handleRoot: wifi setup complete; redirecting to /status'
    );
    response.redirect('/status');
  }
}

/**
 * Handle requests to /wifi-setup.
 */
function handleWiFiSetup(request, response) {
  scan().then((results) => {
    // XXX
    // To handle the case where the user entered a bad password and we are
    // not connected, we should show the networks we know about, and modify
    // the template to explain that if the user is seeing it, it means
    // that the network is down or password is bad. This allows the user
    // to re-enter a network.  Hopefully wpa_supplicant is smart enough
    // to do the right thing if there are two entries for the same ssid.
    // If not, we could modify defineNetwork() to overwrite rather than
    // just adding.
    let networks = [];
    if (results) {
      networks = results.map((result) => {
        const icon = result.encryption ? 'wifi-secure.svg' : 'wifi.svg';
        return {
          icon: `/images/${icon}`,
          pwdRequired: result.encryption,
          ssid: result.ssid,
        };
      });
    }

    response.render('wifi-setup', {networks});
  });
}

/**
 * Handle requests to /connecting.
 */
function handleConnecting(request, response) {
  mDNSserver.getmDNSdomain().then((domain) => {
    const skip = request.body.skip === '1';

    if (skip) {
      console.log(
        'wifi-setup: handleConnecting: wifi setup skipped, stopping the AP.'
      );

      Settings.set('wifiskip', true).catch((e) => {
        console.error(
          'wifi-setup: handleConnecting: failed to store wifiskip:', e
        );
      }).then(() => {
        response.render(
          'connecting',
          {
            skip: `${skip}`,
            domain,
          }
        );
        stopAP();
        WiFiSetupApp.onConnection();
      });
      return;
    }

    const ssid = request.body.ssid.trim();
    const password = request.body.password.trim();

    // XXX
    // We can come back here from the status page if the user defines
    // more than one network. We always need to call defineNetwork(), but
    // only need to call stopAP() if we're actually in ap mode.
    //
    // Also, if we're not in AP mode, then we should just redirect to
    // /status instead of sending the connecting template.
    response.render(
      'connecting',
      {
        skip: `${skip}`,
        domain,
      }
    );

    // Wait before switching networks to make sure the response gets through.
    // And also wait to be sure that the access point is fully down before
    // defining the new network. If I only wait two seconds here, it seems
    // like the Edison takes a really long time to bring up the new network
    // but a 5 second wait seems to work better.
    sleep(2000)
      .then(() => {
        stopAP();
        return sleep(5000);
      })
      .then(() => {
        if (!defineNetwork(ssid, password)) {
          console.error(
            'wifi-setup: handleConnecting: failed to define network'
          );
        } else {
          return waitForWiFi(20, 3000).then(() => {
            WiFiSetupApp.onConnection();
          });
        }
      })
      .catch((error) => {
        if (error) {
          console.error('wifi-setup: handleConnecting: general error:', error);
        }
      });
  });
}

/**
 * Get the SSID of the hotspot.
 *
 * @returns {string} SSID
 */
function getHotspotSsid() {
  const base = config.get('wifi.ap.ssid_base');
  const mac = platform.getMacAddress('wlan0');
  if (!mac) {
    return base;
  }

  // Get the last 2 octets of the MAC and create a simple string, e.g. 9E28
  const id = mac.split(':').slice(4).join('').toUpperCase();

  return `${base} ${id}`;
}

/**
 * Scan for available wifi networks.
 *
 * @returns {Promise<Object[]>} Promise which resolves to the list of networks:
 *                              [
 *                                {
 *                                  ssid: '...',
 *                                  quality: ...,
 *                                  encryption: true|false
 *                                },
 *                                ...
 *                              ]
 */
function scan() {
  const maxAttempts = 5;

  return new Promise(function(resolve) {
    let attempts = 0;

    function tryScan() {
      attempts++;

      const results = platform.scanWirelessNetworks();
      if (results.length > 0) {
        resolve(results);
      } else {
        console.log('wifi-setup: scan: Scan attempt', attempts, 'failed');

        if (attempts >= maxAttempts) {
          console.error(
            'wifi-setup: scan: Giving up. No scan results available.'
          );
          resolve([]);
        } else {
          console.log('wifi-setup: scan: Will try again in 3 seconds.');
          setTimeout(tryScan, 3000);
        }
      }
    }

    tryScan();
  });
}

/**
 * Enable an access point that users can connect to to configure the device.
 *
 * This requires that hostapd and udhcpd are installed on the system but not
 * enabled, so that they do not automatically run when the device boots up.
 * This also requires that hostapd and udhcpd have appropriate config files
 * that define the SSID for the wifi network to be created, for example.
 * Also, the udhcpd config file should be set up to work with the IP address
 * of the device.
 *
 * @param {string} ipaddr - IP address of AP
 * @returns {boolean} Boolean indicating success of the command.
 */
function startAP(ipaddr) {
  const ssid = getHotspotSsid();
  if (!platform.setWirelessMode(true, 'ap', {ssid, ipaddr})) {
    return false;
  }

  return platform.setDhcpServerStatus(true);
}

/**
 * Stop the running access point.
 *
 * @returns {boolean} Boolean indicating success of the command.
 */
function stopAP() {
  if (!platform.setWirelessMode(false, 'ap')) {
    return false;
  }

  return platform.setDhcpServerStatus(false);
}

/**
 * Define a new network and connect to it.
 *
 * @param {string} ssid - SSID to configure
 * @param {string?} password - PSK to configure
 * @returns {boolean} Boolean indicating success of the command.
 */
function defineNetwork(ssid, password) {
  return platform.setWirelessMode(true, 'sta', {ssid, key: password});
}

/**
 * Determine whether or not we already have a connection.
 *
 * @returns {Promise} Promise which resolves to true/false, indicating whether
 *                    or not we have a connection.
 */
function checkConnection() {
  const ensureAPStopped = () => {
    // If the host seems to be in AP mode (e.g. from a previous run), stop it
    if (platform.getDhcpServerStatus() ||
        platform.getWirelessMode().mode === 'ap') {
      stopAP();
    }
  };

  return Settings.get('wifiskip').catch(() => false).then((skipped) => {
    if (skipped) {
      ensureAPStopped();
      return Promise.resolve(true);
    }

    // If wifi wasn't skipped, but there is an ethernet connection, just move on
    const addresses = platform.getNetworkAddresses();
    if (addresses.lan) {
      ensureAPStopped();
      return Promise.resolve(true);
    }

    // Wait until we have a working wifi connection. Retry every 3 seconds up
    // to 20 times. If we never get a wifi connection, go into AP mode.
    return waitForWiFi(20, 3000).then(() => {
      ensureAPStopped();
      return true;
    }).catch((err) => {
      if (err) {
        console.error('wifi-setup: checkConnection: Error waiting:', err);
      }

      console.log(
        'wifi-setup: checkConnection: No wifi connection found, starting AP'
      );

      if (!startAP(config.get('wifi.ap.ipaddr'))) {
        console.error('wifi-setup: checkConnection: failed to start AP');
      }

      return false;
    });
  });
}

/**
 * Wait for a wifi connection.
 *
 * @param {number} maxAttempts - Maximum number of attempts
 * @param {number} interval - Interval at which to check, in milliseconds
 * @returns {Promise} Promise which resolves when we're connected. If we
 *                    aren't connected after maxAttempts attempts, then the
 *                    promise is rejected.
 */
function waitForWiFi(maxAttempts, interval) {
  return new Promise(function(resolve, reject) {
    let attempts = 0;

    // first, see if any networks are already configured
    const status = platform.getWirelessMode();
    if (status.options && status.options.networks &&
        status.options.networks.length > 0) {
      // there's at least one wifi network configured. Let's wait to see if it
      // will connect.
      console.log(
        'wifi-setup: waitForWiFi: networks exist:',
        status.options.networks
      );
      check();
    } else {
      // No wifi network configured. Let's skip the wait and start the setup
      // immediately.
      reject();
    }

    function check() {
      attempts++;
      const status = platform.getWirelessMode();
      if (status.enabled && status.mode === 'sta') {
        console.log('wifi-setup: waitForWifi: connection found');
        checkForAddress();
      } else {
        console.log(
          'wifi-setup: waitForWifi: No wifi connection on attempt', attempts
        );
        retryOrGiveUp();
      }
    }

    function checkForAddress() {
      const ifaces = os.networkInterfaces();

      if (ifaces.hasOwnProperty('wlan0')) {
        for (const addr of ifaces.wlan0) {
          if (addr.family !== 'IPv4' || addr.internal) {
            continue;
          }

          resolve();
          return;
        }
      }

      retryOrGiveUp();
    }

    function retryOrGiveUp() {
      if (attempts >= maxAttempts) {
        console.error('wifi-setup: waitForWiFi: No wifi available, giving up.');
        reject();
      } else {
        setTimeout(check, interval);
      }
    }
  });
}

module.exports = {
  WiFiSetupApp,
  isWiFiConfigured: checkConnection,
};


/***/ }),

/***/ "acme-client":
/*!******************************!*\
  !*** external "acme-client" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("acme-client");

/***/ }),

/***/ "ajv":
/*!**********************!*\
  !*** external "ajv" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("ajv");

/***/ }),

/***/ "archiver":
/*!***************************!*\
  !*** external "archiver" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("archiver");

/***/ }),

/***/ "asn1.js":
/*!**************************!*\
  !*** external "asn1.js" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("asn1.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("assert");

/***/ }),

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("bcryptjs");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),

/***/ "callsites":
/*!****************************!*\
  !*** external "callsites" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("callsites");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),

/***/ "compression":
/*!******************************!*\
  !*** external "compression" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("compression");

/***/ }),

/***/ "config":
/*!*************************!*\
  !*** external "config" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("config");

/***/ }),

/***/ "country-list":
/*!*******************************!*\
  !*** external "country-list" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("country-list");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),

/***/ "express-fileupload":
/*!*************************************!*\
  !*** external "express-fileupload" ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express-fileupload");

/***/ }),

/***/ "express-handlebars":
/*!*************************************!*\
  !*** external "express-handlebars" ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express-handlebars");

/***/ }),

/***/ "express-promise-router":
/*!*****************************************!*\
  !*** external "express-promise-router" ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express-promise-router");

/***/ }),

/***/ "express-rate-limit":
/*!*************************************!*\
  !*** external "express-rate-limit" ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express-rate-limit");

/***/ }),

/***/ "express-ws":
/*!*****************************!*\
  !*** external "express-ws" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express-ws");

/***/ }),

/***/ "find":
/*!***********************!*\
  !*** external "find" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("find");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "gateway-addon":
/*!********************************!*\
  !*** external "gateway-addon" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("gateway-addon");

/***/ }),

/***/ "glob-to-regexp":
/*!*********************************!*\
  !*** external "glob-to-regexp" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("glob-to-regexp");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),

/***/ "http-proxy":
/*!*****************************!*\
  !*** external "http-proxy" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("http-proxy");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("https");

/***/ }),

/***/ "ip-regex":
/*!***************************!*\
  !*** external "ip-regex" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("ip-regex");

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ "mkdirp":
/*!*************************!*\
  !*** external "mkdirp" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("mkdirp");

/***/ }),

/***/ "ncp":
/*!**********************!*\
  !*** external "ncp" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("ncp");

/***/ }),

/***/ "nocache":
/*!**************************!*\
  !*** external "nocache" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("nocache");

/***/ }),

/***/ "node-fetch":
/*!*****************************!*\
  !*** external "node-fetch" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("node-fetch");

/***/ }),

/***/ "node-getopt":
/*!******************************!*\
  !*** external "node-getopt" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("node-getopt");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "process":
/*!**************************!*\
  !*** external "process" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("process");

/***/ }),

/***/ "promisepipe":
/*!******************************!*\
  !*** external "promisepipe" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("promisepipe");

/***/ }),

/***/ "readline":
/*!***************************!*\
  !*** external "readline" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("readline");

/***/ }),

/***/ "rimraf":
/*!*************************!*\
  !*** external "rimraf" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("rimraf");

/***/ }),

/***/ "segfault-handler":
/*!***********************************!*\
  !*** external "segfault-handler" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("segfault-handler");

/***/ }),

/***/ "semver":
/*!*************************!*\
  !*** external "semver" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("semver");

/***/ }),

/***/ "speakeasy":
/*!****************************!*\
  !*** external "speakeasy" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("speakeasy");

/***/ }),

/***/ "sqlite3":
/*!**************************!*\
  !*** external "sqlite3" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sqlite3");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("stream");

/***/ }),

/***/ "string-format":
/*!********************************!*\
  !*** external "string-format" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("string-format");

/***/ }),

/***/ "tar":
/*!**********************!*\
  !*** external "tar" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("tar");

/***/ }),

/***/ "tmp":
/*!**********************!*\
  !*** external "tmp" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("tmp");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),

/***/ "uuid":
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("uuid");

/***/ }),

/***/ "web-push":
/*!***************************!*\
  !*** external "web-push" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("web-push");

/***/ }),

/***/ "winston":
/*!**************************!*\
  !*** external "winston" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("winston");

/***/ }),

/***/ "winston-daily-rotate-file":
/*!********************************************!*\
  !*** external "winston-daily-rotate-file" ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("winston-daily-rotate-file");

/***/ }),

/***/ "ws":
/*!*********************!*\
  !*** external "ws" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("ws");

/***/ })

/******/ });
//# sourceMappingURL=gateway.js.map