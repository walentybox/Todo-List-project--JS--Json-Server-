"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const btnCreateTask = document.querySelector(".todo-box__btn-create-task"),
    instaForm = document.getElementById("post-pic"),
    inputTask = document.querySelector(".todo-box__input"),
    incomplTasksList = document.querySelector(".all-incomplete-tasks__list"),
    complTasksList = document.querySelector(".all-complete-tasks__list"),
    popup = document.querySelector(".popup"),
    inputPopup = document.querySelector(".popup__input"),
    btnSavePopup = document.querySelector(".popup__btn-save"),
    allBtnsEdit = document.getElementsByClassName("class-btn-edite");
  let activeAttribute = null,
    checkbox1 = null,
    id = null;
  const baseUrl = "http://localhost:3000/";
  const headers = { "Content-Type": "application/json" };



  async function useFetch(url, method = "GET", data = null) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
      });

      if (!response.ok) {
        throw new Error("We get Error");
      }

      return await response.json();
    } catch (err) {
      console.error(err);
    }
  }
  function bindEvents(elements, eventName, callback) {
    elements.forEach((element) => {
      element.addEventListener(eventName, callback);
    });
  }


  async function loadJson() {

    console.log(baseUrl + "posts");
    const data = await useFetch(baseUrl + "posts");
    console.log(data);
    renderItems(data);
  }


  function renderItems(items) {
	console.log(items)
    items.forEach((item) => {
      id = item.id;
      let task = document.createElement("li");
      task.setAttribute("data-id", id);
      task.innerHTML = `<input id ="checkbox-${id}" class="checkbox" type ="checkbox" checked><label for="checkbox-${id}"></label><p id ="${id}">${item.post}</p> <div class="li-btns"><button type="submit" class="class-btn-edite">Edit</button> <button type="submit" class="class-btn-delete">Delete</button></div>`;


      if (item.checked == "true") {
        incomplTasksList.append(task);
      } else {
        complTasksList.append(task);
      }
    });
    console.log("function renderItems");
  }

  function createItem(e) {
    e.preventDefault();
    let instaFormData = new FormData(instaForm);
    useFetch(baseUrl + "posts", "POST", {
      post: inputTask.value,
      checked: "true",
    });

    useFetch(baseUrl + "posts", "POST", instaFormData);
    console.log("function createItem");
  }

  btnCreateTask.addEventListener("click", createItem);

  function eventDelete() {
    const btnsDelete = document.getElementsByClassName("class-btn-delete");
    const spread = [...btnsDelete];
    bindEvents(spread, "click", (e) => {
      if (e.target) {
        e.preventDefault();
        const id =
          e.target.parentElement.previousElementSibling.getAttribute("id");
        e.target.parentElement.parentElement.remove();
        useFetch(baseUrl + `posts/${id}`, "DELETE");

        deleteKeyLocalStorage(e.target);
      }
    });
    console.log("function eventDelete");
  }

  function deleteKeyLocalStorage(key) {
    const deleteKey =
      key.parentElement.parentElement.firstElementChild.getAttribute("id");
    localStorage.removeItem(deleteKey);
  }

  function editEvent() {
    const spread = [...allBtnsEdit];

    bindEvents(spread, "click", (e) => {
      popup.classList.add("popup__activedisplay");
      inputPopup.value =
        e.target.parentElement.previousElementSibling.textContent;
      activeAttribute =
        e.target.parentElement.previousElementSibling.getAttribute("id");
      checkbox1 = e.target.parentElement.parentElement.firstChild;
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    });
    console.log("function editEvent");
  }

  const closePopup = document.querySelector(".popup__close");

  closePopup.addEventListener("click", () => {
    popup.classList.remove("popup__activedisplay");
    document.body.style.overflow = "";
    console.log("closePopup");
  });

  btnSavePopup.addEventListener("click", () => {
    if (checkbox1.checked) {
      useFetch(baseUrl + `posts/${activeAttribute}`, "PUT", {
        post: inputPopup.value,
        checked: "true",
      });
    } else {
      useFetch(baseUrl + `posts/${activeAttribute}`, "PUT", {
        post: inputPopup.value,
        checked: "false",
      });
    }
    console.log("btnSavePopup");
  });

  async function putData(url = baseUrl, data = {}) {
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  function storage() {
    const check = document.getElementsByClassName("checkbox");
    console.log(check);

    [...check].forEach((el) => {
      for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        let value = localStorage.getItem(key);

        if (el.getAttribute("id") == key) {
          if (value == "true") {
            el.checked = true;
          } else {
            el.checked = false;
          }
          el.setAttribute(key, value);
        }
      }
    });
    changeLocalStorage([...check]);
  }

  function changeLocalStorage(item) {
    item.forEach((el) => {
      el.addEventListener("click", () => {
        if (el.checked) {
          localStorage.setItem(el.getAttribute("id"), true);
        } else {
          localStorage.setItem(el.getAttribute("id"), false);
        }
      });
    });
  }

  function changeDbJson() {
    const check = document.getElementsByClassName("checkbox");
    const spread = [...check];

    bindEvents(spread, "click", (e) => {
      if (e.target) {
        e.preventDefault();
        const id = e.target.parentElement.getAttribute("data-id");
        const post =
          e.target.parentElement.lastElementChild.previousElementSibling
            .textContent;
        if (e.target.checked) {
          useFetch(baseUrl + `posts/${id}`, "PUT", {
            post: post,
            checked: "true",
          });
        } else {
          useFetch(baseUrl + `posts/${id}`, "PUT", {
            post: post,
            checked: "false",
          });
        }
      }
    });
  }

  (function () {
    document
      .querySelector("#textField")
      .addEventListener("keydown", function (e) {
        if (e.keyCode === 13) {
          console.log(this.value);
          createItem();
        }
      });
  })();

  loadJson()
    .then(function () {
      return eventDelete();
    })
    .then(function () {
      return editEvent();
    })
    .then(function () {
      return storage();
    })
    .then(function () {
      return changeDbJson();
    })
    .then(function () {
      console.log("Done!");
    });
});
