import browser from "webextension-polyfill";
import { FormItem, MSG_TYPE } from './enum'
import { output } from "./utils";



const datas = new Set<FormItem>()

/**
 * 加载数据
 *
 * @return {*} 
 */
const loadData = async () => {
  const { forms } = await browser.storage.local.get('forms') as { forms: FormItem[] }
  if (!forms) {
    return []
  }
  return forms
}

const refreshData = async () => {
  const forms = await loadData()
  datas.clear()
  forms.forEach((form) => {
    datas.add(form)
  })
}

/**
* 保存数据
*
*/
const setData = () => {
  browser.storage.local.set({ forms: [...datas] })
}

const initData = async () => {
  const forms = await loadData()
  forms.forEach((form) => {
    datas.add(form)
  })
}


const getCurForm = async () => {
  const [curTab] = await browser.tabs.query({ active: true, currentWindow: true })
  await refreshData()
  output('curTab', curTab)
  if (curTab) {
    const { url } = curTab
    const form = Array.from(datas).find((item) => {
      return item.url === url
    })
    return form
  } else {
    output('获取当前tab失败')
    return null
  }
}
initData()
const initContextMenu = () => {
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    const { menuItemId, } = info
    // const { title, url, favIconUrl } = tab
    switch (menuItemId) {
      case 'login':
        {
          const form = await getCurForm()
          if (form) {
            browser.tabs.sendMessage(tab!.id!, {
              action: MSG_TYPE.FILL_FORM,
              data: form.forms
            })
          } else {
            output('没有找到匹配的表单')
          }
        }
        break
      case 'addForm': {
        browser.tabs.sendMessage(tab!.id!, {
          action: MSG_TYPE.GET_ELEMENT,
          type: 'username'
        })
      }
        break
      default:
        break
    }
  })
  browser.runtime.onInstalled.addListener(() => {
    // 新增右键菜单
    browser.contextMenus.create({
      title: "login",
      id: 'login'
    })
    browser.contextMenus.create({
      title: "添加到表单",
      contexts: ['editable'],
      id: 'addForm'
    })
  })
}
initContextMenu()


browser.runtime.onMessage.addListener(async (message) => {
  const { action } = message
  switch (action) {
    case MSG_TYPE.SELECTED_ELEMENT:
      {
        const { data } = message
        const [curTab] = await browser.tabs.query({ active: true, currentWindow: true })
        await refreshData()
        if (curTab) {
          const { url, title, favIconUrl } = curTab
          let form = Array.from(datas).find((item) => {
            return item.url === url
          })
          // form已存在
          if (form) {
            form.forms.push(data)
          } else {
            form = {
              url: url!,
              status: 1,
              created_at: new Date().getTime() + '',
              title: title!,
              icon: favIconUrl || '',
              forms: [data],
            }
          }
          datas.delete(form)
          datas.add(form)
          setData()
        }
      }
      break
    default:
      break
  }


})