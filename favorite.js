const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users";
const users = JSON.parse(localStorage.getItem('favoriteFriends'));
const dataPanel = document.querySelector("#data-panel");

const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
let filteredUsers = []

const USERS_PER_PAGE = 30
const paginator = document.querySelector("#pagination")

// function section

function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}


paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderUserList(getUsersByPage(page))
})

function renderUserList(data) {
  let rawHTML = "";
  data.forEach((user) => {
    rawHTML += `
      <div class="col-sm-2">
        <div class="mb-3">
          <div class="card">
            <img
              src="${user.avatar}"
              class="card-img-top mx-auto mt-3" alt="User Avatar" data-toggle="modal"/>
            <div class="card-body">
              <p class="card-title">${user.name}  ${user.surname}</p>
              <a href="#" class="btn btn-primary" id="btn-show-info" data-toggle="modal" data-target="#info-modal" data-id="${user.id}">info</a>
              <a href="#" class="btn btn-secondary" id="btn-remove-favorite" data-id="${user.id}">x</a>
            </div>
          </div>
        </div>
      </div >
      `;
  });
  dataPanel.innerHTML = rawHTML;
}

function showUserModal(id) {
  const modalTitle = document.querySelector("#modal-title");
  const modalImage = document.querySelector("#modal-img");
  const modalDescription = document.querySelector("#modal-description");

  const user = users.find((user) => user.id === id)
  modalTitle.innerText = `${user.name} ${user.surname}`;
  modalImage.src = `${user.avatar}`;

  // 用條件式分別置入男女圖示
  if (user.gender === 'male') {
    modalDescription.innerHTML = `<p><i class="fas fa-male mr-3"></i>${user.gender}</p>`
  } else {
    modalDescription.innerHTML = `<p><i class="fas fa-female mr-3"></i></i>${user.gender}</p>`
  }

  modalDescription.innerHTML += `
      <p><i class="fas fa-baby mr-3"></i>${user.birthday}</p>    
      <p><i class="fas fa-address-card mr-3"></i>${user.age} years old</p>
      <p><i class="fas fa-map-marker-alt mr-3"></i>${user.region}</p>
      <p><i class="fas fa-envelope mr-3"></i>${user.email}</p>
    `;
}

function removeFromFavorite(id) {
  const data = filteredUsers.length ? filteredUsers : users
  const dataIndex = data.findIndex((user) => user.id === id)   //透過 id 找到要刪除的 index
  if (dataIndex === -1) return
  data.splice(dataIndex, 1)   //刪除該筆資料
  localStorage.setItem('favoriteFriends', JSON.stringify(data))    //存回 local storage

  //刪除 user 後，仍停留在同一分頁
  const page = Math.ceil((dataIndex + 1) / USERS_PER_PAGE)
  // console.log(userIndex)
  renderUserList(getUsersByPage(page))
  renderPaginator(data.length)
}


// 主程式
renderPaginator(users.length)
renderUserList(getUsersByPage(1));

// 監聽 data panel
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches("#btn-show-info")) {
    showUserModal(Number(event.target.dataset.id));   // id 為字串，需轉成數字
  } else if (event.target.matches('#btn-remove-favorite')) {
    // event.preventDefault()    //阻止頁面回到頂端
    removeFromFavorite(Number(event.target.dataset.id))   // id 為字串，需轉成數字
  }
})

//監聽搜尋表單
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  //姓名分開搜尋
  const searchName = users.filter((user) =>
    user.name.toLowerCase().includes(keyword)
  )
  const searchSurname = users.filter((user) =>
    user.surname.toLowerCase().includes(keyword)
  )

  //結合兩個陣列
  searchSurname.forEach((surname) => {
    if (!searchName.some((name) => name.id === surname.id)) {
      searchName.push(surname)
    }
  })

  filteredUsers = searchName

  if (filteredUsers.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的朋友`)
  }

  renderPaginator(filteredUsers.length)
  renderUserList(getUsersByPage(1))
})
