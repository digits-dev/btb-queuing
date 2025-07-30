import React from 'react';

const PricingTable = () => {
  const data = [
    { item: 'Apple Airport / Apple TV', diagnostic: '₱500', softwareFix: '₱600' },
    { item: 'Apple Watch', diagnostic: '₱500', softwareFix: '₱800' },
    { item: 'iPad', diagnostic: '₱1,000', softwareFix: '₱800' },
    { item: 'Apple Accessories / Beats / AirPods', diagnostic: '₱500', softwareFix: '-' },
    { item: 'iPhone', diagnostic: '₱1,300', softwareFix: '₱800' },
    { item: 'Portables (MB, MBP & MBA)', diagnostic: '₱2,500', softwareFix: '₱1,500' },
    { item: 'Desktops (Mac, iMac, Mac Pro, Mac Mini)', diagnostic: '₱3,000', softwareFix: '₱1,500' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border border-gray-300 text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-2 border-b text-left">Item</th>
            <th className="px-4 py-2 border-b text-left">Diagnostic & Labor Fee</th>
            <th className="px-4 py-2 border-b text-left">Software Fix</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b text-left">{row.item}</td>
              <td className="px-4 py-2 border-b text-left">{row.diagnostic}</td>
              <td className="px-4 py-2 border-b text-left">{row.softwareFix}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PricingTable;
