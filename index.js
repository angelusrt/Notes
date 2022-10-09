const html = document.getElementsByTagName('html')[0]
const body = document.getElementsByTagName('body')[0]
const nav = document.getElementsByTagName('nav')[0]
const main = document.getElementsByTagName('main')[0]

const navAddbutton = document.getElementById('nav-addbutton')
const content = document.getElementById('content')
const mainAddbutton = document.getElementById('main-addbutton') 

const state = {
  currentFolder: String,
  currentNote: String,
  folder: [{
    content: null
  }]
}

//Helper Functions
/** Find the index of the element by the 'id' in reference to the 'parent' */
function findIndex(id, parent){
  const parentArr = Array.from(parent.children)
  for (let i = 0; i < parentArr.length; i++)
    if (parentArr[i].id === id) return i
}
/** A debugger function to help the development of position based functions */
function debug(color, left, top){
  const newDiv = document.createElement('div')
  newDiv.style.width = '10px'
  newDiv.style.height = '10px'
  newDiv.style.position = 'absolute'
  newDiv.style.backgroundColor = color
  newDiv.style.zIndex = 2
  newDiv.style.left = left
  newDiv.style.top = top
  newDiv.className = 'div-debugger'
  body.appendChild(newDiv)

  if(body.children.length > 20){
    let i = 0
    while(i < body.children.length){
      body.removeChild(document.getElementsByClassName('div-debugger')[0])
      i++
    }
  }
}
/** 
 * Returns the elements depending on where it is from, indicated by 'isNav'.
 * 'value' indicates the input.value value. 
 * 'isStateChanging' manages animation classes.
 * */
function createElements(isNav = true, value = null, isStateChanging = true){
  const div = document.createElement(isNav?'div':'article')
  const delButton = document.createElement('button')
  const delButtonH3 = document.createElement('h3')
  const delButtonH3Text = document.createTextNode('X')
  const input = document.createElement('input')
  let delEvent, mouseEvent, initialPos

  delButtonH3.appendChild(delButtonH3Text)
  delButton.classList.add('removebutton')
  delButton.appendChild(delButtonH3)
  
  if(isNav){
    div.classList.add(
      'button', 'folderbutton', 'button-selected', 'button-deactivated'
    )

    div.id = nav.lastElementChild.id !== 'nav-addbutton'?
    `folderbutton-${parseInt(nav.lastElementChild.id.slice(13)) + 1}`:
    'folderbutton-0'
  } else {
    if (isStateChanging)
      div.classList.add('button', 'button-selected', 'button-deactivated')
    else  
      div.classList.add('button')

    div.id = content.children.length !== 0?
    `article-${Number(content.lastElementChild.id.slice(8)) + 1}`:
    'article-0'
    
    input.value = value
  }

  div.appendChild(delButton)
  div.appendChild(input)

  return {div, input, delButton, delEvent, mouseEvent, initialPos}
}

/** 
 * 'obj' indicates which object will suffer the new styles,
 * 'pageX' and 'pageY' informs the coordinates,
 * and 'isNav' if it is in the body or nav
 * */
function moveBlockWithMouse(obj, pageX, pageY, isNav){
  const width = 0.1 * window.innerWidth
  const height = 0.1 * window.innerHeight
  const navOffHeight = nav.offsetHeight
  const contOffTop = content.offsetTop
  const contOffHeight = content.offsetHeight
  let left, top

  if(
    pageX > width + 85.0 && 
    pageX < (9.0*width) - 85.0
  )
    left = pageX - 85.0
  else if(pageX <= width + 85.0)
    left = width
  else if(pageX >= (9.0*width) - 85.0)
    left = (9.0*width) - 174.0

  if(isNav){
    if(
      pageY > height &&
      pageY < navOffHeight
    ) 
      top = pageY - 37.5
    else if(pageY <= height)
      top = height - 37.5
    else if(pageY >= navOffHeight)
      top = navOffHeight - 37.5
  } else{
    if(
      pageY > contOffTop &&
      pageY < contOffTop + contOffHeight
    ) 
      top = pageY - 37.5
    else if(pageY <= contOffTop)
      top = contOffTop - 37.5
    else if(pageY >= contOffTop + contOffHeight)
      top = contOffTop + contOffHeight - 37.5
  }

  obj.setAttribute('style', `
    position: absolute;
    z-index: 2;
    left: ${left}px;
    top: ${top}px;
  `)

  // debug('red', div.style.left, div.style.top)
}
/** 
 * Will get the new position of 'div' in relation of it`s
 * 'parent' and 'oldPos' meaning "old position" 
 * */
function getNewPosition(obj, parent, oldPos){
  const parentChildren = parent.children
  const parentArray = Array.from(parentChildren)
  const parentSize = parentArray.length

  let objLeft = obj.offsetLeft
  let objTop = obj.offsetTop
  let objWidth = obj.offsetWidth
  let objHeight = obj.offsetHeight  
  let objVertCenter = objLeft + (objWidth/2)
  let objHorCenter = objTop + (objHeight/2) 
  
  // debug('red',`${objVertCenter}px`,`${objHorCenter}px`)

  let i = 0
  let newPos = 0
  
  const parentLeft = i => parentArray[i].offsetLeft + (objWidth/2)
  const parentTop = i => parentArray[i].offsetTop + (objHeight/2)
  
  const lastAlikePos = {
    pos: 0,
    dist: Math.sqrt(
      ((objVertCenter - parentLeft(0))**2) + 
      ((objHorCenter - parentTop(0))**2)
    ),
    isAfter: false
  }

  while (i < parentSize) {
    const iLeft = parentLeft(i)
    const iTop = parentTop(i)

    let dLeft = objVertCenter - iLeft
    let dTop = objHorCenter - iTop
    let isAfter = true
    let distance

    // debug('green', `${iLeft}px`, `${iTop}px`)

    if(dLeft < 0) {
      isAfter = false
      dLeft *= -1
    }
    if(dTop < 0) dTop *= -1

    distance = Math.sqrt((dLeft**2) + (dTop**2))
    
    if(distance < lastAlikePos.dist + 60 && dTop < 50){
      lastAlikePos.dist = distance
      lastAlikePos.pos = i 
      lastAlikePos.isAfter = isAfter
    }

    i++
    if(i === oldPos) i++
  }

  if(lastAlikePos.isAfter)
    newPos = lastAlikePos.pos + 1
  else {
    if(oldPos < lastAlikePos.pos)
      newPos = lastAlikePos.pos - 1
    else 
      newPos = lastAlikePos.pos 
  }
  
  if(parent.tagName === 'NAV' && newPos <= 0) newPos = 1
  else if(newPos >= parentSize) newPos = parentSize - 1

  return newPos
}

/** 
 * Will rerender 'obj' in 'parent' with 'newPos' compared with 'oldPos'
 * */
function rerenderDOMWithNewPosition(obj, parent, newPos, oldPos){
  const parentChildren = parent.children
  const parentArray = Array.from(parentChildren)
  const parentSize = parentArray.length
  const isNav = parent.tagName === "NAV"
  const i = findIndex(state.currentFolder, nav) - 1

  let l = isNav?1:0
  
  if(newPos !== oldPos){
    let parentList = []
    
    const appendDiv = (pos, index = pos) => {
      parentArray[pos].id = `${isNav?'folderbutton':'article'}-${index}`
      parent.appendChild(parentArray[pos])

      if(isNav)
        parentList.push(state.folder[pos - 1])
      else
        parentList.push(state.folder[i].content[pos])
    }

    if(isNav){
      while (parent.children.length > 1)
        parent.removeChild(parent.children[1])
    } else{
      while (parent.children.length > 0)
        parent.removeChild(parent.children[0])
    }

    while (l < parentSize){
      if(oldPos > newPos && l === newPos){
        appendDiv(oldPos, l - 1)
        appendDiv(l)
      }
      else if(oldPos < newPos && l === newPos){
        appendDiv(l, l - 2)
        appendDiv(oldPos, l - 1)
      }
      else if(l === oldPos) 
        null
      else if(
        oldPos > newPos && (l < newPos || l > oldPos) ||
        oldPos < newPos && (l < oldPos || l > newPos)
      ) 
        appendDiv(l, l - 1)
      else if(oldPos < newPos && l > oldPos && l < newPos)
        appendDiv(l, l - 2)
      else
        appendDiv(l)

      l++
    }
    
    if(isNav){
      state.folder = parentList
      state.currentFolder = obj.id
    } else {
      state.folder[i].content = parentList
      state.currentNote = obj.id
    }
  }
}
/** 
 * Will interpolate 'obj' in 'parent' to 'newPos'.
 * 'nearBlock' is being passed because of animations.
 * */
function interpolateBlockToNewPosition(obj, parent, newPos, nearBlock){
  function interpolate(
    parent, nearBlock, finalLeft, finalTop, duration
  ){
    let initialLeft = parent.style.left
    let initialTop = parent.style.top
    
    initialLeft = parseInt(initialLeft.slice(0, initialLeft.indexOf('p')))
    initialTop = parseInt(initialTop.slice(0, initialTop.indexOf('p')))
  
    const xDist = finalLeft - initialLeft
    const yDist = finalTop - initialTop
  
    let durationParts = duration/10
    
    const xParts = xDist/durationParts
    const yParts = yDist/durationParts
  
    // debug('red', parent.style.left , parent.style.top)
    // debug('green',`${finalLeft}px`,`${finalTop}px`)
  
    function animLoop(){
      let initialLeft = parent.style.left
      let initialTop = parent.style.top
  
      initialLeft = parseInt(initialLeft.slice(0, initialLeft.indexOf('p')))
      initialTop = parseInt(initialTop.slice(0, initialTop.indexOf('p')))
  
      parent.setAttribute('style', `
        position: absolute;
        z-index: 2;
        left: ${initialLeft + xParts}px;
        top: ${initialTop + yParts}px;
      `)
  
      durationParts -= 1 
      
      if (durationParts > 0)
        requestAnimationFrame(animLoop)
      else {
        parent.removeAttribute('style')
        nearBlock.classList.remove('button-trans-right', 'button-trans-left')  
      }
    }
    animLoop()
  }
  function getConditionalEnum(
    row, tRow, column, tColumn, maxColumn
  ){
    if( row === tRow && column === tColumn && maxColumn === tColumn )
      return 0
    else if(
      ( row < tRow && column < tColumn ) || 
      ( row === tRow && column < tColumn && maxColumn === tColumn )
    )
      return 1
    else if(
      ( row === tRow - 1 && column === tColumn && maxColumn < tColumn ) || 
      ( row === tRow && column === tColumn && maxColumn < tColumn )
    )
      return 2
    else if(
      ( row <= tRow - 1 && column === tColumn ) || 
      ( row === tRow && column < tColumn && maxColumn === tColumn )
    )
      return 3
    else
      return 4
  } 

  const parentArray = Array.from(parent.children)
  const height = parent.offsetHeight - (.1 * window.innerHeight)
  const width = parent.offsetWidth - (.2 * window.innerWidth)

  const totalColumn = Math.floor(width/200)
  let totalRow = Math.ceil(parentArray.length/totalColumn)
  
  const anteriorPos = newPos
  const anteriorRow = Math.ceil(anteriorPos/totalColumn)
  let anteriorColumn = anteriorPos%totalColumn
  let maxColumn = (parentArray.length%totalColumn) - 1
  
  if(anteriorColumn === 0) anteriorColumn = totalColumn
  if(maxColumn === 0) {
    maxColumn = totalColumn
    totalRow -= 1
  }

  const parentOffTop = (i) => parentArray[i].offsetTop
  const parentOffLeft = (i) => parentArray[i].offsetLeft

  const conditionalEnum = getConditionalEnum(
    anteriorRow, totalRow, anteriorColumn, totalColumn, maxColumn
  )

  //Jump line
  if(conditionalEnum === 0){
    const left = (width/2) - (obj.offsetWidth/2) + (.1 * window.innerWidth)
    const top = height + (.1 * window.innerHeight) - 20
    
    interpolate(obj, nearBlock, left, top, 150)
    
  //After the anterior when the row is complete
  } else if(conditionalEnum === 1) {
    let leftPos = parentArray[newPos - 1].offsetLeft + 200

    if(nearBlock.id === 'nav-addbutton') 
      leftPos = parentArray[newPos - 1].offsetLeft + 160

    nearBlock.classList.add('button-trans-right')

    interpolate(obj, nearBlock, leftPos, parentOffTop(newPos - 1), 150)

  //Before the posterior when the row is incomplete
  } else if(conditionalEnum === 2){
    parentArray[newPos + 1].classList.add('button-trans-left')
    nearBlock = parentArray[newPos + 1]

    interpolate(
      obj, nearBlock, parentOffLeft(newPos + 1) - 100, parentOffTop(newPos + 1), 150
    )
  
  //Before the posterior when the row is complete
  } else if(conditionalEnum === 3) {
    parentArray[newPos + 1].classList.add('button-trans-left')
    nearBlock = parentArray[newPos + 1]

    interpolate(
      obj, nearBlock, parentOffLeft(newPos + 1), parentOffTop(newPos + 1), 150
    )

  //After the anterior when the row is incomplete
  } else {
    let addPos = 100

    if(nearBlock.id === 'nav-addbutton') addPos = 60

    nearBlock.classList.add('button-trans-right')

    interpolate(
      obj, nearBlock, nearBlock.offsetLeft + addPos, nearBlock.offsetTop, 150
    )
  }

  return nearBlock
}

//'Main' functions
function onFolderFunc(){
  const oldDiv = document.getElementById(state.currentFolder)
  let {
    div, input, delButton, mouseEvent, initialPos
  } = createElements()  

  function validateLastObj(oldDiv, animated = false){
    const lastDiv = Array.from(nav.children)[nav.children.length - 1]
    
    oldDiv.classList.remove('button-selected')
  
    if(
      lastDiv.className === 'button' || 
      Array.from(lastDiv.children)[1].value != ''
    )
      return null
  
    const lastDivEl = document.getElementById(lastDiv.id)
  
    lastDivEl.classList.add('button-deactivated')
    
    state.folder.pop()
    
    if(!animated)
      nav.removeChild(lastDivEl)
    else
      setTimeout(() => nav.removeChild(lastDivEl), 200)
  }

  if(oldDiv) validateLastObj(oldDiv)

  state.currentFolder = div.id
  while (content.firstChild) 
    content.removeChild(content.firstChild)

  delButton.addEventListener('click', e => {
    const oldDiv = document.getElementById(state.currentFolder)
    let pos = parseInt(div.id.slice(13))

    state.folder = state.folder.filter((item, index) => 
      index !== findIndex(delButton.parentElement.id, nav) - 1
    )

    while (content.firstChild)
      content.removeChild(content.firstChild)

    if(oldDiv && oldDiv !== div) 
      oldDiv.classList.remove('button-selected')

    if(pos + 1 !== nav.children.length){
      for (let i = pos + 2; i < nav.children.length; i++)
        nav.children[i].id = `folderbutton-${i - 2}`
    }
    
    state.currentFolder = ''

    mainAddbutton.classList.add('button-deactivated')
    div.classList.add('button-deactivated')

    setTimeout(() =>  nav.removeChild(div), 200)
  })
  div.addEventListener('mousedown', e => {
    mouseEvent = true
    initialPos = {x: e.pageX, y: e.pageY}
  
    if(state.currentFolder === div.id) return null
    
    const oldDiv = document.getElementById(state.currentFolder)

    while (content.firstChild)
      content.removeChild(content.firstChild)

    content.classList.add('content-deactivated')

    setTimeout(() => {
      const contLength = state.folder[findIndex(div.id, nav) - 1].content.length
      for (let i = 0; i < contLength; i++) {
        onArticleFunc({
          item: state.folder[findIndex(div.id, nav) - 1].content[i], 
          isStateChanging: false
        })
      }
      window.scroll({top:0, behavior: "smooth"})//problem
      content.classList.remove('content-deactivated')
    }, 200)

    if (oldDiv) validateLastObj(oldDiv, true)

    div.classList.add('button-selected')
    mainAddbutton.classList.remove('button-deactivated')
    state.currentFolder = div.id
  })
  html.addEventListener('mousemove', e => {
    if(mouseEvent) moveBlockWithMouse(div, e.pageX, e.pageY, true)
  })
  div.addEventListener('mouseup', e => {
    if(mouseEvent && (initialPos.x !== e.pageX || initialPos.y !== e.pageY)){
      const oldPos = findIndex(div.id, nav)
      let newPos = getNewPosition(div, nav, oldPos)
      
      rerenderDOMWithNewPosition(div, nav, newPos, oldPos)
      
      setTimeout(() => {
        let nearBlock = document.getElementById(`folderbutton-${newPos - 2}`)
  
        if(nearBlock === null) nearBlock = navAddbutton
        
        interpolateBlockToNewPosition(div, nav, newPos, nearBlock)
      })
    }

    mouseEvent = false
  })

  if(state.folder[0] !== undefined && state.folder[0].content === null) 
    state.folder.shift()
  state.folder.push({content: []})

  nav.appendChild(div)
  input.focus()

  mainAddbutton.classList.remove('button-deactivated')
  if(div) div.classList.remove('button-deactivated')
}
function onArticleFunc({item, isStateChanging}){
  const oldNote = document.getElementById(state.currentNote)
  let { 
    div, input, delButton, delEvent, mouseEvent, initialPos
  } = createElements(false, item, isStateChanging)
  
  function validateLastObj(oldNote, article = null){
    const lastNote = Array.from(content.children)[content.children.length - 1]
    
    oldNote.classList.remove('button-selected')
    
    if(article){
      article.classList.add('button-selected')
      state.currentNote = article.id
    } else {
      lastNote.classList.remove('button-selected')
    }
    
    if(Array.from(lastNote.children)[1].value === ''){
      const i = findIndex(state.currentFolder, nav) - 1
      const lastNoteEl = document.getElementById(lastNote.id)
      
      state.folder[i].content.pop()
      content.removeChild(lastNoteEl)
    }
  }

  if (oldNote) validateLastObj(oldNote)

  delButton.addEventListener('click', e => {
    const i = findIndex(state.currentFolder, nav) - 1
    delEvent = e
    
    state.folder[i] = {
      content: state.folder[i].content.filter((item, index) => 
        index !== findIndex(div.id, content) 
      )
    }

    state.currentNote = ''
    div.classList.add('button-deactivated')

    setTimeout(() =>  content.removeChild(div), 200)
  })
  div.addEventListener('mousedown', e => {
    if(delEvent) return null

    mouseEvent = true
    initialPos = {x: e.pageX, y: e.pageY}

    let oldNote
    
    if(state.currentNote !== '')
      oldNote = document.getElementById(state.currentNote)
    else {
      div.classList.add('button-selected')
      state.currentNote = div.id
    } 
    
    if (oldNote && oldNote.id !== div.id)
      validateLastObj(oldNote, div)
  })
  html.addEventListener('mousemove', e => {
    if(mouseEvent) moveBlockWithMouse(div, e.pageX, e.pageY, false)
  })
  div.addEventListener('mouseup', e => {
    if(mouseEvent && (initialPos.x !== e.pageX || initialPos.y !== e.pageY)){
      const oldPos = findIndex(div.id, content)
      let newPos = getNewPosition(div, content, oldPos)
      
      rerenderDOMWithNewPosition(div, content, newPos, oldPos)
      
      setTimeout(() => {
        let nearBlock = document.getElementById(`article-${newPos - 2}`)
        
        interpolateBlockToNewPosition(div, content, newPos, nearBlock)
      })
    }

    mouseEvent = false
  })
  input.addEventListener('keydown', e => {
    const i = findIndex(state.currentFolder, nav) - 1
    const j = findIndex(div.id, content)

    if(e.key.length === 1)
      state.folder[i].content[j] = input.value + e.key
    else 
      state.folder[i].content[j] = input.value
  })
  
  state.currentNote = div.id
  content.appendChild(div)
  
  if(isStateChanging) {
    input.focus()

    state.folder[findIndex(state.currentFolder, nav) - 1].content.push(input.value)
    div.classList.remove('button-deactivated')
  }
}

navAddbutton.addEventListener('click', onFolderFunc)
mainAddbutton.addEventListener('click', () => onArticleFunc({item: null, isStateChanging: true}))