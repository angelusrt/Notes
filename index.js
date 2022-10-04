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
const navIndex = prop => {
  const navArr = Array.from(nav.children)
  for (let i = 0; i < navArr.length; i++)
    if (navArr[i].id === prop) return i
}
const contentIndex = prop => {
  const contArr = Array.from(content.children)
  for (let i = 0; i < contArr.length; i++)
    if (contArr[i].id === prop) return i
}
const divDebugger = (color, left, top) => {
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
const createElements = (isItDiv = true, item = null, changeState = true) => {
  const div = document.createElement(isItDiv?'div':'article')
  const delButton = document.createElement('button')
  const delButtonH3 = document.createElement('h3')
  const delButtonH3Text = document.createTextNode('X')
  const input = document.createElement('input')
  let delEvent, mouseEvent, initialPos

  delButtonH3.appendChild(delButtonH3Text)
  delButton.classList.add('removebutton')
  delButton.appendChild(delButtonH3)
  
  if(isItDiv){
    div.classList.add(
      'button', 'folderbutton', 'button-selected', 'button-deactivated'
    )

    div.id = nav.lastElementChild.id !== 'nav-addbutton'?
    `folderbutton-${parseInt(nav.lastElementChild.id.slice(13)) + 1}`:
    'folderbutton-0'
  } else {
    if (changeState)
      div.classList.add('button', 'button-selected', 'button-deactivated')
    else  
      div.classList.add('button')

    div.id = content.children.length !== 0?
    `article-${Number(content.lastElementChild.id.slice(8)) + 1}`:
    'article-0'
    
    input.value = item
  }

  div.appendChild(delButton)
  div.appendChild(input)

  return {div, input, delButton, delEvent, mouseEvent, initialPos}
}
const validateLastBlockOrDeleteIt = (oldDiv, animated = false) => {
  const lastDiv = Array.from(nav.children)[nav.children.length - 1]
  
  oldDiv.classList.remove('button-selected')

  if(
    lastDiv.className !== 'button' && 
    Array.from(lastDiv.children)[1].value === ''
  ){
    const lastDivEl = document.getElementById(lastDiv.id)

    lastDivEl.classList.add('button-deactivated')
    
    state.folder.pop()
    
    if(!animated)
      nav.removeChild(lastDivEl)
    else
      setTimeout(() => nav.removeChild(lastDivEl), 200)
  }
}
const validateLastNoteOrDeleteIt = (oldNote, article = null) => {
  const lastNote = Array.from(content.children)[content.children.length - 1]
  
  oldNote.classList.remove('button-selected')
  
  if(article){
    article.classList.add('button-selected')
    state.currentNote = article.id
  } else {
    lastNote.classList.remove('button-selected')
  }
  
  if(Array.from(lastNote.children)[1].value === ''){
    const i = navIndex(state.currentFolder) - 1
    const lastNoteEl = document.getElementById(lastNote.id)
    
    state.folder[i].content.pop()
    content.removeChild(lastNoteEl)
  }
}
const moveBlockWithMouse = (div, e, isItNav) => {
  const width = 0.1 * window.innerWidth
  const height = 0.1 * window.innerHeight
  const navOffHeight = nav.offsetHeight
  const contOffTop = content.offsetTop
  const contOffHeight = content.offsetHeight
  let left, top

  if(
    e.pageX > width + 85.0 && 
    e.pageX < (9.0*width) - 85.0
  )
    left = e.pageX - 85.0
  else if(e.pageX <= width + 85.0)
    left = width
  else if(e.pageX >= (9.0*width) - 85.0)
    left = (9.0*width) - 174.0

  if(isItNav){
    if(
      e.pageY > height &&
      e.pageY < navOffHeight
    ) 
      top = e.pageY - 37.5
    else if(e.pageY <= height)
      top = height - 37.5
    else if(e.pageY >= navOffHeight)
      top = navOffHeight - 37.5
  } else{
    if(
      e.pageY > contOffTop &&
      e.pageY < contOffTop + contOffHeight
    ) 
      top = e.pageY - 37.5
    else if(e.pageY <= contOffTop)
      top = contOffTop - 37.5
    else if(e.pageY >= contOffTop + contOffHeight)
      top = contOffTop + contOffHeight - 37.5
  }

  div.setAttribute('style', `
    position: absolute;
    z-index: 2;
    left: ${left}px;
    top: ${top}px;
  `)

  // divDebugger('red', div.style.left, div.style.top)
}
const interpolate = (
  obj, button, finalLeft, finalTop, duration
) => {
  let initialLeft = obj.style.left
  let initialTop = obj.style.top
  
  initialLeft = parseInt(initialLeft.slice(0, initialLeft.indexOf('p')))
  initialTop = parseInt(initialTop.slice(0, initialTop.indexOf('p')))

  const xDist = finalLeft - initialLeft
  const yDist = finalTop - initialTop

  let durationParts = duration/10
  
  const xParts = xDist/durationParts
  const yParts = yDist/durationParts

  // divDebugger('red', obj.style.left , obj.style.top)
  // divDebugger('green',`${finalLeft}px`,`${finalTop}px`)

  const animLoop = () => {
    let initialLeft = obj.style.left
    let initialTop = obj.style.top

    initialLeft = parseInt(initialLeft.slice(0, initialLeft.indexOf('p')))
    initialTop = parseInt(initialTop.slice(0, initialTop.indexOf('p')))

    obj.setAttribute('style', `
      position: absolute;
      z-index: 2;
      left: ${initialLeft + xParts}px;
      top: ${initialTop + yParts}px;
    `)

    durationParts -= 1 
    
    if (durationParts > 0)
      requestAnimationFrame(animLoop)
    else {
      obj.removeAttribute('style')
      button.classList.remove('button-trans-right', 'button-trans-left')  
    }
  }
  animLoop()
}
const getConditionalEnum = (
  row, tRow, column, tColumn, maxColumn
) => {
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
const getNewPosition = (obj, div, oldPos, isItNav) => {
  const objChildren = obj.children
  const objArray = Array.from(objChildren)
  const objSize = objArray.length

  let divLeft = div.offsetLeft
  let divTop = div.offsetTop
  let divWidth = div.offsetWidth
  let divHeight = div.offsetHeight  
  let divVertCenter = divLeft + (divWidth/2)
  let divHorCenter = divTop + (divHeight/2) 
  
  // divDebugger('red',`${divVertCenter}px`,`${divHorCenter}px`)

  let i = 0
  let newPos = 0
  
  const objLeft = i => objArray[i].offsetLeft + (divWidth/2)
  const objTop = i => objArray[i].offsetTop + (divHeight/2)
  
  const lastAlikePos = {
    pos: 0,
    dist: Math.sqrt(
      ((divVertCenter - objLeft(0))**2) + ((divHorCenter - objTop(0))**2)
    ),
    isAfter: false
  }

  while (i < objSize) {
    const iLeft = objLeft(i)
    const iTop = objTop(i)

    let dLeft = divVertCenter - iLeft
    let dTop = divHorCenter - iTop
    let isAfter = true
    let distance

    // divDebugger('green', `${iLeft}px`, `${iTop}px`)

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

  if(isItNav && newPos <= 0) newPos = 1
  else if(newPos >= objSize) newPos = objSize - 1

  return newPos
}
const RerenderDOMWithNewPosition = (obj, div, newPos, oldPos, isItNav) => {
  const objChildren = obj.children
  const objArray = Array.from(objChildren)
  const objSize = objArray.length
  const i = navIndex(state.currentFolder) - 1

  let l = isItNav?1:0
  
  if(newPos !== oldPos){
    let objList = []
    
    const appendDiv = (pos, index = pos) => {
      objArray[pos].id = `${isItNav?'folderbutton':'article'}-${index}`
      obj.appendChild(objArray[pos])

      if(isItNav)
        objList.push(state.folder[pos - 1])
      else
        objList.push(state.folder[i].content[pos])
    }

    if(isItNav){
      while (obj.children.length > 1)
        obj.removeChild(obj.children[1])
    } else{
      while (obj.children.length > 0)
        obj.removeChild(obj.children[0])
    }

    while (l < objSize){
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
    
    if(isItNav){
      state.folder = objList
      state.currentFolder = div.id
    } else {
      state.folder[i].content = objList
      state.currentNote = div.id
    }
  }
}
const InterpolateBlockToNewPosition = (obj, button, div, newPos) => {
  const objArray = Array.from(obj.children)
  const height = obj.offsetHeight - (.1 * window.innerHeight)
  const width = obj.offsetWidth - (.2 * window.innerWidth)

  const totalColumn = Math.floor(width/200)
  let totalRow = Math.ceil(objArray.length/totalColumn)
  
  const anteriorPos = newPos
  const anteriorRow = Math.ceil(anteriorPos/totalColumn)
  let anteriorColumn = anteriorPos%totalColumn
  let maxColumn = (objArray.length%totalColumn) - 1
  
  if(anteriorColumn === 0) anteriorColumn = totalColumn
  if(maxColumn === 0) {
    maxColumn = totalColumn
    totalRow -= 1
  }

  const objOffTop = (i) => objArray[i].offsetTop
  const objOffLeft = (i) => objArray[i].offsetLeft

  const conditionalEnum = getConditionalEnum(
    anteriorRow, totalRow, anteriorColumn, totalColumn, maxColumn
  )

  //Jump line
  if(conditionalEnum === 0){
    const left = (width/2) - (div.offsetWidth/2) + (.1 * window.innerWidth)
    const top = height + (.1 * window.innerHeight) - 20
    
    interpolate(div, button, left, top, 150)
    
  //After the anterior when the row is complete
  } else if(conditionalEnum === 1) {
    let leftPos = objArray[newPos - 1].offsetLeft + 200

    if(button.id === 'nav-addbutton') 
      leftPos = objArray[newPos - 1].offsetLeft + 160

    button.classList.add('button-trans-right')

    interpolate(div, button, leftPos, objOffTop(newPos - 1), 150)

  //Before the posterior when the row is incomplete
  } else if(conditionalEnum === 2){
    objArray[newPos + 1].classList.add('button-trans-left')
    button = objArray[newPos + 1]

    interpolate(
      div, button, objOffLeft(newPos + 1) - 100, objOffTop(newPos + 1), 150
    )
  
  //Before the posterior when the row is complete
  } else if(conditionalEnum === 3) {
    objArray[newPos + 1].classList.add('button-trans-left')
    button = objArray[newPos + 1]

    interpolate(
      div, button, objOffLeft(newPos + 1), objOffTop(newPos + 1), 150
    )

  //After the anterior when the row is incomplete
  } else {
    let addPos = 100

    if(button.id === 'nav-addbutton') addPos = 60

    button.classList.add('button-trans-right')

    interpolate(
      div, button, button.offsetLeft + addPos, button.offsetTop, 150
    )
  }

  return button
}

//'Main' functions
const onFolderFunc = () => {
  const oldDiv = document.getElementById(state.currentFolder)
  let {
    div, input, delButton, mouseEvent, initialPos
  } = createElements()  

  if(oldDiv) validateLastBlockOrDeleteIt(oldDiv)

  state.currentFolder = div.id
  while (content.firstChild) 
    content.removeChild(content.firstChild)

  delButton.addEventListener('click', e => {
    const oldDiv = document.getElementById(state.currentFolder)
    let pos = parseInt(div.id.slice(13))

    state.folder = state.folder.filter((item, index) => 
      index !== navIndex(delButton.parentElement.id) - 1
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
  
    if(state.currentFolder !== div.id){
      const oldDiv = document.getElementById(state.currentFolder)

      while (content.firstChild)
        content.removeChild(content.firstChild)

      content.classList.add('content-deactivated')

      setTimeout(() => {
        for (let i = 0; i < state.folder[navIndex(div.id) - 1].content.length; i++) {
          onArticleFunc({
            item: state.folder[navIndex(div.id) - 1].content[i], 
            changeState: false
          })
        }
        window.scroll({top:0, behavior: "smooth"})//problem
        content.classList.remove('content-deactivated')
      }, 200)

      if (oldDiv) validateLastBlockOrDeleteIt(oldDiv, true)

      div.classList.add('button-selected')
      mainAddbutton.classList.remove('button-deactivated')
      state.currentFolder = div.id
    }
  })
  html.addEventListener('mousemove', e => {
    if(mouseEvent) moveBlockWithMouse(div, e, true)
  })
  div.addEventListener('mouseup', e => {
    if(mouseEvent && (initialPos.x !== e.pageX || initialPos.y !== e.pageY)){
      const oldPos = navIndex(div.id)
      let newPos = getNewPosition(nav, div, oldPos, true)
      
      RerenderDOMWithNewPosition(nav, div, newPos, oldPos, true)
      
      setTimeout(() => {
        let button = document.getElementById(`folderbutton-${newPos - 2}`)

        if(button === null) button = navAddbutton
        
        InterpolateBlockToNewPosition(nav, button, div, newPos)
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
const onArticleFunc = ({item, changeState}) => {
  const oldNote = document.getElementById(state.currentNote)
  let { 
    div, input, delButton, delEvent, mouseEvent, initialPos
  } = createElements(false, item, changeState)
  
  if (oldNote) validateLastNoteOrDeleteIt(oldNote)

  delButton.addEventListener('click', e => {
    const i = navIndex(state.currentFolder) - 1
    delEvent = e
    
    state.folder[i] = {
      content: state.folder[i].content.filter((item, index) => 
        index !== contentIndex(div.id) 
      )
    }

    state.currentNote = ''
    div.classList.add('button-deactivated')

    setTimeout(() =>  content.removeChild(div), 200)
  })
  div.addEventListener('mousedown', e => {
    if(!delEvent){
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
        validateLastNoteOrDeleteIt(oldNote, div)
    }
  })
  html.addEventListener('mousemove', e => {
    if(mouseEvent) moveBlockWithMouse(div, e, false)
  })
  div.addEventListener('mouseup', e => {
    if(mouseEvent && (initialPos.x !== e.pageX || initialPos.y !== e.pageY)){
      const oldPos = contentIndex(div.id)
      let newPos = getNewPosition(content, div, oldPos, false)
      
      RerenderDOMWithNewPosition(content, div, newPos, oldPos, false)
      
      setTimeout(() => {
        let button = document.getElementById(`article-${newPos - 2}`)
        
        InterpolateBlockToNewPosition(content, button, div, newPos)
      })
    }

    mouseEvent = false
  })
  input.addEventListener('keydown', e => {
    const i = navIndex(state.currentFolder) - 1
    const j = contentIndex(div.id)

    if(e.key.length === 1)
      state.folder[i].content[j] = input.value + e.key
    else 
      state.folder[i].content[j] = input.value
  })
  
  state.currentNote = div.id
  content.appendChild(div)
  
  if(changeState) {
    input.focus()

    state.folder[navIndex(state.currentFolder) - 1].content.push(input.value)
    div.classList.remove('button-deactivated')
  }
}

navAddbutton.addEventListener('click', onFolderFunc)
mainAddbutton.addEventListener('click', () => onArticleFunc({item: null, changeState: true}))