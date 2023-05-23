export function timeFix() {
  const time = new Date()
  const hour = time.getHours()
  return hour < 9 ? '早上好' : hour <= 11 ? '上午好' : hour <= 13 ? '中午好' : hour < 20 ? '下午好' : '晚上好'
}

export function welcome() {
  const arr = ['WELCOME TO VWED']
  const index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

/**
 * 触发 window.resize
 */
export function triggerWindowResizeEvent() {
  const event = document.createEvent('HTMLEvents')
  event.initEvent('resize', true, true)
  event.eventType = 'message'
  window.dispatchEvent(event)
}

export function handleScrollHeader(callback) {
  let timer = 0

  let beforeScrollTop = window.pageYOffset
  callback = callback || function () {
  }
  window.addEventListener(
    'scroll',
    event => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let direction = 'up'
        const afterScrollTop = window.pageYOffset
        const delta = afterScrollTop - beforeScrollTop
        if (delta === 0) {
          return false
        }
        direction = delta > 0 ? 'down' : 'up'
        callback(direction)
        beforeScrollTop = afterScrollTop
      }, 50)
    },
    false
  )
}

export function isIE() {
  const bw = window.navigator.userAgent
  const compare = (s) => bw.indexOf(s) >= 0
  const ie11 = (() => 'ActiveXObject' in window)()
  return compare('MSIE') || ie11
}

/**
 * Remove loading animate
 * @param id parent element id or class
 * @param timeout
 */
export function removeLoadingAnimate(id = '', timeout = 1500) {
  if (id === '') {
    return
  }
  setTimeout(() => {
    document.body.removeChild(document.getElementById(id))
  }, timeout)
}

export function scorePassword(pass) {
  let score = 0
  if (!pass) {
    return score
  }
  // award every unique letter until 5 repetitions
  const letters = {}
  for (let i = 0; i < pass.length; i++) {
    letters[pass[i]] = (letters[pass[i]] || 0) + 1
    score += 5.0 / letters[pass[i]]
  }

  // bonus points for mixing it up
  const variations = {
    digits: /\d/.test(pass),
    lower: /[a-z]/.test(pass),
    upper: /[A-Z]/.test(pass),
    nonWords: /\W/.test(pass)
  }

  let variationCount = 0
  for (var check in variations) {
    variationCount += (variations[check] === true) ? 1 : 0
  }
  score += (variationCount - 1) * 10

  return parseInt(score)
}
function removeHtml (str) {
  var reg = /<\s*\/?\s*[^>]*\s*>/gi;
  return str.replace(reg, "");
}
function byteLength (str) {
  return str.replace(/[^\u0000-\u007f]/g, "\u0061\u0061").length;
}
export function getMaxText (s, num) {
  if (!s) s = "&nbsp;";
  s = removeHtml(s);
  if (byteLength(s) > num * 2)
      return s.substring(0, num) + '…';
  return s;
}

export function formatDate(Date) { // 2022-08-24 -> 8月24日
  if (!Date) return ''
  let DateArr = Date.split('-')
  return Number(DateArr[1]) + '月' + Number(DateArr[2]) + '日'
}

export function pexisHeightToLayoutHeight(h) {
  let height = (h - 320) / 11 + 30
  return Number(height.toFixed(11));
}

export function layoutHeightToPexisHeight(h) {
  let height = 320 + (h - 30) * 11
  return Number(height.toFixed(0));
}
/**
 * 随机生成数字
 *
 * 示例：生成长度为 12 的随机数：randomNumber(12)
 * 示例：生成 3~23 之间的随机数：randomNumber(3, 23)
 *
 * @param1 最小值 | 长度
 * @param2 最大值
 * @return int 生成后的数字
 */
 export function randomNumber() {
  // 生成 最小值 到 最大值 区间的随机数
  const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  if (arguments.length === 1) {
    let [length] = arguments
    // 生成指定长度的随机数字，首位一定不是 0
    let nums = [...Array(length).keys()].map((i) => (i > 0 ? random(0, 9) : random(1, 9)))
    return parseInt(nums.join(''))
  } else if (arguments.length >= 2) {
    let [min, max] = arguments
    return random(min, max)
  } else {
    return Number.NaN
  }
}
/**
 * 随机生成字符串
 * @param length 字符串的长度
 * @param chats 可选字符串区间（只会生成传入的字符串中的字符）
 * @return string 生成的字符串
 */
export function randomString(length, chats) {
  if (!length) length = 1
  if (!chats) chats = '0123456789qazrtyuioplkjhgfdswexcvbnm'
  let str = ''
  for (let i = 0; i < length; i++) {
    let num = randomNumber(0, chats.length - 1)
    str += chats[num]
  }
  return str
}

/**
 * 随机生成uuid
 * @return string 生成的uuid
 */
export function randomUUID(num = 32) {
  let chats = '0123456789abcdef'
  return randomString(num, chats)
}
/**
 * 下载文件
 * @return name 文件名
 */
export function fileExport(res, name) {
  let link = document.createElement('a');
  link.href = window.URL.createObjectURL(new Blob([res]));
  link.target = '_blank';
  link.download = name
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 返回文件类型对应的图标
 * @return key 文件类型
 */
export function fileImg(key) {
  const fileArr = new Map([
    ['jpg', require('@/assets/images/home/fileicon1.png')], // jpg
    ['JPG', require('@/assets/images/home/fileicon1.png')], // JPG
    ['jpeg', require('@/assets/images/home/fileicon1.png')], // jpeg
    ['JPEG', require('@/assets/images/home/fileicon1.png')], // JPEG
    ['gif', require('@/assets/images/home/fileicon2.png')], // gif
    ['GIF', require('@/assets/images/home/fileicon2.png')], // GIF
    ['png', require('@/assets/images/home/fileicon3.png')], // png
    ['PNG', require('@/assets/images/home/fileicon3.png')], // PNG
    ['txt', require('@/assets/images/home/fileicon4.png')], // txt
    ['TXT', require('@/assets/images/home/fileicon4.png')], // TXT
    ['doc', require('@/assets/images/home/fileicon5.png')], // word
    ['DOC', require('@/assets/images/home/fileicon5.png')], // word
    ['docx', require('@/assets/images/home/fileicon5.png')], // word
    ['DOCX', require('@/assets/images/home/fileicon5.png')], // word
    ['ppt', require('@/assets/images/home/fileicon6.jpg')], // ppt
    ['PPT', require('@/assets/images/home/fileicon6.jpg')], // ppt
    ['pptx', require('@/assets/images/home/fileicon6.jpg')], // ppt
    ['PPTX', require('@/assets/images/home/fileicon6.jpg')], // ppt
    ['xlsx', require('@/assets/images/home/fileicon7.png')], // excel
    ['XLSX', require('@/assets/images/home/fileicon7.png')], // excel
    ['pdf', require('@/assets/images/home/fileicon8.png')], // pdf
    ['PDF', require('@/assets/images/home/fileicon8.png')], // pdf
    ['mp4', require('@/assets/images/home/fileicon9.png')], // mp4
    ['default', require('@/assets/doc/other.png')],
  ])
  return fileArr.get(key) || fileArr.get('default')
}
export function fileDocImg(key) {
  const fileArr = new Map([
    ['folder', require('@/assets/images/home/folder.png')], // folder
    ['jpg', require('@/assets/images/home/fileicon1.png')], // jpg
    ['jfif', require('@/assets/images/home/fileicon1.png')], // jfif to jpg
    ['JPG', require('@/assets/images/home/fileicon1.png')], // JPG
    ['jpeg', require('@/assets/images/home/fileicon1.png')], // jpeg
    ['JPEG', require('@/assets/images/home/fileicon1.png')], // JPEG
    ['gif', require('@/assets/images/home/fileicon2.png')], // gif
    ['GIF', require('@/assets/images/home/fileicon2.png')], // GIF
    ['png', require('@/assets/images/home/fileicon3.png')], // png
    ['PNG', require('@/assets/images/home/fileicon3.png')], // PNG
    ['txt', require('@/assets/images/home/fileicon4.png')], // txt
    ['TXT', require('@/assets/images/home/fileicon4.png')], // TXT
    ['doc', require('@/assets/images/home/fileicon5.png')], // word
    ['DOC', require('@/assets/images/home/fileicon5.png')], // word
    ['docx', require('@/assets/images/home/fileicon5.png')], // word
    ['DOCX', require('@/assets/images/home/fileicon5.png')], // word
    ['ppt', require('@/assets/images/home/fileicon6.jpg')], // ppt
    ['PPT', require('@/assets/images/home/fileicon6.jpg')], // ppt
    ['pptx', require('@/assets/images/home/fileicon6.jpg')], // ppt
    ['PPTX', require('@/assets/images/home/fileicon6.jpg')], // ppt
    ['xlsx', require('@/assets/images/home/fileicon7.png')], // excel
    ['XLSX', require('@/assets/images/home/fileicon7.png')], // excel
    ['pdf', require('@/assets/images/home/fileicon8.png')], // pdf
    ['PDF', require('@/assets/images/home/fileicon8.png')], // pdf
    ['mp4', require('@/assets/images/home/fileicon9.png')], // mp4
    ['default', require('@/assets/images/home/file.png')], // ['default', require('@/assets/doc/other.png')],
  ])
  return fileArr.get(key) || fileArr.get('default')
}
export function fileDocStatus(key) {
  let list = ['jpg', 'JPG', 'jpeg', 'JPEG', 'gif', 'GIF', 'png', 'PNG', 'txt', 'TXT', 'doc', 'DOC', 'docx', 'DOCX', 'ppt', 'PPT', 'pptx', 'PPTX', 'xlsx', 'XLSX', 'pdf', 'PDF', 'mp4', 'jfif']
  if (list.includes(key)) {
    return true
  } else {
    return false
  }
}
export function FileDocType(type) {
  if (['mp4', 'mov', 'avi', 'mkv', 'flv'].includes(type)) {
    return 'video'
  } else if (['png', 'jpg', 'jpeg', 'gif', 'PNG', 'JPG', 'JPEG', 'GIF', 'jfif'].includes(type)) {
    return 'img'
  } else if (['txt', 'docx', 'doc', 'ppt', 'pptx', 'pdf', 'xlsx', 'json', 'html'].includes(type)) {
    return 'file'
  } else {
    return 'file'
  }
}