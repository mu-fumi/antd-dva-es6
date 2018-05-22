/**
 * Created by wengyian on 2017/9/7.
 */

import React from 'react';
import styles from './DocTable.less'
import { classnames } from 'utils'

class DocTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    let props = this.props;
    let trs = [];
    let tds = [];
    props.columns.map((c, k) => {
      tds.push(c);

      if ((k + 1) % 3 === 0) {
        trs.push(tds);
        tds = [];
      }

      if (k + 1 === props.columns.length && (k + 1) % 3 !== 0) {
        c.single = true;
        trs.push([c]);
      }

    });
    let data = props.dataSource;
    let html = trs.map((tr, k) => {
      let td = tr.map((t, i) => {
        let title = <span className={styles["mgr-8"]}>{t.title}</span>;
        let val = (data && data[t.dataIndex] !== undefined) ?
          data[t.dataIndex] : '';
        val = typeof (t.render) === 'function' ? t.render(val) : val;
        let colspan = t.single ? '2' : '';
        return (
          <td className={styles["break-all"]} colSpan={colspan} key={i}>
            {title}
            {val}
          </td>
        );
      });
      return (<tr key={k}>{td}</tr>);
    });

    return (
      <table
        className={classnames(styles["table-responsive"], styles["table-bordered"])}
        cellPadding="0" cellSpacing="0"
      >
        <tbody>
        {html}
        </tbody>
      </table>
    );
  }
}

export default DocTable;
