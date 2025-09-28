/**
 * Table.jsx
 * Reusable table component (very simple wrapper).
 */
export default function Table({ columns = [], data = [], actions }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key || col}>{col.header || col}</th>
            ))}
            {actions && <th></th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map(col => (
                <td key={(col.key || col) + '_' + (row.id || idx)}>
                  {col.render ? col.render(row) : row[col.key || col]}
                </td>
              ))}
              {actions && <td className="text-end">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


