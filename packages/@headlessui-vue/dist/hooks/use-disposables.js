import{onUnmounted as s}from"vue";import{disposables as e}from'../utils/disposables.js';function i(){let o=e();return s(()=>o.dispose()),o}export{i as useDisposables};
