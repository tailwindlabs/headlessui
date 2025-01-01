import{onUnmounted as o,shallowRef as r}from"vue";function s(t){let e=r(t.getSnapshot());return o(t.subscribe(()=>{e.value=t.getSnapshot()})),e}export{s as useStore};
