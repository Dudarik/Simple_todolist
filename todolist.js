class TodoListItem {
  constructor(textItem = '', iconItem = 0, dateItem = 0) {
    if (!dateItem) {
      dateItem = Date.now()
    }
    if (!textItem) {
      //textItem = 'Input text'
    }
    this.dateItem = dateItem
    this.textItem = textItem
    this.iconItem = Number(iconItem)
    this.checkedItem = false
  }
}

class TodoList {

  constructor(todolist, divID = 'list', sortBy = 0) {
    this.filterON = false
    this.filterIDX = -1

    if (localStorage.todolist) {
      this.loadFromLocalStorage()
    } else {

      if (divID) {
        this.divID = divID
      } else {
        this.divID = 'list'
      }

      if (!todolist) {
        this.todolist = []
      } else {
        this.todolist = todolist
      }

      this.sortBy = sortBy
    }
  }

  addListItem(listItem) {
    if (listItem instanceof TodoListItem) {
      if (!listItem.textItem) {
        this.printError()
        return
      }
      this.todolist.push(listItem)
      this.saveToLocalStorage()
      this.printList()
    } else {
      console.error('Error: no list item')
    }
  }

  loadFromLocalStorage() {
    let fromLocalStorage = JSON.parse(localStorage.todolist)
    this.divID = fromLocalStorage.divID
    this.todolist = fromLocalStorage.todolist
  }

  saveToLocalStorage() {
    localStorage.todolist = JSON.stringify(this)
  }

  deleteListItem(index) {
    this.todolist.splice(index, 1)
    this.saveToLocalStorage()
  }

  sortList(sortBy = 0) {
    // 0 - data, последнее добавленное в топе
    // 1 - data, последнее добавленное в низу

    if (sortBy == 1) {
      this.todolist.sort((a, b) => a.dateItem - b.dateItem)
    }

    if (sortBy == 0) {
      this.todolist.sort((a, b) => b.dateItem - a.dateItem)
    }
  }

  checkedItem() {
    let list = document.querySelector(`#${this.divID} ul`)

    list.addEventListener('click', ev => {


      if (ev.target.tagName != 'DIV') {

        let closestLi = ev.target.closest('LI')

        if (closestLi.classList.contains('checked')) {

          closestLi.classList.remove('checked')
          this.todolist[closestLi.getAttribute('dataTodoListItemID')].checkedItem = false

        } else {

          closestLi.classList.add('checked')
          this.todolist[closestLi.getAttribute('dataTodoListItemID')].checkedItem = true

        }
        this.saveToLocalStorage()
      }

    })
  }

  focusOnInput() {
    const myInput = document.getElementById('myInput')
    myInput.focus()
  }

  printList(divID = 0, sortBy = 0) {

    this.focusOnInput()

    if (divID) this.divID = divID

    this.sortList(sortBy)

    this.saveToLocalStorage()

    let result = '<UL>'

    let iconsItem = ['&#128512;', '&#128579;', '&#129488;', '&#129326;', '&#128584']

    for (let i = 0; i < this.todolist.length; i++) {

      const checked = this.todolist[i].checkedItem == true ? 'checked' : ''


      result += `
        <li dataTodoListItemID=${i} class="todolist__item ${checked}">
        <div dataTodoListIconIDX=${this.todolist[i].iconItem} class="iconitem">${iconsItem[this.todolist[i].iconItem]}</div>
        <h3 class="todolist__item-text">${this.todolist[i].textItem}</h3>
        <div class="todolist__datetime-wrappaer"><h4 class="todolist__item-date">${this.formatDate(this.todolist[i].dateItem)}</h4></div>
        <div class="close__wrapper"><div class="close">\u00D7</div></div></li>`
    }
    result += '</UL>'
    document.getElementById(this.divID).innerHTML = result

    let deleteButtons = document.querySelectorAll('#todolist .close')
    let filterButtons = document.querySelectorAll('#todolist .iconitem')


    for (let i = 0; i < deleteButtons.length; i++) {
      const deleteButton = deleteButtons[i]
      const filterButton = filterButtons[i]

      deleteButton.addEventListener('click', () => {

        const parentDeleteButton = deleteButton.parentElement.parentElement

        parentDeleteButton.style.opacity = 0
        parentDeleteButton.style.display = 'none'

        this.deleteListItem(parentDeleteButton.getAttribute('dataTodoListItemID'))

      })

      filterButton.addEventListener('click', () => {

        if (this.filterON == false) {
          this.filterON = true
          this.filterIDX = filterButton.getAttribute('dataTodoListIconIDX')
          let todoitems = document.getElementsByClassName('todolist__item')

          for (let i = 0; i < todoitems.length; i++) {
            const item = todoitems[i];

            if(item.firstElementChild.getAttribute('dataTodoListIconIDX') != this.filterIDX){
              item.style.display = 'none'
            }            
          }
          return
        }
        if (this.filterON) {
          this.filterON = false         
          this.printList()
        }

      })

    }

    this.checkedItem()
  }

  printError() {
    const error = document.querySelector('#myInput')
    let i = 0
    let h = setInterval(() => {
      i++
      error.classList.toggle('error')
      if (i == 7) {
        clearInterval(h)
        error.classList.remove('error')
        this.focusOnInput()
      }
    }, 300)

  }

  formatDate(date) {
    let diff = new Date() - date; 

    if (diff < 1000) { 
      return 'прямо сейчас';
    }

    let sec = Math.floor(diff / 1000);

    if (sec < 60) {
      return sec + ' сек. назад';
    }

    let min = Math.floor(diff / 60000);
    if (min < 60) {
      return min + ' мин. назад';
    }

    if (new Date().toLocaleDateString() == new Date(date).toLocaleDateString()) {
      let options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      };
      return `сегодня в ${new Date(date).toLocaleTimeString('RU-ru', options)}`
    }

    let d = new Date(date);
    d = [
      '0' + d.getDate(),
      '0' + (d.getMonth() + 1),
      '' + d.getFullYear(),
      '0' + d.getHours(),
      '0' + d.getMinutes()
    ].map(component => component.slice(-2));

    return d.slice(0, 3).join('.') + ' ' + d.slice(3).join(':');
  }
}

let myTodo = new TodoList

const addButton = document.querySelector('#todolistform .addBtn')
const addInput = document.querySelector('#todolistform #myInput')
const sorting = document.querySelector('#sorting')

// Переделать однозначно

addInput.addEventListener('keyup', ev => {
  if (ev.code === 'Enter') {
    let inputValue = document.querySelector('#myInput')
    let listIconItem = document.querySelector('#listIconItem')
    myTodo.addListItem(new TodoListItem(inputValue.value, listIconItem.value))
    inputValue.value = ''
  }
})

addButton.addEventListener('click', () => {
  let inputValue = document.querySelector('#myInput')
  let listIconItem = document.querySelector('#listIconItem')
  myTodo.addListItem(new TodoListItem(inputValue.value, listIconItem.value))
  inputValue.value = ''
})


// sorting.addEventListener('click', () => {
//   const sortfor = document.querySelector("[name='sortfor']")
// })



myTodo.printList()

// setInterval(() => {
//   myTodo.printList()
// }, 20000)
