const html = document.getElementsByTagName('html')[0]
const body = document.getElementsByTagName('body')[0]
const nav = document.getElementsByTagName('nav')[0]
const main = document.getElementsByTagName('main')[0]

// const navAddbutton = nav.children.item(nav.children.length - 1)
// const mainAddbutton = main.children.item(0)
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

const navIndex = prop => {
  const navArr = Array.from(nav.children)
  for (let i = 0; i < navArr.length; i++)
    if (navArr[i].id === prop) return i

  // return Array.from(nav.children).map((item, index) => {
  //   if (item.id === prop) return index
  // }).filter(item => item !== undefined)[0]
}
const contentIndex = prop => {
  const contArr = Array.from(content.children)
  for (let i = 0; i < contArr.length; i++)
    if (contArr[i].id === prop) return i

  // return Array.from(content.children).map((item, index) => {
  //   if (item.id === prop) return index
  // }).filter(item => item !== undefined)[0]
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

const onFolderFunc = () => {
  const oldDiv = document.getElementById(state.currentFolder)
  const div = document.createElement('div')
  const delButton = document.createElement('button')
  const delButtonH3 = document.createElement('h3')
  const delButtonH3Text = document.createTextNode('X')
  const input = document.createElement('input')
  let delEvent, mouseEvent, initialPos

  delButtonH3.appendChild(delButtonH3Text)
  delButton.className = 'removebutton'
  delButton.appendChild(delButtonH3)
  
  if (oldDiv) {
    const lastDiv = Array.from(nav.children)[nav.children.length - 1]
    
    oldDiv.className = 'button folderbutton'
    
    if(
      lastDiv.className !== 'button' && 
      Array.from(lastDiv.children)[1].value === ''
    ){
      const lastDivEl = document.getElementById(lastDiv.id)
      
      state.folder.pop()
      nav.removeChild(lastDivEl)
    }
  }

  div.className = 'button folderbutton button-selected button-deactivated'
  div.id = nav.lastElementChild.id !== 'nav-addbutton'?
  `folderbutton-${parseInt(nav.lastElementChild.id.slice(13)) + 1}`:
  'folderbutton-0'
  div.appendChild(delButton)
  div.appendChild(input)

  state.currentFolder = div.id
  while (content.firstChild) {
    content.removeChild(content.firstChild)
  }

  delButton.addEventListener('click', e => {
    const oldDiv = document.getElementById(state.currentFolder)
    let pos = parseInt(div.id.slice(13))
    delEvent = e

    state.folder = state.folder.filter((item, index) => 
      index !== navIndex(delButton.parentElement.id) - 1
    )
    while (content.firstChild) {
      content.removeChild(content.firstChild)
    }

    if(oldDiv && oldDiv !== div) 
      oldDiv.className = 'button folderbutton'

    if(pos + 1 !== nav.children.length){
      for (let i = pos + 2; i < nav.children.length; i++)
        nav.children[i].id = `folderbutton-${i - 2}`
    }
    
    state.currentFolder = ''

    mainAddbutton.className += ' button-deactivated'
    div.className += ' button-deactivated'

    setTimeout(() =>  nav.removeChild(div), 200)
  })
  div.addEventListener('mousedown', e => {
    mouseEvent = true
    initialPos = {x: e.pageX, y: e.pageY}
  
    if(state.currentFolder !== div.id){
      const oldDiv = document.getElementById(state.currentFolder)

      while (content.firstChild) {
        content.removeChild(content.firstChild)
      }

      content.className += ' content-deactivated'

      setTimeout(() => {
        // state.folder[navIndex(div.id) - 1].content.map(item => {
        //   onArticleFunc({item, changeState: false})
        // })
        for (let i = 0; i < state.folder[navIndex(div.id) - 1].content.length; i++) {
          onArticleFunc({
            item: state.folder[navIndex(div.id) - 1].content[i], 
            changeState: false
          })
        }
        window.scroll({top:0, behavior: "smooth"})//problem
        content.className = 'content'
      }, 200)

      if(oldDiv) {
        const lastDiv = Array.from(nav.children)[nav.children.length - 1]
        
        oldDiv.className = 'button folderbutton'
        
        if(Array.from(lastDiv.children)[1].value === ''){
          const lastDivEl = document.getElementById(lastDiv.id)

          lastDivEl.className += ' button-deactivated'
          
          state.folder.pop()
          setTimeout(() => nav.removeChild(lastDivEl), 200)
        }
      }

      div.className += ' button-selected'

      // mainAddbutton.style.display = 'block'
      if(mainAddbutton.className.indexOf('button-deactivated') !== -1)
        mainAddbutton.className = mainAddbutton.className.slice(0,
          mainAddbutton.className.indexOf('button-deactivated')
        )

      state.currentFolder = div.id
    }
  })
  html.addEventListener('mousemove', e => {
    if(mouseEvent){
      const width = 0.1 * window.innerWidth
      const height = 0.1 * window.innerHeight
      
      // let color = 'red'
      
      div.style.position = 'absolute'
      div.style.zIndex = 2

      if(
        e.pageX > width + 87 && 
        e.pageX < (9*width) - 87
      ) {
        // color = 'green'
        div.style.left = `${e.pageX - 87}px`
      }
      else if(e.pageX <= width + 87){
        // color = 'red'
        div.style.left = `${width}px`
      }
      else if(e.pageX >= (9*width) - 84){
        // color = 'red'
        div.style.left = `${(9*width) - 174}px`
      }

      if(
        e.pageY > height + 69 &&
        e.pageY < height + nav.offsetHeight - 138.5
      ) 
        div.style.top = `${e.pageY - 49.5}px`
      else if(e.pageY <= height + 69)
        div.style.top = `${height + 25.5}px`
      else if(e.pageY >= height + nav.offsetHeight - 138.5)
        div.style.top = `${height + nav.offsetHeight - 182}px`   

      // divDebugger(color, div.style.left, div.style.top)
    }
  })
  div.addEventListener('mouseup', e => {
    if(mouseEvent && (initialPos.x !== e.pageX || initialPos.y !== e.pageY)){
      const navChildren = nav.children
      const navArray = Array.from(navChildren)
      const navSize = navArray.length
    
      let divLeft = div.offsetLeft
      let divTop = div.offsetTop
      let divWidth = div.offsetWidth
      let divHeight = div.offsetHeight
      let button
      
      divLeft += divWidth/2
      divTop += divHeight/2 
      
      // divDebugger('red',`${divLeft}px`,`${divTop}px`)
  
      let i = 0
      let newPos = 0
      let l = 1
      let oldPos = navIndex(div.id)
      
      const navLeft = i => navArray[i].offsetLeft + (divWidth/2)
      const navTop = i => navArray[i].offsetTop + (divHeight/2)
      
      const lastAlikePos = {
        pos: 0,
        dist: Math.sqrt(
          ((divLeft - navLeft(0))**2) + ((divTop - navTop(0))**2)
        ),
        isAfter: false
      }
  
      while (i < navSize) {
        const iLeft = navLeft(i)
        const iTop = navTop(i)
  
        let dLeft = divLeft - iLeft
        let dTop = divTop - iTop
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
  
      if(newPos <= 0) newPos = 1
      else if(newPos >= navSize) newPos = navSize - 1
  
      
      if(newPos !== oldPos){
        const appendDiv = (pos, index = pos) => {
          navArray[pos].id = `folderbutton-${index}`
          nav.appendChild(navArray[pos])
          stateFolder.push(state.folder[pos - 1])
        }
        let stateFolder = []
  
        while (nav.children.length > 1)
          nav.removeChild(nav.children[1])
    
        while (l < navSize){
          if(oldPos > newPos && l === newPos){
            appendDiv(oldPos, l - 1)
            appendDiv(l)
          }
          else if(oldPos < newPos && l === newPos){
            appendDiv(l, l - 2)
            appendDiv(oldPos, l - 1)
          }
          else if(l === oldPos) null
          else if(
            oldPos > newPos && (l < newPos || l > oldPos) ||
            oldPos < newPos && (l < oldPos || l > newPos)
          ) appendDiv(l, l - 1)
          else if(oldPos < newPos && l > oldPos && l < newPos)
            appendDiv(l, l - 2)
          else
            appendDiv(l)
    
          l++
        }
  
        state.folder = stateFolder
        state.currentFolder = div.id
      }
  
      const interpolation = (
        obj, finalLeft, finalTop, duration
      ) => {
        const left = obj.style.left
        const top = obj.style.top
        
        const initialLeft = parseInt(left.slice(0, left.indexOf('p')))
        const initialTop = parseInt(top.slice(0, top.indexOf('p')))
  
        const xDist = finalLeft - initialLeft
        const yDist = finalTop - initialTop
  
        let durationParts = duration/10
        
        const xParts = xDist/durationParts
        const yParts = yDist/durationParts
  
        // divDebugger('red',left , top)
        // divDebugger('green',`${finalLeft}px`,`${finalTop}px`)
  
        const interval = setInterval(() => {
          const left = obj.style.left
          const top = obj.style.top
  
          const initialLeft = parseInt(left.slice(0, left.indexOf('p')))
          const initialTop = parseInt(top.slice(0, top.indexOf('p')))
  
          obj.style.left = `${initialLeft + xParts}px`
          obj.style.top = `${initialTop + yParts}px`
          durationParts -= 1 
  
          if(durationParts <= 0) clearInterval(interval)
        }, 10)
      }
      const whereNext = () => {
        let button = 
        document.getElementById(`folderbutton-${newPos - 2}`)
        
        if(button === null) button = navAddbutton
  
        const height = nav.offsetHeight - (.1 * window.innerHeight)
        const width = nav.offsetWidth - (.2 * window.innerWidth)
  
        const totalColumn = Math.floor(width/200)
        let totalRow = Math.ceil(navSize/totalColumn)
        
        const anteriorPos = newPos
        const anteriorRow = Math.ceil(anteriorPos/totalColumn)
        let anteriorColumn = anteriorPos%totalColumn
        let maxColumn = (navSize%totalColumn) - 1
        
        if(anteriorColumn === 0) anteriorColumn = totalColumn
        if(maxColumn === 0) {
          maxColumn = totalColumn
          totalRow -= 1
        }

        //Jump line
        if(
          anteriorRow === totalRow && 
          anteriorColumn === totalColumn && 
          maxColumn === totalColumn
        ){
          interpolation(
            div,
            (width/2) - (divWidth/2) + (.1 * window.innerWidth),
            height + (.1 * window.innerHeight) - 20,
            200
          )
          
        //After the anterior when the row is complete
        } else if(
          (
            anteriorRow < totalRow && 
            anteriorColumn < totalColumn
          ) || 
          (
            anteriorRow === totalRow && 
            anteriorColumn < totalColumn &&
            maxColumn === totalColumn
          )
        ) {
          let leftPos = navArray[newPos - 1].offsetLeft + 200

          if(button.id === 'nav-addbutton') 
            leftPos = navArray[newPos - 1].offsetLeft + 160

          button.className += ' button-trans-right'
  
          interpolation(
            div,
            leftPos,
            navArray[newPos - 1].offsetTop,
            200
          )
        //Before the posterior when the row is incomplete
        } else if(
          (
            anteriorRow === totalRow - 1 && 
            anteriorColumn === totalColumn &&
            maxColumn < totalColumn
          ) || 
          (
            anteriorRow === totalRow && 
            anteriorColumn === totalColumn && 
            maxColumn < totalColumn
          )
        ){
          let leftPos = navArray[newPos].offsetLeft - 100
          let pos = newPos

          if(button.id === navArray[newPos].id || newPos === oldPos){
            leftPos = navArray[newPos + 1].offsetLeft - 100
            pos += 1
          }

          navArray[pos].className += ' button-trans-left'
          button = navArray[pos]
  
          interpolation(
            div,
            leftPos,
            navArray[pos].offsetTop,
            200
          )
        
        //Before the posterior when the row is complete
        } else if(
          (
            anteriorRow <= totalRow - 1 && 
            anteriorColumn === totalColumn
          ) || 
          (
            anteriorRow === totalRow && 
            anteriorColumn < totalColumn && 
            maxColumn === totalColumn
          )
        ) {
          let pos = newPos + 1
          let addPos = 0

          if(newPos !== oldPos) pos = newPos 

          navArray[pos].className += ' button-trans-left'
          button = navArray[pos]
  
          interpolation(
            div,
            navArray[pos].offsetLeft + addPos,
            navArray[pos].offsetTop,
            200
          )
        //After the anterior when the row is incomplete
        } else {
          let addPos = 100

          if(button.id === 'nav-addbutton')
            addPos = 60

          button.className += ' button-trans-right'
  
          interpolation(
            div,
            button.offsetLeft + addPos,
            button.offsetTop,
            200
          )
        }
        return button
      }
      
      setTimeout(() => button = whereNext())
      setTimeout(() => {
        button.className = 'button folderbutton'
  
        div.style.position = 'relative'
        div.style.top = 'auto'
        div.style.left = 'auto'
        div.style.zIndex = 1
      }, 200)
    }

    mouseEvent = false
  })

  if(state.folder[0] !== undefined && state.folder[0].content === null) 
    state.folder.shift()
  state.folder.push({content: []})

  nav.appendChild(div)
  input.focus()

  if(mainAddbutton.className.indexOf('button-deactivated') !== -1)
    mainAddbutton.className = mainAddbutton.className.slice(0,
      mainAddbutton.className.indexOf('button-deactivated')
    )

  if(div) div.className = div.className.slice(0,
    div.className.indexOf('button-deactivated')
  )
}
const onArticleFunc = ({item, changeState}) => {
  const oldNote = document.getElementById(state.currentNote)
  const article = document.createElement('article')
  const delButton = document.createElement('button')
  const delButtonH3 = document.createElement('h3')
  const delButtonH3Text = document.createTextNode('X')
  const input = document.createElement('input')
  let delEvent

  delButtonH3.appendChild(delButtonH3Text)
  delButton.className = 'removebutton'
  delButton.appendChild(delButtonH3)
  
  input.value = item
  
  article.id = content.children.length !== 0?
  `article-${Number(content.lastElementChild.id.slice(8)) + 1}`:
  'article-0'
  if(changeState)
    article.className = 'button button-selected button-deactivated'
  else{
    article.className = 'button'
  }
  article.appendChild(delButton)
  article.appendChild(input)
  
  if (oldNote) {
    const lastNote = Array.from(content.children)[content.children.length - 1]
    
    oldNote.className = 'button'
    lastNote.className = 'button'
    
    if(Array.from(lastNote.children)[1].value === ''){
      const i = navIndex(state.currentFolder) - 1
      const lastNoteEl = document.getElementById(lastNote.id)
      
      state.folder[i].content.pop()
      content.removeChild(lastNoteEl)
    }
  }

  delButton.addEventListener('click', e => {
    const i = navIndex(state.currentFolder) - 1
    delEvent = e
    
    state.folder[i] = {
      content: state.folder[i].content.filter((item, index) => 
        index !== contentIndex(article.id) 
      )
    }

    state.currentNote = ''
    article.className += ' button-deactivated'

    setTimeout(() =>  content.removeChild(article), 200)
  })
  article.addEventListener('click', () => {
    if(!delEvent){
      let oldNote
      
      if(state.currentNote !== '')
        oldNote = document.getElementById(state.currentNote)
      else {
        article.className = 'button button-selected'
        state.currentNote= article.id
      } 
      
      if (oldNote && oldNote.id !== article.id) {
        const lastNote = Array.from(content.children)[content.children.length - 1]
        
        article.className = 'button button-selected'
        oldNote.className = 'button'
  
        state.currentNote= article.id
  
        if(Array.from(lastNote.children)[1].value === ''){
          const i = navIndex(state.currentFolder) - 1
          const lastNoteEl = document.getElementById(lastNote.id)
          
          state.folder[i].content.pop()
          content.removeChild(lastNoteEl)
        }
      }
    }
  })
  input.addEventListener('keydown', e => {
    const i = navIndex(state.currentFolder) - 1
    const j = contentIndex(article.id)

    if(e.key.length === 1)
      state.folder[i].content[j] = input.value + e.key
    else state.folder[i].content[j] = input.value
  })
  
  state.currentNote = article.id
  
  content.appendChild(article)
  input.focus()
  
  if(changeState){
    state.folder[navIndex(state.currentFolder) - 1].content.push(input.value)
    
    article.className = article.className.slice(0,
      article.className.indexOf('button-deactivated')
    )
  }
}

navAddbutton.addEventListener('click', onFolderFunc)
mainAddbutton.addEventListener('click', () => onArticleFunc({item: null, changeState: true}))