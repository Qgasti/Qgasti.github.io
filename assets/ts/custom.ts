// Put this file in your site at assets/ts/custom.ts
// The theme will build & include this automatically if present.

document.addEventListener('DOMContentLoaded', function () {
  // 常見可能的搜尋 input selector（視你的 theme 改）
  const selectors = [
    'input[name*="keyword"]'
  ];

  // 找到第一個存在的 input
  let input = null;
  for (const s of selectors) {
    input = document.querySelector(s);
    if (input) break;
  }
  if (!input) return;

  try {
    // 防止瀏覽器 autocomplete / autofill
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'true');

    // 改變 name（有些瀏覽器會忽略 autocomplete="off"，改名能降低自動存取）
    if (input.name && !/nohistory/.test(input.name)) {
      try { input.name = 'search_nohistory_' + Date.now(); } catch(e) {}
    }

    // 移除 datalist 來源（若存在）
    const listId = input.getAttribute('list');
    if (listId) {
      input.removeAttribute('list');
      const dl = document.getElementById(listId);
      if (dl && dl.parentNode) dl.parentNode.removeChild(dl);
    }

    // 在 focus 時清空先前自動填入（視需要）
    input.addEventListener('focus', function () {
      // 清空 value 但保留使用者之前手動輸入（如果不想清也可移除這段）
      // this.value = '';
      this.setAttribute('autocomplete', 'off');
    });

    // 清掉 site/template 可能用到的 local/session storage keys
    const possibleKeys = [
      'searchHistory', 'recentSearches', 'stack_search_history',
      'site_search_history', 'search_cache', 'search_suggestions'
    ];
    possibleKeys.forEach(k => {
      try { localStorage.removeItem(k); } catch(e) {}
      try { sessionStorage.removeItem(k); } catch(e) {}
    });

    // 隱藏任何現有的建議下拉（如果 template 用 client-side 建議 list）
    const hideSuggestionContainers = () => {
      const candidates = document.querySelectorAll('.autocomplete, .tt-menu, .search-suggestions, .search-result--list');
      candidates.forEach((el) => {
        try { (el as HTMLElement).style.display = 'none'; } catch(e){}
      });
    };
    // 嘗試一開始就隱藏
    hideSuggestionContainers();

    // 若第三方 plugin 在頁面載入後建立建議清單，觀察 DOM 並隱藏新增的建議節點
    const observer = new MutationObserver((mutations) => {
      hideSuggestionContainers();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 如果 site 使用 window 搜尋相關的全域變數/函式（例如某些插件），可在這裡覆寫或清空
    try {
      // 範例：若 theme 暴露 window.recentSearches，清除之
      if (window.hasOwnProperty('recentSearches')) {
        // @ts-ignore
        window['recentSearches'] = [];
      }
    } catch(e){}

  } catch (e) {
    // 忽略任何錯誤
    console.error('custom search tweaks error', e);
  }
});