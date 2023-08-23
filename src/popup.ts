import browser from "webextension-polyfill";
import { FormItem, MSG_TYPE } from "./enum";


const datas = new Set<FormItem>()

/**
 * 生成dom工具函数
 * @param info 
 * @returns 
 */
const genderInfoItem = (info: FormItem) => {
    return `
    <div class="info-item" >
    <div class="info-item-left">
      <div class="toggle-switch">
        <label class="switch">
          <input type="checkbox" ${info.status === 1 ? 'checked' : ''}  class="info-status">
          <span></span>
        </label>
      </div>
    </div>
    <div class="info-item-center">
      <div class="web-icon">
        <img src="${info.icon}" alt="">
      </div>
      <div class="web-title">${info.title}</div>

    </div>
    <div class="info-item-right">
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12L31 24L19 36" stroke="currentColor" stroke-width="4" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
    </div>
  </div>
    `
}

/**
 * 绑定状态事件
 */
const bindStatusEvent = () => {
    const statusEls = document.querySelectorAll('.info-status')
    statusEls.forEach((el) => {
        el.addEventListener('change', () => {
            const status = (el as HTMLInputElement).checked ? 1 : 0
            const index = Array.from(statusEls).indexOf(el)
            const item = Array.from(datas)[index]
            item.status = status
            setData()
        })
    })
}


/**
 * 解析数据到popup
 */
const parseToPopup = () => {
    const domItems = Array.from(datas).map((item) => {
        return genderInfoItem(item)
    })
    const dom = document.querySelector('.content-box')
    if (dom) {
        dom.innerHTML = domItems.join('')
    }
    bindStatusEvent()
}



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
    parseToPopup()

}

initData()

const bindBtnEvent = () => {
    const importBtn = document.querySelector('#importBtn')
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            // 选择文件上传
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'application/json'
            input.click()
            input.addEventListener('change', (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (!file) {
                    return
                }
                const reader = new FileReader()
                reader.readAsText(file)
                reader.onload = () => {
                    const { id, data } = JSON.parse(reader.result as string)
                    if (id !== browser.runtime.id) {
                        importBtn.innerHTML = '数据格式有误 😅'
                        setTimeout(() => {
                            importBtn.innerHTML = '导入JSON'
                        }, 3000);
                        return
                    }
                    if (data.length === 0) {
                        importBtn.innerHTML = '数据为空 🧐'
                        setTimeout(() => {
                            importBtn.innerHTML = '导入JSON'
                        }, 3000);
                        return
                    }
                    data.forEach((item: FormItem) => {
                        const has = Array.from(datas).find((dataItem) => dataItem.url === item.url)
                        if (has) {
                            datas.delete(has)
                        }
                        datas.add(item)
                    })
                    parseToPopup()
                    setData()
                    importBtn.innerHTML = '导入成功 👏'
                    setTimeout(() => {
                        importBtn.innerHTML = '导入JSON'
                    }, 3000);
                }
            })
        })
    }
    const exportBtn = document.querySelector('#exportBtn')
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            //   调出文件选择框
            console.log('导出JSON数据')
            // 读取chrome插件ID

            const exportData = JSON.stringify({
                id: browser.runtime.id,
                export_at: new Date().getTime(),
                data: [...datas]
            })
            const blob = new Blob([exportData], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `fuck_the_form_${new Date().getTime()}.json`
            a.click()
            a.remove()

        })
    }
}

bindBtnEvent()

// 接收来自backgound的message


