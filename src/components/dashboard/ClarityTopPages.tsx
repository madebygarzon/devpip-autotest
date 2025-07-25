"use client";

import { useClarity } from "@/hooks/useClarity";

export default function ClarityTopPages() {
  const { latest } = useClarity();
  if (!latest) return null;

  return (
    <div className="w-full ml-6 my-6">
      <h3 className="text-lg font-bold mb-2">Most viewed pages</h3>
      <table className="table-auto w-full border">
        <thead>
          <tr className="">
            <th className="px-4 py-2 text-left">URL</th>
            <th className="px-4 py-2 text-right">Sessions</th>
          </tr>
        </thead>
        <tbody>
          {latest.topPages.map((page, idx) => (
            <tr key={idx} className="border-t">
              <td className="px-4 py-2">{page.url}</td>
              <td className="px-4 py-2 text-right">{page.sessions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
