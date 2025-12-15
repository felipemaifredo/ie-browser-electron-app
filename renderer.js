const tabsBar = document.getElementById("tabs-bar")
const newTabBtn = document.getElementById("new-tab-btn")
const webviewsContainer = document.getElementById("webviews-container")
const urlInput = document.getElementById("url")
const backBtn = document.getElementById("back")
const forwardBtn = document.getElementById("forward")
const reloadBtn = document.getElementById("reload")

const winBtnMin = document.getElementById("min-btn")
const winBtnMax = document.getElementById("max-btn")
const winBtnClose = document.getElementById("close-btn")

const itemsContainer = document.querySelector(".items_container")

let tabs = []
let activeTabId = null
let hideTimeout = null

// Auto-hide da barra superior
let isMouseOverBar = false

function showTopBar() {
  itemsContainer.classList.add("visible")
  clearTimeout(hideTimeout)
}

function hideTopBar() {
  if (!isMouseOverBar) {
    itemsContainer.classList.remove("visible")
  }
}

function scheduleHideTopBar() {
  clearTimeout(hideTimeout)
  hideTimeout = setTimeout(hideTopBar, 2000)
}

// Mostrar barra ao mover mouse para o topo
document.addEventListener("mousemove", (e) => {
  if (e.clientY <= 3) {
    showTopBar()
  } else if (e.clientY > 55 && !isMouseOverBar) {
    scheduleHideTopBar()
  }
})

// Manter visível quando mouse está sobre a barra
itemsContainer.addEventListener("mouseenter", () => {
  isMouseOverBar = true
  showTopBar()
})

itemsContainer.addEventListener("mouseleave", () => {
  isMouseOverBar = false
  scheduleHideTopBar()
})

// Mostrar inicialmente visível
itemsContainer.classList.add("visible")

// Esconder após 3 segundos
setTimeout(() => {
  scheduleHideTopBar()
}, 3000)

function createTab(url) {
  const id = Date.now().toString()

  // Cria container da aba (div, não button!)
  const tabButton = document.createElement("div")
  tabButton.classList.add("tab")
  tabButton.dataset.id = id

  // Título da aba
  const titleSpan = document.createElement("span")
  titleSpan.classList.add("tab-title")
  titleSpan.textContent = url

  // Botão de fechar
  const closeBtn = document.createElement("button")
  closeBtn.classList.add("tab-close")
  closeBtn.textContent = "×"

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    closeTab(id)
  })

  // Clica no título ativa a aba
  tabButton.addEventListener("click", (e) => {
    if (e.target.closest(".tab-close")) return // não ativa se clicou no X
    setActiveTab(id)
  })

  tabButton.appendChild(titleSpan)
  tabButton.appendChild(closeBtn)
  tabsBar.insertBefore(tabButton, newTabBtn)

  // Cria webview para a aba
  const webview = document.createElement("webview")
  webview.src = url
  webview.dataset.id = id
  webview.style.width = "100%"
  webview.style.height = "100dvh"
  webview.style.marginTop = "8px"
  webview.style.display = "none" // começa escondido
  webviewsContainer.appendChild(webview)

  // Atualiza o título da aba ao navegar
  webview.addEventListener("did-navigate", (e) => {
    if (e.url && e.url.length > 0) {
      titleSpan.textContent = e.url
      if (id === activeTabId) {
        urlInput.value = e.url
      }
    }
  })

  // Armazena a aba
  tabs.push({ id, tabButton, webview })

  // Define esta aba como ativa
  setActiveTab(id)
}

function setActiveTab(id) {
  activeTabId = id
  tabs.forEach(({ id: tabId, tabButton, webview }) => {
    const isActive = tabId === id
    tabButton.classList.toggle("active", isActive)
    webview.style.display = isActive ? "flex" : "none"
    if (isActive) {
      urlInput.value = webview.getURL()
    }
  })
}

function closeTab(id) {
  const tabIndex = tabs.findIndex(t => t.id === id)
  if (tabIndex === -1) return

  const { tabButton, webview } = tabs[tabIndex]
  tabButton.remove()
  webview.remove()
  tabs.splice(tabIndex, 1)

  if (activeTabId === id) {
    const nextTab = tabs[tabIndex] || tabs[tabIndex - 1]
    if (nextTab) {
      setActiveTab(nextTab.id)
    } else {
      activeTabId = null
      urlInput.value = ""
    }
  }
}

// Navegar no webview da aba ativa
function loadURL(url) {
  const tab = tabs.find(t => t.id === activeTabId)
  if (!tab) return

  let finalURL = url.trim()
  if (!finalURL.startsWith("https://") && !finalURL.startsWith("http://")) {
    const query = encodeURIComponent(finalURL)
    finalURL = `https://www.google.com/search?q=${query}`
  }

  tab.webview.loadURL(finalURL)
  urlInput.value = finalURL
}

urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    loadURL(urlInput.value)
  }
})

backBtn.addEventListener("click", () => {
  const tab = tabs.find(t => t.id === activeTabId)
  if (tab && tab.webview.canGoBack()) tab.webview.goBack()
})

forwardBtn.addEventListener("click", () => {
  const tab = tabs.find(t => t.id === activeTabId)
  if (tab && tab.webview.canGoForward()) tab.webview.goForward()
})

reloadBtn.addEventListener("click", () => {
  const tab = tabs.find(t => t.id === activeTabId)
  if (tab) tab.webview.reload()
})

// Botão para nova aba
newTabBtn.addEventListener("click", () => {
  createTab("https://blocks-app-sage.vercel.app/")
})

winBtnMin.addEventListener("click", () => {
  window.electronAPI.minimize()
})

winBtnMax.addEventListener("click", () => {
  window.electronAPI.maximize()
})

winBtnClose.addEventListener("click", () => {
  window.electronAPI.close()
})

// Inicia com uma aba
createTab("https://blocks-app-sage.vercel.app/")