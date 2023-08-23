import browser from "webextension-polyfill";
import { MSG_TYPE } from "./enum";
import { output, getCssSelector } from "./utils";

// 监听来自background.js的消息
browser.runtime.onMessage.addListener((message) => {
    const { action } = message
    switch (action) {
        case MSG_TYPE.FILL_FORM:
            {
                // todo 填充表单
                const { data } = message
                if (data && data?.length > 0) {
                    data.forEach((form: any) => {
                        const { match, value } = form
                        const element = document.querySelector(match)
                        if (element) {
                            (element as HTMLInputElement).value = value
                            // 出发input事件
                            element.dispatchEvent(new Event('input'));
                        } else {
                            alert('没有找到匹配的元素')
                            output('没有找到匹配的元素')
                        }
                    })
                } else {
                    alert('获取表单数据失败')
                    output('获取表单数据失败,可能是forms不是数组或者forms为空')
                }
            }
            break
        case MSG_TYPE.GET_ELEMENT:
            {
                const inputElement = window.getSelection()?.focusNode?.parentElement?.querySelector('input')
                if (inputElement) {
                    const curValue = inputElement.value
                    if ((curValue ?? '') === '') {
                        alert('输入框内容为空')
                        output('输入框内容为空,请先输入内容')
                        return
                    }
                    const curSelector = getCssSelector(inputElement)
                    if (curSelector) {
                        browser.runtime.sendMessage({
                            action: MSG_TYPE.SELECTED_ELEMENT,
                            data: {
                                match: getCssSelector(inputElement),
                                value: curValue
                            }
                        })
                    }
                    else {
                        alert('获取元素selector失败 :< ')
                        output("生成selector失败了。。GG")
                    }
                } else {
                    alert('添加失败:<')
                    output('未匹配到输入框元素')
                }
            }
            break
        case MSG_TYPE.ALART:
            {
                const { data } = message
                alert(data)
            } break
        case MSG_TYPE.LOG:
            {
                const { data } = message
                output(...data)
            } break
        default:
            break

    }

});

output('content loaded')
