import{useEffect as f,useLayoutEffect as c}from"react";import{env as i}from'../utils/env.js';let n=(e,t)=>{i.isServer?f(e,t):c(e,t)};export{n as useIsoMorphicEffect};
