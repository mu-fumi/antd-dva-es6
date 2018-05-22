module.exports = {
  "@font-family-no-number": '"Chinese Quote", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
  "@font-family": '"Monospaced Number",  @font-family-no-number',
  "@blue-6": "#0FACF3",
  "@green-6": "#2ECC71",
  "@red-6": "#E74C3C",
  "@yellow-6": "#F1C40F",
  "@navy-6": "#3c4859",

  "@grey-1": "color(~`colorPalette(\"@{grey-6}\", 1)`)",
  "@grey-2": "color(~`colorPalette(\"@{grey-6}\", 2)`)",
  "@grey-3": "color(~`colorPalette(\"@{grey-6}\", 3)`)",
  "@grey-4": "color(~`colorPalette(\"@{grey-6}\", 4)`)",
  "@grey-5": "color(~`colorPalette(\"@{grey-6}\", 5)`)",
  "@grey-6": "#9facbd",
  "@grey-7": "color(~`colorPalette(\"@{grey-6}\", 7)`)",
  "@grey-8": "color(~`colorPalette(\"@{grey-6}\", 8)`)",
  "@grey-9": "color(~`colorPalette(\"@{grey-6}\", 9)`)",
  "@grey-10": "color(~`colorPalette(\"@{grey-6}\", 10)`)",

  "@normal-color": "@grey-6",

  "@icon-url" : '"/fonts/ant-font"',

  "@background-color-base" : "#f4f7f9",
  "@font-size-base": "14px",
  "@font-size-sm": "12px",
  "@font-size-xm": "10px",
  "@gutter-base": "8px",

  "@border-color-base" : "@grey-6",
  "@border-color-split" : "@grey-4",
  "@border-color-old" : "#e9e9e9",  // 任务详情表格
  "@border-radius-base":"2px",
  "@border-base":"1px solid @border-color-base",
  "@table-border-solid":"1px solid #d9d9d9",   // processlist.less中也有个table-border，所以这个加个solid，已修改相关引用
  "@table-border-dotted":"1px dotted #d9d9d9",


  // Layout
  "@layout-gutter-base"    : "@gutter-base * 3",
  "@layout-header-height"      : "@gutter-base * 7",
  "@layout-content-header-height"      : "@gutter-base * 8",
  "@layout-body-background"      : "@background-color-base",
  "@layout-header-background"    : "@navy-6",

  "@layout-header-padding"    : "0 @layout-gutter-base",


  "@layout-sider-width" : "220px",

  // Buttons
  "@btn-height-base":"32px",
  "@btn-height-lg":"36px",
  "@btn-height-sm":"26px",


  // Input
  // ---
  "@input-height-base":"32px",
  "@input-height-lg":"36px",
  "@input-height-sm":"26px",
  "@input-width-base":"100px",

  // Select
  // ---
  "@select-height-base":"32px",
  "@select-height-lg":"36px",
  "@select-height-sm":"26px",
  "@select-width-base":"100px",
  "@select-border":"1px solid #9facbd",
  "@select-label-color":"fade(#000, 85%)",


  // Scrollbar
  // ---
  "@scrollbar-background-color":"#bfbfbf",

  // Modal
  // --
  "@modal-width-base":"500px"


}
