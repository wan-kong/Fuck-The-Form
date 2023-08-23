export enum MSG_TYPE {
    GET_ELEMENT = 'getElement',
    SELECTED_ELEMENT = 'selectedElement',
    FILL_FORM = 'fillForm',
    ALART = 'alart',
    LOG = 'log'

}

export interface FormItem {
    /**
     * 匹配的URL
     */
    url: string
    icon: string
    /**
     * 状态 1：开启，0：关闭
     */
    status: 0 | 1
    /**
     * 表单项
     * match 匹配dom,
     * value 自动填充的值
     */
    forms: {
        match: string,
        value: string
    }[]
    /**
     * 标题
     */
    title: string,
    created_at: string
}