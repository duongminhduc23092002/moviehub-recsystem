interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  emptyMessage?: string;
}

export default function DataTable({ 
  columns, 
  data, 
  loading, 
  onEdit, 
  onDelete,
  emptyMessage = "Không có dữ liệu"
}: DataTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-netflix-gray mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-netflix-light">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-3 text-sm font-semibold text-netflix-light">
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="text-right px-4 py-3 text-sm font-semibold text-netflix-light">
                Thao tác
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-4 text-sm text-white">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}