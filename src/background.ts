import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
});



const setData=async (item:any)=>{
  // 读取本地数据
    const {user_data}=await browser.storage.local.get('user_data')
    browser.storage.local.set({user_data:[...user_data||[],item]})
}


browser.tabs.onActivated.addListener((activeInfo)=>{
  // 当前激活页切换时触发
  browser.tabs.get(activeInfo.tabId).then((tab)=>{
    const url=tab.url
    const id=tab.id
    setData({url,id})
  })
})