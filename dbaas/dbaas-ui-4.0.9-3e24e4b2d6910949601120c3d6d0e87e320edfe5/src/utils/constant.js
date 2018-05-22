/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-04-18 15:41 $
 */

import { Input, InputNumber, Switch, Slider, Select } from 'antd'


// 全量/增量备份时间选项
let timeRange = [];
let timeRangeOptions = {};
for (let i=0; i<23; i++) {
    let timeStart = `0${i}:00`.slice(-5)
    let timeEnd = `0${i+1}:00`.slice(-5)
    timeRange.push(timeStart+"-"+timeEnd)
}
timeRange.push("23:00-00:00")
timeRange.forEach((value) => {
  timeRangeOptions[value] = String(Number(value.slice(0,2)))  // number会自动去掉开头的0，select选项value必须为string
});


module.exports = {
  DB_ENGINE: 'set',
  INSTANCES_OVERVIEW_UPDATE : 30 ,//单位S
  PASSWORD_COMPLEXITY : [
    {exp:/\d+/,msg:'密码必须有数字'},
    {exp:/([a-z])+/,msg:'密码必须有小写字母'},
    {exp:/([A-Z])+/,msg:'密码必须有大写字母'},
    {exp:6,msg:'密码不能少于6位'}
  ],
  // 删掉了'PROXY',
  PRIVILEGES: ['SELECT', 'INSERT', 'DELETE', 'UPDATE', 'DROP','ALTER', 'ALTER ROUTINE', 'CREATE', 'CREATE ROUTINE', 'CREATE TABLESPACE',
    'CREATE TEMPORARY TABLES', 'CREATE USER', 'CREATE VIEW', 'EVENT', 'EXECUTE', 'FILE', 'GRANT OPTION', 'INDEX', 'LOCK TABLES',
    'PROCESS', 'REFERENCES', 'RELOAD', 'REPLICATION CLIENT', 'REPLICATION SLAVE',  'SHOW DATABASES', 'SHOW VIEW', 'SHUTDOWN', 'SUPER',
    'TRIGGER'],
  GLOBAL_PRIVILEGES: ['CREATE TABLESPACE', 'CREATE USER', 'FILE', 'PROCESS', 'RELOAD', 'REPLICATION CLIENT', 'REPLICATION SLAVE', 'SHOW DATABASES',
    'SHUTDOWN', 'SUPER'],

  DATA_COMPARE_MODE: {
    '全部': '',
    '速度优先' : 1,
    '服务影响最小' : 2,
  },

  DATA_COMPARE_PROGRESS: {
    '全部': '',
    '对比中' : 0,
    '对比完成' : 1,
    '对比失败' : 2,
  },

  DATA_SYNC_PROGRESS: {
    '全部': '',
    '同步中' : 0,
    '同步完成' : 1,
    '同步失败' : 2,
  },

  DATA_SYNC_TO: {
    '全部': '',
    '主 --> 读' : 1,
    '读 --> 主' : 2,
  },

  BACKUP_DATA_PROGRESS: {
    '全部': '',
    '备份中' : 0,
    '备份完成' : 1,
    '备份失败' : 2,
  },

  PROGRESS:{
    'NOT_START': -1,  //未开始
    'PEDDING': 0, //执行中
    'FINISH': 1,  //完成
    'FATAL': 2, //失败
    'TIMEOUT': 3,  //超时
    'NOT_PASS' : -2, //未投递
  },

  INCRE_BACKUP_TYPE:{
    '累积增量': '0',
    // '差异增量': '1',
  },

  BACKUP_STORAGE_TYPE:{
    'NBU': '0',
    'SCP': '1',
    '本地': '2',
  },

  BACKUP_DAY:{
    '星期一': '1',
    '星期二': '2',
    '星期三': '3',
    '星期四': '4',
    '星期五': '5',
    '星期六': '6',
    '星期日': '0',
  },

  BACKUP_TIME:{
    ...timeRangeOptions
  },

  BACKUP_TOOL:{
    'mysqlbackup': '0',
    'xtrabackup': '1',
  },

  RESTORE_PROGRESS: {
    '全部': '',
    '恢复中' : 0,
    '恢复完成' : 1,
    '恢复失败' : 2,
  },

  RESTORE_TYPE: {
    "实例": 1,
    "库": 2,
    "表": 3
  },

  PROVIDER: {
    "mysql": 0,
    "set": 1
  },

  // 实例运行状态
  RUN_STATUS : {
    0 : "停止",
    1 : "运行"
  },

  // job_type 对应id
  JOB_TYPES : {
    "user" : 1, //创建用户
    "ssh" : 2, //ssh 信任
    "init" : 3, //初始化环境
    "zabbix" : 4, //部署 zabbix agent
    "zabbix_host" : 5, // 部署 zabbix 主机
    "health_full" : 6, // 实时检查
    "health_quick" : 7, // 一键检查
    "create_instance" : 8, // 创建实例
    "compare_tool" : 9, // 对比工具
    "backup_tool" : 10 //备份工具
  },

  // 性能分析排序
  SORTER_ORDER : {
    'ascend': '升序',
    'descend': '降序',
  },

  // 查询分析表格筛选列名与字段映射
  QUERY_ANALYSIS : {
    'query': '查询语句',
    'schema_name': '数据库',
    'exec_counts': '执行数',
    'err_counts': '错误数',
    'war_counts': '告警数',
    'total_latency': '总延迟',
    'max_latency': '最大延迟',
    'avg_latency': '平均延迟',
    'rows_affected': '总影响行数',
    'rows_affected_avg': '平均影响行数',
    'FIRST_SEEN': '首次出现时间'
  },

  // 文件表格筛选列名与字段映射
  FILE : {
    'file_name': '文件',
    'total_count': 'I/O 总数',
    'total_latency': 'I/O 总延迟',
    'avg_latency': '平均 I/O 延迟',
    'read_count': '读取 I/O 数',
    'read_latency': '读取 I/O 延迟',
    'write_count': '写入 I/O 数',
    'write_latency': '写入 I/O 延迟',
    'misc_count': 'MISC I/O 数',
    'misc_latency': 'MISC I/O 延迟'
  },

  // 等待类型表格筛选列名与字段映射
  WAIT_TYPE : {
    'event_name': 'I/O 类型',
    'total_count': 'I/O 总数',
    'total_latency': 'I/O 总延迟',
    'avg_latency': '平均 I/O 延迟',
    'max_latency': '最大 I/O 延迟',
    'read_count': '读取 I/O 数',
    'read_latency': '读取 I/O 延迟',
    'reads': '读取 I/O 总量',
    'reads_avg': '平均 I/O 读取量',
    'write_count': '写入 I/O 数',
    'write_latency': '写入 I/O 延迟',
    'writes': '写入 I/O 总量',
    'writes_avg': '平均 I/O 写入量',
    'misc_latency': 'MISC I/O 延迟',
  },

  // 线程表格筛选列名与字段映射
  THREAD : {
    'thread_id': '连接 ID',
    'user': '线程名',
    'total_count': 'I/O 总数',
    'total_latency': 'I/O 总延迟',
    'avg_latency': '平均 I/O 延迟',
    'max_latency': '最大I/O延迟'
  },

  // 阻塞与等待表格筛选列名与字段映射

  BLOCKING_WAIT : {
    'blocking_trx_started': '阻塞开始时间',
    'locked_table': '锁定的表',
    'lock_index': '锁定索引',
    'lock_type': '锁定类型',
    'waiting_pid': '进程 ID',
    'waiting_trx_id': '事务 ID',
    'waiting_query': '当前 SQL',
    'wait_age': '等待时长',
    'waiting_trx_age': '等待事务执行时长',
    // 'next_backup_time': '查询响应时间指数',
    'waiting_trx_rows_modified': '等待事务修改行数',
    'waiting_trx_rows_locked': '等待事务行锁数量',
    'waiting_lock_mode': '等待锁类型',
    'blocking_pid': '阻塞进程 ID',
    'blocking_trx_id': '阻塞事务 ID',
    'blocking_query': '阻塞 SQL',
    'blocking_trx_age': '阻塞事务执行时长',
    'blocking_trx_rows_modified': '阻塞事务修改行数',
    'blocking_trx_rows_locked': '阻塞事务行锁数量',
    'blocking_lock_mode': '阻塞锁类型',
  },

  // 概览悬停表格字段
  SUMMARY_HOVER : {
    'cpu_use_rate' : 'CPU 使用率',
    'mysql_cpu_use_rate' : 'MySQL 所占 CPU 使用率',
    'io_use_rate' : 'IO 使用率',
    'avg_response' : '应管平均时耗',
    'connects' : '总连接数',
    'uncommit' : '长时间未提交事物数',
    'long_exec_sql' : '执行时间过长 SQL 数',
    'waiting_trx' : '等待行锁过长事物数',
    'slow_sql' : '慢 SQL 数',
    'io_file' : 'I/O 文件最大延迟',
    'io_waits' : 'I/O 等待最大延迟',
    'io_threads' : 'I/O 线程最大延迟',
    'locks' : '行锁数',
  },

  // 概览悬停表对应跳转链接
  SUMMARY_HOVER_LINK : {
    'CPU Utilization' : '/performance/overflow',
    'CPU Utilization (MySQL)' : '/performance/overflow',
    'I/O文件最大延迟' : '/performance/database-file-io',
    'I/O等待最大延迟' : '/performance/database-file-io',
    'I/O线程最大延迟' : '/performance/database-file-io',
    'IO Utilization (MySQL)' : '/performance/overflow',
    '应答平均时耗' : '/performance/overflow',
    '当前总连接数' : '/performance/session',
    '慢SQL数' : '/performance/slowlog',
    '执行时间过长SQL数' : '/performance/session',
    '等待行锁过长事务数' : '/performance/session',
    '长时间未提交事务数' : '/performance/session',
    '行锁数' : '/performance/lock-wait',
  },

  //定时任务状态
  SCHEDULE_PROGRESS: {
    '全部': '',
    '未开始' : 0,
    '执行中' : 10,
    '执行成功' : 1,
    '执行失败' : 2,
    '执行超时' : 3,
    '未投递' : 'null'
  },

  //巡检相关report_type
  REPORT_TYPE: {
    BASIC_HEALTH_CHECK_TXT:'basic', //实时诊断
    FULL_HEALTH_CHECK_TXT : 'deep', //实时诊断
    QUICK_HEALTH_CHECK_TXT : 'quick', //一键检查
    DAILY_CHECK_TXT : 'daily', //巡检日报
    ANOMALY_CLASSIFY_TXT :'anomaly', //异常分类
    FESTIVAL_CHECK_TXT : 'festival', //节前检查
  },

  // 定时任务状态图标
  SCHEDULE_PROGRESS_ICON : {
    1 : 1,
    2 : 2,
    3 : 3,
    10 : 0,
    0 : -1,
    'null' : -2
  },

  // 机器列表管理选项
  HOST_LIST : {
    'name' : '主机名',
    'connect_ip' : 'IP',
    'connect_status' : '状态',
    'type' : '类型',
    'free_memory' : '内存',
    'memory' : '内存大小（MB）',
    'free_disk' : '磁盘',
    'disk_size' : '磁盘大小（G）',
    'cpu_load' : 'CPU 负载',
    'running_services' : '运行服务数',
    'city' : '城市',
    'idc' : '数据中心',
    'priority' : '优先级',
    'weight' : '权重',
    'os_arch' : '系统架构',
    'os_version' : '系统版本',
    'agent_status' : 'Agent 状态',
    'os_kernel' : '系统内核',
    'devices' : '磁盘',
    'processor' : 'CPU 型号',
    'mounts' : '挂载分区',
    'interfaces' : '网卡',
    'max_running_services' : '最大运行服务数',
  },

  // 集群运行状态
  CLUSTER_STATUS : {
    'normal' : '正常运行',
    'warning' : '部分组件停止',
    'error' : '发生错误',
    'zero' : '未部署',
    'unreachable' : '不可达',
  },

  // 集群运行状态对应图标
  CLUSTER_STATUS_ICON : {
    'normal' : 'check',
    'warning' : 'minus',
    'error' : 'exclamation',
    'zero' : 'info',
    'unreachable' : 'minus',
  },

  // 服务类型
  SERVICE_TYPE : {
    '监控存活' : 'Y',
    '不监控存活' : 'N',
  },

  // 定时任务 周期时间正则
  CRONTAB_REG : {
    'minute' : /^(\*(\/([0-5]?\d))?|([0-5]?\d)-([0-5]?\d)(\/([0-5]?\d))?|([0-5]?\d)(,([0-5]?\d))*)$/,
    'hour' : /^(\*(\/([01]?\d|2[0-3]))?|([01]?\d|2[0-3])-([01]?\d|2[0-3])(\/([01]?\d|2[0-3]))?|([01]?\d|2[0-3])(,([01]?\d|2[0-3]))*)$/,
    'day' : /^(\*(\/(0?[1-9]|[12]\d|3[01]))?|(0?[1-9]|[12]\d|3[01])-(0?[1-9]|[12]\d|3[01])(\/(0?[1-9]|[12]\d|3[01]))?|(0?[1-9]|[12]\d|3[01])(,(0?[1-9]|[12]\d|3[01]))*)$/,
    'month' : /^(\*(\/([1-9]|1[012]))?|([1-9]|1[012]|[jJ]an|[fF]eb|[mM]ar|[aA]pr|[mM]ay|[jJ]un|[jJ]ul|[aA]ug|[sS]ep|[oO]ct|[nN]ov|[dD]ec)-([1-9]|1[012]|[jJ]an|[fF]eb|[mM]ar|[aA]pr|[mM]ay|[jJ]un|[jJ]ul|[aA]ug|[sS]ep|[oO]ct|[nN]ov|[dD]ec)(\/([1-9]|1[012]))?|([1-9]|1[012]|[jJ]an|[fF]eb|[mM]ar|[aA]pr|[mM]ay|[jJ]un|[jJ]ul|[aA]ug|[sS]ep|[oO]ct|[nN]ov|[dD]ec)(,([1-9]|1[012]|[jJ]an|[fF]eb|[mM]ar|[aA]pr|[mM]ay|[jJ]un|[jJ]ul|[aA]ug|[sS]ep|[oO]ct|[nN]ov|[dD]ec))*)$/,
    'week' : /^(\*(\/([0-6]))?|([0-6]|[mM]on|[tT]ue|[wW]ed|[tT]hu|[fF]ri|[sS]at|[sS]un)-([0-6]|[mM]on|[tT]ue|[wW]ed|[tT]hu|[fF]ri|[sS]at|[sS]un)(\/([0-6]))?|([0-6]|[mM]on|[tT]ue|[wW]ed|[tT]hu|[fF]ri|[sS]at|[sS]un)(,([0-6]|[mM]on|[tT]ue|[wW]ed|[tT]hu|[fF]ri|[sS]at|[sS]un))*)$/
  },

  //url 中携带参数
  // 新建服务中跳转新建包 from= 1
  // 新建套件中跳转新建服务 from= 2
  // 编辑套件中跳转新增服务 from= 3
  // 新增服务中跳转新建服务 from= 4

  // sql发布备份方式
  SQL_PUBLISH_BACKUP_TYPE : {
    '同步': 0,
    '异步': 1
  },

  // sql发布状态--筛选项
  SQL_PUBLISH_STATUS : {
    '全部' : '',
    '待发布' : 1,
    '已发布' : 2,
    '发布失败' : 3,
  },

  // sql发布状态数值对照表
  SQL_PUBLISH_MEANING_STATUS : {
    'UPLOAD_SUCCEED' : 1,
    'BACKUP_SUCCEED' : 2,
    'BACKUP_FAILED' : 3,
    'ROLLBACK_SUCCEED' : 4,
    'ROLLBACK_FAILED' : 5,
    'RETRY_SUCCEED' : 6,
    'RETRY_FAILED' : 7,
    'PUBLISH_FAILED' : 8,
    'PUBLISH_SUCCEED' : 9,
    'PUBLISHING' : 10,
    'RETRYING' : 11,
    'IN_ROLLBACK' : 12,
    'IN_BACKUP' : 13,
    'PUBLISH_SUCCEED_CLOSED' : 14,
    'PUBLISH_WITHOUT_CHECK': 15,
    'PUBLISH_FAILED_CLOSED': 16
  },

  // sql发布状态，对应跳转页面--表格内
  SQL_PUBLISH_STATUS_TABLE : {
    'UPLOAD_SUCCEED' : '上传成功',  // 跳转----检查
    'BACKUP_SUCCEED' : '备份成功',  // 跳转----备份
    'BACKUP_FAILED' : '备份失败',  // 跳转----备份
    'ROLLBACK_SUCCEED' : '回滚成功',  // 跳转----历史
    'ROLLBACK_FAILED' : '回滚失败',  // 跳转----历史
    'RETRY_SUCCEED' : '重试成功',  // 跳转----历史
    'RETRY_FAILED' : '重试失败',  // 跳转----历史
    'PUBLISH_FAILED' : '发布失败',  // 跳转----发布
    'PUBLISH_SUCCEED' : '发布成功',  // 跳转----历史
    'PUBLISHING' : '发布中',   // 跳转----发布
    'RETRYING' : '重试中',   // 跳转----发布
    'IN_ROLLBACK' : '回滚中',   // 跳转----发布
    'IN_BACKUP' : '备份中',   // 跳转----备份
    'PUBLISH_SUCCEED_CLOSED' : '发布关闭',  // 发布成功关闭, 跳转----历史
    'PUBLISH_WITHOUT_CHECK': '待发布',  // 跳转----发布
    'PUBLISH_FAILED_CLOSED': '发布关闭'   // 发布失败关闭, 跳转----历史
  },

  // sql发布状态--详情页
  SQL_PUBLISH_STATUS_DETAIL : {
    1 : ' 上传SQL',
    2 : ' 语法检查通过',
    3 : ' 检查表大小通过',
    4 : ' 备份成功',
    5 : ' 备份失败',
    6 : ' 回滚成功',
    7 : ' 回滚失败',
    8 : ' 重试成功',
    9 : ' 重试失败',
    10 : ' 发布成功',
    11 : ' 发布失败',
    12 : '关闭SQL发布'
  },

  // response status
  RESPONSE_STATUS : {
    'start' : 400,
    'end' : 1000
  },

  // 内存大小 对应 slider 数值
  MEMORY_SLIDER : {
    0 : '1G',
    25 : '2G',
    50 : '4G',
    75 : '8G',
    100 : '16G',
  },

  MEMORY_ORDER : ['T','G', 'M', 'KB'],

  // 部署 配置信息表单对应组件
  CONFIG_INPUT : {
    input : <Input />,
    inputNumber : <InputNumber />,
    switch :<Switch />,
    boolean : <Switch />,
    string : <Input />,
    integer :<Slider />,
    unsigned :<InputNumber />,
  },

  //默认的client_name
  DEFAULT_NAME : "test",
  // DEFAULT_NAME : "CMB",

  // 下线类型对应表
  RELATE_TYPE : {
    'cluster' : 0, //集群
    'set' : 1, //实例组
    'instance' : 2  //实例
  },

/*  //配置变更里面的组件
  CONFIG_CHANGE : {
    boolean : <Switch />,
    string : <Input />,
    integer :<Slider />,
  }*/

  // 集群状态参数
  CLUSTER_STATE : {
    // 'NORMAL' : 0,
    // 'ABNORMAL' : 1,
    // 'STOP' : -1
    // 状态修改
    "RUNNING" : 0, //运行中
    "UPDATING" : 1, //升级中
    "ADJUSTING" : 2, //规模调整中
    "ABNORMAL" : -2, // 异常
    "CREATING" : -1, // 创建中
    "DELETING" : -3, //删除中
    "全部" : '' // 全部
  },

  CLUSTER_STATE_OPTIONS : {
    "运行中" : 0, //运行中
    "升级中" : 1, //升级中
    "规模调整中" : 2, //规模调整中
    "异常" : -2, // 异常
    "创建中" : -1, // 创建中
    "删除中" : -3, //删除中
    "全部" : '' // 全部
  },

  // 节点运行状态
  NODE_STATE : {
    "RUNNING" : 0, //运行中
    "RESTARTING" : 1, //  启动中
    "ABNORMAL" : -2, // 异常
    "CREATING" : -1, // 创建中
    "DELETING" : -3, //删除中,
  },

  // 节点状态筛选
  NODE_OPTION_STATE : {
    "运行中" : 0, //运行中
    "启动中" : 1, // 重启中
    "异常" : -2, // 异常
    "创建中" : -1, // 创建中
    "删除中" : -3, //删除中
    "全部" : ''
  },

  // 监控告警 状态筛选
  MONITORING_OPTION_STATE : {
    "运行中" : 0, //运行中
    "完成" : 1, // 完成
    "失败" : 2, // 失败
    "超时" : 3, // 超时
    "全部" : ''
  },


  // 历史记录
  HISTORY_OPTIONS : {
    PEDDING : 0, //运行中
    FINISH : 1, // 完成
    FATAL : 2, // 失败
    TIMEOUT : 3, // 超时
  },
  // 集群列表中节点状态
  CLUSTER_NODE_STATE : {
    "NORMAL" : 0, //全部正常
    "PARTIAL_ABNORMAL" : -1, //部分异常
    "ABNORMAL" : -2 //全部异常
  },

  // 节点类型映射表
  NODE_TYPE : {
    "MASTER" : 1,
    "SLAVE" : 2,
    "GATEWAY" : 3,
    "GATEWAY_VIP" : 4,
    "FOLLOW" : 5,
    "REMOTE_SLAVE" : 6,
    "REMOTE_GATEWAY" : 7,
    "LOCAL_STANDBY_SLAVE" : 8,
    "LOCAL_STANDBY_GATEWAY" : 9,
    "ZABBIX_AGENT" : 10
  },

  // 主机管理状态数值对照表
  HOST_STATUS : {
    'HOST_NOT_INIT' : 0,
    'HOST_RUNNING' : 1,
    'HOST_AGENT_ABNORMAL' : 2,
    'HOST_SSH_ABNORMAL' : 3,
  },

  // 主机基本信息对照表
  HOST_BASIC : {
    'host_name' : '主机名',
    'connect_status' : '状态',
    'type' : '类型',
    'real_memory' : '内存',
    'city' : '城市',
    'user_name' : '用户名',
    'cpu_load' : '负载',
    'devices' : '磁盘',
    'processor' : 'CPU 型号',
    'os_version' : '系统版本',
    'agent_status' : 'Agent 状态',
    'created_at' : '创建时间',
    'updated_at' : '更新时间',
  },

  // 主机IP对照表
  HOST_IP : {
    'business_vip1' : "业务 VIP1",
    'business_vip2' : "业务 VIP2",
    'business_ip1' : "业务 IP1",
    'business_ip2' : "业务 IP2",
    'admin_vip1' : "管理 VIP1",
    'admin_vip2' : "管理 VIP2",
    'admin_ip1' : "管理 IP1",
    'admin_ip2' : "管理 IP2",
    'connect_ip' : "连接 IP",
    'repl_vip1' : "复制 VIP1",
    'repl_vip2' : "复制 VIP2",
    'repl_ip1' : "复制 IP1",
    'repl_ip2' : "复制 IP2",
    'business_vip' : "业务 VIP",
    'business_ip' : "业务 IP",
    'admin_ip' : "管理 IP",
  },

  // 主机凭证对照表
  HOST_CERTIFICATE : {
    'name':"主机名",
    'remember_token': "私钥",
    'root_name': "高权用户",
    'root_password': "高权用户密码",
    'user_name': "普通用户",
    'user_password': "普通用户密码",
  },

  // 主机系统对照表
  HOST_SYSTEM : {
    'os_arch':"系统结构",
    'os_version': "系统版本",
    'os_kernel': "系统内核",
  },

  // 主机硬件对照表
  HOST_DISK : {
    'devices':"磁盘",
    'mounts': "挂载分区",
    'real_memory': "内存",
    'swap': "虚拟内存",
    'processor': "CPU 型号",
    'cores' : 'CPU 物理核数',
    'vcpus' : 'CPU 逻辑核数',
    'interfaces': '网卡'
  },

  //服务状态对照表
  HOST_SERVICE_STATUS : {
    'STATUS_ALIVE':0,
    'STATUS_RESTARTING': 1,
    'STATUS_DEAD': -2,
    'STATUS_STOPPING': -5,
    'STATUS_BUILDING': -1,
    'STATUS_DESTROYING': -3,
    'STATUS_DELETED': -4,
  },

  //主机类型对照表
  HOST_TWO_TYPE : {
    0:'normal',
    1: 'rhcs',
  },

  HOST_TYPE : {
    'NORMAL' : 0,
    'RHCS' : 1,
    'RHCS_SLAVE' : 2
  },

  // 任务详情-运行详情，progress接口请求中标志
  PROGRESS_PENDING: 0,

  // 监控趋势-筛选项-集群/实例组/实例三选一
  SELECT_TYPES: {
    '集群': '0',
    '实例组': '1',
    '实例': '2',
  },

//  quorum 集群类型
  QUORUM_TYPES: {
    'CHUNKKEEPER' : 1,
    'ZOOKEEPER' : 2,
  },

  //主机管理服务列表所属字段
  HOST_BELONG_NAME : {
    0:"cluster",
    1:"instance-group",
    2:"instance"
  },

  //程序包管理列表的状态
  PACKAGE_STATUS:{
    NO_VERSION:1,
    NORMAL:2,
    ERROR:3
  },

  //前端名称校验规则
  NAME_COMPLEXITY : [
    {exp:/^[0-9A-Za-z\u4e00-\u9fa5][0-9A-Za-z\u4e00-\u9fa5_-]*$/,msg:'名称必须是以中文、字母、数字开头且包含下划线以及-'},
    {exp:[3,50],msg:'名称长度为3~50'}
  ],

  //前端部署路径校验规则
  PATH_COMPLEXITY : [
    {exp:/^[0-9A-Za-z][0-9A-Za-z_-]*$/,msg:'部署路径名必须是以字母、数字开头且包含下划线以及-'},
    {exp:[3,30],msg:'部署路径名长度为3~30'}
  ],
  //前端导入路径校验规则
  IMPORT_COMPLEXITY : [
    {exp:/^[0-9A-Za-z/][0-9A-Za-z/\\._-]*$/,msg:'导入路径名必须是以字母、数字、斜杠开头且包含下划线、点号、斜杠以及-'},
    {exp:[3,30],msg:'导入路径名长度为3~30'}
  ],

  // 消息列表及最新消息状态
  MESSAGE_STATUS : {
    'INFO': 0,
    'SUCCESS': 1,
    'WARNING': 2,
    'ERROR': -1
  },

  //前端包管理文件名校验规则
  FILENAME_COMPLEXITY : [
    {exp:/^[0-9A-Za-z\u4e00-\u9fa5_\\.-]*$/,msg:'文件名必须是中文、字母、数字、点号、下划线以及-'},
    {exp:[3,30],msg:'文件名长度为3~30'}
  ],

  //前端包管理版本校验规则
  VERSION_COMPLEXITY : [
    {exp:/^[0-9A-Za-z][0-9A-Za-z_\\.-]*$/,msg:'版本名称必须是以字母、数字开头且包含点号、下划线以及-'},
    {exp:[3,30],msg:'版本名称长度为3~30'}
  ],

  //前端包管理程序包名校验规则
  PACKAGE_COMPLEXITY : [
    {exp:/^[0-9A-Za-z][0-9A-Za-z_\-]*$/,msg:'程序包名称必须是以字母、数字开头且包含下划线以及-'},
    {exp:[3,30],msg:'程序包名称长度为3~30'}
  ],

  // 仲裁集群类型筛选项项
  QUORUM_CLUSTER_TYPE_OPTIONS : {
    "ChunkKeeper": 1,
    "ZooKeeper": 2,
    "全部": ""
  },

  DAILY_CHECK: 'daily',
  BASIC_HEALTH_CHECK_TXT: 'basic',
  FULL_HEALTH_CHECK_TXT: 'deep',
  QUICK_HEALTH_CHECK_TXT:'quick',
  ANOMALY_CLASSIFY:'anomaly',
  FESTIVAL_CHECK: 'festival',
  NODE_TYPE_CHECK: ['MySQL', 'Nodeguard', 'Gateway', 'ZooKeeper', 'ChunkKeeper', '汇总'],

  // 新增节点相互关联的 id
  NODE_ADD_RELATE: {
    120: 122,
    122: 120,
    124: 125,
    125: 124,
    127: 128,
    128: 127
  },

  CHUNKKEEPER_ID: 130,

  // 账号管理列表页操作
  ACCOUNT_MANAGEMENT: {
    '1': '新增账号',
    '2': '删除账号',
    '4': '授权',
    '5': '取消授权',
    '3': '修改密码'
  },


  // 账号管理列表页操作对应图标
  ACCOUNT_MANAGEMENT_ICON: {
    '1': 'plus',
    '2': 'minus',
    '4': 'lock',
    '5': 'unlock',
    '3': 'key'
  },

  // 账号管理列表页状态
  ACCOUNT_STATUS: {
    '成功': '1',
    '进行中': '2',
    '失败': '3'
  },

  // 账号管理列表页表格中的状态
  ACCOUNT_LIST_STATUS_BADGE: {
    'SUCCESS': 1,
    'PROCESSING': 2,
    'ERROR': 3
  },

  // 账号管理数据库表格中的状态
  ACCOUNT_DATABASE_STATUS_BADGE: {
    'WORKING': 0,
    'UPDATING': 1,
    'SCALING': 2,
    'ABNORMAL': -2,
    'CREATING': -1,
    'DELETING': -3
  }
}
