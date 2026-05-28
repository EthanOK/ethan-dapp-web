import React from "react";

export type DataTableRow = {
  id: string | number;
  key?: string;
  value?: string;
};

type DataTableProps = {
  data: DataTableRow[];
};

const DataTable = ({ data }: DataTableProps) => {
  if (data.length === 0) {
    return (
      <div>
        <p>Not Data</p>
      </div>
    );
  }

  const tableRows = data.map((item) => (
    <tr key={item.id}>
      <td>{item.id}</td>
      <td>{item.key ?? "N/A"}</td>
      <td>{item.value ?? "N/A"}</td>
    </tr>
  ));

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </table>
    </div>
  );
};

export default DataTable;
