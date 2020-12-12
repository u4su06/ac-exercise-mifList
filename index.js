const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users";
const users = [];
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
  let rawHTML = ''
  data.forEach((user) => {
    rawHTML += `
      <div class="col-sm-2">
        <div class="mb-3">
          <div class="card">
            <img
              src="${user.avatar}"
              class="card-img-top mx-auto mt-3" alt="User Avatar" data-toggle="modal"/>
            <div class="card-body">
              <p class="card-title px-auto">${user.name}  ${user.surname}</p>
              <a href="#" class="btn btn-primary" id="btn-show-info" data-toggle="modal" data-target="#info-modal" data-id="${user.id}">info</a>
              <a href="#" class="btn btn-danger" id="btn-add-favorite" data-id="${user.id}">+</a>
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

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteFriends')) || []
  const user = users.find((user) => user.id === id)

  if (list.some((user) => user.id === id)) {
    return alert('這位朋友已在最愛名單中！')
  }

  list.push(user)
  localStorage.setItem('favoriteFriends', JSON.stringify(list))
}


// 主程式
axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results);
    renderPaginator(users.length)
    renderUserList(getUsersByPage(1));
    // console.log(response.data.results);
    // console.log(users);
  })
  .catch((err) => console.log(err));

// 監聽 data panel
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches("#btn-show-info")) {
    showUserModal(Number(event.target.dataset.id));   // id 為字串，需轉成數字
  } else if (event.target.matches('#btn-add-favorite')) {
    event.preventDefault()    //阻止頁面跳到頂端
    addToFavorite(Number(event.target.dataset.id))   // id 為字串，需轉成數字
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
