import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root){
    this.root = document.querySelector(root)
    this.tbody = document.querySelector("table tbody")
    this.load()
  }

  load(){
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || []
  }

  save(){
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))
  }

  async add(username){
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists){
        throw new Error("Utilizador já existe nos favoritos!")
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined){
        throw new Error("Utilizador não encontrado!")
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(userToDelete){
    const filteredEntries = this.entries.filter(user => userToDelete.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
    this.validateExistsFavorites()
  }
}

export class FavoritesView extends Favorites{
  constructor(root){
    super(root)
    this.update()
    this.onadd()
    this.validateExistsFavorites()
  }

  onadd(){
    const addButton = this.root.querySelector(".search button")
    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input")
      this.add(value)
    }
  }

  update(){
    this.removeAllTr()

    this.entries.forEach( user => {
      const row = this.createRow()
      row.querySelector(".user img").src = `https://github.com/${user.login}.png`
      row.querySelector(".user img").alt = `Image de ${user.name}`
      row.querySelector(".user a").href = `https://github.com/${user.login}`
      row.querySelector(".user p").textContent = user.name
      row.querySelector(".user span").textContent = user.login
      row.querySelector(".repositories").textContent = user.public_repos
      row.querySelector(".followers").textContent = user.followers

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Tem a certeza que deseja apagar essa linha?")

        if(isOk){
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow(){
    const tr = document.createElement("tr")

    tr.innerHTML = `
        <td class="user">
          <img src="https://github.com/maykbrito.png" alt="Imagem de Mayk Brito">
          <a href="https://github.com/maykbrito" target="_blank">
              <p>Mayk Brito</p>
              <span>/maykbrito</span>
          </a>
        </td>
        <td class="repositories">
            123
        </td>
        <td class="followers">
            1234
        </td>
        <td class="action">
            <button class="remove">
                Remover
            </button>
        </td>
    `

    return tr
  }

  removeAllTr(){
    this.tbody.querySelectorAll("tr")
      .forEach((tr) => {
        tr.remove()
      })
  }

  validateExistsFavorites(){
    if(this.entries.length < 1){
        let trNoFavorites = this.createNoFavoritesTr()

        this.tbody.append(trNoFavorites)
    }
  }

  createNoFavoritesTr(){
    let trNoFavorites = document.createElement("tr")

    trNoFavorites.innerHTML = `
        <td colspan="4">
            <div id="no-favorites">
                <img src="./assets/Estrela.svg" alt="Não existem favoritos">
                <span>
                    Ainda não existem favoritos
                </span>
            </div>
        </td> 
    `

    return trNoFavorites
  }
}