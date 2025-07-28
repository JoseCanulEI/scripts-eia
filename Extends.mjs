/* eslint-disable */
import moment from 'moment'
import pako from 'pako'
Number.prototype.toString_AutoDecimalPlaces = function (MinimumDecimalPlaces) {
  if (MinimumDecimalPlaces === null) {
    MinimumDecimalPlaces = -1
  }
  var decimals = this.getRecommendedDecimalsCount()
  if (MinimumDecimalPlaces > -1) {
    if (decimals < MinimumDecimalPlaces) {
      decimals = MinimumDecimalPlaces
    }
  }
  // return this.toFixed(decimals)
  return this.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

Number.prototype.eiString = function (DecimalPlaces) {
  if (DecimalPlaces === null) {
    throw new TypeError('Decimal places cannot be null', 'eiString')
  }
  // return this.toFixed(DecimalPlaces) // String(format: "%.\(DecimalPlaces)f", self)
  return this.toLocaleString('en-US', {
    minimumFractionDigits: DecimalPlaces,
    maximumFractionDigits: DecimalPlaces
  })
}

Number.prototype.getRecommendedDecimalsCount = function () {
  if (this === 0) {
    return 2
  }
  if (this > 1000) {
    return 0
  } else if (this >= 100 && this < 1000) {
    return 0
  } else if (this >= 10 && this < 100) {
    return 1
  } else if (this >= 1 && this < 10) {
    return 2
  } else if (this >= 0.1 && this < 1) {
    return 3
  } else {
    return 4
  }
}

Number.prototype.toAxisChar = function () {
  if (this == 1) {
    return 'H'
  } else if (this == 2) {
    return 'V'
  } else if (this == 3) {
    return 'A'
  } else if (this == 4) {
    return 'R'
  } else {
    return ''
  }
}

Number.prototype.scale = function(inMin, inMax, outMin, outMax) {
  return (this - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

String.prototype.toAxisNumber = function () {
  switch (this.toLowerCase()) {
    case '1':
    case 'h':
      return 1
    case '2':
    case 'v':
      return 2
    case '3':
    case 'a':
      return 3
    case '4':
    case 'r':
      return 4
    default:
      return -1
  }
}

String.prototype.contains = function (searchText, wholeWord = false) {
  if (wholeWord === false) {
    return this.includes(searchText)
  } else {
    searchText = searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    let regexp = new RegExp('\\b' + searchText + '\\b', 'i')
    var match = this.match(regexp)
    return match != null
  }
}

String.prototype.getIndexOf = function (searchText, wholeWord = true) {
  if (wholeWord === false) {
    return this.indexOf(searchText)
  } else {
    searchText = searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    let regexp = new RegExp('\\b' + searchText + '\\b', 'i')
    var match = this.match(regexp)
    if (match == null) {
      return -1
    } else {
      return match.index
    }
  }
}

String.prototype.getIndicesOf = function (searchText, wholeWord = true, caseSensitive = true) {
  let searchOnString = this
  if (wholeWord) {
    searchText = searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    let regexp = new RegExp('\\b' + searchText + '\\b', 'i')

    let output = []
    let cont = true

    const sTextLength = searchText.length
    let removedTextLength = 0
    let str = searchOnString
    while (cont) {
      var match = str.match(regexp)
      if (match != null) {
        let ind = match.index + removedTextLength
        let originalLength = str.length
        str = str.slice(match.index + sTextLength)
        removedTextLength += originalLength - str.length
        output.push(ind)
      } else {
        cont = false
      }
    }
    return output
  } else {
    var searchStrLen = searchText.length
    if (searchStrLen == 0) {
      return []
    }
    var startIndex = 0,
      index,
      indices = []
    if (!caseSensitive) {
      searchOnString = searchOnString.toLowerCase()
      searchText = searchText.toLowerCase()
    }
    while ((index = searchOnString.indexOf(searchText, startIndex)) > -1) {
      indices.push(index)
      startIndex = index + searchStrLen
    }
    return indices
  }
}

String.prototype.insert = function (value, index) {
  return this.substring(0, index) + value + this.substring(index)
}

String.prototype.camelCaseToString = function () {
  const text = this
  const result = text.replace(/([A-Z])/g, " $1")
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1)
  return finalResult
}

String.prototype.toNumericLevel = function () {
  let levels = ['c', 'a', 'm', 'p', 'x']
  return levels.indexOf(this.toLowerCase())
}
String.prototype.toLevelIndex = function () {
  const lArray = ['company', 'area', 'machine', 'point', 'axis', 'item', 'itemchild', 'unassigned', 'unassignedchannel', 'folder_phantom']
  return lArray.indexOf(this.toLowerCase())
}
String.prototype.toLevelName = function () {
  const lArray = ['Company', 'Area', 'Machine', 'Point', 'Axis', 'Item', 'ItemChild', 'Unassigned', 'UnassignedChannel', 'FolderPhantom']
  return lArray[this.toNumericLevel()]
}
String.prototype.compress = function () {
  const compressedData = pako.deflate(this);
  return byteArrayToBase64(compressedData);
};

String.prototype.decompress = function (isObject = false) {
  const compressedBytes = base64ToByteArray(this);
  const decompressedData = pako.inflate(compressedBytes, { to: 'string' });
  if(isObject){
    return JSON.parse(decompressedData);
  }else{
    return decompressedData;
  }
}

function byteArrayToBase64(byteArray) {
  const buffer = Buffer.from(byteArray);
  return buffer.toString('base64');
}

function base64ToByteArray(base64) {
  const buffer = Buffer.from(base64, 'base64');
  return new Uint8Array(buffer);
}



Object.defineProperty(Array.prototype, 'max', {
  value: function (compareFunction, minIndex, maxIndex) {
    if (this == null) {
      return null
    }
    if (minIndex == null || isNaN(minIndex)) {
      minIndex = 0
    }
    if (maxIndex == null || isNaN(maxIndex)) {
      maxIndex = this.length - 1
    }
    if (this.length === 0) {
      return null
    }
    if (compareFunction == null) {
      let max = this[minIndex]
      if (max == null) {
        return null
      }
      for (let i = minIndex; i <= maxIndex; i++) {
        max = this[i] > max ? this[i] : max
      }
      return max
    } else {
      let output = this[0]
      for (let i = minIndex; i <= maxIndex; i++) {
        if (compareFunction(this[i], output) > 0) {
          output = this[i]
        }
      }
      return output
    }
  }
})

Object.defineProperty(Array.prototype, 'maxIndex', {
  value: function (minIndex, maxIndex) {
    if (minIndex == null || maxIndex == null) {
      let max = this.max()
      return this.indexOf(max)
    } else {
      let val = this[minIndex]
      let ind = minIndex
      for (var i = minIndex; i <= maxIndex; i++) {
        if (this[i] > val) {
          val = this[i]
          ind = i
        }
      }
      return ind
    }
  }
})

Object.defineProperty(Array.prototype, 'maxValues', {
  value: function (minIndex, maxIndex, total_maximos, ignoreIndexRange = 1) {
    if (this == null) { return null }
    if (total_maximos == null) { total_maximos = 5 }
    if (minIndex == null) { minIndex = 0 }
    if (maxIndex == null) { maxIndex = this.length - 1 }
    if (ignoreIndexRange == null) { ignoreIndexRange = 5 } // default value for ignoreIndexRange if not provided

    const convertToObj = []

    for (let i = minIndex; i <= maxIndex; i++) {
      if (this[i] != null) {
        convertToObj.push({ val: this[i], index: i })
      }
    }

    // Sort by value, descending
    convertToObj.sort((a, b) => b.val - a.val)

    const output = []

    // Function to check if the new index is at least ignoreIndexRange indices away from all selected indices
    function isFarEnough(index) {
      return output.every(item => Math.abs(item.index - index) >= ignoreIndexRange)
    }

    // Select up to total_maximos values, ensuring indices are far enough apart based on ignoreIndexRange
    for (let i = 0; i < convertToObj.length && output.length < total_maximos; i++) {
      const currentItem = convertToObj[i]
      if (isFarEnough(currentItem.index)) {
        output.push(currentItem)
      }
    }

    return output
  }
})

// Object.defineProperty(Array.prototype, 'maxValues', {
//   value: function (minIndex, maxIndex, total_maximos) {
//     // console.log('maxIndex', minIndex, maxIndex, total_maximos, this)
//     if (this == null) { return null }
//     if (total_maximos == null) { total_maximos = 5 }
//     if (minIndex == null) { minIndex = 0 }
//     if (maxIndex == null) { maxIndex = this.length - 1 }
    
//     const convertToObj = []
//     // const rango = this.slice(minIndex, maxIndex + 1)
//     // const convertToObj = rango.map((val, index) => ({ val, index }))
//     // console.log('getMaximus rango: ', rango, convertToObj)
//     for (let i = minIndex; i <= maxIndex; i++) {
//       if (this[i] != null) {
//         convertToObj.push({ val: this[i], index: i })
//       }
//     }

//     convertToObj.sort((a, b) => b.val - a.val)
//     const output = convertToObj.slice(0, total_maximos)
//     // console.log('getMaximus output: ', output)
    
//     return output
//   }
// })

Object.defineProperty(Array.prototype, 'min', {
  value: function (compareFunction, minIndex, maxIndex) {
    if (this == null) {
      return null
    }
    let start = minIndex != null ? minIndex : 0
    let end = maxIndex != null ? maxIndex : this.length - 1
    let min = Infinity

    for(let i = start; i <= end; i++){
      min = this[i] < min ? this[i] : min
    }
    // while (len--) {
    //   min = this[len] < min ? this[len] : min
    // }
    return min
  }
})

Object.defineProperty(Array.prototype, 'sum', {
  value: function () {
    let output = 0
    for (var i = 0; i < this.length; i++) {
      output += this[i]
    }
    return output
  }
})

Object.defineProperty(Array.prototype, 'average', {
  value: function (minIndex, maxIndex) {
    let total = 0
    let start = minIndex != null ? Math.round(minIndex) : 0
    let end = maxIndex != null ? Math.round(maxIndex) : this.length - 1
    for(var i = start; i <= end; i++){
        total += this[i]
    }
    return total / (end - start)
  }
})

Object.defineProperty(Array.prototype, 'rms', {
  value: function () {
    var total = 0
    for(var i = 0; i < this.length; i++){
      total += Math.pow(this[i], 2)
    }
    total = total / this.length
    return Math.sqrt(total)
  }
})
Object.defineProperty(Array.prototype, 'crestFactor', {
  value: function () {
    let min = Math.abs(this.min())
    let max = Math.abs(this.max())
    let rms = this.rms()
    if(min > max){
      max = min
    }
    return max / rms
  }
})

Object.defineProperty(Array.prototype, 'minIndex', {
  value: function (minIndex, maxIndex) {
    if (minIndex == null || maxIndex == null) {
      let min = this.min()
      return this.indexOf(min)
    } else {
      let val = this[minIndex]
      let ind = minIndex
      for (var i = minIndex; i <= maxIndex; i++) {
        if (this[i] < val) {
          val = this[i]
          ind = i
        }
      }
      return ind
    }
  }
})

Object.defineProperty(Array.prototype, 'removeIfContains', {
  value: function (value) {
    if (this.length === 0) {
      return
    }
    for (var i = this.length - 1; i >= 0; i--) {
      if (this[i] === value) {
        this.splice(i, 1)
      }
    }
  }
})

Object.defineProperty(Array.prototype, 'removeLast', {
  value: function () {
    this.pop()
  }
})

Object.defineProperty(Array.prototype, 'removeFirst', {
  value: function () {
    this.shift()
  }
})

Object.defineProperty(Array.prototype, 'removeAt', {
  value: function (index, length) {
    if (length == null) {
      length = 1
    }
    if (index != null) {
      this.splice(index, length)
    }
  }
})

Object.defineProperty(Array.prototype, 'insert', {
  value: function (index, item) {
    if (index != null) {
      this.splice(index, 0, item)
    }
  }
})

Object.defineProperty(Array.prototype, 'add', {
  value: function (item) {
    this.push(item)
  }
})

Object.defineProperty(Array.prototype, 'move', {
  value: function (old_index, new_index, canCreateNullItems = true) {
    if (new_index >= this.length) {
      if(!canCreateNullItems){return}
      var k = new_index - this.length + 1
      while (k--) {
        this.push(undefined)
      }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0])
    // return arr; // for testing
  }
})

Object.defineProperty(Array.prototype, 'last', {
  value: function (index, item) {
    if (this == null) {
      return null
    }
    if (this.length > 0) {
      return this[this.length - 1]
    } else {
      return null
    }
  }
})

Object.defineProperty(Array.prototype, 'first', {
  value: function () {
    if (this.length > 0) {
      return this[0]
    } else {
      return null
    }
  }
})

Object.defineProperty(Array.prototype, 'searchBy', {
  value: function (variable, value) {
    for (var i = 0; i < this.length; i++) {
      if (this[i][variable] === value) {
        return this[i]
      }
    }
  }
})
Object.defineProperty(Array.prototype, 'distinct', {
  value: function (){
    var distinctValues = [];
    for (var i = 0; i < this.length; i++) {
      if (distinctValues.indexOf(this[i]) === -1) {
        distinctValues.push(this[i])
      }
    }
    return distinctValues
  }
})

Object.defineProperty(Object.prototype, 'deepClone', {
  value: function () {
    const obj = this
    if (Array.isArray(this)){
      let clone = Array(this.length).fill(null)
      for (let i = 0; i < this.length; i++) {
        let item = this[i]
        if (item == null) {
          clone[i] = null
        } else if (typeof item == 'object') {
          if (item instanceof Date) {
            clone[i] = new Date(item)
          } else {
            clone[i] = item.deepClone()
          }
        } else if(typeof item == 'function') {
          clone[i] = item.bind(clone)
        } else {
          clone[i] = item
        }
      }
      return clone
    }
    
    let clone = {}
    for (let i in obj) {
      if (typeof obj[i] == 'function') {
        clone[i] = obj[i].bind(clone)
      } else if (typeof obj[i] == 'object') {
        if (Array.isArray(obj[i])) {
          clone[i] = Array(obj[i].length).fill(null)
          for (let l = 0; l < obj[i].length; l++) {
            let item = obj[i][l]
            if (item == null) {
              clone[i][l] = null
            } else if (typeof item == 'object') {
              clone[i][l] = item.deepClone()
            } else if(typeof item == 'function') {
              clone[i][l] = item.bind(clone[i])
            } else {
              clone[i][l] = item
            }
          }
          //clone[i] = obj[i].slice()
        } else {
          if (obj[i] != null) {
            clone[i] = obj[i].deepClone()
          } else {
            clone[i] = null
          }
        }
      } else {
        clone[i] = obj[i]
      }
    }
    return clone
  }
})

Object.defineProperty(Object.prototype, 'deepAssign', {
  value: function (...sources){
  // Object.prototype.deepAssign = function (...sources) {
    let isObject = function(item) {
      return item && typeof item === 'object' && !Array.isArray(item);
    }
    const target = this;

    sources.forEach((source) => {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          const value = source[key];

          if (isObject(value) && isObject(target[key])) {
            target[key] = target[key].deepAssign(value);
          } else {
            target[key] = value;
          }
        }
      }
    });

    return target;
  }
})

Object.defineProperty(Object.prototype, 'eiStringify', {
  value: function (format = true){
    if(format){
      let text = JSON.stringify(this, null, 2)

      const lines = text.split('\n');
      const propNameRegex = /^(\s*)"([^"#%]+)":/;
      const doubleQuotesRegex = /"([^"]*)"/g;

      const isInsideQueries = (lineNumber) => {
        for (let i = lineNumber; i >= 0; i--) {
          if (lines[i].match(/"queries": {/)) return true;
          if (lines[i].match(/"queriesSqlServer": {/)) return true;
          if (lines[i].match(/},?$/)) return false;
        }
        return false;
      };

      const newLines = lines.map((line, index) => {
        const match = line.match(propNameRegex);
        const propNameLine = match ? line.replace(propNameRegex, `$1$2:`) : line;

        if (isInsideQueries(index)) {
          return propNameLine.replace(doubleQuotesRegex, (match, p1) => {
           // console.log('eiStringify', p1)
            const escapedValue = p1 //.replace(/'/g, "\\'");
            // console.log('eiStringify', escapedValue)
            return '`' + escapedValue + '`';
          });
          //return propNameLine;
        }

        return propNameLine.replace(doubleQuotesRegex, (match, p1) => {
          const escapedValue = p1.replace(/'/g, "\\'");
          return `'${escapedValue}'`;
        });
      });

      return newLines.join('\n');

      // const lines = text.split('\n');
      // const regex = /^(\s*)"([^"#%]+)":/;

      // const newLines = lines.map(line => {
      //   const match = line.match(regex);
      //   return match ? line.replace(regex, `$1$2:`) : line;
      // });

      // return newLines.join('\n');

      // text = text.replace(/"([^"]+)":/g, '$1:');
      // text = text.replaceAll('"', "'")
      // return text
    }else{
      return JSON.stringify(this)
    }
    
  }
})

Object.defineProperty(Object.prototype, 'toCompressedString', {
  value: function () {
    let json = JSON.stringify(this)
    return json.compress()
  }
})





Date.prototype.addSeconds = function (value) {
  var date = new Date(this.valueOf())
  date.setSeconds(date.getSeconds() + value)
  return date
}
Date.prototype.addMinutes = function (value) {
  var date = new Date(this.valueOf())
  date.setMinutes(date.getMinutes() + value)
  return date
}
Date.prototype.addHours = function (value) {
  var date = new Date(this.valueOf())
  date.setHours(date.getHours() + value)
  return date
}
Date.prototype.addDays = function (value) {
  var date = new Date(this.valueOf())
  date.setDate(date.getDate() + value)
  return date
}

Date.prototype.addMonths = function (value) {
  var date = new Date(this.valueOf())
  date.setMonth(date.getMonth() + value)
  return date
}

Date.prototype.daysInMonth = function () {
  var date = new Date(this.valueOf())
  return new Date(date.getYear(), date.getMonth(), 0).getDate()
}

Date.prototype.toString = function (format) {
  var date = new Date(this.valueOf())
  return moment(date).format(format)
}

Date.prototype.fromString = function (str) {
  return moment(this, str)
}

Date.prototype.addTimeZoneOffset = function () {
  let date = this.addMinutes(this.getTimezoneOffset())
  return date
}

Date.prototype.getInterval = function (interval, tolerance) {
  const date = this
  let startDate = new Date(date)
  let endDate = new Date(date)
  if(typeof interval != 'string'){
    return null
  }

  switch (interval.toLowerCase()) {
    case 'hour':
      startDate.setMinutes(0, 0, 0)
      endDate.setHours(endDate.getHours() + 1, 0, 0, 0)
      break
    case 'day':
      startDate.setHours(0, 0, 0, 0)
      endDate.setDate(endDate.getDate() + 1)
      endDate.setHours(0, 0, 0, 0)
      break
    case 'week':
      startDate.setDate(startDate.getDate() - startDate.getDay())
      startDate.setHours(0, 0, 0, 0)
      endDate.setDate(endDate.getDate() + (7 - endDate.getDay()))
      endDate.setHours(0, 0, 0, 0)
      break
    case 'month':
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setMonth(endDate.getMonth() + 1, 1)
      endDate.setHours(0, 0, 0, 0)
      break
    case 'year':
      startDate.setMonth(0, 1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setFullYear(endDate.getFullYear() + 1, 0, 1)
      endDate.setHours(0, 0, 0, 0)
      break
    default:
      if(tolerance != null){
        startDate = date.addSeconds(tolerance * -1)
        endDate = date.addSeconds(tolerance)
      }else{
        return null
      }
      
  }
  let start = startDate.toString('YYYY-MM-DD HH:mm:ss')
  let end = endDate.toString('YYYY-MM-DD HH:mm:ss')
  start = moment(start)
  end = moment(end)
  
  return {
    start: start.format('YYYY-MM-DD HH:mm:ss'),
    end: end.format('YYYY-MM-DD HH:mm:ss')
  }
}

Date.prototype.hasExpired = function(expirationTime, expirationUnit, dateEnd) {
  if(dateEnd == null){
    dateEnd = new Date()
  }
  const interval = dateEnd.getTime() - this.getTime();
  const expiration = expirationTime * Date.getExpirationMultiplier(expirationUnit);
  return  interval > expiration
};

Date.getExpirationMultiplier = function(expirationUnit) {
  switch (expirationUnit) {
    case 'seconds':
      return 1000;
    case 'minutes':
      return 1000 * 60;
    case 'hours':
      return 1000 * 60 * 60;
    case 'days':
      return 1000 * 60 * 60 * 24;
    case 'months':
      return 1000 * 60 * 60 * 24 * 30; // assume 30 days per month
    default:
      throw new Error(`Invalid expiration unit: ${expirationUnit}`);
  }
};

Number.prototype.toString_AutoDecimalPlacesUnitMetric = function (MinimumDecimalPlaces) {
  const whatIsUnitMetric = 'metric' //Store.getters.userConfig.settings.units;

  if (MinimumDecimalPlaces === null || MinimumDecimalPlaces === undefined) {
    if (whatIsUnitMetric === 'metric') {
      MinimumDecimalPlaces = 2;
    } else {
      MinimumDecimalPlaces = 4;
    }
  }

  var decimals = this.getRecommendedDecimalsCount ? this.getRecommendedDecimalsCount() : 0;

  if (MinimumDecimalPlaces > -1) {
    if (decimals < MinimumDecimalPlaces) {
      decimals = MinimumDecimalPlaces;
    }
  }

  return this.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};


// Object.prototype.prueba = function(value){
//   return('hola mundo')
// }
// pruebaErbessd = function(value){
//   console.log('pruebaErbessd', value)
// }
